// Adapted from DuPont tools/target (Apache-2.0): approved routing, authenticated requests,
// escaped DOM rendering, explicit errors, and truthful DA insertion acknowledgements.
const SITE = { org: 'ynaka-adobe', repo: 'chevronlubricants' };

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, action, className = 'btn-change') {
  const node = element('button', text, className);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

export function validateContext(sdk) {
  const context = sdk?.context;
  if (context?.org !== SITE.org || context?.repo !== SITE.repo
    || typeof context.path !== 'string' || !context.path.startsWith('/')
    || context.path.startsWith('//') || /[?#\r\n]/.test(context.path)
    || context.path.split('/').some((part) => part === '.' || part === '..')) {
    throw new Error('Open Target in a Chevron DA document to supply its authoring context.');
  }
  return context;
}

export function createRuntimeClient(config, sdk, fetcher = fetch) {
  validateContext(sdk);
  if (typeof config?.runtimeUrl !== 'string' || !config.runtimeUrl.trim()) {
    throw new Error('Configuration required: set runtimeUrl in tools/target/config.json to an approved Chevron Target backend. Do not use the DuPont runtime.');
  }
  const endpoint = new URL(config.runtimeUrl, window.location.href);
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password
    || endpoint.search || endpoint.hash) {
    throw new Error('Target runtimeUrl must be an HTTPS endpoint without credentials, query parameters or a fragment.');
  }
  return async (resource, params = {}, mutation = false) => {
    if (typeof sdk.token !== 'string' || !sdk.token.trim()) {
      throw new Error('Adobe author sign-in required. Reopen this app in DA after signing in.');
    }
    const url = new URL(endpoint);
    url.searchParams.set('resource', resource);
    const headers = { Authorization: `Bearer ${sdk.token}`, Accept: 'application/json' };
    const options = {
      method: mutation ? 'POST' : 'GET',
      headers,
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    };
    if (mutation) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(params);
    } else {
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
    }
    const response = await fetcher(url.href, options);
    if (!response.ok) {
      throw new Error(`Target backend returned HTTP ${response.status}. Check author authorization and Chevron backend provisioning.`);
    }
    const result = await response.json();
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('Target backend returned an invalid JSON response.');
    }
    if (result.error || result.httpStatus >= 400 || result.errors?.length) {
      throw new Error(result.errors?.[0]?.message || result.error || `Target API error ${result.httpStatus}`);
    }
    return result;
  };
}

function list(result, key) {
  if (!Array.isArray(result[key])) throw new Error(`Target backend response is missing ${key}.`);
  return result[key];
}

export function buildInsertion(activity, details) {
  if (!activity?.id || typeof activity.name !== 'string') throw new Error('Select a valid Target activity.');
  const mbox = details?.locations?.mboxes?.[0]?.name;
  if (typeof mbox !== 'string' || !mbox.trim()) {
    throw new Error('This activity has no supported mbox location. No content was sent to DA.');
  }
  const table = (rows) => {
    const node = element('table');
    const body = element('tbody');
    rows.forEach((cells) => {
      const row = element('tr');
      cells.forEach((text) => row.append(element('td', String(text))));
      body.append(row);
    });
    node.append(body);
    return node.outerHTML;
  };
  const offer = table([['target-offer'], [mbox], ['']]);
  const metadata = table([
    ['metadata'],
    ['Experience', activity.name],
    ['target', '1'],
    ['target-mbox-hero', mbox],
    ['target-mbox-hero-selector', '.target-offer'],
    ['activity', activity.id],
  ]);
  // DA can merge adjacent tables; retain the source app's paragraph separator.
  return `${offer}<p></p>${metadata}`;
}

export async function sendInsertion(sdk, activity, details) {
  validateContext(sdk);
  if (typeof sdk.actions?.sendHTML !== 'function') {
    throw new Error('DA insertion capability is unavailable. Open Target in the DA document app panel.');
  }
  const result = await sdk.actions.sendHTML(buildInsertion(activity, details));
  if (result?.ok === false) throw new Error(result.error || 'DA rejected the insertion request.');
  return 'Content sent to DA. Review the document and save it; insertion and persistence are not independently confirmed.';
}

function dialog(title) {
  const overlay = element('dialog', undefined, 'offers-modal');
  const panel = element('div', undefined, 'offers-panel');
  const header = element('div', undefined, 'offers-header');
  header.append(element('h3', title), button('Close', () => overlay.close()));
  panel.append(header);
  overlay.append(panel);
  overlay.addEventListener('close', () => overlay.remove());
  document.body.append(overlay);
  overlay.showModal();
  return { overlay, panel };
}

function field(label, input) {
  const wrapper = element('label', undefined, 'form-field');
  wrapper.append(element('span', label), input);
  return wrapper;
}

function selectOptions(items, prompt) {
  const select = element('select');
  select.append(new Option(prompt, ''));
  items.forEach((item) => select.append(new Option(item.name, item.id)));
  return select;
}

async function createXt(request, refresh) {
  const { overlay, panel } = dialog('Create Experience Targeting Activity');
  const form = element('form', undefined, 'create-form');
  const name = element('input');
  name.required = true;
  const mbox = element('input');
  mbox.value = 'target-global-mbox';
  mbox.required = true;
  const status = element('p', 'Loading offers and audiences...', 'status');
  status.setAttribute('role', 'status');
  form.append(field('Activity Name', name), field('Mbox / Location', mbox), status);
  panel.append(form);
  try {
    const [offers, audiences] = await Promise.all([request('offers'), request('audiences')]);
    const offer = selectOptions(list(offers, 'offers'), 'Select an offer');
    offer.required = true;
    const audience = selectOptions(list(audiences, 'audiences'), 'All Visitors (no audience)');
    const save = element('button', 'Create', 'btn-create');
    save.type = 'submit';
    form.append(field('Offer', offer), field('Audience', audience), save);
    status.textContent = '';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      save.disabled = true;
      status.textContent = 'Creating activity...';
      try {
        await request('create-xt', {
          name: name.value.trim(),
          mbox: mbox.value.trim(),
          offerId: offer.value,
          ...(audience.value ? { audienceId: audience.value } : {}),
        }, true);
        overlay.close();
        await refresh();
      } catch (error) {
        status.textContent = error.message;
        save.disabled = false;
      }
    });
  } catch (error) {
    status.textContent = error.message;
  }
}

async function changeOffer(request, activity, refresh) {
  const { overlay, panel } = dialog('Select Offer');
  const status = element('p', 'Loading offers...', 'status');
  status.setAttribute('role', 'status');
  panel.append(status);
  try {
    const offers = list(await request('offers'), 'offers');
    const select = selectOptions(offers, 'Select an offer');
    const matching = offers.find((offer) => offer.name?.toLowerCase()
      === activity.name.toLowerCase());
    select.value = matching?.id || '';
    const apply = button('Apply', async () => {
      if (!select.value) {
        status.textContent = 'Select an offer before applying.';
        return;
      }
      apply.disabled = true;
      status.textContent = 'Saving offer...';
      try {
        await request('update-offer', {
          id: activity.id, type: activity.type, offerId: select.value,
        }, true);
        overlay.close();
        await refresh();
      } catch (error) {
        status.textContent = error.message;
        apply.disabled = false;
      }
    }, 'btn-create');
    panel.append(field('Offer', select), apply);
    status.textContent = '';
  } catch (error) {
    status.textContent = error.message;
  }
}

export async function renderApp(root, config, sdk, fetcher = fetch) {
  let request;
  let selected;
  let refresh;
  root.replaceChildren();
  const heading = element('h2', 'Target Activities');
  const context = element('p', '', 'context');
  const status = element('p', '', 'status');
  status.setAttribute('role', 'status');
  const actions = element('div', undefined, 'action-bar');
  const table = element('table');
  table.setAttribute('aria-label', 'Target activities');
  const head = element('thead');
  const header = element('tr');
  ['Select', 'ID', 'Name', 'Type', 'State', 'Modified'].forEach((label) => header.append(element('th', label)));
  head.append(header);
  const body = element('tbody');
  table.append(head, body);
  const create = button('Create Activity', () => createXt(request, refresh), 'btn-create');
  const change = button('Change Experience', () => changeOffer(request, selected, refresh));
  const insert = button('Insert into Page', async () => {
    const activity = selected;
    insert.disabled = true;
    status.textContent = 'Fetching activity details...';
    try {
      const details = await request('activity', { id: activity.id, type: activity.type, version: 'v3' });
      status.textContent = await sendInsertion(sdk, activity, details);
    } catch (error) {
      status.textContent = error.message;
    } finally {
      insert.disabled = false;
    }
  });
  const reload = button('Refresh', () => refresh());
  const docs = element('a', 'Target setup and usage');
  docs.href = 'https://github.com/ynaka-adobe/chevronlubricants/blob/main/tools/target/README.md';
  docs.target = '_blank';
  docs.rel = 'noopener';
  actions.append(create, change, insert, reload);
  root.append(heading, context, actions, status, table, docs);
  [create, change, insert, reload].forEach((control) => { control.disabled = true; });
  refresh = async () => {
    selected = null;
    [create, change, insert, reload].forEach((control) => { control.disabled = true; });
    status.textContent = 'Loading Target activities...';
    body.replaceChildren();
    try {
      const activities = list(await request('activities'), 'activities');
      activities.forEach((activity) => {
        if (!activity?.id || typeof activity.name !== 'string' || typeof activity.type !== 'string') {
          throw new Error('Target backend returned an invalid activity.');
        }
        const row = element('tr');
        const radio = element('input');
        radio.type = 'radio';
        radio.name = 'activity';
        radio.setAttribute('aria-label', `Select ${activity.name}`);
        const cell = element('td');
        cell.append(radio);
        row.append(cell);
        const modified = activity.modifiedAt ? new Date(activity.modifiedAt).toLocaleDateString('en-US') : '';
        [activity.id, activity.name, activity.type.toUpperCase(), activity.state || '', modified]
          .forEach((value) => row.append(element('td', String(value))));
        radio.addEventListener('change', () => {
          selected = activity;
          change.disabled = false;
          insert.disabled = typeof sdk.actions?.sendHTML !== 'function';
          create.disabled = true;
          status.textContent = insert.disabled
            ? 'DA insertion capability unavailable; this activity can only be managed in Target.' : '';
        });
        body.append(row);
      });
      status.textContent = activities.length ? 'Select an activity to change its offer or send a slot to DA.' : 'No Target activities were returned.';
      create.disabled = false;
    } catch (error) {
      body.replaceChildren();
      status.textContent = error.message;
    } finally {
      reload.disabled = false;
    }
  };

  try {
    const page = validateContext(sdk);
    context.textContent = `${page.org}/${page.repo}${page.path}`;
    request = createRuntimeClient(config, sdk, fetcher);
    await refresh();
  } catch (error) {
    context.textContent = 'Chevron author app; DA document context or approved backend configuration is unavailable.';
    status.textContent = !config?.runtimeUrl
      ? 'Configuration required: set runtimeUrl in tools/target/config.json to an approved Chevron Target backend. Sign in and open this app in a Chevron DA document. No Target request was made.'
      : error.message;
  }
}

const root = document.getElementById('target-app');
if (root) {
  (async () => {
    root.append(element('p', 'Connecting to DA...', 'status'));
    try {
      const response = await fetch(new URL('./config.json', import.meta.url));
      if (!response.ok) throw new Error(`Target configuration returned HTTP ${response.status}.`);
      const config = await response.json();
      if (!config.runtimeUrl) {
        await renderApp(root, config, null);
        return;
      }
      const { default: sdkPromise } = await import('https://da.live/nx/utils/sdk.js');
      const sdk = await Promise.race([
        sdkPromise,
        new Promise((resolve) => { setTimeout(() => resolve(null), 1500); }),
      ]);
      await renderApp(root, config, sdk);
    } catch (error) {
      root.replaceChildren(element('h2', 'Target Activities'), element('p', error.message, 'status'));
    }
  })();
}
