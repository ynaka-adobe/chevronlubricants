import { getConfig, loadArea, setConfig } from './ak.js';

const hostnames = ['authorkit.dev', 'localhost'];

const locales = {
  '': { lang: 'en' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { persona: '/schedules/main-persona' },
  { persona: '/schedules/landing-fragment' },
  /* Must be before generic schedule: persona-aware schedules (sheet + ?persona=) */
  { persona: '/schedules/products' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'persona', 'schedule'];

// Published images carry no width/height, so an image has no height until it loads and the
// copy below it jumps down when it appears (ISOCLEAN pages: logo, banner, infographic; Havoline
// business: logo, banner, columns-media photo). Load the first section's leading images right
// away and keep the page hidden until they have loaded, for at most 3s.
const holdForLeadImages = () => {
  const imgs = [...document.querySelectorAll('main > div:first-child img:not([height])')].slice(0, 4);
  if (!imgs.length) return;
  imgs.forEach((img) => img.removeAttribute('loading'));
  document.body.dataset.leadImages = 'loading';
  const loaded = imgs.map((img) => (img.complete ? null : new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  })));
  const timeout = new Promise((resolve) => { setTimeout(resolve, 3000); });
  Promise.race([Promise.all(loaded), timeout]).then(() => delete document.body.dataset.leadImages);
};

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
  if (area === document) holdForLeadImages();
};

// Skip link so keyboard users can bypass the header navigation
const addSkipLink = () => {
  const main = document.querySelector('main');
  if (!main || document.querySelector('.skip-link')) return;
  if (!main.id) main.id = 'main';
  main.tabIndex = -1;
  const link = document.createElement('a');
  link.className = 'skip-link';
  link.href = `#${main.id}`;
  link.textContent = 'Skip to main content';
  document.body.prepend(link);
};

// Mark links to the current page (e.g. category links bars) with aria-current="page".
// Local preview serves pages under /content, which is ignored for the comparison.
const markCurrentLinks = () => {
  const norm = (p) => p.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '').replace(/\/$/, '');
  const here = norm(window.location.pathname);
  document.querySelectorAll('main li > a[href]').forEach((a) => {
    const url = new URL(a.href, window.location.href);
    if (url.origin === window.location.origin && norm(url.pathname) === here) a.setAttribute('aria-current', 'page');
  });
};

// Accessibility for imported default content (authored as-is from the source pages):
// - an image-only link without alt text that repeats the neighbouring text link (same href)
//   is a redundant, unnamed tab stop: hide it from assistive tech and the tab order
// - a link inside running text is marked .link-inline so it can be underlined
//   (link colour alone does not distinguish it from the navy copy)
const decorateDefaultContentLinks = () => {
  document.querySelectorAll('main .default-content a[href]').forEach((a) => {
    const p = a.parentElement;
    const imgs = [...a.querySelectorAll('img')];
    if (imgs.length && !a.textContent.trim() && !imgs.some((img) => img.alt.trim())) {
      const next = p.nextElementSibling;
      const near = [p.previousElementSibling, next, next?.nextElementSibling];
      const twin = near.some((el) => [...(el?.querySelectorAll('a[href]') || [])]
        .some((link) => link !== a && link.href === a.href && link.textContent.trim()));
      if (twin) {
        a.setAttribute('aria-hidden', 'true');
        a.tabIndex = -1;
      }
      return;
    }
    const outside = [...p.childNodes].some((node) => node !== a && node.textContent.trim());
    if (p.tagName === 'P' && outside && !a.classList.contains('btn')) a.classList.add('link-inline');
  });
};

export async function loadPage() {
  addSkipLink();
  markCurrentLinks();
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  if (document.querySelector('meta[name="sku"]')) {
    try {
      const { default: decorateCommerceProduct } = await import('./commerce-product.js');
      await decorateCommerceProduct(document.querySelector('main'));
    } catch (error) {
      getConfig().log(error, document.querySelector('main'));
    }
  }
  await loadArea();
  decorateDefaultContentLinks();
}
await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
}());
