import { formatPageLink } from '../../scripts/utils/page-links.js';

/*
 * Search: site search results over the query index (helix-query.yaml "site" index,
 * /query-index.json: path, title, description, content).
 * Content model (library convention): one row = link to the query index; without it
 * /query-index.json is used. The query comes from ?q= (header search form) or the
 * block's own form. Source design: 'Search "term"' heading, 8 results per page (title link,
 * description, URL), "1 - 8 of N results", Prev / page numbers / Next.
 */
const DEFAULT_INDEX = '/query-index.json';
const PAGE_SIZE = 8;

function readConfig(block) {
  const link = block.querySelector('a[href]');
  const text = block.textContent.trim();
  let index = DEFAULT_INDEX;
  // this site's own index: keep only the path (an authored link may point at aem.page)
  if (link) index = new URL(link.href).pathname;
  else if (/\.json(\?|$)/.test(text)) index = new URL(text, window.location.origin).pathname;
  return { index, 'page-size': String(PAGE_SIZE) };
}

let indexPromise;
function loadIndex(path) {
  const url = new URL(path, window.location.origin);
  if (!url.searchParams.has('limit')) url.searchParams.set('limit', '5000');
  indexPromise = indexPromise || fetch(url)
    .then((res) => (res.ok ? res.json() : { data: [] }))
    .then((json) => json.data || [])
    .catch(() => []);
  return indexPromise;
}

const terms = (q) => q.toLowerCase().split(/\s+/).filter((t) => t.length > 1);

function score(entry, words) {
  const title = (entry.title || '').toLowerCase();
  const text = `${entry.description || ''} ${entry.content || ''}`.toLowerCase();
  if (!words.every((w) => title.includes(w) || text.includes(w))) return 0;
  return words.reduce((s, w) => s + (title.includes(w) ? 10 : 0) + (text.includes(w) ? 1 : 0), 0);
}

// text with every search word wrapped in <mark> (built as nodes, never as HTML)
function highlight(text, words) {
  const frag = document.createDocumentFragment();
  if (!words.length) {
    frag.append(text);
    return frag;
  }
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  text.split(re).forEach((part, i) => {
    if (i % 2) {
      const mark = document.createElement('mark');
      mark.textContent = part;
      frag.append(mark);
    } else if (part) {
      frag.append(part);
    }
  });
  return frag;
}

const STYLE_NAME = '(?:[a-z-]+-bg|centered|split|banner)';
const SECTION_STYLE = new RegExp(`\\bstyle\\s+${STYLE_NAME}(?:[\\s,]+${STYLE_NAME})*`, 'gi');

// page titles carry the site suffix ("Delo | Chevron Lubricants (US)"); the source lists without it
const displayTitle = (entry) => (entry.title || entry.path).replace(/\s*\|\s*Chevron Lubricants.*$/i, '');

function snippet(entry, words) {
  // underscore runs are decorative rules in the imported copy ("ON-HIGHWAY _______"); the
  // indexed page text also carries section-metadata cells ("style black-bg, centered")
  const text = (entry.description || entry.content || '')
    .replace(/_{3,}/g, ' ')
    .replace(SECTION_STYLE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  const lower = text.toLowerCase();
  const at = Math.min(...words.map((w) => lower.indexOf(w)).filter((i) => i >= 0), Infinity);
  if (text.length <= 220 || !Number.isFinite(at) || at < 120) return text.length > 220 ? `${text.slice(0, 220)}…` : text;
  return `…${text.slice(at - 60, at + 160)}…`;
}

function resultItem(entry, words) {
  const li = document.createElement('li');
  li.className = 'search-result';
  const url = new URL(entry.path, window.location.origin);
  const href = formatPageLink(`${url.pathname}${url.search}${url.hash}`);
  const title = document.createElement('a');
  title.className = 'search-result-title';
  title.href = href;
  title.append(highlight(displayTitle(entry), words));
  const desc = document.createElement('p');
  desc.className = 'search-result-description';
  desc.append(highlight(snippet(entry, words) || 'Description not available', words));
  const link = document.createElement('a');
  link.className = 'search-result-url';
  link.href = href;
  link.textContent = new URL(href, window.location.origin).href;
  link.tabIndex = -1;
  link.setAttribute('aria-hidden', 'true');
  li.append(title, desc, link);
  return li;
}

function pageLink(label, page, q, current) {
  const url = new URL(window.location.href);
  url.searchParams.set('q', q);
  url.searchParams.set('page', page);
  const a = document.createElement('a');
  a.href = `${url.pathname}${url.search}`;
  a.textContent = label;
  if (current) a.setAttribute('aria-current', 'page');
  return a;
}

function pagination(total, page, size, q) {
  const pages = Math.ceil(total / size);
  const nav = document.createElement('nav');
  nav.className = 'search-pagination';
  nav.setAttribute('aria-label', 'Search results pages');
  if (pages < 2) return nav;
  const first = Math.max(1, Math.min(page - 4, pages - 9));
  const last = Math.min(pages, first + 9);
  if (page > 1) nav.append(pageLink('Prev', page - 1, q));
  for (let p = first; p <= last; p += 1) nav.append(pageLink(String(p), p, q, p === page));
  if (page < pages) nav.append(pageLink('Next', page + 1, q));
  return nav;
}

function buildForm(q) {
  const form = document.createElement('form');
  form.className = 'search-form';
  form.method = 'get';
  form.setAttribute('role', 'search');
  const label = document.createElement('label');
  label.htmlFor = 'search-block-q';
  label.textContent = 'Search the site';
  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'search-block-q';
  input.name = 'q';
  input.value = q;
  input.required = true;
  input.enterKeyHint = 'search';
  input.autocomplete = 'off';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Search';
  form.append(label, input, submit);
  return form;
}

export default async function init(block) {
  const config = readConfig(block);
  const size = Math.max(1, parseInt(config['page-size'], 10) || 8);
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('q') || '').trim();
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  const heading = document.createElement('h1');
  heading.className = 'search-heading';
  heading.textContent = q ? `Search "${q}"` : 'Search';
  const status = document.createElement('p');
  status.className = 'search-status';
  status.setAttribute('role', 'status');
  const list = document.createElement('ol');
  list.className = 'search-results';
  block.replaceChildren(heading, buildForm(q), list, status);
  if (!q) {
    status.textContent = 'Enter a word or phrase to search the site.';
    return;
  }

  status.textContent = 'Searching…';
  const words = terms(q);
  const entries = await loadIndex(config.index);
  const matches = entries
    .filter((e) => e.path && !/\/(nav|footer)$/.test(e.path))
    .map((e) => ({ e, s: score(e, words) }))
    .filter((m) => m.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((m) => m.e);
  if (!matches.length) {
    status.textContent = `No results for "${q}".`;
    return;
  }
  const from = Math.min((page - 1) * size, Math.floor((matches.length - 1) / size) * size);
  matches.slice(from, from + size).forEach((e) => list.append(resultItem(e, words)));
  list.start = from + 1;
  status.textContent = `${from + 1} - ${Math.min(from + size, matches.length)} of ${matches.length} results`;
  block.append(pagination(matches.length, from / size + 1, size, q));
}
