import { getB2bPersona, initPersona, resolveB2bPersona } from '../../scripts/persona.js';
import { reportError } from '../../scripts/martech/consent.js';

function variation(row) {
  const cell = row.children.length > 1 ? row.lastElementChild : null;
  const value = cell?.textContent.trim() || '';
  const hasMetadata = cell && (/^persona\s*:/i.test(value)
    || /^\d+(?:\s*,\s*\d+)*$/.test(value)
    || (!value && !cell.querySelector('img, picture, video, iframe')));
  const labels = hasMetadata ? value.replace(/^persona\s*:\s*/i, '').trim() : '';
  const roles = labels ? labels.split(',').map((label) => resolveB2bPersona(label.trim())) : [];
  if (roles.some((role) => !role)) {
    reportError('Invalid hero-banner persona ID; use 1, 2, 3 or 4', new Error(labels));
  }
  if (hasMetadata) cell.remove();
  row.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    if (!heading.textContent.trim() && !heading.querySelector('img, picture')) heading.remove();
  });
  row.classList.add('hero-banner-variation');
  row.hidden = true;
  const populated = Boolean(row.textContent.trim() || row.querySelector('img, picture, video, iframe'));
  return {
    row, roles: roles.filter(Boolean), tagged: Boolean(labels), populated,
  };
}

export default async function decorate(block) {
  if (!block.classList.contains('filterable')) return;
  const variations = [...block.children].map(variation).filter((item) => item.populated);
  await initPersona();
  const missing = new Set();
  const render = () => {
    const active = getB2bPersona();
    const fallback = variations.find((item) => !item.tagged);
    const selected = (active && variations.find((item) => item.roles.includes(active)))
      || fallback || (!active && variations[0]);
    variations.forEach(({ row }) => { row.hidden = row !== selected?.row; });
    block.hidden = !selected;
    if (active && !selected && !missing.has(active)) {
      missing.add(active);
      reportError('Hero banner has no populated matching variation or untagged default', new Error(active));
    }
  };
  const changed = () => {
    if (block.isConnected) render();
    else document.removeEventListener('persona:change', changed);
  };
  document.addEventListener('persona:change', changed);
  render();
}
