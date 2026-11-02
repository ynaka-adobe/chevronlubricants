import { expect } from '@esm-bundle/chai';

describe('Sidekick visibility', () => {
  let stylesheet;

  before(async () => {
    stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/styles/styles.css';
    await new Promise((resolve, reject) => {
      stylesheet.onload = resolve;
      stylesheet.onerror = reject;
      document.head.append(stylesheet);
    });
  });

  afterEach(() => document.body.replaceChildren());
  after(() => stylesheet.remove());

  function injectSidekick() {
    const sidekick = document.createElement('aem-sidekick');
    sidekick.setAttribute('open', 'true');
    document.body.append(sidekick);
    return sidekick;
  }

  it('shows an open extension-injected Sidekick without preview initialization', () => {
    const sidekick = injectSidekick();
    expect(sidekick.classList.contains('is-ready')).to.equal(false);
    expect(getComputedStyle(sidekick).opacity).to.equal('1');
  });

  it('shows a Sidekick injected later, including before sidekick-ready fires', async () => {
    await new Promise((resolve) => { setTimeout(resolve, 0); });
    const sidekick = injectSidekick();
    expect(getComputedStyle(sidekick).opacity).to.equal('1');
    document.dispatchEvent(new CustomEvent('sidekick-ready'));
    expect(getComputedStyle(sidekick).opacity).to.equal('1');
  });

  it('preserves open and closed visibility after preview decoration', () => {
    const sidekick = injectSidekick();
    sidekick.classList.add('is-ready');
    expect(getComputedStyle(sidekick).opacity).to.equal('1');
    sidekick.setAttribute('open', 'false');
    expect(getComputedStyle(sidekick).opacity).to.equal('0');
    sidekick.removeAttribute('open');
    expect(getComputedStyle(sidekick).opacity).to.equal('0');
    sidekick.setAttribute('open', 'true');
    expect(getComputedStyle(sidekick).opacity).to.equal('1');
  });
});
