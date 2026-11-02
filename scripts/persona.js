import { clearCookies, getConsent, onConsentChange, reportError } from './martech/consent.js';

const KEY = 'chevron-target-persona';
export const PERSONAS = Object.freeze({
  1: 'Technical Evaluator',
  2: 'Business Decision Maker',
  3: 'Procurement and Sourcing Manager',
  4: 'Industry Researcher',
});
let initialized = false;
let selected = '';
let saved = false;
let saveFailed = false;
let granted;
let channel;

function readCookie() {
  const cookie = document.cookie.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${KEY}=`));
  const value = cookie?.slice(KEY.length + 1) || '';
  return /^[1-4]$/.test(value) ? value : '';
}

function querySelection() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  const persona = params.get('persona');
  if (/^[1-4]$/.test(p)) return p;
  return /^[1-4]$/.test(persona) ? persona : '';
}

function announce() {
  window.dispatchEvent(new Event('chevron:persona-selection-changed'));
}

function refresh() {
  if (!getConsent().personalization) return;
  const latest = readCookie();
  if (latest === selected && saved === Boolean(latest)) return;
  selected = latest;
  saved = Boolean(latest);
  saveFailed = false;
  announce();
}

export function initPersona() {
  if (initialized) return;
  initialized = true;
  const requested = querySelection();
  selected = requested;
  let applied = false;
  const params = new URLSearchParams(window.location.search);
  ['p', 'persona'].forEach((name) => {
    const value = params.get(name);
    const legacy = name === 'persona' && /^[a-z][a-z0-9-]*$/.test(value || '');
    if (value !== null && !/^[1-4]$/.test(value) && !legacy) {
      reportError(`Invalid ${name} ignored; use 1, 2, 3 or 4`, new Error('Invalid persona parameter'));
    }
  });
  if (window.BroadcastChannel) {
    channel = new BroadcastChannel(KEY);
    channel.addEventListener('message', refresh);
  } else {
    window.setInterval(refresh, 1000);
  }
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh();
  });
  onConsentChange((consent) => {
    if (granted === consent.personalization) return;
    const previous = granted;
    granted = consent.personalization;
    if (!granted) {
      const hadCookie = Boolean(readCookie());
      clearCookies(/^chevron-target-persona$/, { includeParentDomains: false });
      if (previous === true) selected = '';
      saved = false;
      saveFailed = false;
      if (hadCookie) channel?.postMessage('changed');
      announce();
      return;
    }
    // A grant in another tab may already have saved a newer selection.
    const latest = readCookie();
    if (!applied && requested && !(previous === false && latest)) {
      selected = requested;
      document.cookie = `${KEY}=${selected}; Path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
      saved = readCookie() === selected;
      saveFailed = !saved;
      if (saveFailed) reportError('Browser-session persona could not be saved', new Error('Session cookie unavailable'));
      else channel?.postMessage('changed');
    } else {
      selected = latest;
      saved = Boolean(latest);
      saveFailed = false;
    }
    applied = true;
    announce();
  });
}

export function getPersonaState() {
  initPersona();
  return { id: selected, label: PERSONAS[selected] || '', saved, saveFailed };
}

export function getPersistedPersona() {
  return getConsent().personalization ? readCookie() : '';
}

export function getContentPersona() {
  const { id } = getPersonaState();
  const params = new URLSearchParams(window.location.search);
  const legacy = params.get('persona');
  if (!querySelection() && /^[a-z][a-z0-9-]*$/.test(legacy || '')) return legacy;
  return id || 'default';
}
