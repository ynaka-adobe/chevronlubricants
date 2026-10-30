/* eslint-disable */
/* global WebImporter */

/**
 * Parser for quote-testimonial (base: quote)
 * Template: expertise-marketing (isoclean testimonial, delo blue video multi-column).
 *
 * Block table (blocks/quote-testimonial/README.md): single-cell rows, recognised by
 * content: [portrait image] [title] [quotation] [attribution: name, role/location]
 * [CTA link (YouTube watch URL + #_dnb)].
 *
 * Source DOM (validated against migration-work/block-context/quote-testimonial/source.html
 * + instances/*.html, live rendered DOM):
 *   [0] .testimonial .testimonial__container
 *         .testimonial__title | .testimonial__text p (quote)
 *         .testimonial__attribution__text (name) > .testimonial__attribution__title (role)
 *         .button-container a.btn > .btn-text (CTA)
 *   [1] div.multi-column (bg-blue, delo): the FIRST .multi-column__item is the quote:
 *         .cmp-image (portrait) + .richtext ("quote..." - Name, Role) + .video textlink (CTA);
 *       the other item(s) stay default content after the block (moved unchanged, so the
 *       expertise cleanup converts their image / video like any default content).
 */
const DNB = true;

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


/* ---------- quote rows ---------- */

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function linkPara(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text || href;
  p.append(a);
  return p;
}

function portrait(document, cmp) {
  return cmp ? makeImg(document, desktopImg(cmp)) : null;
}

// "name, role, company" -> [name line, role/location line]
function attributionLines(document, text) {
  const t = clean(text).replace(/^[-–—]\s*/, '');
  if (!t) return [];
  const i = t.indexOf(',');
  if (i < 0) return [para(document, t)];
  return [para(document, t.slice(0, i).trim()), para(document, t.slice(i + 1).trim())];
}

function testimonialRows(document, element) {
  const rows = [];
  const title = element.querySelector('.testimonial__title');
  if (title && clean(title.textContent)) rows.push([para(document, clean(title.textContent))]);
  const text = element.querySelector('.testimonial__text');
  const quote = text ? richNodes(document, text) : [];
  if (quote.length) rows.push(quote);
  const attr = element.querySelector('.testimonial__attribution__text');
  if (attr) {
    const role = attr.querySelector('.testimonial__attribution__title');
    const roleText = role ? clean(role.textContent) : '';
    const nameEl = attr.cloneNode(true);
    nameEl.querySelectorAll('.testimonial__attribution__title').forEach((n) => n.remove());
    const lines = [clean(nameEl.textContent), roleText].filter(Boolean).map((t) => para(document, t));
    if (lines.length) rows.push(lines);
  }
  element.querySelectorAll('.button-container a, .btn-wrapper a').forEach((link) => {
    const href = linkHref(link.getAttribute('data-video-src') || link.getAttribute('href'), link);
    const label = clean((link.querySelector('.btn-text') || link).textContent);
    if (href && label) rows.push([linkPara(document, href, label)]);
  });
  return rows;
}

function multiColumnItems(element) {
  return [...element.querySelectorAll(':scope > .multi-column__container > .multi-column__content > .multi-column__item')]
    .filter((item) => [...item.children].some((c) => !c.matches('.divider, .anchor-tag') && hasContent(c)));
}

// delo: item 1 = portrait + '"quote..." - Name, Role' + video text link
function multiColumnQuoteRows(document, item) {
  const rows = [];
  const img = portrait(document, item.querySelector('.cmp-image'));
  if (img) rows.push([img]);
  const text = [];
  item.querySelectorAll('.richtext').forEach((rt) => text.push(...richNodes(document, rt.querySelector('.richtext__container') || rt)));
  const quote = [];
  let attribution = [];
  text.forEach((node) => {
    const t = clean(node.textContent);
    const m = !attribution.length && t.match(/^(.*[”"…\.!?])\s+[-–—]\s+(.+)$/);
    if (m) {
      quote.push(para(document, m[1].trim()));
      attribution = attributionLines(document, m[2]);
    } else {
      quote.push(node);
    }
  });
  if (quote.length) rows.push(quote);
  if (attribution.length) rows.push(attribution);
  item.querySelectorAll('.video [data-video-src], .button a').forEach((v) => {
    const href = linkHref(v.getAttribute('data-video-src') || v.getAttribute('href'), v);
    const label = clean((v.querySelector('.videoLinkText, .btn-text') || v).textContent);
    if (href) rows.push([linkPara(document, href, label)]);
  });
  return rows;
}

export default function parse(element, { document }) {
  if (element.matches('.multi-column')) {
    const [first, ...others] = multiColumnItems(element);
    const cells = first ? multiColumnQuoteRows(document, first).map((row) => [row]) : [];
    const block = WebImporter.Blocks.createBlock(document, { name: 'quote-testimonial', cells });
    // column 2 (and any further columns) stay default content, in source order
    const rest = others.flatMap((item) => [...item.childNodes]);
    element.replaceWith(block, ...rest);
    return;
  }

  const cells = testimonialRows(document, element).map((row) => [row]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-testimonial', cells });
  element.replaceWith(block);
}
