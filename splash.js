(() => {
  'use strict';

  const root = document.documentElement;
  const splash = document.getElementById('kamuela-splash');
  if (!splash || !root.classList.contains('splash-pending')) return;

  const leaf = splash.querySelector('.splash-leaf');
  const logo = splash.querySelector('.splash-logo');
  const skip = splash.querySelector('.splash-skip');
  const glow = splash.querySelector('.splash-atmosphere');
  const mainGradient = splash.querySelector('#kamuela-reveal-main');
  const leftGradient = splash.querySelector('#kamuela-reveal-left');
  const rightGradient = splash.querySelector('#kamuela-reveal-right');
  const lightBand = splash.querySelector('.splash-light-band');
  const inertState = [...document.body.children]
    .filter(element => element !== splash && element.tagName !== 'SCRIPT')
    .map(element => [element, element.inert]);
  let timeline;
  let complete = false;

  function finish(markSeen = true, focusMain = false) {
    if (complete) return;
    complete = true;
    if (timeline) timeline.kill();
    clearTimeout(window.kamuelaSplashSafety);
    delete window.kamuelaSplashAbort;
    if (markSeen) {
      try { sessionStorage.setItem('kamuela-splash-seen', '1'); } catch (_) { /* Storage is optional. */ }
    }
    root.classList.remove('splash-pending');
    splash.setAttribute('aria-hidden', 'true');
    inertState.forEach(([element, wasInert]) => { element.inert = wasInert; });
    skip.removeEventListener('click', onSkip);
    window.removeEventListener('pagehide', onPageHide);
    leaf.style.willChange = 'auto';
    logo.style.willChange = 'auto';
    if (focusMain || document.activeElement === skip) {
      const main = document.getElementById('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
    }
  }

  function onSkip() { finish(true, true); }
  function onPageHide() { finish(false); }

  try {
    window.kamuelaSplashAbort = () => finish();
    splash.setAttribute('aria-hidden', 'false');
    inertState.forEach(([element]) => { element.inert = true; });
    skip.addEventListener('click', onSkip);
    window.addEventListener('pagehide', onPageHide);

    const checkAsset = new Image();
    checkAsset.onerror = () => finish();
    checkAsset.src = './assets/kamuela-leaf-official.svg';
    logo.addEventListener('error', () => finish(), { once: true });
    if (logo.complete && logo.naturalWidth === 0) { finish(); return; }

    if (!window.gsap) { finish(); return; }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timeline = gsap.timeline({ onComplete: () => finish() });
      timeline.to(logo, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .24, ease: 'power2.out' }, 0);
      timeline.to(splash, { opacity: 0, duration: .28, ease: 'power2.inOut' }, .35);
      return;
    }

    timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' }, onComplete: () => finish() });
    timeline.addLabel('intro', 0);
    timeline.addLabel('leafReveal', .35);
    timeline.addLabel('leafIllumination', 1.45);
    timeline.addLabel('leafDissolve', 1.95);
    timeline.addLabel('logoReveal', 2.15);
    timeline.addLabel('logoHold', 2.85);
    timeline.addLabel('handoff', 3.15);

    timeline.to(glow, { opacity: .42, scale: 1, duration: .65 }, 'intro');
    timeline.to(skip, { opacity: .8, duration: .3 }, 'leafReveal+=.15');
    timeline.to(leaf, { opacity: 1, duration: .3 }, 'leafReveal');
    timeline.to(mainGradient, { attr: { y1: 2600, y2: 2950 }, duration: 1.2, ease: 'power2.inOut' }, 'leafReveal');
    timeline.to(leftGradient, { attr: { y1: 2500, y2: 2850 }, duration: 1.1, ease: 'power2.inOut' }, 'leafReveal+=.06');
    timeline.to(rightGradient, { attr: { y1: 2500, y2: 2850 }, duration: 1.05, ease: 'power2.inOut' }, 'leafReveal+=.18');
    timeline.to(lightBand, { attr: { x: 1600 }, duration: .6, ease: 'power2.inOut' }, 'leafIllumination');
    timeline.to(leaf, { opacity: 0, scale: 1.025, duration: .5, ease: 'power2.inOut' }, 'leafDissolve');
    timeline.to(logo, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .7, ease: 'power3.out' }, 'logoReveal');
    timeline.to(splash, { opacity: 0, duration: .65, ease: 'power2.inOut' }, 'handoff');
    timeline.play(0);
  } catch (_) {
    finish();
  }
})();
