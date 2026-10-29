const ARROW_SVG = '<svg width="13" height="11" viewBox="0 0 13 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12.1735 4.97493L8.75164 0.825191C8.46578 0.504709 8.01525 0.478671 7.72082 0.721185C7.41765 0.963696 7.3743 1.45757 7.61681 1.75201L10.0511 4.706L1.07233 4.706C0.665149 4.706 0.335938 5.03521 0.335938 5.44239C0.335938 5.84957 0.665149 6.17878 1.07233 6.17878L10.0511 6.17878L7.61681 9.13277C7.3743 9.43594 7.42624 9.92108 7.72082 10.1723C8.01539 10.4321 8.50913 10.3629 8.75164 10.0683L12.1735 5.91049C12.3987 5.5986 12.3814 5.2781 12.1735 4.97493Z" fill="currentColor"/></svg>';

/**
 * Mouse drag-to-scroll for the horizontal track (touch/trackpad scroll natively).
 * A drag suppresses the click that follows so links are not followed accidentally.
 */
function enableDragScroll(track) {
  let startX = 0;
  let startScroll = 0;
  let pointerId = null;
  let moved = false;

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    moved = false;
  });

  track.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      track.setPointerCapture(pointerId);
      track.classList.add('is-dragging');
    }
    if (moved) track.scrollLeft = startScroll - dx;
  });

  const end = (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    track.classList.remove('is-dragging');
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);

  track.addEventListener('click', (e) => {
    if (!moved) return;
    e.preventDefault();
    e.stopPropagation();
    moved = false;
  }, true);

  track.addEventListener('dragstart', (e) => e.preventDefault());
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.setAttribute('role', 'list');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-insights-card-image';
      else div.className = 'cards-insights-card-body';
    });

    const body = li.querySelector('.cards-insights-card-body');
    const link = body?.querySelector('a');
    if (link) {
      /* title link is authored bold; undo the global button decoration */
      link.classList.remove('btn', 'btn-primary');
      link.closest('p')?.classList.add('cards-insights-card-title');
      link.closest('p')?.classList.remove('btn-group');

      const image = li.querySelector('.cards-insights-card-image picture');
      if (image) {
        const imageLink = document.createElement('a');
        imageLink.href = link.href;
        imageLink.tabIndex = -1;
        imageLink.setAttribute('aria-hidden', 'true');
        image.replaceWith(imageLink);
        imageLink.append(image);
      }

      const arrow = document.createElement('a');
      arrow.className = 'cards-insights-arrow';
      arrow.href = link.href;
      arrow.setAttribute('aria-label', `Read more: ${link.textContent.trim()}`);
      arrow.innerHTML = ARROW_SVG;
      li.append(arrow);
    }

    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
  enableDragScroll(ul);
}
