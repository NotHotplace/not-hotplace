const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const cache = {};
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
const {matchesCondition, conditionEvidence} = lib('rest-conditions');
const {restMatches, defaultRestPreferences} = lib('rest-finder');
const {placeVisitHint} = lib('place-copy');
const {essentialDetails, conciseText} = lib('place-presentation');
const guides = read('lib/kr-place-guides.json');
const visits = read('lib/visit-information.json');
const find = id => catalog.find(place => place.id === id);
const detail = (place, label) => place.visitDetails.find(item => item.labelEn === label);

// Exercise the final merged record and its fallback source, not just the overlay.
for (const [id, labels] of [
  ['tour-2746373', ['Parking', 'Visit planning']],
  ['tour-4055439', ['Hours']],
  ['tour-3572781', ['Hours', 'Dinner booking']],
]) {
  const place = find(id);
  assert.equal(place.checked, '2026-10-06');
  for (const label of labels) {
    const fact = detail(place, label);
    assert.deepEqual(fact, detail(guides.find(guide => guide.id === id), label), id + ' guide mirror');
    assert.deepEqual(fact, detail(visits[id], label), id + ' visit overlay');
    assert.equal(fact.checked, '2026-10-06');
    assert(fact.textKo && fact.textEn && fact.additionalSources.length);
  }
}

const reservoir = find('tour-2746373');
assert.equal(reservoir.address, '대구광역시 달성군 가창면 용계리');
assert.equal(reservoir.lat, 35.7995979733);
assert.equal(reservoir.lon, 128.6098983496);
assert.equal(reservoir.locationInfo, undefined, 'do not invent an entrance designation');
assert.equal(reservoir.visitFacts.parking, undefined, 'remove the stale explicit no-parking fact');
assert.equal(visitFacts(reservoir).parking, undefined, 'uncertainty wording must not infer available or unavailable');
assert.equal(visitFacts({...reservoir, visitFacts: undefined, visitDetails: guides.find(p => p.id === reservoir.id).visitDetails}).parking, undefined, 'guide-only fallback remains unknown');
assert(!matchesCondition(reservoir, 'parking'));
for (const language of ['ko', 'en']) assert.equal(conditionEvidence(reservoir, 'parking', language), null);
assert(!catalog.filter(place => matchesCondition(place, 'parking')).some(place => place.id === reservoir.id));
assert(detail(reservoir, 'Visit planning').textKo.includes('가창면 용계리'));
assert(detail(reservoir, 'Visit planning').textKo.includes('각북면 오산리'));
assert(detail(reservoir, 'Visit planning').textEn.includes('not a verified entrance'));
assert(!/불가능|주차\s*가능|주차\s*불가|parking available|no parking|parking unavailable/i.test(detail(reservoir, 'Parking').textKo + detail(reservoir, 'Parking').textEn));
// Control cases keep available, unavailable and nearby parking distinct.
assert.equal(visitFacts(find('tour-4055439')).parking.status, 'available');
assert(matchesCondition(find('tour-4055439'), 'parking'));
assert.equal(visitFacts(find('tour-2946087')).parking.status, 'unavailable');
assert.equal(visitFacts(find('tour-2375858')).parking.status, 'nearby');
assert(!matchesCondition(find('tour-2375858'), 'parking'));

const cafe = find('tour-4055439');
assert(detail(cafe, 'Hours').textKo.includes('달라요'));
assert(detail(cafe, 'Hours').textEn.includes('conflict'));
assert(!/10:00|19:30|18:00/.test(JSON.stringify(cafe.visitDetails)), 'no old exact hours remain unqualified');
assert(detail(cafe, 'Hours').additionalSources.some(source => source.label.includes('2026-03')));
const dinner = find('tour-3572781');
assert(detail(dinner, 'Dinner booking').textKo.includes('2025년 11월'));
assert(detail(dinner, 'Dinner booking').textEn.includes('November 2025'));
assert(detail(dinner, 'Solo visit').textKo.includes('2인 이상'));
assert(detail(dinner, 'Solo visit').textEn.includes('set meal'));
assert.equal(restMatches([dinner], {...defaultRestPreferences, party: 'solo'}).length, 0);
assert.equal(restMatches([dinner], defaultRestPreferences).length, 1);
for (const language of ['ko', 'en']) {
  const expectedDate = language === 'ko' ? '2025년 11월' : 'November 2025';
  assert(placeVisitHint(dinner, language).includes(expectedDate), 'compact visit hint retains the dated booking warning');
  const hours = essentialDetails(dinner).find(fact => fact.labelEn === 'Hours');
  assert(conciseText(language === 'ko' ? hours.textKo : hours.textEn, language === 'ko' ? 100 : 180).includes(expectedDate), 'first-look summary retains the date');
}

// A dated construction announcement is not a verified current parking status.
const bugak = find('seoul-bugak');
const construction = detail(bugak, 'Parking and closures');
assert.equal(bugak.checked, '2026-10-11');
assert.equal(construction.checked, '2026-10-11');
assert.equal(construction.source, 'https://www.ijongno.co.kr/www/139?action=read&action-value=03c466b9a93a003efb3a8145c4ff83cf');
assert.equal(bugak.source, construction.source);
assert.match(construction.textKo, /2026-06-04.*6월 8일.*공사 기간/);
assert.match(construction.textKo, /야외정원.*공용화장실/);
assert.match(construction.textKo, /재개방 공지는 확인하지 못/);
assert.match(construction.textEn, /June 4, 2026.*June 8.*works/);
assert.match(construction.textEn, /outdoor gardens and public toilets would remain open/);
assert.match(construction.textEn, /As of October 11, 2026.*reopening notice has not been verified/);
assert.match(construction.textEn, /before driving there/);
assert.doesNotMatch(JSON.stringify(bugak), /24[ -]?(?:hour|시간)|24\/7|always open/i);
assert.equal(bugak.visitFacts?.parking, undefined);
assert.equal(visitFacts(bugak).parking, undefined, 'dated partial closure does not imply current parking availability');
assert(!matchesCondition(bugak, 'parking'));
assert.equal(bugak.address, '서울 종로구 북악산로 267 · 북악팔각정 기준');
for (const key of ['lat', 'lon', 'locationInfo', 'image', 'imageRemote', 'photos']) assert.equal(bugak[key], undefined, 'preserve existing ' + key);
assert.deepEqual(bugak.tags, ['드라이브', '전망']);
assert.match(bugak.description, /교통·주차 혼잡은 시간대에 따라/);
assert.match(bugak.descriptionEn, /traffic and parking congestion vary by time/);
for (const language of ['ko', 'en']) {
  const date = language === 'ko' ? '2026-06-04' : 'June 4, 2026';
  const text = language === 'ko' ? construction.textKo : construction.textEn;
  assert(placeVisitHint(bugak, language).includes(date), 'card hint retains the dated warning');
  assert(essentialDetails(bugak).includes(construction), 'construction warning is visible at first look');
  assert(conciseText(text, language === 'ko' ? 100 : 180).includes(date));
  assert.equal(conditionEvidence(bugak, 'parking', language), null);
}

const reyes = find('us-point-reyes');
const expectedImage = '/places/us-point-reyes.jpeg';
const imageHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'public', expectedImage))).digest('hex');
assert.equal(imageHash, '75b75eb3a2b572417226a087f5d1557b33452c66f82ed1ee075433f3fe63897b', 'restore the verified asset without replacing it');
assert.equal(reyes.image, expectedImage);
assert.equal(reyes.imageSource, 'https://www.nps.gov/pore/index.htm');
assert.equal(reyes.imageCredit, 'NPS Photo/A. Kopshever');
assert.equal(reyes.imageLicenseUrl, 'https://www.nps.gov/aboutus/disclaimer.htm');
assert(reyes.imageLicense.includes('Public domain') && !reyes.imageLicense.includes('CC0'));
assert(reyes.imageRemote.includes('8C577CF2-D1B5-93EB-53FDA20654103FEE.jpeg'));
assert(reyes.imageNote.includes('No claim to original U.S. Government works'));
assert(reyes.imageNote.includes('No NPS endorsement'));
assert(reyes.imageNoteKo.includes('미국 정부 원저작물에 대한 권리를 주장하지 않습니다'));
assert(reyes.imageNoteKo.includes('보증·추천을 의미하지 않습니다'));
const held = read('docs/held-photo-provenance.json');
const restored = held.find(record => record.id === reyes.id);
assert.equal(restored.status, 'resolved');
assert.equal(restored.checked, '2026-10-05', 'preserve original hold date');
assert.equal(restored.resolved, '2026-10-06');
assert.equal(restored.preservedImageFields.image, expectedImage);
assert.equal(restored.localAsset.sha256, imageHash);
assert.deepEqual(held.find(record => record.id === 'world-gb-holland-park'), {
  id: 'world-gb-holland-park', checked: '2026-10-05',
  reason: 'Image credit/license absent and landmark identity not established; display held pending verification.',
  preservedImageFields: {imageRemote: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Embassy_of_Ukraine_in_London_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original'},
});
const holland = find('world-gb-holland-park');
assert(!holland.image && !holland.imageRemote && !holland.photos?.length);
assert.equal(read('lib/journal-places.json').find(place => place.id === reyes.id).image, expectedImage);
assert.equal(catalog.length, 1008);
assert.equal(new Set(catalog.map(place => place.id)).size, 1008);
assert.equal(read('wrangler.json').vars.PAYMENTS_LIVE_ENABLED, 'false');

// Render the actual server page in both languages. Only interactive child
// components are stubbed; catalog merge, page copy, sources and photo UI are real.
function requirePage(name) {
  if (name === '@/components/seo-links') return compile(path.join(root, 'components/seo-links.tsx'), requirePage);
  if (name.startsWith('@/lib/')) return lib(name.slice('@/lib/'.length));
  if (name === 'next/navigation') return {notFound() { throw new Error('Unexpected missing place'); }};
  if (name.startsWith('.')) return {__esModule: true, default: () => null};
  return require(name);
}
const pageModule = compile(path.join(root, 'app/places/[id]/[language]/page.tsx'), requirePage);
const pictograms = compile(path.join(root, 'app/visit-pictograms.tsx'), requirePage).default;
const explorerSource = fs.readFileSync(path.join(root, 'app/explorer.tsx'), 'utf8');
assert(explorerSource.includes('focused.imageNoteKo||'), 'legacy detail modal respects the localized photo note');
(async () => {
  for (const language of ['ko', 'en']) {
    for (const [id, label] of [['tour-2746373', 'Parking'], ['tour-4055439', 'Hours'], ['tour-3572781', 'Dinner booking']]) {
      const place = find(id), fact = detail(place, label);
      const html = renderToStaticMarkup(await pageModule.default({params: Promise.resolve({id, language})}));
      const factHtml = renderToStaticMarkup(require('react').createElement('span', null, language === 'ko' ? fact.textKo : fact.textEn)).slice(6, -7);
      assert(html.includes(factHtml), id + ' ' + language + ' renders the full corrected fact');
      assert(html.includes('href="' + fact.source + '"'));
      for (const source of fact.additionalSources) assert(html.includes('href="' + source.url + '"'), id + ' exposes both sources');
    }
    const bugakHtml = renderToStaticMarkup(await pageModule.default({params: Promise.resolve({id: bugak.id, language})}));
    const constructionHtml = renderToStaticMarkup(require('react').createElement('span', null, language === 'ko' ? construction.textKo : construction.textEn)).slice(6, -7);
    assert(bugakHtml.includes(constructionHtml), language + ' renders the complete dated construction warning');
    assert(bugakHtml.includes('href="' + construction.source.replace(/&/g, '&amp;') + '"'));
    assert(bugakHtml.includes('2026-10-11'));
    const bugakPictograms = renderToStaticMarkup(pictograms({place: bugak, language}));
    assert(bugakPictograms.includes('parking-unknown'));
    assert(!bugakPictograms.includes('parking-unavailable') && !bugakPictograms.includes('parking-available'));
    const html = renderToStaticMarkup(await pageModule.default({params: Promise.resolve({id: reyes.id, language})}));
    assert(html.includes('src="' + expectedImage + '"'));
    assert(html.includes('href="' + reyes.imageSource + '"'));
    assert(html.includes('href="' + reyes.imageLicenseUrl + '"'));
    assert(html.includes(language === 'ko' ? reyes.imageNoteKo : reyes.imageNote));
    assert(!html.includes('크기 조정 및 형식 변환'), 'custom Korean photo note is not replaced by generic copy');
    const unknown = renderToStaticMarkup(pictograms({place: reservoir, language}));
    assert(unknown.includes('parking-unknown'));
    assert(!unknown.includes('parking-unavailable') && !unknown.includes('parking-available'));
    assert(unknown.includes(language === 'ko' ? '주차 확인 중' : 'Parking unknown'));
    assert.equal(pictograms({place: reservoir, language, compact: true}), null, 'unknown parking cannot become a compact availability badge');
    const metadata = await pageModule.generateMetadata({params: Promise.resolve({id: reyes.id, language})});
    assert.equal(metadata.openGraph.images[0].url, expectedImage);
  }
  console.log('PASS: dated Bugak construction notice and four source-backed corrections, merged/guide consistency, KO/EN server pages and photo notes, unknown parking filters, dated dinner warning, exact restored asset, preserved Holland hold and 1008 entries.');
})().catch(error => {console.error(error); process.exitCode = 1;});
