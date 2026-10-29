/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-industry (base: cards)
 * Source: https://www.chevronlubricants.com/ (homepage, "Find resources by Industry")
 *
 * Block table: one row per card, 2 cells: [image] [bold title link].
 *
 * Source DOM (validated against migration-work/block-context/cards-industry/source.html):
 *   .multi-column__content > .multi-column__item (x5)
 *     .adaptive-image__container
 *       div[class^="overlay"] .richtext__container  -> many &nbsp; spacer <p>s, then the title
 *          split over 2 <p>/<h3> lines (e.g. "Construction and" / "Mining"), linked via <a href>
 *       img.mobile-only-hidden (rendition) + img.tablet-up-hidden (DAM original)
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

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const cells = [];
  const items = [...element.querySelectorAll('.multi-column__content > .multi-column__item')];

  items.forEach((item) => {
    // image: prefer the DAM original
    const srcImg = item.querySelector('img.tablet-up-hidden') || item.querySelector('img');
    const imageCell = [];
    if (srcImg) {
      const img = document.createElement('img');
      img.src = absUrl(srcImg.getAttribute('data-src') || srcImg.getAttribute('src'));
      img.alt = clean(srcImg.getAttribute('alt'));
      imageCell.push(img);
    }

    // title: join the non-empty overlay text lines
    const overlay = item.querySelector('.adaptive-image__container .richtext__container') || item;
    const parts = [...overlay.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
      .map((el) => clean(el.textContent))
      .filter(Boolean);
    const title = parts.reduce((acc, part) => {
      if (!acc) return part;
      return /^[/\-]/.test(part) || /[/\-]$/.test(acc) ? `${acc}${part}` : `${acc} ${part}`;
    }, '') || (srcImg ? clean(srcImg.getAttribute('alt')) : '');

    const srcLink = overlay.querySelector('a[href]') || item.querySelector('a[href]');
    const textCell = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      if (srcLink) {
        const a = document.createElement('a');
        a.href = absUrl(srcLink.getAttribute('href'));
        a.textContent = title;
        strong.append(a);
      } else {
        strong.textContent = title;
      }
      p.append(strong);
      textCell.push(p);
    }

    if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells });
  element.replaceWith(block);
}
