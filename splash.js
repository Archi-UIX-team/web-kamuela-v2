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
  const heroNav = document.querySelectorAll('.masthead,.hero-masthead-brand');
  const heroCopy = document.querySelectorAll('.hero-copy');
  const heroGallery = document.querySelectorAll('.film-gallery');
  const heroFlowers = document.querySelectorAll('.hero-floral');
  const heroBotanicals = document.querySelectorAll('.hero-botanical');
  const heroLight = document.querySelectorAll('.hero-sunlight');
  const allHeroLayers = [...heroNav,...heroCopy,...heroGallery,...heroFlowers,...heroBotanicals,...heroLight];
  let timeline;
  let finished = false;

  function finishSplash() {
    if (finished) return;
    finished = true;
    timeline?.kill();
    gsap?.set(allHeroLayers, { clearProps: 'opacity,visibility,transform' });
    root.classList.remove('splash-pending');
    splash.dataset.state = 'complete';
    splash.remove();
  }

  skip.addEventListener('click', finishSplash);
  addEventListener('pagehide', () => timeline?.kill(), { once: true });
  if (!gsap) {
    setTimeout(finishSplash, reduceMotion ? 650 : 1200);
    return;
  }

  gsap.set(allHeroLayers, { opacity: 0 });
  gsap.set(heroGallery, { y: 30 });
  gsap.set(heroCopy, { y: 24 });
  writingPaths.forEach(path => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });
  gsap.set('.splash-writing-strokes', { opacity: 0 });
  gsap.set('.splash-villas-mask', { opacity: 0, scaleX: .05, transformOrigin: '50% 50%' });
  gsap.set('.splash-logo-complete', { opacity: 0 });

  function buildTimeline() {
    splash.dataset.state = 'playing';
    if (reduceMotion) {
      timeline = gsap.timeline({ onComplete: finishSplash })
        .to('.splash-signature', { opacity: 1, duration: .18 })
        .set('.splash-writing-strokes', { opacity: 1 })
        .to(writingPaths, { strokeDashoffset: 0, duration: .18, stagger: .02, ease: 'none' })
        .to('.splash-villas-mask', { opacity: 1, scaleX: 1, duration: .15 }, '-=.08')
        .to('.splash-logo-complete', { opacity: 1, duration: .12 }, '-=.06')
        .to(allHeroLayers, { opacity: 1, y: 0, duration: .24 }, '+=.08')
        .to(splash, { opacity: 0, duration: .25, ease: 'power1.out' }, '-=.16');
      return;
    }

    const distance = compactMotion ? .72 : 1;
    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onComplete: finishSplash });
    timeline.addLabel('enclosedGarden', 0).addLabel('awakening', .55).addLabel('cameraPassage', 1.05).addLabel('metamorphosis', 2).addLabel('logoWriting', 2.75).addLabel('heroAwakening', 3.6);
    timeline
      .to('.splash-rays', { opacity: .26, x: 9, scale: 1.025, duration: 1.45, ease: 'sine.inOut' }, 'awakening')
      .to('.splash-cluster-center .splash-sway', { rotation: -1.25, x: -5, duration: .68, ease: 'sine.inOut' }, 'awakening+=.03')
      .to('.splash-cluster-center-low .splash-sway', { rotation: .8, x: 4, duration: .74, ease: 'sine.inOut' }, 'awakening+=.08')
      .to('.splash-cluster-upper-left .splash-sway', { rotation: -2.2, x: -7, duration: .72, ease: 'sine.inOut' }, 'awakening+=.1')
      .to('.splash-cluster-upper-right .splash-sway', { rotation: 1.8, x: 6, duration: .78, ease: 'sine.inOut' }, 'awakening+=.17')
      .to('.splash-cluster-mid-left .splash-sway', { rotation: -1.35, x: -6, duration: .78, ease: 'sine.inOut' }, 'awakening+=.15')
      .to('.splash-cluster-mid-right .splash-sway', { rotation: 1.25, x: 6, duration: .82, ease: 'sine.inOut' }, 'awakening+=.22')
      .to('.splash-cluster-lower-left .splash-sway', { rotation: -1.2, y: 5, duration: .82, ease: 'sine.inOut' }, 'awakening+=.25')
      .to('.splash-cluster-lower-right .splash-sway', { rotation: 1.1, y: 5, duration: .86, ease: 'sine.inOut' }, 'awakening+=.32')
      .to('.splash-depth-near', { z: 150, scale: 1.035, duration: 1.45 }, 'cameraPassage')
      .to('.splash-depth-mid', { z: 70, scale: 1.018, duration: 1.5 }, 'cameraPassage+=.05')
      .to('.splash-depth-far', { z: 24, scale: 1.008, duration: 1.55 }, 'cameraPassage+=.08')
      .to('.splash-cluster-center', { x: `${-12 * distance}vw`, y: `${-44 * distance}vh`, rotation: '-=4', scale: 1.08, opacity: .08, duration: 1.3 }, 'cameraPassage')
      .to('.splash-cluster-center-low', { x: `${5 * distance}vw`, y: `${29 * distance}vh`, rotation: '+=3', scale: 1.07, opacity: .1, duration: 1.35 }, 'cameraPassage+=.08')
      .to('.splash-cluster-upper-left', { x: `${-31 * distance}vw`, y: `${-21 * distance}vh`, rotation: '-=7', scale: 1.17, opacity: .36, duration: 1.38 }, 'cameraPassage+=.02')
      .to('.splash-cluster-upper-right', { x: `${31 * distance}vw`, y: `${-22 * distance}vh`, rotation: '+=6', scale: 1.15, opacity: .34, duration: 1.35 }, 'cameraPassage+=.14')
      .to('.splash-cluster-mid-left', { x: `${-28 * distance}vw`, y: `${-3 * distance}vh`, rotation: '-=6', scale: 1.09, opacity: .2, duration: 1.36 }, 'cameraPassage+=.14')
      .to('.splash-cluster-mid-right', { x: `${29 * distance}vw`, y: `${2 * distance}vh`, rotation: '+=6', scale: 1.08, opacity: .2, duration: 1.34 }, 'cameraPassage+=.25')
      .to('.splash-cluster-lower-left', { x: `${-25 * distance}vw`, y: `${22 * distance}vh`, rotation: '-=5', scale: 1.12, opacity: .5, duration: 1.25 }, 'cameraPassage+=.3')
      .to('.splash-cluster-lower-right', { x: `${26 * distance}vw`, y: `${23 * distance}vh`, rotation: '+=5', scale: 1.13, opacity: .48, duration: 1.24 }, 'cameraPassage+=.42')
      .to(splash, { backgroundColor: 'rgba(6,26,18,.68)', duration: .9 }, 'metamorphosis')
      .to('.splash-atmosphere', { opacity: .58, duration: .92 }, 'metamorphosis')
      .to(heroBotanicals, { opacity: .52, duration: .75, stagger: .06 }, 'metamorphosis+=.04')
      .to(heroFlowers, { opacity: .42, duration: .72, stagger: .07 }, 'metamorphosis+=.12')
      .to(heroLight, { opacity: .62, duration: .9 }, 'metamorphosis+=.12')
      .to(heroGallery, { opacity: .16, y: 22, duration: .7 }, 'metamorphosis+=.38')
      .to('.splash-brand-leaf-one', { x: '6vw', y: '-5vh', opacity: .025, duration: 1.05 }, 'metamorphosis')
      .to('.splash-brand-leaf-two', { x: '-6vw', y: '5vh', opacity: .025, duration: 1.05 }, 'metamorphosis+=.08')
      .to('.splash-brand-leaf-three', { opacity: 0, duration: .8 }, 'metamorphosis')
      .to('.splash-signature', { opacity: 1, y: -3, duration: .18, ease: 'power1.out' }, 'logoWriting')
      .set('.splash-writing-strokes', { opacity: 1 }, 'logoWriting')
      .to('.splash-pen-glint', { opacity: 1, duration: .1 }, 'logoWriting')
      .to(writingPaths, { strokeDashoffset: 0, duration: .42, stagger: .09, ease: 'power1.inOut' }, 'logoWriting')
      .to('.splash-pen-glint', { left: '39%', top: '38%', duration: .32, ease: 'sine.inOut' }, 'logoWriting')
      .to('.splash-pen-glint', { left: '60%', top: '50%', duration: .34, ease: 'sine.inOut' }, 'logoWriting+=.31')
      .to('.splash-pen-glint', { left: '84%', top: '46%', duration: .38, ease: 'sine.inOut' }, 'logoWriting+=.63')
      .to('.splash-pen-glint', { opacity: 0, duration: .13 }, 'logoWriting+=.98')
      .to('.splash-villas-mask', { opacity: 1, scaleX: 1, duration: .24, ease: 'power2.out' }, 'logoWriting+=.78')
      .to('.splash-logo-complete', { opacity: 1, duration: .2, ease: 'power1.out' }, 'logoWriting+=1')
      .to(heroLight, { opacity: 1, duration: .72 }, 'heroAwakening')
      .to(heroBotanicals, { opacity: 1, duration: .7, stagger: .04 }, 'heroAwakening')
      .to(heroFlowers, { opacity: 1, duration: .7, stagger: .05 }, 'heroAwakening+=.04')
      .to(heroGallery, { opacity: 1, y: 0, duration: .62, ease: 'power2.out' }, 'heroAwakening+=.02')
      .to(heroCopy, { opacity: 1, y: 0, duration: .62, ease: 'power2.out' }, 'heroAwakening+=.12')
      .to(heroNav, { opacity: 1, duration: .62, stagger: .05 }, 'heroAwakening+=.18')
      .to('.splash-signature', { opacity: 0, y: -8, duration: .4 }, 'heroAwakening+=.38')
      .to(clusters, { opacity: 0, duration: .72, stagger: .018 }, 'heroAwakening+=.02')
      .to('.splash-brand-leaf', { opacity: 0, duration: .55, stagger: .025 }, 'heroAwakening+=.16')
      .to('.splash-rays', { opacity: 0, duration: .65 }, 'heroAwakening+=.2')
      .to('.splash-atmosphere', { opacity: 0, duration: .78 }, 'heroAwakening+=.14')
      .to(splash, { backgroundColor: 'rgba(6,26,18,0)', duration: .78 }, 'heroAwakening+=.08')
      .to(splash, { opacity: 0, duration: .14, ease: 'none' }, 4.66);
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
