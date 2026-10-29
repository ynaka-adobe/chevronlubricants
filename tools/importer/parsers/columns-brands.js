/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-brands (base: columns)
 * Source: https://www.chevronlubricants.com/ (homepage, "Our Family of Trusted Brands")
 *
 * Block table: 1 row x 4 cells, each cell = brand logo image linked to the brand page.
 *
 * Source DOM (validated against migration-work/block-context/columns-brands/source.html):
 *   .multi-column__content > .multi-column__item (x4)
 *     .cmp-image a.gtm-adaptive-image[href] > div > img.mobile-only-hidden + img.tablet-up-hidden
 *   (divider sections are decorative and ignored)
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

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.multi-column__content > .multi-column__item')];

  const row = [];
  items.forEach((item) => {
    // tablet-up-hidden carries the original DAM asset
    const srcImg = item.querySelector('img.tablet-up-hidden') || item.querySelector('img');
    if (!srcImg) return;
    const img = document.createElement('img');
    img.src = absUrl(srcImg.getAttribute('data-src') || srcImg.getAttribute('src'));
    // alt is "Delo link" on source; title holds the plain brand name
    img.alt = (srcImg.getAttribute('title') || srcImg.getAttribute('alt') || '').trim();

    const srcLink = item.querySelector('.cmp-image a[href]');
    if (srcLink) {
      const a = document.createElement('a');
      a.href = absUrl(srcLink.getAttribute('href'));
      a.append(img);
      const p = document.createElement('p');
      p.append(a);
      row.push([p]);
    } else {
      row.push([img]);
    }
  });

  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-brands', cells });
  element.replaceWith(block);
}
