import { expect } from '@esm-bundle/chai';

describe('Two-tier personas at the existing Target boundary', () => {
  let frame;
  let win;
  let api;
  const tick = () => new Promise((resolve) => { setTimeout(resolve, 30); });
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
  const current = () => win.targetCalls.at(-1)?.request.execute.pageLoad.profileParameters.persona;
  const cleanup = () => {
    localStorage.removeItem('chevron-consent');
    ['b2bPersona', 'marketingPersona', 'chevron-insights'].forEach((key) => sessionStorage.removeItem(key));
    ['chevron-target-persona', 'mbox', 'at_check'].forEach((key) => {
      document.cookie = `${key}=; Path=/; Max-Age=0`;
    });
  };
  beforeEach(async () => {
    cleanup();
    await load('&p=3');
  });
  afterEach(() => {
    api?.consent.setConsent({});
    frame?.remove();
    cleanup();
  });

  it('stores only a functional per-tab preference before consent, without loading or contacting Target', async () => {
    expect(api.persona.getB2bPersona()).to.equal('Procurement & Sourcing Manager');
    expect(sessionStorage.getItem('b2bPersona')).to.equal('Procurement & Sourcing Manager');
    expect(document.cookie).not.to.include('chevron-target-persona');
    expect(localStorage.getItem('b2bPersona')).to.equal(null);
    expect(win.targetCalls.length).to.equal(0);
    expect(win.adobeDataLayer.length).to.equal(0);
    expect(win.document.querySelector('script[src="/deps/at/vendor-at.js"]')).to.equal(null);
    api.consent.setConsent({ analytics: true });
    for (let attempt = 0; !win.document.querySelector('.chevron-booklet-traits') && attempt < 100; attempt += 1) {
      await tick();
    }
    expect(win.targetCalls.length).to.equal(0);
    expect(win.document.querySelector('.chevron-booklet-traits').textContent)
      .to.include('Procurement & Sourcing Manager');
  });

  it('preserves numeric profile values for every canonical name and both existing numeric aliases', async () => {
    const roles = api.persona.PERSONAS;
    for (const alias of ['p', 'persona']) {
      for (let i = 0; i < roles.length; i += 1) {
        for (const value of [String(i + 1), roles[i]]) {
          await load(`&${alias}=${encodeURIComponent(value)}`);
          api.consent.setConsent({ personalization: true });
          await tick();
          expect(current()).to.equal(String(i + 1));
          expect(api.persona.getB2bPersona()).to.equal(roles[i]);
          expect(win.targetPageParamsAll()).to.deep.equal({ 'profile.persona': String(i + 1) });
          expect(win.targetGlobalSettings.pageLoadEnabled).to.equal(false);
          expect(win.targetGlobalSettings.viewsEnabled).to.equal(false);
        }
      }
    }
  });

  it('rolls up author-editable marketing input before the initial Target request and restores both tiers', async () => {
    await load('&p=oem');
    expect(api.persona.getB2bPersona()).to.equal('Technical Evaluator');
    expect(api.persona.getMarketingPersona()).to.equal('oem');
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(current()).to.equal('1');
    await load();
    await tick();
    expect(current()).to.equal('1');
    expect(api.persona.getMarketingPersona()).to.equal('oem');
    await load('&p=Business%20Decision%20Maker');
    await tick();
    expect(current()).to.equal('2');
    expect(api.persona.getMarketingPersona()).to.equal('oem');
    await load('&p=safety');
    await tick();
    expect(current()).to.equal('3');
    expect(api.persona.getMarketingPersona()).to.equal('safety');
    await load('&p=oem&mapRole=Industry%20Researcher');
    await tick();
    expect(current()).to.equal('4');
  });

  it('does not import the superseded cross-tab cookie or evaluate a retained profile without a selection', async () => {
    cleanup();
    document.cookie = 'chevron-target-persona=3; Path=/';
    await load();
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(current()).to.equal(undefined);
    expect(api.persona.getB2bPersona()).to.equal(null);
    expect(document.cookie).not.to.include('chevron-target-persona=');
  });

  it('fails open for unknown or unavailable campaign mappings without inventing a Target role', async () => {
    await load('&p=oem&mapMissing=1');
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(api.persona.getB2bPersona()).to.equal(null);
    expect(win.targetCalls.length).to.equal(0);
    await load('&p=unknown-campaign');
    await tick();
    expect(api.persona.getB2bPersona()).to.equal(null);
    expect(win.targetCalls.length).to.equal(0);
  });

  it('does not erase shared Target identity when a consented tab has no functional selection', async () => {
    api.consent.setConsent({ personalization: true });
    await tick();
    document.cookie = 'mbox=retained-identity; Path=/';
    sessionStorage.removeItem('b2bPersona');
    sessionStorage.removeItem('marketingPersona');
    await load();
    await tick();
    expect(win.targetCalls.length).to.equal(0);
    expect(document.cookie).to.include('mbox=retained-identity');
    api.persona.setActivePersona(api.persona.PERSONAS[0]);
    await tick();
    expect(current()).to.equal('1');
    api.persona.setActivePersona(null);
    expect(document.cookie).to.include('mbox=retained-identity');
    expect(win.targetGlobalSettings.enabled).to.equal(false);
  });

  it('prefers a valid p and allows a valid legacy alias after an invalid p without rewriting URLs', async () => {
    await load('&p=2&persona=3&keep=yes');
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(current()).to.equal('2');
    expect(win.location.search).to.include('p=2&persona=3&keep=yes');
    await load('&p=invalid&persona=1');
    await tick();
    expect(current()).to.equal('1');
  });

  it('keeps content preferences on Target revocation but disables delivery and cleans late Target cookies', async () => {
    let finish;
    win.adobe.target.getOffers = () => new Promise((resolve) => { finish = resolve; });
    api.consent.setConsent({ analytics: true, personalization: true });
    await tick();
    win.document.cookie = 'mbox=old; Path=/';
    api.consent.setConsent({ analytics: true });
    expect(api.persona.getB2bPersona()).to.equal('Procurement & Sourcing Manager');
    expect(win.targetPageParamsAll()).to.deep.equal({});
    expect(win.targetGlobalSettings.enabled).to.equal(false);
    expect(win.document.cookie).not.to.include('mbox=');
    win.document.cookie = 'mbox=late; Path=/';
    finish({ execute: {} });
    await tick();
    expect(win.document.cookie).not.to.include('mbox=');
    expect(api.target.targetState().status).to.include('off');
  });

  it('honors GPC and advertising opt-out independently of functional content selection', async () => {
    Object.defineProperty(win.navigator, 'globalPrivacyControl', { configurable: true, value: true });
    api.consent.setConsent({ analytics: true, personalization: true });
    await tick();
    expect(current()).to.equal(undefined);
    expect(api.persona.getB2bPersona()).to.equal('Procurement & Sourcing Manager');
    expect(api.consent.getConsent().analytics).to.equal(true);
    expect(api.consent.getConsent().personalization).to.equal(false);
  });

  it('reports page-only storage and profile failures without claiming successful persistence or delivery', async () => {
    await load('&p=3&storageBlocked=1');
    expect(api.persona.getPersonaState().saved).to.equal(false);
    win.adobe.target.getOffers = async () => { throw new Error('Target unavailable'); };
    api.consent.setConsent({ personalization: true });
    await tick();
    expect(api.target.targetState().status).to.equal('Target synchronization failed');
    expect(win.document.querySelector('.chevron-booklet-traits').textContent).to.include('Page-only preference');
  });
});
