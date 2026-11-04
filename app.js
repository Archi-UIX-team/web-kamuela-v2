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
  // The scene stays pinned while its architectural opening approaches the viewer.
  // The next section is physically below the sticky hero and cannot enter until
  // the complete zoom and final dark dissolve have run their course.
  const ease = t => t * t * (3 - 2 * t);
  const zoom = ease(Math.max(0, Math.min(1, p / .72)));
  const fade = ease(Math.max(0, Math.min(1, (p - .08) / .42)));
  const veil = ease(Math.max(0, Math.min(1, (p - .78) / .22)));
  const scale = 1 + 2.55 * zoom;
  stage.style.setProperty('--portal-scale', scale.toFixed(4));
  stage.style.setProperty('--hero-fade', (1 - fade).toFixed(3));
  stage.style.setProperty('--side-fade', (1 - fade).toFixed(3));
  stage.style.setProperty('--copy-y', (-70 * fade).toFixed(1) + 'px');
  stage.style.setProperty('--side-rise', (-40 * fade).toFixed(1) + 'px');
  stage.style.setProperty('--veil-opacity', veil.toFixed(3));
}
function scheduleScroll() { if (!frame) frame = requestAnimationFrame(updateScroll); }
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll);
motion.addEventListener('change', scheduleScroll);
updateScroll();

const revealObserver = 'IntersectionObserver' in window && !motion.matches
  ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -7% 0px' })
  : null;
document.querySelectorAll('.smart-reveal').forEach((element, index) => {
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add('is-visible');
});
motion.addEventListener('change', () => {
  if (motion.matches) document.querySelectorAll('.smart-reveal').forEach(el => el.classList.add('is-visible'));
});

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
