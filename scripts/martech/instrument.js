import { getConsent, onConsentChange, reportError } from './consent.js';
import {
  cleanText, cleanURL, EVENTS, isUSPage, revokeAnalytics, send,
} from './analytics.js';
import { getPersonaState } from '../persona.js';

const SELECTOR = '[data-block-name], .block, .block-content > div[class], '
  + '.commerce-product > :not(.default-content):not(.block-content), '
  + '.commerce-product > .default-content > *';
const LIMIT = 200;
const subscribers = new Set();
const identities = new WeakMap();
const impressions = new WeakSet();
const observed = new WeakSet();
const depths = new Set();
let started = false;
let pageViewed = false;
let collection = 'No requests issued';
let observer;
let mutation;
let granted;
window.adobeDataLayer = window.adobeDataLayer || [];

export function snapshot() {
  return { events: [...window.adobeDataLayer], collection, consent: getConsent() };
}

function notify() {
  subscribers.forEach((listener) => listener(snapshot()));
}

export function subscribe(listener) {
  subscribers.add(listener);
  listener(snapshot());
  return () => subscribers.delete(listener);
}

export function pageContext() {
  const path = cleanURL(window.location.pathname);
  const persona = getPersonaState().id;
  return {
    path,
    locale: 'us',
    ...(persona ? { persona } : {}),
    template: cleanText(document.body.dataset.template
      || document.querySelector('meta[name="template"]')?.content
      || document.querySelector('main')?.dataset.template
      || (/\/products\/[^/]+$/.test(path) ? 'product' : 'default')),
  };
}

function blocks() {
  return [...document.querySelectorAll('main *')].filter((node) => node.matches(SELECTOR));
}

export function describeBlock(block) {
  if (!block) return undefined;
  if (!identities.has(block)) {
    const parts = [...block.classList].filter((name) => !['block', 'auto-block', 'active', 'appear', 'at-element-marker', 'section'].includes(name));
    const name = block.dataset.blockName || parts[0] || block.tagName.toLowerCase();
    const variants = parts.filter((part) => part !== name);
    identities.set(block, {
      id: cleanText([name, ...variants].join('--'), 255),
      block: cleanText(name),
    });
  }
  const sections = [...document.querySelectorAll('main > .section')];
  return {
    ...identities.get(block),
    position: blocks().indexOf(block) + 1,
    sectionIndex: sections.indexOf(block.closest('main > .section')) + 1,
  };
}

export function track(event, payload = {}) {
  if (!getConsent().analytics || !isUSPage() || (!EVENTS[event] && event !== 'page-view')) return;
  if ((event === 'scroll' && ![25, 50, 75, 100].includes(payload.depth))
    || (event.startsWith('form-') && !cleanText(payload.form?.name))) {
    reportError('Invalid analytics event discarded', new Error(event));
    return;
  }
  const entry = { event, page: pageContext(), timestamp: new Date().toISOString() };
  const { component } = payload;
  if (component) {
    entry.component = {
      id: cleanText(component.id, 255),
      block: cleanText(component.block),
      position: Number(component.position) || 0,
      sectionIndex: Number(component.sectionIndex) || 0,
    };
  }
  if (payload.link) {
    const url = cleanURL(payload.link.url);
    entry.link = {
      text: cleanText(payload.link.text),
      url,
      type: url.startsWith('https://') || url.startsWith('http://') ? 'exit' : 'internal',
    };
    if (event === 'download') entry.link.file = cleanText(url.split('/').pop());
  }
  if (event === 'scroll' && [25, 50, 75, 100].includes(payload.depth)) entry.depth = payload.depth;
  if (payload.form) entry.form = { name: cleanText(payload.form.name) };
  window.adobeDataLayer.push(entry);
  if (window.adobeDataLayer.length > LIMIT) {
    window.adobeDataLayer.splice(0, window.adobeDataLayer.length - LIMIT);
  }
  send(entry, (result) => {
    collection = result;
    notify();
  });
}

function register() {
  blocks().forEach((block) => {
    if (observed.has(block)) return;
    observed.add(block);
    describeBlock(block);
    observer.observe(block);
  });
}

function stop() {
  observer?.disconnect();
  mutation?.disconnect();
  revokeAnalytics();
  window.adobeDataLayer.length = 0;
  if (Array.isArray(window.dataLayer)) {
    for (let index = window.dataLayer.length - 1; index >= 0; index -= 1) {
      if (window.dataLayer[index]?.event === 'e_locator') window.dataLayer.splice(index, 1);
    }
  }
  collection = 'Off; captured events cleared';
}

function start() {
  if (!pageViewed) {
    pageViewed = true;
    track('page-view');
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!getConsent().analytics || !entry.isIntersecting
        || entry.intersectionRatio < 0.5 || impressions.has(entry.target)) return;
      impressions.add(entry.target);
      observer.unobserve(entry.target);
      track('component-impression', { component: describeBlock(entry.target) });
    });
  }, { threshold: 0.5 });
  // WeakSets are page-lifetime deduplication; re-observe un-impressed blocks after revocation.
  blocks().forEach((block) => { if (!impressions.has(block)) observer.observe(block); });
  register();
  mutation = new MutationObserver(register);
  const main = document.querySelector('main');
  if (main) {
    mutation.observe(main, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['data-block-name', 'class'],
    });
  }
}

export default function instrument() {
  if (started) return;
  started = true;
  onConsentChange((consent) => {
    if (consent.analytics !== granted) {
      granted = consent.analytics;
      if (granted && !isUSPage()) {
        collection = 'Off: page excluded from this US analytics build';
        notify();
        return;
      }
      if (granted) start();
      else stop();
    }
    notify();
  });
  document.addEventListener('click', (event) => {
    if (!getConsent().analytics || !(event.target instanceof Element)) return;
    const link = event.target.closest('main a, main button');
    if (!link) return;
    const block = link.closest(SELECTOR);
    if (!block || !block.closest('main')) return;
    const url = link.getAttribute('href') || '';
    if (/^(mailto:|tel:)/i.test(url)) return;
    const download = link.hasAttribute('download')
      || /\.(pdf|docx?|xlsx?|pptx?|zip|csv)(?:[?#]|$)/i.test(url)
      || /^https:\/\/cglapps\.chevron\.com\/sdspds\/(?:PDS|SDS)DetailPage\.aspx(?:[?#]|$)/i.test(url);
    track(download ? 'download' : 'cta-click', {
      component: describeBlock(block),
      link: { url, text: link.getAttribute('aria-label') || link.textContent },
    });
  });
  window.addEventListener('scroll', () => {
    if (!getConsent().analytics) return;
    const height = document.documentElement.scrollHeight;
    if (!height) return;
    const percent = Math.min(100, ((window.scrollY + window.innerHeight) / height) * 100);
    [25, 50, 75, 100].forEach((depth) => {
      if (percent < depth || depths.has(depth)) return;
      depths.add(depth);
      track('scroll', { depth });
    });
  }, { passive: true });
}
