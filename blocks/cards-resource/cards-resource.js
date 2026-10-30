/**
 * Cards-Resource: image-top resource tiles (download, video, case study) in a
 * wrapping 1-4 column grid. CTA (button or text link) sits at the bottom.
 *
 * Authoring: 1 row per card
 *   cell 1: image (optionally linked: YouTube watch URL, case-study page, PDF)
 *   cell 2: optional bold title / name, text, CTA link last
 * Options (block classes):
 *   blue-caption - sky-blue caption panel, white text
 *   unboxed      - customer grid: no tile shadow, blue name + bold company line
 *                  (auto when every card image is linked)
 *   logo-list    - retailer rows: logo | text | button on a grey panel
 *                  (auto when every card CTA reads "Visit")
 * Cards whose CTA is a download (PDF link or "Download ..." text) render as centred
 * tiles with a button CTA; other CTAs render as text links.
 * Tip: append #_dnb to a YouTube link so it stays a link instead of an inline embed.
 */

const BTN_CLASSES = ['btn', 'btn-primary', 'btn-secondary', 'btn-outline', 'btn-accent', 'btn-negative'];

function columnCount(count) {
  if (count <= 4) return count;
  return count % 4 === 0 ? 4 : 3;
}

function isDownload(link) {
  if (!link) return false;
  const path = (link.getAttribute('href') || '').split(/[?#]/)[0];
  return /\.pdf$/i.test(path) || /^download\b/i.test(link.textContent.trim());
}

function decorateBody(body) {
  const items = [...body.children].filter((el) => el.textContent.trim() || el.querySelector('picture, img'));
  [...body.children].forEach((el) => { if (!items.includes(el)) el.remove(); });

  /* bold-only first paragraph (or a heading) is the tile title */
  const first = items[0];
  const isBoldOnly = (el) => el.tagName === 'P'
    && el.children.length === 1
    && /^(STRONG|B)$/.test(el.firstElementChild.tagName)
    && el.textContent.trim() === el.firstElementChild.textContent.trim()
    && !el.querySelector('a');
  if (first && (/^H[1-6]$/.test(first.tagName) || isBoldOnly(first))) {
    first.classList.add('cards-resource-title');
  }

  /* links: drop auto-decorated button classes; the block decides the CTA look */
  body.querySelectorAll('a').forEach((a) => {
    a.classList.remove(...BTN_CLASSES);
    a.classList.add('cards-resource-link');
  });
  body.querySelectorAll('.btn-group').forEach((el) => el.classList.remove('btn-group'));

  /* CTA: last paragraph that holds only a link */
  const last = items[items.length - 1];
  if (last && last !== first && last.querySelector('a[href]')
    && last.textContent.trim() === [...last.querySelectorAll('a')].map((a) => a.textContent).join('').trim()) {
    last.classList.add('cards-resource-cta');
    return last.querySelector('a[href]');
  }
  return null;
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'cards-resource-list';
  const ctas = [];
  let linkedImages = 0;

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-resource-card';
    let cta = null;
    [...row.children].forEach((cell) => {
      const isImage = cell.querySelector('picture, img, .video') && !cell.textContent.trim();
      if (isImage && !li.querySelector('.cards-resource-image')) {
        cell.className = 'cards-resource-image';
        if (cell.querySelector('a picture, a img')) linkedImages += 1;
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-resource-body';
        cta = decorateBody(cell) || cta;
      } else {
        return;
      }
      li.append(cell);
    });
    if (!li.children.length) return;
    /* linked image with empty alt: name the link after the card title */
    const label = li.querySelector('.cards-resource-body')?.textContent.replace(/\s+/g, ' ').trim();
    li.querySelectorAll('.cards-resource-image a').forEach((a) => {
      const named = a.textContent.trim() || [...a.querySelectorAll('img')].some((img) => img.alt.trim());
      if (!named && label) a.setAttribute('aria-label', label);
    });
    ctas.push(cta);
    if (isDownload(cta) && !block.classList.contains('blue-caption')) {
      li.classList.add('cards-resource-download');
    }
    list.append(li);
  });

  const count = list.children.length;
  const hasLayoutOption = ['logo-list', 'unboxed', 'blue-caption'].some((c) => block.classList.contains(c));
  if (!hasLayoutOption && count) {
    if (ctas.every((a) => a && /^visit\b/i.test(a.textContent.trim()))) {
      block.classList.add('logo-list');
    } else if (linkedImages === count) {
      block.classList.add('unboxed');
    }
  }
  if (block.classList.contains('logo-list')) {
    list.querySelectorAll('.cards-resource-download').forEach((li) => li.classList.remove('cards-resource-download'));
  }

  block.classList.add(`cards-resource-cols-${columnCount(count)}`);
  block.textContent = '';
  block.append(list);
}
