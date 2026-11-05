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
    // The hero video rests once it leaves the screen, unless the visitor took control of it.
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (hero.dataset.user) return;
        if (entry.isIntersecting) video.play().catch(() => {}); else video.pause();
      }).observe(hero);
    }
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

  // Specimens rest while off screen, so scrolling stays smooth.
  if (grid && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => grid.classList.toggle('resting', !entry.isIntersecting), { rootMargin: '10% 0px' }).observe(grid);
  }

  // The agent: the Teams window plays the conversation step by step, in sync with the list.
  const demo = document.getElementById('agentDemo');
  if (demo) {
    const feed = demo.querySelector('.tm-feed');
    const body = demo.querySelector('.tm-body');
    const typing = feed.querySelector('.typing');
    const msgs = [...feed.querySelectorAll('.msg')];
    const steps = [...document.querySelectorAll('#agentSteps li')];
    const toggle = document.getElementById('agentToggle');
    const replay = document.getElementById('agentReplay');
    const scroll = () => requestAnimationFrame(() => {
      const off = Math.max(0, feed.scrollHeight - body.clientHeight);
      feed.style.transform = `translateY(${-off}px)`;
    });
    const mark = n => steps.forEach((li, k) => { li.classList.toggle('done', k < n - 1); li.classList.toggle('now', k === n - 1); });
    const show = m => {
      typing.classList.remove('in');
      m.classList.add('in');
      if (m.dataset.s) mark(Number(m.dataset.s));
      scroll();
    };
    const type = m => { feed.insertBefore(typing, m); typing.classList.add('in'); scroll(); };
    const seq = [];
    msgs.forEach(m => {
      const bot = m.classList.contains('bot');
      if (bot) { seq.push([700, () => type(m)]); seq.push([900, () => show(m)]); }
      else seq.push([900, () => show(m)]);
      m.querySelectorAll('tbody tr').forEach(tr => seq.push([380, () => { tr.classList.add('in'); scroll(); }]));
      const pick = m.querySelector('[data-pick]');
      if (pick) seq.push([1000, () => pick.classList.add('on')]);
      if (m.classList.contains('gen')) seq.push([2700, () => {}]);
    });
    seq.push([600, () => { steps.forEach(li => { li.classList.remove('now'); li.classList.add('done'); }); }]);
    seq.push([5000, () => reset()]);
    let i = 0, timer = 0, paused = false, visible = false, held = false;
    const run = () => {
      clearTimeout(timer);
      if (paused || held || !visible) return;
      if (i >= seq.length) i = 0;
      const [wait, fn] = seq[i];
      timer = setTimeout(() => { fn(); i += 1; run(); }, wait);
    };
    const reset = () => {
      msgs.forEach(m => m.classList.remove('in'));
      feed.querySelectorAll('tr.in').forEach(tr => tr.classList.remove('in'));
      feed.querySelectorAll('[data-pick]').forEach(p => p.classList.remove('on'));
      typing.classList.remove('in');
      steps.forEach(li => li.classList.remove('now', 'done'));
      feed.style.transform = 'none';
      i = 0;
    };
    const label = () => {
      toggle.setAttribute('aria-pressed', String(held));
      toggle.querySelector('span').textContent = t(held ? 'Play conversation' : 'Pause conversation');
      toggle.querySelector('svg').outerHTML = held
        ? '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    };
    toggle.addEventListener('click', () => { held = !held; label(); run(); });
    replay.addEventListener('click', () => { clearTimeout(timer); reset(); held = false; label(); run(); });
    window.addEventListener('portfolio-language-change', () => { label(); scroll(); });
    if (reduce) {
      msgs.forEach(m => m.classList.add('in'));
      feed.querySelectorAll('tbody tr').forEach(tr => tr.classList.add('in'));
      feed.querySelectorAll('[data-pick]').forEach(p => p.classList.add('on'));
      steps.forEach(li => li.classList.add('done'));
      body.style.overflowY = 'auto';
      toggle.closest('.tm-ctl').hidden = true;
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => entries.forEach(e => { visible = e.isIntersecting; if (visible) run(); else clearTimeout(timer); }), { threshold: .35 }).observe(demo);
    } else { visible = true; run(); }
    label();
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Chapter bar and reading progress, as in the other cases. These do not depend on GSAP.
  const nav = document.querySelector('.case-nav');
  const navRow = nav.querySelector('.wrap');
  const links = [...nav.querySelectorAll('a')];
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const bar = nav.querySelector('.reading-progress');
  let current = null, queued = false;
  const setChapter = id => {
    if (id === current) return;
    current = id;
    links.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
        // Narrow screens: keep the active tab visible without moving the page.
        const row = navRow.getBoundingClientRect(), tab = link.getBoundingClientRect();
        navRow.scrollTo({ left: navRow.scrollLeft + tab.left - row.left - (row.width - tab.width) / 2, behavior: reduce ? 'auto' : 'smooth' });
      } else link.removeAttribute('aria-current');
    });
  };
  const updateProgress = () => {
    queued = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${total > 0 ? Math.min(1, window.scrollY / total) : 0})`;
    const line = window.innerHeight * .35;
    let id = null;
    for (const section of chapters) if (section.getBoundingClientRect().top <= line) id = section.dataset.chapter;
    setChapter(id);
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  window.addEventListener('resize', updateProgress);
  window.addEventListener('portfolio-language-change', updateProgress);
  updateProgress();

  // Scroll motion follows the other cases. Without GSAP or with reduced motion, the page stays static and complete.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // ScrollTrigger needs instant scrolling; in-page links scroll smoothly via JS.
  const html = document.documentElement;
  html.style.scrollBehavior = 'auto';
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    const behavior = reduce ? 'auto' : 'smooth';
    const pad = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
    let tries = 0;
    const go = () => {
      target.scrollIntoView({ behavior });
      clearTimeout(go.timer);
      go.timer = setTimeout(() => {
        if (Math.abs(target.getBoundingClientRect().top - pad) > 24 && ++tries < 4) go();
      }, 900);
    };
    go();
    history.replaceState(null, '', location.pathname + location.search + link.getAttribute('href'));
  });

  let lastHeight = 0, refreshTimer = null;
  new ResizeObserver(() => {
    const height = document.documentElement.scrollHeight;
    if (Math.abs(height - lastHeight) < 2) return;
    lastHeight = height;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(document.body);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const root = document.documentElement;
    root.classList.add('motion');
    const all = selector => [...document.querySelectorAll(selector)];

    // Cascading reveal. A long jump can enter many items at once, so the cascade has a ceiling.
    const items = all('.mc-head>*,.glance>div>*,.mc-tldr>div,.cols2>div,.strip>figure,.spec,.spec-ctl,.acts>li,.rules,.vs-ctl,.m-card,.m-arrow,.layer-card,.script,.ribbon,.beyond>.shot,.verdict,.app-card,.chat-bar,.msg,.agent-grid>div>h3,.steps>li,.prompt,.prompt-note,.edit-grid>div:first-child,.timeline,.cmp tr,.tbars,.seen,.learn,.mc-final h2,.mc-final .lead,.mc-final .mc-actions,.mc-final .source-note');
    items.forEach(node => node.classList.add('rv'));
    ScrollTrigger.batch(items, { start: 'top 88%', once: true, onEnter: batch => gsap.to(batch, {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: Math.min(.08, .6 / batch.length), overwrite: true,
      onComplete() { this.targets().forEach(node => { node.classList.remove('rv'); gsap.set(node, { clearProps: 'opacity,transform' }); }); }
    }) });

    // The Itaú keyword: it lands in orange, larger, then settles into the sentence.
    // Scaled only on entry and only as far as the line allows, so it never widens the page.
    all('.mc-head h2 .kw').forEach(word => {
      const heading = word.closest('h2');
      ScrollTrigger.create({ trigger: heading, start: 'top 88%', once: true, onEnter: () => {
        const box = word.getBoundingClientRect();
        const room = (heading.getBoundingClientRect().right - box.left) / box.width;
        gsap.fromTo(word, { scale: Math.max(1, Math.min(1.5, room)), opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1, delay: .2, ease: 'power3.out', clearProps: 'transform,opacity' });
      } });
    });

    // Framed videos open like the bank's orange screen: from a squircle to the full frame.
    all('.vs .float-screen,[data-acts-video="test"]').forEach((frame, i) => gsap.fromTo(frame,
      { clipPath: 'inset(22% 22% 22% 22% round 48px)' },
      { clipPath: 'inset(-30% -30% -30% -30% round 20px)', duration: 1.2, delay: frame.closest('.vs') ? i * .12 : 0, ease: 'power3.inOut', clearProps: 'clipPath',
        scrollTrigger: { trigger: frame, start: 'top 85%', once: true } }));

    // Hero: copy and video drift apart as the page leaves it.
    const leave = { trigger: '.mc-hero', start: 'top top', end: 'bottom top', scrub: .6 };
    gsap.to('.mc-hero .float-screen', { y: -56, ease: 'none', scrollTrigger: leave });
    gsap.to('.mc-hero-grid>div:first-child', { y: 40, ease: 'none', scrollTrigger: leave });

    // Numbers count up when they appear, reading the text only then so the language is settled.
    const counters = all('.glance strong,.big-stat strong').filter(node => /\d/.test(node.textContent)).map(node => {
      const count = { v: 0 };
      let source = '', value = 0;
      const tween = gsap.to(count, { v: 1, duration: 1.4, ease: 'power2.out', paused: true,
        onUpdate() { node.textContent = node.textContent.replace(/\d+/, Math.round(count.v * value)); },
        onComplete() { node.textContent = window.portfolioI18n ? window.portfolioI18n.t(source) : source; } });
      ScrollTrigger.create({ trigger: node, start: 'top 88%', once: true, onEnter: () => {
        source = node.textContent;
        value = +source.match(/\d+/)[0];
        tween.play();
      } });
      return tween;
    });

    // The nine acts: each number pops in, then a light runs through them in order.
    ScrollTrigger.batch('.acts .n', { start: 'top 88%', once: true, onEnter: batch => gsap.fromTo(batch, { scale: 0 }, { scale: 1, duration: .6, delay: .15, ease: 'back.out(2.2)', stagger: Math.min(.07, .6 / batch.length), clearProps: 'transform' }) });
    const timers = [];
    const lit = all('.acts>li');
    ScrollTrigger.create({ trigger: '.acts', start: 'top 70%', once: true, onEnter: () => lit.forEach((act, i) => {
      timers.push(gsap.delayedCall(.9 + i * .13, () => act.classList.add('lit')), gsap.delayedCall(1.3 + i * .13, () => act.classList.remove('lit')));
    }) });

    // Layers, not screenshots: the flat stack separates into its parts.
    ScrollTrigger.create({ trigger: '.stack', start: 'top 85%', once: true, onEnter: () => document.querySelector('.stack').classList.add('split') });

    // The delivered file assembles in order: opening, motion, closing, then the track.
    const wipe = { clipPath: 'inset(0% 100% 0% 0%)' };
    const clear = { clipPath: 'inset(0% 0% 0% 0%)', clearProps: 'clipPath', ease: 'power2.inOut' };
    const file = gsap.timeline({ scrollTrigger: { trigger: '.timeline', start: 'top 80%', once: true } });
    file.fromTo('.tl-open', wipe, { ...clear, duration: .45 }, .35)
      .fromTo('.tl-main', wipe, { ...clear, duration: .9 }, '>-.1')
      .fromTo('.tl-close', wipe, { ...clear, duration: .45 }, '>-.1')
      .fromTo('.tl-audio', wipe, { ...clear, duration: 1.1 }, '<-.5');

    // Time per video: bars grow in proportion to the time they stand for, 12 to 1.
    const bars = gsap.timeline({ scrollTrigger: { trigger: '.tbars', start: 'top 80%', once: true } });
    bars.fromTo('.tbar:not(.now) i', { scaleX: 0 }, { scaleX: 1, duration: 2.4, ease: 'power1.inOut', clearProps: 'transform' }, .3)
      .fromTo('.tbar.now i', { scaleX: 0 }, { scaleX: 1, duration: .2, ease: 'power1.out', clearProps: 'transform' }, .3);

    // The finale's squircles open as it arrives.
    gsap.from('.contours i', { scale: .55, ease: 'none', scrollTrigger: { trigger: '.mc-final', start: 'top bottom', end: 'top 25%', scrub: .6 } });

    return () => {
      root.classList.remove('motion');
      timers.forEach(timer => timer.kill());
      counters.forEach(tween => tween.progress() > 0 && tween.progress(1));
    };
  });
})();
