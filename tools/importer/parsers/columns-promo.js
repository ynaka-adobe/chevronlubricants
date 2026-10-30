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

/* ------------------------------------------------------------------------------------------
 * expertise-* templates (gf7 #6 GF-7 oil types, vartech #14 benefit graphics). The homepage
 * element is the .multi-column__container itself and never reaches this code.
 * Source (instances/expertise-*.html, live DOM): div.multi-column > .multi-column__container
 *   > .multi-column__content > .multi-column__item (spacers: empty / only .divider skipped)
 *     .cmp-image [a[href]] > img.mobile-only-hidden (desktop) + img.tablet-up-hidden (mobile)
 *     (vartech: two .cmp-image per item, optionally separated by a .divider)
 *     [.richtext p (title / description), kept as paragraphs when present]
 * One cell per non-empty item; every image of the item, in source order; images are only
 * linked when the source image is.
 * ---------------------------------------------------------------------------------------- */

function promoClean(text) {
  return (text || '').replace(/[\s ​]+/g, ' ').trim();
}

function promoImage(document, cmp) {
  const src = cmp.querySelector('img.mobile-only-hidden') || cmp.querySelector('img');
  const url = src && (src.getAttribute('data-src') || src.getAttribute('src'));
  if (!url || url.startsWith('data:')) return null;
  const img = document.createElement('img');
  img.src = absUrl(url);
  img.alt = promoClean(src.getAttribute('alt'));
  const p = document.createElement('p');
  const link = cmp.querySelector('a[href]');
  const href = link && (link.getAttribute('href') || '').trim();
  if (href && href !== '#') {
    const a = document.createElement('a');
    a.href = href.startsWith('#') ? href : absUrl(href);
    a.append(img);
    p.append(a);
  } else {
    p.append(img);
  }
  return p;
}

function parseExpertise(element, document) {
  const items = [...element.querySelectorAll(':scope > .multi-column__container > .multi-column__content > .multi-column__item')]
    .filter((item) => promoClean(item.textContent) || item.querySelector('img'));
  const row = items.map((item) => {
    const cell = [];
    [...item.children].forEach((c) => {
      if (c.matches('.cmp-image')) {
        const p = promoImage(document, c);
        if (p) cell.push(p);
      } else if (c.matches('.richtext')) {
        c.querySelectorAll('p').forEach((srcP) => {
          const text = promoClean(srcP.textContent);
          if (!text) return;
          const p = document.createElement('p');
          const bold = srcP.querySelector('b, strong');
          if (bold && promoClean(bold.textContent) === text) {
            const strong = document.createElement('strong');
            strong.textContent = text;
            p.append(strong);
          } else {
            p.textContent = text;
          }
          cell.push(p);
        });
      }
    });
    return cell;
  }).filter((cell) => cell.length);
  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}

export default function parse(element, { document }) {
  // expertise-* sources (the homepage passes the .multi-column__container itself)
  if (!element.matches('.multi-column__container')) {
    parseExpertise(element, document);
    return;
  }

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
