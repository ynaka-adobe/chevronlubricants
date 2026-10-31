/* eslint-disable */
/* global WebImporter */

/**
 * Parser for checklist (source .check-list and .image-check-list components).
 * Template: expertise-services (lubewatch, havoline-oil-change-pros, lubetek, isoclean-program, ...).
 *
 * Block table (blocks/checklist/README.md): rows of 1-2 cells, each cell free content:
 *   title (h3) + list (ul > li: <strong>item title</strong> + item text), an image, a button.
 * Variant: check (source .item--check, image-check-list) | bullet (.item--bullet); grey when
 * the source list sits on .bg-light-gray.
 *
 * Source DOM:
 *   .check-list .check-list__container[.bg-light-gray] .check-list__content
 *     .check-list__title, .check-list__subtitle?,
 *     .check-list__list(.--hidden) .item.item--check|--bullet > .title? + .text
 *   (items in .check-list__list--hidden are hidden on the source by a broken, empty
 *    .check-list__control toggle; they are kept and shown)
 *   .image-check-list .image-check-list__content: __title, __subtitle, __cards-container >
 *     __card (img + __card__text), __subtitle, __list > __item > .title + .text
 *   A multi-column whose items hold only check-lists / images / buttons is parsed as one block
 *   (one cell per non-empty item), so side-by-side layouts survive.
 */
const ORIGIN = 'https://www.chevronlubricants.com';

function abs(url) {
  try { return new URL(url, ORIGIN).href; } catch (e) { return url; }
}

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function inlineHtml(document, from, to) {
  // copy the inline content of a .text block (its <p>s become line breaks)
  const parts = [...from.querySelectorAll(':scope > p')];
  const sources = parts.length ? parts : [from];
  sources.forEach((src, i) => {
    if (i > 0) to.append(document.createElement('br'));
    [...src.childNodes].forEach((n) => to.append(n.cloneNode(true)));
  });
}

function makeImg(document, srcImg) {
  if (!srcImg) return null;
  const src = srcImg.getAttribute('data-src') || srcImg.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) return null;
  const img = document.createElement('img');
  img.src = abs(src);
  img.alt = clean(srcImg.getAttribute('alt'));
  return img;
}

function imageCell(document, cmp) {
  const img = makeImg(document, cmp.querySelector('img.mobile-only-hidden') || cmp.querySelector('img'));
  if (!img) return [];
  const link = cmp.querySelector('a[href]');
  const p = document.createElement('p');
  if (link) {
    const a = document.createElement('a');
    a.href = abs(link.getAttribute('href'));
    a.append(img);
    p.append(a);
  } else {
    p.append(img);
  }
  return [p];
}

function buttonCell(document, button) {
  const link = button.querySelector('a[href]');
  if (!link || !clean(link.textContent)) return [];
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const a = document.createElement('a');
  a.href = abs(link.getAttribute('href'));
  a.textContent = clean(link.textContent);
  const red = /bg-havoline|bg-red/.test(link.className);
  if (red) {
    const em = document.createElement('em');
    em.append(a);
    strong.append(em);
  } else {
    strong.append(a);
  }
  p.append(strong);
  return [p];
}

function heading(document, text) {
  const h = document.createElement('h3');
  h.textContent = text;
  return h;
}

function para(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function listOf(document, items) {
  const ul = document.createElement('ul');
  items.forEach((item) => {
    const title = clean(item.querySelector(':scope > .title')?.textContent);
    const textEl = item.querySelector(':scope > .text');
    const hasText = textEl && clean(textEl.textContent);
    if (!title && !hasText) return;
    const li = document.createElement('li');
    if (title) {
      const strong = document.createElement('strong');
      strong.textContent = title;
      li.append(strong);
      if (hasText) li.append(document.createElement('br'));
    }
    if (hasText) inlineHtml(document, textEl, li);
    ul.append(li);
  });
  return ul.children.length ? ul : null;
}

function checkListCell(document, cl) {
  const nodes = [];
  const title = clean(cl.querySelector('.check-list__title')?.textContent);
  if (title) nodes.push(heading(document, title));
  const subtitle = clean(cl.querySelector('.check-list__subtitle')?.textContent);
  if (subtitle) nodes.push(para(document, subtitle));
  const ul = listOf(document, [...cl.querySelectorAll('.check-list__list .item, .check-list__list--hidden .item')]);
  if (ul) nodes.push(ul);
  return nodes;
}

// the source sets the grey either with .bg-light-gray or through its default background
// (#f5f5f5, e.g. lubewatch); the importer runs in the browser, so read the computed colour
function isGrey(container) {
  if (!container) return false;
  if (container.classList.contains('bg-light-gray')) return true;
  const view = container.ownerDocument.defaultView;
  return !!view && view.getComputedStyle(container).backgroundColor === 'rgb(245, 245, 245)';
}

function variantsOf(els) {
  const check = els.some((el) => el.querySelector('.item--check') || el.classList.contains('image-check-list'));
  const grey = els.some((el) => el.classList.contains('image-check-list')
    || isGrey(el.querySelector('.check-list__container')));
  return [check ? 'check' : 'bullet', grey ? 'grey' : ''].filter(Boolean);
}

function parseImageCheckList(element, document) {
  const content = element.querySelector('.image-check-list__content') || element;
  const rows = [];
  const intro = [];
  const title = clean(content.querySelector('.image-check-list__title')?.textContent);
  if (title) intro.push(heading(document, title));
  const subtitles = [...content.querySelectorAll(':scope > .image-check-list__subtitle')].map((s) => clean(s.textContent)).filter(Boolean);
  if (subtitles[0]) intro.push(para(document, subtitles[0]));
  if (intro.length) rows.push([intro]);
  const cards = [...content.querySelectorAll('.image-check-list__card')].map((card) => {
    const img = makeImg(document, card.querySelector('img'));
    const caption = clean(card.querySelector('.image-check-list__card__text')?.textContent);
    const cell = [];
    if (img) { const p = document.createElement('p'); p.append(img); cell.push(p); }
    if (caption) cell.push(para(document, caption));
    return cell;
  }).filter((c) => c.length);
  if (cards.length) rows.push(cards);
  const listCell = [];
  if (subtitles[1]) listCell.push(para(document, subtitles[1]));
  const ul = listOf(document, [...content.querySelectorAll('.image-check-list__item')]);
  if (ul) listCell.push(ul);
  if (listCell.length) rows.push([listCell]);
  return rows;
}

export default function parse(element, { document }) {
  let rows;
  let sources;
  if (element.classList.contains('image-check-list')) {
    rows = parseImageCheckList(element, document);
    sources = [element];
  } else if (element.classList.contains('check-list')) {
    rows = [[checkListCell(document, element)]];
    sources = [element];
  } else {
    // multi-column of check-lists / images / buttons: one cell per non-empty item
    const items = [...element.querySelectorAll(':scope > .multi-column__container > .multi-column__content > .multi-column__item')];
    const cells = items.map((it) => [...it.children].flatMap((c) => {
      if (c.matches('.check-list')) return checkListCell(document, c);
      if (c.matches('.cmp-image, .cmp')) return imageCell(document, c);
      if (c.matches('.button')) return buttonCell(document, c);
      return [];
    })).filter((c) => c.length);
    rows = [cells];
    sources = [...element.querySelectorAll('.check-list')];
  }
  rows = rows.filter((r) => r.length && r.some((c) => c.length));
  if (!rows.length) return;
  const variants = variantsOf(sources);
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'checklist', variants, cells: rows }));
}
