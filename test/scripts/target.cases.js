import { expect } from '@esm-bundle/chai';

describe('Consent-gated Target session personas', () => {
  let frame;
  let win;
  let api;
  const otherFrames = [];
  const tick = () => new Promise((resolve) => { setTimeout(resolve, 30); });
  const key = 'chevron-target-persona';

  async function load(query = '') {
    frame?.remove();
    frame = document.createElement('iframe');
    frame.src = `/test/scripts/martech.fixture.html?insights=1&target=1${query}`;
    document.body.append(frame);
    await new Promise((resolve) => { frame.onload = resolve; });
    win = frame.contentWindow;
    for (let attempt = 0; !win.testAPI && attempt < 250; attempt += 1) await tick();
    expect(Boolean(win.testAPI), 'Target fixture initialized').to.equal(true);
    api = win.testAPI;
  }

  const currentPersona = () => win.targetCalls.at(-1)
    ?.request.execute.pageLoad.profileParameters.persona;
  const storedPersona = () => document.cookie.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${key}=`))?.slice(key.length + 1) || null;

  beforeEach(async () => {
    localStorage.removeItem('chevron-consent');
    document.cookie = `${key}=; Path=/; Max-Age=0`;
    sessionStorage.removeItem('chevron-insights');
    await load('&p=3');
  });

  afterEach(() => {
    api.consent.setConsent({});
    otherFrames.splice(0).forEach((other) => other.remove());
    frame.remove();
    localStorage.removeItem('chevron-consent');
    document.cookie = `${key}=; Path=/; Max-Age=0`;
    sessionStorage.removeItem('chevron-insights');
  });

  it('does not store a persona, load Target or request a profile before personalization consent', async () => {
    expect(api.persona.getPersonaState().id).to.equal('3');
    expect(api.persona.getContentPersona()).to.equal('3');
    expect(storedPersona()).to.equal(null);
    expect(win.targetCalls.length).to.equal(0);
    expect(win.document.querySelector('script[src="/deps/at/vendor-at.js"]')).to.equal(null);
    api.consent.setConsent({ analytics: true });
    await tick();
    expect(win.targetCalls.length).to.equal(0);
    expect(storedPersona()).to.equal(null);
    const traits = win.document.querySelector('.chevron-booklet-traits').textContent;
    expect(traits).to.include('Procurement and Sourcing Manager');
    expect(traits).to.include('no Target profile transmission');
    expect(win.adobeDataLayer[0].page.persona).to.equal('3');
  });

  it('does not upgrade a previously stored analytics/media choice to personalization consent', async () => {
    localStorage.setItem('chevron-consent', JSON.stringify({
      version: 1, updatedAt: Date.now(), analytics: true, externalMedia: true, saleOptOut: false,
    }));
    await load('&p=3');
    await tick();
    expect(api.consent.getConsent().analytics).to.equal(true);
    expect(api.consent.getConsent().personalization).to.equal(false);
    expect(win.targetCalls.length).to.equal(0);
    expect(storedPersona()).to.equal(null);
  });

  it('reports blocked session cookies without a page-only persistence fallback', async () => {
    Object.defineProperty(win.document, 'cookie', { configurable: true, get: () => '', set: () => {} });
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(win.targetCalls.length).to.equal(0);
    expect(api.target.targetState().status).to.include('could not be saved');
    expect(localStorage.getItem(key)).to.equal(null);
  });

  it('sends the exact profile attribute, persists across pages and replaces only with a valid p', async () => {
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(currentPersona()).to.equal('3');
    expect(win.targetPageParamsAll()).to.deep.equal({ 'profile.persona': '3' });
    expect(storedPersona()).to.equal('3');
    expect(win.requests.length).to.equal(0);
    expect(win.targetGlobalSettings.pageLoadEnabled).to.equal(false);
    expect(win.targetGlobalSettings.viewsEnabled).to.equal(false);
    await load();
    await tick();
    expect(currentPersona()).to.equal('3');
    await load('&p=4');
    await tick();
    expect(currentPersona()).to.equal('4');
    expect(storedPersona()).to.equal('4');
    await load('&p=3garbage&persona=fleet-managers');
    await tick();
    expect(currentPersona()).to.equal('4');
    expect(storedPersona()).to.equal('4');
    expect(localStorage.getItem(key)).to.equal(null);
  });

  it('treats both numeric aliases identically for all four roles and preserves legacy named links', async () => {
    for (const alias of ['p', 'persona']) {
      for (const id of ['1', '2', '3', '4']) {
        await load(`&${alias}=${id}`);
        api.consent.setConsent({ personalization: true });
        await tick();
        expect(currentPersona()).to.equal(id);
        expect(api.persona.getContentPersona()).to.equal(id);
        expect(api.persona.getPersonaState().id).to.equal(id);
      }
    }
    document.cookie = `${key}=; Path=/; Max-Age=0`;
    for (const name of ['fleet-managers', 'oem', 'b2c']) {
      await load(`&persona=${name}`);
      await tick();
      expect(win.targetCalls.length).to.equal(0);
      expect(api.target.targetState().persona).to.equal('');
      expect(api.persona.getContentPersona()).to.equal(name);
    }
  });

  it('prefers a valid p over a conflicting persona and ignores invalid aliases without rewriting the URL', async () => {
    api.consent.setConsent({ personalization: true });
    await load('&p=2&persona=3&unrelated=keep');
    await tick();
    expect(currentPersona()).to.equal('2');
    expect(api.persona.getContentPersona()).to.equal('2');
    expect(win.location.search).to.include('p=2&persona=3&unrelated=keep');
    await load('&p=99&persona=1');
    await tick();
    expect(currentPersona()).to.equal('1');
    await load('&p=5&persona=9');
    await tick();
    expect(currentPersona()).to.equal('1');
    expect(api.persona.getContentPersona()).to.equal('1');
  });

  it('selects numeric authored content before optional consent without storing or transmitting it', async () => {
    await load('&persona=3&earlyPersona=1');
    const wrapper = win.document.querySelector('.persona-fragment-content');
    expect(wrapper.dataset.persona).to.equal('3');
    expect(wrapper.dataset.selectedPersona).to.equal('3');
    expect(wrapper.textContent).to.include('Content for 3');
    expect(storedPersona()).to.equal(null);
    expect(win.targetCalls.length).to.equal(0);
    expect(win.adobeDataLayer.length).to.equal(0);
  });

  it('restores consent and the canonical selection before early query-free content decoration', async () => {
    api.consent.setConsent({ personalization: true });
    await tick();
    await load('&earlyPersona=1');
    expect(win.document.querySelector('.persona-fragment-content').dataset.persona).to.equal('3');
    await tick();
    expect(currentPersona()).to.equal('3');
  });

  it('keeps the canonical persona when authored content falls back instead of calling the visitor default', async () => {
    await api.renderPersonaSchedule(['default']);
    api.consent.setConsent({ analytics: true, personalization: true });
    await tick();
    const wrapper = win.document.querySelector('.persona-fragment-content');
    expect(wrapper.dataset.persona).to.equal('default');
    expect(wrapper.dataset.selectedPersona).to.equal('3');
    expect(api.persona.getPersonaState().id).to.equal('3');
    expect(win.adobeDataLayer[0].page.persona).to.equal('3');
    const traits = win.document.querySelector('.chevron-booklet-traits');
    expect(traits.querySelector('dl > div strong').textContent).to.equal('Procurement and Sourcing Manager');
    expect(traits.textContent).to.include('Content fallback');
    expect(traits.textContent).not.to.include('Content persona');
    expect(currentPersona()).to.equal('3');
  });

  it('does not evaluate a retained server persona when the browser-session cookie is absent', async () => {
    api.consent.setConsent({ personalization: true });
    await tick();
    document.cookie = `${key}=; Path=/; Max-Age=0`;
    await load();
    await tick();
    expect(win.targetCalls.length).to.equal(0);
    expect(storedPersona()).to.equal(null);
    expect(api.target.targetState().persona).to.equal('');
  });

  it('honors opt-out and GPC even when personalization is requested', async () => {
    api.consent.setConsent({ personalization: true, saleOptOut: true });
    await tick();
    expect(api.consent.getConsent().personalization).to.equal(false);
    expect(win.targetCalls.length).to.equal(0);
    Object.defineProperty(win.navigator, 'globalPrivacyControl', { configurable: true, value: true });
    api.consent.setConsent({ analytics: true, personalization: true });
    await tick();
    expect(api.consent.getConsent().analytics).to.equal(true);
    expect(api.consent.getConsent().personalization).to.equal(false);
    expect(win.targetCalls.length).to.equal(0);
    expect(storedPersona()).to.equal(null);
  });

  it('clears Target state on revocation without disabling analytics, and ignores a late response', async () => {
    let finish;
    win.adobe.target.getOffers = () => new Promise((resolve) => { finish = resolve; });
    api.consent.setConsent({ analytics: true, personalization: true });
    await tick();
    win.document.cookie = 'mbox=test; Path=/';
    api.consent.setConsent({ analytics: true });
    expect(api.consent.getConsent().analytics).to.equal(true);
    expect(storedPersona()).to.equal(null);
    expect(win.targetPageParamsAll()).to.deep.equal({});
    expect(win.document.cookie).not.to.include('mbox=');
    win.document.cookie = 'mbox=late; Path=/';
    finish({ execute: {} });
    await tick();
    expect(win.document.cookie).not.to.include('mbox=');
    expect(api.target.targetState().status).to.include('off');
    expect(api.target.targetState().persona).to.equal('');
  });

  it('does not clear Target identity when only analytics is revoked', async () => {
    api.consent.setConsent({ analytics: true, personalization: true });
    await tick();
    win.document.cookie = 'mbox=retained; Path=/';
    api.consent.setConsent({ personalization: true });
    expect(win.document.cookie).to.include('mbox=retained');
    expect(storedPersona()).to.equal('3');
    expect(api.consent.getConsent().analytics).to.equal(false);
    expect(api.consent.getConsent().personalization).to.equal(true);
  });

  it('shares the latest valid selection with another tab without reapplying an old URL p', async () => {
    await api.renderPersonaSchedule();
    api.consent.setConsent({ analytics: true, personalization: true });
    await tick();
    const other = document.createElement('iframe');
    otherFrames.push(other);
    other.src = '/test/scripts/martech.fixture.html?target=1&persona=2';
    document.body.append(other);
    await new Promise((resolve) => { other.onload = resolve; });
    for (let attempt = 0; currentPersona() !== '2' && attempt < 100; attempt += 1) await tick();
    expect(storedPersona()).to.equal('2');
    expect(currentPersona()).to.equal('2');
    expect(api.target.targetState().persona).to.equal('2');
    expect(other.contentWindow.testAPI.target.targetState().persona).to.equal('2');
    for (let attempt = 0; win.document.querySelector('.persona-fragment-content').dataset.persona !== '2'
      && attempt < 100; attempt += 1) await tick();
    expect(win.document.querySelector('.persona-fragment-content').dataset.persona).to.equal('2');
    api.instrument.track('cta-click', { link: { text: 'Products', url: '/products' } });
    expect(win.adobeDataLayer.at(-1).page.persona).to.equal('2');
    await tick();
    expect(win.document.querySelector('.chevron-booklet-traits').textContent).to.include('Business Decision Maker');
    win.dispatchEvent(new win.Event('focus'));
    await tick();
    expect(storedPersona()).to.equal('2');
    expect(currentPersona()).to.equal('2');
    other.contentWindow.testAPI.consent.setConsent({ analytics: true });
    for (let attempt = 0; api.persona.getPersonaState().id && attempt < 100; attempt += 1) {
      await tick();
    }
    expect(api.persona.getPersonaState().id).to.equal('');
    for (let attempt = 0; attempt < 100
      && win.document.querySelector('.persona-fragment-content').dataset.persona !== 'default';
      attempt += 1) await tick();
    expect(win.document.querySelector('.persona-fragment-content').dataset.persona).to.equal('default');
    api.instrument.track('cta-click', { link: { text: 'Products', url: '/products' } });
    expect(win.adobeDataLayer.at(-1).page).not.to.have.property('persona');
    expect(win.document.querySelector('.chevron-booklet-traits').textContent).to.include('No B2B persona selected');
  });

  it('serializes an older in-flight request before the newer cross-tab selection', async () => {
    let finish;
    win.adobe.target.getOffers = (request) => {
      win.targetCalls.push(structuredClone(request));
      if (request.request.execute.pageLoad.profileParameters.persona === '3') {
        return new Promise((resolve) => { finish = resolve; });
      }
      return Promise.resolve({ execute: {} });
    };
    api.consent.setConsent({ personalization: true });
    await tick();
    const other = document.createElement('iframe');
    otherFrames.push(other);
    other.src = '/test/scripts/martech.fixture.html?target=1&p=4';
    document.body.append(other);
    await new Promise((resolve) => { other.onload = resolve; });
    for (let attempt = 0; !other.contentWindow.testAPI && attempt < 100; attempt += 1) await tick();
    expect(other.contentWindow.targetCalls.length).to.equal(0);
    expect(storedPersona()).to.equal('4');
    finish({ execute: {} });
    for (let attempt = 0; currentPersona() !== '4' && attempt < 100; attempt += 1) await tick();
    expect(currentPersona()).to.equal('4');
    expect(other.contentWindow.targetCalls.at(-1).request.execute.pageLoad.profileParameters.persona).to.equal('4');
  });

  it('can show a newly selected role even when the previous role had no authored content or fallback', async () => {
    await api.renderPersonaSchedule(['2'], { start: '2000-01-01', end: '2100-01-01' });
    expect(win.document.querySelector('.persona-fragment-content')).to.equal(null);
    api.consent.setConsent({ personalization: true });
    const other = document.createElement('iframe');
    otherFrames.push(other);
    other.src = '/test/scripts/martech.fixture.html?target=1&persona=2';
    document.body.append(other);
    await new Promise((resolve) => { other.onload = resolve; });
    for (let attempt = 0; !win.document.querySelector('.persona-fragment-content')
      && attempt < 100; attempt += 1) await tick();
    expect(win.document.querySelector('.persona-fragment-content')?.dataset.persona).to.equal('2');
  });

  it('does not reapply a pending old URL when another tab grants consent and saves a newer role', async () => {
    const other = document.createElement('iframe');
    otherFrames.push(other);
    other.src = '/test/scripts/martech.fixture.html?target=1&persona=4';
    document.body.append(other);
    await new Promise((resolve) => { other.onload = resolve; });
    for (let attempt = 0; !other.contentWindow.testAPI && attempt < 100; attempt += 1) await tick();
    expect(win.targetCalls.length).to.equal(0);
    expect(other.contentWindow.targetCalls.length).to.equal(0);
    other.contentWindow.testAPI.consent.setConsent({ personalization: true });
    for (let attempt = 0; currentPersona() !== '4' && attempt < 100; attempt += 1) await tick();
    expect(storedPersona()).to.equal('4');
    expect(api.persona.getPersonaState().id).to.equal('4');
    expect(currentPersona()).to.equal('4');
  });

  it('reports synchronization failure rather than claiming the profile is confirmed', async () => {
    win.adobe.target.getOffers = async () => { throw new Error('Target unavailable'); };
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(api.target.targetState().status).to.equal('Target synchronization failed');
  });

  it('shows one canonical persona even without analytics consent', async () => {
    api.consent.setConsent({ personalization: true });
    await tick();
    const traits = win.document.querySelector('.chevron-booklet-traits');
    expect(Boolean(traits)).to.equal(true);
    expect(traits.textContent).to.include('Procurement and Sourcing Manager');
    expect(traits.textContent).to.include('Persona id: 3');
    expect(traits.textContent).not.to.include('Content persona');
    expect(traits.querySelectorAll('dt').length).to.equal(5);
    expect(traits.textContent).to.include('Target responded');
    api.consent.setConsent({});
    expect(win.document.querySelector('.chevron-booklet-traits')).to.equal(null);
  });
});
