const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ts = require('typescript'), React = require('react'), {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..'), cache = new Map();
function compile(file, imports) {
  const mod = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }}).outputText;
  new Function('require', 'module', 'exports', code)(imports, mod, mod.exports);
  return mod.exports;
}
function load(file) {
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  if (!cache.has(file)) cache.set(file, compile(file, n => n.startsWith('.') ? load(path.join(path.dirname(file),n)+(n.endsWith('.json')?'':'.ts')) : require(n)));
  return cache.get(file);
}
const {catalog} = load('lib/catalog.ts'), {placeName,placeNameEvidence} = load('lib/place-names.ts');
const {matchesPlaceSearch} = load('lib/place-search.ts');
const ben = catalog.find(p=>p.id==='tour-3443228'), hyde = catalog.find(p=>p.id==='world-gb-hyde-park');
const original = JSON.stringify(catalog);
for(const query of ["Ben’s Library", "Ben's Library", 'BEN’S LIBRARY', 'Bens Library', 'benslibrary', 'Ben library', '  Ben’s   Library  ', '벤의 서재', '벤의서재']) {
  assert.deepEqual(catalog.filter(p=>matchesPlaceSearch(p,query)).map(p=>p.id),[ben.id],query+': one exact venue, no fuzzy spillover');
}
for(const query of ["Ben’s Library Seoul", '벤의 서재 Seoul', 'Ben Library 마곡']) assert(matchesPlaceSearch(ben,query),query);
for(const query of ["Ben’s Bakery", 'Ben London', 'Benjamin Library', 'Ben Library London']) assert(!matchesPlaceSearch(ben,query),query+': no speculative alias or fuzzy name');
assert.equal(placeName(ben,'ko'),'벤의 서재');assert.equal(placeName(ben,'en'),'Ben’s Library');
assert.equal(placeNameEvidence(ben).source,'https://marieclairejapon.com/culture/234406/');
assert.equal(placeName(catalog.find(p=>p.id==='kr-seoul-seonyudo-park'),'en'),'Seonyudo Park');
assert.equal(placeName(catalog.find(p=>p.id==='kr-seoul-forest'),'en'),'Seoul Forest');
for(const id of ['new-venue','__proto__','constructor']) {
 const unknown = {...ben,id,name:'새 장소'};
 assert.equal(placeName(unknown,'en'),'새 장소');assert(!matchesPlaceSearch(unknown,"Ben’s Library"));
}
assert.equal(ben.checked,'2026-10-12');assert.equal(ben.sourceChecked,'2026-10-02');
assert.equal(load('lib/national-catalog.json').find(p=>p.id===ben.id).checked,'2026-09-13');
for(const d of ben.visitDetails.filter(d=>d.source===ben.source)) assert.equal(d.checked,'2026-10-02');
for(const p of catalog) {
 assert(p.sourceChecked<=p.checked,p.id+': source date never exceeds latest record visit date');
 assert(/^\d{4}-\d{2}-\d{2}$/.test(p.sourceChecked),p.id+': dated source');
}
for(const language of ['ko','en']) assert(load('lib/place-copy.ts').placePreviewDescription(hyde,language).includes(language==='ko'?'현재 운영 상태는 미확인':'operation of the Diana Memorial Fountain is unverified'),'preview keeps the uncertainty');
const current = hyde.visitDetails.find(d=>d.labelEn==='Fountain operation');
assert.equal(current.checked,'2026-10-13');assert.match(current.textEn,/unverified.*no reopening confirmation was verified/);
assert.match(current.textKo,/현재 운영 상태는 미확인.*재개방을 확인한 것은 아닙니다/);
const old = hyde.visitDetails.find(d=>d.labelEn==='Earlier fountain notice');
assert.equal(old.checked,'2026-10-02');assert.match(old.textEn,/July 1, 2026.*historical/);
assert.equal(hyde.visitDetails.find(d=>d.labelEn==='Hours').checked,'2026-10-02');
assert.equal(hyde.locationInfo.checked,'2026-10-02');
assert(!/October 11, 2026|10월 11일|Allow extra travel time|is closed following/.test(JSON.stringify(hyde)));
assert.equal(catalog.length,1011);assert.equal(new Set(catalog.map(p=>p.id)).size,1011);
assert.equal(catalog.filter(p=>p.country==='KR'&&p.city==='서울').length,36);
assert(!catalog.some(p=>/de.?krook/i.test(p.id+' '+p.name)));
const stub=()=>null;
function imports(n) {
 if(n==='react/jsx-runtime'||n==='react')return require(n);
 if(n.startsWith('@/lib/'))return load(n.slice(2)+(n.endsWith('.json')?'':'.ts'));
 if(n==='next/navigation')return {notFound(){throw Error('404');}};
 if(n==='lucide-react')return new Proxy({},{get:()=>stub});
 if(n==='@/app/locale')return {LanguageProvider:({children})=>children};
 if(n==='@/app/place-source-summary')return compile('app/place-source-summary.tsx',imports);
 if(n==='@/components/seo-links')return compile('components/seo-links.tsx',imports);
 return {default:stub,__esModule:true};
}
const Guide=compile('app/guides/[slug]/[language]/page.tsx',imports);
const Page=compile('app/places/[id]/[language]/page.tsx',imports);
const Source=compile('app/place-source-summary.tsx',imports).default;
const esc=s=>renderToStaticMarkup(React.createElement('span',null,s)).slice(6,-7);
function jsonLd(html,type){return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(j=>j['@type']===type);}
(async()=>{
 for(const language of ['ko','en']) {
  const ko=language==='ko', name=placeName(ben,language);
  const summary=renderToStaticMarkup(React.createElement(Source,{place:ben,language}));
  assert(summary.includes((ko?'방문 정보 갱신: ':'Visit information updated: ')+'<time dateTime="2026-10-12">2026-10-12</time>'));
  assert(summary.includes((ko?'이 출처 확인: ':'This source checked: ')+'<time dateTime="2026-10-02">2026-10-02</time>'));
  assert(summary.includes('href="'+ben.source+'"'));
  const html=renderToStaticMarkup(await Guide.default({params:Promise.resolve({slug:'korea-reading-cafes',language})}));
  assert(html.includes(esc(name)));assert(html.includes(summary));
  const card=html.match(/<article\b[^>]*id="guide-place-tour-3443228"[^>]*>([\s\S]*?)<\/article>/)[1];
  assert(card.includes('/places/'+ben.id+'/'+language+'?returnTo='));
  assert.equal(jsonLd(html,'CollectionPage').mainEntity.itemListElement.find(p=>p.url.endsWith('/'+ben.id+'/'+language)).name,name);
  const returnTo=`/guides/korea-reading-cafes/${language}#guide-place-${ben.id}`;
  const detail=renderToStaticMarkup(await Page.default({params:Promise.resolve({id:ben.id,language}),searchParams:Promise.resolve({returnTo})}));
  assert(detail.includes('<h1>'+esc(name)+'</h1>'));assert(detail.includes(summary));
  assert.equal(jsonLd(detail,'Place').name,name);
  const meta=await Page.generateMetadata({params:Promise.resolve({id:ben.id,language})});
  assert(meta.title.startsWith(name+' · '));assert(meta.openGraph.title.startsWith(name));
  assert(detail.includes('href="/guides/korea-reading-cafes/'+language+'#guide-place-'+ben.id+'"'));
  const fountain=renderToStaticMarkup(await Page.default({params:Promise.resolve({id:hyde.id,language}),searchParams:Promise.resolve({})}));
  assert(fountain.includes(esc(current[ko?'textKo':'textEn'])));assert(fountain.includes(esc(old[ko?'textKo':'textEn'])));
  assert(!/October 11, 2026|10월 11일|is closed following/.test(fountain));
 }
 assert.equal(JSON.stringify(catalog),original,'search/localization/rendering do not mutate canonical identities');
 console.log('PASS: exact bilingual Ben search and apostrophes, three sourced EN labels, unknown-name fallbacks, split record/source dates, KO/EN guide/detail/metadata/JSON-LD/return links, expired Hyde warning removed with historical closure preserved, 1,011/36 counts unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1;});
