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

## Correção da identidade e molduras de navegador

O cabeçalho combina o símbolo RN em `images/brand/rn-symbol.svg`, o nome Romulo Nascimento e o cargo Product Designer. O SVG foi reconstruído manualmente com curvas, sem fonte, imagem incorporada ou fundo. O favicon usa o mesmo desenho em `favicon.svg`; as versões PNG/ICO foram renderizadas a partir desse vetor. A imagem recortada anterior foi removida.

`mockups.css` define os viewports explícitos e isolados das capturas. O navegador desktop e a moldura Safari mobile têm barra de endereço com `romuload.github.io` e controles decorativos, fora da área da página. Desktop e celular ficam lado a lado, sem sobreposição, e as imagens são posicionadas de forma absoluta com `object-fit: contain`. As quatro capturas móveis da galeria foram refeitas em 390 × 700 para caber na área de conteúdo reservada abaixo da barra do navegador.

O carrossel inclui Petrobras, Itaú, Porto, Fiat, Thomson Reuters e Sonda IT, com tratamento monocromático branco. Fontes dos arquivos adicionais: SONDA no CDN do próprio site (https://www.sonda.com/ResourcePackages/Sonda2024/assets/dist/images/logos/logo-white-footer.svg), Fiat e Thomson Reuters nas páginas de arquivo do Wikimedia Commons. Ícones da moldura do navegador são do projeto Tabler Icons, com licença em `images/browser-icons/LICENSE.txt`.

## About page and spacing

The About page uses an editorial introduction, portrait and biography, icon-based skills and industry list, inspired by the structure of irvingsuna.net/about. Copy is specific to Romulo and available in English and Portuguese. Public LinkedIn recommendations informed the emphasis on user research, prototyping and collaborative UX leadership; unverified dates, job titles, awards and certifications are not included. The requested excluded sections are omitted.

Skill icons: Tabler Icons, MIT license (https://github.com/tabler/tabler-icons); the existing license in images/browser-icons/LICENSE.txt applies. Gallery row spacing is 128px on desktop, 112px on tablet and 88px on mobile.

## Unified REPAR case

The gallery lists Conhecer Repar 3D once. projeto-repar.html presents both the illustrated legacy version and the 3D evolution, using the iLab case palette and typography. The before/after range works with touch, mouse and keyboard, and both prototypes remain directly accessible. The former projeto-legado.html URL redirects to the unified comparison, retaining an explicit EN/PT selection. New narrative copy is bilingual and avoids unsupported outcome metrics.

## FIAT Água em Ciclo

The fourth gallery entry opens projeto-fiat.html, a bilingual case using the established case structure with FIAT-inspired red, white and dark tones. Desktop/mobile screenshots come from the live interactive project. The case links to the interactive water cycle and embeds the supplied YouTube landscape (n9-0C1eda_I) and portrait (c87ghSV32Y4) videos with responsive aspect ratios and direct YouTube links. Video files are not stored or uploaded with the site.
