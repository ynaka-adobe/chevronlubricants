import { expect } from '@esm-bundle/chai';

describe('Author-only two-tier Persona palette', () => {
  let frame;
  let win;
  let api;
  let app;
  let doc;
  let business;
  let procurement;
  let researcher;
  const tick = () => new Promise((resolve) => { setTimeout(resolve, 30); });
  const clear = () => {
    localStorage.removeItem('chevron-consent');
    ['b2bPersona', 'marketingPersona', 'chevron-insights'].forEach((key) => sessionStorage.removeItem(key));
  };

  async function load(query = '?insights=1&target=1') {
    frame?.remove();
    frame = document.createElement('iframe');
    frame.src = `/test/scripts/martech.fixture.html${query}`;
    document.body.append(frame);
    await new Promise((resolve) => { frame.onload = resolve; });
    win = frame.contentWindow;
    for (let attempt = 0; !win.testAPI && attempt < 100; attempt += 1) await tick();
    expect(win.testAPI).to.exist;
    api = win.testAPI;
    [, business, procurement, researcher] = api.persona.PERSONAS;
  }

  async function open(tag) {
    ({ palette: app } = await api.openPersonaPalette(tag));
    doc = app.contentDocument;
    for (let attempt = 0; doc.querySelector('#persona-apply').disabled && attempt < 100; attempt += 1) await tick();
    expect(doc.querySelector('#persona-apply').disabled).to.equal(false);
  }

  async function apply() {
    doc.querySelector('#persona-form').dispatchEvent(new app.contentWindow.Event('submit', { cancelable: true }));
    for (let attempt = 0; !doc.querySelector('#persona-status').textContent.startsWith('Applied') && attempt < 100; attempt += 1) await tick();
    expect(doc.querySelector('#persona-status').textContent).to.include('Applied');
    await tick();
  }

  beforeEach(async () => {
    clear();
    await load();
  });
  afterEach(() => {
    api?.consent.setConsent({});
    frame?.remove();
    clear();
  });

  ['aem-sidekick', 'helix-sidekick'].forEach((tag) => {
    it(`connects the ${tag} palette to the page's existing canonical state and author map`, async () => {
      await load('?insights=1&p=oem');
      await open(tag);
      expect(doc.querySelector('#b2b-persona').value).to.equal(api.persona.PERSONAS[0]);
      expect(doc.querySelector('#marketing-persona').value).to.equal('oem');
      expect([...doc.querySelector('#b2b-persona').options].map((item) => item.value))
        .to.deep.equal(['', ...api.persona.PERSONAS]);
      expect([...doc.querySelector('#marketing-persona').options].map((item) => item.value))
        .to.include.members(['oem', 'fleet-managers', 'safety', 'default']);
      expect(doc.querySelector('#persona-page').textContent).to.equal(win.location.href);
      expect(doc.querySelector('#current-analytics').textContent).to.equal('Off');
      expect(win.document.querySelector('main #b2b-persona')).to.equal(null);
    });
  });

  it('previews controls without mutation, then applies the mapped campaign atomically without consent', async () => {
    await open();
    const coarse = doc.querySelector('#b2b-persona');
    const marketing = doc.querySelector('#marketing-persona');
    marketing.value = 'fleet-managers';
    marketing.dispatchEvent(new app.contentWindow.Event('change'));
    expect(coarse.value).to.equal(api.persona.PERSONAS[1]);
    expect(api.persona.getB2bPersona()).to.equal(null);
    let changes = 0;
    win.document.addEventListener('persona:change', () => { changes += 1; });
    await apply();
    expect(changes).to.equal(1);
    expect(api.persona.getPersonaState()).to.deep.equal({
      b2bPersona: api.persona.PERSONAS[1], marketingPersona: 'fleet-managers', saved: true,
    });
    expect(win.sessionStorage.getItem('b2bPersona')).to.equal(api.persona.PERSONAS[1]);
    expect(win.sessionStorage.getItem('marketingPersona')).to.equal('fleet-managers');
    expect(win.localStorage.getItem('demoProfile')).to.equal(null);
    expect(win.document.cookie).not.to.include('demoProfile');
    expect(win.adobeDataLayer).to.have.length(0);
    expect(win.targetCalls).to.have.length(0);
    expect(win.requests).to.have.length(0);
    expect(api.consent.getConsent().personalization).to.equal(false);
  });

  it('retains the marketing tier on manual coarse changes and handles default-map rollups and Reset', async () => {
    await load('?insights=1&p=oem');
    await open();
    doc.querySelector('#b2b-persona').value = procurement;
    await apply();
    expect(api.persona.getMarketingPersona()).to.equal('oem');
    expect(api.persona.getB2bPersona()).to.equal(procurement);
    const marketing = doc.querySelector('#marketing-persona');
    marketing.value = 'default';
    marketing.dispatchEvent(new app.contentWindow.Event('change'));
    await apply();
    expect(api.persona.getB2bPersona()).to.equal(null);
    expect(api.persona.getMarketingPersona()).to.equal('default');
    doc.querySelector('#persona-reset').click();
    for (let attempt = 0; api.persona.getMarketingPersona() && attempt < 100; attempt += 1) {
      await tick();
    }
    expect(api.persona.getPersonaState()).to.deep.equal({
      b2bPersona: null, marketingPersona: null, saved: true,
    });
    expect(win.sessionStorage.getItem('b2bPersona')).to.equal(null);
    expect(win.sessionStorage.getItem('marketingPersona')).to.equal(null);
  });

  it('removes only stale persona aliases, preserves encoded html/query/hash bytes and survives query-free reload', async () => {
    await open();
    win.history.replaceState(null, '', '/en-us/home/products/delo%2Dsyn-trans-xe.html?p=1&keep=a%20b&keep=x+y&%70ersona=2&encoded=%2F#details');
    doc.querySelector('#b2b-persona').value = researcher;
    await apply();
    expect(win.location.pathname).to.equal('/en-us/home/products/delo%2Dsyn-trans-xe.html');
    expect(win.location.search).to.equal('?keep=a%20b&keep=x+y&encoded=%2F');
    expect(win.location.hash).to.equal('#details');
    await load();
    expect(api.persona.getB2bPersona()).to.equal(api.persona.PERSONAS[3]);
  });

  it('updates the real collection/hero/Insights surfaces and keeps Target independently consented and numeric', async () => {
    await open();
    const roles = api.persona.PERSONAS;
    const cards = await api.renderCollection('cards-resource', roles.map((role, index) => `<div>
      <div><h3><a href="/article-${index}">Role ${index}</a></h3></div>
      <div>persona: ${role}</div></div>`).join(''));
    const hero = await api.renderCollection('hero-banner', roles.map((role) => `<div>
      <div><h1>${role}</h1></div><div>persona: ${role}</div></div>`).join(''));
    doc.querySelector('#b2b-persona').value = business;
    await apply();
    expect([...cards.querySelectorAll('li')].filter((card) => !card.hidden)).to.have.length(1);
    expect([...hero.children].filter((child) => !child.hidden).map((child) => child.textContent).join(' ')).to.include(roles[1]);
    expect(win.adobeDataLayer).to.have.length(0);
    expect(win.targetCalls).to.have.length(0);
    api.consent.setConsent({ analytics: true, personalization: true });
    for (let attempt = 0; !win.targetCalls.length && attempt < 100; attempt += 1) await tick();
    expect(win.targetCalls[0].request.execute.pageLoad.profileParameters.persona).to.equal('2');
    await tick();
    expect(doc.querySelector('#current-personalization').textContent).to.equal('On');
    expect(doc.querySelector('#current-analytics').textContent).to.equal('On');
    doc.querySelector('#b2b-persona').value = procurement;
    await apply();
    expect(win.adobeDataLayer.some((entry) => entry.event === 'persona-filter'
      && entry.persona === roles[2])).to.equal(true);
    expect(win.document.querySelector('.chevron-booklet').textContent).to.include(roles[2]);
  });

  it('ignores forged window/origin messages and rejects unknown map inputs without changing state', async () => {
    await open();
    const data = {
      source: 'chevron-persona-app',
      action: 'apply',
      id: 42,
      selection: { b2bPersona: api.persona.PERSONAS[1], marketingPersona: null },
    };
    win.dispatchEvent(new win.MessageEvent('message', { data, source: win, origin: win.location.origin }));
    win.dispatchEvent(new win.MessageEvent('message', {
      data, source: app.contentWindow, origin: 'https://example.com',
    }));
    await tick();
    expect(api.persona.getB2bPersona()).to.equal(null);
    expect(await api.persona.setPersonaSelection({
      b2bPersona: api.persona.PERSONAS[1], marketingPersona: 'unmapped',
    })).to.equal(false);
    expect(api.persona.getB2bPersona()).to.equal(null);
  });

  it('reports page-only persistence when storage is unavailable instead of inventing a fallback', async () => {
    await load('?insights=1&storageBlocked=1');
    await open();
    doc.querySelector('#b2b-persona').value = business;
    await apply();
    expect(api.persona.getB2bPersona()).to.equal(api.persona.PERSONAS[1]);
    expect(doc.querySelector('#current-storage').textContent).to.include('Page only');
    expect(api.persona.getPersonaState().saved).to.equal(false);
  });

  it('preserves a saved marketing tier during map failure without inventing its rollup', async () => {
    win.sessionStorage.setItem('b2bPersona', api.persona.PERSONAS[0]);
    win.sessionStorage.setItem('marketingPersona', 'oem');
    await load('?insights=1&mapMissing=1');
    await open();
    expect(doc.querySelector('#marketing-persona').value).to.equal('oem');
    expect(doc.querySelector('#persona-mapping').textContent).to.include('unavailable or empty');
    doc.querySelector('#b2b-persona').value = business;
    await apply();
    expect(api.persona.getB2bPersona()).to.equal(business);
    expect(api.persona.getMarketingPersona()).to.equal('oem');
  });
});
