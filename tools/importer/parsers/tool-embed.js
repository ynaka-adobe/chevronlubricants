/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tool-embed (external tool shown in an iframe).
 * Template: expertise-services (product selectors, Delo calculators, SmartChoice, assessment).
 *
 * Block table (blocks/tool-embed/README.md): N rows x [key | value]: URL, Title, Width, Height.
 *
 * Source DOM:
 *   .iframe > div.htlUtilsIframeId-<n> > div > iframe[src][width][height]
 * The source iframes have no title; Title comes from TITLES (by tool address), else the page H1.
 * Google Analytics linker parameters (_ga) are dropped from the address.
 */
const TITLES = [
  [/ewp\.earlweb\.net/, 'Chevron products selector'],
  [/delosmartchoice\.com/, 'Delo SmartChoice Advisor'],
  [/delocalculator\.com\/benchmark/, 'Delo benchmark calculator'],
  [/delocalculator\.com\/freezepoint/, 'Antifreeze concentration calculator'],
  [/delocalculator\.com\/lubricationassessment/, 'On-site lubrication assessment'],
  [/delocalculator\.com\/?$/, 'Delo fuel economy calculator'],
];

function cleanUrl(src) {
  const url = new URL(src.startsWith('//') ? `https:${src}` : src);
  url.searchParams.delete('_ga');
  return url.href.replace(/\?$/, '');
}

function link(document, href) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  return a;
}

export default function parse(element, { document }) {
  const iframe = element.querySelector('iframe[src], iframe[data-src]');
  const src = iframe && (iframe.getAttribute('src') || iframe.getAttribute('data-src'));
  if (!src || !/^(https?:)?\/\//.test(src)) {
    element.remove();
    return;
  }
  const url = cleanUrl(src);
  const match = TITLES.find(([re]) => re.test(url));
  const h1 = document.querySelector('h1');
  const title = (match && match[1]) || (h1 && h1.textContent.trim()) || '';

  const cells = [['URL', link(document, url)]];
  if (title) cells.push(['Title', title]);
  const width = iframe.getAttribute('width');
  const height = iframe.getAttribute('height');
  if (width && /^\d+$/.test(width)) cells.push(['Width', width]);
  if (height && /^\d+$/.test(height)) cells.push(['Height', height]);

  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'tool-embed', cells }));
}
