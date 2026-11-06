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

Cada card tem somente duas ações, nesta ordem: Por dentro do projeto (página local) e Explorar o projeto (experiência pública em nova aba). As capas não são clicáveis. As capas usam um mockup de iPhone em CSS com capturas reais da versão mobile.

## Recursos

- `styles.css`: layout responsivo, mockups, revelações e carrossel contínuo.
- `main.js`: revelação com IntersectionObserver, controle de pausa do carrossel e ano do rodapé.
- `images/`: retrato e capturas dos projetos. As capturas do iLAB vêm do seu case; os demais projetos foram capturados em suas páginas públicas, inclusive em largura de 390px.
- `fonts/`: Manrope, hospedada localmente com licença SIL Open Font License.

O carrossel pode ser pausado pelo botão e ao passar o cursor. Movimento reduzido desativa a animação e mantém as três marcas visíveis. O conteúdo e a navegação funcionam sem JavaScript.

## Idiomas e case iLAB

O HTML é entregue em inglês. O seletor EN / PT traduz o texto editorial, navegação, botões, títulos, metadados e descrições acessíveis. `locale-data.js` contém os pares de texto; `locale.js` aplica a escolha, salva a preferência quando possível e a mantém nos links internos com `?lang=en` ou `?lang=pt`. Os protótipos externos e suas capturas preservam o conteúdo original.

Para novos conteúdos, escreva o HTML em inglês e acrescente seu par inglês/português em `locale-data.js`. Inclua também os rótulos de acessibilidade e metadados. O idioma padrão não depende do idioma do navegador. Sem JavaScript, o conteúdo em inglês continua legível e a navegação funciona.

`projeto-ilab.html` integra as dez seções do case original de https://romuload.github.io/ilab/case/, com imagens locais em `images/ilab-case/`, logo em `ilab-logo.js`, comparação antes/depois e narrativa por scroll. Pesquisa, atuação e resultado de infraestrutura reproduzem o material já existente do autor. O nome foi ajustado para Romulo Nascimento. A navegação e o seletor conectam o case ao portfólio; os botões de exploração continuam abrindo o protótipo original.

## Correção da identidade e molduras de navegador

O cabeçalho combina o avião de papel simplificado, só contorno, de `images/brand/paper-plane.svg`, o nome Romulo Nascimento e o cargo Product Designer. O SVG foi desenhado à mão, sem fonte, imagem incorporada ou fundo. O favicon usa o mesmo avião em `favicon.svg`; as versões PNG/ICO foram renderizadas a partir desse vetor. A imagem recortada anterior foi removida.

As capas da página inicial usam `phone-mockup.css`: um único iPhone por card, com borda de titânio, Dynamic Island, barra de status e barra flutuante do Safari com `romuload.github.io`. As capturas ficam em `images/phone/` e foram feitas em 390 × 790 px a 2x (a área visível do Safari abaixo da barra de status), por isso preenchem a tela sem cortes. `mockups.css` continua definindo as molduras de navegador usadas nas páginas internas. A capa da Porto Seguro é a exceção: `laptop-mockup.css` mostra um notebook com Safari e a captura desktop do demo.

O carrossel inclui Petrobras, Itaú, Porto, Fiat, Thomson Reuters e Sonda IT, com tratamento monocromático branco.

## About page and spacing

The About page uses an editorial introduction, portrait and biography, icon-based skills and industry list. Copy is specific to Romulo and available in English and Portuguese. Public LinkedIn recommendations informed the emphasis on user research, prototyping and collaborative UX leadership; unverified dates, job titles, awards and certifications are not included. The requested excluded sections are omitted.

Skill icons: Tabler Icons, MIT license (https://github.com/tabler/tabler-icons); the existing license in images/browser-icons/LICENSE.txt applies. Gallery row spacing is 128px on desktop, 112px on tablet and 88px on mobile.

## Unified REPAR case

The gallery lists Conhecer REPAR 3D once. projeto-repar.html presents both the illustrated legacy version and the 3D evolution, using the iLAB case palette and typography. The before/after range works with touch, mouse and keyboard, and both prototypes remain directly accessible. The former projeto-legado.html URL redirects to the unified comparison, retaining an explicit EN/PT selection. New narrative copy is bilingual and avoids unsupported outcome metrics.

## FIAT Água em Ciclo

The fourth gallery entry opens projeto-fiat.html, a bilingual case using the established case structure with FIAT-inspired red, white and dark tones. Desktop/mobile screenshots come from the live interactive project. The case links to the interactive water cycle and embeds the supplied YouTube landscape (n9-0C1eda_I) and portrait (c87ghSV32Y4) videos with responsive aspect ratios and direct YouTube links. Video files are not stored or uploaded with the site.

## Porto Seguro

projeto-porto.html uses the same scroll motion as the iLAB case (GSAP + ScrollTrigger from cdnjs, in `porto-case.js`): staggered reveals, the hero product straightening on scroll, counting figures, a one-time before/after sweep and, on screens wider than 1050px, sticky desktop and phone screens that change with the text. Reduced motion or no JavaScript leaves every element visible and static. Screens in `images/porto/screen-*.webp` (1440 × 900) and `mobile-*.webp` (390 × 790) are 2x captures of https://romuload.github.io/porto-salerforce-demo/.

## Porto Seguro legacy workflow animation

In the context section of projeto-porto.html, the static legacy task list is replaced by an interactive animation (`porto-legacy-flow/index.html`) embedded in an iframe. It shows how an analyst pieced a claim together in the legacy system: task queue, basic data, damaged property, Google Maps and Street View, with a text file filling up alongside. It autoplays when it scrolls into view, pauses when it leaves, and has step controls (prev/next, play/pause, a button per step, ← → and space). With reduced motion it does not autoplay. The page follows the portfolio EN/PT switch by reading the parent page's `lang`, falling back to `?lang=` and the saved preference when opened on its own. Frames are in `images/porto/legacy-flow/` (1672 × 941 WebP); personal data on the basic data screen is blurred in the image itself. `images/porto/legacy-tasks.webp` is still used by the before/after comparison.

Case figures come from the discovery blueprint delivered to Porto Seguro in March 2024 (14 days, 382 pain points and business rules, 111 people, 56 hours, 135 MVP backlog items, 28 artifacts). Partner and internal system names are generalized (for example, "external service provider"); internal links, credentials and participant names from the source material are never published.

## Porto Seguro discovery section

The discovery section embeds `porto-journey-map/index.html`, an interactive friction map of the end-to-end claim journey (notice, analysis, regulation, approval & settlement, salvage). Each stage shows key steps, systems and tools (tools outside the core system highlighted), pain points tagged by friction type, the discovery personas and the TO-BE opportunity with capabilities from the blueprint's capability map. Interactions: stage buttons, prev/next and arrow keys, a guided tour, a friction-type filter that draws a thread across the stages where that friction appears, and an AS-IS / TO-BE switch. When a stage depends on tools outside the system, the claim marker leaves the rail briefly. Content is synthesized from the AS-IS journey maps; personas are the fictional discovery profiles and system/partner names are generalized. The page sizes its own iframe when embedded (same origin) and follows the EN/PT switch. The legacy workflow animation sits after "From observations to priorities"; the Miro workshop, agreements, journey and process-map images were removed from the page and the repository.

Porto hero and context: the title leads with the result ("How I cut claims analysis from up to 60 minutes to about 25 at Porto Seguro"), the client line describes Porto (Brazil's largest auto insurer, ~14,000 employees per Porto's investor relations page) and the context explains how Azul (acquired 2003), Itaú Auto e Residência (Itaú Unibanco partnership since 2009) and Mitsui Sumitomo's auto business (strategic partnership) relate to the group. The Prototyping & constraints section tells the OmniScript pivot in three steps (first migrated version, the question, the turning point).

Scroll triggers on the Porto case: CSS smooth scrolling breaks ScrollTrigger's measurements (it jumps to the top and back while measuring), so `porto-case.js` sets instant scrolling on this page and scrolls in-page links smoothly with JS, checking that the section was reached. Triggers are also recalculated whenever the page height changes (the embedded journey map and legacy workflow settle their height after load), which keeps the sticky solution screens in sync with the text.


Guided analysis motion: the former mobile handoff section is replaced by `porto-guided-flow/index.html`, an interactive animation of the four-step OmniScript analysis (dashboard → claim list → case → Analyze → Notice, Policy, Summary, Opinion → completed). Frames in `images/porto/guided-flow/` are full-page captures of the demo (fictitious data) at 1440×810 CSS px; the page scrolls inside the window and the fixed utility bar is overlaid. Same player, controls and EN/PT behaviour as the legacy workflow animation.

Porto case structure (restructured for a linear story, ~1,100 words): hero with a three-line summary (problem · what I did · result) → context and the legacy workflow animation → my role, principles and constraints → discovery figures and the journey friction map → the turning point (first migration, the question, four steps with OmniScript) → the delivered guided analysis motion → outcomes and method → the full proposal (before/after and sticky screens, tagged Implemented / Proposal; backlog for the GFT team) → reflections. The former Direction, Approach, Content design and Validation sections were folded into these or removed.

## Thomson Reuters roadmap proposal

projeto-roadmap.html uses the projeto-repar.html structure and repar-case.js, with Thomson Reuters colours in `roadmap-case.css`. The opportunity section holds an interactive review panel (`roadmap-panel.js`): a concept with example items, no tool connected, where the published side only changes after an approval. The home cover combines the laptop and phone mockups (`.image-roadmap` in `porto-gallery.css`). Screens in `images/roadmap/` and `images/phone/roadmap.jpg` are 2x captures of https://romuload.github.io/roadmap-tr/ and https://roadmap.thomsonreuters.com/reforma_2026.html. It is described only as a proposal, and the demo states it is not an official Thomson Reuters website.

## Itaú · Motion in acts

`projeto-motion.html` tells how the Itaú motion language was decoded into nine acts with Claude, validated on the public Transfer Limits tutorial, tested on the fictional Pix Agendado subject, then rebuilt as a skill and an agent in Microsoft Copilot. Styles in `motion-case.css`, behaviour in `motion-case.js` (act chip and act ribbon synced to the test video, play-both control, pause for the looping movement specimens, and the agent conversation played step by step in a Teams-style window, in sync with the list of steps; reduced motion shows the finished conversation and stops every loop). The eight specimens are CSS animations, not video.

Media in `images/motion/`: the public tutorial (720p, from the bank's YouTube video) and its recreation, shown side by side in the validation section, the Pix Agendado test video, posters and stills. `motion-pix-agendado/index.html` is the self-contained interactive demo (Watch / Try modes). The gallery cover uses `motion-gallery.css`: the test video loops on an orange-to-black gradient, with the same proportions as the laptop covers. The page uses `locale-data.js?v=motion-1`; the act name "Action" is translated in `motion-case.js` because the shared dictionary already maps it to "Ações".

`projeto-transferir-limites.html` is an unlisted Itaú case (noindex, no card on the home). The hero phone and the motion in the Solution section rebuild the Figma screens as live layers, in `transfer-motion.css` and `transfer-motion.js` (a GSAP timeline on a 1920×1080 canvas, cropped to its centre column below 700px, with amounts rendered per language). The final illustrations come from the same Figma file; `images/transferir-limites/motion/all-set.svg` is loaded as a file and the wallet, card and loader are inlined so their parts can move. Reveals, counters and reading progress live in `transferir-limites-case.js`.
