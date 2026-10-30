/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Chevron Lubricants links
 * Applies to: ALL templates (afterTransform only, after the parsers ran).
 *
 * (a) Links to migrated pages -> new EDS paths. The migrated set is every URL in
 *     tools/importer/page-templates.json (all templates, query strings ignored),
 *     embedded below as MIGRATED. REGENERATE it whenever templates[].urls change:
 *       node tools/importer/generate-link-map.mjs
 *     Mapping (customer decision): drop /en_us/home, strip .html, underscores ->
 *     hyphens, lowercase; the homepage -> /home. The #hash is kept, the query
 *     (e.g. ?src-tab=ourexpertise) is dropped. Relative, root-relative and absolute
 *     chevronlubricants.com hrefs are handled. Links to non-migrated pages on the
 *     site become absolute https://www.chevronlubricants.com URLs (query + hash kept).
 *     In-page "#id" hrefs, mailto:/tel: and other hosts are left alone. Links marked
 *     data-excat-keep-absolute (set by chevron-expertise-cleanup.js for the live form
 *     page link) are made absolute but never rewritten to an EDS path.
 *
 * (b) YouTube video links (youtube.com/watch, youtu.be, youtube.com/embed/ID — embed
 *     URLs are normalised to watch URLs) inside blocks that must keep them as links
 *     (cards-resource, quote-testimonial, cards-filterable, and columns-media when the
 *     video column is a thumbnail link) get the #_dnb suffix, otherwise scripts/ak.js
 *     auto-blocks them into YouTube embeds. Non-video YouTube links (channel / user
 *     pages, e.g. social icons) get #_dnb everywhere, since ak.js would otherwise turn
 *     them into broken embeds. Not applied to the chevron-homepage template (its
 *     output only changes through (a)).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

const ORIGIN = 'https://www.chevronlubricants.com';
// author-prod: links authored with the AEM editor URL on the source (public-broken)
const SOURCE_HOSTS = ['www.chevronlubricants.com', 'chevronlubricants.com', 'author-prod.chevronlubricants.com'];
// The importer may serve the source page through a local proxy.
const PROXY_HOSTS = ['localhost', '127.0.0.1'];
const KEEP_ABSOLUTE = 'data-excat-keep-absolute';

// GENERATED-LINK-MAP-START (node tools/importer/generate-link-map.mjs; do not edit by hand)
const MIGRATED = {
  "/": "/en-us/home",
  "/en_us/home": "/en-us/home",
  "/en_us/home.html": "/en-us/home",
  "/en_us/home/contact-us.html": "/en-us/home/contact-us",
  "/en_us/home/learning/about-our-brands/delo.html": "/en-us/home/learning/about-our-brands/delo",
  "/en_us/home/learning/about-our-brands/delo/coolant-landing-page.html": "/en-us/home/learning/about-our-brands/delo/coolant-landing-page",
  "/en_us/home/learning/about-our-brands/delo/delo-customer-success-stories.html": "/en-us/home/learning/about-our-brands/delo/delo-customer-success-stories",
  "/en_us/home/learning/about-our-brands/delo/emissions-control-center/on-hwy-the-solution.html": "/en-us/home/learning/about-our-brands/delo/emissions-control-center/on-hwy-the-solution",
  "/en_us/home/learning/about-our-brands/delo/simplify-your-fleet-protection.html": "/en-us/home/learning/about-our-brands/delo/simplify-your-fleet-protection",
  "/en_us/home/learning/about-our-brands/delo/the-delo-difference.html": "/en-us/home/learning/about-our-brands/delo/the-delo-difference",
  "/en_us/home/learning/about-our-brands/delo/tractor-restoration-competition.html": "/en-us/home/learning/about-our-brands/delo/tractor-restoration-competition",
  "/en_us/home/learning/about-our-brands/havoline.html": "/en-us/home/learning/about-our-brands/havoline",
  "/en_us/home/learning/about-our-brands/havoline/business.html": "/en-us/home/learning/about-our-brands/havoline/business",
  "/en_us/home/learning/about-our-brands/havoline/drivers.html": "/en-us/home/learning/about-our-brands/havoline/drivers",
  "/en_us/home/learning/about-our-brands/havoline/gf-7-landing-page.html": "/en-us/home/learning/about-our-brands/havoline/gf-7-landing-page",
  "/en_us/home/learning/about-our-brands/havoline/havoline-customer-stories.html": "/en-us/home/learning/about-our-brands/havoline/havoline-customer-stories",
  "/en_us/home/learning/about-our-brands/industrial-products.html": "/en-us/home/learning/about-our-brands/industrial-products",
  "/en_us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil.html": "/en-us/home/learning/about-our-brands/industrial-products/choosing-industrial-engine-oil",
  "/en_us/home/learning/about-our-brands/industrial-products/clarity-landing-page.html": "/en-us/home/learning/about-our-brands/industrial-products/clarity-landing-page",
  "/en_us/home/learning/about-our-brands/industrial-products/greaseportfolio.html": "/en-us/home/learning/about-our-brands/industrial-products/greaseportfolio",
  "/en_us/home/learning/about-our-brands/industrial-products/how-hydraulic-oils-impact-efficiency.html": "/en-us/home/learning/about-our-brands/industrial-products/how-hydraulic-oils-impact-efficiency",
  "/en_us/home/learning/about-our-brands/industrial-products/industrial-products-faqs.html": "/en-us/home/learning/about-our-brands/industrial-products/industrial-products-faqs",
  "/en_us/home/learning/about-our-brands/industrial-products/learning-for-you.html": "/en-us/home/learning/about-our-brands/industrial-products/learning-for-you",
  "/en_us/home/learning/about-our-brands/industrial-products/vartech-isc.html": "/en-us/home/learning/about-our-brands/industrial-products/vartech-isc",
  "/en_us/home/learning/about-our-brands/isoclean.html": "/en-us/home/learning/about-our-brands/isoclean",
  "/en_us/home/learning/about-our-brands/isoclean/construction-new-oil-is-costing-you.html": "/en-us/home/learning/about-our-brands/isoclean/construction-new-oil-is-costing-you",
  "/en_us/home/learning/about-our-brands/isoclean/customer-success.html": "/en-us/home/learning/about-our-brands/isoclean/customer-success",
  "/en_us/home/learning/about-our-brands/isoclean/isoclean-faqs.html": "/en-us/home/learning/about-our-brands/isoclean/isoclean-faqs",
  "/en_us/home/learning/about-our-brands/isoclean/learning-for-you.html": "/en-us/home/learning/about-our-brands/isoclean/learning-for-you",
  "/en_us/home/learning/about-our-brands/isoclean/mining-did-you-check-the-third-spec.html": "/en-us/home/learning/about-our-brands/isoclean/mining-did-you-check-the-third-spec",
  "/en_us/home/learning/about-our-brands/isoclean/oil-and-gas-svcs-the-impact-of-dirty-oil.html": "/en-us/home/learning/about-our-brands/isoclean/oil-and-gas-svcs-the-impact-of-dirty-oil",
  "/en_us/home/learning/about-our-brands/isoclean/waste-hauling-does-your-new-oil-meet-the-third-spec.html": "/en-us/home/learning/about-our-brands/isoclean/waste-hauling-does-your-new-oil-meet-the-third-spec",
  "/en_us/home/learning/about-our-brands/techron.html": "/en-us/home/learning/about-our-brands/techron",
  "/en_us/home/learning/about-our-brands/techron/faqs.html": "/en-us/home/learning/about-our-brands/techron/faqs",
  "/en_us/home/learning/about-our-brands/techron/history.html": "/en-us/home/learning/about-our-brands/techron/history",
  "/en_us/home/learning/about-our-brands/xpress-lube.html": "/en-us/home/learning/about-our-brands/xpress-lube",
  "/en_us/home/learning/about-our-brands/xpress-lube/drivers.html": "/en-us/home/learning/about-our-brands/xpress-lube/drivers",
  "/en_us/home/learning/from-chevron/chevron-lubematters-blog-landing.html": "/en-us/home/learning/from-chevron/chevron-lubematters-blog-landing",
  "/en_us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/get-more-efficiency-from-the-workhorse-fuel.html": "/en-us/home/learning/from-chevron/heavy-duty-diesel-vehicles-and-equipment/get-more-efficiency-from-the-workhorse-fuel",
  "/en_us/home/learning/from-chevron/industrial-machinery/smaller-eservoirs-and-hotter-operating-temps-change-hydraulic-fluid-selection.html": "/en-us/home/learning/from-chevron/industrial-machinery/smaller-eservoirs-and-hotter-operating-temps-change-hydraulic-fluid-selection",
  "/en_us/home/products/by_brand/delo.html": "/en-us/home/products/by-brand/delo",
  "/en_us/home/products/by_brand/havoline.html": "/en-us/home/products/by-brand/havoline",
  "/en_us/home/products/by_brand/industrial_products.html": "/en-us/home/products/by-brand/industrial-products",
  "/en_us/home/products/by_brand/isoclean.html": "/en-us/home/products/by-brand/isoclean",
  "/en_us/home/products/by_brand/techron.html": "/en-us/home/products/by-brand/techron",
  "/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/automobile_fleets.html": "/en-us/home/products/equipment-type/gasoline-fleets-oil-change-service-centers/automobile-fleets",
  "/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/oil_change_service_centers.html": "/en-us/home/products/equipment-type/gasoline-fleets-oil-change-service-centers/oil-change-service-centers",
  "/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/truck_fleets.html": "/en-us/home/products/equipment-type/gasoline-fleets-oil-change-service-centers/truck-fleets",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/cement_equipment.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/cement-equipment",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/circulating_equipment.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/circulating-equipment",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/compressors.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/compressors",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/conveyors.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/conveyors",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/injection_molding_equipment.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/injection-molding-equipment",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/lifts.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/lifts",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/manufacturing_equipment.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/manufacturing-equipment",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/mining_equipment.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/mining-equipment",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/oil_gas_equipment.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/oil-gas-equipment",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/paper_machines.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/paper-machines",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/power_generation_equipment.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/power-generation-equipment",
  "/en_us/home/products/equipment_type/industrial_equipment_machinery/steel_mills.html": "/en-us/home/products/equipment-type/industrial-equipment-machinery/steel-mills",
  "/en_us/home/products/equipment_type/off_highway_heavy_duty/agriculture_equipment.html": "/en-us/home/products/equipment-type/off-highway-heavy-duty/agriculture-equipment",
  "/en_us/home/products/equipment_type/off_highway_heavy_duty/construction_equipment.html": "/en-us/home/products/equipment-type/off-highway-heavy-duty/construction-equipment",
  "/en_us/home/products/equipment_type/off_highway_heavy_duty/forestry_equipment.html": "/en-us/home/products/equipment-type/off-highway-heavy-duty/forestry-equipment",
  "/en_us/home/products/equipment_type/off_highway_heavy_duty/inland_marine_equipment.html": "/en-us/home/products/equipment-type/off-highway-heavy-duty/inland-marine-equipment",
  "/en_us/home/products/equipment_type/off_highway_heavy_duty/mining_equipment.html": "/en-us/home/products/equipment-type/off-highway-heavy-duty/mining-equipment",
  "/en_us/home/products/equipment_type/on_highway_heavy_duty/buses.html": "/en-us/home/products/equipment-type/on-highway-heavy-duty/buses",
  "/en_us/home/products/equipment_type/on_highway_heavy_duty/light_duty_and_diesel_pick_up_trucks.html": "/en-us/home/products/equipment-type/on-highway-heavy-duty/light-duty-and-diesel-pick-up-trucks",
  "/en_us/home/products/equipment_type/on_highway_heavy_duty/medium_large_trucks.html": "/en-us/home/products/equipment-type/on-highway-heavy-duty/medium-large-trucks",
  "/en_us/home/products/equipment_type/on_highway_heavy_duty/waste_hauler.html": "/en-us/home/products/equipment-type/on-highway-heavy-duty/waste-hauler",
  "/en_us/home/products/equipment_type/personal_rec_vehicles/atvs_utvs_snowmobiles.html": "/en-us/home/products/equipment-type/personal-rec-vehicles/atvs-utvs-snowmobiles",
  "/en_us/home/products/equipment_type/personal_rec_vehicles/boats.html": "/en-us/home/products/equipment-type/personal-rec-vehicles/boats",
  "/en_us/home/products/equipment_type/personal_rec_vehicles/cars_suvs.html": "/en-us/home/products/equipment-type/personal-rec-vehicles/cars-suvs",
  "/en_us/home/products/equipment_type/personal_rec_vehicles/motorcycles.html": "/en-us/home/products/equipment-type/personal-rec-vehicles/motorcycles",
  "/en_us/home/products/equipment_type/personal_rec_vehicles/pick_up_trucks_sprinter_vans_diesel.html": "/en-us/home/products/equipment-type/personal-rec-vehicles/pick-up-trucks-sprinter-vans-diesel",
  "/en_us/home/products/equipment_type/personal_rec_vehicles/pick_up_trucks_sprinter_vans_gasoline.html": "/en-us/home/products/equipment-type/personal-rec-vehicles/pick-up-trucks-sprinter-vans-gasoline",
  "/en_us/home/products/equipment_type/personal_rec_vehicles/professional_lawn_care.html": "/en-us/home/products/equipment-type/personal-rec-vehicles/professional-lawn-care",
  "/en_us/home/products/product_category/coolants_antifreezes/gasoline_fleets.html": "/en-us/home/products/product-category/coolants-antifreezes/gasoline-fleets",
  "/en_us/home/products/product_category/coolants_antifreezes/industrial.html": "/en-us/home/products/product-category/coolants-antifreezes/industrial",
  "/en_us/home/products/product_category/coolants_antifreezes/off_highway_heavy_duty.html": "/en-us/home/products/product-category/coolants-antifreezes/off-highway-heavy-duty",
  "/en_us/home/products/product_category/coolants_antifreezes/on_highway_heavy_duty.html": "/en-us/home/products/product-category/coolants-antifreezes/on-highway-heavy-duty",
  "/en_us/home/products/product_category/coolants_antifreezes/personal_rec_vehicles.html": "/en-us/home/products/product-category/coolants-antifreezes/personal-rec-vehicles",
  "/en_us/home/products/product_category/engine_oils/gasoline_fleets.html": "/en-us/home/products/product-category/engine-oils/gasoline-fleets",
  "/en_us/home/products/product_category/engine_oils/industrial.html": "/en-us/home/products/product-category/engine-oils/industrial",
  "/en_us/home/products/product_category/engine_oils/off_highway_heavy_duty.html": "/en-us/home/products/product-category/engine-oils/off-highway-heavy-duty",
  "/en_us/home/products/product_category/engine_oils/on_highway_heavy_duty.html": "/en-us/home/products/product-category/engine-oils/on-highway-heavy-duty",
  "/en_us/home/products/product_category/engine_oils/personal_rec_vehicles.html": "/en-us/home/products/product-category/engine-oils/personal-rec-vehicles",
  "/en_us/home/products/product_category/fuel_additives/personal_rec_vehicles.html": "/en-us/home/products/product-category/fuel-additives/personal-rec-vehicles",
  "/en_us/home/products/product_category/greases/gasoline_fleets.html": "/en-us/home/products/product-category/greases/gasoline-fleets",
  "/en_us/home/products/product_category/greases/industrial.html": "/en-us/home/products/product-category/greases/industrial",
  "/en_us/home/products/product_category/greases/off_highway_heavy_duty.html": "/en-us/home/products/product-category/greases/off-highway-heavy-duty",
  "/en_us/home/products/product_category/greases/on_highway_heavy_duty.html": "/en-us/home/products/product-category/greases/on-highway-heavy-duty",
  "/en_us/home/products/product_category/greases/personal_rec_vehicles.html": "/en-us/home/products/product-category/greases/personal-rec-vehicles",
  "/en_us/home/products/product_category/hydraulic_oils/industrial.html": "/en-us/home/products/product-category/hydraulic-oils/industrial",
  "/en_us/home/products/product_category/hydraulic_oils/off_highway_heavy_duty.html": "/en-us/home/products/product-category/hydraulic-oils/off-highway-heavy-duty",
  "/en_us/home/products/product_category/hydraulic_oils/on_highway_heavy_duty.html": "/en-us/home/products/product-category/hydraulic-oils/on-highway-heavy-duty",
  "/en_us/home/products/product_category/industrial_oils/circulating_oils.html": "/en-us/home/products/product-category/industrial-oils/circulating-oils",
  "/en_us/home/products/product_category/industrial_oils/compressor_oils.html": "/en-us/home/products/product-category/industrial-oils/compressor-oils",
  "/en_us/home/products/product_category/industrial_oils/gear_box_oils.html": "/en-us/home/products/product-category/industrial-oils/gear-box-oils",
  "/en_us/home/products/product_category/industrial_oils/hydraulic_oils.html": "/en-us/home/products/product-category/industrial-oils/hydraulic-oils",
  "/en_us/home/products/product_category/industrial_oils/metal_working_equipment_oils.html": "/en-us/home/products/product-category/industrial-oils/metal-working-equipment-oils",
  "/en_us/home/products/product_category/industrial_oils/mining_equipment_oils.html": "/en-us/home/products/product-category/industrial-oils/mining-equipment-oils",
  "/en_us/home/products/product_category/industrial_oils/paper_machine_oils.html": "/en-us/home/products/product-category/industrial-oils/paper-machine-oils",
  "/en_us/home/products/product_category/industrial_oils/specialty_oils.html": "/en-us/home/products/product-category/industrial-oils/specialty-oils",
  "/en_us/home/products/product_category/industrial_oils/turbine_oils.html": "/en-us/home/products/product-category/industrial-oils/turbine-oils",
  "/en_us/home/products/product_category/transmission_gear_oils/gasoline_fleets.html": "/en-us/home/products/product-category/transmission-gear-oils/gasoline-fleets",
  "/en_us/home/products/product_category/transmission_gear_oils/industrial.html": "/en-us/home/products/product-category/transmission-gear-oils/industrial",
  "/en_us/home/products/product_category/transmission_gear_oils/off_highway_heavy_duty.html": "/en-us/home/products/product-category/transmission-gear-oils/off-highway-heavy-duty",
  "/en_us/home/products/product_category/transmission_gear_oils/on_highway_heavy_duty.html": "/en-us/home/products/product-category/transmission-gear-oils/on-highway-heavy-duty",
  "/en_us/home/products/product_category/transmission_gear_oils/personal_rec_vehicles.html": "/en-us/home/products/product-category/transmission-gear-oils/personal-rec-vehicles",
  "/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html": "/en-us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us",
  "/en_us/home/where-to-buy/find-a-distributor.html": "/en-us/home/where-to-buy/find-a-distributor",
  "/en_us/home/where-to-buy/find-a-retailer.html": "/en-us/home/where-to-buy/find-a-retailer",
  "/en_us/home/where-to-buy/find-an-installer.html": "/en-us/home/where-to-buy/find-an-installer"
};
// GENERATED-LINK-MAP-END

// YouTube links in these blocks stay links ("Watch the video" buttons included)
const DNB_BLOCKS = ['cards-resource', 'quote-testimonial', 'cards-filterable', 'columns-media'];
const DNB_THUMBNAIL_BLOCKS = [];

function pathKey(pathname) {
  let p = pathname;
  try { p = decodeURI(pathname); } catch (e) { /* keep raw */ }
  return p.replace(/\/+$/, '').toLowerCase() || '/';
}

function baseUrl(payload) {
  const params = (payload && payload.params) || {};
  const candidates = [params.originalURL, payload && payload.url];
  for (const c of candidates) {
    if (!c) continue;
    try {
      const u = new URL(c);
      if (SOURCE_HOSTS.includes(u.hostname)) return u.href;
    } catch (e) { /* try next */ }
  }
  return `${ORIGIN}/`;
}

function rewriteLinks(element, payload) {
  const base = baseUrl(payload);
  element.querySelectorAll('a[href]').forEach((a) => {
    const raw = (a.getAttribute('href') || '').trim();
    const keepAbsolute = a.hasAttribute(KEEP_ABSOLUTE);
    a.removeAttribute(KEEP_ABSOLUTE);
    if (!raw || raw.startsWith('#')) return;
    if (/^(mailto|tel|sms|javascript|data|blob):/i.test(raw)) return;
    // root-relative links that are already new-site paths (e.g. the
    // /en-us/home/learning/resources.json sheet link authored by the cards-filterable parser)
    // are left alone; source-site relative links start with /en_us/ (underscore),
    // /content/, /etc/ or /bin/.
    if (raw.startsWith('/') && !raw.startsWith('//') && !/^\/(en_us|content|etc|bin)(\/|$)/i.test(raw)) return;
    let u;
    try { u = new URL(raw, base); } catch (e) { return; }
    if (!/^https?:$/.test(u.protocol)) return;
    if (!SOURCE_HOSTS.includes(u.hostname) && !PROXY_HOSTS.includes(u.hostname)) return;

    // AEM editor / repository paths -> public path
    const pathname = u.pathname.replace(/^\/editor\.html(?=\/)/, '').replace(/^\/content\/chevron-lubricants(?=\/en_us\/)/, '');
    const mapped = keepAbsolute ? null : MIGRATED[pathKey(pathname)];
    const next = mapped ? `${mapped}${u.hash}` : `${ORIGIN}${pathname}${u.search}${u.hash}`;
    if (next !== raw) a.setAttribute('href', next);
  });
}

function blockName(table) {
  const firstRow = table.querySelector('tr');
  const cell = firstRow && firstRow.querySelector('th, td');
  if (!cell) return '';
  return cell.textContent.split('(')[0].trim().toLowerCase().replace(/\s+/g, '-');
}

function parseYouTube(href) {
  try {
    const u = new URL(href, ORIGIN);
    const host = u.hostname.replace(/^(www|m)\./, '');
    if (host === 'youtu.be') return { video: true, url: `https://youtu.be${u.pathname}${u.search}` };
    if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null;
    if (u.pathname === '/watch') return { video: true, url: `https://www.youtube.com/watch${u.search}` };
    const embed = u.pathname.match(/^\/embed\/([\w-]+)/);
    // embed URLs (//www.youtube.com/embed/ID?autoplay=1...) -> plain watch URL
    if (embed) return { video: true, url: `https://www.youtube.com/watch?v=${embed[1]}` };
    return { video: false, url: `https://www.youtube.com${u.pathname}${u.search}` };
  } catch (e) {
    return null;
  }
}

// #_dnb must be the hash (an existing fragment is dropped)
function addDnb(a, { videosOnly = true } = {}) {
  const href = a.getAttribute('href') || '';
  if (href.includes('#_dnb')) return;
  const yt = parseYouTube(href);
  if (!yt || (videosOnly && !yt.video)) return;
  a.setAttribute('href', `${yt.url}#_dnb`);
}

function markYouTubeLinks(element) {
  // Channel / user / playlist links (e.g. social icons) can never be embedded, but
  // ak.js auto-blocks every https://www.youtube... href: keep them links everywhere.
  element.querySelectorAll('a[href]').forEach((a) => {
    const yt = parseYouTube(a.getAttribute('href') || '');
    if (yt && !yt.video) addDnb(a, { videosOnly: false });
  });
  element.querySelectorAll('table').forEach((table) => {
    const name = blockName(table);
    if (DNB_BLOCKS.includes(name)) {
      table.querySelectorAll('a[href]').forEach(addDnb);
    } else if (DNB_THUMBNAIL_BLOCKS.includes(name)) {
      // only thumbnail links (image inside the link, or image + link in the same cell);
      // a bare YouTube link in a cell is meant to be embedded
      table.querySelectorAll('a[href]').forEach((a) => {
        const cell = a.closest('td, th');
        if (a.querySelector('img, picture') || (cell && cell.querySelector('img, picture'))) addDnb(a);
      });
    }
  });
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;
  rewriteLinks(element, payload);
  const name = payload && payload.template && payload.template.name;
  if (name !== 'chevron-homepage') markYouTubeLinks(element);
}
