(() => {
  'use strict';

  const root = document.documentElement;
  const splash = document.getElementById('kamuela-splash');
  if (!splash || !root.classList.contains('splash-pending')) return;

  const atmosphere = splash.querySelector('.splash-atmosphere');
  const plumHaze = splash.querySelector('.splash-plum-haze');
  const sunlight = splash.querySelector('.splash-sunlight');
  const leaves = [...splash.querySelectorAll('.splash-leaf')];
  const leafArtwork = [...splash.querySelectorAll('.splash-leaf img')];
  const flowers = [...splash.querySelectorAll('.splash-flower')];
  const logoStage = splash.querySelector('.splash-logo-stage');
  const logoCanvas = splash.querySelector('.splash-logo-canvas');
  const logoFinal = splash.querySelector('.splash-logo-final');
  const skip = splash.querySelector('.splash-skip');
  const logoContext = logoCanvas.getContext('2d');
  const logoMask = document.createElement('canvas');
  const logoMaskContext = logoMask.getContext('2d');
  const logoArt = document.createElement('canvas');
  const logoArtContext = logoArt.getContext('2d');
  const writing = { value: 0 };
  const inertState = [...document.body.children]
    .filter(element => element !== splash && element.tagName !== 'SCRIPT')
    .map(element => [element, element.inert]);
  let timeline;
  let logoImage;
  let logoNetwork;
  let complete = false;

  [logoMask, logoArt].forEach(canvas => {
    canvas.width = logoCanvas.width;
    canvas.height = logoCanvas.height;
  });

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
    for (let index = 1; index < points.length; index += 1) target.lineTo(points[index][0], points[index][1]);
  }

  function pointAlong(points, progress) {
    if (points.length === 1) return points[0];
    const scaled = Math.max(0, Math.min(points.length - 1, progress * (points.length - 1)));
    const index = Math.min(points.length - 2, Math.floor(scaled));
    const remainder = scaled - index;
    return [
      points[index][0] + (points[index + 1][0] - points[index][0]) * remainder,
      points[index][1] + (points[index + 1][1] - points[index][1]) * remainder,
    ];
  }

  function renderLogoWriting() {
    if (!logoImage || !logoNetwork) return;
    const width = logoCanvas.width;
    const height = logoCanvas.height;
    const scaleX = width / 2313;
    const scaleY = height / 978;
    let activePoint = null;
    let latestStart = -1;

    logoMaskContext.setTransform(1, 0, 0, 1, 0, 0);
    logoMaskContext.clearRect(0, 0, width, height);
    logoMaskContext.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    logoMaskContext.strokeStyle = '#fff';
    logoMaskContext.lineCap = 'round';
    logoMaskContext.lineJoin = 'round';

    logoNetwork.paths.forEach(path => {
      const local = Math.max(0, Math.min(1, (writing.value - path.s) / Math.max(.025, path.e - path.s)));
      if (!local) return;
      logoMaskContext.lineWidth = path.w;
      logoMaskContext.setLineDash([Math.max(1, path.l * local), path.l + 4]);
      drawPolyline(logoMaskContext, path.p);
      logoMaskContext.stroke();
      if (local < 1 && path.s >= latestStart) {
        latestStart = path.s;
        activePoint = pointAlong(path.p, local);
      }
    });
    logoMaskContext.setLineDash([]);

    logoContext.setTransform(1, 0, 0, 1, 0, 0);
    logoContext.clearRect(0, 0, width, height);
    logoContext.drawImage(logoArt, 0, 0);
    logoContext.globalCompositeOperation = 'destination-in';
    logoContext.drawImage(logoMask, 0, 0);
    logoContext.globalCompositeOperation = 'source-over';

    if (activePoint && writing.value < .97) {
      const x = activePoint[0] * scaleX;
      const y = activePoint[1] * scaleY;
      const glow = logoContext.createRadialGradient(x, y, 0, x, y, 12);
      glow.addColorStop(0, 'rgba(243,226,187,.92)');
      glow.addColorStop(.25, 'rgba(231,211,164,.55)');
      glow.addColorStop(1, 'rgba(231,211,164,0)');
      logoContext.fillStyle = glow;
      logoContext.beginPath();
      logoContext.arc(x, y, 12, 0, Math.PI * 2);
      logoContext.fill();
    }
  }

  function buildReducedTimeline() {
    gsap.set(logoFinal, { opacity: 1 });
    gsap.set(logoCanvas, { opacity: 0 });
    timeline = gsap.timeline({ onComplete: () => finish() });
    timeline.fromTo(logoStage, { opacity: 0 }, { opacity: 1, duration: .24, ease: 'power2.out' }, 0);
    timeline.to(splash, { opacity: 0, duration: .34, ease: 'power2.inOut' }, .58);
  }

  function buildTimeline() {
    if (!window.gsap) { finish(); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      buildReducedTimeline();
      return;
    }

    renderLogoWriting();
    gsap.set(leaves, { force3D: true });
    gsap.set(flowers, { force3D: true });
    timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.inOut' },
      onComplete: () => finish(),
    });
    window.kamuelaSplashTimeline = timeline;

    timeline.addLabel('garden', 0);
    timeline.addLabel('awakening', .45);
    timeline.addLabel('unveiling', 1.1);
    timeline.addLabel('logoWriting', 2.05);
    timeline.addLabel('brandHold', 3.35);
    timeline.addLabel('heroHandoff', 3.75);

    timeline.to(atmosphere, { opacity: 1, scale: 1, duration: .62, ease: 'power2.out' }, 'garden');
    timeline.to(plumHaze, { opacity: .68, yPercent: -2, duration: 1.1 }, 'garden+=.08');
    timeline.to(sunlight, { opacity: .5, xPercent: 2, yPercent: 2, duration: 1.7 }, 'garden+=.18');
    timeline.to(leafArtwork, {
      xPercent: index => (index % 3 - 1) * 1.2,
      yPercent: index => (index % 2 ? 1 : -1) * 1.1,
      rotation: index => (index % 2 ? 1 : -1) * (2 + index % 3),
      duration: .9,
      stagger: { each: .045, from: 'edges' },
      ease: 'power2.inOut',
    }, 'awakening');
    timeline.to(flowers, {
      rotation: index => index ? 1.2 : -1.2,
      y: -5,
      duration: 1.05,
      stagger: .12,
      ease: 'sine.inOut',
    }, 'awakening+=.08');

    const offsets = [0, .11, .05, .17, .09, .14, .03, .13, .18, .07, .16, .12];
    leaves.forEach((leaf, index) => {
      const depth = leaf.dataset.depth;
      const duration = depth === 'foreground' ? 1.48 : depth === 'midground' ? 1.62 : 1.78;
      const targetOpacity = depth === 'background' ? .045 : depth === 'midground' ? .12 : 0;
      timeline.to(leaf, {
        x: leaf.dataset.exitX,
        y: leaf.dataset.exitY,
        rotation: `+=${leaf.dataset.exitRotation}`,
        scale: depth === 'foreground' ? 1.06 : 1.025,
        opacity: targetOpacity,
        duration,
        ease: 'power2.inOut',
      }, 1.1 + offsets[index]);
    });

    timeline.to(writing, { value: 1, duration: 1.3, ease: 'power2.inOut', onUpdate: renderLogoWriting }, 'logoWriting');
    timeline.to(logoFinal, { opacity: 1, duration: .18, ease: 'power2.out' }, 'logoWriting+=1.12');
    timeline.to(logoCanvas, { opacity: 0, duration: .18 }, 'logoWriting+=1.14');
    timeline.to(sunlight, { opacity: .62, xPercent: 4, yPercent: 3, duration: .75 }, 'logoWriting+=.25');
    timeline.to([atmosphere, plumHaze], { opacity: .76, duration: .4 }, 'brandHold');
    timeline.to(logoStage, { opacity: 0, duration: .62, ease: 'power2.inOut' }, 'heroHandoff+=.12');
    timeline.to(flowers, {
      x: index => index ? '24vw' : '-24vw',
      y: '18vh',
      opacity: 0,
      duration: .8,
      ease: 'power3.inOut',
    }, 'heroHandoff');
    timeline.to(sunlight, { opacity: .18, duration: .92 }, 'heroHandoff');
    timeline.to(splash, { opacity: 0, duration: 1.05, ease: 'power2.inOut' }, 'heroHandoff');

    if (!window.__KAMUELA_SPLASH_PAUSED__) timeline.play(0);
  }

  try {
    window.kamuelaSplashAbort = () => finish();
    splash.setAttribute('aria-hidden', 'false');
    inertState.forEach(([element]) => { element.inert = true; });
    skip.addEventListener('click', onSkip);
    window.addEventListener('pagehide', onPageHide);
    logoFinal.addEventListener('error', () => finish(), { once: true });

    Promise.all([
      loadImage('./assets/logo-white.png'),
      fetch('./assets/kamuela-logo-network.json').then(response => {
        if (!response.ok) throw new Error('Logo writing network failed to load');
        return response.json();
      }),
    ]).then(([image, network]) => {
      logoImage = image;
      logoNetwork = network;
      logoArtContext.drawImage(logoImage, 0, 0, logoArt.width, logoArt.height);
      buildTimeline();
    }).catch(() => finish());
  } catch (_) {
    finish();
  }
})();
