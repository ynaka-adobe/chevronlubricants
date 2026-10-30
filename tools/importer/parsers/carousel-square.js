/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-square (base: carousel)
 * Template: expertise-marketing (delo-customer-success-stories, mining, techron)
 *
 * Block table (blocks/carousel-square/README.md + library carousel convention):
 * 1 row per slide, 2 cells
 *   cell 1: square image (linked), nothing else
 *   cell 2: linked title paragraph (company name / video title)
 *           + optional caption paragraph (person name, from data-description)
 *
 * Source DOM (validated against migration-work/block-context/carousel-square/source.html
 * + instances/*.html, live rendered DOM):
 *   .square-carousel
 *     .square-carousel__title            (optional heading text -> h2 before the block)
 *     .square-slider
 *       slick:     .slick-slide[:not(.slick-cloned)] > div > .item[data-description]
 *       pre-slick: .square-slider > .item
 *     .item .item__image > (a[href] >) img  [+ [data-video-src] YouTube embed]
 *           .item__text-block > a[href] (title; no href on video tiles)
 * Video tiles (techron): image + title link to the YouTube watch URL + #_dnb.
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

function makeImg(document, srcImg, fallbackAlt) {
  if (!srcImg) return null;
  const src = srcImg.getAttribute('data-src') || srcImg.getAttribute('src') || '';
  if (!src || src.startsWith('data:')) return null;
  const img = document.createElement('img');
  img.src = absUrl(src);
  img.alt = clean(srcImg.getAttribute('alt')) || fallbackAlt || '';
  return img;
}

function youTubeWatch(src) {
  if (!src) return '';
  const m = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/) || src.match(/youtu\.be\/([\w-]+)/)
    || src.match(/[?&]v=([\w-]+)/);
  return m ? `https://www.youtube.com/watch?v=${m[1]}#_dnb` : absUrl(src);
}

function htmlText(document, html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return clean(div.textContent);
}

function getItems(element) {
  const slick = [...element.querySelectorAll('.slick-slide')].filter((s) => !s.classList.contains('slick-cloned'));
  if (slick.length) return slick.map((s) => s.querySelector('.item') || s);
  return [...element.querySelectorAll('.item')].filter((i) => !i.closest('.slick-cloned'));
}

export default function parse(element, { document }) {
  const cells = [];

  getItems(element).forEach((item) => {
    const video = item.querySelector('[data-video-src]');
    const titleLink = item.querySelector('.item__text-block a') || item.querySelector('.item__text-block');
    const title = titleLink ? clean(titleLink.textContent) : '';
    const imageLink = item.querySelector('.item__image a[href]');
    let href = '';
    if (video) href = youTubeWatch(video.getAttribute('data-video-src'));
    else if (titleLink && titleLink.getAttribute('href')) href = absUrl(titleLink.getAttribute('href'));
    else if (imageLink) href = absUrl(imageLink.getAttribute('href'));

    const imageCell = [];
    const img = makeImg(document, item.querySelector('.item__image img') || item.querySelector('img'), title);
    if (img) {
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.append(img);
        imageCell.push(a);
      } else {
        imageCell.push(img);
      }
    }

    const textCell = [];
    if (title) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        p.append(a);
      } else {
        p.textContent = title;
      }
      textCell.push(p);
    }
    const caption = htmlText(document, item.getAttribute('data-description'));
    if (caption) {
      const p = document.createElement('p');
      p.textContent = caption;
      textCell.push(p);
    }

    if (imageCell.length || textCell.length) cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-square', cells });

  // carousel heading (mining: "Set up your plan to start with clean oil") -> default content
  const titleEl = element.querySelector('.square-carousel__title');
  const heading = titleEl ? clean(titleEl.textContent) : '';
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading;
    element.replaceWith(h2, block);
  } else {
    element.replaceWith(block);
  }
}
