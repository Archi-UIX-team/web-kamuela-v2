(() => {
  'use strict';
  const root = document.querySelector('.villa-showcase');
  if (!root) return;
  const gallery = root.querySelector('.villa-gallery');
  const panels = [...root.querySelectorAll('.villa-panel')];
  const dots = [...root.querySelectorAll('[data-dot]')];
  let selected = 1;
  let preview = null;
  let pointerStart = null;
  let suppressClick = false;

  function render() {
    const active = preview ?? selected;
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === active);
      panel.setAttribute('aria-pressed', String(i === selected));
      panel.querySelector('a').tabIndex = i === active ? 0 : -1;
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === selected)));
  }
  function select(index) {
    selected = (index + panels.length) % panels.length;
    preview = null;
    render();
  }
  panels.forEach((panel, i) => {
    panel.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') { preview = i; render(); }
    });
    panel.addEventListener('focusin', () => { preview = i; render(); });
    panel.addEventListener('click', e => {
      if (e.target.closest('a') || suppressClick) return;
      select(i);
    });
    panel.addEventListener('keydown', e => {
      if (e.target !== panel) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
    });
    panel.addEventListener('focusout', e => {
      if (!panel.contains(e.relatedTarget)) { preview = null; render(); }
    });
  });
  gallery.addEventListener('pointerleave', () => { preview = null; render(); });
  gallery.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    select(selected + (e.key === 'ArrowRight' ? 1 : -1));
    panels[selected].focus({ preventScroll: true });
  });
  gallery.addEventListener('pointerdown', e => { pointerStart = { x: e.clientX, y: e.clientY }; suppressClick = false; });
  gallery.addEventListener('pointerup', e => {
    if (!pointerStart) return;
    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick = true;
      select(selected + (dx < 0 ? 1 : -1));
      setTimeout(() => { suppressClick = false; }, 0);
    }
  });
  gallery.addEventListener('pointercancel', () => { pointerStart = null; });
  dots.forEach((dot, i) => dot.addEventListener('click', () => select(i)));
  root.querySelector('.scene-prev').addEventListener('click', () => select(selected - 1));
  root.querySelector('.scene-next').addEventListener('click', () => select(selected + 1));
  render();
})();

