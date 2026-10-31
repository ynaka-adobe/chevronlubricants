/* eslint-disable */
/* global WebImporter */

import checklistParser from './parsers/checklist.js';
import statsCarouselParser from './parsers/stats-carousel.js';
import toolEmbedParser from './parsers/tool-embed.js';
import isocleanCalculatorParser from './parsers/isoclean-calculator.js';
import carouselBannerParser from './parsers/carousel-banner.js';
import carouselSquareParser from './parsers/carousel-square.js';
import cardsProductsParser from './parsers/cards-products.js';
import cardsFilterableParser from './parsers/cards-filterable.js';
import accordionDrawerParser from './parsers/accordion-drawer.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import quoteTestimonialParser from './parsers/quote-testimonial.js';
import heroCalloutParser from './parsers/hero-callout.js';
import heroOverlayParser from './parsers/hero-overlay.js';
import columnsCtaParser from './parsers/columns-cta.js';
import columnsPromoParser from './parsers/columns-promo.js';
import cardsServiceParser from './parsers/cards-service.js';
import cardsResourceParser from './parsers/cards-resource.js';
import columnsMediaParser from './parsers/columns-media.js';

import chevronProductsCleanupTransformer from './transformers/chevron-products-cleanup.js';
import chevronExpertiseCleanupTransformer from './transformers/chevron-expertise-cleanup.js';
import chevronCleanupTransformer from './transformers/chevron-cleanup.js';
import chevronExpertiseSectionsTransformer from './transformers/chevron-expertise-sections.js';
import chevronLinksTransformer from './transformers/chevron-links.js';
import chevronSectionsTransformer from './transformers/chevron-sections.js';

const PAGE_TEMPLATE = {
  "name": "expertise-services",
  "urls": [
    "https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/heavy-duty-product-selector.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/delo-smartchoice.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/fuel-economy-calculator.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/best-in-class-assessment.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/delo-promotions.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/coolants-freezepoint-calculator.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/heavy-duty-diesel/benchmark-calculator.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/personal-rec-vehicles/chevron-products-selector.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/personal-rec-vehicles/coolants-freezepoint-calculator.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/industrial-machinery/isoclean-calculator.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/industrial-machinery/best-in-class.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/industrial-machinery/heavy-duty-product-selector.html",
    "https://www.chevronlubricants.com/en_us/home/services/self-services/industrial-machinery/coolants-freezepoint-calculator.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/delo-warranty-plus.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/lubewatch.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/personal-rec-vehicles/havoline-oil-change-pros.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/personal-rec-vehicles/havoline-education-learning.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/industrial-machinery/isoclean-program.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/industrial-machinery/lubewatch-oil-analysis.html",
    "https://www.chevronlubricants.com/en_us/home/lubetek.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/preferred-vendors/checkfluid.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/preferred-vendors/des-case.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/preferred-vendors.html",
    "https://www.chevronlubricants.com/en_us/home/services/pro-services/trade-shows-and-events.html",
    "https://www.chevronlubricants.com/en_us/home/become-distributor.html"
  ],
  "representativeUrl": "https://www.chevronlubricants.com/en_us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/lubewatch.html",
  "description": "Services and Support menu pages (self services, pro services, LubeTek, preferred vendors, trade shows). Same AEM page structure as the Our Expertise pages, plus embedded external tools.",
  "blocks": [
    {
      "name": "checklist",
      "instances": [
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .check-list):not(:has(> .multi-column__container > .multi-column__content > .multi-column__item > :not(.check-list, .cmp-image, .button, .divider)))",
        "#main-content .check-list",
        "#main-content .image-check-list"
      ]
    },
    {
      "name": "stats-carousel",
      "instances": [
        "#main-content .article-hero-carousel-component:not(.multi-column__item *)"
      ]
    },
    {
      "name": "tool-embed",
      "instances": [
        "#main-content .iframe"
      ]
    },
    {
      "name": "isoclean-calculator",
      "instances": [
        "#main-content .isoclean-calculator"
      ]
    },
    {
      "name": "carousel-banner",
      "instances": [
        "#main-content .image-carousel"
      ]
    },
    {
      "name": "carousel-square",
      "instances": [
        "#main-content .square-carousel"
      ]
    },
    {
      "name": "cards-products",
      "instances": [
        "#main-content .product-list-component .product-list .slider-wrapper",
        "#main-content .featured-products .fp-container .feature-pills"
      ]
    },
    {
      "name": "cards-filterable",
      "instances": [
        "#main-content .knowledge-center"
      ]
    },
    {
      "name": "accordion-drawer",
      "instances": [
        "#main-content .drawer"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "#main-content .accordion-text"
      ]
    },
    {
      "name": "quote-testimonial",
      "instances": [
        "#main-content .testimonial",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container[data-bg-color=\"bg-blue\"] > .multi-column__content > .multi-column__item > .video)"
      ]
    },
    {
      "name": "hero-callout",
      "instances": [
        "#main-content .simple-panel:has(> .row > .container-fluid > div > .cmp-image + .richtext + .button):not(:has(.multi-column, .panel-with-button, .simple-panel))"
      ]
    },
    {
      "name": "hero-overlay",
      "instances": [
        "#main-content .cmp-image:not(.multi-column__item *):has(> .cl-adaptive-image > .adaptive-image__container > [class*=\"overlay\"] .richtext__container)",
        "#main-content .cmp-image:not(.multi-column__item *):has(> .cl-adaptive-image > .adaptive-image__container > .buttonOverlay .btn-wrapper a[href])"
      ]
    },
    {
      "name": "columns-cta",
      "instances": [
        "#main-content .social-media",
        "#main-content .panel-with-button",
        "#main-content > .container-fluid > .richtext:has(> .richtext__container > div > p > a ~ a ~ a ~ a ~ a)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .button:only-child)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item.column16 > .cmp-image:only-child)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item.column20 > .cmp-image:only-child)"
      ]
    },
    {
      "name": "columns-promo",
      "instances": [
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image):not(:has(> .multi-column__container > .multi-column__content > .multi-column__item > :is(.richtext, .title, .button, .video, .multi-column, .salesforce-embed-component, .check-list, .image-check-list))):not(:has(> .multi-column__container > .multi-column__content > .multi-column__item.column16))"
      ]
    },
    {
      "name": "cards-service",
      "instances": [
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .multi-column:only-child > .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image + .richtext:last-child):not(:has(> .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image + .richtext + .cmp-image))",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image + .richtext + .divider + .cmp-image:last-child)"
      ]
    },
    {
      "name": "cards-resource",
      "instances": [
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):not(:has(> .multi-column__container[data-bg-color=\"bg-blue\"] > .multi-column__content > .multi-column__item > .video)):has(> .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image + .richtext + :is(.richtext, .button, .video))",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .richtext:first-child + .cmp-image:last-child)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .richtext + .richtext + .richtext + .divider + .richtext)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item:nth-child(1) > .cmp-image:first-child + .button:last-child):has(> .multi-column__container > .multi-column__content > .multi-column__item:nth-child(2) > .cmp-image:first-child + .button:last-child)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item:nth-child(1) > .cmp-image:first-child + .video:last-child):has(> .multi-column__container > .multi-column__content > .multi-column__item:nth-child(2) > .cmp-image:first-child + .video:last-child)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item:nth-child(1) > .cmp-image:first-child + .divider + .richtext:last-child):has(> .multi-column__container > .multi-column__content > .multi-column__item:nth-child(2) > .cmp-image:first-child + .divider + .richtext:last-child)",
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image + .richtext + .cmp-image)"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container > .multi-column__content > .multi-column__item > :is(.cmp-image:only-child, .video:only-child, .divider:first-child + .cmp-image + .divider:last-child)):has(> .multi-column__container > .multi-column__content > .multi-column__item > :is(.richtext, .title)):not(:has(> .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image + .richtext)):not(:has(> .multi-column__container > .multi-column__content > .multi-column__item.column20))"
      ]
    }
  ],
  "urlPattern": "/en_us/home/*",
  "sections": [
    {
      "id": "band-default",
      "name": "Unstyled band (white / transparent background): every top-level component whose band element has bg-white, bg-transparent, defaultBackground or no bg token; consecutive ones form one section (\"centered\" appended when all its default content is centre-aligned)",
      "selector": [
        "#main-content > .container-fluid > *"
      ],
      "style": null,
      "blocks": [
        "carousel-banner",
        "carousel-square",
        "accordion-drawer",
        "accordion-faq",
        "hero-callout",
        "hero-overlay",
        "columns-cta",
        "columns-promo",
        "cards-service",
        "cards-resource",
        "columns-media"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .cmp-image",
        "#main-content > .container-fluid > .title",
        "#main-content > .container-fluid > .richtext",
        "#main-content > .container-fluid > .button",
        "#main-content > .container-fluid > .simple-panel",
        "#main-content > .container-fluid > .multi-column"
      ]
    },
    {
      "id": "band-grey-bg",
      "name": "Light grey band (#f5f5f5): bg-light-gray on the band element, plus the testimonial container",
      "selector": [
        "#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color=\"bg-light-gray\"])",
        "#main-content > .container-fluid > .richtext:has(> .richtext__container.bg-light-gray)",
        "#main-content > .container-fluid > .simple-panel:has(> .row.panel-background.bg-light-gray)",
        "#main-content > .container-fluid > .drawer:has(.drawer__content.bg-light-gray)",
        "#main-content > .container-fluid > .knowledge-center:has(.knowledge-center__container.bg-light-gray)",
        "#main-content > .container-fluid > .square-carousel:has(.square-carousel__container.bg-light-gray)",
        "#main-content > .container-fluid > .testimonial"
      ],
      "style": "grey-bg",
      "blocks": [
        "carousel-square",
        "cards-filterable",
        "accordion-drawer",
        "quote-testimonial",
        "cards-service",
        "cards-resource",
        "columns-media"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .richtext:has(> .richtext__container.bg-light-gray)",
        "#main-content > .container-fluid > .simple-panel:has(> .row.panel-background.bg-light-gray)",
        "#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color=\"bg-light-gray\"])"
      ]
    },
    {
      "id": "band-grey-gradient",
      "name": "Product carousel band (linear-gradient #f5f5f5 to white)",
      "selector": [
        "#main-content > .container-fluid > .row.product-list-component:has(.product-list .list-wrapper.bg-light-gray)"
      ],
      "style": "grey-gradient",
      "blocks": [
        "cards-products"
      ],
      "defaultContent": []
    },
    {
      "id": "band-sky-blue-bg",
      "name": "ISOCLEAN sky blue band (#04a2d3): bg-isoclean",
      "selector": [
        "#main-content > .container-fluid > .distributor:has(.distributor__container.bg-isoclean)",
        "#main-content > .container-fluid > .social-media:has(.social-media__container.bg-isoclean)",
        "#main-content > .container-fluid > .panel-with-button:has(.panel-with-button__container.bg-isoclean)",
        "#main-content > .container-fluid > .richtext:has(> .richtext__container.bg-isoclean)",
        "#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color=\"bg-isoclean\"])"
      ],
      "style": "sky-blue-bg",
      "blocks": [
        "columns-cta"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .distributor:has(.distributor__container.bg-isoclean)"
      ]
    },
    {
      "id": "band-cobalt-blue-bg",
      "name": "Delo cobalt blue band (#0066b2): bg-blue / bg-delo",
      "selector": [
        "#main-content > .container-fluid > .distributor:has(.distributor__container.bg-blue)",
        "#main-content > .container-fluid > .social-media:has(.social-media__container.bg-blue)",
        "#main-content > .container-fluid > .panel-with-button:has(.panel-with-button__container:is(.bg-blue, .bg-delo))",
        "#main-content > .container-fluid > .richtext:has(> .richtext__container.bg-blue)",
        "#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color=\"bg-blue\"])",
        "#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color=\"bg-delo\"])"
      ],
      "style": "cobalt-blue-bg",
      "blocks": [
        "quote-testimonial",
        "columns-cta"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .distributor:has(.distributor__container.bg-blue)",
        "#main-content > .container-fluid > .richtext:has(> .richtext__container.bg-blue)"
      ]
    },
    {
      "id": "band-blue-bg",
      "name": "Chevron blue band (#0c2e72): bg-strong-blue, and panel-with-button defaultBackground (#0b2d71)",
      "selector": [
        "#main-content > .container-fluid > .richtext:has(> .richtext__container.bg-strong-blue)",
        "#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color=\"bg-strong-blue\"])",
        "#main-content > .container-fluid > .panel-with-button:has(.panel-with-button__container.defaultBackground)"
      ],
      "style": "blue-bg",
      "blocks": [
        "columns-cta"
      ],
      "defaultContent": [
        "#main-content > .container-fluid > .richtext:has(> .richtext__container.bg-strong-blue)"
      ]
    },
    {
      "id": "band-black-bg",
      "name": "Black band (#000): bg-black",
      "selector": [
        "#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color=\"bg-black\"])",
        "#main-content > .container-fluid > .richtext:has(> .richtext__container.bg-black)"
      ],
      "style": "black-bg",
      "blocks": [
        "cards-service"
      ],
      "defaultContent": []
    },
    {
      "id": "band-teal-blue-bg",
      "name": "Teal blue band (#017da4): bg-blue-2 (greaseportfolio filter row only; needs a section style in styles.css)",
      "selector": [
        "#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color=\"bg-blue-2\"])"
      ],
      "style": "teal-blue-bg",
      "blocks": [
        "columns-cta"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'checklist': checklistParser,
  'stats-carousel': statsCarouselParser,
  'tool-embed': toolEmbedParser,
  'isoclean-calculator': isocleanCalculatorParser,
  'carousel-banner': carouselBannerParser,
  'carousel-square': carouselSquareParser,
  'cards-products': cardsProductsParser,
  'cards-filterable': cardsFilterableParser,
  'accordion-drawer': accordionDrawerParser,
  'accordion-faq': accordionFaqParser,
  'quote-testimonial': quoteTestimonialParser,
  'hero-callout': heroCalloutParser,
  'hero-overlay': heroOverlayParser,
  'columns-cta': columnsCtaParser,
  'columns-promo': columnsPromoParser,
  'cards-service': cardsServiceParser,
  'cards-resource': cardsResourceParser,
  'columns-media': columnsMediaParser,
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
