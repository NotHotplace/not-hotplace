const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function compile(file,req=require){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText)(req,m,m.exports);return m.exports;}
const links=compile('lib/place-directions.ts');
const p={id:'sample',country:'KR',name:'서울 숲 & 정원, 1층',address:'서울특별시 성동구 뚝섬로 273',lat:37.5445,lon:127.0374,locationInfo:{kind:'reference',source:'https://parks.seoul.go.kr/',checked:'2026-10-17'}};
for(const mode of links.travelModes){
 const result=links.directionLinks(p,mode),google=new URL(result.find(x=>x.provider==='google').href),naver=new URL(result.find(x=>x.provider==='naver').href),kakao=new URL(result.find(x=>x.provider==='kakao').href);
 assert.equal(google.searchParams.get('api'),'1');assert.equal(google.searchParams.get('travelmode'),mode);assert.equal(google.searchParams.get('destination'),'37.5445,127.0374');
 assert.equal(naver.pathname,'/'+{driving:'car',walking:'walk',transit:'public'}[mode]);assert.equal(naver.searchParams.get('dname'),p.name);assert.equal(naver.searchParams.get('appname'),'https://nothotplace.com');
 assert.equal(kakao.searchParams.get('by'),{driving:'car',walking:'foot',transit:'publictransit'}[mode]);assert.equal(kakao.searchParams.get('ep'),'37.5445,127.0374');
 for(const item of result){const url=new URL(item.href);for(const key of ['origin','origin_place_id','sp','slat','slng','sname','dir_action','key','destination_place_id'])assert.equal(url.searchParams.has(key),false,key);assert(!/undefined|null|NaN/.test(item.href));}
 const web=result.find(x=>x.kind==='web-route');assert.equal(decodeURIComponent(new URL(web.href).pathname),'/link/to/'+p.name+',37.5445,127.0374');
}
for(const [lat,lon] of [[null,null],[undefined,undefined],[NaN,127],[Infinity,127],[91,127],[37,181],['37','127']]){
 const q={...p,lat,lon};assert.equal(links.validCoordinates(q),false);assert(!links.directionLinks(q,'walking').some(x=>x.appOnly));assert.equal(new URL(links.directionLinks(q,'walking').find(x=>x.provider==='google').href).searchParams.get('destination'),p.name+' '+p.address);
}
for(const locationInfo of [undefined,{kind:'reference'},{kind:'entrance',source:'javascript:alert(1)',checked:'2026-10-17'},{kind:'reference',source:'https://example.test'}])assert(!links.hasSourcedCoordinates({...p,locationInfo}));
for(const checked of ['invalid','2099-01-01','2026-02-30','2026-2-01'])assert(!links.hasSourcedCoordinates({...p,locationInfo:{...p.locationInfo,checked}}));
for(const source of ['https://','https://user:pass@example.com','http://example.com'])assert(!links.hasSourcedCoordinates({...p,locationInfo:{...p.locationInfo,source}}));
assert(!links.directionLinks({...p,lat:0,lon:0},'driving').some(x=>x.appOnly));
assert.equal(links.directionLinks({...p,country:'JP'},'transit').length,1);
assert.equal(links.directionLinks({...p,name:'',address:''},'driving').length,0);
assert.equal(links.directionLinks(p,'flying').length,0);
// Real JSX interaction harness: radio changes are local only; links require clicks.
let states=[],index=0,tree,events=[],writes=[],closed=false,focused=false;
const ref={current:{open:true,querySelector:()=>({focus:()=>focused=true})}};
const react={useState:initial=>{let i=index++;if(!(i in states))states[i]=initial;return[states[i],v=>states[i]=v];},useId:()=>':test:',useRef:()=>ref};
const Component=compile('app/place-directions.tsx',n=>n==='react'?react:n==='react/jsx-runtime'?{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})}:n==='@/lib/place-directions'?links:n==='@/lib/engagement-client'?{trackEngagement:(...a)=>events.push(a)}:n==='@/lib/rest-journal'?{recordPause:a=>writes.push(a)}:require(n)).default;
const nodes=(n,out=[])=>{if(Array.isArray(n))n.forEach(x=>nodes(x,out));else if(n&&typeof n==='object'){out.push(n);nodes(n.props?.children,out);}return out;};
function render(language='ko'){index=0;tree=Component({place:p,language,id:'directions'});return nodes(tree);}
let all=render();assert.equal(tree.type,'details');assert.equal(events.length,0);assert.equal(writes.length,0);
all.find(n=>n.type==='input'&&n.props.value==='walking').props.onChange();all=render();assert.equal(all.find(n=>n.type==='input'&&n.props.value==='walking').props.checked,true);assert.equal(events.length,0);
assert(all.find(n=>n.type==='a'&&n.props.href.startsWith('nmap:')).props.href.includes('/walk?'));
all.find(n=>n.type==='a'&&n.props.href.startsWith('nmap:')).props.onClick();assert.equal(events.length,1);assert.equal(writes.length,1);
all.find(n=>n.type==='button').props.onClick();assert.equal(ref.current.open,false);assert.equal(focused,true);
all=render('en');assert(all.some(n=>n.type==='summary'&&n.props.children==='Directions · choose travel mode'));
const component=fs.readFileSync(path.join(root,'app/place-directions.tsx'),'utf8');assert(!/geolocation|getCurrentPosition|watchPosition|setTimeout|window\.open|location\.href|fetch\(/.test(component));
const page=fs.readFileSync(path.join(root,'app/places/[id]/[language]/page.tsx'),'utf8');assert(page.includes('id="directions"'));assert(page.includes('href="#directions"'));assert(page.includes('mapUrl={mapPath(place)}'));
const explorer=fs.readFileSync(path.join(root,'app/explorer.tsx'),'utf8');assert(explorer.includes('<PlaceDirections key={focused.id}'));assert(explorer.includes('href={mapPath(focused)}'));
console.log('PASS: official destination-only URL modes/encoding, invalid and unsourced coordinates, privacy, KR/world providers, explicit fallbacks, local radio state and close/focus, preserved map search links.');
