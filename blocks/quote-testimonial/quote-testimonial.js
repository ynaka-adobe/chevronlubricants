/**
 * Quote-Testimonial: centred customer testimonial.
 *
 * Authoring: up to 5 rows, one cell each
 *   [optional portrait image]
 *   [optional title]
 *   [quotation paragraph(s), not a heading]
 *   [attribution: name line, role / location line]
 *   [optional CTA link, e.g. a YouTube watch URL (append #_dnb to keep it a link)]
 * Rows are recognised by content: an image-only row is the portrait, a link-only
 * last row is the CTA; of the remaining text rows the last is the attribution, the
 * one before it the quotation and a first extra row (or any heading) the title.
 */

const cellOf = (row) => (row.children.length === 1 ? row.firstElementChild : row);

function isImageOnly(row) {
  return row.querySelector('picture, img, .video') && !row.textContent.trim();
}

function isLinkOnly(row) {
  const links = [...row.querySelectorAll('a[href]')];
  return links.length > 0
    && row.textContent.trim() === links.map((a) => a.textContent).join('').trim();
}

export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('picture, img, .video'));

  const portraitRow = rows.find(isImageOnly);
  let rest = rows.filter((row) => row !== portraitRow);
  const lastRow = rest[rest.length - 1];
  const ctaRow = rest.length > 1 && isLinkOnly(lastRow) ? lastRow : null;
  rest = rest.filter((row) => row !== ctaRow);

  let titleRow = rest.find((row) => row.querySelector('h1, h2, h3, h4, h5, h6'));
  let textRows = rest.filter((row) => row !== titleRow);
  if (!titleRow && textRows.length >= 3) [titleRow, ...textRows] = textRows;
  const attributionRow = textRows.length >= 2 ? textRows[textRows.length - 1] : null;
  const quoteRows = textRows.filter((row) => row !== attributionRow);

  const figure = document.createElement('figure');
  figure.className = 'quote-testimonial-figure';

  if (portraitRow) {
    const portrait = cellOf(portraitRow);
    portrait.className = 'quote-testimonial-portrait';
    figure.append(portrait);
  }
  if (titleRow) {
    const title = cellOf(titleRow);
    title.className = 'quote-testimonial-title';
    figure.append(title);
  }
  if (quoteRows.length) {
    const quote = document.createElement('blockquote');
    quote.className = 'quote-testimonial-quote';
    quoteRows.forEach((row) => quote.append(...cellOf(row).childNodes));
    figure.append(quote);
  }
  if (attributionRow) {
    const caption = document.createElement('figcaption');
    caption.className = 'quote-testimonial-attribution';
    const parts = [...cellOf(attributionRow).children];
    if (parts.length) {
      parts[0].classList.add('quote-testimonial-name');
      caption.append(...parts);
    } else {
      caption.textContent = attributionRow.textContent.trim();
    }
    figure.append(caption);
  }

  block.textContent = '';
  block.append(figure);

  if (ctaRow) {
    const cta = cellOf(ctaRow);
    cta.className = 'quote-testimonial-cta';
    block.append(cta);
  }
}
