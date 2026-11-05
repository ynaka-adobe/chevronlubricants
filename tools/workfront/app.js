/*
 * Adapted from ynaka-adobe/dupont tools/workfront (Apache-2.0),
 * revision ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0.
 * Chevron changes: explicit SDK context and setup gate; no visitor initialization.
 */
import { createSession, validateConfig } from './runtime.js';
import { buildApp } from './library.js';

export function chevronContext(context) {
  return context?.org === 'ynaka-adobe' && context?.repo === 'chevronlubricants'
    && typeof context.path === 'string' && context.path.startsWith('/')
    && !context.path.startsWith('//') && !/[?#\r\n]/.test(context.path)
    && !context.path.split('/').some((part) => part === '.' || part === '..');
}

async function sdkContext() {
  if (window.parent === window) return null;
  let timeout;
  try {
    return await Promise.race([
      import('https://da.live/nx/utils/sdk.js').then(({ default: sdk }) => sdk),
      new Promise((resolve) => { timeout = setTimeout(() => resolve(null), 5000); }),
    ]);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function initialize({
  root = document.getElementById('workfront-app'),
  mode = 'library',
  fetcher = (...args) => fetch(...args),
  loadContext = sdkContext,
  sessionOptions = {},
} = {}) {
  if (!root) return null;
  const contextLabel = document.createElement('p');
  contextLabel.className = 'context-label';
  contextLabel.textContent = 'Checking DA document context…';
  const content = document.createElement('div');
  content.className = 'app-content';
  root.replaceChildren(contextLabel, content);
  let context = null;
  let config;
  try {
    const response = await fetcher(new URL('./config.json', import.meta.url).href, {
      credentials: 'omit', cache: 'no-store',
    });
    if (!response.ok) throw new Error('Setup required: tools/workfront/config.json is unavailable.');
    config = validateConfig(await response.json());
  } catch (error) {
    contextLabel.textContent = 'DA context not requested: configure the approved Workfront backend first.';
    contextLabel.dataset.available = 'false';
    const setup = document.createElement('section');
    setup.className = 'setup-required';
    setup.innerHTML = '<h1>Workfront setup required</h1><p class="error"></p><p>Configure an administrator-approved secure OAuth/API broker and the four public values in <code>tools/workfront/config.json</code>. The DuPont broker cannot be used unchanged. No runtime requests have been made.</p><a href="https://github.com/ynaka-adobe/chevronlubricants/blob/main/tools/workfront/README.md" target="_blank" rel="noopener noreferrer">Read the secure broker contract and setup steps</a>';
    setup.querySelector('.error').textContent = error.message;
    content.replaceChildren(setup);
    return { context, dispose() {} };
  }
  try {
    const sdk = await loadContext();
    if (chevronContext(sdk?.context)) context = sdk.context;
  } catch {
    // Standalone or an unavailable SDK is not an authenticated DA document context.
  }
  contextLabel.textContent = context
    ? `DA context: ${context.org}/${context.repo}${context.path}`
    : 'DA context unavailable. Open this app through its DA registration in a Chevron document. Workfront-only actions remain available; DA-specific actions are disabled.';
  contextLabel.dataset.available = String(Boolean(context));

  let library;
  let session;
  let disposed = false;
  function showConnect(message = 'Connect to Workfront to continue.') {
    library?.dispose();
    library = null;
    const screen = document.createElement('section');
    screen.className = 'connect-screen';
    const title = document.createElement('h1');
    title.textContent = mode === 'approval' ? 'Mark Task Complete' : 'Workfront Library';
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.textContent = message;
    const button = document.createElement('button');
    button.className = 'btn-connect';
    button.textContent = 'Connect to Workfront';
    button.addEventListener('click', async () => {
      button.disabled = true;
      status.textContent = 'Authorize in the popup, then return here…';
      try {
        await session.connect();
        if (!disposed) library = await buildApp(content, session.api, config, { mode });
      } catch (error) {
        if (!disposed && screen.isConnected) {
          status.textContent = error.message;
          button.disabled = false;
        }
      }
    });
    screen.append(title, status, button);
    content.replaceChildren(screen);
  }
  session = createSession(config, {
    ...sessionOptions,
    fetcher,
    onExpired: () => showConnect('Workfront session expired. Reconnect to continue.'),
  });
  function dispose() {
    disposed = true;
    library?.dispose();
    session.dispose();
    window.removeEventListener('pagehide', dispose);
  }
  window.addEventListener('pagehide', dispose);
  showConnect();
  return { context, dispose };
}
