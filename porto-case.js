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
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window) {
    if (!reduced.matches) {
      const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('shown');
          reveal.unobserve(entry.target);
        }
      }), {threshold:.06, rootMargin:'0px 0px -12px 0px'});
      document.querySelectorAll('[data-reveal]').forEach(node => {
        node.classList.add('will-reveal'); reveal.observe(node);
      });
      reduced.addEventListener('change', event => {
        if (event.matches) { reveal.disconnect(); document.querySelectorAll('.will-reveal').forEach(node => node.classList.add('shown')); }
      });
    }
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
})();
