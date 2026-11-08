(() => {
  const stage = document.querySelector('[data-membership-stage]');
  const device = stage?.querySelector('[data-membership-device]');
  const toggle = stage?.querySelector('[data-membership-motion]');
  if (!stage || !device || !toggle) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reducedMotion.matches;
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let nudgeTimer;

  const setPose = (rx = 0, ry = 0, x = 0, y = 0) => {
    device.style.setProperty('--device-rx', `${rx}deg`);
    device.style.setProperty('--device-ry', `${ry}deg`);
    device.style.setProperty('--device-x', `${x}px`);
    device.style.setProperty('--device-y', `${y}px`);
  };

  const resetPose = () => {
    currentX = 0;
    currentY = 0;
    setPose();
  };

  const updateToggle = () => {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.lastChild.textContent = enabled ? 'Motion on' : 'Motion off';
    if (!enabled) resetPose();
  };

  const wakeObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    stage.classList.add('is-awake');
    wakeObserver.disconnect();
  }, { threshold: .28 });
  wakeObserver.observe(stage);

  toggle.addEventListener('click', () => {
    enabled = !enabled && !reducedMotion.matches;
    updateToggle();
  });

  device.addEventListener('pointerenter', () => {
    if (enabled && !dragging) setPose(-2, 4, currentX, currentY);
  });
  device.addEventListener('pointermove', (event) => {
    if (!enabled) return;
    const bounds = device.getBoundingClientRect();
    if (dragging) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      moved ||= Math.abs(dx) + Math.abs(dy) > 7;
      currentX = Math.max(-54, Math.min(54, dx));
      currentY = Math.max(-34, Math.min(34, dy));
      setPose(-currentY / 7, currentX / 7, currentX, currentY);
      return;
    }
    const px = (event.clientX - bounds.left) / bounds.width - .5;
    const py = (event.clientY - bounds.top) / bounds.height - .5;
    setPose(-py * 8, px * 10, currentX, currentY);
  });
  device.addEventListener('pointerleave', () => {
    if (enabled && !dragging) resetPose();
  });
  device.addEventListener('pointerdown', (event) => {
    if (!enabled) return;
    dragging = true;
    moved = false;
    startX = event.clientX - currentX;
    startY = event.clientY - currentY;
    device.classList.add('is-dragging');
    device.setPointerCapture(event.pointerId);
  });
  device.addEventListener('pointerup', (event) => {
    if (!enabled || !dragging) return;
    dragging = false;
    device.classList.remove('is-dragging');
    device.releasePointerCapture(event.pointerId);
    if (!moved) {
      const bounds = device.getBoundingClientRect();
      const direction = event.clientX < bounds.left + bounds.width / 2 ? -1 : 1;
      clearTimeout(nudgeTimer);
      setPose(0, direction * 8, direction * 18, 0);
      nudgeTimer = setTimeout(resetPose, 360);
    } else {
      resetPose();
    }
  });
  device.addEventListener('pointercancel', () => {
    dragging = false;
    device.classList.remove('is-dragging');
    resetPose();
  });
  device.addEventListener('keydown', (event) => {
    if (!enabled || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    clearTimeout(nudgeTimer);
    setPose(0, direction * 8, direction * 18, 0);
    nudgeTimer = setTimeout(resetPose, 360);
  });

  updateToggle();
})();
