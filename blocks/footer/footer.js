import { getConfig, decorateLink } from '../../scripts/ak.js';

/*
 * Content-first footer.
 * All copy, links, media and form definitions live in footer.plain.html.
 * This file only reads that DOM, adds layout shells and builds form controls.
 *
 * Section shapes (detected from content, not position):
 * - empty section                      -> divider rule
 * - section with "name | type | ..."   -> lead band with toggleable form
 * - section with 2+ headings           -> link columns
 * - single list whose items have media -> icon tiles
 * - anything else                      -> bottom bar (legal links + copyright)
 *
 * Form encoding inside a lead section (list items, cells split by "|"):
 * - setting:  key | value                      (action, method, name, recaptcha)
 * - field:    name | type | placeholder | flags (required, <maxlength>, half)
 * - select:   field row + nested list of "label" or "label | value" options
 * - hidden:   name | hidden | value
 * A paragraph holding only bold text before the lists is the toggle label;
 * one after the lists is the submit label. Other paragraphs after the lists
 * are notes shown above the submit button.
 */

const CONTROL_TYPES = new Set(['text', 'email', 'tel', 'number', 'url', 'select', 'textarea', 'hidden']);
const RECAPTCHA_SCRIPT = 'https://www.google.com/recaptcha/api.js';

let formCount = 0;

function createEl(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function resolveUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}

function resolveSrcset(srcset, baseUrl) {
  return srcset.split(',').map((candidate) => {
    const [url, ...descriptor] = candidate.trim().split(/\s+/);
    return [resolveUrl(url, baseUrl), ...descriptor].join(' ');
  }).join(', ');
}

/* Relative media paths resolve against the URL the fragment was fetched from */
function resolveMediaUrls(root, baseUrl) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = resolveUrl(img.getAttribute('src'), baseUrl);
    img.loading = 'lazy';
  });
  root.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = resolveSrcset(source.getAttribute('srcset'), baseUrl);
  });
}

async function fetchFragment() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  resolveMediaUrls(doc.body, resp.url);
  return doc.body;
}

function getMedia(node) {
  const img = node.querySelector('img');
  return img ? (img.closest('picture') || img) : null;
}

function hasOnlyMedia(node) {
  return !!node.querySelector('img') && !node.textContent.trim();
}

function isEmphasisOnly(node) {
  if (node.tagName !== 'P' || node.querySelector('a, img')) return false;
  const kids = [...node.childNodes]
    .filter((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim());
  return kids.length === 1 && ['STRONG', 'B'].includes(kids[0].nodeName);
}

function unquote(value) {
  const match = value.match(/^"(.*)"$/s);
  return match ? match[1] : value;
}

function getCells(li) {
  const clone = li.cloneNode(true);
  clone.querySelectorAll(':scope > ul, :scope > ol').forEach((list) => list.remove());
  return clone.textContent.split('|').map((cell) => unquote(cell.trim()));
}

function isFieldRow(cells) {
  return CONTROL_TYPES.has((cells[1] || '').toLowerCase());
}

function getListRows(section) {
  return [...section.querySelectorAll(':scope > ul > li, :scope > ol > li')];
}

/* ---------- tiles ---------- */

function decorateTiles(section) {
  const list = section.querySelector(':scope > ul, :scope > ol');
  list.className = 'footer-tiles';
  [...list.children].forEach((li) => {
    li.className = 'footer-tile';
    const parts = [...li.children];
    const iconPart = parts.find(hasOnlyMedia);
    const textParts = parts.filter((p) => p !== iconPart);
    const text = createEl('div', 'footer-tile-text', textParts);
    textParts.forEach((p) => {
      const link = p.querySelector('a');
      if (link && link.textContent.trim() === p.textContent.trim()) p.className = 'footer-tile-title';
    });
    li.replaceChildren();
    if (iconPart) li.append(createEl('span', 'footer-tile-icon', [getMedia(iconPart)]));
    li.append(text);
  });
  return createEl('div', 'footer-inner', [list]);
}

/* ---------- lead form ---------- */

function buildSelect(cells, li) {
  const select = document.createElement('select');
  const placeholder = cells[2] || '';
  if (placeholder) {
    const option = new Option(placeholder, '', true, true);
    select.append(option);
  }
  li.querySelectorAll(':scope > ul > li, :scope > ol > li').forEach((optLi) => {
    const [label, value] = getCells(optLi);
    select.append(new Option(label, value ?? label));
  });
  return select;
}

function buildControl(cells, li) {
  const [name, rawType, placeholder = '', ...flags] = cells;
  const type = rawType.toLowerCase();

  if (type === 'hidden') {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    const fromQuery = new URLSearchParams(window.location.search).get(name);
    input.value = placeholder || fromQuery || '';
    return { control: input, hidden: true };
  }

  let control;
  if (type === 'select') {
    control = buildSelect(cells, li);
  } else if (type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 1;
  } else {
    control = document.createElement('input');
    control.type = type;
  }
  if (name) control.name = name;
  if (placeholder && type !== 'select') control.placeholder = placeholder;
  control.setAttribute('aria-label', placeholder.replace(/^\*\s*/, '') || name);

  let half = false;
  flags.forEach((flag) => {
    const key = flag.toLowerCase();
    if (key === 'required') control.required = true;
    else if (key === 'half') half = true;
    else if (/^\d+$/.test(key) && type !== 'select') control.maxLength = Number(key);
  });

  const wrapper = createEl('div', `footer-form-field${half ? ' footer-form-field-half' : ''}`, [control]);
  return { control: wrapper, hidden: false };
}

function loadScriptOnce(src) {
  if (document.querySelector(`script[src^="${src}"]`)) return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.defer = true;
  document.head.append(script);
}

/* reCAPTCHA is only requested once the form scrolls near the viewport or is used */
function lazyLoadCaptcha(form, panel) {
  let loaded = false;
  const load = () => {
    if (loaded || panel.classList.contains('is-collapsed')) return;
    loaded = true;
    loadScriptOnce(RECAPTCHA_SCRIPT);
  };
  form.addEventListener('focusin', load, { once: true });
  if (!('IntersectionObserver' in window)) return load;
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      load();
      if (loaded) observer.disconnect();
    }
  }, { rootMargin: '200px 0px' });
  observer.observe(form);
  return load;
}

function setPanelState(panel, toggle, expanded) {
  toggle.setAttribute('aria-expanded', String(expanded));
  panel.classList.toggle('is-collapsed', !expanded);
  panel.inert = !expanded;
}

function decorateLeadForm(section) {
  const before = [];
  const after = [];
  const lists = [];
  [...section.children].forEach((child) => {
    if (child.tagName === 'UL' || child.tagName === 'OL') lists.push(child);
    else if (lists.length) after.push(child);
    else before.push(child);
  });

  const settings = {};
  const visible = [];
  const hidden = [];
  lists.forEach((list) => {
    [...list.children].forEach((li) => {
      const cells = getCells(li);
      if (isFieldRow(cells)) {
        const { control, hidden: isHidden } = buildControl(cells, li);
        (isHidden ? hidden : visible).push(control);
      } else if (cells.length > 1) {
        settings[cells[0].toLowerCase()] = cells.slice(1).join('|').trim();
      }
    });
  });

  // header: brand media + intro copy + toggle
  const brand = createEl('div', 'footer-lead-brand');
  const intro = createEl('div', 'footer-lead-text');
  let toggleLabel = null;
  before.forEach((node) => {
    if (hasOnlyMedia(node)) brand.append(getMedia(node));
    else if (!toggleLabel && isEmphasisOnly(node)) toggleLabel = node.textContent.trim();
    else intro.append(node);
  });

  // form
  formCount += 1;
  const formId = settings.name || `footer-form-${formCount}`;
  const form = createEl('form', 'footer-form');
  form.id = formId;
  form.name = formId;
  if (settings.action) form.action = settings.action;
  form.method = settings.method || 'post';
  form.append(createEl('div', 'footer-form-fields', visible), ...hidden);

  let submitLabel = null;
  const notes = [];
  after.forEach((node) => {
    if (!submitLabel && isEmphasisOnly(node)) submitLabel = node.textContent.trim();
    else notes.push(node);
  });
  if (notes.length) form.append(createEl('div', 'footer-form-notes', notes));

  if (settings.recaptcha) {
    const captcha = createEl('div', 'footer-form-captcha g-recaptcha');
    captcha.dataset.sitekey = settings.recaptcha;
    form.append(captcha);
  }

  if (submitLabel) {
    const submit = createEl('button', 'footer-form-submit', [submitLabel]);
    submit.type = 'submit';
    form.append(createEl('div', 'footer-form-actions', [submit]));
  }

  const panelInner = createEl('div', 'footer-inner footer-form-panel-inner', [form]);
  const panel = createEl('div', 'footer-form-panel', [createEl('div', 'footer-form-panel-clip', [panelInner])]);
  panel.id = `${formId}-panel`;

  const cta = createEl('div', 'footer-lead-cta', [intro]);
  if (toggleLabel) {
    // anchor-style disclosure (no href) mirrors the source pill toggle
    const toggle = createEl('a', 'footer-form-toggle', [toggleLabel]);
    toggle.setAttribute('role', 'button');
    toggle.tabIndex = 0;
    toggle.setAttribute('aria-controls', panel.id);
    setPanelState(panel, toggle, true);
    const loadCaptcha = settings.recaptcha ? lazyLoadCaptcha(form, panel) : null;
    const togglePanel = () => {
      const expanded = toggle.getAttribute('aria-expanded') !== 'true';
      setPanelState(panel, toggle, expanded);
      if (expanded && loadCaptcha) loadCaptcha();
    };
    toggle.addEventListener('click', togglePanel);
    toggle.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      togglePanel();
    });
    cta.append(toggle);
  } else if (settings.recaptcha) {
    lazyLoadCaptcha(form, panel);
  }

  const header = createEl('div', 'footer-inner footer-lead-header', [brand, cta]);
  return [header, panel];
}

/* ---------- link columns ---------- */

// below this width link columns collapse into accordions (mirrors footer.css)
const DESKTOP_MEDIA = window.matchMedia('(width >= 900px)');

let columnCount = 0;

function setColumnState(column, toggle, expanded) {
  column.classList.toggle('is-open', expanded);
  toggle.setAttribute('aria-expanded', String(expanded));
}

/* Each column header toggles its own list on small screens (multi-expand) */
function decorateColumnAccordion(column, title) {
  const list = column.querySelector(':scope > ul, :scope > ol');
  if (!list) return;
  columnCount += 1;
  list.id = list.id || `footer-column-list-${columnCount}`;
  list.classList.add('footer-column-list');

  const toggle = createEl('button', 'footer-column-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', list.id);
  toggle.setAttribute('aria-label', title.textContent.trim());
  setColumnState(column, toggle, false);

  const header = createEl('div', 'footer-column-header', [title, toggle]);
  column.prepend(header);

  header.addEventListener('click', () => {
    if (DESKTOP_MEDIA.matches) return;
    setColumnState(column, toggle, toggle.getAttribute('aria-expanded') !== 'true');
  });
}

function decorateColumns(section) {
  const columns = [];
  let current = null;
  [...section.children].forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName)) {
      child.classList.add('footer-column-title');
      current = createEl('div', 'footer-column', [child]);
      columns.push(current);
    } else if (current) {
      current.append(child);
    }
  });
  columns.forEach((column) => {
    column.querySelectorAll('a').forEach((a) => {
      if (hasOnlyMedia(a)) a.classList.add('footer-icon-link');
    });
    decorateColumnAccordion(column, column.querySelector('.footer-column-title'));
  });
  return createEl('div', 'footer-inner footer-columns', columns);
}

/* ---------- bottom bar ---------- */

function decorateBottomBar(section) {
  const children = [...section.children];
  children.forEach((child) => {
    if (child.tagName === 'UL' || child.tagName === 'OL') child.classList.add('footer-bar-links');
    else child.classList.add('footer-bar-text');
  });
  return createEl('div', 'footer-inner footer-bar', children);
}

/* ---------- section routing ---------- */

function getSectionShape(section) {
  if (!section.textContent.trim() && !section.querySelector('img')) return 'divider';
  if (getListRows(section).some((li) => isFieldRow(getCells(li)))) return 'lead';
  if (section.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6').length > 1) return 'columns';
  const lists = section.querySelectorAll(':scope > ul, :scope > ol');
  if (lists.length === 1 && section.children.length === 1
    && [...lists[0].children].every((li) => li.querySelector('img'))) return 'tiles';
  return 'bar';
}

function decorateSection(section) {
  const shape = getSectionShape(section);
  const band = createEl('div', `footer-band footer-band-${shape}`);
  if (shape === 'divider') band.append(createEl('div', 'footer-inner', [document.createElement('hr')]));
  else if (shape === 'lead') band.append(...decorateLeadForm(section));
  else if (shape === 'columns') band.append(decorateColumns(section));
  else if (shape === 'tiles') band.append(decorateTiles(section));
  else band.append(decorateBottomBar(section));
  return band;
}

function decorateFooterLinks(root) {
  const config = getConfig();
  root.querySelectorAll('a[href]').forEach((a) => {
    decorateLink(config, a);
    if (a.target === '_blank') a.rel = 'noopener';
  });
}

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const fragment = await fetchFragment();
  if (!fragment) return;
  const sections = [...fragment.querySelectorAll(':scope > div')];
  const bands = sections.map((section) => decorateSection(section));
  const content = createEl('div', 'footer-content', bands);
  el.replaceChildren(content);
  decorateFooterLinks(content);
}
