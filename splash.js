(() => {
  'use strict';
  const root = document.documentElement;
  const splash = document.querySelector('.kamuela-splash');
  if (!splash || !root.classList.contains('splash-pending')) return;
  const gsap = window.gsap;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactMotion = matchMedia('(max-width: 540px)').matches;
  const skip = splash.querySelector('.splash-skip');
  const clusters = [...splash.querySelectorAll('.splash-cluster')];
  const heroNav = document.querySelector('.masthead');
  const heroLogo = document.querySelector('.hero-masthead-brand');
  const heroCopy = document.querySelector('.hero-copy');
  const heroGallery = document.querySelector('.film-gallery');
  const heroColumns = [...document.querySelectorAll('.film-column')];
  const heroFlowers = [...document.querySelectorAll('.hero-floral')];
  const heroBotanicals = [...document.querySelectorAll('.hero-botanical')];
  const heroLight = document.querySelector('.hero-sunlight');
  const allHeroLayers = [heroNav, heroLogo, heroCopy, heroGallery, heroLight, ...heroFlowers, ...heroBotanicals].filter(Boolean);
  let timeline;
  let finished = false;

  function finishSplash() {
    if (finished) return;
    finished = true;
    timeline?.kill();
    gsap?.set(allHeroLayers, { clearProps: 'opacity,visibility,transform' });
    gsap?.set(heroColumns, { clearProps: 'opacity,visibility,transform' });
    root.classList.remove('splash-pending');
    splash.dataset.state = 'complete';
    splash.remove();
  }
  skip?.addEventListener('click', finishSplash);
  addEventListener('pagehide', () => timeline?.kill(), { once: true });
  if (!gsap) { setTimeout(finishSplash, reduceMotion ? 350 : 1100); return; }

  gsap.set(allHeroLayers, { opacity: 0 });
  gsap.set(heroColumns, { opacity: 0, y: compactMotion ? 14 : 22 });
  gsap.set(heroCopy, { y: 18 });
  gsap.set(splash, { clipPath: 'circle(150% at 50% 50%)' });
  gsap.set('.splash-logo-complete', { opacity: 0, scale: .985, filter: 'blur(4px)' });

  function buildTimeline() {
    if (finished) return;
    splash.dataset.state = 'playing';
    if (reduceMotion) {
      timeline = gsap.timeline({ onComplete: finishSplash })
        .to('.splash-logo-complete', { opacity: 1, duration: .22 })
        .to(allHeroLayers, { opacity: 1, y: 0, duration: .3 }, '+=.12')
        .to(splash, { opacity: 0, duration: .3, ease: 'power1.out' }, '-=.16');
      return;
    }
    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onComplete: finishSplash });
    timeline.addLabel('breath', 0).addLabel('sunlight', .38).addLabel('signature', .52).addLabel('handoff', 1.62)
      .to('.splash-cluster-center .splash-sway', { rotation: -1.2, x: -4, duration: .42, ease: 'sine.inOut' }, 'breath')
      .to('.splash-cluster-upper-left .splash-sway', { rotation: -1.5, x: -5, duration: .48, ease: 'sine.inOut' }, 'breath+=.06')
      .to('.splash-cluster-upper-right .splash-sway', { rotation: 1.4, x: 5, duration: .5, ease: 'sine.inOut' }, 'breath+=.11')
      .to('.splash-cluster-center', { y: '-14vh', scale: 1.035, duration: .7, ease: 'power2.inOut' }, 'breath+=.2')
      .to('.splash-cluster-mid-left', { x: '-9vw', rotation: '-=3', duration: .72 }, 'breath+=.25')
      .to('.splash-cluster-mid-right', { x: '9vw', rotation: '+=3', duration: .72 }, 'breath+=.3')
      .to('.splash-rays', { opacity: .4, x: 8, duration: .52, ease: 'sine.inOut' }, 'sunlight')
      .to('.splash-signature', { opacity: 1, duration: .1 }, 'signature')
      .to('.splash-logo-complete', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .34, ease: 'power3.out' }, 'signature')
      .to('.splash-gold-dots i', { opacity: .9, scale: 1.35, duration: .18, stagger: .07, ease: 'power2.out' }, 'signature+=.08')
      .to('.splash-gold-dots i', { opacity: 0, y: -8, duration: .28, stagger: .05, ease: 'power2.in' }, 'signature+=.48')
      .set(splash, { clipPath: 'inset(0)' }, 'handoff')
      .to('.splash-signature', { opacity: 0, duration: .14 }, 'handoff')
      .to('.splash-handoff-light', { opacity: .9, scaleX: 7.5, duration: .28, ease: 'power2.in' }, 'handoff')
      .set(allHeroLayers, { opacity: 1 }, 'handoff+=.2')
      .set(heroColumns, { opacity: 1, y: 0 }, 'handoff+=.2')
      .set(heroCopy, { y: 0 }, 'handoff+=.2')
      .to(splash, { clipPath: 'inset(0 50% 0 50%)', duration: .42, ease: 'power3.inOut' }, 'handoff+=.2');
    window.kamuelaSplashTimeline = timeline;
    timeline.play(0);
  }
  const essentialImages = [...splash.querySelectorAll('.splash-cluster img,.splash-logo-complete')];
  const decodeAssets = Promise.all(essentialImages.map(image => {
    if (image.complete && image.naturalWidth) return image.decode?.().catch(() => {}) ?? Promise.resolve();
    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));
  Promise.race([decodeAssets, new Promise(resolve => setTimeout(resolve, 1300))]).then(buildTimeline);
})();
