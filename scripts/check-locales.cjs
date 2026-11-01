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
  assert(html.includes('locale-data.js?v=porto-star-1'), `${file}: stale dictionary version`);
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
assert(fs.readFileSync('index.html','utf8').includes('images/phone/porto.jpg'));
console.log('Porto STAR copy, metric status, comparison and current iPhone thumbnail: OK');
