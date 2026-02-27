/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-industry block
 *
 * Source: https://www.chevronlubricants.com
 * Base Block: cards
 *
 * Block Structure:
 * - Row 1: Block name header ("Cards-Industry")
 * - Row 2-N: Each row has image cell + text cell (industry name link)
 *
 * Source HTML Pattern:
 * <div class="multi-column__content">
 *   <div class="multi-column__item">
 *     <a href="/industry-page"><img src="industry-image.png" alt="Industry Name"></a>
 *     <div class="richtext"><p>Industry Name</p></div>
 *   </div>
 *   ...repeat for each industry card
 * </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract industry card items
  // VALIDATED: Source HTML has .multi-column__item elements with image links and text
  const items = element.querySelectorAll('.multi-column__item') ||
                element.querySelectorAll(':scope > div');

  items.forEach((item) => {
    // Extract image
    // VALIDATED: Source has <img> inside <a> elements with industry images
    const img = item.querySelector('img');
    const imageCell = document.createElement('div');
    if (img) {
      imageCell.appendChild(img.cloneNode(true));
    }

    // Extract industry name and link
    // VALIDATED: Source has <a> with href to industry page and text/title
    const textCell = document.createElement('div');
    const link = item.querySelector('a[href]') ||
                 item.querySelector('.richtext a');
    const titleText = item.querySelector('h3, h4, .richtext p, p');

    if (link && titleText) {
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = titleText.textContent.trim();
      strong.appendChild(a);
      textCell.appendChild(strong);
    } else if (titleText) {
      const strong = document.createElement('strong');
      strong.textContent = titleText.textContent.trim();
      textCell.appendChild(strong);
    }

    if (imageCell.childNodes.length || textCell.childNodes.length) {
      cells.push([imageCell, textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Industry', cells });
  element.replaceWith(block);
}
