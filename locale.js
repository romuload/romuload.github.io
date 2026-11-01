(() => {
  'use strict';
  const pairs = window.PORTFOLIO_TRANSLATIONS || [];
  const normalise = value => value.replace(/\s+/g, ' ').trim();
  const dictionary = new Map();
  pairs.forEach(([en, pt]) => {
    const entry = { en, pt };
    dictionary.set(normalise(en), entry);
    dictionary.set(normalise(pt), entry);
  });
  let language = 'en';
  const requested = new URL(location.href).searchParams.get('lang');
  if (requested === 'en' || requested === 'pt') language = requested;
  else {
    try {
      const saved = localStorage.getItem('portfolio-language');
      if (saved === 'en' || saved === 'pt') language = saved;
    } catch { /* English remains available when storage is disabled. */ }
  }
  const translate = value => dictionary.get(normalise(value))?.[language] || value;
  function refresh() {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest('script, style, code, pre, textarea, [data-no-translate]')
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      const entry = dictionary.get(normalise(node.nodeValue));
      if (entry) {
        const leading = node.nodeValue.match(/^\s*/)[0];
        const trailing = node.nodeValue.match(/\s*$/)[0];
        node.nodeValue = leading + entry[language] + trailing;
      }
    }
    document.querySelectorAll('[alt], [aria-label], [title], meta[content]').forEach(element => {
      ['alt', 'aria-label', 'title', 'content'].forEach(attribute => {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, translate(element.getAttribute(attribute)));
      });
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    // Local navigation and shared links retain the selected language.
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const url = new URL(href, location.href);
      const portfolioDirectory = new URL('.', location.href).pathname;
      const localPages = ['index.html', 'sobre.html', 'trabalhe-comigo.html', 'projeto-ilab.html', 'projeto-repar.html', 'projeto-legado.html', 'projeto-games.html'];
      if (url.origin === location.origin && (url.pathname === portfolioDirectory || localPages.some(page => url.pathname === portfolioDirectory + page))) {
        url.searchParams.set('lang', language);
        link.setAttribute('href', url.pathname + url.search + url.hash);
      }
    });
  }
  function selectLanguage(next, persist = true) {
    if (next !== 'en' && next !== 'pt') return;
    language = next;
    if (persist) {
      try { localStorage.setItem('portfolio-language', next); } catch { /* URL navigation still persists the choice. */ }
      const url = new URL(location.href);
      url.searchParams.set('lang', next);
      history.replaceState(null, '', url);
    }
    refresh();
    window.dispatchEvent(new CustomEvent('portfolio-language-change', { detail: { language } }));
    requestAnimationFrame(() => window.ScrollTrigger?.refresh());
  }
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => selectLanguage(button.dataset.language));
  });
  window.portfolioI18n = { t: translate, refresh, get language() { return language; } };
  selectLanguage(language, false);
})();
