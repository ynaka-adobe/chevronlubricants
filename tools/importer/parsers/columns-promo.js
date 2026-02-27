/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-promo block
 *
 * Source: https://www.chevronlubricants.com
 * Base Block: columns
 *
 * Block Structure:
 * - Row 1: Block name header ("Columns-Promo")
 * - Row 2: 3 columns, each with linked image + bold title + description
 *
 * Source HTML Pattern:
 * <div class="multi-column__container">
 *   <div class="multi-column__content">
 *     <div class="multi-column__item">
 *       <div class="cmp-image"><a><img></a></div>
 *       <div class="richtext"><h3>Title</h3><p>Description</p></div>
 *     </div>
 *     ...repeat for each column
 *   </div>
 * </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // Extract columns from multi-column container
  // VALIDATED: Source HTML has .multi-column__item elements as direct column wrappers
  const columnItems = element.querySelectorAll('.multi-column__item') ||
                      element.querySelectorAll(':scope > div > div');

  const columnCells = [];

  columnItems.forEach((item) => {
    const cell = document.createElement('div');

    // Extract linked image
    // VALIDATED: Source has <a class="gtm-adaptive-image"><div><img></div></a>
    const imageLink = item.querySelector('a.gtm-adaptive-image') ||
                      item.querySelector('.cmp-image a') ||
                      item.querySelector('a');
    const img = item.querySelector('img');

    if (imageLink && img) {
      const link = document.createElement('a');
      link.href = imageLink.href;
      link.appendChild(img.cloneNode(true));
      cell.appendChild(link);
    } else if (img) {
      cell.appendChild(img.cloneNode(true));
    }

    // Extract title (bold heading)
    // VALIDATED: Source has <h3> or <b> elements with title text inside richtext
    const title = item.querySelector('h3, h2, h4') ||
                  item.querySelector('.richtext b') ||
                  item.querySelector('b');
    if (title) {
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(strong);
      cell.appendChild(p);
    }

    // Extract description paragraph
    // VALIDATED: Source has <p> elements inside richtext containers
    const descriptions = item.querySelectorAll('.richtext p, p');
    descriptions.forEach((desc) => {
      if (desc.textContent.trim() && desc !== title?.closest('p')) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        cell.appendChild(p);
      }
    });

    columnCells.push(cell);
  });

  const cells = [columnCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Promo', cells });
  element.replaceWith(block);
}
