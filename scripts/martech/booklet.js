import { addStyle, element, openConsent, reportError } from './consent.js';
import { CONFIG } from './analytics.js';
import { subscribe } from './instrument.js';
import { targetState } from '../target.js';
import { getPersonaState } from '../persona.js';

const CATEGORIES = {
  'page-view': 'Page',
  'component-impression': 'Impressions',
  'cta-click': 'Engagement',
  download: 'Downloads',
  scroll: 'Scroll',
  'form-start': 'Form',
  'form-submit': 'Form',
};
let initialized = false;

export function summarize(events) {
  const counts = new Map();
  const components = new Map();
  const links = new Map();
  let scroll = 0;
  events.forEach((entry) => {
    counts.set(entry.event, (counts.get(entry.event) || 0) + 1);
    if (entry.component) {
      const { component } = entry;
      const key = `${component.position}: ${component.id}`;
      const row = components.get(key) || {
        label: key, impressions: 0, clicks: 0, downloads: 0, section: component.sectionIndex,
      };
      if (entry.event === 'component-impression') row.impressions += 1;
      if (entry.event === 'cta-click') row.clicks += 1;
      if (entry.event === 'download') row.downloads += 1;
      components.set(key, row);
    }
    if (entry.link && ['cta-click', 'download'].includes(entry.event)) {
      const label = entry.link.text || entry.link.file || entry.link.url || 'Button';
      const key = JSON.stringify([entry.event, label, entry.link.url]);
      const row = links.get(key) || {
        label, url: entry.link.url, type: entry.event === 'download' ? 'download' : entry.link.type, count: 0,
      };
      row.count += 1;
      links.set(key, row);
    }
    if (entry.event === 'scroll') scroll = Math.max(scroll, entry.depth);
  });
  return {
    counts,
    components: [...components.values()].sort((a, b) => b.impressions - a.impressions),
    links: [...links.values()].sort((a, b) => b.count - a.count),
    scroll,
  };
}

function section(title, content) {
  const node = element('section', undefined, 'chevron-booklet-section');
  node.append(element('h3', title), content);
  return node;
}

function bars(rows, valueOf, noteOf) {
  const list = element('ul', undefined, 'chevron-booklet-bars');
  const max = Math.max(1, ...rows.map(valueOf));
  rows.forEach((row) => {
    const item = element('li');
    const head = element('div', undefined, 'chevron-booklet-bar-head');
    head.append(element('span', row.label), element('strong', String(valueOf(row))));
    const track = element('div', undefined, 'chevron-booklet-bar-track');
    track.setAttribute('aria-hidden', 'true');
    const fill = element('span');
    fill.style.width = `${Math.round((valueOf(row) / max) * 100)}%`;
    track.append(fill);
    item.append(head, track, element('span', noteOf(row), 'chevron-booklet-note'));
    list.append(item);
  });
  return list;
}

function observations(summary) {
  const list = element('dl', undefined, 'chevron-booklet-observations');
  const viewed = summary.components.filter((row) => row.impressions);
  const dormant = viewed.filter((row) => !row.clicks && !row.downloads);
  const engaged = [...summary.components]
    .sort((a, b) => (b.clicks + b.downloads) - (a.clicks + a.downloads))[0];
  const rows = [];
  if (engaged && (engaged.clicks || engaged.downloads)) {
    rows.push(['Most-engaged component', engaged.label, `${engaged.clicks} CTA clicks, ${engaged.downloads} downloads`]);
  }
  if (summary.links.length) {
    const [top] = summary.links;
    rows.push(['Most-clicked link', top.label, `${top.count} activations - ${top.type}`]);
  }
  if (dormant.length) {
    rows.push(['Viewed but not engaged', `${dormant.length} component${dormant.length === 1 ? '' : 's'}`, dormant.slice(0, 4).map((row) => row.label).join(', ')]);
  }
  rows.push(['Deepest scroll', summary.scroll ? `${summary.scroll}%` : 'Not yet measured', 'Milestones: 25 / 50 / 75 / 100%']);
  rows.forEach(([label, value, note]) => {
    const row = element('div');
    const detail = element('dd');
    detail.append(element('strong', value), element('span', note, 'chevron-booklet-note'));
    row.append(element('dt', label), detail);
    list.append(row);
  });
  return list;
}

function userTraits(events, open) {
  const traits = element('details', undefined, 'chevron-booklet-details chevron-booklet-traits');
  traits.open = open;
  const heading = element('summary', 'User Traits ');
  heading.append(element('span', 'CJA preview', 'chevron-booklet-badge'));
  traits.append(heading, element('p', 'A preview of person-level traits, computed in this browser from the '
    + 'selected persona and consented page events. No CJA API or unified CJA/AEP profile is connected.'));
  const list = element('dl', undefined, 'chevron-booklet-observations');
  const persona = getPersonaState();
  const fragments = [...document.querySelectorAll('main .persona-fragment-content[data-persona]')];
  const fallback = persona.id && fragments.some((node) => (
    node.dataset.selectedPersona === persona.id && node.dataset.persona !== persona.id
  ));
  const lastForm = events.findLast((entry) => entry.event === 'form-submit');
  const target = targetState();
  const rows = [
    ['Persona', persona.label || 'No B2B persona selected',
      `${persona.id ? `Persona id: ${persona.id}. ` : ''}${target.status}`,
      `${persona.saved ? 'Browser-session selection' : 'Not saved for the browser session'}`
        + `${fallback ? '. Content fallback displayed; no matching authored fragment is active.' : ''}`],
    ['Last form submit', lastForm?.form?.name || 'None yet',
      lastForm ? `Submitted at ${new Date(lastForm.timestamp).toLocaleTimeString()}`
        : 'Confirmed form submissions in the retained page events', 'Measured in this browser'],
    ...['Name', 'Email', 'Company'].map((name) => [name, '--',
      'Personal form field values are not collected', 'Not instrumented']),
  ];
  rows.forEach(([label, value, note, provenance]) => {
    const row = element('div');
    const detail = element('dd');
    detail.append(
      element('strong', value),
      element('span', note, 'chevron-booklet-note'),
      element('span', provenance, 'chevron-booklet-trait-source'),
    );
    row.append(element('dt', label), detail);
    list.append(row);
  });
  traits.append(list);
  return traits;
}

function dashboard(events, traitsOpen) {
  const summary = summarize(events);
  const content = document.createDocumentFragment();
  const stats = element('div', undefined, 'chevron-booklet-stats');
  const values = [
    ['Events', events.length],
    ['Components seen', summary.components.filter((row) => row.impressions).length],
    ['Links clicked', summary.links.reduce((total, row) => total + row.count, 0)],
    ['Scroll', summary.scroll ? `${summary.scroll}%` : '--'],
  ];
  values.forEach(([label, value]) => {
    const stat = element('div');
    stat.append(element('strong', String(value)), element('span', label));
    stats.append(stat);
  });
  content.append(stats, section('Observations', observations(summary)), userTraits(events, traitsOpen));
  const viewed = summary.components.filter((row) => row.impressions);
  content.append(section('Component impressions', viewed.length
    ? bars(viewed, (row) => row.impressions, (row) => {
      const ctr = `${((row.clicks / row.impressions) * 100).toFixed(1)}%`;
      return `Section ${row.section} - ${row.clicks} CTA clicks, ${row.downloads} downloads - CTR ${ctr}`;
    })
    : element('p', 'No components at 50% visibility yet.', 'chevron-booklet-empty')));
  content.append(section('Links clicked', summary.links.length
    ? bars(summary.links, (row) => row.count, (row) => `${row.type} - ${row.url || 'Button without URL'}`)
    : element('p', 'No link or button activations yet.', 'chevron-booklet-empty')));
  const categories = [...summary.counts].map(([event, count]) => ({
    label: CATEGORIES[event] || event, event, count,
  }));
  content.append(section('Events by category', bars(categories, (row) => row.count, (row) => `${row.event}: ${row.count}`)));
  const feed = element('ol', undefined, 'chevron-booklet-feed');
  events.slice(-60).reverse().forEach((entry) => {
    const detail = entry.link?.text || entry.link?.file || entry.form?.name || entry.component?.id
      || (entry.depth ? `${entry.depth}%` : entry.page.path);
    const item = element('li');
    const time = element('time', entry.timestamp.slice(11, 19));
    time.dateTime = entry.timestamp;
    item.append(
      element('span', entry.event, 'chevron-booklet-feed-event'),
      element('span', detail, 'chevron-booklet-feed-label'),
      time,
    );
    feed.append(item);
  });
  content.append(section('Live event feed', feed));
  return content;
}

export default function initBooklet() {
  if (initialized) return;
  initialized = true;
  const requested = new URLSearchParams(window.location.search).get('insights');
  let enabled = requested === '1';
  try {
    if (requested === '1') sessionStorage.setItem('chevron-insights', '1');
    if (requested === '0') sessionStorage.removeItem('chevron-insights');
    enabled = requested !== '0' && sessionStorage.getItem('chevron-insights') === '1';
  } catch (error) {
    reportError('Could not remember booklet visibility for this tab', error);
  }
  if (!enabled) return;
  addStyle('analytics-booklet');
  const panel = element('aside', undefined, 'chevron-booklet');
  panel.id = 'chevron-analytics-booklet';
  panel.setAttribute('aria-label', 'Live analytics booklet');
  panel.hidden = true;
  const header = element('div', undefined, 'chevron-booklet-header');
  const title = element('div', undefined, 'chevron-booklet-title');
  title.append(element('span', 'Live analytics', 'chevron-booklet-eyebrow'), element('h2', 'This page'));
  const count = element('span', '0', 'chevron-booklet-count');
  count.setAttribute('aria-label', 'Events in retained window');
  const close = element('button', 'X', 'chevron-booklet-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close analytics panel');
  header.append(title, count, close);
  const body = element('div', undefined, 'chevron-booklet-body');
  const status = element('p', undefined, 'chevron-booklet-status');
  status.setAttribute('role', 'status');
  const provenance = element('p', 'Measured in this browser - not Adobe reporting', 'chevron-booklet-provenance');
  const live = element('div');
  const details = element('details', undefined, 'chevron-booklet-details');
  details.append(element('summary', 'Consent and collection - reporting unverified'));
  const consentText = element('p');
  const collection = element('p');
  const manage = element('button', 'Cookie preferences');
  manage.type = 'button';
  manage.addEventListener('click', openConsent);
  details.append(
    consentText,
    element('h3', 'Adobe collection'),
    collection,
    element('p', `RSID: ${CONFIG.reportSuiteId}`),
    element('p', `Collector: ${CONFIG.trackingServer}`),
    element('p', CONFIG.reporting),
    element('p', 'No pre-consent events are retained or replayed. Revocation clears captured events. '
      + 'Visitor identity is page-scoped; visits are not comparable to production visit metrics.'),
    manage,
  );
  body.append(status, provenance, live, details);
  const footer = element('div', 'Current page, last 200 events; feed shows 60. Counts and CTR cover only this retained window.', 'chevron-booklet-footer');
  panel.append(header, body, footer);
  const toggle = element('button', undefined, 'chevron-booklet-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Live analytics booklet');
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.append(element('span', undefined, 'chevron-booklet-dot'), element('span', 'Insights'));
  document.body.append(panel, toggle);
  let current;
  let renderFrame = 0;
  const render = () => {
    renderFrame = 0;
    const { scrollTop } = body;
    const traitsOpen = live.querySelector('.chevron-booklet-traits')?.open ?? true;
    const traitsFocused = document.activeElement === live.querySelector('.chevron-booklet-traits > summary');
    live.replaceChildren(current.consent.analytics ? dashboard(current.events, traitsOpen)
      : element('p', 'No analytics events are captured or sent until analytics consent is granted.', 'chevron-booklet-empty'));
    if (!current.consent.analytics && current.consent.personalization) {
      live.append(userTraits([], traitsOpen));
    }
    if (traitsFocused && (current.consent.analytics || current.consent.personalization)) {
      live.querySelector('.chevron-booklet-traits > summary').focus({ preventScroll: true });
    }
    body.scrollTop = current.consent.analytics || current.consent.personalization ? scrollTop : 0;
  };
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    cancelAnimationFrame(renderFrame);
    renderFrame = 0;
    if (open) {
      render();
      close.focus({ preventScroll: true });
    } else toggle.focus({ preventScroll: true });
  }
  close.addEventListener('click', () => setOpen(false));
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('keydown', (event) => {
    if (event.altKey && event.shiftKey && event.code === 'KeyI') {
      event.preventDefault();
      setOpen(panel.hidden);
    } else if (event.key === 'Escape' && !panel.hidden
      && !document.querySelector('.chevron-consent-preferences[open]')) setOpen(false);
  });
  window.addEventListener('chevron:persona-changed', () => {
    if (current?.consent.analytics && !panel.hidden && !renderFrame) {
      renderFrame = requestAnimationFrame(render);
    }
  });
  window.addEventListener('chevron:target-persona-changed', () => {
    if (current && !panel.hidden && !renderFrame) renderFrame = requestAnimationFrame(render);
  });
  window.addEventListener('chevron:persona-selection-changed', () => {
    if (current && !panel.hidden && !renderFrame) renderFrame = requestAnimationFrame(render);
  });
  subscribe((next) => {
    const changed = !current || next.events.length !== current.events.length
      || next.events[0] !== current.events[0] || next.events.at(-1) !== current.events.at(-1)
      || next.consent.analytics !== current.consent.analytics
      || next.consent.personalization !== current.consent.personalization;
    current = next;
    const text = next.consent.analytics ? 'Analytics consent granted' : 'Waiting for analytics consent';
    if (status.textContent !== text) status.textContent = text;
    count.textContent = String(next.consent.analytics ? next.events.length : 0);
    toggle.dataset.analytics = String(next.consent.analytics);
    consentText.textContent = `Advertising/sale opt-out: ${next.consent.saleOptOut ? 'on' : 'not selected'}. `
      + `External media: ${next.consent.externalMedia ? 'on' : 'off'}. `
      + `Personalization: ${next.consent.personalization ? 'on' : 'off'}.`;
    collection.textContent = next.collection;
    if (!next.consent.analytics) {
      cancelAnimationFrame(renderFrame);
      render();
    } else if (changed && !panel.hidden && !renderFrame) {
      renderFrame = requestAnimationFrame(render);
    }
  });
  if (requested === '1') setOpen(true);
}
