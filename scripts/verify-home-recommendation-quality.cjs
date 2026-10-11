const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..'), cache = new Map();
function load(file) {
  file = path.resolve(root, file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (cache.has(file)) return cache.get(file);
  const mod = {exports: {}};
  cache.set(file, mod.exports);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true},
  }).outputText;
  new Function('require', 'module', 'exports', js)(name => name.startsWith('.')
    ? load(path.resolve(path.dirname(file), name) + (name.endsWith('.json') ? '' : '.ts'))
    : require(name), mod, mod.exports);
  cache.set(file, mod.exports);
  return mod.exports;
}
const {homePurposeReason, homeRestMatches} = load('lib/home-recommendations.ts');
const {restMatches, defaultRestPreferences} = load('lib/rest-finder.ts');
const {finderMatches} = load('lib/catalog-views.ts');
const {conditionKeys} = load('lib/rest-conditions.ts');
const preferences = extra => ({...defaultRestPreferences, ...extra});
const reason = extra => ({textKo: '서가 옆 좌석에서 책과 차를 즐길 수 있어요.', textEn: 'Seats beside the bookshelves support a reading and tea break.', source: 'https://example.test/reading', checked: '2026-10-11', sourceKind: 'official', purposes: ['all', 'cafe'], ...extra});
const place = (id, extra = {}) => ({id, country: 'KR', city: '서울', category: 'cafe', name: id, area: '서울', address: '서울', description: '장소 소개', descriptionEn: 'Place introduction', source: 'https://example.test/place', checked: '2026-10-11', tags: [], conditions: [], visitDetails: [], recommendationReasons: [], ...extra});
const condition = (kind, extra = {}) => ({kind, textKo: '서가 옆에 개별 좌석이 있어요. 공용 좌석도 함께 있어요.', textEn: 'Individual seats sit beside the bookshelves; shared seating is also available.', source: 'https://example.test/seating', checked: '2026-10-11', ...extra});
const detail = labelEn => ({labelEn, labelKo: labelEn, textKo: '공개된 방문 안내', textEn: 'Published visitor information', source: 'https://example.test/visit', checked: '2026-10-11'});
const ids = matches => matches.map(match => match.place.id);
const match = (places, extra = {}, limit) => homeRestMatches(places, preferences(extra), limit);
const sourcePlace = (id, extra = {}) => place(id, {recommendationReasons: [reason()], ...extra});
const reviewedPlace = (id, extra = {}) => place(id, {count: 10, quiet: 6, positive: 7, ...extra});

// A well-documented restaurant must not qualify for a general rest shortlist
// merely because it has licensed photography and more operating information.
const generic = place('a-generic', {category: 'food', detailLevel: 'enriched', image: '/licensed.webp', imageCredit: 'Credited author', imageLicenseUrl: 'https://example.test/license', visitDetails: ['Hours', 'Admission', 'Location', 'Parking', 'Booking', 'Menu'].map(detail)});
const restful = sourcePlace('z-restful', {detailLevel: 'basic'});
assert.deepEqual(ids(restMatches([restful, generic], preferences())), ['a-generic', 'z-restful'], 'expanded finder retains its existing behavior');
assert.deepEqual(ids(match([generic, restful])), ['z-restful'], 'operational completeness and photos cannot manufacture rest evidence');
assert.equal(match([generic]).length, 0);
assert.equal(match([restful])[0].reviewed, false, 'public-source evidence never fabricates visitor verification');
assert(!('score' in match([restful])[0]), 'the old information/photo score is not exposed as a home score');

// Applicability is explicit. General pause is not a wildcard, and source
// impressions or caveats cannot stand in for sufficient account feedback.
const onlyGeneral = sourcePlace('general-only', {recommendationReasons: [reason({purposes: ['all']})]});
assert.equal(match([onlyGeneral]).length, 1);
assert.equal(match([onlyGeneral], {purpose: 'cafe'}).length, 0);
const onlyCafe = sourcePlace('cafe-only', {recommendationReasons: [reason({purposes: ['cafe']})]});
assert.equal(match([onlyCafe]).length, 0);
assert.equal(match([onlyCafe], {purpose: 'cafe'}).length, 1);
for (const extra of [{purposes: undefined}, {purposes: []}, {source: ''}, {source: 'http://example.test'}, {checked: ''}, {checked: 'October 11, 2026'}, {textKo: '  '}, {textEn: '\n'}, {sourceKind: 'visitor-impression'}]) {
  assert.equal(match([sourcePlace('unsupported', {recommendationReasons: [reason(extra)]})]).length, 0, 'unsupported reason must not qualify: ' + JSON.stringify(extra));
}
const selectedReason = reason({purposes: ['cafe'], source: 'https://example.test/matching-reason'});
const multipleReasons = place('multiple-reasons', {recommendationReasons: [reason({purposes: ['private-room']}), reason({purposes: ['cafe'], sourceKind: 'visitor-impression'}), selectedReason]});
assert.equal(homePurposeReason(multipleReasons, 'cafe'), selectedReason, 'choose the first applicable sourced non-anecdotal reason, not the first record');
assert.equal(match([multipleReasons], {purpose: 'cafe'})[0].reason, selectedReason, 'return the exact selected bilingual reason and provenance for the card');

// Fallback evidence retains the source's actual text and excludes parking,
// low-music anecdotes and ordering systems. Check every purpose/condition pair.
const expectedConditions = {all: ['books', 'soloSeats'], cafe: ['books', 'soloSeats', 'partitions'], food: ['soloSeats', 'partitions', 'privateRoom'], drive: [], 'private-room': ['privateRoom'], 'premium-spa': []};
for (const [purpose, allowed] of Object.entries(expectedConditions)) for (const kind of conditionKeys) {
  const fact = condition(kind), candidate = place('condition', {conditions: [fact]});
  const found = homePurposeReason(candidate, purpose);
  assert.equal(!!found, allowed.includes(kind), purpose + '/' + kind + ' applicability');
  if (found) assert.deepEqual(found, {textKo: fact.textKo, textEn: fact.textEn, source: fact.source, checked: fact.checked}, 'condition fallback preserves the complete concrete fact');
}
for (const extra of [{source: ''}, {checked: ''}, {textKo: ' '}, {textEn: ' '}]) assert.equal(homePurposeReason(place('invalid-condition', {conditions: [condition('books', extra)]}), 'all'), undefined);
const conditionFallback = place('fallback', {recommendationReasons: [reason({purposes: ['food']})], conditions: [condition('parking'), condition('books')]});
assert.equal(homePurposeReason(conditionFallback, 'cafe').textEn, condition('books').textEn, 'unrelated curated copy must not hide relevant fallback evidence');
assert.equal(homePurposeReason({...conditionFallback, recommendationReasons: [selectedReason]}, 'cafe'), selectedReason, 'a curated applicable reason is preferred to fallback');

// Eligibility thresholds are conjunctive, and visitor evidence remains
// distinct from source-based eligibility and time-of-day observations.
const strongTime = {day: '평일', time: '오후', n: 5, quiet: 5, relaxed: 5};
for (const [label, counts] of [['small sample', {count: 2, quiet: 2, positive: 2}], ['insufficient quiet', {count: 10, quiet: 5, positive: 10}], ['insufficient satisfaction', {count: 10, quiet: 10, positive: 6}], ['time only', {count: 0, quiet: 0, positive: 0, insights: [strongTime]}]]) {
  assert.equal(match([reviewedPlace(label, counts)]).length, 0, label + ' cannot qualify alone');
}
const threshold = reviewedPlace('threshold');
assert.equal(match([threshold])[0].reviewed, true, 'exact 60% quiet and 70% satisfaction thresholds are eligible');
assert.equal(match([reviewedPlace('minimum-three', {count: 3, quiet: 2, positive: 3})])[0].reviewed, true, 'three sufficiently positive reviewers meet the minimum');
assert.equal(match([sourcePlace('source-small', {count: 2, quiet: 2, positive: 2})])[0].reviewed, false, 'a source-supported small sample remains a source candidate');
assert.deepEqual(ids(match([sourcePlace('a-source'), reviewedPlace('z-reviewed')])), ['z-reviewed', 'a-source'], 'sufficient account evidence precedes source-only candidates');
assert.equal(match([sourcePlace('paused-source', {resting: true}), reviewedPlace('paused-review', {resting: true})]).length, 0, 'paused places cannot be reintroduced by either evidence path');
const visitorLow = reviewedPlace('a-lower', {count: 10, quiet: 6, positive: 10});
const visitorHigh = reviewedPlace('z-higher', {count: 10, quiet: 10, positive: 10});
assert.deepEqual(ids(match([visitorLow, visitorHigh])), ['z-higher', 'a-lower'], 'visitor confidence outranks alphabetical ID');
const timed = reviewedPlace('z-timed', {insights: [strongTime]});
assert.deepEqual(ids(match([threshold, timed], {day: '평일', time: '오후'})), ['z-timed', 'threshold']);
const weekend = match([threshold, timed], {day: '주말·공휴일', time: '오후'});
assert.deepEqual(ids(weekend), ['threshold', 'z-timed'], 'weekday reports cannot improve a weekend rank');
assert(weekend.every(result => result.time === null));

// Existing category, privacy, party-size and budget constraints stay in force.
const privacyReason = reason({purposes: ['private-room']}), experience = {kind: 'private-room', nameKo: '독립된 룸', nameEn: 'Private room', bookingKo: '예약 문의', bookingEn: 'Ask when booking', source: 'https://example.test/room', checked: '2026-10-11'};
for (const kind of ['semi-private', 'exclusive-hire']) assert.equal(match([sourcePlace(kind, {recommendationReasons: [privacyReason], experiences: [{...experience, kind}]})], {purpose: 'private-room'}).length, 0, kind + ' does not imply a private room');
for (const kind of ['private-room', 'private-suite']) assert.equal(match([sourcePlace(kind, {recommendationReasons: [privacyReason], experiences: [{...experience, kind}]})], {purpose: 'private-room'}).length, 1);
assert.equal(match([sourcePlace('wrong-category', {category: 'food'})], {purpose: 'cafe'}).length, 0, 'a reason cannot override the requested category');
assert.equal(match([sourcePlace('minimum-party', {descriptionEn: 'At least two diners are required.'})], {party: 'solo'}).length, 0);
const admission = {labelKo: '입장료', labelEn: 'Admission', textKo: '무료', textEn: 'Free'};
assert.deepEqual(ids(match([sourcePlace('unknown-cost'), sourcePlace('free', {visitDetails: [admission]})], {budget: 0})), ['free']);

// Home ranking is independent of photography and operational completeness.
// IDs decide genuine ties consistently, regardless of input order or names.
const first = sourcePlace('a-id', {name: 'Zulu'}), second = sourcePlace('z-id', {name: 'Alpha'});
const embellished = {...second, detailLevel: 'enriched', image: '/large.webp', imageCredit: 'Author', imageLicenseUrl: 'https://example.test/license', visitDetails: Array.from({length: 30}, (_, i) => detail('Detail ' + i))};
assert.deepEqual(ids(match([second, first])), ['a-id', 'z-id']);
assert.deepEqual(ids(match([first, embellished])), ['a-id', 'z-id']);
assert.deepEqual(ids(match([embellished, first])), ['a-id', 'z-id']);
assert.deepEqual(ids(match([sourcePlace('source-time', {insights: [strongTime]}), first])), ['a-id', 'source-time'], 'time buckets alone do not boost source-only candidates');
assert.deepEqual(ids(match([first, generic])), ['a-id']);
assert.equal(match([first, second, generic]).length, 2, 'do not fill a two-place shortlist with unsupported data');
const many = ['d', 'c', 'b', 'a'].map(id => sourcePlace(id));
assert.deepEqual(ids(match(many)), ['a', 'b', 'c']);
assert.deepEqual(ids(match(many, {}, 10)), ['a', 'b', 'c'], 'home remains bounded to three');
assert.deepEqual(ids(match(many, {}, 1)), ['a']);
for (const limit of [0, -1, 1.5, NaN, Infinity]) assert.equal(match(many, {}, limit).length, 0, 'invalid limit: ' + limit);
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const immutable = freeze([sourcePlace('z-frozen'), sourcePlace('a-frozen')]);
assert.deepEqual(ids(match(immutable)), ['a-frozen', 'z-frozen']);
assert.deepEqual(immutable.map(row => row.id), ['z-frozen', 'a-frozen'], 'input arrays and evidence remain unmodified');

// Nearby inputs fail closed rather than admitting NaN distances or invalid
// latitude/longitude. The ordinary home UI does not request device location.
const origin = {lat: 37.5, lon: 127};
const near = sourcePlace('z-near', {...origin}), far = sourcePlace('a-far', {lat: 37.51, lon: 127});
assert.deepEqual(ids(match([far, near], {position: origin, radiusKm: 10})), ['z-near', 'a-far']);
assert.deepEqual(ids(match([far, near], {position: origin, radiusKm: 0})), ['z-near']);
assert(match([far, near], {position: origin}).every(row => Number.isFinite(row.distance)));
for (const position of [{lat: NaN, lon: 127}, {lat: Infinity, lon: 127}, {lat: 37.5, lon: -Infinity}, {lat: 91, lon: 127}, {lat: -91, lon: 127}, {lat: 37.5, lon: 181}, {lat: 37.5, lon: -181}]) assert.equal(match([near], {position}).length, 0, 'invalid nearby origin');
for (const radiusKm of [-1, NaN, Infinity]) assert.equal(match([near], {position: origin, radiusKm}).length, 0, 'invalid nearby radius');
for (const coordinates of [{lat: undefined, lon: undefined}, {lat: null, lon: 127}, {lat: NaN, lon: 127}, {lat: 37.5, lon: Infinity}, {lat: 91, lon: 127}, {lat: 37.5, lon: 181}]) assert.equal(match([sourcePlace('invalid-location', coordinates)], {position: origin}).length, 0, 'invalid venue coordinates');
assert.equal(match([sourcePlace('unknown-location')]).length, 1, 'coordinates are optional when nearby filtering is absent');
for (const coordinates of [{lat: 90, lon: 180}, {lat: -90, lon: -180}]) assert.equal(match([sourcePlace('boundary', coordinates)], {position: coordinates, radiusKm: 0}).length, 1, 'valid coordinate boundary');

// Apply country and region restrictions before creating the shortlist. Missing
// country means the existing Korean catalog, never the selected foreign scope.
const geography = [sourcePlace('kr-seoul'), sourcePlace('kr-busan', {city: '부산'}), sourcePlace('kr-legacy', {country: undefined}), sourcePlace('us-same-city', {country: 'US'}), sourcePlace('us-ny', {country: 'US', city: 'New York'}), sourcePlace('kr-cheongju', {city: '청주'}), sourcePlace('kr-state', {city: 'Unknown', states: ['충북']})];
const find = (country, query) => finderMatches(geography, new URLSearchParams(query), country);
assert.deepEqual(ids(find('KR', 'region=서울')), ['kr-legacy', 'kr-seoul']);
assert.deepEqual(ids(find('US', 'region=New+York')), ['us-ny']);
assert.deepEqual(ids(find('KR', 'region=충북')), ['kr-cheongju', 'kr-state']);
assert(find('KR', 'region=전국').every(row => (row.place.country || 'KR') === 'KR'));
assert.throws(() => find('KR', 'region=New+York'), /Invalid region/);
assert.throws(() => find('US', 'region=서울'), /Invalid region/);
assert.throws(() => find('KR', 'purpose=secret'), /Invalid purpose/);
assert.throws(() => find('KR', 'purpose=CAFE'), /Invalid purpose/);
assert.deepEqual(ids(find('KR', 'region=서울&purpose=cafe')), ['kr-legacy', 'kr-seoul']);

// The rollout boundary is explicit Seoul, not KR's default resolved region.
// Compare complete serialized rows, including old scores and evidence, rather
// than checking IDs alone. Use the live catalog so new records are included.
const {catalog} = load('lib/catalog.ts');
const {countries, countryCodes} = load('lib/countries.ts');
const {inRegion} = load('lib/regions.ts');
const purposes = ['all', 'cafe', 'food', 'drive', 'private-room', 'premium-spa'];
const serialized = value => JSON.stringify(value);
function legacyFinder(places, params, country) {
  const region = params.get('region') || countries[country].defaultRegion;
  return restMatches(places.filter(candidate => (candidate.country || 'KR') === country && inRegion(candidate, region)), preferences({purpose: params.get('purpose') || 'all'}));
}
let unchangedRoutes = 0;
for (const country of countryCodes) for (const region of [undefined, '', ...new Set(['전국', ...countries[country].regions])]) for (const purpose of [undefined, ...purposes]) {
  if (country === 'KR' && region === '서울') continue;
  const params = new URLSearchParams({country});
  if (region !== undefined) params.set('region', region);
  if (purpose !== undefined) params.set('purpose', purpose);
  assert.equal(serialized(finderMatches(catalog, params, country)), serialized(legacyFinder(catalog, params, country)), 'non-rollout route keeps the complete legacy response: ' + params);
  unchangedRoutes++;
}
const seoulQuery = new URLSearchParams('country=KR&region=서울');
const seoulAllQuery = new URLSearchParams('country=KR&region=서울&purpose=all');
assert.equal(serialized(finderMatches(catalog, seoulQuery, 'KR')), serialized(finderMatches(catalog, seoulAllQuery, 'KR')), 'explicit Seoul with omitted purpose is the same strict general-pause route');
for (const purpose of purposes) {
  const params = new URLSearchParams({country: 'KR', region: '서울', purpose});
  const seoul = catalog.filter(candidate => (candidate.country || 'KR') === 'KR' && inRegion(candidate, '서울'));
  assert.equal(serialized(finderMatches(catalog, params, 'KR')), serialized(homeRestMatches(seoul, preferences({purpose}))), 'every explicitly selected Seoul purpose uses the strict helper: ' + purpose);
}
const rolloutFixture = [generic, restful, {...generic, id: 'busan-generic', city: '부산'}];
assert.deepEqual(ids(finderMatches(rolloutFixture, seoulQuery, 'KR')), ['z-restful'], 'strict Seoul removes an unsupported high-completeness candidate and keeps no filler');
assert.deepEqual(ids(finderMatches(rolloutFixture, new URLSearchParams('country=KR'), 'KR')), ['a-generic', 'z-restful'], 'implicit default Seoul preserves legacy behavior');
assert.equal(serialized(finderMatches(rolloutFixture, new URLSearchParams('country=KR&region='), 'KR')), serialized(legacyFinder(rolloutFixture, new URLSearchParams('country=KR&region='), 'KR')), 'an empty region must not accidentally enable strict Seoul');
assert.deepEqual(ids(finderMatches(rolloutFixture, new URLSearchParams('country=KR&region=부산'), 'KR')), ['busan-generic'], 'other Korean regions retain unsupported legacy candidates');

console.log('PASS: home-only purpose/source eligibility, exact bilingual reasons, condition matrix, conjunctive visitor thresholds, unchanged expanded filters, photo/detail-independent deterministic ranking, honest 0–3 limits, immutable inputs, nearby validation, explicit Seoul rollout and ' + unchangedRoutes + ' complete legacy country/region/purpose responses.');
