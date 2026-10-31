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
  ['havoline-2-cycle-engine-oil', 'Engine oils'],
  ['havoline-automatic-transmission-fluid-md-3', 'Transmission/Gear oils'],
  ['havoline-automatic-transmission-fluid-type-f', 'Transmission/Gear oils'],
  ['havoline-conventional-antifreezecoolant', 'Coolants & antifreezes'],
  ['havoline-cvt-plus', 'Transmission/Gear oils'],
  ['havoline-full-synthetic-multi-vehicle-atf', 'Transmission/Gear oils'],
  ['havoline-global-multi-vehicle-atf', 'Transmission/Gear oils'],
  ['havoline-high-mileage-synblend-motor-oil', 'Engine oils'],
  ['havoline-lifelong-full-synthetic-motor-oil', 'Engine oils'],
  ['havoline-motor-oil', 'Engine oils'],
  ['havoline-power-steering-fluid', 'Transmission/Gear oils'],
  ['havoline-pro-ds-full-synthetic-euro-motor-oil', 'Engine oils'],
  ['havoline-pro-ds-full-synthetic-motor-oil', 'Engine oils'],
  ['havoline-synblend-dx-motor-oil', 'Engine oils'],
  ['havoline-synblend-motor-oil', 'Engine oils'],
  ['havoline-universal-antifreezecoolant', 'Coolants & antifreezes'],
  ['havoline-xtended-life-antifreezecoolant', 'Coolants & antifreezes'],
  ['techron-complete-fuel-system-cleaner', 'Fuel additives'],
  ['techron-diesel', 'Fuel additives'],
  ['techron-fuel-injector-cleaner', 'Fuel additives'],
  ['techron-high-mileage-fuel-system-cleaner', 'Fuel additives'],
]);

const INDUSTRIAL_PRODUCT_TYPES = new Map([
  ['aries', 'Industrial oils'],
  ['black-pearl-grease-ep-1-2', 'Greases'],
  ['black-pearl-grease-hm-1', 'Greases'],
  ['black-pearl-grease-sri-2', 'Greases'],
  ['bright-cut-metalworking-fluid', 'Industrial oils'],
  ['capella-p', 'Engine oils, Industrial oils'],
  ['capella-wf', 'Industrial oils'],
  ['cetus-advantage', 'Industrial oils'],
  ['cetus-de', 'Industrial oils'],
  ['cetus-elitesyn-mgx', 'Industrial oils'],
  ['cetus-pao-hc', 'Industrial oils'],
  ['chevron-1000-thf', 'Hydraulic oils, Industrial oils, Transmission/Gear oils'],
  ['chevron-atf-hd-389', 'Transmission/Gear oils'],
  ['chevron-compressor-oil', 'Industrial oils'],
  ['chevron-cylinder-oil-w', 'Industrial oils'],
  ['chevron-form-oil-22', 'Industrial oils'],
  ['chevron-gear-oil-gl-1', 'Transmission/Gear oils'],
  ['chevron-glass-machine-oil-mv', 'Industrial oils'],
  ['chevron-htf-e-100', 'Coolants & antifreezes'],
  ['chevron-htf-p-150', 'Coolants & antifreezes'],
  ['chevron-htf-p-200', 'Coolants & antifreezes'],
  ['chevron-hydraulic-oil-5606a', 'Industrial oils'],
  ['chevron-open-gear-grease', 'Greases'],
  ['chevron-open-gear-lubricant', 'Transmission/Gear oils'],
  ['chevron-paper-machine-oil-premium', 'Industrial oils'],
  ['chevron-red-chain-bar-oils', 'Industrial oils'],
  ['chevron-shingle-oil', 'Industrial oils'],
  ['chevron-soluble-oil-b', 'Industrial oils'],
  ['chevron-tmgl-premium', 'Engine oils, Industrial oils'],
  ['chevron-tractor-fluid', 'Hydraulic oils'],
  ['chevron-vartech-industrial-system-cleaner', 'System Cleaner'],
  ['chevron-way-lubricant', 'Industrial oils'],
  ['clarity-aw', 'Hydraulic oils, Industrial oils'],
  ['clarity-bio-elitesyn-aw', 'Hydraulic oils, Industrial oils'],
  ['clarity-elitesyn-aw-sae-32-46-68', 'Hydraulic oils, Industrial oils'],
  ['clarity-machine-oils', 'Industrial oils'],
  ['clarity-saw-guide-oils', 'Industrial oils'],
  ['clarity-synthetic-hydraulic-oil-aw', 'Hydraulic oils, Industrial oils'],
  ['clarity-synthetic-machine-oil', 'Industrial oils'],
  ['delo-400-sp-0w-30', 'Engine oils'],
  ['delo-710-hb-rt-sae-20w-40', 'Industrial oils'],
  ['delo-gear-ls', 'Transmission/Gear oils'],
  ['gst-2190-ep', 'Industrial oils'],
  ['gst-advantage-ep', 'Industrial oils'],
  ['gst-advantage-ro', 'Industrial oils'],
  ['gst-oil', 'Industrial oils'],
  ['hdax-3100-ashless-gas-engine-oils', 'Engine oils'],
  ['hdax-3200-low-ash-gas-engine-oils', 'Engine oils, Industrial oils'],
  ['hdax-5100-ashless-gas-engine-oil', 'Engine oils'],
  ['hdax-5200-low-ash-gas-engine-oils', 'Engine oils'],
  ['hdax-5300-medium-ash-gas-engine-oil', 'Engine oils, Industrial oils'],
  ['hdax-6500-lfg', 'Engine oils'],
  ['hdax-9200-low-ash-gas-engine-oil', 'Engine oils'],
  ['hdax-9500-gas-engine-oil', 'Industrial oils'],
  ['hdax-9700', 'Engine oils'],
  ['hdax-pf-antifreezecoolant-premixed-5050', 'Coolants & antifreezes'],
  ['meropa', 'Transmission/Gear oils'],
  ['meropa-elitesyn-wl', 'Industrial oils'],
  ['meropa-elitesyn-xm', 'Industrial oils'],
  ['meropa-synthetic-wm', 'Industrial oils'],
  ['meropa-xl', 'Industrial oils'],
  ['multifak-cg-grease', 'Greases'],
  ['multifak-ep-00-0-1-2-greases', 'Greases'],
  ['paralux-process-oils', 'Industrial oils'],
  ['rando-hd', 'Hydraulic oils, Industrial oils'],
  ['rando-hd-premium-oil-mv', 'Industrial oils'],
  ['rando-hdz', 'Hydraulic oils, Industrial oils'],
  ['rando-wm-32', 'Industrial oils'],
  ['regal-hd-57', 'Industrial oils'],
  ['regal-hh', 'Industrial oils'],
  ['regal-ro', 'Industrial oils'],
  ['regal-sgt', 'Industrial oils'],
  ['rykon-ep-2-grease', 'Greases'],
  ['rykon-hd-2-grease', 'Greases'],
  ['rykon-hd-2-m5-grease', 'Greases'],
  ['starplex-ep-0-00-1-2-greases', 'Greases'],
  ['starplex-hd-1-2-greases', 'Greases'],
  ['starplex-hd-1-2-m5-greases', 'Greases'],
  ['starplex-hd-m3', 'Greases'],
  ['starplex-syn-grease-ep-1-m5', 'Greases'],
  ['starplex-syn-grease-hd-15', 'Greases'],
  ['starplex-syn-grease-xd-15', 'Greases'],
  ['talcor-ogp-4-gear-oil', 'Industrial oils'],
  ['talcor-ogp-6-gear-oil', 'Industrial oils'],
  ['taro-20-dp', 'Engine oils'],
  ['taro-30-dp', 'Engine oils'],
  ['taro-40-xl', 'Engine oils'],
  ['taro-50-xl', 'Engine oils'],
  ['taro-ultra-20-40-70-100-140', 'Engine oils, Industrial oils'],
  ['tegra-synthetic-barrier-fluid', 'Industrial oils'],
  ['texclad-2', 'Greases'],
  ['ultra-duty-hd-0-1-2-greases', 'Greases'],
  ['ultra-duty-xd-00', 'Greases'],
  ['ursa-hydraulic-oil-10w', 'Hydraulic oils'],
  ['ursa-super-plus-ec-sae-15w-40', 'Engine oils'],
  ['veritas-800-marine-oil', 'Engine oils'],
  ['way-oils-vistac', 'Industrial oils'],
]);

const PRODUCTS_WITHOUT_EQUIPMENT = new Set(['chevron-tmgl-premium', 'regal-hd-57']);

export function getProductType(pathname) {
  const prefix = '/en-us/home/products/';
  if (!pathname.startsWith(prefix)) return undefined;
  const slug = pathname.slice(prefix.length);
  return PRODUCT_TYPES.get(slug) ?? INDUSTRIAL_PRODUCT_TYPES.get(slug);
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

function readContent(main, withoutEquipment) {
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
    if (required === 'Equipment Supported' && withoutEquipment) {
      if (groups.has(required)) throw new Error('Industrial detail: unexpected equipment section');
    } else if (!groups.get(required)?.length) {
      throw new Error(`Delo detail: missing "${required}"`);
    }
  }
  if (!withoutEquipment && !groups.get('Equipment Supported').some((node) => node.tagName === 'UL')) {
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

function buildHero(content, type, retailBrand, industrial) {
  const hero = element('article', 'hero');
  const media = element('div', 'media');
  media.append(content.picture);
  addZoom(media, content.picture, content.heading.textContent);
  const details = element('div', 'details');
  details.append(element('span', 'category', type), content.heading);
  const intro = element('div', 'intro');
  const distributor = [];
  const actions = element('div', 'actions');
  for (const node of content.groups.get('intro')) {
    const action = node.querySelector('a');
    const label = node.textContent.trim();
    if (industrial && node.tagName === 'P' && node.firstElementChild?.tagName === 'SMALL') {
      node.classList.add('commerce-product-subtitle');
      details.append(node);
    } else if (retailBrand && action && /^(Find a (Distributor|Retailer)|Buy Online|Buy at Walmart)$/i.test(label)) {
      node.classList.add(label === 'Find a Distributor' ? 'commerce-product-distributor' : 'commerce-product-retailer');
      actions.append(node);
    } else if (action && label === 'Find a Distributor') {
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
  if (actions.children.length) details.append(actions);
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

function decorateServices(section, grouped) {
  const container = element('div', grouped ? 'service-groups' : 'service-cards');
  let cards = container;
  let card;
  for (const node of [...section.children].slice(1)) {
    if (grouped && node.tagName === 'H3') {
      const group = element('section', 'service-group');
      cards = element('div', 'service-cards');
      group.append(node, cards);
      container.append(group);
      card = undefined;
    } else if (node.tagName === 'H3' || node.tagName === 'H4') {
      card = element('article', 'service-card');
      cards.append(card);
    }
    if (!(grouped && node.tagName === 'H3')) {
      if (card) card.append(node);
      else cards.append(node);
    }
  }
  section.append(container);
}

function buildNavigation(sections) {
  const nav = element('nav', 'navigation');
  nav.setAttribute('aria-label', 'Product sections');
  const labels = { equipment: 'Equipment', benefits: 'Benefits', applications: 'Applications', support: 'Services and Support' };
  sections.forEach((section) => {
    const anchor = link(labels[section.id], `#${section.id}`);
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
  const content = readContent(main, PRODUCTS_WITHOUT_EQUIPMENT.has(slug));
  const havoline = slug.startsWith('havoline-');
  const techron = slug.startsWith('techron-');
  const industrial = INDUSTRIAL_PRODUCT_TYPES.has(slug);
  const root = element('div');
  root.className = 'commerce-product';
  if (havoline) root.classList.add('commerce-product-havoline');
  if (techron) root.classList.add('commerce-product-techron');
  if (industrial) root.classList.add('commerce-product-industrial');
  const breadcrumbs = element('nav', 'breadcrumbs');
  breadcrumbs.setAttribute('aria-label', 'Breadcrumb');
  breadcrumbs.append(link('Home', '/en-us/home'), element('span', '', '>'), element('span', '', 'Products'));
  const hero = buildHero(content, type, havoline || techron || industrial, industrial);
  let equipment;
  if (content.groups.has('Equipment Supported')) {
    equipment = buildSection('equipment', 'Equipment Supported', content.groups.get('Equipment Supported'));
    decorateEquipment(equipment);
  }
  const benefits = buildSection('benefits', 'Product Benefits', content.groups.get('Product Benefits'));
  benefits.querySelector('ul')?.classList.add('commerce-product-benefit-cards');
  const applications = buildSection('applications', 'Applications', content.groups.get('Applications'));
  const serviceTitle = content.groups.has('Self Services') ? 'Self Services' : 'Services and Support';
  const serviceNodes = content.groups.get(serviceTitle);
  const sections = equipment ? [equipment, benefits, applications] : [benefits, applications];
  if (serviceNodes) {
    const services = buildSection('support', serviceTitle, serviceNodes);
    decorateServices(services, (havoline || industrial) && serviceNodes.some((node) => node.tagName === 'H4'));
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
