export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cols = [...row.children];
  block.classList.add(`columns-promo-${cols.length}-cols`);

  cols.forEach((col) => {
    const pic = col.querySelector('picture');
    const img = col.querySelector('img');
    const imgLink = col.querySelector('a[href] img');
    let imgContainer = null;
    if (pic) {
      const picWrapper = pic.closest('div');
      if (picWrapper) {
        picWrapper.classList.add('columns-promo-img-col');
        imgContainer = picWrapper;
      } else {
        pic.classList.add('columns-promo-img-col');
        imgContainer = pic;
      }
    } else if (imgLink && !imgLink.closest('.columns-promo-img-col')) {
      const link = imgLink.closest('a');
      if (link) {
        link.classList.add('columns-promo-img-col');
        imgContainer = link;
      }
    } else if (img) {
      const wrapper = img.parentElement;
      if (wrapper && !wrapper.classList.contains('columns-promo-img-col')) {
        wrapper.classList.add('columns-promo-img-col');
        imgContainer = wrapper;
      }
    }
    /* Ensure image is first child - cols 2, 3 may have title first which pushes image down */
    if (imgContainer && imgContainer.parentElement === col && imgContainer !== col.firstElementChild) {
      col.insertBefore(imgContainer, col.firstElementChild);
    }
  });
}
