export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cols = [...row.children];
  block.classList.add(`columns-promo-${cols.length}-cols`);

  cols.forEach((col) => {
    const pic = col.querySelector('picture');
    const imgLink = col.querySelector('a[href] img');
    if (pic) {
      const picWrapper = pic.closest('div');
      if (picWrapper && picWrapper.children.length === 1) {
        picWrapper.classList.add('columns-promo-img-col');
      }
    }
    if (imgLink && !imgLink.closest('.columns-promo-img-col')) {
      const link = imgLink.closest('a');
      if (link) link.classList.add('columns-promo-img-col');
    }
  });
}
