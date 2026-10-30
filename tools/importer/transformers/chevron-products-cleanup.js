/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Chevron Lubricants product listing cleanup
 * Applies ONLY to templates whose name starts with "products-"
 * (products-listing, products-listing-alt, products-brand). It does nothing for
 * other templates (e.g. chevron-homepage), so homepage output is unchanged.
 *
 * Site-wide chrome (utility nav, header, footer incl. "Work With Us" band and
 * contact form, cookie banner, share bar, chat, modals) is handled by
 * chevron-cleanup.js. This file removes listing-only, non-authorable UI and
 * fixes heading levels.
 *
 * Selectors verified in migration-work/cleaned.html (automobile_fleets capture).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

function isProductsTemplate(payload) {
  const name = payload && payload.template && payload.template.name;
  return typeof name === 'string' && name.startsWith('products-');
}

function cleanText(text) {
  return (text || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function replaceWithHeading(doc, el, level) {
  const h = doc.createElement(`h${level}`);
  h.textContent = cleanText(el.textContent);
  el.replaceWith(h);
  return h;
}

export default function transform(hookName, element, payload) {
  if (!isProductsTemplate(payload)) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === TransformHook.beforeTransform) {
    // Breadcrumb: <div class="breadcrumb aem-GridColumn"><nav class="breadcrumbs">
    WebImporter.DOMUtils.remove(element, ['.breadcrumb', 'nav.breadcrumbs']);

    // Empty product catalog header: <div class="product-catalog-header"> with an
    // empty <h1 class="product-catalog__tagtitle"> and empty description.
    // Only dropped when it holds no text/media (other pages may fill it).
    element.querySelectorAll('.product-catalog-header').forEach((el) => {
      if (!cleanText(el.textContent) && !el.querySelector('img, picture, video, a[href]')) el.remove();
    });

    // Brand catalog header tagline: <div class="product-catalog__tagline">
    // <span class="product-catalog__tagline-delimiter">| <span ..-text>..</span></span></div>
    // (the text span is nested inside the delimiter) -> keep only the tagline text as a paragraph.
    element.querySelectorAll('.product-catalog__tagline').forEach((el) => {
      const textEl = el.querySelector('.product-catalog__tagline-text');
      const text = cleanText(textEl ? textEl.textContent : el.textContent.replace(/^\s*\|/, ''));
      if (!text) {
        el.remove();
        return;
      }
      const p = doc.createElement('p');
      p.textContent = text;
      el.replaceWith(p);
    });

    // Featured carousel: slick clones (duplicate slides) and the print-only
    // duplicate list <div class="slider-wrapper__print">.
    WebImporter.DOMUtils.remove(element, ['.slick-cloned', '.slider-wrapper__print']);

    // Category nav bar: "Filter" toggle item, count badge, mobile duplicate menu.
    WebImporter.DOMUtils.remove(element, [
      'li.category-list-item__filter',
      '.countSpecified',
      '.category-mobile',
    ]);

    // Filter panel (inline + mobile modal) and client-side-only listing UI.
    WebImporter.DOMUtils.remove(element, [
      '.pll__filters-modal',
      '#productCategoryModal',
      '.pll__filters',
      '.product-listing-category__seeall',
      '.product-listing-list__back-to-all-products',
      '.product-listing-list__no-results',
      '.product-listing-filter__selected-filters',
    ]);

    // Page title rich text: <h1><b>Automobile fleets</b><br></h1> -> plain <h1>.
    element.querySelectorAll('.product-list__rebrand .richtext__container h1').forEach((h1) => {
      h1.textContent = cleanText(h1.textContent);
    });

    // "Featured Products" label: <div class="product-list-rebrand__title"><div>..</div></div> -> <h2>
    element.querySelectorAll('.product-list__rebrand .product-list-rebrand__title').forEach((el) => {
      if (cleanText(el.textContent)) replaceWithHeading(doc, el, 2);
      else el.remove();
    });

    // Exactly one H1: drop empty H1s, demote any extra H1 to H2.
    element.querySelectorAll('h1').forEach((h1) => {
      if (!cleanText(h1.textContent)) h1.remove();
    });
    const h1s = [...element.querySelectorAll('h1')];
    h1s.slice(1).forEach((h1) => replaceWithHeading(doc, h1, 2));
    const hasH1 = h1s.length > 0;

    // Category header + group headings share
    // <span class="product-listing-category__header"> inside .pll.
    // First (category container header, ranked-list__0) -> H2, groups -> H3.
    // If the page has no H1 (pages without the featured rich text), the category
    // header becomes the H1 and the groups become H2.
    const headers = [...element.querySelectorAll('.pll .product-listing-category__header')];
    headers.forEach((el, i) => {
      if (!cleanText(el.textContent)) {
        el.remove();
        return;
      }
      let level;
      if (i === 0) level = hasH1 ? 2 : 1;
      else level = hasH1 ? 3 : 2;
      replaceWithHeading(doc, el, level);
    });
  }
}
