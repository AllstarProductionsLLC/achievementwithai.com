import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'node:crypto';
import { topics, sources } from './config.mjs';

const parser = new XMLParser({ignoreAttributes:false,processEntities:true,htmlEntities:true,trimValues:true});
export const array = value => value == null ? [] : Array.isArray(value) ? value : [value];
export const plain = value => String(typeof value === 'object' ? value?.['#text'] ?? '' : value ?? '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>Number(n)<=0x10ffff?String.fromCodePoint(Number(n)):'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' ').trim();
export function safeUrl(value) {
  try {const u = new URL(value); if(u.protocol!=='https:' || u.username || u.password) return null; for(const key of [...u.searchParams.keys()]) if(key.startsWith('utm_') || ['fbclid','gclid'].includes(key)) u.searchParams.delete(key);u.hash='';return u.href;}catch{return null;}
}
export function classify(title,summary='') {
  const text = `${title} ${summary}`.toLowerCase();
  let best='frontier',score=0;
  for(const topic of topics) {
    const value=topic.keywords.reduce((n,k)=>n+(text.includes(k)?(title.toLowerCase().includes(k)?3:1):0),0);
    if(value>score){best=topic.id;score=value;}
  }
  return best;
}
export function parseFeed(xml,source,now=new Date()) {
  if(/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Unsupported XML declarations');
  const document=parser.parse(xml);
  const items=array(document.rss?.channel?.item ?? document.feed?.entry);
  if(!document.rss && !document.feed)throw new Error('Not an RSS or Atom feed');
  return items.flatMap(item=>{
    const title=plain(item.title).slice(0,200);
    const link=typeof item.link==='string'?item.link:array(item.link).find(x=>!x['@_rel']||x['@_rel']==='alternate')?.['@_href'];
    const url=safeUrl(link);
    const date=new Date(item.pubDate ?? item.published ?? item.updated ?? item['dc:date']);
    if(!title || !url || !Number.isFinite(date.getTime()) || date.getTime()>now.getTime()+3600000)return [];
    const description=plain(item.description ?? item.summary ?? item['content:encoded']);
    if(!source.aiOnly && !/\bai\b|artificial intelligence|robot|machine learning|deep learning|neural|generative|agent/i.test(`${title} ${description}`))return [];
    // Keep publisher excerpts short. The original article always remains the source of record.
    const words=description.split(/\s+/).filter(Boolean);
    const summary=words.slice(0,22).join(' ')+(words.length>22?'…':'');
    return [{id:createHash('sha256').update(url.replace(/\/$/,'')).digest('hex').slice(0,14),title,url,summary,publishedAt:date.toISOString(),source:source.name,sourceId:source.id,topic:classify(title,description.slice(0,700)),kind:'news',attribution:'Publisher feed excerpt'}];
  }).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
export async function fetchFeed(source) {
  const response=await fetch(source.url,{signal:AbortSignal.timeout(18000),headers:{'User-Agent':'AchievementWithAI/1.0 (+https://achievementwithai.com/about/)','Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml'}});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const reader=response.body.getReader();let size=0;const chunks=[];
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>4000000){await reader.cancel();throw new Error('Feed exceeds size limit');}chunks.push(value);}
  return parseFeed(Buffer.concat(chunks).toString('utf8'),source);
}
export async function refreshFeed(previous={items:[]}) {
  const results=await Promise.allSettled(sources.map(fetchFeed));
  const now=new Date().toISOString();
  let successCount=0;
  const health=[];const all=[];
  results.forEach((result,i)=>{
    const source=sources[i];
    if(result.status==='fulfilled'&&result.value.length){successCount++;all.push(...result.value.slice(0,24));health.push({id:source.id,name:source.name,status:'ok',checkedAt:now,itemCount:result.value.length});}
    else {all.push(...(previous.items||[]).filter(x=>x.sourceId===source.id));health.push({id:source.id,name:source.name,status:'unavailable',checkedAt:now,itemCount:0});}
  });
  const unique=new Map();for(const item of all.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)))if(!unique.has(item.url))unique.set(item.url,item);
  return {version:'1.0',updatedAt:successCount?now:previous.updatedAt??null,checkedAt:now,status:successCount===sources.length?'current':successCount?'partial':'cached',sources:health,items:[...unique.values()].slice(0,120)};
}
