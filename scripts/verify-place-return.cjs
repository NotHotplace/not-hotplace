const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function compile(file,imports){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(imports,m,m.exports);return m.exports;}
function load(file){if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(path.join(root,file)));if(cache.has(file))return cache.get(file);const m=compile(file,n=>n.startsWith('.')?load(path.join(path.dirname(file),n)+(n.endsWith('.json')?'':'.ts')):require(n));cache.set(file,m);return m;}
function nodes(node,out=[]){if(Array.isArray(node))node.forEach(n=>nodes(n,out));else if(node&&typeof node==='object'){out.push(node);nodes(node.props?.children,out);}return out;}
function text(node){return Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.props?.children):typeof node==='string'||typeof node==='number'?String(node):'';}
const ret=load('lib/place-return.ts'),{safeReturnTarget,detailReturn,placePathWithReturn,homeReturnPath,readHomeChoices,localizedReturnTarget}=ret;
for(const unsafe of [undefined,null,[],['/kr'],'https://evil.test/','//evil.test','/\\evil.test','javascript:alert(1)','/login?next=https://evil.test','/api/action','/places/cj-daechung/ko','/%2f%2fevil.test','/regions/not-real/ko','/regions/new-york/fr','/regions/new-york/ko?page=-1','/us\n','/'.repeat(2050)])assert.equal(safeReturnTarget(unsafe),null,String(unsafe));
assert.equal(safeReturnTarget('/us?lang=en&region=New+York&category=cafe&q=coffee&photos=1&quiet=1&returnTo=https://evil.test&token=secret#setup=secret'),'/us?lang=en&region=New+York&category=cafe&q=coffee&photos=1&quiet=1');
assert.equal(localizedReturnTarget('/regions/new-york/ko?page=2#region-place-nyc-park-b544','en'),'/regions/new-york/en?page=2#region-place-nyc-park-b544');
assert.deepEqual(readHomeChoices(new URLSearchParams('country=US&region=New+York&purpose=cafe&homeTheme=private-room')),{country:'US',region:'New York',purpose:'cafe',theme:'private-room'});
assert.deepEqual(readHomeChoices(new URLSearchParams('country=ZZ&region=New+York&purpose=madeup')),{country:undefined,region:'전국',purpose:'all',theme:'all'});
const stub=()=>null;
const Page=compile('app/places/[id]/[language]/page.tsx',n=>n==='react/jsx-runtime'?require(n):n==='next/navigation'?{notFound(){throw Error('404');}}:n.startsWith('@/lib/')?load(n.slice(2)+'.ts'):n==='lucide-react'?new Proxy({},{get:()=>stub}):{default:stub,__esModule:true}).default;
(async()=>{
 for(const language of ['ko','en'])for(const [kind,target,expectedLabel]of [
  ['home',homeReturnPath(language,'US','New York','cafe'),language==='ko'?'홈 추천으로 돌아가기':'Back to home recommendations'],
  ['region',`/regions/new-york/${language}?page=2#region-place-nyc-park-b544`,language==='ko'?'지역 목록으로 돌아가기':'Back to the region list'],
  ['map',`/us?lang=${language}&region=New+York&category=cafe&q=coffee&photos=1&resume=1`,language==='ko'?'지도로 돌아가기':'Back to the map'],
  ['direct',undefined,language==='ko'?'지도에서 더 찾아보기':'Explore the map'],
  ['direct','https://evil.test/',language==='ko'?'지도에서 더 찾아보기':'Explore the map'],
 ]){
  const tree=await Page({params:Promise.resolve({id:'us-stumptown-brooklyn',language}),searchParams:Promise.resolve({returnTo:target})}),all=nodes(tree),back=all.find(n=>n.props?.className==='place-back');
  const expected=detailReturn(target,language,'US');assert.equal(back.props.href,expected.href);assert.equal(text(back),expectedLabel);assert.equal(back.props.onClick,undefined,'return remains a native anchor without history tricks');
  const switcher=all.find(n=>n.type==='a'&&n.props.hrefLang===(language==='ko'?'en':'ko'));
  const query=new URL(switcher.props.href,'https://example.test').searchParams;
  assert.equal(query.get('returnTo'),kind==='direct'?null:localizedReturnTarget(target,language==='ko'?'en':'ko'));
  if(kind!=='direct'){const roundtrip=new URL(placePathWithReturn('us-stumptown-brooklyn',language,target),'https://example.test').searchParams.get('returnTo');assert.equal(roundtrip,expected.href);}
 }
 console.log('PASS: actual KO/EN detail links return to home, exact region page/card, or filtered map; direct/invalid fallback, localized context, URL choice hydration, native history and open-redirect rejection.');
})().catch(e=>{console.error(e);process.exitCode=1;});
