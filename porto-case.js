(() => {
  'use strict';
  const slider = document.getElementById('porto-slider');
  const comparison = document.getElementById('porto-comparison');
  const updateComparison = () => {
    comparison.style.setProperty('--split', `${slider.value}%`);
    document.querySelectorAll('[data-compare]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.compare === slider.value)));
  };
  document.querySelectorAll('[data-compare]').forEach(button => button.addEventListener('click',()=>{slider.value=button.dataset.compare;updateComparison();}));
  const dialog=document.querySelector('.evidence-dialog');
  document.querySelectorAll('.evidence-zoom').forEach(button=>button.addEventListener('click',()=>{
    const figure=button.closest('figure');const source=figure.querySelector('img');
    dialog.querySelector('img').src=source.src;dialog.querySelector('img').alt=source.alt;
    dialog.querySelector('p').textContent=figure.querySelector('figcaption>span').textContent;
    dialog.showModal();
  }));
  dialog.querySelector('.close-evidence').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  slider.addEventListener('input', updateComparison);
  updateComparison();
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

  // Scroll motion follows the iLab case. Without GSAP or with reduced motion, the page stays static and complete.
  if (!window.gsap || !window.ScrollTrigger || document.body.classList.contains('review-reading')) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // The site uses CSS smooth scrolling, which breaks ScrollTrigger: while it measures, it
  // jumps to the top and back, and a smooth jump leaves every trigger in the wrong place.
  // On this page scrolling is instant by default, and in-page links scroll smoothly via JS.
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
    // Content loading during the scroll (embeds, triggers recalculating) can stop it short,
    // so check where it landed and continue until the section is in place.
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

  // Embedded pages (journey map, legacy workflow) settle their height after load.
  // Recalculate every scroll trigger whenever the page height changes, so the
  // sticky screens and reveals stay aligned with the text.
  let lastHeight = 0, refreshTimer = null;
  new ResizeObserver(() => {
    const height = document.documentElement.scrollHeight;
    if (Math.abs(height - lastHeight) < 2) return;
    lastHeight = height;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(document.body);
  document.querySelectorAll('iframe').forEach(frame => frame.addEventListener('load', () => ScrollTrigger.refresh()));

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const root = document.documentElement; root.classList.add('motion');

    // Cascading reveal: grids reveal item by item, everything else as one block.
    const groups = '.pain-grid,.contribution-grid,.principles,.research-metrics,.impact-metrics,.journey-flow,.validation-questions,.design-reasoning,.decision-table,.narrative-columns,.results-detail,.discovery-grid';
    const blocks = [...document.querySelectorAll('[data-reveal],.evidence,.discovery-grid,.validation-questions,.porto-comparison')]
      .filter(node => !node.parentElement.closest('[data-reveal],.discovery-grid'));
    const items = blocks.flatMap(node => node.matches(groups) ? [...node.children] : [node]);
    items.forEach(node => node.classList.add('rv'));
    ScrollTrigger.batch(items, {start: 'top 88%', once: true, onEnter: batch => gsap.to(batch, {opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08, overwrite: true})});

    // Hero: the product is born tilted and straightens as you scroll.
    gsap.fromTo('.hero-product', {rotateX: 22, scale: .86, y: 40}, {rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: {trigger: '.hero-stage', start: 'top 92%', end: 'top 18%', scrub: .6}});

    // Figures count up once they appear.
    const counters = [...document.querySelectorAll('.research-metrics strong,.impact-metrics strong')].map(node => {
      const [, prefix, value, suffix] = node.textContent.match(/^(\D*)(\d+)(.*)$/);
      const count = {v: 0};
      node.textContent = prefix + 0 + suffix;
      gsap.to(count, {v: +value, duration: 1.6, ease: 'power2.out', onUpdate: () => { node.textContent = prefix + Math.round(count.v) + suffix; }, scrollTrigger: {trigger: node, start: 'top 85%'}});
      return () => { node.textContent = prefix + value + suffix; };
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
      const follow = (steps, screens) => {
        const set = i => {
          steps.forEach((step, k) => step.classList.toggle('on', k === i));
          screens.forEach((screen, k) => screen.classList.toggle('on', k === i));
        };
        set(0);
        steps.forEach((step, i) => ScrollTrigger.create({trigger: step, start: 'top 55%', end: 'bottom 55%', onToggle: e => e.isActive && set(i)}));
      };
      follow([...document.querySelectorAll('.solution-step')], [...document.querySelectorAll('.stage-screens img')]);
      follow([...document.querySelectorAll('.mobile-capabilities article')], [...document.querySelectorAll('.tour-screen')]);
      return () => { root.classList.remove('wide'); };
    });

    return () => { root.classList.remove('motion'); counters.forEach(reset => reset()); };
  });
})();
