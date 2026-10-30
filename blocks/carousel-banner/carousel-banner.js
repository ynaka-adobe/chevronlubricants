/**
 * Carousel-Banner: full-width banner slider (one slide visible) with round
 * edge arrows and dots. No auto-rotation (the source does not auto-rotate).
 *
 * Authoring: 1 row per slide
 *   cell 1: (linked) banner image; an optional second image is the mobile crop
 *   cell 2: optional text (heading, description, CTA); empty for image-only banners
 *
 * Accessibility (APG carousel pattern): region + aria-roledescription="carousel";
 * slides are div[role=group][aria-roledescription=slide] in a div track (a ul/li with
 * role=group breaks list semantics); off-screen slides are aria-hidden and their links
 * leave the tab order; arrows and dots are labelled buttons with >= 24px targets.
 */

/* thin stroked "<" / ">" glyphs, matching the source's text arrows */
const ARROW = {
  prev: 'M15 6 7 12l8 6',
  next: 'm9 6 8 6-8 6',
};

let carouselCount = 0;

function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function createArrow(dir, label, controls) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `carousel-banner-${dir}`;
  btn.setAttribute('aria-label', label);
  btn.setAttribute('aria-controls', controls);
  btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ARROW[dir]}"/></svg>`;
  return btn;
}

function buildSlide(row, index, total) {
  const slide = document.createElement('div');
  slide.className = 'carousel-banner-slide';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of ${total}`);

  const [mediaCell, textCell] = [...row.children];
  if (mediaCell) {
    mediaCell.className = 'carousel-banner-slide-image';
    const pictures = [...mediaCell.querySelectorAll('picture')];
    if (pictures.length > 1) {
      /* second image is the mobile crop: shown below 768px instead of the first */
      mediaCell.classList.add('has-mobile');
      pictures[0].classList.add('carousel-banner-desktop');
      pictures[1].classList.add('carousel-banner-mobile');
      /* both crops sit in one link when the author linked only one of them */
      const link = mediaCell.querySelector('a[href]');
      if (link && !link.contains(pictures[1])) link.append(pictures[1]);
      if (link && !link.contains(pictures[0])) link.prepend(pictures[0]);
    }
    slide.append(mediaCell);
  }
  if (textCell && textCell.textContent.trim()) {
    textCell.className = 'carousel-banner-slide-content';
    slide.append(textCell);
  }
  return slide;
}

export default function decorate(block) {
  carouselCount += 1;
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const trackId = `carousel-banner-${carouselCount}-slides`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'Banner carousel');

  const viewport = document.createElement('div');
  viewport.className = 'carousel-banner-viewport';
  const track = document.createElement('div');
  track.className = 'carousel-banner-slides';
  track.id = trackId;
  rows.forEach((row, i) => track.append(buildSlide(row, i, rows.length)));
  block.textContent = '';
  viewport.append(track);
  block.append(viewport);

  const slides = [...track.children];
  if (slides.length < 2) {
    block.classList.add('is-single');
    return;
  }

  const prev = createArrow('prev', 'Previous slide', trackId);
  const next = createArrow('next', 'Next slide', trackId);
  viewport.append(prev, next);

  const dots = document.createElement('div');
  dots.className = 'carousel-banner-dots';
  const dotButtons = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-banner-dot';
    dot.setAttribute('aria-label', `Show slide ${i + 1} of ${slides.length}`);
    dot.setAttribute('aria-controls', trackId);
    dots.append(dot);
    return dot;
  });
  block.append(dots);

  let active = 0;
  const setActive = (index) => {
    active = index;
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle('is-active', on);
      if (on) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
      slide.querySelectorAll('a[href], button, input, select, textarea, [tabindex]').forEach((el) => {
        if (on) el.removeAttribute('tabindex');
        else el.tabIndex = -1;
      });
    });
    dotButtons.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const goTo = (index) => {
    const target = (index + slides.length) % slides.length;
    track.scrollTo({ left: slides[target].offsetLeft, behavior: scrollBehavior() });
    setActive(target);
  };

  prev.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  dotButtons.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  /* keep the active state in sync with touch/trackpad swipes */
  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const index = Math.round(track.scrollLeft / (track.clientWidth || 1));
      if (index !== active && slides[index]) setActive(index);
    });
  }, { passive: true });

  setActive(0);
}
