/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-overlay (base: hero)
 * Template: expertise-marketing (gf7 #3, coolant #5 text overlays; techron #6 button
 * overlay).
 *
 * Block table (blocks/hero-overlay/README.md): 2 single-cell rows
 *   row 1: background photo (desktop rendition)
 *   row 2: overlay text (paragraph; optional heading and CTA link)
 *
 * Source DOM (validated against migration-work/block-context/hero-overlay/source.html
 * + instances/*.html, live rendered DOM):
 *   .cmp-image > .cl-adaptive-image > .adaptive-image__container
 *     [0] div[class*="overlay"] (overlayMiddleLeft) > .richtext__container > div > p...
 *         (&nbsp; spacer paragraphs dropped; source line-wrapped paragraphs are
 *          re-joined into one paragraph)
 *     [1] .buttonOverlay .btn-wrapper a.btn > .btn-text  (CTA link; the empty overlay
 *         <a> wrappers around it are dropped)
 *     img.mobile-only-hidden (desktop) + img.tablet-up-hidden (mobile)
 */
const DNB = false;

const ORIGIN = 'https://www.chevronlubricants.com';
const HEADINGS = 'h1, h2, h3, h4, h5, h6';
const BLOCKS = 'p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote';

function absUrl(url) {
  if (!url) return '';
  try {
    return new URL(url.trim(), ORIGIN).href;
  } catch (e) {
    return url;
  }
}

function clean(text) {
  return (text || '').replace(/[\s ​]+/g, ' ').trim();
}

function youTubeId(src) {
  if (!src) return '';
  const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/)
    || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
  return m ? m[1] : '';
}

// YouTube embed -> watch URL (+ #_dnb when DNB), "#hash" jump links kept, '#' / js -> '',
// target=_blank -> #_blank (scripts/ak.js decorateHash), everything else absolute
function linkHref(href, srcLink) {
  const raw = (href || '').trim();
  if (!raw || raw === '#' || /^javascript:/i.test(raw)) return '';
  if (raw.startsWith('#')) return raw;
  const id = youTubeId(raw);
  if (id) return `https://www.youtube.com/watch?v=${id}${DNB ? '#_dnb' : ''}`;
  const url = absUrl(raw);
  const blank = srcLink && (srcLink.getAttribute('target') || '').toLowerCase() === '_blank';
  return blank && url && !url.includes('#') ? `${url}#_blank` : url;
}

function hasContent(el) {
  return !!(clean(el.textContent) || el.querySelector('img, video, iframe, [data-video-src]'));
}

function makeImg(document, srcImg) {
  if (!srcImg) return null;
  const src = srcImg.getAttribute('data-src') || srcImg.getAttribute('src') || '';
  if (!src || src.startsWith('data:') || /\.pdf(\?|#|$)/i.test(src)) return null;
  const img = document.createElement('img');
  img.src = absUrl(src);
  img.alt = clean(srcImg.getAttribute('alt'));
  return img;
}

// desktop rendition first (mobile duplicate: img.tablet-up-hidden)
function desktopImg(container) {
  return container.querySelector('img.mobile-only-hidden') || container.querySelector('img');
}

/* ---------- rich text ---------- */

function copyInline(document, from, to) {
  from.childNodes.forEach((n) => {
    if (n.nodeType === 3) {
      to.append(document.createTextNode(n.textContent.replace(/[\s ]+/g, ' ')));
      return;
    }
    if (n.nodeType !== 1) return;
    const tag = n.tagName;
    if (tag === 'BR') { to.append(document.createElement('br')); return; }
    if (tag === 'IMG') { const img = makeImg(document, n); if (img) to.append(img); return; }
    if (tag === 'A') {
      const href = linkHref(n.getAttribute('data-video-src') || n.getAttribute('href'), n);
      if (!href) { copyInline(document, n, to); return; }
      const a = document.createElement('a');
      a.href = href;
      copyInline(document, n, a);
      if (clean(a.textContent) || a.querySelector('img')) to.append(a);
      return;
    }
    const map = { B: 'strong', STRONG: 'strong', I: 'em', EM: 'em', SUP: 'sup', SUB: 'sub', U: 'u' };
    if (map[tag]) {
      const el = document.createElement(map[tag]);
      copyInline(document, n, el);
      if (clean(el.textContent) || el.querySelector('img')) {
        // keep edge whitespace outside the emphasis ("**a** b", not "**a **b")
        const lead = el.firstChild && el.firstChild.nodeType === 3 && /^\s/.test(el.firstChild.textContent);
        const trail = el.lastChild && el.lastChild.nodeType === 3 && /\s$/.test(el.lastChild.textContent);
        if (lead) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, '');
        if (trail) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, '');
        if (lead) to.append(document.createTextNode(' '));
        to.append(el);
        if (trail) to.append(document.createTextNode(' '));
      } else if (el.textContent) to.append(document.createTextNode(' '));
      return;
    }
    copyInline(document, n, to);
  });
}

function trimNode(el) {
  const edge = (first) => {
    for (;;) {
      const n = first ? el.firstChild : el.lastChild;
      if (!n) return;
      if (n.nodeType === 3) {
        const t = first ? n.textContent.replace(/^\s+/, '') : n.textContent.replace(/\s+$/, '');
        if (!t) { n.remove(); continue; }
        n.textContent = t;
        return;
      }
      if (n.nodeType === 1 && n.tagName === 'BR') { n.remove(); continue; }
      return;
    }
  };
  edge(true);
  edge(false);
  el.normalize();
}

function blockFrom(document, src) {
  const tag = src.tagName.toLowerCase();
  if (tag === 'ul' || tag === 'ol') {
    const list = document.createElement(tag);
    src.querySelectorAll(':scope > li').forEach((li) => {
      const n = document.createElement('li');
      copyInline(document, li, n);
      trimNode(n);
      if (hasContent(n)) list.append(n);
    });
    return list.children.length ? list : null;
  }
  const el = document.createElement(['table', 'blockquote'].includes(tag) ? 'p' : tag);
  copyInline(document, src, el);
  trimNode(el);
  // <h1><strong>a</strong> <strong>b</strong></h1> -> plain heading text
  if (/^h[1-6]$/.test(tag) && !el.querySelector('a, img')
    && clean([...el.querySelectorAll('strong')].map((b) => b.textContent).join(' ')) === clean(el.textContent)) {
    el.textContent = clean(el.textContent);
  }
  return hasContent(el) ? el : null;
}

// rich text container -> clean block nodes (p, h*, ul, ol), empty spacer paragraphs dropped
function richNodes(document, root) {
  const out = [];
  let loose = null;
  const flush = () => {
    if (loose) { trimNode(loose); if (hasContent(loose)) out.push(loose); }
    loose = null;
  };
  const walk = (node) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 1 && (n.matches(BLOCKS) || n.querySelector(BLOCKS) || n.tagName === 'DIV')) {
        flush();
        if (n.matches(BLOCKS) && !n.querySelector(BLOCKS)) {
          const b = blockFrom(document, n);
          if (b) out.push(b);
        } else if (n.matches(HEADINGS) && n.querySelector('p')) {
          const h = document.createElement(n.tagName.toLowerCase());
          [...n.querySelectorAll('p')].forEach((p, i) => { if (i) h.append(document.createTextNode(' ')); copyInline(document, p, h); });
          trimNode(h);
          if (hasContent(h)) out.push(h);
        } else {
          walk(n);
        }
        return;
      }
      if (!loose) loose = document.createElement('p');
      const tmp = document.createElement('span');
      tmp.append(n.cloneNode(true));
      copyInline(document, tmp, loose);
    });
    flush();
  };
  walk(root);
  return out;
}


// "line one of a sentence" + "continues here." -> one paragraph (source hard-wraps lines
// as separate <p>); a paragraph ending in . ! ? : or holding a link ends the run
function joinWrapped(document, nodes) {
  const out = [];
  let run = null;
  nodes.forEach((n) => {
    const plain = n.tagName === 'P' && !n.querySelector('a, img');
    if (plain && run) {
      run.append(document.createTextNode(' '));
      while (n.firstChild) run.append(n.firstChild);
    } else {
      out.push(n);
      run = plain ? n : null;
    }
    if (run && /[.!?:]["”’)]?$/.test(clean(run.textContent))) run = null;
  });
  return out;
}

export default function parse(element, { document }) {
  const container = element.querySelector('.adaptive-image__container') || element;
  const imgSrc = [...container.querySelectorAll(':scope > img.mobile-only-hidden, :scope > img')][0]
    || desktopImg(container);
  const img = makeImg(document, imgSrc);

  const content = [];
  const overlay = container.querySelector('[class*="overlay"] .richtext__container, [class*="Overlay"] .richtext__container');
  if (overlay) content.push(...joinWrapped(document, richNodes(document, overlay)));

  // a.btn; after the importer's same-href anchor merge the label sits in the preceding
  // (formerly empty) overlay <a>, so any labelled link in .buttonOverlay counts (deduped)
  const seen = new Set();
  container.querySelectorAll('.buttonOverlay a[href]').forEach((link) => {
    const label = clean((link.querySelector('.btn-text') || link).textContent);
    const href = linkHref(link.getAttribute('href'), link);
    if (!label || !href || seen.has(`${href}|${label}`)) return;
    seen.add(`${href}|${label}`);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.append(a);
    content.push(p);
  });

  const cells = [];
  if (img) cells.push([[img]]);
  if (content.length) cells.push([content]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay', cells });
  element.replaceWith(block);
}
