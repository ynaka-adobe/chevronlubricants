import { getConfig, localizeUrl } from '../../scripts/ak.js';
import ENV from '../../scripts/utils/env.js';
import { loadFragment } from '../fragment/fragment.js';
import { getContentPersona, initPersona } from '../../scripts/persona.js';

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

async function createPersonaFragment(event, defEvent) {
  let resolvedEvent = event;
  let fragment = await loadLocalizedFragment(event);
  if (!fragment && defEvent) {
    resolvedEvent = defEvent;
    fragment = await loadLocalizedFragment(defEvent);
  }
  if (!fragment) return null;

  const sections = fragment.querySelectorAll(':scope > .section');
  const children = sections.length === 1
    ? fragment.querySelectorAll(':scope > *')
    : [fragment];

  const wrapper = document.createElement('div');
  wrapper.className = 'persona-fragment-content';
  wrapper.dataset.persona = resolvedEvent.persona || resolvedEvent.name || 'default';
  for (const child of children) {
    wrapper.appendChild(child);
  }
  return wrapper;
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
  initPersona();
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

  // Global default: prefer row with name/persona "default", else first undated entry
  const defaultMatch = (evt) => (evt.name === 'default' || evt.persona === 'default');
  const undated = (evt) => !(evt.start && evt.end);
  const defEvent = data.find((evt) => defaultMatch(evt) && undated(evt))
    || data.find(undated);

  let slot = getReplaceEl(a);
  let revision = 0;
  const render = async () => {
    revision += 1;
    const version = revision;
    const persona = getContentPersona();
    const now = getDate();
    const activeData = data.filter((evt) => evt.name === persona || evt.persona === persona);
    const found = activeData.find((evt) => {
      if (!(evt.start && evt.end)) return false;
      const start = Date.parse(evt.start);
      const end = Date.parse(evt.end);
      return now > start && now < end;
    });
    const event = found || activeData.find(undated) || defEvent;
    const wrapper = event?.fragment ? await createPersonaFragment(event, defEvent) : null;
    if (version !== revision || !slot.isConnected) return;
    if (!wrapper) {
      await removePersona(a);
      if (version !== revision || !slot.isConnected) return;
      const placeholder = document.createComment('Persona content unavailable');
      slot.replaceWith(placeholder);
      slot = placeholder;
      return;
    }
    wrapper.dataset.selectedPersona = persona;
    slot.replaceWith(wrapper);
    slot = wrapper;
    window.dispatchEvent(new Event('chevron:persona-changed'));
  };
  const changed = () => {
    if (!slot.isConnected) {
      window.removeEventListener('chevron:persona-selection-changed', changed);
      return;
    }
    render().catch((error) => config.log('Could not update persona content', error));
  };
  window.addEventListener('chevron:persona-selection-changed', changed);
  await render();
}
