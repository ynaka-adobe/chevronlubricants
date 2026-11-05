// DuPont profile UI adapted to Chevron's existing per-tab persona bridge.
import renderProfile from './profiles.js';

const status = document.getElementById('persona-status');
const coarse = document.getElementById('b2b-persona');
const marketing = document.getElementById('marketing-persona');
const apply = document.getElementById('persona-apply');
const reset = document.getElementById('persona-reset');
const pending = new Map();
let sequence = 0;
let origin;
let state;

function message(text, error = false) {
  status.textContent = text;
  status.dataset.error = String(error);
}

function request(action, selection) {
  sequence += 1;
  const id = sequence;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error('Could not connect to the content page. Reload the page and reopen Persona in Sidekick, then Refresh.'));
    }, 8000);
    pending.set(id, { resolve, reject, timeout });
    window.parent.postMessage({ source: 'chevron-persona-app', id, action, selection }, origin);
  });
}

function option(value, label) {
  const element = document.createElement('option');
  element.value = value || '';
  element.textContent = label;
  return element;
}

function mapping() {
  const selected = state.marketingPersonas.find(({ slug }) => slug === marketing.value);
  let text = state.marketingPersonas.length
    ? 'Choose a marketing persona to use its author-defined B2B rollup.'
    : 'Marketing map unavailable or empty. B2B choices and the saved marketing preference remain available.';
  if (selected) {
    text = `Marketing rollup: ${selected.role || 'No B2B restriction'}. A manual B2B choice can override this rollup.`;
  }
  document.getElementById('persona-mapping').textContent = text;
}

function render(next) {
  state = next;
  coarse.replaceChildren(option('', 'No B2B restriction'), ...state.roles.map((role) => option(role, role)));
  marketing.replaceChildren(
    option('', 'No marketing persona'),
    ...state.marketingPersonas.map(({ slug }) => option(slug, slug)),
  );
  if (state.marketingPersona
    && !state.marketingPersonas.some(({ slug }) => slug === state.marketingPersona)) {
    marketing.append(option(state.marketingPersona, `${state.marketingPersona} (saved; not in current map)`));
  }
  coarse.value = state.b2bPersona || '';
  marketing.value = state.marketingPersona || '';
  coarse.disabled = false;
  marketing.disabled = false;
  apply.disabled = false;
  reset.disabled = false;
  document.getElementById('current-b2b').textContent = state.b2bPersona || 'No B2B restriction';
  document.getElementById('current-marketing').textContent = state.marketingPersona || 'None';
  document.getElementById('current-storage').textContent = state.saved ? 'Saved for this tab' : 'Page only (storage unavailable)';
  ['personalization', 'analytics'].forEach((key) => {
    document.getElementById(`current-${key}`).textContent = state.consent[key] ? 'On' : 'Off';
  });
  document.getElementById('persona-page').textContent = state.pageURL;
  mapping();
  renderProfile(coarse.value);
}

window.addEventListener('message', (event) => {
  if (event.source !== window.parent || event.origin !== origin
    || event.data?.source !== 'chevron-persona-page') return;
  const response = event.data;
  const task = pending.get(response.id);
  if (task) {
    clearTimeout(task.timeout);
    pending.delete(response.id);
    if (response.action === 'error') task.reject(new Error(response.message));
    else task.resolve(response.state);
  } else if (response.action === 'state') {
    render(response.state);
  }
});

async function run(action, selection) {
  apply.disabled = true;
  reset.disabled = true;
  message(action === 'apply' ? 'Applying persona selection...' : 'Connecting to the content page...');
  try {
    render(await request(action, selection));
    message(action === 'apply' ? 'Applied to the content page. Persona URL aliases were removed; this tab retains the selection.' : 'Connected to the content page.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Persona app action failed.', error);
    message(error.message, true);
    apply.disabled = !state;
    reset.disabled = !state;
  }
}

marketing.addEventListener('change', () => {
  const selected = state.marketingPersonas.find(({ slug }) => slug === marketing.value);
  if (selected) coarse.value = selected.role || '';
  mapping();
  renderProfile(coarse.value);
});
coarse.addEventListener('change', () => renderProfile(coarse.value));
const simulatedLogin = document.getElementById('persona-loggedin');
const simulatedRegion = document.getElementById('persona-region');
const regions = 'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ');
simulatedRegion.replaceChildren(option('', 'Region (state)'), ...regions.map((region) => option(region, region)));
function simulation() {
  document.getElementById('persona-simulation').textContent = `App-only simulation: ${simulatedLogin.checked ? 'logged in' : 'logged out'}; ${simulatedRegion.value || 'no region'}. No page or identity effects.`;
}
simulatedLogin.addEventListener('change', simulation);
simulatedRegion.addEventListener('change', simulation);
document.getElementById('persona-form').addEventListener('submit', (event) => {
  event.preventDefault();
  run('apply', { b2bPersona: coarse.value || null, marketingPersona: marketing.value || null });
});
reset.addEventListener('click', () => {
  simulatedLogin.checked = false;
  simulatedRegion.value = '';
  simulation();
  run('apply', { b2bPersona: null, marketingPersona: null });
});
document.getElementById('persona-refresh').addEventListener('click', () => {
  if (origin) run('get');
});

try {
  const referrer = new URLSearchParams(window.location.search).get('referrer');
  if (window.parent === window || !referrer) throw new Error('Open this app from the content page using the Sidekick Persona button.');
  const context = new URL(referrer);
  if (!['http:', 'https:'].includes(context.protocol)) throw new Error('The Sidekick page context must be an HTTP(S) URL.');
  origin = context.origin;
  run('get');
} catch (error) {
  message(error.message, true);
}
