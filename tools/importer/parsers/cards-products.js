/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-products (base: cards)
 * Source: https://www.chevronlubricants.com/ (homepage, "Featured Products" carousel)
 *
 * Block table: one row per product (6 on source), 2 cells:
 *   cell 1: [optional ISOCLEAN badge image] + product image
 *   cell 2: H3 title link, "Learn More" link, button link (plain link with button text), benefit list
 *
 * Source DOM (validated against migration-work/block-context/cards-products/source.html):
 *   .prod__container > .prod__slide > .product-tile (x6)
 *     .isoclean-image [> img[data-src]]        (empty div when no badge)
 *     .imagetile > img
 *     .product-content
 *       h6 > a.product-heading[href]
 *       .fp-buy > a.fp-learn[href] + a.prod-cta-button[href] > button.product-button
 *       ul.benefit > li
 *
 * <button> inside <a> is invalid nesting and may be flattened by a re-parse, so every part is
 * collected in document order and paired by index rather than via ancestor-scoped lookups.
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

function makeImg(document, srcImg, fallbackAlt) {
  if (!srcImg) return null;
  const src = srcImg.getAttribute('data-src') || srcImg.getAttribute('src');
  if (!src) return null;
  const img = document.createElement('img');
  img.src = absUrl(src);
  img.alt = clean(srcImg.getAttribute('alt')).replace(/�/g, '®') || fallbackAlt || '';
  return img;
}

function makeLinkPara(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = absUrl(href);
  a.textContent = text;
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  const cells = [];

  const tiles = [...element.querySelectorAll('.product-tile')];
  const badgeWraps = [...element.querySelectorAll('.isoclean-image')];
  const imageTiles = [...element.querySelectorAll('.imagetile')];
  const headings = [...element.querySelectorAll('a.product-heading')];
  const learnLinks = [...element.querySelectorAll('a.fp-learn')];
  const ctaLinks = [...element.querySelectorAll('a.prod-cta-button')];
  const ctaButtons = [...element.querySelectorAll('button.product-button')];
  const lists = [...element.querySelectorAll('ul.benefit')];

  const count = Math.max(tiles.length, headings.length);

  for (let i = 0; i < count; i += 1) {
    const heading = headings[i];
    const title = heading ? clean(heading.textContent) : '';

    // image cell: optional badge first, then product image
    const imageCell = [];
    const badge = makeImg(document, badgeWraps[i] && badgeWraps[i].querySelector('img'), 'ISOCLEAN Certified Lubricants');
    if (badge) imageCell.push(badge);
    const product = makeImg(document, imageTiles[i] && imageTiles[i].querySelector('img'), title);
    if (product) imageCell.push(product);

    // body cell
    const textCell = [];
    if (heading) {
      const h3 = document.createElement('h3');
      const a = document.createElement('a');
      a.href = absUrl(heading.getAttribute('href'));
      a.textContent = title;
      h3.append(a);
      textCell.push(h3);
    }

    const learn = learnLinks[i];
    if (learn) textCell.push(makeLinkPara(document, learn.getAttribute('href'), clean(learn.textContent) || 'Learn More'));

    const cta = ctaLinks[i];
    if (cta) {
      const label = clean(cta.textContent) || (ctaButtons[i] ? clean(ctaButtons[i].textContent) : '') || 'Learn More';
      textCell.push(makeLinkPara(document, cta.getAttribute('href'), label));
    }

    const list = lists[i];
    if (list) {
      const ul = document.createElement('ul');
      list.querySelectorAll('li').forEach((srcLi) => {
        const text = clean(srcLi.textContent);
        if (!text) return;
        const li = document.createElement('li');
        li.textContent = text;
        ul.append(li);
      });
      if (ul.children.length) textCell.push(ul);
    }

    if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-products', cells });
  element.replaceWith(block);
}
