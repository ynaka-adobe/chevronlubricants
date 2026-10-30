/* eslint-disable */
/* global WebImporter */

import cardsProductsParser from './parsers/cards-products.js';

import chevronProductsCleanupTransformer from './transformers/chevron-products-cleanup.js';
import chevronExpertiseCleanupTransformer from './transformers/chevron-expertise-cleanup.js';
import chevronCleanupTransformer from './transformers/chevron-cleanup.js';
import chevronExpertiseSectionsTransformer from './transformers/chevron-expertise-sections.js';
import chevronLinksTransformer from './transformers/chevron-links.js';
import chevronSectionsTransformer from './transformers/chevron-sections.js';

const PAGE_TEMPLATE = {
  "name": "products-listing",
  "urls": [
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/automobile_fleets.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/oil_change_service_centers.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/truck_fleets.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/cement_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/circulating_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/compressors.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/conveyors.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/injection_molding_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/lifts.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/manufacturing_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/mining_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/oil_gas_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/paper_machines.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/steel_mills.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/agriculture_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/construction_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/forestry_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/inland_marine_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/off_highway_heavy_duty/mining_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty/buses.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty/light_duty_and_diesel_pick_up_trucks.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty/medium_large_trucks.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/on_highway_heavy_duty/waste_hauler.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/atvs_utvs_snowmobiles.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/boats.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/cars_suvs.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/motorcycles.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/pick_up_trucks_sprinter_vans_diesel.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/pick_up_trucks_sprinter_vans_gasoline.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/personal_rec_vehicles/professional_lawn_care.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/gasoline_fleets.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/industrial.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/off_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/on_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/coolants_antifreezes/personal_rec_vehicles.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/gasoline_fleets.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/industrial.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/off_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/on_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/engine_oils/personal_rec_vehicles.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/fuel_additives/personal_rec_vehicles.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/greases/gasoline_fleets.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/greases/off_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/greases/on_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/greases/personal_rec_vehicles.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/hydraulic_oils/industrial.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/hydraulic_oils/off_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/hydraulic_oils/on_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/circulating_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/compressor_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/gear_box_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/hydraulic_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/metal_working_equipment_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/mining_equipment_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/paper_machine_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/specialty_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/industrial_oils/turbine_oils.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/gasoline_fleets.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/off_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/on_highway_heavy_duty.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/personal_rec_vehicles.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/transmission_gear_oils/industrial.html",
    "https://www.chevronlubricants.com/en_us/home/products/equipment_type/industrial_equipment_machinery/power_generation_equipment.html",
    "https://www.chevronlubricants.com/en_us/home/products/product_category/greases/industrial.html"
  ],
  "representativeUrl": "https://www.chevronlubricants.com/en_us/home/products/equipment_type/gasoline_fleets_oil_change_service_centers/automobile_fleets.html",
  "description": "Product category and equipment-type listing pages (61). One white main section (no section style): page H1 (inside the Featured product-list richtext on 49 pages; in a standalone top-level richtext on 10 pages without the carousel; in a title component on 2 pages without the carousel), optional \"Featured Products\" label + carousel, category sibling-link nav (Filter toggle/panel, mobile scroll-menu, \"See all\" toggles and \"Back to all products\" links are cleanup-removed), then grouped product grids each preceded by its group heading. Both the Featured carousel and every product group grid map to the single block variant cards-products (grid is a block option, not a separate variant). Instance .product-list__rebrand .slider-wrapper is the carousel and must emit the plain \"Cards-Products\" header; instance .pll .product-listing-list__category-container__items is a group grid and the parser must detect it (element.matches('.product-listing-list__category-container__items') / contains .product-listing-item) and call WebImporter.Blocks.createBlock(document, { name: 'cards-products', variants: ['grid'], cells }) so the header renders \"Cards-Products (grid)\". Carousel DOM: a.slide > .teaser-image (img in rendered DOM, data-bg on raw HTML) + .product-title + .category-heading .inner__description (skip .slick-cloned slides). Grid DOM: .product-listing-item > .product-listing-item__img-container (optional __isologo ISOCLEAN badge img + __product img) + .product-listing-item__title-link + .product-listing-item__benefits label + .product-listing-item__benefits-container ul + .product-listing-category__more a (Learn More) + .product-listing-category__buyonline a (button).",
  "blocks": [
    {
      "name": "cards-products",
      "instances": [
        ".product-list__rebrand .slider-wrapper",
        ".pll .product-listing-list__category-container__items"
      ]
    }
  ],
  "urlPattern": "/en_us/home/products/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Product listing main content",
      "selector": [
        "#main-content .root.responsivegrid",
        ".root.responsivegrid"
      ],
      "style": null,
      "blocks": [
        "cards-products"
      ],
      "defaultContent": [
        ".richtext.parbase.aem-GridColumn .richtext__container",
        ".title.aem-GridColumn .title__container",
        ".product-list__rebrand .richtext__container",
        ".product-list__rebrand .product-list-rebrand__title",
        ".category-listing > .category > ol",
        ".pll .product-listing-category__header"
      ]
    }
  ]
};

const parsers = {
  'cards-products': cardsProductsParser,
};

const transformers = [chevronProductsCleanupTransformer, chevronExpertiseCleanupTransformer, chevronCleanupTransformer, chevronExpertiseSectionsTransformer, chevronLinksTransformer, chevronSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    // mirror the source structure under /en-us/home (sanitizePath: en_us -> en-us, _ -> -);
    // the source root is the homepage -> /en-us/home (same rule as generate-link-map.mjs)
    const path = WebImporter.FileUtils.sanitizePath((rawPath === '' ? '/en_us/home' : rawPath).toLowerCase());

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
