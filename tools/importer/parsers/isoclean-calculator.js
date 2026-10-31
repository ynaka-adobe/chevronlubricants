/* eslint-disable */
/* global WebImporter */

/**
 * Parser for isoclean-calculator (functional rebuild of the source ISOCLEAN® Cleanliness Calculator).
 * Template: expertise-services (services/self-services/industrial-machinery/isoclean-calculator).
 *
 * Block table (blocks/isoclean-calculator/README.md): N rows x [key | value].
 *
 * Source DOM (step 1 of a server-rendered, multi-page calculator):
 *   .isoclean-calculator .tab_content1_in.tab1 li.cf a[onclick] > img[src][alt] + text (industry)
 * The equipment/component/target data and the storage scenarios come from later steps, so they
 * were crawled into a data sheet (migration-work/isoclean-calculator/isoclean-calculator-data.json,
 * copied to DATA) and are not parsed here. The result-page texts below are those of the source
 * result step (migration-work/isoclean-calculator/result-0.html).
 */
const ORIGIN = 'https://www.chevronlubricants.com';
const DATA = '/en-us/home/services/self-services/industrial-machinery/isoclean-calculator-data.json';
const INTRO = 'The ISO Cleanliness Code below has been estimated for your equipment. This is an estimate based on general equipment. We recommend you follow your Equipment Manufacturer’s recommendations.';
const NOTE = '* Estimate based on general tolerances of equipment component selected. Recommend following Equipment Manufacturer’s specifications.';
const MORE_INFO = { href: `${ORIGIN}/en_us/home/contact-us.html`, text: 'Request more information' };
const CREDIT = {
  href: 'https://www.noria.com',
  logo: `${ORIGIN}/content/dam/external/isoclean/common/marketing-support/logos/noria.png`,
  text: 'Calculator data provided and powered by Noria. Copyright © 2017 Noria Corporation.',
};

function abs(url) {
  try { return new URL(url, ORIGIN).href; } catch (e) { return url; }
}

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function link(document, href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  return a;
}

function para(document, ...nodes) {
  const p = document.createElement('p');
  nodes.forEach((n) => p.append(n));
  return p;
}

export default function parse(element, { document }) {
  const cells = [['Data', link(document, DATA, DATA)]];

  element.querySelectorAll('.tab1 li.cf').forEach((li) => {
    const label = clean(li.textContent);
    const src = li.querySelector('img');
    if (!label || !src) return;
    const img = document.createElement('img');
    img.src = abs(src.getAttribute('src'));
    img.alt = '';
    cells.push([label, img]);
  });

  cells.push(['Intro', INTRO]);
  cells.push(['Note', NOTE]);
  cells.push(['More information', link(document, MORE_INFO.href, MORE_INFO.text)]);
  const logo = document.createElement('img');
  logo.src = CREDIT.logo;
  logo.alt = 'Noria';
  const logoLink = document.createElement('a');
  logoLink.href = CREDIT.href;
  logoLink.append(logo);
  const credit = document.createElement('div');
  credit.append(para(document, logoLink), para(document, CREDIT.text));
  cells.push(['Credit', credit]);

  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'isoclean-calculator', cells }));
}
