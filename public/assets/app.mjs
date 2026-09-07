import {newsCard,projectCard} from './cards.mjs';
const dataElement=document.querySelector('#site-data');
const data=dataElement?JSON.parse(dataElement.textContent):{news:[],projects:[],topics:[]};
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
let toastTimer;
function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('visible'),3300);}
const storage={get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}};
let saved=storage.get('awai-saved',[]);if(!Array.isArray(saved))saved=[];
const savedIds=()=>new Set(saved.map(x=>x.id));
function updateSaves(){const ids=savedIds();$$('[data-save]').forEach(button=>{const active=ids.has(button.dataset.save);button.setAttribute('aria-pressed',String(active));if(!button.classList.contains('save-button'))button.textContent=active?'Saved to your collection':'Save discovery';});}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-save]');if(!button)return;
  const id=button.dataset.save;const existing=saved.find(x=>x.id===id);const item=data.news.find(x=>x.id===id)||existing;
  if(!item)return;
  const next=existing?saved.filter(x=>x.id!==id):[item,...saved].slice(0,200);
  if(!storage.set('awai-saved',next)){toast('Your browser could not save this. Check its storage settings.');return;}
  saved=next;updateSaves();toast(existing?'Removed from your collection.':'Saved. Your next good idea is waiting.');
  if(document.querySelector('[data-board="saved"]'))renderBoard();
});
updateSaves();
const menu=$('.menu-toggle');menu?.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!expanded));menu.setAttribute('aria-label',expanded?'Open navigation':'Close navigation');$('#mobile-nav').hidden=expanded;});
$('#mobile-nav')?.addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');$('#mobile-nav').hidden=true;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.click();menu.focus();}});

const board=$('[data-board]');let count=6;const params=new URLSearchParams(location.search);let topic=params.get('topic')||board?.dataset.initialTopic||'';if(!data.topics.some(t=>t.id===topic))topic='';let query=params.get('q')||'';let sort=params.get('sort')||'newest';
function renderBoard(){
  if(!board)return;const type=board.dataset.board;const base=type==='projects'?data.projects:type==='saved'?saved:data.news;
  let items=base.filter(item=>(!topic||item.topic===topic)&&`${item.title} ${item.summary} ${item.name||''} ${item.source}`.toLowerCase().includes(query.toLowerCase().trim()));
  if(sort==='az')items.sort((a,b)=>a.title.localeCompare(b.title));else if(type!=='projects')items.sort((a,b)=>sort==='oldest'?a.publishedAt.localeCompare(b.publishedAt):b.publishedAt.localeCompare(a.publishedAt));else if(sort==='oldest')items.reverse();
  $('[data-results]',board).innerHTML=items.slice(0,count).map(type==='projects'?projectCard:newsCard).join('');
  $('[data-results-count]',board).textContent=`${items.length} ${type==='projects'?(items.length===1?'project':'projects'):(items.length===1?'discovery':'discoveries')}${query?' found':''}`;
  const empty=$('[data-empty]',board);empty.hidden=items.length>0;
  if(!items.length&&type==='saved'){ $('h3',empty).textContent=saved.length?'No saved discoveries match.':'A little room for future inspiration.';$('p',empty).textContent=saved.length?'Try another topic or a shorter search.':'Save a discovery with its bookmark button. Your collection stays in this browser.';$('[data-clear]',empty).hidden=!saved.length;}
  const more=$('[data-more]',board);more.hidden=items.length<=count;more.textContent=`Show ${Math.min(6,items.length-count)} more ${type==='projects'?'projects':'discoveries'}`;
  $$('[data-filter]',board).forEach(b=>{b.classList.toggle('active',b.dataset.filter===topic);b.setAttribute('aria-pressed',String(b.dataset.filter===topic));});
  updateSaves();
}
function updateURL(){const p=new URLSearchParams();if(topic)p.set('topic',topic);if(query)p.set('q',query);if(sort!=='newest')p.set('sort',sort);const hash=location.pathname==='/'?'#discoveries':'';history.replaceState(null,'',location.pathname+(p.size?'?'+p:'')+hash);}
if(board){$('[data-search]',board).value=query;$('[data-sort]',board).value=sort;renderBoard();$('[data-search]',board).addEventListener('input',e=>{query=e.target.value;count=6;renderBoard();updateURL();});$('[data-sort]',board).addEventListener('change',e=>{sort=e.target.value;count=6;renderBoard();updateURL();});$$('[data-filter]',board).forEach(button=>button.addEventListener('click',()=>{topic=button.dataset.filter;count=6;renderBoard();updateURL();}));$('[data-more]',board).addEventListener('click',()=>{const previous=count;count+=6;renderBoard();const first=$('[data-results]',board).children[previous]?.querySelector('h3 a');first?.focus({preventScroll:true});});$('[data-clear]',board).addEventListener('click',()=>{topic='';query='';count=6;$('[data-search]',board).value='';renderBoard();updateURL();});}

$$('[data-surprise]').forEach(b=>b.addEventListener('click',()=>{const items=data.projects.length?data.projects:data.news;if(!items.length){toast('The expedition is restocking. Try the topics page.');return;}const random=crypto.getRandomValues(new Uint32Array(1))[0]%items.length;location.href=`/${data.projects.length?'projects':'stories'}/${items[random].id}/`;}));
const media=matchMedia('(prefers-reduced-motion: reduce)');let motionOff=storage.get('awai-motion-off',media.matches);const motion=$('[data-motion]');
function setMotion(){document.documentElement.dataset.motion=motionOff?'off':'on';if(motion){motion.setAttribute('aria-pressed',String(motionOff));motion.setAttribute('aria-label',motionOff?'Enable interactive motion':'Disable interactive motion');motion.textContent=motionOff?'Motion off':'Motion on ↗';}}
setMotion();motion?.addEventListener('click',()=>{motionOff=!motionOff;storage.set('awai-motion-off',motionOff);setMotion();});media.addEventListener('change',e=>{if(e.matches){motionOff=true;setMotion();}});
const tilt=$('[data-tilt]');tilt?.addEventListener('pointermove',e=>{if(motionOff||media.matches||e.pointerType==='touch')return;const r=tilt.getBoundingClientRect();tilt.style.setProperty('--tilt-x',`${((e.clientX-r.left)/r.width-.5)*10}deg`);tilt.style.setProperty('--tilt-y',`${((e.clientY-r.top)/r.height-.5)*-8}deg`);});tilt?.addEventListener('pointerleave',()=>{tilt.style.setProperty('--tilt-x','0deg');tilt.style.setProperty('--tilt-y','0deg');});
function chart(days=30){const root=$('[data-chart]');if(!root)return;const items=data.news.filter(x=>!days||Date.now()-Date.parse(x.publishedAt)<=days*86400000);const counts=data.topics.map(t=>({...t,count:items.filter(x=>x.topic===t.id).length}));const max=Math.max(...counts.map(x=>x.count),1);counts.forEach((t,i)=>{const row=root.children[i];$('.chart-bar',row).style.width=`${t.count/max*100}%`;$('b',row).textContent=t.count;row.setAttribute('aria-label',`${t.name}: ${t.count} collected discoveries. Explore this topic.`);});$('[data-chart-total]').textContent=`${items.length} in this window`;}
chart();$$('[data-range]').forEach(b=>b.addEventListener('click',()=>{$$('[data-range]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});chart(Number(b.dataset.range));}));
const updated=$('[data-updated]');if(updated&&Date.now()-Date.parse(updated.dataset.updated)>48*3600000)updated.textContent+=' · next edition pending';
const answer=$('#answer-dialog');$$('[data-answer]').forEach(b=>b.addEventListener('click',()=>answer.showModal()));answer?.addEventListener('click',e=>{if(e.target===answer){const r=answer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)answer.close();}});
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied. Take a little curiosity with you.');}catch{toast('Copy is unavailable here. Select and copy the address from your browser.');}}
$$('[data-copy]').forEach(b=>b.addEventListener('click',()=>copy(b.dataset.copy)));$$('[data-share]').forEach(b=>b.addEventListener('click',()=>copy(location.href)));
const submit=$('[data-submit-story]');submit?.addEventListener('submit',event=>{event.preventDefault();const values=new FormData(submit);const status=$('[data-form-status]',submit);let url;try{url=new URL(values.get('url'));if(url.protocol!=='https:'||url.username||url.password)throw new Error();}catch{status.textContent='Please use a complete public HTTPS link.';return;}const body=`## Discovery\n${values.get('description')}\n\n## Original source\n${url.href}\n\n## Topic\n${values.get('topic')}\n\n## Your connection to this project\nPlease disclose your connection before submitting.\n\nSubmitted from Achievement with AI. Please review before publishing.`;const target=new URL('https://github.com/AllstarProductionsLLC/achievementwithai.com/issues/new');target.searchParams.set('title',`[Discovery] ${values.get('title')}`);target.searchParams.set('body',body);status.textContent='Opening your draft on GitHub. Review it there before submitting.';location.assign(target.href);});
const subscription=$('[data-subscribe]');subscription?.addEventListener('submit',async event=>{event.preventDefault();const values=new FormData(subscription);const status=$('[data-form-status]',subscription);const button=$('button[type=submit]',subscription);button.disabled=true;button.textContent='Sending confirmation…';status.textContent='';try{const response=await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:values.get('email'),consent:values.get('consent')==='on',website:values.get('website')})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Signup is unavailable right now. Please try again later.');status.textContent=result.message;subscription.reset();}catch(error){status.textContent=error.message;}finally{button.disabled=false;button.textContent='Send my confirmation';}});
