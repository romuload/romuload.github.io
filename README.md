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

## Idiomas e case iLab

O HTML é entregue em inglês. O seletor EN / PT traduz o texto editorial, navegação, botões, títulos, metadados e descrições acessíveis. `locale-data.js` contém os pares de texto; `locale.js` aplica a escolha, salva a preferência quando possível e a mantém nos links internos com `?lang=en` ou `?lang=pt`. Os protótipos externos e suas capturas preservam o conteúdo original.

Para novos conteúdos, escreva o HTML em inglês e acrescente seu par inglês/português em `locale-data.js`. Inclua também os rótulos de acessibilidade e metadados. O idioma padrão não depende do idioma do navegador. Sem JavaScript, o conteúdo em inglês continua legível e a navegação funciona.

`projeto-ilab.html` integra as dez seções do case original de https://romuload.github.io/ilab/case/, com imagens locais em `images/ilab-case/`, logo em `ilab-logo.js`, comparação antes/depois e narrativa por scroll. Pesquisa, atuação e resultado de infraestrutura reproduzem o material já existente do autor. O nome foi ajustado para Romulo Nascimento. A navegação e o seletor conectam o case ao portfólio; os botões de exploração continuam abrindo o protótipo original.
