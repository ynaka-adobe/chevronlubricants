/* Stats carousel: one statistic at a time (value in a progress ring + caption), with
   previous/next buttons and an "n of N" counter. Rows: [value | caption]. */

let instance = 0;

function percent(value) {
  const m = value.match(/^(\d+(?:\.\d+)?)\s*%$/);
  return m ? Math.min(100, Number(m[1])) : null;
}

function arrow(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `stats-carousel-${direction}`;
  button.setAttribute('aria-label', label);
  return button;
}

export default function init(block) {
  instance += 1;
  const id = `stats-carousel-${instance}`;
  const slides = [...block.querySelectorAll(':scope > div')].map((row, i, rows) => {
    const [valueCell, captionCell] = [...row.children];
    const value = valueCell?.textContent.trim() || '';
    const slide = document.createElement('li');
    slide.className = 'stats-carousel-slide';
    slide.id = `${id}-slide-${i + 1}`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} of ${rows.length}`);
    const ring = document.createElement('p');
    ring.className = 'stats-carousel-value';
    const pct = percent(value);
    if (pct !== null) ring.style.setProperty('--stats-value', `${pct}%`);
    ring.textContent = value;
    const caption = document.createElement('div');
    caption.className = 'stats-carousel-caption';
    if (captionCell) caption.append(...captionCell.childNodes);
    slide.append(ring, caption);
    return slide;
  });
  if (!slides.length) return;

  const track = document.createElement('ul');
  track.className = 'stats-carousel-slides';
  track.append(...slides);

  block.textContent = '';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.hasAttribute('aria-label')) block.setAttribute('aria-label', 'Statistics');
  block.append(track);
  if (slides.length < 2) return;

  const prev = arrow('prev', 'Previous statistic');
  const next = arrow('next', 'Next statistic');
  const counter = document.createElement('p');
  counter.className = 'stats-carousel-counter';
  counter.setAttribute('aria-live', 'polite');
  const nav = document.createElement('div');
  nav.className = 'stats-carousel-nav';
  nav.append(prev, counter, next);
  block.append(nav);

  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => { s.hidden = i !== current; });
    counter.innerHTML = `<strong>${current + 1}</strong> of ${slides.length}`;
  };
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  show(0);
}
