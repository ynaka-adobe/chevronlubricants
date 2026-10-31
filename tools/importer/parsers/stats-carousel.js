/* eslint-disable */
/* global WebImporter */

/**
 * Parser for stats-carousel (source .article-hero-carousel-component, e.g. lubewatch
 * "Maintenance facts"). Template: expertise-services.
 *
 * Block table (blocks/stats-carousel/README.md): one row per statistic: [value | caption].
 *
 * Source DOM:
 *   .article-hero-carousel-component .slider > .slider-item (slick clones skipped)
 *     .c100.pNN > span (value, e.g. "65%"), .article-hero-carousel-component__caption (text)
 */
function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const cells = [...element.querySelectorAll('.slider-item')]
    .filter((item) => !item.closest('.slick-cloned'))
    .map((item) => [
      clean(item.querySelector('.c100 > span, .article-hero-carousel-component__wrapper')?.textContent),
      clean(item.querySelector('.article-hero-carousel-component__caption')?.textContent),
    ])
    .filter(([value, caption]) => value || caption);
  if (!cells.length) return;
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'stats-carousel', cells }));
}
