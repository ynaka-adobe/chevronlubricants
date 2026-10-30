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
  "name": "products-brand",
  "urls": [
    "https://www.chevronlubricants.com/en_us/home/products/by_brand/delo.html",
    "https://www.chevronlubricants.com/en_us/home/products/by_brand/havoline.html",
    "https://www.chevronlubricants.com/en_us/home/products/by_brand/industrial_products.html",
    "https://www.chevronlubricants.com/en_us/home/products/by_brand/isoclean.html",
    "https://www.chevronlubricants.com/en_us/home/products/by_brand/techron.html"
  ],
  "representativeUrl": "https://www.chevronlubricants.com/en_us/home/products/by_brand/delo.html",
  "description": "Brand product listing pages (by_brand): brand H1 + tagline (catalog header), Featured carousel (cards-products), brand links bar, brand header + product groups (cards-products grid). Same block model as products-listing.",
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
      "name": "Brand listing main content",
      "selector": [
        "#main-content .root.responsivegrid",
        ".root.responsivegrid"
      ],
      "style": null,
      "blocks": [
        "cards-products"
      ],
      "defaultContent": [
        ".product-catalog-header .product-catalog__tagtitle",
        ".product-catalog-header .product-catalog__tagline",
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
