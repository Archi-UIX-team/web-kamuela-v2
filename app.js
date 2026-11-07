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
const secretGardenPortal = document.querySelector('.secret-garden-portal');
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
}
function scheduleScroll() { if (!frame) frame = requestAnimationFrame(updateScroll); }
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll);
motion.addEventListener('change', scheduleScroll);
updateScroll();

function initSecretGarden() {
  const stage = hero?.querySelector('.hero-sticky');
  const leftCurtain = secretGardenPortal?.querySelector('.secret-garden-curtain-left');
  const rightCurtain = secretGardenPortal?.querySelector('.secret-garden-curtain-right');
  const reveal = secretGardenPortal?.querySelector('.secret-garden-reveal');
  const light = secretGardenPortal?.querySelector('.secret-garden-opening-light');
  const copy = stage?.querySelector('.hero-copy');
  const gallery = stage?.querySelector('.film-gallery');
  if (!stage || !leftCurtain || !rightCurtain || !reveal || !light) return;

  villasSection.classList.remove('portal-controlled', 'portal-pin');
  if (motion.matches || !window.gsap || !window.ScrollTrigger) {
    villasSection.classList.add('portal-complete');
    villasSection.querySelectorAll('.smart-reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.set([leftCurtain, rightCurtain], { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, force3D: true });
  gsap.set(reveal, { opacity: 0, scale: .98 });
  gsap.set(light, { opacity: .48, scale: .82, xPercent: -50 });

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.1,
      invalidateOnRefresh: true,
      onUpdate: self => {
        const complete = self.progress >= .9;
        villasSection.classList.toggle('portal-complete', complete);
        if (self.progress >= .82) villasSection.querySelectorAll('.smart-reveal').forEach(el => el.classList.add('is-visible'));
      }
    }
  });

  // 0–15%: the entrance wakes without losing its resting silhouette.
  timeline
    .to(light, { opacity: .78, scale: 1.04, duration: .15 }, 0)
    .to(leftCurtain, { xPercent: -1.8, yPercent: 1.2, rotation: -.7, duration: .15 }, 0)
    .to(rightCurtain, { xPercent: 1.8, yPercent: 1.2, rotation: .7, duration: .15 }, 0)
    // 15–45%: both complete artworks hinge from their outer attachment points.
    .to(leftCurtain, { xPercent: -29, yPercent: 6, rotation: -4, scale: 1.06, duration: .30 }, .15)
    .to(rightCurtain, { xPercent: 29, yPercent: 6, rotation: 4, scale: 1.06, duration: .30 }, .15)
    .to(reveal, { opacity: .56, clipPath: 'inset(28% 22% 0 22% round 48% 48% 0 0)', scale: 1.015, duration: .30 }, .15)
    // 45–75%: the emerald garden expands while the viewer advances through it.
    .to(leftCurtain, { xPercent: -67, yPercent: 12, rotation: -5, scale: 1.085, duration: .30 }, .45)
    .to(rightCurtain, { xPercent: 67, yPercent: 12, rotation: 5, scale: 1.085, duration: .30 }, .45)
    .to(reveal, { opacity: .98, clipPath: 'inset(0% 2% 0 2% round 8% 8% 0 0)', scale: 1.06, duration: .30 }, .45)
    .to(light, { opacity: .5, scale: 1.35, duration: .30 }, .45)
    .to(copy, { opacity: 0, y: -28, duration: .28 }, .47)
    .to(gallery, { opacity: 0, scale: 1.035, duration: .25 }, .50)
    // 75–90%: foreground foliage clears the frame with a final parallax drift.
    .to(leftCurtain, { xPercent: -126, yPercent: 17, rotation: -5.5, scale: 1.1, opacity: .7, duration: .15 }, .75)
    .to(rightCurtain, { xPercent: 126, yPercent: 17, rotation: 5.5, scale: 1.1, opacity: .7, duration: .15 }, .75)
    .to(reveal, { clipPath: 'inset(0% 0% 0 0%)', scale: 1.1, duration: .15 }, .75)
    // 90–100%: the curtains clear completely and the Villas scene takes over.
    .to([leftCurtain, rightCurtain], { opacity: 0, duration: .10 }, .90)
    .to(light, { opacity: 0, duration: .10 }, .90);
}

initSecretGarden();

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

