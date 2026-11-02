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
  ['Explore REPAR 3D', 'Conhecer Repar 3D']
];
for (const [en, pt] of names) {
  for (const source of [en, pt]) {
    assert.equal(map.get(source)?.en, en);
    assert.equal(map.get(source)?.pt, pt);
  }
  assert(fs.readFileSync('index.html', 'utf8').includes(`<h3>${en}</h3>`));
}
for (const file of ['index.html', 'sobre.html', 'trabalhe-comigo.html', 'projeto-ilab.html', 'projeto-repar.html', 'projeto-games.html', 'projeto-fiat.html', 'projeto-porto.html']) {
  const html = fs.readFileSync(file, 'utf8');
  assert(html.includes('data-language="en"') && html.includes('data-language="pt"'), `${file}: missing language switch`);
  assert(html.includes('locale-data.js?v=porto-screens-6'), `${file}: stale dictionary version`);
}
console.log('Bilingual project titles, reverse translation, language selectors and dictionary versions: OK');

assert.equal(map.get("I’ve done work for")?.pt, "Já desenvolvi projetos para");
assert.equal(map.get("Já desenvolvi projetos para")?.en, "I’ve done work for");

const portoPairs = ctx.window.PORTFOLIO_TRANSLATIONS.filter(([en]) => fs.readFileSync('projeto-porto.html', 'utf8').includes(en));
for(const [en] of portoPairs) {
 const pt = map.get(en).pt;
 assert.equal(map.get(en)?.pt, pt, `Missing Porto Portuguese copy: ${en}`);
 assert.equal(map.get(pt)?.en, en, `Porto language round-trip mismatch: ${pt}`);
}
const porto = fs.readFileSync('projeto-porto.html', 'utf8');
assert(porto.includes('id="porto-slider"'));
assert(porto.includes('Provisional impact figures.'));
assert(fs.readFileSync('index.html','utf8').includes('images/phone/porto-demo.jpg'));
console.log('Porto copy, metric status, comparison and current iPhone thumbnail: OK');

const processChapters = ['context', 'contribution', 'direction', 'approach', 'discovery', 'content-design', 'prototyping', 'validation', 'solution', 'comparison', 'outcomes'];
let previousChapter = -1;
for (const chapter of processChapters) {
 const position = porto.indexOf(`id="${chapter}"`);
 assert(position > previousChapter, `Porto chapter missing or out of order: ${chapter}`);
 previousChapter = position;
}
assert.equal((porto.match(/class="design-reasoning"/g) || []).length, 3);
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
