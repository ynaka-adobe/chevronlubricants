/*
 * Content-first header.
 * All copy, links and images live in nav.plain.html; this file only reads that
 * DOM, adds layout shells, builds interactive controls and wires behavior.
 *
 * Section roles are detected from content shape (not position):
 * - heading + list                       -> dialog (trigger label = heading)
 *     image-only paragraph               -> dialog close icon (alt = label)
 *     image + text paragraph             -> current entry
 *     text paragraph                     -> message
 *     list item: label + nested list     -> entry (image + links)
 * - list whose items hold nested lists   -> main menu with megamenu panels
 *     item label + nested list           -> panel; each nested item = column
 *     column item: label + list          -> link group / drill-down / tiles
 *     column item: paragraphs only       -> intro block (strong link = button)
 *     plain paragraph after the list     -> panel close label
 *     paragraph with emphasis            -> mobile back label ("Back to <em>Main menu</em>");
 *                                           the emphasized text names the top menu level
 *                                           and labels the menu toggle
 * - single linked image                  -> brand
 * - plain list of links                  -> utility links bar
 * - paragraphs                           -> tools (strong link = button,
 *                                           link with empty query param = search,
 *                                           text paragraph = mobile search prompt)
 * Links with href "#" are labels only. A "#_blank" suffix opens a new tab.
 *
 * Mobile (< 900px): the menu opens below the bar and each level replaces the
 * previous one (panel -> group -> drill item) with a "Back to ..." bar.
 */

const DESKTOP_MQ = window.matchMedia('(width >= 900px)');
const BLOCK_TAGS = new Set(['P', 'UL', 'OL', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
let uid = 0;

function createEl(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function nextId(prefix) {
  uid += 1;
  return `${prefix}-${uid}`;
}

function resolveUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}

/* Relative media paths resolve against the URL the fragment was fetched from */
function resolveMediaUrls(root, baseUrl) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = resolveUrl(img.getAttribute('src'), baseUrl);
  });
}

function decorateAnchors(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.endsWith('#_blank')) {
      a.href = href.replace(/#_blank$/, '');
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
}

async function fetchFragment() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  resolveMediaUrls(doc.body, resp.url);
  decorateAnchors(doc.body);
  return doc.body;
}

function isLabelOnlyLink(a) {
  const href = a?.getAttribute('href');
  return !href || href === '#';
}

/* Splits a list item / section into its label, paragraphs and nested list */
function splitItem(item) {
  const labelNodes = [];
  const paragraphs = [];
  let list = null;
  [...item.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.tagName)) {
      if (node.tagName === 'UL' || node.tagName === 'OL') list = list || node;
      else paragraphs.push(node);
    } else if (!list && !paragraphs.length) {
      labelNodes.push(node);
    }
  });
  const inline = labelNodes.filter((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim());
  const hasInlineLabel = inline.some((n) => n.textContent.trim() || n.nodeName === 'IMG');
  let label = hasInlineLabel ? inline : [];
  if (!hasInlineLabel && paragraphs.length) label = [...paragraphs.shift().childNodes];
  const anchor = label.length === 1 && label[0].nodeName === 'A' ? label[0] : null;
  const text = label.map((n) => n.textContent).join('').trim();
  const href = anchor && !isLabelOnlyLink(anchor) ? anchor.href : null;
  return {
    text, href, anchor, paragraphs, list,
  };
}

function listItems(list) {
  return list ? [...list.children].filter((el) => el.tagName === 'LI') : [];
}

function getButtonLink(paragraph) {
  const strong = paragraph.querySelector(':scope > strong, :scope > b');
  const a = strong?.querySelector('a[href]');
  return a && strong.textContent.trim() === a.textContent.trim() ? a : null;
}

/* Label-only links (href "#") stay anchors without href, like the source labels */
// label-only items render as text, not href-less anchors (not crawlable as links)
function createLabel(info, className) {
  return createEl('span', className, [info.text]);
}

function createTitle(info, className) {
  if (info.href) {
    const a = info.anchor;
    a.className = className;
    return a;
  }
  return createLabel(info, className);
}

/* ---------- mobile drill-down state ---------- */

function getActiveGroup(panel) {
  return panel.querySelector('.nav-group.is-mobile-active');
}

function updateBackLabel(item) {
  const back = item.querySelector('.nav-back');
  if (!back) return;
  const group = getActiveGroup(item.querySelector('.nav-panel'));
  const drillItem = group?.querySelector('.nav-drill-item.is-mobile-active');
  let target = back.dataset.rootLabel;
  if (drillItem) target = group.dataset.rootTitle;
  else if (group) target = item.querySelector('.nav-trigger').textContent.trim();
  back.querySelector('.nav-back-label').textContent = target;
}

function setGroupExpanded(group, expanded) {
  group.classList.toggle('is-mobile-active', expanded);
  const title = group.querySelector(':scope > .nav-group-title');
  if (title?.hasAttribute('aria-expanded')) title.setAttribute('aria-expanded', String(expanded));
}

function closeMobileDrill(group) {
  group.classList.remove('has-active-drill');
  group.querySelectorAll('.nav-drill-item.is-mobile-active').forEach((li) => {
    li.classList.remove('is-mobile-active');
    li.querySelector('.nav-drill-trigger').setAttribute('aria-expanded', 'false');
  });
}

/* scope itself (when it matches) plus its matching descendants */
function selectWithin(scope, selector) {
  return [...(scope.matches(selector) ? [scope] : []), ...scope.querySelectorAll(selector)];
}

function resetMobileState(scope) {
  selectWithin(scope, '.nav-group-drill.has-active-drill').forEach((g) => closeMobileDrill(g));
  selectWithin(scope, '.nav-group.is-mobile-active').forEach((g) => setGroupExpanded(g, false));
  selectWithin(scope, '.nav-panel.has-active-group').forEach((p) => p.classList.remove('has-active-group'));
  selectWithin(scope, '.nav-item').forEach((item) => updateBackLabel(item));
}

function openMobileGroup(group) {
  const item = group.closest('.nav-item');
  const panel = group.closest('.nav-panel');
  resetMobileState(panel);
  panel.classList.add('has-active-group');
  setGroupExpanded(group, true);
  updateBackLabel(item);
}

function openMobileDrill(group, li) {
  closeMobileDrill(group);
  group.classList.add('has-active-drill');
  li.classList.add('is-mobile-active');
  li.querySelector('.nav-drill-trigger').setAttribute('aria-expanded', 'true');
  updateBackLabel(group.closest('.nav-item'));
}

/* steps one level up: drill item -> group -> panel -> top menu */
function mobileBack(item, closePanel) {
  const panel = item.querySelector('.nav-panel');
  const group = getActiveGroup(panel);
  if (!group) {
    closePanel();
    return;
  }
  if (group.classList.contains('has-active-drill')) closeMobileDrill(group);
  else resetMobileState(panel);
  updateBackLabel(item);
}

/* ---------- megamenu panels ---------- */

function closeDrill(group) {
  group.classList.remove('is-drilled');
  const title = group.querySelector('.nav-group-title-text');
  title.textContent = group.dataset.rootTitle;
  group.querySelectorAll('.nav-drill-item').forEach((li) => {
    li.classList.remove('is-active');
    li.querySelector('.nav-drill-trigger').setAttribute('aria-expanded', 'false');
  });
  group.querySelector('.nav-group-title').setAttribute('aria-expanded', 'false');
}

function openDrill(group, li) {
  closeDrill(group);
  group.classList.add('is-drilled');
  li.classList.add('is-active');
  const trigger = li.querySelector('.nav-drill-trigger');
  trigger.setAttribute('aria-expanded', 'true');
  group.querySelector('.nav-group-title-text').textContent = trigger.textContent;
  const title = group.querySelector('.nav-group-title');
  title.setAttribute('aria-expanded', 'true');
  title.focus();
}

function buildLinkList(list, className = 'nav-link-list') {
  const ul = createEl('ul', className);
  listItems(list).forEach((li) => {
    const a = li.querySelector('a[href]');
    if (!a) return;
    a.className = 'nav-link';
    ul.append(createEl('li', '', [a]));
  });
  return ul;
}

function buildDrillGroup(info) {
  const group = createEl('div', 'nav-group nav-group-drill');
  group.dataset.rootTitle = info.text;
  const title = createEl('button', 'nav-group-title', [createLabel(info, 'nav-group-title-text')]);
  title.type = 'button';
  title.setAttribute('aria-expanded', 'false');
  title.addEventListener('click', () => {
    if (group.classList.contains('is-drilled')) {
      const active = group.querySelector('.nav-drill-item.is-active .nav-drill-trigger');
      closeDrill(group);
      active?.focus();
    } else if (!DESKTOP_MQ.matches) {
      openMobileGroup(group);
    }
  });
  const ul = createEl('ul', 'nav-drill-list');
  listItems(info.list).forEach((li) => {
    const entry = splitItem(li);
    const item = createEl('li', 'nav-drill-item');
    if (entry.list) {
      const trigger = createEl('button', 'nav-drill-trigger', [createLabel(entry, 'nav-drill-label')]);
      trigger.type = 'button';
      trigger.setAttribute('aria-expanded', 'false');
      const children = buildLinkList(entry.list, 'nav-link-list nav-drill-children');
      children.id = nextId('nav-drill');
      trigger.setAttribute('aria-controls', children.id);
      trigger.addEventListener('click', () => {
        if (DESKTOP_MQ.matches) openDrill(group, item);
        else openMobileDrill(group, item);
      });
      item.append(trigger, children);
    } else if (entry.anchor) {
      entry.anchor.className = 'nav-link';
      item.append(entry.anchor);
    }
    ul.append(item);
  });
  group.classList.add('nav-group-expandable');
  group.append(title, ul);
  return group;
}

/* On mobile a group title opens the group; a linked title navigates once open */
function makeExpandable(group, title) {
  group.classList.add('nav-group-expandable');
  title.addEventListener('click', (e) => {
    if (DESKTOP_MQ.matches || group.classList.contains('is-mobile-active')) return;
    e.preventDefault();
    openMobileGroup(group);
  });
  title.addEventListener('keydown', (e) => {
    if (DESKTOP_MQ.matches || title.getAttribute('role') !== 'button') return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    title.click();
  });
}

function buildTileList(list) {
  const ul = createEl('ul', 'nav-tiles');
  listItems(list).forEach((li) => {
    const img = li.querySelector('img');
    const a = li.querySelector('a[href]');
    if (!a) return;
    if (img) img.loading = 'lazy';
    const media = createEl('div', 'nav-tile-media', img ? [img] : []);
    a.className = 'nav-tile-link';
    const body = createEl('div', 'nav-tile-body', [a]);
    const tile = createEl('li', 'nav-tile', [media, body]);
    ul.append(tile);
  });
  return ul;
}

function buildGroup(li) {
  const info = splitItem(li);
  const items = listItems(info.list);
  if (items.length && items.some((item) => item.querySelector(':scope > ul, :scope > ol'))) {
    return buildDrillGroup(info);
  }
  const group = createEl('div', 'nav-group');
  const title = info.text ? createTitle(info, 'nav-group-title') : null;
  if (title) group.append(title);
  info.paragraphs.forEach((p) => {
    const btn = getButtonLink(p);
    if (btn) {
      btn.className = 'nav-button';
      group.append(btn);
    } else {
      group.append(createEl('p', 'nav-group-text', [...p.childNodes]));
    }
  });
  if (items.length && items.some((item) => item.querySelector('img'))) {
    group.classList.add('nav-group-tiles');
    group.append(buildTileList(info.list));
  } else if (items.length) {
    group.classList.add('nav-group-links');
    group.append(buildLinkList(info.list));
  } else {
    group.classList.add('nav-group-intro');
    if (info.href) group.classList.add('nav-group-linked');
  }
  if (title && items.length) makeExpandable(group, title);
  return group;
}

/* mobile-only "Back to <level>" bar; copy comes from the menu section labels */
function buildBackButton({ backPrefix, rootLabel }) {
  if (!backPrefix && !rootLabel) return null;
  const back = createEl('button', 'nav-back', [
    createEl('span', 'nav-back-prefix', [backPrefix]),
    ' ',
    createEl('span', 'nav-back-label', [rootLabel]),
  ]);
  back.type = 'button';
  back.dataset.rootLabel = rootLabel;
  return back;
}

function buildPanel(info, labels) {
  const columns = listItems(info.list).map((colLi) => {
    const col = createEl('div', 'nav-panel-col');
    const { list } = splitItem(colLi);
    listItems(list).forEach((groupLi) => col.append(buildGroup(groupLi)));
    return col;
  });
  const grid = createEl('div', `nav-panel-grid nav-panel-cols-${columns.length}`, columns);
  const panel = createEl('div', 'nav-panel', [createEl('div', 'nav-panel-inner', [grid])]);
  panel.id = nextId('nav-panel');
  const back = buildBackButton(labels);
  if (back) panel.prepend(back);
  if (labels.closeLabel) {
    const close = createEl('button', 'nav-panel-close', [createEl('span', '', [labels.closeLabel])]);
    close.type = 'button';
    panel.append(createEl('div', 'nav-panel-bar', [close]));
  }
  return panel;
}

function resetDrills(scope) {
  scope.querySelectorAll('.nav-group-drill.is-drilled').forEach((g) => closeDrill(g));
}

function setPanelState(item, open) {
  item.classList.toggle('is-open', open);
  item.querySelector('.nav-trigger').setAttribute('aria-expanded', String(open));
  if (!open) {
    resetDrills(item);
    resetMobileState(item);
  }
}

function closeAllPanels(root) {
  root.querySelectorAll('.nav-item.is-open').forEach((item) => setPanelState(item, false));
}

function openPanel(root, item) {
  root.querySelectorAll('.nav-item.is-open').forEach((other) => {
    if (other !== item) setPanelState(other, false);
  });
  setPanelState(item, true);
}

/* paragraphs after the menu list: plain = close label, emphasized = back label */
function getMenuLabels(section) {
  const paragraphs = [...section.children].filter((el) => el.tagName === 'P' && el.textContent.trim());
  const backP = paragraphs.find((p) => p.querySelector('em, i'));
  const closeP = paragraphs.find((p) => p !== backP);
  const em = backP?.querySelector('em, i');
  return {
    closeLabel: closeP?.textContent.trim(),
    rootLabel: em?.textContent.trim() || '',
    backPrefix: em ? backP.textContent.replace(em.textContent, '').trim() : '',
  };
}

function buildMenu(section, root, labels) {
  const list = section.querySelector(':scope > ul, :scope > ol');
  const ul = createEl('ul', 'nav-sections nav-list');
  listItems(list).forEach((li) => {
    const info = splitItem(li);
    const item = createEl('li', 'nav-item');
    if (!info.list) {
      // strong-wrapped link = call-to-action item; plain link = text item
      const cta = li.querySelector(':scope > strong > a[href], :scope > b > a[href]');
      if (cta) {
        cta.className = 'nav-trigger nav-cta';
        item.classList.add('nav-item-cta');
        item.append(cta);
      } else if (info.anchor) {
        info.anchor.className = 'nav-trigger-link';
        item.append(info.anchor);
      }
      ul.append(item);
      return;
    }
    const trigger = createEl('button', 'nav-trigger', [createLabel(info, 'nav-trigger-label')]);
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded', 'false');
    const panel = buildPanel(info, labels);
    trigger.setAttribute('aria-controls', panel.id);
    item.classList.add('has-panel');
    item.append(trigger, panel);

    trigger.addEventListener('click', (e) => {
      const isOpen = item.classList.contains('is-open');
      // pointer clicks keep a hover-opened panel open; keyboard clicks toggle
      if (isOpen && DESKTOP_MQ.matches && e.detail > 0) return;
      if (isOpen) setPanelState(item, false);
      else openPanel(root, item);
    });
    item.addEventListener('mouseenter', () => {
      if (DESKTOP_MQ.matches) openPanel(root, item);
    });
    item.addEventListener('mouseleave', () => {
      if (DESKTOP_MQ.matches) setPanelState(item, false);
    });
    item.addEventListener('focusout', (e) => {
      // keyboard users tabbing out close the panel; pointer users close via mouseleave
      if (!DESKTOP_MQ.matches || item.contains(e.relatedTarget) || item.matches(':hover')) return;
      setPanelState(item, false);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !item.classList.contains('is-open')) return;
      setPanelState(item, false);
      trigger.focus();
    });
    panel.querySelector('.nav-panel-close')?.addEventListener('click', () => {
      setPanelState(item, false);
      trigger.focus();
    });
    panel.querySelector('.nav-back')?.addEventListener('click', () => {
      mobileBack(item, () => {
        setPanelState(item, false);
        trigger.focus();
      });
    });
    ul.append(item);
  });
  return createEl('div', 'nav-menu-sections', [ul]);
}

/* ---------- dialog (e.g. locale selector) ---------- */

function buildDialog(section) {
  const heading = section.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6');
  const label = heading.textContent.trim();
  const dialog = createEl('dialog', 'nav-dialog');
  dialog.setAttribute('aria-label', label);
  const box = createEl('div', 'nav-dialog-box');
  const head = createEl('div', 'nav-dialog-head');
  const body = createEl('div', 'nav-dialog-body');
  let closeBtn = null;

  [...section.children].forEach((el) => {
    if (el === heading) return;
    if (el.tagName === 'P') {
      const img = el.querySelector('img');
      const text = el.textContent.trim();
      if (img && !text && !closeBtn) {
        closeBtn = createEl('button', 'nav-dialog-close', [img]);
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', img.alt);
        img.alt = '';
        head.append(closeBtn);
      } else if (img) {
        body.append(createEl('div', 'nav-dialog-current', [img, createEl('span', '', [text])]));
      } else if (text) {
        body.append(createEl('p', 'nav-dialog-message', [...el.childNodes]));
      }
    } else if (el.tagName === 'UL' || el.tagName === 'OL') {
      const grid = createEl('ul', 'nav-dialog-grid');
      listItems(el).forEach((li) => {
        const entry = splitItem(li);
        const img = li.querySelector('img');
        if (img) img.loading = 'lazy';
        const links = [...(entry.list?.querySelectorAll('a[href]') || [])].filter((a) => !isLabelOnlyLink(a));
        links.forEach((a) => { a.className = 'nav-dialog-link'; });
        const cell = createEl('li', 'nav-dialog-entry', [
          ...(img ? [img] : []),
          createEl('span', 'nav-dialog-entry-name', [entry.text]),
          ...links,
        ]);
        grid.append(cell);
      });
      body.append(grid);
    }
  });
  if (!closeBtn) {
    closeBtn = createEl('button', 'nav-dialog-close', [label]);
    closeBtn.type = 'button';
    head.append(closeBtn);
  }

  box.append(head, body);
  dialog.append(box);

  const trigger = createEl('button', 'nav-dialog-trigger', [createEl('span', '', [label])]);
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');

  const close = () => { if (dialog.open) dialog.close(); };
  trigger.addEventListener('click', () => {
    dialog.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  });
  closeBtn.addEventListener('click', close);
  // clicks on the transparent dialog surface (outside the box) act as backdrop clicks
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  dialog.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  });
  return { trigger, dialog };
}

/* ---------- tools (CTA + search) ---------- */

function getSearchSpec(a) {
  try {
    const url = new URL(a.href);
    const entry = [...url.searchParams.entries()].find(([, value]) => value === '');
    if (!entry) return null;
    url.search = '';
    return { action: url.href, name: entry[0], label: a.textContent.trim() };
  } catch {
    return null;
  }
}

function buildSearchForm({
  action, name, label, placeholder,
}) {
  const form = createEl('form', 'nav-search');
  form.action = action;
  form.method = 'get';
  form.setAttribute('role', 'search');
  const input = createEl('input', 'nav-search-input');
  input.type = 'search';
  input.name = name;
  input.placeholder = placeholder || label;
  input.setAttribute('aria-label', label);
  const submit = createEl('button', 'nav-search-submit');
  submit.type = 'submit';
  submit.setAttribute('aria-label', label);
  form.append(createEl('div', 'nav-search-box', [
    createEl('div', 'nav-search-field', [input]),
    createEl('div', 'nav-search-action', [submit]),
  ]));
  return form;
}

function buildTools(section) {
  const tools = createEl('div', 'nav-tools');
  let searchSpec = null;
  [...section.querySelectorAll(':scope > p')].forEach((p) => {
    const btn = getButtonLink(p);
    if (btn) {
      btn.className = 'nav-cta';
      tools.append(btn);
      return;
    }
    const a = p.querySelector('a[href]');
    const search = a && getSearchSpec(a);
    if (search) {
      searchSpec = search;
      tools.append(buildSearchForm(search));
    } else if (a) {
      tools.append(a);
    } else if (searchSpec && p.textContent.trim()) {
      // text paragraph after the search link = prompt of the mobile search dialog
      searchSpec.prompt = p.textContent.trim();
    }
  });
  return { tools, searchSpec };
}

/* mobile header search: icon button opening a full-screen search dialog */
function buildSearchDialog(spec, closeLabel) {
  const dialog = createEl('dialog', 'nav-search-dialog');
  dialog.setAttribute('aria-label', spec.label);
  const close = createEl('button', 'nav-search-dialog-close');
  close.type = 'button';
  if (closeLabel) close.setAttribute('aria-label', closeLabel);
  const form = buildSearchForm({ ...spec, placeholder: spec.prompt });
  dialog.append(createEl('div', 'nav-search-dialog-box', [
    createEl('div', 'nav-search-dialog-head', [close]),
    createEl('div', 'nav-search-dialog-body', [form]),
  ]));

  const toggle = createEl('button', 'nav-search-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-label', spec.label);
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.addEventListener('click', () => {
    dialog.showModal();
    form.querySelector('input').focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => toggle.focus());
  return { toggle, dialog };
}

/* ---------- section detection ---------- */

function getSectionRole(section) {
  const list = section.querySelector(':scope > ul, :scope > ol');
  const heading = section.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6');
  if (heading && list) return 'dialog';
  if (list && list.querySelector(':scope > li > ul, :scope > li > ol')) return 'menu';
  if (list) return 'links';
  const links = section.querySelectorAll('a[href]');
  if (links.length === 1 && links[0].querySelector('img') && !links[0].textContent.trim()) return 'brand';
  return 'tools';
}

function buildLinksBar(section) {
  const list = section.querySelector(':scope > ul, :scope > ol');
  const ul = buildLinkList(list, 'nav-utility-links');
  ul.querySelectorAll('a').forEach((a) => { a.className = 'nav-utility-link'; });
  return ul;
}

function buildBrand(section) {
  const a = section.querySelector('a[href]');
  a.className = 'nav-brand-link';
  const img = a.querySelector('img');
  if (img) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  }
  return createEl('div', 'nav-brand', [a]);
}

function toggleMobileMenu(header, force) {
  const open = force ?? !header.classList.contains('is-mobile-open');
  header.classList.toggle('is-mobile-open', open);
  header.querySelector('.nav-hamburger')?.setAttribute('aria-expanded', String(open));
}

/* label-only group titles act as buttons on mobile only */
function syncTitleRoles(root, desktop) {
  root.querySelectorAll('.nav-group-expandable > .nav-group-title:not(button):not([href])').forEach((title) => {
    if (desktop) {
      title.removeAttribute('role');
      title.removeAttribute('tabindex');
      title.removeAttribute('aria-expanded');
    } else {
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-expanded', String(title.parentElement.classList.contains('is-mobile-active')));
    }
  });
}

function buildHeader(fragment, el) {
  const utility = createEl('div', 'nav-utility-inner');
  const brandSlot = [];
  const menuSlot = [];
  const toolsSlot = [];
  const dialogs = [];
  const navRoot = createEl('nav', 'nav-main');
  const sections = [...fragment.querySelectorAll(':scope > div')];
  const menuSection = sections.find((section) => getSectionRole(section) === 'menu');
  const labels = menuSection ? getMenuLabels(menuSection) : {};
  let searchSpec = null;

  sections.forEach((section) => {
    const role = getSectionRole(section);
    // dialog trigger first in DOM (source order); CSS renders it after the links
    if (role === 'links') utility.append(buildLinksBar(section));
    if (role === 'dialog') {
      const { trigger, dialog } = buildDialog(section);
      utility.prepend(trigger);
      dialogs.push(dialog);
    }
    if (role === 'brand') brandSlot.push(buildBrand(section));
    if (role === 'menu') menuSlot.push(buildMenu(section, navRoot, labels));
    if (role === 'tools') {
      const built = buildTools(section);
      toolsSlot.push(built.tools);
      searchSpec = searchSpec || built.searchSpec;
    }
  });

  // mobile: utility links + dialog triggers move into the open menu (below the main list)
  const utilityNodes = [...utility.children];
  const menuUtility = createEl('div', 'nav-menu-utility');
  // mobile: call-to-action items render as a button below the list (source order)
  const ctaItems = menuSlot.flatMap((m) => [...m.querySelectorAll('.nav-item-cta')]);
  const ctaLinks = ctaItems.map((li) => li.querySelector('a'));
  const menuCta = createEl('div', 'nav-menu-cta');
  const menu = createEl('div', 'nav-menu', [...menuSlot, menuCta, ...toolsSlot, menuUtility]);
  menu.id = nextId('nav-menu');
  const hamburger = createEl('button', 'nav-hamburger', [createEl('span', 'nav-hamburger-icon')]);
  hamburger.type = 'button';
  hamburger.setAttribute('aria-controls', menu.id);
  hamburger.setAttribute('aria-expanded', 'false');
  if (labels.rootLabel) hamburger.setAttribute('aria-label', labels.rootLabel);
  hamburger.addEventListener('click', () => toggleMobileMenu(el));

  const barSlot = [];
  let searchDialog = null;
  if (searchSpec) {
    const { toggle, dialog } = buildSearchDialog(searchSpec, labels.closeLabel);
    barSlot.push(toggle);
    searchDialog = dialog;
    dialogs.push(dialog);
  }

  navRoot.append(createEl('div', 'nav-main-inner', [...brandSlot, hamburger, menu, ...barSlot]));
  const wrapper = createEl('div', 'nav-wrapper', [
    createEl('div', 'nav-utility', [utility]),
    navRoot,
  ]);
  el.replaceChildren(wrapper, ...dialogs);

  const applyViewport = (desktop) => {
    if (desktop) utility.append(...utilityNodes);
    else menuUtility.append(...utilityNodes.filter((n) => n.tagName === 'UL'), ...utilityNodes.filter((n) => n.tagName !== 'UL'));
    ctaItems.forEach((li, i) => {
      if (!ctaLinks[i]) return;
      if (desktop) li.append(ctaLinks[i]);
      else menuCta.append(ctaLinks[i]);
      li.hidden = !desktop;
    });
    syncTitleRoles(navRoot, desktop);
  };
  applyViewport(DESKTOP_MQ.matches);

  DESKTOP_MQ.addEventListener('change', (e) => {
    closeAllPanels(navRoot);
    resetDrills(navRoot);
    resetMobileState(navRoot);
    toggleMobileMenu(el, false);
    if (searchDialog?.open) searchDialog.close();
    applyViewport(e.matches);
  });
}

/**
 * loads and decorates the header
 * @param {Element} el The header element
 */
export default async function init(el) {
  const fragment = await fetchFragment();
  if (!fragment) return;
  buildHeader(fragment, el);
}
