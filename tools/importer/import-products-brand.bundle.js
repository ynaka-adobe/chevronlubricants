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

  // tools/importer/import-products-brand.js
  var import_products_brand_exports = {};
  __export(import_products_brand_exports, {
    default: () => import_products_brand_default
  });

  // tools/importer/parsers/cards-products.js
  var ORIGIN = "https://www.chevronlubricants.com";
  function absUrl(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN).href;
    } catch (e) {
      return url;
    }
  }
  function clean(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function makeImg(document, srcImg, fallbackAlt) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src");
    if (!src) return null;
    const img = document.createElement("img");
    img.src = absUrl(src);
    img.alt = clean(srcImg.getAttribute("alt")).replace(/�/g, "\xAE") || fallbackAlt || "";
    return img;
  }
  function makeLinkPara(document, href, text) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = absUrl(href);
    a.textContent = text;
    p.append(a);
    return p;
  }
  function listingHref(srcLink) {
    const href = absUrl(srcLink.getAttribute("href"));
    if (!href) return "";
    const target = (srcLink.getAttribute("target") || "").toLowerCase();
    return target === "_blank" && !href.includes("#_blank") ? `${href}#_blank` : href;
  }
  function listingLinkPara(document, srcLink, fallbackText) {
    const href = listingHref(srcLink);
    if (!href) return null;
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = clean(srcLink.textContent) || fallbackText || "";
    p.append(a);
    return p;
  }
  function listingTitle(document, href, title) {
    const h3 = document.createElement("h3");
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = title;
      h3.append(a);
    } else {
      h3.textContent = title;
    }
    return h3;
  }
  function listingImg(document, srcEl, alt) {
    if (!srcEl) return null;
    const src = srcEl.getAttribute("data-src") || srcEl.getAttribute("data-bg") || (srcEl.tagName === "IMG" ? srcEl.getAttribute("src") : "");
    if (!src || src.startsWith("data:")) return null;
    const img = document.createElement("img");
    img.src = absUrl(src);
    img.alt = clean(srcEl.getAttribute("alt")).replace(/�/g, "\xAE") || alt || "";
    return img;
  }
  function listingDescription(document, container) {
    if (!container) return null;
    const blocks = [...container.querySelectorAll("p, td")].filter((n) => !n.querySelector("p, td"));
    const sources = blocks.length ? blocks : [container];
    const p = document.createElement("p");
    const appendInline = (node, parent) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === 3) {
          parent.append(document.createTextNode(child.textContent.replace(/[\s ]+/g, " ")));
        } else if (child.nodeType === 1) {
          if (["B", "STRONG"].includes(child.tagName)) {
            const text = clean(child.textContent);
            if (!text) return;
            const strong = document.createElement("strong");
            strong.textContent = text;
            parent.append(strong, document.createTextNode(" "));
          } else if (child.tagName === "BR") {
            parent.append(document.createTextNode(" "));
          } else {
            appendInline(child, parent);
          }
        }
      });
    };
    sources.forEach((src, i) => {
      if (i) p.append(document.createTextNode(" "));
      appendInline(src, p);
    });
    p.normalize();
    [...p.childNodes].forEach((n, i, arr) => {
      if (n.nodeType !== 3) return;
      let t = n.textContent.replace(/ {2,}/g, " ");
      if (i === 0) t = t.replace(/^ /, "");
      if (i === arr.length - 1) t = t.replace(/ $/, "");
      n.textContent = t;
    });
    [...p.childNodes].forEach((n) => {
      if (n.nodeType === 3 && !n.textContent) n.remove();
    });
    return clean(p.textContent) ? p : null;
  }
  function parseListingCarousel(element, document) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const slides = [...element.querySelectorAll("a.slide")].filter((a) => !a.closest(".slick-cloned"));
    slides.forEach((slide) => {
      const href = absUrl(slide.getAttribute("href"));
      const titleEl = slide.querySelector(".product-title");
      const title = titleEl ? clean(titleEl.textContent) : "";
      const key = `${href}|${title}`;
      if (seen.has(key)) return;
      seen.add(key);
      const imageCell = [];
      const teaser = slide.querySelector(".teaser-image");
      const img = listingImg(document, teaser && teaser.getAttribute("data-bg") ? teaser : (teaser || slide).querySelector("img"), title);
      if (img) imageCell.push(img);
      const textCell = [];
      if (title) textCell.push(listingTitle(document, listingHref(slide), title));
      const desc = listingDescription(document, slide.querySelector(".inner__description") || slide.querySelector(".category-heading"));
      if (desc) textCell.push(desc);
      if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
    });
    return cells;
  }
  function parseListingGrid(element, document) {
    const cells = [];
    [...element.querySelectorAll(".product-listing-item")].forEach((item) => {
      const titleLink = item.querySelector(".product-listing-item__title a") || item.querySelector(".product-listing-item__title");
      const title = titleLink ? clean(titleLink.textContent) : "";
      const imageCell = [];
      const badge = listingImg(document, item.querySelector('img.product-listing-item__img-container__isologo, .product-listing-item__img-container [class*="isologo"]'), "ISOCLEAN\xAE Certified Lubricants");
      if (badge) imageCell.push(badge);
      const product = listingImg(document, item.querySelector("img.product-listing-item__img-container__product") || item.querySelector('.product-listing-item__img-container img:not([class*="isologo"])'), title);
      if (product) imageCell.push(product);
      const textCell = [];
      if (title) {
        textCell.push(listingTitle(document, titleLink && titleLink.tagName === "A" ? listingHref(titleLink) : "", title));
      }
      const label = item.querySelector(".product-listing-item__benefits");
      const list = item.querySelector(".product-listing-item__benefits-container ul");
      const items = list ? [...list.querySelectorAll("li")].map((li) => clean(li.textContent)).filter(Boolean) : [];
      if (items.length) {
        const labelText = label ? clean(label.textContent) : "";
        if (labelText) {
          const p = document.createElement("p");
          p.textContent = labelText;
          textCell.push(p);
        }
        const ul = document.createElement("ul");
        items.forEach((text) => {
          const li = document.createElement("li");
          li.textContent = text;
          ul.append(li);
        });
        textCell.push(ul);
      }
      const learn = item.querySelector(".product-listing-category__more a[href]");
      if (learn) {
        const p = listingLinkPara(document, learn, "Learn More");
        if (p) textCell.push(p);
      }
      const buy = item.querySelector(".product-listing-category__buyonline a[href]");
      if (buy) {
        const p = listingLinkPara(document, buy, "Buy online");
        if (p) textCell.push(p);
      }
      if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
    });
    return cells;
  }
  function parse(element, { document }) {
    if (element.matches(".product-listing-list__category-container__items") || !element.querySelector(".product-tile") && element.querySelector(".product-listing-item")) {
      const gridCells = parseListingGrid(element, document);
      const gridBlock = WebImporter.Blocks.createBlock(document, { name: "cards-products", variants: ["grid"], cells: gridCells });
      element.replaceWith(gridBlock);
      return;
    }
    if (!element.querySelector(".product-tile") && element.querySelector("a.slide")) {
      const carouselCells = parseListingCarousel(element, document);
      const carouselBlock = WebImporter.Blocks.createBlock(document, { name: "cards-products", cells: carouselCells });
      element.replaceWith(carouselBlock);
      return;
    }
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
      const title = heading ? clean(heading.textContent) : "";
      const imageCell = [];
      const badge = makeImg(document, badgeWraps[i] && badgeWraps[i].querySelector("img"), "ISOCLEAN Certified Lubricants");
      if (badge) imageCell.push(badge);
      const product = makeImg(document, imageTiles[i] && imageTiles[i].querySelector("img"), title);
      if (product) imageCell.push(product);
      const textCell = [];
      if (heading) {
        const h3 = document.createElement("h3");
        const a = document.createElement("a");
        a.href = absUrl(heading.getAttribute("href"));
        a.textContent = title;
        h3.append(a);
        textCell.push(h3);
      }
      const learn = learnLinks[i];
      if (learn) textCell.push(makeLinkPara(document, learn.getAttribute("href"), clean(learn.textContent) || "Learn More"));
      const cta = ctaLinks[i];
      if (cta) {
        const label = clean(cta.textContent) || (ctaButtons[i] ? clean(ctaButtons[i].textContent) : "") || "Learn More";
        textCell.push(makeLinkPara(document, cta.getAttribute("href"), label));
      }
      const list = lists[i];
      if (list) {
        const ul = document.createElement("ul");
        list.querySelectorAll("li").forEach((srcLi) => {
          const text = clean(srcLi.textContent);
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

  // tools/importer/transformers/chevron-products-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function isProductsTemplate(payload) {
    const name = payload && payload.template && payload.template.name;
    return typeof name === "string" && name.startsWith("products-");
  }
  function cleanText(text) {
    return (text || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function replaceWithHeading(doc, el, level) {
    const h = doc.createElement(`h${level}`);
    h.textContent = cleanText(el.textContent);
    el.replaceWith(h);
    return h;
  }
  function transform(hookName, element, payload) {
    if (!isProductsTemplate(payload)) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".breadcrumb", "nav.breadcrumbs"]);
      element.querySelectorAll(".product-catalog-header").forEach((el) => {
        if (!cleanText(el.textContent) && !el.querySelector("img, picture, video, a[href]")) el.remove();
      });
      element.querySelectorAll(".product-catalog__tagline").forEach((el) => {
        const textEl = el.querySelector(".product-catalog__tagline-text");
        const text = cleanText(textEl ? textEl.textContent : el.textContent.replace(/^\s*\|/, ""));
        if (!text) {
          el.remove();
          return;
        }
        const p = doc.createElement("p");
        p.textContent = text;
        el.replaceWith(p);
      });
      WebImporter.DOMUtils.remove(element, [".slick-cloned", ".slider-wrapper__print"]);
      WebImporter.DOMUtils.remove(element, [
        "li.category-list-item__filter",
        ".countSpecified",
        ".category-mobile"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".pll__filters-modal",
        "#productCategoryModal",
        ".pll__filters",
        ".product-listing-category__seeall",
        ".product-listing-list__back-to-all-products",
        ".product-listing-list__no-results",
        ".product-listing-filter__selected-filters"
      ]);
      element.querySelectorAll(".product-list__rebrand .richtext__container h1").forEach((h1) => {
        h1.textContent = cleanText(h1.textContent);
      });
      element.querySelectorAll(".product-list__rebrand .product-list-rebrand__title").forEach((el) => {
        if (cleanText(el.textContent)) replaceWithHeading(doc, el, 2);
        else el.remove();
      });
      element.querySelectorAll("h1").forEach((h1) => {
        if (!cleanText(h1.textContent)) h1.remove();
      });
      const h1s = [...element.querySelectorAll("h1")];
      h1s.slice(1).forEach((h1) => replaceWithHeading(doc, h1, 2));
      const hasH1 = h1s.length > 0;
      const headers = [...element.querySelectorAll(".pll .product-listing-category__header")];
      headers.forEach((el, i) => {
        if (!cleanText(el.textContent)) {
          el.remove();
          return;
        }
        let level;
        if (i === 0) level = hasH1 ? 2 : 1;
        else level = hasH1 ? 3 : 2;
        replaceWithHeading(doc, el, level);
      });
    }
  }

  // tools/importer/transformers/chevron-expertise-cleanup.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var ORIGIN2 = "https://www.chevronlubricants.com";
  var FIND_DISTRIBUTOR = `${ORIGIN2}/en_us/home/where-to-buy/find-a-distributor.html`;
  var KEEP_ABSOLUTE = "data-excat-keep-absolute";
  var FORM_LINKS = {
    "/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html": {
      href: `${ORIGIN2}/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html`,
      text: "Fill out the contact form"
    }
  };
  var DEFAULT_FORM_LINK = { href: `${ORIGIN2}/en_us/home/contact-us.html`, text: "Contact us" };
  var H1_OVERRIDES = {
    "/en_us/home/learning/about-our-brands/industrial-products/industrial-products-faqs.html": "Industrial Products FAQs"
  };
  var HEADINGS = "h1, h2, h3, h4, h5, h6";
  function isExpertise(payload) {
    const name = payload && payload.template && payload.template.name;
    return typeof name === "string" && name.startsWith("expertise-");
  }
  function cleanText2(text) {
    return (text || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function hasMedia(el) {
    return !!el.querySelector("img, picture, video, iframe, svg");
  }
  function isEmpty(el) {
    return !cleanText2(el.textContent) && !hasMedia(el);
  }
  function inTable(el) {
    return !!(el.closest && el.closest("table"));
  }
  function pagePath(payload) {
    const params = payload && payload.params || {};
    for (const c of [params.originalURL, payload && payload.url]) {
      if (!c) continue;
      try {
        const u = new URL(c);
        if (/chevronlubricants\.com$/.test(u.hostname)) return u.pathname.toLowerCase();
      } catch (e) {
      }
    }
    return "";
  }
  function edsPath(pathname) {
    let p = pathname.replace(/\/+$/, "").replace(/\.html?$/i, "").replace(/^\/en_us\/home(?=\/|$)/i, "");
    if (!p) return "/home";
    return p.replace(/_/g, "-").toLowerCase();
  }
  function slugBase(text) {
    const t = (text || "").replace(/[ \t\n\r\f]+/g, " ").trim();
    return t.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "").replace(/ /g, "-");
  }
  function moveChildren(from, to) {
    while (from.firstChild) to.appendChild(from.firstChild);
  }
  function trimEdges(el) {
    const strip = (node, start) => {
      while (node) {
        const n = start ? node.firstChild : node.lastChild;
        if (!n) return;
        if (n.nodeType === 3) {
          const t = start ? n.textContent.replace(/^[\s ]+/, "") : n.textContent.replace(/[\s ]+$/, "");
          if (!t) {
            n.remove();
            continue;
          }
          n.textContent = t;
          return;
        }
        if (n.nodeType === 1 && n.tagName === "BR") {
          n.remove();
          continue;
        }
        return;
      }
    };
    strip(el, true);
    strip(el, false);
  }
  function stripAttributes(el) {
    [el, ...el.querySelectorAll("*")].forEach((n) => {
      [...n.attributes].forEach((a) => {
        if (!["href", "src", "alt", "title", "style"].includes(a.name)) n.removeAttribute(a.name);
      });
    });
  }
  function retag(doc, el, tag) {
    const n = doc.createElement(tag);
    moveChildren(el, n);
    if (el.getAttribute("style")) n.setAttribute("style", el.getAttribute("style"));
    el.replaceWith(n);
    return n;
  }
  function convertDistributors(element, doc) {
    element.querySelectorAll(".distributor").forEach((d) => {
      if (inTable(d)) return;
      const text = cleanText2((d.querySelector(".distributor__text-block") || d).textContent);
      const link = d.querySelector('.distributor__input__container a[href], a[href*="find-a-distributor"]');
      let href = FIND_DISTRIBUTOR;
      if (link) {
        try {
          href = new URL(link.getAttribute("href"), ORIGIN2).href;
        } catch (e) {
        }
      }
      const nodes = [];
      if (text) {
        const p = doc.createElement("p");
        p.textContent = text;
        nodes.push(p);
      }
      const p2 = doc.createElement("p");
      const a = doc.createElement("a");
      a.setAttribute("href", href);
      a.textContent = "Find a distributor";
      p2.appendChild(a);
      nodes.push(p2);
      d.replaceWith(...nodes);
    });
  }
  function convertForms(element, doc, path) {
    const target = FORM_LINKS[path] || DEFAULT_FORM_LINK;
    const forms = [...element.querySelectorAll(".salesforce-embed-component")];
    if (forms.length) {
      element.querySelectorAll(`p, ${HEADINGS}`).forEach((el) => {
        if (!inTable(el) && /^\*\s*indicates required fields?\.?$/i.test(cleanText2(el.textContent))) el.remove();
      });
    }
    forms.forEach((f) => {
      const p = doc.createElement("p");
      const a = doc.createElement("a");
      a.setAttribute("href", target.href);
      if (FORM_LINKS[path]) a.setAttribute(KEEP_ABSOLUTE, "true");
      a.textContent = target.text;
      p.appendChild(a);
      f.replaceWith(p);
    });
  }
  function convertVideos(element, doc) {
    element.querySelectorAll(".video").forEach((v) => {
      if (inTable(v)) return;
      const holder = v.querySelector("[data-video-src]");
      const src = holder && holder.getAttribute("data-video-src");
      if (!src) {
        if (isEmpty(v)) v.remove();
        return;
      }
      const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/);
      let href;
      if (m) href = `https://www.youtube.com/watch?v=${m[1]}`;
      else {
        try {
          href = new URL(src, ORIGIN2).href;
        } catch (e) {
          href = src;
        }
      }
      const label = cleanText2(v.textContent);
      const textLink = holder.classList.contains("video__container-textlink") && label;
      if (textLink && m) href += "#_dnb";
      const p = doc.createElement("p");
      const a = doc.createElement("a");
      a.setAttribute("href", href);
      a.textContent = textLink ? label : href;
      p.appendChild(a);
      v.replaceWith(p);
    });
  }
  function isSentence(text) {
    return /[.?!]\s*$/.test(text) || text.split(" ").length > 10;
  }
  function convertTitles(element, doc) {
    element.querySelectorAll(".title").forEach((t) => {
      if (inTable(t) || !t.parentNode) return;
      const nodes = [];
      const main = t.querySelector(".section-heading");
      if (main && cleanText2(main.textContent)) {
        const level = main.tagName === "H1" ? "h1" : "h2";
        const h = doc.createElement(level);
        const span = main.children.length === 1 && main.firstElementChild.tagName === "SPAN" ? main.firstElementChild : main;
        moveChildren(span, h);
        stripAttributes(h);
        trimEdges(h);
        nodes.push(h);
      }
      const sub = t.querySelector(".sub-heading");
      if (sub && cleanText2(sub.textContent)) {
        const text = cleanText2(sub.textContent);
        const n = doc.createElement(isSentence(text) ? "p" : "h3");
        moveChildren(sub, n);
        stripAttributes(n);
        trimEdges(n);
        nodes.push(n);
      }
      if (!main && !sub) {
        t.querySelectorAll(HEADINGS).forEach((h) => {
          if (cleanText2(h.textContent)) nodes.push(h);
        });
      }
      t.replaceWith(...nodes);
    });
  }
  function convertDisplayParagraphs(element, doc) {
    element.querySelectorAll("#main-content > .container-fluid > .richtext .richtext__container").forEach((c) => {
      const size = c.querySelector(":scope > div");
      if (!size || !["p1", "h1", "h2"].some((k) => size.classList.contains(k))) return;
      const ps = [...c.querySelectorAll("p")].filter((p2) => cleanText2(p2.textContent));
      if (ps.length !== 1 || c.querySelector(HEADINGS)) return;
      const p = ps[0];
      const text = cleanText2(p.textContent);
      if (p.querySelector("a, img") || text.split(" ").length > 12) return;
      retag(doc, p, "h2");
    });
  }
  function removeEmptyParagraphs(element) {
    element.querySelectorAll("#main-content p").forEach((p) => {
      if (!inTable(p) && isEmpty(p) && !p.querySelector("a")) p.remove();
    });
  }
  function removeEmptyHeadings(element) {
    element.querySelectorAll(HEADINGS).forEach((h) => {
      if (!cleanText2(h.textContent) && !hasMedia(h)) h.remove();
    });
  }
  function mergeSplitH1s(element, doc) {
    element.querySelectorAll("h1").forEach((h) => {
      if (!h.parentNode) return;
      let next = h.nextSibling;
      while (next && (next.nodeType === 3 && !cleanText2(next.textContent) || next.nodeType === 1 && next.tagName === "BR")) next = next.nextSibling;
      if (!next || next.nodeType !== 1 || next.tagName !== "H1") return;
      const a = cleanText2(h.textContent);
      const b = cleanText2(next.textContent);
      if (!a || !b || /[.?!:]$/.test(a) || h.querySelector("a") || next.querySelector("a") || b.length > 60) return;
      trimEdges(h);
      trimEdges(next);
      h.appendChild(doc.createTextNode(" "));
      moveChildren(next, h);
      next.remove();
    });
  }
  function normalizeH1(element, doc, path) {
    const all = [...element.querySelectorAll(HEADINGS)];
    if (!all.length) return;
    let chosen = null;
    const override = H1_OVERRIDES[path];
    if (override) chosen = all.find((h) => cleanText2(h.textContent) === override) || null;
    const h1s = all.filter((h) => h.tagName === "H1");
    if (!chosen) chosen = h1s.find((h) => !inTable(h)) || h1s[0] || all[0];
    h1s.forEach((h) => {
      if (h !== chosen) retag(doc, h, "h2");
    });
    if (chosen.tagName !== "H1") retag(doc, chosen, "h1");
  }
  function isSkippable(n) {
    if (n.nodeType !== 1) return true;
    if (n.tagName === "HR") return true;
    if (n.matches(".divider, .anchor-tag")) return true;
    return isEmpty(n);
  }
  function findAnchorTarget(anchor) {
    let prev = anchor.previousSibling;
    while (prev && isSkippable(prev)) prev = prev.previousSibling;
    if (prev && prev.nodeType === 1 && prev.matches(HEADINGS)) return prev;
    let next = anchor.nextSibling;
    for (let seen = 0; next && seen < 3; next = next.nextSibling) {
      if (isSkippable(next)) continue;
      seen += 1;
      if (next.matches(HEADINGS)) return next;
      const h = next.querySelector(HEADINGS);
      if (h) return h;
    }
    return null;
  }
  function retargetAnchors(element, path) {
    const anchors = [...element.querySelectorAll(".anchor-tag")];
    if (!anchors.length) return;
    const seen = /* @__PURE__ */ Object.create(null);
    const slugOf = /* @__PURE__ */ new Map();
    element.querySelectorAll(HEADINGS).forEach((h) => {
      const base = slugBase(h.textContent);
      let s = base;
      while (Object.prototype.hasOwnProperty.call(seen, s)) {
        seen[base] += 1;
        s = `${base}-${seen[base]}`;
      }
      seen[s] = 0;
      slugOf.set(h, s);
    });
    const map = {};
    anchors.forEach((anchor) => {
      const ids = [anchor.id, ...[...anchor.querySelectorAll("[id]")].map((e) => e.id)].filter(Boolean);
      if (!ids.length) return;
      const target = findAnchorTarget(anchor);
      if (!target || !slugOf.get(target)) {
        console.warn(`[chevron-expertise-cleanup] no heading for anchor #${ids.join(", #")}; jump links unchanged`);
        return;
      }
      const slug = slugOf.get(target);
      target.id = slug;
      ids.forEach((id) => {
        map[id] = slug;
      });
    });
    const own = path ? [path.replace(/\/+$/, ""), edsPath(path)] : [];
    element.querySelectorAll('a[href*="#"]').forEach((a) => {
      const href = a.getAttribute("href");
      const i = href.indexOf("#");
      const before = href.slice(0, i);
      const hash = href.slice(i + 1);
      if (!Object.prototype.hasOwnProperty.call(map, hash)) return;
      let samePage = !before;
      if (!samePage) {
        try {
          const p = new URL(before, ORIGIN2).pathname.toLowerCase().replace(/\/+$/, "");
          samePage = own.includes(p);
        } catch (e) {
        }
      }
      if (samePage) a.setAttribute("href", `#${map[hash]}`);
    });
  }
  function removeNonContent(element) {
    WebImporter.DOMUtils.remove(element, [".anchor-tag"]);
    element.querySelectorAll(".divider").forEach((d) => {
      if (!inTable(d)) d.remove();
    });
    element.querySelectorAll(".multi-column__item").forEach((item) => {
      if (!inTable(item) && isEmpty(item)) item.remove();
    });
    element.querySelectorAll(".simple-panel, .row.product-list-component, .multi-column").forEach((el) => {
      if (!inTable(el) && el.parentNode && isEmpty(el)) el.remove();
    });
  }
  function removeMobileRenditions(element) {
    element.querySelectorAll(".cl-adaptive-image").forEach((wrap) => {
      if (inTable(wrap) || !wrap.querySelector("img.mobile-only-hidden")) return;
      wrap.querySelectorAll("img.tablet-up-hidden").forEach((img) => img.remove());
    });
  }
  function unwrapContainers(element) {
    element.querySelectorAll(".multi-column, .simple-panel").forEach((el) => {
      if (inTable(el) || !el.parentNode) return;
      el.replaceWith(...el.childNodes);
    });
  }
  function transform2(hookName, element, payload) {
    if (!isExpertise(payload)) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === TransformHook2.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".breadcrumb", "nav.breadcrumbs"]);
      WebImporter.DOMUtils.remove(element, [".slick-cloned", ".slider-wrapper__print"]);
      element.querySelectorAll(".drawer img.commons-adaptive-image.mobile-only-hidden").forEach((img) => {
        const pair = img.parentElement && img.parentElement.querySelector("img.commons-adaptive-image.tablet-up-hidden");
        const damSrc = pair && (pair.getAttribute("src") || "");
        if (damSrc.startsWith("/content/dam/") && /adaptive_image\.img\./.test(img.getAttribute("src") || "")) {
          img.setAttribute("src", damSrc);
        }
      });
    }
    if (hookName === TransformHook2.afterTransform) {
      const path = pagePath(payload);
      convertDistributors(element, doc);
      convertForms(element, doc, path);
      convertVideos(element, doc);
      convertTitles(element, doc);
      convertDisplayParagraphs(element, doc);
      removeEmptyParagraphs(element);
      removeEmptyHeadings(element);
      mergeSplitH1s(element, doc);
      normalizeH1(element, doc, path);
      retargetAnchors(element, path);
      removeNonContent(element);
      removeMobileRenditions(element);
      unwrapContainers(element);
    }
  }

  // tools/importer/transformers/chevron-cleanup.js
  var TransformHook3 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform3(hookName, element, payload) {
    if (hookName === TransformHook3.beforeTransform) {
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
            const templateName = payload && payload.template && payload.template.name || "";
            if (templateName.startsWith("expertise-") && p.getAttribute("style")) {
              h2.setAttribute("style", p.getAttribute("style"));
            }
            p.replaceWith(h2);
          }
        });
        container.querySelectorAll("h1, h2, h3").forEach((h) => {
          h.textContent = h.textContent.replace(/ /g, " ").trim();
        });
      });
    }
    if (hookName === TransformHook3.afterTransform) {
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

  // tools/importer/transformers/chevron-expertise-sections.js
  var TransformHook4 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var MARKER = "data-excat-section-id";
  var STYLE_ATTR = "data-excat-section-style";
  var FIRST_ATTR = "data-excat-first-section";
  var ROOT = "#main-content > .container-fluid";
  var SKIP = [
    ".divider",
    ".anchor-tag",
    ".simple-panel:not(:has(> .row > .container-fluid > div > *))",
    ".row.product-list-component:not(:has(.slider-wrapper))"
  ];
  var BAND_SELECTORS = [
    ":scope > .multi-column__container[data-bg-color]",
    // fallback for captures without data-bg-color (raw / cleaned HTML keep the class)
    ":scope > .multi-column__container",
    ":scope > .richtext__container",
    ":scope > .row.panel-background",
    ".distributor__container",
    ".social-media__container",
    ".panel-with-button__container",
    ".testimonial__container",
    ".drawer__content",
    ".knowledge-center__container",
    ".square-carousel__container",
    ".product-list .list-wrapper"
  ];
  var CLASS_TO_STYLE = {
    "bg-light-gray": "grey-bg",
    "bg-blue": "cobalt-blue-bg",
    "bg-delo": "cobalt-blue-bg",
    "bg-strong-blue": "blue-bg",
    "bg-isoclean": "sky-blue-bg",
    "bg-black": "black-bg",
    "bg-blue-2": "teal-blue-bg",
    "bg-white": null,
    "bg-transparent": null,
    defaultBackground: null
  };
  var OVERRIDES = [
    { unit: ".row.product-list-component", band: ".product-list .list-wrapper.bg-light-gray", style: "grey-gradient" },
    { unit: ".panel-with-button", band: ".panel-with-button__container.defaultBackground", style: "blue-bg" },
    { unit: ".testimonial", band: ".testimonial__container", style: "grey-bg" }
  ];
  var COMPONENTS = ".title, .richtext, .cmp-image, .button, .distributor";
  function isExpertise2(payload) {
    const name = payload && payload.template && payload.template.name;
    return typeof name === "string" && name.startsWith("expertise-");
  }
  function safeMatches(el, sel) {
    try {
      return el.matches(sel);
    } catch (e) {
      return false;
    }
  }
  function safeQuery(el, sel) {
    try {
      return el.querySelector(sel);
    } catch (e) {
      return null;
    }
  }
  function bgToken(el) {
    const attr = (el.getAttribute("data-bg-color") || "").trim();
    if (attr) return attr;
    return [...el.classList].find((c) => c.startsWith("bg-") || c === "defaultBackground") || null;
  }
  function bgStyle(unit) {
    for (const o of OVERRIDES) {
      if (safeMatches(unit, o.unit) && safeQuery(unit, o.band)) return o.style;
    }
    for (const sel of BAND_SELECTORS) {
      const band = safeQuery(unit, sel);
      if (band) {
        const tok = bgToken(band);
        return tok && Object.prototype.hasOwnProperty.call(CLASS_TO_STYLE, tok) ? CLASS_TO_STYLE[tok] : null;
      }
    }
    return null;
  }
  function blockElements(element, template) {
    const els = [];
    (template && template.blocks || []).forEach((b) => (b.instances || []).forEach((sel) => {
      try {
        element.querySelectorAll(sel).forEach((el) => els.push(el));
      } catch (e) {
      }
    }));
    return els;
  }
  function hasText(el) {
    return (el.textContent || "").replace(/ /g, " ").trim().length > 0;
  }
  function isCentred(comp) {
    if (comp.matches(".distributor")) return true;
    if (comp.matches(".title")) {
      const h = comp.querySelector(".section-heading");
      if (!h) return hasText(comp) ? false : null;
      return h.classList.contains("Center");
    }
    if (comp.matches(".richtext")) {
      const texts = [...comp.querySelectorAll("p, h1, h2, h3, h4, h5, h6")].filter(hasText);
      if (!texts.length) return null;
      return texts.every((t) => {
        for (let n = t; n && n !== comp.parentElement; n = n.parentElement) {
          if (n.style && n.style.textAlign === "center") return true;
        }
        return false;
      });
    }
    if (comp.matches(".cmp-image")) {
      return !!comp.querySelector(":scope > .cl-adaptive-image.imageAlignedCenter");
    }
    if (comp.matches(".button")) {
      return !!comp.querySelector(".btn-wrapper.btn-align-center");
    }
    return null;
  }
  function defaultComponents(unit, blocks) {
    const inBlock = (el) => blocks.some((b) => b === el || b.contains(el));
    if (inBlock(unit)) return [];
    if (unit.matches(COMPONENTS)) return [unit];
    return [...unit.querySelectorAll(COMPONENTS)].filter((c) => {
      if (inBlock(c)) return false;
      const outer = c.parentElement && c.parentElement.closest(COMPONENTS);
      return !(outer && unit.contains(outer));
    });
  }
  function resolveGroups(element, template) {
    const root = element.querySelector(ROOT);
    if (!root) return [];
    const blocks = blockElements(element, template);
    const units = [...root.children].filter((u) => u.tagName !== "HR" && !SKIP.some((s) => safeMatches(u, s)));
    const groups = [];
    units.forEach((u) => {
      const bg = bgStyle(u);
      if (!groups.length || groups[groups.length - 1].bg !== bg) groups.push({ bg, units: [] });
      groups[groups.length - 1].units.push(u);
    });
    groups.forEach((g) => {
      const states = [];
      g.units.forEach((u) => defaultComponents(u, blocks).forEach((c) => {
        const s = isCentred(c);
        if (s !== null) states.push(s);
      }));
      const centred = states.length > 0 && states.every(Boolean);
      g.style = [g.bg, centred ? "centered" : null].filter(Boolean).join(", ") || null;
    });
    return groups;
  }
  function transform4(hookName, element, payload) {
    if (!isExpertise2(payload)) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === TransformHook4.beforeTransform) {
      const groups = resolveGroups(element, payload.template);
      for (let i = groups.length - 1; i >= 0; i -= 1) {
        const g = groups[i];
        const first = g.units[0];
        if (!first || !first.parentNode) continue;
        if (i === 0 && !g.style) continue;
        const hr = doc.createElement("hr");
        if (g.style) {
          hr.setAttribute(MARKER, `g${i + 1}`);
          hr.setAttribute(STYLE_ATTR, g.style);
        }
        if (i === 0) hr.setAttribute(FIRST_ATTR, "true");
        first.parentNode.insertBefore(hr, first);
      }
    }
    if (hookName === TransformHook4.afterTransform) {
      const markers = [...element.querySelectorAll(`hr[${MARKER}]`)].reverse();
      markers.forEach((marker) => {
        const style = marker.getAttribute(STYLE_ATTR);
        if (style && marker.parentNode) {
          const metadata = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style }
          });
          marker.parentNode.insertBefore(metadata, marker.nextSibling);
        }
        if (marker.hasAttribute(FIRST_ATTR)) {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER);
          marker.removeAttribute(STYLE_ATTR);
        }
      });
    }
  }

  // tools/importer/transformers/chevron-links.js
  var TransformHook5 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var ORIGIN3 = "https://www.chevronlubricants.com";
  var SOURCE_HOSTS = ["www.chevronlubricants.com", "chevronlubricants.com", "author-prod.chevronlubricants.com"];
  var PROXY_HOSTS = ["localhost", "127.0.0.1"];
  var KEEP_ABSOLUTE2 = "data-excat-keep-absolute";
  var MIGRATED = {
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
  var DNB_BLOCKS = ["cards-resource", "quote-testimonial", "cards-filterable", "columns-media"];
  var DNB_THUMBNAIL_BLOCKS = [];
  function pathKey(pathname) {
    let p = pathname;
    try {
      p = decodeURI(pathname);
    } catch (e) {
    }
    return p.replace(/\/+$/, "").toLowerCase() || "/";
  }
  function baseUrl(payload) {
    const params = payload && payload.params || {};
    const candidates = [params.originalURL, payload && payload.url];
    for (const c of candidates) {
      if (!c) continue;
      try {
        const u = new URL(c);
        if (SOURCE_HOSTS.includes(u.hostname)) return u.href;
      } catch (e) {
      }
    }
    return `${ORIGIN3}/`;
  }
  function rewriteLinks(element, payload) {
    const base = baseUrl(payload);
    element.querySelectorAll("a[href]").forEach((a) => {
      const raw = (a.getAttribute("href") || "").trim();
      const keepAbsolute = a.hasAttribute(KEEP_ABSOLUTE2);
      a.removeAttribute(KEEP_ABSOLUTE2);
      if (!raw || raw.startsWith("#")) return;
      if (/^(mailto|tel|sms|javascript|data|blob):/i.test(raw)) return;
      if (raw.startsWith("/") && !raw.startsWith("//") && !/^\/(en_us|content|etc|bin)(\/|$)/i.test(raw)) return;
      let u;
      try {
        u = new URL(raw, base);
      } catch (e) {
        return;
      }
      if (!/^https?:$/.test(u.protocol)) return;
      if (!SOURCE_HOSTS.includes(u.hostname) && !PROXY_HOSTS.includes(u.hostname)) return;
      const pathname = u.pathname.replace(/^\/editor\.html(?=\/)/, "").replace(/^\/content\/chevron-lubricants(?=\/en_us\/)/, "");
      const mapped = keepAbsolute ? null : MIGRATED[pathKey(pathname)];
      const next = mapped ? `${mapped}${u.hash}` : `${ORIGIN3}${pathname}${u.search}${u.hash}`;
      if (next !== raw) a.setAttribute("href", next);
    });
  }
  function blockName(table) {
    const firstRow = table.querySelector("tr");
    const cell = firstRow && firstRow.querySelector("th, td");
    if (!cell) return "";
    return cell.textContent.split("(")[0].trim().toLowerCase().replace(/\s+/g, "-");
  }
  function parseYouTube(href) {
    try {
      const u = new URL(href, ORIGIN3);
      const host = u.hostname.replace(/^(www|m)\./, "");
      if (host === "youtu.be") return { video: true, url: `https://youtu.be${u.pathname}${u.search}` };
      if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
      if (u.pathname === "/watch") return { video: true, url: `https://www.youtube.com/watch${u.search}` };
      const embed = u.pathname.match(/^\/embed\/([\w-]+)/);
      if (embed) return { video: true, url: `https://www.youtube.com/watch?v=${embed[1]}` };
      return { video: false, url: `https://www.youtube.com${u.pathname}${u.search}` };
    } catch (e) {
      return null;
    }
  }
  function addDnb(a, { videosOnly = true } = {}) {
    const href = a.getAttribute("href") || "";
    if (href.includes("#_dnb")) return;
    const yt = parseYouTube(href);
    if (!yt || videosOnly && !yt.video) return;
    a.setAttribute("href", `${yt.url}#_dnb`);
  }
  function markYouTubeLinks(element) {
    element.querySelectorAll("a[href]").forEach((a) => {
      const yt = parseYouTube(a.getAttribute("href") || "");
      if (yt && !yt.video) addDnb(a, { videosOnly: false });
    });
    element.querySelectorAll("table").forEach((table) => {
      const name = blockName(table);
      if (DNB_BLOCKS.includes(name)) {
        table.querySelectorAll("a[href]").forEach(addDnb);
      } else if (DNB_THUMBNAIL_BLOCKS.includes(name)) {
        table.querySelectorAll("a[href]").forEach((a) => {
          const cell = a.closest("td, th");
          if (a.querySelector("img, picture") || cell && cell.querySelector("img, picture")) addDnb(a);
        });
      }
    });
  }
  function transform5(hookName, element, payload) {
    if (hookName !== TransformHook5.afterTransform) return;
    rewriteLinks(element, payload);
    const name = payload && payload.template && payload.template.name;
    if (name !== "chevron-homepage") markYouTubeLinks(element);
  }

  // tools/importer/transformers/chevron-sections.js
  var TransformHook6 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var MARKER2 = "data-excat-section-id";
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
  function transform6(hookName, element, payload) {
    const templateName = payload && payload.template && payload.template.name || "";
    if (templateName.startsWith("expertise-")) return;
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === TransformHook6.beforeTransform) {
      const resolved = sections.map((section) => findSectionElement(element, section));
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = resolved[i];
        if (!el || !el.parentNode) continue;
        const styled = !!section.style;
        if (i === 0 && !styled) continue;
        const hr = doc.createElement("hr");
        if (styled) hr.setAttribute(MARKER2, section.id);
        if (i === 0) hr.setAttribute("data-excat-first-section", "true");
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === TransformHook6.afterTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER2}="${section.id}"]`);
        if (!marker || !marker.parentNode) continue;
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        marker.parentNode.insertBefore(metadata, marker.nextSibling);
        if (marker.hasAttribute("data-excat-first-section")) {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER2);
        }
      }
    }
  }

  // tools/importer/import-products-brand.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "cards-products": parse
  };
  var transformers = [transform, transform2, transform3, transform4, transform5, transform6];
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
  var import_products_brand_default = {
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
      const path = WebImporter.FileUtils.sanitizePath((rawPath === "" ? "/en_us/home" : rawPath).toLowerCase());
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_products_brand_exports);
})();
