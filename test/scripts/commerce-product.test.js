import { expect } from '@esm-bundle/chai';
import { decorateCommerceProduct, getProductType } from '../../scripts/commerce-product.js';

const PATH = '/en-us/home/products/delo-syn-trans-xe';
const IMAGE = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%221%22%20height=%221%22/%3E';
const fixture = `
  <header><nav>Existing EMA navigation</nav></header>
  <main>
    <div><h1 id="product-name">Delo Syn-Trans XE SAE 75W-90</h1>
      <p><picture><img src="${IMAGE}" alt="Delo Syn-Trans XE"></picture></p></div>
    <div>
      <p>Heavy duty synthetic AMT fluid</p><p>Extended drain and severe service operations.</p>
      <p><a href="/find-a-distributor">Find a Distributor</a></p>
      <h2>Product Details</h2>
      <ul><li><a href="https://cglapps.chevron.com/pds.pdf">PDS</a></li>
        <li><a href="https://cglapps.chevron.com/sds.pdf">SDS</a></li>
        <li><a href="https://deloprotection.com/share?canvas=123">Protection Diagram</a></li></ul>
      <h2>Equipment Supported</h2><ul><li><img src="${IMAGE}" alt=""> Buses</li>
        <li><img src="${IMAGE}" alt=""> Commercial trucks</li></ul>
      <h2>Product Benefits</h2><p>Proven field performance.</p>
      <ul><li>Gear wear protection.</li><li>Oxidation resistance.</li></ul>
      <h2>Applications</h2><p>Should not be used in axles.</p>
      <ul><li>Eaton PS-38</li><li>35 Pound Pail - 223079361</li></ul>
      <h2>Self Services</h2><h3>Delo Smart Choice Advisor</h3>
      <p><img src="${IMAGE}" alt=""></p><p>Find the right product.</p>
      <p><a href="/advisor">Learn More</a></p>
    </div>
  </main>
  <footer>Existing EMA footer</footer>`;

describe('Delo Product Bus detail template', () => {
  let sku;
  let structured;
  let main;

  beforeEach(() => {
    document.body.innerHTML = fixture;
    main = document.querySelector('main');
    sku = document.createElement('meta');
    sku.name = 'sku';
    sku.content = 'delo-syn-trans-xe-sae-75w-90';
    structured = document.createElement('script');
    structured.type = 'application/ld+json';
    structured.textContent = '{"@type":"Product","brand":{"name":"Delo"}}';
    document.head.append(sku, structured);
  });

  afterEach(() => {
    sku.remove();
    structured.remove();
  });

  it('creates the source hero, PDF panel, navigation, equipment and benefit cards', () => {
    expect(decorateCommerceProduct(main, PATH)).to.be.true;
    expect(main.querySelector('.commerce-product-category').textContent).to.equal('Transmission/Gear oils');
    expect(main.querySelector('.commerce-product-media picture')).to.exist;
    expect(main.querySelector('.commerce-product-details h1')).to.exist;
    expect(main.querySelectorAll('.commerce-product-document-list a')).to.have.length(2);
    expect(main.querySelector('.commerce-product-diagrams a').textContent).to.equal('Protection Diagram');
    expect(main.querySelectorAll('.commerce-product-equipment-list li')).to.have.length(2);
    expect(main.querySelectorAll('.commerce-product-benefit-cards li')).to.have.length(2);
    expect(main.querySelectorAll('.commerce-product-navigation a')).to.have.length(5);
    expect(main.querySelectorAll('.commerce-product-service-card')).to.have.length(1);
  });

  it('preserves every existing product text/link and the exact EMA header/footer nodes', () => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const texts = [...main.querySelectorAll('p,li,h1,h3')].map((node) => node.textContent.trim());
    const links = [...main.querySelectorAll('a')].map((node) => [node.textContent, node.href]);
    decorateCommerceProduct(main, PATH);
    const allText = main.textContent;
    texts.forEach((text) => expect(allText).to.include(text));
    links.forEach(([text, href]) => {
      expect([...main.querySelectorAll('a')].some((node) => node.textContent === text && node.href === href)).to.be.true;
    });
    expect(document.querySelector('header')).to.equal(header);
    expect(document.querySelector('footer')).to.equal(footer);
    expect(main.querySelectorAll('h1')).to.have.length(1);
  });

  it('supports all 40 confirmed paths, including the approved THF path and source categories', async () => {
    const response = await fetch('/source_website.md');
    expect(response.ok).to.be.true;
    const inventory = (await response.text()).split('## Delo catalog migration')[1].split('## Havoline catalog migration')[0];
    const rows = [...inventory.matchAll(/^\| `[^`]+\.html` \| `([^`]+)` \|$/gm)];
    expect(rows).to.have.length(40);
    rows.forEach(([, slug]) => {
      document.body.innerHTML = fixture;
      sku.content = slug;
      const path = `/en-us/home/products/${slug}`;
      expect(getProductType(path)).to.be.a('string');
      expect(decorateCommerceProduct(document.querySelector('main'), path)).to.be.true;
    });
    expect(getProductType('/en-us/home/products/delo-syn-thf-xc')).to.equal('Transmission/Gear oils');
    expect(getProductType('/en-us/home/products/delo-syn--thf-xc')).to.be.undefined;
  });

  it('supports all 17 Havoline paths without broadening the product hierarchy', async () => {
    const response = await fetch('/source_website.md');
    expect(response.ok).to.be.true;
    const inventory = (await response.text()).split('## Havoline catalog migration')[1].split('## Techron catalog migration')[0];
    const rows = [...inventory.matchAll(/^\| `[^`]+\.html` \| `([^`]+)` \|$/gm)];
    expect(rows).to.have.length(17);
    rows.forEach(([, slug]) => {
      document.body.innerHTML = fixture;
      sku.content = slug;
      const path = `/en-us/home/products/${slug}`;
      expect(getProductType(path)).to.be.a('string');
      expect(decorateCommerceProduct(document.querySelector('main'), path)).to.be.true;
      expect(document.querySelector('.commerce-product-havoline')).to.exist;
      expect(getProductType(`${path}.html`)).to.be.undefined;
      expect(getProductType(`${path}/nested`)).to.be.undefined;
    });
  });

  it('supports only the four listed Techron paths and preserves retailer actions', async () => {
    const response = await fetch('/source_website.md');
    expect(response.ok).to.be.true;
    const inventory = (await response.text()).split('## Techron catalog migration')[1].split('## Guides document pilot')[0];
    const rows = [...inventory.matchAll(/^\| `[^`]+\.html` \| `([^`]+)` \|$/gm)];
    expect(rows).to.have.length(4);
    rows.forEach(([, slug]) => {
      document.body.innerHTML = fixture;
      sku.content = slug;
      const productMain = document.querySelector('main');
      productMain.children[1].insertAdjacentHTML('afterbegin', '<p><a href="/find-a-retailer">Find a Retailer</a></p>');
      const path = `/en-us/home/products/${slug}`;
      expect(getProductType(path)).to.equal('Fuel additives');
      expect(decorateCommerceProduct(productMain, path)).to.be.true;
      expect(productMain.querySelector('.commerce-product-techron')).to.exist;
      expect(productMain.querySelectorAll('.commerce-product-actions a')).to.have.length(2);
      expect(productMain.querySelector('.commerce-product-retailer a').getAttribute('href')).to.equal('/find-a-retailer');
      expect(getProductType(`${path}.html`)).to.be.undefined;
      expect(getProductType(`${path}/nested`)).to.be.undefined;
    });
    expect(getProductType('/en-us/home/products/techron-unknown')).to.be.undefined;
  });

  it('preserves Havoline hero actions and distinct Self/Pro Services groups', () => {
    sku.content = 'havoline-lifelong-full-synthetic-motor-oil';
    const source = main.children[1];
    source.insertAdjacentHTML('afterbegin', '<p><a href="https://www.walmart.com/search.html?q=havoline+lifelong">Buy at Walmart</a></p>');
    const oldTitle = source.querySelector('h3');
    oldTitle.outerHTML = '<h3>Self Services</h3><h4>Product Selector</h4>';
    source.insertAdjacentHTML('beforeend', '<h3>Pro Services</h3><h4>Havoline eLearning</h4><p>Maintenance tips.</p><p><a href="/learning">Learn More</a></p>');
    expect(decorateCommerceProduct(main, `/en-us/home/products/${sku.content}`)).to.be.true;
    expect(main.querySelectorAll('.commerce-product-actions a')).to.have.length(2);
    expect(main.querySelector('.commerce-product-retailer a').textContent).to.equal('Buy at Walmart');
    expect([...main.querySelectorAll('.commerce-product-service-group > h3')].map((node) => node.textContent)).to.deep.equal(['Self Services', 'Pro Services']);
    expect(main.querySelectorAll('.commerce-product-service-card')).to.have.length(2);
    expect(main.querySelector('.commerce-product-service-card h4').textContent).to.equal('Product Selector');
    expect(main.textContent).to.include('Maintenance tips.');
  });

  it('does not alter DA-authored, unrelated, category, suffix or unknown-product pages', () => {
    const original = main.innerHTML;
    const paths = [
      '/home', '/en-us/home', '/en-us/home/products/by-brand/delo',
      '/en-us/home/products/by_brand/delo',
      '/en-us/home/products/havoline-synblend-dx-motor-oil',
      '/en-us/home/products/delo-unknown', `${PATH}.html`, `${PATH}/nested`, `${PATH}/`,
    ];
    paths.forEach((path) => expect(decorateCommerceProduct(main, path)).to.be.false);
    sku.remove();
    expect(decorateCommerceProduct(main, PATH)).to.be.false;
    expect(main.innerHTML).to.equal(original);
  });

  it('rejects incomplete content before moving or discarding any original nodes', () => {
    main.querySelectorAll('ul')[1].remove();
    const original = main.innerHTML;
    expect(() => decorateCommerceProduct(main, PATH)).to.throw('missing "Equipment Supported"');
    expect(main.innerHTML).to.equal(original);
  });

  it('is idempotent and marks the selected section link', () => {
    decorateCommerceProduct(main, PATH);
    expect(decorateCommerceProduct(main, PATH)).to.be.false;
    const anchor = main.querySelector('a[href="#benefits"]');
    anchor.click();
    expect(anchor.getAttribute('aria-current')).to.equal('location');
    expect(main.querySelectorAll('.commerce-product')).to.have.length(1);
  });

  it('opens and closes the accessible product-image dialog', () => {
    decorateCommerceProduct(main, PATH);
    const dialog = main.querySelector('dialog');
    main.querySelector('.commerce-product-zoom').click();
    expect(dialog.open).to.be.true;
    expect(dialog.getAttribute('aria-label')).to.include('Delo Syn-Trans XE');
    dialog.querySelector('button').click();
    expect(dialog.open).to.be.false;
  });
});
