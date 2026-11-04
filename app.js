document.documentElement.classList.add('js');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const header=document.querySelector('header'),progress=document.querySelector('.progress'),leaf=document.querySelector('.leaf-a');
let ticking=false;
function scrollFrame(){const y=scrollY;header.classList.toggle('scrolled',y>40);const length=document.documentElement.scrollHeight-innerHeight;progress.style.width=(length>0?y/length*100:0)+'%';if(leaf&&!reduced&&y<innerHeight*1.5)leaf.style.transform='translateY('+y*.17+'px) rotate('+(-24+y*.012)+'deg)';ticking=false}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(scrollFrame);ticking=true}},{passive:true});scrollFrame();
const menu=document.querySelector('.menu'),nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.textContent=open?'Close −':'Menu ＋'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu ＋'}));
const dialog=document.querySelector('#booking');document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});

document.querySelector('#year').textContent=new Date().getFullYear();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu +'}});
