import { initConsent } from './consent.js';
import instrument from './instrument.js';
import initBooklet from './booklet.js';
import initTarget from '../target.js';
import { initPersona } from '../persona.js';

export default function initMartech() {
  initConsent();
  initPersona();
  instrument();
  initTarget();
  initBooklet();
}
