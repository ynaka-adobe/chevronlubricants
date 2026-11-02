import { isUSPage } from './martech/analytics.js';
import {
  clearCookies, getConsent, onConsentChange, reportError,
} from './martech/consent.js';
import { PERSONAS, getB2bPersona, initPersona } from './persona.js';

let initialized = false;
let active = '';
let status = 'Waiting for personalization consent';
let loading;
let generation = 0;
let granted;
let queue = Promise.resolve();

function currentProfilePersona() {
  const index = PERSONAS.indexOf(getB2bPersona());
  return getConsent().personalization && index >= 0 ? String(index + 1) : '';
}

export function targetState() {
  const consented = getConsent().personalization;
  return { persona: currentProfilePersona(), status, consented };
}

function announce() {
  window.dispatchEvent(new Event('chevron:target-persona-changed'));
}

function clearTargetCookies() {
  clearCookies(/^(mbox|at_check)$/, { includeParentDomains: false });
}

function loadLibrary() {
  if (window.adobe?.target?.getOffers) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/deps/at/vendor-at.js';
    script.async = true;
    script.onload = () => {
      if (!currentProfilePersona()) {
        if (!getConsent().personalization) clearTargetCookies();
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
  if (!currentProfilePersona() || version !== generation) return;
  await loadLibrary();
  if (!currentProfilePersona() || version !== generation) return;
  const selected = currentProfilePersona();
  await window.adobe.target.getOffers({
    request: {
      execute: { pageLoad: { profileParameters: { persona: selected } } },
    },
  });
  if (!currentProfilePersona()) {
    if (!getConsent().personalization) clearTargetCookies();
    return;
  }
  // Reconcile a selection change that arrived during the request.
  if (selected !== currentProfilePersona()) {
    await deliverProfile(generation);
    return;
  }
  if (version !== generation) return;
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
  const consented = getConsent().personalization;
  const latest = currentProfilePersona();
  if (granted === consented && active === latest) return;
  granted = consented;
  active = latest;
  generation += 1;
  window.targetGlobalSettings.enabled = Boolean(active);
  if (!granted) status = 'Personalization off; no Target profile transmission';
  else status = active ? 'Synchronizing Target profile' : 'No tab persona; Target inactive';
  announce();
  if (active) syncProfile(generation);
  else if (!granted) clearTargetCookies();
}

export default async function initTarget() {
  if (initialized || document.querySelector('meta[name="target"]')?.content !== '1'
    || !isUSPage() || /\.(?:stage-ue|ue)\.da\.live$/.test(window.location.hostname)) return;
  initialized = true;
  await initPersona();
  window.targetGlobalSettings = {
    ...window.targetGlobalSettings,
    enabled: false,
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
    const current = currentProfilePersona();
    return current ? { 'profile.persona': current } : {};
  };
  window.addEventListener('chevron:persona-selection-changed', refresh);
  onConsentChange(refresh);
}
