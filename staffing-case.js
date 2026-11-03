(() => {
  'use strict';
  const slider = document.getElementById('stf-slider');
  const comparison = document.getElementById('stf-comparison');
  const updateComparison = () => {
    comparison.style.setProperty('--split', `${slider.value}%`);
    document.querySelectorAll('[data-compare]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.compare === slider.value)));
  };
  document.querySelectorAll('[data-compare]').forEach(button => button.addEventListener('click',()=>{slider.value=button.dataset.compare;updateComparison();}));
  slider.addEventListener('input', updateComparison);
  updateComparison();

  // Reservation simulator: two business days, skipping the weekend; after noon it starts the next day.
  const days = [...document.querySelectorAll('.res-days li')];
  const plans = {am: {start: 'thu', counted: ['thu', 'fri']}, pm: {start: 'thu', counted: ['fri', 'mon']}};
  const showReservation = at => {
    const plan = plans[at];
    days.forEach(day => {
      const k = day.dataset.day;
      day.classList.toggle('start', k === plan.start);
      day.classList.toggle('counted', plan.counted.includes(k));
      day.classList.toggle('expires', k === plan.counted[plan.counted.length - 1]);
    });
    document.querySelectorAll('.res-toggle button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.at === at)));
    document.querySelectorAll('.res-out').forEach(line => { line.hidden = line.dataset.at !== at; });
  };
  document.querySelectorAll('.res-toggle button').forEach(button => button.addEventListener('click', () => showReservation(button.dataset.at)));
  showReservation('am');

  // Without motion, the lifecycle shows every status as reached.
  const lifecycle = [...document.querySelectorAll('.lifecycle li')];
  lifecycle.forEach(step => step.classList.add('on'));

  if ('IntersectionObserver' in window) {
    const links = Array.from(document.querySelectorAll('.case-nav a'));
    const chapters = new IntersectionObserver(entries => {
      for (const entry of entries) if(entry.isIntersecting) {
        links.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.dataset.chapter}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
        });
      }
    }, {rootMargin:'-20% 0px -55% 0px',threshold:0});
    document.querySelectorAll('[data-chapter]').forEach(section=>chapters.observe(section));
  }
  const progress = document.querySelector('.reading-progress');
  let queued = false;
  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.min(1,window.scrollY/total) : 0})`;
    queued = false;
  };
  window.addEventListener('scroll', () => {if(!queued) {queued=true; requestAnimationFrame(updateProgress);}}, {passive:true});
  window.addEventListener('resize', updateProgress);
  window.addEventListener('portfolio-language-change', updateProgress);
  updateProgress();
  document.getElementById('year').textContent = new Date().getFullYear();

  // Scroll motion follows the Porto case. Without GSAP or with reduced motion, the page stays static and complete.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // ScrollTrigger needs instant scrolling; in-page links scroll smoothly via JS.
  const html = document.documentElement;
  html.style.scrollBehavior = 'auto';
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const pad = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
    let tries = 0;
    const go = () => {
      target.scrollIntoView({behavior});
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

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const root = document.documentElement; root.classList.add('motion');

    // Cascading reveal: grids reveal item by item, everything else as one block.
    const groups = '.pain-grid,.principles,.research-metrics,.impact-metrics,.design-reasoning,.voices,.findings,.road,.legacy-day';
    const blocks = [...document.querySelectorAll('[data-reveal],.evidence,.legacy-day,.stf-comparison')]
      .filter(node => !node.parentElement.closest('[data-reveal]'));
    const items = blocks.flatMap(node => node.matches(groups) ? [...node.children] : [node]);
    items.forEach(node => node.classList.add('rv'));
    ScrollTrigger.batch(items, {start: 'top 88%', once: true, onEnter: batch => gsap.to(batch, {opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1, overwrite: true})});

    // Hero: the product is born tilted and straightens as you scroll.
    gsap.fromTo('.hero-product', {rotateX: 22, scale: .86, y: 40}, {rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: {trigger: '.hero-stage', start: 'top 92%', end: 'top 18%', scrub: .6}});
    gsap.fromTo('.hero-mobile', {y: 80, opacity: 0}, {y: 0, opacity: 1, ease: 'none', scrollTrigger: {trigger: '.hero-stage', start: 'top 85%', end: 'top 35%', scrub: .6}});

    // Lines that draw as you read: the legacy day, the role timeline and the status lifecycle.
    document.querySelectorAll('.legacy-day,.road').forEach(line => {
      gsap.fromTo(line, {'--p': 0}, {'--p': 1, ease: 'none', scrollTrigger: {trigger: line, start: 'top 80%', end: 'bottom 55%', scrub: .5}});
    });

    // Lifecycle: one person walks through every status, then the cycle restarts.
    const lifeLine = document.querySelector('.lifecycle ol');
    lifecycle.forEach(step => step.classList.remove('on'));
    const life = gsap.timeline({repeat: -1, repeatDelay: 1.2, paused: true});
    life.set(lifeLine, {'--p': 0});
    lifecycle.forEach((step, i) => {
      life.call(() => lifecycle.forEach((s, k) => s.classList.toggle('on', k <= i)));
      if (i < lifecycle.length - 1) life.to(lifeLine, {'--p': (i + 1) / (lifecycle.length - 1), duration: .9, ease: 'power2.inOut'}, '+=0.5');
    });
    life.to({}, {duration: 1.6});
    ScrollTrigger.create({trigger: '.lifecycle', start: 'top 80%', end: 'bottom top', onToggle: e => e.isActive ? life.play() : life.pause()});

    // Reservation: the two moments play once when the simulator appears.
    ScrollTrigger.create({trigger: '.res-sim', start: 'top 65%', once: true, onEnter: () => {
      gsap.timeline().call(() => showReservation('am')).call(() => showReservation('pm'), null, 1.8).call(() => showReservation('am'), null, 4.2);
    }});

    // Figures count up once they appear.
    const counters = [...document.querySelectorAll('.research-metrics strong,.impact-metrics strong')].map(node => {
      const [, prefix, value, suffix] = node.textContent.match(/^(\D*)(\d+)(.*)$/);
      const count = {v: 0};
      node.textContent = prefix + 0 + suffix;
      gsap.to(count, {v: +value, duration: 1.6, ease: 'power2.out', onUpdate: () => { node.textContent = prefix + Math.round(count.v) + suffix; }, scrollTrigger: {trigger: node, start: 'top 85%'}});
      return () => { node.textContent = prefix + value + suffix; };
    });

    // Bars: May starts at January's size and shrinks to its real value.
    document.querySelectorAll('.rb-row.now i').forEach(bar => {
      const v = parseFloat(bar.style.getPropertyValue('--v'));
      gsap.fromTo(bar, {scaleX: 100 / v}, {scaleX: 1, duration: 1.8, ease: 'power3.inOut', scrollTrigger: {trigger: bar, start: 'top 85%'}});
    });

    // Before/after: the divider sweeps once on its own when it appears.
    ScrollTrigger.create({trigger: comparison, start: 'top 60%', once: true, onEnter: () => {
      const split = {x: +slider.value};
      const move = () => { slider.value = Math.round(split.x); updateComparison(); };
      gsap.timeline().to(split, {x: 15, duration: 1, ease: 'power2.inOut', onUpdate: move}).to(split, {x: 50, duration: 1.1, ease: 'power2.inOut', onUpdate: move});
    }});

    // Sticky screens that follow the text, only where there is room for two columns.
    gsap.matchMedia().add('(min-width: 1051px)', () => {
      root.classList.add('wide');
      const steps = [...document.querySelectorAll('.solution-step')];
      const screens = [...document.querySelectorAll('.stage-screens img')];
      const set = i => {
        steps.forEach((step, k) => step.classList.toggle('on', k === i));
        screens.forEach((screen, k) => screen.classList.toggle('on', k === i));
      };
      set(0);
      steps.forEach((step, i) => ScrollTrigger.create({trigger: step, start: 'top 55%', end: 'bottom 55%', onToggle: e => e.isActive && set(i)}));
      return () => { root.classList.remove('wide'); };
    });

    return () => {
      root.classList.remove('motion');
      counters.forEach(reset => reset());
      life.kill();
      lifecycle.forEach(step => step.classList.add('on'));
    };
  });
})();
