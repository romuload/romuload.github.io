// The motion cover plays while the pointer or keyboard focus is on its card.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.image-motion video').forEach(video => {
    const card = video.closest('.project');
    const play = () => video.play().catch(() => {});
    const stop = () => { video.pause(); };
    card.addEventListener('pointerenter', play);
    card.addEventListener('pointerleave', stop);
    card.addEventListener('focusin', play);
    card.addEventListener('focusout', stop);
  });
})();
