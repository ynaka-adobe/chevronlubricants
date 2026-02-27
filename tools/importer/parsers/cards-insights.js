/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-insights block
 *
 * Source: https://www.chevronlubricants.com
 * Base Block: cards
 *
 * Block Structure:
 * - Row 1: Block name header ("Cards-Insights")
 * - Row 2-N: Each row has image cell + text cell (title link + description)
 *
 * Source HTML Pattern:
 * <div class="content-component">
 *   <div class="content-list">
 *     <div class="content-block">
 *       <a href="/article-page">
 *         <img src="article-image.jpg">
 *         <h4>Article Title</h4>
 *         <p>Article description</p>
 *       </a>
 *     </div>
 *     ...repeat for each article
 *   </div>
 * </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract article card items
  // VALIDATED: Source HTML has .content-block or .content-nex-button elements for articles
  const articles = element.querySelectorAll('.content-block, .content-nex-button') ||
                   element.querySelectorAll(':scope > div > div');

  articles.forEach((article) => {
    // Extract image
    // VALIDATED: Source has <img> inside article link wrappers
    const img = article.querySelector('img');
    const imageCell = document.createElement('div');
    if (img) {
      imageCell.appendChild(img.cloneNode(true));
    }

    // Extract article title and link
    // VALIDATED: Source has <a href="/article"> with <h4> title inside
    const textCell = document.createElement('div');
    const link = article.querySelector('a[href]');
    const title = article.querySelector('h4, h3, h2, .title');

    if (title && link) {
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = title.textContent.trim();
      strong.appendChild(a);
      const p = document.createElement('p');
      p.appendChild(strong);
      textCell.appendChild(p);
    } else if (title) {
      const strong = document.createElement('strong');
      strong.textContent = title.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(strong);
      textCell.appendChild(p);
    }

    // Extract description
    // VALIDATED: Source has <p> elements with article description text
    const desc = article.querySelector('p:not(:first-child)') ||
                 article.querySelector('.description');
    if (desc && desc.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      textCell.appendChild(p);
    }

    if (imageCell.childNodes.length || textCell.childNodes.length) {
      cells.push([imageCell, textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Insights', cells });
  element.replaceWith(block);
}
