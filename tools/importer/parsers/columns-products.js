/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-products block
 *
 * Source: https://www.chevronlubricants.com
 * Base Block: columns
 *
 * Block Structure:
 * - Row 1: Block name header ("Columns-Products")
 * - Row 2: 2 columns - left (promo image + text + CTA), right (product details)
 *
 * Source HTML Pattern:
 * <div class="featured-products">
 *   <div class="product-category">
 *     <img src="promo.png"> <!-- promo image -->
 *     <div class="product-categories">
 *       <div class="product-block">
 *         <div class="product-tile">
 *           <img src="product.png">
 *           <div class="product-content">
 *             <a href="/product">Product Name</a>
 *             <ul><li>Benefit 1</li>...</ul>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // Left column: promotional image with text overlay and CTA
  const leftCell = document.createElement('div');

  // VALIDATED: Source has a large promo image at the start of featured-products section
  const promoImg = element.querySelector('.product-category > img') ||
                   element.querySelector('img:first-of-type');
  if (promoImg) {
    leftCell.appendChild(promoImg.cloneNode(true));
  }

  // Extract promo text
  // VALIDATED: Source has overlay text "It all starts with the right oil"
  const promoText = element.querySelector('.product-category h2, .product-category h3') ||
                    element.querySelector('h2, h3');
  if (promoText) {
    const strong = document.createElement('strong');
    strong.textContent = promoText.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(strong);
    leftCell.appendChild(p);
  }

  // Extract CTA link
  // VALIDATED: Source has "SEE DELO MOTOR OILS" link
  const ctaLink = element.querySelector('.product-category > a') ||
                  element.querySelector('a.cta');
  if (ctaLink) {
    const a = document.createElement('a');
    a.href = ctaLink.href;
    a.textContent = ctaLink.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(a);
    leftCell.appendChild(p);
  }

  // Right column: first product tile details
  const rightCell = document.createElement('div');

  // VALIDATED: Source has .product-tile elements with product image, name, link, benefits
  const productTile = element.querySelector('.product-tile');
  if (productTile) {
    const productImg = productTile.querySelector('img');
    if (productImg) {
      rightCell.appendChild(productImg.cloneNode(true));
    }

    const productName = productTile.querySelector('.product-content a, .product-content h4');
    if (productName) {
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = productName.href || '#';
      a.textContent = productName.textContent.trim();
      strong.appendChild(a);
      const p = document.createElement('p');
      p.appendChild(strong);
      rightCell.appendChild(p);
    }

    // Extract Learn More link
    const learnMore = productTile.querySelector('a[class*="learn"], a:last-of-type');
    if (learnMore && learnMore !== productName) {
      const a = document.createElement('a');
      a.href = learnMore.href;
      a.textContent = learnMore.textContent.trim() || 'Learn More';
      const p = document.createElement('p');
      p.appendChild(a);
      rightCell.appendChild(p);
    }

    // Extract benefit list
    // VALIDATED: Source has <ul> with benefit items inside product-content
    const benefitList = productTile.querySelector('ul');
    if (benefitList) {
      rightCell.appendChild(benefitList.cloneNode(true));
    }
  }

  const cells = [[leftCell, rightCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Products', cells });
  element.replaceWith(block);
}
