/**
 * Columns-Media: one photo beside a text panel (heading, copy, optional button).
 * Stacks on mobile. Cells render in authored order, so the photo may sit on
 * either side (source pages use both image-left and text-left layouts).
 *
 * Authoring: 1 row, 2 cells: [photo | heading + paragraph + button]
 * Variants: `card` (shadowed card, centred heading + button), `centered`
 * (centred heading + button, no shadow).
 */
export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
  row.classList.add('columns-media-row');

  const cells = [...row.children];
  const isMediaOnly = (cell) => cell.querySelector('picture, img')
    && !cell.textContent.trim();
  const media = cells.find(isMediaOnly);

  cells.forEach((cell) => {
    if (cell === media) {
      cell.className = 'columns-media-image';
      return;
    }
    cell.className = 'columns-media-body';
    /* drop empty spacer paragraphs (e.g. <p><b>&nbsp;</b></p>) */
    cell.querySelectorAll(':scope > p').forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('picture, img, a')) p.remove();
    });

    /* a single standalone link paragraph is the panel's button (source .btn);
     * several stacked link paragraphs stay text links */
    const linkOnly = [...cell.querySelectorAll(':scope > p')].filter((p) => {
      const link = p.querySelector('a');
      return link && !p.querySelector('picture, img')
        && link.textContent.trim() === p.textContent.trim();
    });
    if (linkOnly.length === 1) {
      const [p] = linkOnly;
      p.classList.add('columns-media-button');
      p.querySelector('a').classList.add('btn');
    }
  });
}
