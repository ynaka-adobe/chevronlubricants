/**
 * Locator: distributor / installer / retailer finder backed by the Chevron
 * locator service (https://chevrondelo.chevron.com/api/...).
 *
 * Content model: key/value rows (cell 1 = key, cell 2 = value). All UI copy is
 * authorable; every key has a default, so a block with only a "Type" row works.
 *   Type             distributor | installer | retailer
 *   Brands           comma list (distributor: none, installer: Havoline,
 *                    retailer: Delo, Havoline, Techron)
 *   Radius options   e.g. 10, 20, 30 ... 100
 *   Default radius   distributor 100, installer 40, retailer empty (required)
 *   ...labels and messages: see LABELS below (key = row name, lower-cased,
 *   spaces become hyphens).
 *
 * The service sends no CORS headers, so requests use JSONP (script injection).
 * Google Maps (geocoding + map) loads lazily, and only when the site
 * configuration sheet (/configuration.json) has a "google-maps-api-key" row.
 * Without a key the block searches from the browser location only.
 * URL params: ?zip= ?brand= ?radius= pre-fill the form and auto-search when
 * a key is configured or location permission is already granted.
 */

const SERVICE_BASE = 'https://chevrondelo.chevron.com';
const JSONP_TIMEOUT = 15000;
const SEARCH_AGAIN_RADIUS = 200;
const MAP_ZOOM = 12;
const MARKER_COLORS = { default: '#2459a9', preferred: '#0b2d71' };
const MARKER_PATH = 'M12 0C7 0 3 4 3 9c0 6.6 9 15 9 15s9-8.4 9-15c0-5-4-9-9-9zm0 12.5A3.5 3.5 0 1 1 12 5.5a3.5 3.5 0 0 1 0 7z';

const TYPES = {
  distributor: {
    service: 'marketer', defaultRadius: '100', brands: [], retry: true, certified: true,
  },
  installer: {
    service: 'installer', defaultRadius: '40', brands: ['Havoline'], retry: true, certified: false,
  },
  retailer: {
    service: 'retailer', defaultRadius: '', brands: ['Delo', 'Havoline', 'Techron'], retry: false, certified: false,
  },
};
const TYPE_ALIASES = { marketer: 'distributor', 'find-a-distributor': 'distributor', 'find-an-installer': 'installer', 'find-a-retailer': 'retailer' };

const LABELS = {
  'brand-label': 'Brand',
  'brand-placeholder': 'Brand',
  'zip-label': 'Zip or City, State',
  placeholder: 'Zip or City,State',
  'radius-label': 'search within',
  'radius-placeholder': 'Select a distance',
  'radius-options': '10, 20, 30, 40, 50, 60, 70, 80, 90, 100',
  'radius-units': 'miles',
  'radius-units-abbr': 'mi',
  'certified-filter-label': 'Certified marketers only',
  'button-label': 'Search >',
  'my-location-label': 'Use my location',
  'required-message': '*required field',
  'no-results-message': 'No locations found.',
  'searched-again-message': 'No locations were found within [RADIUS] [RADIUS_UNITS], but we searched again at [SEARCH_AGAIN_RADIUS] [RADIUS_UNITS] and this is what we found.',
  'searched-again-empty-message': 'No locations were found within [RADIUS] [RADIUS_UNITS]. We searched again at [SEARCH_AGAIN_RADIUS] [RADIUS_UNITS] and also found no locations.',
  'error-message': 'Error getting data. Please try again.',
  'geocode-error-message': 'We could not find that location. Check the ZIP code or city and state, then try again.',
  'no-key-notice': 'Search by ZIP code or city is not available right now. Use your location to find locations near you.',
  'location-denied-message': 'We could not get your location. Allow location access in your browser and try again.',
  'location-unsupported-message': 'Geolocation is not supported by this browser.',
  'searching-message': 'Searching…',
  'results-heading': '[COUNT] locations found',
  'results-heading-single': '1 location found',
  'directions-label': 'Directions',
  'new-tab-label': '(opens in a new tab)',
  'map-label': 'Map of locations',
  'badge-certified': 'Certified Marketer',
  'badge-elite': 'Chevron 1st Source Elite',
  'badge-first-source': 'Chevron 1st Source',
  'badge-preferred': 'Chevron Preferred',
};

const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6-1.4-1.4 4.6-4.6-4.6-4.6z"/></svg>';
const PIN = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 3h-2.1A7 7 0 0 0 13 5.1V3h-2v2.1A7 7 0 0 0 5.1 11H3v2h2.1a7 7 0 0 0 5.9 5.9V21h2v-2.1a7 7 0 0 0 5.9-5.9H21zm-9 6a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>';

let instance = 0;
let jsonpCount = 0;
let configPromise;
let mapsPromise;

/* ---------- helpers ---------- */

const toKey = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const splitList = (value) => `${value || ''}`.split(/\s*[,;|]\s*/).map((v) => v.trim()).filter(Boolean);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const decoder = document.createElement('textarea');
function decode(value) {
  /* service names arrive HTML-entity encoded (O&#39;Reilly); output stays text */
  decoder.innerHTML = `${value ?? ''}`;
  return decoder.value.replace(/\s+/g, ' ').trim();
}

function fill(template, values) {
  return Object.entries(values)
    .reduce((text, [token, value]) => text.replaceAll(`[${token}]`, String(value)), template);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function readConfig(block) {
  const config = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const [keyCell, valueCell] = [...row.children];
    if (!keyCell) return;
    const key = toKey(keyCell.textContent);
    if (key) config[key] = valueCell?.textContent.trim() ?? '';
  });
  return config;
}

/* ---------- site configuration sheet ---------- */

/* local dev serves content under /content/, Edge Delivery serves it at the root */
function configUrls() {
  const { origin, pathname } = window.location;
  const urls = [];
  if (pathname.startsWith('/content/')) urls.push(new URL('/content/configuration.json', origin));
  urls.push(new URL('/configuration.json', origin));
  return urls;
}

async function fetchSiteConfig() {
  for (const url of configUrls()) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(url);
      if (resp.ok) {
        // eslint-disable-next-line no-await-in-loop
        const json = await resp.json();
        const firstSheet = json[':names']?.[0];
        const data = json.data || (firstSheet && json[firstSheet]?.data) || [];
        return Object.fromEntries(data
          .filter((row) => row.key || row.Key)
          .map((row) => [toKey(`${row.key || row.Key}`), `${row.value ?? row.Value ?? ''}`.trim()]));
      }
    } catch {
      /* try the next candidate */
    }
  }
  return {};
}

function getSiteConfig() {
  configPromise ??= fetchSiteConfig();
  return configPromise;
}

/* ---------- JSONP ---------- */

function jsonp(path, params) {
  return new Promise((resolve, reject) => {
    jsonpCount += 1;
    const name = `locatorJsonp${Date.now().toString(36)}${jsonpCount}`;
    const script = document.createElement('script');
    let settled = false;
    let timer;
    const finish = (fn, value, answered) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.remove();
      /* a late response must not hit an undefined callback */
      if (answered) delete window[name];
      else window[name] = () => { delete window[name]; };
      fn(value);
    };
    window[name] = (data) => finish(resolve, data, true);
    const query = [...params, ['callback', name]]
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    script.src = `${SERVICE_BASE}${path}?${query}`;
    script.async = true;
    script.onerror = () => finish(reject, new Error('Locator request failed'));
    /* the callback runs before onload: still pending here means a bad payload */
    script.onload = () => finish(reject, new Error('Locator response had no callback'));
    timer = setTimeout(() => finish(reject, new Error('Locator request timed out')), JSONP_TIMEOUT);
    document.head.append(script);
  });
}

/* ---------- service requests + normalisation ---------- */

function websiteOf(url) {
  const raw = `${url || ''}`.trim();
  if (!raw) return null;
  try {
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`;
    const parsed = new URL(href);
    if (!parsed.hostname.includes('.')) return null;
    return { href: parsed.href, domain: parsed.hostname };
  } catch {
    return null;
  }
}

function baseRecord(r) {
  return {
    name: decode(r.accountName ?? r.name),
    address: decode(r.address),
    city: decode(r.city),
    phone: decode(r.phone),
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lng),
    distance: parseFloat(r.distance),
    badges: [],
    preferred: false,
    status: '',
    website: null,
  };
}

/* stable tier partition, then drop consecutive duplicates (source parity) */
function tierAndDedupe(marketers) {
  const tier = (m) => {
    if (m.firstSourceElite === 'True') return 0;
    if (m.firstSource === 'True') return 1;
    return 2;
  };
  const sorted = marketers
    .map((m, i) => ({ m, i }))
    .sort((a, b) => tier(a.m) - tier(b.m) || a.i - b.i)
    .map(({ m }) => m);
  const out = [];
  let prevAddress = null;
  let lastShown = null;
  sorted.forEach((m) => {
    const sig = `${m.accountName}|${m.lat}|${m.lng}`;
    const dupe = m.address === prevAddress || sig === lastShown;
    prevAddress = m.address;
    if (dupe) return;
    lastShown = sig;
    out.push(m);
  });
  return out;
}

function normaliseMarketer(m) {
  const rec = baseRecord(m);
  rec.website = websiteOf(m.url);
  const elite = m.firstSourceElite === 'True';
  const first = m.firstSource === 'True';
  if (m.isoclean) rec.badges.push('certified');
  if (elite && !first) rec.badges.push('elite');
  if (first) rec.badges.push('first-source');
  rec.preferred = elite || first;
  if (rec.preferred) rec.status = 'elite';
  return rec;
}

function normaliseInstaller(r) {
  const rec = baseRecord(r);
  if (r.locationType === 'hxl') {
    rec.badges.push('preferred');
    rec.status = 'xpress';
  }
  return rec;
}

async function fetchLocations(type, origin, radius, { brand, certified }) {
  const geo = [['lat', origin.lat], ['lng', origin.lng], ['radius', radius]];
  if (type.service === 'marketer') {
    const params = [...geo, ['output', 'json'], ['zoom', MAP_ZOOM], ['region', 'us'], ['v', '2']];
    if (certified) params.push(['isoclean', '1']);
    const data = await jsonp('/api/ws_marketerLocator-search-geo.aspx', params);
    if (!data || `${data.status}`.toLowerCase() !== 'ok') return [];
    return tierAndDedupe(data.marketers || []).map(normaliseMarketer);
  }
  if (type.service === 'installer') {
    const params = [...geo, ['search3', '1'], ['zoom', MAP_ZOOM], ['region', 'us'], ['fType', brand || 'havoline']];
    const data = await jsonp('/api/ws_havoline-serviceLocator-geo.aspx', params);
    return (Array.isArray(data) ? data : []).map(normaliseInstaller);
  }
  const params = [['brand', brand], ['lookup', 'retailer'], ['name', 'all'], ...geo];
  const data = await jsonp('/api/ws_cl-retail-locator.aspx', params);
  if (!data || `${data.status}`.toLowerCase() !== 'ok') return [];
  return (data.retailers || []).map(baseRecord);
}

const hasCoords = (r) => Number.isFinite(r.lat) && Number.isFinite(r.lng);

function directionsUrl(origin, r) {
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  if (origin) url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
  url.searchParams.set('destination', `${r.lat},${r.lng}`);
  return url.href;
}

/* ---------- analytics ---------- */

function track(fields) {
  if (!Array.isArray(window.dataLayer)) return;
  const event = { event: 'e_locator' };
  Object.entries(fields).forEach(([k, v]) => { if (v) event[k] = v; });
  window.dataLayer.push(event);
}

/* ---------- Google Maps (lazy, key only) ---------- */

function loadMaps(key) {
  mapsPromise ??= new Promise((resolve, reject) => {
    const cb = `locatorMapsReady${Date.now().toString(36)}`;
    window[cb] = async () => {
      delete window[cb];
      try {
        const { importLibrary } = window.google.maps;
        const [maps, geocoding, marker, core] = await Promise.all([
          importLibrary('maps'), importLibrary('geocoding'), importLibrary('marker'), importLibrary('core'),
        ]);
        resolve({
          Map: maps.Map,
          InfoWindow: maps.InfoWindow,
          Geocoder: geocoding.Geocoder,
          Marker: marker.Marker,
          LatLngBounds: core.LatLngBounds,
          event: core.event || window.google.maps.event,
          ControlPosition: core.ControlPosition || window.google.maps.ControlPosition,
          Point: core.Point || window.google.maps.Point,
        });
      } catch (e) {
        reject(e);
      }
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=${cb}`;
    script.async = true;
    script.onerror = () => {
      mapsPromise = null;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.append(script);
  });
  return mapsPromise;
}

function geocode(gm, address) {
  return new Promise((resolve, reject) => {
    new gm.Geocoder().geocode(
      { address, componentRestrictions: { country: 'us' } },
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          reject(new Error(`Geocode failed: ${status}`));
        }
      },
    );
  });
}

function currentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(Object.assign(new Error('unsupported'), { unsupported: true }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  });
}

async function locationGranted() {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' });
    return status?.state === 'granted';
  } catch {
    return false;
  }
}

/* ---------- form ---------- */

function field(id, labelText, control, className) {
  const wrap = el('div', `locator-field ${className}`);
  const label = el('label', 'locator-label', labelText);
  label.htmlFor = id;
  control.id = id;
  const error = el('p', 'locator-field-error');
  error.id = `${id}-error`;
  error.hidden = true;
  wrap.append(label, control, error);
  return { wrap, control, error };
}

function buildSelect(options, { placeholder, selected }) {
  const select = document.createElement('select');
  if (placeholder) {
    const opt = new Option(placeholder, '');
    select.append(opt);
  }
  options.forEach(({ value, label }) => select.append(new Option(label, value)));
  select.value = selected && options.some((o) => o.value === selected) ? selected : '';
  if (!placeholder && !select.value && options[0]) select.value = options[0].value;
  return select;
}

function buildForm(id, type, labels, cfg) {
  const form = el('form', 'locator-form');
  form.noValidate = true;
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', cfg.formLabel);
  const fields = {};

  const brands = cfg.brands.map((b) => ({ value: b.toLowerCase(), label: b }));
  if (brands.length) {
    const single = brands.length === 1;
    const select = buildSelect(brands, {
      placeholder: single ? '' : labels['brand-placeholder'],
      selected: cfg.brand,
    });
    fields.brand = field(`${id}-brand`, labels['brand-label'], select, 'locator-field-brand');
    fields.brand.required = !single;
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'zip';
  input.placeholder = labels.placeholder;
  input.autocomplete = 'postal-code';
  input.value = cfg.zip;
  fields.zip = field(`${id}-zip`, labels['zip-label'], input, 'locator-field-zip');
  fields.zip.required = true;

  const radii = splitList(labels['radius-options'])
    .filter((r) => /^\d+$/.test(r))
    .map((r) => ({ value: r, label: `${r} ${labels['radius-units']}` }));
  const radiusSelect = buildSelect(radii, {
    placeholder: cfg.radius ? '' : labels['radius-placeholder'],
    selected: cfg.radius,
  });
  fields.radius = field(`${id}-radius`, labels['radius-label'], radiusSelect, 'locator-field-radius');
  fields.radius.required = true;

  const row = el('div', 'locator-fields');
  Object.values(fields).forEach((f) => {
    f.control.name ||= f.wrap.classList[1].replace('locator-field-', '');
    row.append(f.wrap);
  });
  form.append(row);

  if (type.certified) {
    const wrap = el('div', 'locator-field locator-field-certified');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'certified';
    checkbox.id = `${id}-certified`;
    const label = el('label', 'locator-checkbox-label', labels['certified-filter-label']);
    label.htmlFor = checkbox.id;
    wrap.append(checkbox, label);
    form.append(wrap);
    fields.certified = { control: checkbox };
  }

  const actions = el('div', 'locator-actions');
  const search = el('button', 'locator-search');
  search.type = 'submit';
  search.name = 'action';
  search.value = 'search';
  const searchText = labels['button-label'].replace(/\s*>\s*$/, '');
  search.innerHTML = '<span></span>';
  search.querySelector('span').textContent = searchText;
  if (searchText !== labels['button-label']) search.insertAdjacentHTML('beforeend', CHEVRON);

  const locate = el('button', 'locator-locate');
  locate.type = 'submit';
  locate.name = 'action';
  locate.value = 'locate';
  locate.innerHTML = `${PIN}<span></span>`;
  locate.querySelector('span').textContent = labels['my-location-label'];
  actions.append(search, locate);
  form.append(actions);

  const notice = el('p', 'locator-notice', labels['no-key-notice']);
  notice.id = `${id}-notice`;
  notice.hidden = true;
  form.append(notice);

  return {
    form, fields, search, locate, notice,
  };
}

function setFieldError(f, message) {
  if (!f?.wrap) return;
  f.wrap.classList.toggle('is-error', !!message);
  f.error.textContent = message || '';
  f.error.hidden = !message;
  if (message) {
    f.control.setAttribute('aria-invalid', 'true');
    f.control.setAttribute('aria-describedby', f.error.id);
  } else {
    f.control.removeAttribute('aria-invalid');
    f.control.removeAttribute('aria-describedby');
  }
}

/* ---------- results ---------- */

function renderCard(r, ctx) {
  const { labels, origin, onNameClick } = ctx;
  const li = el('li', 'locator-result');
  if (r.status) li.classList.add(`is-${r.status}`);

  const heading = el('h3', 'locator-result-name');
  if (onNameClick && hasCoords(r)) {
    const btn = el('button', 'locator-result-name-button', r.name);
    btn.type = 'button';
    btn.addEventListener('click', () => onNameClick(r));
    heading.append(btn);
  } else {
    heading.textContent = r.name;
  }
  li.append(heading);

  if (r.address) li.append(el('p', 'locator-result-address', r.address));
  const dist = Number.isFinite(r.distance) ? `${r.distance} ${labels['radius-units-abbr']}` : '';
  const distCity = [dist, r.city].filter(Boolean).join(' - ');
  if (distCity) li.append(el('p', 'locator-result-distance', distCity));

  const links = el('ul', 'locator-result-links');
  if (r.phone) {
    const a = el('a', 'locator-result-phone', r.phone);
    a.href = `tel:${r.phone.replace(/[^\d+]/g, '')}`;
    const item = el('li');
    item.append(a);
    links.append(item);
  }
  if (r.website) {
    const a = el('a', 'locator-result-website', r.website.domain);
    a.href = r.website.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', `${r.website.domain} ${labels['new-tab-label']}`);
    const item = el('li');
    item.append(a);
    links.append(item);
  }
  if (hasCoords(r)) {
    const a = el('a', 'locator-result-directions', labels['directions-label']);
    a.href = directionsUrl(origin, r);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', `${labels['directions-label']}: ${r.name} ${labels['new-tab-label']}`);
    const item = el('li');
    item.append(a);
    links.append(item);
  }
  if (links.children.length) li.append(links);

  if (r.badges.length) {
    const badges = el('ul', 'locator-result-badges');
    r.badges.forEach((b) => {
      const badge = el('li', `locator-badge locator-badge-${b}`, labels[`badge-${b}`]);
      badges.append(badge);
    });
    li.append(badges);
  }
  return li;
}

/* ---------- map ---------- */

function infoWindowContent(r, ctx) {
  const wrap = el('div', 'locator-info-window');
  wrap.append(el('p', 'locator-info-window-name', r.name));
  if (r.address) wrap.append(el('p', '', r.address));
  if (r.city) wrap.append(el('p', '', r.city));
  if (r.phone) {
    const p = el('p');
    const a = el('a', '', r.phone);
    a.href = `tel:${r.phone.replace(/[^\d+]/g, '')}`;
    p.append(a);
    wrap.append(p);
  }
  const p = el('p');
  const a = el('a', '', ctx.labels['directions-label']);
  a.href = directionsUrl(ctx.origin, r);
  a.target = '_blank';
  a.rel = 'noopener';
  p.append(a);
  wrap.append(p);
  return wrap;
}

function markerIcon(gm, preferred) {
  const icon = {
    path: MARKER_PATH,
    fillColor: preferred ? MARKER_COLORS.preferred : MARKER_COLORS.default,
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 1,
    scale: 1.5,
  };
  if (gm.Point) icon.anchor = new gm.Point(12, 24);
  return icon;
}

/* ---------- block ---------- */

function createLocator(block, authored, siteConfig) {
  instance += 1;
  const id = `locator-${instance}`;
  const typeKey = TYPE_ALIASES[toKey(authored.type || '')] || toKey(authored.type || '') || 'distributor';
  const typeName = TYPES[typeKey] ? typeKey : 'distributor';
  const type = TYPES[typeName];
  const labels = { ...LABELS };
  Object.entries(authored).forEach(([k, v]) => { if (v && k in LABELS) labels[k] = v; });

  const params = new URLSearchParams(window.location.search);
  const brands = 'brands' in authored ? splitList(authored.brands) : type.brands;
  const defaultRadius = 'default-radius' in authored ? authored['default-radius'] : type.defaultRadius;
  const paramBrand = (params.get('brand') || '').toLowerCase();
  const paramRadius = params.get('radius') || '';
  const cfg = {
    brands,
    brand: paramBrand,
    radius: /^\d+$/.test(paramRadius) ? paramRadius : `${defaultRadius || ''}`.replace(/\D/g, ''),
    zip: params.get('zip') || '',
    formLabel: authored['form-label'] || `${typeName.charAt(0).toUpperCase()}${typeName.slice(1)} search`,
  };
  /* radius from params/default must be one of the options */
  const radiusOptions = splitList(labels['radius-options']);
  if (cfg.radius && !radiusOptions.includes(cfg.radius)) cfg.radius = '';

  const apiKey = siteConfig['google-maps-api-key'] || '';
  const ui = buildForm(id, type, labels, cfg);

  const status = el('p', 'locator-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const mapEl = el('div', 'locator-map');
  mapEl.hidden = true;
  mapEl.setAttribute('role', 'region');
  mapEl.setAttribute('aria-label', labels['map-label']);

  const resultsWrap = el('div', 'locator-results');
  resultsWrap.hidden = true;
  const resultsHeading = el('h2', 'locator-results-heading');
  resultsHeading.tabIndex = -1;
  resultsHeading.id = `${id}-results`;
  const resultsMessage = el('p', 'locator-results-message');
  resultsMessage.hidden = true;
  const list = el('ol', 'locator-result-list');
  list.setAttribute('aria-labelledby', resultsHeading.id);
  resultsWrap.append(resultsHeading, resultsMessage, list);

  block.textContent = '';
  block.classList.add(`locator-${typeName}`);
  block.append(ui.form, status, mapEl, resultsWrap);

  const state = {
    maps: null, map: null, markers: [], infoWindow: null, origin: null, searches: 0, lastTerm: '', busy: false,
  };

  const setMode = (withKey) => {
    state.keyMode = withKey;
    block.classList.toggle('locator-no-map', !withKey);
    ui.fields.zip.wrap.hidden = !withKey;
    ui.search.hidden = !withKey;
    ui.notice.hidden = withKey;
    ui.locate.classList.toggle('is-primary', !withKey);
    if (withKey) ui.form.removeAttribute('aria-describedby');
    else ui.form.setAttribute('aria-describedby', ui.notice.id);
  };
  setMode(!!apiKey);

  const announce = (text) => { status.textContent = text; };
  const scrollTo = (target) => target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });

  const clearMarkers = () => {
    state.markers.forEach((m) => m.setMap(null));
    state.markers = [];
    state.infoWindow?.close();
  };

  const openInfo = (r, marker) => {
    if (!state.map || !marker) return;
    state.infoWindow.setContent(infoWindowContent(r, { labels, origin: state.origin }));
    state.infoWindow.open({ map: state.map, anchor: marker });
  };

  const storeClicked = (r) => track({
    locatorType: type.service, locatorEvent: 'store clicked', locStoreName: r.name,
  });

  const ensureMap = async () => {
    state.maps ??= await loadMaps(apiKey);
    if (!state.map) {
      const gm = state.maps;
      mapEl.hidden = false;
      state.map = new gm.Map(mapEl, {
        zoom: MAP_ZOOM,
        center: state.origin,
        mapTypeId: 'roadmap',
        streetViewControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: gm.ControlPosition?.LEFT_BOTTOM,
          mapTypeIds: ['roadmap', 'satellite'],
        },
      });
      state.infoWindow = new gm.InfoWindow();
    }
    return state.maps;
  };

  const renderMap = (records) => {
    const gm = state.maps;
    clearMarkers();
    if (!records.length) {
      state.map.panTo(state.origin);
      return new Map();
    }
    const bounds = new gm.LatLngBounds();
    const byRecord = new Map();
    records.filter(hasCoords).forEach((r) => {
      const position = { lat: r.lat, lng: r.lng };
      const marker = new gm.Marker({
        position, map: state.map, title: r.name, icon: markerIcon(gm, r.preferred),
      });
      marker.addListener('click', () => {
        openInfo(r, marker);
        storeClicked(r);
      });
      state.markers.push(marker);
      byRecord.set(r, marker);
      bounds.extend(position);
    });
    if (state.markers.length > 1) {
      state.map.fitBounds(bounds);
    } else if (state.markers.length === 1) {
      state.map.setCenter(state.markers[0].getPosition());
      state.map.setZoom(MAP_ZOOM);
    }
    return byRecord;
  };

  const showResults = (records, message, { moveFocus }) => {
    list.textContent = '';
    resultsMessage.textContent = message || '';
    resultsMessage.hidden = !message;
    let markers = new Map();
    if (state.map) markers = renderMap(records);
    const ctx = {
      labels,
      origin: state.origin,
      onNameClick: state.map ? (r) => {
        openInfo(r, markers.get(r));
        storeClicked(r);
        scrollTo(mapEl);
      } : null,
    };
    records.forEach((r) => list.append(renderCard(r, ctx)));
    if (!records.length) {
      resultsWrap.hidden = !message;
      resultsHeading.hidden = true;
      announce(message);
      if (moveFocus && message) {
        resultsMessage.tabIndex = -1;
        resultsMessage.focus({ preventScroll: true });
        scrollTo(resultsWrap);
      }
      return;
    }
    const heading = records.length === 1
      ? labels['results-heading-single']
      : fill(labels['results-heading'], { COUNT: records.length });
    resultsHeading.textContent = heading;
    resultsHeading.hidden = false;
    resultsWrap.hidden = false;
    announce([heading, message].filter(Boolean).join('. '));
    if (moveFocus) {
      resultsHeading.focus({ preventScroll: true });
      scrollTo(state.map ? mapEl : resultsWrap);
    }
  };

  const showError = (message, moveFocus) => {
    clearMarkers();
    list.textContent = '';
    resultsHeading.hidden = true;
    resultsMessage.textContent = message;
    resultsMessage.hidden = false;
    resultsWrap.hidden = false;
    resultsWrap.classList.add('is-error');
    announce(message);
    if (moveFocus) {
      resultsMessage.tabIndex = -1;
      resultsMessage.focus({ preventScroll: true });
    }
  };

  const validate = (action) => {
    const errors = [];
    const required = labels['required-message'];
    const { brand, zip, radius } = ui.fields;
    [brand, zip, radius].forEach((f) => setFieldError(f, ''));
    if (brand?.required && !brand.control.value) errors.push(brand);
    if (action === 'search' && !zip.control.value.trim()) errors.push(zip);
    if (!radius.control.value) errors.push(radius);
    errors.forEach((f) => setFieldError(f, required));
    return errors;
  };

  const runSearch = async (action, { moveFocus = true, auto = false } = {}) => {
    if (state.busy) return;
    const errors = validate(action);
    if (errors.length) {
      if (auto) {
        errors.forEach((f) => setFieldError(f, ''));
      } else {
        errors[0].control.focus();
      }
      return;
    }
    const brand = ui.fields.brand?.control.value || '';
    const radius = ui.fields.radius.control.value;
    const certified = !!ui.fields.certified?.control.checked;
    const term = action === 'search' ? ui.fields.zip.control.value.trim() : 'my location';

    state.busy = true;
    block.setAttribute('aria-busy', 'true');
    resultsWrap.classList.remove('is-error');
    announce(labels['searching-message']);

    try {
      if (action === 'locate') {
        try {
          state.origin = await currentPosition();
        } catch (e) {
          showError(e.unsupported ? labels['location-unsupported-message'] : labels['location-denied-message'], moveFocus);
          return;
        }
      } else {
        let gm;
        try {
          gm = await loadMaps(apiKey);
        } catch {
          setMode(false);
          showError(labels['error-message'], moveFocus);
          return;
        }
        try {
          state.origin = await geocode(gm, term);
        } catch {
          showError(labels['geocode-error-message'], moveFocus);
          return;
        }
      }

      if (state.keyMode) {
        try {
          await ensureMap();
        } catch {
          setMode(false);
        }
      }

      const opts = { brand, certified };
      const base = {
        locatorType: type.service,
        locSearchTerm: term,
        locBrand: type.service === 'marketer' ? '' : brand,
      };
      const revised = state.searches > 0;
      const prev = state.lastTerm;
      state.searches += 1;
      state.lastTerm = term;

      let records = await fetchLocations(type, state.origin, radius, opts);
      let message = '';
      let distance = radius;
      if (!records.length) {
        track({ ...base, locatorEvent: 'search no results', locSearchDistance: radius });
        if (type.retry && Number(radius) < SEARCH_AGAIN_RADIUS) {
          records = await fetchLocations(type, state.origin, SEARCH_AGAIN_RADIUS, opts);
          distance = SEARCH_AGAIN_RADIUS;
          const tokens = {
            RADIUS: radius, SEARCH_AGAIN_RADIUS, RADIUS_UNITS: labels['radius-units'],
          };
          message = fill(labels[records.length ? 'searched-again-message' : 'searched-again-empty-message'], tokens);
        } else {
          message = labels['no-results-message'];
        }
      }
      if (records.length) {
        track({
          ...base,
          locatorEvent: revised || distance !== radius ? 'revised search' : 'search',
          locNumResults: records.length,
          locSearchDistance: distance,
          locPrevSearchTerm: revised ? prev : '',
        });
      }
      showResults(records, message, { moveFocus });
    } catch {
      showError(labels['error-message'], moveFocus);
    } finally {
      state.busy = false;
      block.removeAttribute('aria-busy');
    }
  };

  ui.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const action = e.submitter?.value || (state.keyMode ? 'search' : 'locate');
    runSearch(action);
  });

  /* clear a field error as soon as it is fixed */
  Object.values(ui.fields).forEach((f) => {
    if (!f.wrap) return;
    const evt = f.control.tagName === 'SELECT' ? 'change' : 'input';
    f.control.addEventListener(evt, () => {
      if (f.wrap.classList.contains('is-error') && f.control.value.trim()) setFieldError(f, '');
    });
  });

  /* entry params: pre-filled form auto-runs when it can search without a prompt */
  if (params.has('zip') || params.has('brand')) {
    if (state.keyMode && cfg.zip) {
      runSearch('search', { moveFocus: false, auto: true });
    } else {
      locationGranted().then((granted) => {
        if (granted) runSearch('locate', { moveFocus: false, auto: true });
      });
    }
  }
}

export default async function init(block) {
  const authored = readConfig(block);
  const siteConfig = await getSiteConfig();
  createLocator(block, authored, siteConfig);
}
