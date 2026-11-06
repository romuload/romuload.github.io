(() => {
  'use strict';
  const dialog = document.querySelector('.transfer-dialog');
  let trigger;
  document.querySelectorAll('.image-open').forEach(button => button.addEventListener('click', () => {
    trigger = button;
    const image = button.querySelector('img');
    const expanded = dialog.querySelector('img');
    expanded.src = image.src;
    expanded.alt = image.alt;
    dialog.showModal();
  }));
  dialog.querySelector('.close-image').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => trigger?.focus());

  const track = document.querySelector('.evolution-track');
  if (track) {
    const versions = [...track.children];
    const previous = document.querySelector('.evolution-prev');
    const next = document.querySelector('.evolution-next');
    const count = document.querySelector('.evolution-count');
    const activeIndex = () => versions.reduce((best, item, index) => Math.abs(item.offsetLeft - track.scrollLeft) < Math.abs(versions[best].offsetLeft - track.scrollLeft) ? index : best, 0);
    const sync = () => {
      const index = activeIndex();
      previous.disabled = index === 0;
      next.disabled = index === versions.length - 1;
      count.textContent = `${index + 1} / ${versions.length}`;
    };
    const move = direction => {
      const index = Math.max(0, Math.min(versions.length - 1, activeIndex() + direction));
      track.scrollTo({left: versions[index].offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', sync, {passive:true});
    track.addEventListener('keydown', event => {
      if(event.target !== track || !matchMedia('(max-width:767px)').matches) return;
      if(event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault();move(event.key === 'ArrowRight' ? 1 : -1);}
    });
    window.addEventListener('resize', sync);
    sync();
  }
  document.getElementById('year').textContent = new Date().getFullYear();
  // Very short words ("a", "e", "o") stay with the next word instead of ending a line.
  const bindShortWords = () => {
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement.closest('.tm-canvas,.tx-phone,.tx-chip,[data-no-translate]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let node;
    while ((node = walker.nextNode())) {
      // Headings are read at a glance, so there two-letter words ("do", "de") stay attached too.
      const short = node.parentElement.closest('h1,h2,h3') ? /(?<=^|[\s(])(\p{L}{1,2})[ \t\r\n]+(?=\S)/gu : /(?<=^|[\s(])(\p{L})[ \t\r\n]+(?=\S)/gu;
      const bound = node.nodeValue.replace(short, '$1 ');
      if (bound !== node.nodeValue) node.nodeValue = bound;
    }
  };
  bindShortWords();
  window.addEventListener('portfolio-language-change', bindShortWords);

  const links = [...document.querySelectorAll('.transfer-nav a')];
  const chapters = [...document.querySelectorAll('main > section[id]')];

  // Reading progress and keeping the active tab visible on narrow screens.
  const progress = document.querySelector('.reading-progress');
  const navRow = document.querySelector('.transfer-nav .wrap');
  let queued = false;
  const updateProgress = () => {
    queued = false;
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
    let current = null;
    for (const section of chapters) if (section.getBoundingClientRect().top <= innerHeight * .35) current = section.id;
    links.forEach(link => {
      const active = link.hash === `#${current}`;
      if (active === link.hasAttribute('aria-current')) return;
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateProgress); } }, {passive: true});
  addEventListener('resize', updateProgress);
  new MutationObserver(() => {
    const link = navRow.querySelector('[aria-current]');
    if (!link) return;
    const row = navRow.getBoundingClientRect(), tab = link.getBoundingClientRect();
    navRow.scrollTo({left: navRow.scrollLeft + tab.left - row.left - (row.width - tab.width) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }).observe(navRow, {subtree: true, attributes: true, attributeFilter: ['aria-current']});
  updateProgress();

  // Scroll motion follows the other cases. Without GSAP or with reduced motion, the page stays static and complete.
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  // ScrollTrigger needs instant scrolling; in-page links scroll smoothly via JS.
  document.documentElement.style.scrollBehavior = 'auto';
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    const target = link && document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    // Images loading during the scroll can stop it short, so check where it landed and continue.
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    let tries = 0;
    const go = () => {
      target.scrollIntoView({behavior: 'smooth'});
      clearTimeout(go.timer);
      go.timer = setTimeout(() => {
        if (Math.abs(target.getBoundingClientRect().top - pad) > 24 && ++tries < 4) go();
      }, 900);
    };
    go();
    history.replaceState(null, '', location.pathname + location.search + link.getAttribute('href'));
  });

  let lastHeight = 0, refreshTimer = 0;
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

    // Cascading reveal. A long jump can enter many items at once, so the cascade has a ceiling.
    const items = [...document.querySelectorAll('.transfer-summary h2,.transfer-summary dl>div,.context-story>div,.public-reference,.sec-head>*,.contribution-grid>div:first-child>*,.scope-facts>div,.process-narrative>article,.claude-process,.evolution-version,.evolution-note,.tm,.transfer-steps>li,.decision-list>article,.decision-image,.primary-metrics>div,.outcomes-section .wrap>.source-note,.additional-results,.closing-section .wrap>*')];
    items.forEach(node => node.classList.add('rv'));
    ScrollTrigger.batch(items, {start: 'top 88%', once: true, onEnter: batch => gsap.to(batch, {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: Math.min(.09, .6 / batch.length), overwrite: true,
      onStart() { this.targets().forEach(node => { if (node.matches('.transfer-steps>li')) requestAnimationFrame(() => node.classList.add('rv-pop')); }); },
      onComplete() { this.targets().forEach(node => { node.classList.remove('rv', 'rv-pop'); gsap.set(node, {clearProps: 'opacity,transform'}); }); }
    })});

    // Results count toward their final value: 151s falls to 62s; the text is read only on entry, so the language is settled.
    const number = /\d+(?:[.,]\d+)?/g;
    const counters = [...document.querySelectorAll('.primary-metrics dd,.scope-facts dd')].map(node => {
      const count = {v: 0};
      let source = '', from = 0, to = 0, places = 0, comma = false;
      const tween = gsap.to(count, {v: 1, duration: 1.6, ease: 'power2.out', paused: true,
        onUpdate() {
          const value = (from + (to - from) * count.v).toFixed(places);
          let seen = 0;
          const found = source.match(number).length;
          node.textContent = source.replace(number, match => (++seen === found ? (comma ? value.replace('.', ',') : value) : match));
        },
        onComplete() { node.textContent = window.portfolioI18n ? window.portfolioI18n.t(source) : source; }});
      ScrollTrigger.create({trigger: node, start: 'top 88%', once: true, onEnter: () => {
        source = node.textContent;
        const found = source.match(number);
        if (!found) return;
        const last = found[found.length - 1];
        comma = last.includes(',');
        places = (last.split(/[.,]/)[1] || '').length;
        to = parseFloat(last.replace(',', '.'));
        from = found.length > 1 ? parseFloat(found[0].replace(',', '.')) : 0;
        tween.play();
      }});
      return tween;
    });

    // Hero: phone and callouts drift apart as the page leaves it.
    const leave = {trigger: '.transfer-hero', start: 'top top', end: 'bottom top', scrub: .6};
    gsap.to('.tx-chip.a', {y: -40, ease: 'none', scrollTrigger: leave});
    gsap.to('.tx-chip.b', {y: -90, ease: 'none', scrollTrigger: leave});

    return () => { root.classList.remove('motion'); counters.forEach(tween => tween.progress() > 0 && tween.progress(1)); };
  });
})();
