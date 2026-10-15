const fs=require('node:fs'),assert=require('node:assert/strict');
const records=JSON.parse(fs.readFileSync('lib/seoul-pause-evidence.json','utf8'));
assert.equal(records.length,5);assert.equal(new Set(records.map(r=>r.id)).size,5);
for(const entry of records){
 for(const key of ['hookKo','hookEn','fitKo','fitEn','cautionKo','cautionEn','unknownKo','unknownEn','checked'])assert(entry[key],entry.id+' '+key);
 assert.match(entry.checked,/^\d{4}-\d{2}-\d{2}$/);assert(entry.sources.length>0);
 for(const source of entry.sources){assert(source.url.startsWith('https://'));assert(['operator','official-tourism'].includes(source.kind));assert(source.factsKo&&source.factsEn);}
}
const guides=fs.readFileSync('lib/guides.ts','utf8'),page=fs.readFileSync('app/guides/[slug]/[language]/page.tsx','utf8'),notes=fs.readFileSync('app/seoul-pause-notes.tsx','utf8');
assert(guides.includes("slug:'seoul-pauses'"));assert(guides.includes("record.readiness==='source-photo-ready'"));assert.equal(records.filter(r=>r.readiness==='source-photo-ready').length,2);
assert(page.includes('placePathWithReturn(place.id,language,`/guides/${guide.slug}/${language}#guide-place-${place.id}`)'));
assert(notes.includes('<details'));assert(notes.includes('Anonymous feedback'));assert(notes.includes('not field verification'));
assert(!notes.includes('trackEngagement'));assert(!notes.includes('localStorage'));
console.log('PASS: five distinct bilingual Seoul candidates, dated official sources, explicit unknowns, on-demand evidence and direct place links.');
const path=require('node:path'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),cache=new Map();
function load(file){if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache.has(file))return cache.get(file);const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('require','module','exports',code)(name=>name.startsWith('@/lib/')?load(name.slice(2)+(name.endsWith('.json')?'':'.ts')):name.startsWith('.')?load(path.join(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts')):require(name),mod,mod.exports);cache.set(file,mod.exports);return mod.exports;}
const {guides:allGuides,guidePlaces}=load('lib/guides.ts'),{catalog}=load('lib/catalog.ts'),{safeReturnTarget,placePathWithReturn}=load('lib/place-return.ts'),Notes=load('app/seoul-pause-notes.tsx').default;
const guide=allGuides.find(g=>g.slug==='seoul-pauses'),ready=guidePlaces(guide,catalog);
assert.deepEqual(ready.map(p=>p.id),['kr-seoul-seonyudo-park','kr-seoul-forest']);
for(const language of ['ko','en'])for(const place of ready){
 assert(place.image&&place.imageSource&&place.imageLicenseUrl);
 const record=records.find(r=>r.id===place.id),html=renderToStaticMarkup(React.createElement(Notes,{id:place.id,language}));
 assert(html.includes(record[language==='ko'?'hookKo':'hookEn']));assert(html.includes(record[language==='ko'?'cautionKo':'cautionEn']));
 assert(!/<details[^>]* open/.test(html));assert(html.includes('dateTime="2026-10-14"'));
 const back=`/guides/seoul-pauses/${language}#guide-place-${place.id}`;assert.equal(safeReturnTarget(back),back);assert(placePathWithReturn(place.id,language,back).includes('returnTo='));
}
console.log('PASS: actual bilingual evidence markup, only two source/photo-ready entries, held candidates excluded, disclosures default closed and safe direct-detail return links.');
