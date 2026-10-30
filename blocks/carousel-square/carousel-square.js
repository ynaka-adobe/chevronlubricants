/**
 * Carousel-Square: centre-mode strip of square tiles. The active tile sits in the
 * middle (full size); neighbours step down (0.9, 0.8) on both sides in circular order.
 * The active slide's caption (person name) is shown below the strip.
 * No auto-rotation (the source does not auto-rotate).
 *
 * Authoring: 1 row per slide
 *   cell 1: image (optionally linked)
 *   cell 2: linked title paragraph, then an optional caption paragraph
 * Without any caption (or with the `side-by-side` variant) the strip shows equal,
 * unscaled tiles side by side, as the source "square-sidebyside" carousel does.
 *
 * Accessibility (APG carousel pattern): region + aria-roledescription="carousel";
 * slides are div[role=group][aria-roledescription=slide] (a ul/li with role=group
 * breaks list semantics); off-centre slides are aria-hidden and their links leave
 * the tab order; arrows and dots are labelled buttons with >= 24px targets.
 */

let carouselCount = 0;

function createArrow(dir, label, controls) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `carousel-square-${dir}`;
  btn.setAttribute('aria-label', label);
  btn.setAttribute('aria-controls', controls);
  const glyph = document.createElement('span');
  glyph.setAttribute('aria-hidden', 'true');
  glyph.textContent = dir === 'prev' ? '<' : '>';
  btn.append(glyph);
  return btn;
}

function buildSlide(row, index, total) {
  const slide = document.createElement('div');
  slide.className = 'carousel-square-slide';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  const [mediaCell, textCell] = [...row.children];
  const tile = document.createElement('div');
  tile.className = 'carousel-square-tile';
  if (mediaCell) {
    mediaCell.className = 'carousel-square-image';
    tile.append(mediaCell);
  }

  let caption = '';
  if (textCell) {
    textCell.className = 'carousel-square-body';
    /* the global button decoration does not apply to the tile's title link */
    textCell.querySelectorAll('a').forEach((a) => a.classList.remove('btn', 'btn-primary', 'btn-secondary'));
    const paras = [...textCell.children].filter((el) => el.textContent.trim());
    const title = paras.find((p) => p.matches('a') || p.querySelector('a')) || paras[0];
    if (title) {
      title.classList.add('carousel-square-title');
      title.classList.remove('btn-group');
    }
    const captionEl = paras.find((p) => p !== title);
    if (captionEl) {
      caption = captionEl.textContent.trim();
      captionEl.remove();
    }
    tile.append(textCell);
  }

  /* image link duplicates the title link: keep one tab stop per tile */
  const imageLink = mediaCell?.querySelector('a[href]');
  const titleLink = textCell?.matches('a[href]') ? textCell : textCell?.querySelector('a[href]');
  if (imageLink && titleLink && imageLink.href === titleLink.href) {
    imageLink.dataset.duplicate = 'true';
    imageLink.tabIndex = -1;
    imageLink.setAttribute('aria-hidden', 'true');
  }

  /* video tiles (YouTube / Vimeo / mp4 links) get a play-button overlay */
  const videoLink = tile.querySelector('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"], a[href$=".mp4"]');
  if (videoLink) slide.classList.add('is-video');

  const label = textCell?.textContent.trim();
  slide.setAttribute('aria-label', label ? `${index + 1} of ${total}: ${label}` : `${index + 1} of ${total}`);
  slide.dataset.caption = caption;
  slide.append(tile);
  return slide;
}

export default function decorate(block) {
  carouselCount += 1;
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const trackId = `carousel-square-${carouselCount}-slides`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.hasAttribute('aria-label')) {
    /* name the region after the heading directly above the block, if any */
    const isHeading = (el) => el?.matches('h1, h2, h3, h4');
    const prev = block.previousElementSibling || block.parentElement?.previousElementSibling;
    const heading = [prev, prev?.lastElementChild].find(isHeading);
    block.setAttribute('aria-label', heading?.textContent.trim() || 'Featured carousel');
  }

  const stage = document.createElement('div');
  stage.className = 'carousel-square-stage';
  const viewport = document.createElement('div');
  viewport.className = 'carousel-square-viewport';
  const track = document.createElement('div');
  track.className = 'carousel-square-slides';
  track.id = trackId;
  rows.forEach((row, i) => track.append(buildSlide(row, i, rows.length)));
  block.textContent = '';
  viewport.append(track);
  stage.append(viewport);
  block.append(stage);

  const slides = [...track.children];
  const caption = document.createElement('p');
  caption.className = 'carousel-square-caption';
  caption.setAttribute('aria-live', 'polite');
  const hasCaptions = slides.some((s) => s.dataset.caption);
  /* without captions the source uses its side-by-side strip (equal tiles, no scaling) */
  if (!hasCaptions) block.classList.add('side-by-side');

  const total = slides.length;
  const half = Math.floor(total / 2);
  let active = 0;
  let dotButtons = [];

  const setActive = (index) => {
    active = (index + total) % total;
    slides.forEach((slide, i) => {
      /* circular offset from the active slide: -half .. +half */
      let pos = i - active;
      if (pos > half) pos -= total;
      if (pos < -half) pos += total;
      const dist = Math.abs(pos);
      slide.style.setProperty('--pos', pos);
      slide.classList.toggle('is-center', dist === 0);
      slide.classList.toggle('is-adjacent', dist === 1);
      slide.classList.toggle('is-distant', dist === 2);
      slide.classList.toggle('is-hidden', dist > 2);
      /* side tiles stay clickable (click centres them) but leave the a11y tree */
      if (dist === 0) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
      slide.querySelectorAll('a[href]').forEach((a) => {
        if (dist === 0 && !a.dataset.duplicate) a.removeAttribute('tabindex');
        else a.tabIndex = -1;
      });
    });
    dotButtons.forEach((dot, i) => {
      if (i === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (hasCaptions) caption.textContent = slides[active].dataset.caption || '';
  };

  if (total > 1) {
    const prev = createArrow('prev', 'Previous slide', trackId);
    const next = createArrow('next', 'Next slide', trackId);
    stage.append(prev, next);
    prev.addEventListener('click', () => setActive(active - 1));
    next.addEventListener('click', () => setActive(active + 1));

    block.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (!e.target.closest('button')) return;
      e.preventDefault();
      setActive(active + (e.key === 'ArrowRight' ? 1 : -1));
      if (e.target.classList.contains('carousel-square-dot')) dotButtons[active].focus();
    });

    /* swipe (touch / pen / mouse drag) */
    let startX = null;
    let swiped = false;
    track.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      swiped = false;
    });
    track.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) {
        swiped = true;
        setActive(active + (dx < 0 ? 1 : -1));
      }
    });
    track.addEventListener('pointercancel', () => { startX = null; });
    /* a swipe must not follow the link it started on */
    track.addEventListener('click', (e) => {
      if (!swiped) return;
      swiped = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());

    /* a click on a side tile brings it to the centre */
    track.addEventListener('click', (e) => {
      const slide = e.target.closest('.carousel-square-slide');
      const i = slides.indexOf(slide);
      if (i < 0 || i === active) return;
      e.preventDefault();
      setActive(i);
    });
  } else {
    block.classList.add('is-single');
  }

  if (hasCaptions) block.append(caption);

  if (total > 1) {
    const dots = document.createElement('div');
    dots.className = 'carousel-square-dots';
    dotButtons = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-square-dot';
      dot.setAttribute('aria-label', `Show slide ${i + 1} of ${total}`);
      dot.setAttribute('aria-controls', trackId);
      dot.addEventListener('click', () => setActive(i));
      dots.append(dot);
      return dot;
    });
    block.append(dots);
  }

  setActive(0);
}
