(() => {
  'use strict';
  const root = document.documentElement;
  const splash = document.querySelector('.kamuela-splash');
  if (!splash || !root.classList.contains('splash-pending')) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skip = splash.querySelector('.splash-skip');
  const heroLayers = document.querySelectorAll('.masthead,.hero-masthead-brand,.hero-copy,.film-gallery,.hero-floral');
  const clusters = [...splash.querySelectorAll('.splash-cluster')];
  const writingPaths = [...splash.querySelectorAll('.splash-writing-strokes path')];
  let timeline;
  let finished = false;

  function finishSplash() {
    if (finished) return;
    finished = true;
    timeline?.kill();
    window.gsap?.set(heroLayers, { clearProps: 'opacity,visibility,transform' });
    root.classList.remove('splash-pending');
    splash.dataset.state = 'complete';
    splash.remove();
  }

  skip.addEventListener('click', finishSplash);
  addEventListener('pagehide', () => timeline?.kill(), { once: true });

  if (!window.gsap) {
    setTimeout(finishSplash, reduceMotion ? 650 : 1100);
    return;
  }

  const gsap = window.gsap;
  gsap.set(heroLayers, { opacity: 0 });
  writingPaths.forEach(path => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });
  gsap.set('.splash-writing-strokes', { opacity: 0 });
  gsap.set('.splash-villas-mask', { opacity: 0, scaleX: .08, transformOrigin: '50% 50%' });
  gsap.set('.splash-logo-complete', { opacity: 0 });

  function buildTimeline() {
    splash.dataset.state = 'playing';
    if (reduceMotion) {
      timeline = gsap.timeline({ onComplete: finishSplash })
        .set('.splash-writing-strokes', { opacity: 1 })
        .to('.splash-writing-strokes path', { strokeDashoffset: 0, duration: .4, stagger: .035, ease: 'power2.inOut' })
        .to('.splash-villas-mask', { opacity: 1, scaleX: 1, duration: .2 }, '-=.1')
        .to('.splash-logo-complete', { opacity: 1, duration: .16 }, '-=.08')
        .to(heroLayers, { opacity: 1, duration: .28 }, '+=.12')
        .to(splash, { opacity: 0, duration: .3, ease: 'power1.out' }, '-=.18');
      return;
    }

    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onComplete: finishSplash });
    timeline.addLabel('enclosedGarden', 0).addLabel('awakening', .6).addLabel('gardenOpening', 1.1).addLabel('logoWriting', 2.1).addLabel('brandHold', 3.4).addLabel('heroReveal', 3.8);

    timeline
      .to('.splash-rays', { opacity: .24, x: 7, scale: 1.018, duration: 1.5, ease: 'sine.inOut' }, 'awakening')
      .to('.splash-cluster-center-low .splash-sway', { rotation: .8, x: 4, duration: .72, ease: 'sine.inOut' }, 'awakening+=.05')
      .to('.splash-cluster-center .splash-sway', { rotation: -1.4, x: -5, duration: .66, ease: 'sine.inOut' }, 'awakening+=.1')
      .to('.splash-cluster-upper-left .splash-sway', { rotation: -2, x: -7, duration: .68, ease: 'sine.inOut' }, 'awakening+=.12')
      .to('.splash-cluster-upper-right .splash-sway', { rotation: 1.7, x: 6, duration: .74, ease: 'sine.inOut' }, 'awakening+=.2')
      .to('.splash-cluster-mid-left .splash-sway', { rotation: -1.3, x: -6, duration: .76, ease: 'sine.inOut' }, 'awakening+=.16')
      .to('.splash-cluster-mid-right .splash-sway', { rotation: 1.25, x: 6, duration: .8, ease: 'sine.inOut' }, 'awakening+=.22')
      .to('.splash-cluster-lower-left .splash-sway', { rotation: -1.15, y: 5, duration: .8, ease: 'sine.inOut' }, 'awakening+=.26')
      .to('.splash-cluster-lower-right .splash-sway', { rotation: 1.1, y: 5, duration: .82, ease: 'sine.inOut' }, 'awakening+=.34')
      .to('.splash-cluster-center-low', { x: '4vw', y: '24vh', rotation: '+=3', scale: 1.02, opacity: .18, duration: 1.18 }, 'gardenOpening+=.1')
      .to('.splash-cluster-center', { x: '-9vw', y: '-38vh', rotation: '-=4', scale: 1.035, opacity: .18, duration: 1.08 }, 'gardenOpening')
      .to('.splash-cluster-upper-left', { x: '-24vw', y: '-18vh', rotation: '-=7', scale: 1.035, opacity: .78, duration: 1.2 }, 'gardenOpening')
      .to('.splash-cluster-upper-right', { x: '22vw', y: '-16vh', rotation: '+=6', scale: 1.03, opacity: .76, duration: 1.16 }, 'gardenOpening+=.17')
      .to('.splash-cluster-mid-left', { x: '-30vw', y: '-2vh', rotation: '-=6', scale: 1.025, opacity: .46, duration: 1.22 }, 'gardenOpening+=.12')
      .to('.splash-cluster-mid-right', { x: '30vw', y: '1vh', rotation: '+=6', scale: 1.025, opacity: .44, duration: 1.22 }, 'gardenOpening+=.25')
      .to('.splash-cluster-lower-left', { x: '-22vw', y: '20vh', rotation: '-=5', scale: 1.025, opacity: .8, duration: 1.15 }, 'gardenOpening+=.34')
      .to('.splash-cluster-lower-right', { x: '24vw', y: '22vh', rotation: '+=5', scale: 1.025, opacity: .78, duration: 1.12 }, 'gardenOpening+=.5')
      .to('.splash-brand-leaf-one', { x: '5vw', y: '-4vh', opacity: .06, duration: 1.2 }, 'gardenOpening+=.28')
      .to('.splash-brand-leaf-two', { x: '-5vw', y: '4vh', opacity: .06, duration: 1.2 }, 'gardenOpening+=.4')
      .to('.splash-brand-leaf-three', { opacity: .025, duration: 1 }, 'gardenOpening+=.2')
      .set('.splash-writing-strokes', { opacity: 1 }, 'logoWriting')
      .to('.splash-pen-glint', { opacity: 1, duration: .12 }, 'logoWriting')
      .to(writingPaths, { strokeDashoffset: 0, duration: .28, stagger: .16, ease: 'power1.inOut' }, 'logoWriting')
      .to('.splash-pen-glint', { left: '40%', top: '38%', duration: .38, ease: 'sine.inOut' }, 'logoWriting')
      .to('.splash-pen-glint', { left: '61%', top: '51%', duration: .4, ease: 'sine.inOut' }, 'logoWriting+=.38')
      .to('.splash-pen-glint', { left: '84%', top: '47%', duration: .42, ease: 'sine.inOut' }, 'logoWriting+=.78')
      .to('.splash-pen-glint', { opacity: 0, duration: .16 }, 'logoWriting+=1.2')
      .to('.splash-villas-mask', { opacity: 1, scaleX: 1, duration: .28, ease: 'power2.out' }, 'logoWriting+=1.02')
      .to('.splash-logo-complete', { opacity: 1, duration: .18, ease: 'power1.out' }, 'logoWriting+=1.25')
      .to({}, { duration: .4 }, 'brandHold')
      .to('.splash-signature', { opacity: 0, y: -7, duration: .34 }, 'heroReveal')
      .to(heroLayers, { opacity: 1, duration: .9, stagger: .03, ease: 'power2.out' }, 'heroReveal+=.16')
      .to(clusters, { opacity: 0, duration: .88, stagger: .025 }, 'heroReveal')
      .to('.splash-brand-leaf', { opacity: 0, duration: .66, stagger: .03 }, 'heroReveal+=.12')
      .to('.splash-atmosphere', { opacity: 0, duration: .92 }, 'heroReveal')
      .to('.splash-rays', { opacity: 0, duration: .78 }, 'heroReveal+=.16')
      .to(splash, { backgroundColor: 'rgba(6,26,18,0)', duration: 1 }, 'heroReveal')
      .to(splash, { opacity: 0, duration: .18, ease: 'none' }, 4.72);

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
  Promise.race([decodeAssets, new Promise(resolve => setTimeout(resolve, 1200))]).then(buildTimeline);
})();
