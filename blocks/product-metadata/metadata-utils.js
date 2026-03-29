/**
 * Shared key normalization, row parsing, and fragment URL loading (HTML or JSON sheet).
 */

export function normalizeMetadataKey(str) {
  return str.trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** Flat { key: valueText } from a product-metadata block root element */
export function parseMetadataFlat(el) {
  const out = {};
  if (!el) return out;
  for (const row of el.childNodes) {
    if (!row.children || row.children.length < 2) continue;
    const key = normalizeMetadataKey(row.children[0].textContent);
    const text = row.children[1].textContent.trim();
    if (key) out[key] = text;
  }
  return out;
}

/**
 * Edge Delivery / DA sheet JSON: { data: [{ Label, Value }, ...], ":type":"sheet" }
 */
export function parseSheetMetadataJson(json) {
  if (!json || !Array.isArray(json.data)) return {};
  const out = {};
  for (const row of json.data) {
    const label = row.Label ?? row.label ?? row.Key ?? row.key;
    const value = row.Value ?? row.value ?? row.val;
    if (label == null) continue;
    const key = normalizeMetadataKey(String(label));
    if (key) out[key] = value != null ? String(value) : '';
  }
  return out;
}

/**
 * Fetch a fragment URL (HTML page or .json sheet) and return flat metadata map.
 */
export async function loadMetadataFromUrl(pathOrUrl) {
  const path = pathOrUrl.trim();
  if (!path) return {};
  const url = path.startsWith('http') ? path : new URL(path, window.location.origin).href;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to load metadata fragment: ${resp.status}`);
  }
  const text = await resp.text();
  try {
    const json = JSON.parse(text);
    if (json && Array.isArray(json.data)) {
      return parseSheetMetadataJson(json);
    }
  } catch {
    /* not JSON */
  }
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const metaEl = doc.querySelector('main .product-metadata, .product-metadata');
  if (!metaEl) return {};
  return parseMetadataFlat(metaEl);
}
