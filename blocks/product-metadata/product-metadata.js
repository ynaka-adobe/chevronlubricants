/**
 * Key/value rows (like section-metadata) applied to the next or sibling .product block.
 * Place Product-metadata above Product in the same section, or alone in a section above the product section.
 * If the product block lives on another page, use a metadata-fragment row on the product block instead (see product.js).
 */

import { getConfig } from '../../scripts/ak.js';
import { loadMetadataFromUrl, normalizeMetadataKey } from './metadata-utils.js';

const getMetadata = (el) => [...el.childNodes].reduce((rdx, row) => {
  if (row.children && row.children.length >= 2) {
    const key = normalizeMetadataKey(row.children[0].textContent);
    const content = row.children[1];
    const text = content.textContent.trim();
    if (key && content) rdx[key] = { content, text };
  }
  return rdx;
}, {});

function getTopLevelSection(section) {
  const main = section.closest('main');
  if (!main) return section;
  const topLevelSections = main.querySelectorAll(':scope > .section');
  return [...topLevelSections].find((s) => s.contains(section)) || section;
}

function findProductBlock(el) {
  const bc = el.closest('.block-content');
  if (bc) {
    const siblings = [...bc.children];
    const idx = siblings.indexOf(el);
    for (let i = idx + 1; i < siblings.length; i += 1) {
      const node = siblings[i];
      if (node.classList.contains('product')) return node;
    }
  }

  let section = el.closest('.section');
  if (!section) return null;
  section = getTopLevelSection(section);

  const blocks = section.querySelectorAll('.block-content > div[class]');
  if (blocks.length === 1 && section.nextElementSibling?.classList?.contains('section')) {
    const next = section.nextElementSibling;
    const p = next.querySelector('.block-content > .product');
    if (p) return p;
  }
  if (blocks.length === 1 && section.previousElementSibling?.classList?.contains('section')) {
    const prev = section.previousElementSibling;
    const p = prev.querySelector('.block-content > .product');
    if (p) return p;
  }

  const sectionBlocks = section.querySelectorAll('.block-content > div[class]');
  let seen = false;
  for (const b of sectionBlocks) {
    if (b === el) {
      seen = true;
      continue;
    }
    if (seen && b.classList.contains('product')) return b;
  }

  let n = section.nextElementSibling;
  while (n) {
    if (n.classList?.contains('section')) {
      const p = n.querySelector('.block-content > .product');
      if (p) return p;
    }
    n = n.nextElementSibling;
  }

  return section.querySelector('.block-content .product');
}

export default async function init(el) {
  const target = findProductBlock(el);
  if (!target) {
    el.remove();
    return;
  }

  const raw = getMetadata(el);
  let fields = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v.text]),
  );

  const link = el.querySelector('a[href*="/fragments/"]');
  if (link) {
    const href = link.getAttribute('href');
    try {
      const fromUrl = await loadMetadataFromUrl(href);
      /* Table rows override fetched sheet for the same key */
      fields = { ...fromUrl, ...fields };
    } catch (e) {
      getConfig().log(e, el);
    }
  }

  target.dataset.productMetadata = JSON.stringify(fields);
  el.remove();
}
