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
    expect(storedPersona()).to.equal(null);
    expect(win.targetCalls.length).to.equal(0);
    expect(win.document.querySelector('script[src="/deps/at/vendor-at.js"]')).to.equal(null);
    api.consent.setConsent({ analytics: true });
    await tick();
    expect(win.targetCalls.length).to.equal(0);
    expect(storedPersona()).to.equal(null);
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

  it('supports all four personas and does not interpret the content persona as a Target id', async () => {
    for (const id of ['1', '2', '3', '4']) {
      await load(`&p=${id}`);
      api.consent.setConsent({ personalization: true });
      await tick();
      expect(currentPersona()).to.equal(id);
    }
    document.cookie = `${key}=; Path=/; Max-Age=0`;
    await load('&persona=fleet-managers');
    await tick();
    expect(win.targetCalls.length).to.equal(0);
    expect(api.target.targetState().persona).to.equal('');
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
    api.consent.setConsent({ personalization: true });
    await tick();
    const other = document.createElement('iframe');
    otherFrames.push(other);
    other.src = '/test/scripts/martech.fixture.html?target=1&p=2';
    document.body.append(other);
    await new Promise((resolve) => { other.onload = resolve; });
    for (let attempt = 0; currentPersona() !== '2' && attempt < 100; attempt += 1) await tick();
    expect(storedPersona()).to.equal('2');
    expect(currentPersona()).to.equal('2');
    expect(api.target.targetState().persona).to.equal('2');
    expect(other.contentWindow.testAPI.target.targetState().persona).to.equal('2');
    win.dispatchEvent(new win.Event('focus'));
    await tick();
    expect(storedPersona()).to.equal('2');
    expect(currentPersona()).to.equal('2');
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

  it('reports synchronization failure rather than claiming the profile is confirmed', async () => {
    win.adobe.target.getOffers = async () => { throw new Error('Target unavailable'); };
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(api.target.targetState().status).to.equal('Target synchronization failed');
  });

  it('shows the Target persona separately from content targeting, even without analytics consent', async () => {
    api.consent.setConsent({ personalization: true });
    await tick();
    const traits = win.document.querySelector('.chevron-booklet-traits');
    expect(Boolean(traits)).to.equal(true);
    expect(traits.textContent).to.include('Procurement and Sourcing Manager');
    expect(traits.textContent).to.include('Profile persona: 3');
    expect(traits.textContent).to.include('Content persona');
    expect(traits.textContent).to.include('No persona active');
    expect(traits.textContent).to.include('Target responded');
    api.consent.setConsent({});
    expect(win.document.querySelector('.chevron-booklet-traits')).to.equal(null);
  });
});
