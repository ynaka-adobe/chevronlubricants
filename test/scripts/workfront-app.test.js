import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { chevronContext, initialize } from '../../tools/workfront/app.js';
import { createSession, validateConfig } from '../../tools/workfront/runtime.js';
import { buildApp } from '../../tools/workfront/library.js';

describe('Imported Workfront author app', () => {
  const input = {
    runtimeUrl: 'https://approved.example/workfront',
    workfrontOrigin: 'https://workfront.example',
    oauthClientId: 'approved-public-client',
    oauthRedirectUri: 'https://approved.example/oauth/callback',
  };
  let root;
  let dispose;
  const tick = () => new Promise((resolve) => { setTimeout(resolve, 30); });
  beforeEach(() => {
    root = document.createElement('main');
    document.body.append(root);
  });
  afterEach(() => {
    dispose?.();
    dispose = null;
    root.remove();
  });

  function authHost() {
    const listeners = new Set();
    const popup = { closed: false, close: sinon.spy() };
    const host = {
      location: { origin: 'https://chevron.example' },
      crypto,
      setTimeout: window.setTimeout.bind(window),
      clearTimeout: window.clearTimeout.bind(window),
      setInterval: window.setInterval.bind(window),
      clearInterval: window.clearInterval.bind(window),
      open: sinon.stub().returns(popup),
      addEventListener: (type, fn) => listeners.add(fn),
      removeEventListener: (type, fn) => listeners.delete(fn),
    };
    const message = (extra = {}) => {
      const state = new URL(host.open.firstCall.args[0]).searchParams.get('state');
      const event = {
        origin: 'https://approved.example',
        source: popup,
        data: { type: 'wf_tokens', state, access_token: 'test-wf-token', expires_in: 300 },
        ...extra,
      };
      [...listeners].forEach((listener) => listener(event));
    };
    return { host, popup, message };
  }

  it('reports setup required and no provider requests with blank public configuration', async () => {
    const fetcher = sinon.stub().resolves(new Response('{}'));
    const app = await initialize({ root, fetcher, loadContext: async () => null });
    dispose = app.dispose;
    expect(root.textContent).to.include('Workfront setup required');
    expect(root.textContent).to.include('No runtime requests have been made');
    expect(root.querySelector('button')).to.equal(null);
    expect(fetcher.callCount).to.equal(1);
    expect(fetcher.firstCall.args[0]).to.include('/tools/workfront/config.json');
  });

  it('loads both real standalone entry pages with explicit setup state and no OAuth requests', async () => {
    for (const entry of ['workfront', 'approval']) {
      const frame = document.createElement('iframe');
      root.append(frame);
      frame.src = `/tools/workfront/${entry}.html`;
      await new Promise((resolve) => { frame.onload = resolve; });
      for (let attempt = 0; !frame.contentDocument.body.textContent.includes('Workfront setup required')
        && attempt < 100; attempt += 1) await tick();
      expect(frame.contentDocument.body.textContent).to.include('Workfront setup required');
      const requests = frame.contentWindow.performance.getEntriesByType('resource').map(({ name }) => name);
      expect(requests.some((url) => url.startsWith('https://'))).to.equal(false);
      frame.remove();
    }
  });

  it('validates context without claiming standalone or other-site DA capabilities', () => {
    expect(chevronContext({ org: 'ynaka-adobe', repo: 'chevronlubricants', path: '/en-us/home.html' })).to.equal(true);
    expect(chevronContext({ org: 'ynaka-adobe', repo: 'dupont', path: '/' })).to.equal(false);
    expect(chevronContext({ org: 'ynaka-adobe', repo: 'chevronlubricants', path: '//evil' })).to.equal(false);
    expect(() => validateConfig({ ...input, runtimeUrl: 'https://approved.example/?token=x' })).to.throw('HTTPS URL');
    expect(() => validateConfig({ ...input, oauthRedirectUri: 'https://other.example/callback' })).to.throw('exact runtime origin');
  });

  it('shows the configured connect UI without opening OAuth or downloading provider data', async () => {
    const fetcher = sinon.stub().resolves(new Response(JSON.stringify(input)));
    const app = await initialize({ root, fetcher, loadContext: async () => null });
    dispose = app.dispose;
    expect(root.textContent).to.include('DA context unavailable');
    expect(root.querySelector('button').textContent).to.equal('Connect to Workfront');
    expect(fetcher.callCount).to.equal(1);
  });

  it('rejects forged popup origin/source/state and uses header-only memory tokens', async () => {
    const { host, message } = authHost();
    const fetcher = sinon.stub().callsFake(async () => new Response('{"data":[]}'));
    const session = createSession(validateConfig(input), { host, fetcher });
    dispose = session.dispose;
    const connect = session.connect();
    message({ origin: 'https://evil.example' });
    message({ source: {} });
    message({ data: { type: 'wf_tokens', state: 'forged', access_token: 'bad', expires_in: 300 } });
    expect(session.authenticated()).to.equal(false);
    message();
    await connect;
    expect(session.authenticated()).to.equal(true);
    await session.api({ resource: 'projects', filter: 'member' });
    const [url, options] = fetcher.firstCall.args;
    expect(url).not.to.include('test-wf-token');
    expect(options.headers.Authorization).to.equal('Bearer test-wf-token');
    expect(options.redirect).to.equal('error');
    expect(options.credentials).to.equal('omit');
    expect(localStorage.getItem('wf_access_token')).to.equal(null);
    await session.api({ resource: 'create_task', projectId: 'p', name: 'Test' });
    expect(fetcher.secondCall.args[1].method).to.equal('POST');
    expect(JSON.parse(fetcher.secondCall.args[1].body).resource).to.equal('create_task');
    expect(new URL(fetcher.secondCall.args[0]).search).to.equal('');
  });

  it('rejects refresh-token responses, popup blocking and expired sessions explicitly', async () => {
    const { host, message } = authHost();
    const session = createSession(validateConfig(input), { host });
    dispose = session.dispose;
    const connect = session.connect().catch((error) => error);
    const state = new URL(host.open.firstCall.args[0]).searchParams.get('state');
    message({ data: { type: 'wf_tokens', state, access_token: 'x', refresh_token: 'no', expires_in: 300 } });
    expect((await connect).message).to.include('no refresh token');
    host.open.returns(null);
    expect((await session.connect().catch((error) => error)).message).to.include('Popup blocked');
    expect((await session.api({ resource: 'projects' }).catch((error) => error)).message).to.include('Reconnect');
  });

  it('clears authentication on HTTP401 and does not render a successful empty result', async () => {
    const { host, message } = authHost();
    const expired = sinon.spy();
    const session = createSession(validateConfig(input), {
      host, onExpired: expired, fetcher: async () => new Response('{}', { status: 401 }),
    });
    dispose = session.dispose;
    const connect = session.connect();
    message();
    await connect;
    expect((await session.api({ resource: 'projects' }).catch((error) => error)).message).to.include('expired');
    expect(expired.calledOnce).to.equal(true);
    expect(session.authenticated()).to.equal(false);
  });

  it('renders source project/task/issue/document workflows and escapes provider content', async () => {
    const api = sinon.stub().callsFake(async ({ resource }) => {
      if (resource === 'projects') return [{ ID: 'p', name: 'Example project', status: 'CUR' }];
      if (resource === 'task_statuses') return [{ key: 'NEW', label: 'New' }];
      if (resource === 'approval') return [];
      return [{ ID: 'r', name: '<img src=x>', status: 'NEW', currentVersionID: 'v' }];
    });
    const app = await buildApp(root, api, validateConfig(input));
    dispose = app.dispose;
    expect(root.textContent).to.include('Example project');
    expect(root.querySelector('img')).to.equal(null);
    expect(root.textContent).to.include('<img src=x>');
    root.querySelector('.btn-view').click();
    await tick();
    expect(root.querySelector('.detail-panel').classList.contains('open')).to.equal(true);
    expect(root.querySelector('.edit-form')).not.to.equal(null);
    root.querySelector('.btn-close').click();
    root.querySelector('[data-tab=issues]').click();
    await tick();
    expect(root.querySelector('.btn-new-task').textContent).to.equal('New Issue');
    root.querySelector('[data-tab=documents]').click();
    await tick();
    expect(root.querySelector('.btn-new-task').hidden).to.equal(true);
    root.querySelector('.btn-view').click();
    await tick();
    expect(root.textContent).to.include('No approvals on this version');
    expect(api.getCalls().some(({ args }) => /^(create|update)_/.test(args[0].resource))).to.equal(false);
  });
});
