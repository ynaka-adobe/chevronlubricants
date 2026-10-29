/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-promo (base: columns)
 * Source: https://www.chevronlubricants.com/ (homepage, section 1)
 *
 * Block table: 1 row x 3 cells. Each cell = linked image + bold title + description
 * (paragraph order kept as in source).
 *
 * Source DOM (validated against migration-work/block-context/columns-promo/source.html):
 *   .multi-column__content > .multi-column__item (5 items: 3 content + 2 empty 5% spacers)
 *     .cmp-image a.gtm-adaptive-image[href] > div > img.mobile-only-hidden + img.tablet-up-hidden
 *     .richtext .richtext__container p   (title <p><b>..</b></p>, description <p>)
 */
const ORIGIN = 'https://www.chevronlubricants.com';

function absUrl(url) {
  if (!url) return '';
  try {
    return new URL(url.trim(), ORIGIN).href;
  } catch (e) {
    return url;
  }
}

function buildImage(document, item) {
  // tablet-up-hidden carries the original DAM asset; mobile-only-hidden is a rendition
  const src = item.querySelector('img.tablet-up-hidden') || item.querySelector('img');
  if (!src) return null;
  const img = document.createElement('img');
  img.src = absUrl(src.getAttribute('data-src') || src.getAttribute('src'));
  img.alt = (src.getAttribute('alt') || '').trim();
  return img;
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.multi-column__content > .multi-column__item')]
    // drop empty spacer columns
    .filter((item) => item.querySelector('img') || item.textContent.trim());

  const row = items.map((item) => {
    const cell = [];
    const img = buildImage(document, item);
    const imgLink = item.querySelector('.cmp-image a[href]');
    if (img && imgLink) {
      const a = document.createElement('a');
      a.href = absUrl(imgLink.getAttribute('href'));
      a.append(img);
      const p = document.createElement('p');
      p.append(a);
      cell.push(p);
    } else if (img) {
      cell.push(img);
    }

    item.querySelectorAll('.richtext .richtext__container p').forEach((srcP) => {
      const text = srcP.textContent.replace(/ /g, ' ').trim();
      if (!text) return;
      const p = document.createElement('p');
      const bold = srcP.querySelector('b, strong');
      if (bold && bold.textContent.trim() === srcP.textContent.trim()) {
        const strong = document.createElement('strong');
        strong.textContent = text;
        p.append(strong);
      } else {
        p.textContent = text;
      }
      cell.push(p);
    });
    return cell;
  });

  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
