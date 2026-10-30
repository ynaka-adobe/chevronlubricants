/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-faq (base: accordion), option load-more
 * Template: expertise-marketing - 11 instances (gf7, industrial-products-faqs x5,
 * isoclean-faqs, techron faqs x4).
 *
 * Block table (blocks/accordion-faq/README.md): 1 row per FAQ, 2 cells
 *   cell 1: question (plain text, not a heading)
 *   cell 2: answer rich text (paragraphs, lists, links)
 * Option load-more (first 3 visible + "Load more questions" button): the source has
 * the "Load more questions" a.btn / .panel-collapse-more wrapper (isoclean-faqs).
 *
 * Source DOM (validated against migration-work/block-context/accordion-faq/source.html
 * + instances/*.html, live rendered DOM):
 *   .accordion-text .applications__container
 *     .clearfix > button.applications__toggle-all   (Expand all - dropped, block adds its own)
 *     .panel-group > .panel (+ .panel-collapse-more > .panel ... hidden "more" panels)
 *       .panel-heading .panel-title a > span.title-text (question) + glyphicons
 *                      + div > img (empty per-question placeholder - dropped)
 *       .panel-collapse .panel-body > .richtext (answer)
 *     a.btn "Load more questions"
 * Options grey / blue: see parse() (source theme classes on .applications__content /
 * .applications__toggle-all).
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


/* ---------- answer content ---------- */

function answerNodes(document, container) {
  const out = [];
  [...container.children].forEach((c) => {
    if (c.matches('.divider, .anchor-tag, script, style') || !hasContent(c)) return;
    if (c.matches('.richtext')) {
      out.push(...richNodes(document, c.querySelector('.richtext__container') || c));
    } else if (c.matches('.cmp-image')) {
      const img = makeImg(document, desktopImg(c));
      if (img) {
        const p = document.createElement('p');
        const link = c.querySelector('a[href]');
        const href = link ? linkHref(link.getAttribute('href'), link) : '';
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.append(img);
          p.append(a);
        } else {
          p.append(img);
        }
        out.push(p);
      }
    } else if (c.matches('.button')) {
      c.querySelectorAll('a').forEach((link) => {
        const label = clean((link.querySelector('.btn-text') || link).textContent);
        if (!label) return;
        const p = document.createElement('p');
        const href = linkHref(link.getAttribute('data-video-src') || link.getAttribute('href'), link);
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = label;
          p.append(a);
        } else {
          p.textContent = label;
        }
        out.push(p);
      });
    } else if (c.tagName === 'DIV' && !c.matches('.richtext, .cmp-image, .button')) {
      const nested = answerNodes(document, c);
      out.push(...(nested.length ? nested : richNodes(document, c)));
    } else {
      out.push(...richNodes(document, c));
    }
  });
  return out;
}

export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll('.panel').forEach((panel) => {
    const titleEl = panel.querySelector('.panel-heading .title-text') || panel.querySelector('.panel-title');
    const question = titleEl ? clean(titleEl.textContent) : '';
    const body = panel.querySelector('.panel-body') || panel.querySelector('.panel-collapse');
    const answer = body ? answerNodes(document, body) : [];
    if (!question && !answer.length) return;
    const q = document.createElement('p');
    q.textContent = question;
    cells.push([[q], answer]);
  });

  const loadMore = [...element.querySelectorAll('a.btn, button')].some((b) => /load\s+more/i.test(b.textContent))
    || [...element.querySelectorAll('.panel-collapse-more')].some((m) => m.querySelector('.panel'));
  const variants = loadMore ? ['load-more'] : [];
  // colour options from the source theme classes (live DOM, all instances of the page):
  //   grey: .applications__content.bg-light-gray (techron faqs: light-grey column, cobalt icons)
  //   blue: .applications__toggle-all.lubricantsFontColorBlue (industrial-products-faqs:
  //         dark-blue #0b2d71 toggle + icons)
  if (element.querySelector('.applications__content.bg-light-gray')) variants.push('grey');
  else if (element.querySelector('.applications__toggle-all.lubricantsFontColorBlue')) variants.push('blue');
  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', variants, cells });
  element.replaceWith(block);
}
