const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.documentElement.classList.add('motion-ready');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      document.documentElement.classList.remove('motion-ready');
      observer.disconnect();
    }
  });
}
document.getElementById('year').textContent = new Date().getFullYear();
const carouselButton = document.getElementById('logo-motion');
const carouselTrack = document.querySelector('.logo-track');
if (carouselButton && carouselTrack) {
  carouselButton.addEventListener('click', () => {
    const paused = carouselButton.getAttribute('aria-pressed') !== 'true';
    carouselButton.setAttribute('aria-pressed', String(paused));
    carouselButton.textContent = paused ? 'Retomar carrossel' : 'Pausar carrossel';
    carouselTrack.classList.toggle('paused', paused);
  });
}
