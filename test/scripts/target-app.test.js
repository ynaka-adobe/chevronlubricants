import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import {
  buildInsertion, createRuntimeClient, renderApp, sendInsertion, validateContext,
} from '../../tools/target/target-v2.js';
import decorate from '../../blocks/target-offer/target-offer.js';

describe('Imported Target author app', () => {
  let root;
  const config = { runtimeUrl: 'https://approved.example/target' };
  const activity = {
    id: '42', name: '<img src=x onerror=alert(1)>', type: 'xt', state: 'saved',
  };
  const details = { locations: { mboxes: [{ name: 'hero<&' }] } };
  const sdk = () => ({
    context: { org: 'ynaka-adobe', repo: 'chevronlubricants', path: '/en-us/home.html' },
    token: 'test-author-token',
    actions: { sendHTML: sinon.stub().resolves(undefined) },
  });
  const response = (data, status = 200) => new Response(JSON.stringify(data), { status });
  const tick = () => new Promise((resolve) => { setTimeout(resolve, 20); });

  beforeEach(() => {
    root = document.createElement('main');
    document.body.append(root);
  });
  afterEach(() => {
    root.remove();
    document.querySelectorAll('dialog').forEach((dialog) => dialog.remove());
  });

  it('shows actionable missing configuration without any provider requests', async () => {
    const fetcher = sinon.spy();
    await renderApp(root, { runtimeUrl: '' }, null, fetcher);
    expect(root.textContent).to.include('Configuration required');
    expect(root.textContent).to.include('No Target request was made');
    expect([...root.querySelectorAll('button')].every((button) => button.disabled)).to.equal(true);
    expect(fetcher.called).to.equal(false);
  });

  it('loads the actual standalone HTML without a DA SDK or provider download when unconfigured', async () => {
    const frame = document.createElement('iframe');
    root.append(frame);
    frame.src = '/tools/target/target.html';
    await new Promise((resolve) => { frame.onload = resolve; });
    for (let attempt = 0; !frame.contentDocument.body.textContent.includes('Configuration required')
      && attempt < 100; attempt += 1) await tick();
    expect(frame.contentDocument.body.textContent).to.include('Configuration required');
    const requests = frame.contentWindow.performance.getEntriesByType('resource').map(({ name }) => name);
    expect(requests.some((url) => url.startsWith('https://da.live'))).to.equal(false);
    expect(requests.some((url) => url.includes('adobeioruntime'))).to.equal(false);
  });

  it('accepts only actual Chevron DA document context and safe endpoints', () => {
    expect(validateContext(sdk()).path).to.equal('/en-us/home.html');
    const other = sdk();
    other.context.repo = 'dupont';
    expect(() => createRuntimeClient(config, other)).to.throw('Chevron DA');
    ['http://example.test', 'https://u:p@example.test', 'https://example.test/?token=x',
      'https://example.test/#secret'].forEach((runtimeUrl) => {
      expect(() => createRuntimeClient({ runtimeUrl }, sdk())).to.throw('HTTPS endpoint');
    });
  });

  it('sends author credentials only as a header and mutations only as POST JSON', async () => {
    const fetcher = sinon.stub().callsFake(async () => response({ offers: [] }));
    const request = createRuntimeClient(config, sdk(), fetcher);
    await request('offers');
    await request('update-offer', { id: '42', type: 'xt', offerId: '4' }, true);
    const [url, options] = fetcher.firstCall.args;
    expect(url).not.to.include('test-author-token');
    expect(options.headers.Authorization).to.equal('Bearer test-author-token');
    expect(options.redirect).to.equal('error');
    expect(options.credentials).to.equal('omit');
    const [mutationURL, mutation] = fetcher.secondCall.args;
    expect(new URL(mutationURL).search).to.equal('?resource=update-offer');
    expect(mutation.method).to.equal('POST');
    expect(JSON.parse(mutation.body)).to.deep.equal({ id: '42', type: 'xt', offerId: '4' });
  });

  it('requires author sign-in and surfaces provider failures instead of empty success', async () => {
    const fetcher = sinon.stub().resolves(response({ error: 'Forbidden' }, 403));
    try {
      await createRuntimeClient(config, sdk(), fetcher)('activities');
      throw new Error('Expected HTTP rejection');
    } catch (error) {
      expect(error.message).to.include('HTTP 403');
    }
    const signedOut = sdk();
    delete signedOut.token;
    try {
      await createRuntimeClient(config, signedOut, fetcher)('activities');
      throw new Error('Expected sign-in rejection');
    } catch (error) {
      expect(error.message).to.include('sign-in required');
    }
    expect(fetcher.callCount).to.equal(1);
  });

  it('renders/selects the real list safely and sends escaped separated DA tables', async () => {
    const context = sdk();
    const fetcher = sinon.stub().callsFake(async (url) => response(
      new URL(url).searchParams.get('resource') === 'activity'
        ? details : { activities: [activity] },
    ));
    await renderApp(root, config, context, fetcher);
    expect(root.querySelector('img')).to.equal(null);
    expect(root.textContent).to.include(activity.name);
    expect(root.textContent).to.include('ynaka-adobe/chevronlubricants/en-us/home.html');
    const radio = root.querySelector('input[type=radio]');
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    [...root.querySelectorAll('button')].find((button) => button.textContent === 'Insert into Page').click();
    await tick();
    expect(context.actions.sendHTML.calledOnce).to.equal(true);
    expect(root.textContent).to.include('Content sent to DA');
    expect(root.textContent).to.include('not independently confirmed');
    const html = context.actions.sendHTML.firstCall.args[0];
    expect(html).to.include('</table><p></p><table>');
    expect(html).to.include('<td>target</td><td>1</td>');
    expect(html).to.include('&lt;img');
    expect(html).not.to.include('<img');
  });

  it('does not insert missing mboxes or claim a rejected insertion succeeded', async () => {
    expect(() => buildInsertion(activity, {})).to.throw('No content was sent');
    const context = sdk();
    context.actions.sendHTML.resolves({ ok: false, error: 'Document locked' });
    try {
      await sendInsertion(context, activity, details);
      throw new Error('Expected insertion rejection');
    } catch (error) {
      expect(error.message).to.equal('Document locked');
    }
  });

  it('opens the source XT creation and offer-selection workflows without provider writes', async () => {
    const fetcher = sinon.stub().callsFake(async (url) => {
      const resource = new URL(url).searchParams.get('resource');
      return response({
        activities: [activity],
        offers: [{ id: '5', name: 'Example offer' }],
        audiences: [{ id: '7', name: 'Example audience' }],
        resource,
      });
    });
    await renderApp(root, config, sdk(), fetcher);
    root.querySelector('.btn-create').click();
    await tick();
    expect(document.querySelector('dialog').textContent).to.include('Create Experience Targeting Activity');
    expect(document.querySelectorAll('dialog select')).to.have.length(2);
    document.querySelector('dialog').close();
    const radio = root.querySelector('input');
    radio.dispatchEvent(new Event('change'));
    [...root.querySelectorAll('button')].find((button) => button.textContent === 'Change Experience').click();
    await tick();
    expect(document.querySelector('dialog').textContent).to.include('Example offer');
    expect(fetcher.getCalls().every(({ args }) => args[1].method === 'GET')).to.equal(true);
  });

  it('decorates the inserted stable slot without Target calls or changes to fallback content', () => {
    const block = document.createElement('div');
    block.innerHTML = '<div><div>hero</div></div><div><div><p>Fallback</p></div></div>';
    decorate(block);
    expect(block.dataset.mboxName).to.equal('hero');
    expect(block.querySelector('.target-offer-slot').textContent).to.equal('Fallback');
  });
});
