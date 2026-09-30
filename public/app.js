const cards=[...document.querySelectorAll('.post-card')];
const buttons=[...document.querySelectorAll('[data-filter]')];
const search=document.querySelector('#search');
let selected='All';
function filterPosts(){
 const query=(search?.value||'').trim().toLowerCase();let count=0;
 for(const card of cards){const show=(selected==='All'||card.dataset.category===selected)&&card.dataset.search.includes(query);card.hidden=!show;if(show)count++;}
 for(const b of buttons){b.classList.toggle('active',b.dataset.filter===selected);b.setAttribute('aria-pressed',String(b.dataset.filter===selected));}
 if(document.querySelector('#results'))document.querySelector('#results').textContent=`${count} ${count===1?'find':'finds'}${selected==='All'?' in the community collection':' in '+selected}${query?' matching “'+search.value.trim()+'”':''}`;
 if(document.querySelector('#empty-state'))document.querySelector('#empty-state').hidden=count!==0;
}
function setCategory(category){selected=buttons.some(b=>b.dataset.filter===category)?category:'All';filterPosts();}
for(const b of buttons)b.addEventListener('click',()=>{setCategory(b.dataset.filter);const url=new URL(location);selected==='All'?url.searchParams.delete('category'):url.searchParams.set('category',selected);history.replaceState(null,'',url);});
search?.addEventListener('input',filterPosts);
document.querySelector('#reset-filters')?.addEventListener('click',()=>{search.value='';setCategory('All');const url=new URL(location);url.searchParams.delete('category');history.replaceState(null,'',url);search.focus();});
if(cards.length){const c=new URLSearchParams(location.search).get('category');if(c)setCategory(c);}
addEventListener('popstate',()=>setCategory(new URLSearchParams(location.search).get('category')));
const canvas=document.querySelector('#network');
if(canvas){
 const ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const button=document.querySelector('#motion-toggle');
 let paused=reduced.matches,frame=null,w=0,h=0,angle=0;
 const points=Array.from({length:78},(_,i)=>{const y=1-2*(i+.5)/78;const r=Math.sqrt(1-y*y);const a=i*2.39996;return{x:Math.cos(a)*r,y,z:Math.sin(a)*r};});
 function render(){ctx.clearRect(0,0,w,h);const radius=Math.min(w*.36,h*.37);const projected=points.map(p=>{const x=p.x*Math.cos(angle)-p.z*Math.sin(angle);const z=p.x*Math.sin(angle)+p.z*Math.cos(angle);return{x:w/2+x*radius,y:h/2+p.y*radius,z};});
 for(let i=0;i<projected.length;i++){const p=projected[i];for(let j=i+1;j<projected.length;j++){const q=projected[j];const d=Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y,points[i].z-points[j].z);if(d<.52){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(198,244,123,${.07+(p.z+q.z+2)*.05})`;ctx.lineWidth=.6;ctx.stroke();}}ctx.beginPath();ctx.arc(p.x,p.y,1.3+(p.z+1)*.7,0,Math.PI*2);ctx.fillStyle=`rgba(211,255,151,${.25+(p.z+1)*.32})`;ctx.fill();}
 }
 function tick(){angle+=.0018;render();frame=requestAnimationFrame(tick);}
 function sync(){cancelAnimationFrame(frame);render();button.textContent=paused?'▷':'Ⅱ';button.setAttribute('aria-label',paused?'Play network animation':'Pause network animation');if(!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
 new ResizeObserver(()=>{const box=canvas.getBoundingClientRect();w=box.width;h=box.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);render();}).observe(canvas);
 button.addEventListener('click',()=>{paused=!paused;sync();});
 reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
 document.addEventListener('visibilitychange',sync);sync();
}
