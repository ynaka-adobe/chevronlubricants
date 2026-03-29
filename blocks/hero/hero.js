function setBackgroundFocus(img) {
  const { title } = img.dataset;
  if (!title?.includes('data-focal')) return;
  delete img.dataset.title;
  const [x, y] = title.split(':')[1].split(',');
  img.style.objectPosition = `${x}% ${y}%`;
}

function decorateBackground(bg) {
  const bgPic = bg.querySelector('picture');
  if (!bgPic) return;

  const img = bgPic.querySelector('img');
  setBackgroundFocus(img);

  const vidLink = bgPic.closest('a[href*=".mp4"]');
  if (!vidLink) return;
  const video = document.createElement('video');
  video.src = vidLink.href;
  video.loop = true;
  video.muted = true;
  video.inert = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'none');
  video.load();
  video.addEventListener('canplay', () => {
    video.play();
    bgPic.remove();
  });
  vidLink.parentElement.append(video, bgPic);
  vidLink.remove();
}

function rowHasHeading(row) {
  return Boolean(row.querySelector('h1, h2, h3, h4, h5, h6'));
}

/** Second row is a full-width image strip (picture/img, no heading). */
function rowIsImageStrip(row) {
  if (!row.querySelector('picture, img')) return false;
  return !rowHasHeading(row);
}

function decorateForeground(fg) {
  const { children } = fg;
  const hero = fg.closest('.hero');
  for (const [idx, child] of [...children].entries()) {
    const heading = child.querySelector('h1, h2, h3, h4, h5, h6');
    const text = heading || child.querySelector('p, a, ul');
    if (heading) {
      heading.classList.add('hero-heading');
      const detail = heading.previousElementSibling;
      if (detail) {
        detail.classList.add('hero-detail');
      }
    }
    // Determine foreground column types
    if (text) {
      child.classList.add('fg-text');
      if (idx === 0) {
        hero.classList.add('hero-text-start');
      } else {
        hero.classList.add('hero-text-end');
      }
    }
  }
  // Center hero content (e.g. "Premium Chevron Lubricants" headline)
  hero.classList.add('center');
}

export default async function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];

  /* account-based: copy in row 1, full-bleed image in row 2 (default JS uses last row as foreground) */
  if (
    el.classList.contains('account-based')
    && rows.length === 2
    && rowHasHeading(rows[0])
    && rowIsImageStrip(rows[1])
  ) {
    const [fg, imageRow] = rows;
    fg.classList.add('hero-foreground');
    imageRow.classList.add('hero-image-row');
    el.classList.add('hero-image-below');
    decorateForeground(fg);
    decorateBackground(imageRow);
    return;
  }

  const fg = rows.pop();
  fg.classList.add('hero-foreground');
  decorateForeground(fg);
  if (rows.length) {
    const bg = rows.pop();
    bg.classList.add('hero-background');
    decorateBackground(bg);
  }
}
