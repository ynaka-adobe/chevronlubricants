import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const event = 'custom:aem-genai-variations-sidekick';
const clientURL = 'https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/sidekick/client.js?source=plugin';
let sequence = 0;

describe('Generate with AI Sidekick adapter', () => {
  let init;
  let scripts;
  let append;

  beforeEach(async () => {
    sequence += 1;
    ({ default: init } = await import(`../../tools/sidekick/aem-genai-variations.js?case=${sequence}`));
    scripts = [];
    append = sinon.stub(document.head, 'append').callsFake((script) => scripts.push(script));
  });

  afterEach(() => {
    append.restore();
    document.body.replaceChildren();
  });

  function sidekick(tag = 'aem-sidekick') {
    const sk = document.createElement(tag);
    document.body.append(sk);
    init(sk);
    return sk;
  }

  it('does not load Adobe resources merely because a Sidekick is present', () => {
    sidekick();
    expect(scripts).to.have.length(0);
    expect(document.querySelector('#aemGenAIVariations')).to.equal(null);
  });

  ['aem-sidekick', 'helix-sidekick'].forEach((tag) => {
    it(`launches the actual Adobe client from a ${tag} custom event`, () => {
      const sk = sidekick(tag);
      sk.dispatchEvent(new CustomEvent(event));
      expect(scripts).to.have.length(1);
      expect(scripts[0].src).to.equal(clientURL);
      expect(scripts[0].tagName).to.equal('SCRIPT');
    });
  });

  it('does not react to unrelated author events or a document-level event', () => {
    const sk = sidekick();
    ['custom:quick-edit', 'custom:scheduler', 'custom:generate-variations'].forEach((name) => {
      sk.dispatchEvent(new CustomEvent(name));
    });
    document.dispatchEvent(new CustomEvent(event));
    expect(scripts).to.have.length(0);
  });

  it('deduplicates initialization and simultaneous clicks across both versions', () => {
    const v2 = sidekick();
    const v1 = sidekick('helix-sidekick');
    init(v2);
    init(v1);
    v2.dispatchEvent(new CustomEvent(event));
    v1.dispatchEvent(new CustomEvent(event));
    v2.dispatchEvent(new CustomEvent(event));
    expect(scripts).to.have.length(1);
  });

  it('lets the loaded Adobe client handle close/reopen without reloading it', () => {
    const sk = sidekick();
    sk.dispatchEvent(new CustomEvent(event));
    scripts[0].dispatchEvent(new Event('load'));
    const adobeHandler = sinon.spy();
    sk.addEventListener(event, adobeHandler);
    sk.dispatchEvent(new CustomEvent(event));
    expect(adobeHandler.calledOnce).to.equal(true);
    expect(scripts).to.have.length(1);
  });

  it('logs a failed load and allows a clean retry', () => {
    const error = sinon.stub(console, 'error');
    try {
      const sk = sidekick();
      sk.dispatchEvent(new CustomEvent(event));
      scripts[0].dispatchEvent(new Event('error'));
      expect(error.calledOnce).to.equal(true);
      expect(error.firstCall.args[0]).to.include('retry');
      sk.dispatchEvent(new CustomEvent(event));
      expect(scripts).to.have.length(2);
      expect(scripts[1]).not.to.equal(scripts[0]);
      expect(scripts[1].src).to.equal(clientURL);
    } finally {
      error.restore();
    }
  });
});

describe('Generate with AI configuration and lazy wiring', () => {
  let frame;

  afterEach(() => frame?.remove());

  async function fixture(query = '') {
    frame = document.createElement('iframe');
    frame.src = `/test/scripts/genai-sidekick.fixture.html${query}`;
    document.body.append(frame);
    await new Promise((resolve) => { frame.onload = resolve; });
    for (let attempt = 0; !frame.contentWindow.testReady && attempt < 100; attempt += 1) {
      await new Promise((resolve) => { setTimeout(resolve, 20); });
    }
    expect(frame.contentWindow.testReady).to.equal(true);
    return frame.contentWindow;
  }

  async function waitForAdapter(win) {
    for (let attempt = 0; !win.performance.getEntriesByType('resource')
      .some(({ name }) => name.includes('/tools/sidekick/aem-genai-variations.js'))
      && attempt < 100; attempt += 1) {
      await new Promise((resolve) => { setTimeout(resolve, 20); });
    }
    // The resource timing entry can be recorded just before module evaluation.
    await new Promise((resolve) => { setTimeout(resolve, 20); });
  }

  it('keeps GenAI and the Persona palette without the user-removed legacy link', async () => {
    const { plugins } = await (await fetch('/tools/sidekick/config.json')).json();
    expect(plugins.find(({ id }) => id === 'aem-genai-variations')).to.deep.equal({
      id: 'aem-genai-variations',
      titleI18n: { en: 'Generate with AI' },
      environments: ['preview', 'live', 'prod'],
      includePaths: ['**'],
      event: 'aem-genai-variations-sidekick',
    });
    expect(plugins.map(({ id }) => id)).to.deep.equal(['aem-genai-variations', 'persona']);
    expect(plugins.find(({ id }) => id === 'persona')).to.deep.equal({
      id: 'persona',
      title: 'Persona',
      url: '/tools/persona/persona.html',
      isPalette: true,
      passReferrer: true,
      paletteRect: 'top: 40px; right: 0; width: 400px; height: calc(100% - 40px);',
      environments: ['preview', 'live', 'prod'],
      includePaths: ['**'],
    });
  });

  it('loads no GenAI adapter, client, or panel for an ordinary visitor', async () => {
    const win = await fixture();
    await new Promise((resolve) => { setTimeout(resolve, 100); });
    expect(win.performance.getEntriesByType('resource')
      .filter(({ name }) => /genai-variations|\/tools\/persona\//.test(name))).to.have.length(0);
    expect(win.genaiScripts).to.have.length(0);
    expect(win.document.querySelector('#aemGenAIVariations')).to.equal(null);
  });

  ['aem-sidekick', 'helix-sidekick'].forEach((tag) => {
    ['early', 'late'].forEach((timing) => {
      it(`binds ${tag} injected ${timing}, without loading the app before a click`, async () => {
        const win = await fixture(`?tag=${tag}&timing=${timing}`);
        if (timing === 'late') win.injectSidekick(tag);
        await waitForAdapter(win);
        const sk = win.document.querySelector(tag);
        expect(win.genaiScripts).to.have.length(0);
        win.document.dispatchEvent(new win.CustomEvent('sidekick-ready'));
        sk.dispatchEvent(new win.CustomEvent(event));
        expect(win.genaiScripts).to.have.length(1);
        expect(win.genaiScripts[0].src).to.equal(clientURL);
      });
    });
  });
});
