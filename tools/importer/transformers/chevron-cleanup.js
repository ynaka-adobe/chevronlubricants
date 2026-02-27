/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Chevron Lubricants website cleanup
 * Purpose: Remove non-content elements and site-wide widgets
 * Applies to: www.chevronlubricants.com (all templates)
 * Generated: 2026-02-27
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (cleaned.html)
 * - Page structure analysis from chevron homepage
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform'
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove utility navigation (top bar with location selector, links)
    // EXTRACTED: Found <div class="utility-nav utility-nav--default utility-nav__v2"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.utility-nav',
      '#country-modal'
    ]);

    // Remove main navigation (mega menu with product categories)
    // EXTRACTED: Found <nav class="main-nav"> and complex navigation filters in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.main-nav',
      '.navigation-filter'
    ]);

    // Remove cookie banner / consent elements
    // EXTRACTED: Found cookie-related elements in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '[class*="cookie"]',
      '[class*="consent"]',
      '#onetrust-consent-sdk'
    ]);

    // Remove modal/overlay elements
    // EXTRACTED: Found <div class="modal" id="country-modal"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.modal',
      '.modal-backdrop'
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove footer section (handled by EDS auto-population)
    // EXTRACTED: Found <div class="footer footer--default bg-light-gray"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.footer',
      '.footer--default'
    ]);

    // Remove contact form section (complex interactive content)
    // EXTRACTED: Found form elements with class "form-group" in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.contact-form',
      'form'
    ]);

    // Remove remaining non-content elements
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
      'source'
    ]);

    // Clean up tracking attributes
    // EXTRACTED: Found data-* tracking attributes on multiple elements in captured DOM
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-analytics');
    });
  }
}
