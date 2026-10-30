/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-media (base: columns)
 * Template: expertise-marketing (isoclean, delo coolant/simplify/tractor, havoline
 * business/drivers, clarity, vartech, construction, mining, waste-hauling, techron
 * faqs/history) - 24 instances.
 *
 * Block table (blocks/columns-media/README.md): 1 row x 2 cells
 *   cell 1: the media column (photo, or video poster linked to the YouTube watch URL)
 *   cell 2: heading (the bold title, as a real heading so EDS generates the id the
 *           jump links are retargeted to) + paragraphs + button link
 * Cells keep the source column order (the block renders them in authored order).
 * Options card / centered: see parse().
 *
 * Source DOM (validated against migration-work/block-context/columns-media/source.html
 * + instances/*.html, live rendered DOM):
 *   div.multi-column > .multi-column__container > .multi-column__content
 *     [.repeating-image-overlay]                         (background decoration, ignored)
 *     .multi-column__item (spacer items: empty or only .divider -> skipped)
 *       media item: .cmp-image only | .video only | .divider + .cmp-image + .divider
 *       text item(s): .richtext (title, body) | .title | .button | .cmp-image
 *                     | nested .multi-column with a linked button image (-> text link)
 *   .cmp-image .cl-adaptive-image [> a[href]] > div > img.mobile-only-hidden (desktop)
 *                                                  + img.tablet-up-hidden (mobile)
 *   .video .image-container > img + .play-button[data-video-src]
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


/* ---------- multi-column helpers ---------- */

// meaningful child components of a multi-column item
function components(item) {
  return [...item.children].filter((c) => !c.matches('.divider, .anchor-tag, .repeating-image-overlay, script, style') && hasContent(c));
}

// non-spacer items (spacers: empty or only .divider)
function items(element) {
  return [...element.querySelectorAll(':scope > .multi-column__container > .multi-column__content > .multi-column__item')]
    .filter((item) => components(item).length);
}

const isBoldBlock = (b) => {
  const text = clean(b.textContent);
  if (!text || b.querySelector('a, img')) return false;
  if (b.matches(HEADINGS)) return true;
  const bold = [...b.querySelectorAll('strong')].map((s) => clean(s.textContent)).join(' ');
  return clean(bold) === text;
};

// display font-size classes on the rich text wrapper (<div class="... h2">)
function isDisplaySize(richtext) {
  const size = richtext.querySelector('.richtext__container > div');
  return !!size && ['h1', 'h2', 'h3', 'p1', 'p2'].some((k) => size.classList.contains(k));
}

// a rich text that is only a title -> one heading element: all bold / heading blocks,
// or (isoclean construction / waste-hauling) one short non-sentence line in a display size
function titleHeading(document, nodes, richtext) {
  if (!nodes.length || nodes.some((b) => b.querySelector('a, img'))) return null;
  const text = clean(nodes.map((b) => b.textContent).join(' '));
  if (!text || text.length > 120) return null;
  const bold = nodes.every((b) => isBoldBlock(b));
  const display = nodes.length === 1 && richtext && isDisplaySize(richtext) && !/\.$/.test(text);
  if (!bold && !display) return null;
  const srcHeading = nodes.find((b) => b.matches(HEADINGS));
  const h = document.createElement(srcHeading ? srcHeading.tagName.toLowerCase() : 'h2');
  h.textContent = text;
  return h;
}

/* ---------- components ---------- */

function imageNodes(document, cmp, { linkAsText } = {}) {
  const src = desktopImg(cmp);
  const img = makeImg(document, src);
  if (!img) return [];
  const link = cmp.querySelector('a[href]');
  if (!link) return [img];
  let href = linkHref(link.getAttribute('href'), link);
  if (!href) return linkAsText ? [] : [img];
  // thumbnail links to YouTube stay links (#_dnb); a bare video link would be embedded
  if (!linkAsText && youTubeId(href) && !href.includes('#')) href += '#_dnb';
  const a = document.createElement('a');
  a.href = href;
  if (linkAsText) {
    // image-only "button" (Buy Now / Learn more button image) -> text link from the alt
    a.textContent = (img.alt || '').replace(/\s*button$/i, '') || clean(link.textContent) || a.href;
    const p = document.createElement('p');
    p.append(a);
    return [p];
  }
  a.append(img);
  return [a];
}

function videoNodes(document, video) {
  const holder = video.querySelector('[data-video-src]');
  const id = holder ? youTubeId(holder.getAttribute('data-video-src')) : '';
  const img = makeImg(document, video.querySelector('.image-container img') || video.querySelector('img'));
  if (!id) return img ? [img] : [];
  const a = document.createElement('a');
  a.href = `https://www.youtube.com/watch?v=${id}#_dnb`;
  if (img) a.append(img);
  else a.textContent = a.href;
  return [a];
}

// button href: data-video-src (video modal buttons have href="#") > href; bare "#" -> none
function buttonHref(link) {
  return linkHref(link.getAttribute('data-video-src') || link.getAttribute('href'), link);
}

function buttonNodes(document, button) {
  return [...button.querySelectorAll('a')].map((link) => {
    const label = clean((link.querySelector('.btn-text') || link).textContent);
    if (!label) return null;
    const p = document.createElement('p');
    const href = buttonHref(link);
    if (!href) {
      p.textContent = label;
      return p;
    }
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
    const h = document.createElement('h2');
    h.textContent = clean(main.textContent);
    out.push(h);
  }
  const sub = title.querySelector('.sub-heading');
  if (sub && clean(sub.textContent)) {
    const p = document.createElement('p');
    p.textContent = clean(sub.textContent);
    out.push(p);
  }
  if (!out.length) title.querySelectorAll(HEADINGS).forEach((h) => { if (clean(h.textContent)) out.push(blockFrom(document, h)); });
  return out.filter(Boolean);
}

function textNodes(document, item, state) {
  const out = [];
  components(item).forEach((c) => {
    if (c.matches('.richtext')) {
      const nodes = richNodes(document, c.querySelector('.richtext__container') || c);
      const heading = !state.heading ? titleHeading(document, nodes, c) : null;
      if (heading) {
        state.heading = true;
        out.push(heading);
      } else {
        if (nodes.some((n) => n.matches(HEADINGS))) state.heading = true;
        out.push(...nodes);
      }
    } else if (c.matches('.title')) {
      const nodes = titleNodes(document, c);
      if (nodes.some((n) => n.matches(HEADINGS))) state.heading = true;
      out.push(...nodes);
    } else if (c.matches('.button')) {
      out.push(...buttonNodes(document, c));
    } else if (c.matches('.cmp-image')) {
      out.push(...imageNodes(document, c, { linkAsText: true }));
    } else if (c.matches('.video')) {
      out.push(...videoNodes(document, c));
    } else if (c.matches('.multi-column')) {
      items(c).forEach((nested) => out.push(...textNodes(document, nested, state)));
    } else {
      out.push(...richNodes(document, c));
    }
  });
  return out;
}

function isMediaItem(item) {
  const comps = components(item);
  return comps.length === 1 && comps[0].matches('.cmp-image, .video');
}

export default function parse(element, { document }) {
  const all = items(element);
  const media = all.find(isMediaItem);

  const mediaCell = [];
  if (media) {
    const comp = components(media)[0];
    mediaCell.push(...(comp.matches('.video') ? videoNodes(document, comp) : imageNodes(document, comp)));
  }

  const state = { heading: false };
  const textCell = [];
  all.filter((item) => item !== media).forEach((item) => textCell.push(...textNodes(document, item, state)));

  // keep the source column order: text-left layouts (clarity, delo tractor / simplify #6 /
  // coolant #4, havoline drivers #1, techron history #1) author the text cell first
  const firstText = all.find((item) => item !== media);
  const textFirst = !!(media && firstText && all.indexOf(firstText) < all.indexOf(media));
  const cells = [textFirst ? [textCell, mediaCell] : [mediaCell, textCell]];

  // options (README): card = source .multi-column__item--card-shadow (isoclean, mining,
  // construction, techron faqs); centered = centred button (.btn-align-center) in a
  // non-card text column (isoclean waste-hauling, delo coolant field-trial results)
  const variants = [];
  if (all.some((item) => item.classList.contains('multi-column__item--card-shadow'))) {
    variants.push('card');
  } else if (all.some((item) => item !== media && item.querySelector('.btn-wrapper.btn-align-center'))) {
    variants.push('centered');
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', variants, cells });
  element.replaceWith(block);
}
