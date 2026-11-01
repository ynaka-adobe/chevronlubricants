import { getConsent, reportError } from './consent.js';

export const CONFIG = Object.freeze({
  reportSuiteId: 'acsmarketingb2bcontentexperiences',
  trackingServer: 'acsmarketing.sc.omtrdc.net',
  transport: 'direct Adobe collector (Parker pattern)',
  reporting: 'Suite variables and reporting not verified',
});

export const EVENTS = Object.freeze({
  'component-impression': 'event1',
  'cta-click': 'event2',
  download: 'event3',
  'form-start': 'event4',
  'form-submit': 'event5',
  scroll: 'event6',
});

export function isUSPage() {
  const locale = window.location.pathname.replace(/^\/content(?=\/)/, '').split('/')[1];
  const localized = /^[a-z]{2}(?:[-_][a-z]{2})?$/i.test(locale);
  return (!localized || ['en-us', 'en_us', 'us'].includes(locale.toLowerCase()))
    && document.querySelector('meta[name="analytics"]')?.content !== 'off';
}

export function cleanText(value, limit = 100) {
  // eslint-disable-next-line no-control-regex
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[redacted]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

export function cleanURL(value) {
  if (!value) return '';
  let url;
  try {
    url = new URL(value, window.location.href);
  } catch (error) {
    reportError('Invalid analytics URL discarded', error);
    return '';
  }
  if (!['http:', 'https:'].includes(url.protocol)) return '';
  const path = url.pathname.split('/').map((part) => {
    let decoded;
    try {
      decoded = decodeURIComponent(part);
    } catch (error) {
      reportError('Invalid encoded analytics path redacted', error);
      return '[redacted]';
    }
    if (/@|[a-f0-9]{24,}|\d{7,}/i.test(decoded)) return '[redacted]';
    return encodeURIComponent(cleanText(decoded, 120));
  }).join('/');
  return `${url.origin === window.location.origin ? '' : url.origin}${path}`.slice(0, 255);
}

export function toAnalyticsVars(entry) {
  const vars = {
    pageName: entry.page.path,
    g: `${window.location.origin}${entry.page.path}`,
    v1: entry.page.template,
    v2: 'us',
    c1: entry.page.path,
  };
  if (EVENTS[entry.event]) vars.events = EVENTS[entry.event];
  if (entry.component) {
    const { component } = entry;
    Object.assign(vars, {
      v3: component.id,
      c3: component.id,
      v4: component.block,
      c4: component.block,
      v5: component.position,
      v6: component.sectionIndex,
    });
  }
  if (entry.link) {
    Object.assign(vars, {
      v10: entry.link.text,
      v11: entry.link.url,
      v12: entry.link.file,
      c10: `main:${entry.link.type}`,
    });
  }
  if (entry.depth) vars.v13 = entry.depth;
  if (entry.form) vars.v14 = entry.form.name;
  if (entry.event !== 'page-view') {
    vars.pe = entry.event === 'download' ? 'lnk_d' : 'lnk_o';
    vars.pev2 = entry.event;
    if (entry.link?.url) vars.pev1 = entry.link.url;
  }
  return vars;
}

let visitor;
const pending = new Set();

export function revokeAnalytics() {
  visitor = null;
  pending.forEach((image) => {
    clearTimeout(image.collectionTimeout);
    image.onload = null;
    image.onerror = null;
    image.removeAttribute('src');
  });
  pending.clear();
  // Remove cookies left by a previous Analytics/Target implementation, not essential site cookies.
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (!/^(s_(fid|vi|sq|cc)|mbox|at_check|AMCVS?_.+)$/.test(name)) return;
    const parts = window.location.hostname.split('.');
    const domains = ['', ...parts.slice(0, -1).map((_, index) => `; Domain=.${parts.slice(index).join('.')}`)];
    domains.forEach((domain) => {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain}; SameSite=Lax`;
    });
  });
}

export function send(entry, onResult) {
  if (!getConsent().analytics || !isUSPage() || pending.size >= 20) {
    if (pending.size >= 20) reportError('Collection concurrency limit reached', new Error('Hit dropped'));
    onResult('not sent');
    return;
  }
  if (!visitor) visitor = crypto.randomUUID().replaceAll('-', '');
  const vars = {
    AQB: '1', ndh: '1', ce: 'UTF-8', vid: visitor, ...toAnalyticsVars(entry), AQE: '1',
  };
  const params = new URLSearchParams(Object.entries(vars)
    .filter(([, value]) => value !== undefined && value !== null && value !== ''));
  const image = new Image();
  pending.add(image);
  image.onload = () => {
    clearTimeout(image.collectionTimeout);
    pending.delete(image);
    if (getConsent().analytics) onResult('collector responded; reporting unverified');
  };
  image.onerror = (error) => {
    clearTimeout(image.collectionTimeout);
    pending.delete(image);
    if (getConsent().analytics) {
      reportError('Adobe collection request failed', error);
      onResult('collection failed');
    }
  };
  image.collectionTimeout = setTimeout(() => {
    image.onerror(new Error('Adobe collection timed out'));
    image.onload = null;
    image.onerror = null;
    image.removeAttribute('src');
  }, 15000);
  image.src = `https://${CONFIG.trackingServer}/b/ss/${CONFIG.reportSuiteId}/1/JS-2.0/s${Date.now()}${Math.random().toString().slice(2)}?${params}`;
  onResult('request issued; reporting unverified');
}
