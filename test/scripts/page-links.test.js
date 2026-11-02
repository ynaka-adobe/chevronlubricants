import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { formatPageLink, normalizePageLinks, observePageLinks } from '../../scripts/utils/page-links.js';
import decorateSearch from '../../blocks/search/search.js';

const LIVE = 'https://chevronlubricants.ynaka-adobe.com';
const PAGE = `${LIVE}/en-us/home`;
const PREVIEW = 'https://main--chevronlubricants--ynaka-adobe.aem.page';
const tick = () => new Promise((resolve) => { setTimeout(resolve, 0); });

describe('Chevron outgoing page links', () => {
  let stop;

  afterEach(() => {
    stop?.();
    stop = undefined;
    sinon.restore();
    document.body.replaceChildren();
  });

  it('adds exactly one html suffix without reserializing paths, queries or fragments', () => {
    [
      ['/en-us/home', '/en-us/home.html'],
      ['/en-us/home.html', '/en-us/home.html'],
      ['b2b-landing', 'b2b-landing.html'],
      [`${LIVE}/en-us/home`, `${LIVE}/en-us/home.html`],
      ['//chevronlubricants.ynaka-adobe.com/en-us/home', '//chevronlubricants.ynaka-adobe.com/en-us/home.html'],
      ['/en-us/%68ome?p=2&p=1&empty=&flag&v=%26%2F+a%20b#part%20one', '/en-us/%68ome.html?p=2&p=1&empty=&flag&v=%26%2F+a%20b#part%20one'],
      ['/en-us/home?', '/en-us/home.html?'],
      ['/en-us/home?#', '/en-us/home.html?#'],
      ['/en-us/home/products/delo%2Dsyn-trans-xe#benefits', '/en-us/home/products/delo%2Dsyn-trans-xe.html#benefits'],
      ['/en-us/home/index', '/en-us/home/index.html'],
    ].forEach(([input, expected]) => {
      expect(formatPageLink(input, PAGE), input).to.equal(expected);
      expect(formatPageLink(expected, PAGE), `idempotent ${input}`).to.equal(expected);
    });
  });

  it('preserves directories, controls, assets, documents, external sites and non-page suffixes', () => {
    [
      '', '#', '#benefits', '?p=2&insights=1#hero', '/', '/en-us/', '/en-us/home/',
      '.', '..', '/en-us/home/..', '/en-us/home.plain.html', '/en-us/home.html.html',
      '/en-us/home.pdf.html', '/en-us/home.HTML', '/en-us/home%2Epdf',
      '/en-us/home%2Farticle', '/query-index.json', '/en-us/home/schedules/main.json',
      '/en-us/home/fragments/hero', '/en-us/home/schedules/landing',
      '/en-us/home/documents/download', '/en-us/home/api/data', '/en-us/admin/login',
      '/en-us/scripts/example', '/en-us/tools/editor', '/head.html', '/404.html',
      '/en-us/home/head', '/en-us/404', '/content/en-us/home',
      '/en-us/media_abc.png?width=600&format=webp', '/docs/manual.pdf#page=2',
      '/media/video.mp4', '/styles/styles.css', '/deps/at/vendor-at.js',
      'https://www.chevronlubricants.com/en_us/home.html',
      'https://example.com/en-us/home', 'https://da.live/edit#/ynaka-adobe/chevronlubricants/en-us/home',
      'https://other--site--org.aem.page/en-us/home',
      'https://chevronlubricants.ynaka-adobe.com:444/en-us/home',
      'https://main--chevronlubricants--ynaka-adobe.aem.page:444/en-us/home',
      'mailto:info@example.com', 'tel:+18005550123', 'data:text/plain,hello',
      // eslint-disable-next-line no-script-url
      'javascript:void(0)',
    ].forEach((input) => expect(formatPageLink(input, PAGE), input).to.equal(input));
  });

  it('maps main-tier page references to the live host only on the custom domain', () => {
    ['page', 'live', 'network'].forEach((tier) => {
      const host = `https://main--chevronlubricants--ynaka-adobe.aem.${tier}`;
      expect(formatPageLink(`${host}/en-us/home?p=2#hero`, PAGE))
        .to.equal(`${LIVE}/en-us/home.html?p=2#hero`);
      expect(formatPageLink(`${host}/en-us/home.html?p=2#hero`, `${host}/en-us/home`))
        .to.equal(`${host}/en-us/home?p=2#hero`);
      expect(formatPageLink('/en-us/home', `${host}/en-us/home`)).to.equal('/en-us/home');
      expect(formatPageLink('/en-us/home.html?x=1#hero', `${host}/en-us/home`))
        .to.equal('/en-us/home?x=1#hero');
      expect(formatPageLink(`${host}/query-index.json`, PAGE)).to.equal(`${host}/query-index.json`);
    });
    expect(formatPageLink(`${LIVE}/en-us/home`, `${PREVIEW}/en-us/home`))
      .to.equal(`${LIVE}/en-us/home.html`);
    expect(formatPageLink('/en-us/home', 'http://localhost:3000/en-us/home')).to.equal('/en-us/home');
    expect(formatPageLink('/en-us/home.html?x=1#hero', 'http://127.0.0.1:3000/en-us/home'))
      .to.equal('/en-us/home?x=1#hero');
    const branch = 'https://feature--chevronlubricants--ynaka-adobe.aem.page';
    expect(formatPageLink(`${branch}/en-us/home.html?p=2`, PAGE))
      .to.equal(`${branch}/en-us/home?p=2`);
    expect(formatPageLink('/en-us/home.html', `${branch}/en-us/home`)).to.equal('/en-us/home');
  });

  it('preserves nodes, events, canonical metadata and all non-navigation attributes', () => {
    document.body.innerHTML = `<header><a href="/en-us/home">Home</a></header>
      <main><a href="/en-us/home/products/delo-syn-trans-xe?p=2#benefits" target="_blank" rel="noopener">Product</a>
        <a download href="/en-us/home/download">Download</a>
        <a class="fragment auto-block" href="/en-us/home/source">Source</a>
        <div class="hidden-container"><a href="/en-us/home/hidden">Hidden source</a></div>
        <a href="/query-index.json">Index</a>
        <form role="search"></form><form method="post" action="/en-us/home/contact-us"></form>
      </main><footer><a href="/en-us/home/contact-us">Contact</a></footer>`;
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = PAGE;
    document.head.append(canonical);
    const anchors = [...document.querySelectorAll('a')];
    const activate = sinon.spy((event) => event.preventDefault());
    anchors[1].addEventListener('click', activate);
    try {
      normalizePageLinks(document.body, PAGE);
      normalizePageLinks(document.body, PAGE);
      expect([...document.querySelectorAll('a')]).to.deep.equal(anchors);
      expect(anchors.map((anchor) => anchor.getAttribute('href'))).to.deep.equal([
        '/en-us/home.html', '/en-us/home/products/delo-syn-trans-xe.html?p=2#benefits',
        '/en-us/home/download', '/en-us/home/source', '/en-us/home/hidden', '/query-index.json',
        '/en-us/home/contact-us.html',
      ]);
      expect(anchors[1].target).to.equal('_blank');
      expect(anchors[1].rel).to.equal('noopener');
      anchors[1].click();
      expect(activate.calledOnce).to.equal(true);
      expect(canonical.href).to.equal(PAGE);
      expect(document.querySelector('form[role="search"]').getAttribute('action')).to.equal('/en-us/home.html');
      expect(document.querySelector('form[method="post"]').getAttribute('action')).to.equal('/en-us/home/contact-us');
    } finally {
      canonical.remove();
    }
  });

  it('normalizes inserted nodes and href/action updates without mutation loops', async () => {
    stop = observePageLinks(document.body, PAGE);
    const main = document.createElement('main');
    main.innerHTML = '<a href="/en-us/b2b-landing?p=2#hero">Role</a><form role="search" action="/en-us/home/search-results"></form>';
    document.body.append(main);
    await tick();
    const anchor = main.querySelector('a');
    const writes = sinon.spy(anchor, 'setAttribute');
    expect(anchor.getAttribute('href')).to.equal('/en-us/b2b-landing.html?p=2#hero');
    expect(main.querySelector('form').getAttribute('action')).to.equal('/en-us/home/search-results.html');
    anchor.setAttribute('href', '/en-us/home/contact-us?x=%26%2F+&x=#contact');
    await tick();
    expect(anchor.getAttribute('href')).to.equal('/en-us/home/contact-us.html?x=%26%2F+&x=#contact');
    expect(writes.callCount).to.equal(2);
    await tick();
    expect(writes.callCount).to.equal(2);
    main.querySelector('form').setAttribute('action', '/en-us/home/search-results?flag&empty=');
    await tick();
    expect(main.querySelector('form').getAttribute('action')).to.equal('/en-us/home/search-results.html?flag&empty=');
    const direct = document.createElement('a');
    direct.href = '/en-us/home/where-to-buy';
    document.body.append(direct);
    await tick();
    expect(direct.getAttribute('href')).to.equal('/en-us/home/where-to-buy.html');
  });

  it('covers query-index search results and pagination without changing the fetch endpoint', async () => {
    const entries = Array.from({ length: 9 }, (_, i) => ({
      path: `/en-us/home/products/delo-${i}`, title: `Delo ${i}`,
    }));
    const fetch = sinon.stub(window, 'fetch').resolves({
      ok: true,
      json: async () => ({ data: entries }),
    });
    const location = window.location.href;
    try {
      window.history.replaceState(null, '', '/en-us/home/search-results?q=delo');
      stop = observePageLinks(document.body, `${LIVE}${window.location.pathname}${window.location.search}`);
      const block = document.createElement('div');
      document.body.append(block);
      await decorateSearch(block);
      await tick();
      expect(block.querySelectorAll('.search-result')).to.have.length(8);
      expect([...block.querySelectorAll('a')].every((anchor) => new URL(anchor.href).pathname.endsWith('.html'))).to.equal(true);
      expect(new URL(fetch.firstCall.args[0]).pathname).to.equal('/query-index.json');
      expect(block.querySelector('form').getAttribute('action')).to.equal('/en-us/home/search-results.html');
    } finally {
      window.history.replaceState(null, '', location);
    }
  });

  it('logs malformed links explicitly and leaves them intact', () => {
    const error = sinon.stub(console, 'error');
    expect(formatPageLink('https://[', PAGE)).to.equal('https://[');
    expect(error.calledOnce).to.equal(true);
  });
});
