(() => {
  'use strict';
  const gallery = document.querySelector('.offer-gallery');
  if (!gallery) return;
  const cards = [...gallery.querySelectorAll('[data-offer]')];
  const previous = document.querySelector('[data-offer-prev]');
  const next = document.querySelector('[data-offer-next]');
  const activeLabel = document.querySelector('[data-offer-active-label]');
  const activeTitle = document.querySelector('[data-offer-active-title]');
  const activeLink = document.querySelector('[data-offer-active-link]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 2;
  let pointerStart = null;
  let timer = 0;

  const positionClasses = ['is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next'];
  function render() {
    cards.forEach((card, index) => {
      card.classList.remove(...positionClasses);
      const difference = (index - active + cards.length) % cards.length;
      const position = difference === 0 ? 'is-active'
        : difference === 1 ? 'is-next'
        : difference === 2 ? 'is-far-next'
        : difference === cards.length - 1 ? 'is-prev'
        : 'is-far-prev';
      card.classList.add(position);
      const selected = difference === 0;
      card.setAttribute('aria-current', selected ? 'true' : 'false');
      const link = card.querySelector('a');
      link.tabIndex = selected ? 0 : -1;
    });
    const current = cards[active];
    const currentLabel = current.querySelector('.offer-label');
    const currentTitle = current.querySelector('h3');
    const currentLink = current.querySelector('a');
    activeLabel.textContent = currentLabel.textContent;
    activeTitle.innerHTML = currentTitle.innerHTML;
    activeLink.href = currentLink.href;
    activeLink.setAttribute('aria-label', `Detail offer: ${currentTitle.textContent.trim()}`);
    activeLabel.parentElement.classList.remove('is-changing');
    requestAnimationFrame(() => activeLabel.parentElement.classList.add('is-changing'));
  }
  function select(index, restart = true) {
    active = (index + cards.length) % cards.length;
    render();
    if (restart) startAutoplay();
  }
  function startAutoplay() {
    clearInterval(timer);
    if (reducedMotion.matches) return;
    timer = setInterval(() => select(active + 1, false), 6000);
  }
  cards.forEach((card, index) => card.addEventListener('click', event => {
    if (index === active) return;
    event.preventDefault();
    select(index);
  }));
  if (previous) previous.addEventListener('click', () => select(active - 1));
  if (next) next.addEventListener('click', () => select(active + 1));
  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    select(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  gallery.addEventListener('pointerdown', event => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  gallery.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) select(active + (dx < 0 ? 1 : -1));
  });
  gallery.addEventListener('pointercancel', () => { pointerStart = null; });
  gallery.addEventListener('mouseenter', () => clearInterval(timer));
  gallery.addEventListener('mouseleave', startAutoplay);
  gallery.addEventListener('focusin', () => clearInterval(timer));
  gallery.addEventListener('focusout', event => {
    if (!gallery.contains(event.relatedTarget)) startAutoplay();
  });
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : startAutoplay());
  reducedMotion.addEventListener('change', startAutoplay);
  render();
  startAutoplay();
})();

