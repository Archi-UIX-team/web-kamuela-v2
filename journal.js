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

  // A small lerp keeps pointer motion calm; clamping prevents the cursor leaving the photo.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = feature.querySelector('.journal-glass-cursor');
    let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;
    const move = () => {
      x += (targetX - x) * .28;
      y += (targetY - y) * .28;
      feature.style.setProperty('--journal-x', x.toFixed(1) + 'px');
      feature.style.setProperty('--journal-y', y.toFixed(1) + 'px');
      if (Math.abs(x - targetX) > .35 || Math.abs(y - targetY) > .35) frame = requestAnimationFrame(move);
      else frame = 0;
    };
    feature.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      const rect = feature.getBoundingClientRect();
      x = targetX = Math.max(54, Math.min(rect.width - 54, event.clientX - rect.left));
      y = targetY = Math.max(54, Math.min(rect.height - 54, event.clientY - rect.top));
      feature.style.setProperty('--journal-x', x + 'px');
      feature.style.setProperty('--journal-y', y + 'px');
      feature.classList.add('is-hovering');
    });
    feature.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const rect = feature.getBoundingClientRect();
      const pad = Math.min(54, rect.width / 2, rect.height / 2);
      targetX = Math.max(pad, Math.min(rect.width - pad, event.clientX - rect.left));
      targetY = Math.max(pad, Math.min(rect.height - pad, event.clientY - rect.top));
      if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(move);
      if (reducedMotion.matches) {
        cursor.style.left = targetX + 'px';
        cursor.style.top = targetY + 'px';
      }
    });
    feature.addEventListener('pointerleave', () => {
      feature.classList.remove('is-hovering');
      cancelAnimationFrame(frame);
      frame = 0;
    });
  }
})();

