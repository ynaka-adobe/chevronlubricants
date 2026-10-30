#!/usr/bin/env node
/* eslint-disable */
/**
 * Regenerates the migrated-page link map embedded in
 * tools/importer/transformers/chevron-links.js from tools/importer/page-templates.json.
 *
 * Run from the repo root whenever templates[].urls change:
 *   node tools/importer/generate-link-map.mjs
 *
 * Path mapping (customer decision): mirror the source structure under /en-us/home
 * (EDS paths can't contain underscores): strip .html, underscores -> hyphens, lowercase;
 * the homepage (/ or /en_us/home.html) -> /en-us/home.
 * Query strings are ignored (src-tab=... variants map to the same page).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const templatesPath = path.join(dir, 'page-templates.json');
const targetPath = path.join(dir, 'transformers', 'chevron-links.js');

export function toEdsPath(pathname) {
  let p = decodeURI(pathname).replace(/\/+$/, '');
  p = p.replace(/\.html?$/i, '');
  if (!p) return '/en-us/home';
  return p.replace(/_/g, '-').toLowerCase();
}

const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8')).templates || [];
const map = {};
templates.forEach((t) => (t.urls || []).forEach((u) => {
  const { pathname } = new URL(u);
  const key = decodeURI(pathname).replace(/\/+$/, '').toLowerCase() || '/';
  map[key] = toEdsPath(pathname);
}));
// Homepage aliases: the site links to /en_us/home.html as well as /.
if (map['/']) {
  map['/en_us/home.html'] = map['/'];
  map['/en_us/home'] = map['/'];
}

const bad = Object.values(map).filter((p) => !/^(\/[a-z0-9-]+)+$/.test(p));
if (bad.length) {
  console.error('Unexpected characters in mapped paths:', bad);
  process.exit(1);
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
const block = `// GENERATED-LINK-MAP-START (node tools/importer/generate-link-map.mjs; do not edit by hand)\nconst MIGRATED = ${JSON.stringify(sorted, null, 2)};\n// GENERATED-LINK-MAP-END`;

const src = fs.readFileSync(targetPath, 'utf8');
const re = /\/\/ GENERATED-LINK-MAP-START[\s\S]*?\/\/ GENERATED-LINK-MAP-END/;
if (!re.test(src)) {
  console.error(`Marker block not found in ${targetPath}`);
  process.exit(1);
}
fs.writeFileSync(targetPath, src.replace(re, block));
console.log(`chevron-links.js: ${Object.keys(sorted).length} migrated paths from ${templates.length} templates`);
