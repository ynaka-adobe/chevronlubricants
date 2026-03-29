/**
 * Product block: rows list metadata KEYS; values come from:
 * 1) sibling Product-metadata (dataset.productMetadata), and/or
 * 2) a metadata-fragment row pointing at a fragment URL that contains a Product-metadata block
 *    (use this when metadata lives on a separate fragment page, e.g. /fragments/products/...).
 */

import { getConfig } from '../../scripts/ak.js';
import { loadMetadataFromUrl, normalizeMetadataKey } from '../product-metadata/metadata-utils.js';

const METADATA_SOURCE_ROW_KEYS = new Set([
  'metadata-fragment',
  'metadata-src',
  'product-metadata-src',
  'product-metadata-fragment',
]);

function normalizeKey(str) {
  return normalizeMetadataKey(str);
}

function humanizeKey(key) {
  return key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseMetadata(block) {
  if (!block.dataset.productMetadata) return {};
  try {
    return JSON.parse(block.dataset.productMetadata);
  } catch {
    return {};
  }
}

function lookupValue(metadata, rawKey) {
  const k = normalizeKey(rawKey);
  if (k && Object.prototype.hasOwnProperty.call(metadata, k)) {
    return metadata[k];
  }
  const trimmed = rawKey.trim();
  if (trimmed && Object.prototype.hasOwnProperty.call(metadata, trimmed)) {
    return metadata[trimmed];
  }
  const match = Object.keys(metadata).find((mk) => normalizeKey(mk) === k);
  return match !== undefined ? metadata[match] : '';
}

function isLikelyImageUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  return /^https?:\/\//i.test(v) && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(v)
    || /^\/(media_|.*\.(png|jpe?g|gif|webp))/i.test(v);
}

function isLikelyUrl(value) {
  if (!value || typeof value !== 'string') return false;
  return /^https?:\/\//i.test(value.trim()) || value.trim().startsWith('/');
}

function appendValue(container, value) {
  const v = value == null ? '' : String(value).trim();
  if (!v) {
    const empty = document.createElement('span');
    empty.className = 'product-field-value product-field-empty';
    empty.textContent = '—';
    container.append(empty);
    return;
  }
  if (isLikelyImageUrl(v)) {
    const wrap = document.createElement('span');
    wrap.className = 'product-field-value product-field-value--image';
    const img = document.createElement('img');
    img.src = v;
    img.alt = '';
    img.loading = 'lazy';
    wrap.append(img);
    container.append(wrap);
    return;
  }
  if (isLikelyUrl(v) && v.includes('://')) {
    const a = document.createElement('a');
    a.className = 'product-field-value product-field-value--link';
    a.href = v;
    a.textContent = v;
    a.rel = 'noopener noreferrer';
    container.append(a);
    return;
  }
  const span = document.createElement('span');
  span.className = 'product-field-value';
  span.textContent = v;
  container.append(span);
}

function collectRowKeys(block) {
  const out = [];
  for (const row of block.querySelectorAll(':scope > div')) {
    if (row.classList.contains('product-inner')) continue;
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length === 0) {
      const t = row.textContent.trim();
      if (t) out.push({ keyText: t, labelText: null, row });
      continue;
    }
    const keyText = cells[0].textContent.trim();
    const labelText = cells.length > 1 ? cells[1].textContent.trim() : '';
    if (keyText) out.push({ keyText, labelText: labelText || null, row });
  }
  return out;
}

function renderLookup(block, metadata, rowKeys) {
  const displayRows = rowKeys.filter(
    (r) => !METADATA_SOURCE_ROW_KEYS.has(normalizeKey(r.keyText)),
  );
  if (!displayRows.length) return false;

  const inner = document.createElement('div');
  inner.className = 'product-inner product-inner--fields';

  displayRows.forEach(({ keyText, labelText }) => {
    const key = normalizeKey(keyText);
    const value = lookupValue(metadata, keyText);
    const field = document.createElement('div');
    field.className = 'product-field';
    field.dataset.fieldKey = key || keyText;

    const labelEl = document.createElement('span');
    labelEl.className = 'product-field-label';
    labelEl.textContent = labelText || humanizeKey(key || keyText);

    const valueWrap = document.createElement('div');
    valueWrap.className = 'product-field-values';
    appendValue(valueWrap, value);

    field.append(labelEl, valueWrap);
    inner.append(field);
  });

  block.replaceChildren(inner);
  return true;
}

export default async function init(block) {
  block.classList.add('product-block');
  const rowKeys = collectRowKeys(block);

  const sourceRow = rowKeys.find((r) => METADATA_SOURCE_ROW_KEYS.has(normalizeKey(r.keyText)));
  const fragmentPath = sourceRow?.labelText?.trim();

  let fetched = {};
  if (fragmentPath) {
    try {
      fetched = await loadMetadataFromUrl(fragmentPath);
    } catch (e) {
      getConfig().log(e, block);
    }
  }

  /* Sibling product-metadata wins over fetched fragment for the same key */
  const metadata = { ...fetched, ...parseMetadata(block) };

  if (Object.keys(metadata).length && renderLookup(block, metadata, rowKeys)) {
    return;
  }

  if (!block.querySelector('.product-inner')) {
    const inner = document.createElement('div');
    inner.className = 'product-inner';
    while (block.firstChild) inner.append(block.firstChild);
    block.append(inner);
  }
}
