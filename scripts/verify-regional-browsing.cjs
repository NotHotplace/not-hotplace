const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){file=path.resolve(root,file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file));if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n)+(n.endsWith('.json')?'':'.ts')):require(n),m,m.exports);cache.set(file,m.exports);return m.exports;}
const {catalog}=load('lib/catalog.ts'),{findRegionalGuide,regionalPlaces,regionalGuides}=load('lib/regional-guides.ts');
const {regionalEvidence,compareRegionalEvidence,parseRegionPage,paginateRegion,regionPagePath,regionPageNumbers,REGION_PAGE_SIZE}=load('lib/regional-browsing.ts');
const ny=regionalPlaces(findRegionalGuide('new-york'),catalog);
assert.equal(ny.length,375);const stumptown=ny.find(p=>p.id==='us-stumptown-brooklyn');assert(ny.indexOf(stumptown)<3);assert.equal(regionalEvidence(stumptown).detailCount,1);assert.equal(regionalEvidence(ny.find(p=>p.id==='us-nyc-carl-schurz-park')).detailCount,0,'generic reminders do not count as visit facts');
const photoOnly={...ny.at(-1),id:'photo',image:'/photo.webp',photos:[{}]};assert(compareRegionalEvidence(ny[0],photoOnly)<0,'real hours outrank photo-only basic data');
const fact={labelEn:'Hours',labelKo:'운영 시간',textEn:'9–5',textKo:'9–17시',source:'https://example.org',checked:'2026-10-01'};
const enriched={...photoOnly,detailLevel:'enriched',visitDetails:[fact,fact]},unsourced={...enriched,visitDetails:[{...fact,source:''}]};
assert.equal(regionalEvidence(enriched).detailCount,1,'duplicate labels never inflate completeness');assert.equal(regionalEvidence(unsourced).detailCount,0);
assert.equal(regionalEvidence({...enriched,detailLevel:'basic'}).detailCount,0,'basic imports are not promoted');
assert.equal(regionalEvidence({...enriched,recommendationReasons:[{textKo:'이유',textEn:'Reason',source:'',checked:'2026-10-01'}]}).reasonCount,0);
assert(compareRegionalEvidence({...enriched,name:'Same',id:'a'},{...enriched,name:'Same',id:'b'})<0,'ID is a stable tie breaker');
for(const guide of regionalGuides){const list=regionalPlaces(guide,catalog),all=[];for(let i=1;i<=Math.max(1,Math.ceil(list.length/REGION_PAGE_SIZE));i++){const page=paginateRegion(list,i);assert(page.places.length<=18);all.push(...page.places.map(p=>p.id));}assert.deepEqual(all,list.map(p=>p.id));assert.equal(new Set(all).size,all.length);}
assert.equal(paginateRegion(ny,1).places.length,18);assert.equal(paginateRegion(ny,21).places.length,15);assert.equal(paginateRegion(ny,22),null);
assert.deepEqual(paginateRegion([],1).places,[]);assert.equal(paginateRegion([],2),null);
for(const value of ['', '0','-1','1.5','1e2','01','Infinity','999999999999999999',' 2',['2'],['1','2']])assert.equal(parseRegionPage(value),null,String(value));
assert.equal(parseRegionPage(undefined),1);assert.equal(parseRegionPage('2'),2);assert.equal(regionPagePath('new-york','ko',1),'/regions/new-york/ko');assert.equal(regionPagePath('new-york','en',2),'/regions/new-york/en?page=2');
assert.deepEqual(regionPageNumbers(1,21),[1,2,21]);assert.deepEqual(regionPageNumbers(10,21),[1,9,10,11,21]);
console.log('PASS: source-backed stable regional ordering, photos excluded from ranking, distinct evidence, all-region complete/disjoint 18-card slices, page URLs and invalid/empty boundaries.');
