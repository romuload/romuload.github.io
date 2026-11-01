# Romulo Nascimento | Portfólio UX

Site estático para https://romuload.github.io/.

## Visualizar

Execute `python3 -m http.server 4187` nesta pasta e abra http://localhost:4187.
Sem instalação ou compilação. GitHub Pages publica a raiz da branch `main`.

## Páginas

- `index.html`: projetos, abertura e carrossel de logos.
- `sobre.html`: apresentação e abordagem.
- `trabalhe-comigo.html`: contato.
- `projeto-repar.html`, `projeto-ilab.html`, `projeto-legado.html`, `projeto-games.html`: páginas descritivas com acesso às experiências.

Cada card tem somente duas ações, nesta ordem: Por dentro do projeto (página local) e Explorar o projeto (experiência pública em nova aba). As capas não são clicáveis. Os mockups em CSS usam capturas reais de desktop e celular.

## Recursos

- `styles.css`: layout responsivo, mockups, revelações e carrossel contínuo.
- `main.js`: revelação com IntersectionObserver, controle de pausa do carrossel e ano do rodapé.
- `images/`: retrato e capturas dos projetos. As capturas do iLab vêm do seu case; os demais projetos foram capturados em suas páginas públicas, inclusive em largura de 390px.
- `fonts/`: Manrope, hospedada localmente com licença SIL Open Font License.

O carrossel pode ser pausado pelo botão e ao passar o cursor. Movimento reduzido desativa a animação e mantém as três marcas visíveis. O conteúdo e a navegação funcionam sem JavaScript.

Direção visual inspirada na referência fornecida: https://www.irvingsuna.net/. Conteúdo, identidade e capturas próprios. Textos de apresentação e abordagem são propostas editoriais; nenhuma métrica de impacto ou participação específica foi presumida.

Logos: Petrobras proveniente do próprio repositório REPAR, com variante monocromática para fundo escuro; Porto do CDN oficial usado em https://www.portoseguro.com.br/; Itaú de https://commons.wikimedia.org/wiki/File:Itaú_Unibanco_logo_2023.svg. Marcas pertencem aos respectivos titulares.
