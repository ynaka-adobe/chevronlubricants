/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-service (base: cards)
 * Template: expertise-marketing - 10 instances (delo x2, gf7 x2, learning-for-you x2,
 * coolant, simplify, vartech, techron).
 *
 * Block table (blocks/cards-service/README.md): 1 row per tile, 2 cells
 *   cell 1: icon image (~80px)
 *   cell 2: h3 title (linked when the source tile links somewhere) + description
 *
 * Source DOM (validated against migration-work/block-context/cards-service/source.html
 * + instances/*.html, live rendered DOM):
 *   div.multi-column > .multi-column__container > .multi-column__content > .multi-column__item
 *   [0] nested tiles (delo, gf7, learning-for-you): item > .multi-column:only-child >
 *         ... > .multi-column__item (.cmp-image icon [> a[href]])
 *           + .multi-column__item (.title: h1.section-heading [> a] + h1.sub-heading
 *                                  | .richtext: bold title paragraph(s) + description)
 *   [1]/[2] flat tiles (coolant, vartech, simplify, techron): item > .cmp-image + .richtext
 *         [+ .divider + .cmp-image "Anchor jump" a[href="#..."] (simplify) -> title link]
 *         image-only item (coolant 4th) -> row with the image and an empty text cell
 *   spacer items (empty / only .divider) are skipped; desktop image = img.mobile-only-hidden
 */
const ORIGIN = 'https://www.chevronlubricants.com';
const HEADINGS = 'h1, h2, h3, h4, h5, h6';

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

// in-page "#hash" jump links stay as they are (retargeted by chevron-expertise-cleanup)
function linkHref(href) {
  const raw = (href || '').trim();
  if (!raw || raw === '#' || /^javascript:/i.test(raw)) return '';
  if (raw.startsWith('#')) return raw;
  return absUrl(raw);
}

function hasContent(el) {
  return !!(clean(el.textContent) || el.querySelector('img'));
}

function children(item) {
  return [...item.children].filter((c) => !c.matches('.divider, .anchor-tag, .repeating-image-overlay, script, style') && hasContent(c));
}

function items(element) {
  return [...element.querySelectorAll(':scope > .multi-column__container > .multi-column__content > .multi-column__item')]
    .filter((item) => children(item).length);
}

function makeImg(document, cmp) {
  const srcImg = cmp && (cmp.querySelector('img.mobile-only-hidden') || cmp.querySelector('img'));
  if (!srcImg) return null;
  const src = srcImg.getAttribute('data-src') || srcImg.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) return null;
  const img = document.createElement('img');
  img.src = absUrl(src);
  img.alt = clean(srcImg.getAttribute('alt'));
  return img;
}

function imageLink(cmp) {
  const a = cmp && cmp.querySelector('a[href]');
  return a ? linkHref(a.getAttribute('href')) : '';
}

// text lines of a rich text: one entry per paragraph / heading / list item
function lines(richtext) {
  const root = richtext.querySelector('.richtext__container') || richtext;
  let blocks = [...root.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li')].filter((b) => !b.querySelector('p, li'));
  if (!blocks.length) blocks = [root];
  return blocks.map((b) => {
    const text = clean(b.textContent);
    const bolds = [...b.querySelectorAll('b, strong')].map((s) => s.textContent).join(' ');
    const link = b.querySelector('a[href]');
    return {
      text,
      bold: !!text && (b.matches(HEADINGS) || clean(bolds) === text),
      href: link ? linkHref(link.getAttribute('href')) : '',
    };
  }).filter((l) => l.text);
}

function makeTitle(document, text, href) {
  const h3 = document.createElement('h3');
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    h3.append(a);
  } else {
    h3.textContent = text;
  }
  return h3;
}

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

/**
 * Text cell from title components / rich texts:
 *   .title -> section-heading = title (its link), sub-heading = description
 *   .richtext -> leading bold lines = title, the rest = description; a rich text with
 *               no bold lines (coolant "Stable pH levels", techron links) is the title
 */
function textCell(document, comps, fallbackHref) {
  let title = '';
  let titleHref = '';
  const desc = [];
  comps.forEach((c) => {
    if (c.matches('.title')) {
      const main = c.querySelector('.section-heading');
      const sub = c.querySelector('.sub-heading');
      if (main && clean(main.textContent) && !title) {
        title = clean(main.textContent);
        const a = main.querySelector('a[href]');
        if (a) titleHref = linkHref(a.getAttribute('href'));
      } else if (main && clean(main.textContent)) {
        desc.push(clean(main.textContent));
      }
      if (sub && clean(sub.textContent)) desc.push(clean(sub.textContent));
      return;
    }
    const ls = lines(c);
    if (!ls.length) return;
    let i = 0;
    if (!title) {
      const anyBold = ls.some((l) => l.bold);
      const head = anyBold ? [] : ls.slice();
      if (anyBold) while (i < ls.length && ls[i].bold) { head.push(ls[i]); i += 1; }
      else i = ls.length;
      title = head.map((l) => l.text).join(' ');
      const linked = head.find((l) => l.href);
      if (linked) titleHref = linked.href;
    }
    ls.slice(i).forEach((l) => desc.push(l.text));
  });
  const cell = [];
  if (title) cell.push(makeTitle(document, title, titleHref || fallbackHref));
  desc.forEach((t) => cell.push(para(document, t)));
  return cell;
}

function nestedTile(document, item) {
  const nested = item.querySelector(':scope > .multi-column');
  const parts = items(nested);
  const iconItem = parts.find((p) => p.querySelector('.cmp-image'));
  const icon = iconItem ? iconItem.querySelector('.cmp-image') : null;
  const textComps = parts.filter((p) => p !== iconItem).flatMap((p) => children(p));
  const img = makeImg(document, icon);
  return [img ? [img] : [], textCell(document, textComps, imageLink(icon))];
}

function flatTile(document, item) {
  const comps = children(item);
  const images = comps.filter((c) => c.matches('.cmp-image'));
  const icon = images[0] || null;
  // trailing linked image ("Anchor jump" button) -> link target of the title
  const extra = images.slice(1).map(imageLink).find(Boolean) || '';
  const text = comps.filter((c) => !c.matches('.cmp-image'));
  const img = makeImg(document, icon);
  return [img ? [img] : [], textCell(document, text, imageLink(icon) || extra)];
}

export default function parse(element, { document }) {
  const cells = items(element).map((item) => {
    const comps = children(item);
    if (comps.length === 1 && comps[0].matches('.multi-column')) return nestedTile(document, item);
    return flatTile(document, item);
  }).filter(([icon, text]) => icon.length || text.length);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service', cells });
  element.replaceWith(block);
}
