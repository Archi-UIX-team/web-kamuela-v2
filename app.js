document.documentElement.classList.add('js');

// Add one official Kamuela leaf engraving to every content section. The hero
// already owns its dedicated botanical composition, so it is left unchanged.
document.querySelectorAll('main > section:not(.hero)').forEach((section, index) => {
  const leaf = document.createElement('span');
  leaf.className = `kamuela-section-leaf kamuela-section-leaf-${index % 2 ? 'left' : 'right'}`;
  leaf.setAttribute('aria-hidden', 'true');
  section.prepend(leaf);
});

const header = document.querySelector('.masthead');
const hero = document.querySelector('.hero');
const offersSection = document.querySelector('.offers');
const portal = document.querySelector('.living-golden-vein-portal');
const villasSection = document.querySelector('.villas');
const progress = document.querySelector('.scroll-progress');

// Detach the Offers leaf into a zero-height bridge shared by Villas and Offers.
// This keeps one continuous asset above both section backgrounds without clipping.
const offersLeaf = offersSection?.querySelector(':scope > .kamuela-section-leaf');
if (offersSection && offersLeaf) {
  const botanicalBridge = document.createElement('div');
  botanicalBridge.className = 'offers-botanical-bridge';
  botanicalBridge.setAttribute('aria-hidden', 'true');
  offersSection.before(botanicalBridge);
  botanicalBridge.append(offersLeaf);
}
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;

if (offersSection && 'IntersectionObserver' in window) {
  const offersHeaderObserver = new IntersectionObserver(entries => {
    header.classList.toggle('over-offers', entries[0].isIntersecting);
  }, { rootMargin: '-8% 0px -84% 0px', threshold: 0 });
  offersHeaderObserver.observe(offersSection);
}

function updateScroll() {
  frame = 0;
  const y = window.scrollY;
  header.classList.toggle('scrolled', y >= Math.max(72, window.innerHeight * .12));
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (total > 0 ? y / total * 100 : 0) + '%';
  const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
  const p = motion.matches ? 0 : Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / travel));
  const stage = hero.querySelector('.hero-sticky');
  const ease = t => t * t * (3 - 2 * t);
  const clamp = value => Math.max(0, Math.min(1, value));
  // Stage A occupies 75% of the pinned scroll. Only the cartouche transforms.
  const zoom = ease(clamp((p - .18) / .57));
  // Four reversible phases drive only the botanical gateway. The hero itself
  // remains fixed while official leaf-derived veins awaken, unfold and pass.
  const awakening = ease(clamp((p - .10) / .16));
  const unfolding = ease(clamp((p - .22) / .34));
  const passing = ease(clamp((p - .52) / .27));
  const exiting = ease(clamp((p - .77) / .16));
  const responsiveSpread = Math.min(window.innerWidth * .34, 560);
  stage.style.setProperty('--vein-awake', awakening.toFixed(4));
  stage.style.setProperty('--vein-glow', Math.max(awakening * (1 - exiting), 0).toFixed(4));
  stage.style.setProperty('--vein-spread', ((unfolding * .34 + passing * .66) * responsiveSpread).toFixed(2));
  stage.style.setProperty('--vein-drop', (passing * 78 + exiting * 120).toFixed(2));
  stage.style.setProperty('--vein-pass-y', (passing * 28 + exiting * 90).toFixed(2));
  stage.style.setProperty('--vein-scale', (1 + unfolding * .46 + passing * 1.18).toFixed(4));
  stage.style.setProperty('--vein-exit', exiting.toFixed(4));
  stage.style.setProperty('--vein-opacity', Math.max(0, 1 - exiting * 1.16).toFixed(4));
  stage.style.setProperty('--copy-opacity', (1 - ease(clamp((p - .04) / .16))).toFixed(3));
  stage.style.setProperty('--gallery-opacity', (1 - ease(clamp((p - .28) / .38))).toFixed(3));
  // Stage B occupies the remaining 25%. The real Villas section pins over the
  // emerald opening, then resumes in normal flow at precisely the same top edge.
  const heading = ease(clamp((p - .75) / .11));
  const cards = ease(clamp((p - .85) / .15));
  villasSection.style.setProperty('--villa-heading-reveal', heading.toFixed(3));
  villasSection.style.setProperty('--villa-cards-reveal', cards.toFixed(3));
  const controlled = !motion.matches && p < 1;
  villasSection.classList.toggle('portal-controlled', controlled);
  villasSection.classList.toggle('portal-pin', controlled && p >= .75);
  villasSection.classList.toggle('portal-complete', !controlled);
  if (!controlled) villasSection.querySelectorAll('.smart-reveal').forEach(el => el.classList.add('is-visible'));
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
  if (button.dataset.villa) form.elements.villa.value = button.dataset.villa;
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

