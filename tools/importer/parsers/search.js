/* eslint-disable */
/* global WebImporter */

/**
 * Parser for search (site search results, blocks/search)
 * Source: https://www.chevronlubricants.com/en_us/home/search-results.html
 *
 * Source DOM: .search-results > .search-results__container (results are rendered
 * client-side from Chevron's search service; nothing to copy).
 * Block table (library convention): 1 column; one row = link to the query index to search
 * (/query-index.json, the helix-query.yaml "site" index).
 */
const INDEX = '/query-index.json';

export default function parse(element, { document }) {
  const a = document.createElement('a');
  a.href = INDEX;
  a.textContent = INDEX;
  const block = WebImporter.Blocks.createBlock(document, { name: 'search', cells: [[a]] });
  element.replaceWith(block);
}
