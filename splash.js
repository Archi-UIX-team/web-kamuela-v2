(() => {
  'use strict';
  const root = document.documentElement;
  const splash = document.querySelector('.kamuela-splash');
  if (!splash || !root.classList.contains('splash-pending')) {
    splash?.remove();
    return;
  }

  const forceIntro = new URLSearchParams(location.search).get('intro') === '1';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skip = splash.querySelector('.splash-skip');
  const leaves = [...splash.querySelectorAll('.splash-leaf')];
  const foreground = leaves.filter(leaf => leaf.classList.contains('splash-leaf-front'));
  const midground = leaves.filter(leaf => leaf.classList.contains('splash-leaf-mid'));
  const background = leaves.filter(leaf => leaf.classList.contains('splash-leaf-bg'));
  const heroLayers = document.querySelectorAll('.masthead,.hero-masthead-brand,.hero-copy,.film-gallery,.hero-floral');
  let timeline;
  let finished = false;

  function remember() {
    if (forceIntro) return;
    try { sessionStorage.setItem('kamuela-intro-seen', '1'); } catch (_) {}
  }

  function finishIntro() {
    if (finished) return;
    finished = true;
    remember();
    timeline?.kill();
    window.gsap?.set(heroLayers, { clearProps: 'opacity,visibility,transform' });
    root.classList.remove('splash-pending');
    splash.remove();
  }

  skip.addEventListener('click', finishIntro);
  addEventListener('pagehide', () => timeline?.kill(), { once: true });

  if (!window.gsap) {
    setTimeout(finishIntro, reduceMotion ? 700 : 1200);
    return;
  }

  const gsap = window.gsap;
  gsap.set(heroLayers, { opacity: 0 });
  gsap.set('.splash-signature', { opacity: 1 });
  gsap.set('.splash-writing-strokes path', { strokeDashoffset: 1200 });
  gsap.set('.splash-villas-mask', { opacity: 0, scaleX: .08, transformOrigin: '50% 50%' });
  gsap.set('.splash-logo-complete', { opacity: 0 });

  if (reduceMotion) {
    gsap.set(leaves, { opacity: .32 });
    timeline = gsap.timeline({ onComplete: finishIntro })
      .to('.splash-writing-strokes path', { strokeDashoffset: 0, duration: .45, stagger: .04, ease: 'power2.inOut' })
      .to('.splash-villas-mask', { opacity: 1, scaleX: 1, duration: .25 }, '-=.12')
      .to('.splash-logo-complete', { opacity: 1, duration: .18 }, '-=.1')
      .to(splash, { opacity: 0, duration: .3, ease: 'power1.out' }, '+=.15');
    return;
  }

  timeline = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' }, onComplete: finishIntro });
  timeline.addLabel('opening', 0).addLabel('awakening', .6).addLabel('botanicalReveal', 1.1).addLabel('logoWriting', 2).addLabel('logoHold', 3.25).addLabel('heroTransformation', 3.6);

  timeline
    .to('.splash-rays', { opacity: .48, scale: 1.035, duration: 1.55, ease: 'power2.inOut' }, 'awakening')
    .to(foreground, { x: i => i % 2 ? 9 : -9, y: i => i % 3 ? -6 : 7, rotation: i => i % 2 ? 1.7 : -2.1, scale: 1.018, duration: .55, stagger: .07 }, 'awakening')
    .to(midground, { y: i => i % 2 ? -7 : 7, rotation: i => i % 2 ? 1.2 : -1.3, duration: .7, stagger: .08 }, 'awakening+=.08')
    .to('.splash-flowers-left', { x: 6, rotation: 1.4, duration: 1.25, ease: 'sine.inOut' }, 'awakening')
    .to('.splash-flowers-right', { x: -7, rotation: -1.2, duration: 1.35, ease: 'sine.inOut' }, 'awakening')
    .to('.splash-leaf-center', { x: '-35vw', y: '18vh', rotation: '-=19', scale: 1.06, opacity: .18, duration: .92 }, 'botanicalReveal')
    .to(foreground.filter(el => !el.classList.contains('splash-leaf-center')), {
      x: (_, el) => el.dataset.exitX, y: (_, el) => el.dataset.exitY, rotation: (_, el) => `+=${el.dataset.exitR}`, scale: 1.055, opacity: .34, duration: 1.12, stagger: .11
    }, 'botanicalReveal+=.12')
    .to(midground, {
      x: (_, el) => el.dataset.exitX, y: (_, el) => el.dataset.exitY, rotation: (_, el) => `+=${el.dataset.exitR}`, scale: 1.025, opacity: .24, duration: 1.05, stagger: .1
    }, 'botanicalReveal+=.28')
    .to(background, { x: (_, el) => el.dataset.exitX, y: (_, el) => el.dataset.exitY, opacity: .12, duration: 1.3, stagger: .08 }, 'botanicalReveal+=.35')
    .to('.splash-pen-glint', { opacity: 1, duration: .12 }, 'logoWriting')
    .to('.splash-writing-strokes path', { strokeDashoffset: 0, duration: .76, stagger: .07, ease: 'power2.inOut' }, 'logoWriting')
    .to('.splash-pen-glint', { left: '84%', top: '50%', duration: 1.02, ease: 'power1.inOut' }, 'logoWriting')
    .to('.splash-pen-glint', { opacity: 0, duration: .2 }, 'logoWriting+=1.02')
    .to('.splash-villas-mask', { opacity: 1, scaleX: 1, duration: .34, ease: 'power2.out' }, 'logoWriting+=.86')
    .to('.splash-logo-complete', { opacity: 1, duration: .28, ease: 'power1.out' }, 'logoWriting+=1.05')
    .to({}, { duration: .4 }, 'logoHold')
    .to(heroLayers, { opacity: 1, duration: 1.08, stagger: .035, ease: 'power2.out' }, 'heroTransformation')
    .to('.splash-signature', { opacity: 0, y: -8, duration: .62, ease: 'power2.inOut' }, 'heroTransformation+=.12')
    .to('.splash-flowers', { opacity: 0, y: 18, duration: .72 }, 'heroTransformation+=.18')
    .to('.splash-leaf-front,.splash-leaf-mid', { opacity: 0, scale: 1.08, duration: .86, stagger: .025 }, 'heroTransformation')
    .to('.splash-leaf-bg', { opacity: 0, duration: .75 }, 'heroTransformation+=.12')
    .to('.splash-atmosphere', { opacity: 0, duration: .96 }, 'heroTransformation')
    .to('.splash-rays', { opacity: 0, duration: .82 }, 'heroTransformation+=.18')
    .to(splash, { backgroundColor: 'rgba(6,26,18,0)', duration: 1.05 }, 'heroTransformation')
    .to(splash, { opacity: 0, duration: .2, ease: 'none' }, 4.6);

  timeline.play(0);
})();
