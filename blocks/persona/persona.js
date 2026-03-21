import { getConfig, localizeUrl } from '../../scripts/ak.js';
import ENV from '../../scripts/utils/env.js';
import { loadFragment } from '../fragment/fragment.js';

const config = getConfig();

async function removePersona(a, e) {
  if (ENV === 'prod') {
    a.remove();
    return;
  }
  if (e) config.log(e);
  config.log(`Could not load: ${a.href}`);
}

async function loadLocalizedFragment(event) {
  const url = new URL(event.fragment);
  const localized = localizeUrl({ config, url });
  const path = localized?.pathname || url.pathname;

  try {
    const fragment = await loadFragment(path);
    return fragment;
  } catch {
    config.log(`Error fetching ${path} fragment`);
    return null;
  }
}

function getReplaceEl(a) {
  let current = a;
  const ancestor = a.closest('.section');

  while (current && current !== ancestor) {
    const childCount = current.parentElement.children.length;
    if (childCount <= 1) {
      current = current.parentElement;
    } else {
      break;
    }
  }

  return current;
}

async function loadPersonaFragment(a, event, defEvent) {
  if (!event.fragment) {
    a.remove();
    return;
  }

  let fragment = await loadLocalizedFragment(event);
  if (!fragment) fragment = await loadLocalizedFragment(defEvent);
  if (!fragment) {
    removePersona(a);
    return;
  }

  const elToReplace = getReplaceEl(a);
  const sections = fragment.querySelectorAll(':scope > .section');
  const children = sections.length === 1
    ? fragment.querySelectorAll(':scope > *')
    : [fragment];

  const wrapper = document.createElement('div');
  wrapper.className = 'persona-fragment-content';
  for (const child of children) {
    wrapper.appendChild(child);
  }
  elToReplace.insertAdjacentElement('afterend', wrapper);
  elToReplace.remove();
}

function getDate() {
  // URL override: ?start= uses that date instead of now for testing
  const startParam = new URL(window.location.href).searchParams.get('start');
  if (startParam) return new Date(startParam).getTime();

  const now = Date.now();
  if (ENV === 'prod') return now;

  // Attempt a simulated schedule via localStorage or ?schedule= param
  const sim = localStorage.getItem('aem-schedule')
    || new URL(window.location.href).searchParams.get('schedule');
  return sim * 1000 || now;
}

export default async function init(a) {
  const personaUrl = new URL(a.href);
  const pageParams = new URLSearchParams(window.location.search);

  if (pageParams.has('start')) personaUrl.searchParams.set('start', pageParams.get('start'));

  const resp = await fetch(personaUrl.href);
  if (!resp.ok) {
    await removePersona(a);
    return;
  }

  const { data } = await resp.json();
  data.reverse();

  // No persona in URL = equivalent to persona=default
  const persona = pageParams.get('persona') || 'default';
  const now = getDate();

  // Global default: prefer row with name/persona "default", else first undated entry
  const defaultMatch = (evt) => (evt.name === 'default' || evt.persona === 'default');
  const undated = (evt) => !(evt.start && evt.end);
  const defEvent = data.find((evt) => defaultMatch(evt) && undated(evt))
    || data.find(undated);

  // Match persona param against name or persona column (sheet headers vary)
  const personaMatch = (evt) => (evt.name === persona || evt.persona === persona);

  // Narrow to persona-named rows (default when no param)
  const activeData = data.filter(personaMatch);

  // Find the first date-matched entry in the persona set
  const found = activeData.find((evt) => {
    if (!(evt.start && evt.end)) return false;
    try {
      const start = Date.parse(evt.start);
      const end = Date.parse(evt.end);
      return now > start && now < end;
    } catch {
      config.log(`Could not evaluate persona event: ${evt.name || evt.persona}`);
      return false;
    }
  });

  // Persona-specific default (undated entry for this persona)
  const activeDefault = activeData.find(undated);

  const event = found || activeDefault || defEvent;

  if (!event) {
    await removePersona(a);
    return;
  }

  await loadPersonaFragment(a, event, defEvent);
}
