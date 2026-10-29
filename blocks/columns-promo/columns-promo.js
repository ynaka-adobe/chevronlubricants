export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const contentRow = rows.find((r) => r.querySelector('picture, img'));
  const linkRow = rows.find((r) => r !== contentRow && r.querySelector('a[href]'));
  const row = contentRow || rows[0];
  if (!row) return;
  let cols = [...row.children];
  /* Handle nested structure: row may have 1 cell containing multiple columns */
  if (cols.length === 1 && cols[0].children.length > 1 && cols[0].querySelectorAll(':scope > div').length > 1) {
    cols = [...cols[0].children];
  }
  block.classList.add(`columns-promo-${cols.length}-cols`);

  cols.forEach((col) => {
    col.classList.add('columns-promo-card');

    const media = col.querySelector('picture, img');
    if (!media) return;
    /* The image container is the card's direct child holding the picture
     * (p > a > picture, h3 > a > picture, a > picture, or a bare picture). */
    let imgContainer = media;
    while (imgContainer.parentElement && imgContainer.parentElement !== col) {
      imgContainer = imgContainer.parentElement;
    }
    if (imgContainer.parentElement !== col) return;
    imgContainer.classList.add('columns-promo-image');
    /* Image always renders first, even if authored after the title */
    if (imgContainer !== col.firstElementChild) col.prepend(imgContainer);
  });

  if (linkRow) linkRow.classList.add('columns-promo-link-row-hidden');
}
