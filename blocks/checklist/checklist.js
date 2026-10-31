/* Checklist: rows of 1-2 cells (title + list, image, button). Marks each cell by what it
   holds so the CSS can lay rows out side by side and style the list markers. */

function cellKind(cell) {
  if (cell.querySelector('ul, ol')) return 'list';
  const media = cell.querySelector('picture, img');
  const text = [...cell.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
    .filter((el) => !el.querySelector('picture, img') && el.textContent.trim());
  if (media && text.length <= 1) return 'media';
  return 'text';
}

export default function init(block) {
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    row.classList.add('checklist-row');
    const cells = [...row.children];
    row.classList.add(`checklist-row-${cells.length}`);
    cells.forEach((cell) => {
      cell.classList.add('checklist-cell', `checklist-${cellKind(cell)}`);
    });
    if (cells.length > 1 && cells.every((c) => c.classList.contains('checklist-media'))) {
      row.classList.add('checklist-cards');
    }
  });
}
