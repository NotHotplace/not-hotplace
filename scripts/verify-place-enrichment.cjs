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
  'world-fr-jardin-du-luxembourg': 'lib/expanded-catalog.json',
  'world-nl-hortus-botanicus-amsterdam': 'lib/expanded-catalog.json',
  'world-sg-jurong-lake-gardens': 'lib/expanded-catalog.json',
};
const ids = Object.keys(files), find = id => catalog.find(place => place.id === id);
const hortusRecheckedLabels = new Set(['Hours', 'Admission', 'Quieter visit times', 'Companion admission', 'Accessible toilet', 'Luggage storage']);
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
  assert.equal(place.checked, ['world-sg-jurong-lake-gardens', 'world-nl-hortus-botanicus-amsterdam'].includes(id) ? '2026-10-08' : '2026-10-07');
  assert.deepEqual(place.visitDetails, source.visitDetails, id + ' final merged details');
  assert.deepEqual(place.visitFacts, source.visitFacts, id + ' final structured facts');
  assert.deepEqual(place.recommendationReasons, reasons[id], id + ' recommendation overlay');
  assert.equal(new Set(place.visitDetails.map(row => row.labelEn)).size, place.visitDetails.length);
  for (const row of place.visitDetails) {
    assert(row.textKo && row.textEn && row.labelKo && row.labelEn);
    https(row.source);
    const rechecked = (id === 'world-sg-jurong-lake-gardens' && ['Hours', 'Safety and notices'].includes(row.labelEn))
      || (id === 'world-nl-hortus-botanicus-amsterdam' && hortusRecheckedLabels.has(row.labelEn));
    assert.equal(row.checked, row.labelEn === 'Location reference' ? '2026-10-02' : rechecked ? '2026-10-08' : '2026-10-07');
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
    assert(['operator', 'tourism', 'official'].includes(reason.sourceKind));
    reasonCount++;
  }
  assert.equal(visitFacts(place).seating, undefined, 'generic seating must not infer individual seats');
  for (const kind of ['soloSeats', 'privateRoom', 'quietMusic', 'partitions']) assert(!matchesCondition(place, kind), id + ' unsupported condition ' + kind);
  assert(essentialDetails(place).some(row => /price|admission/i.test(row.labelEn)), id + ' real cost detail, not a fallback');
}
assert.equal(rows, 72); assert.equal(coordinateRows, 6); assert.equal(reasonCount, 15);
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
const luxembourg = find(ids[6]), hortus = find(ids[7]), jurong = find(ids[8]);
for (const [place, lat, lon] of [[luxembourg, 48.84694444, 2.33722222], [hortus, 52.3668, 4.9079], [jurong, 1.33805556, 103.72833333]]) {
  assert.equal(place.lat, lat); assert.equal(place.lon, lon);
  assert.equal(place.locationInfo.kind, 'reference');
  assert.equal(place.locationInfo.checked, '2026-10-02');
  assert.equal(detail(place, 'Location reference').source, place.locationInfo.source);
  assert(detail(place, 'Location reference').textEn.includes('not a verified entrance'));
}
assert.equal(visitFacts(luxembourg).price.amount, 0);
assert.equal(visitFacts(hortus).price.amount, 14.75);
assert.equal(visitFacts(jurong).price.amount, 0);
for (const place of [luxembourg, hortus, jurong]) assert.equal(visitFacts(place).price.basis, 'admission');
for (const place of [luxembourg, hortus]) {
  assert.equal(visitFacts(place).parking.status, 'nearby');
  assert(!matchesCondition(place, 'parking'), place.id + ' nearby parking does not imply on-site');
}
assert.equal(visitFacts(jurong).parking.status, 'available');
assert(matchesCondition(jurong, 'parking'));
assert.deepEqual(jurong.conditions.map(fact => fact.kind), ['parking'], 'only the supported parking condition');
assert(detail(luxembourg, 'Hours').textEn.includes('October 1–15: 07:45–18:45'));
assert(detail(luxembourg, 'Seating').textEn.includes('Seat availability is not verified'));
assert(detail(luxembourg, 'Accessibility').textEn.includes('remain unverified'));
assert(detail(hortus, 'Admission').textEn.includes('EUR 8.50'));
assert(detail(hortus, 'Admission').textEn.includes('Card payment only'));
assert(detail(hortus, 'Seating and sound').textEn.includes('not a promise of silence'));
assert(hortus.visitDetails.some(row => row.textEn.includes('Butterfly House')));
assert(detail(hortus, 'Route limitations').textEn.includes('main gate'));
assert.equal(hortus.visitDetails.length, 15, 'four new rows, existing rows retained');
assert.equal(detail(hortus, 'Hours').textEn, 'Daily 10:00–17:00; closed December 25 and January 1. Check the programme for special events.');
const quietTimes = detail(hortus, 'Quieter visit times');
assert.equal(quietTimes.source, 'https://www.dehortus.nl/en/accessibility/');
for (const value of ['weekends and school holidays', '10:00–11:00', '16:00–17:00', 'usually less busy', 'Events', 'not a live crowd report or a quietness guarantee']) assert(quietTimes.textEn.includes(value));
for (const value of ['주말·학교 방학', '10:00~11:00', '16:00~17:00', '보통', '행사', '실시간', '보장']) assert(quietTimes.textKo.includes(value));
const companion = detail(hortus, 'Companion admission');
assert.equal(companion.source, quietTimes.source);
for (const value of ['unable to visit independently', 'health or similar reasons', 'companion free of charge', 'check in together with entrance staff']) assert(companion.textEn.includes(value));
for (const value of ['건강 등의 이유', '독립적인 관람이 어려운', '동반자는 무료', '함께 입구 직원']) assert(companion.textKo.includes(value));
const toilet = detail(hortus, 'Accessible toilet');
assert.equal(toilet.source, quietTimes.source);
assert(toilet.textEn.includes('Hortus Café') && toilet.textEn.includes('separate wheelchair ramp behind the terrace'));
assert(toilet.textKo.includes('테라스 뒤쪽의 별도 휠체어 경사로'));
const luggage = detail(hortus, 'Luggage storage');
assert.equal(luggage.source, hortus.source);
assert(luggage.textEn.includes('No storage space or lockers') && luggage.textEn.includes('suitcases or backpacks'));
assert(luggage.textKo.includes('여행 가방이나 배낭') && luggage.textKo.includes('보관 공간·사물함이 없어요'));
assert.deepEqual(detail(hortus, 'Admission').additionalSources, [{label: 'Dutch operator visit and admission guidance', url: 'https://www.dehortus.nl/Bezoek/'}]);
assert.equal(hortus.address, 'Plantage Middenlaan 2A, 1018 DD Amsterdam, Netherlands');
assert.equal(hortus.conditions?.length || 0, 0, 'planning guidance creates no condition or availability claim');
assert(detail(jurong, 'Hours').textEn.includes('Chinese and Japanese Gardens 05:30–24:00'));
assert(detail(jurong, 'Safety and notices').textEn.includes('2026-10-08'));
assert(detail(jurong, 'Safety and notices').textEn.includes('14 October 2026'));
assert(detail(jurong, 'Safety and notices').textEn.includes('Sunken Garden toilet'));
assert(detail(jurong, 'Safety and notices').textEn.includes('until further notice'));
assert(detail(jurong, 'Benches').textEn.includes('published-photo observations'));
assert(luxembourg.imageNote.includes('Produced by EUtouring.com'));
assert(luxembourg.imageNoteKo.includes('Produced by EUtouring.com'));
assert(hortus.imageNote.includes('does not depict the renovated Climate House'));
const photoHashes = {
  [luxembourg.id]: 'dc139ff05b25854a96aaf8dbb4746cc7b53a3b958adb7d76c202c61e24065862',
  [hortus.id]: 'e5f6e54f93ce095c7007ed583fe9746e529ac4ce69d83e1363e338cd570e1225',
  [jurong.id]: '41b2013c78e14a9f555604401546d8081993af0b1539c4e422978f3d01027ed5',
  [sydney.id]: 'cc4c8c7a5e8865ba91c953fc387aeb4d8a7dc5ad32b21bc162d281092cd2a871',
  [wellington.id]: '69f91ef2b7f9c909e8845a816422aaba0e07882030651511222c5914cb433490',
  [ryoanji.id]: 'b6f81c4dae678097224cd836cc62ae51f1f88f81a07753f9209adf6a6a455b17',
  [kew.id]: 'f89f10f1f2e5caed28225a642fe856467780d76fbde7a2d2802642942cb9f49c',
};
for (const [id, expectedHash] of Object.entries(photoHashes)) {
  const place = find(id), file = path.join(root, 'public', place.image);
  const photo = read('public' + place.image.replace(/\.webp$/, '.license.json'));
  const bytes = fs.readFileSync(file);
  const actualHash = crypto.createHash('sha256').update(bytes).digest('hex');
  if ([luxembourg, hortus, jurong].includes(place)) {
    assert.equal(bytes.length, photo.readyBytes);
    assert.deepEqual(photo.readyDimensions, [1200, 900]);
    for (const value of [photo.author, photo.originalTitle, photo.captureDate, photo.sourcePage, photo.licenseUrl]) assert(bytes.includes(Buffer.from(value)), id + ' embedded XMP: ' + value);
    assert(photo.visualReview && photo.modifications.includes('no crop'));
  }
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
const photoCropStyle = fs.readFileSync(path.join(root, 'app/visit.css'), 'utf8');
assert(photoCropStyle.includes('img[src="' + hortus.image + '"],\nimg[src="' + jurong.image + '"]{object-position:center bottom}'), 'lower paths and bench survive wide-card crops');
for (const place of [sydney, ryoanji, luxembourg, jurong]) {
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
  if (name === '@/components/seo-links') return compile(path.join(root, 'components/seo-links.tsx'), requirePage);
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
    assert.equal((html.match(/data-confirmed="true"/g) || []).length, place === jurong ? 1 : 0, id + ' only sourced parking may be confirmed');
    const facts = renderToStaticMarkup(pictograms({place, language}));
    assert(facts.includes(escaped(localized(visitFacts(place).price, language))), id + ' localized price');
    assert(!facts.includes('Individual seats') && !facts.includes('1인석'));
    if (place === osulloc) assert(facts.includes('parking-unknown'));
    if ([sydney, luxembourg, hortus].includes(place)) assert(facts.includes('parking-nearby') && !facts.includes('parking-available'));
    if (place === jurong) assert(facts.includes('parking-available'));
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
  console.log('PASS: nine merged place records, 72 substantive sourced details plus 6 preserved coordinate notes, 15 reasons, seven exact licensed images, actual KO/EN visit/price/condition/photo markup, unknown privacy/seating, Holland hold and 1007 IDs.');
})().catch(error => {console.error(error); process.exitCode = 1;});
