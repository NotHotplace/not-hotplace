const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function compile(file,imports){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(imports,m,m.exports);return m.exports;}
function nodes(n,out=[]){if(Array.isArray(n))n.forEach(v=>nodes(v,out));else if(n&&typeof n==='object'){out.push(n);nodes(n.props?.children,out);}return out;}
function text(n){return Array.isArray(n)?n.map(text).join(''):n&&typeof n==='object'?text(n.props?.children):typeof n==='string'?n:'';}
const dictionary=JSON.parse(fs.readFileSync(path.join(root,'lib/en.json'),'utf8'));
function translate(n,lang){if(typeof n==='string')return lang==='en'?(dictionary[n]||n):n;if(Array.isArray(n))return n.map(v=>translate(v,lang));if(n&&typeof n==='object'&&n.props)return {...n,props:{...n.props,children:translate(n.props.children,lang)}};return n;}
function harness(lang,standalone=false,ios=false){let si=0,ei=0,tree,dirty=false;const states=[],effects=[],pending=[],events=new EventTarget(),media=new EventTarget();media.matches=standalone;
 global.window={addEventListener:(...a)=>events.addEventListener(...a),removeEventListener:(...a)=>events.removeEventListener(...a)};global.matchMedia=()=>media;Object.defineProperty(global,'navigator',{value:{standalone:ios},configurable:true});
 const react={useState(initial){const i=si++;if(!(i in states))states[i]=initial;return[states[i],value=>{states[i]=value;dirty=true;}];},useEffect(fn,deps){const i=ei++;if(!effects[i])pending.push(()=>effects[i]={cleanup:fn()});}};
 const Guide=compile('app/install/install-guide.tsx',n=>n==='react'?react:n==='react/jsx-runtime'?require(n):{useLocale:()=>({lang,ui:n=>translate(n,lang),text:(en,ko)=>lang==='en'?en:ko})}).default;
 function render(){let count=0;do{assert(++count<8);si=ei=0;dirty=false;tree=Guide();while(pending.length)pending.shift()();}while(dirty);return tree;}
 render();return {render,nodes:()=>nodes(tree),text:()=>text(tree),events,media,close(){effects.forEach(e=>e.cleanup?.());}};
}
(async()=>{
 for(const lang of ['ko','en']){
  const h=harness(lang);const fallback=()=>h.nodes().find(n=>n.type==='a'&&n.props.href==='#install-steps');
  assert(fallback());assert.equal(text(fallback()),lang==='ko'?'설치 방법 보기':'How to install');assert(h.text().includes('Android'));assert(h.text().includes('iPhone'));
  assert(h.nodes().some(n=>n.props?.id==='install-steps'));assert(!h.nodes().some(n=>n.type==='button'));
  for(const outcome of ['dismissed','accepted','error']){let calls=0;const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{calls++;if(outcome==='error')throw Error('unavailable');};event.userChoice=Promise.resolve({outcome});h.events.dispatchEvent(event);h.render();assert(event.defaultPrevented);const button=h.nodes().find(n=>n.type==='button');assert(button);await button.props.onClick();h.render();assert.equal(calls,1);assert(fallback(),'guidance remains actionable after the one-use prompt');}
  h.events.dispatchEvent(new Event('appinstalled'));h.render();assert(h.nodes().some(n=>n.type==='a'&&n.props.href==='/?lang='+lang));assert(!h.nodes().some(n=>n.type==='button'));h.close();
  for(const [standalone,ios]of [[true,false],[false,true]]){const installed=harness(lang,standalone,ios);assert(installed.nodes().some(n=>n.type==='a'&&n.props.href==='/?lang='+lang));assert(!installed.nodes().some(n=>n.type==='button'));installed.close();}
 }
 const globe=fs.readFileSync(path.join(root,'app/globe.tsx'),'utf8'),explorer=fs.readFileSync(path.join(root,'app/explorer.tsx'),'utf8'),css=fs.readFileSync(path.join(root,'app/warm-brand.css'),'utf8');
 assert(globe.includes('className="world-install-link" href={\'/install?lang=\'+lang}'));assert((globe.match(/\/install\?lang=/g)||[]).length>=2,'home has introduction and footer entries');
 assert(explorer.includes('className="quiet-mobile-install-link" href={\'/install?lang=\'+lang}'));assert(css.includes('.quiet-mobile-install-link { display:inline-flex;'));assert(css.includes('min-height:44px'));assert(css.includes('.world-footer { flex-wrap:wrap; }'));
 console.log('PASS: localized persistent home/mobile install entry points; actionable no-prompt guidance; Android/iPhone instructions, prompt accepted/dismissed/error and standalone/appinstalled states without OS installation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
