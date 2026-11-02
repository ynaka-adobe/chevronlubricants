import { clearCookies, getConsent, reportError } from './martech/consent.js';

export const PERSONAS = Object.freeze([
  'Technical Evaluator',
  'Business Decision Maker',
  'Procurement & Sourcing Manager',
  'Industry Researcher',
]);
let b2bPersona = null;
let marketingPersona = null;
let saved = true;
let revision = 0;
let initialization;
let mapPromise;
let indexPromise;
const diagnostics = new Set();

function diagnose(message) {
  if (diagnostics.has(message)) return;
  diagnostics.add(message);
  reportError(message, new Error('Persona filtering is using its documented fail-open behavior'));
}

function rowsFrom(json) {
  const rows = json.data || json[json[':names']?.[0]]?.data;
  if (!Array.isArray(rows)) throw new Error('Expected sheet/index data rows');
  return rows;
}

export function loadPersonaMap() {
  if (!mapPromise) {
    mapPromise = (async () => {
      try {
        const response = await fetch('/en-us/home/schedules/persona-map.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const map = new Map();
        rowsFrom(await response.json()).forEach((row) => {
          const slug = String(row.marketingPersona || '').trim();
          const role = String(row.b2bPersona || '').trim();
          if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)
            || (!PERSONAS.includes(role) && role !== 'default') || map.has(slug)) {
            diagnose(`Invalid or duplicate persona-map row ignored: ${slug}`);
            return;
          }
          map.set(slug, role === 'default' ? null : role);
        });
        return map;
      } catch (error) {
        reportError('Persona map unavailable; unknown campaign inputs will not select a role', error);
        return new Map();
      }
    })();
  }
  return mapPromise;
}

function persist() {
  try {
    [['b2bPersona', b2bPersona], ['marketingPersona', marketingPersona]].forEach(([key, value]) => {
      if (value) sessionStorage.setItem(key, value);
      else sessionStorage.removeItem(key);
    });
    saved = true;
  } catch (error) {
    saved = false;
    reportError('Persona preference applies to this page only; tab storage is unavailable', error);
  }
}

function apply(coarse, marketing, { store = true, telemetry = true } = {}) {
  const changed = coarse !== b2bPersona || marketing !== marketingPersona;
  b2bPersona = coarse;
  marketingPersona = marketing;
  if (store) persist();
  if (!changed) return;
  document.dispatchEvent(new CustomEvent('persona:change', {
    detail: { b2bPersona, marketingPersona },
  }));
  window.dispatchEvent(new Event('chevron:persona-selection-changed'));
  if (telemetry && getConsent().analytics) {
    const persona = b2bPersona;
    const path = window.location.pathname;
    import('./martech/instrument.js').then(({ track }) => {
      track('persona-filter', { persona, path });
    }).catch((error) => reportError('Could not record persona selection', error));
  }
}

export function resolveB2bPersona(value) {
  if (PERSONAS.includes(value)) return value;
  return /^[1-4]$/.test(value || '') ? PERSONAS[Number(value) - 1] : null;
}

export function initPersona() {
  if (initialization) return initialization;
  initialization = (async () => {
    const version = revision;
    // Do not import the superseded cross-tab selection into this per-tab model.
    clearCookies(/^chevron-target-persona$/, { includeParentDomains: false });
    const locale = window.location.pathname.replace(/^\/content(?=\/)/, '').split('/')[1];
    if (/^[a-z]{2}(?:[-_][a-z]{2})?$/i.test(locale)
      && !['en-us', 'en_us', 'us'].includes(locale.toLowerCase())) return;
    let coarse = null;
    let marketing = null;
    try {
      const stored = sessionStorage.getItem('b2bPersona');
      const campaign = sessionStorage.getItem('marketingPersona');
      if (stored && !PERSONAS.includes(stored)) diagnose('Invalid stored B2B persona ignored');
      if (campaign && !/^[a-z0-9][a-z0-9-]*$/.test(campaign)) {
        diagnose('Invalid stored marketing persona ignored');
      }
      coarse = PERSONAS.includes(stored) ? stored : null;
      marketing = /^[a-z0-9][a-z0-9-]*$/.test(campaign || '') ? campaign : null;
    } catch (error) {
      saved = false;
      reportError('Could not restore the tab persona preference', error);
    }
    const params = new URLSearchParams(window.location.search);
    b2bPersona = coarse;
    marketingPersona = marketing;
    const inputs = ['p', 'persona'].filter((key) => params.has(key)).map((key) => params.get(key));
    if (!inputs.length) {
      return;
    }
    for (const value of inputs) {
      const role = resolveB2bPersona(value);
      if (role) {
        if (version === revision) apply(role, marketing);
        return;
      }
      // Only fine campaign values need the author-editable map.
      // eslint-disable-next-line no-await-in-loop
      const map = await loadPersonaMap();
      if (version !== revision) return;
      if (map.has(value)) {
        apply(map.get(value), value);
        return;
      }
      diagnose('Unknown persona URL input ignored');
    }
    if (version === revision) {
      diagnose('No recognized persona URL input; this page is unfiltered without overwriting the saved preference');
      apply(null, null, { store: false, telemetry: false });
    }
  })();
  return initialization;
}

export const getB2bPersona = () => b2bPersona;
export const getActivePersona = getB2bPersona;
export const getMarketingPersona = () => marketingPersona;
export const getPersonaState = () => ({ b2bPersona, marketingPersona, saved });

export function setActivePersona(value, { updateURL = false } = {}) {
  if (value !== null && value !== '' && !PERSONAS.includes(value)) {
    diagnose('Invalid persona selection ignored');
    return;
  }
  revision += 1;
  if (updateURL) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('p', value);
    else {
      url.searchParams.delete('p');
      url.searchParams.delete('persona');
    }
    window.history.replaceState(null, '', url);
  }
  apply(value || null, value ? marketingPersona : null);
}

export function parsePersonas(value) {
  const values = (Array.isArray(value) ? value : String(value || '').split(','))
    .map((item) => String(item).trim()).filter(Boolean);
  if (values.some((item) => !PERSONAS.includes(item))) diagnose('Unknown authored persona label; exact canonical casing is required');
  return [...new Set(values)];
}

export function getPagePersonas() {
  return parsePersonas(document.querySelector('meta[name="persona"]')?.content)
    .filter((value) => PERSONAS.includes(value));
}

export const pageHasPersona = (persona) => PERSONAS.includes(persona)
  && getPagePersonas().includes(persona);

function internalPath(href) {
  if (!href) return null;
  try {
    const url = new URL(href, window.location.href);
    const ownSite = url.origin === window.location.origin
      || url.hostname === 'chevronlubricants.ynaka-adobe.com'
      || /^.+--chevronlubricants--ynaka-adobe\.aem\.(page|live|network)$/.test(url.hostname);
    if (!ownSite || !['http:', 'https:'].includes(url.protocol)
      || /\.(?:pdf|mp4|png|jpe?g|webp|svg|json)$/i.test(url.pathname)) return null;
    return decodeURI(url.pathname).replace(/^\/content(?=\/)/, '')
      .replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
  } catch (error) {
    reportError('Invalid card URL cannot inherit a persona', error);
    return null;
  }
}

export function loadQueryIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      try {
        const response = await fetch('/query-index.json?limit=1000');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        const rows = rowsFrom(json);
        if (json.total > rows.length) diagnose('Persona index is incomplete; unindexed cards remain unfiltered');
        if (!rows.some((row) => Object.hasOwn(row, 'persona'))) {
          diagnose('Query index has no persona column; publish page metadata and reindex');
        } else if (!rows.some((row) => String(row.persona || '').trim())) {
          diagnose('Query index has no populated persona values; publish page metadata and reindex');
        }
        return new Map(rows.map((row) => [internalPath(row.path), row]).filter(([path]) => path));
      } catch (error) {
        reportError('Query index unavailable; cards without explicit personas remain visible', error);
        return new Map();
      }
    })();
  }
  return indexPromise;
}

function primaryPath(card) {
  const links = [...card.querySelectorAll('a[href]')];
  return internalPath((links.find((link) => link.textContent.trim()) || links[0])?.href);
}

export function setCardPersona(card, value) {
  const personas = parsePersonas(value);
  if (personas.length) card.dataset.persona = personas.join(', ');
  else card.removeAttribute('data-persona');
}

export function resolveCardPersona(card, index = new Map()) {
  const cell = card.lastElementChild;
  if (cell && /^persona\s*:/i.test(cell.textContent.trim())) {
    card.dataset.personaSource = 'explicit';
    setCardPersona(card, cell.textContent.trim().replace(/^persona\s*:\s*/i, ''));
    cell.remove();
  } else if (card.dataset.personaSource !== 'explicit') {
    const row = index.get(primaryPath(card));
    setCardPersona(card, row?.persona);
    if (card.dataset.persona) card.dataset.personaSource = 'index';
  }
  return card.dataset.persona || null;
}

export async function preparePersonaCards(rows) {
  rows.forEach((row) => resolveCardPersona(row));
  const needsIndex = rows.some((row) => row.dataset.personaSource !== 'explicit' && primaryPath(row));
  const [, index] = await Promise.all([initPersona(), needsIndex ? loadQueryIndex() : new Map()]);
  rows.forEach((row) => resolveCardPersona(row, index));
}

export function copyCardPersona(source, card) {
  if (source.hasAttribute('data-persona')) card.dataset.persona = source.dataset.persona;
}

export function matchesPersona(card, persona = getB2bPersona()) {
  return !persona || !card.dataset.persona
    || parsePersonas(card.dataset.persona).includes(persona);
}

export function bindPersonaFilter(block, cards, { onChange } = {}) {
  const empty = document.createElement('p');
  empty.className = 'persona-filter-empty';
  empty.setAttribute('role', 'status');
  empty.textContent = 'No items match the selected persona.';
  empty.hidden = true;
  block.append(empty);
  const applyFilter = () => {
    const active = getB2bPersona();
    let shown = 0;
    cards.forEach((card) => {
      const matches = matchesPersona(card, active);
      card.hidden = !matches;
      card.classList.toggle('persona-filtered-out', !matches);
      if (matches) shown += 1;
    });
    empty.hidden = Boolean(shown);
    onChange?.(active);
  };
  const changed = () => {
    if (block.isConnected) applyFilter();
    else {
      document.removeEventListener('persona:change', changed);
    }
  };
  document.addEventListener('persona:change', changed);
  applyFilter();
}
