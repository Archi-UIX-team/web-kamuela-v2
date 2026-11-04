document.documentElement.classList.add('js');

const header = document.querySelector('.masthead');
const hero = document.querySelector('.hero');
const progress = document.querySelector('.scroll-progress');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;

function updateScroll() {
  frame = 0;
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 50);
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (total > 0 ? y / total * 100 : 0) + '%';
  const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
  const p = motion.matches ? 0 : Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / travel));
  const stage = hero.querySelector('.hero-sticky');
  stage.style.setProperty('--hero-scale', (1 + p * .11).toFixed(3));
  stage.style.setProperty('--side-y', (-95 * p).toFixed(1) + 'px');
  stage.style.setProperty('--side-opacity', (1 - p * .9).toFixed(3));
  stage.style.setProperty('--center-y', (-80 * p).toFixed(1) + 'px');
  stage.style.setProperty('--center-opacity', Math.max(0, 1 - p * 1.6).toFixed(3));
  stage.style.setProperty('--arch-y', (-8 * p).toFixed(2) + 'vh');
  stage.style.setProperty('--arch-scale', (1 - p * .22).toFixed(3));
}
function scheduleScroll() { if (!frame) frame = requestAnimationFrame(updateScroll); }
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll);
motion.addEventListener('change', scheduleScroll);
updateScroll();

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
function closeMenu() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
}
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

const dialog = document.querySelector('#booking');
const form = document.querySelector('#booking-form');
const officialUrls = {
  ubud: 'https://www.kamuelavillas.com/en/villa/view/3/royal-kamuela-villas-suites-at-monkey-forest-ubud-adult-only',
  bintan: 'https://www.kamuelavillas.com/en/villa/view/7/kamuela-villas-lagoi-bay-bintan',
  canggu: 'https://www.kamuelavillas.com/en/villa/view/8/seahaven-by-kamuela'
};
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  dialog.showModal();
}));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
form.addEventListener('submit', e => {
  e.preventDefault();
  const url = officialUrls[form.elements.villa.value];
  if (url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.append(link);
    link.click();
    link.remove();
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
