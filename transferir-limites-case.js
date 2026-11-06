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
  document.getElementById('year').textContent = new Date().getFullYear();
  if (!('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('.transfer-nav a')];
  const chapters = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-15% 0px -55% 0px'});
  document.querySelectorAll('main > section[id]').forEach(section => chapters.observe(section));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Only stage content below the viewport; the first screen is readable immediately.
  const targets = [...document.querySelectorAll('[data-reveal]')].filter(element => element.getBoundingClientRect().top > innerHeight);
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) {entry.target.classList.remove('is-pending');reveal.unobserve(entry.target);}
  }), {threshold: .08});
  document.documentElement.classList.add('reveal-active');
  targets.forEach(element => {element.classList.add('is-pending');reveal.observe(element);});
})();
