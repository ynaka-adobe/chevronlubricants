/**
 * Accordion-FAQ: text FAQ list (native <details>/<summary>) with +/- icons and an
 * "Expand" / "Collapse" toggle for all items.
 *
 * Authoring: 1 row per FAQ: [question (plain text) | answer rich text]
 * Options (block classes):
 *   load-more: only the first 3 items show; a "Load more questions" button reveals
 *              the rest and then toggles to "Hide items" (source behaviour);
 *              the toggle reads "Expand all" / "Collapse all".
 *   grey:      light-grey column, cobalt icons (Techron FAQs)
 *   blue:      dark-blue questions, toggle and icons; "Expand all" label (industrial FAQs)
 */

const VISIBLE_COUNT = 3;
let instance = 0;

export default function decorate(block) {
  instance += 1;
  const id = `accordion-faq-${instance}`;
  const loadMore = block.classList.contains('load-more');
  /* source labels: "Expand all" on the load-more (ISOCLEAN) and blue (industrial) FAQs */
  const labels = loadMore || block.classList.contains('blue')
    ? { expand: 'Expand all', collapse: 'Collapse all' }
    : { expand: 'Expand', collapse: 'Collapse' };

  const list = document.createElement('div');
  list.className = 'accordion-faq-list';
  list.id = `${id}-list`;

  const rows = [...block.children].filter((row) => row.firstElementChild?.textContent.trim());
  const items = rows.map((row, i) => {
    const [question, answer] = [...row.children];
    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-question';
    const label = document.createElement('span');
    label.className = 'accordion-faq-question-text';
    /* question is plain text: unwrap a single paragraph */
    const only = question?.children.length === 1 && question.firstElementChild.tagName === 'P'
      ? question.firstElementChild : question;
    label.append(...(only ? [...only.childNodes] : []));
    const icon = document.createElement('span');
    icon.className = 'accordion-faq-icon';
    icon.setAttribute('aria-hidden', 'true');
    summary.append(label, icon);
    details.append(summary);
    if (answer) {
      answer.className = 'accordion-faq-answer';
      details.append(answer);
    }
    if (loadMore && i >= VISIBLE_COUNT) details.hidden = true;
    list.append(details);
    return details;
  });

  const controls = document.createElement('div');
  controls.className = 'accordion-faq-controls';
  const toggleAll = document.createElement('button');
  toggleAll.type = 'button';
  toggleAll.className = 'accordion-faq-toggle-all';
  toggleAll.setAttribute('aria-controls', list.id);
  controls.append(toggleAll);

  let allOpen = false;
  const syncToggle = () => {
    const visible = items.filter((item) => !item.hidden);
    allOpen = visible.length > 0 && visible.every((item) => item.open);
    toggleAll.textContent = allOpen ? labels.collapse : labels.expand;
  };
  toggleAll.addEventListener('click', () => {
    const open = !allOpen;
    /* source opens/closes every item, including those behind "Load more" */
    items.forEach((item) => { item.open = open; });
    syncToggle();
  });
  list.addEventListener('toggle', syncToggle, true);

  block.textContent = '';
  block.append(controls, list);

  if (loadMore && items.length > VISIBLE_COUNT) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'accordion-faq-load-more';
    more.textContent = 'Load more questions';
    more.setAttribute('aria-controls', list.id);
    more.addEventListener('click', () => {
      const extra = items.slice(VISIBLE_COUNT);
      const reveal = extra[0].hidden;
      extra.forEach((item) => { item.hidden = !reveal; });
      more.textContent = reveal ? 'Hide items' : 'Load more questions';
      syncToggle();
      if (reveal) extra[0].querySelector('summary').focus();
      /* hiding shrinks the list: keep the (still focused) button on screen */
      else more.scrollIntoView({ block: 'nearest' });
    });
    const wrap = document.createElement('div');
    wrap.className = 'accordion-faq-more';
    wrap.append(more);
    block.append(wrap);
  }

  syncToggle();
}
