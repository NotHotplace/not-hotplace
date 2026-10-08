const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function compile(file,imports){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(imports,m,m.exports);return m.exports;}
function load(file){if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(path.join(root,file)));if(cache.has(file))return cache.get(file);const result=compile(file,n=>n.startsWith('.')?load(path.join(path.dirname(file),n)+(n.endsWith('.json')?'':'.ts')):require(n));cache.set(file,result);return result;}
function nodes(node,out=[]){if(Array.isArray(node))node.forEach(n=>nodes(n,out));else if(node&&typeof node==='object'){out.push(node);nodes(node.props?.children,out);}return out;}
function hooks(){let si,ri,mi,ei;const states=[],refs=[],memos=[],effects=[],pending=[];return {start(){si=ri=mi=ei=0;},flush(){while(pending.length)pending.shift()();},close(){effects.forEach(e=>e.cleanup?.());},react:{...require('react'),useState(initial){const i=si++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];},useRef(initial){return refs[ri++]||(refs[ri-1]={current:initial});},useMemo(fn){mi++;return fn();},useEffect(fn,deps){const i=ei++,old=effects[i];if(!old||!deps||deps.some((v,n)=>!Object.is(v,old.deps[n])))pending.push(()=>{old?.cleanup?.();effects[i]={deps,cleanup:fn()};});}}};}
for(const initial of ['/', '/?place=cj-daechung', '/?category=cafe', '/?q=coffee']){
 let current=new URL(initial,'https://nothotplace.com'),redirect=null,context;const writes=[],memory=new Map([['nhp-language','ko']]);
 global.location={get pathname(){return current.pathname;},get search(){return current.search;},get hash(){return current.hash;},get href(){return current.href;},replace(value){redirect=value;}};
 global.window={addEventListener(){},removeEventListener(){}};global.history={state:{keep:true},replaceState(state,title,url){writes.push(url);current=new URL(url,current);}};
 global.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};global.document={documentElement:{lang:'en'}};
 Object.defineProperty(global,'navigator',{value:{language:'en-US'},configurable:true});global.fetch=()=>new Promise(()=>{});
 const provider=hooks(),globe=hooks(),finder=hooks(),themes=hooks();provider.react.useContext=()=>context;
 const locale=compile('app/locale.tsx',n=>n==='react'?provider.react:n.startsWith('@/')?load(n.slice(2)):require(n));
 const generic=(name,react)=>name==='react'?react:name==='react/jsx-runtime'?require(name):name==='./locale'?locale:name.startsWith('@/lib/')?load(name.slice(2)+'.ts'):new Proxy({},{get:(_,key)=>key==='__esModule'?true:'mock:'+String(key)});
 const Globe=compile('app/globe.tsx',n=>n==='@/hooks/use-globe-motion'?{useGlobeMotion:()=>({turnTo(){},rotation:{current:0},tilt:{current:0}})}:n==='./home-finder'?{default:'home-finder',__esModule:true}:n==='./home-themes'?{default:'home-themes',__esModule:true}:generic(n,globe.react)).default;
 const Finder=compile('app/home-finder.tsx',n=>generic(n,finder.react)).default,Themes=compile('app/home-themes.tsx',n=>generic(n,themes.react)).default;
 for(let round=0;round<3;round++){
  provider.start();const providerTree=locale.LanguageProvider({initialLanguage:'en',children:null});context=providerTree.props.value;
  globe.start();const tree=Globe();const components=nodes(tree);
  finder.start();Finder(components.find(n=>n.type==='home-finder').props);
  themes.start();Themes(components.find(n=>n.type==='home-themes').props);
  // React passive effects initialize children before parents.
  finder.flush();themes.flush();globe.flush();provider.flush();
  if(redirect)break;
 }
 if(initial==='/'){assert.equal(document.documentElement.lang,'ko');assert.equal(current.searchParams.get('lang'),'ko');assert(writes.every(url=>!url.includes('lang=en')),'child cannot turn SSR English into an explicit preference');}
 else {assert.equal(redirect,'/kr'+new URL(initial,'https://nothotplace.com').search);assert.equal(writes.length,0,'legacy browse query survives child-before-parent mount');}
 for(const component of [finder,themes,globe,provider])component.close();
}
console.log('PASS: actual LanguageProvider → GlobeHome → HomeFinder/HomeThemes mount order keeps saved Korean and legacy root place/category/search migration intact.');
