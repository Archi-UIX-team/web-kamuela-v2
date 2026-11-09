(() => {
  'use strict';

  const root = document.documentElement;
  const splash = document.getElementById('kamuela-splash');
  if (!splash || !root.classList.contains('splash-pending')) return;

  const logo = splash.querySelector('.splash-logo');
  const skip = splash.querySelector('.splash-skip');
  const atmosphere = splash.querySelector('.splash-atmosphere');
  const plumHaze = splash.querySelector('.splash-plum-haze');
  const sunlight = splash.querySelector('.splash-sunlight');
  const shadows = [...splash.querySelectorAll('.splash-shadow')];
  const leafStage = splash.querySelector('.splash-leaf-stage');
  const originLight = splash.querySelector('.splash-origin-light');
  const canvas = splash.querySelector('.splash-vein-canvas');
  const finalLeaf = splash.querySelector('.splash-leaf-final');
  const highlightLeaf = splash.querySelector('.splash-leaf-highlight');
  const context = canvas.getContext('2d');
  const maskCanvas = document.createElement('canvas');
  const maskContext = maskCanvas.getContext('2d');
  const artCanvas = document.createElement('canvas');
  const artContext = artCanvas.getContext('2d');
  const growth = { value: 0 };
  const inertState = [...document.body.children]
    .filter(element => element !== splash && element.tagName !== 'SCRIPT')
    .map(element => [element, element.inert]);
  let timeline;
  let complete = false;
  let leafImage;
  let veinNetwork;

  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;
  artCanvas.width = canvas.width;
  artCanvas.height = canvas.height;

  function finish(markSeen = true, focusMain = false) {
    if (complete) return;
    complete = true;
    if (timeline) timeline.kill();
    clearTimeout(window.kamuelaSplashSafety);
    delete window.kamuelaSplashAbort;
    delete window.kamuelaSplashTimeline;
    if (markSeen) {
      try { sessionStorage.setItem('kamuela-splash-seen', '1'); } catch (_) { /* Storage is optional. */ }
    }
    root.classList.remove('splash-pending');
    splash.setAttribute('aria-hidden', 'true');
    inertState.forEach(([element, wasInert]) => { element.inert = wasInert; });
    skip.removeEventListener('click', onSkip);
    window.removeEventListener('pagehide', onPageHide);
    leafStage.style.willChange = 'auto';
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

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }

  function drawPolyline(target, points) {
    target.beginPath();
    target.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) target.lineTo(points[i][0], points[i][1]);
  }

  function renderGrowth() {
    if (!leafImage || !veinNetwork) return;
    const width = canvas.width;
    const height = canvas.height;
    const scaleX = width / 1239;
    const scaleY = height / 2370;

    maskContext.setTransform(1, 0, 0, 1, 0, 0);
    maskContext.clearRect(0, 0, width, height);
    maskContext.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    maskContext.strokeStyle = '#fff';
    maskContext.lineCap = 'round';
    maskContext.lineJoin = 'round';

    const primary = veinNetwork.primary;
    const primaryProgress = Math.max(0, Math.min(1, growth.value / .72));
    if (primaryProgress) {
      maskContext.lineWidth = primary.w;
      maskContext.setLineDash([Math.max(1, primary.l * primaryProgress), primary.l + 4]);
      drawPolyline(maskContext, primary.p);
      maskContext.stroke();
    }

    veinNetwork.paths.forEach(path => {
      const start = path.s * .82;
      const duration = Math.max(.075, (path.e - path.s) * .82 + .13);
      const local = Math.max(0, Math.min(1, (growth.value - start) / duration));
      if (!local) return;
      maskContext.lineWidth = path.w;
      maskContext.setLineDash([Math.max(1, path.l * local), path.l + 4]);
      maskContext.lineDashOffset = 0;
      drawPolyline(maskContext, path.p);
      maskContext.stroke();
    });
    maskContext.setLineDash([]);

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.drawImage(artCanvas, 0, 0);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(maskCanvas, 0, 0);
    context.globalCompositeOperation = 'source-over';
  }

  function buildTimeline() {
    if (!window.gsap) { finish(); return; }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timeline = gsap.timeline({ onComplete: () => finish() });
      timeline.to(logo, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .24, ease: 'power2.out' }, 0);
      timeline.to(splash, { opacity: 0, duration: .28, ease: 'power2.inOut' }, .45);
      return;
    }

    renderGrowth();
    timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.inOut' },
      onComplete: () => finish(),
    });
    window.kamuelaSplashTimeline = timeline;

    timeline.addLabel('atmosphere', 0);
    timeline.addLabel('mainVein', .4);
    timeline.addLabel('branchGrowth', .8);
    timeline.addLabel('sunlight', 1.5);
    timeline.addLabel('illumination', 2.1);
    timeline.addLabel('leafDissolve', 2.5);
    timeline.addLabel('logoReveal', 2.7);
    timeline.addLabel('logoHold', 3.5);
    timeline.addLabel('handoff', 3.8);

    timeline.to(atmosphere, { opacity: 1, scale: 1, duration: .65, ease: 'power2.out' }, 'atmosphere');
    timeline.to(plumHaze, { opacity: .72, xPercent: 3, yPercent: -2, duration: 1.25 }, 'atmosphere+=.08');
    timeline.to(shadows, { opacity: .18, duration: .8, stagger: .12, ease: 'power2.out' }, 'atmosphere+=.05');
    timeline.to(skip, { opacity: .8, duration: .3 }, 'atmosphere+=.35');
    timeline.to(originLight, { opacity: 1, scale: 1, duration: .22, ease: 'power2.out' }, 'mainVein');
    timeline.to(growth, { value: 1, duration: 1.6, ease: 'power2.inOut', onUpdate: renderGrowth }, 'mainVein');
    timeline.to(originLight, { opacity: 0, scale: .8, duration: .45 }, 'branchGrowth+=.55');
    timeline.to(sunlight, { opacity: 1, xPercent: -3, yPercent: 3, duration: .8 }, 'sunlight');
    timeline.to(finalLeaf, { opacity: 1, duration: .28, ease: 'power2.out' }, 'branchGrowth+=1.1');
    timeline.to(canvas, { opacity: 0, duration: .24 }, 'branchGrowth+=1.14');
    timeline.to(highlightLeaf, { opacity: .72, webkitMaskPosition: '-40% 0', maskPosition: '-40% 0', duration: .6, ease: 'power2.inOut' }, 'illumination');
    timeline.to(highlightLeaf, { opacity: 0, duration: .18 }, 'illumination+=.48');
    timeline.to(leafStage, { opacity: 0, duration: .5, ease: 'power2.inOut' }, 'leafDissolve');
    timeline.to(logo, { opacity: 1, filter: 'blur(0px)', y: 0, duration: .8, ease: 'power3.out' }, 'logoReveal');
    timeline.to([sunlight, plumHaze], { opacity: .4, duration: .5 }, 'logoHold');
    timeline.to(splash, { opacity: 0, duration: .7, ease: 'power2.inOut' }, 'handoff');

    if (!window.__KAMUELA_SPLASH_PAUSED__) timeline.play(0);
  }

  try {
    window.kamuelaSplashAbort = () => finish();
    splash.setAttribute('aria-hidden', 'false');
    inertState.forEach(([element]) => { element.inert = true; });
    skip.addEventListener('click', onSkip);
    window.addEventListener('pagehide', onPageHide);
    logo.addEventListener('error', () => finish(), { once: true });
    if (logo.complete && logo.naturalWidth === 0) { finish(); return; }

    Promise.all([
      loadImage('./assets/kamuela-leaf-official.svg'),
      fetch('./assets/kamuela-vein-network.json').then(response => {
        if (!response.ok) throw new Error('Vein network failed to load');
        return response.json();
      }),
    ]).then(([image, network]) => {
      leafImage = image;
      veinNetwork = network;
      artContext.drawImage(leafImage, 0, 0, artCanvas.width, artCanvas.height);
      buildTimeline();
    }).catch(() => finish());
  } catch (_) {
    finish();
  }
})();
