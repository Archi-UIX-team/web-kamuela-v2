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
  const heroScene = document.querySelector('.hero-sticky');
  const allHeroLayers = [heroNav, heroLogo, heroCopy, heroGallery, heroLight, ...heroFlowers, ...heroBotanicals].filter(Boolean);
  let timeline;
  let finished = false;

  function finishSplash() {
    if (finished) return;
    finished = true;
    timeline?.kill();
    gsap?.set(allHeroLayers, { clearProps: 'opacity,visibility,transform' });
    gsap?.set(heroColumns, { clearProps: 'opacity,visibility,transform' });
    gsap?.set(heroScene, { clearProps: 'filter,transform' });
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
  gsap.set(heroScene, { filter: 'blur(10px)', scale: 1.012 });
  gsap.set(splash, { opacity: 1, filter: 'blur(0px)', scale: 1 });
  gsap.set('.splash-logo-complete', { opacity: 0, scale: .985, filter: 'blur(4px)' });
  gsap.set('.splash-handoff-light', { xPercent: -145, rotation: -9, opacity: 0 });

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
    timeline.addLabel('breath', .16).addLabel('sunlight', .35).addLabel('signature', .5).addLabel('handoff', 1.38)
      .to('.splash-cluster-center .splash-sway', { rotation: -1.2, x: -4, duration: .42, ease: 'sine.inOut' }, 'breath')
      .to('.splash-cluster-upper-left .splash-sway', { rotation: -1.5, x: -5, duration: .48, ease: 'sine.inOut' }, 'breath+=.06')
      .to('.splash-cluster-upper-right .splash-sway', { rotation: 1.4, x: 5, duration: .5, ease: 'sine.inOut' }, 'breath+=.11')
      .to('.splash-cluster-center', { y: '-18vh', scale: .88, opacity: .42, duration: .82, ease: 'power2.inOut' }, 'breath+=.04')
      .to('.splash-cluster-mid-left', { x: '-13vw', y: '2vh', scale: .82, opacity: .2, rotation: '-=3', duration: .8 }, 'breath+=.06')
      .to('.splash-cluster-lower-right', { x: '8vw', y: '5vh', scale: .8, opacity: .48, duration: .8 }, 'breath+=.1')
      .to('.splash-cluster-upper-left', { x: '-7vw', y: '-4vh', scale: .88, opacity: .56, duration: .78 }, 'breath+=.28')
      .to('.splash-cluster-mid-right', { x: '13vw', y: '2vh', scale: .82, opacity: .2, rotation: '+=3', duration: .78 }, 'breath+=.31')
      .to('.splash-cluster-lower-left', { x: '-8vw', y: '5vh', scale: .8, opacity: .48, duration: .76 }, 'breath+=.34')
      .to('.splash-cluster-upper-right', { x: '7vw', y: '-4vh', scale: .88, opacity: .56, duration: .7 }, 'breath+=.5')
      .to('.splash-cluster-back-left', { x: '-5vw', scale: .86, opacity: .12, duration: .68 }, 'breath+=.53')
      .to('.splash-cluster-back-right', { x: '5vw', scale: .86, opacity: .12, duration: .68 }, 'breath+=.56')
      .to('.splash-rays', { opacity: .36, x: 10, duration: 1.02, ease: 'sine.inOut' }, 'sunlight-=.12')
      .to('.splash-signature', { opacity: 1, duration: .1 }, 'signature')
      .to('.splash-logo-complete', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .34, ease: 'power3.out' }, 'signature')
      .to('.splash-gold-dots i', { opacity: .9, scale: 1.35, duration: .18, stagger: .07, ease: 'power2.out' }, 'signature+=.08')
      .to('.splash-gold-dots i', { opacity: 0, y: -8, duration: .28, stagger: .05, ease: 'power2.in' }, 'signature+=.48')
      .to('.splash-signature', { opacity: .02, duration: .42, ease: 'sine.inOut' }, 'handoff-=.18')
      .to('.splash-handoff-light', { opacity: .48, xPercent: 105, duration: .38, ease: 'power2.inOut' }, 'handoff-=.06')
      .set(allHeroLayers, { opacity: 1 }, 'handoff+=.16')
      .set(heroColumns, { opacity: 1, y: 0 }, 'handoff+=.16')
      .set(heroCopy, { y: 0 }, 'handoff+=.16')
      .to(heroScene, { filter: 'blur(0px)', scale: 1, duration: .5, ease: 'power2.out' }, 'handoff+=.16')
      .to('.splash-handoff-light', { opacity: 0, xPercent: 285, duration: .42, ease: 'power2.inOut' }, 'handoff+=.26')
      .to(splash, { opacity: 0, filter: 'blur(11px)', scale: 1.006, duration: .5, ease: 'power2.inOut' }, 'handoff+=.2');
    window.kamuelaSplashTimeline = timeline;
    timeline.play(0);
  }
  const essentialImages = [...splash.querySelectorAll('.splash-cluster img,.splash-logo-complete')];
  const loadAssets = Promise.all(essentialImages.map(image => {
    if (image.complete && image.naturalWidth) return Promise.resolve();
    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }));
  loadAssets.then(() => requestAnimationFrame(buildTimeline));
})();
