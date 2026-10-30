/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-cta (base: columns)
 * Source: https://www.chevronlubricants.com/ (homepage, "Where to buy" band)
 *
 * Block table: 1 row x 4 cells, each cell = one CTA link (block JS turns it into a pill button).
 *
 * Source DOM (validated against migration-work/block-context/columns-cta/source.html):
 *   .multi-column__content > .multi-column__item (x4)
 *     .button .btn-wrapper a.btn[href] > span.btn-text
 *   (divider sections in each item are decorative and ignored)
 */
const ORIGIN = 'https://www.chevronlubricants.com';

function absUrl(url) {
  if (!url) return '';
  try {
    return new URL(url.trim(), ORIGIN).href;
  } catch (e) {
    return url;
  }
}

/* ------------------------------------------------------------------------------------------
 * expertise-* templates (expertise-marketing). The homepage element is the
 * .multi-column__container itself and never reaches this code (homepage output unchanged).
 * Source shapes (page-templates.json instance selectors, validated on the live DOM of the
 * expertise pages, migration-work/block-context/columns-cta/instances/expertise-*.html):
 *   [0] .social-media: optional title (-> paragraph before the block) + per network an
 *       icon link and a label link -> cell = icon image + label link
 *   [1] .panel-with-button: cell 1 = text (no link), cell 2 = button link
 *   [2] top-level .richtext with 5+ links (success stories model row): option "links",
 *       one cell per href; adjacent <a> with the same href are merged ("600" + " ADF")
 *   [3] multi-column of button-only items: one cell per .button link (gf7 "#Benefits"
 *       jump links keep their #hash; greaseportfolio filter buttons). Option "red" when
 *       every button is a.btn.bg-havoline / bg-red (gf7); white buttons get no option
 *   [4] multi-column column16 social icon row: empty items skipped; cell = icon image +
 *       link (text = image alt). Option "icons" when every item is an image-only link
 *       with no visible label (techron, havoline, havoline drivers / customer stories)
 *   [5] multi-column column20 link-icon row: text item -> plain text cell, icon items ->
 *       icon image + link (text = image alt)
 * Desktop images (img.mobile-only-hidden) are used; hrefs are absolute source URLs
 * (chevron-links.js maps them later), in-page "#hash" hrefs stay as they are.
 * ---------------------------------------------------------------------------------------- */

function ctaClean(text) {
  return (text || '').replace(/[\s ​]+/g, ' ').trim();
}

function ctaHref(srcLink) {
  const raw = ((srcLink && srcLink.getAttribute('href')) || '').trim();
  if (!raw || raw === '#' || /^javascript:/i.test(raw)) return '';
  if (raw.startsWith('#')) return raw;
  return absUrl(raw);
}

function ctaImg(document, container) {
  const src = container && (container.querySelector('img.mobile-only-hidden') || container.querySelector('img'));
  const url = src && (src.getAttribute('data-src') || src.getAttribute('src'));
  if (!url || url.startsWith('data:')) return null;
  const img = document.createElement('img');
  img.src = absUrl(url);
  img.alt = ctaClean(src.getAttribute('alt'));
  return img;
}

// one cell paragraph: [icon] + link (or plain text when there is no href)
function ctaCell(document, href, text, icon) {
  const p = document.createElement('p');
  if (icon) p.append(icon);
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text || href;
    if (icon) p.append(document.createTextNode(' '));
    p.append(a);
  } else if (text) {
    p.append(document.createTextNode(text));
  }
  return [p];
}

function ctaItems(element) {
  return [...element.querySelectorAll(':scope > .multi-column__container > .multi-column__content > .multi-column__item')]
    .filter((item) => ctaClean(item.textContent) || item.querySelector('img'));
}

function socialCells(document, element) {
  const cells = [];
  const seen = new Map();
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = ctaHref(a);
    if (!href) return;
    let entry = seen.get(href);
    if (!entry) {
      entry = { href, icon: null, text: '' };
      seen.set(href, entry);
      cells.push(entry);
    }
    if (!entry.icon && a.querySelector('img')) entry.icon = ctaImg(document, a);
    const text = ctaClean(a.textContent);
    if (text && !entry.text) entry.text = text;
  });
  return cells.map((c) => ctaCell(document, c.href, c.text || (c.icon && c.icon.alt) || '', c.icon));
}

function panelCells(document, element) {
  const cells = [];
  const text = element.querySelector('.panel-with-button__text');
  if (text && ctaClean(text.textContent)) cells.push(ctaCell(document, '', ctaClean(text.textContent)));
  element.querySelectorAll('.panel-with-button__button a[href], .btn-wrapper a[href]').forEach((a) => {
    const label = ctaClean((a.querySelector('.btn-text') || a).textContent);
    if (label) cells.push(ctaCell(document, ctaHref(a), label));
  });
  return cells;
}

// rich text link row: one cell per href, consecutive same-href anchors merged
function linkRowCells(document, element) {
  const groups = [];
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = ctaHref(a);
    const text = ctaClean(a.textContent);
    if (!href || !text) return;
    const last = groups[groups.length - 1];
    if (last && last.href === href) last.text = `${last.text}${/\s$/.test(a.textContent.replace(/ /g, ' ')) || /^\s/.test(a.textContent.replace(/ /g, ' ')) ? ' ' : ''}${text}`;
    else groups.push({ href, text });
  });
  return groups.map((g) => ctaCell(document, g.href, ctaClean(g.text)));
}

// red button background on the source (gf-7 jump links: a.btn.bg-havoline)
const RED_BUTTON = /(^|\s)bg-(havoline|red)(\s|$)/;

/* multi-column rows. Options detected from the source DOM:
 *   red   - every button link has a red background class (bg-havoline / bg-red)
 *   icons - every cell is a link whose only content is an image (no visible
 *           label anywhere in the item), e.g. Techron / Havoline social rows;
 *           the link text is the image alt (kept as the accessible name) */
function multiColumnCells(document, element) {
  const cells = [];
  let buttonCount = 0;
  let redCount = 0;
  let iconOnly = true;
  ctaItems(element).forEach((item) => {
    const buttons = [...item.querySelectorAll('.button a[href], .btn-wrapper a[href]')];
    const images = [...item.querySelectorAll('.cmp-image')];
    if (buttons.length) {
      iconOnly = false;
      buttons.forEach((a) => {
        const label = ctaClean((a.querySelector('.btn-text') || a).textContent);
        if (!label) return;
        buttonCount += 1;
        if (RED_BUTTON.test(a.getAttribute('class') || '')) redCount += 1;
        cells.push(ctaCell(document, ctaHref(a), label));
      });
    } else if (images.length) {
      if (ctaClean(item.textContent)) iconOnly = false;
      images.forEach((cmp) => {
        const link = cmp.querySelector('a[href]');
        const icon = ctaImg(document, cmp);
        const href = ctaHref(link);
        if (!href || !icon || !icon.alt || ctaClean(link.textContent)) iconOnly = false;
        cells.push(ctaCell(document, href, icon ? icon.alt : '', icon));
      });
    } else if (ctaClean(item.textContent)) {
      iconOnly = false;
      cells.push(ctaCell(document, '', ctaClean(item.textContent)));
    }
  });
  const variants = [];
  if (buttonCount && redCount === buttonCount && buttonCount === cells.length) variants.push('red');
  else if (cells.length && iconOnly) variants.push('icons');
  return { cells, variants };
}

function parseExpertise(element, document) {
  let row;
  let variants = [];
  const before = [];
  if (element.matches('.social-media')) {
    const title = element.querySelector('.social-media__title');
    if (title && ctaClean(title.textContent)) {
      const p = document.createElement('p');
      p.textContent = ctaClean(title.textContent);
      before.push(p);
    }
    row = socialCells(document, element);
  } else if (element.matches('.panel-with-button')) {
    row = panelCells(document, element);
  } else if (element.matches('.richtext')) {
    row = linkRowCells(document, element);
    variants = ['links'];
  } else {
    ({ cells: row, variants } = multiColumnCells(document, element));
  }
  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', variants, cells });
  element.replaceWith(...before, block);
}

export default function parse(element, { document }) {
  // expertise-* sources (the homepage passes the .multi-column__container itself)
  if (!element.matches('.multi-column__container')) {
    parseExpertise(element, document);
    return;
  }

  const items = [...element.querySelectorAll('.multi-column__content > .multi-column__item')];

  const row = [];
  items.forEach((item) => {
    const links = [...item.querySelectorAll('.btn-wrapper a[href]')];
    if (!links.length) return;
    const cell = links.map((srcLink) => {
      const a = document.createElement('a');
      a.href = absUrl(srcLink.getAttribute('href'));
      const label = srcLink.querySelector('.btn-text') || srcLink;
      a.textContent = label.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.append(a);
      return p;
    });
    row.push(cell);
  });

  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
