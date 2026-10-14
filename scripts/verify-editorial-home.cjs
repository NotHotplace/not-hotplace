const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const {renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),cache=new Map();
function compile(file,imports){const source=fs.readFileSync(path.join(root,file),'utf8'),result=ts.transpileModule(source,{reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});assert(!result.diagnostics?.some(item=>item.category===ts.DiagnosticCategory.Error),'valid TypeScript syntax: '+file);const mod={exports:{}};new Function('require','module','exports',result.outputText)(imports,mod,mod.exports);return mod.exports;}
function load(file){if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));if(cache.has(file))return cache.get(file);const value=compile(file,name=>name.startsWith('.')?load(path.join(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts')):require(name));cache.set(file,value);return value;}
function nodes(value,out=[]){if(Array.isArray(value))value.forEach(node=>nodes(node,out));else if(value&&typeof value==='object'){out.push(value);nodes(value.props?.children,out);}return out;}
function text(value){return Array.isArray(value)?value.map(text).join(''):value&&typeof value==='object'?text(value.props?.children):typeof value==='string'||typeof value==='number'?String(value):'';}
const {countries,countryCodes}=load('lib/countries.ts'),{catalog}=load('lib/catalog.ts'),{finderMatches}=load('lib/catalog-views.ts'),{guides}=load('lib/guides.ts');
const GuideLinks=compile('app/home-guides.tsx',name=>name.startsWith('@/')?load(name.slice(2)+'.ts'):require(name)).default;
for(const language of ['ko','en']){
 for(const country of countryCodes){
  const tree=GuideLinks({language,country}),all=nodes(tree),nav=all.find(node=>node.type==='nav'&&node.props['aria-label']===(language==='ko'?'대표 가이드':'Featured guides'));
  const eligible=guides.filter(guide=>(guide.country===country||guide.countryGroup?.includes(country))&&guide.kind!=='photos');
  const featured=nodes(nav).filter(node=>node.type==='a');assert.equal(featured.length,Math.min(2,eligible.length));
  if(country==='KR')assert.deepEqual(featured.map(node=>node.props.href),['korea-reading-cafes','seoul-solo-seating'].map(slug=>`/guides/${slug}/${language}`));
  const links=all.filter(node=>node.type==='a'&&/^\/guides\//.test(node.props.href));
  assert.equal(links.length,eligible.length,'no guide disappears for '+country);
  assert.equal(new Set(links.map(node=>node.props.href)).size,links.length);
  for(const link of links)assert(eligible.some(guide=>link.props.href===`/guides/${guide.slug}/${language}`),'no other-country guide leaks into shortlist');
  const disclosure=all.find(node=>node.type==='details');assert.equal(Boolean(disclosure),eligible.length>2);if(disclosure)assert.equal(disclosure.props.open,undefined,'additional guides start collapsed');
  for(const route of ['/regions?lang=','/journal?lang=','/guides?lang='])assert(all.some(node=>node.type==='a'&&node.props.href===route+language));
  const markup=renderToStaticMarkup(tree);assert(!/undefined|NaN/.test(markup));
 }
 function home(country,region,purpose,matches){
  const ko=language==='ko',locale={useLocale:()=>({lang:language,text:(en,ko)=>language==='ko'?ko:en,t:value=>value==='서울'&&!ko?'Seoul':value})};
  const PhotoCredit=compile('app/photo-credit.tsx',name=>name.startsWith('@/')?load(name.slice(2)+'.ts'):require(name)).default;
  const Reasons=compile('app/place-reasons.tsx',name=>name.startsWith('@/')?load(name.slice(2)+'.ts'):require(name)).default;
  const react={...require('react'),useEffect(){},useRef:value=>({current:value}),useState:value=>[Array.isArray(value)?matches:value==='loading'?'ready':value,()=>{}]};
  const Finder=compile('app/home-finder.tsx',name=>name==='react'?react:name==='./locale'?locale:name==='./photo-credit'?{default:PhotoCredit,__esModule:true}:name==='./place-reasons'?{default:Reasons,__esModule:true}:name==='@/lib/engagement-client'?{trackEngagement(){}}:name.startsWith('@/')?load(name.slice(2)+'.ts'):require(name)).default;
  return Finder({country,initialRegion:region,initialPurpose:purpose,ready:true});
 }
 const matches=(country,region,purpose)=>finderMatches(catalog,new URLSearchParams({country,region,purpose}),country);
 const walk=home('KR','서울','drive',matches('KR','서울','drive')),walkNodes=nodes(walk),feature=walkNodes.find(node=>node.type==='article');
 assert.equal(walkNodes.filter(node=>node.type==='article').length,2,'exactly two supported walking places; no filler');
 assert(text(nodes(feature).find(node=>node.type==='h1')).includes(language==='ko'?'선유도공원':'Seonyudo Park'));
 assert.equal(walkNodes.filter(node=>node.type==='img'&&node.props.fetchPriority==='high').length,1,'one prioritized lead photo');
 const html=renderToStaticMarkup(walk);
 assert(html.includes('archive.visitseoul.net/ko/contents/ARP0082v1'),'the lead photograph keeps its exact source');
 assert(html.includes('copyright?_ID=200100'),'the lead photograph keeps its license link');
 assert(html.includes(language==='ko'?'음식물 반입 금지':'No food allowed'));
 assert(html.includes(language==='ko'?'일반 주차 불가':'No general on-site parking'));
 assert(html.includes(language==='ko'?'자료사진':'Archive photo')||html.includes(language==='ko'?'촬영일':'capture date'));
 const caption=html.match(/<p class="editorial-photo-credit">[\s\S]*?<\/p>/)?.[0],photoDetails=html.match(/<details class="editorial-photo-details">([\s\S]*?)<\/details>/)?.[1];
 assert(caption&&photoDetails,'lead photo retains a visible caption and native collapsed details');
 for(const value of ['archive.visitseoul.net/ko/contents/ARP0082v1','copyright?_ID=200100',language==='ko'?'촬영일 미상':'capture date unknown'])assert(caption.includes(value),'visible photo attribution/capture context: '+value);
 assert(!caption.includes('WebP'),'technical processing is not repeated in the initial photo caption');
 for(const value of ['852×567','WebP',language==='ko'?'서울관광재단의 추천':'Seoul Tourism Organization endorsement'])assert(photoDetails.includes(value),'complete reuse/processing note remains in photo details');
 assert(photoDetails.includes(language==='ko'?'사진 상세 정보':'Photo details'));
 assert.equal(walkNodes.filter(node=>node.props?.className==='finder-note').length,1,'one candidate count/status line');
 assert(!text(walk).includes(language==='ko'?'후보를 최대 세 곳':'Up to three candidates'),'generic quietness disclaimer is not repeated under the hero');
 const forest=home('KR','서울','all',matches('KR','서울','all')),forestHtml=renderToStaticMarkup(forest);
 const forestCaption=forestHtml.match(/<p class="editorial-photo-credit">[\s\S]*?<\/p>/)?.[0];assert(forestCaption.includes('2026-06-21'),'known archival capture date stays visible');

 assert(nodes(walk).findIndex(node=>node.props?.id==='home-region-choice')<nodes(walk).findIndex(node=>node.props?.id==='home-pause-choice'),'country/city come before purpose');
 const city=walkNodes.find(node=>node.props?.id==='home-region-choice');assert.equal(nodes(city).filter(node=>node.type==='option').length,countries.KR.regions.length+1);
 const cafeMatches=matches('KR','서울','cafe'),cafe=home('KR','서울','cafe',cafeMatches);assert.equal(nodes(cafe).filter(node=>node.type==='article').length,2);assert(!text(cafe).includes(language==='ko'?'선유도공원':'Seonyudo Park'));
 const benIntro=nodes(cafe).find(node=>node.props?.className==='editorial-deck');assert.equal(text(benIntro),cafeMatches[0].reason[language==='ko'?'textKo':'textEn'],'lead intro retains the complete music qualification');
 assert(text(nodes(cafe).find(node=>node.type==='h1')).includes(language==='ko'?'벤의 서재':'Ben’s Library'));
 const withoutSeonyudo=matches('KR','서울','drive').filter(match=>match.place.id!=='kr-seoul-seonyudo-park');assert(!renderToStaticMarkup(home('KR','서울','drive',withoutSeonyudo)).includes('/places/kr-seoul-seonyudo-park/'),'missing eligible lead cannot be replaced with a hardcoded place');
 const empty=home('KR','서울','food',[]);assert.equal(nodes(empty).filter(node=>node.type==='article').length,0);assert(nodes(empty).some(node=>node.props?.role==='status'));
 for(const country of ['JP','US','GB'])for(const purpose of ['all','cafe','drive']){
  const actual=matches(country,'전국',purpose),tree=home(country,'전국',purpose,actual);
  assert.equal(nodes(tree).filter(node=>node.type==='article').length,actual.length,'candidate count preserved');
  assert(!renderToStaticMarkup(tree).includes('/places/kr-seoul-seonyudo-park/'),'no Seoul fallback in '+country);
 }
}
const css=fs.readFileSync(path.join(root,'app/editorial-home.css'),'utf8'),globe=fs.readFileSync(path.join(root,'app/globe.tsx'),'utf8');
assert(css.includes('border-radius:12px'),'photos get a soft finish');assert(css.includes('border-radius:9px'),'buttons get a soft finish');
assert(css.includes('@media(max-width:600px)'));assert(css.includes('@media(prefers-reduced-motion:reduce)'));
assert(!/@import|@font-face|url\(https?:|backdrop-filter/.test(css),'no new remote asset, font or expensive backdrop effect');
assert(css.includes('grid-template-columns:minmax(0,1fr)'),'phone columns may shrink');
assert(css.includes('.editorial-feature.editorial-feature-no-photo { grid-template-columns:minmax(0,680px); }'),'no-photo layout specificity beats tablet two-column overrides');
assert(fs.statSync(path.join(root,'public/assets/home-globe.webp')).size<12000,'globe thumbnail budget');
assert((globe.match(/href=\{'\/install\?lang='\+lang\}/g)||[]).length>=2,'discoverable install entries remain in header and footer');
assert(!/\.editorial-home\s+\.world-install-link[^}]*display:none/.test(css),'install is never hidden');
assert(globe.includes('useGlobeMotion(globeOpen && !!geo && !!data, visible && !focusedCountry)'));
function luminance(hex){const [r,g,b]=hex.match(/\w\w/g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b;}
for(const [fg,bg]of [['293326','f8f5ed'],['626b5b','f8f5ed'],['af4c2b','f8f5ed'],['ffffff','af4c2b'],['4f6340','f8f5ed']]){const a=luminance(fg),b=luminance(bg);assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'normal text contrast '+fg+'/'+bg);}
console.log('PASS: rendered KO/EN editorial lead, source/license/caveats, exact no-filler candidate sets, localized names, absent-lead and other-country safety, all 30 country guide scopes, two featured/expandable remaining guides, install/resource/contrast/motion contracts. Browser layout is not verified by this test.');
