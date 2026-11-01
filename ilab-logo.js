/* Logo iLAB: o "A" é um Erlenmeyer de contorno verde com líquido âmbar e bolhas saindo do gargalo.
   <ilab-logo> herda o tamanho do texto. Passar o mouse faz as bolhas subirem e o líquido ondular;
   clicar faz o líquido balançar e o pingo do "i" quicar. Atributo "empty" começa sem líquido
   (a abertura enche com .fill()). */
(() => {
  const css = `
ilab-logo{display:inline-flex;align-items:baseline;font-weight:800;letter-spacing:-.04em;line-height:1;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;color:#0B5A3A}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) ilab-logo{color:#EEF4F0}:root:not([data-theme="light"]) ilab-logo .lg-glass{stroke:currentColor}}
:root[data-theme="dark"] ilab-logo{color:#EEF4F0}
:root[data-theme="dark"] ilab-logo .lg-glass,ilab-logo[on-dark] .lg-glass{stroke:currentColor}
ilab-logo[on-dark]{color:#fff}
ilab-logo>span{display:inline-block}
ilab-logo .lg-i{position:relative}
ilab-logo .lg-i i{position:absolute;left:50%;bottom:.76em;width:.22em;height:.22em;margin-left:-.095em;border-radius:50%;background:radial-gradient(circle at 35% 30%,#9BE15D,#4CAF2E 70%)}
ilab-logo .lg-a{height:.74em;width:auto;overflow:visible;margin:0 .01em 0 .03em}
ilab-logo .lg-glass{stroke-width:3.4;fill:none;stroke-linecap:round;stroke-linejoin:round}
ilab-logo .lg-liq,ilab-logo .lg-fill,ilab-logo .lg-wave,ilab-logo .lg-up{transform-box:view-box}
ilab-logo .lg-liq{transform-origin:16px 22px}
ilab-logo .lg-fill{transition:transform 1.1s cubic-bezier(.3,1.35,.5,1)}
ilab-logo[empty] .lg-fill{transform:translateY(12px)}
ilab-logo .lg-wave{animation:lg-wave 4s linear infinite}
ilab-logo:hover .lg-wave{animation-duration:1.2s}
ilab-logo:hover .lg-up{animation:lg-rise 1.5s ease-out infinite}
ilab-logo:hover .lg-up:nth-of-type(2){animation-delay:.5s}
ilab-logo:hover .lg-up:nth-of-type(3){animation-delay:1s}
ilab-logo.lg-slosh .lg-liq{animation:lg-slosh 1.1s cubic-bezier(.3,.7,.4,1)}
ilab-logo.lg-slosh .lg-i i{animation:lg-hop .7s cubic-bezier(.3,.7,.4,1)}
@keyframes lg-wave{to{transform:translateX(14px)}}
@keyframes lg-rise{0%{transform:translateY(7px);opacity:0}25%{opacity:1}100%{transform:translateY(-5px);opacity:0}}
@keyframes lg-slosh{0%{transform:rotate(0)}18%{transform:rotate(-14deg)}40%{transform:rotate(10deg)}60%{transform:rotate(-5deg)}80%{transform:rotate(2deg)}100%{transform:rotate(0)}}
@keyframes lg-hop{0%,100%{transform:translateY(0)}35%{transform:translateY(-.22em) scaleY(1.12)}65%{transform:translateY(0) scale(1.15,.85)}}
@media (prefers-reduced-motion:reduce){ilab-logo .lg-wave,ilab-logo:hover .lg-up,ilab-logo.lg-slosh .lg-liq,ilab-logo.lg-slosh .lg-i i{animation:none}ilab-logo .lg-fill{transition:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // contorno do frasco (linha central do traço): borda, gargalo e corpo triangular, como um "A"
  const GLASS = 'M10.6 1.7H12.6V10.2L3 24.8Q1.6 28.3 5.4 28.3H26.6Q30.4 28.3 29 24.8L19.4 10.2V1.7H21.4';
  // área do líquido recuada do vidro: o respiro claro entre contorno e líquido
  const CLIP = 'M16 7.6L6.4 22.7Q5.1 25 7.7 25H24.3Q26.9 25 25.6 22.7Z';
  // superfície ondulada; desliza 14 unidades = um período
  const WAVE = 'M-28 15.2q3.5 -1.7 7 0' + 't7 0'.repeat(12) + 'V32H-28Z';
  let n = 0;

  class ILabLogo extends HTMLElement {
    connectedCallback() {
      if (this._ok) return; this._ok = true;
      const id = 'ilab-lg' + (++n);
      this.setAttribute('role', 'img'); if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'iLAB');
      this.innerHTML = `<span class="lg-i" aria-hidden="true">ı<i></i></span><span aria-hidden="true">L</span>`
        + `<svg class="lg-a" viewBox="0 0 32 30" aria-hidden="true"><defs>`
        + `<clipPath id="${id}c"><path d="${CLIP}"/></clipPath>`
        + `<linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC928"/><stop offset=".5" stop-color="#FFA313"/><stop offset="1" stop-color="#FF8000"/></linearGradient>`
        + `<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#36B05E"/><stop offset="1" stop-color="#0B5A3A"/></linearGradient>`
        + `<radialGradient id="${id}b" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#FFD54A"/><stop offset="1" stop-color="#FF9300"/></radialGradient></defs>`
        + `<g clip-path="url(#${id}c)"><g class="lg-fill"><g class="lg-liq"><path class="lg-wave" fill="url(#${id}l)" d="${WAVE}"/>`
        + `<circle cx="14" cy="21.5" r="1.1" fill="#FFF3C8" opacity=".85"/><circle cx="18.5" cy="19.6" r=".7" fill="#FFF3C8" opacity=".8"/></g></g></g>`
        + `<circle cx="16.4" cy="12.6" r="1.25" fill="url(#${id}b)" opacity=".9"/>`
        + `<path class="lg-glass" stroke="url(#${id}s)" d="${GLASS}"/>`
        + `<g fill="url(#${id}b)"><circle class="lg-up" cx="17" cy="-2.6" r="1.7"/><circle class="lg-up" cx="21.6" cy="-6.6" r="2.3"/><circle class="lg-up" cx="18" cy="-11.4" r="1.5"/></g>`
        + `</svg><span aria-hidden="true">B</span>`;
      this.addEventListener('click', () => this.slosh());
    }
    slosh() { this.classList.remove('lg-slosh'); void this.offsetWidth; this.classList.add('lg-slosh'); clearTimeout(this._t); this._t = setTimeout(() => this.classList.remove('lg-slosh'), 1200); }
    fill() { this.removeAttribute('empty'); }
    // mesmo desenho num <canvas> (etiquetas e telas da cena 3D). y é a linha de base; devolve a largura.
    static draw(g, x, y, size, o = {}) {
      const ink = o.ink || '#0B5A3A', ls = -.04 * size, x0 = x, h = .74 * size, k = h / 30;
      g.save(); g.font = `800 ${size}px Inter, sans-serif`; g.textBaseline = 'alphabetic'; g.fillStyle = ink;
      const wi = g.measureText('ı').width; g.fillText('ı', x, y);
      const dot = g.createRadialGradient(0, 0, 0, 0, 0, .11 * size), cx = x + (wi + ls) / 2 + .015 * size, cy = y - .733 * size;
      dot.addColorStop(0, '#9BE15D'); dot.addColorStop(1, '#4CAF2E');
      g.save(); g.translate(cx - .03 * size, cy - .03 * size); g.fillStyle = dot; g.beginPath(); g.arc(.03 * size, .03 * size, .11 * size, 0, 7); g.fill(); g.restore();
      x += wi + ls; g.fillText('L', x, y); x += g.measureText('L').width + ls + .03 * size;
      g.save(); g.translate(x, y - h); g.scale(k, k);
      const liq = g.createLinearGradient(0, 14, 0, 26); liq.addColorStop(0, '#FFC928'); liq.addColorStop(1, '#FF8000');
      g.save(); g.clip(new Path2D(CLIP)); g.fillStyle = liq; g.fill(new Path2D(WAVE)); g.restore();
      let st = o.glass; if (!st) { st = g.createLinearGradient(0, 0, 32, 30); st.addColorStop(0, '#36B05E'); st.addColorStop(1, '#0B5A3A'); }
      g.lineWidth = 3.4; g.lineCap = g.lineJoin = 'round'; g.strokeStyle = st; g.stroke(new Path2D(GLASS));
      g.fillStyle = '#FFA51F'; [[17, -2.6, 1.7], [21.6, -6.6, 2.3], [18, -11.4, 1.5]].forEach(([a, b, r]) => { g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); });
      g.restore();
      x += 32 * k + .01 * size; g.fillStyle = ink; g.fillText('B', x, y); x += g.measureText('B').width;
      g.restore(); return x - x0;
    }
  }
  customElements.define('ilab-logo', ILabLogo);
})();
