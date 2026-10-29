/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-insights (base: cards)
 * Source: https://www.chevronlubricants.com/ (homepage, "Stay informed with Our Latest Insights")
 *
 * Block table: one row per article (15 on source), 2 cells:
 *   [image] [bold title link to article, excerpt paragraph]
 * (block CSS styles `.cards-insights-card-body strong a` and `p`)
 *
 * Source DOM (validated against migration-work/block-context/cards-insights/source.html):
 *   .scroll-container > .con__slide > div > .article-tile (x15)
 *     a.art-image-a[href] > img.art-imagetile
 *     .art-banner
 *       h6 > div.art-heading           (title)
 *       div.art-description            (excerpt)
 *       a.link_button[href] > svg      (icon-only arrow; stripped by importer, link rebuilt on title)
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
  const tiles = [...element.querySelectorAll('.article-tile')];

  tiles.forEach((tile) => {
    const titleEl = tile.querySelector('.art-heading');
    const descEl = tile.querySelector('.art-description');
    const linkEl = tile.querySelector('a.art-image-a[href], a.link_button[href]');
    const srcImg = tile.querySelector('img.art-imagetile') || tile.querySelector('img');

    const title = clean(titleEl && titleEl.textContent);
    const href = linkEl ? absUrl(linkEl.getAttribute('href')) : '';

    const imageCell = [];
    if (srcImg) {
      const src = srcImg.getAttribute('data-src') || srcImg.getAttribute('src');
      if (src) {
        const img = document.createElement('img');
        img.src = absUrl(src);
        img.alt = clean(srcImg.getAttribute('alt')) || title;
        imageCell.push(img);
      }
    }

    const textCell = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        strong.append(a);
      } else {
        strong.textContent = title;
      }
      p.append(strong);
      textCell.push(p);
    }

    const desc = clean(descEl && descEl.textContent);
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      textCell.push(p);
    }

    if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insights', cells });
  element.replaceWith(block);
}
