const PRODUCT_TYPES = new Map([
  ['delo-100-motor-oils', 'Engine oils'],
  ['delo-1000-marine', 'Engine oils'],
  ['delo-400', 'Engine oils'],
  ['delo-400-sng', 'Engine oils'],
  ['delo-400-xle-sae-10w-30', 'Engine oils'],
  ['delo-400-xle-sb-15w-40', 'Engine oils'],
  ['delo-400-xsp-15w-40', 'Engine oils'],
  ['delo-400-xsp-fa-5w-30', 'Engine oils'],
  ['delo-400-xsp-sae-5w-30', 'Engine oils'],
  ['delo-400-xsp-sae-5w-40', 'Engine oils'],
  ['delo-400-zfa-sae-10w-30', 'Engine oils'],
  ['delo-600-adf-10w-30', 'Engine oils'],
  ['delo-600-adf-15w-40', 'Engine oils'],
  ['delo-710-ls', 'Engine oils'],
  ['delo-elc-advanced-antifreezecoolant-5050', 'Coolants & antifreezes'],
  ['delo-elc-antifreeze-coolant', 'Coolants & antifreezes'],
  ['delo-elc-pg-antifreezecoolant', 'Coolants & antifreezes'],
  ['delo-eli-corrosion-inhibitor', 'Coolants & antifreezes'],
  ['delo-extreme-ep-5', 'Transmission/Gear oils'],
  ['delo-gear-esi-sae-80w-90', 'Transmission/Gear oils'],
  ['delo-gear-esi-sae-85w-140', 'Transmission/Gear oils'],
  ['delo-syn-thf-xc', 'Transmission/Gear oils'],
  ['delo-syn-amt-xdt-sae-75w-90', 'Transmission/Gear oils'],
  ['delo-syn-atf-668', 'Transmission/Gear oils'],
  ['delo-syn-atf-hd', 'Transmission/Gear oils'],
  ['delo-syn-gear-hd-sae-75w-90', 'Transmission/Gear oils'],
  ['delo-syn-gear-xda', 'Transmission/Gear oils'],
  ['delo-syn-gear-xdm-sae-75w-90-80w-140', 'Transmission/Gear oils'],
  ['delo-syn-grease-sfe-ep-0', 'Greases'],
  ['delo-syn-tdl-75w-90', 'Industrial oils'],
  ['delo-syn-trans-hd-sae-50', 'Transmission/Gear oils'],
  ['delo-syn-trans-xe', 'Transmission/Gear oils'],
  ['delo-syn-trans-xv-sae-75w-80', 'Transmission/Gear oils'],
  ['delo-torqforce', 'Transmission/Gear oils'],
  ['delo-torqforce-fd', 'Transmission/Gear oils'],
  ['delo-torqforce-mp', 'Hydraulic oils, Transmission/Gear oils'],
  ['delo-torqforce-syn', 'Transmission/Gear oils'],
  ['delo-torqforce-syn-fd-1', 'Industrial oils'],
  ['delo-xlc-antifreeze-coolant', 'Coolants & antifreezes'],
  ['delo-xli-corrosion-inhibitor-concentrate', 'Coolants & antifreezes'],
]);

export function getProductType(pathname) {
  const prefix = '/en-us/home/products/';
  return pathname.startsWith(prefix) ? PRODUCT_TYPES.get(pathname.slice(prefix.length)) : undefined;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = `commerce-product-${className}`;
  if (text) node.textContent = text;
  return node;
}

function link(text, href) {
  const anchor = element('a', '', text);
  anchor.href = href;
  return anchor;
}

function button(text, label) {
  const control = element('button', '', text);
  control.type = 'button';
  if (label) control.setAttribute('aria-label', label);
  return control;
}

function readContent(main) {
  const heading = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const source = [...main.children][1];
  if (!heading || !picture?.querySelector('img') || !source) {
    throw new Error('Delo detail: incomplete Product Bus markup');
  }
  const groups = new Map([['intro', []]]);
  let group = 'intro';
  for (const node of source.children) {
    if (node.tagName === 'H2') {
      group = node.textContent.trim();
      if (groups.has(group)) throw new Error(`Delo detail: duplicate section "${group}"`);
      groups.set(group, []);
    } else {
      groups.get(group).push(node);
    }
  }
  for (const required of ['Product Details', 'Equipment Supported', 'Product Benefits', 'Applications']) {
    if (!groups.get(required)?.length) throw new Error(`Delo detail: missing "${required}"`);
  }
  if (!groups.get('Equipment Supported').some((node) => node.tagName === 'UL')) {
    throw new Error('Delo detail: missing equipment list');
  }
  const allowed = new Set([
    'intro', 'Product Details', 'Equipment Supported', 'Product Benefits',
    'Applications', 'Self Services', 'Services and Support',
  ]);
  if ([...groups.keys()].some((key) => !allowed.has(key))) {
    throw new Error('Delo detail: unknown source section; keeping original content');
  }
  return { heading, picture, groups };
}

function addZoom(media, picture, name) {
  const zoom = button('+', `Enlarge image of ${name}`);
  zoom.className = 'commerce-product-zoom';
  const dialog = element('dialog', 'image-dialog');
  dialog.setAttribute('aria-label', name);
  const close = button('Close', 'Close enlarged product image');
  const image = picture.querySelector('img').cloneNode();
  image.removeAttribute('loading');
  dialog.append(close, image);
  zoom.addEventListener('click', () => dialog.showModal());
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  media.append(zoom, dialog);
}

function buildHero(content, type) {
  const hero = element('article', 'hero');
  const media = element('div', 'media');
  media.append(content.picture);
  addZoom(media, content.picture, content.heading.textContent);
  const details = element('div', 'details');
  details.append(element('span', 'category', type), content.heading);
  const intro = element('div', 'intro');
  const distributor = [];
  for (const node of content.groups.get('intro')) {
    if (node.querySelector('a') && node.textContent.trim() === 'Find a Distributor') {
      distributor.push(node);
    } else {
      intro.append(node);
    }
  }
  details.append(intro);
  const documents = element('section', 'documents');
  const documentHeading = element('h2', '', 'Product Details : ');
  documentHeading.append(element('small', '', '(PDF Format)'));
  documents.append(documentHeading);
  const diagrams = element('section', 'diagrams');
  const documentList = element('ul', 'document-list');
  for (const node of content.groups.get('Product Details')) {
    if (node.tagName !== 'UL') {
      documents.append(node);
    } else {
      for (const item of [...node.children]) {
        const anchor = item.querySelector('a[href]');
        if (anchor && new URL(anchor.href).hostname === 'deloprotection.com') {
          diagrams.append(anchor);
        } else {
          documentList.append(item);
        }
      }
    }
  }
  if (documentList.children.length) documents.append(documentList);
  if (diagrams.children.length) {
    diagrams.prepend(element('h3', '', 'See How It Works'));
    documents.append(diagrams);
  }
  details.append(documents);
  distributor.forEach((node) => {
    node.classList.add('commerce-product-distributor');
    details.append(node);
  });
  hero.append(media, details);
  return hero;
}

function buildSection(id, title, nodes) {
  const section = element('section', id);
  section.id = id;
  const heading = element('h2', '', title);
  heading.id = `${id}-heading`;
  section.setAttribute('aria-labelledby', heading.id);
  section.append(heading, ...nodes);
  return section;
}

function decorateEquipment(section) {
  const list = section.querySelector('ul');
  if (!list) throw new Error('Delo detail: missing equipment list');
  list.id = 'commerce-equipment-list';
  list.className = 'commerce-product-equipment-list';
  const controls = element('div', 'equipment-controls');
  const previous = button('<', 'Previous equipment');
  const next = button('>', 'Next equipment');
  for (const [control, direction] of [[previous, -1], [next, 1]]) {
    control.setAttribute('aria-controls', list.id);
    control.addEventListener('click', () => list.scrollBy({
      left: direction * list.clientWidth,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    }));
  }
  controls.append(previous, next);
  section.insertBefore(controls, list);
}

function decorateServices(section) {
  const cards = element('div', 'service-cards');
  let card;
  for (const node of [...section.children].slice(1)) {
    if (node.tagName === 'H3' || node.tagName === 'H4') {
      card = element('article', 'service-card');
      cards.append(card);
    }
    if (card) card.append(node);
    else cards.append(node);
  }
  section.append(cards);
}

function buildNavigation(sections) {
  const nav = element('nav', 'navigation');
  nav.setAttribute('aria-label', 'Product sections');
  const labels = ['Equipment', 'Benefits', 'Applications', 'Services and Support'];
  sections.forEach((section, index) => {
    const anchor = link(labels[index], `#${section.id}`);
    anchor.addEventListener('click', () => {
      nav.querySelectorAll('a').forEach((item) => item.removeAttribute('aria-current'));
      anchor.setAttribute('aria-current', 'location');
    });
    nav.append(anchor);
  });
  nav.append(link('Connect With Us', '#connect-with-us-to-discuss-your-lubrication-needs'));
  return nav;
}

export function decorateCommerceProduct(main, pathname = window.location.pathname) {
  const type = getProductType(pathname);
  if (!type || !main || main.querySelector('.commerce-product')) return false;
  const sku = document.querySelector('meta[name="sku"]')?.content;
  const slug = pathname.split('/').pop();
  if (sku !== slug && !(slug === 'delo-syn-trans-xe' && sku === `${slug}-sae-75w-90`)) return false;
  if (!document.querySelector('script[type="application/ld+json"]')) return false;
  const content = readContent(main);
  const root = element('div');
  root.className = 'commerce-product';
  const breadcrumbs = element('nav', 'breadcrumbs');
  breadcrumbs.setAttribute('aria-label', 'Breadcrumb');
  breadcrumbs.append(link('Home', '/en-us/home'), element('span', '', '>'), element('span', '', 'Products'));
  const hero = buildHero(content, type);
  const equipment = buildSection('equipment', 'Equipment Supported', content.groups.get('Equipment Supported'));
  decorateEquipment(equipment);
  const benefits = buildSection('benefits', 'Product Benefits', content.groups.get('Product Benefits'));
  benefits.querySelector('ul')?.classList.add('commerce-product-benefit-cards');
  const applications = buildSection('applications', 'Applications', content.groups.get('Applications'));
  const serviceTitle = content.groups.has('Self Services') ? 'Self Services' : 'Services and Support';
  const serviceNodes = content.groups.get(serviceTitle);
  const sections = [equipment, benefits, applications];
  if (serviceNodes) {
    const services = buildSection('support', serviceTitle, serviceNodes);
    decorateServices(services);
    sections.push(services);
  }
  root.append(breadcrumbs, hero, buildNavigation(sections), ...sections);
  main.replaceChildren(root);
  return true;
}

let styles;
export default async function init(main) {
  if (!getProductType(window.location.pathname)) return;
  if (!styles) {
    styles = new Promise((resolve, reject) => {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = new URL('../styles/commerce-product.css', import.meta.url).href;
      stylesheet.onload = resolve;
      stylesheet.onerror = () => reject(new Error('Could not load Delo product detail styles'));
      document.head.append(stylesheet);
    });
  }
  await styles;
  decorateCommerceProduct(main);
}
