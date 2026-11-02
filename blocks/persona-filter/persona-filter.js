import {
  PERSONAS, getB2bPersona, initPersona, setActivePersona,
} from '../../scripts/persona.js';

let count = 0;

export default async function decorate(block) {
  const { href } = new URL('./persona-filter.css', import.meta.url);
  if (!document.querySelector(`link[href="${href}"]`)) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = href;
    document.head.append(style);
  }
  count += 1;
  const label = document.createElement('label');
  label.htmlFor = `persona-filter-${count}`;
  label.textContent = 'Filter by persona';
  const select = document.createElement('select');
  select.id = label.htmlFor;
  ['', ...PERSONAS].forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value || 'All';
    select.append(option);
  });
  select.disabled = true;
  block.replaceChildren(label, select);
  await initPersona();
  const reflect = () => { select.value = getB2bPersona() || ''; };
  reflect();
  select.disabled = false;
  select.addEventListener('change', () => setActivePersona(select.value || null, { updateURL: true }));
  document.addEventListener('persona:change', reflect);
  document.dispatchEvent(new Event('persona:selector-ready'));
}
