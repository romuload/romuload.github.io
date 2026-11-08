// Home thumbnail for the Transfer limits case: fits the 1400x1000 canvas, formats amounts by language, pauses off screen.
(() => {
  'use strict';
  const box = document.querySelector('.image-limits');
  if (!box) return;
  const canvas = box.querySelector('.tt-canvas');
  const language = () => (window.portfolioI18n ? window.portfolioI18n.language : document.documentElement.lang.startsWith('pt') ? 'pt' : 'en');
  const paint = () => box.querySelectorAll('[data-n]').forEach(node => {
    node.textContent = Number(node.dataset.n).toLocaleString(language() === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });
  paint();
  window.addEventListener('portfolio-language-change', paint);

  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    canvas.style.setProperty('--s', Math.min(width / 1400, height / 1000).toFixed(4));
  }).observe(box);

  let visible = true;
  const sync = () => box.classList.toggle('tt-off', !visible || document.hidden);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(box);
  }
  document.addEventListener('visibilitychange', sync);
})();
