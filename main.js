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
const projects = {
  repar: {
    title: 'Conheça a REPAR 3D', category: 'Petrobras · Experiência interativa',
    description: 'Uma nova versão do jogo Conheça a REPAR, criado originalmente em Flash em 2007. A experiência acompanha o petróleo em sua passagem pela refinaria.',
    sections: [
      ['A experiência', 'Uma maquete 3D modelada no Blender apresenta as unidades da refinaria. A câmera conduz o visitante por dez etapas, com perguntas e explicações sobre cada parte do processo.'],
      ['Interação e exploração', 'As tubulações se iluminam para mostrar as conexões entre as unidades. Além do percurso guiado, o modo de exploração permite navegar livremente pela maquete.']
    ], url: 'https://romuload.github.io/conheca_repar_versao3d/'
  },
  ilab: {
    title: 'iLab 3.0', category: 'Petrobras · UX/UI & prototipação',
    description: 'Protótipo do redesenho do módulo Minhas Consultas do iLab 3.0, com navegação de consultas, resultados e ajustes.',
    sections: [
      ['Do laboratório à interface', 'Uma bancada 3D interativa reúne amostras, ensaios e equipamentos. O protótipo conecta esse espaço à consulta de informações e resultados.'],
      ['Explorar o projeto', 'O case apresenta capturas reais do protótipo e sua narrativa de design. Os dados, amostras e e-mails usados na demonstração são fictícios. O case está em inglês.']
    ], url: 'https://romuload.github.io/ilab/case/'
  },
  legado: {
    title: 'Conheça a REPAR: legado', category: 'Petrobras · Memória digital',
    description: 'O jogo educativo da REPAR em uma versão para navegadores atuais, preservando a proposta de explicar como funciona a refinaria.',
    sections: [
      ['Um percurso em dez etapas', 'Ilustrações, perguntas e explicações acompanham o caminho do petróleo, do terminal marítimo aos produtos do refino.'],
      ['Duas formas de conhecer', 'A versão 2D permite revisitar a linguagem visual do projeto original. Ao lado da versão 3D, mostra diferentes formas de apresentar o mesmo conteúdo.']
    ], url: 'https://romuload.github.io/conheca_repar_legado/'
  },
  games: {
    title: 'Caça-Palavras REPAR', category: 'Petrobras · Games & aprendizagem',
    description: 'Criado originalmente para os 30 anos da REPAR, em 2007, o caça-palavras foi recriado para a web atual.',
    sections: [
      ['Um desafio de cinco minutos', 'Doze termos do universo da refinaria ficam escondidos em uma grade que muda a cada partida. O jogador pode encontrar palavras em oito direções.'],
      ['Do mouse ao toque', 'A seleção funciona arrastando entre as letras ou tocando nos dois extremos da palavra. Recordes e preferência de som ficam salvos no navegador.']
    ], url: 'https://romuload.github.io/caca-palavras/'
  }
};
const dialog = document.getElementById('project-dialog');
let trigger;
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projects[button.dataset.project];
    trigger = button;
    document.getElementById('dialog-category').textContent = project.category;
    document.getElementById('dialog-title').textContent = project.title;
    document.getElementById('dialog-description').textContent = project.description;
    const sections = document.getElementById('dialog-sections');
    sections.replaceChildren();
    project.sections.forEach(([title, description]) => {
      const heading = document.createElement('h3');
      const paragraph = document.createElement('p');
      heading.textContent = title;
      paragraph.textContent = description;
      sections.append(heading, paragraph);
    });
    document.getElementById('dialog-link').href = project.url;
    dialog.showModal();
    dialog.scrollTop = 0;
  });
});
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => trigger?.focus());
