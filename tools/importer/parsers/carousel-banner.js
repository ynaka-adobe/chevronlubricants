/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-banner (base: carousel)
 * Template: expertise-marketing (isoclean, vartech-isc)
 *
 * Block table (blocks/carousel-banner/README.md + library carousel convention):
 * 1 row per slide, 2 cells
 *   cell 1: linked banner image (+ optional second image = mobile crop), nothing else
 *   cell 2: optional text (empty for the image-only source banners)
 *
 * Source DOM (validated against migration-work/block-context/carousel-banner/source.html
 * + instances/*.html, live rendered DOM):
 *   .image-carousel .image-slider
 *     slick:     .slick-slide[:not(.slick-cloned)] > div > (a[href] > .item | .item)
 *     pre-slick: .image-slider > (a[href] > .item | .item)
 *   .item .item__image > img.mobile-only-hidden (desktop) + img.tablet-up-hidden (mobile)
 *     [+ .play-button[data-video-src] (YouTube embed) -> image linked to the watch URL]
 * Slick clones are skipped. YouTube links get #_dnb so ak.js keeps them as links.
 */
const ORIGIN = 'https://www.chevronlubricants.com';

function absUrl(url) {
  if (!url) return '';
  try {
    return new URL(url.trim(), ORIGIN).href;
  } catch (e) {
    return url;
  }
}

function clean(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function imgSrc(img) {
  if (!img) return '';
  const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
  return src.startsWith('data:') ? '' : src;
}

function makeImg(document, srcImg) {
  const src = imgSrc(srcImg);
  if (!src) return null;
  const img = document.createElement('img');
  img.src = absUrl(src);
  img.alt = clean(srcImg.getAttribute('alt'));
  return img;
}

function youTubeWatch(src) {
  if (!src) return '';
  const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/)
    || src.match(/[?&]v=([\w-]+)/);
  return m ? `https://www.youtube.com/watch?v=${m[1]}#_dnb` : absUrl(src);
}

function slideHref(slide) {
  const video = slide.querySelector('[data-video-src]');
  if (video) return youTubeWatch(video.getAttribute('data-video-src'));
  const a = slide.matches('a[href]') ? slide : slide.querySelector('a[href]');
  if (!a) return '';
  const href = absUrl(a.getAttribute('href'));
  const target = (a.getAttribute('target') || '').toLowerCase();
  return target === '_blank' && href && !href.includes('#') ? `${href}#_blank` : href;
}

function getSlides(element) {
  const slick = [...element.querySelectorAll('.slick-slide')].filter((s) => !s.classList.contains('slick-cloned'));
  if (slick.length) return slick;
  const slider = element.querySelector('.image-slider');
  const items = slider ? [...slider.children].filter((c) => c.querySelector('img')) : [];
  return items.length ? items : [...element.querySelectorAll('.item')];
}

export default function parse(element, { document }) {
  const cells = [];

  getSlides(element).forEach((slide) => {
    const desktop = slide.querySelector('img.mobile-only-hidden') || slide.querySelector('img');
    const mobile = slide.querySelector('img.tablet-up-hidden');
    const media = [];
    const main = makeImg(document, desktop);
    if (main) media.push(main);
    if (mobile && mobile !== desktop && imgSrc(mobile) && imgSrc(mobile) !== imgSrc(desktop)) {
      const m = makeImg(document, mobile);
      if (m) media.push(m);
    }
    if (!media.length) return;

    const imageCell = [];
    const href = slideHref(slide);
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      media.forEach((img) => a.append(img));
      imageCell.push(a);
    } else {
      imageCell.push(...media);
    }

    // text cell: any caption text on the slide (the source banners are image-only)
    const textCell = [];
    const caption = slide.querySelector('.item__text, .item__caption, .item__content');
    if (caption && clean(caption.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(caption.textContent);
      textCell.push(p);
    }
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-banner', cells });
  element.replaceWith(block);
}
