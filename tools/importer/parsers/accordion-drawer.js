/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-drawer (base: accordion)
 * Template: expertise-marketing (isoclean x3 drawers, techron history x1).
 *
 * Block table (blocks/accordion-drawer/README.md): 1 row per drawer, 2 cells
 *   cell 1: header photo + title text (paragraph, not a heading)
 *   cell 2: intro paragraph(s), then repeated case-study groups:
 *           image, bold title paragraph, link paragraph
 * Each source .drawer is one block instance -> one block (one row) per drawer.
 *
 * Source DOM (validated against migration-work/block-context/accordion-drawer/source.html
 * + instances/*.html, live rendered DOM):
 *   .drawer .drawer__content
 *     .drawer__img-container > img.mobile-only-hidden (desktop) + img.tablet-up-hidden
 *                             + .drawer__title (title text)
 *     .drawer__parsys-container (collapsed content, in source order)
 *       .richtext (intro) | .cmp-image | .button
 *       .multi-column (case-study tiles: spacer items skipped; each item =
 *                      .cmp-image + .richtext bold title + .richtext link)
 *     .drawer__control (+/- toggle, ignored)
 * Nested multi-columns are drawer content, never separate blocks.
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
      if (clean(el.textContent) || el.querySelector('img')) to.append(el);
      else if (el.textContent) to.append(document.createTextNode(' '));
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


/* ---------- drawer content ---------- */

function imagePara(document, cmp) {
  const img = makeImg(document, desktopImg(cmp));
  if (!img) return null;
  const p = document.createElement('p');
  const link = cmp.querySelector('a[href]');
  const href = link ? linkHref(link.getAttribute('href'), link) : '';
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.append(img);
    p.append(a);
  } else {
    p.append(img);
  }
  return p;
}

function buttonParas(document, button) {
  return [...button.querySelectorAll('a')].map((link) => {
    const label = clean((link.querySelector('.btn-text') || link).textContent);
    if (!label) return null;
    const p = document.createElement('p');
    const href = linkHref(link.getAttribute('data-video-src') || link.getAttribute('href'), link);
    if (!href) { p.textContent = label; return p; }
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.append(a);
    return p;
  }).filter(Boolean);
}

function contentNodes(document, container) {
  const out = [];
  [...container.children].forEach((c) => {
    if (c.matches('.divider, .anchor-tag, .repeating-image-overlay, script, style') || !hasContent(c)) return;
    if (c.matches('.cmp-image')) {
      const p = imagePara(document, c);
      if (p) out.push(p);
    } else if (c.matches('.richtext')) {
      out.push(...richNodes(document, c.querySelector('.richtext__container') || c));
    } else if (c.matches('.button')) {
      out.push(...buttonParas(document, c));
    } else if (c.matches('.title')) {
      const t = clean(c.textContent);
      if (t) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = t;
        p.append(strong);
        out.push(p);
      }
    } else if (c.matches('.multi-column')) {
      c.querySelectorAll(':scope > .multi-column__container > .multi-column__content > .multi-column__item')
        .forEach((item) => { if (hasContent(item)) out.push(...contentNodes(document, item)); });
    } else if (c.matches('.multi-column__item') || (c.tagName === 'DIV' && !c.className)) {
      out.push(...contentNodes(document, c));
    } else {
      out.push(...richNodes(document, c));
    }
  });
  return out;
}

export default function parse(element, { document }) {
  const drawers = element.matches('.drawer') ? [element] : [...element.querySelectorAll('.drawer')];
  const cells = drawers.map((drawer) => {
    const header = [];
    const imgWrap = drawer.querySelector('.drawer__img-container');
    const img = imgWrap ? makeImg(document, desktopImg(imgWrap)) : null;
    if (img) header.push(img);
    const titleEl = drawer.querySelector('.drawer__title');
    const title = titleEl ? clean(titleEl.textContent) : '';
    if (title) {
      const p = document.createElement('p');
      p.textContent = title;
      header.push(p);
    }
    const parsys = drawer.querySelector('.drawer__parsys-container');
    const content = parsys ? contentNodes(document, parsys) : [];
    return [header, content];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-drawer', cells });
  element.replaceWith(block);
}
