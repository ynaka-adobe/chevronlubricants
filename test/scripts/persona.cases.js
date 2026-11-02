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

  it('inherits the same index personas from html aliases without rewriting card links', async () => {
    win.testIndexRows = [
      { path: '/en-us/home/learning/article', persona: roles[0] },
      { path: '/en-us/home/products/delo-syn-trans-xe.html', persona: roles[1] },
    ];
    const block = await api.renderCollection(
      'cards-resource',
      row('Authored page', '/en-us/home/learning/article.html?p=2#details')
      + row('Product', '/en-us/home/products/delo-syn-trans-xe?insights=1#benefits')
      + row('External', 'https://example.com/en-us/home/learning/article.html')
      + row('Document', '/en-us/home/learning/article.pdf'),
    );
    const links = [...block.querySelectorAll('a')].map((link) => link.getAttribute('href'));
    api.persona.setActivePersona(roles[0]);
    expect(visible(block).map((card) => card.textContent).join(' ')).to.include('Authored page');
    expect(visible(block).map((card) => card.textContent).join(' ')).not.to.include('Product');
    api.persona.setActivePersona(roles[1]);
    expect(visible(block).map((card) => card.textContent).join(' ')).to.include('Product');
    expect(visible(block)).to.have.length(3);
    expect([...block.querySelectorAll('a')].map((link) => link.getAttribute('href'))).to.deep.equal(links);
  });

  it('keeps automatic state changes idempotent and preserves unrelated URL parameters', async () => {
    await load('&keep=abc#anchor');
    let changes = 0;
    win.document.addEventListener('persona:change', () => { changes += 1; });
    api.persona.setActivePersona(roles[2], { updateURL: true });
    api.persona.setActivePersona(roles[2], { updateURL: true });
    expect(changes).to.equal(1);
    expect(new URLSearchParams(win.location.search).get('p')).to.equal(roles[2]);
    expect(win.location.search).to.include('keep=abc');
    expect(win.location.hash).to.equal('#anchor');
    api.persona.setActivePersona(null, { updateURL: true });
    expect(api.persona.getB2bPersona()).to.equal(null);
    expect(sessionStorage.getItem('b2bPersona')).to.equal(null);
    expect(new URLSearchParams(win.location.search).has('p')).to.equal(false);
  });

  it('loads DA Cards (filterable) through the real block loader without losing rich content or inventing facets', async () => {
    api.ak.setConfig({ locales: { '': {} }, hostnames: [], linkBlocks: [], components: [] });
    win.testIndexRows = [{ path: '/article', persona: roles[0] }];
    const block = win.document.createElement('div');
    block.className = 'cards filterable';
    block.innerHTML = row('Inherited') + row('Decision', '/article', roles[1])
      + row('Unrestricted', 'https://example.com');
    const body = block.firstElementChild.children[1];
    body.insertAdjacentHTML('beforeend', '<ul><li>Extended drain intervals</li></ul><p><a href="/buy">Buy now</a></p>');
    const copy = body.textContent;
    const cta = body.querySelector('a[href="/buy"]');
    win.document.querySelector('main').append(block);
    await api.ak.loadBlock(block);
    expect(block.dataset.blockName).to.equal('cards-filterable');
    expect(block.querySelectorAll('.cards-filterable-card').length).to.equal(3);
    expect(block.querySelector('.cards-filterable-body').textContent).to.equal(copy);
    expect(block.querySelector('a[href="/buy"]')).to.equal(cta);
    expect(block.querySelector('.cards-filterable-panel')).to.equal(null);
    expect(block.querySelector('.persona-filter')).to.equal(null);
    expect(block.querySelector('select')).to.equal(null);
    api.persona.setActivePersona(roles[1]);
    expect(visible(block, '.cards-filterable-list > li').length).to.equal(2);
    expect(block.querySelector('.cards-filterable-status').textContent).to.equal('Showing 2 of 3 resources');
    api.persona.setActivePersona(null);
    expect(visible(block, '.cards-filterable-list > li').length).to.equal(3);
  });

  it('removes legacy authored Persona Filter controls instead of exposing a public selector', async () => {
    api.ak.setConfig({ locales: { '': {} }, hostnames: [], linkBlocks: [], components: [] });
    const block = win.document.createElement('div');
    block.className = 'persona-filter';
    block.innerHTML = '<select><option>Legacy persona</option></select>';
    win.document.querySelector('main').append(block);
    await api.ak.loadBlock(block);
    expect(block.dataset.blockName).to.equal('persona-filter');
    expect(block.isConnected).to.equal(false);
    expect(block.children.length).to.equal(0);
    expect(win.document.querySelector('.persona-filter select')).to.equal(null);
  });

  it('loads numeric hero-banner variations through the actual loader and preserves authored headings and links', async () => {
    api.ak.setConfig({ locales: { '': {} }, hostnames: [], linkBlocks: [], components: [] });
    const block = win.document.createElement('div');
    block.className = 'hero-banner filterable';
    block.innerHTML = `${roles.map((role, i) => `<div><div><h1>${role}</h1>
      <p>Copy for ${role}</p><ul><li><a href="#">Industry</a></li></ul></div><div>${i + 1}</div></div>`).join('')
       }<div><div><h1>Default hero</h1></div><div></div></div>`;
    const headings = [...block.querySelectorAll('h1')];
    const links = [...block.querySelectorAll('a')];
    win.document.querySelector('main').append(block);
    await api.ak.loadBlock(block);
    expect(block.dataset.blockName).to.equal('hero-banner');
    expect([...block.querySelectorAll('h1')]).to.deep.equal(headings);
    expect([...block.querySelectorAll('a')]).to.deep.equal(links);
    const shown = () => [...block.children].filter((item) => !item.hidden);
    expect(shown().map((item) => item.querySelector('h1').textContent)).to.deep.equal(['Default hero']);
    roles.forEach((role) => {
      api.persona.setActivePersona(role);
      expect(shown().length).to.equal(1);
      expect(shown()[0].querySelector('h1').textContent).to.equal(role);
      expect(shown()[0].children.length).to.equal(1);
      expect(shown()[0].querySelector('a').getAttribute('href')).to.equal('#');
      expect(block.hidden).to.equal(false);
    });
    expect(block.querySelector('select')).to.equal(null);
  });

  it('resolves hero comma-separated numeric IDs, skips blank rows and uses a populated untagged fallback', async () => {
    await load('&p=safety');
    const block = await api.renderCollection('hero-banner', `
      <div><div><h1>Technical or procurement</h1></div><div><p>persona: 1, 3</p></div></div>
      <div><div><p><br></p><h1></h1></div><div>2</div></div>
      <div><div><h1>Default hero</h1></div></div>`, 'filterable');
    const shown = () => [...block.children].filter((item) => !item.hidden);
    expect(shown().length).to.equal(1);
    expect(shown()[0].textContent).to.equal('Technical or procurement');
    expect(block.textContent).not.to.include('persona:');
    api.persona.setActivePersona(roles[1]);
    expect(shown().length).to.equal(1);
    expect(shown()[0].textContent).to.equal('Default hero');
    api.persona.setActivePersona(null);
    expect(shown()[0].textContent).to.equal('Default hero');
    const bare = await api.renderCollection('hero-banner', `
      <div><div><h1>Business or research</h1></div><div>2, 4</div></div>
      <div><div><h1>Default</h1></div></div>`, 'filterable');
    api.persona.setActivePersona(roles[3]);
    expect(bare.firstElementChild.hidden).to.equal(false);
    expect(bare.lastElementChild.hidden).to.equal(true);
    const mediaDefault = await api.renderCollection('hero-banner', `
      <div><div><h1>Default with image</h1></div>
      <div><img alt="Equipment" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"></div></div>`, 'filterable');
    expect(mediaDefault.hidden).to.equal(false);
    expect(mediaDefault.querySelector('img').alt).to.equal('Equipment');
    expect(mediaDefault.firstElementChild.children.length).to.equal(2);
  });

  it('keeps hero defaults visible without a role, but never substitutes another role for an unmatched selected visitor', async () => {
    const block = await api.renderCollection('hero-banner', `
      <div><div><h1>Only populated variation</h1></div><div>1</div></div>
      <div><div></div><div>2</div></div>
      <div><div></div><div>3</div></div>`, 'filterable');
    expect(block.hidden).to.equal(false);
    expect(block.firstElementChild.hidden).to.equal(false);
    api.persona.setActivePersona(roles[1]);
    expect(block.hidden).to.equal(true);
    expect([...block.children].every((item) => item.hidden)).to.equal(true);
    api.persona.setActivePersona(roles[0]);
    expect(block.hidden).to.equal(false);
    expect(block.firstElementChild.hidden).to.equal(false);
    const standard = await api.renderCollection('hero-banner', '<div><div><h1>Unfiltered</h1></div><div>4</div></div>');
    expect(standard.hidden).to.equal(false);
    expect(standard.firstElementChild.children.length).to.equal(2);
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
    it(`automatically personalizes ${name} without requiring or exposing a selector`, async () => {
      api.persona.setActivePersona(roles[0]);
      const block = await api.renderCollection(
        name,
        row('Technical', '/article', roles[0]) + row('Decision', '/article', roles[1]),
      );
      expect(visible(block).length).to.equal(1);
      api.persona.setActivePersona(roles[1]);
      expect(visible(block).length).to.equal(1);
      expect(visible(block)[0].textContent).to.include('Decision');
      expect(block.textContent).not.to.include('persona:');
      api.persona.setActivePersona(null);
      expect(visible(block).length).to.equal(2);
      api.persona.setActivePersona(roles[3]);
      expect(visible(block).length).to.equal(0);
      expect(block.querySelector('[role="status"]').hidden).to.equal(false);
      expect(block.querySelector('select')).to.equal(null);
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
    expect(block.querySelector('.persona-filter')).to.equal(null);
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

  it('preserves product-grid See all limits during automatic persona personalization', async () => {
    const block = await api.renderCollection('cards-products', [...Array(6)]
      .map((_, i) => row(`Product ${i}`, '/article', i === 0 ? roles[1] : roles[0])).join(''), 'grid');
    expect(visible(block).length).to.equal(4);
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
    win.history.replaceState(null, '', '/en-us/home.html?p=oem&start=2026-03-15&insights=1#hero');
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
    expect(win.location.pathname).to.equal('/en-us/home.html');
    expect(win.location.hash).to.equal('#hero');
    expect(api.persona.getMarketingPersona()).to.equal('oem');
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
