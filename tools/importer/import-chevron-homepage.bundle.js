/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-chevron-homepage.js
  var import_chevron_homepage_exports = {};
  __export(import_chevron_homepage_exports, {
    default: () => import_chevron_homepage_default
  });

  // tools/importer/parsers/columns-promo.js
  var ORIGIN = "https://www.chevronlubricants.com";
  function absUrl(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN).href;
    } catch (e) {
      return url;
    }
  }
  function buildImage(document, item) {
    const src = item.querySelector("img.tablet-up-hidden") || item.querySelector("img");
    if (!src) return null;
    const img = document.createElement("img");
    img.src = absUrl(src.getAttribute("data-src") || src.getAttribute("src"));
    img.alt = (src.getAttribute("alt") || "").trim();
    return img;
  }
  function parse(element, { document }) {
    const items = [...element.querySelectorAll(".multi-column__content > .multi-column__item")].filter((item) => item.querySelector("img") || item.textContent.trim());
    const row = items.map((item) => {
      const cell = [];
      const img = buildImage(document, item);
      const imgLink = item.querySelector(".cmp-image a[href]");
      if (img && imgLink) {
        const a = document.createElement("a");
        a.href = absUrl(imgLink.getAttribute("href"));
        a.append(img);
        const p = document.createElement("p");
        p.append(a);
        cell.push(p);
      } else if (img) {
        cell.push(img);
      }
      item.querySelectorAll(".richtext .richtext__container p").forEach((srcP) => {
        const text = srcP.textContent.replace(/ /g, " ").trim();
        if (!text) return;
        const p = document.createElement("p");
        const bold = srcP.querySelector("b, strong");
        if (bold && bold.textContent.trim() === srcP.textContent.trim()) {
          const strong = document.createElement("strong");
          strong.textContent = text;
          p.append(strong);
        } else {
          p.textContent = text;
        }
        cell.push(p);
      });
      return cell;
    });
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  var ORIGIN2 = "https://www.chevronlubricants.com";
  function absUrl2(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN2).href;
    } catch (e) {
      return url;
    }
  }
  function parse2(element, { document }) {
    const items = [...element.querySelectorAll(".multi-column__content > .multi-column__item")];
    const row = [];
    items.forEach((item) => {
      const links = [...item.querySelectorAll(".btn-wrapper a[href]")];
      if (!links.length) return;
      const cell = links.map((srcLink) => {
        const a = document.createElement("a");
        a.href = absUrl2(srcLink.getAttribute("href"));
        const label = srcLink.querySelector(".btn-text") || srcLink;
        a.textContent = label.textContent.replace(/\s+/g, " ").trim();
        const p = document.createElement("p");
        p.append(a);
        return p;
      });
      row.push(cell);
    });
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-industry.js
  var ORIGIN3 = "https://www.chevronlubricants.com";
  function absUrl3(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN3).href;
    } catch (e) {
      return url;
    }
  }
  function clean(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function parse3(element, { document }) {
    const cells = [];
    const items = [...element.querySelectorAll(".multi-column__content > .multi-column__item")];
    items.forEach((item) => {
      const srcImg = item.querySelector("img.tablet-up-hidden") || item.querySelector("img");
      const imageCell = [];
      if (srcImg) {
        const img = document.createElement("img");
        img.src = absUrl3(srcImg.getAttribute("data-src") || srcImg.getAttribute("src"));
        img.alt = clean(srcImg.getAttribute("alt"));
        imageCell.push(img);
      }
      const overlay = item.querySelector(".adaptive-image__container .richtext__container") || item;
      const parts = [...overlay.querySelectorAll("p, h1, h2, h3, h4, h5, h6")].map((el) => clean(el.textContent)).filter(Boolean);
      const title = parts.reduce((acc, part) => {
        if (!acc) return part;
        return /^[/\-]/.test(part) || /[/\-]$/.test(acc) ? `${acc}${part}` : `${acc} ${part}`;
      }, "") || (srcImg ? clean(srcImg.getAttribute("alt")) : "");
      const srcLink = overlay.querySelector("a[href]") || item.querySelector("a[href]");
      const textCell = [];
      if (title) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        if (srcLink) {
          const a = document.createElement("a");
          a.href = absUrl3(srcLink.getAttribute("href"));
          a.textContent = title;
          strong.append(a);
        } else {
          strong.textContent = title;
        }
        p.append(strong);
        textCell.push(p);
      }
      if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-industry", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-brands.js
  var ORIGIN4 = "https://www.chevronlubricants.com";
  function absUrl4(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN4).href;
    } catch (e) {
      return url;
    }
  }
  function parse4(element, { document }) {
    const items = [...element.querySelectorAll(".multi-column__content > .multi-column__item")];
    const row = [];
    items.forEach((item) => {
      const srcImg = item.querySelector("img.tablet-up-hidden") || item.querySelector("img");
      if (!srcImg) return;
      const img = document.createElement("img");
      img.src = absUrl4(srcImg.getAttribute("data-src") || srcImg.getAttribute("src"));
      img.alt = (srcImg.getAttribute("title") || srcImg.getAttribute("alt") || "").trim();
      const srcLink = item.querySelector(".cmp-image a[href]");
      if (srcLink) {
        const a = document.createElement("a");
        a.href = absUrl4(srcLink.getAttribute("href"));
        a.append(img);
        const p = document.createElement("p");
        p.append(a);
        row.push([p]);
      } else {
        row.push([img]);
      }
    });
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-brands", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-products.js
  var ORIGIN5 = "https://www.chevronlubricants.com";
  function absUrl5(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN5).href;
    } catch (e) {
      return url;
    }
  }
  function clean2(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function makeImg(document, srcImg, fallbackAlt) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src");
    if (!src) return null;
    const img = document.createElement("img");
    img.src = absUrl5(src);
    img.alt = clean2(srcImg.getAttribute("alt")).replace(/�/g, "\xAE") || fallbackAlt || "";
    return img;
  }
  function makeLinkPara(document, href, text) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = absUrl5(href);
    a.textContent = text;
    p.append(a);
    return p;
  }
  function parse5(element, { document }) {
    const cells = [];
    const tiles = [...element.querySelectorAll(".product-tile")];
    const badgeWraps = [...element.querySelectorAll(".isoclean-image")];
    const imageTiles = [...element.querySelectorAll(".imagetile")];
    const headings = [...element.querySelectorAll("a.product-heading")];
    const learnLinks = [...element.querySelectorAll("a.fp-learn")];
    const ctaLinks = [...element.querySelectorAll("a.prod-cta-button")];
    const ctaButtons = [...element.querySelectorAll("button.product-button")];
    const lists = [...element.querySelectorAll("ul.benefit")];
    const count = Math.max(tiles.length, headings.length);
    for (let i = 0; i < count; i += 1) {
      const heading = headings[i];
      const title = heading ? clean2(heading.textContent) : "";
      const imageCell = [];
      const badge = makeImg(document, badgeWraps[i] && badgeWraps[i].querySelector("img"), "ISOCLEAN Certified Lubricants");
      if (badge) imageCell.push(badge);
      const product = makeImg(document, imageTiles[i] && imageTiles[i].querySelector("img"), title);
      if (product) imageCell.push(product);
      const textCell = [];
      if (heading) {
        const h3 = document.createElement("h3");
        const a = document.createElement("a");
        a.href = absUrl5(heading.getAttribute("href"));
        a.textContent = title;
        h3.append(a);
        textCell.push(h3);
      }
      const learn = learnLinks[i];
      if (learn) textCell.push(makeLinkPara(document, learn.getAttribute("href"), clean2(learn.textContent) || "Learn More"));
      const cta = ctaLinks[i];
      if (cta) {
        const label = clean2(cta.textContent) || (ctaButtons[i] ? clean2(ctaButtons[i].textContent) : "") || "Learn More";
        textCell.push(makeLinkPara(document, cta.getAttribute("href"), label));
      }
      const list = lists[i];
      if (list) {
        const ul = document.createElement("ul");
        list.querySelectorAll("li").forEach((srcLi) => {
          const text = clean2(srcLi.textContent);
          if (!text) return;
          const li = document.createElement("li");
          li.textContent = text;
          ul.append(li);
        });
        if (ul.children.length) textCell.push(ul);
      }
      if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-products", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  var ORIGIN6 = "https://www.chevronlubricants.com";
  function absUrl6(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN6).href;
    } catch (e) {
      return url;
    }
  }
  function clean3(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function parse6(element, { document }) {
    const cells = [];
    const tiles = [...element.querySelectorAll(".article-tile")];
    tiles.forEach((tile) => {
      const titleEl = tile.querySelector(".art-heading");
      const descEl = tile.querySelector(".art-description");
      const linkEl = tile.querySelector("a.art-image-a[href], a.link_button[href]");
      const srcImg = tile.querySelector("img.art-imagetile") || tile.querySelector("img");
      const title = clean3(titleEl && titleEl.textContent);
      const href = linkEl ? absUrl6(linkEl.getAttribute("href")) : "";
      const imageCell = [];
      if (srcImg) {
        const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src");
        if (src) {
          const img = document.createElement("img");
          img.src = absUrl6(src);
          img.alt = clean3(srcImg.getAttribute("alt")) || title;
          imageCell.push(img);
        }
      }
      const textCell = [];
      if (title) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          strong.append(a);
        } else {
          strong.textContent = title;
        }
        p.append(strong);
        textCell.push(p);
      }
      const desc = clean3(descEl && descEl.textContent);
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        textCell.push(p);
      }
      if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-insights", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/chevron-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".utility-nav",
        ".header-component"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#country-modal",
        ".modal"
      ]);
      WebImporter.DOMUtils.remove(element, ["#onetrust-consent-sdk"]);
      WebImporter.DOMUtils.remove(element, [
        ".social-sharing__container",
        ".social-sharing__contactUs",
        ".backtotop",
        ".contact-us-button"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#embedded-messaging",
        "#embeddedMessagingSiteContextFrame"
      ]);
      WebImporter.DOMUtils.remove(element, [".footer.footer--default"]);
      WebImporter.DOMUtils.remove(element, [
        ".featured-products .fp-pills",
        ".featured-products .product-category"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#ZN_1TwTgoBfYT3jGVT",
        "#destination_publishing_iframe_chevronlubricants_0",
        '[id^="batBeacon"]',
        "#xaxis_dm_7446577370"
      ]);
      element.querySelectorAll('img[src*="igodigital.com"]').forEach((img) => {
        const wrapper = img.parentElement;
        if (wrapper && wrapper.tagName === "DIV" && wrapper.children.length === 1) wrapper.remove();
        else img.remove();
      });
      element.querySelectorAll("#main-content > .container-fluid > .richtext.parbase .richtext__container").forEach((container) => {
        container.querySelectorAll("p").forEach((p) => {
          const text = p.textContent.replace(/ /g, " ").trim();
          if (!text && !p.querySelector("img, a")) {
            p.remove();
            return;
          }
          const bold = p.querySelector("b, strong");
          if (bold && bold.textContent.trim() === text && !p.querySelector("a, img")) {
            const h2 = element.ownerDocument.createElement("h2");
            h2.textContent = text;
            p.replaceWith(h2);
          }
        });
        container.querySelectorAll("h1, h2, h3").forEach((h) => {
          h.textContent = h.textContent.replace(/ /g, " ").trim();
        });
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [".featured-products .divider"]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript",
        "script",
        "style"
      ]);
      element.querySelectorAll("[onclick], [data-sitekey], [data-callback]").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-sitekey");
        el.removeAttribute("data-callback");
      });
    }
  }

  // tools/importer/transformers/chevron-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === TransformHook2.beforeTransform) {
      const resolved = sections.map((section) => findSectionElement(element, section));
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = resolved[i];
        if (!el || !el.parentNode) continue;
        const styled = !!section.style;
        if (i === 0 && !styled) continue;
        const hr = doc.createElement("hr");
        if (styled) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute("data-excat-first-section", "true");
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === TransformHook2.afterTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (!marker || !marker.parentNode) continue;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        marker.parentNode.insertBefore(metadata, marker.nextSibling);
        if (marker.hasAttribute("data-excat-first-section")) {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER);
        }
      }
    }
  }

  // tools/importer/import-chevron-homepage.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "columns-promo": parse,
    "columns-cta": parse2,
    "cards-industry": parse3,
    "columns-brands": parse4,
    "cards-products": parse5,
    "cards-insights": parse6
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_chevron_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/home" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_chevron_homepage_exports);
})();
