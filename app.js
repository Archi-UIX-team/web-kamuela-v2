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
  gsap.set(reveal, { opacity: 0 });
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

  // 0–30%: the curtains begin opening while all hero content stays readable.
  timeline
    .to(light, { opacity: .76, scale: 1.03, duration: .30 }, 0)
    .to(leftCurtain, { xPercent: -14, yPercent: 2.5, rotation: -2, scale: 1.025, duration: .30 }, 0)
    .to(rightCurtain, { xPercent: 14, yPercent: 2.5, rotation: 2, scale: 1.025, duration: .30 }, 0)
    // 30–60%: widen the negative space and begin a boundary-free crossfade.
    .to(leftCurtain, { xPercent: -48, yPercent: 7, rotation: -4, scale: 1.055, duration: .30 }, .30)
    .to(rightCurtain, { xPercent: 48, yPercent: 7, rotation: 4, scale: 1.055, duration: .30 }, .30)
    .to(reveal, { opacity: .72, duration: .30 }, .30)
    .to(copy, { opacity: .38, y: -16, duration: .30 }, .30)
    .to(gallery, { opacity: .42, scale: 1.02, duration: .30 }, .30)
    // 60–85%: clear the frame and complete the atmospheric background blend.
    .to(leftCurtain, { xPercent: -112, yPercent: 13, rotation: -5, scale: 1.07, duration: .25 }, .60)
    .to(rightCurtain, { xPercent: 112, yPercent: 13, rotation: 5, scale: 1.07, duration: .25 }, .60)
    .to(reveal, { opacity: 1, duration: .25 }, .60)
    .to(copy, { opacity: 0, y: -28, duration: .22 }, .60)
    .to(gallery, { opacity: 0, scale: 1.035, duration: .22 }, .60)
    .to(light, { opacity: .28, scale: 1.25, duration: .25 }, .60)
    // 85–100%: finish the handoff, reveal Villas, and release the sticky scene.
    .to(leftCurtain, { xPercent: -138, opacity: 0, duration: .15 }, .85)
    .to(rightCurtain, { xPercent: 138, opacity: 0, duration: .15 }, .85)
    .to(light, { opacity: 0, duration: .15 }, .85);

  addEventListener('pagehide', () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
  }, { once: true });
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

