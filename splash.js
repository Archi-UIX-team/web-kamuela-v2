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
  const writingPaths = [...splash.querySelectorAll('.splash-writing-strokes path')];
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
  writingPaths.forEach(path => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });
  gsap.set('.splash-writing-strokes', { opacity: 1 });
  gsap.set('.splash-villas-mask', { opacity: 0, scaleX: .02, transformOrigin: '50% 50%' });
  gsap.set('.splash-full-mask,.splash-logo-complete', { opacity: 0 });

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
    const d = compactMotion ? .72 : 1;
    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onComplete: finishSplash });
    timeline.addLabel('gardenBreath', 0).addLabel('foliageOpening', .45).addLabel('lightPass', 1.2)
      .addLabel('heroEmerges', 1.65).addLabel('logoWriting', 2.05).addLabel('galleryWake', 2.55)
      .addLabel('signatureHold', 4.25).addLabel('handoff', 4.7)
      .to('.splash-cluster-center .splash-sway', { rotation: -1.6, x: -5, duration: .62, ease: 'sine.inOut' }, 'gardenBreath')
      .to('.splash-cluster-center-low .splash-sway', { rotation: .9, x: 4, duration: .68, ease: 'sine.inOut' }, 'gardenBreath+=.08')
      .to('.splash-cluster-upper-left .splash-sway', { rotation: -2, x: -6, duration: .72, ease: 'sine.inOut' }, 'gardenBreath+=.15')
      .to('.splash-cluster-upper-right .splash-sway', { rotation: 1.7, x: 6, duration: .75, ease: 'sine.inOut' }, 'gardenBreath+=.24')
      .to('.splash-cluster-mid-left .splash-sway', { rotation: -1.2, duration: .76, ease: 'sine.inOut' }, 'gardenBreath+=.19')
      .to('.splash-cluster-mid-right .splash-sway', { rotation: 1.15, duration: .79, ease: 'sine.inOut' }, 'gardenBreath+=.31')
      .to('.splash-depth-near', { z: 160, scale: 1.045, duration: 1.3 }, 'foliageOpening')
      .to('.splash-depth-mid', { z: 72, scale: 1.02, duration: 1.38 }, 'foliageOpening+=.08')
      .to('.splash-depth-far', { z: 22, scale: 1.009, duration: 1.5 }, 'foliageOpening+=.14')
      .to('.splash-cluster-center', { x: `${-15*d}vw`, y: `${-48*d}vh`, rotation: '-=5', scale: 1.1, opacity: .04, duration: 1.2 }, 'foliageOpening')
      .to('.splash-cluster-upper-left', { x: `${-34*d}vw`, y: `${-23*d}vh`, rotation: '-=8', scale: 1.18, opacity: .18, duration: 1.25 }, 'foliageOpening+=.09')
      .to('.splash-cluster-upper-right', { x: `${34*d}vw`, y: `${-24*d}vh`, rotation: '+=7', scale: 1.17, opacity: .17, duration: 1.26 }, 'foliageOpening+=.18')
      .to('.splash-cluster-mid-left', { x: `${-30*d}vw`, y: `${-4*d}vh`, rotation: '-=6', opacity: .12, duration: 1.28 }, 'foliageOpening+=.25')
      .to('.splash-cluster-mid-right', { x: `${31*d}vw`, y: `${2*d}vh`, rotation: '+=6', opacity: .12, duration: 1.28 }, 'foliageOpening+=.37')
      .to('.splash-cluster-center-low', { x: `${5*d}vw`, y: `${31*d}vh`, scale: 1.07, opacity: .08, duration: 1.3 }, 'foliageOpening+=.12')
      .to('.splash-cluster-lower-left', { x: `${-25*d}vw`, y: `${23*d}vh`, rotation: '-=4', opacity: .28, duration: 1.2 }, 'foliageOpening+=.44')
      .to('.splash-cluster-lower-right', { x: `${26*d}vw`, y: `${24*d}vh`, rotation: '+=4', opacity: .28, duration: 1.2 }, 'foliageOpening+=.56')
      .to('.splash-rays', { opacity: .34, x: 10, scale: 1.025, duration: 1.25, ease: 'sine.inOut' }, 'lightPass')
      .to('.splash-atmosphere', { opacity: .42, duration: 1.15 }, 'heroEmerges')
      .to(heroBotanicals, { opacity: 1, duration: .8, stagger: .08 }, 'heroEmerges')
      .to(heroFlowers, { opacity: 1, duration: .82, stagger: .1 }, 'heroEmerges+=.12')
      .to(heroLight, { opacity: 1, duration: 1 }, 'heroEmerges')
      .to(splash, { backgroundColor: 'rgba(6,26,18,.38)', duration: 1.05 }, 'heroEmerges')
      .to('.splash-signature', { opacity: 1, y: 0, duration: .16, ease: 'power1.out' }, 'logoWriting')
      .to('.splash-pen-glint', { opacity: .8, duration: .12 }, 'logoWriting')
      .to(writingPaths[0], { strokeDashoffset: 0, duration: .42 }, 'logoWriting')
      .to(writingPaths[1], { strokeDashoffset: 0, duration: .36 }, 'logoWriting+=.32')
      .to(writingPaths[2], { strokeDashoffset: 0, duration: .45 }, 'logoWriting+=.56')
      .to(writingPaths.slice(3), { strokeDashoffset: 0, duration: .56, stagger: .19 }, 'logoWriting+=.73')
      .to('.splash-pen-glint', { left: '84%', top: '52%', duration: 1.65, ease: 'sine.inOut' }, 'logoWriting+=.2')
      .to('.splash-villas-mask', { opacity: 1, scaleX: 1, duration: .3, ease: 'power2.out' }, 'logoWriting+=1.78')
      .set('.splash-full-mask', { opacity: 1 }, 'logoWriting+=2.08')
      .set('.splash-logo-complete', { opacity: 1 }, 'logoWriting+=2.08')
      .set('.splash-signature svg', { opacity: 0 }, 'logoWriting+=2.08')
      .to('.splash-pen-glint', { opacity: 0, duration: .14 }, 'logoWriting+=2.04')
      .to(heroGallery, { opacity: 1, duration: .25 }, 'galleryWake')
      .to(heroColumns, { opacity: 1, y: 0, duration: .72, stagger: .12, ease: 'power3.out' }, 'galleryWake')
      .to(heroCopy, { opacity: 1, y: 0, duration: .68, ease: 'power2.out' }, 'galleryWake+=.28')
      .to(heroNav, { opacity: 1, duration: .62 }, 'galleryWake+=.55')
      .to(clusters, { opacity: 0, duration: .72, stagger: .025 }, 'handoff')
      .to('.splash-brand-leaf', { opacity: 0, duration: .55, stagger: .04 }, 'handoff')
      .to('.splash-signature', { opacity: 0, duration: .22, ease: 'power1.out' }, 'handoff')
      .to(heroLogo, { opacity: 1, duration: .24 }, 'handoff+=.23')
      .to('.splash-rays', { opacity: 0, duration: .65 }, 'handoff+=.08')
      .to('.splash-atmosphere', { opacity: 0, duration: .7 }, 'handoff+=.05')
      .to(splash, { backgroundColor: 'rgba(6,26,18,0)', duration: .72 }, 'handoff')
      .to(splash, { opacity: 0, duration: .18, ease: 'none' }, 5.32);
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
