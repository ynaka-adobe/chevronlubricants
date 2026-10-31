import { addStyle, element, openConsent, reportError } from './consent.js';
import { CONFIG } from './analytics.js';
import { subscribe } from './instrument.js';

let initialized = false;

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
  panel.setAttribute('aria-labelledby', 'chevron-booklet-title');
  panel.hidden = true;
  const title = element('h2', 'Live analytics booklet');
  title.id = 'chevron-booklet-title';
  const close = element('button', 'Close booklet');
  close.type = 'button';
  const body = element('div', undefined, 'chevron-booklet-body');
  panel.append(title, close, body);
  const toggle = element('button', 'Live analytics booklet', 'chevron-booklet-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');
  document.querySelector('.chevron-privacy-tools').append(toggle);
  document.body.append(panel);
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) close.focus({ preventScroll: true });
    else toggle.focus({ preventScroll: true });
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
  subscribe(({ events, consent, collection }) => {
    const content = element('div');
    const status = element('p', consent.analytics ? 'Analytics consent granted' : 'Waiting for analytics consent');
    status.setAttribute('role', 'status');
    content.append(status, element('p', `Advertising/sale opt-out: ${consent.saleOptOut ? 'on' : 'not selected'}. Personalization: not enabled.`));
    content.append(
      element('h3', 'Adobe collection'),
      element('p', collection),
      element('p', `RSID: ${CONFIG.reportSuiteId}`),
      element('p', `Collector: ${CONFIG.trackingServer}`),
      element('p', CONFIG.reporting),
      element('p', 'Live data below is from this page in this browser, not Adobe reporting. '
        + 'No pre-consent events are retained or replayed. Last 200 events retained in memory; cleared on revocation or navigation. '
        + 'Visitor identity is page-scoped; visits are not comparable to production visit metrics.'),
    );
    const manage = element('button', 'Cookie preferences');
    manage.type = 'button';
    manage.addEventListener('click', openConsent);
    content.append(manage);
    if (consent.analytics) {
      const counts = new Map();
      const components = new Map();
      events.forEach((entry) => {
        counts.set(entry.event, (counts.get(entry.event) || 0) + 1);
        if (!entry.component) return;
        const key = `${entry.component.position}: ${entry.component.id}`;
        const row = components.get(key) || { impressions: 0, clicks: 0, downloads: 0 };
        if (entry.event === 'component-impression') row.impressions += 1;
        if (entry.event === 'cta-click') row.clicks += 1;
        if (entry.event === 'download') row.downloads += 1;
        components.set(key, row);
      });
      content.append(element('h3', 'Captured events (retained window)'));
      const summary = element('ul');
      counts.forEach((count, event) => summary.append(element('li', `${event}: ${count}`)));
      content.append(summary, element('h3', 'Components'));
      const list = element('ul');
      components.forEach((row, key) => {
        const ctr = row.impressions ? `${((row.clicks / row.impressions) * 100).toFixed(1)}%` : 'N/A';
        list.append(element('li', `${key} - impressions ${row.impressions}, CTA clicks ${row.clicks}, downloads ${row.downloads}, CTR ${ctr}`));
      });
      content.append(list, element('h3', 'Live event feed'));
      const feed = element('ol', undefined, 'chevron-booklet-feed');
      events.slice(-60).reverse().forEach((entry) => {
        const detail = entry.link?.text || entry.link?.file || entry.component?.id
          || (entry.depth ? `${entry.depth}%` : entry.page.path);
        feed.append(element('li', `${entry.timestamp.slice(11, 19)} ${entry.event} - ${detail}`));
      });
      content.append(feed);
    }
    body.replaceChildren(content);
  });
  if (requested === '1') setOpen(true);
}
