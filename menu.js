// Phone menu: the main navigation folds behind a button so the header takes one row.
(() => {
  'use strict';
  const nav = document.querySelector('header nav');
  if (!nav) return;
  const header = nav.closest('header');
  const t = text => (window.portfolioI18n ? window.portfolioI18n.t(text) : text);
  if (!nav.id) nav.id = 'main-menu';
  nav.classList.add('main-nav');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'menu-toggle';
  button.setAttribute('aria-controls', nav.id);
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path class="mt-a" d="M4 8h16"/><path class="mt-b" d="M4 16h16"/></svg>';
  header.appendChild(button);
  header.classList.add('has-menu');

  const label = () => button.setAttribute('aria-label', t(header.classList.contains('menu-open') ? 'Close menu' : 'Open menu'));
  const set = open => {
    header.classList.toggle('menu-open', open);
    document.documentElement.classList.toggle('menu-lock', open);
    button.setAttribute('aria-expanded', String(open));
    label();
    if (open) nav.querySelector('a')?.focus({ preventScroll: true });
  };
  label();
  window.addEventListener('portfolio-language-change', label);
  button.addEventListener('click', () => set(!header.classList.contains('menu-open')));
  nav.addEventListener('click', event => { if (event.target.closest('a')) set(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) { set(false); button.focus(); }
  });
  matchMedia('(min-width:768px)').addEventListener('change', event => { if (event.matches) set(false); });
})();
