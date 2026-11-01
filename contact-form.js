(() => {
  'use strict';
  const form = document.getElementById('project-form');
  if (!form) return;
  const status = form.querySelector('.form-status');
  const t = text => window.portfolioI18n?.t(text) || text;
  // Option values stay in Portuguese so the WhatsApp message reads the same in both languages.
  const fields = [
    ['name', 'Nome'], ['email', 'E-mail'], ['phone', 'Telefone/WhatsApp'], ['company', 'Empresa'],
    ['size', 'Colaboradores'], ['website', 'Site'], ['type', 'Tipo de projeto'], ['budget', 'Orçamento'],
    ['deadline', 'Prazo'], ['details', 'Sobre o projeto']
  ];

  form.addEventListener('submit', event => {
    event.preventDefault();
    form.classList.add('was-validated');
    status.classList.remove('is-error');
    if (!form.checkValidity()) {
      status.textContent = t('Please fill in the required fields.');
      status.classList.add('is-error');
      form.querySelector(':invalid')?.focus();
      return;
    }
    const lines = fields
      .map(([id, label]) => [label, form.elements[id].value.trim()])
      .filter(([, value]) => value)
      .map(([label, value]) => `*${label}:* ${value}`);
    const message = ['Olá, Romulo! Quero começar um projeto.', '', ...lines].join('\n');
    const number = (form.dataset.whatsapp || '').replace(/\D/g, '');
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    // window.open returns null with the noopener feature, so detach the opener by hand.
    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
    else location.href = url;
    status.textContent = t('WhatsApp opened with your message. Just tap send.');
  });
})();
