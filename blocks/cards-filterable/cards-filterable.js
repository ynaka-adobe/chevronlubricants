/**
 * Cards-Filterable: resource library with a collapsible "Filter by" panel
 * (collapsible Brands / Type checkbox groups, Apply Filter / Clear All), applied
 * filters shown as removable chips, above a 3-column grid of compact tiles
 * (linked title left, thumbnail right; videos get a play overlay).
 * Filter logic: OR within a group, AND across groups. Options come from the data.
 *
 * Sheet mode: row 1 = one cell with a link to a sheet .json
 *   (columns: title, link, image, video, brand, type, lastModified).
 *   Optional row 2: preselected filters, e.g. "Brand: ISOCLEAN®" / "Type: Video, Guide".
 *   The link resolves relative to the page, so /content/<path>.json works locally
 *   and /<path>.json on Edge Delivery.
 * Static mode: 1 row per item: [thumbnail (video: linked to YouTube) |
 *   linked title (+ optional tags paragraph "Brand, Type[, Type]")].
 *   Without tags no filter panel is rendered (plain related-articles grid).
 */

import { createPicture } from '../../scripts/utils/picture.js';

const GROUPS = [
  { key: 'brands', label: 'Brands', aliases: ['brand', 'brands'] },
  { key: 'types', label: 'Type', aliases: ['type', 'types'] },
];

const CHEVRON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 5.5 8 11.5l6-6" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
const REMOVE = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="8" fill="currentColor"/><path d="m5 5 6 6m0-6-6 6" stroke="#fff" stroke-width="2"/></svg>';

let instance = 0;

function splitValues(value) {
  if (Array.isArray(value)) return value.map((v) => `${v}`.trim()).filter(Boolean);
  return `${value ?? ''}`.split(/\s*[,;|]\s*/).map((v) => v.trim()).filter(Boolean);
}

function isVideoUrl(href) {
  return /youtube\.com|youtu\.be|youtube-nocookie\.com/.test(href || '');
}

/* candidate URLs for the sheet: local dev serves content under /content/ */
function sheetUrls(href) {
  const { origin, pathname } = window.location;
  const url = new URL(href, window.location.href);
  const sameOrigin = url.origin === origin;
  const onContent = pathname.startsWith('/content/');
  const urls = [];
  if (sameOrigin && onContent && !url.pathname.startsWith('/content/')) {
    urls.push(new URL(`/content${url.pathname}${url.search}`, origin));
  }
  urls.push(url);
  if (sameOrigin && !onContent && url.pathname.startsWith('/content/')) {
    urls.push(new URL(`${url.pathname.replace(/^\/content/, '')}${url.search}`, origin));
  }
  return urls;
}

async function fetchSheet(href) {
  for (const url of sheetUrls(href)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(url);
      if (resp.ok) {
        // eslint-disable-next-line no-await-in-loop
        const json = await resp.json();
        const firstSheet = json[':names']?.[0];
        const data = json.data || (firstSheet && json[firstSheet]?.data) || [];
        return { data, base: url };
      }
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

function pick(row, aliases) {
  const key = Object.keys(row).find((k) => aliases.includes(k.trim().toLowerCase()));
  return key ? row[key] : '';
}

function itemFromRow(row, base) {
  const abs = (value) => (value ? new URL(value, base).href : '');
  return {
    title: `${pick(row, ['title']) || ''}`.trim(),
    link: abs(pick(row, ['link', 'url', 'path'])),
    image: abs(pick(row, ['image', 'thumbnail'])),
    video: abs(pick(row, ['video'])),
    brands: splitValues(pick(row, GROUPS[0].aliases)),
    types: splitValues(pick(row, GROUPS[1].aliases)),
  };
}

function itemsFromRows(rows) {
  return rows.map((row) => {
    const [mediaCell, bodyCell] = [...row.children];
    const picture = mediaCell?.querySelector('picture, img');
    const mediaLink = mediaCell?.querySelector('a[href]');
    const titleLink = bodyCell?.querySelector('a[href]');
    /* tags = a text-only child (not the title link or its wrapper) */
    const tagsEl = [...(bodyCell?.children || [])].find((el) => el.tagName !== 'A'
      && !el.querySelector('a') && el.textContent.trim());
    const tags = splitValues(tagsEl?.textContent);
    return {
      title: (titleLink || bodyCell)?.textContent.trim() || '',
      link: titleLink?.href || '',
      picture,
      video: mediaLink && isVideoUrl(mediaLink.href) ? mediaLink.href : '',
      brands: tags.slice(0, 1),
      types: tags.slice(1),
    };
  }).filter((item) => item.title);
}

function thumbnail(item) {
  if (item.picture) return item.picture;
  if (!item.image) return null;
  const url = new URL(item.image, window.location.href);
  const isSvg = url.pathname.toLowerCase().endsWith('.svg');
  if (url.origin === window.location.origin && !isSvg) {
    return createPicture({ src: url.href, alt: '', breakpoints: [{ width: '400' }] });
  }
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.src = url.href;
  return img;
}

/* broken/missing thumbnails: drop the image, keep a placeholder of the same slot */
function guardImage(thumb, pic) {
  const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
  if (!img) return;
  const fail = () => {
    thumb.classList.add('is-missing');
    pic.remove();
  };
  img.addEventListener('error', fail, { once: true });
  if (img.complete && img.getAttribute('src') && !img.naturalWidth) fail();
}

function renderCard(item) {
  const li = document.createElement('li');
  li.className = 'cards-filterable-card';

  const body = document.createElement('div');
  body.className = 'cards-filterable-body';
  const title = document.createElement(item.link ? 'a' : 'span');
  title.className = 'cards-filterable-title';
  title.textContent = item.title;
  if (item.link) title.href = item.link;
  body.append(title);
  li.append(body);

  const pic = thumbnail(item);
  const thumbHref = item.video || item.link;
  if (pic || item.video) {
    const thumb = document.createElement('div');
    thumb.className = 'cards-filterable-thumb';
    const holder = document.createElement(thumbHref ? 'a' : 'span');
    holder.className = 'cards-filterable-media';
    if (thumbHref) holder.href = thumbHref;
    if (item.video) {
      thumb.classList.add('is-video');
      holder.setAttribute('aria-label', `Watch video: ${item.title}`);
      const play = document.createElement('span');
      play.className = 'cards-filterable-play';
      play.setAttribute('aria-hidden', 'true');
      holder.append(play);
    } else if (thumbHref) {
      /* duplicate of the title link: keep one tab stop */
      holder.tabIndex = -1;
      holder.setAttribute('aria-hidden', 'true');
    }
    if (pic) {
      pic.querySelectorAll?.('img').forEach((img) => { img.alt = ''; });
      if (pic.tagName === 'IMG') pic.alt = '';
      holder.prepend(pic);
      guardImage(thumb, pic);
    } else {
      thumb.classList.add('is-missing');
    }
    thumb.append(holder);
    li.append(thumb);
  }
  return li;
}

function parsePreselected(row) {
  const selected = { brands: [], types: [] };
  if (!row) return selected;
  const lines = [...row.querySelectorAll('p, li')].map((el) => el.textContent);
  if (!lines.length) lines.push(...row.textContent.split('\n'));
  lines.forEach((line) => {
    const [rawKey, ...rest] = line.split(':');
    if (!rest.length) return;
    const key = rawKey.trim().toLowerCase();
    const group = GROUPS.find((g) => g.aliases.includes(key));
    if (group) selected[group.key].push(...splitValues(rest.join(':')));
  });
  return selected;
}

function button(className, html, type = 'button') {
  const btn = document.createElement('button');
  btn.type = type;
  btn.className = className;
  btn.innerHTML = html;
  return btn;
}

function setExpanded(toggle, target, open) {
  toggle.setAttribute('aria-expanded', `${open}`);
  target.hidden = !open;
}

function buildGroup(id, group, values) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'cards-filterable-group';
  const optionsId = `${id}-${group.key}-options`;
  const legend = document.createElement('legend');
  const toggle = button('cards-filterable-group-toggle', `<span>${group.label}</span><span class="cards-filterable-sign" aria-hidden="true"></span>`);
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-controls', optionsId);
  legend.append(toggle);

  const options = document.createElement('div');
  options.className = 'cards-filterable-options';
  options.id = optionsId;
  values.forEach((value, i) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = group.key;
    input.value = value;
    input.id = `${id}-${group.key}-${i}`;
    label.htmlFor = input.id;
    const text = document.createElement('span');
    text.textContent = value;
    label.append(input, text);
    options.append(label);
  });
  fieldset.append(legend, options);
  return fieldset;
}

function buildFilters(id, items, onApply) {
  const wrap = document.createElement('div');
  wrap.className = 'cards-filterable-filters';

  const bar = document.createElement('div');
  bar.className = 'cards-filterable-bar';
  const toggle = button('cards-filterable-toggle', `<span>Filter by</span>${CHEVRON}`);
  toggle.setAttribute('aria-controls', `${id}-panel`);
  const clearAll = button('cards-filterable-reset', 'Clear All');
  clearAll.hidden = true;
  bar.append(toggle, clearAll);

  const chips = document.createElement('ul');
  chips.className = 'cards-filterable-chips';
  chips.setAttribute('aria-label', 'Applied filters');
  chips.hidden = true;

  const form = document.createElement('form');
  form.className = 'cards-filterable-panel';
  form.id = `${id}-panel`;
  form.setAttribute('aria-label', 'Filter resources');
  setExpanded(toggle, form, false);

  const groups = document.createElement('div');
  groups.className = 'cards-filterable-groups';
  GROUPS.forEach((group) => {
    const values = [...new Set(items.flatMap((item) => item[group.key]))];
    if (values.length) groups.append(buildGroup(id, group, values));
  });

  const actions = document.createElement('div');
  actions.className = 'cards-filterable-actions';
  actions.append(
    button('cards-filterable-apply', 'Apply Filter', 'submit'),
    button('cards-filterable-clear', 'Clear All', 'reset'),
  );
  form.append(groups, actions);

  const inputs = () => [...form.querySelectorAll('input[type="checkbox"]')];
  const selection = () => Object.fromEntries(GROUPS.map((g) => [
    g.key, inputs().filter((i) => i.name === g.key && i.checked).map((i) => i.value),
  ]));

  const applySelection = () => {
    const checked = inputs().filter((i) => i.checked);
    chips.replaceChildren(...checked.map((input) => {
      const li = document.createElement('li');
      const chip = button('cards-filterable-chip', `${REMOVE}<span></span>`);
      chip.querySelector('span').textContent = input.value;
      chip.setAttribute('aria-label', `Remove filter: ${input.value}`);
      chip.dataset.input = input.id;
      li.append(chip);
      return li;
    }));
    chips.hidden = !checked.length;
    clearAll.hidden = !checked.length;
    onApply(selection());
  };

  toggle.addEventListener('click', () => {
    setExpanded(toggle, form, form.hidden);
  });
  groups.addEventListener('click', (e) => {
    const groupToggle = e.target.closest('.cards-filterable-group-toggle');
    if (!groupToggle) return;
    const options = form.querySelector(`#${groupToggle.getAttribute('aria-controls')}`);
    setExpanded(groupToggle, options, options.hidden);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    applySelection();
    setExpanded(toggle, form, false);
    toggle.focus();
  });
  form.addEventListener('reset', () => {
    /* reset runs before the inputs clear: apply on the next tick */
    setTimeout(applySelection);
  });
  clearAll.addEventListener('click', () => {
    form.reset();
    toggle.focus();
  });
  chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.cards-filterable-chip');
    if (!chip) return;
    const input = form.querySelector(`#${chip.dataset.input}`);
    if (input) input.checked = false;
    applySelection();
    (chips.querySelector('.cards-filterable-chip') || toggle).focus();
  });

  wrap.append(bar, chips, form);
  return {
    el: wrap,
    preselect(selected) {
      GROUPS.forEach((g) => {
        form.querySelectorAll(`input[name="${g.key}"]`).forEach((input) => {
          const value = input.value.toLowerCase();
          input.checked = selected[g.key].some((v) => v.toLowerCase() === value);
        });
      });
      applySelection();
    },
  };
}

function render(block, items, preselected) {
  instance += 1;
  const id = `cards-filterable-${instance}`;
  const list = document.createElement('ul');
  list.className = 'cards-filterable-list';
  const cards = items.map((item) => {
    const card = renderCard(item);
    list.append(card);
    return { card, item };
  });

  const hasTags = items.some((item) => GROUPS.some((g) => item[g.key].length));
  block.textContent = '';
  if (!hasTags) {
    block.classList.add('is-static');
    block.append(list);
    return;
  }

  const status = document.createElement('p');
  status.className = 'cards-filterable-status';
  status.setAttribute('role', 'status');

  const apply = (selected) => {
    let shown = 0;
    cards.forEach(({ card, item }) => {
      const match = GROUPS.every((g) => !selected[g.key].length
        || item[g.key].some((v) => selected[g.key].includes(v)));
      card.hidden = !match;
      if (match) shown += 1;
    });
    status.textContent = shown
      ? `Showing ${shown} of ${cards.length} resources`
      : 'No resources match the selected filters.';
    status.classList.toggle('is-empty', !shown);
  };

  const filters = buildFilters(id, items, apply);
  block.append(filters.el, status, list);
  filters.preselect(preselected);
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const sheetLink = rows[0]?.querySelector('a[href]');
  const href = sheetLink?.getAttribute('href') || '';
  const isSheet = rows.length <= 2 && /\.json(\?|#|$)/.test(href);

  if (!isSheet) {
    render(block, itemsFromRows(rows), parsePreselected(null));
    return;
  }

  const preselected = parsePreselected(rows[1]);
  const sheet = await fetchSheet(href);
  if (!sheet) {
    block.classList.add('is-error');
    rows[0].textContent = 'Resources could not be loaded.';
    rows[1]?.remove();
    return;
  }
  const items = sheet.data.map((row) => itemFromRow(row, sheet.base)).filter((item) => item.title);
  render(block, items, preselected);
}
