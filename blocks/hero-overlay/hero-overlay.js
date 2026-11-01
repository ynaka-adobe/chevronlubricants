/**
 * Hero-Overlay: full-bleed banner photo with live text overlaid middle-left.
 * Below 900px the text sits under the photo so it stays readable.
 *
 * Authoring: 2 rows
 *   row 1: background photo
 *   row 2: text (paragraph; optional heading and CTA) or a single link
 *
 * The source overlays come in four shapes; the text row decides which one applies:
 *   - link only               -> hero-overlay-cta     (pill button, bottom-left)
 *   - short text, all bold    -> hero-overlay-label   (bold, centered, one line per bold run)
 *   - short text              -> hero-overlay-display (large tagline)
 *   - anything else           -> body copy (default)
 */
const DISPLAY_MAX_CHARS = 60;

function classify(cell) {
  const text = cell.textContent.replace(/\s+/g, ' ').trim();
  const links = [...cell.querySelectorAll('a')];
  const linkText = links.map((a) => a.textContent).join(' ').replace(/\s+/g, ' ').trim();
  if (links.length && linkText === text) return 'hero-overlay-cta';
  if (text.length > DISPLAY_MAX_CHARS || cell.querySelector('h1, h2, h3, h4, h5, h6, ul, ol')) return '';
  const strongText = [...cell.querySelectorAll('strong, b')]
    .map((s) => s.textContent).join(' ').replace(/\s+/g, ' ').trim();
  return strongText === text ? 'hero-overlay-label' : 'hero-overlay-display';
}

/* Several overlays (Delo "The Delo difference" heroes): rows [position | text] after the photo,
 * e.g. "Top center" (tab bar), "Bottom left" (heading), "Bottom right" ("SWITCH TO ..." link).
 * Each becomes .hero-overlay-area.hero-overlay-at-{vertical}-{horizontal}, placed like the
 * source on desktop and stacked in authored order under the photo on phones. */
const POSITION = /^(top|middle|bottom)\s+(left|center|right)$/i;

function decorateAreas(block, mediaRow, rows) {
  const areaRows = rows.filter((row) => {
    const cells = [...row.children];
    return cells.length === 2 && POSITION.test(cells[0].textContent.trim());
  });
  if (!areaRows.length) return false;
  const areas = document.createElement('div');
  areas.className = 'hero-overlay-content hero-overlay-areas';
  areaRows.forEach((row) => {
    const [posCell, textCell] = [...row.children];
    const [, v, h] = posCell.textContent.trim().toLowerCase().match(POSITION);
    textCell.className = `hero-overlay-area hero-overlay-at-${v}-${h}`;
    // short text without links (bold or not) is the large tagline ("REDUCED FUEL EFFICIENCY ...")
    const variant = classify(textCell);
    if (variant === 'hero-overlay-display' || variant === 'hero-overlay-label') textCell.classList.add('hero-overlay-area-display');
    areas.append(textCell);
  });
  block.classList.add('hero-overlay-multi');
  if (mediaRow) {
    mediaRow.className = 'hero-overlay-media';
    // the photo row of the [position | text] model has an empty second cell
    [...mediaRow.children].filter((c) => !c.querySelector('picture, img')).forEach((c) => c.remove());
    block.prepend(mediaRow);
  }
  rows.filter((row) => row !== mediaRow).forEach((row) => row.remove());
  block.append(areas);
  return true;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const isMedia = (row) => row.querySelector('picture, img') && !row.textContent.trim();
  const mediaRow = rows.find(isMedia);
  if (decorateAreas(block, mediaRow, rows)) return;
  const textRow = rows.find((row) => row !== mediaRow && row.textContent.trim());

  if (mediaRow) {
    mediaRow.className = 'hero-overlay-media';
    block.prepend(mediaRow);
  }
  if (textRow) {
    textRow.className = 'hero-overlay-content';
    const variant = classify(textRow);
    if (variant) block.classList.add(variant);
  } else {
    block.classList.add('hero-overlay-no-text');
  }
  rows.filter((row) => row !== mediaRow && row !== textRow).forEach((row) => row.remove());
}
