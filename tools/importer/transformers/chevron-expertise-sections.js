/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Chevron Lubricants expertise sections
 * Applies ONLY to templates whose name starts with "expertise-" (no-op otherwise;
 * chevron-sections.js skips those templates, so the homepage / products-* section
 * logic there is unchanged).
 *
 * Implements migration-work/expertise/section-rules.json (rules are embedded
 * below; keep them in sync with that file):
 *   - units = element children of #main-content > .container-fluid, minus skipped
 *     units (dividers, anchor tags, empty simple-panels, empty product-list rows)
 *   - each unit gets a bg style from its band element (overrides first, then the
 *     first matching band selector + class -> style map; null when nothing matches)
 *   - consecutive units with the same bg style form one section
 *   - "centered" is appended when the section has default content and all of it is
 *     centre-aligned (title .Center, richtext text-align:center, imageAlignedCenter,
 *     btn-align-center, distributor)
 *
 * beforeTransform: resolve all units / groups BEFORE mutating the DOM (and before
 * the parsers replace block elements), then insert an <hr> before the first unit of
 * every group except the first. Styled groups carry temporary marker attributes
 * (data-excat-section-id / data-excat-section-style); a styled first group gets a
 * temporary marked <hr> as well.
 * afterTransform: insert a Section Metadata block after each marker, drop the
 * marker attributes, and remove the first group's temporary <hr>.
 *
 * Note: migration-work cleaned.html captures strip data-bg-color; multi-column bands
 * then fall back to the bg-* class on .multi-column__container (the raw HTML carries
 * both), so the result is the same on live DOM and on raw/cleaned HTML.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

const MARKER = 'data-excat-section-id';
const STYLE_ATTR = 'data-excat-section-style';
const FIRST_ATTR = 'data-excat-first-section';

const ROOT = '#main-content > .container-fluid';

const SKIP = [
  '.divider',
  '.anchor-tag',
  '.simple-panel:not(:has(> .row > .container-fluid > div > *))',
  '.row.product-list-component:not(:has(.slider-wrapper))',
];

const BAND_SELECTORS = [
  ':scope > .multi-column__container[data-bg-color]',
  // fallback for captures without data-bg-color (raw / cleaned HTML keep the class)
  ':scope > .multi-column__container',
  ':scope > .richtext__container',
  ':scope > .row.panel-background',
  '.distributor__container',
  '.social-media__container',
  '.panel-with-button__container',
  '.testimonial__container',
  '.drawer__content',
  '.knowledge-center__container',
  '.square-carousel__container',
  '.product-list .list-wrapper',
];

const CLASS_TO_STYLE = {
  'bg-light-gray': 'grey-bg',
  'bg-blue': 'cobalt-blue-bg',
  'bg-delo': 'cobalt-blue-bg',
  'bg-strong-blue': 'blue-bg',
  'bg-isoclean': 'sky-blue-bg',
  'bg-black': 'black-bg',
  'bg-blue-2': 'teal-blue-bg',
  'bg-white': null,
  'bg-transparent': null,
  defaultBackground: null,
};

const OVERRIDES = [
  { unit: '.row.product-list-component', band: '.product-list .list-wrapper.bg-light-gray', style: 'grey-gradient' },
  { unit: '.panel-with-button', band: '.panel-with-button__container.defaultBackground', style: 'blue-bg' },
  { unit: '.testimonial', band: '.testimonial__container', style: 'grey-bg' },
];

const COMPONENTS = '.title, .richtext, .cmp-image, .button, .distributor';

function isExpertise(payload) {
  const name = payload && payload.template && payload.template.name;
  return typeof name === 'string' && name.startsWith('expertise-');
}

function safeMatches(el, sel) {
  try { return el.matches(sel); } catch (e) { return false; }
}

function safeQuery(el, sel) {
  try { return el.querySelector(sel); } catch (e) { return null; }
}

function bgToken(el) {
  const attr = (el.getAttribute('data-bg-color') || '').trim();
  if (attr) return attr;
  return [...el.classList].find((c) => c.startsWith('bg-') || c === 'defaultBackground') || null;
}

function bgStyle(unit) {
  for (const o of OVERRIDES) {
    if (safeMatches(unit, o.unit) && safeQuery(unit, o.band)) return o.style;
  }
  for (const sel of BAND_SELECTORS) {
    const band = safeQuery(unit, sel);
    if (band) {
      const tok = bgToken(band);
      return tok && Object.prototype.hasOwnProperty.call(CLASS_TO_STYLE, tok) ? CLASS_TO_STYLE[tok] : null;
    }
  }
  return null;
}

function blockElements(element, template) {
  const els = [];
  ((template && template.blocks) || []).forEach((b) => (b.instances || []).forEach((sel) => {
    try { element.querySelectorAll(sel).forEach((el) => els.push(el)); } catch (e) { /* invalid selector */ }
  }));
  return els;
}

function hasText(el) {
  return (el.textContent || '').replace(/ /g, ' ').trim().length > 0;
}

// true / false, or null when the component has nothing to align (ignored)
function isCentred(comp) {
  if (comp.matches('.distributor')) return true;
  if (comp.matches('.title')) {
    const h = comp.querySelector('.section-heading');
    if (!h) return hasText(comp) ? false : null;
    return h.classList.contains('Center');
  }
  if (comp.matches('.richtext')) {
    const texts = [...comp.querySelectorAll('p, h1, h2, h3, h4, h5, h6')].filter(hasText);
    if (!texts.length) return null;
    return texts.every((t) => {
      for (let n = t; n && n !== comp.parentElement; n = n.parentElement) {
        if (n.style && n.style.textAlign === 'center') return true;
      }
      return false;
    });
  }
  if (comp.matches('.cmp-image')) {
    return !!comp.querySelector(':scope > .cl-adaptive-image.imageAlignedCenter');
  }
  if (comp.matches('.button')) {
    return !!comp.querySelector('.btn-wrapper.btn-align-center');
  }
  return null;
}

function defaultComponents(unit, blocks) {
  const inBlock = (el) => blocks.some((b) => b === el || b.contains(el));
  if (inBlock(unit)) return [];
  if (unit.matches(COMPONENTS)) return [unit];
  return [...unit.querySelectorAll(COMPONENTS)].filter((c) => {
    if (inBlock(c)) return false;
    const outer = c.parentElement && c.parentElement.closest(COMPONENTS);
    return !(outer && unit.contains(outer));
  });
}

function resolveGroups(element, template) {
  const root = element.querySelector(ROOT);
  if (!root) return [];
  const blocks = blockElements(element, template);
  const units = [...root.children].filter((u) => u.tagName !== 'HR' && !SKIP.some((s) => safeMatches(u, s)));
  const groups = [];
  units.forEach((u) => {
    const bg = bgStyle(u);
    if (!groups.length || groups[groups.length - 1].bg !== bg) groups.push({ bg, units: [] });
    groups[groups.length - 1].units.push(u);
  });
  groups.forEach((g) => {
    const states = [];
    g.units.forEach((u) => defaultComponents(u, blocks).forEach((c) => {
      const s = isCentred(c);
      if (s !== null) states.push(s);
    }));
    const centred = states.length > 0 && states.every(Boolean);
    g.style = [g.bg, centred ? 'centered' : null].filter(Boolean).join(', ') || null;
  });
  return groups;
}

export default function transform(hookName, element, payload) {
  if (!isExpertise(payload)) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === TransformHook.beforeTransform) {
    const groups = resolveGroups(element, payload.template);
    for (let i = groups.length - 1; i >= 0; i -= 1) {
      const g = groups[i];
      const first = g.units[0];
      if (!first || !first.parentNode) continue;
      if (i === 0 && !g.style) continue;
      const hr = doc.createElement('hr');
      if (g.style) {
        hr.setAttribute(MARKER, `g${i + 1}`);
        hr.setAttribute(STYLE_ATTR, g.style);
      }
      if (i === 0) hr.setAttribute(FIRST_ATTR, 'true');
      first.parentNode.insertBefore(hr, first);
    }
  }

  if (hookName === TransformHook.afterTransform) {
    const markers = [...element.querySelectorAll(`hr[${MARKER}]`)].reverse();
    markers.forEach((marker) => {
      const style = marker.getAttribute(STYLE_ATTR);
      if (style && marker.parentNode) {
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style },
        });
        marker.parentNode.insertBefore(metadata, marker.nextSibling);
      }
      if (marker.hasAttribute(FIRST_ATTR)) {
        marker.remove();
      } else {
        marker.removeAttribute(MARKER);
        marker.removeAttribute(STYLE_ATTR);
      }
    });
  }
}
