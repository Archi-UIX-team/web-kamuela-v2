(()=>{'use strict';
const scenes=[{"src":"https://images.archipelagohotels.com/kamuelavillas/Images/v1/BrandPages/Homepage/RKU.jpg?d=1600x1000","name":"Ubud","description":"Royal Kamuela · A sanctuary in the treetops"},{"src":"https://images.archipelagohotels.com/kamuelavillas/Images/v1/BrandPages/Homepage/bintan.jpg?d=1600x1000","name":"Bintan","description":"Lagoi Bay · Your private island rhythm"},{"src":"https://images.archipelagohotels.com/kamuelavillas/Images/v1/SeahavenbyKamuela/Room/SeahavenVillas_ByKamuela_Livingroom_Levithia_1.jpg?d=1600x1000","name":"Canggu","description":"Seahaven by Kamuela · Space to simply be"}];
const root=document.querySelector('.living-hero'),stage=root.querySelector('.hero-sticky'),gallery=root.querySelector('.living-gallery'),panels=[...gallery.querySelectorAll('.scene-panel')],leaf=root.querySelector('.botanical-sculpture');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
let active=0,locked=false,frame=0,px=0,py=0,pointerStart=null,geometry=null;
const live=root.querySelector('.scene-live'),track=root.querySelector('.scene-track span');
function select(n){if(locked)return;active=(n+scenes.length)%scenes.length;panels.forEach(p=>{const yes=Number(p.dataset.scene)===active;p.classList.toggle('featured',yes);p.setAttribute('aria-pressed',String(yes))});live.textContent='0'+(active+1)+' / '+scenes[active].name.toUpperCase();track.style.transform='translateX('+(active*100)+'%)';root.querySelector('.hero-atmosphere').style.filter='hue-rotate('+(active*8)+'deg)'}
panels.forEach(p=>{p.addEventListener('pointerenter',()=>{if(fine.matches)select(+p.dataset.scene)});p.addEventListener('focus',()=>select(+p.dataset.scene));p.addEventListener('click',()=>select(+p.dataset.scene))});
root.querySelector('.scene-prev').addEventListener('click',()=>select(active-1));root.querySelector('.scene-next').addEventListener('click',()=>select(active+1));
gallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(active+(e.key==='ArrowRight'?1:-1))}});
gallery.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
gallery.addEventListener('pointerup',e=>{if(!pointerStart)return;const dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;pointerStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))select(active+(dx<0?1:-1))});gallery.addEventListener('pointercancel',()=>pointerStart=null);
stage.addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches)return;const r=stage.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;schedule()});stage.addEventListener('pointerleave',()=>{px=py=0;schedule()});
const clamp=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*t;
const faded=[root.querySelector('.gallery-intro'),root.querySelector('.scene-toolbar'),root.querySelector('.hero-editorial'),root.querySelector('.luxury-stats')];
function clear(){gallery.style.cssText='';panels.forEach(p=>p.style.cssText='');faded.forEach(el=>el.style.cssText='');geometry=null;locked=false;}
function update(){frame=0;if(reduced.matches||innerWidth<=800){clear();leaf.style.transform='';return}
const distance=Math.max(1,root.offsetHeight-stage.offsetHeight),t=clamp(-root.getBoundingClientRect().top/distance),u=t*t*(3-2*t);
if(t>0){if(!geometry){const sr=stage.getBoundingClientRect(),gr=gallery.getBoundingClientRect();geometry={gallery:{x:gr.left-sr.left,y:gr.top-sr.top,w:gr.width,h:gr.height},panels:panels.map(p=>{const r=p.getBoundingClientRect();return{x:r.left-gr.left,y:r.top-gr.top,w:r.width,h:r.height}})}}
locked=true;
const g=geometry.gallery;Object.assign(gallery.style,{position:'absolute',left:mix(g.x,0,u)+'px',top:mix(g.y,0,u)+'px',width:mix(g.w,stage.clientWidth,u)+'px',height:mix(g.h,stage.clientHeight,u)+'px',margin:'0'});
panels.forEach((p,i)=>{const r=geometry.panels[i],yes=+p.dataset.scene===active;Object.assign(p.style,{position:'absolute',flex:'none',transition:'none',left:mix(r.x,yes?0:(i===0?-stage.clientWidth:stage.clientWidth),u)+'px',top:mix(r.y,0,u)+'px',width:mix(r.w,yes?stage.clientWidth:r.w,u)+'px',height:mix(r.h,stage.clientHeight,u)+'px',transform:'none',borderRadius:(yes?100*(1-u):0)+'px 3px 3px 3px',opacity:yes?'1':String(1-u),pointerEvents:u>.2?'none':''});});
faded.forEach(el=>{el.style.opacity=String(1-clamp(t*3));el.style.transform='translateY('+(-t*60)+'px)';el.style.pointerEvents=t>.2?'none':''});
}else if(geometry)clear();
leaf.style.transform='perspective(900px) translate3d('+(px*17-u*80)+'px,'+(py*12+u*160)+'px,0) rotateZ('+(24-u*35)+'deg) rotateY('+(-25+px*14)+'deg) rotateX('+(-py*12)+'deg) scale('+(1-u*.35)+')';
root.querySelector('.cinema-caption').style.opacity=String(clamp((t-.5)*4));}
function schedule(){if(!frame)frame=requestAnimationFrame(update)}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{clear();schedule()});reduced.addEventListener('change',schedule);schedule();
const counter=root.querySelector('[data-count]');new IntersectionObserver((entries,o)=>{if(!entries.some(e=>e.isIntersecting))return;o.disconnect();if(reduced.matches)return;const start=performance.now(),target=+counter.dataset.count;function tick(now){const t=clamp((now-start)/1400);counter.textContent=String(Math.round(target*(1-Math.pow(1-t,3)))).padStart(2,'0');if(t<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)},{threshold:.5}).observe(counter);
})();