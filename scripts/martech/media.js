import observe from '../utils/observer.js';
import { element, initConsent, onConsentChange, openConsent } from './consent.js';

export default function consentMedia(container, mount) {
  initConsent();
  observe(container, () => {
    let unsubscribe;
    const update = (consent) => {
      if (!container.isConnected) {
        unsubscribe?.();
        return;
      }
      if (consent.externalMedia) {
        if (!container.querySelector('iframe')) {
          container.replaceChildren();
          mount(container);
        }
      } else {
        const message = element('p', 'External content is off until you allow external videos and embedded tools.');
        const button = element('button', 'Cookie preferences');
        button.type = 'button';
        button.addEventListener('click', openConsent);
        container.replaceChildren(message, button);
      }
    };
    unsubscribe = onConsentChange(update);
  });
}
