(() => {
  'use strict';
  // Slider demo: replays the drag from the screen recording, then lets the visitor try.
  const root = document.getElementById('sliderDemo');
  if (!root) return;
  const q = s => root.querySelector(s);
  const t = text => (window.portfolioI18n ? window.portfolioI18n.t(text) : text);
  const lang = () => (window.portfolioI18n ? window.portfolioI18n.language : 'en');
  const money = v => Number(v).toLocaleString(lang() === 'pt' ? 'pt-BR' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TARGET = 76600; // Platinum went from R$ 3,200 to R$ 79,800.
  const EXACT = 28862;  // 1416 value that closes the total.
  const prods = {};
  root.querySelectorAll('.sd-prod').forEach(el => {
    prods[el.dataset.k] = {el, min: +el.dataset.min, max: +el.dataset.max, v: +el.dataset.v, track: el.querySelector('.sd-track'), num: el.querySelector('.sd-num')};
  });
  const uni = prods.uni;
  const phone = q('.sd-phone'), finger = q('.sd-finger'), calls = q('.sd-calls'), call = q('.sd-call');
  const sumL = q('.sd-sum-l'), sumV = q('.sd-sum-v');
  // The app's slider moves in R$ 100 steps from the minimum (every value in the recording fits).
  const snap = v => Math.max(uni.min, Math.min(uni.max, uni.min + Math.round((v - uni.min) / 100) * 100));

  // Recording, compressed: [seconds, 1416 value, finger down].
  const keys = [[0,105462,0],[2.4,105462,0],[2.8,105462,1],[5.6,29388,1],[6.6,29388,1],[7.2,27988,1],[8.2,27988,1],[8.6,29388,1],[9.2,29088,1],[9.6,29088,0],[10.4,29088,1],[11,26088,1],[11.6,29088,1],[12,29988,1],[12.5,29388,1],[12.9,29388,0],[13.79,29388,0],[13.8,EXACT,0],[17,EXACT,0]];
  const END = 17;
  const chapters = [
    {at: 0, target: 'foot', text: 'The Platinum card went up to R$ 79,800. Now R$ 76,600 has to come out of the other products.'},
    {at: 2.4, target: 'track', text: 'Each point of the track is worth about R$ 250. A fingertip covers thousands of reais.'},
    {at: 6.6, target: 'foot', text: 'It went past the mark. Now the screen asks to increase R$ 874.'},
    {at: 8.2, target: 'track', text: 'The slider moves in R$ 100 steps from R$ 17,988. R$ 28,862 isn’t one of them.', small: 'Steps inferred from the values in the recording.'},
    {at: 13.8, target: 'foot', text: 'The exact amount only came from outside the slider. The total closes and the button turns on.'}
  ];
  const chapterButtons = [...root.querySelectorAll('.sd-chapters button')];
  const playButton = q('.sd-play'), tryButton = q('.sd-try');
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  let time = 0, playing = false, last = 0, trying = false, attempts = 0, current = null, lastSign = null, dragging = false;
  const callState = {text: '', small: '', target: 'foot'};

  const paintProduct = p => {
    p.track.style.setProperty('--p', ((p.v - p.min) / (p.max - p.min)).toFixed(4));
    p.num.textContent = money(p.v);
  };
  const paintFooter = () => {
    const rest = uni.v - EXACT;
    const sign = Math.sign(rest);
    root.classList.toggle('balanced', sign === 0);
    root.classList.toggle('unbalanced', sign !== 0);
    if (sign === 0) { sumL.textContent = t('Total transfer'); sumV.textContent = 'R$ ' + money(TARGET); }
    else {
      sumL.innerHTML = `${t(sign > 0 ? 'Value above total,' : 'Value below total,')} <em>${t(sign > 0 ? 'decrease:' : 'increase:')}</em>`;
      sumV.textContent = 'R$ ' + money(Math.abs(rest));
    }
    if (lastSign !== null && sign !== lastSign) { root.classList.remove('sd-flash'); void root.offsetWidth; root.classList.add('sd-flash'); }
    lastSign = sign;
  };
  const center = (el, box) => { const r = el.getBoundingClientRect(); return {x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top}; };
  const placeCall = () => {
    const el = callState.target === 'track' ? uni.track : q('.sd-sum');
    call.style.setProperty('--y', center(el, calls.getBoundingClientRect()).y + 'px');
  };
  const say = (text, small, target) => {
    if (callState.text === text && callState.small === small) return placeCall();
    Object.assign(callState, {text, small: small || '', target});
    call.classList.remove('on');
    call.innerHTML = t(text) + (small ? `<small>${t(small)}</small>` : '');
    placeCall();
    requestAnimationFrame(() => call.classList.add('on'));
  };
  const placeFinger = down => {
    finger.classList.toggle('on', !!down);
    uni.el.classList.toggle('drag', !!down);
    const c = center(uni.el.querySelector('.sd-knob'), phone.getBoundingClientRect());
    finger.style.left = c.x + 'px'; finger.style.top = c.y + 'px';
  };
  const ease = x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
  const valueAt = s => {
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1][0] <= s) i++;
    const [t0, v0, f0] = keys[i], [t1, v1] = keys[i + 1];
    const k = t1 > t0 ? Math.min(1, Math.max(0, (s - t0) / (t1 - t0))) : 1;
    // Keyframe values come straight from the recording; only in-between values use the slider's steps.
    const v = k <= 0 ? v0 : k >= 1 ? v1 : snap(v0 + (v1 - v0) * ease(k));
    return {v, down: f0 && (k < 1 || keys[i + 1][2])};
  };
  const render = () => {
    const {v, down} = valueAt(time);
    uni.v = v; paintProduct(uni); paintFooter(); placeFinger(down);
    let idx = 0;
    chapters.forEach((c, i) => { if (time >= c.at) idx = i; });
    chapterButtons.forEach((b, i) => {
      const start = chapters[i].at, end = chapters[i + 1] ? chapters[i + 1].at : END;
      b.style.setProperty('--p', Math.max(0, Math.min(1, (time - start) / (end - start))).toFixed(3));
      b.classList.toggle('on', i === idx);
    });
    if (idx !== current || !call.classList.contains('on')) { current = idx; const c = chapters[idx]; say(c.text, c.small, c.target); }
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

  // Try it yourself: the same slider, the same steps.
  const tryText = () => say(attempts >= 3 ? 'Still off? Tap Adjust automatically.' : 'Drag the Uniclass Black slider until the footer closes the total.', `${t('Attempts:')} ${attempts}`, 'track');
  const startTrying = () => {
    pause(); trying = true; attempts = 0; lastSign = null;
    root.classList.add('trying'); tryButton.setAttribute('aria-pressed', 'true');
    chapterButtons.forEach(b => { b.classList.remove('on'); b.style.setProperty('--p', 0); });
    uni.v = 105462; paintProduct(uni); paintFooter(); placeFinger(false); tryText();
  };
  function stopTrying() { trying = false; root.classList.remove('trying'); tryButton.setAttribute('aria-pressed', 'false'); }
  tryButton.setAttribute('aria-pressed', 'false');
  tryButton.addEventListener('click', () => (trying ? (stopTrying(), time = 0, current = null, render()) : startTrying()));
  const fromPointer = e => {
    const r = uni.track.getBoundingClientRect();
    uni.v = snap(uni.min + Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (uni.max - uni.min));
    paintProduct(uni); paintFooter(); placeFinger(true);
  };
  uni.track.parentElement.addEventListener('pointerdown', e => {
    if (!trying || e.target.closest('.sd-auto') || !e.target.closest('.sd-track,.sd-mm,.sd-val')) return;
    dragging = true; uni.track.setPointerCapture?.(e.pointerId); fromPointer(e); e.preventDefault();
  });
  uni.track.parentElement.addEventListener('pointermove', e => { if (dragging) fromPointer(e); });
  const release = () => {
    if (!dragging) return;
    dragging = false; placeFinger(false); attempts++;
    uni.v === EXACT ? say('Closed. Only possible because you landed exactly on it.', '', 'foot') : tryText();
  };
  uni.track.parentElement.addEventListener('pointerup', release);
  uni.track.parentElement.addEventListener('pointercancel', release);
  uni.el.querySelector('.sd-auto').addEventListener('click', () => {
    if (!trying) return;
    uni.v = EXACT; paintProduct(uni); paintFooter();
    say('Closed, but only with the button. Dragging never gets there.', `${t('Attempts:')} ${attempts}`, 'foot');
  });

  const paintStatic = () => {
    root.querySelectorAll('[data-n]').forEach(n => { n.textContent = money(n.dataset.n); });
    Object.values(prods).forEach(paintProduct);
  };
  paintStatic(); syncPlay(); render();
  addEventListener('resize', () => { placeCall(); placeFinger(finger.classList.contains('on')); });
  addEventListener('portfolio-language-change', () => {
    paintStatic(); syncPlay(); lastSign = null;
    const text = callState.text, small = callState.small; callState.text = '';
    trying ? tryText() : (paintFooter(), say(text, small, callState.target));
  });

  // Plays once when it comes into view.
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { io.disconnect(); setTimeout(() => !trying && time === 0 && play(), 400); } }, {threshold: .55});
    io.observe(phone);
  }
})();
