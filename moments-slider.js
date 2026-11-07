(() => {
  'use strict';
  const gallery = document.querySelector('.moment-gallery');
  if (!gallery) return;
  const cards = [...gallery.querySelectorAll('[data-moment]')];
  let active = 2;
  let pointerStart = null;

  const positionClasses = ['is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next', 'is-hidden'];
  function render() {
    cards.forEach((card, index) => {
      card.classList.remove(...positionClasses);
      const difference = (index - active + cards.length) % cards.length;
      const position = difference === 0 ? 'is-active'
        : difference === 1 ? 'is-next'
        : difference === 2 ? 'is-far-next'
        : difference === cards.length - 1 ? 'is-prev'
        : difference === cards.length - 2 ? 'is-far-prev'
        : 'is-hidden';
      card.classList.add(position);
      const selected = difference === 0;
      card.setAttribute('aria-current', selected ? 'true' : 'false');
      const link = card.querySelector('a');
      link.tabIndex = selected ? 0 : -1;
      const embed = card.querySelector('iframe');
      embed.tabIndex = selected ? 0 : -1;
    });
  }
  function select(index) {
    active = (index + cards.length) % cards.length;
    render();
  }
  cards.forEach((card, index) => card.addEventListener('click', event => {
    if (index === active) return;
    event.preventDefault();
    select(index);
  }));
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
  render();
})();

