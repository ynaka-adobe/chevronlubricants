import { initPersona } from '../../scripts/persona.js';

export default async function decorate(block) {
  block.replaceChildren();
  block.remove();
  await initPersona();
}
