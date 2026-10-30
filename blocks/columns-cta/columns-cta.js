/**
 * Columns-Cta: a single row of pill CTA buttons (one link per cell).
 * Authored as a columns block: 1 row, N cells, each cell holds one link.
 * - A cell with no link renders as plain text (text + button bands).
 * - An image in a link cell (social rows) renders as an icon before the link text.
 * Block markers: columns-cta-has-text (a text cell), columns-cta-has-icon (an icon link).
 * Options (block classes):
 *   links: render the links as underlined inline text links instead of pills
 *   red: red (#b5121b) square buttons with white labels (Havoline jump links)
 *   icons: icon-only links (social rows); the label is kept visually hidden
 *          as the link's accessible name
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
    const icons = [...cell.querySelectorAll('picture, img')]
      .filter((pic) => !pic.closest('a') && !(pic.tagName === 'IMG' && pic.closest('picture')));
    if (!links.length && !cell.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'columns-cta-item';
    if (links.length) {
      links.forEach((a, i) => {
        a.classList.add('columns-cta-button');
        /* social rows: icon image before the link text */
        const icon = icons[i];
        if (icon) {
          icon.classList.add('columns-cta-icon');
          a.classList.add('columns-cta-has-icon');
          block.classList.add('columns-cta-has-icon');
          a.prepend(icon);
        }
        a.querySelectorAll('picture, img').forEach((pic) => {
          if (!(pic.tagName === 'IMG' && pic.closest('picture'))) pic.classList.add('columns-cta-icon');
          a.classList.add('columns-cta-has-icon');
          block.classList.add('columns-cta-has-icon');
          if (a.textContent.trim()) pic.querySelectorAll?.('img').forEach((img) => { img.alt = ''; });
        });
        /* icons option: the label stays the link's accessible name, visually hidden */
        if (block.classList.contains('icons')) {
          const label = document.createElement('span');
          label.className = 'columns-cta-label';
          [...a.childNodes]
            .filter((n) => !(n.nodeType === Node.ELEMENT_NODE && n.matches('picture, img')))
            .forEach((n) => label.append(n));
          if (label.textContent.trim()) {
            label.textContent = label.textContent.trim();
            a.append(label);
          }
        }
        li.append(a);
      });
    } else {
      li.classList.add('columns-cta-text');
      block.classList.add('columns-cta-has-text');
      while (cell.firstChild) li.append(cell.firstChild);
    }
    list.append(li);
  });

  block.textContent = '';
  block.append(list);
}
