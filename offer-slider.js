(() => {
  'use strict';
  const root = document.querySelector('[data-offers-carousel]');
  if (!root) return;
  const viewport = root.querySelector('.offers-carousel-viewport');
  const track = root.querySelector('.offers-carousel-track');
  const cards = [...root.querySelectorAll('[data-offer-invitation]')];
  const previous = root.querySelector('[data-offers-prev]');
  const next = root.querySelector('[data-offers-next]');
  const dots = root.querySelector('[data-offers-dots]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let page = 0;
  let visible = 3;
  let pageCount = 1;
  let pointerStart = null;

  function visibleCount() {
    return innerWidth <= 700 ? 1 : innerWidth <= 1100 ? 2 : 3;
  }
  function buildDots() {
    dots.replaceChildren();
    for (let index = 0; index < pageCount; index += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'offers-dot';
      dot.setAttribute('aria-label', 'Show offer page ' + (index + 1));
      dot.addEventListener('click', () => { page = index; render(); });
      dots.append(dot);
    }
  }
  function render() {
    visible = visibleCount();
    pageCount = Math.ceil(cards.length / visible);
    page = Math.max(0, Math.min(page, pageCount - 1));
    const gap = innerWidth <= 700 ? 22 : innerWidth <= 1100 ? 30 : 40;
    const safeInline = innerWidth <= 700 ? 0 : 56;
    const usableWidth = Math.max(0, viewport.clientWidth - safeInline);
    const cardWidth = innerWidth <= 700 ? viewport.clientWidth * .86 : (usableWidth - gap * (visible - 1)) / visible;
    cards.forEach(card => { card.style.flexBasis = cardWidth + 'px'; });
    const offset = page * visible * (cardWidth + gap);
    track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
    if (dots.children.length !== pageCount) buildDots();
    [...dots.children].forEach((dot, index) => {
      dot.classList.toggle('is-active', index === page);
      dot.setAttribute('aria-current', index === page ? 'true' : 'false');
    });
    previous.disabled = page === 0;
    next.disabled = page === pageCount - 1;
    previous.hidden = next.hidden = dots.hidden = pageCount <= 1;
  }
  previous.addEventListener('click', () => { if (page > 0) { page -= 1; render(); } });
  next.addEventListener('click', () => { if (page < pageCount - 1) { page += 1; render(); } });
  root.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') previous.click();
    else next.click();
  });
  viewport.addEventListener('pointerdown', event => { pointerStart = { x: event.clientX, y: event.clientY }; });
  viewport.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : previous).click();
  });
  viewport.addEventListener('pointercancel', () => { pointerStart = null; });

  cards.forEach(card => {
    let frame = 0;
    let currentX = card.clientWidth / 2;
    let currentY = card.clientHeight * .42;
    let targetX = currentX;
    let targetY = currentY;
    const tick = () => {
      currentX += (targetX - currentX) * .18;
      currentY += (targetY - currentY) * .18;
      card.style.setProperty('--cursor-x', currentX + 'px');
      card.style.setProperty('--cursor-y', currentY + 'px');
      if (Math.abs(targetX-currentX) > .2 || Math.abs(targetY-currentY) > .2) frame = requestAnimationFrame(tick);
      else frame = 0;
    };
    card.addEventListener('pointermove', event => {
      if (matchMedia('(hover:none)').matches) return;
      const rect = card.getBoundingClientRect();
      targetX = Math.max(58, Math.min(rect.width - 58, event.clientX - rect.left));
      targetY = Math.max(58, Math.min(rect.height - 58, event.clientY - rect.top));
      if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(tick);
      if (reducedMotion.matches) {
        card.style.setProperty('--cursor-x', targetX + 'px');
        card.style.setProperty('--cursor-y', targetY + 'px');
      }
    });
  });
  const offersSection = root.closest('.offers-invitation-section');
  const transitionLeaf = offersSection?.querySelector(':scope > .kamuela-section-leaf');
  let leafFrame = 0;
  function updateTransitionLeaf() {
    leafFrame = 0;
    if (!transitionLeaf || !offersSection) return;
    if (reducedMotion.matches) {
      transitionLeaf.style.setProperty('--offer-leaf-x', '0px');
      transitionLeaf.style.setProperty('--offer-leaf-y', '0px');
      transitionLeaf.style.setProperty('--offer-leaf-rotate', '28deg');
      return;
    }
    const rect = offersSection.getBoundingClientRect();
    const travel = offersSection.offsetHeight + innerHeight * .72;
    const progress = Math.max(0, Math.min(1, (innerHeight * .9 - rect.top) / travel));
    transitionLeaf.style.setProperty('--offer-leaf-x', Math.min(innerWidth * .16, 230) * progress + 'px');
    transitionLeaf.style.setProperty('--offer-leaf-y', Math.min(innerHeight * .24, 230) * progress + 'px');
    transitionLeaf.style.setProperty('--offer-leaf-rotate', 28 + progress * 7 + 'deg');
  }
  function requestLeafUpdate() {
    if (!leafFrame) leafFrame = requestAnimationFrame(updateTransitionLeaf);
  }
  addEventListener('scroll', requestLeafUpdate, { passive: true });

  let resizeFrame = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { render(); updateTransitionLeaf(); });
  });
  render();
  updateTransitionLeaf();
})();