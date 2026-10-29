/* eslint-disable */
/* global WebImporter */

import columnsPromoParser from './parsers/columns-promo.js';
import columnsCtaParser from './parsers/columns-cta.js';
import cardsIndustryParser from './parsers/cards-industry.js';
import columnsBrandsParser from './parsers/columns-brands.js';
import cardsProductsParser from './parsers/cards-products.js';
import cardsInsightsParser from './parsers/cards-insights.js';

import chevronCleanupTransformer from './transformers/chevron-cleanup.js';
import chevronSectionsTransformer from './transformers/chevron-sections.js';

const PAGE_TEMPLATE = {
  "name": "chevron-homepage",
  "urls": [
    "https://www.chevronlubricants.com/"
  ],
  "description": "Chevron Lubricants homepage: page title with promotional columns, where-to-buy CTA band, industry cards, brand logos, featured products carousel with promo tile, and latest insights carousel",
  "blocks": [
    {
      "name": "columns-promo",
      "instances": [
        "#main-content > .container-fluid > .multi-column.parbase:nth-of-type(2) > .multi-column__container"
      ]
    },
    {
      "name": "columns-cta",
      "instances": [
        "#main-content > .container-fluid > .multi-column.parbase:nth-of-type(4) > .multi-column__container"
      ]
    },
    {
      "name": "cards-industry",
      "instances": [
        "#main-content > .container-fluid > .multi-column.parbase:nth-of-type(7) > .multi-column__container"
      ]
    },
    {
      "name": "columns-brands",
      "instances": [
        "#main-content > .container-fluid > .multi-column.parbase:nth-of-type(9) > .multi-column__container"
      ]
    },
    {
      "name": "cards-products",
      "instances": [
        ".featured-products .fp-container .feature-pills"
      ]
    },
    {
      "name": "cards-insights",
      "instances": [
        ".featured-products .content-component .content-list"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Page title and promotional columns",
      "selector": [
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(1)"
      ],
      "style": "centered",
      "blocks": [
        "columns-promo"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(1)"
      ]
    },
    {
      "id": "section-2",
      "name": "Where to buy",
      "selector": [
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(3)"
      ],
      "style": "blue-bg, centered",
      "blocks": [
        "columns-cta"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(3)"
      ]
    },
    {
      "id": "section-3",
      "name": "Find resources by Industry",
      "selector": [
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(5)"
      ],
      "style": null,
      "blocks": [
        "cards-industry"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(5)",
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(6)"
      ]
    },
    {
      "id": "section-4",
      "name": "Our Family of Trusted Brands",
      "selector": [
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(8)"
      ],
      "style": "grey-bg, centered",
      "blocks": [
        "columns-brands"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .richtext.parbase:nth-of-type(8)"
      ]
    },
    {
      "id": "section-5",
      "name": "Featured Products",
      "selector": [
        ".featured-products .fp-container"
      ],
      "style": "split",
      "blocks": [
        "cards-products"
      ],
      "defaultContent": [
        ".featured-products .fp-container .fp-heading",
        ".featured-products .fp-container .feature-heading"
      ]
    },
    {
      "id": "section-6",
      "name": "Stay informed with Our Latest Insights",
      "selector": [
        ".featured-products .content-component"
      ],
      "style": "blue-bg, split",
      "blocks": [
        "cards-insights"
      ],
      "defaultContent": [
        ".featured-products .content-component .article-banner"
      ]
    }
  ]
};

const parsers = {
  'columns-promo': columnsPromoParser,
  'columns-cta': columnsCtaParser,
  'cards-industry': cardsIndustryParser,
  'columns-brands': columnsBrandsParser,
  'cards-products': cardsProductsParser,
  'cards-insights': cardsInsightsParser,
};

const transformers = [chevronCleanupTransformer, chevronSectionsTransformer];

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
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/home' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
