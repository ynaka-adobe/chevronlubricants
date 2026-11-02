import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { setConfig } from '../../scripts/ak.js';

describe('Resolved persona metadata', () => {
  let decoratePersona;
  let originalURL;
  let fetchStub;
  const rows = [
    { name: 'Fallback', persona: 'default', fragment: `${window.location.origin}/default-fragment` },
    { name: 'Fallback', persona: 'fleet-managers', fragment: `${window.location.origin}/fleet-fragment` },
  ];

  before(async () => {
    setConfig({ locales: { '': {} }, hostnames: [], linkBlocks: [], components: [] });
    ({ default: decoratePersona } = await import('../../blocks/persona/persona.js'));
  });

  beforeEach(() => {
    originalURL = window.location.href;
    document.body.innerHTML = '<main><div class="section"><p><a href="/schedule.json">Schedule</a></p></div></main>';
    fetchStub = sinon.stub(window, 'fetch');
    fetchStub.withArgs(`${window.location.origin}/schedule.json`).resolves({
      ok: true, json: async () => ({ data: structuredClone(rows) }),
    });
    fetchStub.withArgs('/default-fragment').resolves({
      ok: true, text: async () => '<main><div><h1>Default</h1></div></main>',
    });
    fetchStub.withArgs('/fleet-fragment').resolves({
      ok: true, text: async () => '<main><div><h1>Fleet</h1></div></main>',
    });
  });

  afterEach(() => {
    sinon.restore();
    window.history.replaceState(null, '', originalURL);
    document.body.replaceChildren();
  });

  it('exposes the actual successfully rendered persona and announces it after insertion', async () => {
    window.history.replaceState(null, '', '?persona=fleet-managers');
    let active;
    const changed = () => { active = document.querySelector('[data-persona]')?.dataset.persona; };
    window.addEventListener('chevron:persona-changed', changed, { once: true });
    await decoratePersona(document.querySelector('a'));
    expect(active).to.equal('fleet-managers');
    expect(document.querySelector('.persona-fragment-content').textContent).to.include('Fleet');
  });

  it('reports the default for an unknown requested persona', async () => {
    window.history.replaceState(null, '', '?persona=unknown');
    await decoratePersona(document.querySelector('a'));
    expect(document.querySelector('[data-persona]').dataset.persona).to.equal('default');
  });

  it('reports the actual fallback when the selected fragment cannot load', async () => {
    window.history.replaceState(null, '', '?persona=fleet-managers');
    fetchStub.withArgs('/fleet-fragment').resolves({ ok: false });
    await decoratePersona(document.querySelector('a'));
    expect(document.querySelector('[data-persona]').dataset.persona).to.equal('default');
    expect(document.querySelector('.persona-fragment-content').textContent).to.include('Default');
  });
});
