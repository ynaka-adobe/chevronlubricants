/**
 * Cards-Products: product cards in a horizontal carousel with prev/next
 * arrows and dots. Each row = one card:
 *   cell 1: [optional badge image] + product image
 *   cell 2: title (heading/strong link), "Learn More" link, button link, bullet list
 * @param {Element} block
 */

function decorateImageCell(cell) {
  cell.className = 'cards-products-card-image';
  const pics = [...cell.querySelectorAll('picture, img:not(picture img)')];
  if (pics.length > 1) {
    const badge = pics[0];
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'cards-products-badge';
    badgeWrap.append(badge);
    cell.prepend(badgeWrap);
  }
  const main = pics[pics.length - 1];
  if (main) {
    const mainWrap = document.createElement('div');
    mainWrap.className = 'cards-products-image';
    mainWrap.append(main);
    cell.append(mainWrap);
  }
  // drop now-empty paragraphs left behind
  [...cell.children].forEach((el) => {
    if (!el.classList.contains('cards-products-badge')
      && !el.classList.contains('cards-products-image')
      && !el.textContent.trim() && !el.querySelector('img')) el.remove();
  });
}

function decorateBodyCell(cell) {
  cell.className = 'cards-products-card-body';
  const title = cell.querySelector('h1, h2, h3, h4, h5, h6')
    || cell.querySelector('p > strong:only-child, p > b:only-child')?.parentElement;
  if (title) title.classList.add('cards-products-title');

  const actions = document.createElement('div');
  actions.className = 'cards-products-actions';
  const links = [...cell.querySelectorAll('a[href]')]
    .filter((a) => !title || !title.contains(a))
    .filter((a) => !a.closest('ul, ol'));
  links.forEach((a, i) => {
    const holder = a.closest('p, div:not(.cards-products-card-body)');
    a.classList.remove('btn', 'btn-outline', 'button');
    a.classList.add(i === links.length - 1 && links.length > 1
      ? 'cards-products-button' : 'cards-products-link');
    actions.append(a);
    if (holder && holder !== cell && !holder.textContent.trim()) holder.remove();
  });
  if (links.length) {
    if (title && title.parentElement === cell) title.after(actions);
    else cell.prepend(actions);
  }

  const list = cell.querySelector('ul');
  if (list) list.classList.add('cards-products-benefits');
}

const ARROW_PATHS = {
  prev: 'M0.826532 4.97493L4.24836 0.825191C4.53422 0.504709 4.98475 0.478671 5.27918 0.721185C5.58235 0.963696 5.6257 1.45757 5.38319 1.75201L2.94886 4.706L11.9277 4.706C12.3349 4.706 12.6641 5.03521 12.6641 5.44239C12.6641 5.84957 12.3349 6.17878 11.9277 6.17878L2.94886 6.17878L5.38319 9.13277C5.6257 9.43594 5.57376 9.92108 5.27918 10.1723C4.98461 10.4321 4.49087 10.3629 4.24836 10.0683L0.826532 5.91049C0.601336 5.5986 0.618647 5.2781 0.826532 4.97493Z',
  next: 'M12.1735 4.97493L8.75164 0.825191C8.46578 0.504709 8.01525 0.478671 7.72082 0.721185C7.41765 0.963696 7.3743 1.45757 7.61681 1.75201L10.0511 4.706L1.07233 4.706C0.665149 4.706 0.335938 5.03521 0.335938 5.44239C0.335938 5.84957 0.665149 6.17878 1.07233 6.17878L10.0511 6.17878L7.61681 9.13277C7.3743 9.43594 7.42624 9.92108 7.72082 10.1723C8.01539 10.4321 8.50913 10.3629 8.75164 10.0683L12.1735 5.91049C12.3987 5.5986 12.3814 5.2781 12.1735 4.97493Z',
};

function createArrow(dir, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `cards-products-${dir}`;
  btn.setAttribute('aria-label', label);
  btn.innerHTML = `<svg width="13" height="11" viewBox="0 0 13 11" aria-hidden="true" focusable="false"><path d="${ARROW_PATHS[dir]}"/></svg>`;
  return btn;
}

function buildCarousel(block, track) {
  const slides = [...track.children];
  const nav = document.createElement('div');
  nav.className = 'cards-products-nav';

  const prev = createArrow('prev', 'Previous products');
  const next = createArrow('next', 'Next products');

  const dots = document.createElement('div');
  dots.className = 'cards-products-dots';

  // one card per step (source carousel advances a single tile at a time)
  const step = () => {
    const first = slides[0];
    if (!first) return track.clientWidth || 1;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap || 1;
  };
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const positionCount = () => {
    const max = maxScroll();
    return max <= 2 ? 1 : Math.ceil((max - 2) / step()) + 1;
  };

  const goTo = (index) => {
    track.scrollTo({ left: Math.min(index * step(), maxScroll()), behavior: 'smooth' });
  };

  const renderDots = () => {
    const count = positionCount();
    if (dots.children.length === count) return;
    dots.textContent = '';
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'cards-products-dot';
      dot.setAttribute('aria-label', `Show product ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dots.append(dot);
    }
  };

  const update = () => {
    renderDots();
    const max = maxScroll();
    const { scrollLeft } = track;
    const active = scrollLeft >= max - 2
      ? positionCount() - 1
      : Math.round(scrollLeft / step());
    [...dots.children].forEach((dot, i) => {
      const on = i === active;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-current', on ? 'true' : 'false');
    });
    prev.disabled = scrollLeft <= 2;
    next.disabled = scrollLeft >= max - 2;
    nav.hidden = max <= 2;
  };

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(track);

  nav.append(prev, dots, next);
  block.append(nav);
  update();
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'cards-products-track';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-products-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => {
      if (cell.querySelector('picture, img') && !cell.querySelector('h1, h2, h3, h4, h5, h6, ul')) {
        decorateImageCell(cell);
      } else {
        decorateBodyCell(cell);
      }
    });
    track.append(li);
  });

  block.textContent = '';
  block.append(track);
  buildCarousel(block, track);
}
