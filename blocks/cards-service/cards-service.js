/**
 * Cards-Service: service / benefit tiles, 1-4 per row.
 *
 * Authoring: 1 row per tile
 *   cell 1: icon image
 *   cell 2: title (h3, optionally linked) [+ description paragraph]
 *
 * Layout follows the source multi-column it was migrated from:
 *   - tiles with a description (delo self / pro services, gf7 benefits): icon left
 *     (25%), centred title + description right (75%)
 *   - title-only tiles (contact-us, industrial-products): image on top, centred
 *     title below -> `cards-service-stacked`
 */

/**
 * Keep the document outline valid (axe heading-order): tile titles are authored as h3,
 * but a block can follow an h1 directly (e.g. techron). Re-tag heading titles to one level
 * below the closest preceding heading in <main>. Titles are styled by .cards-service-title
 * (size, weight, spacing, margins), so the visual result does not change.
 */
function normalizeTitleLevels(block) {
  const titles = [...block.querySelectorAll('.cards-service-title')].filter((t) => /^H[1-6]$/.test(t.tagName));
  if (!titles.length) return;
  const main = block.closest('main') || document.body;
  /* document order: everything listed before the block itself precedes it */
  const ordered = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6, .cards-service')];
  const prev = ordered.slice(0, ordered.indexOf(block))
    .filter((el) => /^H[1-6]$/.test(el.tagName)).pop();
  const level = Math.min((prev ? Number(prev.tagName[1]) : 1) + 1, 6);
  titles.forEach((title) => {
    if (Number(title.tagName[1]) <= level) return;
    const heading = document.createElement(`h${level}`);
    [...title.attributes].forEach(({ name, value }) => heading.setAttribute(name, value));
    heading.append(...title.childNodes);
    title.replaceWith(heading);
  });
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'cards-service-list';
  let hasDescription = false;

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-service-card';
    [...row.children].forEach((cell) => {
      const isIcon = cell.querySelector('picture, img') && !cell.textContent.trim();
      if (isIcon && !li.querySelector('.cards-service-icon')) {
        cell.className = 'cards-service-icon';
        /* the icon is decorative next to the title */
        cell.querySelectorAll('img').forEach((img) => { if (!img.alt) img.alt = ''; });
      } else if (cell.textContent.trim()) {
        cell.className = 'cards-service-body';
        const title = cell.querySelector('h1, h2, h3, h4, h5, h6')
          || [...cell.children].find((el) => el.tagName === 'P' && el.querySelector('strong, b'));
        if (title) {
          title.classList.add('cards-service-title');
          title.classList.remove('btn-group');
          /* a bold title link is a text link here, not a global button */
          title.querySelectorAll('a').forEach((a) => a.classList.remove('btn', 'btn-primary'));
        }
        if ([...cell.children].some((el) => el !== title && el.textContent.trim())) {
          hasDescription = true;
        }
      } else {
        return;
      }
      li.append(cell);
    });
    if (li.children.length) list.append(li);
  });

  const count = list.children.length;
  block.classList.add(`cards-service-cols-${Math.min(count, 4)}`);
  if (!hasDescription) block.classList.add('cards-service-stacked');
  block.textContent = '';
  block.append(list);
  normalizeTitleLevels(block);
}
