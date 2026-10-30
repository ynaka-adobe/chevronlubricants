/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Chevron Lubricants expertise cleanup
 * Applies ONLY to templates whose name starts with "expertise-" (no-op otherwise,
 * so chevron-homepage and products-* output is unchanged).
 *
 * Site-wide chrome (header, footer, modals, cookie banner, share bar, chat) is
 * removed by chevron-cleanup.js; section breaks come from
 * chevron-expertise-sections.js; link paths from chevron-links.js.
 *
 * Selectors verified on the live DOM of the 28 expertise-marketing pages
 * (cleaned.html captures strip attributes) and migration-work/expertise/*.
 *
 * beforeTransform (only things the parsers must not see; nothing that changes
 * top-level units, band backgrounds or block-instance matching):
 *   - breadcrumb, slick cloned slides, print-only duplicate lists
 *
 * afterTransform (parsers have replaced the block elements; everything left is
 * default content):
 *   - distributor locator widget -> text paragraph + "Find a distributor" link
 *     (absolute live URL; the zip field only hands off to that page)
 *   - Salesforce form embeds -> link to the live form page (forms are not migrated)
 *   - default-content YouTube videos (.video) -> YouTube watch link
 *   - title components -> headings (section-heading -> h2, or h1 if it is the source
 *     h1; short sub-heading -> h3, sentence-like sub-heading -> paragraph)
 *   - large single-line display paragraph in a top-level richtext -> h2 (gf7 FAQ intro)
 *   - exactly one H1 per page (see normalizeH1), empty headings/paragraphs dropped
 *   - anchor-tag components: jump links are retargeted to the EDS heading id of the
 *     heading the anchor sits at (see retargetAnchors), then the anchor is removed
 *   - dividers / spacer items / empty panels removed, mobile duplicate image
 *     renditions removed, container multi-columns and simple-panels unwrapped
 * Source text (including typos) is never rewritten.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

const ORIGIN = 'https://www.chevronlubricants.com';
const FIND_DISTRIBUTOR = `${ORIGIN}/en_us/home/where-to-buy/find-a-distributor.html`;
const KEEP_ABSOLUTE = 'data-excat-keep-absolute';

// Salesforce form embeds -> link to the live page that hosts the form.
// xpress-lube-contact-us IS the form page (it is migrated too): its link points to
// the live AEM page and is protected from the EDS path rewrite in chevron-links.js.
const FORM_LINKS = {
  '/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html': {
    href: `${ORIGIN}/en_us/home/services/pro-services/personal-rec-vehicles/xpress-lube-contact-us.html`,
    text: 'Fill out the contact form',
  },
};
const DEFAULT_FORM_LINK = { href: `${ORIGIN}/en_us/home/contact-us.html`, text: 'Contact us' };

// Page H1 overrides (source path -> text of the heading that becomes the H1).
// industrial-products-faqs: the FAQ title (source h2) is the page heading, as on
// isoclean-faqs; the source h1 "CLEAN. REDEFINED:" is a promo section title.
const H1_OVERRIDES = {
  '/en_us/home/learning/about-our-brands/industrial-products/industrial-products-faqs.html': 'Industrial Products FAQs',
};

const HEADINGS = 'h1, h2, h3, h4, h5, h6';

function isExpertise(payload) {
  const name = payload && payload.template && payload.template.name;
  return typeof name === 'string' && name.startsWith('expertise-');
}

function cleanText(text) {
  return (text || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function hasMedia(el) {
  return !!el.querySelector('img, picture, video, iframe, svg');
}

function isEmpty(el) {
  return !cleanText(el.textContent) && !hasMedia(el);
}

function inTable(el) {
  return !!(el.closest && el.closest('table'));
}

function pagePath(payload) {
  const params = (payload && payload.params) || {};
  for (const c of [params.originalURL, payload && payload.url]) {
    if (!c) continue;
    try {
      const u = new URL(c);
      if (/chevronlubricants\.com$/.test(u.hostname)) return u.pathname.toLowerCase();
    } catch (e) { /* next */ }
  }
  return '';
}

// EDS path of a source path (same rule as chevron-links.js)
function edsPath(pathname) {
  let p = pathname.replace(/\/+$/, '').replace(/\.html?$/i, '').replace(/^\/en_us\/home(?=\/|$)/i, '');
  if (!p) return '/home';
  return p.replace(/_/g, '-').toLowerCase();
}

// github-slugger (used by the EDS html pipeline for heading ids): lowercase, drop
// punctuation / symbols / nbsp, every space -> "-" (the pipeline sees collapsed text)
function slugBase(text) {
  const t = (text || '').replace(/[ \t\n\r\f]+/g, ' ').trim();
  return t.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '').replace(/ /g, '-');
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
        const t = start ? n.textContent.replace(/^[\s ]+/, '') : n.textContent.replace(/[\s ]+$/, '');
        if (!t) { n.remove(); continue; }
        n.textContent = t;
        return;
      }
      if (n.nodeType === 1 && n.tagName === 'BR') { n.remove(); continue; }
      return;
    }
  };
  strip(el, true);
  strip(el, false);
}

function stripAttributes(el) {
  [el, ...el.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].forEach((a) => {
      if (!['href', 'src', 'alt', 'title', 'style'].includes(a.name)) n.removeAttribute(a.name);
    });
  });
}

function retag(doc, el, tag) {
  const n = doc.createElement(tag);
  moveChildren(el, n);
  if (el.getAttribute('style')) n.setAttribute('style', el.getAttribute('style'));
  el.replaceWith(n);
  return n;
}

/* ---------- afterTransform steps ---------- */

function convertDistributors(element, doc) {
  element.querySelectorAll('.distributor').forEach((d) => {
    if (inTable(d)) return;
    const text = cleanText((d.querySelector('.distributor__text-block') || d).textContent);
    const link = d.querySelector('.distributor__input__container a[href], a[href*="find-a-distributor"]');
    let href = FIND_DISTRIBUTOR;
    if (link) {
      try { href = new URL(link.getAttribute('href'), ORIGIN).href; } catch (e) { /* default */ }
    }
    const nodes = [];
    if (text) {
      const p = doc.createElement('p');
      p.textContent = text;
      nodes.push(p);
    }
    const p2 = doc.createElement('p');
    const a = doc.createElement('a');
    a.setAttribute('href', href);
    a.textContent = 'Find a distributor';
    p2.appendChild(a);
    nodes.push(p2);
    d.replaceWith(...nodes);
  });
}

function convertForms(element, doc, path) {
  const target = FORM_LINKS[path] || DEFAULT_FORM_LINK;
  const forms = [...element.querySelectorAll('.salesforce-embed-component')];
  if (forms.length) {
    // form-only instruction text ("*indicates required field.") has no form to refer to
    element.querySelectorAll(`p, ${HEADINGS}`).forEach((el) => {
      if (!inTable(el) && /^\*\s*indicates required fields?\.?$/i.test(cleanText(el.textContent))) el.remove();
    });
  }
  forms.forEach((f) => {
    const p = doc.createElement('p');
    const a = doc.createElement('a');
    a.setAttribute('href', target.href);
    // keep the live URL only when the link would point back to this page itself
    // (xpress-lube-contact-us); the default /contact-us target is a migrated page
    if (FORM_LINKS[path]) a.setAttribute(KEEP_ABSOLUTE, 'true');
    a.textContent = target.text;
    p.appendChild(a);
    f.replaceWith(p);
  });
}

function convertVideos(element, doc) {
  element.querySelectorAll('.video').forEach((v) => {
    if (inTable(v)) return;
    const holder = v.querySelector('[data-video-src]');
    const src = holder && holder.getAttribute('data-video-src');
    if (!src) {
      if (isEmpty(v)) v.remove();
      return;
    }
    const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/);
    let href;
    if (m) href = `https://www.youtube.com/watch?v=${m[1]}`;
    else {
      try { href = new URL(src, ORIGIN).href; } catch (e) { href = src; }
    }
    const label = cleanText(v.textContent);
    const textLink = holder.classList.contains('video__container-textlink') && label;
    // text-link videos stay links (#_dnb); player-style videos become YouTube embeds
    if (textLink && m) href += '#_dnb';
    const p = doc.createElement('p');
    const a = doc.createElement('a');
    a.setAttribute('href', href);
    a.textContent = textLink ? label : href;
    p.appendChild(a);
    v.replaceWith(p);
  });
}

function isSentence(text) {
  return /[.?!]\s*$/.test(text) || text.split(' ').length > 10;
}

function convertTitles(element, doc) {
  element.querySelectorAll('.title').forEach((t) => {
    if (inTable(t) || !t.parentNode) return;
    const nodes = [];
    const main = t.querySelector('.section-heading');
    if (main && cleanText(main.textContent)) {
      const level = main.tagName === 'H1' ? 'h1' : 'h2';
      const h = doc.createElement(level);
      const span = main.children.length === 1 && main.firstElementChild.tagName === 'SPAN' ? main.firstElementChild : main;
      moveChildren(span, h);
      stripAttributes(h);
      trimEdges(h);
      nodes.push(h);
    }
    const sub = t.querySelector('.sub-heading');
    if (sub && cleanText(sub.textContent)) {
      const text = cleanText(sub.textContent);
      const n = doc.createElement(isSentence(text) ? 'p' : 'h3');
      moveChildren(sub, n);
      stripAttributes(n);
      trimEdges(n);
      nodes.push(n);
    }
    if (!main && !sub) {
      // unknown title markup: keep any heading/text it has
      t.querySelectorAll(HEADINGS).forEach((h) => { if (cleanText(h.textContent)) nodes.push(h); });
    }
    t.replaceWith(...nodes);
  });
}

// "Still have questions? <b>We've got answers</b>" (gf7): a single short paragraph
// in display size (p1/h1/h2 class) in a top-level richtext is a section heading.
function convertDisplayParagraphs(element, doc) {
  element.querySelectorAll('#main-content > .container-fluid > .richtext .richtext__container').forEach((c) => {
    const size = c.querySelector(':scope > div');
    if (!size || !['p1', 'h1', 'h2'].some((k) => size.classList.contains(k))) return;
    const ps = [...c.querySelectorAll('p')].filter((p) => cleanText(p.textContent));
    if (ps.length !== 1 || c.querySelector(HEADINGS)) return;
    const p = ps[0];
    const text = cleanText(p.textContent);
    if (p.querySelector('a, img') || text.split(' ').length > 12) return;
    retag(doc, p, 'h2');
  });
}

function removeEmptyParagraphs(element) {
  element.querySelectorAll('#main-content p').forEach((p) => {
    if (!inTable(p) && isEmpty(p) && !p.querySelector('a')) p.remove();
  });
}

function removeEmptyHeadings(element) {
  element.querySelectorAll(HEADINGS).forEach((h) => {
    if (!cleanText(h.textContent) && !hasMedia(h)) h.remove();
  });
}

// "Become an authorized" + "Havoline installer." split over two adjacent h1s
function mergeSplitH1s(element, doc) {
  element.querySelectorAll('h1').forEach((h) => {
    if (!h.parentNode) return;
    let next = h.nextSibling;
    while (next && ((next.nodeType === 3 && !cleanText(next.textContent)) || (next.nodeType === 1 && next.tagName === 'BR'))) next = next.nextSibling;
    if (!next || next.nodeType !== 1 || next.tagName !== 'H1') return;
    const a = cleanText(h.textContent);
    const b = cleanText(next.textContent);
    if (!a || !b || /[.?!:]$/.test(a) || h.querySelector('a') || next.querySelector('a') || b.length > 60) return;
    trimEdges(h);
    trimEdges(next);
    h.appendChild(doc.createTextNode(' '));
    moveChildren(next, h);
    next.remove();
  });
}

/**
 * Exactly one H1:
 *   1. H1_OVERRIDES[page] when that heading exists;
 *   2. else the first h1 in default content (outside block tables);
 *   3. else the first h1 inside a block;
 *   4. else (no h1 at all: hero headline baked into an image) the first heading on
 *      the page is promoted.
 * Every other h1 (source h1s used as section titles) becomes h2.
 */
function normalizeH1(element, doc, path) {
  const all = [...element.querySelectorAll(HEADINGS)];
  if (!all.length) return;
  let chosen = null;
  const override = H1_OVERRIDES[path];
  if (override) chosen = all.find((h) => cleanText(h.textContent) === override) || null;
  const h1s = all.filter((h) => h.tagName === 'H1');
  if (!chosen) chosen = h1s.find((h) => !inTable(h)) || h1s[0] || all[0];
  h1s.forEach((h) => { if (h !== chosen) retag(doc, h, 'h2'); });
  if (chosen.tagName !== 'H1') retag(doc, chosen, 'h1');
}

function isSkippable(n) {
  if (n.nodeType !== 1) return true;
  if (n.tagName === 'HR') return true;
  if (n.matches('.divider, .anchor-tag')) return true;
  return isEmpty(n);
}

function findAnchorTarget(anchor) {
  // The anchor sits right after a heading (e.g. under a title): that heading.
  let prev = anchor.previousSibling;
  while (prev && isSkippable(prev)) prev = prev.previousSibling;
  if (prev && prev.nodeType === 1 && prev.matches(HEADINGS)) return prev;
  // Otherwise the first heading in the next few content elements after the anchor.
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

/**
 * Anchor-tag components (<div class="anchor-tag"><div id="Benefits"></div></div>)
 * are empty jump targets. Neither the id nor an empty element survives the
 * html -> markdown -> DA conversion, and EDS gives every heading an id generated
 * from its text (github-slugger). So the jump links (#Benefits) are retargeted to
 * the generated id of the heading the anchor marks (#what-it-means-for-you-vehicle)
 * and that id is also set on the heading. Anchors without a resolvable heading
 * keep their links unchanged (logged).
 */
function retargetAnchors(element, path) {
  const anchors = [...element.querySelectorAll('.anchor-tag')];
  if (!anchors.length) return;
  // emulate the pipeline's unique slugs over all headings in document order
  const seen = Object.create(null);
  const slugOf = new Map();
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
    const ids = [anchor.id, ...[...anchor.querySelectorAll('[id]')].map((e) => e.id)].filter(Boolean);
    if (!ids.length) return;
    const target = findAnchorTarget(anchor);
    if (!target || !slugOf.get(target)) {
      console.warn(`[chevron-expertise-cleanup] no heading for anchor #${ids.join(', #')}; jump links unchanged`);
      return;
    }
    const slug = slugOf.get(target);
    target.id = slug;
    ids.forEach((id) => { map[id] = slug; });
  });

  const own = path ? [path.replace(/\/+$/, ''), edsPath(path)] : [];
  element.querySelectorAll('a[href*="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    const i = href.indexOf('#');
    const before = href.slice(0, i);
    const hash = href.slice(i + 1);
    if (!Object.prototype.hasOwnProperty.call(map, hash)) return;
    let samePage = !before;
    if (!samePage) {
      try {
        const p = new URL(before, ORIGIN).pathname.toLowerCase().replace(/\/+$/, '');
        samePage = own.includes(p);
      } catch (e) { /* not same page */ }
    }
    if (samePage) a.setAttribute('href', `#${map[hash]}`);
  });
}

function removeNonContent(element) {
  WebImporter.DOMUtils.remove(element, ['.anchor-tag']);
  element.querySelectorAll('.divider').forEach((d) => { if (!inTable(d)) d.remove(); });
  // spacer items: multi-column items with nothing but dividers / whitespace
  element.querySelectorAll('.multi-column__item').forEach((item) => {
    if (!inTable(item) && isEmpty(item)) item.remove();
  });
  element.querySelectorAll('.simple-panel, .row.product-list-component, .multi-column').forEach((el) => {
    if (!inTable(el) && el.parentNode && isEmpty(el)) el.remove();
  });
}

// desktop (.mobile-only-hidden) + mobile (.tablet-up-hidden) renditions of one image
function removeMobileRenditions(element) {
  element.querySelectorAll('.cl-adaptive-image').forEach((wrap) => {
    if (inTable(wrap) || !wrap.querySelector('img.mobile-only-hidden')) return;
    wrap.querySelectorAll('img.tablet-up-hidden').forEach((img) => img.remove());
  });
}

// container components left over after parsing -> their content, in source order
function unwrapContainers(element) {
  element.querySelectorAll('.multi-column, .simple-panel').forEach((el) => {
    if (inTable(el) || !el.parentNode) return;
    el.replaceWith(...el.childNodes);
  });
}

export default function transform(hookName, element, payload) {
  if (!isExpertise(payload)) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === TransformHook.beforeTransform) {
    // Breadcrumb (not rendered on the 28 marketing pages; kept for safety)
    WebImporter.DOMUtils.remove(element, ['.breadcrumb', 'nav.breadcrumbs']);
    // Carousel duplicates: slick clones and the print-only slide list
    WebImporter.DOMUtils.remove(element, ['.slick-cloned', '.slider-wrapper__print']);
    // Collapsed drawers: the desktop adaptive-image servlet rendition can 404 on the source
    // (e.g. isoclean drawer .../adaptive_image.img.PNG). Use the paired original DAM file
    // (<img class="... tablet-up-hidden" src="/content/dam/...">) for the desktop image instead.
    element.querySelectorAll('.drawer img.commons-adaptive-image.mobile-only-hidden').forEach((img) => {
      const pair = img.parentElement && img.parentElement.querySelector('img.commons-adaptive-image.tablet-up-hidden');
      const damSrc = pair && (pair.getAttribute('src') || '');
      if (damSrc.startsWith('/content/dam/') && /adaptive_image\.img\./.test(img.getAttribute('src') || '')) {
        img.setAttribute('src', damSrc);
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
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
