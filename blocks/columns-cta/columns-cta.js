/**
 * Columns-Cta: a single row of pill CTA buttons (one link per cell).
 * Authored as a columns block: 1 row, N cells, each cell holds one link.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const cells = rows.flatMap((row) => [...row.children]);
  block.classList.add(`columns-cta-${cells.length}-cols`);

  const list = document.createElement('ul');
  list.className = 'columns-cta-list';

  cells.forEach((cell) => {
    const links = [...cell.querySelectorAll('a[href]')];
    if (!links.length && !cell.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'columns-cta-item';
    if (links.length) {
      links.forEach((a) => {
        a.classList.add('columns-cta-button');
        li.append(a);
      });
    } else {
      while (cell.firstChild) li.append(cell.firstChild);
    }
    list.append(li);
  });

  block.textContent = '';
  block.append(list);
}
