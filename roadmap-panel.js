(() => {
  'use strict';
  // Concept demo: example data, no real tool connected. The published side only changes after an approval.
  const root = document.getElementById('roadmapPanel');
  if (!root) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t = text => (window.portfolioI18n ? window.portfolioI18n.t(text) : text);
  const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
  const STATUSES = ['Delivered', 'Planned', 'No status'];
  const SITE = () => [
    { id: 'nfse', name: 'NFS-e: national layout', q: 'Q1', status: 'Planned' },
    { id: 'cbs', name: 'CBS: assessment report', q: 'Q2', status: 'Planned' },
    { id: 'split', name: 'Split payment: simulation', q: 'Q2', status: 'Planned' },
    { id: 'dere', name: 'DeRE: file generation', q: 'Q3', status: 'No status' },
    { id: 'ibs', name: 'IBS: calculation rules', q: 'Q4', status: 'No status' }
  ];
  const PROPOSALS = () => [
    { id: 'nfse', q: 'Q1', status: 'Delivered', reason: 'All tasks closed in the project tool.' },
    { id: 'cbs', q: 'Q3', status: 'Planned', reason: 'The tax authority moved this deadline.' },
    { id: 'dere', q: 'Q3', status: 'Planned', reason: 'A delivery date was added to the project.' }
  ];

  const rail = [...root.querySelectorAll('.ap-rail li')];
  const queue = root.querySelector('.ap-queue');
  const board = root.querySelector('.ap-board');
  const log = root.querySelector('.ap-log');
  const updated = root.querySelector('.ap-updated');
  const live = root.querySelector('.ap-live');
  const again = root.querySelector('.ap-again');
  let site, proposals, phase, shown, changes, touched, lastLive, timers = [], started = false;

  const reset = () => {
    timers.forEach(clearTimeout);
    timers = [];
    site = SITE();
    proposals = PROPOSALS().map(item => ({ ...item, aiQ: item.q, aiStatus: item.status, state: 'pending' }));
    phase = 'idle'; shown = 0; changes = []; touched = false; lastLive = '';
  };
  const itemOf = id => site.find(item => item.id === id);
  const pending = () => proposals.slice(0, shown).filter(item => item.state === 'pending');
  const statusClass = status => `s-${status.toLowerCase().replace(' ', '-')}`;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const today = date => date.toLocaleDateString(window.portfolioI18n && window.portfolioI18n.language === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const paintRail = () => {
    const step = { idle: -1, collect: 0, propose: 1, review: 2, done: 3 }[phase];
    rail.forEach((node, index) => {
      node.classList.toggle('now', index === step);
      node.classList.toggle('past', index < step);
      if (index === step) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
    });
  };

  const change = (from, to) => {
    const line = el('p', 'ap-change');
    const before = el('span', 'ap-before', from);
    const arrow = el('span', 'ap-arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    line.append(before, arrow, el('b', '', to));
    return line;
  };
  const chips = (proposal, key, values, label) => {
    const group = el('div', 'ap-chips');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `${t(label)}: ${t(itemOf(proposal.id).name)}`);
    group.append(el('span', 'ap-chips-label', t(label)));
    values.forEach(value => {
      const button = el('button', 'ap-chip', t(value));
      button.type = 'button';
      button.dataset.id = proposal.id; button.dataset.key = key; button.dataset.value = value;
      button.setAttribute('aria-pressed', String(proposal[key] === value));
      group.append(button);
    });
    return group;
  };

  const renderQueue = () => {
    queue.textContent = '';
    if (phase === 'collect') {
      const reading = el('div', 'ap-reading');
      reading.append(el('i'), el('p', '', t('Reading the project tool…')));
      queue.append(reading);
      return;
    }
    proposals.slice(0, shown).forEach(proposal => {
      const item = itemOf(proposal.id);
      if (proposal.state !== 'pending') {
        const row = el('div', `ap-done ${proposal.state}`);
        row.append(el('i'), el('span', '', t(item.name)), el('b', '', t(proposal.state === 'approved' ? 'Published' : 'Rejected')));
        queue.append(row);
        return;
      }
      // One decision at a time, so the published side stays in view next to it.
      if (proposal !== pending()[0]) {
        const row = el('div', 'ap-waiting');
        row.append(el('i'), el('span', '', t(item.name)), el('b', '', t('Waiting')));
        queue.append(row);
        return;
      }
      const card = el('article', 'ap-card');
      const head = el('div', 'ap-card-head');
      head.append(el('h4', '', t(item.name)));
      if (proposal.q !== proposal.aiQ || proposal.status !== proposal.aiStatus) head.append(el('span', 'ap-edited', t('Adjusted by you')));
      card.append(head, el('p', 'ap-reason', t(proposal.reason)));
      const diff = el('div', 'ap-diff');
      if (proposal.status !== item.status) diff.append(change(t(item.status), t(proposal.status)));
      if (proposal.q !== item.q) diff.append(change(item.q, proposal.q));
      if (!diff.children.length) diff.append(el('p', 'ap-change', t('No change')));
      card.append(diff, chips(proposal, 'status', STATUSES, 'Status'), chips(proposal, 'q', QUARTERS, 'Move to'));
      const actions = el('div', 'ap-actions');
      const approve = el('button', 'ap-approve', t('Approve'));
      approve.type = 'button'; approve.dataset.approve = proposal.id;
      approve.setAttribute('aria-label', `${t('Approve')}: ${t(item.name)}`);
      const reject = el('button', 'ap-reject', t('Reject'));
      reject.type = 'button'; reject.dataset.reject = proposal.id;
      reject.setAttribute('aria-label', `${t('Reject')}: ${t(item.name)}`);
      actions.append(approve, reject);
      card.append(actions);
      queue.append(card);
    });
    if (phase === 'done') {
      queue.append(el('p', 'ap-finished', t('All reviewed. Only what you approved reached the website.')));
    }
  };

  const renderSite = flashId => {
    // Remember where each item was, so a change of quarter travels on screen.
    const before = new Map([...board.querySelectorAll('[data-item]')].map(node => [node.dataset.item, node.getBoundingClientRect()]));
    board.textContent = '';
    QUARTERS.forEach(quarter => {
      const column = el('div', 'ap-col');
      column.append(el('h5', '', quarter));
      const list = el('ul');
      site.filter(item => item.q === quarter).forEach(item => {
        const row = el('li', statusClass(item.status));
        row.dataset.item = item.id;
        row.append(el('span', 'ap-name', t(item.name)), el('span', 'ap-status', t(item.status)));
        if (item.id === flashId) row.classList.add('flash');
        list.append(row);
      });
      column.append(list);
      board.append(column);
    });
    if (!reduce) board.querySelectorAll('[data-item]').forEach(node => {
      const old = before.get(node.dataset.item);
      if (!old) return;
      const now = node.getBoundingClientRect();
      const dx = old.left - now.left, dy = old.top - now.top;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) node.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
    });
    updated.textContent = `${t('Last updated')}: ${touched ? t('today') : today(new Date(2026, 9, 28))}`;
    log.textContent = '';
    if (!changes.length) { log.append(el('li', 'ap-empty', t('No changes published yet.'))); return; }
    changes.slice().reverse().forEach(entry => {
      const row = el('li');
      const parts = [];
      if (entry.fromStatus !== entry.toStatus) parts.push(`${t(entry.fromStatus)} → ${t(entry.toStatus)}`);
      if (entry.fromQ !== entry.toQ) parts.push(`${entry.fromQ} → ${entry.toQ}`);
      row.append(el('b', '', t(entry.name)), el('span', '', parts.join(' · ')), el('small', '', t(entry.reason)));
      log.append(row);
    });
  };

  const render = flashId => { paintRail(); renderQueue(); renderSite(flashId); again.hidden = phase === 'idle' || phase === 'collect'; };
  const announce = text => { lastLive = text; live.textContent = text; };
  const after = (ms, fn) => timers.push(setTimeout(fn, reduce ? 0 : ms));

  const start = () => {
    phase = 'collect'; render();
    after(1300, () => {
      phase = 'propose';
      const next = () => {
        shown += 1; render();
        if (shown < proposals.length) after(450, next);
        else after(350, () => { phase = 'review'; render(); announce(t('Three changes are waiting for your review.')); });
      };
      next();
    });
  };

  const focusNext = () => {
    const next = queue.querySelector('[data-approve]') || again;
    next.focus({ preventScroll: true });
  };
  const settle = () => { if (!pending().length && shown === proposals.length) phase = 'done'; };

  root.addEventListener('click', event => {
    const chip = event.target.closest('.ap-chip');
    if (chip) {
      const proposal = proposals.find(item => item.id === chip.dataset.id);
      proposal[chip.dataset.key] = chip.dataset.value;
      render();
      queue.querySelector(`.ap-chip[data-id="${chip.dataset.id}"][data-key="${chip.dataset.key}"][data-value="${chip.dataset.value}"]`).focus({ preventScroll: true });
      return;
    }
    const approve = event.target.closest('[data-approve]');
    if (approve) {
      const proposal = proposals.find(item => item.id === approve.dataset.approve);
      const item = itemOf(proposal.id);
      const moved = item.status !== proposal.status || item.q !== proposal.q;
      if (moved) changes.push({ name: item.name, reason: proposal.reason, fromStatus: item.status, toStatus: proposal.status, fromQ: item.q, toQ: proposal.q });
      item.status = proposal.status; item.q = proposal.q;
      proposal.state = 'approved';
      if (moved) touched = true;
      settle(); render(proposal.id);
      announce(`${t(item.name)}: ${t('Published')}`);
      focusNext();
      return;
    }
    const reject = event.target.closest('[data-reject]');
    if (reject) {
      const proposal = proposals.find(item => item.id === reject.dataset.reject);
      proposal.state = 'rejected';
      settle(); render();
      announce(`${t(itemOf(proposal.id).name)}: ${t('Rejected')}`);
      focusNext();
      return;
    }
    if (event.target.closest('.ap-again')) {
      reset(); start();
      queue.setAttribute('tabindex', '-1');
      queue.focus({ preventScroll: true });
    }
  });
  window.addEventListener('portfolio-language-change', () => { render(); if (lastLive) live.textContent = ''; });

  reset(); render();
  const begin = () => { if (!started) { started = true; start(); } };
  if ('IntersectionObserver' in window && !reduce) {
    const watcher = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { watcher.disconnect(); begin(); } }, { threshold: .3 });
    watcher.observe(root);
  } else begin();
})();
