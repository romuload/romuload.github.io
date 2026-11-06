(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const language = () => (window.portfolioI18n ? window.portfolioI18n.language : 'en');
  const money = value => Number(value).toLocaleString(language() === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const paintStatic = () => document.querySelectorAll('[data-n]').forEach(node => { node.textContent = money(node.dataset.n); });

  // Hero: the phone keeps its proportions at any panel size.
  const hero = document.querySelector('.tx-hero');
  if (hero) new ResizeObserver(([entry]) => hero.style.setProperty('--k', (entry.contentRect.height * .88 / 931).toFixed(4))).observe(hero);

  paintStatic();
  window.addEventListener('portfolio-language-change', paintStatic);

  const root = document.getElementById('transferMotion');
  if (!root) return;
  const stage = root.querySelector('.tm-stage');
  const canvas = root.querySelector('.tm-canvas');
  const fit = () => {
    const box = stage.getBoundingClientRect();
    const scale = box.height / 1080;
    canvas.style.transform = `translateX(${(box.width - 1920 * scale) / 2}px) scale(${scale})`;
  };
  new ResizeObserver(fit).observe(stage);
  fit();
  if (!window.gsap) return;

  const amounts = { transfer: 4950, remaining: 50, dest: 14950, input: 4950, adjust: 50 };
  const bound = [...root.querySelectorAll('[data-s]')];
  const render = () => bound.forEach(node => {
    const text = money(Math.round(amounts[node.dataset.s] / 10) * 10);
    if (node.textContent !== text) node.textContent = text;
  });
  window.addEventListener('portfolio-language-change', render);

  const q = selector => root.querySelector(selector);
  const playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  const playButton = q('.tm-play');
  const chapterButtons = [...root.querySelectorAll('.tm-chapters button')];
  let timeline = null, visible = false, held = reduce;
  const t = text => (window.portfolioI18n ? window.portfolioI18n.t(text) : text);

  const syncButton = () => {
    const playing = timeline && !timeline.paused();
    playButton.innerHTML = playing ? pauseIcon : playIcon;
    playButton.setAttribute('aria-label', t(playing ? 'Pause demo' : 'Play demo'));
  };
  window.addEventListener('portfolio-language-change', syncButton);

  const syncChapters = () => {
    if (!timeline) return;
    const now = timeline.time();
    const stops = chapterButtons.map(button => timeline.labels[button.dataset.at]);
    chapterButtons.forEach((button, index) => {
      const start = stops[index], end = index < stops.length - 1 ? stops[index + 1] : timeline.duration();
      button.style.setProperty('--p', Math.max(0, Math.min(1, (now - start) / (end - start))).toFixed(3));
      button.classList.toggle('on', now >= start && now < end);
    });
  };

  // Screen positions of the elements the story points at, in canvas pixels.
  const SPOT = { pencil: [1119, 434], input: [960, 440], confirm: [960, 925], transfer: [960, 921] };

  const build = narrow => {
    const tl = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'power3.inOut' }, onUpdate: () => { render(); syncChapters(); } });
    // cx, cy: where the focused point lands on the canvas.
    const camTo = (px, py, scale, cx, cy, duration, at) => tl.to('.tm-cam', { x: cx - px * scale, y: cy - py * scale, scale, duration }, at);
    const camReset = at => tl.set('.tm-cam', { x: 0, y: 0, scale: 1 }, at);

    gsap.set(root.querySelectorAll('.tm-layer'), { autoAlpha: 0 });
    gsap.set('.tm-cam', { x: 0, y: 0, scale: 1, autoAlpha: 0, transformOrigin: '0 0' });
    gsap.set('.tm-adjust', { autoAlpha: 0 });
    gsap.set('.tm-define', { autoAlpha: 1 });
    gsap.set('.tm-title', { y: 34, letterSpacing: '.03em' });
    gsap.set('.tm-card.credit', { y: 90 });
    gsap.set('.tm-card.overdraft', { x: 2000 });
    gsap.set('.tm-card.credit .tm-fill,.tm-card.overdraft .tm-fill', { scaleX: 0 });
    gsap.set('.tm-flow', { scaleX: 0 });
    gsap.set('.tm-word span', { y: 44, autoAlpha: 0 });
    gsap.set('.tm-word .k', { scale: 1.9 });
    gsap.set('.tm-call', { y: 26, scale: .94 });
    gsap.set('.tm-ring', { scale: .4 });
    gsap.set('.tm-final p', { y: 40, autoAlpha: 0 });
    gsap.set('.tm-w-blue,.tm-w-orange', { y: 120 });
    gsap.set('.tm-c-fill', { scaleX: .12, svgOrigin: '111 488' });
    gsap.set('.tm-c-coin', { x: -430 });
    gsap.set('.tm-spot', { scale: .6, transformOrigin: '50% 50%' });

    const callIn = (selector, at) => tl.to(selector, { autoAlpha: 1, y: 0, scale: 1, duration: .55, ease: 'back.out(1.5)' }, at);
    const callOut = (selector, at) => tl.to(selector, { autoAlpha: 0, y: -14, duration: .3 }, at);
    const word = (selector, at) => {
      tl.set(selector, { autoAlpha: 1, y: 0 }, at);
      tl.to(`${selector} span:not(.k)`, { y: 0, autoAlpha: 1, duration: .6, stagger: .12, ease: 'power3.out' }, at);
      tl.to(`${selector} .k`, { y: 0, autoAlpha: 1, duration: .25, ease: 'none' }, at + .15);
      tl.to(`${selector} .k`, { scale: 1, duration: .85, ease: 'power3.out' }, at + .15);
      tl.to(selector, { autoAlpha: 0, y: -40, duration: .35, ease: 'power2.in' }, at + 1.75);
    };
    const phoneIn = at => {
      tl.set('.tm-phone-layer', { autoAlpha: 1 }, at);
      tl.fromTo('.tm-cam .tx-phone', { y: 1100 }, { y: 0, duration: .95, ease: 'power3.out', immediateRender: false }, at);
    };
    const phoneOut = at => tl.to('.tm-phone-layer', { autoAlpha: 0, duration: .3 }, at);
    const tap = ([px, py], at, press) => {
      tl.set('.tm-tap', { left: px + 150, top: py + 190, scale: 1, x: 0, y: 0 }, at);
      tl.to('.tm-tap', { autoAlpha: 1, duration: .2 }, at);
      tl.to('.tm-tap', { x: -150, y: -190, duration: .7, ease: 'power2.inOut' }, at);
      tl.to('.tm-tap', { scale: .72, duration: .12, ease: 'power2.out' }, at + .72);
      if (press) tl.to(press, { scale: .965, duration: .12, ease: 'power2.out' }, at + .72);
      tl.set('.tm-rip', { left: px, top: py, scale: .5, autoAlpha: 1 }, at + .78);
      tl.to('.tm-rip', { scale: 2.5, autoAlpha: 0, duration: .55, ease: 'power2.out' }, at + .78);
      tl.to('.tm-tap', { scale: 1, duration: .16, ease: 'power2.out' }, at + .9);
      if (press) tl.to(press, { scale: 1, duration: .16, ease: 'power2.out' }, at + .9);
      tl.to('.tm-tap', { autoAlpha: 0, duration: .2 }, at + 1.15);
    };

    /* The card needs credit; overdraft supplies it. Match the three opening Figma frames. */
    tl.addLabel('need', 0);
    tl.to('.tm-title', { autoAlpha: 1, y: 0, letterSpacing: '-.035em', duration: .9, ease: 'power3.out' }, .2);
    tl.to('.tm-card.credit', { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, .55);
    tl.to('.tm-card.credit .tm-fill', { scaleX: .91, duration: 1.2, ease: 'power2.inOut' }, .9);
    tl.to('.tm-card.credit', { x: -2000, duration: .7 }, 2.9);
    tl.to('.tm-card.overdraft', { autoAlpha: 1, x: 0, duration: .7 }, 2.9);
    tl.to('.tm-card.overdraft .tm-fill', { scaleX: 842 / 1376, duration: .6, ease: 'power2.out' }, 3.5);
    tl.to('.tm-card.overdraft .tm-fill', { scaleX: 368 / 688, duration: .8 }, 4.4);
    if (narrow) {
      tl.set('.tm-card.credit', { x: 0, y: -250, scale: 1 }, 4.4);
      tl.to('.tm-card.credit', { autoAlpha: 1, duration: .01 }, 4.4);
      tl.fromTo('.tm-card.credit', { x: -1400 }, { x: 0, duration: .7, immediateRender: false }, 4.4);
      tl.to('.tm-card.overdraft', { y: 0, duration: .7 }, 4.4);
    } else {
      tl.fromTo('.tm-card.credit', { x: -2000, y: 0, scale: .5 }, { x: -106, y: 0, scale: .5, duration: .8, immediateRender: false }, 4.4);
      tl.to('.tm-card.overdraft', { x: 814, scale: .5, duration: .8 }, 4.4);
      tl.set('.tm-flow', { autoAlpha: 1 }, 5.3);
      tl.to('.tm-flow', { scaleX: 1, duration: .55, ease: 'power2.inOut' }, 5.3);
      tl.to('.tm-flow', { autoAlpha: 0, duration: .25 }, 6);
    }
    tl.to('.tm-title,.tm-card.credit,.tm-card.overdraft', { autoAlpha: 0, duration: .35 }, 6.7);

    /* Choose: the source appears, and the pencil opens the amount. */
    tl.addLabel('choose', 7.1);
    word('.tm-w1', 7.1);
    phoneIn(9.2);
    camTo(...(narrow ? [960, 420, 1.45, 960, 380] : [1020, 430, 1.65, 720, 540]), 1.1, 10.2);
    callIn('.tm-call.c1', 10.9);
    tl.set('.tm-ring', { left: SPOT.pencil[0], top: SPOT.pencil[1] }, 11.2);
    tl.to('.tm-ring', { autoAlpha: 1, scale: 1, duration: .4, ease: 'back.out(2)' }, 11.2);
    tap(SPOT.pencil, 11.5, '.tm-define .tx-edit');
    tl.to('.tm-ring', { autoAlpha: 0, duration: .25 }, 12.8);
    callOut('.tm-call.c1', 12.8);
    phoneOut(13.2);
    camReset(13.5);

    /* Amount: the input changes and the limits below follow it. */
    tl.addLabel('amount', 13.6);
    word('.tm-w2', 13.6);
    tl.set('.tm-define', { autoAlpha: 0 }, 15.5);
    tl.set('.tm-adjust', { autoAlpha: 1 }, 15.5);
    phoneIn(15.6);
    camTo(...(narrow ? [960, 500, 1.75, 960, 400] : [960, 490, 1.95, 1150, 480]), 1.1, 16.6);
    tap(SPOT.input, 17.2, '.tm-amount');
    tl.set('.tm-box.input', { autoAlpha: 1 }, 17.95);
    callIn('.tm-call.c2', 18.1);
    tl.to(amounts, { input: 2000, adjust: 2950, duration: 1.9, ease: 'power2.inOut' }, 18.3);
    tl.to('.tm-box.input', { autoAlpha: 0, duration: .25 }, 20.4);
    callOut('.tm-call.c2', 20.5);
    camTo(...(narrow ? [960, 860, 1.5, 960, 400] : [960, 880, 1.65, 960, 560]), 1, 20.6);
    tl.to('.tm-box.newlimit', { autoAlpha: 1, duration: .3 }, 21.4);
    tl.to('.tm-box.newlimit', { autoAlpha: 0, duration: .25 }, 22.6);
    tap(SPOT.confirm, 22, '.tm-adjust .tx-btn');
    phoneOut(23.4);
    camReset(23.7);

    /* Review: current and new limit side by side, then confirm. */
    tl.addLabel('review', 23.8);
    word('.tm-w3', 23.8);
    tl.set('.tm-adjust', { autoAlpha: 0 }, 25.7);
    tl.set('.tm-define', { autoAlpha: 1 }, 25.7);
    tl.set(amounts, { transfer: 2000, remaining: 2950 }, 25.7);
    phoneIn(25.8);
    camTo(...(narrow ? [960, 800, 1.5, 960, 340] : [960, 830, 1.75, 780, 560]), 1.1, 26.8);
    tl.to('.tm-box.summary', { autoAlpha: 1, duration: .35 }, 27.6);
    callIn('.tm-call.c3', 27.8);
    tl.to(amounts, { dest: 12000, duration: 1.1, ease: 'power2.inOut' }, 27.9);
    tl.addLabel('reviewHold', 29.2);
    tl.to('.tm-box.summary', { autoAlpha: 0, duration: .25 }, 29.6);
    callOut('.tm-call.c3', 29.6);
    tap(SPOT.transfer, 29.5, '.tm-define .tx-btn');

    /* Result: the button opens into the bank's orange squircle, which becomes the loader. */
    tl.addLabel('result', 30.8);
    tl.set('.tm-wipe', { autoAlpha: 1, x: 0, y: 330, scale: .1 }, 30.8);
    tl.to('.tm-wipe', { scale: 7, y: 0, duration: .7, ease: 'power3.in' }, 30.8);
    tl.set('.tm-phone-layer', { autoAlpha: 0 }, 31.5);
    tl.set('.tm-spot.rings', { autoAlpha: 1, scale: 1 }, 31.5);
    tl.set('.tm-r1,.tm-r2', { autoAlpha: 0, scale: .7, svgOrigin: '451 307' }, 31.5);
    tl.to('.tm-wipe', { scale: 1, duration: .8, ease: 'power3.out' }, 31.5);
    tl.to('.tm-r2', { autoAlpha: .2, scale: 1, duration: .45, ease: 'back.out(2)' }, 32.1);
    tl.to('.tm-r1', { autoAlpha: .2, scale: 1, duration: .45, ease: 'back.out(2)' }, 32.25);
    tl.to('.tm-wipe', { scale: .92, duration: .3, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 32.5);
    tl.to('.tm-wipe,.tm-spot.rings', { autoAlpha: 0, scale: .2, duration: .3, ease: 'power2.in' }, 33.7);

    tl.to('.tm-spot.wallet', { autoAlpha: 1, scale: 1, duration: .55, ease: 'back.out(1.7)' }, 33.95);
    tl.to('.tm-w-blue', { y: 0, duration: .55, ease: 'back.out(1.8)' }, 34.2);
    tl.to('.tm-w-orange', { y: 0, duration: .6, ease: 'back.out(1.8)' }, 34.35);
    tl.to('.tm-cap.c-move', { autoAlpha: 1, duration: .3, ease: 'none' }, 34.2);
    tl.to('.tm-spot.wallet,.tm-cap.c-move', { autoAlpha: 0, duration: .25 }, 35.8);

    tl.to('.tm-spot.card', { autoAlpha: 1, scale: 1, duration: .55, ease: 'back.out(1.7)' }, 36);
    tl.to('.tm-c-fill', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 36.25);
    tl.to('.tm-c-coin', { x: 0, duration: 1.1, ease: 'power2.inOut' }, 36.25);
    tl.to('.tm-cap.c-update', { autoAlpha: 1, duration: .3, ease: 'none' }, 36.25);
    tl.to('.tm-spot.card,.tm-cap.c-update', { autoAlpha: 0, duration: .25 }, 37.8);

    tl.to('.tm-spot.hands', { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(2.2)' }, 38);
    tl.to('.tm-cap.c-set', { autoAlpha: 1, duration: .3, ease: 'none' }, 38.25);

    tl.set('.tm-final', { autoAlpha: 1, clipPath: 'circle(0% at 50% 50%)' }, 39.5);
    tl.to('.tm-final', { clipPath: 'circle(120% at 50% 50%)', duration: .8, ease: 'power3.inOut' }, 39.5);
    tl.to('.tm-final p', { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, 40);
    tl.to({}, { duration: 2.6 }, 40.7);
    return tl;
  };

  const syncPlayback = () => {
    if (!timeline) return;
    if (visible && !held) timeline.play(); else timeline.pause();
    syncButton();
  };

  gsap.matchMedia().add({ narrow: '(max-width:700px)', wide: '(min-width:701px)' }, context => {
    timeline = build(context.conditions.narrow);
    const stops = chapterButtons.map(button => timeline.labels[button.dataset.at]);
    chapterButtons.forEach((button, index) => button.style.setProperty('--w', ((index < stops.length - 1 ? stops[index + 1] : timeline.duration()) - stops[index]).toFixed(1)));
    // With reduced motion the stage rests on the review screen until someone presses play.
    timeline.seek(reduce ? 'reviewHold' : 0);
    render(); syncChapters(); syncPlayback();
    return () => { timeline.kill(); timeline = null; Object.assign(amounts, { transfer: 4950, remaining: 50, dest: 14950, input: 4950, adjust: 50 }); };
  });

  playButton.addEventListener('click', () => { held = !timeline.paused(); syncPlayback(); if (!held) timeline.play(); syncButton(); });
  q('.tm-again').addEventListener('click', () => { held = false; timeline.restart(); syncButton(); });
  chapterButtons.forEach(button => button.addEventListener('click', () => { held = false; timeline.seek(button.dataset.at); timeline.play(); render(); syncChapters(); syncButton(); }));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); }, { threshold: .35 }).observe(stage);
  } else { visible = true; syncPlayback(); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) timeline?.pause(); else syncPlayback(); });
})();
