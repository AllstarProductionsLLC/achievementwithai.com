import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import path from 'node:path';
import {readPosts,validatePost,safeURL,escape} from '../scripts/content.mjs';
import '../scripts/build.mjs';
const root=process.cwd();
const posts=await readPosts(root);
const sample=()=>structuredClone(posts[0]);
test('all posts validate and have unique identities',()=>{
 assert.ok(posts.length > 0);assert.equal(new Set(posts.map(p=>p.slug)).size,posts.length);
});
test('unsafe links and HTML are rejected or escaped',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,test','http://example.com','https://user:pass@example.com'])assert.equal(safeURL(url),false);
 assert.equal(escape('<script>"&'), '&lt;script&gt;&quot;&amp;');
 const p=sample();p.links=[{label:'Bad link',url:'javascript:alert(1)'}];assert.throws(()=>validatePost(p),/HTTPS/);
});
test('agent posts require a responsible operator and valid content metadata',()=>{
 const p=sample();p.author={name:'Agent',kind:'agent'};assert.throws(()=>validatePost(p),/operator/);
 p.author.operator='ResponsibleHuman';assert.doesNotThrow(()=>validatePost(p));
 p.date='2026-02-30';assert.throws(()=>validatePost(p),/date/);
 p.date='2026-09-29';p.slug='../escape';assert.throws(()=>validatePost(p),/slug/);
});
test('media rejects remote files, injected IDs, and inaccessible video',()=>{
 const p=sample();p.media=[{type:'image',src:'https://example.com/a.png',alt:'A',credit:'Me'}];assert.throws(()=>validatePost(p),/local/);
 p.media=[{type:'youtube',id:'x" onload="',alt:'A',credit:'Me'}];assert.throws(()=>validatePost(p),/YouTube/);
 p.media=[{type:'video',src:'/media/test.mp4',alt:'A',credit:'Me'}];assert.throws(()=>validatePost(p),/transcript/);
 p.media[0].transcript='A useful transcript';assert.doesNotThrow(()=>validatePost(p));
});
async function walk(dir){const files=[];for(const d of await readdir(dir,{withFileTypes:true})){const f=path.join(dir,d.name);files.push(...d.isDirectory()?await walk(f):[f]);}return files;}
test('generated pages have resolvable local links, assets, and canonical metadata',async()=>{
 const files=(await walk(path.join(root,'dist'))).filter(f=>f.endsWith('.html'));
 assert.equal(files.length,posts.length+5);
 for(const file of files){
  const html=await readFile(file,'utf8');assert.match(html,/<h1[ >]/);assert.match(html,/<link rel="canonical" href="https:\/\/achievementwithai.com\//);assert.match(html,/name="description"/);
  for(const m of html.matchAll(/(?:href|src)="(\/[^"\s]*)"/g)){
   const pathname=new URL(m[1],'https://achievementwithai.com').pathname;
   await access(path.join(root,'dist',pathname,pathname.endsWith('/')?'index.html':''));
  }
 }
 const feed=JSON.parse(await readFile('dist/feed.json','utf8'));assert.equal(feed.items.length,posts.length);
 for(const item of feed.items)assert.ok(item.content_text&&item._community.author.name);
});
