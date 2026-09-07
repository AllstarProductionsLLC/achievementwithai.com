import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { refreshFeed } from '../src/feed.mjs';
await mkdir('content',{recursive:true});
let previous={items:[]};try{previous=JSON.parse(await readFile('content/news.json','utf8'));}catch{}
const news=await refreshFeed(previous);
if(!news.items.length)throw new Error('No usable stories. The previous edition was preserved.');
await writeFile('content/news.json.tmp',JSON.stringify(news,null,2)+'\n');
await rename('content/news.json.tmp','content/news.json');
let archive=[];try{archive=JSON.parse(await readFile('content/archive.json','utf8'));}catch{}
archive=[...new Map([...archive,...news.items].map(item=>[item.id,item])).values()];
await writeFile('content/archive.json.tmp',JSON.stringify(archive,null,2)+'\n');
await rename('content/archive.json.tmp','content/archive.json');
console.log(`Edition ${news.updatedAt}: ${news.items.length} stories, ${news.sources.filter(s=>s.status==='ok').length}/${news.sources.length} feeds available.`);
for(const s of news.sources)console.log(`${s.name}: ${s.status}`);
if(news.status==='cached')process.exitCode=1;
