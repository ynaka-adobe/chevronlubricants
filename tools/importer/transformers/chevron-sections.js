/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Chevron Lubricants sections
 * Inserts section breaks (<hr>) and Section Metadata blocks based on
 * payload.template.sections (from tools/importer/page-templates.json).
 *
 * beforeTransform: resolve every section element first (the nth-child selectors
 * would shift once <hr> elements are inserted), then insert <hr> before each
 * non-first section. Styled sections get a temporary data-excat-section-id marker
 * on their <hr>; a styled first section gets a temporary marked <hr> too.
 *
 * afterTransform: insert a Section Metadata block after each marker, strip the
 * marker attribute, and drop the first section's temporary <hr>.
 *
 * Sections 5 (.featured-products .fp-container) and 6
 * (.featured-products .content-component) share the .featured-products wrapper;
 * the break is inserted between them inside that wrapper.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try the next one
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  // expertise-* templates derive sections from background bands instead of
  // per-section selectors: handled by chevron-expertise-sections.js.
  const templateName = (payload && payload.template && payload.template.name) || '';
  if (templateName.startsWith('expertise-')) return;
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === TransformHook.beforeTransform) {
    // Resolve all section elements before mutating the DOM.
    const resolved = sections.map((section) => findSectionElement(element, section));

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = resolved[i];
      if (!el || !el.parentNode) continue;

      const styled = !!section.style;
      if (i === 0 && !styled) continue;

      const hr = doc.createElement('hr');
      if (styled) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === TransformHook.afterTransform) {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!marker || !marker.parentNode) continue;

      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      marker.parentNode.insertBefore(metadata, marker.nextSibling);

      if (marker.hasAttribute('data-excat-first-section')) {
        marker.remove();
      } else {
        marker.removeAttribute(MARKER);
      }
    }
  }
}
