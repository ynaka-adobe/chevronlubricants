/* eslint-disable */
/* global WebImporter */

/**
 * Parser for locator (functional rebuild of the source retailer-finder).
 * Template: where-to-buy (find-a-distributor, find-an-installer, find-a-retailer).
 *
 * Block table (blocks/locator/README.md): N rows x [key | value]. Only Type is required;
 * the block's defaults match the source (migration-work/where-to-buy/locator-spec.json),
 * so only labels actually rendered by the source are authored here.
 *
 * Source DOM:
 *   .retailer-finder .retailer-finder__container[data-locatortype="marketer|installer|retailer"]
 *     input[type=text][placeholder]            -> Placeholder
 *     .search-box-isoclean + label / text       -> Certified filter label (marketer only)
 *     button "Search >"                         -> Button label
 *   Retailer page only: tab "Find online" (#online_retailers .item):
 *     .item__image-container img, .item__text .p6 (brands), .item__button a[href] ("Visit >")
 *     -> emitted after the block as an h2 + cards-resource block (one card per retailer).
 */
const ORIGIN = 'https://www.chevronlubricants.com';
const TYPES = { marketer: 'distributor', installer: 'installer', retailer: 'retailer' };

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function abs(url) {
  try { return new URL(url, ORIGIN).href; } catch (e) { return url; }
}

function row(key, value) {
  return [key, value];
}

function onlineRetailers(element, document) {
  const items = [...element.querySelectorAll('#online_retailers .item')];
  if (!items.length) return [];
  const tabLabel = clean((element.querySelector('a[href="#online_retailers"]') || {}).textContent) || 'Find online';
  const rows = items.map((item) => {
    const src = item.querySelector('.item__image-container img');
    const link = item.querySelector('.item__button a[href]');
    const cellImg = [];
    if (src) {
      const img = document.createElement('img');
      img.src = abs(src.getAttribute('data-src') || src.getAttribute('src'));
      img.alt = clean(src.getAttribute('alt'));
      cellImg.push(img);
    }
    const text = [];
    const name = clean(src && src.getAttribute('alt'));
    if (name) {
      const p = document.createElement('p');
      const b = document.createElement('strong');
      b.textContent = name;
      p.append(b);
      text.push(p);
    }
    const brands = clean((item.querySelector('.item__text .p6') || {}).textContent);
    if (brands) {
      const p = document.createElement('p');
      p.textContent = brands;
      text.push(p);
    }
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      // project convention: #_blank opens in a new tab (scripts/ak.js decorateLink)
      a.href = `${abs(link.getAttribute('href'))}#_blank`;
      a.textContent = clean(link.textContent) || 'Visit';
      p.append(a);
      text.push(p);
    }
    return [cellImg, text];
  });
  const h2 = document.createElement('h2');
  h2.textContent = tabLabel;
  return [h2, WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells: rows })];
}

export default function parse(element, { document }) {
  const container = element.querySelector('[data-locatortype]') || element;
  const type = TYPES[(container.getAttribute('data-locatortype') || '').toLowerCase()] || 'distributor';

  const cells = [row('Type', type)];
  const input = element.querySelector('input[type="text"][placeholder]');
  if (input && clean(input.getAttribute('placeholder'))) cells.push(row('Placeholder', clean(input.getAttribute('placeholder'))));
  if (type === 'distributor') {
    const iso = element.querySelector('#search-box-isoclean');
    const label = iso && (element.querySelector('label[for="search-box-isoclean"]') || iso.parentElement);
    const text = clean(label && label.textContent);
    if (text) cells.push(row('Certified filter label', text));
  }
  const button = [...element.querySelectorAll('button, a.btn')].find((b) => /search/i.test(clean(b.textContent)) && !/within/i.test(clean(b.textContent)));
  if (button) cells.push(row('Button label', clean(button.textContent)));

  const extra = onlineRetailers(element, document);
  const block = WebImporter.Blocks.createBlock(document, { name: 'locator', cells });
  element.replaceWith(block, ...extra);
}
