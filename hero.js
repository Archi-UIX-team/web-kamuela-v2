(()=>{'use strict';
const root=document.querySelector('.glass-hero'),gallery=root.querySelector('.glass-carousel'),cards=[...root.querySelectorAll('[data-scene]')],dots=[...root.querySelectorAll('[data-dot]')];
const names=['UBUD','BINTAN','CANGGU'];let active=0,start=null,suppressClick=false;
function select(n){active=(n+cards.length)%cards.length;cards.forEach((card,i)=>{const offset=(i-active+cards.length)%cards.length;card.classList.toggle('active',offset===0);card.classList.toggle('right',offset===1);card.classList.toggle('left',offset===2);card.setAttribute('aria-pressed',String(offset===0));});dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===active)));root.querySelector('.scene-live').textContent='0'+(active+1)+' / '+names[active];}
cards.forEach((c,i)=>c.addEventListener('click',()=>{if(!suppressClick)select(i)}));dots.forEach((d,i)=>d.addEventListener('click',()=>select(i)));
root.querySelector('.scene-prev').addEventListener('click',()=>select(active-1));root.querySelector('.scene-next').addEventListener('click',()=>select(active+1));
gallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(active+(e.key==='ArrowRight'?1:-1));cards[active].focus({preventScroll:true})}});
gallery.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,id:e.pointerId};suppressClick=false});
gallery.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){suppressClick=true;select(active+(dx<0?1:-1));setTimeout(()=>suppressClick=false,0)}});
gallery.addEventListener('pointercancel',()=>start=null);gallery.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')start=null});
select(0);
})();