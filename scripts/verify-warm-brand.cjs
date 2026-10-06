const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const css=read('app/globals.css'),warm=read('app/warm-brand.css'),layout=read('app/layout.tsx'),home=read('app/home-finder.tsx'),globe=read('app/globe.tsx');
function luminance(hex){const rgb=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for(const [fg,bg,label] of [['#302A23','#F7F1E5','body'],['#6B665B','#F7F1E5','secondary text'],['#5C6742','#ECEEDF','olive on sage'],['#FFFFFF','#B84A24','primary action'],['#FFFFFF','#5C6742','selected language']])assert(contrast(fg,bg)>=4.5,`${label} must meet normal-text WCAG AA`);
assert(/--background:\s*#f7f1e5/i.test(css),'cream background token');
assert(/--foreground:\s*#302a23/i.test(css),'ink foreground token');
assert(!layout.includes('className="dark"'));assert(layout.includes('"./warm-brand.css"'));
assert(layout.includes("themeColor:'#F7F1E5'"));
const manifest=JSON.parse(read('public/manifest.webmanifest'));assert.equal(manifest.theme_color,'#F7F1E5');assert.equal(manifest.background_color,'#F7F1E5');
assert(read('public/offline.html').includes('#F7F1E5'));assert(read('public/sw.js').includes('nothotplace-offline-v2'));
assert(read('app/explorer.tsx').includes('theme="light"'));
assert(!/\.country-cities button span\{[^}]*opacity:\.7/.test(read('app/upgrade.css')),'small city counts keep full contrast');
assert(!/\.quiet-intro p>span\{[^}]*opacity:\.8/.test(read('app/atlas.css')),'small brand captions keep full contrast');
assert(!home.includes('YOUR NEXT LITTLE PAUSE.'),'avoid redundant decorative copy');
assert(home.includes('cardIntroduction(place,lang)'),'one concise, sourced introduction per card');
assert(home.includes('sharePlacePath(place,lang)'));assert(home.includes('home-card-evidence'));assert(home.includes('<PlaceReasons place={place} language={lang} compact/>'));
assert(home.includes('controller.abort()'),'stale finder requests remain cancellable');assert(home.includes("setRows([])"),'changing filters clears stale candidates');
assert(warm.includes('grid-template-columns:78px minmax(0,1fr)'),'mobile cards keep text shrinkable');
assert(warm.includes('width:78px; min-width:0; height:88px;'),'compact images reset older minimum-width rules');
assert(warm.includes('strong span { color:inherit; margin:0;'),'CTA arrows inherit white text without older badge spacing');
assert(warm.includes('border-radius:6px; overflow:visible;'),'borderless cards cannot clip disclosure focus outlines');
assert(warm.includes('.home-finder-grid .place-reasons details p { display:block; -webkit-line-clamp:unset; overflow:visible;'),'expanded source text stays unclamped');
assert(warm.includes('@media(prefers-reduced-motion:reduce)'));assert(globe.includes('useGlobeMotion(globeOpen && !!geo && !!data, visible)'),'closed globe cannot animate');
assert(globe.includes('globe-mobile-motion'),'mobile globe retains pause control');
assert(/globe-mobile-motion.*?<button[^>]*aria-label=/.test(globe),'mobile pause control has an accessible name');
assert(warm.includes('.globe-mobile-motion .world-motion-toggle span { display:inline; }'),'mobile pause control retains visible text');
assert(globe.includes('width="480" height="600"'),'brand art has intrinsic dimensions');assert(fs.statSync(path.join(root,'public/assets/brand-tea-guide.webp')).size<40000,'brand art stays below 40 KB');
for(const f of ['app/globe.tsx','app/country-map.tsx','app/us-map.tsx','app/journal/story-card.tsx'])assert(!/#d1ff73/i.test(read(f)),`${f} cannot retain neon inline colors`);
// Exercise the real motion hook without a browser: reduced preference, pause,
// closed/hidden readiness, and cancellation must not leave animation scheduled.
const ts=require('typescript'),states=[],refs=[],effects=[],pending=[],frames=new Map(),listeners=new Map();let si=0,ri=0,ei=0,nextFrame=0;
const react={useState(v){const i=si++;if(!(i in states))states[i]=v;return [states[i],x=>states[i]=typeof x==='function'?x(states[i]):x];},useRef(v){const i=ri++;return refs[i]||(refs[i]={current:v});},useCallback(fn){return fn;},useEffect(fn,deps){const i=ei++,old=effects[i];if(!old||deps.some((v,n)=>v!==old.deps[n]))pending.push(()=>{old?.cleanup?.();effects[i]={deps,cleanup:fn()};});}};
const media={matches:true,addEventListener:(_,fn)=>listeners.set('media',fn),removeEventListener:()=>listeners.delete('media')};
global.matchMedia=()=>media;global.document={hidden:false,addEventListener:(event,fn)=>listeners.set(event,fn),removeEventListener:event=>listeners.delete(event)};
global.requestAnimationFrame=fn=>{const id=++nextFrame;frames.set(id,fn);return id;};global.cancelAnimationFrame=id=>frames.delete(id);
const moduleMock={exports:{}};new Function('require','module','exports',ts.transpileModule(read('hooks/use-globe-motion.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(name=>name==='react'?react:require(name),moduleMock,moduleMock.exports);
function motion(ready=true,visible=true){si=ri=ei=0;const result=moduleMock.exports.useGlobeMotion(ready,visible);while(pending.length)pending.shift()();return result;}
let m=motion();assert.equal(m.reduced,true);assert.equal(frames.size,0);m.turnTo(-35);m=motion();assert.equal(m.rotation,-35,'reduced motion turns immediately');
media.matches=false;listeners.get('media')();m=motion();assert.equal(m.enabled,true);assert.equal(frames.size,1);m.toggle();m=motion();assert.equal(frames.size,0,'pause cancels scheduled frame');m.toggle();m=motion();assert.equal(frames.size,1);motion(false);assert.equal(frames.size,0,'closed/unready globe cancels frame');motion(true,false);assert.equal(frames.size,0,'off-screen globe stays stopped');
media.matches=true;listeners.get('media')();m=motion();assert.equal(m.enabled,false);assert.equal(frames.size,0,'OS reduced-motion preference stops animation');effects.forEach(e=>e.cleanup?.());
console.log('PASS: warm brand contrast, light UI/install surfaces, bounded art, compact mobile rules, complete source disclosure, cancellable finder and reduced-motion/closed-globe controls.');
