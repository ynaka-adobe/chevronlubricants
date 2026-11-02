import { initConsent } from './consent.js';
import instrument from './instrument.js';
import initBooklet from './booklet.js';
import initTarget from '../target.js';

export default function initMartech() {
  initConsent();
  instrument();
  initTarget();
  initBooklet();
}
