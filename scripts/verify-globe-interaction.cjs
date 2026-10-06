const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function compile(file,imports){const module={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(imports,module,module.exports);return module.exports;}
function load(file){if(cache.has(file))return cache.get(file);const result=file.endsWith('.json')?JSON.parse(fs.readFileSync(path.join(root,file),'utf8')):compile(file,name=>name.startsWith('.')?load(path.join(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts')):require(name));cache.set(file,result);return result;}
function nodes(node,result=[]){if(Array.isArray(node))node.forEach(v=>nodes(v,result));else if(node&&typeof node==='object'){result.push(node);nodes(node.props?.children,result);}return result;}
const geoContext={};vm.runInNewContext(fs.readFileSync(path.join(root,'public/vendor/d3.min.js'),'utf8'),geoContext);const geo=geoContext.d3;
const {countries,countryCodes}=load('lib/countries.ts');
const world=load('public/maps/world.json');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function harness(lang){
 let tree,si=0,ri=0,ei=0,mi=0,dirty=false,rotation=-127,width=650,paused=false,resize,readiness;
 const states=[],refs=[],effects=[],memos=[],pending=[],requests=[];
 const dragging={current:false},captured=new Set();
 const surface={getBoundingClientRect:()=>({width}),contains:node=>node==='inside',setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture:id=>captured.delete(id)};
 global.location=new URL('https://nothotplace.com/?lang='+lang);
 global.localStorage={getItem:()=>null};
 global.window={addEventListener:(event,fn)=>{if(event==='resize')resize=fn;},removeEventListener:()=>{}};
 global.fetch=async url=>{requests.push(url);assert.equal(url,'/maps/world.json');return {ok:true,json:async()=>world};};
 const react={
  useState(initial){const i=si++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],value=>{const next=typeof value==='function'?value(states[i]):value;if(!Object.is(next,states[i])){states[i]=next;dirty=true;}}];},
  useRef(initial){const i=ri++;return refs[i]||(refs[i]={current:initial});},
  useMemo(fn,deps){const i=mi++,old=memos[i];if(old&&deps.every((v,n)=>Object.is(v,old.deps[n])))return old.value;const value=fn();memos[i]={deps,value};return value;},
  useEffect(fn,deps){const i=ei++,old=effects[i];if(!old||deps.some((v,n)=>!Object.is(v,old.deps[n])))pending.push(()=>{old?.cleanup?.();effects[i]={deps,cleanup:fn()};});},
 };
 const motion=(ready,visible)=>{readiness={ready,visible};return{rotation,dragging,enabled:!paused,reduced:false,turnTo:value=>{rotation=value;dirty=true;},toggle:()=>{paused=!paused;dirty=true;}};};
 const component=compile('app/globe.tsx',name=>name==='react'?react:name==='react/jsx-runtime'?require(name):name==='./locale'?{useLocale:()=>({lang,text:(en,ko)=>lang==='en'?en:ko}),LanguageToggle:'language-toggle'}:name==='@/hooks/use-globe-motion'?{useGlobeMotion:motion}:name==='@/lib/geo-client'?{loadGeo:async()=>geo}:name.startsWith('@/lib/')?load(name.slice(2)+'.ts'):new Proxy({},{get:(_,key)=>key==='__esModule'?true:'mock:'+String(key)})).default;
 function render(){let rounds=0;do{assert(++rounds<25);dirty=false;si=ri=ei=mi=0;tree=component();for(const node of nodes(tree))if(node.props?.ref)node.props.ref.current=node.type==='svg'?surface:{};while(pending.length)pending.shift()();}while(dirty);return tree;}
 const byClass=name=>nodes(tree).filter(n=>String(n.props?.className||'').split(' ').includes(name));
 const svg=()=>nodes(tree).find(n=>n.type==='svg');
 const pointer=(x,y=100,extra={})=>({clientX:x,clientY:y,button:0,isPrimary:true,pointerId:1,currentTarget:surface,...extra});
 function click(link,detail=1){let prevented=false,stopped=false;svg().props.onClickCapture({detail,preventDefault:()=>prevented=true,stopPropagation:()=>stopped=true});if(!prevented)global.location=new URL(link.props.href,global.location);return {prevented,stopped};}
 render();
 return {render,byClass,svg,pointer,click,requests,get motion(){return readiness;},get rotation(){return rotation;},get dragging(){return dragging.current;},surface,
  async open(){nodes(tree).find(n=>n.type==='details').props.onToggle({currentTarget:{open:true}});render();await flush();render();},
  close(){nodes(tree).find(n=>n.type==='details').props.onToggle({currentTarget:{open:false}});render();},
  resize(value){width=value;resize?.();render();},
  select(code){nodes(tree).find(n=>n.props?.onCountryChange).props.onCountryChange(code);render();},
  rotate(delta){rotation+=delta;render();},
 };
}
(async()=>{
 for(const lang of ['ko','en']){
  const h=harness(lang);assert.equal(h.requests.length,0,'closed globe is lazy');assert.equal(h.motion.ready,false);await h.open();assert.equal(h.motion.ready,true);assert.equal(h.requests.length,1);
  let pins=h.byClass('globe-pin');assert(pins.length>1,'multiple countries get labels');assert(pins.some(n=>n.props['data-country']==='KR'));
  for(const pin of pins){const code=pin.props['data-country'];assert.equal(pin.type,'a');assert.equal(pin.props.tabIndex,0);assert.equal(pin.props.href,'/'+countries[code].slug+'?lang='+lang);assert.equal(pin.props['aria-label'],lang==='ko'?countries[code].nameKo:countries[code].nameEn);}
  const korea=pins.find(n=>n.props['data-country']==='KR');
  const before=JSON.stringify(korea.props.children[2].props);korea.props.onFocus();h.render();assert.equal(h.motion.visible,false,'focus pauses motion');assert.equal(JSON.stringify(h.byClass('globe-pin').find(n=>n.props['data-country']==='KR').props.children[2].props),before,'focus alone does not move the label');
  h.resize(320);assert(h.byClass('globe-pin').some(n=>n.props['data-country']==='KR'),'focused country survives responsive layout');
  h.svg().props.onBlur({currentTarget:h.surface,relatedTarget:'outside'});h.render();assert.equal(h.motion.visible,true);
  const svg=h.svg();svg.props.onPointerDown(h.pointer(100));svg.props.onPointerMove(h.pointer(150));assert.equal(h.dragging,true);assert.equal(h.rotation,-104.5);svg.props.onPointerUp(h.pointer(150));svg.props.onLostPointerCapture();assert.equal(h.dragging,false);assert.deepEqual(h.click(korea),{prevented:true,stopped:true},'drag-release cannot follow a link');
  assert.equal(h.click(korea,0).prevented,false,'keyboard Enter remains usable after a drag');assert.equal(global.location.pathname,'/kr');
  svg.props.onPointerDown(h.pointer(100));svg.props.onPointerMove(h.pointer(102,130));svg.props.onPointerUp(h.pointer(102,130));assert.equal(h.click(korea).prevented,true,'vertical scrolling cannot accidentally navigate');
  svg.props.onPointerDown(h.pointer(100));svg.props.onPointerCancel();assert.equal(h.click(korea).prevented,true,'cancelled touch cannot navigate');
  svg.props.onPointerDown(h.pointer(100));svg.props.onPointerUp(h.pointer(101));assert.equal(h.click(korea).prevented,false,'a new deliberate tap works after cancellation');
  svg.props.onPointerDown(h.pointer(100,100,{button:2}));assert.equal(h.dragging,false,'secondary mouse button cannot rotate');
  for(const code of countryCodes){h.select(code);const label=h.byClass('globe-pin').find(n=>n.props['data-country']===code);assert(label,`${lang} ${code}: chosen country has a visible label`);assert.equal(label.props['data-selected'],true);assert.equal(label.props.href,'/'+countries[code].slug+'?lang='+lang);}
  h.select('AE');const uae=h.byClass('globe-pin').find(n=>n.props['data-country']==='AE');assert.equal(uae.props['aria-label'],lang==='ko'?'아랍에미리트':'United Arab Emirates');h.rotate(180);assert(!h.byClass('globe-pin').some(n=>n.props['data-country']==='AE'),'backside selected country is not shown');
  h.close();assert.equal(h.motion.ready,false,'closing stops motion readiness');
 }
 const css=fs.readFileSync(path.join(root,'app/warm-brand.css'),'utf8');assert(css.includes('.globe-pin:focus-visible .globe-focus-ring'));assert(css.includes('vector-effect:non-scaling-stroke'));
 console.log('PASS: actual KO/EN globe handlers, 30 country links, selected/backside labels, lazy load, focus pause, responsive focused target, drag/scroll/cancel suppression and deliberate tap/keyboard recovery.');
})().catch(error=>{console.error(error);process.exitCode=1;});
