// Adapted from DuPont target-offer, Apache-2.0: structural slot only;
// the existing consent-gated visitor Target runtime is not changed.
export default function decorate(block) {
  const rows = [...block.children];
  const name = rows.length > 1 && rows[0].children.length === 1
    ? rows[0].textContent.trim() : '';
  if (name) {
    block.dataset.mboxName = name;
    rows[0].remove();
  }
  const slot = document.createElement('div');
  slot.className = 'target-offer-slot';
  while (block.firstChild) slot.append(block.firstChild);
  block.append(slot);
}
