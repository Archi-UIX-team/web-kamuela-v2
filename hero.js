(() => {
  'use strict';
  const root = document.querySelector('.villa-showcase');
  const gallery = root.querySelector('.villa-gallery');
  const cards = [...root.querySelectorAll('[data-scene]')];
  const dots = [...root.querySelectorAll('[data-dot]')];
  const villas = [
    {
      place: 'UBUD · BALI',
      title: 'Royal Kamuela Villas & Suites at Monkey Forest Ubud',
      description: "The luxury of privacy, surrounded by Ubud's serene sanctuary.",
      meta: ['VILLAS & SUITES', 'ADULT ONLY'],
      url: 'https://www.kamuelavillas.com/en/villa/view/3/royal-kamuela-villas-suites-at-monkey-forest-ubud-adult-only'
    },
    {
      place: 'LAGOI BAY · BINTAN',
      title: 'Kamuela Villas Lagoi Bay Bintan',
      description: 'A peaceful haven away from the noise and distractions of daily life.',
      meta: ['PRIVATE VILLAS', 'BINTAN'],
      url: 'https://www.kamuelavillas.com/en/villa/view/7/kamuela-villas-lagoi-bay-bintan'
    },
    {
      place: 'CANGGU · BALI',
      title: 'Seahaven by Kamuela',
      description: 'Experience serenity with a perfect private getaway.',
      meta: ['SEAHAVEN', 'CANGGU'],
      url: 'https://www.kamuelavillas.com/en/villa/view/8/seahaven-by-kamuela'
    }
  ];
  let active = 0;
  let pointerStart = null;
  let suppressClick = false;

  function select(index) {
    active = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      const position = (i - active + cards.length) % cards.length;
      card.classList.toggle('active', position === 0);
      card.classList.toggle('right', position === 1);
      card.classList.toggle('left', position === 2);
      card.setAttribute('aria-pressed', String(position === 0));
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
    const villa = villas[active];
    root.querySelector('.detail-count').textContent = '0' + (active + 1) + ' / 03';
    root.querySelector('.detail-location').textContent = villa.place;
    root.querySelector('.detail-title').textContent = villa.title;
    root.querySelector('.detail-description').textContent = villa.description;
    root.querySelector('.detail-meta').replaceChildren(...villa.meta.map(label => {
      const span = document.createElement('span');
      span.textContent = label;
      return span;
    }));
    root.querySelector('.detail-link').href = villa.url;
  }

  cards.forEach((card, i) => card.addEventListener('click', () => { if (!suppressClick) select(i); }));
  dots.forEach((dot, i) => dot.addEventListener('click', () => select(i)));
  root.querySelector('.scene-prev').addEventListener('click', () => select(active - 1));
  root.querySelector('.scene-next').addEventListener('click', () => select(active + 1));
  gallery.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    select(active + (e.key === 'ArrowRight' ? 1 : -1));
    cards[active].focus({ preventScroll: true });
  });
  gallery.addEventListener('pointerdown', e => { pointerStart = { x: e.clientX, y: e.clientY }; suppressClick = false; });
  gallery.addEventListener('pointerup', e => {
    if (!pointerStart) return;
    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick = true;
      select(active + (dx < 0 ? 1 : -1));
      setTimeout(() => { suppressClick = false; }, 0);
    }
  });
  gallery.addEventListener('pointercancel', () => { pointerStart = null; });
  select(0);
})();
