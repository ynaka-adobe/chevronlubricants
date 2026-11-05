import {
  PERSONAS, getPersonaState, initPersona, loadPersonaMap, setPersonaSelection,
} from '../../scripts/persona.js';
import { getConsent, onConsentChange, reportError } from '../../scripts/martech/consent.js';

const sidekicks = new Set();

function frames(root) {
  const result = [...root.querySelectorAll('iframe')];
  root.querySelectorAll('*').forEach((element) => {
    if (element.shadowRoot) result.push(...frames(element.shadowRoot));
  });
  return result;
}

function palettes() {
  return [...sidekicks].filter((sk) => sk.isConnected)
    .flatMap((sk) => frames(sk.shadowRoot || sk)).filter((frame) => {
      const url = new URL(frame.src, window.location.href);
      const ownSite = url.origin === window.location.origin
        || url.hostname === 'chevronlubricants.ynaka-adobe.com'
        || /^.+--chevronlubricants--ynaka-adobe\.aem\.(page|live|network)$/.test(url.hostname);
      return ownSite && ['http:', 'https:'].includes(url.protocol)
        && url.pathname === '/tools/persona/persona.html';
    });
}

async function snapshot() {
  await initPersona();
  const map = await loadPersonaMap();
  const consent = getConsent();
  return {
    ...getPersonaState(),
    roles: PERSONAS,
    marketingPersonas: [...map].map(([slug, role]) => ({ slug, role })),
    pageURL: window.location.href,
    consent: { personalization: consent.personalization, analytics: consent.analytics },
  };
}

function reply(frame, data) {
  frame.contentWindow.postMessage({ source: 'chevron-persona-page', ...data }, new URL(frame.src).origin);
}

async function broadcast() {
  const current = palettes();
  if (!current.length) return;
  try {
    const state = await snapshot();
    current.forEach((frame) => reply(frame, { action: 'state', state }));
  } catch (error) {
    reportError('Could not refresh the author Persona palette', error);
  }
}

window.addEventListener('message', async (event) => {
  const request = event.data;
  if (request?.source !== 'chevron-persona-app'
    || !Number.isSafeInteger(request.id) || !['get', 'apply'].includes(request.action)) return;
  const frame = palettes().find((candidate) => candidate.contentWindow === event.source
    && new URL(candidate.src).origin === event.origin);
  if (!frame) return;
  try {
    await initPersona();
    if (request.action === 'apply'
      && (!request.selection || !await setPersonaSelection(request.selection))) {
      throw new Error('The persona selection was not recognized; refresh the author map and try again.');
    }
    reply(frame, { action: 'state', id: request.id, state: await snapshot() });
  } catch (error) {
    reportError('Author Persona action failed', error);
    reply(frame, { action: 'error', id: request.id, message: error.message });
  }
});

document.addEventListener('persona:change', broadcast);
onConsentChange(broadcast);

export default function init(sk) {
  sidekicks.add(sk);
}
