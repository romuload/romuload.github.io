(() => {
  'use strict';
  // Slider demo: one goal in three acts. Two linked cards, then the overdraft limit joins and the sliders stop compensating.
  const root = document.getElementById('sliderDemo');
  if (!root) return;
  const q = s => root.querySelector(s);
  const t = text => (window.portfolioI18n ? window.portfolioI18n.t(text) : text);
  const lang = () => (window.portfolioI18n ? window.portfolioI18n.language : 'en');
  const money = v => Number(v).toLocaleString(lang() === 'pt' ? 'pt-BR' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Real values from the screen recording.
  const BASE = {plat: 3200, uni: 105462, ldc: 5730};
  const TOTAL = BASE.plat + BASE.uni + BASE.ldc;
  const EXACT = {uni: 96462, ldc: 4730}; // R$ 9,000 and R$ 1,000 out.
  // Each maximum is the product's own limit plus what the others have available.
  const MAX2 = {plat: 90674, uni: 108462};
  const MAX3 = {plat: 95904, uni: 113692};
  const prods = {};
  root.querySelectorAll('.sd-prod').forEach(el => {
    prods[el.dataset.k] = {k: el.dataset.k, el, min: +el.dataset.min, max: +el.dataset.max, v: +el.dataset.v,
      track: el.querySelector('.sd-track'), num: el.querySelector('.sd-num'), maxEl: el.querySelector('.sd-max'), pen: el.querySelector('.sd-pen')};
  });
  const {plat, uni, ldc} = prods;
  const phone = q('.sd-phone'), finger = q('.sd-finger'), calls = q('.sd-calls'), call = q('.sd-call'), list = q('.sd-list');
  const sumL = q('.sd-sum-l'), sumV = q('.sd-sum-v');
  // The app's sliders move in R$ 100 steps from the minimum.
  const snap = (p, v) => Math.max(p.min, Math.min(p.max, p.min + Math.round((v - p.min) / 100) * 100));
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
  const smooth = x => x * x * (3 - 2 * x);

  const T = {two: 3, ldc: 9, three: 12};
  const END = 34;
  // [start, end, product, from, to]
  const moves = [
    [3.6, 6.6, 'plat', 3200, 13200],
    [12.4, 14.6, 'plat', 3200, 13200],
    [15.8, 18.2, 'uni', 105462, 96488], [19, 19.8, 'uni', 96488, 96388], [20.4, 21.2, 'uni', 96388, 96488],
    [22.8, 24.8, 'ldc', 5730, 4800], [25.4, 26, 'ldc', 4800, 4700], [26.6, 27.2, 'ldc', 4700, 4800], [27.8, 28.3, 'ldc', 4800, 4700]
  ];
  // Taps on the pencil: [time, product, typed value].
  const taps = [[29.4, 'uni', EXACT.uni], [30.8, 'ldc', EXACT.ldc]];
  // List scroll inside the phone: [start, end, element to bring into view].
  const scrolls = [[9.4, 10.4, 'ldc'], [11.2, 11.8, null], [15, 15.6, 'uni'], [22, 22.6, 'ldc']];
  const chapters = [
    {at: 0, target: 'goal', text: 'The customer starts from a goal: R$ 10,000 more on the Platinum card.'},
    {at: T.two, target: 'plat', text: 'With two cards, the sliders were linked. Raising the Platinum by R$ 10,000 lowered the Uniclass Black by the same amount.', small: 'The total always closed, so the button was always ready.'},
    {at: T.ldc, target: 'ldc', text: 'Then the overdraft limit joined the screen. With three products, the sliders stopped moving together.'},
    {at: T.three, target: 'foot', text: 'Same goal. The Platinum goes up R$ 10,000, and now that amount has to come out of the other products by hand.'},
    {at: 15.6, target: 'uni', text: 'R$ 9,000 from the Uniclass Black means R$ 96,462. The slider only stops at R$ 96,388 or R$ 96,488.', small: 'It moves in R$ 100 steps from R$ 17,988, the amount in use.'},
    {at: 22.4, target: 'ldc', text: 'R$ 1,000 from the overdraft limit means R$ 4,730. That amount isn’t on the slider either, so the total misses by R$ 4.'},
    {at: 29, target: 'foot', text: 'The exact amounts only came from typing them in with the pencil. Then the total closes and the button turns on.'}
  ];
  const chapterButtons = [...root.querySelectorAll('.sd-chapters button')];
  const playButton = q('.sd-play'), tryButton = q('.sd-try');
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  let time = 0, playing = false, last = 0, trying = false, attempts = 0, current = null, lastSign = null, drag = null, three = true;
  const callState = {text: '', small: '', target: 'foot'};

  const paintProduct = p => {
    p.track.style.setProperty('--p', clamp((p.v - p.min) / (p.max - p.min)).toFixed(4));
    p.num.textContent = money(p.v);
  };
  const setMode = isThree => {
    three = isThree;
    root.classList.toggle('three', isThree);
    const m = isThree ? MAX3 : MAX2;
    [plat, uni].forEach(p => { p.max = m[p.k]; p.maxEl.textContent = money(p.max); });
  };
  const paintFooter = () => {
    const diff = three ? plat.v + uni.v + ldc.v - TOTAL : 0;
    const sign = Math.sign(diff);
    const moved = Object.values(prods).reduce((sum, p) => sum + Math.max(0, p.v - BASE[p.k]), 0);
    root.classList.toggle('balanced', sign === 0 && moved > 0);
    root.classList.toggle('unbalanced', sign !== 0);
    if (sign === 0) { sumL.textContent = t('Total transfer'); sumV.textContent = 'R$ ' + money(moved); }
    else {
      sumL.innerHTML = `${t(sign > 0 ? 'Value above total,' : 'Value below total,')} <em>${t(sign > 0 ? 'decrease:' : 'increase:')}</em>`;
      sumV.textContent = 'R$ ' + money(Math.abs(diff));
    }
    if (lastSign !== null && sign !== lastSign) { root.classList.remove('sd-flash'); void root.offsetWidth; root.classList.add('sd-flash'); }
    lastSign = sign;
  };
  const center = (el, box) => { const r = el.getBoundingClientRect(); return {x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top}; };
  const targetEl = k => (k === 'foot' ? q('.sd-sum') : k === 'goal' ? null : prods[k].track);
  const placeCall = () => {
    const el = targetEl(callState.target);
    call.style.setProperty('--y', (el ? center(el, calls.getBoundingClientRect()).y : 60) + 'px');
  };
  const say = (text, small, target) => {
    if (callState.text === text && callState.small === (small || '')) { callState.target = target; return placeCall(); }
    Object.assign(callState, {text, small: small || '', target});
    call.classList.remove('on');
    call.innerHTML = t(text) + (small ? `<small>${t(small)}</small>` : '');
    placeCall();
    requestAnimationFrame(() => call.classList.add('on'));
  };
  let fingerAt = {k: 'plat', at: 'knob'};
  const placeFinger = (down, k = fingerAt.k, at = 'knob') => {
    fingerAt = {k, at};
    finger.classList.toggle('on', !!down);
    Object.values(prods).forEach(p => p.el.classList.toggle('drag', !!down && at === 'knob' && p.k === k));
    // The phone is scaled as a whole (CSS zoom), so screen pixels are divided back into its own units.
    const el = at === 'pen' ? prods[k].pen : prods[k].el.querySelector('.sd-knob');
    const c = center(el, phone.getBoundingClientRect()), z = phone.getBoundingClientRect().width / phone.offsetWidth || 1;
    finger.style.left = c.x / z + 'px'; finger.style.top = c.y / z + 'px';
  };
  // Scroll that brings an element's bottom edge into view (null goes back to the top).
  const scrollGoal = k => {
    if (!k) return 0;
    const el = prods[k].el;
    return Math.max(0, el.offsetTop + el.offsetHeight - list.offsetTop - list.clientHeight + 8);
  };
  const scrollAt = s => {
    let y = 0;
    for (const [a, b, k] of scrolls) { if (s < a) break; y += (scrollGoal(k) - y) * smooth(clamp((s - a) / (b - a))); }
    return y;
  };

  const stateAt = s => {
    const v = {...BASE};
    let active = null, down = false, at = 'knob';
    const isThree = s >= T.ldc;
    for (const [a, b, k, from, to] of moves) {
      if (isThree && a < T.ldc) continue;
      if (s < a) break;
      const x = clamp((s - a) / (b - a));
      v[k] = x >= 1 ? to : snap(prods[k], from + (to - from) * ease(x));
      if (x < 1) { active = k; down = true; }
    }
    for (const [a, k, val] of taps) {
      if (s >= a + .4) v[k] = val;
      if (s >= a && s < a + .6) { active = k; down = true; at = 'pen'; }
    }
    if (!isThree) v.uni = BASE.uni - (v.plat - BASE.plat); // Two cards: linked sliders.
    return {v, isThree, active, down, at};
  };

  const render = () => {
    const st = stateAt(time);
    setMode(st.isThree);
    ldc.el.style.setProperty('--in', st.isThree ? smooth(clamp((time - T.ldc) / .9)).toFixed(3) : 0);
    root.classList.toggle('goal-focus', time < T.two);
    Object.values(prods).forEach(p => { p.v = st.v[p.k]; paintProduct(p); });
    list.scrollTop = scrollAt(time);
    paintFooter();
    placeFinger(st.down, st.active || fingerAt.k, st.at);
    let idx = 0;
    chapters.forEach((c, i) => { if (time >= c.at) idx = i; });
    chapterButtons.forEach((b, i) => {
      const start = chapters[i].at, end = chapters[i + 1] ? chapters[i + 1].at : END;
      b.style.setProperty('--p', clamp((time - start) / (end - start)).toFixed(3));
      b.classList.toggle('on', i === idx);
    });
    const c = chapters[idx];
    if (idx !== current || !call.classList.contains('on')) { current = idx; say(c.text, c.small, c.target); }
    else placeCall();
  };
  const syncPlay = () => {
    playButton.innerHTML = playing ? pauseIcon : playIcon;
    playButton.setAttribute('aria-label', t(playing ? 'Pause demo' : 'Play demo'));
  };
  const tick = now => {
    if (!playing) return;
    time = Math.min(END, time + (now - last) / 1000); last = now;
    render();
    if (time >= END) { playing = false; syncPlay(); return; }
    requestAnimationFrame(tick);
  };
  const play = () => {
    if (trying) stopTrying();
    if (time >= END) time = 0;
    playing = true; last = performance.now(); syncPlay(); requestAnimationFrame(tick);
  };
  const pause = () => { playing = false; syncPlay(); };
  playButton.addEventListener('click', () => (playing ? pause() : play()));
  chapterButtons.forEach((b, i) => b.addEventListener('click', () => { if (trying) stopTrying(); time = chapters[i].at; current = null; render(); play(); }));

  // Try it yourself: Platinum already at the goal; the visitor takes R$ 9,000 and R$ 1,000 from the others.
  const tryText = () => say(attempts >= 3 ? 'Still off? Tap Adjust automatically.' : 'Take R$ 9,000 from the Uniclass Black and R$ 1,000 from the overdraft limit. Drag until the footer closes the total.', `${t('Attempts:')} ${attempts}`, 'uni');
  const startTrying = () => {
    pause(); trying = true; attempts = 0; lastSign = null;
    root.classList.add('trying'); root.classList.remove('goal-focus'); tryButton.setAttribute('aria-pressed', 'true');
    chapterButtons.forEach(b => { b.classList.remove('on'); b.style.setProperty('--p', 0); });
    setMode(true); ldc.el.style.setProperty('--in', 1);
    plat.v = BASE.plat + 10000; uni.v = BASE.uni; ldc.v = BASE.ldc;
    Object.values(prods).forEach(paintProduct); paintFooter();
    list.scrollTop = scrollGoal('ldc');
    placeFinger(false, 'uni'); tryText();
  };
  function stopTrying() { trying = false; drag = null; root.classList.remove('trying'); tryButton.setAttribute('aria-pressed', 'false'); }
  tryButton.setAttribute('aria-pressed', 'false');
  tryButton.addEventListener('click', () => (trying ? (stopTrying(), time = 0, current = null, render()) : startTrying()));
  const fromPointer = (p, e) => {
    const r = p.track.getBoundingClientRect();
    p.v = snap(p, p.min + clamp((e.clientX - r.left) / r.width) * (p.max - p.min));
    paintProduct(p); paintFooter(); placeFinger(true, p.k);
  };
  [uni, ldc].forEach(p => {
    const box = p.track.parentElement;
    box.addEventListener('pointerdown', e => {
      if (!trying || e.target.closest('.sd-auto') || !e.target.closest('.sd-track,.sd-mm,.sd-val')) return;
      drag = p; p.track.setPointerCapture?.(e.pointerId); fromPointer(p, e); e.preventDefault();
    });
    box.addEventListener('pointermove', e => { if (drag === p) fromPointer(p, e); });
    const release = () => {
      if (drag !== p) return;
      drag = null; placeFinger(false, p.k); attempts++;
      plat.v + uni.v + ldc.v === TOTAL ? say('Closed. Only possible because you landed exactly on it.', '', 'foot') : tryText();
    };
    box.addEventListener('pointerup', release);
    box.addEventListener('pointercancel', release);
    p.el.querySelector('.sd-auto').addEventListener('click', () => {
      if (!trying) return;
      const goal = TOTAL - (plat.v + uni.v + ldc.v - p.v);
      if (goal < p.min || goal > p.max) return say('This product can’t close the total on its own. Adjust the other one first.', `${t('Attempts:')} ${attempts}`, p.k);
      p.v = goal; paintProduct(p); paintFooter();
      say('Closed, but only with the button. Dragging never gets there.', `${t('Attempts:')} ${attempts}`, 'foot');
    });
  });

  const paintStatic = () => {
    root.querySelectorAll('[data-n]').forEach(n => { n.textContent = money(n.dataset.n); });
    setMode(three);
    Object.values(prods).forEach(paintProduct);
  };
  paintStatic(); syncPlay(); render();
  addEventListener('resize', () => { placeCall(); placeFinger(finger.classList.contains('on'), fingerAt.k, fingerAt.at); });
  addEventListener('portfolio-language-change', () => {
    paintStatic(); syncPlay(); lastSign = null;
    const text = callState.text, small = callState.small; callState.text = '';
    trying ? (paintFooter(), tryText()) : (paintFooter(), say(text, small, callState.target));
  });

  // Plays once when it comes into view.
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { io.disconnect(); setTimeout(() => !trying && time === 0 && play(), 400); } }, {threshold: .45});
    io.observe(phone);
  }
})();

(() => {
  'use strict';
  // Context demo: from the card's limits hub, one tap opens the transfer already set up.
  const root = document.getElementById('contextDemo');
  if (!root) return;
  const q = s => root.querySelector(s);
  const t = text => (window.portfolioI18n ? window.portfolioI18n.t(text) : text);
  const lang = () => (window.portfolioI18n ? window.portfolioI18n.language : 'en');
  const money = v => Number(v).toLocaleString(lang() === 'pt' ? 'pt-BR' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const phone = q('.sd-phone'), finger = q('.sd-finger'), calls = q('.sd-calls'), call = q('.sd-call');
  const row = q('.cx-transfer'), cta = q('.cx-cta');
  const END = 13;
  // Each chapter: start, what the callout points at, text.
  const chapters = [
    {at: 0, el: '.cx-transfer', text: 'The customer is in the Uniclass Black limits hub. Transfer limits already shows R$ 8,230: the most the other products can give.'},
    {at: 3.4, el: '.cx-title', text: 'The card they came from is already the receiver, in the title and in the footer.'},
    {at: 6.5, el: '.cx-donors', text: 'Donors come in with the most they can give: R$ 3,000 from the Platinum card and R$ 5,230 from the overdraft limit.'},
    {at: 9.5, el: '.cx-foot', text: 'New limit: R$ 113,692, the same total the slider couldn’t close. One tap to confirm.'}
  ];
  // Finger taps: [start, end, element].
  const taps = [[2.4, 3.0, row], [11.0, 11.5, cta]];
  const buttons = [...root.querySelectorAll('.cx-chapters button')];
  const play = q('.cx-play');
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  let time = 0, playing = false, last = 0, current = -1, hl = null;

  const paint = () => root.querySelectorAll('[data-n]').forEach(n => { n.textContent = money(n.dataset.n); });
  const place = () => {
    const c = chapters[Math.max(0, current)], el = q(c.el);
    const r = el.getBoundingClientRect(), box = calls.getBoundingClientRect();
    call.style.setProperty('--y', (r.top + r.height / 2 - box.top) + 'px');
  };
  const say = i => {
    current = i;
    call.classList.remove('on');
    call.textContent = t(chapters[i].text);
    hl?.classList.remove('cx-hl'); hl = q(chapters[i].el); hl.classList.add('cx-hl');
    requestAnimationFrame(() => { place(); call.classList.add('on'); });
  };
  const render = () => {
    root.classList.toggle('on-new', time >= 3.2);
    // The new screen scrolls above its fixed footer, as in the app: title first, then the donors.
    const k = Math.max(0, Math.min(1, (time - 6.3) / .6)), sc = q('.cx-scroll');
    sc.scrollTop = Math.max(0, q('.cx-label').offsetTop - sc.offsetTop - 4) * k * k * (3 - 2 * k);
    let idx = 0;
    chapters.forEach((c, i) => { if (time >= c.at) idx = i; });
    if (idx !== current) say(idx);
    buttons.forEach((b, i) => {
      const s = chapters[i].at, e = chapters[i + 1] ? chapters[i + 1].at : END;
      b.style.setProperty('--p', Math.max(0, Math.min(1, (time - s) / (e - s))).toFixed(3));
      b.classList.toggle('on', i === idx);
    });
    const tap = taps.find(([s, e]) => time >= s && time < e);
    row.classList.toggle('press', !!tap && tap[2] === row);
    cta.classList.toggle('press', !!tap && tap[2] === cta);
    finger.classList.toggle('on', !!tap);
    if (tap) {
      const r = tap[2].getBoundingClientRect(), p = phone.getBoundingClientRect(), z = p.width / phone.offsetWidth || 1;
      finger.style.left = (r.left + r.width * .45 - p.left) / z + 'px';
      finger.style.top = (r.top + r.height / 2 - p.top) / z + 'px';
    }
  };
  const sync = () => { play.innerHTML = playing ? pauseIcon : playIcon; play.setAttribute('aria-label', t(playing ? 'Pause demo' : 'Play demo')); };
  const tick = now => {
    if (!playing) return;
    time = Math.min(END, time + (now - last) / 1000); last = now; render();
    if (time >= END) { playing = false; sync(); return; }
    requestAnimationFrame(tick);
  };
  const start = () => { if (time >= END) time = 0; playing = true; last = performance.now(); sync(); requestAnimationFrame(tick); };
  play.addEventListener('click', () => (playing ? (playing = false, sync()) : start()));
  buttons.forEach((b, i) => b.addEventListener('click', () => { time = chapters[i].at; render(); start(); }));

  paint(); sync(); render();
  addEventListener('resize', place);
  addEventListener('portfolio-language-change', () => { paint(); sync(); const i = current; current = -1; say(i); });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); setTimeout(() => time === 0 && start(), 400); } }, {threshold: .55});
    io.observe(phone);
  }
})();

(() => {
  'use strict';
  // Variants A/B/C: the same customer and values, each with its own interaction.
  const root = document.getElementById('variants');
  if (!root) return;
  const t = text => (window.portfolioI18n ? window.portfolioI18n.t(text) : text);
  const lang = () => (window.portfolioI18n ? window.portfolioI18n.language : 'en');
  const money = v => Number(v).toLocaleString(lang() === 'pt' ? 'pt-BR' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const CURRENT = 105462;
  const paintStatic = () => root.querySelectorAll('[data-n]').forEach(n => { n.textContent = money(n.dataset.n); });

  // A · slider: every product moves, the footer balances against the total.
  const a = root.querySelector('.vr-a');
  const sliders = [...a.querySelectorAll('.vr-sl')].map(el => {
    const s = {el, v: +el.dataset.v, start: +el.dataset.v, min: +el.dataset.min, max: +el.dataset.max, input: el.querySelector('input'), track: el.querySelector('.sd-track'), num: el.querySelector('.sd-num')};
    s.input.value = s.v;
    s.input.addEventListener('input', () => { s.v = +s.input.value; paintA(); });
    return s;
  });
  const TOTAL = sliders.reduce((sum, s) => sum + s.start, 0);
  function paintA() {
    sliders.forEach(s => {
      s.track.style.setProperty('--p', ((s.v - s.min) / (s.max - s.min)).toFixed(4));
      s.num.textContent = money(s.v);
      s.input.setAttribute('aria-valuetext', 'R$ ' + money(s.v));
    });
    const rest = sliders.reduce((sum, s) => sum + s.v, 0) - TOTAL;
    const moved = sliders.reduce((sum, s) => sum + Math.max(0, s.v - s.start), 0);
    const ok = rest === 0 && moved > 0;
    a.classList.toggle('balanced', ok);
    a.classList.toggle('unbalanced', rest !== 0);
    a.querySelector('.vr-btn').disabled = !ok;
    const label = a.querySelector('.sd-sum-l'), value = a.querySelector('.sd-sum-v');
    if (rest === 0) { label.textContent = t('Total transfer'); value.textContent = 'R$ ' + money(moved); }
    else {
      label.innerHTML = `${t(rest > 0 ? 'Value above total,' : 'Value below total,')} <em>${t(rest > 0 ? 'decrease:' : 'increase:')}</em>`;
      value.textContent = 'R$ ' + money(Math.abs(rest));
    }
  }

  // B and C · donors at the maximum; the footer adds what each one gives.
  const setups = ['b', 'c'].map(kind => {
    const screen = root.querySelector('.vr-' + kind);
    const donors = [...screen.querySelectorAll('.vr-donor')].map(el => ({el, max: +el.dataset.max, name: el.dataset.name, v: +el.dataset.max, on: true}));
    const paint = () => {
      donors.forEach(d => {
        d.el.classList.toggle('off', !d.on);
        d.el.querySelector('.vr-amt').textContent = money(d.v);
        d.el.querySelector('.vr-rem').textContent = money(d.max - d.v + (d.name.includes('6984') ? 200 : 500));
      });
      const sum = donors.reduce((s, d) => s + (d.on ? d.v : 0), 0);
      screen.querySelector('.vr-new').textContent = money(CURRENT + sum);
      screen.querySelector('.vr-btn').disabled = sum === 0;
    };
    return {kind, screen, donors, paint};
  });
  const [b, c] = setups;
  b.donors.forEach(d => d.el.querySelector('input').addEventListener('change', e => { d.on = e.target.checked; b.paint(); }));

  // C · the pencil opens an adjustment screen, as in the app.
  const edit = c.screen.querySelector('.vr-edit'), field = edit.querySelector('input'), err = edit.querySelector('.vr-edit-err');
  let editing = null, opener = null;
  const parse = text => { const digits = String(text).replace(/[^\d,.]/g, '').replace(lang() === 'pt' ? /\./g : /,/g, '').replace(',', '.'); return digits === '' ? NaN : Math.round(parseFloat(digits)); };
  c.donors.forEach(d => d.el.querySelector('.vr-pen').addEventListener('click', e => {
    editing = d; opener = e.currentTarget;
    edit.querySelector('.vr-edit-from').textContent = d.name.includes('6984') ? d.name : t('Overdraft limit');
    edit.querySelector('.vr-edit-max').textContent = money(d.max);
    field.value = money(d.v); err.textContent = '';
    c.screen.classList.add('editing');
    setTimeout(() => { field.focus(); field.select(); }, 260);
  }));
  field.addEventListener('input', () => { err.textContent = ''; });
  const close = () => { c.screen.classList.remove('editing'); opener?.focus(); };
  edit.querySelector('.vr-ok').addEventListener('click', () => {
    const v = parse(field.value);
    if (Number.isNaN(v)) { err.textContent = t('Enter an amount.'); return; }
    if (v > editing.max) { err.textContent = `${t('The most you can transfer is R$')} ${money(editing.max)}`; return; }
    editing.v = v; editing.on = v > 0; c.paint(); close();
  });
  field.addEventListener('keydown', e => { if (e.key === 'Enter') edit.querySelector('.vr-ok').click(); if (e.key === 'Escape') close(); });
  edit.querySelector('.cx-back').addEventListener('click', close);

  const paintAll = () => { paintStatic(); paintA(); b.paint(); c.paint(); };
  paintAll();
  addEventListener('portfolio-language-change', paintAll);
})();
