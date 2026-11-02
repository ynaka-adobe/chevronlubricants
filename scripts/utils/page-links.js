import normalizePagePath from './page-path.js';
import { reportError } from '../martech/consent.js';

const LIVE_HOST = 'chevronlubricants.ynaka-adobe.com';
const PREVIEW_HOST = /^.+--chevronlubricants--ynaka-adobe\.aem\.(page|live|network)$/;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const NON_PAGE = /\/(?:api|admin|editor|drafts|assets|media|documents|schedules|fragments)(?:\/|$)/;
const SELECTOR = 'a[href], form[role="search"]';

export function formatPageLink(href, pageURL = window.location.href) {
  if (!href || /^[#?\s]/.test(href)) return href;
  try {
    const page = new URL(pageURL);
    const url = new URL(href, page);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return href;
    const live = url.hostname === LIVE_HOST && !url.port;
    const preview = (!url.port && PREVIEW_HOST.test(url.hostname))
      || (url.origin === page.origin && LOCAL_HOSTS.has(page.hostname));
    if (!live && !preview) return href;
    const path = decodeURI(url.pathname);
    const clean = normalizePagePath(path);
    if (!clean.startsWith('/en-us/') || NON_PAGE.test(clean)
      || normalizePagePath(`${clean}.html`) !== clean) return href;

    // Work on the authored string so empty/repeated queries and encoding stay byte-for-byte.
    const boundary = href.search(/[?#]/);
    let destination = boundary < 0 ? href : href.slice(0, boundary);
    const suffix = boundary < 0 ? '' : href.slice(boundary);
    const toLive = live || (page.hostname === LIVE_HOST && !page.port && url.hostname.startsWith('main--'));
    if (toLive && preview) {
      destination = destination.replace(/^(?:https?:)?\/\/[^/]+/i, `https://${LIVE_HOST}`);
    }
    if (toLive && path === clean) destination += '.html';
    else if (!toLive && destination.endsWith('.html')) destination = destination.slice(0, -5);
    return `${destination}${suffix}`;
  } catch {
    reportError('Invalid navigation URL left unchanged', new Error('URL or encoded path could not be parsed'));
    return href;
  }
}

function normalizeElement(element, pageURL) {
  if (element.closest('.hidden-container, aem-sidekick') || element.matches('a.auto-block, a[download]')) return;
  const search = element.matches('form[role="search"]');
  if (search && element.method !== 'get') return;
  const attribute = search ? 'action' : 'href';
  const value = element.getAttribute(attribute);
  const original = value ?? (search ? new URL(pageURL).pathname : '');
  const formatted = formatPageLink(original, pageURL);
  if (formatted !== original) element.setAttribute(attribute, formatted);
}

export function normalizePageLinks(root, pageURL = window.location.href) {
  if (root.matches?.(SELECTOR)) normalizeElement(root, pageURL);
  root.querySelectorAll(SELECTOR).forEach((element) => normalizeElement(element, pageURL));
}

export function observePageLinks(root = document.body, pageURL = window.location.href) {
  normalizePageLinks(root, pageURL);
  const observer = new MutationObserver((records) => {
    records.forEach(({ type, target, addedNodes }) => {
      if (!root.contains(target)) return;
      if (type === 'attributes') {
        if (target.matches(SELECTOR)) normalizeElement(target, pageURL);
      } else {
        addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && root.contains(node)) {
            normalizePageLinks(node, pageURL);
          }
        });
      }
    });
  });
  observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['href', 'action'] });
  return () => observer.disconnect();
}

let stopObserving;
export default function initPageLinks() {
  if (!stopObserving) stopObserving = observePageLinks();
  else normalizePageLinks(document.body);
}
