/*
 * Adapted from ynaka-adobe/dupont tools/workfront (Apache-2.0),
 * revision ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0.
 * Chevron changes: configurable, memory-only OAuth and authenticated transport.
 */

const RESOURCES = new Set([
  'projects', 'documents', 'approval', 'tasks', 'issues', 'current_user',
  'search_users', 'issue_statuses', 'task_statuses', 'create_task', 'create_issue',
  'update_task', 'update_issue',
]);
const PARAMETERS = new Set([
  'resource', 'filter', 'limit', 'projectId', 'docVersionId', 'query',
  'name', 'description', 'duration', 'plannedCompletionDate', 'assignedToID',
  'priority', 'taskId', 'issueId', 'status', 'percentComplete',
]);

function secureURL(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Setup required: set ${label} in tools/workfront/config.json.`);
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error(`Setup required: ${label} must be an HTTPS URL without credentials, query or fragment.`);
  }
  return url;
}

export function validateConfig(input) {
  const runtime = secureURL(input?.runtimeUrl, 'runtimeUrl');
  const workfront = secureURL(input?.workfrontOrigin, 'workfrontOrigin');
  const redirect = secureURL(input?.oauthRedirectUri, 'oauthRedirectUri');
  if (workfront.pathname !== '/' || redirect.origin !== runtime.origin) {
    throw new Error('Setup required: workfrontOrigin must be an origin; oauthRedirectUri must use the exact runtime origin.');
  }
  if (typeof input.oauthClientId !== 'string' || !/^[a-zA-Z0-9._-]+$/.test(input.oauthClientId)) {
    throw new Error('Setup required: set the public oauthClientId in tools/workfront/config.json (never a client secret).');
  }
  return Object.freeze({
    runtimeUrl: runtime.href,
    runtimeOrigin: runtime.origin,
    workfrontOrigin: workfront.origin,
    oauthRedirectUri: redirect.href,
    oauthClientId: input.oauthClientId,
  });
}

export function createSession(config, {
  host = window,
  fetcher = (...args) => fetch(...args),
  now = () => Date.now(),
  onExpired = () => {},
  authTimeout = 120000,
} = {}) {
  let accessToken;
  let expiresAt = 0;
  let expiryTimer;
  let cancelAuth;
  let disposed = false;

  function clearToken() {
    accessToken = undefined;
    expiresAt = 0;
    host.clearTimeout(expiryTimer);
  }

  function expire() {
    clearToken();
    if (!disposed) onExpired();
  }

  function authenticated() {
    if (accessToken && now() >= expiresAt) expire();
    return Boolean(accessToken);
  }

  function connect() {
    if (disposed) return Promise.reject(new Error('App closed. Reopen Workfront to connect.'));
    if (cancelAuth) return Promise.reject(new Error('Authorization is already in progress.'));
    clearToken();
    const state = host.crypto.randomUUID();
    const url = new URL(config.runtimeUrl);
    url.search = new URLSearchParams({
      resource: 'oauth_start',
      client_id: config.oauthClientId,
      redirect_uri: config.oauthRedirectUri,
      caller_origin: host.location.origin,
      state,
    }).toString();

    return new Promise((resolve, reject) => {
      let popup;
      let timeout;
      let closed;
      let onMessage;
      function finish(error) {
        host.removeEventListener('message', onMessage);
        host.clearTimeout(timeout);
        host.clearInterval(closed);
        cancelAuth = undefined;
        popup?.close();
        if (error) reject(error);
        else resolve();
      }
      onMessage = (event) => {
        if (event.origin !== config.runtimeOrigin || event.source !== popup
          || event.data?.type !== 'wf_tokens' || event.data.state !== state) return;
        const { data } = event;
        if (data.error) {
          finish(new Error('Workfront authorization failed. Reconnect or ask the administrator to check the OAuth broker.'));
          return;
        }
        const ttl = Number(data.expires_in);
        if (typeof data.access_token !== 'string' || !data.access_token
          || /[\r\n]/.test(data.access_token) || !Number.isFinite(ttl) || ttl <= 0
          || ttl > 86400 || data.refresh_token !== undefined) {
          finish(new Error('Invalid OAuth broker response. Require an access token, expires_in (1–86400 seconds), matching state and no refresh token.'));
          return;
        }
        accessToken = data.access_token;
        expiresAt = now() + ttl * 1000;
        expiryTimer = host.setTimeout(expire, ttl * 1000);
        finish();
      };
      cancelAuth = () => finish(new Error('Authorization canceled. Reconnect to Workfront.'));
      host.addEventListener('message', onMessage);
      popup = host.open(url.href, '_blank', 'popup,width=620,height=720');
      if (!popup) {
        finish(new Error('Popup blocked. Allow popups for this author app and reconnect.'));
        return;
      }
      timeout = host.setTimeout(() => finish(new Error(
        'Authorization expired. Reconnect to Workfront.',
      )), authTimeout);
      closed = host.setInterval(() => {
        if (popup.closed) finish(new Error('Authorization window closed. Reconnect to Workfront.'));
      }, 500);
    });
  }

  async function api(params) {
    if (disposed || !authenticated()) {
      throw new Error('Workfront session expired or disconnected. Reconnect to continue.');
    }
    const invalidParameters = Object.keys(params).some((key) => !PARAMETERS.has(key));
    if (!RESOURCES.has(params.resource) || invalidParameters) {
      throw new Error('Unsupported Workfront request.');
    }
    const mutation = /^(create|update)_/.test(params.resource);
    const url = new URL(config.runtimeUrl);
    const requestToken = accessToken;
    const options = {
      method: mutation ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${requestToken}`, Accept: 'application/json' },
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
    };
    if (mutation) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(params);
    } else {
      url.search = new URLSearchParams(params).toString();
    }
    let response;
    try {
      response = await fetcher(url.href, options);
    } catch {
      throw new Error('Workfront runtime unavailable. Check the configured broker URL, CORS and network connection.');
    }
    if (response.status === 401) {
      expire();
      throw new Error('Workfront session expired. Reconnect to continue.');
    }
    let json;
    try {
      json = await response.json();
    } catch {
      throw new Error(`Workfront runtime returned an invalid JSON response (${response.status}).`);
    }
    if (!authenticated() || requestToken !== accessToken) {
      throw new Error('Workfront session changed. Reconnect and retry.');
    }
    if (!response.ok || json?.error) {
      // Do not reflect provider errors that may echo request credentials or secrets.
      throw new Error(`Workfront request failed (${response.status}). Ask the administrator to check the broker and Workfront permissions.`);
    }
    if (json === null || typeof json !== 'object') {
      throw new Error('Workfront runtime returned an invalid data response.');
    }
    return json.data ?? json;
  }

  return {
    connect,
    api,
    authenticated,
    dispose() {
      disposed = true;
      cancelAuth?.();
      clearToken();
    },
  };
}
