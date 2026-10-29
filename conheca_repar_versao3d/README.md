# Conheça a REPAR – Como Funciona (versão 3D)

Versão 3D do jogo "Conheça a REPAR", feito originalmente em Flash (2007) para mostrar como funciona a
Refinaria Presidente Getúlio Vargas. As 10 perguntas, as explicações e a pontuação são as do jogo original;
as cenas em SVG foram trocadas por uma maquete 3D da refinaria modelada no Blender.

## Como jogar
Abra `index.html` (ou a página publicada no GitHub Pages). Em cada etapa a câmera voa até a unidade,
as tubulações daquela etapa acendem e o técnico faz a pergunta. Acerto: +100 · erro: −50.
Depois do jogo, "Explorar a refinaria" permite navegar livremente pela maquete.

## Estrutura
- `index.html` — o jogo (Three.js + GSAP via CDN).
- `css/jogo3d.css` — estilos.
- `js/perguntas.js` — etapas, perguntas, alternativas e explicações.
- `js/cenas.js` — desenho do técnico (reaproveitado da versão 2D).
- `modelo/repar_glb.js` — maquete 3D (glTF com compressão Draco) embutida em JavaScript, para abrir sem servidor.
- `geral.html` / `geral.gif` — infográfico original "Conheça todo o processo".

Precisa de internet para carregar Three.js, GSAP e as fontes.
