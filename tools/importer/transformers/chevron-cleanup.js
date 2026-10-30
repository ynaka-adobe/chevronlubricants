/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Chevron Lubricants cleanup
 * Removes non-authorable site chrome and widgets.
 * Applies to: www.chevronlubricants.com (all templates)
 *
 * All selectors verified in migration-work/cleaned.html (homepage capture).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Header chrome: <div class="utility-nav ...">, <div class="header-component">
    // (contains <header class="navbar-header">, mobile/desktop <nav>, #search-modal)
    WebImporter.DOMUtils.remove(element, [
      '.utility-nav',
      '.header-component',
    ]);

    // Modals: <div class="modal" id="country-modal">, <div class="modal modal-video">
    WebImporter.DOMUtils.remove(element, [
      '#country-modal',
      '.modal',
    ]);

    // OneTrust cookie banner / preference center: <div id="onetrust-consent-sdk">
    WebImporter.DOMUtils.remove(element, ['#onetrust-consent-sdk']);

    // Share bar ("Share this page"), back-to-top, contact-us floating buttons
    WebImporter.DOMUtils.remove(element, [
      '.social-sharing__container',
      '.social-sharing__contactUs',
      '.backtotop',
      '.contact-us-button',
    ]);

    // Salesforce embedded messaging (chat): <div id="embedded-messaging">,
    // <iframe id="embeddedMessagingSiteContextFrame">
    WebImporter.DOMUtils.remove(element, [
      '#embedded-messaging',
      '#embeddedMessagingSiteContextFrame',
    ]);

    // Whole footer: <div class="footer footer--default bg-light-gray"> (includes the
    // pre-footer "Work With Us" strip, contact form and <footer class="footer footer__v2">)
    WebImporter.DOMUtils.remove(element, ['.footer.footer--default']);

    // Featured products: off-screen "Delo" category filter button
    // <div class="fp-pills"><div class="product-category hide"><button>Delo</button>
    WebImporter.DOMUtils.remove(element, [
      '.featured-products .fp-pills',
      '.featured-products .product-category',
    ]);

    // Tracking beacons / iframes outside content
    WebImporter.DOMUtils.remove(element, [
      '#ZN_1TwTgoBfYT3jGVT',
      '#destination_publishing_iframe_chevronlubricants_0',
      '[id^="batBeacon"]',
      '#xaxis_dm_7446577370',
    ]);

    // Hidden tracking pixel: <div style="display: none;"><img src="https://nova.collect.igodigital.com/...">
    element.querySelectorAll('img[src*="igodigital.com"]').forEach((img) => {
      const wrapper = img.parentElement;
      if (wrapper && wrapper.tagName === 'DIV' && wrapper.children.length === 1) wrapper.remove();
      else img.remove();
    });

    // Rich text section titles: <h1><b><span>Title</span></b></h1> and bold-only
    // <p><b>Title</b></p> are section headings; spacer <p>&nbsp;</p> are dropped.
    // Only top-level rich text (not rich text nested inside multi-column blocks).
    element.querySelectorAll('#main-content > .container-fluid > .richtext.parbase .richtext__container').forEach((container) => {
      container.querySelectorAll('p').forEach((p) => {
        const text = p.textContent.replace(/ /g, ' ').trim();
        if (!text && !p.querySelector('img, a')) {
          p.remove();
          return;
        }
        const bold = p.querySelector('b, strong');
        if (bold && bold.textContent.trim() === text && !p.querySelector('a, img')) {
          const h2 = element.ownerDocument.createElement('h2');
          h2.textContent = text;
          // expertise-* only: keep inline text-align so chevron-expertise-sections.js
          // can still derive "centered" when it runs after this transformer
          const templateName = (payload && payload.template && payload.template.name) || '';
          if (templateName.startsWith('expertise-') && p.getAttribute('style')) {
            h2.setAttribute('style', p.getAttribute('style'));
          }
          p.replaceWith(h2);
        }
      });
      container.querySelectorAll('h1, h2, h3').forEach((h) => {
        h.textContent = h.textContent.replace(/ /g, ' ').trim();
      });
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Decorative empty divider in featured products: <div class="divider">
    WebImporter.DOMUtils.remove(element, ['.featured-products .divider']);

    // Remaining non-content elements (tracking iframes, reCAPTCHA, etc.)
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
      'script',
      'style',
    ]);

    // Tracking / behaviour attributes
    element.querySelectorAll('[onclick], [data-sitekey], [data-callback]').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-sitekey');
      el.removeAttribute('data-callback');
    });
  }
}
