const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..'), cache = {};
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
function compile(file, requireModule) {
  const mod = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText;
  new Function('require', 'module', 'exports', code)(requireModule, mod, mod.exports);
  return mod.exports;
}
function load(file) {
  file = path.resolve(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!cache[file]) cache[file] = compile(file, name => name.startsWith('.')
    ? load(path.resolve(path.dirname(file), name) + (name.endsWith('.json') ? '' : '.ts')) : require(name));
  return cache[file];
}
const lib = name => load(path.join(root, 'lib', name + '.ts'));
const {catalog} = lib('catalog');
const {visitFacts} = lib('visit-facts');
const {matchesCondition} = lib('rest-conditions');
const {candidateReasons, essentialDetails} = lib('place-presentation');
const files = {
  'kr-sayuwon': 'lib/rest-catalog.json',
  'kr-osulloc-tea-stone': 'lib/rest-catalog.json',
  'world-au-royal-botanic-garden-sydney': 'lib/expanded-catalog.json',
  'world-nz-wellington-botanic-garden': 'lib/expanded-catalog.json',
  'jp-kyoto-ryoanji-temple': 'lib/jp-catalog.json',
  'world-gb-royal-botanic-gardens-kew': 'lib/expanded-catalog.json',
};
const ids = Object.keys(files), find = id => catalog.find(place => place.id === id);
const detail = (place, label) => place.visitDetails.find(item => item.labelEn === label);
const localized = (item, language) => item[language === 'ko' ? 'textKo' : 'textEn'];
const escaped = value => renderToStaticMarkup(React.createElement('span', null, value)).slice(6, -7);
const https = value => assert.equal(new URL(value).protocol, 'https:');
const reasons = read('lib/recommendation-evidence.json');
let rows = 0, coordinateRows = 0, reasonCount = 0;
for (const id of ids) {
  const place = find(id), source = read(files[id]).find(record => record.id === id);
  assert(place, id);
  assert.equal(place.detailLevel, 'enriched');
  assert.equal(place.checked, '2026-10-07');
  assert.deepEqual(place.visitDetails, source.visitDetails, id + ' final merged details');
  assert.deepEqual(place.visitFacts, source.visitFacts, id + ' final structured facts');
  assert.deepEqual(place.recommendationReasons, reasons[id], id + ' recommendation overlay');
  assert.equal(new Set(place.visitDetails.map(row => row.labelEn)).size, place.visitDetails.length);
  for (const row of place.visitDetails) {
    assert(row.textKo && row.textEn && row.labelKo && row.labelEn);
    https(row.source);
    assert.equal(row.checked, row.labelEn === 'Location reference' ? '2026-10-02' : '2026-10-07');
    for (const source of row.additionalSources || []) https(source.url);
    row.labelEn === 'Location reference' ? coordinateRows++ : rows++;
  }
  for (const fact of Object.values(visitFacts(place))) {
    https(fact.source);
    assert.equal(fact.checked, '2026-10-07');
    assert(fact.textKo && fact.textEn);
  }
  for (const reason of candidateReasons(place)) {
    https(reason.source);
    assert.equal(reason.checked, '2026-10-07');
    assert(['operator', 'tourism'].includes(reason.sourceKind));
    reasonCount++;
  }
  assert.equal(visitFacts(place).seating, undefined, 'generic seating must not infer individual seats');
  for (const kind of ['soloSeats', 'privateRoom', 'quietMusic', 'partitions']) assert(!matchesCondition(place, kind), id + ' unsupported condition ' + kind);
  assert(essentialDetails(place).some(row => /price|admission/i.test(row.labelEn)), id + ' real cost detail, not a fallback');
}
assert.equal(rows, 40); assert.equal(coordinateRows, 3); assert.equal(reasonCount, 9);
const sayuwon = find(ids[0]), osulloc = find(ids[1]), sydney = find(ids[2]), wellington = find(ids[3]), ryoanji = find(ids[4]), kew = find(ids[5]);
assert.equal(visitFacts(sayuwon).price.amount, undefined, 'KTO amount varies by date and booking');
assert(detail(sayuwon, 'Admission').textEn.includes('KTO') && detail(sayuwon, 'Admission').textEn.includes('69,000'));
assert(detail(sayuwon, 'Booking').textEn.includes('capacity remains'));
assert(detail(sayuwon, 'Age and access').textEn.includes('0–7'));
assert.equal(visitFacts(osulloc).price.amount, 60000);
assert.equal(visitFacts(osulloc).price.basis, 'experience');
assert.equal(visitFacts(osulloc).parking, undefined);
assert.equal(detail(osulloc, 'Hours'), undefined, 'museum hours are not tea-course sessions');
assert(detail(osulloc, 'Museum hours').textEn.includes('separate'));
assert(detail(osulloc, 'Space use').textEn.includes('does not establish exclusive-room use'));
assert.equal(visitFacts(sydney).price.amount, 0);
assert.equal(visitFacts(sydney).parking.status, 'nearby');
assert(!matchesCondition(sydney, 'parking'), 'nearby parking is not on-site');
assert.equal(visitFacts(wellington).price.amount, 0);
for (const place of [sydney, wellington]) assert.equal(visitFacts(place).price.basis, 'admission');
for (const place of [sayuwon, wellington, ryoanji, kew]) assert.equal(visitFacts(place).parking.status, 'available');
assert(detail(wellington, 'Hours').textEn.includes('dawn to dusk'));
assert(detail(wellington, 'Closures').textEn.includes('Begonia House is closed'));
assert(detail(wellington, 'Accessibility').textEn.includes('hilly'));
assert.equal(visitFacts(ryoanji).price.amount, 600);
assert(detail(ryoanji, 'Accessibility').textEn.includes('Staff guide'));
assert.equal(visitFacts(kew).price.amount, undefined, 'seasonal Kew rates are not timeless');
assert(detail(kew, 'Admission').textEn.includes('2 Sep–31 Oct 2026'));
assert(detail(kew, 'Admission').textEn.includes('excluding optional donations'));
assert(detail(kew, 'Hours').textEn.includes('1–24 Oct 2026'));
assert(detail(kew, 'Accessibility and noise').textEn.includes('aircraft'));
assert(detail(kew, 'Closures').textEn.includes('spring 2027'));
for (const [place, lat, lon] of [[sydney, -33.86388889, 151.21694444], [wellington, -41.2829, 174.766], [kew, 51.47888889, -0.29361111]]) {
  assert.equal(place.lat, lat); assert.equal(place.lon, lon);
  assert.equal(place.locationInfo.kind, 'reference');
  assert.equal(place.locationInfo.checked, '2026-10-02');
  assert.equal(detail(place, 'Location reference').source, place.locationInfo.source);
  assert(detail(place, 'Location reference').textEn.includes('not a verified entrance'));
}
for (const place of [sayuwon, osulloc, ryoanji]) assert(place.lat == null && place.lon == null, 'do not invent unverified coordinates');
for (const place of [sayuwon, osulloc]) assert(!place.image && !place.photos?.length, 'unlicensed photographs remain unadded');
const photoHashes = {
  [sydney.id]: 'cc4c8c7a5e8865ba91c953fc387aeb4d8a7dc5ad32b21bc162d281092cd2a871',
  [wellington.id]: '69f91ef2b7f9c909e8845a816422aaba0e07882030651511222c5914cb433490',
  [ryoanji.id]: 'b6f81c4dae678097224cd836cc62ae51f1f88f81a07753f9209adf6a6a455b17',
  [kew.id]: 'f89f10f1f2e5caed28225a642fe856467780d76fbde7a2d2802642942cb9f49c',
};
for (const [id, expectedHash] of Object.entries(photoHashes)) {
  const place = find(id), file = path.join(root, 'public', place.image);
  const photo = read('public' + place.image.replace(/\.webp$/, '.license.json'));
  const actualHash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(actualHash, expectedHash); assert.equal(photo.readySha256, expectedHash);
  assert.equal(photo.sourcePage, place.imageSource); assert.equal(photo.licenseUrl, place.imageLicenseUrl);
  assert.equal(photo.asset, place.image); assert(photo.author && photo.originalTitle && photo.rightsNotice && photo.modifications);
  assert.equal(photo.captureDate.slice(0, 4), place.imageNote.match(/\b(?:19|20)\d{2}\b/)[0]);
  assert(!JSON.stringify(photo).includes('/workspace/'), 'published sidecars contain no local paths');
  assert(place.imageCredit && place.imageNoteKo && place.imageNote);
  assert(!place.photos?.length, 'cover path keeps full localized rights notes visible');
  for (const field of ['imageSource', 'imageRemote', 'imageLicenseUrl']) https(place[field]);
  const journal = read('lib/journal-places.json').find(record => record.id === id);
  assert.equal(journal.image, place.image); assert.equal(journal.imageCredit, place.imageCredit); assert.equal(journal.imageLicense, place.imageLicense);
}
for (const place of [sydney, ryoanji]) {
  assert(place.imageNote.includes('This copy remains ' + place.imageLicense));
  assert(place.imageNoteKo.includes(place.imageLicense + ' 라이선스가 적용'));
}
assert(ryoanji.imageCredit.includes('JP-kyoto-ryoanji.jpg'), 'retain the BY-SA 3.0 supplied title');
assert(sydney.imageNote.includes('Copyright Dietmar Rabich, Dülmen'));
const holland = find('world-gb-holland-park');
assert(!holland.image && !holland.imageRemote && !holland.photos?.length);
assert.equal(read('docs/held-photo-provenance.json').find(record => record.id === holland.id).checked, '2026-10-05');
assert.equal(catalog.length, 1007); assert.equal(new Set(catalog.map(place => place.id)).size, 1007);
assert.equal(read('wrangler.json').vars.PAYMENTS_LIVE_ENABLED, 'false');
// Render real server-page, source, reason, condition and pricing markup in KO/EN.
// Only interactive client children are stubbed; no assertions rely on the spec.
function requirePage(name) {
  if (name.startsWith('@/lib/')) return lib(name.slice('@/lib/'.length));
  if (name === 'next/navigation') return {notFound() { throw new Error('Unexpected missing place'); }};
  if (name.endsWith('/place-reasons')) return compile(path.join(root, 'app/place-reasons.tsx'), requirePage);
  if (name.endsWith('/rest-evidence')) return compile(path.join(root, 'app/rest-evidence.tsx'), requirePage);
  if (name.startsWith('.')) return {__esModule: true, default: () => null};
  return require(name);
}
const page = compile(path.join(root, 'app/places/[id]/[language]/page.tsx'), requirePage);
const pictograms = compile(path.join(root, 'app/visit-pictograms.tsx'), requirePage).default;
(async () => {
  for (const language of ['ko', 'en']) for (const id of ids) {
    const place = find(id), html = renderToStaticMarkup(await page.default({params: Promise.resolve({id, language})}));
    for (const row of place.visitDetails) {
      assert(html.includes(escaped(localized(row, language))), id + ' full localized visit detail ' + row.labelEn);
      assert(html.includes('href="' + escaped(row.source) + '"'), id + ' detail source');
      for (const source of row.additionalSources || []) assert(html.includes('href="' + escaped(source.url) + '"'));
    }
    for (const reason of candidateReasons(place)) assert(html.includes(escaped(localized(reason, language))), id + ' localized reason');
    assert(!html.includes('data-confirmed="true"'), id + ' unknown condition stays unconfirmed');
    const facts = renderToStaticMarkup(pictograms({place, language}));
    assert(facts.includes(escaped(localized(visitFacts(place).price, language))), id + ' localized price');
    assert(!facts.includes('Individual seats') && !facts.includes('1인석'));
    if (place === osulloc) assert(facts.includes('parking-unknown'));
    if (place === sydney) assert(facts.includes('parking-nearby') && !facts.includes('parking-available'));
    if (place.image) {
      assert(html.includes('src="' + place.image + '"'));
      assert(html.includes(escaped(place.imageCredit)));
      assert(html.includes('href="' + escaped(place.imageSource) + '"'));
      assert(html.includes('href="' + place.imageLicenseUrl + '"'));
      assert(html.includes(escaped(language === 'ko' ? place.imageNoteKo : place.imageNote)));
      const metadata = await page.generateMetadata({params: Promise.resolve({id, language})});
      assert.equal(metadata.openGraph.images[0].url, place.image);
    } else assert(html.includes(language === 'ko' ? '아직 등록된 장소 사진이 없어요.' : 'A photo of this place has not been added yet.'));
  }
  console.log('PASS: six merged place records, 40 substantive sourced details plus 3 preserved coordinate notes, 9 reasons, four exact licensed images, actual KO/EN visit/price/condition/photo markup, unknown privacy/seating, Holland hold and 1007 IDs.');
})().catch(error => {console.error(error); process.exitCode = 1;});
