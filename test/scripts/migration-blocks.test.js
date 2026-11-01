import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { decorateLink, loadBlock, setConfig } from '../../scripts/ak.js';
import decorateHero from '../../blocks/hero-overlay/hero-overlay.js';
import decorateColumns from '../../blocks/columns-cta/columns-cta.js';
import decoratePromo from '../../blocks/columns-promo/columns-promo.js';
import decorateSearch from '../../blocks/search/search.js';

const IMAGE = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%221%22%20height=%221%22/%3E';

describe('EMA migration block regressions', () => {
  let config;
  let location;

  beforeEach(() => {
    location = window.location.href;
    config = setConfig({
      locales: { '': {} }, hostnames: [], linkBlocks: [], components: [],
    });
  });

  afterEach(() => {
    sinon.restore();
    window.history.replaceState(null, '', location);
    document.body.replaceChildren();
  });

  it('preserves emphasized sentences around links instead of discarding their copy', () => {
    ['em', 'strong', 'del'].forEach((tag) => {
      document.body.innerHTML = `<p><${tag}>Hear Shawn discuss this on <a href="/podcast">LandlineNow.com</a>.</${tag}></p>`;
      const text = document.body.textContent;
      const link = document.querySelector('a');
      decorateLink(config, link);
      expect(document.body.textContent).to.equal(text);
      expect(link.closest(tag)).to.exist;
      expect(link.classList.contains('btn')).to.be.false;
    });
  });

  it('retains the existing primary, secondary, accent, negative and outline buttons', () => {
    [
      ['<strong><a href="/products">Products</a></strong>', 'btn-primary'],
      ['<em><a href="/products">Products</a></em>', 'btn-secondary'],
      ['<strong><em><a href="/products">Products</a></em></strong>', 'btn-accent'],
      ['<del><a href="/products">Products</a></del>', 'btn-negative'],
      ['<a href="/products"><u>Products</u></a>', 'btn-outline'],
    ].forEach(([html, variant]) => {
      document.body.innerHTML = `<p>${html}</p>`;
      const link = document.querySelector('a');
      decorateLink(config, link);
      expect(link.classList.contains('btn')).to.be.true;
      expect(link.classList.contains(variant)).to.be.true;
      expect(link.parentElement.tagName).to.equal('P');
      expect(link.textContent).to.equal('Products');
    });
  });

  it('preserves single-overlay hero content and its original link node', () => {
    document.body.innerHTML = `<div class="hero-overlay">
      <div><div><picture><img src="${IMAGE}" alt="Delo"></picture></div></div>
      <div><div><a href="/products">Choose Delo</a></div></div>
    </div>`;
    const block = document.querySelector('.hero-overlay');
    const link = block.querySelector('a');
    decorateHero(block);
    expect(block.classList.contains('hero-overlay-cta')).to.be.true;
    expect(block.querySelector('.hero-overlay-media img')).to.exist;
    expect(block.querySelector('.hero-overlay-content a')).to.equal(link);
  });

  it('retains all positional hero overlays and their authored order', () => {
    document.body.innerHTML = `<div class="hero-overlay">
      <div><div><img src="${IMAGE}" alt="Delo"></div><div></div></div>
      <div><div>Top center</div><div>ON-HIGHWAY</div></div>
      <div><div>Bottom left</div><div><strong>CHOOSE DELO</strong></div></div>
      <div><div>Bottom right</div><div><a href="/products">SWITCH TO DELO</a></div></div>
    </div>`;
    const block = document.querySelector('.hero-overlay');
    decorateHero(block);
    const areas = [...block.querySelectorAll('.hero-overlay-area')];
    expect(areas.map((area) => area.textContent)).to.deep.equal([
      'ON-HIGHWAY', 'CHOOSE DELO', 'SWITCH TO DELO',
    ]);
    expect(areas[0].classList.contains('hero-overlay-at-top-center')).to.be.true;
    expect(areas[1].classList.contains('hero-overlay-at-bottom-left')).to.be.true;
    expect(areas[2].classList.contains('hero-overlay-at-bottom-right')).to.be.true;
    expect(block.querySelector('.hero-overlay-media').children).to.have.length(1);
  });

  it('preserves image-only CTA cells, accessible image links and text links', () => {
    document.body.innerHTML = `<div class="columns-cta"><div>
      <div><picture><img src="${IMAGE}" alt="Reach a Rep"></picture></div>
      <div><a href="/distributor"><picture><img src="${IMAGE}" alt="Contact a Distributor"></picture></a></div>
      <div><a href="/expert">Chat with an Expert</a></div>
      <div><p>Let us help</p></div>
    </div></div>`;
    const block = document.querySelector('.columns-cta');
    const links = [...block.querySelectorAll('a')];
    decorateColumns(block);
    expect(block.querySelectorAll('.columns-cta-item')).to.have.length(4);
    expect(block.querySelector('.columns-cta-image img').alt).to.equal('Reach a Rep');
    expect(block.querySelector('.columns-cta-image-link')).to.equal(links[0]);
    expect(links[0].querySelector('img').alt).to.equal('Contact a Distributor');
    expect(block.querySelectorAll('a')[1]).to.equal(links[1]);
    expect(block.querySelector('.columns-cta-text').textContent).to.equal('Let us help');
  });

  it('overlays promo links without changing image links, alt text or authored nodes', () => {
    document.body.innerHTML = `<div class="columns-promo"><div>
      <div><a href="/delo" target="_blank" rel="noopener"><picture><img src="${IMAGE}" alt="Delo products"></picture></a>
        <p><strong>Total Vehicle Protection</strong></p><p>Protect critical engines.</p></div>
      <div><p>Hydraulic protection.</p><p><a href="/clarity"><img src="${IMAGE}" alt="Clarity"></a></p>
        <p><strong>Perform without Compromise</strong></p></div>
    </div></div>`;
    const block = document.querySelector('.columns-promo');
    const links = [...block.querySelectorAll('a')];
    const images = [...block.querySelectorAll('img')];
    const copy = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('img'));
    decoratePromo(block);
    const buttons = [...block.querySelectorAll('.columns-promo-cta')];
    expect(buttons.map((a) => a.getAttribute('href'))).to.deep.equal(['/delo', '/clarity']);
    expect(buttons.map((a) => a.textContent)).to.deep.equal(['Learn More', 'Learn More']);
    expect(buttons[0].getAttribute('aria-label')).to.equal('Learn More: Total Vehicle Protection');
    expect(buttons[1].getAttribute('aria-label')).to.equal('Learn More: Perform without Compromise');
    expect(buttons[0].target).to.equal('_blank');
    expect(buttons[0].rel).to.equal('noopener');
    expect([...block.querySelectorAll('.columns-promo-image a, a.columns-promo-image')]).to.deep.equal(links);
    expect([...block.querySelectorAll('img')]).to.deep.equal(images);
    expect(images.map((img) => img.alt)).to.deep.equal(['Delo products', 'Clarity']);
    copy.forEach((p) => expect(block.contains(p)).to.be.true);
    [...block.querySelectorAll('.columns-promo-card')].forEach((card) => {
      const mediaContainer = card.firstElementChild;
      expect(mediaContainer.classList.contains('columns-promo-media')).to.be.true;
      expect(mediaContainer.firstElementChild.classList.contains('columns-promo-image')).to.be.true;
      expect(mediaContainer.lastElementChild.classList.contains('columns-promo-cta')).to.be.true;
      expect(card.lastElementChild.tagName).to.equal('P');
      expect(card.lastElementChild.querySelector('img, .columns-promo-cta')).to.equal(null);
    });
    expect(block.querySelector('a a')).to.equal(null);
    decoratePromo(block);
    expect(block.querySelectorAll('.columns-promo-cta')).to.have.length(2);
    expect(block.querySelectorAll('.columns-promo-media')).to.have.length(2);
  });

  it('does not invent promo destinations or duplicate an authored button', () => {
    document.body.innerHTML = `<div class="columns-promo"><div>
      <div><picture><img src="${IMAGE}" alt="Unlinked artwork"></picture><p>Information only.</p></div>
      <div><a href="/havoline"><img src="${IMAGE}" alt="Havoline"></a>
        <p><a class="btn btn-primary" href="/offers">View offers</a></p></div>
    </div></div>`;
    const block = document.querySelector('.columns-promo');
    const authoredCTA = block.querySelector('.btn');
    decoratePromo(block);
    expect(block.querySelectorAll('.columns-promo-cta')).to.have.length(0);
    expect(block.querySelector('.btn')).to.equal(authoredCTA);
    expect(authoredCTA.textContent).to.equal('View offers');
    expect(authoredCTA.getAttribute('href')).to.equal('/offers');
  });

  it('rounds promo images and keeps white pill overlays legible and inside the image', async () => {
    const stylesheets = ['/styles/styles.css', '/blocks/columns-promo/columns-promo.css'].map((href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      return link;
    });
    try {
      await Promise.all(stylesheets.map((link) => new Promise((resolve, reject) => {
        link.onload = resolve;
        link.onerror = reject;
        document.head.append(link);
      })));
      document.body.innerHTML = `<div class="blue-bg"><div class="columns-promo"><div>
        <div><a href="/delo"><picture><img src="${IMAGE}" alt="Delo"></picture></a>
        <p><strong>Total Vehicle Protection</strong></p></div>
      </div></div></div>`;
      const block = document.querySelector('.columns-promo');
      decoratePromo(block);
      const image = block.querySelector('img');
      const card = block.querySelector('.columns-promo-card');
      const button = block.querySelector('.columns-promo-cta');
      expect(getComputedStyle(image).borderRadius).to.equal('4.5%');
      expect(getComputedStyle(card).borderRadius).to.equal('0px');
      expect(getComputedStyle(button).color).to.equal('rgb(12, 46, 114)');
      expect(getComputedStyle(button).backgroundColor).to.equal('rgb(255, 255, 255)');
      const imageRect = image.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      expect(buttonRect.height).to.be.at.least(44);
      expect(buttonRect.top).to.be.greaterThan(imageRect.top + imageRect.height * 0.78);
      expect(buttonRect.bottom).to.be.lessThan(imageRect.bottom);
      expect(buttonRect.left).to.be.greaterThan(imageRect.left);
      expect(buttonRect.right).to.be.lessThan(imageRect.right);
      expect(buttonRect.width / imageRect.width).to.be.closeTo(0.64, 0.01);
      button.focus();
      expect(document.activeElement).to.equal(button);
      document.querySelector('.blue-bg').classList.remove('blue-bg');
      expect(getComputedStyle(image).borderRadius).to.equal('4.5%');
    } finally {
      stylesheets.forEach((link) => link.remove());
    }
  });

  it('loads search through author-kit without fetching an index for an empty query', async () => {
    window.history.replaceState(null, '', window.location.pathname);
    const fetch = sinon.spy(window, 'fetch');
    document.body.innerHTML = '<div class="search"><div><div><a href="/query-index.json">Index</a></div></div></div>';
    const block = document.querySelector('.search');
    await loadBlock(block);
    expect(block.dataset.blockName).to.equal('search');
    expect(block.querySelector('.search-form input').name).to.equal('q');
    expect(block.querySelector('.search-status').textContent).to.equal('Enter a word or phrase to search the site.');
    expect(fetch.called).to.be.false;
  });

  it('keeps eight-result pagination, local product routes and literal search highlights', async () => {
    const entries = Array.from({ length: 9 }, (_, index) => ({
      path: `/en-us/home/products/delo-${index}`,
      title: `Delo ${index} | Chevron Lubricants (US)`,
      description: 'Delo <strong>oil</strong> for heavy-duty equipment.',
    }));
    entries.push({ path: '/en-us/nav', title: 'Delo navigation' });
    const fetch = sinon.stub(window, 'fetch').resolves({
      ok: true, json: async () => ({ data: entries }),
    });
    window.history.replaceState(null, '', '?q=delo');
    document.body.innerHTML = '<div class="search"></div>';
    const block = document.querySelector('.search');
    await decorateSearch(block);
    expect(block.querySelectorAll('.search-result')).to.have.length(8);
    expect(block.querySelector('.search-status').textContent).to.equal('1 - 8 of 9 results');
    expect(block.querySelector('.search-result-title').getAttribute('href')).to.equal(entries[0].path);
    expect(block.querySelector('.search-result-title').textContent).to.equal('Delo 0');
    expect(block.querySelector('.search-result-title mark').textContent).to.equal('Delo');
    expect(block.querySelector('.search-result-description strong')).to.equal(null);
    expect(block.querySelector('.search-result-description').textContent).to.include('<strong>oil</strong>');
    expect(new URL(fetch.firstCall.args[0]).searchParams.get('limit')).to.equal('5000');
    window.history.replaceState(null, '', '?q=delo&page=2');
    await decorateSearch(block);
    expect(block.querySelectorAll('.search-result')).to.have.length(1);
    expect(block.querySelector('.search-status').textContent).to.equal('9 - 9 of 9 results');
    expect(block.querySelector('ol').start).to.equal(9);
    expect(block.querySelector('[aria-current="page"]').textContent).to.equal('2');
    window.history.replaceState(null, '', '?q=missing');
    await decorateSearch(block);
    expect(block.querySelectorAll('.search-result')).to.have.length(0);
    expect(block.querySelector('.search-status').textContent).to.equal('No results for "missing".');
    expect(fetch.callCount).to.equal(1);
  });
});
