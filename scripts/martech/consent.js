const KEY = 'chevron-consent';
const VERSION = 1;
const LIFETIME = 180 * 24 * 60 * 60 * 1000;
const listeners = new Set();
let state = null;
let restored = false;
let initialized = false;
let banner;
let preferences;

export function reportError(message, error) {
  // eslint-disable-next-line no-console
  console.error(`[Chevron privacy] ${message}`, error);
}

export function clearCookies(pattern, { includeParentDomains = true } = {}) {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (!pattern.test(name)) return;
    const parts = window.location.hostname.split('.');
    const parents = includeParentDomains ? parts.slice(0, -1) : parts.slice(0, 1);
    const domains = ['', ...parents.map((_, index) => `; Domain=.${parts.slice(index).join('.')}`)];
    domains.forEach((domain) => {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain}; SameSite=Lax`;
    });
  });
}

function restore() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    if (value === null) return null;
    const valid = value.version === VERSION && Number.isFinite(value.updatedAt)
      && value.updatedAt <= Date.now() && Date.now() - value.updatedAt < LIFETIME
      && typeof value.analytics === 'boolean' && typeof value.externalMedia === 'boolean'
      && (value.personalization === undefined || typeof value.personalization === 'boolean')
      && typeof value.saleOptOut === 'boolean';
    if (!valid) {
      localStorage.removeItem(KEY);
      reportError('Expired or invalid consent discarded', new Error('A new choice is required'));
      return null;
    }
    return value;
  } catch (error) {
    reportError('Could not restore consent; optional collection remains off', error);
    return null;
  }
}

export function getConsent() {
  if (!restored) {
    state = restore();
    restored = true;
  }
  return {
    necessary: true,
    analytics: state?.analytics === true,
    externalMedia: state?.externalMedia === true,
    personalization: state?.personalization === true
      && navigator.globalPrivacyControl !== true && state?.saleOptOut !== true,
    saleOptOut: navigator.globalPrivacyControl === true || state?.saleOptOut === true,
    decided: state !== null,
  };
}

export function onConsentChange(listener) {
  listeners.add(listener);
  listener(getConsent());
  return () => listeners.delete(listener);
}

function notify() {
  document.documentElement.dataset.consent = getConsent().analytics ? 'analytics' : 'necessary';
  listeners.forEach((listener) => listener(getConsent()));
}

export function setConsent({
  analytics = false, externalMedia = false, personalization = false, saleOptOut = false,
}) {
  restored = true;
  state = {
    version: VERSION,
    updatedAt: Date.now(),
    analytics: analytics === true,
    externalMedia: externalMedia === true,
    personalization: personalization === true && saleOptOut !== true
      && navigator.globalPrivacyControl !== true,
    saleOptOut: saleOptOut === true || navigator.globalPrivacyControl === true,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (error) {
    reportError('Choice applies to this page only; consent could not be saved', error);
    const status = document.querySelector('[data-consent-status]');
    if (status) status.textContent = 'Your choice could not be saved. It applies to this page only.';
  }
  notify();
}

export function addStyle(name) {
  const { href } = new URL(`../../styles/${name}.css`, import.meta.url);
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.onerror = (error) => reportError(`Could not load ${name} styles`, error);
  document.head.append(link);
}

export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, action, parent) {
  const node = element('button', text);
  node.type = 'button';
  node.addEventListener('click', action);
  parent.append(node);
  return node;
}

function dismiss() {
  const inBanner = banner.contains(document.activeElement);
  banner.hidden = true;
  if (preferences.open) preferences.close();
  if (inBanner) document.querySelector('main')?.focus({ preventScroll: true });
}

function decide(choice) {
  setConsent(choice);
  dismiss();
}

export function openConsent() {
  if (!initialized) throw new Error('Consent UI has not been initialized');
  const consent = getConsent();
  preferences.querySelector('[name="analytics"]').checked = consent.analytics;
  preferences.querySelector('[name="externalMedia"]').checked = consent.externalMedia;
  preferences.querySelector('[name="personalization"]').checked = consent.personalization;
  preferences.querySelector('[name="personalization"]').disabled = navigator.globalPrivacyControl === true;
  if (!preferences.open) preferences.showModal();
}

function build() {
  addStyle('consent');
  banner = element('section', undefined, 'chevron-consent');
  banner.setAttribute('aria-label', 'Your privacy choices');
  const copy = element('div', undefined, 'chevron-consent-copy');
  copy.append(element('p', 'This website uses tracking technologies to measure content performance and personalize content. '
    + 'Optional technologies remain off until you choose. You can accept all, reject all, or opt out '
    + 'of sale of personal data and targeted advertising. Change your choice at any time in Cookie preferences.'));
  const policy = element('a', 'Cookie Policy');
  policy.href = 'https://www.chevron.com/privacy/global-cookie-statement';
  const privacy = element('a', 'Privacy Policy');
  privacy.href = 'https://www.chevron.com/privacy';
  copy.append(policy, document.createTextNode(' '), privacy);
  const actions = element('div', undefined, 'chevron-consent-actions');
  button('Opt out of sale of personal data and Targeted Advertising', () => decide({ saleOptOut: true }), actions);
  button('Reject All', () => decide({}), actions);
  button('Accept All', () => decide({ analytics: true, externalMedia: true, personalization: true }), actions);
  const close = button('X', dismiss, actions);
  close.setAttribute('aria-label', 'Close cookie banner without changing consent');
  close.className = 'chevron-consent-close';
  banner.append(copy, actions);
  banner.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dismiss();
  });

  preferences = element('dialog', undefined, 'chevron-consent-preferences');
  preferences.setAttribute('aria-labelledby', 'chevron-preferences-title');
  preferences.append(element('h2', 'Cookie preferences'));
  preferences.querySelector('h2').id = 'chevron-preferences-title';
  preferences.append(element('p', 'Strictly necessary storage remembers your choice. '
    + 'Adobe Target uses a separate personalization choice to store a demo persona for this browser session '
    + 'and send it to your Target visitor profile, along with page URL, referrer and browser context. '
    + 'Form field values are not collected. '
    + 'Global Privacy Control is honored as an advertising/sale opt-out, not analytics consent.'));
  [
    ['analytics', 'Analytics and performance'],
    ['externalMedia', 'External videos and embedded tools'],
    ['personalization', 'Personalization (Adobe Target demo personas)'],
  ].forEach(([name, label]) => {
    const row = element('label');
    const input = element('input');
    input.type = 'checkbox';
    input.name = name;
    row.append(input, document.createTextNode(label));
    if (name === 'personalization' && navigator.globalPrivacyControl === true) input.disabled = true;
    preferences.append(row);
  });
  button('Save my choices', () => decide({
    analytics: preferences.querySelector('[name="analytics"]').checked,
    externalMedia: preferences.querySelector('[name="externalMedia"]').checked,
    personalization: preferences.querySelector('[name="personalization"]').checked,
    saleOptOut: preferences.querySelector('[name="personalization"]').checked
      ? false : getConsent().saleOptOut,
  }), preferences);
  button('Reject All', () => decide({}), preferences);
  button('Close without saving', () => preferences.close(), preferences);
  const status = element('p');
  status.dataset.consentStatus = '';
  status.setAttribute('role', 'status');
  const entry = element('div', undefined, 'chevron-privacy-tools');
  button('Cookie preferences', openConsent, entry).dataset.consentReopen = '';
  entry.append(status);
  document.body.append(entry, banner, preferences);
}

export function initConsent() {
  if (initialized) return;
  initialized = true;
  state = restore();
  restored = true;
  build();
  banner.hidden = state !== null;
  notify();
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !preferences.open && !banner.hidden) dismiss();
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY && event.key !== null) return;
    state = restore();
    banner.hidden = state !== null;
    notify();
  });
}
