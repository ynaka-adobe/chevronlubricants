import { expect } from '@esm-bundle/chai';
// These cases share consent storage, so they must not run in a parallel test-file context.
import './target.cases.js';

describe('Chevron consent-first analytics', () => {
  let frame;
  let win;
  let doc;
  let api;
  const tick = () => new Promise((resolve) => { setTimeout(resolve, 20); });
  const render = () => new Promise((resolve) => {
    win.requestAnimationFrame(() => win.requestAnimationFrame(resolve));
  });

  async function load(query = '?insights=1') {
    frame?.remove();
    frame = document.createElement('iframe');
    frame.src = `/test/scripts/martech.fixture.html${query}`;
    document.body.append(frame);
    await new Promise((resolve) => { frame.onload = resolve; });
    win = frame.contentWindow;
    doc = win.document;
    for (let attempt = 0; !win.testAPI && attempt < 250; attempt += 1) await tick();
    expect(win.testAPI, `Fixture did not initialize: ${frame.src}`).to.exist;
    api = win.testAPI;
  }

  function button(text) {
    return [...doc.querySelectorAll('.chevron-consent button')]
      .find((node) => node.textContent === text);
  }

  function grant() {
    button('Accept All').click();
  }

  function impressions(ratio = 0.5) {
    win.testObservers.forEach((observer) => {
      [...observer.nodes].forEach((node) => observer.trigger(node, ratio));
    });
  }

  beforeEach(async () => {
    localStorage.removeItem('chevron-consent');
    sessionStorage.removeItem('chevron-insights');
    await load();
  });

  afterEach(() => {
    api.consent.setConsent({});
    frame.remove();
    localStorage.removeItem('chevron-consent');
    sessionStorage.removeItem('chevron-insights');
  });

  it('does not capture, queue, identify or transmit before consent', () => {
    impressions(1);
    doc.querySelector('main a').click();
    win.dispatchEvent(new win.Event('scroll'));
    api.instrument.track('cta-click', { link: { text: 'before', url: '/private' } });
    expect(win.adobeDataLayer).to.have.length(0);
    expect(win.requests).to.have.length(0);
    expect(doc.querySelector('.chevron-booklet').textContent).to.include('Waiting for analytics consent');
    expect(localStorage.getItem('chevron-consent')).to.equal(null);
  });

  it('close and Escape grant nothing and save no decision', () => {
    doc.querySelector('.chevron-consent-close').click();
    expect(api.consent.getConsent().decided).to.equal(false);
    expect(localStorage.getItem('chevron-consent')).to.equal(null);
    api.consent.openConsent();
    doc.querySelector('.chevron-consent-preferences').dispatchEvent(new win.Event('cancel'));
    expect(api.consent.getConsent().analytics).to.equal(false);
    expect(win.requests).to.have.length(0);
  });

  it('Reject All and advertising opt-out persist necessary-only choices', async () => {
    button('Reject All').click();
    expect(api.consent.getConsent().analytics).to.equal(false);
    await load();
    expect(doc.querySelector('.chevron-consent').hidden).to.equal(true);
    expect(api.consent.getConsent().decided).to.equal(true);
    expect(win.requests).to.have.length(0);
    button('Opt out of sale of personal data and Targeted Advertising').click();
    expect(api.consent.getConsent().saleOptOut).to.equal(true);
    expect(api.consent.getConsent().externalMedia).to.equal(false);
    await load();
    expect(api.consent.getConsent().saleOptOut).to.equal(true);
  });

  it('grants, persists and starts exactly one page view without replaying earlier events', async () => {
    api.instrument.track('cta-click', { link: { text: 'before', url: '/before' } });
    grant();
    api.integration.default();
    api.instrument.default();
    expect(win.adobeDataLayer.map((entry) => entry.event)).to.deep.equal(['page-view']);
    expect(win.requests).to.have.length(1);
    await load();
    expect(api.consent.getConsent().analytics).to.equal(true);
    expect(win.adobeDataLayer.map((entry) => entry.event)).to.deep.equal(['page-view']);
    expect(win.requests).to.have.length(1);
  });

  it('requires at least 50% visibility, exactly once per component/view', () => {
    grant();
    impressions(0.49);
    expect(win.adobeDataLayer).to.have.length(1);
    impressions(0.5);
    impressions(1);
    const entries = win.adobeDataLayer.filter((entry) => entry.event === 'component-impression');
    expect(entries).to.have.length(3);
    expect(entries[0].component).to.deep.equal({
      id: 'hero--wide', block: 'hero', position: 1, sectionIndex: 1,
    });
    expect(entries[2].component.position).to.equal(3);
    expect(entries[2].component.sectionIndex).to.equal(2);
  });

  it('auto-discovers later author-kit blocks and retains stable identity', async () => {
    grant();
    const late = doc.createElement('div');
    late.className = 'quote-testimonial featured';
    doc.querySelector('.block-content').append(late);
    await Promise.resolve();
    late.dataset.blockName = 'quote-testimonial';
    await tick();
    impressions(1);
    const entry = win.adobeDataLayer.find((item) => item.component?.block === 'quote-testimonial');
    expect(entry.component.id).to.equal('quote-testimonial--featured');
    late.classList.add('active');
    expect(api.instrument.describeBlock(late).id).to.equal('quote-testimonial--featured');
  });

  it('integrates migrated heroes, image CTAs and search without collecting before consent', async () => {
    const image = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%221%22%20height=%221%22/%3E';
    const content = doc.querySelector('.block-content');
    content.insertAdjacentHTML('beforeend', `
      <div class="hero-overlay">
        <div><div><img src="${image}" alt="Delo"></div><div></div></div>
        <div><div>Bottom right</div><div><a href="/products?q=private">Choose Delo</a></div></div>
      </div>
      <div class="columns-cta"><div><div>
        <a href="/docs/delo.pdf?token=private"><img src="${image}" alt="PDS"></a>
      </div></div></div>
      <div class="search"></div>
    `);
    api.ak.setConfig({ locales: { '': {} }, components: [] });
    const migrated = [...content.children].slice(-3);
    for (const block of migrated) await api.ak.loadBlock(block);
    await tick();
    impressions(1);
    content.querySelector('.hero-overlay a').click();
    expect(win.adobeDataLayer).to.have.length(0);
    expect(win.requests).to.have.length(0);
    grant();
    impressions(1);
    expect(win.adobeDataLayer.filter((entry) => entry.event === 'component-impression'
      && ['hero-overlay', 'columns-cta', 'search'].includes(entry.component.block))
      .map((entry) => entry.component.block))
      .to.deep.equal(['hero-overlay', 'columns-cta', 'search']);
    content.querySelector('.hero-overlay a').click();
    content.querySelector('.columns-cta a').click();
    expect(win.adobeDataLayer.at(-2).link.url).to.equal('/products');
    expect(win.adobeDataLayer.at(-1).event).to.equal('download');
    expect(win.adobeDataLayer.at(-1).component.block).to.equal('columns-cta');
    expect(JSON.stringify(win.adobeDataLayer)).not.to.include('private');
    await render();
    expect(doc.querySelector('.chevron-booklet').textContent).to.include('hero-overlay');
    expect(doc.querySelector('.chevron-booklet').textContent).to.include('search');
    api.consent.setConsent({});
    content.querySelector('.hero-overlay a').click();
    expect(win.adobeDataLayer).to.have.length(0);
  });

  it('maps page, impression, CTA, download, scroll and dormant form events exactly', () => {
    grant();
    impressions();
    doc.querySelector('main a').click();
    doc.querySelector('.download').click();
    api.instrument.track('scroll', { depth: 75 });
    api.instrument.track('form-start', { form: { name: 'contact' } });
    api.instrument.track('form-submit', { form: { name: 'contact' } });
    const requests = win.requests.map((url) => new URL(url).searchParams);
    expect(requests[0].get('events')).to.equal(null);
    expect(requests[1].get('events')).to.equal('event1');
    expect(requests[1].get('v3')).to.equal('hero--wide');
    expect(requests[1].get('v4')).to.equal('hero');
    expect(requests[1].get('v5')).to.equal('1');
    expect(requests[1].get('v6')).to.equal('1');
    expect(requests[4].get('events')).to.equal('event2');
    expect(requests[4].get('v10')).to.equal('Learn more');
    expect(requests[4].get('v11')).to.equal('/products');
    expect(requests[4].get('c10')).to.equal('main:internal');
    expect(requests[4].get('v12')).to.equal(null);
    expect(requests[5].get('events')).to.equal('event3');
    expect(requests[5].get('v12')).to.equal('delo.pdf');
    expect(requests[5].get('pe')).to.equal('lnk_d');
    expect(requests[6].get('events')).to.equal('event6');
    expect(requests[6].get('v13')).to.equal('75');
    expect(requests[7].get('events')).to.equal('event4');
    expect(requests[8].get('events')).to.equal('event5');
    expect(requests[8].get('v14')).to.equal('contact');
    expect(requests.every((params) => params.get('v2') === 'us')).to.equal(true);
  });

  it('revocation immediately clears data and prevents further requests or replay', () => {
    grant();
    impressions();
    const count = win.requests.length;
    api.consent.setConsent({});
    impressions();
    doc.querySelector('main button').click();
    api.instrument.track('scroll', { depth: 100 });
    expect(win.adobeDataLayer).to.have.length(0);
    expect(win.requests).to.have.length(count);
    expect(doc.querySelector('.chevron-booklet').textContent).to.include('Waiting for analytics consent');
    api.consent.setConsent({ analytics: true });
    impressions();
    expect(win.requests).to.have.length(count);
  });

  it('unchanged analytics permission does not reset or duplicate collection', () => {
    grant();
    impressions();
    const count = win.adobeDataLayer.length;
    api.consent.setConsent({ analytics: true, externalMedia: false });
    expect(win.adobeDataLayer).to.have.length(count);
    impressions();
    expect(win.adobeDataLayer).to.have.length(count);
  });

  it('cross-tab rejection and expiry fail closed', async () => {
    grant();
    localStorage.setItem('chevron-consent', JSON.stringify({
      version: 1, updatedAt: Date.now(), analytics: false, externalMedia: false, saleOptOut: true,
    }));
    win.dispatchEvent(new win.StorageEvent('storage', { key: 'chevron-consent' }));
    expect(api.consent.getConsent().analytics).to.equal(false);
    expect(win.adobeDataLayer).to.have.length(0);
    localStorage.setItem('chevron-consent', JSON.stringify({
      version: 1, updatedAt: 1, analytics: true, externalMedia: true, saleOptOut: false,
    }));
    await load();
    expect(api.consent.getConsent().decided).to.equal(false);
    expect(win.requests).to.have.length(0);
  });

  it('scrubs PII, URL queries/fragments, unsupported schemes and opaque path identifiers', () => {
    expect(api.analytics.cleanURL('/products?email=a@b.com#secret')).to.equal('/products');
    expect(api.analytics.cleanURL('mailto:a@b.com')).to.equal('');
    expect(api.analytics.cleanURL('/user/visitor%40example.com')).to.include('[redacted]');
    expect(api.analytics.cleanURL('/user/123456789')).to.include('[redacted]');
    expect(api.analytics.cleanText('Email visitor@example.com or +1 (212) 555-1234'))
      .to.equal('Email [redacted] or [redacted]');
    grant();
    api.instrument.track('cta-click', {
      link: { text: 'visitor@example.com', url: '/products?token=secret' },
      unwanted: 'private',
    });
    expect(JSON.stringify(win.adobeDataLayer)).not.to.include('visitor@example.com');
    expect(JSON.stringify(win.adobeDataLayer)).not.to.include('secret');
    expect(JSON.stringify(win.adobeDataLayer)).not.to.include('private');
  });

  it('retains at most 200 local events and uses the same live data in the booklet', async () => {
    grant();
    for (let index = 0; index < 210; index += 1) {
      api.instrument.track('cta-click', { link: { text: 'View', url: '/products' } });
      await Promise.resolve();
    }
    expect(win.adobeDataLayer).to.have.length(200);
    await render();
    const panel = doc.querySelector('.chevron-booklet');
    expect(panel.textContent).to.include('cta-click: 200');
    expect(panel.querySelectorAll('.chevron-booklet-feed li')).to.have.length(60);
    expect(panel.textContent).to.include('not Adobe reporting');
  });

  it('never mounts the booklet for normal visitors or when explicitly disabled', async () => {
    await load('?insights=0');
    expect(doc.querySelector('.chevron-booklet')).to.equal(null);
    await load('');
    expect(doc.querySelector('.chevron-booklet')).to.equal(null);
    await load('?insights=1');
    expect(doc.querySelector('.chevron-booklet').hidden).to.equal(false);
  });

  it('shows resolved persona traits, not an unverified URL persona, after consent only', async () => {
    await load('?insights=1&persona=unknown-private-value');
    const wrapper = doc.createElement('div');
    wrapper.className = 'persona-fragment-content';
    wrapper.dataset.persona = 'default';
    doc.querySelector('main').append(wrapper);
    expect(doc.querySelector('.chevron-booklet-traits')).to.equal(null);
    grant();
    await render();
    const traits = doc.querySelector('.chevron-booklet-traits');
    expect(traits.textContent).to.include('Default');
    expect(traits.textContent).not.to.include('unknown-private-value');
    expect(traits.textContent).to.include('No CJA API');
    expect(traits.textContent).to.include('Personal form field values are not collected');
    expect(traits.querySelectorAll('dt').length).to.equal(6);
    api.consent.setConsent({});
    expect(doc.querySelector('.chevron-booklet-traits')).to.equal(null);
  });

  it('refreshes traits for late persona rendering and preserves collapsed state', async () => {
    grant();
    await render();
    expect(doc.querySelector('.chevron-booklet-traits').textContent).to.include('No persona active');
    doc.querySelector('.chevron-booklet-traits').open = false;
    doc.querySelector('.chevron-booklet-traits > summary').focus();
    const wrapper = doc.createElement('div');
    wrapper.className = 'persona-fragment-content';
    wrapper.dataset.persona = 'fleet-managers';
    doc.querySelector('main').append(wrapper);
    win.dispatchEvent(new win.Event('chevron:persona-changed'));
    await render();
    expect(doc.querySelector('.chevron-booklet-traits').textContent).to.include('Fleet Managers');
    expect(doc.querySelector('.chevron-booklet-traits').open).to.equal(false);
    expect(doc.activeElement.matches('.chevron-booklet-traits > summary')).to.equal(true);
    api.instrument.track('cta-click', { link: { text: 'Products', url: '/products' } });
    await render();
    expect(doc.querySelector('.chevron-booklet-traits').open).to.equal(false);
    expect(win.requests.join(' ')).not.to.include('fleet-managers');
  });

  it('uses only sanitized confirmed form events for the last submission trait', async () => {
    grant();
    api.instrument.track('form-submit', {
      form: { name: 'Contact visitor@example.com', email: 'visitor@example.com', company: 'Private company' },
    });
    await render();
    const traits = doc.querySelector('.chevron-booklet-traits').textContent;
    expect(traits).to.include('Contact [redacted]');
    expect(traits).not.to.include('visitor@example.com');
    expect(traits).not.to.include('Private company');
    api.consent.setConsent({});
    api.consent.setConsent({ analytics: true });
    await render();
    expect(doc.querySelector('.chevron-booklet-traits').textContent).to.include('None yet');
  });

  it('gates external media independently and removes frames on revocation', () => {
    const container = doc.createElement('div');
    doc.querySelector('main').append(container);
    api.media.default(container, (root) => {
      const iframe = doc.createElement('iframe');
      iframe.src = 'about:blank';
      root.append(iframe);
    });
    impressions(1);
    expect(container.querySelector('iframe')).to.equal(null);
    api.consent.setConsent({ analytics: true });
    expect(container.querySelector('iframe')).to.equal(null);
    api.consent.setConsent({ externalMedia: true });
    expect(container.querySelector('iframe')).not.to.equal(null);
    expect(api.consent.getConsent().analytics).to.equal(false);
    api.consent.setConsent({});
    expect(container.querySelector('iframe')).to.equal(null);
  });

  it('fires scroll milestones once and only when the exact threshold is crossed', () => {
    grant();
    Object.defineProperty(doc.documentElement, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(win, 'innerHeight', { configurable: true, value: 250 });
    [0, 249, 250, 500, 750, 750].forEach((scrollY) => {
      Object.defineProperty(win, 'scrollY', { configurable: true, value: scrollY });
      win.dispatchEvent(new win.Event('scroll'));
    });
    const entries = win.adobeDataLayer.filter((entry) => entry.event === 'scroll');
    expect(entries.map((entry) => entry.depth)).to.deep.equal([25, 50, 75, 100]);
  });

  it('reports collection failures without claiming Adobe reporting is working', async () => {
    win.Image = class {
      set src(value) {
        win.requests.push(value);
        queueMicrotask(() => this.onerror?.(new Error('Collector unavailable')));
      }

      removeAttribute() {}
    };
    grant();
    await tick();
    expect(api.instrument.snapshot().collection).to.equal('collection failed');
    expect(doc.querySelector('.chevron-booklet').textContent).to.include('collection failed');
  });

  it('measures actual commerce boundaries after Author Kit wraps them, including PDS downloads', async () => {
    doc.querySelector('main').innerHTML = '<div class="commerce-product section"><div class="default-content">'
      + '<article class="commerce-product-hero"><a href="https://cglapps.chevron.com/sdspds/PDSDetailPage.aspx?docDataId=470254&docFormat=PDF">PDS</a></article>'
      + '<section class="commerce-product-equipment">Equipment</section></div></div>';
    grant();
    await tick();
    impressions();
    const entries = win.adobeDataLayer.filter((entry) => entry.event === 'component-impression');
    expect(entries).to.have.length(2);
    expect(entries[0].component.block).to.equal('commerce-product-hero');
    expect(entries[1].component.block).to.equal('commerce-product-equipment');
    doc.querySelector('main a').click();
    const download = win.adobeDataLayer.at(-1);
    expect(download.event).to.equal('download');
    expect(download.link.file).to.equal('PDSDetailPage.aspx');
    expect(download.link.url).not.to.include('docDataId');
  });

  it('honors a page-level analytics exclusion even after a grant', () => {
    const meta = doc.createElement('meta');
    meta.name = 'analytics';
    meta.content = 'off';
    doc.head.append(meta);
    grant();
    impressions();
    api.instrument.track('cta-click', { link: { text: 'View', url: '/products' } });
    expect(win.requests).to.have.length(0);
    expect(win.adobeDataLayer).to.have.length(0);
    expect(api.instrument.snapshot().collection).to.include('page excluded');
  });

  it('honors Global Privacy Control without treating it as analytics consent', () => {
    Object.defineProperty(win.navigator, 'globalPrivacyControl', { configurable: true, value: true });
    expect(api.consent.getConsent().saleOptOut).to.equal(true);
    expect(api.consent.getConsent().analytics).to.equal(false);
    grant();
    expect(api.consent.getConsent().analytics).to.equal(true);
    expect(api.consent.getConsent().saleOptOut).to.equal(true);
    expect(api.consent.getConsent().personalization).to.equal(false);
  });

  it('keeps a consent choice page-local and reports when persistence fails', () => {
    const original = win.Storage.prototype.setItem;
    win.Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
    try {
      grant();
      expect(api.consent.getConsent().analytics).to.equal(true);
      expect(doc.querySelector('[data-consent-status]').textContent).to.include('could not be saved');
      expect(localStorage.getItem('chevron-consent')).to.equal(null);
    } finally {
      win.Storage.prototype.setItem = original;
    }
  });

  it('renders Parker-style stats, rankings and observations from Chevron events only', async () => {
    grant();
    impressions();
    doc.querySelector('main a').click();
    doc.querySelector('main a').click();
    doc.querySelector('main button').click();
    doc.querySelector('.download').click();
    api.instrument.track('scroll', { depth: 75 });
    await render();
    const summary = api.booklet.summarize(win.adobeDataLayer);
    expect(summary.links[0].label).to.equal('Learn more');
    expect(summary.links[0].count).to.equal(2);
    expect(summary.components).to.have.length(3);
    expect(summary.components[0].label).to.equal('1: hero--wide');
    expect(summary.components[0].clicks).to.equal(2);
    expect(summary.components[1].label).to.equal('2: hero--wide');
    expect(summary.components[1].clicks).to.equal(1);
    expect(summary.scroll).to.equal(75);
    const panel = doc.querySelector('.chevron-booklet');
    expect(panel.querySelectorAll('.chevron-booklet-stats > div')).to.have.length(4);
    expect(panel.textContent).to.include('Most-engaged component');
    expect(panel.textContent).to.include('Most-clicked link');
    expect(panel.textContent).to.include('Viewed but not engaged');
    expect(panel.textContent).to.include('CTR 200.0%');
    expect(panel.querySelectorAll('.chevron-booklet-bars')).to.have.length(3);
    expect(panel.querySelector('.chevron-booklet-count').textContent).to.equal('9');
    expect(panel.textContent).to.include('CJA preview');
    expect(panel.textContent).not.to.include('Bot Detection');
  });

  it('keeps details, focus and scroll stable across live updates', async () => {
    frame.width = '800';
    frame.height = '900';
    grant();
    impressions();
    for (let index = 0; index < 20; index += 1) {
      api.instrument.track('cta-click', { link: { text: 'View', url: '/products' } });
      await Promise.resolve();
    }
    await render();
    const details = doc.querySelector('.chevron-booklet-details:not(.chevron-booklet-traits)');
    details.open = true;
    details.querySelector('summary').focus();
    const body = doc.querySelector('.chevron-booklet-body');
    body.scrollTop = 120;
    const position = body.scrollTop;
    expect(position).to.be.greaterThan(0);
    api.instrument.track('cta-click', { link: { text: 'View', url: '/products' } });
    await render();
    expect(details.open).to.equal(true);
    expect(doc.activeElement).to.equal(details.querySelector('summary'));
    expect(body.scrollTop).to.equal(position);
  });

  it('uses the floating Insights toggle and keyboard shortcut without generating events', async () => {
    const close = doc.querySelector('.chevron-booklet-close');
    const toggle = doc.querySelector('.chevron-booklet-toggle');
    close.click();
    expect(doc.querySelector('.chevron-booklet').hidden).to.equal(true);
    expect(toggle.getAttribute('aria-expanded')).to.equal('false');
    expect(doc.activeElement).to.equal(toggle);
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).to.equal('true');
    expect(doc.activeElement).to.equal(close);
    doc.dispatchEvent(new win.KeyboardEvent('keydown', { altKey: true, shiftKey: true, code: 'KeyI' }));
    expect(doc.querySelector('.chevron-booklet').hidden).to.equal(true);
    expect(win.requests).to.have.length(0);
    expect(win.adobeDataLayer).to.have.length(0);
    grant();
    api.instrument.track('scroll', { depth: 100 });
    toggle.click();
    await render();
    expect(doc.querySelector('.chevron-booklet-stats').textContent).to.include('100%');
    api.consent.setConsent({});
    expect(doc.querySelector('.chevron-booklet-stats')).to.equal(null);
    expect(doc.querySelectorAll('.chevron-booklet-feed li')).to.have.length(0);
    expect(doc.querySelector('.chevron-booklet-count').textContent).to.equal('0');
    expect(toggle.dataset.analytics).to.equal('false');
  });
});
