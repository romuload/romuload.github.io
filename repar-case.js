(() => {
  const slider = document.getElementById('repar-slider');
  const comparison = document.getElementById('repar-comparison');
  const update = () => comparison.style.setProperty('--x', `${slider.value}%`);
  slider.addEventListener('input', update);
  update();
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('shown');
        observer.unobserve(entry.target);
      }
    }), { threshold: .08 });
    document.querySelectorAll('.sec-head, .context-grid, .evolution-grid article, .version').forEach(element => {
      element.classList.add('case-reveal');
      observer.observe(element);
    });
  }
  document.getElementById('year').textContent = new Date().getFullYear();
})();
