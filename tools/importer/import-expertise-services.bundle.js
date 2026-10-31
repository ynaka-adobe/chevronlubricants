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

  // tools/importer/import-expertise-services.js
  var import_expertise_services_exports = {};
  __export(import_expertise_services_exports, {
    default: () => import_expertise_services_default
  });

  // tools/importer/parsers/checklist.js
  var ORIGIN = "https://www.chevronlubricants.com";
  function abs(url) {
    try {
      return new URL(url, ORIGIN).href;
    } catch (e) {
      return url;
    }
  }
  function clean(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function inlineHtml(document, from, to) {
    const parts = [...from.querySelectorAll(":scope > p")];
    const sources = parts.length ? parts : [from];
    sources.forEach((src, i) => {
      if (i > 0) to.append(document.createElement("br"));
      [...src.childNodes].forEach((n) => to.append(n.cloneNode(true)));
    });
  }
  function makeImg(document, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) return null;
    const img = document.createElement("img");
    img.src = abs(src);
    img.alt = clean(srcImg.getAttribute("alt"));
    return img;
  }
  function imageCell(document, cmp) {
    const img = makeImg(document, cmp.querySelector("img.mobile-only-hidden") || cmp.querySelector("img"));
    if (!img) return [];
    const link3 = cmp.querySelector("a[href]");
    const p = document.createElement("p");
    if (link3) {
      const a = document.createElement("a");
      a.href = abs(link3.getAttribute("href"));
      a.append(img);
      p.append(a);
    } else {
      p.append(img);
    }
    return [p];
  }
  function buttonCell(document, button) {
    const link3 = button.querySelector("a[href]");
    if (!link3 || !clean(link3.textContent)) return [];
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    const a = document.createElement("a");
    a.href = abs(link3.getAttribute("href"));
    a.textContent = clean(link3.textContent);
    const red = /bg-havoline|bg-red/.test(link3.className);
    if (red) {
      const em = document.createElement("em");
      em.append(a);
      strong.append(em);
    } else {
      strong.append(a);
    }
    p.append(strong);
    return [p];
  }
  function heading(document, text) {
    const h = document.createElement("h3");
    h.textContent = text;
    return h;
  }
  function para(document, text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function listOf(document, items4) {
    const ul = document.createElement("ul");
    items4.forEach((item) => {
      var _a;
      const title = clean((_a = item.querySelector(":scope > .title")) == null ? void 0 : _a.textContent);
      const textEl = item.querySelector(":scope > .text");
      const hasText2 = textEl && clean(textEl.textContent);
      if (!title && !hasText2) return;
      const li = document.createElement("li");
      if (title) {
        const strong = document.createElement("strong");
        strong.textContent = title;
        li.append(strong);
        if (hasText2) li.append(document.createElement("br"));
      }
      if (hasText2) inlineHtml(document, textEl, li);
      ul.append(li);
    });
    return ul.children.length ? ul : null;
  }
  function checkListCell(document, cl) {
    var _a, _b;
    const nodes = [];
    const title = clean((_a = cl.querySelector(".check-list__title")) == null ? void 0 : _a.textContent);
    if (title) nodes.push(heading(document, title));
    const subtitle = clean((_b = cl.querySelector(".check-list__subtitle")) == null ? void 0 : _b.textContent);
    if (subtitle) nodes.push(para(document, subtitle));
    const ul = listOf(document, [...cl.querySelectorAll(".check-list__list .item, .check-list__list--hidden .item")]);
    if (ul) nodes.push(ul);
    return nodes;
  }
  function isGrey(container) {
    if (!container) return false;
    if (container.classList.contains("bg-light-gray")) return true;
    const view = container.ownerDocument.defaultView;
    return !!view && view.getComputedStyle(container).backgroundColor === "rgb(245, 245, 245)";
  }
  function variantsOf(els) {
    const check = els.some((el) => el.querySelector(".item--check") || el.classList.contains("image-check-list"));
    const grey = els.some((el) => el.classList.contains("image-check-list") || isGrey(el.querySelector(".check-list__container")));
    return [check ? "check" : "bullet", grey ? "grey" : ""].filter(Boolean);
  }
  function parseImageCheckList(element, document) {
    var _a;
    const content = element.querySelector(".image-check-list__content") || element;
    const rows = [];
    const intro = [];
    const title = clean((_a = content.querySelector(".image-check-list__title")) == null ? void 0 : _a.textContent);
    if (title) intro.push(heading(document, title));
    const subtitles = [...content.querySelectorAll(":scope > .image-check-list__subtitle")].map((s) => clean(s.textContent)).filter(Boolean);
    if (subtitles[0]) intro.push(para(document, subtitles[0]));
    if (intro.length) rows.push([intro]);
    const cards = [...content.querySelectorAll(".image-check-list__card")].map((card) => {
      var _a2;
      const img = makeImg(document, card.querySelector("img"));
      const caption = clean((_a2 = card.querySelector(".image-check-list__card__text")) == null ? void 0 : _a2.textContent);
      const cell = [];
      if (img) {
        const p = document.createElement("p");
        p.append(img);
        cell.push(p);
      }
      if (caption) cell.push(para(document, caption));
      return cell;
    }).filter((c) => c.length);
    if (cards.length) rows.push(cards);
    const listCell = [];
    if (subtitles[1]) listCell.push(para(document, subtitles[1]));
    const ul = listOf(document, [...content.querySelectorAll(".image-check-list__item")]);
    if (ul) listCell.push(ul);
    if (listCell.length) rows.push([listCell]);
    return rows;
  }
  function parse(element, { document }) {
    let rows;
    let sources;
    if (element.classList.contains("image-check-list")) {
      rows = parseImageCheckList(element, document);
      sources = [element];
    } else if (element.classList.contains("check-list")) {
      rows = [[checkListCell(document, element)]];
      sources = [element];
    } else {
      const items4 = [...element.querySelectorAll(":scope > .multi-column__container > .multi-column__content > .multi-column__item")];
      const cells = items4.map((it) => [...it.children].flatMap((c) => {
        if (c.matches(".check-list")) return checkListCell(document, c);
        if (c.matches(".cmp-image, .cmp")) return imageCell(document, c);
        if (c.matches(".button")) return buttonCell(document, c);
        return [];
      })).filter((c) => c.length);
      rows = [cells];
      sources = [...element.querySelectorAll(".check-list")];
    }
    rows = rows.filter((r) => r.length && r.some((c) => c.length));
    if (!rows.length) return;
    const variants = variantsOf(sources);
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "checklist", variants, cells: rows }));
  }

  // tools/importer/parsers/stats-carousel.js
  function clean2(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function parse2(element, { document }) {
    const cells = [...element.querySelectorAll(".slider-item")].filter((item) => !item.closest(".slick-cloned")).map((item) => {
      var _a, _b;
      return [
        clean2((_a = item.querySelector(".c100 > span, .article-hero-carousel-component__wrapper")) == null ? void 0 : _a.textContent),
        clean2((_b = item.querySelector(".article-hero-carousel-component__caption")) == null ? void 0 : _b.textContent)
      ];
    }).filter(([value, caption]) => value || caption);
    if (!cells.length) return;
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "stats-carousel", cells }));
  }

  // tools/importer/parsers/tool-embed.js
  var TITLES = [
    [/ewp\.earlweb\.net/, "Chevron products selector"],
    [/delosmartchoice\.com/, "Delo SmartChoice Advisor"],
    [/delocalculator\.com\/benchmark/, "Delo benchmark calculator"],
    [/delocalculator\.com\/freezepoint/, "Antifreeze concentration calculator"],
    [/delocalculator\.com\/lubricationassessment/, "On-site lubrication assessment"],
    [/delocalculator\.com\/?$/, "Delo fuel economy calculator"]
  ];
  function cleanUrl(src) {
    const url = new URL(src.startsWith("//") ? `https:${src}` : src);
    url.searchParams.delete("_ga");
    return url.href.replace(/\?$/, "");
  }
  function link(document, href) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    return a;
  }
  function parse3(element, { document }) {
    const iframe = element.querySelector("iframe[src], iframe[data-src]");
    const src = iframe && (iframe.getAttribute("src") || iframe.getAttribute("data-src"));
    if (!src || !/^(https?:)?\/\//.test(src)) {
      element.remove();
      return;
    }
    const url = cleanUrl(src);
    const match = TITLES.find(([re]) => re.test(url));
    const h1 = document.querySelector("h1");
    const title = match && match[1] || h1 && h1.textContent.trim() || "";
    const cells = [["URL", link(document, url)]];
    if (title) cells.push(["Title", title]);
    const width = iframe.getAttribute("width");
    const height = iframe.getAttribute("height");
    if (width && /^\d+$/.test(width)) cells.push(["Width", width]);
    if (height && /^\d+$/.test(height)) cells.push(["Height", height]);
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "tool-embed", cells }));
  }

  // tools/importer/parsers/isoclean-calculator.js
  var ORIGIN2 = "https://www.chevronlubricants.com";
  var DATA = "/en-us/home/services/self-services/industrial-machinery/isoclean-calculator-data.json";
  var INTRO = "The ISO Cleanliness Code below has been estimated for your equipment. This is an estimate based on general equipment. We recommend you follow your Equipment Manufacturer\u2019s recommendations.";
  var NOTE = "* Estimate based on general tolerances of equipment component selected. Recommend following Equipment Manufacturer\u2019s specifications.";
  var MORE_INFO = { href: `${ORIGIN2}/en_us/home/contact-us.html`, text: "Request more information" };
  var CREDIT = {
    href: "https://www.noria.com",
    logo: `${ORIGIN2}/content/dam/external/isoclean/common/marketing-support/logos/noria.png`,
    text: "Calculator data provided and powered by Noria. Copyright \xA9 2017 Noria Corporation."
  };
  function abs2(url) {
    try {
      return new URL(url, ORIGIN2).href;
    } catch (e) {
      return url;
    }
  }
  function clean3(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function link2(document, href, text) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    return a;
  }
  function para2(document, ...nodes) {
    const p = document.createElement("p");
    nodes.forEach((n) => p.append(n));
    return p;
  }
  function parse4(element, { document }) {
    const cells = [["Data", link2(document, DATA, DATA)]];
    element.querySelectorAll(".tab1 li.cf").forEach((li) => {
      const label = clean3(li.textContent);
      const src = li.querySelector("img");
      if (!label || !src) return;
      const img = document.createElement("img");
      img.src = abs2(src.getAttribute("src"));
      img.alt = "";
      cells.push([label, img]);
    });
    cells.push(["Intro", INTRO]);
    cells.push(["Note", NOTE]);
    cells.push(["More information", link2(document, MORE_INFO.href, MORE_INFO.text)]);
    const logo = document.createElement("img");
    logo.src = CREDIT.logo;
    logo.alt = "Noria";
    const logoLink = document.createElement("a");
    logoLink.href = CREDIT.href;
    logoLink.append(logo);
    const credit = document.createElement("div");
    credit.append(para2(document, logoLink), para2(document, CREDIT.text));
    cells.push(["Credit", credit]);
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "isoclean-calculator", cells }));
  }

  // tools/importer/parsers/carousel-banner.js
  var ORIGIN3 = "https://www.chevronlubricants.com";
  function absUrl(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN3).href;
    } catch (e) {
      return url;
    }
  }
  function clean4(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function imgSrc(img) {
    if (!img) return "";
    const src = img.getAttribute("data-src") || img.getAttribute("src") || "";
    return src.startsWith("data:") ? "" : src;
  }
  function makeImg2(document, srcImg) {
    const src = imgSrc(srcImg);
    if (!src) return null;
    const img = document.createElement("img");
    img.src = absUrl(src);
    img.alt = clean4(srcImg.getAttribute("alt"));
    return img;
  }
  function youTubeWatch(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/[?&]v=([\w-]+)/);
    return m ? `https://www.youtube.com/watch?v=${m[1]}#_dnb` : absUrl(src);
  }
  function slideHref(slide) {
    const video = slide.querySelector("[data-video-src]");
    if (video) return youTubeWatch(video.getAttribute("data-video-src"));
    const a = slide.matches("a[href]") ? slide : slide.querySelector("a[href]");
    if (!a) return "";
    const href = absUrl(a.getAttribute("href"));
    const target = (a.getAttribute("target") || "").toLowerCase();
    return target === "_blank" && href && !href.includes("#") ? `${href}#_blank` : href;
  }
  function getSlides(element) {
    const slick = [...element.querySelectorAll(".slick-slide")].filter((s) => !s.classList.contains("slick-cloned"));
    if (slick.length) return slick;
    const slider = element.querySelector(".image-slider");
    const items4 = slider ? [...slider.children].filter((c) => c.querySelector("img")) : [];
    return items4.length ? items4 : [...element.querySelectorAll(".item")];
  }
  function parse5(element, { document }) {
    const cells = [];
    getSlides(element).forEach((slide) => {
      const desktop = slide.querySelector("img.mobile-only-hidden") || slide.querySelector("img");
      const mobile = slide.querySelector("img.tablet-up-hidden");
      const media = [];
      const main = makeImg2(document, desktop);
      if (main) media.push(main);
      if (mobile && mobile !== desktop && imgSrc(mobile) && imgSrc(mobile) !== imgSrc(desktop)) {
        const m = makeImg2(document, mobile);
        if (m) media.push(m);
      }
      if (!media.length) return;
      const imageCell3 = [];
      const href = slideHref(slide);
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        media.forEach((img) => a.append(img));
        imageCell3.push(a);
      } else {
        imageCell3.push(...media);
      }
      const textCell2 = [];
      const caption = slide.querySelector(".item__text, .item__caption, .item__content");
      if (caption && clean4(caption.textContent)) {
        const p = document.createElement("p");
        p.textContent = clean4(caption.textContent);
        textCell2.push(p);
      }
      cells.push([imageCell3, textCell2]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-square.js
  var ORIGIN4 = "https://www.chevronlubricants.com";
  function absUrl2(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN4).href;
    } catch (e) {
      return url;
    }
  }
  function clean5(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function makeImg3(document, srcImg, fallbackAlt) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) return null;
    const img = document.createElement("img");
    img.src = absUrl2(src);
    img.alt = clean5(srcImg.getAttribute("alt")) || fallbackAlt || "";
    return img;
  }
  function youTubeWatch2(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/[?&]v=([\w-]+)/);
    return m ? `https://www.youtube.com/watch?v=${m[1]}#_dnb` : absUrl2(src);
  }
  function htmlText(document, html) {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return clean5(div.textContent);
  }
  function getItems(element) {
    const slick = [...element.querySelectorAll(".slick-slide")].filter((s) => !s.classList.contains("slick-cloned"));
    if (slick.length) return slick.map((s) => s.querySelector(".item") || s);
    return [...element.querySelectorAll(".item")].filter((i) => !i.closest(".slick-cloned"));
  }
  function parse6(element, { document }) {
    const cells = [];
    getItems(element).forEach((item) => {
      const video = item.querySelector("[data-video-src]");
      const titleLink = item.querySelector(".item__text-block a") || item.querySelector(".item__text-block");
      const title = titleLink ? clean5(titleLink.textContent) : "";
      const imageLink2 = item.querySelector(".item__image a[href]");
      let href = "";
      if (video) href = youTubeWatch2(video.getAttribute("data-video-src"));
      else if (titleLink && titleLink.getAttribute("href")) href = absUrl2(titleLink.getAttribute("href"));
      else if (imageLink2) href = absUrl2(imageLink2.getAttribute("href"));
      const imageCell3 = [];
      const img = makeImg3(document, item.querySelector(".item__image img") || item.querySelector("img"), title);
      if (img) {
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.append(img);
          imageCell3.push(a);
        } else {
          imageCell3.push(img);
        }
      }
      const textCell2 = [];
      if (title) {
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          p.append(a);
        } else {
          p.textContent = title;
        }
        textCell2.push(p);
      }
      const caption = htmlText(document, item.getAttribute("data-description"));
      if (caption) {
        const p = document.createElement("p");
        p.textContent = caption;
        textCell2.push(p);
      }
      if (imageCell3.length || textCell2.length) cells.push([imageCell3, textCell2]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-square", cells });
    const titleEl = element.querySelector(".square-carousel__title");
    const heading2 = titleEl ? clean5(titleEl.textContent) : "";
    if (heading2) {
      const h2 = document.createElement("h2");
      h2.textContent = heading2;
      element.replaceWith(h2, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-products.js
  var ORIGIN5 = "https://www.chevronlubricants.com";
  function absUrl3(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN5).href;
    } catch (e) {
      return url;
    }
  }
  function clean6(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function makeImg4(document, srcImg, fallbackAlt) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src");
    if (!src) return null;
    const img = document.createElement("img");
    img.src = absUrl3(src);
    img.alt = clean6(srcImg.getAttribute("alt")).replace(/�/g, "\xAE") || fallbackAlt || "";
    return img;
  }
  function makeLinkPara(document, href, text) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = absUrl3(href);
    a.textContent = text;
    p.append(a);
    return p;
  }
  function listingHref(srcLink) {
    const href = absUrl3(srcLink.getAttribute("href"));
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
    a.textContent = clean6(srcLink.textContent) || fallbackText || "";
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
    img.src = absUrl3(src);
    img.alt = clean6(srcEl.getAttribute("alt")).replace(/�/g, "\xAE") || alt || "";
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
            const text = clean6(child.textContent);
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
    return clean6(p.textContent) ? p : null;
  }
  function parseListingCarousel(element, document) {
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const slides = [...element.querySelectorAll("a.slide")].filter((a) => !a.closest(".slick-cloned"));
    slides.forEach((slide) => {
      const href = absUrl3(slide.getAttribute("href"));
      const titleEl = slide.querySelector(".product-title");
      const title = titleEl ? clean6(titleEl.textContent) : "";
      const key = `${href}|${title}`;
      if (seen.has(key)) return;
      seen.add(key);
      const imageCell3 = [];
      const teaser = slide.querySelector(".teaser-image");
      const img = listingImg(document, teaser && teaser.getAttribute("data-bg") ? teaser : (teaser || slide).querySelector("img"), title);
      if (img) imageCell3.push(img);
      const textCell2 = [];
      if (title) textCell2.push(listingTitle(document, listingHref(slide), title));
      const desc = listingDescription(document, slide.querySelector(".inner__description") || slide.querySelector(".category-heading"));
      if (desc) textCell2.push(desc);
      if (imageCell3.length || textCell2.length) cells.push([imageCell3, textCell2]);
    });
    return cells;
  }
  function parseListingGrid(element, document) {
    const cells = [];
    [...element.querySelectorAll(".product-listing-item")].forEach((item) => {
      const titleLink = item.querySelector(".product-listing-item__title a") || item.querySelector(".product-listing-item__title");
      const title = titleLink ? clean6(titleLink.textContent) : "";
      const imageCell3 = [];
      const badge = listingImg(document, item.querySelector('img.product-listing-item__img-container__isologo, .product-listing-item__img-container [class*="isologo"]'), "ISOCLEAN\xAE Certified Lubricants");
      if (badge) imageCell3.push(badge);
      const product = listingImg(document, item.querySelector("img.product-listing-item__img-container__product") || item.querySelector('.product-listing-item__img-container img:not([class*="isologo"])'), title);
      if (product) imageCell3.push(product);
      const textCell2 = [];
      if (title) {
        textCell2.push(listingTitle(document, titleLink && titleLink.tagName === "A" ? listingHref(titleLink) : "", title));
      }
      const label = item.querySelector(".product-listing-item__benefits");
      const list = item.querySelector(".product-listing-item__benefits-container ul");
      const items4 = list ? [...list.querySelectorAll("li")].map((li) => clean6(li.textContent)).filter(Boolean) : [];
      if (items4.length) {
        const labelText = label ? clean6(label.textContent) : "";
        if (labelText) {
          const p = document.createElement("p");
          p.textContent = labelText;
          textCell2.push(p);
        }
        const ul = document.createElement("ul");
        items4.forEach((text) => {
          const li = document.createElement("li");
          li.textContent = text;
          ul.append(li);
        });
        textCell2.push(ul);
      }
      const learn = item.querySelector(".product-listing-category__more a[href]");
      if (learn) {
        const p = listingLinkPara(document, learn, "Learn More");
        if (p) textCell2.push(p);
      }
      const buy = item.querySelector(".product-listing-category__buyonline a[href]");
      if (buy) {
        const p = listingLinkPara(document, buy, "Buy online");
        if (p) textCell2.push(p);
      }
      if (imageCell3.length || textCell2.length) cells.push([imageCell3, textCell2]);
    });
    return cells;
  }
  function parse7(element, { document }) {
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
      const heading2 = headings[i];
      const title = heading2 ? clean6(heading2.textContent) : "";
      const imageCell3 = [];
      const badge = makeImg4(document, badgeWraps[i] && badgeWraps[i].querySelector("img"), "ISOCLEAN Certified Lubricants");
      if (badge) imageCell3.push(badge);
      const product = makeImg4(document, imageTiles[i] && imageTiles[i].querySelector("img"), title);
      if (product) imageCell3.push(product);
      const textCell2 = [];
      if (heading2) {
        const h3 = document.createElement("h3");
        const a = document.createElement("a");
        a.href = absUrl3(heading2.getAttribute("href"));
        a.textContent = title;
        h3.append(a);
        textCell2.push(h3);
      }
      const learn = learnLinks[i];
      if (learn) textCell2.push(makeLinkPara(document, learn.getAttribute("href"), clean6(learn.textContent) || "Learn More"));
      const cta = ctaLinks[i];
      if (cta) {
        const label = clean6(cta.textContent) || (ctaButtons[i] ? clean6(ctaButtons[i].textContent) : "") || "Learn More";
        textCell2.push(makeLinkPara(document, cta.getAttribute("href"), label));
      }
      const list = lists[i];
      if (list) {
        const ul = document.createElement("ul");
        list.querySelectorAll("li").forEach((srcLi) => {
          const text = clean6(srcLi.textContent);
          if (!text) return;
          const li = document.createElement("li");
          li.textContent = text;
          ul.append(li);
        });
        if (ul.children.length) textCell2.push(ul);
      }
      if (imageCell3.length || textCell2.length) cells.push([imageCell3, textCell2]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-products", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-filterable.js
  var SHEET = "/en-us/home/learning/resources.json";
  var SHEET_TEXT = "Resources";
  function clean7(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function groupKey(name) {
    const n = clean7(name).toLowerCase();
    if (n.startsWith("brand")) return "Brand";
    if (n.startsWith("type") || n.includes("asset")) return "Type";
    return clean7(name);
  }
  function preselected(element) {
    const groups = [];
    element.querySelectorAll(".knowledge-center__filter__categories__category").forEach((cat) => {
      const nameEl = cat.querySelector(".knowledge-center__filter__categories__category-name span") || cat.querySelector(".knowledge-center__filter__categories__category-name");
      const values = [...cat.querySelectorAll(".knowledge-center__filter__categories__category-item")].filter((item) => {
        const input = item.querySelector('input[type="checkbox"]');
        return input && (input.hasAttribute("checked") || input.checked);
      }).map((item) => clean7((item.querySelector(".knowledge-center__filter__categories__category-item__label") || item).textContent)).filter(Boolean);
      if (nameEl && values.length) groups.push(`${groupKey(nameEl.textContent)}: ${values.join(", ")}`);
    });
    return groups;
  }
  var ORIGIN6 = "https://www.chevronlubricants.com";
  function publicUrl(href) {
    const path = (href || "").replace(/^\/content\/chevron-lubricants(?=\/en_us\/)/, "");
    try {
      return new URL(path, ORIGIN6).href;
    } catch (e) {
      return href;
    }
  }
  function staticRows(element, document) {
    return [...element.querySelectorAll(".knowledge-center__results .item")].map((item) => {
      const link3 = item.querySelector(".item__header__title a[href]");
      const src = item.querySelector(".item__header__image img");
      if (!link3) return null;
      const cellImg = [];
      if (src) {
        const img = document.createElement("img");
        img.src = publicUrl(src.getAttribute("data-src") || src.getAttribute("src"));
        img.alt = clean7(link3.textContent);
        cellImg.push(img);
      }
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = publicUrl(link3.getAttribute("href"));
      a.textContent = clean7(link3.textContent);
      p.append(a);
      return [cellImg, [p]];
    }).filter(Boolean);
  }
  function isBlogList(element) {
    const cfg = element.querySelector(".knowledge-center__container__hidden");
    if (cfg && (cfg.getAttribute("data-page-search-path") || "").includes("/from-chevron/")) return true;
    const links = [...element.querySelectorAll(".knowledge-center__results .item .item__header__title a[href]")];
    return links.length > 0 && links.every((a) => (a.getAttribute("href") || "").includes("/learning/from-chevron/"));
  }
  function parse8(element, { document }) {
    if (isBlogList(element)) {
      const rows = staticRows(element, document);
      if (rows.length) {
        element.replaceWith(WebImporter.Blocks.createBlock(document, { name: "cards-filterable", cells: rows }));
      } else {
        element.remove();
      }
      return;
    }
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = SHEET;
    a.textContent = SHEET_TEXT;
    p.append(a);
    const cells = [[[p]]];
    const filters = preselected(element);
    if (filters.length) {
      cells.push([filters.map((line) => {
        const fp = document.createElement("p");
        fp.textContent = line;
        return fp;
      })]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-filterable", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-drawer.js
  var DNB = false;
  var ORIGIN7 = "https://www.chevronlubricants.com";
  var HEADINGS = "h1, h2, h3, h4, h5, h6";
  var BLOCKS = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote";
  function absUrl4(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN7).href;
    } catch (e) {
      return url;
    }
  }
  function clean8(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function youTubeId(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
    return m ? m[1] : "";
  }
  function linkHref(href, srcLink) {
    const raw = (href || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    if (raw.startsWith("#")) return raw;
    const id = youTubeId(raw);
    if (id) return `https://www.youtube.com/watch?v=${id}${DNB ? "#_dnb" : ""}`;
    const url = absUrl4(raw);
    const blank = srcLink && (srcLink.getAttribute("target") || "").toLowerCase() === "_blank";
    return blank && url && !url.includes("#") ? `${url}#_blank` : url;
  }
  function hasContent(el) {
    return !!(clean8(el.textContent) || el.querySelector("img, video, iframe, [data-video-src]"));
  }
  function makeImg5(document, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || /\.pdf(\?|#|$)/i.test(src)) return null;
    const img = document.createElement("img");
    img.src = absUrl4(src);
    img.alt = clean8(srcImg.getAttribute("alt"));
    return img;
  }
  function desktopImg(container) {
    return container.querySelector("img.mobile-only-hidden") || container.querySelector("img");
  }
  function copyInline(document, from, to) {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(document.createTextNode(n.textContent.replace(/[\s ]+/g, " ")));
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName;
      if (tag === "BR") {
        to.append(document.createElement("br"));
        return;
      }
      if (tag === "IMG") {
        const img = makeImg5(document, n);
        if (img) to.append(img);
        return;
      }
      if (tag === "A") {
        const href = linkHref(n.getAttribute("data-video-src") || n.getAttribute("href"), n);
        if (!href) {
          copyInline(document, n, to);
          return;
        }
        const a = document.createElement("a");
        a.href = href;
        copyInline(document, n, a);
        if (clean8(a.textContent) || a.querySelector("img")) to.append(a);
        return;
      }
      const map = { B: "strong", STRONG: "strong", I: "em", EM: "em", SUP: "sup", SUB: "sub", U: "u" };
      if (map[tag]) {
        const el = document.createElement(map[tag]);
        copyInline(document, n, el);
        if (clean8(el.textContent) || el.querySelector("img")) to.append(el);
        else if (el.textContent) to.append(document.createTextNode(" "));
        return;
      }
      copyInline(document, n, to);
    });
  }
  function trimNode(el) {
    const edge = (first) => {
      for (; ; ) {
        const n = first ? el.firstChild : el.lastChild;
        if (!n) return;
        if (n.nodeType === 3) {
          const t = first ? n.textContent.replace(/^\s+/, "") : n.textContent.replace(/\s+$/, "");
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
    edge(true);
    edge(false);
    el.normalize();
  }
  function blockFrom(document, src) {
    const tag = src.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const list = document.createElement(tag);
      src.querySelectorAll(":scope > li").forEach((li) => {
        const n = document.createElement("li");
        copyInline(document, li, n);
        trimNode(n);
        if (hasContent(n)) list.append(n);
      });
      return list.children.length ? list : null;
    }
    const el = document.createElement(["table", "blockquote"].includes(tag) ? "p" : tag);
    copyInline(document, src, el);
    trimNode(el);
    if (/^h[1-6]$/.test(tag) && !el.querySelector("a, img") && clean8([...el.querySelectorAll("strong")].map((b) => b.textContent).join(" ")) === clean8(el.textContent)) {
      el.textContent = clean8(el.textContent);
    }
    return hasContent(el) ? el : null;
  }
  function richNodes(document, root) {
    const out = [];
    let loose = null;
    const flush = () => {
      if (loose) {
        trimNode(loose);
        if (hasContent(loose)) out.push(loose);
      }
      loose = null;
    };
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 1 && (n.matches(BLOCKS) || n.querySelector(BLOCKS) || n.tagName === "DIV")) {
          flush();
          if (n.matches(BLOCKS) && !n.querySelector(BLOCKS)) {
            const b = blockFrom(document, n);
            if (b) out.push(b);
          } else if (n.matches(HEADINGS) && n.querySelector("p")) {
            const h = document.createElement(n.tagName.toLowerCase());
            [...n.querySelectorAll("p")].forEach((p, i) => {
              if (i) h.append(document.createTextNode(" "));
              copyInline(document, p, h);
            });
            trimNode(h);
            if (hasContent(h)) out.push(h);
          } else {
            walk(n);
          }
          return;
        }
        if (!loose) loose = document.createElement("p");
        const tmp = document.createElement("span");
        tmp.append(n.cloneNode(true));
        copyInline(document, tmp, loose);
      });
      flush();
    };
    walk(root);
    return out;
  }
  function imagePara(document, cmp) {
    const img = makeImg5(document, desktopImg(cmp));
    if (!img) return null;
    const p = document.createElement("p");
    const link3 = cmp.querySelector("a[href]");
    const href = link3 ? linkHref(link3.getAttribute("href"), link3) : "";
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.append(img);
      p.append(a);
    } else {
      p.append(img);
    }
    return p;
  }
  function buttonParas(document, button) {
    return [...button.querySelectorAll("a")].map((link3) => {
      const label = clean8((link3.querySelector(".btn-text") || link3).textContent);
      if (!label) return null;
      const p = document.createElement("p");
      const href = linkHref(link3.getAttribute("data-video-src") || link3.getAttribute("href"), link3);
      if (!href) {
        p.textContent = label;
        return p;
      }
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      return p;
    }).filter(Boolean);
  }
  function contentNodes(document, container) {
    const out = [];
    [...container.children].forEach((c) => {
      if (c.matches(".divider, .anchor-tag, .repeating-image-overlay, script, style") || !hasContent(c)) return;
      if (c.matches(".cmp-image")) {
        const p = imagePara(document, c);
        if (p) out.push(p);
      } else if (c.matches(".richtext")) {
        out.push(...richNodes(document, c.querySelector(".richtext__container") || c));
      } else if (c.matches(".button")) {
        out.push(...buttonParas(document, c));
      } else if (c.matches(".title")) {
        const t = clean8(c.textContent);
        if (t) {
          const p = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = t;
          p.append(strong);
          out.push(p);
        }
      } else if (c.matches(".multi-column")) {
        c.querySelectorAll(":scope > .multi-column__container > .multi-column__content > .multi-column__item").forEach((item) => {
          if (hasContent(item)) out.push(...contentNodes(document, item));
        });
      } else if (c.matches(".multi-column__item") || c.tagName === "DIV" && !c.className) {
        out.push(...contentNodes(document, c));
      } else {
        out.push(...richNodes(document, c));
      }
    });
    return out;
  }
  function parse9(element, { document }) {
    const drawers = element.matches(".drawer") ? [element] : [...element.querySelectorAll(".drawer")];
    const cells = drawers.map((drawer) => {
      const header = [];
      const imgWrap = drawer.querySelector(".drawer__img-container");
      const img = imgWrap ? makeImg5(document, desktopImg(imgWrap)) : null;
      if (img) header.push(img);
      const titleEl = drawer.querySelector(".drawer__title");
      const title = titleEl ? clean8(titleEl.textContent) : "";
      if (title) {
        const p = document.createElement("p");
        p.textContent = title;
        header.push(p);
      }
      const parsys = drawer.querySelector(".drawer__parsys-container");
      const content = parsys ? contentNodes(document, parsys) : [];
      return [header, content];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-drawer", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  var DNB2 = false;
  var ORIGIN8 = "https://www.chevronlubricants.com";
  var HEADINGS2 = "h1, h2, h3, h4, h5, h6";
  var BLOCKS2 = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote";
  function absUrl5(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN8).href;
    } catch (e) {
      return url;
    }
  }
  function clean9(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function youTubeId2(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
    return m ? m[1] : "";
  }
  function linkHref2(href, srcLink) {
    const raw = (href || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    if (raw.startsWith("#")) return raw;
    const id = youTubeId2(raw);
    if (id) return `https://www.youtube.com/watch?v=${id}${DNB2 ? "#_dnb" : ""}`;
    const url = absUrl5(raw);
    const blank = srcLink && (srcLink.getAttribute("target") || "").toLowerCase() === "_blank";
    return blank && url && !url.includes("#") ? `${url}#_blank` : url;
  }
  function hasContent2(el) {
    return !!(clean9(el.textContent) || el.querySelector("img, video, iframe, [data-video-src]"));
  }
  function makeImg6(document, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || /\.pdf(\?|#|$)/i.test(src)) return null;
    const img = document.createElement("img");
    img.src = absUrl5(src);
    img.alt = clean9(srcImg.getAttribute("alt"));
    return img;
  }
  function desktopImg2(container) {
    return container.querySelector("img.mobile-only-hidden") || container.querySelector("img");
  }
  function copyInline2(document, from, to) {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(document.createTextNode(n.textContent.replace(/[\s ]+/g, " ")));
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName;
      if (tag === "BR") {
        to.append(document.createElement("br"));
        return;
      }
      if (tag === "IMG") {
        const img = makeImg6(document, n);
        if (img) to.append(img);
        return;
      }
      if (tag === "A") {
        const href = linkHref2(n.getAttribute("data-video-src") || n.getAttribute("href"), n);
        if (!href) {
          copyInline2(document, n, to);
          return;
        }
        const a = document.createElement("a");
        a.href = href;
        copyInline2(document, n, a);
        if (clean9(a.textContent) || a.querySelector("img")) to.append(a);
        return;
      }
      const map = { B: "strong", STRONG: "strong", I: "em", EM: "em", SUP: "sup", SUB: "sub", U: "u" };
      if (map[tag]) {
        const el = document.createElement(map[tag]);
        copyInline2(document, n, el);
        if (clean9(el.textContent) || el.querySelector("img")) {
          const lead = el.firstChild && el.firstChild.nodeType === 3 && /^\s/.test(el.firstChild.textContent);
          const trail = el.lastChild && el.lastChild.nodeType === 3 && /\s$/.test(el.lastChild.textContent);
          if (lead) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, "");
          if (trail) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, "");
          if (lead) to.append(document.createTextNode(" "));
          to.append(el);
          if (trail) to.append(document.createTextNode(" "));
        } else if (el.textContent) to.append(document.createTextNode(" "));
        return;
      }
      copyInline2(document, n, to);
    });
  }
  function trimNode2(el) {
    const edge = (first) => {
      for (; ; ) {
        const n = first ? el.firstChild : el.lastChild;
        if (!n) return;
        if (n.nodeType === 3) {
          const t = first ? n.textContent.replace(/^\s+/, "") : n.textContent.replace(/\s+$/, "");
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
    edge(true);
    edge(false);
    el.normalize();
  }
  function blockFrom2(document, src) {
    const tag = src.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const list = document.createElement(tag);
      src.querySelectorAll(":scope > li").forEach((li) => {
        const n = document.createElement("li");
        copyInline2(document, li, n);
        trimNode2(n);
        if (hasContent2(n)) list.append(n);
      });
      return list.children.length ? list : null;
    }
    const el = document.createElement(["table", "blockquote"].includes(tag) ? "p" : tag);
    copyInline2(document, src, el);
    trimNode2(el);
    if (/^h[1-6]$/.test(tag) && !el.querySelector("a, img") && clean9([...el.querySelectorAll("strong")].map((b) => b.textContent).join(" ")) === clean9(el.textContent)) {
      el.textContent = clean9(el.textContent);
    }
    return hasContent2(el) ? el : null;
  }
  function richNodes2(document, root) {
    const out = [];
    let loose = null;
    const flush = () => {
      if (loose) {
        trimNode2(loose);
        if (hasContent2(loose)) out.push(loose);
      }
      loose = null;
    };
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 1 && (n.matches(BLOCKS2) || n.querySelector(BLOCKS2) || n.tagName === "DIV")) {
          flush();
          if (n.matches(BLOCKS2) && !n.querySelector(BLOCKS2)) {
            const b = blockFrom2(document, n);
            if (b) out.push(b);
          } else if (n.matches(HEADINGS2) && n.querySelector("p")) {
            const h = document.createElement(n.tagName.toLowerCase());
            [...n.querySelectorAll("p")].forEach((p, i) => {
              if (i) h.append(document.createTextNode(" "));
              copyInline2(document, p, h);
            });
            trimNode2(h);
            if (hasContent2(h)) out.push(h);
          } else {
            walk(n);
          }
          return;
        }
        if (!loose) loose = document.createElement("p");
        const tmp = document.createElement("span");
        tmp.append(n.cloneNode(true));
        copyInline2(document, tmp, loose);
      });
      flush();
    };
    walk(root);
    return out;
  }
  function answerNodes(document, container) {
    const out = [];
    [...container.children].forEach((c) => {
      if (c.matches(".divider, .anchor-tag, script, style") || !hasContent2(c)) return;
      if (c.matches(".richtext")) {
        out.push(...richNodes2(document, c.querySelector(".richtext__container") || c));
      } else if (c.matches(".cmp-image")) {
        const img = makeImg6(document, desktopImg2(c));
        if (img) {
          const p = document.createElement("p");
          const link3 = c.querySelector("a[href]");
          const href = link3 ? linkHref2(link3.getAttribute("href"), link3) : "";
          if (href) {
            const a = document.createElement("a");
            a.href = href;
            a.append(img);
            p.append(a);
          } else {
            p.append(img);
          }
          out.push(p);
        }
      } else if (c.matches(".button")) {
        c.querySelectorAll("a").forEach((link3) => {
          const label = clean9((link3.querySelector(".btn-text") || link3).textContent);
          if (!label) return;
          const p = document.createElement("p");
          const href = linkHref2(link3.getAttribute("data-video-src") || link3.getAttribute("href"), link3);
          if (href) {
            const a = document.createElement("a");
            a.href = href;
            a.textContent = label;
            p.append(a);
          } else {
            p.textContent = label;
          }
          out.push(p);
        });
      } else if (c.tagName === "DIV" && !c.matches(".richtext, .cmp-image, .button")) {
        const nested = answerNodes(document, c);
        out.push(...nested.length ? nested : richNodes2(document, c));
      } else {
        out.push(...richNodes2(document, c));
      }
    });
    return out;
  }
  function parse10(element, { document }) {
    const cells = [];
    element.querySelectorAll(".panel").forEach((panel) => {
      const titleEl = panel.querySelector(".panel-heading .title-text") || panel.querySelector(".panel-title");
      const question = titleEl ? clean9(titleEl.textContent) : "";
      const body = panel.querySelector(".panel-body") || panel.querySelector(".panel-collapse");
      const answer = body ? answerNodes(document, body) : [];
      if (!question && !answer.length) return;
      const q = document.createElement("p");
      q.textContent = question;
      cells.push([[q], answer]);
    });
    const loadMore = [...element.querySelectorAll("a.btn, button")].some((b) => /load\s+more/i.test(b.textContent)) || [...element.querySelectorAll(".panel-collapse-more")].some((m) => m.querySelector(".panel"));
    const variants = loadMore ? ["load-more"] : [];
    if (element.querySelector(".applications__content.bg-light-gray")) variants.push("grey");
    else if (element.querySelector(".applications__toggle-all.lubricantsFontColorBlue")) variants.push("blue");
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-testimonial.js
  var DNB3 = true;
  var ORIGIN9 = "https://www.chevronlubricants.com";
  var HEADINGS3 = "h1, h2, h3, h4, h5, h6";
  var BLOCKS3 = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote";
  function absUrl6(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN9).href;
    } catch (e) {
      return url;
    }
  }
  function clean10(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function youTubeId3(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
    return m ? m[1] : "";
  }
  function linkHref3(href, srcLink) {
    const raw = (href || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    if (raw.startsWith("#")) return raw;
    const id = youTubeId3(raw);
    if (id) return `https://www.youtube.com/watch?v=${id}${DNB3 ? "#_dnb" : ""}`;
    const url = absUrl6(raw);
    const blank = srcLink && (srcLink.getAttribute("target") || "").toLowerCase() === "_blank";
    return blank && url && !url.includes("#") ? `${url}#_blank` : url;
  }
  function hasContent3(el) {
    return !!(clean10(el.textContent) || el.querySelector("img, video, iframe, [data-video-src]"));
  }
  function makeImg7(document, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || /\.pdf(\?|#|$)/i.test(src)) return null;
    const img = document.createElement("img");
    img.src = absUrl6(src);
    img.alt = clean10(srcImg.getAttribute("alt"));
    return img;
  }
  function desktopImg3(container) {
    return container.querySelector("img.mobile-only-hidden") || container.querySelector("img");
  }
  function copyInline3(document, from, to) {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(document.createTextNode(n.textContent.replace(/[\s ]+/g, " ")));
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName;
      if (tag === "BR") {
        to.append(document.createElement("br"));
        return;
      }
      if (tag === "IMG") {
        const img = makeImg7(document, n);
        if (img) to.append(img);
        return;
      }
      if (tag === "A") {
        const href = linkHref3(n.getAttribute("data-video-src") || n.getAttribute("href"), n);
        if (!href) {
          copyInline3(document, n, to);
          return;
        }
        const a = document.createElement("a");
        a.href = href;
        copyInline3(document, n, a);
        if (clean10(a.textContent) || a.querySelector("img")) to.append(a);
        return;
      }
      const map = { B: "strong", STRONG: "strong", I: "em", EM: "em", SUP: "sup", SUB: "sub", U: "u" };
      if (map[tag]) {
        const el = document.createElement(map[tag]);
        copyInline3(document, n, el);
        if (clean10(el.textContent) || el.querySelector("img")) {
          const lead = el.firstChild && el.firstChild.nodeType === 3 && /^\s/.test(el.firstChild.textContent);
          const trail = el.lastChild && el.lastChild.nodeType === 3 && /\s$/.test(el.lastChild.textContent);
          if (lead) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, "");
          if (trail) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, "");
          if (lead) to.append(document.createTextNode(" "));
          to.append(el);
          if (trail) to.append(document.createTextNode(" "));
        } else if (el.textContent) to.append(document.createTextNode(" "));
        return;
      }
      copyInline3(document, n, to);
    });
  }
  function trimNode3(el) {
    const edge = (first) => {
      for (; ; ) {
        const n = first ? el.firstChild : el.lastChild;
        if (!n) return;
        if (n.nodeType === 3) {
          const t = first ? n.textContent.replace(/^\s+/, "") : n.textContent.replace(/\s+$/, "");
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
    edge(true);
    edge(false);
    el.normalize();
  }
  function blockFrom3(document, src) {
    const tag = src.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const list = document.createElement(tag);
      src.querySelectorAll(":scope > li").forEach((li) => {
        const n = document.createElement("li");
        copyInline3(document, li, n);
        trimNode3(n);
        if (hasContent3(n)) list.append(n);
      });
      return list.children.length ? list : null;
    }
    const el = document.createElement(["table", "blockquote"].includes(tag) ? "p" : tag);
    copyInline3(document, src, el);
    trimNode3(el);
    if (/^h[1-6]$/.test(tag) && !el.querySelector("a, img") && clean10([...el.querySelectorAll("strong")].map((b) => b.textContent).join(" ")) === clean10(el.textContent)) {
      el.textContent = clean10(el.textContent);
    }
    return hasContent3(el) ? el : null;
  }
  function richNodes3(document, root) {
    const out = [];
    let loose = null;
    const flush = () => {
      if (loose) {
        trimNode3(loose);
        if (hasContent3(loose)) out.push(loose);
      }
      loose = null;
    };
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 1 && (n.matches(BLOCKS3) || n.querySelector(BLOCKS3) || n.tagName === "DIV")) {
          flush();
          if (n.matches(BLOCKS3) && !n.querySelector(BLOCKS3)) {
            const b = blockFrom3(document, n);
            if (b) out.push(b);
          } else if (n.matches(HEADINGS3) && n.querySelector("p")) {
            const h = document.createElement(n.tagName.toLowerCase());
            [...n.querySelectorAll("p")].forEach((p, i) => {
              if (i) h.append(document.createTextNode(" "));
              copyInline3(document, p, h);
            });
            trimNode3(h);
            if (hasContent3(h)) out.push(h);
          } else {
            walk(n);
          }
          return;
        }
        if (!loose) loose = document.createElement("p");
        const tmp = document.createElement("span");
        tmp.append(n.cloneNode(true));
        copyInline3(document, tmp, loose);
      });
      flush();
    };
    walk(root);
    return out;
  }
  function para3(document, text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function linkPara(document, href, text) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text || href;
    p.append(a);
    return p;
  }
  function portrait(document, cmp) {
    return cmp ? makeImg7(document, desktopImg3(cmp)) : null;
  }
  function attributionLines(document, text) {
    const t = clean10(text).replace(/^[-–—]\s*/, "");
    if (!t) return [];
    const i = t.indexOf(",");
    if (i < 0) return [para3(document, t)];
    return [para3(document, t.slice(0, i).trim()), para3(document, t.slice(i + 1).trim())];
  }
  function testimonialRows(document, element) {
    const rows = [];
    const title = element.querySelector(".testimonial__title");
    if (title && clean10(title.textContent)) rows.push([para3(document, clean10(title.textContent))]);
    const text = element.querySelector(".testimonial__text");
    const quote = text ? richNodes3(document, text) : [];
    if (quote.length) rows.push(quote);
    const attr = element.querySelector(".testimonial__attribution__text");
    if (attr) {
      const role = attr.querySelector(".testimonial__attribution__title");
      const roleText = role ? clean10(role.textContent) : "";
      const nameEl = attr.cloneNode(true);
      nameEl.querySelectorAll(".testimonial__attribution__title").forEach((n) => n.remove());
      const lines2 = [clean10(nameEl.textContent), roleText].filter(Boolean).map((t) => para3(document, t));
      if (lines2.length) rows.push(lines2);
    }
    element.querySelectorAll(".button-container a, .btn-wrapper a").forEach((link3) => {
      const href = linkHref3(link3.getAttribute("data-video-src") || link3.getAttribute("href"), link3);
      const label = clean10((link3.querySelector(".btn-text") || link3).textContent);
      if (href && label) rows.push([linkPara(document, href, label)]);
    });
    return rows;
  }
  function multiColumnItems(element) {
    return [...element.querySelectorAll(":scope > .multi-column__container > .multi-column__content > .multi-column__item")].filter((item) => [...item.children].some((c) => !c.matches(".divider, .anchor-tag") && hasContent3(c)));
  }
  function multiColumnQuoteRows(document, item) {
    const rows = [];
    const img = portrait(document, item.querySelector(".cmp-image"));
    if (img) rows.push([img]);
    const text = [];
    item.querySelectorAll(".richtext").forEach((rt) => text.push(...richNodes3(document, rt.querySelector(".richtext__container") || rt)));
    const quote = [];
    let attribution = [];
    text.forEach((node) => {
      const t = clean10(node.textContent);
      const m = !attribution.length && t.match(/^(.*[”"…\.!?])\s+[-–—]\s+(.+)$/);
      if (m) {
        quote.push(para3(document, m[1].trim()));
        attribution = attributionLines(document, m[2]);
      } else {
        quote.push(node);
      }
    });
    if (quote.length) rows.push(quote);
    if (attribution.length) rows.push(attribution);
    item.querySelectorAll(".video [data-video-src], .button a").forEach((v) => {
      const href = linkHref3(v.getAttribute("data-video-src") || v.getAttribute("href"), v);
      const label = clean10((v.querySelector(".videoLinkText, .btn-text") || v).textContent);
      if (href) rows.push([linkPara(document, href, label)]);
    });
    return rows;
  }
  function parse11(element, { document }) {
    if (element.matches(".multi-column")) {
      const [first, ...others] = multiColumnItems(element);
      const cells2 = first ? multiColumnQuoteRows(document, first).map((row) => [row]) : [];
      const block2 = WebImporter.Blocks.createBlock(document, { name: "quote-testimonial", cells: cells2 });
      const rest = others.flatMap((item) => [...item.childNodes]);
      element.replaceWith(block2, ...rest);
      return;
    }
    const cells = testimonialRows(document, element).map((row) => [row]);
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-callout.js
  var DNB4 = false;
  var ORIGIN10 = "https://www.chevronlubricants.com";
  var HEADINGS4 = "h1, h2, h3, h4, h5, h6";
  var BLOCKS4 = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote";
  function absUrl7(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN10).href;
    } catch (e) {
      return url;
    }
  }
  function clean11(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function youTubeId4(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
    return m ? m[1] : "";
  }
  function linkHref4(href, srcLink) {
    const raw = (href || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    if (raw.startsWith("#")) return raw;
    const id = youTubeId4(raw);
    if (id) return `https://www.youtube.com/watch?v=${id}${DNB4 ? "#_dnb" : ""}`;
    const url = absUrl7(raw);
    const blank = srcLink && (srcLink.getAttribute("target") || "").toLowerCase() === "_blank";
    return blank && url && !url.includes("#") ? `${url}#_blank` : url;
  }
  function hasContent4(el) {
    return !!(clean11(el.textContent) || el.querySelector("img, video, iframe, [data-video-src]"));
  }
  function makeImg8(document, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || /\.pdf(\?|#|$)/i.test(src)) return null;
    const img = document.createElement("img");
    img.src = absUrl7(src);
    img.alt = clean11(srcImg.getAttribute("alt"));
    return img;
  }
  function desktopImg4(container) {
    return container.querySelector("img.mobile-only-hidden") || container.querySelector("img");
  }
  function copyInline4(document, from, to) {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(document.createTextNode(n.textContent.replace(/[\s ]+/g, " ")));
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName;
      if (tag === "BR") {
        to.append(document.createElement("br"));
        return;
      }
      if (tag === "IMG") {
        const img = makeImg8(document, n);
        if (img) to.append(img);
        return;
      }
      if (tag === "A") {
        const href = linkHref4(n.getAttribute("data-video-src") || n.getAttribute("href"), n);
        if (!href) {
          copyInline4(document, n, to);
          return;
        }
        const a = document.createElement("a");
        a.href = href;
        copyInline4(document, n, a);
        if (clean11(a.textContent) || a.querySelector("img")) to.append(a);
        return;
      }
      const map = { B: "strong", STRONG: "strong", I: "em", EM: "em", SUP: "sup", SUB: "sub", U: "u" };
      if (map[tag]) {
        const el = document.createElement(map[tag]);
        copyInline4(document, n, el);
        if (clean11(el.textContent) || el.querySelector("img")) {
          const lead = el.firstChild && el.firstChild.nodeType === 3 && /^\s/.test(el.firstChild.textContent);
          const trail = el.lastChild && el.lastChild.nodeType === 3 && /\s$/.test(el.lastChild.textContent);
          if (lead) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, "");
          if (trail) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, "");
          if (lead) to.append(document.createTextNode(" "));
          to.append(el);
          if (trail) to.append(document.createTextNode(" "));
        } else if (el.textContent) to.append(document.createTextNode(" "));
        return;
      }
      copyInline4(document, n, to);
    });
  }
  function trimNode4(el) {
    const edge = (first) => {
      for (; ; ) {
        const n = first ? el.firstChild : el.lastChild;
        if (!n) return;
        if (n.nodeType === 3) {
          const t = first ? n.textContent.replace(/^\s+/, "") : n.textContent.replace(/\s+$/, "");
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
    edge(true);
    edge(false);
    el.normalize();
  }
  function blockFrom4(document, src) {
    const tag = src.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const list = document.createElement(tag);
      src.querySelectorAll(":scope > li").forEach((li) => {
        const n = document.createElement("li");
        copyInline4(document, li, n);
        trimNode4(n);
        if (hasContent4(n)) list.append(n);
      });
      return list.children.length ? list : null;
    }
    const el = document.createElement(["table", "blockquote"].includes(tag) ? "p" : tag);
    copyInline4(document, src, el);
    trimNode4(el);
    if (/^h[1-6]$/.test(tag) && !el.querySelector("a, img") && clean11([...el.querySelectorAll("strong")].map((b) => b.textContent).join(" ")) === clean11(el.textContent)) {
      el.textContent = clean11(el.textContent);
    }
    return hasContent4(el) ? el : null;
  }
  function richNodes4(document, root) {
    const out = [];
    let loose = null;
    const flush = () => {
      if (loose) {
        trimNode4(loose);
        if (hasContent4(loose)) out.push(loose);
      }
      loose = null;
    };
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 1 && (n.matches(BLOCKS4) || n.querySelector(BLOCKS4) || n.tagName === "DIV")) {
          flush();
          if (n.matches(BLOCKS4) && !n.querySelector(BLOCKS4)) {
            const b = blockFrom4(document, n);
            if (b) out.push(b);
          } else if (n.matches(HEADINGS4) && n.querySelector("p")) {
            const h = document.createElement(n.tagName.toLowerCase());
            [...n.querySelectorAll("p")].forEach((p, i) => {
              if (i) h.append(document.createTextNode(" "));
              copyInline4(document, p, h);
            });
            trimNode4(h);
            if (hasContent4(h)) out.push(h);
          } else {
            walk(n);
          }
          return;
        }
        if (!loose) loose = document.createElement("p");
        const tmp = document.createElement("span");
        tmp.append(n.cloneNode(true));
        copyInline4(document, tmp, loose);
      });
      flush();
    };
    walk(root);
    return out;
  }
  function parse12(element, { document }) {
    const root = element.querySelector(".container-fluid > div") || element;
    const media = [];
    const content = [];
    [...root.children].forEach((c) => {
      if (c.matches(".divider, .anchor-tag") || !hasContent4(c)) return;
      if (c.matches(".cmp-image")) {
        const img = makeImg8(document, desktopImg4(c));
        if (!img) return;
        const link3 = c.querySelector("a[href]");
        const href = link3 ? linkHref4(link3.getAttribute("href"), link3) : "";
        if (href && !media.length) {
          const a = document.createElement("a");
          a.href = href;
          a.append(img);
          media.push(a);
        } else if (!media.length) {
          media.push(img);
        } else {
          const p = document.createElement("p");
          p.append(img);
          content.push(p);
        }
      } else if (c.matches(".button")) {
        c.querySelectorAll("a").forEach((link3) => {
          const label = clean11((link3.querySelector(".btn-text") || link3).textContent);
          const href = linkHref4(link3.getAttribute("data-video-src") || link3.getAttribute("href"), link3);
          if (!label) return;
          const p = document.createElement("p");
          if (href) {
            const a = document.createElement("a");
            a.href = href;
            a.textContent = label;
            p.append(a);
          } else {
            p.textContent = label;
          }
          content.push(p);
        });
      } else {
        content.push(...richNodes4(document, c.querySelector(".richtext__container") || c));
      }
    });
    const cells = [];
    if (media.length) cells.push([media]);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-callout", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-overlay.js
  var DNB5 = false;
  var ORIGIN11 = "https://www.chevronlubricants.com";
  var HEADINGS5 = "h1, h2, h3, h4, h5, h6";
  var BLOCKS5 = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote";
  function absUrl8(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN11).href;
    } catch (e) {
      return url;
    }
  }
  function clean12(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function youTubeId5(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
    return m ? m[1] : "";
  }
  function linkHref5(href, srcLink) {
    const raw = (href || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    if (raw.startsWith("#")) return raw;
    const id = youTubeId5(raw);
    if (id) return `https://www.youtube.com/watch?v=${id}${DNB5 ? "#_dnb" : ""}`;
    const url = absUrl8(raw);
    const blank = srcLink && (srcLink.getAttribute("target") || "").toLowerCase() === "_blank";
    return blank && url && !url.includes("#") ? `${url}#_blank` : url;
  }
  function hasContent5(el) {
    return !!(clean12(el.textContent) || el.querySelector("img, video, iframe, [data-video-src]"));
  }
  function makeImg9(document, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || /\.pdf(\?|#|$)/i.test(src)) return null;
    const img = document.createElement("img");
    img.src = absUrl8(src);
    img.alt = clean12(srcImg.getAttribute("alt"));
    return img;
  }
  function desktopImg5(container) {
    return container.querySelector("img.mobile-only-hidden") || container.querySelector("img");
  }
  function copyInline5(document, from, to) {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(document.createTextNode(n.textContent.replace(/[\s ]+/g, " ")));
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName;
      if (tag === "BR") {
        to.append(document.createElement("br"));
        return;
      }
      if (tag === "IMG") {
        const img = makeImg9(document, n);
        if (img) to.append(img);
        return;
      }
      if (tag === "A") {
        const href = linkHref5(n.getAttribute("data-video-src") || n.getAttribute("href"), n);
        if (!href) {
          copyInline5(document, n, to);
          return;
        }
        const a = document.createElement("a");
        a.href = href;
        copyInline5(document, n, a);
        if (clean12(a.textContent) || a.querySelector("img")) to.append(a);
        return;
      }
      const map = { B: "strong", STRONG: "strong", I: "em", EM: "em", SUP: "sup", SUB: "sub", U: "u" };
      if (map[tag]) {
        const el = document.createElement(map[tag]);
        copyInline5(document, n, el);
        if (clean12(el.textContent) || el.querySelector("img")) {
          const lead = el.firstChild && el.firstChild.nodeType === 3 && /^\s/.test(el.firstChild.textContent);
          const trail = el.lastChild && el.lastChild.nodeType === 3 && /\s$/.test(el.lastChild.textContent);
          if (lead) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, "");
          if (trail) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, "");
          if (lead) to.append(document.createTextNode(" "));
          to.append(el);
          if (trail) to.append(document.createTextNode(" "));
        } else if (el.textContent) to.append(document.createTextNode(" "));
        return;
      }
      copyInline5(document, n, to);
    });
  }
  function trimNode5(el) {
    const edge = (first) => {
      for (; ; ) {
        const n = first ? el.firstChild : el.lastChild;
        if (!n) return;
        if (n.nodeType === 3) {
          const t = first ? n.textContent.replace(/^\s+/, "") : n.textContent.replace(/\s+$/, "");
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
    edge(true);
    edge(false);
    el.normalize();
  }
  function blockFrom5(document, src) {
    const tag = src.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const list = document.createElement(tag);
      src.querySelectorAll(":scope > li").forEach((li) => {
        const n = document.createElement("li");
        copyInline5(document, li, n);
        trimNode5(n);
        if (hasContent5(n)) list.append(n);
      });
      return list.children.length ? list : null;
    }
    const el = document.createElement(["table", "blockquote"].includes(tag) ? "p" : tag);
    copyInline5(document, src, el);
    trimNode5(el);
    if (/^h[1-6]$/.test(tag) && !el.querySelector("a, img") && clean12([...el.querySelectorAll("strong")].map((b) => b.textContent).join(" ")) === clean12(el.textContent)) {
      el.textContent = clean12(el.textContent);
    }
    return hasContent5(el) ? el : null;
  }
  function richNodes5(document, root) {
    const out = [];
    let loose = null;
    const flush = () => {
      if (loose) {
        trimNode5(loose);
        if (hasContent5(loose)) out.push(loose);
      }
      loose = null;
    };
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 1 && (n.matches(BLOCKS5) || n.querySelector(BLOCKS5) || n.tagName === "DIV")) {
          flush();
          if (n.matches(BLOCKS5) && !n.querySelector(BLOCKS5)) {
            const b = blockFrom5(document, n);
            if (b) out.push(b);
          } else if (n.matches(HEADINGS5) && n.querySelector("p")) {
            const h = document.createElement(n.tagName.toLowerCase());
            [...n.querySelectorAll("p")].forEach((p, i) => {
              if (i) h.append(document.createTextNode(" "));
              copyInline5(document, p, h);
            });
            trimNode5(h);
            if (hasContent5(h)) out.push(h);
          } else {
            walk(n);
          }
          return;
        }
        if (!loose) loose = document.createElement("p");
        const tmp = document.createElement("span");
        tmp.append(n.cloneNode(true));
        copyInline5(document, tmp, loose);
      });
      flush();
    };
    walk(root);
    return out;
  }
  function joinWrapped(document, nodes) {
    const out = [];
    let run = null;
    nodes.forEach((n) => {
      const plain = n.tagName === "P" && !n.querySelector("a, img");
      if (plain && run) {
        run.append(document.createTextNode(" "));
        while (n.firstChild) run.append(n.firstChild);
      } else {
        out.push(n);
        run = plain ? n : null;
      }
      if (run && /[.!?:]["”’)]?$/.test(clean12(run.textContent))) run = null;
    });
    return out;
  }
  function parse13(element, { document }) {
    const container = element.querySelector(".adaptive-image__container") || element;
    const imgSrc2 = [...container.querySelectorAll(":scope > img.mobile-only-hidden, :scope > img")][0] || desktopImg5(container);
    const img = makeImg9(document, imgSrc2);
    const content = [];
    const overlay = container.querySelector('[class*="overlay"] .richtext__container, [class*="Overlay"] .richtext__container');
    if (overlay) content.push(...joinWrapped(document, richNodes5(document, overlay)));
    const seen = /* @__PURE__ */ new Set();
    container.querySelectorAll(".buttonOverlay a[href]").forEach((link3) => {
      const label = clean12((link3.querySelector(".btn-text") || link3).textContent);
      const href = linkHref5(link3.getAttribute("href"), link3);
      if (!label || !href || seen.has(`${href}|${label}`)) return;
      seen.add(`${href}|${label}`);
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      content.push(p);
    });
    const cells = [];
    if (img) cells.push([[img]]);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-overlay", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  var ORIGIN12 = "https://www.chevronlubricants.com";
  function absUrl9(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN12).href;
    } catch (e) {
      return url;
    }
  }
  function ctaClean(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function ctaHref(srcLink) {
    const raw = (srcLink && srcLink.getAttribute("href") || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    if (raw.startsWith("#")) return raw;
    return absUrl9(raw);
  }
  function ctaImg(document, container) {
    const src = container && (container.querySelector("img.mobile-only-hidden") || container.querySelector("img"));
    const url = src && (src.getAttribute("data-src") || src.getAttribute("src"));
    if (!url || url.startsWith("data:")) return null;
    const img = document.createElement("img");
    img.src = absUrl9(url);
    img.alt = ctaClean(src.getAttribute("alt"));
    return img;
  }
  function ctaCell(document, href, text, icon) {
    const p = document.createElement("p");
    if (icon) p.append(icon);
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = text || href;
      if (icon) p.append(document.createTextNode(" "));
      p.append(a);
    } else if (text) {
      p.append(document.createTextNode(text));
    }
    return [p];
  }
  function ctaItems(element) {
    return [...element.querySelectorAll(":scope > .multi-column__container > .multi-column__content > .multi-column__item")].filter((item) => ctaClean(item.textContent) || item.querySelector("img"));
  }
  function socialCells(document, element) {
    const cells = [];
    const seen = /* @__PURE__ */ new Map();
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = ctaHref(a);
      if (!href) return;
      let entry = seen.get(href);
      if (!entry) {
        entry = { href, icon: null, text: "" };
        seen.set(href, entry);
        cells.push(entry);
      }
      if (!entry.icon && a.querySelector("img")) entry.icon = ctaImg(document, a);
      const text = ctaClean(a.textContent);
      if (text && !entry.text) entry.text = text;
    });
    return cells.map((c) => ctaCell(document, c.href, c.text || c.icon && c.icon.alt || "", c.icon));
  }
  function panelCells(document, element) {
    const cells = [];
    const text = element.querySelector(".panel-with-button__text");
    if (text && ctaClean(text.textContent)) cells.push(ctaCell(document, "", ctaClean(text.textContent)));
    element.querySelectorAll(".panel-with-button__button a[href], .btn-wrapper a[href]").forEach((a) => {
      const label = ctaClean((a.querySelector(".btn-text") || a).textContent);
      if (label) cells.push(ctaCell(document, ctaHref(a), label));
    });
    return cells;
  }
  function linkRowCells(document, element) {
    const groups = [];
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = ctaHref(a);
      const text = ctaClean(a.textContent);
      if (!href || !text) return;
      const last = groups[groups.length - 1];
      if (last && last.href === href) last.text = `${last.text}${/\s$/.test(a.textContent.replace(/ /g, " ")) || /^\s/.test(a.textContent.replace(/ /g, " ")) ? " " : ""}${text}`;
      else groups.push({ href, text });
    });
    return groups.map((g) => ctaCell(document, g.href, ctaClean(g.text)));
  }
  var RED_BUTTON = /(^|\s)bg-(havoline|red)(\s|$)/;
  function multiColumnCells(document, element) {
    const cells = [];
    let buttonCount = 0;
    let redCount = 0;
    let iconOnly = true;
    ctaItems(element).forEach((item) => {
      const buttons = [...item.querySelectorAll(".button a[href], .btn-wrapper a[href]")];
      const images = [...item.querySelectorAll(".cmp-image")];
      if (buttons.length) {
        iconOnly = false;
        buttons.forEach((a) => {
          const label = ctaClean((a.querySelector(".btn-text") || a).textContent);
          if (!label) return;
          buttonCount += 1;
          if (RED_BUTTON.test(a.getAttribute("class") || "")) redCount += 1;
          cells.push(ctaCell(document, ctaHref(a), label));
        });
      } else if (images.length) {
        if (ctaClean(item.textContent)) iconOnly = false;
        images.forEach((cmp) => {
          const link3 = cmp.querySelector("a[href]");
          const icon = ctaImg(document, cmp);
          const href = ctaHref(link3);
          if (!href || !icon || !icon.alt || ctaClean(link3.textContent)) iconOnly = false;
          cells.push(ctaCell(document, href, icon ? icon.alt : "", icon));
        });
      } else if (ctaClean(item.textContent)) {
        iconOnly = false;
        cells.push(ctaCell(document, "", ctaClean(item.textContent)));
      }
    });
    const variants = [];
    if (buttonCount && redCount === buttonCount && buttonCount === cells.length) variants.push("red");
    else if (cells.length && iconOnly) variants.push("icons");
    return { cells, variants };
  }
  function parseExpertise(element, document) {
    let row;
    let variants = [];
    const before = [];
    if (element.matches(".social-media")) {
      const title = element.querySelector(".social-media__title");
      if (title && ctaClean(title.textContent)) {
        const p = document.createElement("p");
        p.textContent = ctaClean(title.textContent);
        before.push(p);
      }
      row = socialCells(document, element);
    } else if (element.matches(".panel-with-button")) {
      row = panelCells(document, element);
    } else if (element.matches(".richtext")) {
      row = linkRowCells(document, element);
      variants = ["links"];
    } else {
      ({ cells: row, variants } = multiColumnCells(document, element));
    }
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", variants, cells });
    element.replaceWith(...before, block);
  }
  function parse14(element, { document }) {
    if (!element.matches(".multi-column__container")) {
      parseExpertise(element, document);
      return;
    }
    const items4 = [...element.querySelectorAll(".multi-column__content > .multi-column__item")];
    const row = [];
    items4.forEach((item) => {
      const links = [...item.querySelectorAll(".btn-wrapper a[href]")];
      if (!links.length) return;
      const cell = links.map((srcLink) => {
        const a = document.createElement("a");
        a.href = absUrl9(srcLink.getAttribute("href"));
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

  // tools/importer/parsers/columns-promo.js
  var ORIGIN13 = "https://www.chevronlubricants.com";
  function absUrl10(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN13).href;
    } catch (e) {
      return url;
    }
  }
  function buildImage(document, item) {
    const src = item.querySelector("img.tablet-up-hidden") || item.querySelector("img");
    if (!src) return null;
    const img = document.createElement("img");
    img.src = absUrl10(src.getAttribute("data-src") || src.getAttribute("src"));
    img.alt = (src.getAttribute("alt") || "").trim();
    return img;
  }
  function promoClean(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function promoImage(document, cmp) {
    const src = cmp.querySelector("img.mobile-only-hidden") || cmp.querySelector("img");
    const url = src && (src.getAttribute("data-src") || src.getAttribute("src"));
    if (!url || url.startsWith("data:")) return null;
    const img = document.createElement("img");
    img.src = absUrl10(url);
    img.alt = promoClean(src.getAttribute("alt"));
    const p = document.createElement("p");
    const link3 = cmp.querySelector("a[href]");
    const href = link3 && (link3.getAttribute("href") || "").trim();
    if (href && href !== "#") {
      const a = document.createElement("a");
      a.href = href.startsWith("#") ? href : absUrl10(href);
      a.append(img);
      p.append(a);
    } else {
      p.append(img);
    }
    return p;
  }
  function parseExpertise2(element, document) {
    const items4 = [...element.querySelectorAll(":scope > .multi-column__container > .multi-column__content > .multi-column__item")].filter((item) => promoClean(item.textContent) || item.querySelector("img"));
    const row = items4.map((item) => {
      const cell = [];
      [...item.children].forEach((c) => {
        if (c.matches(".cmp-image")) {
          const p = promoImage(document, c);
          if (p) cell.push(p);
        } else if (c.matches(".richtext")) {
          c.querySelectorAll("p").forEach((srcP) => {
            const text = promoClean(srcP.textContent);
            if (!text) return;
            const p = document.createElement("p");
            const bold = srcP.querySelector("b, strong");
            if (bold && promoClean(bold.textContent) === text) {
              const strong = document.createElement("strong");
              strong.textContent = text;
              p.append(strong);
            } else {
              p.textContent = text;
            }
            cell.push(p);
          });
        }
      });
      return cell;
    }).filter((cell) => cell.length);
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-promo", cells });
    element.replaceWith(block);
  }
  function parse15(element, { document }) {
    if (!element.matches(".multi-column__container")) {
      parseExpertise2(element, document);
      return;
    }
    const items4 = [...element.querySelectorAll(".multi-column__content > .multi-column__item")].filter((item) => item.querySelector("img") || item.textContent.trim());
    const row = items4.map((item) => {
      const cell = [];
      const img = buildImage(document, item);
      const imgLink = item.querySelector(".cmp-image a[href]");
      if (img && imgLink) {
        const a = document.createElement("a");
        a.href = absUrl10(imgLink.getAttribute("href"));
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

  // tools/importer/parsers/cards-service.js
  var ORIGIN14 = "https://www.chevronlubricants.com";
  var HEADINGS6 = "h1, h2, h3, h4, h5, h6";
  function absUrl11(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN14).href;
    } catch (e) {
      return url;
    }
  }
  function clean13(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function linkHref6(href) {
    const raw = (href || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    if (raw.startsWith("#")) return raw;
    return absUrl11(raw);
  }
  function hasContent6(el) {
    return !!(clean13(el.textContent) || el.querySelector("img"));
  }
  function children(item) {
    return [...item.children].filter((c) => !c.matches(".divider, .anchor-tag, .repeating-image-overlay, script, style") && hasContent6(c));
  }
  function items(element) {
    return [...element.querySelectorAll(":scope > .multi-column__container > .multi-column__content > .multi-column__item")].filter((item) => children(item).length);
  }
  function makeImg10(document, cmp) {
    const srcImg = cmp && (cmp.querySelector("img.mobile-only-hidden") || cmp.querySelector("img"));
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:")) return null;
    const img = document.createElement("img");
    img.src = absUrl11(src);
    img.alt = clean13(srcImg.getAttribute("alt"));
    return img;
  }
  function imageLink(cmp) {
    const a = cmp && cmp.querySelector("a[href]");
    return a ? linkHref6(a.getAttribute("href")) : "";
  }
  function lines(richtext) {
    const root = richtext.querySelector(".richtext__container") || richtext;
    let blocks = [...root.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li")].filter((b) => !b.querySelector("p, li"));
    if (!blocks.length) blocks = [root];
    return blocks.map((b) => {
      const text = clean13(b.textContent);
      const bolds = [...b.querySelectorAll("b, strong")].map((s) => s.textContent).join(" ");
      const link3 = b.querySelector("a[href]");
      return {
        text,
        bold: !!text && (b.matches(HEADINGS6) || clean13(bolds) === text),
        href: link3 ? linkHref6(link3.getAttribute("href")) : ""
      };
    }).filter((l) => l.text);
  }
  function makeTitle(document, text, href) {
    const h3 = document.createElement("h3");
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      h3.append(a);
    } else {
      h3.textContent = text;
    }
    return h3;
  }
  function para4(document, text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function textCell(document, comps, fallbackHref) {
    let title = "";
    let titleHref = "";
    const desc = [];
    comps.forEach((c) => {
      if (c.matches(".title")) {
        const main = c.querySelector(".section-heading");
        const sub = c.querySelector(".sub-heading");
        if (main && clean13(main.textContent) && !title) {
          title = clean13(main.textContent);
          const a = main.querySelector("a[href]");
          if (a) titleHref = linkHref6(a.getAttribute("href"));
        } else if (main && clean13(main.textContent)) {
          desc.push(clean13(main.textContent));
        }
        if (sub && clean13(sub.textContent)) desc.push(clean13(sub.textContent));
        return;
      }
      const ls = lines(c);
      if (!ls.length) return;
      let i = 0;
      if (!title) {
        const anyBold = ls.some((l) => l.bold);
        const head = anyBold ? [] : ls.slice();
        if (anyBold) while (i < ls.length && ls[i].bold) {
          head.push(ls[i]);
          i += 1;
        }
        else i = ls.length;
        title = head.map((l) => l.text).join(" ");
        const linked = head.find((l) => l.href);
        if (linked) titleHref = linked.href;
      }
      ls.slice(i).forEach((l) => desc.push(l.text));
    });
    const cell = [];
    if (title) cell.push(makeTitle(document, title, titleHref || fallbackHref));
    desc.forEach((t) => cell.push(para4(document, t)));
    return cell;
  }
  function nestedTile(document, item) {
    const nested = item.querySelector(":scope > .multi-column");
    const parts = items(nested);
    const iconItem = parts.find((p) => p.querySelector(".cmp-image"));
    const icon = iconItem ? iconItem.querySelector(".cmp-image") : null;
    const textComps = parts.filter((p) => p !== iconItem).flatMap((p) => children(p));
    const img = makeImg10(document, icon);
    return [img ? [img] : [], textCell(document, textComps, imageLink(icon))];
  }
  function flatTile(document, item) {
    const comps = children(item);
    const images = comps.filter((c) => c.matches(".cmp-image"));
    const icon = images[0] || null;
    const extra = images.slice(1).map(imageLink).find(Boolean) || "";
    const text = comps.filter((c) => !c.matches(".cmp-image"));
    const img = makeImg10(document, icon);
    return [img ? [img] : [], textCell(document, text, imageLink(icon) || extra)];
  }
  function parse16(element, { document }) {
    const cells = items(element).map((item) => {
      const comps = children(item);
      if (comps.length === 1 && comps[0].matches(".multi-column")) return nestedTile(document, item);
      return flatTile(document, item);
    }).filter(([icon, text]) => icon.length || text.length);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-service", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-resource.js
  var ORIGIN15 = "https://www.chevronlubricants.com";
  var HEADINGS7 = "h1, h2, h3, h4, h5, h6";
  var BLOCKS6 = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote";
  function absUrl12(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN15).href;
    } catch (e) {
      return url;
    }
  }
  function clean14(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function youTubeId6(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
    return m ? m[1] : "";
  }
  function linkHref7(href, srcLink) {
    const raw = (href || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    const id = youTubeId6(raw);
    if (id) return `https://www.youtube.com/watch?v=${id}#_dnb`;
    const url = absUrl12(raw);
    const blank = srcLink && (srcLink.getAttribute("target") || "").toLowerCase() === "_blank";
    return blank && url && !url.includes("#") ? `${url}#_blank` : url;
  }
  function hasContent7(el) {
    return !!(clean14(el.textContent) || el.querySelector("img, video, iframe, [data-video-src]"));
  }
  function items2(element) {
    return [...element.querySelectorAll(":scope > .multi-column__container > .multi-column__content > .multi-column__item")].filter((item) => [...item.children].some((c) => !c.matches(".divider, .anchor-tag, .repeating-image-overlay") && hasContent7(c)));
  }
  function makeImg11(document, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || /\.pdf(\?|#|$)/i.test(src)) return null;
    const img = document.createElement("img");
    img.src = absUrl12(src);
    img.alt = clean14(srcImg.getAttribute("alt"));
    return img;
  }
  function desktopImg6(container) {
    return container.querySelector("img.mobile-only-hidden") || container.querySelector("img");
  }
  function hasImage(cmp) {
    const img = desktopImg6(cmp);
    const src = img ? img.getAttribute("data-src") || img.getAttribute("src") || "" : "";
    return !!src && !src.startsWith("data:") && !/\.pdf(\?|#|$)/i.test(src);
  }
  var isBoldOnly = (b) => b.tagName === "P" && !b.querySelector("a, img") && clean14(b.textContent) && clean14([...b.querySelectorAll("strong")].map((s) => s.textContent).join(" ")) === clean14(b.textContent);
  function mergeBoldTitle(document, nodes) {
    if (nodes.length < 2 || !nodes.every(isBoldOnly)) return nodes;
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = clean14(nodes.map((n) => n.textContent).join(" "));
    p.append(strong);
    return [p];
  }
  function copyInline6(document, from, to) {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(document.createTextNode(n.textContent.replace(/[\s ]+/g, " ")));
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName;
      if (tag === "BR") {
        to.append(document.createElement("br"));
        return;
      }
      if (tag === "IMG") {
        const img = makeImg11(document, n);
        if (img) to.append(img);
        return;
      }
      if (tag === "A") {
        const href = linkHref7(n.getAttribute("data-video-src") || n.getAttribute("href"), n);
        if (!href) {
          copyInline6(document, n, to);
          return;
        }
        const a = document.createElement("a");
        a.href = href;
        copyInline6(document, n, a);
        if (clean14(a.textContent) || a.querySelector("img")) to.append(a);
        return;
      }
      const map = { B: "strong", STRONG: "strong", I: "em", EM: "em", SUP: "sup", SUB: "sub", U: "u" };
      if (map[tag]) {
        const el = document.createElement(map[tag]);
        copyInline6(document, n, el);
        if (clean14(el.textContent) || el.querySelector("img")) {
          const lead = el.firstChild && el.firstChild.nodeType === 3 && /^\s/.test(el.firstChild.textContent);
          const trail = el.lastChild && el.lastChild.nodeType === 3 && /\s$/.test(el.lastChild.textContent);
          if (lead) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, "");
          if (trail) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, "");
          if (lead) to.append(document.createTextNode(" "));
          to.append(el);
          if (trail) to.append(document.createTextNode(" "));
        } else if (el.textContent) to.append(document.createTextNode(" "));
        return;
      }
      copyInline6(document, n, to);
    });
  }
  function trimNode6(el) {
    const edge = (first) => {
      for (; ; ) {
        const n = first ? el.firstChild : el.lastChild;
        if (!n) return;
        if (n.nodeType === 3) {
          const t = first ? n.textContent.replace(/^\s+/, "") : n.textContent.replace(/\s+$/, "");
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
    edge(true);
    edge(false);
    el.normalize();
  }
  function blockFrom6(document, src) {
    const tag = src.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const list = document.createElement(tag);
      src.querySelectorAll(":scope > li").forEach((li) => {
        const n = document.createElement("li");
        copyInline6(document, li, n);
        trimNode6(n);
        if (hasContent7(n)) list.append(n);
      });
      return list.children.length ? list : null;
    }
    const el = document.createElement(["table", "blockquote"].includes(tag) ? "p" : tag);
    copyInline6(document, src, el);
    trimNode6(el);
    if (/^h[1-6]$/.test(tag) && !el.querySelector("a, img") && clean14([...el.querySelectorAll("strong")].map((b) => b.textContent).join(" ")) === clean14(el.textContent)) {
      el.textContent = clean14(el.textContent);
    }
    return hasContent7(el) ? el : null;
  }
  function richNodes6(document, root) {
    const out = [];
    let loose = null;
    const flush = () => {
      if (loose) {
        trimNode6(loose);
        if (hasContent7(loose)) out.push(loose);
      }
      loose = null;
    };
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 1 && (n.matches(BLOCKS6) || n.querySelector(BLOCKS6) || n.tagName === "DIV")) {
          flush();
          if (n.matches(BLOCKS6) && !n.querySelector(BLOCKS6)) {
            const b = blockFrom6(document, n);
            if (b) out.push(b);
          } else if (n.matches(HEADINGS7) && n.querySelector("p")) {
            const h = document.createElement(n.tagName.toLowerCase());
            [...n.querySelectorAll("p")].forEach((p, i) => {
              if (i) h.append(document.createTextNode(" "));
              copyInline6(document, p, h);
            });
            trimNode6(h);
            if (hasContent7(h)) out.push(h);
          } else {
            walk(n);
          }
          return;
        }
        if (!loose) loose = document.createElement("p");
        const tmp = document.createElement("span");
        tmp.append(n.cloneNode(true));
        copyInline6(document, tmp, loose);
      });
      flush();
    };
    walk(root);
    return out;
  }
  function imageLinkHref(cmp, card) {
    const link3 = cmp.querySelector("a[href]");
    if (!link3) return "";
    const href = linkHref7(link3.getAttribute("data-video-src") || link3.getAttribute("href"), link3);
    if (href) return href;
    return card.video || "";
  }
  function linkedImage(document, cmp, card) {
    const img = makeImg11(document, desktopImg6(cmp));
    if (!img) return null;
    const href = imageLinkHref(cmp, card);
    if (!href) return img;
    const a = document.createElement("a");
    a.href = href;
    a.append(img);
    return a;
  }
  function extraImage(document, cmp, card) {
    const img = makeImg11(document, desktopImg6(cmp));
    if (!img) return null;
    const href = imageLinkHref(cmp, card);
    const p = document.createElement("p");
    if (!href) {
      p.append(img);
      return p;
    }
    const a = document.createElement("a");
    a.href = href;
    a.textContent = (img.alt || "").replace(/\s*button$/i, "") || href;
    p.append(a);
    return p;
  }
  function videoInfo(video) {
    const holder = video.querySelector("[data-video-src]");
    const id = holder ? youTubeId6(holder.getAttribute("data-video-src")) : "";
    return {
      href: id ? `https://www.youtube.com/watch?v=${id}#_dnb` : "",
      label: clean14((video.querySelector(".videoLinkText") || video).textContent),
      poster: video.querySelector(".image-container img") || video.querySelector("img")
    };
  }
  function buttonNodes(document, button) {
    return [...button.querySelectorAll("a")].map((link3) => {
      const label = clean14((link3.querySelector(".btn-text") || link3).textContent);
      if (!label) return null;
      const p = document.createElement("p");
      const href = linkHref7(link3.getAttribute("data-video-src") || link3.getAttribute("href"), link3);
      if (!href) {
        p.textContent = label;
        return p;
      }
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      return p;
    }).filter(Boolean);
  }
  function titleNodes(document, title) {
    const out = [];
    const main = title.querySelector(".section-heading");
    if (main && clean14(main.textContent)) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = clean14(main.textContent);
      p.append(strong);
      out.push(p);
    }
    const sub = title.querySelector(".sub-heading");
    if (sub && clean14(sub.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean14(sub.textContent);
      out.push(p);
    }
    return out;
  }
  var isMeaningful = (c) => !c.matches(".anchor-tag, .repeating-image-overlay, script, style") && (c.matches(".divider") || hasContent7(c));
  function nextMeaningful(c) {
    let n = c.nextElementSibling;
    while (n && !isMeaningful(n)) n = n.nextElementSibling;
    return n;
  }
  function itemCards(document, item, opts) {
    const kids = [...item.children].filter(isMeaningful).filter((c) => !c.matches(".cmp-image") || hasImage(c));
    const textOnly = !kids.some((c) => c.matches(".cmp-image, .video"));
    const cards = [];
    let cur = null;
    const newCard = () => {
      cur = { image: null, text: [], hasText: false, video: "" };
      cards.push(cur);
      return cur;
    };
    const addText = (nodes) => {
      if (!nodes.length) return;
      if (!cur) newCard();
      cur.text.push(...nodes);
      cur.hasText = true;
    };
    kids.forEach((c) => {
      if (c.matches(".divider")) {
        if (textOnly && cur && cur.hasText) cur = null;
        return;
      }
      if (c.matches(".cmp-image")) {
        const next = nextMeaningful(c);
        if (!cur || cur.hasText && cur.image && next && next.matches(".richtext")) newCard();
        if (!cur.image) {
          const v = kids.slice(kids.indexOf(c)).find((k) => k.matches(".video"));
          if (v) cur.video = videoInfo(v).href;
          cur.image = c;
        } else {
          const extra = extraImage(document, c, cur);
          if (extra) addText([extra]);
        }
        return;
      }
      if (c.matches(".video")) {
        const v = videoInfo(c);
        if (!cur) newCard();
        if (v.label && v.href) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = v.href;
          a.textContent = v.label;
          p.append(a);
          addText([p]);
        } else if (v.poster && !cur.image) {
          cur.image = c;
          cur.video = v.href;
        } else if (v.href) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = v.href;
          a.textContent = v.label || v.href;
          p.append(a);
          addText([p]);
        }
        return;
      }
      if (c.matches(".richtext")) {
        if (c.querySelector(".richtext__container.bg-isoclean")) opts.blueCaption = true;
        addText(mergeBoldTitle(document, richNodes6(document, c.querySelector(".richtext__container") || c)));
        return;
      }
      if (c.matches(".button")) {
        addText(buttonNodes(document, c));
        return;
      }
      if (c.matches(".title")) {
        addText(titleNodes(document, c));
        return;
      }
      addText(richNodes6(document, c));
    });
    return cards;
  }
  function imageCell2(document, card) {
    if (!card.image) return [];
    if (card.image.matches(".video")) {
      const v = videoInfo(card.image);
      const img = makeImg11(document, v.poster);
      if (!img) return [];
      if (!v.href) return [img];
      const a = document.createElement("a");
      a.href = v.href;
      a.append(img);
      return [a];
    }
    const node = linkedImage(document, card.image, card);
    return node ? [node] : [];
  }
  function parse17(element, { document }) {
    const opts = { blueCaption: false };
    const columns = items2(element).map((item) => itemCards(document, item, opts).filter((c) => c.image || c.hasText));
    const cells = [];
    const depth = Math.max(0, ...columns.map((c) => c.length));
    for (let i = 0; i < depth; i += 1) {
      columns.forEach((col) => {
        const card = col[i];
        if (card) cells.push([imageCell2(document, card), card.text]);
      });
    }
    const variants = opts.blueCaption ? ["blue-caption"] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-resource", variants, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  var DNB6 = false;
  var ORIGIN16 = "https://www.chevronlubricants.com";
  var HEADINGS8 = "h1, h2, h3, h4, h5, h6";
  var BLOCKS7 = "p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote";
  function absUrl13(url) {
    if (!url) return "";
    try {
      return new URL(url.trim(), ORIGIN16).href;
    } catch (e) {
      return url;
    }
  }
  function clean15(text) {
    return (text || "").replace(/[\s ​]+/g, " ").trim();
  }
  function youTubeId7(src) {
    if (!src) return "";
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/) || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
    return m ? m[1] : "";
  }
  function linkHref8(href, srcLink) {
    const raw = (href || "").trim();
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return "";
    if (raw.startsWith("#")) return raw;
    const id = youTubeId7(raw);
    if (id) return `https://www.youtube.com/watch?v=${id}${DNB6 ? "#_dnb" : ""}`;
    const url = absUrl13(raw);
    const blank = srcLink && (srcLink.getAttribute("target") || "").toLowerCase() === "_blank";
    return blank && url && !url.includes("#") ? `${url}#_blank` : url;
  }
  function hasContent8(el) {
    return !!(clean15(el.textContent) || el.querySelector("img, video, iframe, [data-video-src]"));
  }
  function makeImg12(document, srcImg) {
    if (!srcImg) return null;
    const src = srcImg.getAttribute("data-src") || srcImg.getAttribute("src") || "";
    if (!src || src.startsWith("data:") || /\.pdf(\?|#|$)/i.test(src)) return null;
    const img = document.createElement("img");
    img.src = absUrl13(src);
    img.alt = clean15(srcImg.getAttribute("alt"));
    return img;
  }
  function desktopImg7(container) {
    return container.querySelector("img.mobile-only-hidden") || container.querySelector("img");
  }
  function copyInline7(document, from, to) {
    from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        to.append(document.createTextNode(n.textContent.replace(/[\s ]+/g, " ")));
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName;
      if (tag === "BR") {
        to.append(document.createElement("br"));
        return;
      }
      if (tag === "IMG") {
        const img = makeImg12(document, n);
        if (img) to.append(img);
        return;
      }
      if (tag === "A") {
        const href = linkHref8(n.getAttribute("data-video-src") || n.getAttribute("href"), n);
        if (!href) {
          copyInline7(document, n, to);
          return;
        }
        const a = document.createElement("a");
        a.href = href;
        copyInline7(document, n, a);
        if (clean15(a.textContent) || a.querySelector("img")) to.append(a);
        return;
      }
      const map = { B: "strong", STRONG: "strong", I: "em", EM: "em", SUP: "sup", SUB: "sub", U: "u" };
      if (map[tag]) {
        const el = document.createElement(map[tag]);
        copyInline7(document, n, el);
        if (clean15(el.textContent) || el.querySelector("img")) {
          const lead = el.firstChild && el.firstChild.nodeType === 3 && /^\s/.test(el.firstChild.textContent);
          const trail = el.lastChild && el.lastChild.nodeType === 3 && /\s$/.test(el.lastChild.textContent);
          if (lead) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, "");
          if (trail) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, "");
          if (lead) to.append(document.createTextNode(" "));
          to.append(el);
          if (trail) to.append(document.createTextNode(" "));
        } else if (el.textContent) to.append(document.createTextNode(" "));
        return;
      }
      copyInline7(document, n, to);
    });
  }
  function trimNode7(el) {
    const edge = (first) => {
      for (; ; ) {
        const n = first ? el.firstChild : el.lastChild;
        if (!n) return;
        if (n.nodeType === 3) {
          const t = first ? n.textContent.replace(/^\s+/, "") : n.textContent.replace(/\s+$/, "");
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
    edge(true);
    edge(false);
    el.normalize();
  }
  function blockFrom7(document, src) {
    const tag = src.tagName.toLowerCase();
    if (tag === "ul" || tag === "ol") {
      const list = document.createElement(tag);
      src.querySelectorAll(":scope > li").forEach((li) => {
        const n = document.createElement("li");
        copyInline7(document, li, n);
        trimNode7(n);
        if (hasContent8(n)) list.append(n);
      });
      return list.children.length ? list : null;
    }
    const el = document.createElement(["table", "blockquote"].includes(tag) ? "p" : tag);
    copyInline7(document, src, el);
    trimNode7(el);
    if (/^h[1-6]$/.test(tag) && !el.querySelector("a, img") && clean15([...el.querySelectorAll("strong")].map((b) => b.textContent).join(" ")) === clean15(el.textContent)) {
      el.textContent = clean15(el.textContent);
    }
    return hasContent8(el) ? el : null;
  }
  function richNodes7(document, root) {
    const out = [];
    let loose = null;
    const flush = () => {
      if (loose) {
        trimNode7(loose);
        if (hasContent8(loose)) out.push(loose);
      }
      loose = null;
    };
    const walk = (node) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 1 && (n.matches(BLOCKS7) || n.querySelector(BLOCKS7) || n.tagName === "DIV")) {
          flush();
          if (n.matches(BLOCKS7) && !n.querySelector(BLOCKS7)) {
            const b = blockFrom7(document, n);
            if (b) out.push(b);
          } else if (n.matches(HEADINGS8) && n.querySelector("p")) {
            const h = document.createElement(n.tagName.toLowerCase());
            [...n.querySelectorAll("p")].forEach((p, i) => {
              if (i) h.append(document.createTextNode(" "));
              copyInline7(document, p, h);
            });
            trimNode7(h);
            if (hasContent8(h)) out.push(h);
          } else {
            walk(n);
          }
          return;
        }
        if (!loose) loose = document.createElement("p");
        const tmp = document.createElement("span");
        tmp.append(n.cloneNode(true));
        copyInline7(document, tmp, loose);
      });
      flush();
    };
    walk(root);
    return out;
  }
  function components(item) {
    return [...item.children].filter((c) => !c.matches(".divider, .anchor-tag, .repeating-image-overlay, script, style") && hasContent8(c));
  }
  function items3(element) {
    return [...element.querySelectorAll(":scope > .multi-column__container > .multi-column__content > .multi-column__item")].filter((item) => components(item).length);
  }
  var isBoldBlock = (b) => {
    const text = clean15(b.textContent);
    if (!text || b.querySelector("a, img")) return false;
    if (b.matches(HEADINGS8)) return true;
    const bold = [...b.querySelectorAll("strong")].map((s) => clean15(s.textContent)).join(" ");
    return clean15(bold) === text;
  };
  function isDisplaySize(richtext) {
    const size = richtext.querySelector(".richtext__container > div");
    return !!size && ["h1", "h2", "h3", "p1", "p2"].some((k) => size.classList.contains(k));
  }
  function titleHeading(document, nodes, richtext) {
    if (!nodes.length || nodes.some((b) => b.querySelector("a, img"))) return null;
    const text = clean15(nodes.map((b) => b.textContent).join(" "));
    if (!text || text.length > 120) return null;
    const bold = nodes.every((b) => isBoldBlock(b));
    const display = nodes.length === 1 && richtext && isDisplaySize(richtext) && !/\.$/.test(text);
    if (!bold && !display) return null;
    const srcHeading = nodes.find((b) => b.matches(HEADINGS8));
    const h = document.createElement(srcHeading ? srcHeading.tagName.toLowerCase() : "h2");
    h.textContent = text;
    return h;
  }
  function imageNodes(document, cmp, { linkAsText } = {}) {
    const src = desktopImg7(cmp);
    const img = makeImg12(document, src);
    if (!img) return [];
    const link3 = cmp.querySelector("a[href]");
    if (!link3) return [img];
    let href = linkHref8(link3.getAttribute("href"), link3);
    if (!href) return linkAsText ? [] : [img];
    if (!linkAsText && youTubeId7(href) && !href.includes("#")) href += "#_dnb";
    const a = document.createElement("a");
    a.href = href;
    if (linkAsText) {
      a.textContent = (img.alt || "").replace(/\s*button$/i, "") || clean15(link3.textContent) || a.href;
      const p = document.createElement("p");
      p.append(a);
      return [p];
    }
    a.append(img);
    return [a];
  }
  function videoNodes(document, video) {
    const holder = video.querySelector("[data-video-src]");
    const id = holder ? youTubeId7(holder.getAttribute("data-video-src")) : "";
    const img = makeImg12(document, video.querySelector(".image-container img") || video.querySelector("img"));
    if (!id) return img ? [img] : [];
    const a = document.createElement("a");
    a.href = `https://www.youtube.com/watch?v=${id}#_dnb`;
    if (img) a.append(img);
    else a.textContent = a.href;
    return [a];
  }
  function buttonHref(link3) {
    return linkHref8(link3.getAttribute("data-video-src") || link3.getAttribute("href"), link3);
  }
  function buttonNodes2(document, button) {
    return [...button.querySelectorAll("a")].map((link3) => {
      const label = clean15((link3.querySelector(".btn-text") || link3).textContent);
      if (!label) return null;
      const p = document.createElement("p");
      const href = buttonHref(link3);
      if (!href) {
        p.textContent = label;
        return p;
      }
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      p.append(a);
      return p;
    }).filter(Boolean);
  }
  function titleNodes2(document, title) {
    const out = [];
    const main = title.querySelector(".section-heading");
    if (main && clean15(main.textContent)) {
      const h = document.createElement("h2");
      h.textContent = clean15(main.textContent);
      out.push(h);
    }
    const sub = title.querySelector(".sub-heading");
    if (sub && clean15(sub.textContent)) {
      const p = document.createElement("p");
      p.textContent = clean15(sub.textContent);
      out.push(p);
    }
    if (!out.length) title.querySelectorAll(HEADINGS8).forEach((h) => {
      if (clean15(h.textContent)) out.push(blockFrom7(document, h));
    });
    return out.filter(Boolean);
  }
  function textNodes(document, item, state) {
    const out = [];
    components(item).forEach((c) => {
      if (c.matches(".richtext")) {
        const nodes = richNodes7(document, c.querySelector(".richtext__container") || c);
        const heading2 = !state.heading ? titleHeading(document, nodes, c) : null;
        if (heading2) {
          state.heading = true;
          out.push(heading2);
        } else {
          if (nodes.some((n) => n.matches(HEADINGS8))) state.heading = true;
          out.push(...nodes);
        }
      } else if (c.matches(".title")) {
        const nodes = titleNodes2(document, c);
        if (nodes.some((n) => n.matches(HEADINGS8))) state.heading = true;
        out.push(...nodes);
      } else if (c.matches(".button")) {
        out.push(...buttonNodes2(document, c));
      } else if (c.matches(".cmp-image")) {
        out.push(...imageNodes(document, c, { linkAsText: true }));
      } else if (c.matches(".video")) {
        out.push(...videoNodes(document, c));
      } else if (c.matches(".multi-column")) {
        items3(c).forEach((nested) => out.push(...textNodes(document, nested, state)));
      } else {
        out.push(...richNodes7(document, c));
      }
    });
    return out;
  }
  function isMediaItem(item) {
    const comps = components(item);
    return comps.length === 1 && comps[0].matches(".cmp-image, .video");
  }
  function parse18(element, { document }) {
    const all = items3(element);
    const media = all.find(isMediaItem);
    const mediaCell = [];
    if (media) {
      const comp = components(media)[0];
      mediaCell.push(...comp.matches(".video") ? videoNodes(document, comp) : imageNodes(document, comp));
    }
    const state = { heading: false };
    const textCell2 = [];
    all.filter((item) => item !== media).forEach((item) => textCell2.push(...textNodes(document, item, state)));
    const firstText = all.find((item) => item !== media);
    const textFirst = !!(media && firstText && all.indexOf(firstText) < all.indexOf(media));
    const cells = [textFirst ? [textCell2, mediaCell] : [mediaCell, textCell2]];
    const variants = [];
    if (all.some((item) => item.classList.contains("multi-column__item--card-shadow"))) {
      variants.push("card");
    } else if (all.some((item) => item !== media && item.querySelector(".btn-wrapper.btn-align-center"))) {
      variants.push("centered");
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", variants, cells });
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
  var ORIGIN17 = "https://www.chevronlubricants.com";
  var FIND_DISTRIBUTOR = `${ORIGIN17}/en_us/home/where-to-buy/find-a-distributor.html`;
  var KEEP_ABSOLUTE = "data-excat-keep-absolute";
  var FORM_LINKS = {
    "/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html": {
      href: `${ORIGIN17}/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html`,
      text: "Fill out the contact form"
    },
    "/en_us/home/services/pro-services/personal-rec-vehicles/havoline-oil-change-pros.html": {
      href: `${ORIGIN17}/en_us/home/services/pro-services/personal-rec-vehicles/havoline-oil-change-pros.html`,
      text: "Fill out the contact form"
    }
  };
  var DEFAULT_FORM_LINK = { href: `${ORIGIN17}/en_us/home/contact-us.html`, text: "Contact us" };
  var H1_OVERRIDES = {
    "/en_us/home/learning/about-our-brands/industrial-products/industrial-products-faqs.html": "Industrial Products FAQs"
  };
  var HEADINGS9 = "h1, h2, h3, h4, h5, h6";
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
      const link3 = d.querySelector('.distributor__input__container a[href], a[href*="find-a-distributor"]');
      let href = FIND_DISTRIBUTOR;
      if (link3) {
        try {
          href = new URL(link3.getAttribute("href"), ORIGIN17).href;
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
  function setImgSrc(img, src) {
    img.setAttribute("src", src);
    if (img.hasAttribute("data-src")) img.setAttribute("data-src", src);
  }
  var FORM_LINK = "data-excat-form-link";
  function formLink(doc, path) {
    const target = FORM_LINKS[path] || DEFAULT_FORM_LINK;
    const p = doc.createElement("p");
    const a = doc.createElement("a");
    a.setAttribute("href", target.href);
    a.setAttribute(FORM_LINK, "true");
    if (FORM_LINKS[path]) a.setAttribute(KEEP_ABSOLUTE, "true");
    a.textContent = target.text;
    p.appendChild(a);
    return p;
  }
  function removeRequiredFieldNotes(element) {
    element.querySelectorAll(`p, ${HEADINGS9}`).forEach((el) => {
      if (!inTable(el) && /^\*\s*(indicates\s+)?required fields?\.?$/i.test(cleanText2(el.textContent))) el.remove();
    });
  }
  function convertFormElements(element, doc, path) {
    const forms = [...element.querySelectorAll(".salesforce-embed-component form")];
    if (forms.length) removeRequiredFieldNotes(element);
    element.querySelectorAll('.salesforce-embed-component :is(style, script, [class*="salesforce-embed__form__submit"])').forEach((el) => el.remove());
    forms.forEach((f) => f.replaceWith(formLink(doc, path)));
  }
  function convertForms(element, doc, path) {
    const forms = [...element.querySelectorAll(".salesforce-embed-component")];
    if (forms.length) removeRequiredFieldNotes(element);
    forms.forEach((f) => {
      const existing = f.querySelector(`a[${FORM_LINK}]`);
      f.replaceWith(existing ? existing.closest("p") || existing : formLink(doc, path));
    });
    element.querySelectorAll(`a[${FORM_LINK}]`).forEach((a) => a.removeAttribute(FORM_LINK));
    if (FORM_LINKS[path]) {
      element.querySelectorAll("a[href]").forEach((a) => {
        if (a.getAttribute("href") === FORM_LINKS[path].href) a.setAttribute(KEEP_ABSOLUTE, "true");
      });
    }
  }
  function convertButtons(element, doc) {
    element.querySelectorAll(".button a[href]").forEach((a) => {
      if (inTable(a) || a.closest("strong, em")) return;
      const red = /\bbg-(havoline|red)\b/.test(a.getAttribute("class") || "");
      const strong = doc.createElement("strong");
      a.replaceWith(strong);
      if (red) {
        const em = doc.createElement("em");
        em.append(a);
        strong.append(em);
      } else {
        strong.append(a);
      }
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
          href = new URL(src, ORIGIN17).href;
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
        t.querySelectorAll(HEADINGS9).forEach((h) => {
          if (cleanText2(h.textContent)) nodes.push(h);
        });
        if (!nodes.length && cleanText2(t.textContent)) {
          const p = doc.createElement("p");
          const target = t.closest(".check-list__list .item") ? p.appendChild(doc.createElement("strong")) : p;
          moveChildren(t, target);
          trimEdges(target);
          nodes.push(p);
        }
      }
      t.replaceWith(...nodes);
    });
  }
  function convertDisplayParagraphs(element, doc) {
    element.querySelectorAll("#main-content > .container-fluid > .richtext .richtext__container").forEach((c) => {
      const size = c.querySelector(":scope > div");
      if (!size || !["p1", "h1", "h2"].some((k) => size.classList.contains(k))) return;
      const ps = [...c.querySelectorAll("p")].filter((p2) => cleanText2(p2.textContent));
      if (ps.length !== 1 || c.querySelector(HEADINGS9)) return;
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
    element.querySelectorAll(HEADINGS9).forEach((h) => {
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
    const all = [...element.querySelectorAll(HEADINGS9)];
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
    if (prev && prev.nodeType === 1 && prev.matches(HEADINGS9)) return prev;
    let next = anchor.nextSibling;
    for (let seen = 0; next && seen < 3; next = next.nextSibling) {
      if (isSkippable(next)) continue;
      seen += 1;
      if (next.matches(HEADINGS9)) return next;
      const h = next.querySelector(HEADINGS9);
      if (h) return h;
    }
    return null;
  }
  function retargetAnchors(element, path) {
    const anchors = [...element.querySelectorAll(".anchor-tag")];
    if (!anchors.length) return;
    const seen = /* @__PURE__ */ Object.create(null);
    const slugOf = /* @__PURE__ */ new Map();
    element.querySelectorAll(HEADINGS9).forEach((h) => {
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
          const p = new URL(before, ORIGIN17).pathname.toLowerCase().replace(/\/+$/, "");
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
      convertFormElements(element, doc, pagePath(payload));
      element.querySelectorAll("img.commons-adaptive-image.mobile-only-hidden").forEach((img) => {
        const pair = img.parentElement && img.parentElement.querySelector("img.commons-adaptive-image.tablet-up-hidden");
        const damSrc = pair && pair.getAttribute("src") || "";
        const src = img.getAttribute("src") || "";
        const broken = img.closest(".drawer") ? /adaptive_image\.img\./.test(src) : /adaptive_image[^/]*\.img\.[A-Z]+$/.test(src);
        if (damSrc.startsWith("/content/dam/") && broken) setImgSrc(img, damSrc);
      });
      element.querySelectorAll('img[src^="/content/dam/"]').forEach((img) => {
        const src = img.getAttribute("src").split("?")[0];
        if (/\.[A-Z]{3,4}$/.test(src)) setImgSrc(img, `${src}/_jcr_content/renditions/original`);
      });
    }
    if (hookName === TransformHook2.afterTransform) {
      const path = pagePath(payload);
      convertDistributors(element, doc);
      convertForms(element, doc, path);
      convertButtons(element, doc);
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
  var ORIGIN18 = "https://www.chevronlubricants.com";
  var SOURCE_HOSTS = ["www.chevronlubricants.com", "chevronlubricants.com", "author-prod.chevronlubricants.com"];
  var PROXY_HOSTS = ["localhost", "127.0.0.1"];
  var KEEP_ABSOLUTE2 = "data-excat-keep-absolute";
  var MIGRATED = {
    "/": "/en-us/home",
    "/en_us/home": "/en-us/home",
    "/en_us/home.html": "/en-us/home",
    "/en_us/home/become-distributor.html": "/en-us/home/become-distributor",
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
    "/en_us/home/lubetek.html": "/en-us/home/lubetek",
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
    "/en_us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/delo-warranty-plus.html": "/en-us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/delo-warranty-plus",
    "/en_us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/lubewatch.html": "/en-us/home/services/pro-services/heavy-duty-diesel-vehicles-equipment/lubewatch",
    "/en_us/home/services/pro-services/industrial-machinery/isoclean-program.html": "/en-us/home/services/pro-services/industrial-machinery/isoclean-program",
    "/en_us/home/services/pro-services/industrial-machinery/lubewatch-oil-analysis.html": "/en-us/home/services/pro-services/industrial-machinery/lubewatch-oil-analysis",
    "/en_us/home/services/pro-services/personal-rec-vehicles/havoline-education-learning.html": "/en-us/home/services/pro-services/personal-rec-vehicles/havoline-education-learning",
    "/en_us/home/services/pro-services/personal-rec-vehicles/havoline-oil-change-pros.html": "/en-us/home/services/pro-services/personal-rec-vehicles/havoline-oil-change-pros",
    "/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html": "/en-us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us",
    "/en_us/home/services/pro-services/preferred-vendors.html": "/en-us/home/services/pro-services/preferred-vendors",
    "/en_us/home/services/pro-services/preferred-vendors/checkfluid.html": "/en-us/home/services/pro-services/preferred-vendors/checkfluid",
    "/en_us/home/services/pro-services/preferred-vendors/des-case.html": "/en-us/home/services/pro-services/preferred-vendors/des-case",
    "/en_us/home/services/pro-services/trade-shows-and-events.html": "/en-us/home/services/pro-services/trade-shows-and-events",
    "/en_us/home/services/self-services/heavy-duty-diesel/benchmark-calculator.html": "/en-us/home/services/self-services/heavy-duty-diesel/benchmark-calculator",
    "/en_us/home/services/self-services/heavy-duty-diesel/best-in-class-assessment.html": "/en-us/home/services/self-services/heavy-duty-diesel/best-in-class-assessment",
    "/en_us/home/services/self-services/heavy-duty-diesel/coolants-freezepoint-calculator.html": "/en-us/home/services/self-services/heavy-duty-diesel/coolants-freezepoint-calculator",
    "/en_us/home/services/self-services/heavy-duty-diesel/delo-promotions.html": "/en-us/home/services/self-services/heavy-duty-diesel/delo-promotions",
    "/en_us/home/services/self-services/heavy-duty-diesel/delo-smartchoice.html": "/en-us/home/services/self-services/heavy-duty-diesel/delo-smartchoice",
    "/en_us/home/services/self-services/heavy-duty-diesel/fuel-economy-calculator.html": "/en-us/home/services/self-services/heavy-duty-diesel/fuel-economy-calculator",
    "/en_us/home/services/self-services/heavy-duty-diesel/heavy-duty-product-selector.html": "/en-us/home/services/self-services/heavy-duty-diesel/heavy-duty-product-selector",
    "/en_us/home/services/self-services/industrial-machinery/best-in-class.html": "/en-us/home/services/self-services/industrial-machinery/best-in-class",
    "/en_us/home/services/self-services/industrial-machinery/coolants-freezepoint-calculator.html": "/en-us/home/services/self-services/industrial-machinery/coolants-freezepoint-calculator",
    "/en_us/home/services/self-services/industrial-machinery/heavy-duty-product-selector.html": "/en-us/home/services/self-services/industrial-machinery/heavy-duty-product-selector",
    "/en_us/home/services/self-services/industrial-machinery/isoclean-calculator.html": "/en-us/home/services/self-services/industrial-machinery/isoclean-calculator",
    "/en_us/home/services/self-services/personal-rec-vehicles/chevron-products-selector.html": "/en-us/home/services/self-services/personal-rec-vehicles/chevron-products-selector",
    "/en_us/home/services/self-services/personal-rec-vehicles/coolants-freezepoint-calculator.html": "/en-us/home/services/self-services/personal-rec-vehicles/coolants-freezepoint-calculator",
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
    return `${ORIGIN18}/`;
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
      const next = mapped ? `${mapped}${u.hash}` : `${ORIGIN18}${pathname}${u.search}${u.hash}`;
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
      const u = new URL(href, ORIGIN18);
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

  // tools/importer/import-expertise-services.js
  var PAGE_TEMPLATE = {
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
          '#main-content div.multi-column:not(.multi-column__item *, .drawer *):has(> .multi-column__container[data-bg-color="bg-blue"] > .multi-column__content > .multi-column__item > .video)'
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
          '#main-content .cmp-image:not(.multi-column__item *):has(> .cl-adaptive-image > .adaptive-image__container > [class*="overlay"] .richtext__container)',
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
          '#main-content div.multi-column:not(.multi-column__item *, .drawer *):not(:has(> .multi-column__container[data-bg-color="bg-blue"] > .multi-column__content > .multi-column__item > .video)):has(> .multi-column__container > .multi-column__content > .multi-column__item > .cmp-image + .richtext + :is(.richtext, .button, .video))',
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
        "name": 'Unstyled band (white / transparent background): every top-level component whose band element has bg-white, bg-transparent, defaultBackground or no bg token; consecutive ones form one section ("centered" appended when all its default content is centre-aligned)',
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
          '#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color="bg-light-gray"])',
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
          '#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color="bg-light-gray"])'
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
          '#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color="bg-isoclean"])'
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
          '#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color="bg-blue"])',
          '#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color="bg-delo"])'
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
          '#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color="bg-strong-blue"])',
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
          '#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color="bg-black"])',
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
          '#main-content > .container-fluid > .multi-column:has(> .multi-column__container[data-bg-color="bg-blue-2"])'
        ],
        "style": "teal-blue-bg",
        "blocks": [
          "columns-cta"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "checklist": parse,
    "stats-carousel": parse2,
    "tool-embed": parse3,
    "isoclean-calculator": parse4,
    "carousel-banner": parse5,
    "carousel-square": parse6,
    "cards-products": parse7,
    "cards-filterable": parse8,
    "accordion-drawer": parse9,
    "accordion-faq": parse10,
    "quote-testimonial": parse11,
    "hero-callout": parse12,
    "hero-overlay": parse13,
    "columns-cta": parse14,
    "columns-promo": parse15,
    "cards-service": parse16,
    "cards-resource": parse17,
    "columns-media": parse18
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
  var import_expertise_services_default = {
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
  return __toCommonJS(import_expertise_services_exports);
})();
