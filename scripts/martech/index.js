import { initConsent } from './consent.js';
import instrument from './instrument.js';
import initBooklet from './booklet.js';

export default function initMartech() {
  initConsent();
  instrument();
  initBooklet();
}
