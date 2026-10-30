/**
 * Accordion-Drawer: image-header drawer. The header shows a full-width photo with a
 * slanted light-grey wedge along its bottom edge and the title centred on it; the
 * round +/- toggle sits at the foot of the drawer (below the panel when open).
 * The panel holds intro copy, then case-study tiles and/or standalone images.
 * Native <details>/<summary>.
 *
 * Authoring: 1 row per drawer
 *   cell 1: header photo + title text (paragraph, not a heading)
 *   cell 2: intro paragraph(s), then repeated case-study groups:
 *           image, bold title paragraph, link paragraph
 *           (an image with no title/link after it renders as a standalone image)
 */

const BUTTON_CLASSES = ['btn', 'btn-primary', 'btn-secondary', 'btn-accent', 'btn-negative', 'btn-outline'];

function buildHeader(cell) {
  const summary = document.createElement('summary');
  summary.className = 'accordion-drawer-header';

  const title = document.createElement('span');
  title.className = 'accordion-drawer-title';

  const picture = cell.querySelector('picture, img');
  if (picture) {
    const media = document.createElement('div');
    media.className = 'accordion-drawer-media';
    /* decorative: the title text names the drawer */
    if (picture.tagName === 'IMG') picture.alt = '';
    else picture.querySelectorAll('img').forEach((img) => { img.alt = ''; });
    const holder = picture.closest('p');
    media.append(picture);
    if (holder && !holder.textContent.trim() && !holder.querySelector('picture, img')) holder.remove();
    title.textContent = cell.textContent.trim();
    media.append(title);
    summary.append(media);
  } else {
    title.textContent = cell.textContent.trim();
    summary.append(title);
  }

  const icon = document.createElement('span');
  icon.className = 'accordion-drawer-icon';
  icon.setAttribute('aria-hidden', 'true');
  summary.append(icon);
  return summary;
}

function buildPanel(cell) {
  const panel = document.createElement('div');
  panel.className = 'accordion-drawer-panel';

  const intro = document.createElement('div');
  intro.className = 'accordion-drawer-intro';
  const groups = [];

  let current = null;
  [...cell.children].forEach((el) => {
    const hasMedia = el.matches('picture, img') || el.querySelector('picture, img');
    if (!el.textContent.trim() && !hasMedia) return;
    if (hasMedia) {
      current = document.createElement('li');
      current.className = 'accordion-drawer-item';
      el.classList.add('accordion-drawer-item-image');
      current.append(el);
      groups.push(current);
      return;
    }
    if (!current) {
      intro.append(el);
      return;
    }
    const link = el.querySelector('a[href]');
    if (link) {
      el.classList.add('accordion-drawer-item-link');
      /* plain text links in the source, not buttons */
      el.querySelectorAll('a').forEach((a) => a.classList.remove(...BUTTON_CLASSES));
      el.classList.remove('btn-group');
    } else if (el.querySelector('strong, b') || /^H[1-6]$/.test(el.tagName)) {
      el.classList.add('accordion-drawer-item-title');
    }
    current.append(el);
  });

  if (intro.children.length) panel.append(intro);

  /* an image with nothing after it is panel content, not a case-study tile */
  const tiles = groups.filter((li) => li.children.length > 1);
  groups.filter((li) => li.children.length === 1).forEach((li) => {
    const media = li.firstElementChild;
    media.classList.replace('accordion-drawer-item-image', 'accordion-drawer-panel-image');
    panel.append(media);
  });

  if (tiles.length) {
    const list = document.createElement('ul');
    list.className = `accordion-drawer-items accordion-drawer-items-${Math.min(tiles.length, 4)}`;
    list.append(...tiles);
    panel.append(list);
  }
  return panel;
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [headCell, bodyCell] = [...row.children];
    if (!headCell) return;
    const details = document.createElement('details');
    details.className = 'accordion-drawer-details';
    details.append(buildHeader(headCell));
    if (bodyCell) details.append(buildPanel(bodyCell));
    row.replaceWith(details);
  });
}
