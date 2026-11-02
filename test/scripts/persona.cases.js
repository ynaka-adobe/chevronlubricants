import { expect } from '@esm-bundle/chai';

describe('PF1-14 two-tier content and collection filtering', () => {
  let frame;
  let win;
  let api;
  const roles = [
    'Technical Evaluator', 'Business Decision Maker',
    'Procurement & Sourcing Manager', 'Industry Researcher',
  ];
  const tick = () => new Promise((resolve) => { setTimeout(resolve, 30); });
  async function load(query = '') {
    frame?.remove();
    frame = document.createElement('iframe');
    frame.src = `/test/scripts/martech.fixture.html?insights=1${query}`;
    document.body.append(frame);
    await new Promise((resolve) => { frame.onload = resolve; });
    win = frame.contentWindow;
    for (let attempt = 0; !win.testAPI && attempt < 250; attempt += 1) await tick();
    expect(Boolean(win.testAPI), 'Persona fixture initialized').to.equal(true);
    api = win.testAPI;
  }
  const clear = () => {
    localStorage.removeItem('chevron-consent');
    ['b2bPersona', 'marketingPersona', 'chevron-insights'].forEach((key) => sessionStorage.removeItem(key));
  };
  beforeEach(async () => {
    clear();
    await load();
  });
  afterEach(() => {
    api?.consent.setConsent({});
    frame?.remove();
    clear();
  });
  const row = (title, href = '/article', persona = '') => `<div>
    <div><picture><img alt="${title}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"></picture></div>
    <div><h3><a href="${href}">${title}</a></h3><p>Details</p></div>
    ${persona ? `<div><p>persona: ${persona}</p></div>` : ''}</div>`;
  const visible = (block, selector = 'ul > li') => [...block.querySelectorAll(selector)]
    .filter((card) => !card.hidden);

  it('returns exact canonical values, leaves All unfiltered, and reads actual page taxonomy independently', async () => {
    expect(api.persona.PERSONAS).to.deep.equal(roles);
    expect(api.persona.getActivePersona()).to.equal(null);
    await load(`&p=1&pagePersona=${encodeURIComponent(`${roles[1]}, ${roles[3]}`)}`);
    expect(api.persona.getB2bPersona()).to.equal(roles[0]);
    expect(api.persona.pageHasPersona(roles[1])).to.equal(true);
    expect(api.persona.pageHasPersona(roles[0])).to.equal(false);
    expect(api.instrument.pageContext().persona).to.equal(`${roles[1]}, ${roles[3]}`);
  });

  it('caches the author map and index once, including normalized internal paths and safe failures', async () => {
    win.testIndexRows = [{ path: '/en-us/home/learning/article', persona: roles[0] }];
    const [first, second] = await Promise.all([
      api.persona.loadQueryIndex(), api.persona.loadQueryIndex(),
    ]);
    expect(first).to.equal(second);
    expect(win.personaFetchCounts.index).to.equal(1);
    const card = win.document.createElement('div');
    card.innerHTML = row('Article', '/content/en-us/home/learning/article.html/?x=1#part');
    // The row, not its surrounding block, is the card resolver input.
    const raw = card.firstElementChild;
    raw.querySelector('a').href = '/content/en-us/home/learning/article.html?x=1#part';
    api.persona.resolveCardPersona(raw, first);
    expect(raw.dataset.persona).to.equal(roles[0]);
    await Promise.all([api.persona.loadPersonaMap(), api.persona.loadPersonaMap()]);
    expect(win.personaFetchCounts.map).to.equal(1);
    await load('&indexMissing=1');
    expect((await api.persona.loadQueryIndex()).size).to.equal(0);
    api.persona.setActivePersona(roles[0]);
    const unrestricted = await api.renderCollection('cards-resource', row('Missing index'));
    expect(visible(unrestricted).length).to.equal(1);
    expect(unrestricted.querySelector('li').hasAttribute('data-persona')).to.equal(false);
  });

  it('locks explicit trailing cells over index inheritance, including empty/typo cells and external links', async () => {
    const index = new win.Map([['/article', { persona: roles[0] }]]);
    for (const [markup, expected] of [
      [row('Override', '/article', roles[1]), roles[1]],
      [row('External', 'https://example.com/article'), null],
      [row('PDF', '/article.pdf'), null],
      [row('Inherited'), roles[0]],
      [row('Typo', '/article', 'Technical evaluator'), 'Technical evaluator'],
    ]) {
      const holder = win.document.createElement('div');
      holder.innerHTML = markup;
      const card = holder.firstElementChild;
      api.persona.resolveCardPersona(card, index);
      expect(card.dataset.persona || null).to.equal(expected);
      expect(card.textContent).not.to.include('persona:');
      if (expected === 'Technical evaluator') {
        expect(api.persona.matchesPersona(card, roles[0])).to.equal(false);
        expect(api.persona.matchesPersona(card, null)).to.equal(true);
      }
    }
    const holder = win.document.createElement('div');
    holder.innerHTML = row('Explicitly unrestricted');
    const card = holder.firstElementChild;
    const cell = win.document.createElement('div');
    cell.textContent = 'persona:';
    card.append(cell);
    api.persona.resolveCardPersona(card, index);
    api.persona.resolveCardPersona(card, index);
    expect(card.dataset.personaSource).to.equal('explicit');
    expect(card.hasAttribute('data-persona')).to.equal(false);
    expect(card.children.length).to.equal(2);
    expect(api.persona.matchesPersona(card, roles[0])).to.equal(true);
  });

  it('keeps repeated selector changes idempotent, updates only persona URL parameters and synchronizes controls', async () => {
    await load('&keep=abc#anchor');
    const first = await api.renderCollection('persona-filter', '');
    const second = await api.renderCollection('persona-filter', '');
    const select = first.querySelector('select');
    expect(first.querySelector('label').htmlFor).to.equal(select.id);
    expect(select.options.length).to.equal(5);
    let changes = 0;
    win.document.addEventListener('persona:change', () => { changes += 1; });
    select.value = roles.at(2);
    select.dispatchEvent(new win.Event('change'));
    select.dispatchEvent(new win.Event('change'));
    expect(changes).to.equal(1);
    expect(second.querySelector('select').value).to.equal(roles[2]);
    expect(new URLSearchParams(win.location.search).get('p')).to.equal(roles[2]);
    expect(win.location.search).to.include('keep=abc');
    expect(win.location.hash).to.equal('#anchor');
    select.value = '';
    select.dispatchEvent(new win.Event('change'));
    expect(api.persona.getB2bPersona()).to.equal(null);
    expect(sessionStorage.getItem('b2bPersona')).to.equal(null);
    expect(new URLSearchParams(win.location.search).has('p')).to.equal(false);
  });

  ['cards-resource', 'cards-insights'].forEach((name) => {
    it(`filters ${name} with inherited and explicit values, untagged fail-open and an empty state`, async () => {
      win.testIndexRows = [{ path: '/article', persona: roles[0] }];
      const block = await api.renderCollection(
        name,
        row('Inherited') + row('Override', '/article', roles[1]) + row('External', 'https://example.com'),
      );
      expect(visible(block).length).to.equal(3);
      api.persona.setActivePersona(roles[0]);
      expect(visible(block).length).to.equal(2);
      expect(visible(block).map((card) => card.textContent).join(' ')).not.to.include('Override');
      expect(block.textContent).not.to.include('persona:');
      api.persona.setActivePersona(roles[3]);
      expect(visible(block).length).to.equal(1);
      const tagged = await api.renderCollection(name, row('Only', '/article', roles[0]));
      expect(visible(tagged).length).to.equal(0);
      expect(tagged.querySelector('.persona-filter-empty').hidden).to.equal(false);
      api.persona.setActivePersona(null);
      expect(visible(tagged).length).to.equal(1);
      expect(tagged.querySelector('.persona-filter-empty').hidden).to.equal(true);
      expect(win.personaFetchCounts.index).to.equal(1);
    });
  });

  ['cards-service', 'cards-products'].forEach((name) => {
    it(`preserves ${name} without a selector and enables filtering when a selector is authored`, async () => {
      api.persona.setActivePersona(roles[0]);
      const block = await api.renderCollection(
        name,
        row('Technical', '/article', roles[0]) + row('Decision', '/article', roles[1]),
      );
      expect(visible(block).length).to.equal(2);
      await api.renderCollection('persona-filter', '');
      expect(visible(block).length).to.equal(1);
      api.persona.setActivePersona(roles[1]);
      expect(visible(block).length).to.equal(1);
      expect(visible(block)[0].textContent).to.include('Decision');
      expect(block.textContent).not.to.include('persona:');
    });
  });

  it('AND-combines the persona facet with existing brand/type filters and restores only the persona constraint with All', async () => {
    win.testResourceRows = [
      { title: 'A', path: '/a', brand: 'Delo', type: 'Guide', persona: roles[0] },
      { title: 'B', path: '/b', brand: 'Delo', type: 'Video', persona: roles[1] },
      { title: 'C', path: '/c', brand: 'Havoline', type: 'Guide', persona: roles[0] },
      { title: 'Untagged', path: '/u', brand: 'Delo', type: 'Guide' },
    ];
    const block = await api.renderCollection(
      'cards-filterable',
      '<div><div><a href="/test-resources.json">Resources</a></div></div>',
    );
    api.persona.setActivePersona(roles[0]);
    expect(visible(block, '.cards-filterable-list > li').length).to.equal(3);
    block.querySelector('input[value="Delo"]').checked = true;
    block.querySelector('input[value="Guide"]').checked = true;
    block.querySelector('form').dispatchEvent(new win.Event('submit', { cancelable: true }));
    expect(visible(block, '.cards-filterable-list > li').length).to.equal(2);
    api.persona.setActivePersona(roles[1]);
    expect(visible(block, '.cards-filterable-list > li').length).to.equal(1);
    api.persona.setActivePersona(null);
    expect(visible(block, '.cards-filterable-list > li').length).to.equal(2);
  });

  it('recounts carousel-square dots, skips filtered slides and keeps keyboard/focus semantics', async () => {
    const block = await api.renderCollection(
      'carousel-square',
      (row('Technical', '/article', roles[0]) + row('Decision', '/article', roles[1])
      + row('Untagged', 'https://example.com')).replaceAll('<h3>', '<p>').replaceAll('</h3>', '</p>'),
    );
    api.persona.setActivePersona(roles[0]);
    expect(visible(block, '.carousel-square-slide').length).to.equal(2);
    expect(block.querySelectorAll('.carousel-square-dot').length).to.equal(2);
    block.querySelector('.carousel-square-next').click();
    expect(block.querySelector('.is-center').textContent).to.include('Untagged');
    expect(block.querySelector('.is-center a').tabIndex).to.equal(0);
    block.querySelector('[aria-current="true"]').dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(block.querySelector('.is-center').textContent).to.include('Technical');
    expect(block.querySelector('.carousel-square-caption').textContent).to.equal('Details');
    const track = block.querySelector('.carousel-square-slides');
    track.dispatchEvent(new win.PointerEvent('pointerdown', { clientX: 100 }));
    track.dispatchEvent(new win.PointerEvent('pointerup', { clientX: 0 }));
    expect(block.querySelector('.is-center').textContent).to.include('Untagged');
    const hidden = [...block.querySelectorAll('.carousel-square-slide')].find((slide) => slide.hidden);
    expect(hidden.querySelector('a').tabIndex).to.equal(-1);
    api.persona.setActivePersona(roles[3]);
    expect(block.querySelectorAll('.carousel-square-dot').length).to.equal(1);
    expect(block.querySelectorAll('.is-center').length).to.equal(1);
    expect(block.querySelector('.carousel-square-next').hidden).to.equal(true);
    api.persona.setActivePersona(null);
    expect(block.querySelectorAll('.carousel-square-dot').length).to.equal(3);
    const only = await api.renderCollection('carousel-square', row('Tagged', '/article', roles[0]));
    api.persona.setActivePersona(roles[2]);
    expect(only.querySelector('.persona-filter-empty').hidden).to.equal(false);
    expect(only.querySelector('.carousel-square-stage').hidden).to.equal(true);
  });

  it('preserves product-grid See all limits while filtering only when a selector exists', async () => {
    const block = await api.renderCollection('cards-products', [...Array(6)]
      .map((_, i) => row(`Product ${i}`, '/article', i === 0 ? roles[1] : roles[0])).join(''), 'grid');
    expect(visible(block).length).to.equal(4);
    await api.renderCollection('persona-filter', '');
    api.persona.setActivePersona(roles[0]);
    expect(visible(block).length).to.equal(4);
    expect(block.querySelector('.cards-products-seeall-count').textContent).to.equal('(5)');
    block.querySelector('.cards-products-seeall').click();
    expect(visible(block).length).to.equal(5);
    api.persona.setActivePersona(roles[1]);
    expect(visible(block).length).to.equal(1);
    api.persona.setActivePersona(null);
    expect(visible(block).length).to.equal(6);
  });

  it('prefers a valid fine schedule match, then coarse, then default while preserving date windows', async () => {
    await load('&p=oem&start=2026-03-15');
    const rows = [
      { persona: 'default', fragment: '/test-persona-fragment/default' },
      { persona: roles[0], fragment: '/test-persona-fragment/coarse' },
      {
        marketingPersona: 'oem',
        persona: roles[0],
        start: '2026-03-01',
        end: '2026-04-01',
        fragment: '/test-persona-fragment/oem-march',
      },
    ];
    await api.renderPersonaSchedule(rows);
    let wrapper = win.document.querySelector('.persona-fragment-content');
    expect(wrapper.textContent).to.include('oem-march');
    expect(wrapper.dataset.persona).to.equal(roles[0]);
    api.persona.setActivePersona(roles[1]);
    await tick();
    // PF13 deliberately retains the fine tier on a coarse-only change.
    expect(api.persona.getMarketingPersona()).to.equal('oem');
    expect(win.document.querySelector('.persona-fragment-content').textContent).to.include('oem-march');
    await load('&p=1&start=2026-05-15');
    await api.renderPersonaSchedule(rows);
    wrapper = win.document.querySelector('.persona-fragment-content');
    expect(wrapper.textContent).to.include('coarse');
    win.testFragmentFailures = ['coarse'];
    api.persona.setActivePersona(roles[1]);
    await tick();
    expect(win.document.querySelector('.persona-fragment-content').textContent).to.include('default');
    api.persona.setActivePersona(roles[0]);
    await tick();
    expect(win.document.querySelector('.persona-fragment-content').dataset.persona).to.equal('default');
    expect(win.document.querySelector('.persona-fragment-content').dataset.selectedPersona).to.equal(roles[0]);
  });

  it('emits one consent-gated canonical persona-filter hook per change without unconfigured Analytics variables', async () => {
    api.persona.setActivePersona(roles[0]);
    await tick();
    expect(win.adobeDataLayer.length).to.equal(0);
    api.consent.setConsent({ analytics: true });
    await tick();
    expect(win.adobeDataLayer.filter((event) => event.event === 'persona-filter').length).to.equal(0);
    const requests = win.requests.length;
    api.persona.setActivePersona(roles[1]);
    api.persona.setActivePersona(roles[1]);
    await tick();
    const events = win.adobeDataLayer.filter((event) => event.event === 'persona-filter');
    expect(events.length).to.equal(1);
    expect(events[0].persona).to.equal(roles[1]);
    expect(events[0].page).to.equal(win.location.pathname);
    expect(win.requests.length).to.equal(requests);
    expect(win.requests.join(' ')).not.to.include('v7=');
    api.persona.setActivePersona(null);
    await tick();
    expect(win.adobeDataLayer.at(-1).persona).to.equal(null);
    api.consent.setConsent({});
    api.persona.setActivePersona(roles[2]);
    await tick();
    expect(win.adobeDataLayer.length).to.equal(0);
  });

  it('restores tab preferences before the initial page event without replaying a selection event', async () => {
    await load('&p=oem');
    api.consent.setConsent({ analytics: true });
    await load();
    expect(win.adobeDataLayer[0].visitor).to.deep.equal({
      b2bPersona: roles[0], marketingPersona: 'oem',
    });
    expect(win.adobeDataLayer.filter((event) => event.event === 'persona-filter').length).to.equal(0);
  });
});
