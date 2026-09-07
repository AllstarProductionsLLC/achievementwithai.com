import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {XMLParser} from 'fast-xml-parser';
const root=path.resolve('dist');
async function walk(dir){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())files.push(...await walk(p));else files.push(p);}return files;}
const files=await walk(root);const htmlFiles=files.filter(f=>f.endsWith('.html'));const errors=[];
for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  for(const required of ['<title>','name="description"','rel="canonical"','<main id="main">','<html lang="en">'])if(!html.includes(required))errors.push(`${file}: missing ${required}`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);if(new Set(ids).size!==ids.length)errors.push(`${file}: duplicate ID`);
  for(const match of html.matchAll(/<(?:a|img|script|link)\b[^>]*?\b(?:href|src)="(\/[^"]*)"/g)){
    const target=match[1].split(/[?#]/)[0];if(target.startsWith('/api/'))continue;
    let resolved=path.resolve(root,'.'+target);
    try{if((await stat(resolved)).isDirectory())resolved=path.join(resolved,'index.html');await stat(resolved);}catch{errors.push(`${path.relative(root,file)}: missing ${target}`);}
  }
  for(const match of html.matchAll(/<script[^>]*type="application\/(?:ld\+)?json"[^>]*>([\s\S]*?)<\/script>/g))try{JSON.parse(match[1]);}catch{errors.push(`${file}: invalid JSON script`);}
}
const parser=new XMLParser();assert.ok(parser.parse(await readFile('dist/feed.xml','utf8')).rss.channel.item.length>0);
const news=JSON.parse(await readFile('dist/data/news.json','utf8'));const feed=JSON.parse(await readFile('dist/feed.json','utf8'));assert.equal(news.items.length,feed.items.length);
assert.equal(new Set(news.items.map(x=>x.id)).size,news.items.length);
const spec=JSON.parse(await readFile('dist/openapi.json','utf8'));assert.ok(spec.paths['/data/news.json']);
const homepage=await readFile('dist/index.html','utf8');assert.ok(homepage.includes('possibility-loop.webp'));assert.ok(!homepage.includes('test-key'));assert.ok(!homepage.includes('BUTTONDOWN_API_KEY'));
if(errors.length)throw new Error(errors.slice(0,30).join('\n'));
console.log(`Verified ${htmlFiles.length} HTML pages, local links and assets, embedded JSON, RSS, JSON Feed, and OpenAPI. ${news.items.length} unique discoveries.`);
