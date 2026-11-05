import ENV from './utils/env.js';

async function loadSidekick() {
  const getSk = () => document.querySelector('aem-sidekick');

  const sk = getSk() || await new Promise((resolve) => {
    document.addEventListener('sidekick-ready', () => resolve(getSk()));
  });
  if (sk) import('../tools/sidekick/sidekick.js').then((mod) => mod.default(sk));
}

function loadAuthorApps() {
  const init = () => {
    const sidekicks = [...document.querySelectorAll('aem-sidekick, helix-sidekick')];
    if (!sidekicks.length) return;
    [
      '../tools/sidekick/aem-genai-variations.js',
      '../tools/persona/bridge.js',
    ].forEach((path) => {
      import(path)
        .then((mod) => sidekicks.forEach(mod.default))
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(`Unable to initialize Sidekick app ${path}.`, error);
        });
    });
  };
  init();
  document.addEventListener('sidekick-ready', init);
}

(function loadLazy() {
  import('./utils/lazyhash.js');
  import('./utils/favicon.js');
  import('./utils/footer.js').then(({ default: footer }) => footer());
  import('./martech/index.js').then(({ default: initMartech }) => initMartech());
  loadAuthorApps();

  // Author facing tools
  if (ENV !== 'prod') {
    import('../tools/scheduler/scheduler.js');
    loadSidekick();
  }
}());
