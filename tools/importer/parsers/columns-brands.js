/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-brands block
 *
 * Source: https://www.chevronlubricants.com
 * Base Block: columns
 *
 * Block Structure:
 * - Row 1: Block name header ("Columns-Brands")
 * - Row 2: 4 columns each with linked brand logo image
 *
 * Source HTML Pattern:
 * <div class="multi-column__container">
 *   <div class="multi-column__content">
 *     <div class="multi-column__item">
 *       <a href="/brand-page"><img src="brand-logo.png" alt="Brand"></a>
 *     </div>
 *     ...repeat for each brand
 *   </div>
 * </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // Extract brand logo columns
  // VALIDATED: Source HTML has .multi-column__item elements with linked brand images
  const columnItems = element.querySelectorAll('.multi-column__item') ||
                      element.querySelectorAll(':scope > div > div');

  const columnCells = [];

  columnItems.forEach((item) => {
    const cell = document.createElement('div');

    // Extract linked brand logo
    // VALIDATED: Source has <a href="/brand-page"><img alt="Brand Name"></a>
    const link = item.querySelector('a[href]');
    const img = item.querySelector('img');

    if (link && img) {
      const a = document.createElement('a');
      a.href = link.href;
      a.appendChild(img.cloneNode(true));
      cell.appendChild(a);
    } else if (img) {
      cell.appendChild(img.cloneNode(true));
    }

    if (cell.childNodes.length) {
      columnCells.push(cell);
    }
  });

  const cells = [columnCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Brands', cells });
  element.replaceWith(block);
}
