const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file){const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('require','module','exports',code)(n=>n.startsWith('@/lib/')?load(n.slice(2)+'.ts'):require(n),mod,mod.exports);return mod.exports;}
const {historyForPlace}=load('lib/place-history.ts'),History=load('app/place-history.tsx').default;
for(const id of ['unknown','tour-4108662','__proto__','constructor']){assert.equal(historyForPlace(id),undefined);assert.equal(renderToStaticMarkup(React.createElement(History,{id,language:'en'})),'');}
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[c]));
for(const id of ['kr-seoul-seonyudo-park','kr-seoul-forest'])for(const language of ['ko','en']){
 const h=historyForPlace(id),html=renderToStaticMarkup(React.createElement(History,{id,language}));assert.equal(h.facts.length,3);assert.match(h.source,/^https:\/\/(www\.)?(parks\.)?seoul\.go\.kr\//);assert.equal(h.checked,'2026-10-15');assert(html.includes(escape(h[language==='ko'?'hookKo':'hookEn'])));
 for(const f of h.facts)assert(html.includes(escape(f[language])));assert.equal((html.match(/<li>/g)||[]).length,3);assert(!/<details[^>]*\bopen/.test(html));assert(html.includes('rel="noopener noreferrer"'));assert(!html.includes('<img'));
}
assert(historyForPlace('kr-seoul-forest').facts[0].en.includes('area once accommodated'));assert(historyForPlace('kr-seoul-forest').facts[1].en.includes('June 18, 2005'));
assert(historyForPlace('kr-seoul-seonyudo-park').facts[0].en.includes('1978 to 2000'));
for(const p of ['app/guides/[slug]/[language]/page.tsx','app/places/[id]/[language]/page.tsx'])assert(fs.readFileSync(p,'utf8').includes('<PlaceHistory id={place.id} language={language}/>'));
console.log('PASS: two primary-sourced bilingual histories, three facts each, default-closed disclosure, absent/prototype IDs hidden, safe source links, no images, shared guide/detail integration.');
assert.match(fs.readFileSync('app/seoul-pause.css','utf8'),/\.place-history summary\{[^}]*display:list-item/,'native disclosure marker remains visible');
