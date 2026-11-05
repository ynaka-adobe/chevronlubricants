/*
 * Adapted from ynaka-adobe/dupont tools/workfront/workfront.js and approval.js
 * (Apache-2.0), revision ebc0c90714f47aa690c88c3d4ffd6a399fe44ce0.
 * Chevron changes: scoped lifecycle, safe rendering, real status errors,
 * shared task completion/editing and injectable secure runtime transport.
 */

const PROJECT_STATUS = {
  CUR: { label: 'Current', color: '#2d9d78' },
  PLN: { label: 'Planning', color: '#1473e6' },
  CPL: { label: 'Complete', color: '#888' },
  DED: { label: 'Dead', color: '#c00' },
  ONH: { label: 'On Hold', color: '#e68619' },
};
const TASK_STATUS = {
  NEW: { label: 'New', color: '#1473e6' },
  INP: { label: 'In Progress', color: '#e68619' },
  CPL: { label: 'Complete', color: '#2d9d78' },
  ON_HOLD: { label: 'On Hold', color: '#888' },
};
const ISSUE_STATUS = {
  ...TASK_STATUS,
  RES: { label: 'Resolved', color: '#2d9d78' },
  ONH: { label: 'On Hold', color: '#888' },
  CLO: { label: 'Closed', color: '#888' },
  WFM: { label: "Won't Fix", color: '#c00' },
};
const APPROVAL_STATUS = {
  AA: { label: 'Approved', color: '#2d9d78' },
  RJ: { label: 'Rejected', color: '#d7373f' },
  AD: { label: 'Pending', color: '#e68619' },
  AU: { label: 'Recalled', color: '#888' },
};
const ISSUE_PRIORITY = { 0: 'None', 1: 'Urgent', 2: 'High', 3: 'Normal', 4: 'Low' };

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  if (!iso) return '—';
  const normalized = String(iso).replace(/T(\d{2}:\d{2}:\d{2}):(\d{3})/, 'T$1.$2');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(iso).slice(0, 10);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function percent(value) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function badge(status, map) {
  const { label, color } = map[status] || { label: status || '—', color: '#888' };
  return `<span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${esc(label)}</span>`;
}

function list(data) {
  if (!Array.isArray(data)) throw new Error('Workfront runtime returned an invalid list response.');
  return data;
}

function emptyState(msg) {
  return `<div class="empty-state"><p>${esc(msg)}</p></div>`;
}

function loading(target) {
  target.innerHTML = '<div class="spinner-wrap" role="status"><div class="spinner"></div><span>Loading…</span></div>';
}

function errorState(target, error) {
  target.innerHTML = `<p class="loading error" role="alert">${esc(error.message)}</p>`;
}

export async function buildApp(root, api, config, { mode = 'library' } = {}) {
  const controller = new AbortController();
  const { signal } = controller;
  let disposed = false;
  let currentProject = null;
  let activeFilter = 'member';
  let activeTab = 'tasks';
  let projects = [];
  let records = [];
  let projectRequest = 0;
  let recordRequest = 0;
  let panelRequest = 0;
  let cachedCurrentUser;
  const statusCache = new Map();
  const timers = new Set();
  let renderRecords;
  let openDetail;
  let editRecord;
  const shell = document.createElement('div');
  shell.className = 'app-shell';
  shell.innerHTML = `
    <header class="topbar">
      <span class="topbar-title">${mode === 'approval' ? 'Mark Task Complete' : 'Workfront Library'}</span>
      <div class="topbar-sep"></div>
      <span class="workspace-label">Projects</span>
      <a class="topbar-expand" target="_blank" rel="noopener noreferrer">Open Workfront ↗</a>
    </header>
    <nav class="sidebar" aria-label="Workfront projects">
      <div class="sidebar-heading">Projects</div>
      <div class="filter-bar">
        <button class="filter-btn active" data-filter="member">I'm On</button>
        <button class="filter-btn" data-filter="owner">I Own</button>
      </div>
      <div class="sidebar-list"></div>
    </nav>
    <section class="main">
      <div class="toolbar">
        <span class="toolbar-title">—</span><span class="toolbar-count"></span>
        <div class="tab-bar" role="tablist">
          <button class="tab-btn active" data-tab="tasks" role="tab" aria-selected="true">Tasks</button>
          ${mode === 'approval' ? '' : '<button class="tab-btn" data-tab="issues" role="tab" aria-selected="false">Issues</button><button class="tab-btn" data-tab="documents" role="tab" aria-selected="false">Documents</button>'}
        </div>
        <div class="search-wrap"><input class="search-input" type="search" placeholder="Search…" aria-label="Search records"></div>
        <button class="btn-new-task" hidden>New Task</button>
      </div>
      <div class="records-area"></div>
    </section>`;
  shell.querySelector('.topbar-expand').href = config.workfrontOrigin;
  root.replaceChildren(shell);
  const sidebarList = shell.querySelector('.sidebar-list');
  const recordsArea = shell.querySelector('.records-area');
  const searchInput = shell.querySelector('.search-input');
  const toolbarTitle = shell.querySelector('.toolbar-title');
  const toolbarCount = shell.querySelector('.toolbar-count');
  const newButton = shell.querySelector('.btn-new-task');
  recordsArea.innerHTML = emptyState('Select a project from the sidebar.');

  const panel = document.createElement('section');
  panel.className = 'detail-panel';
  panel.setAttribute('aria-label', 'Record details');
  panel.innerHTML = '<div class="detail-header"><span class="detail-name"></span><button class="btn-close" aria-label="Close details">×</button></div><div class="detail-body"></div>';
  root.append(panel);
  const panelBody = panel.querySelector('.detail-body');
  function closePanel() {
    panelRequest += 1;
    panel.classList.remove('open');
    panelBody.replaceChildren();
  }
  panel.querySelector('.btn-close').addEventListener('click', closePanel, { signal });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePanel();
      root.querySelector('.modal-overlay')?.remove();
    }
  }, { signal });

  function rowLink(kind, id) {
    return `${config.workfrontOrigin}/${kind}/${encodeURIComponent(id)}/details`;
  }

  async function loadRecords() {
    if (!currentProject || disposed) return;
    recordRequest += 1;
    const request = recordRequest;
    const project = currentProject;
    const tab = activeTab;
    records = [];
    toolbarCount.textContent = '';
    loading(recordsArea);
    try {
      const result = list(await api({ resource: tab, projectId: project.ID, limit: 200 }));
      if (disposed || request !== recordRequest) return;
      records = tab === 'tasks'
        ? [...result].sort((a, b) => Number(a.taskNumber) - Number(b.taskNumber)) : result;
      renderRecords();
    } catch (error) {
      if (!disposed && request === recordRequest) errorState(recordsArea, error);
    }
  }

  async function selectProject(project) {
    currentProject = project;
    searchInput.value = '';
    closePanel();
    sidebarList.querySelectorAll('.rt-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.id === project.ID);
    });
    toolbarTitle.textContent = project.name || '(Untitled)';
    newButton.hidden = activeTab === 'documents' || mode === 'approval';
    await loadRecords();
  }

  async function loadProjects() {
    projectRequest += 1;
    const request = projectRequest;
    recordRequest += 1;
    currentProject = null;
    projects = [];
    records = [];
    closePanel();
    newButton.hidden = true;
    toolbarTitle.textContent = '—';
    toolbarCount.textContent = '';
    recordsArea.innerHTML = emptyState('Select a project from the sidebar.');
    loading(sidebarList);
    try {
      const result = list(await api({ resource: 'projects', filter: activeFilter, limit: 200 }));
      if (disposed || request !== projectRequest) return;
      projects = result;
      sidebarList.replaceChildren();
      if (!projects.length) {
        sidebarList.innerHTML = emptyState('No projects found.');
        return;
      }
      projects.forEach((project) => {
        const item = document.createElement('button');
        const status = PROJECT_STATUS[project.status] || { label: project.status, color: '#888' };
        item.className = 'rt-item';
        item.dataset.id = project.ID;
        item.innerHTML = `<span class="rt-icon" style="background:${status.color}">${esc((project.name || '?').charAt(0).toUpperCase())}</span><span class="rt-name">${esc(project.name || '(Untitled)')}</span>`;
        item.title = status.label || '';
        item.addEventListener('click', () => selectProject(project), { signal });
        sidebarList.append(item);
      });
      await selectProject(projects[0]);
    } catch (error) {
      if (!disposed && request === projectRequest) errorState(sidebarList, error);
    }
  }

  renderRecords = () => {
    const query = searchInput.value.toLowerCase();
    const filtered = records.filter((record) => (record.name || '').toLowerCase().includes(query));
    toolbarCount.textContent = `(${records.length})`;
    recordsArea.replaceChildren();
    if (!filtered.length) {
      recordsArea.innerHTML = emptyState(query ? `No ${activeTab} match.` : `No ${activeTab} in this project.`);
      return;
    }
    const table = document.createElement('table');
    table.className = 'records-table';
    const headers = {
      tasks: ['#', 'Task Name', 'Assigned To', 'Due Date', '% Done', 'Status', ''],
      issues: ['Issue Name', 'Priority', 'Assigned To', 'Due Date', 'Entered By', 'Status', ''],
      documents: ['Name', 'Owner', 'Modified', 'Approval', ''],
    };
    table.innerHTML = `<thead><tr>${headers[activeTab].map((name) => `<th>${name}</th>`).join('')}</tr></thead>`;
    const tbody = document.createElement('tbody');
    filtered.forEach((record) => {
      const row = document.createElement('tr');
      if (activeTab === 'tasks') {
        row.innerHTML = `
          <td>${esc(record.taskNumber || '—')}</td>
          <td class="name-cell">${esc(record.name || '(Untitled)')}</td>
          <td>${esc(record.assignedTo?.name || '—')}</td>
          <td>${esc(formatDate(record.plannedCompletionDate))}</td>
          <td><div class="progress"><div style="width:${percent(record.percentComplete)}%"></div></div><span>${percent(record.percentComplete)}%</span></td>
          <td>${badge(record.status, TASK_STATUS)}</td><td class="action-cell"></td>`;
      } else if (activeTab === 'issues') {
        row.innerHTML = `
          <td class="name-cell">${esc(record.name || '(Untitled)')}</td>
          <td>${esc(ISSUE_PRIORITY[record.priority] || '—')}</td>
          <td>${esc(record.assignedTo?.name || '—')}</td>
          <td>${esc(formatDate(record.plannedCompletionDate))}</td>
          <td>${esc(record.enteredBy?.name || '—')}</td>
          <td>${badge(record.status, ISSUE_STATUS)}</td><td class="action-cell"></td>`;
      } else {
        row.innerHTML = `
          <td class="name-cell">${esc(record.name || '(Untitled)')}</td>
          <td>${esc(record.owner?.name || '—')}</td>
          <td>${esc(formatDate(record.lastModDate))}</td>
          <td>${record.approvalProcesses?.length ? '<span class="badge badge--blue">Has approval</span>' : '—'}</td>
          <td class="action-cell"></td>`;
      }
      const details = document.createElement('button');
      details.className = 'btn-view';
      details.textContent = 'Details';
      details.addEventListener('click', (event) => {
        event.stopPropagation();
        openDetail(record);
      }, { signal });
      row.querySelector('.action-cell').append(details);
      row.addEventListener('click', () => openDetail(record), { signal });
      if (activeTab === 'tasks' && mode === 'approval' && record.status !== 'CPL') {
        const complete = document.createElement('button');
        complete.className = 'btn-complete';
        complete.textContent = 'Complete';
        complete.addEventListener('click', async (event) => {
          event.stopPropagation();
          complete.disabled = true;
          complete.textContent = 'Updating…';
          try {
            await api({ resource: 'update_task', taskId: record.ID, status: 'CPL', percentComplete: 100 });
            if (!disposed) await loadRecords();
          } catch (error) {
            if (!disposed && complete.isConnected) {
              complete.disabled = false;
              complete.textContent = 'Complete';
              const message = document.createElement('p');
              message.className = 'error';
              message.setAttribute('role', 'alert');
              message.textContent = error.message;
              row.querySelector('.action-cell').append(message);
            }
          }
        }, { signal });
        row.querySelector('.action-cell').append(complete);
      }
      tbody.append(row);
    });
    table.append(tbody);
    recordsArea.append(table);
  };

  function field(label, value) {
    return `<div class="detail-field"><div class="detail-field-label">${esc(label)}</div><div class="detail-field-value">${esc(value || '—')}</div></div>`;
  }

  openDetail = async (record) => {
    panelRequest += 1;
    const request = panelRequest;
    const tab = activeTab;
    const kind = { documents: 'document', tasks: 'task', issues: 'issue' }[tab];
    panel.querySelector('.detail-name').textContent = record.name || '(Untitled)';
    panel.classList.add('open');
    panelBody.innerHTML = `
      <a class="detail-open" href="${esc(rowLink(kind, record.ID))}" target="_blank" rel="noopener noreferrer">Open in Workfront ↗</a>
      ${field('Project', currentProject?.name)}
      ${field(tab === 'documents' ? 'Owner' : 'Assigned To', record.owner?.name || record.assignedTo?.name)}
      ${field(tab === 'documents' ? 'Last Modified' : 'Due Date', formatDate(record.lastModDate || record.plannedCompletionDate))}
      ${record.description ? field('Description', record.description) : ''}
      <div class="detail-edit"></div>`;
    const edit = panelBody.querySelector('.detail-edit');
    if (tab === 'documents') {
      edit.innerHTML = '<div class="detail-section-title">Approvals</div><div class="approval-list"></div>';
      const approvalList = edit.querySelector('.approval-list');
      if (!record.currentVersionID) {
        approvalList.innerHTML = emptyState('No current document version available. Approval information unavailable.');
        return;
      }
      loading(approvalList);
      try {
        const reviewers = list(await api({ resource: 'approval', docVersionId: record.currentVersionID }));
        if (disposed || request !== panelRequest) return;
        approvalList.innerHTML = reviewers.length ? reviewers.map((reviewer) => `
          <div class="approval-row">
            <div class="approval-reviewer">${esc(reviewer.reviewer?.name || reviewer.reviewer?.emailAddr || '—')}</div>
            ${badge(reviewer.approverDecision || reviewer.status, APPROVAL_STATUS)}
            ${reviewer.reviewDate ? `<div class="approval-date">${esc(formatDate(reviewer.reviewDate))}</div>` : ''}
          </div>`).join('') : emptyState('No approvals on this version.');
      } catch (error) {
        if (!disposed && request === panelRequest) errorState(approvalList, error);
      }
      return;
    }
    loading(edit);
    try {
      if (!statusCache.has(tab)) {
        const statuses = list(await api({ resource: tab === 'tasks' ? 'task_statuses' : 'issue_statuses' }));
        if (!statuses.length || statuses.some((status) => !status.key || !status.label)) {
          throw new Error('Workfront status options unavailable. Editing is disabled; ask the administrator to check permissions.');
        }
        statusCache.set(tab, statuses);
      }
      if (disposed || request !== panelRequest) return;
      editRecord(edit, record, tab, statusCache.get(tab));
    } catch (error) {
      if (!disposed && request === panelRequest) errorState(edit, error);
    }
  };

  function peoplePicker(target, initial = {}, withMe = true) {
    let selectedId = initial.ID ?? null;
    let searchRequest = 0;
    let timer;
    const wrapper = document.createElement('div');
    wrapper.className = 'people-picker';
    wrapper.innerHTML = `
      <div class="modal-assign-row">
        <span class="modal-assignee-chip" hidden></span>
        <button type="button" class="clear-assignee" hidden aria-label="Remove assignee">×</button>
        ${withMe ? '<button type="button" class="modal-assign-me">Assign to me</button>' : ''}
      </div>
      <input class="modal-input" type="search" placeholder="Search people…" aria-label="Search people">
      <div class="user-results"></div><p class="picker-error error" role="alert"></p>`;
    const chip = wrapper.querySelector('.modal-assignee-chip');
    const clear = wrapper.querySelector('.clear-assignee');
    const input = wrapper.querySelector('input');
    const results = wrapper.querySelector('.user-results');
    const error = wrapper.querySelector('.picker-error');
    function choose(user) {
      selectedId = user?.ID ?? null;
      chip.textContent = user?.name || user?.emailAddr || '';
      chip.hidden = !selectedId;
      clear.hidden = !selectedId;
      input.value = '';
      results.replaceChildren();
    }
    choose(initial);
    clear.addEventListener('click', () => choose(null), { signal });
    const me = wrapper.querySelector('.modal-assign-me');
    me?.addEventListener('click', async () => {
      me.disabled = true;
      error.textContent = '';
      try {
        if (!cachedCurrentUser) {
          const result = await api({ resource: 'current_user' });
          cachedCurrentUser = Array.isArray(result) ? result[0] : result;
          if (!cachedCurrentUser?.ID) throw new Error('Current Workfront user unavailable.');
        }
        if (!disposed && wrapper.isConnected) choose(cachedCurrentUser);
      } catch (err) {
        if (!disposed && wrapper.isConnected) error.textContent = err.message;
      } finally {
        me.disabled = false;
      }
    }, { signal });
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timers.delete(timer);
      searchRequest += 1;
      const request = searchRequest;
      const query = input.value.trim();
      results.replaceChildren();
      error.textContent = '';
      if (!query) return;
      timer = setTimeout(async () => {
        timers.delete(timer);
        loading(results);
        try {
          const users = list(await api({ resource: 'search_users', query }));
          if (disposed || !wrapper.isConnected || request !== searchRequest) return;
          results.replaceChildren();
          users.forEach((user) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'user-result-item';
            item.innerHTML = `<strong>${esc(user.name)}</strong> <span>${esc(user.emailAddr || '')}</span>`;
            item.addEventListener('click', () => choose(user), { signal });
            results.append(item);
          });
          if (!users.length) results.innerHTML = emptyState('No results.');
        } catch (err) {
          if (!disposed && wrapper.isConnected && request === searchRequest) {
            errorState(results, err);
          }
        }
      }, 300);
      timers.add(timer);
    }, { signal });
    target.append(wrapper);
    return () => selectedId;
  }

  editRecord = (target, record, tab, statuses) => {
    const form = document.createElement('form');
    form.className = 'edit-form';
    form.innerHTML = `
      <label class="modal-field"><span class="modal-label">Status</span><select class="modal-input" name="status"></select></label>
      ${tab === 'tasks' ? '<label class="modal-field"><span class="modal-label">% Complete</span><input class="modal-input" name="percentComplete" type="number" min="0" max="100" required></label>' : '<div class="modal-field"><span class="modal-label">Assigned To</span><div class="assignment"></div></div>'}
      <p class="modal-error" role="alert"></p>
      <div class="detail-footer"><button class="modal-btn-primary" type="submit">Save</button><button class="modal-btn-cancel" type="button">Cancel</button></div>`;
    const select = form.elements.status;
    const options = [...statuses];
    if (!options.some((status) => status.key === record.status)) {
      options.unshift({ key: record.status || '', label: `${record.status || 'Unknown'} (current)` });
    }
    options.forEach((status) => {
      const option = document.createElement('option');
      option.value = status.key;
      option.textContent = status.label;
      select.append(option);
    });
    select.value = record.status || '';
    if (tab === 'tasks') form.elements.percentComplete.value = percent(record.percentComplete);
    const selectedUser = tab === 'issues' ? peoplePicker(form.querySelector('.assignment'), record.assignedTo) : null;
    form.querySelector('.modal-btn-cancel').addEventListener('click', closePanel, { signal });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      const error = form.querySelector('.modal-error');
      const params = tab === 'tasks'
        ? { resource: 'update_task', taskId: record.ID }
        : { resource: 'update_issue', issueId: record.ID };
      if (select.value !== record.status) params.status = select.value;
      if (tab === 'tasks' && Number(form.elements.percentComplete.value) !== percent(record.percentComplete)) {
        params.percentComplete = Number(form.elements.percentComplete.value);
      }
      if (tab === 'issues' && selectedUser() !== (record.assignedTo?.ID ?? null)) {
        params.assignedToID = selectedUser();
      }
      if (Object.keys(params).length === 2) {
        error.textContent = 'No changes to save.';
        return;
      }
      button.disabled = true;
      button.textContent = 'Saving…';
      error.textContent = '';
      try {
        await api(params);
        if (!disposed && form.isConnected) {
          closePanel();
          await loadRecords();
        }
      } catch (err) {
        if (!disposed && form.isConnected) {
          error.textContent = err.message;
          button.disabled = false;
          button.textContent = 'Save';
        }
      }
    }, { signal });
    target.replaceChildren(form);
  };

  function openNewModal() {
    if (!currentProject || activeTab === 'documents' || mode === 'approval') return;
    const project = currentProject;
    const task = activeTab === 'tasks';
    const noun = task ? 'Task' : 'Issue';
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <form class="modal" role="dialog" aria-modal="true" aria-label="New ${noun}">
        <div class="modal-header"><span class="modal-icon">${task ? '✓' : '!'}</span><h2 class="modal-title">New ${noun}</h2></div>
        <div class="modal-body">
          <label class="modal-field"><span class="modal-label">${noun} Name *</span><input class="modal-input" name="name" placeholder="${noun} Name" autocomplete="off" required></label>
          <label class="modal-field"><span class="modal-label">Description</span><textarea class="modal-textarea" name="description" maxlength="4000" placeholder="Description"></textarea><span class="modal-charcount">0/4000</span></label>
          <div class="modal-field modal-row">
            ${task ? '<label class="modal-field"><span class="modal-label">Duration (Days)</span><input class="modal-input" name="duration" type="number" min="1" value="1" required></label>' : '<label class="modal-field"><span class="modal-label">Priority</span><select class="modal-input" name="priority"><option value="3">Normal</option><option value="1">Urgent</option><option value="2">High</option><option value="4">Low</option><option value="0">None</option></select></label>'}
            <label class="modal-field"><span class="modal-label">Planned Completion Date</span><input class="modal-input" name="plannedCompletionDate" type="date"></label>
          </div>
          <div class="modal-field"><span class="modal-label">Assignments</span><div class="assignment"></div></div>
        </div>
        <div class="modal-footer"><p class="modal-error" role="alert"></p><button class="modal-btn-primary" type="submit">Create ${noun.toLowerCase()}</button><button class="modal-btn-cancel" type="button">Cancel</button></div>
      </form>`;
    root.append(overlay);
    const form = overlay.querySelector('form');
    const getAssignee = peoplePicker(form.querySelector('.assignment'));
    const { name } = form.elements;
    name.focus();
    form.elements.description.addEventListener('input', () => {
      form.querySelector('.modal-charcount').textContent = `${form.elements.description.value.length}/4000`;
    }, { signal });
    const close = () => {
      overlay.remove();
      newButton.focus();
    };
    form.querySelector('.modal-btn-cancel').addEventListener('click', close, { signal });
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); }, { signal });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!name.value.trim()) {
        name.classList.add('modal-input-error');
        name.focus();
        return;
      }
      const button = form.querySelector('[type="submit"]');
      const error = form.querySelector('.modal-error');
      const params = {
        resource: task ? 'create_task' : 'create_issue',
        name: name.value.trim(),
        projectId: project.ID,
      };
      if (form.elements.description.value.trim()) {
        params.description = form.elements.description.value.trim();
      }
      if (form.elements.plannedCompletionDate.value) {
        params.plannedCompletionDate = form.elements.plannedCompletionDate.value;
      }
      if (task) params.duration = Number(form.elements.duration.value);
      else params.priority = Number(form.elements.priority.value);
      if (getAssignee()) params.assignedToID = getAssignee();
      button.disabled = true;
      button.textContent = 'Creating…';
      error.textContent = '';
      try {
        await api(params);
        if (!disposed && form.isConnected) {
          close();
          if (currentProject?.ID === project.ID) await loadRecords();
        }
      } catch (err) {
        if (!disposed && form.isConnected) {
          error.textContent = err.message;
          button.disabled = false;
          button.textContent = `Create ${noun.toLowerCase()}`;
        }
      }
    }, { signal });
  }

  newButton.addEventListener('click', openNewModal, { signal });
  searchInput.addEventListener('input', renderRecords, { signal });
  shell.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.tab === activeTab) return;
      activeTab = button.dataset.tab;
      shell.querySelectorAll('.tab-btn').forEach((tab) => {
        const active = tab.dataset.tab === activeTab;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      searchInput.value = '';
      closePanel();
      newButton.hidden = !currentProject || activeTab === 'documents' || mode === 'approval';
      newButton.textContent = activeTab === 'issues' ? 'New Issue' : 'New Task';
      if (currentProject) loadRecords();
    }, { signal });
  });
  shell.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.filter === activeFilter) return;
      activeFilter = button.dataset.filter;
      shell.querySelectorAll('.filter-btn').forEach((filter) => filter.classList.toggle('active', filter === button));
      loadProjects();
    }, { signal });
  });
  await loadProjects();
  return {
    dispose() {
      disposed = true;
      controller.abort();
      timers.forEach((timer) => clearTimeout(timer));
      root.replaceChildren();
    },
  };
}
