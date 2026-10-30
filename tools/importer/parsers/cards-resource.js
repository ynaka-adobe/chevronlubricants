/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-resource (base: cards), option blue-caption
 * Template: expertise-marketing - 27 instances on 18 pages (isoclean, delo success
 * stories / simplify / tractor, havoline, havoline customer stories, clarity,
 * learning-for-you, vartech, construction, isoclean-faqs, mining, oil-and-gas,
 * waste-hauling, techron, xpress lube).
 *
 * Block table (blocks/cards-resource/README.md): 1 row per card, 2 cells
 *   cell 1: image (optionally linked: case study / PDF / YouTube watch URL)
 *   cell 2: optional bold title / name, text, CTA link last
 * Option blue-caption: the card caption .richtext__container has bg-isoclean.
 *
 * Source DOM (validated against migration-work/block-context/cards-resource/source.html
 * + instances/*.html, live rendered DOM):
 *   div.multi-column > .multi-column__container > .multi-column__content
 *     .multi-column__item (spacers: empty / only .divider -> skipped)
 *       .cmp-image .cl-adaptive-image [> a[href]] > div > img.mobile-only-hidden + img.tablet-up-hidden
 *       .richtext .richtext__container > div.<size> > p | h* | ul
 *       .button a.btn > .btn-text
 *       .video [data-video-src].video__container-textlink > .videoLinkText  (text video link)
 * Card grouping (mapping-coverage parserBranches["cards-resource"]):
 *   (a) several stacked cards per column: a new card starts at a .cmp-image that comes
 *       after text and is directly followed by a .richtext (success stories, havoline
 *       customer stories);
 *   (b) text-before-image items (tractor): the item's image is the card image;
 *   (c) text-only columns (simplify product picks) split at .divider, empty image cell;
 *   (d) further images of a card go into the text cell (clarity feature icons, mining
 *       second image); image-only links (button images) become text links (alt text).
 * Cards are output row-major (1st card of every column, then 2nd, ...) so the block's
 * wrapping grid keeps the source reading order. YouTube links get #_dnb.
 */
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
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function youTubeId(src) {
  if (!src) return '';
  const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/)
    || src.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]+)/);
  return m ? m[1] : '';
}

// YouTube -> watch URL + #_dnb (stays a link); target=_blank -> #_blank; '#' -> ''
function linkHref(href, srcLink) {
  const raw = (href || '').trim();
  if (!raw || raw === '#' || /^javascript:/i.test(raw)) return '';
  const id = youTubeId(raw);
  if (id) return `https://www.youtube.com/watch?v=${id}#_dnb`;
  const url = absUrl(raw);
  const blank = srcLink && (srcLink.getAttribute('target') || '').toLowerCase() === '_blank';
  return blank && url && !url.includes('#') ? `${url}#_blank` : url;
}

function hasContent(el) {
  return !!(clean(el.textContent) || el.querySelector('img, video, iframe, [data-video-src]'));
}

function items(element) {
  return [...element.querySelectorAll(':scope > .multi-column__container > .multi-column__content > .multi-column__item')]
    .filter((item) => [...item.children].some((c) => !c.matches('.divider, .anchor-tag, .repeating-image-overlay') && hasContent(c)));
}

function makeImg(document, srcImg) {
  if (!srcImg) return null;
  const src = srcImg.getAttribute('data-src') || srcImg.getAttribute('src') || '';
  // skip data: placeholders and broken non-raster renditions (mining: adaptive_image.img.pdf)
  if (!src || src.startsWith('data:') || /\.pdf(\?|#|$)/i.test(src)) return null;
  const img = document.createElement('img');
  img.src = absUrl(src);
  img.alt = clean(srcImg.getAttribute('alt'));
  return img;
}

function desktopImg(container) {
  return container.querySelector('img.mobile-only-hidden') || container.querySelector('img');
}

function hasImage(cmp) {
  const img = desktopImg(cmp);
  const src = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : '';
  return !!src && !src.startsWith('data:') && !/\.pdf(\?|#|$)/i.test(src);
}

const isBoldOnly = (b) => b.tagName === 'P' && !b.querySelector('a, img') && clean(b.textContent)
  && clean([...b.querySelectorAll('strong')].map((s) => s.textContent).join(' ')) === clean(b.textContent);

// a title split over several bold paragraphs ("Get answers to" / "common questions") -> one
function mergeBoldTitle(document, nodes) {
  if (nodes.length < 2 || !nodes.every(isBoldOnly)) return nodes;
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = clean(nodes.map((n) => n.textContent).join(' '));
  p.append(strong);
  return [p];
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

/* ---------- components ---------- */

function imageLinkHref(cmp, card) {
  const link = cmp.querySelector('a[href]');
  if (!link) return '';
  const href = linkHref(link.getAttribute('data-video-src') || link.getAttribute('href'), link);
  if (href) return href;
  // <a href="#" class="video"> around the image: opens the card's video
  return card.video || '';
}

function linkedImage(document, cmp, card) {
  const img = makeImg(document, desktopImg(cmp));
  if (!img) return null;
  const href = imageLinkHref(cmp, card);
  if (!href) return img;
  const a = document.createElement('a');
  a.href = href;
  a.append(img);
  return a;
}

// further image of a card: image-only link -> text link from the alt; else the image
function extraImage(document, cmp, card) {
  const img = makeImg(document, desktopImg(cmp));
  if (!img) return null;
  const href = imageLinkHref(cmp, card);
  const p = document.createElement('p');
  if (!href) {
    p.append(img);
    return p;
  }
  const a = document.createElement('a');
  a.href = href;
  a.textContent = (img.alt || '').replace(/\s*button$/i, '') || href;
  p.append(a);
  return p;
}

function videoInfo(video) {
  const holder = video.querySelector('[data-video-src]');
  const id = holder ? youTubeId(holder.getAttribute('data-video-src')) : '';
  return {
    href: id ? `https://www.youtube.com/watch?v=${id}#_dnb` : '',
    label: clean((video.querySelector('.videoLinkText') || video).textContent),
    poster: video.querySelector('.image-container img') || video.querySelector('img'),
  };
}

function buttonNodes(document, button) {
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

function titleNodes(document, title) {
  const out = [];
  const main = title.querySelector('.section-heading');
  if (main && clean(main.textContent)) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = clean(main.textContent);
    p.append(strong);
    out.push(p);
  }
  const sub = title.querySelector('.sub-heading');
  if (sub && clean(sub.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(sub.textContent);
    out.push(p);
  }
  return out;
}

/* ---------- card grouping ---------- */

const isMeaningful = (c) => !c.matches('.anchor-tag, .repeating-image-overlay, script, style') && (c.matches('.divider') || hasContent(c));

function nextMeaningful(c) {
  let n = c.nextElementSibling;
  while (n && !isMeaningful(n)) n = n.nextElementSibling;
  return n;
}

function itemCards(document, item, opts) {
  // broken image components (no raster image) are ignored
  const kids = [...item.children].filter(isMeaningful).filter((c) => !c.matches('.cmp-image') || hasImage(c));
  const textOnly = !kids.some((c) => c.matches('.cmp-image, .video'));
  const cards = [];
  let cur = null;
  const newCard = () => {
    cur = { image: null, text: [], hasText: false, video: '' };
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
    if (c.matches('.divider')) {
      if (textOnly && cur && cur.hasText) cur = null; // (c) text-only columns split at dividers
      return;
    }
    if (c.matches('.cmp-image')) {
      const next = nextMeaningful(c);
      if (!cur || (cur.hasText && cur.image && next && next.matches('.richtext'))) newCard(); // (a)
      if (!cur.image) {
        // card video (text link further down) is the target of a href="#" image link
        const v = kids.slice(kids.indexOf(c)).find((k) => k.matches('.video'));
        if (v) cur.video = videoInfo(v).href;
        cur.image = c; // (b) also for text-before-image items
      } else {
        const extra = extraImage(document, c, cur); // (d)
        if (extra) addText([extra]);
      }
      return;
    }
    if (c.matches('.video')) {
      const v = videoInfo(c);
      if (!cur) newCard();
      if (v.label && v.href) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = v.href;
        a.textContent = v.label;
        p.append(a);
        addText([p]);
      } else if (v.poster && !cur.image) {
        cur.image = c;
        cur.video = v.href;
      } else if (v.href) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = v.href;
        a.textContent = v.label || v.href;
        p.append(a);
        addText([p]);
      }
      return;
    }
    if (c.matches('.richtext')) {
      if (c.querySelector('.richtext__container.bg-isoclean')) opts.blueCaption = true;
      addText(mergeBoldTitle(document, richNodes(document, c.querySelector('.richtext__container') || c)));
      return;
    }
    if (c.matches('.button')) { addText(buttonNodes(document, c)); return; }
    if (c.matches('.title')) { addText(titleNodes(document, c)); return; }
    addText(richNodes(document, c));
  });
  return cards;
}

function imageCell(document, card) {
  if (!card.image) return [];
  if (card.image.matches('.video')) {
    const v = videoInfo(card.image);
    const img = makeImg(document, v.poster);
    if (!img) return [];
    if (!v.href) return [img];
    const a = document.createElement('a');
    a.href = v.href;
    a.append(img);
    return [a];
  }
  const node = linkedImage(document, card.image, card);
  return node ? [node] : [];
}

export default function parse(element, { document }) {
  const opts = { blueCaption: false };
  const columns = items(element).map((item) => itemCards(document, item, opts).filter((c) => c.image || c.hasText));

  // row-major: first card of every column, then the second, ...
  const cells = [];
  const depth = Math.max(0, ...columns.map((c) => c.length));
  for (let i = 0; i < depth; i += 1) {
    columns.forEach((col) => {
      const card = col[i];
      if (card) cells.push([imageCell(document, card), card.text]);
    });
  }

  const variants = opts.blueCaption ? ['blue-caption'] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', variants, cells });
  element.replaceWith(block);
}
