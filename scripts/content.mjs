import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
export const categories = ['Projects', 'Field notes', 'Research', 'Memes', 'Agents'];
export const themes = ['lime', 'purple', 'blue', 'peach', 'pink', 'mint'];
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
export function validatePost(p) {
  const fail = message => { throw new Error(`${p.slug || 'Post'}: ${message}`); };
  for (const [key, max] of Object.entries({slug:80,title:110,summary:240,cover:90,date:10})) {
    if(typeof p[key] !== 'string' || !p[key].trim() || p[key].length > max) fail(`invalid ${key}`);
  }
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) fail('slug must be lowercase words joined by hyphens');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || !Number.isFinite(Date.parse(p.date)) || new Date(p.date).toISOString().slice(0,10)!==p.date) fail('invalid date');
  if(!categories.includes(p.category) || !themes.includes(p.theme)) fail('unknown category or theme');
  if(!p.author || typeof p.author.name!=='string' || !p.author.name.trim() || !['human','ai-assisted','agent'].includes(p.author.kind)) fail('author name and kind required');
  if(p.author.kind !== 'human' && (typeof p.author.operator !== 'string' || !/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(p.author.operator))) fail('AI contributions require a human GitHub operator');
  if(typeof p.starter !== 'boolean' || typeof p.featured !== 'boolean') fail('starter and featured must be booleans');
  if(!Array.isArray(p.tags) || p.tags.length<1 || p.tags.length>6 || p.tags.some(t=>typeof t!=='string'||!t.trim()||t.length>30)) fail('provide 1 to 6 short tags');
  if(!Array.isArray(p.body)||p.body.length<1||p.body.some(b=>typeof b.heading!=='string'||!b.heading.trim()||typeof b.text!=='string'||!b.text.trim())) fail('body needs headings and text');
  if(!Array.isArray(p.links)||p.links.some(l=>typeof l.label!=='string'||!l.label.trim()||!safeURL(l.url))) fail('links require labels and HTTPS URLs');
  if(!Array.isArray(p.media)||p.media.length>6) fail('media must be an array with at most 6 items');
  for(const m of p.media) {
    if(!['image','video','youtube'].includes(m.type)||typeof m.alt!=='string'||!m.alt.trim()||typeof m.credit!=='string'||!m.credit.trim()) fail('media needs type, alt text, and credit');
    if(m.type==='youtube') { if(!/^[\w-]{11}$/.test(m.id||'')) fail('invalid YouTube ID'); }
    else if(typeof m.src!=='string'||!/^\/media\/[a-zA-Z0-9_/-]+\.(png|jpg|jpeg|webp|gif|avif|mp4|webm)$/.test(m.src)||m.src.includes('..')) fail('media must use a local /media/ path');
    if(m.type==='image' && !/\.(png|jpg|jpeg|webp|gif|avif)$/.test(m.src)) fail('image extension mismatch');
    if(m.type==='video' && !/\.(mp4|webm)$/.test(m.src)) fail('video extension mismatch');
    if(m.type==='video' && (typeof m.transcript!=='string'||!m.transcript.trim())) fail('video transcript required');
  }
  return p;
}
export async function readPosts(root) {
  const files=(await readdir(path.join(root,'content/posts'))).filter(f=>f.endsWith('.json')).sort();
  const posts=await Promise.all(files.map(async f=>{
    const p=validatePost(JSON.parse(await readFile(path.join(root,'content/posts',f),'utf8')));
    if(f!==`${p.slug}.json`) throw new Error(`Filename must match slug: ${f}`);
    for(const m of p.media.filter(m=>m.type!=='youtube')) {
      const s=await stat(path.join(root,'public',m.src));
      if(!s.isFile()||s.size>15*1024*1024) throw new Error(`${f}: missing or oversized media`);
    }
    return p;
  }));
  if(new Set(posts.map(p=>p.slug)).size!==posts.length) throw new Error('Duplicate slug');
  if(posts.filter(p=>p.featured).length>1) throw new Error('Only one post can be featured');
  return posts.sort((a,b)=>Number(b.featured)-Number(a.featured)||b.date.localeCompare(a.date)||a.title.localeCompare(b.title));
}
