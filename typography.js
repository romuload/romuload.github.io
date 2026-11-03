(() => {
  'use strict';
  // Protect the final word only when the rendered text actually needs it.
  // Keep the authored copy intact so language changes and resizing remain reversible.
  const edits = new Map();
  const selector = 'h1,h2,h3,h4,h5,h6,p,dd,dt,li,blockquote,figcaption,.contact-steps span,.contact-steps strong';
  const excluded = 'nav,button,svg,script,style,pre,code,textarea,select,dialog,[contenteditable],[aria-hidden="true"],[data-no-typography]';
  let frame = 0;
  const restore = () => {
    for (const [node, { original, patched }] of edits) {
      if (node.isConnected && node.nodeValue === patched) node.nodeValue = original;
    }
    edits.clear();
  };
  const textNodes = element => {
    const nodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement?.closest(excluded)
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  };
  const protect = element => {
    if (element.closest(excluded) || !element.getClientRects().length) return;
    if (element.matches('li') && element.querySelector('h1,h2,h3,h4,h5,h6,p,ul,ol,dl,blockquote')) return;
    const nodes = textNodes(element);
    const locations = [];
    let text = '';
    for (const node of nodes) {
      locations.push({ node, start: text.length, end: text.length + node.length });
      text += node.nodeValue;
    }
    const words = [...text.matchAll(/\S+/gu)];
    if (words.length < 3) return;
    const range = document.createRange();
    const position = word => {
      const start = locations.find(item => word.index >= item.start && word.index < item.end);
      const endIndex = word.index + word[0].length;
      const end = locations.find(item => endIndex > item.start && endIndex <= item.end);
      if (!start || !end) return null;
      range.setStart(start.node, word.index - start.start);
      range.setEnd(end.node, endIndex - end.start);
      const boxes = [...range.getClientRects()].filter(box => box.width && box.height);
      return boxes.length ? boxes[boxes.length - 1].top : null;
    };
    const last = words[words.length - 1];
    const previous = words[words.length - 2];
    const lastTop = position(last);
    const previousTop = position(previous);
    if (lastTop === null || previousTop === null || Math.abs(lastTop - previousTop) < 4) return;
    const gapStart = previous.index + previous[0].length;
    const gap = text.slice(gapStart, last.index);
    if (!/^[ \t\r\n]+$/.test(gap)) return;
    const location = locations.find(item => gapStart >= item.start && gapStart < item.end);
    // The whitespace belongs to one node, even when the last word is emphasized or linked.
    if (!location || last.index > location.end) return;
    const original = location.node.nodeValue;
    const offset = gapStart - location.start;
    const patched = original.slice(0, offset) + '\u00a0' + original.slice(offset + gap.length);
    const oldWidth = element.getBoundingClientRect().width;
    location.node.nodeValue = patched;
    if (element.scrollWidth > element.clientWidth + 1 || element.getBoundingClientRect().width > oldWidth + 1) {
      location.node.nodeValue = original;
      return;
    }
    edits.set(location.node, { original, patched });
  };
  const refresh = () => {
    frame = 0;
    restore();
    document.querySelectorAll(selector).forEach(protect);
    document.documentElement.dataset.typographyState = !document.fonts || document.fonts.status === 'loaded' ? 'ready' : 'pending';
  };
  const schedule = () => {
    document.documentElement.dataset.typographyState = 'pending';
    if (!frame) frame = requestAnimationFrame(refresh);
  };
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('portfolio-language-change', schedule);
  window.addEventListener('message', schedule);
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('button,a,summary,[role="button"],[role="tab"]')) schedule();
  }, { passive: true });
  if (document.fonts) {
    document.fonts.ready.then(schedule);
    document.fonts.addEventListener('loadingdone', schedule);
  }
  schedule();
})();
