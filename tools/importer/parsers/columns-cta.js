/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-cta (base: columns)
 * Source: https://www.chevronlubricants.com/ (homepage, "Where to buy" band)
 *
 * Block table: 1 row x 4 cells, each cell = one CTA link (block JS turns it into a pill button).
 *
 * Source DOM (validated against migration-work/block-context/columns-cta/source.html):
 *   .multi-column__content > .multi-column__item (x4)
 *     .button .btn-wrapper a.btn[href] > span.btn-text
 *   (divider sections in each item are decorative and ignored)
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
    const links = [...item.querySelectorAll('.btn-wrapper a[href]')];
    if (!links.length) return;
    const cell = links.map((srcLink) => {
      const a = document.createElement('a');
      a.href = absUrl(srcLink.getAttribute('href'));
      const label = srcLink.querySelector('.btn-text') || srcLink;
      a.textContent = label.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.append(a);
      return p;
    });
    row.push(cell);
  });

  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
