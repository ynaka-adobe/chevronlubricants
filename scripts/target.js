import { isUSPage } from './martech/analytics.js';
import {
  clearCookies, getConsent, onConsentChange, reportError,
} from './martech/consent.js';

const KEY = 'chevron-target-persona';
export const PERSONAS = Object.freeze({
  1: 'Technical Evaluator',
  2: 'Business Decision Maker',
  3: 'Procurement and Sourcing Manager',
  4: 'Industry Researcher',
});
let initialized = false;
let persona = '';
let status = 'Waiting for personalization consent';
let loading;
let generation = 0;
let granted;
let channel;
let queue = Promise.resolve();

export function targetState() {
  const consented = getConsent().personalization;
  return { persona: consented ? persona : '', status, consented };
}

function announce() {
  window.dispatchEvent(new Event('chevron:target-persona-changed'));
}

function sessionPersona() {
  const cookie = document.cookie.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${KEY}=`));
  const value = cookie?.slice(KEY.length + 1) || '';
  return /^[1-4]$/.test(value) ? value : '';
}

function clearTargetCookies(includePersona = false) {
  const pattern = includePersona ? /^(chevron-target-persona|mbox|at_check)$/ : /^(mbox|at_check)$/;
  clearCookies(pattern, { includeParentDomains: false });
}

function loadLibrary() {
  if (window.adobe?.target?.getOffers) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/deps/at/vendor-at.js';
    script.async = true;
    script.onload = () => {
      if (!getConsent().personalization || !sessionPersona()) {
        clearTargetCookies();
        resolve();
      } else if (window.adobe?.target?.getOffers) resolve();
      else reject(new Error('Target library loaded without getOffers'));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error('Could not load the Adobe Target library'));
    };
    document.head.append(script);
  }).finally(() => { loading = null; });
  return loading;
}

async function deliverProfile(version) {
  if (!getConsent().personalization || !sessionPersona() || version !== generation) return;
  await loadLibrary();
  if (!getConsent().personalization || !sessionPersona() || version !== generation) return;
  const selected = sessionPersona();
  await window.adobe.target.getOffers({
    request: {
      execute: { pageLoad: { profileParameters: { persona: selected } } },
    },
  });
  if (!getConsent().personalization || !sessionPersona()) {
    clearTargetCookies();
    return;
  }
  if (version !== generation) return;
  // Reconcile a cross-tab change even when its notification arrived during the request.
  if (selected !== sessionPersona()) {
    persona = sessionPersona();
    await deliverProfile(version);
    return;
  }
  status = 'Target responded; audience membership not independently verified';
  announce();
}

function syncProfile(version) {
  const deliver = () => deliverProfile(version);
  const task = navigator.locks
    ? navigator.locks.request('chevron-target-profile', deliver)
    : queue.then(deliver);
  queue = task.catch((error) => {
    reportError('Target persona synchronization failed', error);
    if (!getConsent().personalization) clearTargetCookies();
    if (getConsent().personalization && version === generation) {
      status = 'Target synchronization failed';
      announce();
    }
  });
}

function refresh() {
  if (!getConsent().personalization) return;
  const latest = sessionPersona();
  if (latest === persona) return;
  persona = latest;
  generation += 1;
  window.targetGlobalSettings.enabled = Boolean(persona);
  status = persona ? 'Synchronizing Target profile' : 'No browser-session persona; Target inactive';
  announce();
  if (persona) syncProfile(generation);
  else clearTargetCookies();
}

export default function initTarget() {
  if (initialized || document.querySelector('meta[name="target"]')?.content !== '1'
    || !isUSPage() || /\.(?:stage-ue|ue)\.da\.live$/.test(window.location.hostname)) return;
  initialized = true;
  const requested = new URLSearchParams(window.location.search).get('p');
  let applied = false;
  if (requested !== null && !/^[1-4]$/.test(requested)) {
    reportError('Invalid Target persona ignored; use p=1, 2, 3 or 4', new Error('Invalid p parameter'));
  }
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
    granted = consent.personalization;
    generation += 1;
    if (!granted) {
      const hadPersona = Boolean(sessionPersona());
      persona = '';
      status = 'Personalization off; browser-session persona cleared';
      window.targetGlobalSettings = { ...window.targetGlobalSettings, enabled: false };
      clearTargetCookies(true);
      if (hadPersona) channel?.postMessage('changed');
      announce();
      return;
    }
    if (!applied && /^[1-4]$/.test(requested)) {
      document.cookie = `${KEY}=${requested}; Path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
      if (sessionPersona() !== requested) {
        status = 'Browser-session persona could not be saved; Target inactive';
        reportError(status, new Error('Session cookie unavailable'));
        announce();
        return;
      }
      channel?.postMessage('changed');
    }
    applied = true;
    persona = sessionPersona();
    window.targetGlobalSettings = {
      ...window.targetGlobalSettings,
      enabled: Boolean(persona),
      secureOnly: true,
      overrideMboxEdgeServer: false,
      cookieDomain: window.location.hostname,
      thirdPartyCookiesEnabled: false,
      pageLoadEnabled: false,
      viewsEnabled: false,
      bodyHidingEnabled: false,
      deviceDetectionEnabled: false,
    };
    window.targetPageParamsAll = () => {
      const current = getConsent().personalization ? sessionPersona() : '';
      return current ? { 'profile.persona': current } : {};
    };
    status = persona ? 'Synchronizing Target profile' : 'No browser-session persona; Target inactive';
    announce();
    if (persona) syncProfile(generation);
  });
}
