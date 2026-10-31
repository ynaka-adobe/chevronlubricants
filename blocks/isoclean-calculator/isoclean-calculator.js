/* ISOCLEAN® Cleanliness Calculator: industry -> equipment component -> storage environment ->
   target vs current ISO cleanliness code. Data comes from a multi-sheet JSON (components,
   scenarios, targets); see README.md. Everything runs in the browser, no page reloads. */

const DEFAULTS = {
  'step-1': 'Select your industry type',
  'step-2': 'Select your equipment and component type',
  'step-3': 'Select environment of bulk lubricant storage',
  'industry-label': 'Industry',
  'equipment-label': 'Equipment',
  'environment-label': 'Environment',
  'component-prompt': 'Select equipment component',
  'select-label': 'Select to see results',
  'target-label': 'Target',
  'current-label': 'Current',
  'code-caption': 'Estimated ISO Cleanliness Code',
  'start-over': 'Start over',
  'loading-message': 'Loading the calculator…',
  'error-message': 'The calculator could not be loaded. Please try again later.',
};

const DETAIL_KEYS = ['environment', 'label', 'heading', 'summary', 'current', 'photo'];

let instance = 0;

function toKey(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
}

/* ---------- authored configuration ---------- */

function readConfig(block) {
  const config = { texts: { ...DEFAULTS }, icons: new Map(), cells: {} };
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const [keyCell, valueCell] = [...row.children];
    if (!keyCell || !valueCell) return;
    const label = keyCell.textContent.trim();
    const picture = valueCell.querySelector('picture, img');
    const key = toKey(label);
    if (key === 'data') {
      config.data = valueCell.querySelector('a[href]')?.href || valueCell.textContent.trim();
    } else if (['intro', 'note', 'more-information', 'representative', 'credit'].includes(key)) {
      config.cells[key] = valueCell;
    } else if (picture) {
      config.icons.set(label.toLowerCase(), picture.closest('picture') || picture);
    } else if (key in DEFAULTS) {
      config.texts[key] = valueCell.textContent.trim();
    }
  });
  return config;
}

/* ---------- data sheet ---------- */

/* local dev serves content under /content/, Edge Delivery serves it at the root */
function sheetUrls(href) {
  const { origin, pathname } = window.location;
  const url = new URL(href, window.location.href);
  const urls = [];
  if (url.origin === origin && pathname.startsWith('/content/') && !url.pathname.startsWith('/content/')) {
    urls.push(new URL(`/content${url.pathname}${url.search}`, origin));
  }
  urls.push(url);
  return urls;
}

async function fetchData(href) {
  for (const url of sheetUrls(href)) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(url);
      // eslint-disable-next-line no-await-in-loop
      if (resp.ok) return await resp.json();
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

function buildModel(json) {
  const rows = (name) => json?.[name]?.data || [];
  const industries = new Map();
  rows('components').forEach((r) => {
    if (!r.Industry || !r.Equipment || !r.Component || !r.Target) return;
    if (!industries.has(r.Industry)) industries.set(r.Industry, new Map());
    const groups = industries.get(r.Industry);
    const group = r.Group || '';
    if (!groups.has(group)) groups.set(group, new Map());
    const equipment = groups.get(group);
    if (!equipment.has(r.Equipment)) equipment.set(r.Equipment, []);
    equipment.get(r.Equipment).push({ name: r.Component, target: r.Target });
  });
  const environments = new Map();
  rows('scenarios').forEach((r) => {
    if (!r.Environment || !r.Current) return;
    if (!environments.has(r.Environment)) {
      environments.set(r.Environment, {
        id: r.Environment,
        label: r.Label || r.Environment,
        heading: r.Heading,
        summary: r.Summary,
        scenarios: [],
      });
    }
    const details = Object.entries(r)
      .filter(([k, v]) => v && !DETAIL_KEYS.includes(k.toLowerCase()))
      .map(([k, v]) => ({ term: k, detail: v }));
    environments.get(r.Environment).scenarios.push({ code: r.Current, photo: r.Photo, details });
  });
  const targetPhotos = new Map(rows('targets').filter((r) => r.Photo).map((r) => [r.Code, r.Photo]));
  return { industries, environments, targetPhotos };
}

/* ---------- rendering ---------- */

function photoImg(src, alt) {
  if (!src) return null;
  return el('img', {
    class: 'isoclean-calculator-photo', src, alt, loading: 'lazy', width: 90, height: 90,
  });
}

function codeBox(type, label, code, caption, mark, photo) {
  return el(
    'div',
    { class: `isoclean-calculator-code isoclean-calculator-code-${type}` },
    el('p', { class: 'isoclean-calculator-code-label', text: label }),
    el('p', { class: 'isoclean-calculator-code-value' }, code, mark ? el('sup', { text: mark }) : null),
    el('p', { class: 'isoclean-calculator-code-caption', text: caption }),
    photo,
  );
}

export default async function init(block) {
  instance += 1;
  const id = `isoclean-calculator-${instance}`;
  const config = readConfig(block);
  const { texts, cells } = config;
  const state = {
    step: 1, industry: null, equipment: null, component: null, environment: null, scenario: null,
  };

  block.textContent = '';
  const status = el('p', { class: 'isoclean-calculator-status', role: 'status', text: texts['loading-message'] });
  block.append(status);

  const json = config.data ? await fetchData(config.data) : null;
  const model = buildModel(json);
  if (!model.industries.size || !model.environments.size) {
    status.textContent = texts['error-message'];
    return;
  }
  status.textContent = '';

  const steps = el('ol', { class: 'isoclean-calculator-steps' });
  const panel = el('div', { class: 'isoclean-calculator-panel', id: `${id}-panel` });
  block.append(steps, panel);

  const summary = (n) => {
    if (n === 1 && state.industry) return `${texts['industry-label']}: ${state.industry}`;
    if (n === 2 && state.component) return `${texts['equipment-label']}: ${state.equipment} - ${state.component.name}`;
    if (n === 3 && state.scenario) return `${texts['environment-label']}: ${state.environment.label} (${state.scenario.code})`;
    return texts[`step-${n}`];
  };

  let render;
  const goTo = (n) => {
    state.step = n;
    if (n <= 1) state.industry = null;
    if (n <= 2) Object.assign(state, { equipment: null, component: null });
    if (n <= 3) Object.assign(state, { environment: null, scenario: null });
    render(true);
  };

  function renderSteps() {
    steps.replaceChildren(...[1, 2, 3].map((n) => {
      const done = n < state.step;
      const current = n === state.step;
      const content = [el('span', { class: 'isoclean-calculator-step-number', text: n }), el('span', { class: 'isoclean-calculator-step-text', text: summary(n) })];
      const item = el('li', { class: `isoclean-calculator-step${done ? ' is-done' : ''}${current ? ' is-current' : ''}` });
      if (done) {
        const back = el('button', { type: 'button', class: 'isoclean-calculator-step-button' }, ...content);
        back.addEventListener('click', () => goTo(n));
        item.append(back);
      } else {
        item.append(el('span', { class: 'isoclean-calculator-step-button', 'aria-current': current ? 'step' : null }, ...content));
      }
      return item;
    }));
  }

  function panelHeading(text) {
    return el('h2', { class: 'isoclean-calculator-heading', tabindex: '-1', text });
  }

  function renderIndustries() {
    const list = el('ul', { class: 'isoclean-calculator-industries' });
    [...model.industries.keys()].forEach((name) => {
      const icon = config.icons.get(name.toLowerCase());
      const button = el('button', { type: 'button', class: 'isoclean-calculator-industry' }, icon ? icon.cloneNode(true) : null, el('span', { text: name }));
      button.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      button.addEventListener('click', () => {
        Object.assign(state, { industry: name, step: 2 });
        render(true);
      });
      list.append(el('li', {}, button));
    });
    return [panelHeading(texts['step-1']), list];
  }

  function renderEquipment() {
    const nodes = [panelHeading(texts['step-2'])];
    let n = 0;
    model.industries.get(state.industry).forEach((equipment, group) => {
      const list = el('ul', { class: 'isoclean-calculator-equipment' });
      equipment.forEach((components, name) => {
        n += 1;
        const listId = `${id}-components-${n}`;
        const toggle = el('button', {
          type: 'button', class: 'isoclean-calculator-equipment-toggle', 'aria-expanded': 'false', 'aria-controls': listId,
        }, name);
        const options = el('ul', { class: 'isoclean-calculator-components', id: listId, hidden: true });
        components.forEach((component) => {
          const choose = el('button', { type: 'button', class: 'isoclean-calculator-component', text: component.name });
          choose.addEventListener('click', () => {
            state.equipment = name;
            state.component = component;
            state.step = 3;
            render(true);
          });
          options.append(el('li', {}, choose));
        });
        toggle.addEventListener('click', () => {
          const open = toggle.getAttribute('aria-expanded') !== 'true';
          toggle.setAttribute('aria-expanded', String(open));
          options.hidden = !open;
        });
        list.append(el('li', {}, toggle, el('div', { class: 'isoclean-calculator-component-menu' }, el('p', { text: texts['component-prompt'] }), options)));
      });
      if (group) nodes.push(el('h3', { class: 'isoclean-calculator-group', text: group }));
      nodes.push(list);
    });
    return nodes;
  }

  function scenarioCard(env, scenario) {
    const details = el('dl', { class: 'isoclean-calculator-details' });
    scenario.details.forEach(({ term, detail }) => {
      details.append(el('div', {}, el('dt', { text: term }), el('dd', { text: detail })));
    });
    const select = el('button', { type: 'button', class: 'isoclean-calculator-select', text: texts['select-label'] });
    select.setAttribute('aria-label', `${texts['select-label']}: ${scenario.code}`);
    select.addEventListener('click', () => {
      state.environment = env;
      state.scenario = scenario;
      state.step = 4;
      render(true);
    });
    return el(
      'li',
      { class: 'isoclean-calculator-scenario' },
      el('div', { class: 'isoclean-calculator-scenario-head' }, el('h4', { class: 'isoclean-calculator-scenario-code', text: scenario.code }), select),
      details,
    );
  }

  function renderEnvironments() {
    const envs = [...model.environments.values()];
    const tablist = el('div', { class: 'isoclean-calculator-tabs', role: 'tablist', 'aria-label': texts['step-3'] });
    const panels = [];
    const tabs = envs.map((env, i) => {
      const tab = el('button', {
        type: 'button', role: 'tab', id: `${id}-tab-${env.id}`, class: `isoclean-calculator-tab isoclean-calculator-tab-${env.id}`, 'aria-controls': `${id}-tabpanel-${env.id}`, 'aria-selected': String(i === 0), tabindex: i === 0 ? '0' : '-1',
      }, env.label);
      const tabpanel = el(
        'div',
        {
          role: 'tabpanel', id: `${id}-tabpanel-${env.id}`, class: 'isoclean-calculator-tabpanel', 'aria-labelledby': tab.id, hidden: i !== 0,
        },
        env.heading ? el('h3', { class: 'isoclean-calculator-env-heading', text: env.heading }) : null,
        env.summary ? el('p', { class: 'isoclean-calculator-env-summary', text: env.summary }) : null,
        el('ul', { class: 'isoclean-calculator-scenarios' }, ...env.scenarios.map((s) => scenarioCard(env, s))),
      );
      panels.push(tabpanel);
      return tab;
    });
    const select = (index, focus) => {
      tabs.forEach((t, i) => {
        t.setAttribute('aria-selected', String(i === index));
        t.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i, false));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select((keys[e.key] + tabs.length) % tabs.length, true);
      });
      tablist.append(tab);
    });
    return [panelHeading(texts['step-3']), tablist, ...panels];
  }

  function renderResult() {
    const { target } = state.component;
    const current = state.scenario.code;
    const nodes = [];
    if (cells.intro) nodes.push(el('div', { class: 'isoclean-calculator-intro' }, ...cells.intro.cloneNode(true).childNodes));
    nodes.push(el(
      'div',
      { class: 'isoclean-calculator-codes' },
      codeBox('target', texts['target-label'], target, texts['code-caption'], '*', photoImg(model.targetPhotos.get(target), `${texts['target-label']} ${target}`)),
      codeBox('current', texts['current-label'], current, texts['code-caption'], '', photoImg(state.scenario.photo, `${texts['current-label']} ${current}`)),
    ));
    if (cells.note) nodes.push(el('div', { class: 'isoclean-calculator-note' }, ...cells.note.cloneNode(true).childNodes));
    const actions = el('div', { class: 'isoclean-calculator-actions' });
    if (cells['more-information']) actions.append(...cells['more-information'].cloneNode(true).childNodes);
    const restart = el('button', { type: 'button', class: 'isoclean-calculator-restart', text: texts['start-over'] });
    restart.addEventListener('click', () => goTo(1));
    actions.append(el('p', {}, restart));
    nodes.push(actions);
    if (cells.representative) nodes.push(el('div', { class: 'isoclean-calculator-representative' }, ...cells.representative.cloneNode(true).childNodes));
    if (cells.credit) nodes.push(el('div', { class: 'isoclean-calculator-credit' }, ...cells.credit.cloneNode(true).childNodes));
    return [el('h2', { class: 'isoclean-calculator-heading isoclean-calculator-result-heading', tabindex: '-1', text: `${texts['target-label']} ${target}` }), ...nodes];
  }

  render = (moveFocus) => {
    renderSteps();
    let content;
    if (state.step === 1) content = renderIndustries();
    else if (state.step === 2) content = renderEquipment();
    else if (state.step === 3) content = renderEnvironments();
    else content = renderResult();
    panel.replaceChildren(...content);
    block.classList.toggle('is-result', state.step === 4);
    if (moveFocus) {
      const heading = panel.querySelector('.isoclean-calculator-heading');
      heading?.focus({ preventScroll: true });
      block.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  render(false);
}
