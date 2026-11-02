import { expect } from '@esm-bundle/chai';
import normalizePagePath from '../../scripts/utils/page-path.js';

describe('Chevron html page aliases', () => {
  it('normalizes only a single page suffix in the approved locale hierarchy', () => {
    [
      '/en-us/home',
      '/en-us/b2b-landing',
      '/en-us/home/products/delo-syn-trans-xe',
      '/en-us/home/products/by-brand/delo',
      '/content/en-us/home',
      '/en-us/Example_Page',
    ].forEach((path) => {
      expect(normalizePagePath(`${path}.html`)).to.equal(path);
      expect(normalizePagePath(path)).to.equal(path);
    });
  });

  it('leaves compound suffixes, assets, other locales and non-path inputs alone', () => {
    [
      '/en-us/home.html.html', '/en-us/home.plain.html', '/en-us/home.pdf.html',
      '/en-us/home.HTML', '/en-us/home.html/', '/en-us/home.html/nested',
      '/en-us/home.pdf', '/en-us/home.json', '/en-us/media_abc.png',
      '/en-us/home.html?p=2#benefits', '/de/home.html', '/head.html', '/404.html',
      '/scripts/home.html', '/tools/home.html', '//example.com/en-us/home.html',
      '/en-us/scripts/home.html', '/en-us/home/head.html', '/en-us/404.html',
      '/en-us/tools/preview.html', '/content/en-us/styles/demo.html',
      'https://example.com/en-us/home.html',
    ].forEach((path) => expect(normalizePagePath(path)).to.equal(path));
  });
});
