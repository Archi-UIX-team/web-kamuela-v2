// The button carrying the article data is the single source of truth for the image and link.
(() => {
  const section = document.querySelector('#news');
  if (!section) return;
  const feature = section.querySelector('.journal-feature');
  const items = [...section.querySelectorAll('.journal-item')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let imageRequest = 0;
  let currentImage = feature.querySelector('.journal-feature-image');

  function showImage(item) {
    const request = ++imageRequest;
    const image = new Image();
    image.className = 'journal-feature-image is-entering';
    image.alt = item.dataset.alt;
    image.decoding = 'async';
    image.onload = () => {
      if (request !== imageRequest) return;
      if (reducedMotion.matches) {
        currentImage.replaceWith(image);
        image.classList.remove('is-entering');
        image.classList.add('is-current');
        currentImage = image;
        return;
      }
      feature.insertBefore(image, feature.firstChild);
      const previous = currentImage;
      currentImage = image;
      // Timer also advances a background tab, where animation frames can be throttled.
      setTimeout(() => {
        if (request !== imageRequest) return;
        image.classList.remove('is-entering');
        image.classList.add('is-current');
        previous.classList.add('is-leaving');
        setTimeout(() => previous.remove(), 850);
      }, 35);
    };
    image.onerror = () => {
      // Never show a broken photograph; fall back to the corresponding Kamuela property image.
      if (request !== imageRequest) return;
      const fallback = item.dataset.id === 'seahaven'
        ? 'https://images.archipelagohotels.com/kamuelavillas/Images/v1/BrandPages/Homepage/homeabout-top.jpg?d=1500x1050'
        : 'https://images.archipelagohotels.com/kamuelavillas/Images/v1/BrandPages/Homepage/RKU.jpg?d=1500x1050';
      if (image.src !== fallback) image.src = fallback;
    };
    image.src = item.dataset.image;
  }

  items.forEach(item => item.addEventListener('click', () => {
    if (item.classList.contains('is-active')) return;
    items.forEach(other => {
      const selected = other === item;
      other.classList.toggle('is-active', selected);
      other.setAttribute('aria-pressed', String(selected));
    });
    feature.href = item.dataset.url;
    feature.setAttribute('aria-label', 'Read article: ' + item.querySelector('.journal-item-title').textContent.trim());
    showImage(item);
  }));

  // One calm glass cursor follows the pointer over both the photograph and news text.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const showcase = section.querySelector('.journal-showcase');
    const cursor = feature.querySelector('.journal-glass-cursor');
    showcase.append(cursor);
    const hoverTargets = [feature, ...items];
    let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;
    const move = () => {
      x += (targetX - x) * .28;
      y += (targetY - y) * .28;
      showcase.style.setProperty('--journal-x', x.toFixed(1) + 'px');
      showcase.style.setProperty('--journal-y', y.toFixed(1) + 'px');
      if (Math.abs(x - targetX) > .35 || Math.abs(y - targetY) > .35) frame = requestAnimationFrame(move);
      else frame = 0;
    };
    const setTarget = event => {
      if (event.pointerType !== 'mouse') return;
      const rect = showcase.getBoundingClientRect();
      const pad = Math.min(54, rect.width / 2, rect.height / 2);
      targetX = Math.max(pad, Math.min(rect.width - pad, event.clientX - rect.left));
      targetY = Math.max(pad, Math.min(rect.height - pad, event.clientY - rect.top));
      if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(move);
      if (reducedMotion.matches) {
        x = targetX; y = targetY;
        showcase.style.setProperty('--journal-x', x + 'px');
        showcase.style.setProperty('--journal-y', y + 'px');
      }
    };
    hoverTargets.forEach(target => {
      target.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse') return;
        const rect = showcase.getBoundingClientRect();
        x = targetX = Math.max(54, Math.min(rect.width - 54, event.clientX - rect.left));
        y = targetY = Math.max(54, Math.min(rect.height - 54, event.clientY - rect.top));
        showcase.style.setProperty('--journal-x', x + 'px');
        showcase.style.setProperty('--journal-y', y + 'px');
        showcase.classList.add('is-cursor-visible');
      });
      target.addEventListener('pointermove', setTarget);
      target.addEventListener('pointerleave', event => {
        if (showcase.contains(event.relatedTarget)) return;
        showcase.classList.remove('is-cursor-visible');
        cancelAnimationFrame(frame);
        frame = 0;
      });
    });
  }
})();

