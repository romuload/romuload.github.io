(() => {
  'use strict';
  // Chapter links, reading progress and year: same behaviour as the Staffing case.
  if ('IntersectionObserver' in window) {
    const links = Array.from(document.querySelectorAll('.case-nav a'));
    const chapters = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        links.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.dataset.chapter}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      }
    }, {rootMargin: '-20% 0px -55% 0px', threshold: 0});
    document.querySelectorAll('[data-chapter]').forEach(section => chapters.observe(section));
  }
  const progress = document.querySelector('.reading-progress');
  let queued = false;
  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.min(1, window.scrollY / total) : 0})`;
    queued = false;
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateProgress); } }, {passive: true});
  window.addEventListener('resize', updateProgress);
  window.addEventListener('portfolio-language-change', updateProgress);
  updateProgress();
  document.getElementById('year').textContent = new Date().getFullYear();

  // Scroll motion. Without GSAP or with reduced motion, the page stays static and complete.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

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
      go.timer = setTimeout(() => { if (Math.abs(target.getBoundingClientRect().top - pad) > 24 && ++tries < 4) go(); }, 900);
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
    const groups = '.pain-grid,.principles,.research-metrics,.impact-metrics,.design-reasoning,.voices,.findings,.road,.legacy-day,.mib-phones';
    const blocks = [...document.querySelectorAll('[data-reveal],.legacy-day')].filter(node => !node.parentElement.closest('[data-reveal]'));
    const items = blocks.flatMap(node => node.matches(groups) ? [...node.children] : [node]);
    items.forEach(node => node.classList.add('rv'));
    ScrollTrigger.batch(items, {start: 'top 88%', once: true, onEnter: batch => gsap.to(batch, {opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1, overwrite: true})});

    // Hero: the product is born tilted and straightens as you scroll.
    gsap.fromTo('.hero-product', {rotateX: 22, scale: .86, y: 40}, {rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: {trigger: '.hero-stage', start: 'top 92%', end: 'top 18%', scrub: .6}});
    gsap.fromTo('.hero-mobile', {y: 80, opacity: 0}, {y: 0, opacity: 1, ease: 'none', scrollTrigger: {trigger: '.hero-stage', start: 'top 85%', end: 'top 35%', scrub: .6}});

    // Lines that draw as you read: the sale before the redesign and the timeline.
    document.querySelectorAll('.legacy-day,.road').forEach(line => {
      gsap.fromTo(line, {'--p': 0}, {'--p': 1, ease: 'none', scrollTrigger: {trigger: line, start: 'top 80%', end: 'bottom 55%', scrub: .5}});
    });

    // Decisions arrive one by one, the arrow first.
    gsap.utils.toArray('.rules:not(.mib-measure) article').forEach(row => {
      gsap.from(row.querySelector('.rule-out'), {opacity: 0, x: 24, duration: .7, ease: 'power2.out', scrollTrigger: {trigger: row, start: 'top 80%', once: true}});
    });

    // Figures count up once they appear.
    const counters = [...document.querySelectorAll('.research-metrics strong,.impact-metrics strong')].map(node => {
      const match = node.textContent.match(/^(\D*)(\d+)(.*)$/);
      if (!match) return () => {};
      const [, prefix, value, suffix] = match;
      const count = {v: 0};
      node.textContent = prefix + 0 + suffix;
      gsap.to(count, {v: +value, duration: 1.6, ease: 'power2.out', onUpdate: () => { node.textContent = prefix + Math.round(count.v) + suffix; }, scrollTrigger: {trigger: node, start: 'top 85%'}});
      return () => { node.textContent = prefix + value + suffix; };
    });

    // Phones rise at slightly different speeds.
    gsap.utils.toArray('.mib-phones .phone-shell').forEach((phone, i) => {
      gsap.fromTo(phone, {yPercent: 6 + i * 4}, {yPercent: -2, ease: 'none', scrollTrigger: {trigger: '.mib-phones', start: 'top bottom', end: 'bottom top', scrub: .6}});
    });

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
    };
  });
})();
