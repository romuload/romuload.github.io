const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ctx = {window: {}};
vm.runInNewContext(fs.readFileSync('locale-data.js', 'utf8'), ctx);
const map = new Map();
for (const [en, pt] of ctx.window.PORTFOLIO_TRANSLATIONS) {
  assert(en.trim() && pt.trim(), 'Empty translation');
  map.set(en, {en, pt}); map.set(pt, {en, pt});
}
const names = [
  ['REPAR Word Search', 'Caça-Palavras REPAR'],
  ['FIAT · Water Cycle', 'FIAT · Água em Ciclo'],
  ['Explore REPAR 3D', 'Conhecer REPAR 3D']
];
for (const [en, pt] of names) {
  for (const source of [en, pt]) {
    assert.equal(map.get(source)?.en, en);
    assert.equal(map.get(source)?.pt, pt);
  }
  assert(fs.readFileSync('propostas.html', 'utf8').includes(`<h3>${en}</h3>`));
}
for (const file of ['index.html', 'propostas.html', 'sobre.html', 'trabalhe-comigo.html', 'projeto-ilab.html', 'projeto-repar.html', 'projeto-games.html', 'projeto-fiat.html', 'projeto-porto.html', 'projeto-staffing.html']) {
  const html = fs.readFileSync(file, 'utf8');
  assert(html.includes('data-language="en"') && html.includes('data-language="pt"'), `${file}: missing language switch`);
  assert(html.includes('locale-data.js?v=ilab-copy-1'), `${file}: stale dictionary version`);
}
console.log('Bilingual project titles, reverse translation, language selectors and dictionary versions: OK');

assert.equal(map.get("I’ve done work for")?.pt, "Já desenvolvi projetos para");
assert.equal(map.get("Já desenvolvi projetos para")?.en, "I’ve done work for");

const portoSource = fs.readFileSync('projeto-porto.html', 'utf8');
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const portoStrings = new Set([...portoSource.matchAll(/>([^<>]+)</g)].map(match => decode(match[1])));
for (const match of portoSource.matchAll(/(?:alt|aria-label|title|content)="([^"]+)"/g)) portoStrings.add(decode(match[1]));
const portoPairs = ctx.window.PORTFOLIO_TRANSLATIONS.filter(([en]) => portoStrings.has(en));
for(const [en] of portoPairs) {
 const pt = map.get(en).pt;
 assert.equal(map.get(en)?.pt, pt, `Missing Porto Portuguese copy: ${en}`);
 assert.equal(map.get(pt)?.en, en, `Porto language round-trip mismatch: ${pt}`);
}
const porto = fs.readFileSync('projeto-porto.html', 'utf8');
assert(porto.includes('id="porto-slider"'));
assert(porto.includes('From 45–60 min to about 25 min per claim, observed with five analysts.'));
assert(fs.readFileSync('index.html','utf8').includes('images/porto/screen-dashboard.webp') && fs.readFileSync('index.html','utf8').includes('class="laptop"'));
console.log('Porto copy, metric status, comparison and current laptop thumbnail: OK');

const processChapters = ['context', 'contribution', 'discovery', 'prototyping', 'solution', 'outcomes', 'vision'];
let previousChapter = -1;
for (const chapter of processChapters) {
 const position = porto.indexOf(`id="${chapter}"`);
 assert(position > previousChapter, `Porto chapter missing or out of order: ${chapter}`);
 previousChapter = position;
}
assert.equal((porto.match(/class="design-reasoning"/g) || []).length, 1);
for (const label of ['My contribution', 'Design direction', 'Approach & rationale', 'Evidence', 'Interpretation', 'Design decision', 'Validation approach', 'Design constraints']) {
 assert(map.get(label)?.pt && map.get(label).pt !== label, `Untranslated design process label: ${label}`);
}
console.log('Porto narrative order, evidence-to-decision reasoning and bilingual chapter labels: OK');

assert(!porto.includes('data-star='), 'Porto should use one narrative, without STAR chapter markers');
assert(porto.includes('<h3>Design constraints</h3>'), 'Preserve the pending English editorial change');
assert.equal((porto.match(/class="case-nav"/g) || []).length, 1);

for (const page of ['index.html', 'projeto-porto.html']) {
 const html = fs.readFileSync(page, 'utf8');
 assert(html.includes('href="https://romuload.github.io/porto-salerforce-demo/"'), `${page}: Porto demo link missing`);
 assert(!html.includes('View the design'), `${page}: stale Porto CTA`);
}
assert.equal(map.get('Explore the demo')?.pt, 'Explorar o demo');
assert(map.get('Explore the Porto Seguro demo in a new tab')?.pt);
console.log('Porto demo CTAs and bilingual accessible labels: OK');

const summary = porto.indexOf('id="case-summary-title"');
const credit = porto.indexOf('id="prototype-credit-title"');
assert(summary > 0 && summary < credit && credit < porto.indexOf('id="context"'), 'TL;DR and prototype credit must appear at the top of the case');
assert.equal(map.get('From Figma to code')?.pt, 'Do Figma ao código');
const prototypeCopy = 'In 2026, I returned to this project with today’s tools, which didn’t exist at the time. Starting from the Figma I already had, I built this working version with Claude Code in 2 hours. Try the four-step claims analysis.';
assert(porto.includes(prototypeCopy) && map.get(prototypeCopy)?.pt.includes('Claude Code'));
console.log('Porto TL;DR and Claude Code prototype credit: placement and EN/PT copy OK');

for (const file of fs.readdirSync('.').filter(name => name.endsWith('.html') && name !== 'projeto-legado.html')) {
 const html = fs.readFileSync(file, 'utf8');
 assert(html.includes('typography.css?v=ux-1') && html.includes('typography.js?v=audit-3'), `${file}: missing shared text wrapping`);
}
assert.equal(map.get('Design connecting business, technology and people.')?.pt, 'Design conectando negócios, tecnologia e pessoas.');
console.log('Editorial text wrapping and merged heading translations: OK');

// The unlisted transfer case must be fully bilingual, including metadata and image controls.
const transferFile = 'projeto-transferir-limites.html';
const transfer = fs.readFileSync(transferFile, 'utf8');
assert(!fs.readFileSync('index.html', 'utf8').includes(transferFile), 'Keep the transfer case off the home gallery until approved');
assert(transfer.includes('name="robots" content="noindex,follow"'));
assert(fs.readFileSync('locale.js', 'utf8').includes(transferFile), 'Preserve the selected language on transfer case navigation');
assert(transfer.includes('data-language="en"') && transfer.includes('data-language="pt"'));
const identity = new Set(['EN', 'PT', 'TL;DR', 'Romulo Nascimento', 'Product Designer', '2026', '©', '×', '© 2026 Romulo Nascimento', 'Latam Pass Black •••• 1226', 'R$']);
const strings = new Set([...transfer.matchAll(/>([^<>]+)</g)].map(match => decode(match[1])).filter(value => /[A-Za-zÀ-ÿ]/.test(value)));
for (const match of transfer.matchAll(/(?:alt|aria-label|title)="([^"]+)"/g)) if(match[1]) strings.add(decode(match[1]));
for (const match of transfer.matchAll(/<meta (?:name="description"|property="og:(?:title|description)") content="([^"]+)"/g)) strings.add(decode(match[1]));
for(const string of strings) {
 if(identity.has(string)) continue;
 assert(map.has(string), `Transfer case has untranslated content: ${string}`);
 const pair = map.get(string);
 assert.equal(map.get(pair.pt)?.en, pair.en, `Transfer case round-trip mismatch: ${string}`);
}
for (const image of ['hub.png','transfer.png']) assert(fs.statSync(`images/transferir-limites/${image}`).size > 0);
console.log('Transfer credit limits: all copy, metadata, controls and image labels bilingual; language navigation and unlisted home status OK');
for(const id of ['contribution','process']) assert(transfer.includes(`id="${id}"`), `Missing transfer design evidence: ${id}`);
for(const text of ['151s → 62s','customers with 3+ products','4.5 → 4.77','38,000 users','Claude throughout the design process']) assert(transfer.includes(text), `Missing transfer evidence or cohort context: ${text}`);
assert(transfer.includes('class="additional-results"') && transfer.includes('https://altarendablog.com.br/2026/03/09/'));
console.log('Transfer case: contribution, research scope, Claude process, outcome cohorts and public reference OK');

assert.equal(map.get('Customer Effort Score (CES)')?.pt, 'Índice de Esforço do Cliente (CES)');
assert(transfer.includes('id="evolution"') && transfer.includes('href="#evolution"'));
assert.equal((transfer.match(/class="evolution-version"/g)||[]).length,4,'Keep all four historical versions');
for(const name of ['2024-launch','2025-facelift','2025-overdraft','2026-experience']) {
 assert(transfer.includes(`images/transferir-limites/${name}.png`));
 assert(fs.statSync(`images/transferir-limites/${name}.png`).size>0);
}
console.log('Transfer evolution: four dated versions, original assets, bilingual captions and controls OK');

assert(fs.readFileSync('index.html', 'utf8').includes('<h1>Design connecting business, technology and people.</h1>'), 'Preserve Romulo’s approved home headline');

// Opening story must agree with the donor shown throughout the functional example.
assert(/class="tm-card credit[^\n]+Insufficient credit limit/.test(transfer));
assert(/class="tm-card overdraft[^\n]+Excess credit limit/.test(transfer));
const motion = fs.readFileSync('transfer-motion.js', 'utf8');
assert(motion.includes('scaleX: 842 / 1376') && motion.includes('scaleX: 368 / 688'));
assert(fs.readFileSync('transfer-motion.css','utf8').includes('transform-origin:100% 50%'));
console.log('Transfer motion: card needs limit; overdraft donates; opening bars match updated Figma frames');

const homeGallery = fs.readFileSync('index.html', 'utf8');
const proposalsGallery = fs.readFileSync('propostas.html', 'utf8');
assert.equal((homeGallery.match(/<article class="project reveal">/g)||[]).length, 3);
assert.equal((proposalsGallery.match(/<article class="project reveal">/g)||[]).length, 5);
for (const file of ['projeto-motion.html','projeto-porto.html','projeto-staffing.html']) assert(homeGallery.includes(`href="${file}"`));
for (const file of ['projeto-roadmap.html','projeto-repar.html','projeto-ilab.html','projeto-games.html','projeto-fiat.html']) {
 assert(!homeGallery.includes(`href="${file}"`));
 assert(proposalsGallery.includes(`href="${file}"`));
}
for(const label of ['Proposals','Case studies — recent work','Proposals and studies with AI','Proposals | Romulo Nascimento']) {
 assert(map.get(label)?.pt); assert.equal(map.get(map.get(label).pt)?.en,label);
}
assert(fs.readFileSync('locale.js','utf8').includes("'propostas.html'"));
assert(!proposalsGallery.includes('href="projeto-transferir-limites.html"'));
console.log('Recent case studies / proposals split, bilingual headings and language-preserving navigation: OK');

assert(map.get("Real projects from my career, revisited with the experience I bring today and AI tools to explore new possibilities for the user experience.")?.pt === "Projetos reais em que trabalhei ao longo da minha carreira, revisitados com a experi\u00eancia que tenho hoje e o apoio de ferramentas de IA para explorar novas possibilidades de experi\u00eancia.");
let proposalPosition = -1;
for (const file of ["projeto-roadmap.html","projeto-ilab.html","projeto-repar.html","projeto-games.html","projeto-fiat.html"]) { const next = proposalsGallery.indexOf(`href="${file}"`); assert(next > proposalPosition); proposalPosition = next; }

assert(homeGallery.includes("How I connect strategy, design and technology to solve complex problems and deliver results for people and businesses."));
assert.equal(map.get("How I connect strategy, design and technology to solve complex problems and deliver results for people and businesses.")?.pt, "Como conecto estrat\u00e9gia, design e tecnologia para resolver problemas complexos e gerar resultados para pessoas e neg\u00f3cios.");

assert(proposalsGallery.includes("image-ilab laptop-stage"));
assert(proposalsGallery.includes("images/ilab-case/d-bancada.jpg"));
assert(map.get("iLAB 3.0: 3D laboratory on desktop and mobile in laptop and phone mockups")?.pt);

for (const [en,pt] of [["From a query system to an interactive 3D laboratory", "De um sistema de consultas a um laboratório 3D interativo"], ["A proposal for iLAB that connects samples, results and equipment on a virtual bench, making lab analysis easier to follow.", "Uma proposta para o iLAB que conecta amostras, resultados e equipamentos em uma bancada virtual, tornando o acompanhamento das análises mais visual e direto."], ["Inside the project: From a query system to an interactive 3D laboratory", "Por dentro do projeto: De um sistema de consultas a um laboratório 3D interativo"]]) { assert(proposalsGallery.includes(en)); assert.equal(map.get(en)?.pt,pt); assert.equal(map.get(pt)?.en,en); }
