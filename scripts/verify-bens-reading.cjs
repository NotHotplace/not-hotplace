const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..'), cache = new Map();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
function compile(file, imports) {
  const mod = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText;
  new Function('require', 'module', 'exports', code)(imports, mod, mod.exports);
  return mod.exports;
}
function load(file) {
  if (file.endsWith('.json')) return read(file);
  if (!cache.has(file)) cache.set(file, compile(file, name => name.startsWith('.')
    ? load(path.join(path.dirname(file), name) + (name.endsWith('.json') ? '' : '.ts')) : require(name)));
  return cache.get(file);
}
const id = 'tour-3443228', checked = '2026-10-12';
const owner = 'https://brunch.co.kr/@dd96de9407e7419/21';
const visitor = 'https://brunch.co.kr/@racheljane/86';
const {catalog} = load('lib/catalog.ts');
const {matchesCondition, conditionEvidence} = load('lib/rest-conditions.ts');
const {visitFacts} = load('lib/visit-facts.ts');
const {homePurposeReason} = load('lib/home-recommendations.ts');
const {finderMatches} = load('lib/catalog-views.ts');
const {candidateReasons, essentialDetails} = load('lib/place-presentation.ts');
const place = catalog.find(row => row.id === id);
const raw = read('lib/national-catalog.json').find(row => row.id === id);
const overlay = read('lib/visit-information.json')[id];
const detail = label => place.visitDetails.find(row => row.labelEn === label);
const has = (text, values) => values.forEach(value => assert(text.includes(value), value));
const https = url => assert.equal(new URL(url).protocol, 'https:');

assert.equal(catalog.length, 1010);
assert.equal(new Set(catalog.map(row => row.id)).size, 1010);
assert.equal(catalog.filter(row => row.country === 'KR' && row.city === '서울').length, 36);
assert.equal(catalog.filter(row => row.name === '벤의 서재').length, 1, 'enrich the existing place');
assert.equal(place.category, 'cafe');
assert.equal(raw.checked, '2026-09-13', 'unchanged location/identity data do not acquire a fresh verification date');
assert.equal(raw.source, 'https://www.ktriptips.com/kor/food/3443228');
assert.equal(place.checked, checked, 'merged record reflects the new dated evidence');
assert.equal(place.address, '서울특별시 강서구 공항대로 219 (마곡동) 3층 301호');
assert.equal(place.lat, 37.559688534);
assert.equal(place.lon, 126.8320234586);
assert.equal(place.locationInfo, undefined, 'new reading evidence does not verify the map pin');
assert.equal(place.image, '');
assert.equal(place.imageCredit, '');
assert(!place.photos?.length, 'unlicensed source photographs are not imported');
assert.deepEqual(visitFacts(place), {}, 'no price, parking or seating entitlement inferred');
assert.equal(place.restFeedback, undefined, 'external impressions do not become account review counts');
assert.equal(place.visitDetails.length, 6);
assert.equal(new Set(place.visitDetails.map(row => row.labelEn)).size, 6);
assert.deepEqual(place.visitDetails, overlay.visitDetails);
for (const row of place.visitDetails) {
  assert(row.labelKo && row.labelEn && row.textKo && row.textEn);
  assert(!/[가-힣]/.test(row.textEn), 'English detail has English copy');
  https(row.source);
  for (const source of row.additionalSources || []) https(source.url);
}

const rules = detail('Reading and visit rules');
assert.equal(rules.source, owner);
assert.equal(rules.checked, checked);
has(rules.textKo, ['2025-05-29', '비치 도서', '대화와 노트북 작업을 금', '키보드·마우스', '최신 이용 규칙']);
has(rules.textEn, ['May 29, 2025', 'books can be read on site', 'prohibits conversation and laptop work', 'noisy keyboards and mice', 'latest rules']);
assert.deepEqual(place.conditions.map(row => row.kind), ['books']);
assert(matchesCondition(place, 'books'));
for (const kind of ['quietMusic', 'soloSeats', 'privateRoom', 'partitions', 'parking', 'soloOrder', 'selfOrder']) {
  assert(!matchesCondition(place, kind), 'reading policy does not establish ' + kind);
  assert.equal(conditionEvidence(place, kind, 'en'), null);
}
for (const language of ['ko', 'en']) {
  const evidence = conditionEvidence(place, 'books', language);
  assert.equal(evidence.source, owner);
  assert.equal(evidence.checked, checked);
  assert(evidence.text.includes(language === 'ko' ? '2025-05-29' : 'May 29, 2025'));
}

const sound = detail('Music and quietness');
assert.equal(sound.source, visitor);
assert.equal(sound.checked, checked);
has(sound.textKo, ['2026-08-22', 'Rachel Jane', '8월 24일', '제법 컸지만', '한 사람', '소음 측정', '보장']);
has(sound.textEn, ['Rachel Jane', 'August 22, 2026', 'August 24', 'fairly loud', 'did not bother them', 'one visitor', 'not a sound measurement', 'guarantee']);
const memo = place.externalMemo;
assert.equal(memo.checked, checked);
assert.deepEqual(memo.sources, [{provider: 'Rachel Jane · Brunch Story', url: visitor}]);
has(memo.periodKo, ['2026-08-22 방문', '2026-08-24 작성']);
has(memo.periodEn, ['Visited 2026-08-22', 'published 2026-08-24']);
has(memo.summaryKo, ['Rachel Jane', '약 2시간 30분', '제법 컸지만', '거슬리지 않았', '한 사람']);
has(memo.summaryEn, ['Rachel Jane', 'about 2.5 hours', 'fairly loud', 'did not bother', 'one person']);
has(memo.cautionKo, ['허용 이용시간을 뜻하지 않습니다', '소음 측정', '최신 요금·최대 이용시간·예약 조건', '확인하지 못했습니다']);
has(memo.cautionEn, ['not a verified time allowance', 'not a sound measurement', 'quietness guarantee', 'Current prices, maximum stay and booking conditions remain unverified']);

const uncertain = detail('Current hours and closures');
assert.equal(uncertain.source, 'https://www.koreatriptips.com/dining/3443228.html');
assert.equal(uncertain.checked, checked);
assert(uncertain.additionalSources.some(row => row.url === 'https://www.tabling.co.kr/place/67eb74c703740c14d39930fd'));
has(uncertain.textKo, ['출처마다 달라', '현재 일정은 확정하지 않았습니다', '최신 공지']);
has(uncertain.textEn, ['unverified', 'listings disagree', 'latest notice']);
const essentials = essentialDetails(place);
assert(essentials.includes(uncertain), 'first-look hours show uncertainty before old listing values');
assert(!essentials.some(row => row.labelEn.startsWith('Earlier')), 'old schedules cannot appear as current first-look facts');
for (const label of ['Earlier tourism hours', 'Earlier tourism closures', 'Payment']) {
  assert.equal(detail(label).checked, '2026-10-02', 'old fact keeps its original verification date');
  assert.equal(detail(label).source, raw.source);
}
has(detail('Earlier tourism hours').textKo, ['2026-10-02', '14:00–21:00', '13:00–21:00', '현재 시간으로 확정한 안내가 아닙니다']);
has(detail('Earlier tourism hours').textEn, ['October 2, 2026', '14:00–21:00', '13:00–21:00', 'not confirmed current hours']);
has(detail('Earlier tourism closures').textKo, ['2026-10-02', '수요일', '현재 휴무일은 미확인']);
has(detail('Earlier tourism closures').textEn, ['October 2, 2026', 'Wednesday', 'current closure day is unverified']);
assert.deepEqual(detail('Payment'), {labelEn: 'Payment', labelKo: '결제 안내', textKo: '가능', textEn: 'Available', source: raw.source, checked: '2026-10-02'});

const reason = place.recommendationReasons[0];
assert.equal(candidateReasons(place).length, 1);
assert.equal(reason.sourceKind, 'operator');
assert.equal(reason.source, owner);
assert.equal(reason.checked, checked);
assert.deepEqual(reason.purposes, ['all', 'cafe']);
assert(reason.additionalSources.some(row => row.url === visitor));
has(reason.textKo, ['2025 운영자', '2026-08-22 한 방문자', '음악이 제법 컸지만', '거슬리지 않았', '조용함은 보장하지']);
has(reason.textEn, ['operator, 2025-05-29', 'One 2026-08-22 visitor', 'music fairly loud but unobtrusive', 'No quietness guarantee']);
for (const purpose of ['all', 'cafe']) assert.equal(homePurposeReason(place, purpose), reason);
for (const purpose of ['food', 'drive', 'private-room', 'premium-spa']) assert.equal(homePurposeReason(place, purpose), undefined);
const home = purpose => finderMatches(catalog, new URLSearchParams({country: 'KR', region: '서울', purpose}), 'KR');
assert.deepEqual(home('all').map(row => row.place.id), ['kr-seoul-forest', 'kr-seoul-seonyudo-park', id]);
assert.deepEqual(home('cafe').map(row => row.place.id), [id, 'tour-4108662'], 'two sourced cafés; no third filler');
assert(!home('food').some(row => row.place.id === id), 'Ben’s reading evidence does not enter the food purpose');
assert(home('cafe').every(row => !row.reviewed), 'no visitor-verified badge from external publications');
assert.equal(home('cafe')[0].reason, reason, 'initial card keeps the caveat and both source links');

const stub = () => null;
const imports = name => name === 'react/jsx-runtime' ? require(name)
  : name === 'next/navigation' ? {notFound() { throw Error('404'); }}
  : name.startsWith('@/lib/') ? load(name.slice(2) + (name.endsWith('.json') ? '' : '.ts'))
  : name === 'lucide-react' ? new Proxy({}, {get: () => stub})
  : name === '../../../place-reasons' ? compile('app/place-reasons.tsx', imports)
  : name === '../../../external-review-memo' ? compile('app/external-review-memo.tsx', imports)
  : name === '../../../rest-evidence' ? compile('app/rest-evidence.tsx', imports)
  : name === '@/components/seo-links' ? compile('components/seo-links.tsx', imports)
  : {default: stub, __esModule: true};
const Page = compile('app/places/[id]/[language]/page.tsx', imports).default;
const Reason = compile('app/place-reasons.tsx', imports).default;
const escape = text => renderToStaticMarkup(React.createElement('span', null, text)).slice(6, -7);
(async () => {
  for (const language of ['ko', 'en']) {
    const suffix = language === 'ko' ? 'Ko' : 'En';
    const html = renderToStaticMarkup(await Page({params: Promise.resolve({id, language}), searchParams: Promise.resolve({returnTo: `/?lang=${language}&country=KR&region=서울&purpose=cafe#home-finder`})}));
    for (const row of place.visitDetails) assert(html.includes(escape(row['text' + suffix])), 'complete bilingual detail is visible: ' + row.labelEn);
    for (const key of ['summary', 'caution', 'period']) assert(html.includes(escape(memo[key + suffix])), 'dated visitor memo is visible');
    for (const source of [owner, visitor, uncertain.source, uncertain.additionalSources[0].url]) assert(html.includes('href="' + source + '"'));
    assert(html.includes(language === 'ko' ? '홈 추천으로 돌아가기' : 'Back to home recommendations'));
    assert(html.includes('href="https://nothotplace.com/places/' + id + '/' + language + '"'));
    const card = renderToStaticMarkup(React.createElement(Reason, {place, language, selectedReason: reason}));
    assert(card.includes(escape(reason['text' + suffix])), 'complete reason includes the dated sound limitation');
    assert(card.includes(owner) && card.includes(visitor), 'first card retains both evidence links');
  }
  console.log('PASS: existing Ben’s Library identity, unchanged 1,010/36 counts, dated operator reading rules, only the books condition, attributed one-visitor music/stay limits, old schedule provenance, current-hours caveat, bilingual visible facts/memo/sources and two-café/no-filler Seoul shortlist.');
})().catch(error => {console.error(error); process.exitCode = 1;});
