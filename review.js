(() => {
  'use strict';
  const refresh = () => { requestAnimationFrame(() => { window.dispatchEvent(new Event('resize')); window.ScrollTrigger?.refresh(); }); };
  const expandAncestors = target => {
    let parent = target.closest('details');
    while (parent) { parent.open = true; parent = parent.parentElement.closest('details'); }
  };
  document.querySelectorAll('details.review-details').forEach(detail => detail.addEventListener('toggle', refresh));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    expandAncestors(target);
    requestAnimationFrame(() => target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
    history.replaceState(null,'',location.pathname+location.search+link.hash);
  });
  const followHash = () => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) { expandAncestors(target); requestAnimationFrame(() => target.scrollIntoView({behavior:'auto'})); }
  };
  window.addEventListener('hashchange', followHash);
  window.addEventListener('load',followHash,{once:true});
  followHash();
})();
