const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function compile(file,imports){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(imports,m,m.exports);return m.exports;}
function load(file){if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(path.join(root,file)));if(cache.has(file))return cache.get(file);const m=compile(file,n=>n.startsWith('.')?load(path.join(path.dirname(file),n)+(n.endsWith('.json')?'':'.ts')):require(n));cache.set(file,m);return m;}
function nodes(node,out=[]){if(Array.isArray(node))node.forEach(n=>nodes(n,out));else if(node&&typeof node==='object'){out.push(node);nodes(node.props?.children,out);}return out;}
function text(node){return Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.props?.children):typeof node==='string'||typeof node==='number'?String(node):'';}
const {placeArea}=load('lib/place-area.ts'),{catalog}=load('lib/catalog.ts'),before=JSON.stringify(catalog),areas=new Set(catalog.filter(p=>p.country==='KR').map(p=>p.area));
for(const area of areas){assert.equal(placeArea(area,'ko'),area);assert(!/[가-힣]/.test(placeArea(area,'en')),'missing complete English alias: '+area);}
assert.equal(placeArea('전남광주통합특별시 담양군','en'),'Damyang-gun, Jeonnam-Gwangju');
assert.equal(placeArea('전남광주통합특별시 동구','en'),'Dong-gu, Jeonnam-Gwangju');
assert.equal(placeArea('전북특별자치도 무주군','en'),'Muju-gun, Jeonbuk State');
assert.equal(placeArea('강원특별자치도 강릉시','en'),'Gangneung-si, Gangwon State');
assert.equal(placeArea('경기도 광주시','en'),'Gwangju-si, Gyeonggi-do','distinct Gwangju jurisdiction is preserved');
for(const area of ['__proto__','constructor','toString','London','Brooklyn · New York','새로운시 새구','서울특별시 카페 이름'])assert.equal(placeArea(area,'en'),area,'unknown values stay whole, never partially translated');
for(const region of load('lib/regions.ts').supportedCities){assert(!/[가-힣]/.test(placeArea(region,'en')),'approved community place uses its city as area: '+region);assert.equal(placeArea(region,'ko'),region);}
assert.equal(placeArea('서울','en'),'Seoul');
const stub=()=>null,imports=n=>n==='react/jsx-runtime'?require(n):n==='next/navigation'?{notFound(){throw Error('404');}}:n.startsWith('@/lib/')?load(n.slice(2)+(n.endsWith('.json')?'':'.ts')):n==='lucide-react'?new Proxy({},{get:()=>stub}):n==='@/app/locale'?{LanguageProvider:stub}:{default:stub,__esModule:true};
const detail=compile('app/places/[id]/[language]/page.tsx',imports),Guide=compile('app/guides/[slug]/[language]/page.tsx',imports).default,Region=compile('app/regions/[slug]/[language]/page.tsx',imports).default;
(async()=>{
 const examples=['전남광주통합특별시 담양군','전북특별자치도 무주군','강원특별자치도 강릉시'];
 for(const area of examples){const place=catalog.find(p=>p.area===area);assert(place);for(const language of ['ko','en']){
  const props={params:Promise.resolve({id:place.id,language}),searchParams:Promise.resolve({})},tree=await detail.default(props),all=nodes(tree);
  assert(text(all.find(n=>n.props?.className==='place-eyebrow')).includes(placeArea(area,language)),'actual detail area uses complete alias');
  assert(text(all.find(n=>n.props?.className==='place-heading')).includes(place.address),'original navigable address stays intact');
  const metadata=await detail.generateMetadata(props);assert(metadata.title.includes(placeArea(area,language)),'metadata uses matching display alias');
 }}
 for(const language of ['ko','en']){
  const guide=await Guide({params:Promise.resolve({slug:'waterside-pause',language})});
  for(const card of nodes(guide).filter(n=>n.type==='article'&&n.props.id?.startsWith('guide-place-'))){const place=catalog.find(p=>p.id===card.props.id.slice('guide-place-'.length));assert(text(card).includes(placeArea(place.area,language)));}
  const region=await Region({params:Promise.resolve({slug:'jeonbuk',language}),searchParams:Promise.resolve({})});
  for(const card of nodes(region).filter(n=>n.type==='article'&&n.props['data-region-place'])){const place=catalog.find(p=>p.id===card.props['data-region-place']);assert(text(card).includes(placeArea(place.area,language)));}
 }
 assert.equal(JSON.stringify(catalog),before,'localization never edits source data, IDs, addresses, photos, credits, or filters');
 for(const file of ['app/home-finder.tsx','app/home-themes.tsx','app/rest-finder.tsx','app/journal/journal.tsx','app/journal/story-card.tsx'])assert(fs.readFileSync(path.join(root,file),'utf8').includes('placeArea('),file+' uses the same exact area aliases');
 console.log(`PASS: ${areas.size} complete Korean area aliases; KO unchanged, EN without partial administrative names; actual detail/guide/region rendering and metadata; source data and unknown labels preserved.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
