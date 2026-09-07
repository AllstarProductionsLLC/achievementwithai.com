import test from 'node:test';
import assert from 'node:assert/strict';
import {parseFeed,safeUrl,refreshFeed} from '../src/feed.mjs';
import {newsCard} from '../src/cards.mjs';
import {subscribeRequest} from '../api/subscribe.js';
const source={id:'example',name:'Example Research',aiOnly:true};
const now=new Date('2026-09-07T12:00:00Z');
test('RSS normalization removes tracking, rejects unsafe URLs and future timestamps, and classifies robotics',()=>{
  const xml=`<rss><channel><item><title>Robot learns to fold a towel</title><link>https://example.com/robot?utm_source=feed</link><pubDate>2026-09-06T10:00:00Z</pubDate><description><![CDATA[<p>Physical AI in a new robot.</p>]]></description></item><item><title>Unsafe</title><link>javascript:alert(1)</link><pubDate>2026-09-06</pubDate></item><item><title>Future</title><link>https://example.com/future</link><pubDate>2099-01-01</pubDate></item></channel></rss>`;
  const items=parseFeed(xml,source,now);assert.equal(items.length,1);assert.equal(items[0].url,'https://example.com/robot');assert.equal(items[0].topic,'robotics');assert.equal(items[0].summary,'Physical AI in a new robot.');assert.match(items[0].id,/^[a-f0-9]{14}$/);
});
test('Atom feeds retain canonical alternate links and publication dates',()=>{
  const xml='<feed><entry><title>Music model</title><link rel="self" href="https://example.com/api"/><link rel="alternate" href="https://example.com/music"/><published>2026-09-05T10:00:00Z</published><summary>A new instrument.</summary></entry></feed>';
  assert.equal(parseFeed(xml,source,now)[0].url,'https://example.com/music');
});
test('Entity declarations are rejected and renderers escape publisher markup',()=>{
  assert.throws(()=>parseFeed('<!DOCTYPE foo [<!ENTITY x "hi">]><rss/>',source,now));
  assert.equal(safeUrl('https://user:pass@example.com/'),null);
  const card=newsCard({id:'safe',topic:'science',source:'<img onerror=alert(1)>',title:'</h3><script>alert(1)</script>',summary:'A & B',publishedAt:'2026-09-06'});
  assert.ok(!card.includes('<script>'));assert.ok(card.includes('&lt;script&gt;'));assert.ok(card.includes('A &amp; B'));
});
test('A failed refresh preserves last known data and its original refresh time',async()=>{
  const original=globalThis.fetch;globalThis.fetch=async()=>{throw new Error('offline');};
  try{const previous={updatedAt:'2026-09-05T00:00:00Z',items:[{id:'1',sourceId:'openai',url:'https://example.com/a',publishedAt:'2026-09-04T00:00:00Z'}]};const result=await refreshFeed(previous);assert.equal(result.status,'cached');assert.equal(result.updatedAt,previous.updatedAt);assert.equal(result.items.length,1);assert.ok(result.sources.every(s=>s.status==='unavailable'));}finally{globalThis.fetch=original;}
});
const env={SITE_URL:'https://achievementwithai.com',BUTTONDOWN_API_KEY:'test-key',NEWSLETTER_ENABLED:'true',NODE_ENV:'production'};
const request={method:'POST',origin:env.SITE_URL,contentType:'application/json',body:{email:'curious@example.com',consent:true,website:''}};
test('Newsletter signup validates origin, consent, email, and configuration before contacting a provider',async()=>{
  const never=()=>{throw new Error('Must not contact provider');};
  assert.equal((await subscribeRequest({...request,origin:'https://attacker.example'},env,never)).status,403);
  assert.equal((await subscribeRequest({...request,body:{email:'curious@example.com'}},env,never)).status,400);
  assert.equal((await subscribeRequest({...request,body:{email:'bad',consent:true}},env,never)).status,400);
  assert.equal((await subscribeRequest(request,{},never)).status,503);
  assert.equal((await subscribeRequest({...request,method:'GET'},env,never)).status,405);
});
test('Newsletter subscriptions require confirmation and never return the provider key',async()=>{
  let payload;
  const mock=async(url,options)=>{assert.equal(url,'https://api.buttondown.com/v1/subscribers');payload=JSON.parse(options.body);return {ok:true,status:201};};
  const result=await subscribeRequest(request,env,mock);assert.equal(payload.type,'unactivated');assert.equal(result.status,200);assert.ok(!JSON.stringify(result).includes(env.BUTTONDOWN_API_KEY));
  const duplicate=await subscribeRequest(request,env,async()=>({ok:false,status:409}));assert.deepEqual(result,duplicate);
});
