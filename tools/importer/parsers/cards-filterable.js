/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-filterable (base: cards) - sheet mode
 * Template: expertise-marketing (industrial-products/learning-for-you,
 * isoclean/learning-for-you).
 *
 * Block table (blocks/cards-filterable/README.md, sheet mode):
 *   row 1: one cell = link to the shared resources sheet /en-us/home/learning/resources.json
 *          (content/en-us/home/learning/resources.json: title, link, image, video, brand, type,
 *          lastModified - the 45 knowledge-center items of the source)
 *   row 2 (optional): preselected filters, one paragraph per group:
 *          "Brand: ISOCLEAN®" / "Type: Video, Guide"
 *
 * Source DOM (validated against migration-work/block-context/cards-filterable/source.html
 * + instances/*.html, live rendered DOM):
 *   .knowledge-center .knowledge-center__filter__categories__category
 *     .knowledge-center__filter__categories__category-name > span ("Brands" | "Type")
 *     .knowledge-center__filter__categories__category-item
 *       input[type=checkbox][checked] (preselected) + label.__category-item__label (value)
 *   .knowledge-center__filter__selected-filters (not .hidden when filters are active)
 *   .knowledge-center__results .item ...  (rendered from the same search paths on both
 *   pages; the items live in the sheet, so they are not copied into the block)
 * Both source pages have no preselected filter -> row 2 is omitted.
 */
const SHEET = '/en-us/home/learning/resources.json';
const SHEET_TEXT = 'Resources';

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

// "Brands" -> "Brand", "Type" -> "Type" (block GROUPS aliases: brand / type)
function groupKey(name) {
  const n = clean(name).toLowerCase();
  if (n.startsWith('brand')) return 'Brand';
  if (n.startsWith('type') || n.includes('asset')) return 'Type';
  return clean(name);
}

function preselected(element) {
  const groups = [];
  element.querySelectorAll('.knowledge-center__filter__categories__category').forEach((cat) => {
    const nameEl = cat.querySelector('.knowledge-center__filter__categories__category-name span')
      || cat.querySelector('.knowledge-center__filter__categories__category-name');
    const values = [...cat.querySelectorAll('.knowledge-center__filter__categories__category-item')]
      .filter((item) => {
        const input = item.querySelector('input[type="checkbox"]');
        return input && (input.hasAttribute('checked') || input.checked);
      })
      .map((item) => clean((item.querySelector('.knowledge-center__filter__categories__category-item__label') || item).textContent))
      .filter(Boolean);
    if (nameEl && values.length) groups.push(`${groupKey(nameEl.textContent)}: ${values.join(', ')}`);
  });
  return groups;
}

const ORIGIN = 'https://www.chevronlubricants.com';

// AEM author-style paths (/content/chevron-lubricants/en_us/home/...) -> public site URL
function publicUrl(href) {
  const path = (href || '').replace(/^\/content\/chevron-lubricants(?=\/en_us\/)/, '');
  try { return new URL(path, ORIGIN).href; } catch (e) { return href; }
}

/*
 * Static mode for blog "related articles" lists (blog article pages): the source
 * <p class="knowledge-center__container__hidden" data-page-search-path="[{path: .../from-chevron/...}]">
 * queries a blog folder, so the items are page-specific. They are read from the
 * JS-rendered results (the importer loads the live page):
 *   .knowledge-center__results > .item .item__header__title a[href] (title)
 *                                      .item__header__image img[data-src]
 * One row per item: [thumbnail | linked title]. No tags line (no Brand/Type facets).
 */
function staticRows(element, document) {
  return [...element.querySelectorAll('.knowledge-center__results .item')].map((item) => {
    const link = item.querySelector('.item__header__title a[href]');
    const src = item.querySelector('.item__header__image img');
    if (!link) return null;
    const cellImg = [];
    if (src) {
      const img = document.createElement('img');
      img.src = publicUrl(src.getAttribute('data-src') || src.getAttribute('src'));
      img.alt = clean(link.textContent);
      cellImg.push(img);
    }
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = publicUrl(link.getAttribute('href'));
    a.textContent = clean(link.textContent);
    p.append(a);
    return [cellImg, [p]];
  }).filter(Boolean);
}

// The hidden config <p hidden> may already be stripped by the importer's preprocessing,
// so also detect blog lists from the rendered items (all link into /learning/from-chevron/).
function isBlogList(element) {
  const cfg = element.querySelector('.knowledge-center__container__hidden');
  if (cfg && (cfg.getAttribute('data-page-search-path') || '').includes('/from-chevron/')) return true;
  const links = [...element.querySelectorAll('.knowledge-center__results .item .item__header__title a[href]')];
  return links.length > 0 && links.every((a) => (a.getAttribute('href') || '').includes('/learning/from-chevron/'));
}

export default function parse(element, { document }) {
  if (isBlogList(element)) {
    const rows = staticRows(element, document);
    if (rows.length) {
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-filterable', cells: rows }));
    } else {
      element.remove();
    }
    return;
  }

  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = SHEET;
  a.textContent = SHEET_TEXT;
  p.append(a);
  const cells = [[[p]]];

  const filters = preselected(element);
  if (filters.length) {
    cells.push([filters.map((line) => {
      const fp = document.createElement('p');
      fp.textContent = line;
      return fp;
    })]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-filterable', cells });
  element.replaceWith(block);
}
