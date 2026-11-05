const initialized = new WeakSet();
let client;

function launch() {
  // Adobe's client opens the panel on load and handles subsequent Sidekick clicks itself.
  if (client) return;
  client = document.createElement('script');
  client.src = 'https://experience.adobe.com/solutions/aem-sites-genai-aem-genai-variations-mfe/static-assets/resources/sidekick/client.js?source=plugin';
  client.onerror = () => {
    client.remove();
    client = undefined;
    // eslint-disable-next-line no-console
    console.error('Unable to load Adobe Generate with AI. Check your connection and click the Sidekick button to retry.');
  };
  document.head.append(client);
}

export default function init(sk) {
  if (initialized.has(sk)) return;
  initialized.add(sk);
  sk.addEventListener('custom:aem-genai-variations-sidekick', launch);
}
