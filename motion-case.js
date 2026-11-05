(() => {
  'use strict';
  const tr = s => (window.portfolioI18n ? window.portfolioI18n.t(s) : s);
  const lang = () => (window.portfolioI18n ? window.portfolioI18n.language : 'en');
  // "Action" already means "Ações" elsewhere on the site; the act is "Ação".
  const OWN = { Action: 'Ação' };
  const t = s => (lang() === 'pt' && OWN[s]) ? OWN[s] : tr(s);
  const ownNames = () => document.querySelectorAll('[data-act-name]').forEach(el => { el.textContent = t(el.dataset.actName); });
  window.addEventListener('portfolio-language-change', ownNames);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The nine acts, timed against the Pix Agendado test video (seconds).
  const ACTS = [
    ['Opening', 'The brand opens.', 0],
    ['Hook', 'The question that names the pain.', 0.33],
    ['Promise', 'One impact word.', 4.73],
    ['Path', 'Navigation to the feature.', 5.93],
    ['Action', 'Tap, drag, fill in, confirm.', 12.03],
    ['Processing', 'The system at work.', 21.03],
    ['Confirmation', 'The result on screen.', 23.53],
    ['Signature', 'The sentence that closes the story.', 25.13],
    ['Logo', 'The brand closes.', 27.73]
  ];
  const END = 28.88;
  const actAt = time => { let i = 0; ACTS.forEach((a, k) => { if (time >= a[2]) i = k; }); return i; };

  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  // A play / pause control on every framed video.
  function wireControl(frame) {
    const video = frame.querySelector('video');
    const button = frame.querySelector('.video-ctl');
    if (!video || !button) return;
    const sync = () => {
      button.innerHTML = video.paused ? playIcon : pauseIcon;
      button.setAttribute('aria-label', t(video.paused ? 'Play video' : 'Pause video'));
    };
    button.addEventListener('click', () => { frame.dataset.user = '1'; video.paused ? video.play() : video.pause(); });
    video.addEventListener('play', sync); video.addEventListener('pause', sync);
    sync();
  }

  // Hero: the act chip follows the video.
  const hero = document.querySelector('[data-acts-video="hero"]');
  if (hero) {
    const video = hero.querySelector('video');
    const chip = hero.querySelector('.act-chip');
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
    const paint = () => {
      const i = actAt(video.currentTime);
      chip.querySelector('b').textContent = i;
      chip.querySelector('span').textContent = t(ACTS[i][0]);
    };
    video.addEventListener('timeupdate', paint);
    window.addEventListener('portfolio-language-change', paint);
    wireControl(hero); paint();
  }

  // Test: a ribbon of acts that tracks and seeks the video.
  const test = document.querySelector('[data-acts-video="test"]');
  if (test) {
    const video = test.querySelector('video');
    const ribbon = document.querySelector('.ribbon');
    const now = document.querySelector('.act-now');
    const lines = [...document.querySelectorAll('.script li')];
    const buttons = ACTS.map((act, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      if (i === 0 || i === 8) b.classList.add('fixed');
      const next = i < 8 ? ACTS[i + 1][2] : END;
      b.style.setProperty('--w', Math.max(0.6, next - act[2]).toFixed(2));
      b.innerHTML = `<em>${i}</em><span></span>`;
      b.addEventListener('click', () => { video.currentTime = act[2] + 0.02; test.dataset.user = '1'; video.play(); });
      ribbon.appendChild(b);
      return b;
    });
    let last = -1;
    const label = () => buttons.forEach((b, i) => {
      b.querySelector('span').textContent = t(ACTS[i][0]);
      b.setAttribute('aria-label', `${t('Act')} ${i}: ${t(ACTS[i][0])}`);
    });
    const paint = force => {
      const time = video.currentTime;
      const i = actAt(time);
      buttons.forEach((b, k) => {
        const start = ACTS[k][2], end = k < 8 ? ACTS[k + 1][2] : END;
        b.style.setProperty('--fill', `${Math.max(0, Math.min(1, (time - start) / (end - start))) * 100}%`);
        b.classList.toggle('on', k === i);
      });
      if (i !== last || force) {
        last = i;
        now.innerHTML = `<b>${t('Act')} ${i} · ${t(ACTS[i][0])}.</b> ${t(ACTS[i][1])}`;
        lines.forEach(li => li.classList.toggle('on', Number(li.dataset.act) === i));
      }
    };
    video.addEventListener('timeupdate', () => paint());
    window.addEventListener('portfolio-language-change', () => { label(); paint(true); });
    label(); paint(true); wireControl(test);
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => entries.forEach(e => {
        if (test.dataset.user) return;
        if (e.isIntersecting) video.play().catch(() => {}); else video.pause();
      }), { threshold: .45 }).observe(test);
    }
  }

  // Validation: play the original and the recreation together.
  const both = document.getElementById('playBoth');
  if (both) both.addEventListener('click', () => {
    document.querySelectorAll('.vs video').forEach(v => { v.currentTime = 0; v.play().catch(() => {}); });
  });

  // Specimens: one control pauses every loop; they also rest when off screen.
  const grid = document.getElementById('specimens');
  const toggle = document.getElementById('specToggle');
  if (grid && toggle) {
    let held = false;
    const set = paused => {
      grid.classList.toggle('paused', paused);
      document.querySelector('.timeline')?.classList.toggle('paused-eq', paused);
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.querySelector('span').textContent = t(paused ? 'Play animations' : 'Pause animations');
      toggle.querySelector('svg').outerHTML = paused
        ? '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    };
    toggle.addEventListener('click', () => { held = !held; set(held); });
    window.addEventListener('portfolio-language-change', () => set(held));
    if (reduce) toggle.hidden = true;
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
