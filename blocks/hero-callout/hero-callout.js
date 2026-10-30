/**
 * Hero-Callout: inline, centred callout (not a top-of-page hero): a graphic or
 * wordmark image above a paragraph and a CTA button.
 *
 * Authoring: 2 rows
 *   row 1: graphic / wordmark image
 *   row 2: paragraph(s) + CTA link
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  rows.forEach((row) => {
    const cell = row.children.length === 1 ? row.firstElementChild : row;
    const isMedia = cell.querySelector('picture, img') && !cell.textContent.trim();
    row.className = isMedia ? 'hero-callout-media' : 'hero-callout-content';
    if (!isMedia) {
      [...cell.querySelectorAll('p')].forEach((p) => {
        if (p.querySelector('a') && p.textContent.trim() === [...p.querySelectorAll('a')].map((a) => a.textContent).join('').trim()) {
          p.classList.add('hero-callout-cta');
        }
      });
    }
  });
}
