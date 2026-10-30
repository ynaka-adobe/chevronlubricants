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

/* ------------------------------------------------------------------------------------------
 * Shared helpers for the products-listing branches (homepage branch above/below is untouched)
 * ---------------------------------------------------------------------------------------- */

// '#_blank' suffix = open in new tab (scripts/ak.js decorateHash convention)
function listingHref(srcLink) {
  const href = absUrl(srcLink.getAttribute('href'));
  if (!href) return '';
  const target = (srcLink.getAttribute('target') || '').toLowerCase();
  return target === '_blank' && !href.includes('#_blank') ? `${href}#_blank` : href;
}

function listingLinkPara(document, srcLink, fallbackText) {
  const href = listingHref(srcLink);
  if (!href) return null;
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = clean(srcLink.textContent) || fallbackText || '';
  p.append(a);
  return p;
}

function listingTitle(document, href, title) {
  const h3 = document.createElement('h3');
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = title;
    h3.append(a);
  } else {
    h3.textContent = title;
  }
  return h3;
}

// image from data-src / data-bg (lazyload, live DOM) or src (cleaned/cached DOM)
function listingImg(document, srcEl, alt) {
  if (!srcEl) return null;
  const src = srcEl.getAttribute('data-src') || srcEl.getAttribute('data-bg')
    || (srcEl.tagName === 'IMG' ? srcEl.getAttribute('src') : '');
  if (!src || src.startsWith('data:')) return null;
  const img = document.createElement('img');
  img.src = absUrl(src);
  img.alt = clean(srcEl.getAttribute('alt')).replace(/�/g, '®') || alt || '';
  return img;
}

// rich-text description -> single <p>, keeping <b>/<strong> as <strong>
function listingDescription(document, container) {
  if (!container) return null;
  const blocks = [...container.querySelectorAll('p, td')].filter((n) => !n.querySelector('p, td'));
  const sources = blocks.length ? blocks : [container];
  const p = document.createElement('p');
  const appendInline = (node, parent) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        parent.append(document.createTextNode(child.textContent.replace(/[\s ]+/g, ' ')));
      } else if (child.nodeType === 1) {
        if (['B', 'STRONG'].includes(child.tagName)) {
          const text = clean(child.textContent);
          if (!text) return;
          const strong = document.createElement('strong');
          strong.textContent = text;
          parent.append(strong, document.createTextNode(' '));
        } else if (child.tagName === 'BR') {
          parent.append(document.createTextNode(' '));
        } else {
          appendInline(child, parent);
        }
      }
    });
  };
  sources.forEach((src, i) => {
    if (i) p.append(document.createTextNode(' '));
    appendInline(src, p);
  });
  // normalise whitespace in text nodes
  p.normalize();
  [...p.childNodes].forEach((n, i, arr) => {
    if (n.nodeType !== 3) return;
    let t = n.textContent.replace(/ {2,}/g, ' ');
    if (i === 0) t = t.replace(/^ /, '');
    if (i === arr.length - 1) t = t.replace(/ $/, '');
    n.textContent = t;
  });
  [...p.childNodes].forEach((n) => { if (n.nodeType === 3 && !n.textContent) n.remove(); });
  return clean(p.textContent) ? p : null;
}

/**
 * Listing "Featured" carousel (products-listing): .slider-wrapper
 *   .slick-slide[:not(.slick-cloned)] > div > a.slide[href]
 *     .teaser-image[data-bg] (live) | .teaser-image > img[src] (cleaned)
 *     .product-title
 *     .category-heading .inner__description > (p | table td) rich text
 * Live (pre-slick) DOM has bare a.slide elements and no clones; cached DOM has slick clones.
 */
function parseListingCarousel(element, document) {
  const cells = [];
  const seen = new Set();
  const slides = [...element.querySelectorAll('a.slide')].filter((a) => !a.closest('.slick-cloned'));
  slides.forEach((slide) => {
    const href = absUrl(slide.getAttribute('href'));
    const titleEl = slide.querySelector('.product-title');
    const title = titleEl ? clean(titleEl.textContent) : '';
    const key = `${href}|${title}`;
    if (seen.has(key)) return;
    seen.add(key);

    const imageCell = [];
    const teaser = slide.querySelector('.teaser-image');
    const img = listingImg(document, teaser && teaser.getAttribute('data-bg') ? teaser : (teaser || slide).querySelector('img'), title);
    if (img) imageCell.push(img);

    const textCell = [];
    if (title) textCell.push(listingTitle(document, listingHref(slide), title));
    const desc = listingDescription(document, slide.querySelector('.inner__description') || slide.querySelector('.category-heading'));
    if (desc) textCell.push(desc);

    if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
  });
  return cells;
}

/**
 * Listing group grid (products-listing): .product-listing-list__category-container__items
 *   .product-listing-item (ALL items, incl. those hidden behind "See all")
 *     .product-listing-item__img-container > div [> img.__isologo] + img.__product[data-src|src]
 *     .product-listing-item__title > a.product-listing-item__title-link
 *     .product-listing-item__benefits ("Benefits" label)
 *     .product-listing-item__benefits-container ul > li
 *     .card-footer-buttons > .product-listing-category__more a ("Learn More")
 *                          + .product-listing-category__buyonline a > div (button text)
 */
function parseListingGrid(element, document) {
  const cells = [];
  [...element.querySelectorAll('.product-listing-item')].forEach((item) => {
    const titleLink = item.querySelector('.product-listing-item__title a') || item.querySelector('.product-listing-item__title');
    const title = titleLink ? clean(titleLink.textContent) : '';

    const imageCell = [];
    const badge = listingImg(document, item.querySelector('img.product-listing-item__img-container__isologo, .product-listing-item__img-container [class*="isologo"]'), 'ISOCLEAN® Certified Lubricants');
    if (badge) imageCell.push(badge);
    const product = listingImg(document, item.querySelector('img.product-listing-item__img-container__product')
      || item.querySelector('.product-listing-item__img-container img:not([class*="isologo"])'), title);
    if (product) imageCell.push(product);

    const textCell = [];
    if (title) {
      textCell.push(listingTitle(document, titleLink && titleLink.tagName === 'A' ? listingHref(titleLink) : '', title));
    }

    const label = item.querySelector('.product-listing-item__benefits');
    const list = item.querySelector('.product-listing-item__benefits-container ul');
    const items = list ? [...list.querySelectorAll('li')].map((li) => clean(li.textContent)).filter(Boolean) : [];
    if (items.length) {
      const labelText = label ? clean(label.textContent) : '';
      if (labelText) {
        const p = document.createElement('p');
        p.textContent = labelText;
        textCell.push(p);
      }
      const ul = document.createElement('ul');
      items.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        ul.append(li);
      });
      textCell.push(ul);
    }

    const learn = item.querySelector('.product-listing-category__more a[href]');
    if (learn) {
      const p = listingLinkPara(document, learn, 'Learn More');
      if (p) textCell.push(p);
    }
    const buy = item.querySelector('.product-listing-category__buyonline a[href]');
    if (buy) {
      const p = listingLinkPara(document, buy, 'Buy online');
      if (p) textCell.push(p);
    }

    if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
  });
  return cells;
}

export default function parse(element, { document }) {
  // products-listing: group grid -> "Cards-Products (grid)"
  if (element.matches('.product-listing-list__category-container__items')
    || (!element.querySelector('.product-tile') && element.querySelector('.product-listing-item'))) {
    const gridCells = parseListingGrid(element, document);
    const gridBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-products', variants: ['grid'], cells: gridCells });
    element.replaceWith(gridBlock);
    return;
  }

  // products-listing: "Featured" slick carousel -> "Cards-Products"
  if (!element.querySelector('.product-tile') && element.querySelector('a.slide')) {
    const carouselCells = parseListingCarousel(element, document);
    const carouselBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-products', cells: carouselCells });
    element.replaceWith(carouselBlock);
    return;
  }

  // homepage (chevron-homepage): .featured-products .fp-container .feature-pills > .product-tile
  // -- unchanged; must keep producing identical output --
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
