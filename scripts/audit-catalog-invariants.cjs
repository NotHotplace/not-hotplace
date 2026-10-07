const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');const root=path.resolve(__dirname,'..'),cache={};
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache[file])return cache[file].exports;const m={exports:{}};cache[file]=m;new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n)+(n.endsWith('.json')?'':'.ts')):require(n),m,m.exports);return m.exports;}
const {catalog}=load(path.join(root,'lib/catalog.ts')),{countryCodes}=load(path.join(root,'lib/countries.ts')),{candidateReasons}=load(path.join(root,'lib/place-presentation.ts')),{visitFacts}=load(path.join(root,'lib/visit-facts.ts')),{matchesCondition}=load(path.join(root,'lib/rest-conditions.ts'));// Source-check dates are recorded as Korea calendar days, independent of CI's timezone.
const catalogDay=instant=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(instant);
const today=catalogDay(new Date());let dates=0,urls=0,photos=0,operationalFlags=0;
function date(value,context){assert(/^\d{4}-\d{2}-\d{2}$/.test(value),context+' invalid date');assert.equal(new Date(value).toISOString().slice(0,10),value);assert(value<=today,context+' future date');dates++;}
assert.equal(catalogDay(new Date('2026-10-07T14:59:59Z')),'2026-10-07','before Korea midnight');
assert.equal(catalogDay(new Date('2026-10-07T15:00:00Z')),'2026-10-08','after Korea midnight');
const tomorrow=new Date(Date.parse(today+'T00:00:00Z')+86400000).toISOString().slice(0,10);
assert.throws(()=>date(tomorrow,'regression'),/future date/,'real future dates remain rejected');
function url(value,context){const u=new URL(value);assert.equal(u.protocol,'https:',context+' non-HTTPS source');urls++;}
assert.equal(catalog.length,1007);assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length);
for(const p of catalog){assert(countryCodes.includes(p.country));assert(['cafe','food','drive','walk','spa'].includes(p.category));assert(p.name&&p.address&&p.description);url(p.source,p.id);date(p.checked,p.id);if(p.lat!=null||p.lon!=null)assert(Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lon)&&Math.abs(p.lon)<=180,p.id+' coordinate pair');
 if(p.image?.startsWith('/')){assert(fs.existsSync(path.join(root,'public',p.image)),p.id+' missing image');photos++;}
 for(const d of p.visitDetails||[]){assert(d.textKo&&d.textEn&&d.labelEn&&d.labelKo,p.id+' empty detail');if(d.source)url(d.source,p.id);if(d.checked)date(d.checked,p.id);for(const s of d.additionalSources||[])url(s.url,p.id);if(!/menu/i.test(d.labelEn)&&/[가-힣]/.test(d.textEn))operationalFlags++;}
 for(const d of [...(p.conditions||[]),...(p.recommendationReasons||[])]){url(d.source,p.id);date(d.checked,p.id);}
 for(const r of candidateReasons(p))assert(!r.textKo.includes('안내 안내'),p.id+' duplicate fallback copy');
 for(const f of Object.values(p.visitFacts||{})){url(f.source,p.id);date(f.checked,p.id);}if(p.visitFacts?.price?.amount!=null)assert(Number.isFinite(p.visitFacts.price.amount)&&p.visitFacts.price.amount>=0,p.id+' invalid price');
}
const p=catalog.find(p=>p.id==='tour-2375858');assert.equal(visitFacts(p).parking.status,'nearby');assert(!matchesCondition(p,'parking'),'nearby paid parking does not satisfy venue-parking condition');assert(p.visitDetails.find(d=>d.labelEn==='Parking').additionalSources.length);
const mouse=catalog.find(p=>p.id==='tour-2946087').visitDetails.find(d=>d.labelEn==='Hours');assert(mouse.textEn.includes('conflict'));assert(mouse.additionalSources.length);
assert.equal(catalog.find(p=>p.id==='cj-soyeon').address,'충북 청주시 서원구 청남로 1865-6');
const reyes=catalog.find(p=>p.id==='us-point-reyes');assert.equal(reyes.image,'/places/us-point-reyes.jpeg');for(const field of ['imageSource','imageRemote','imageLicenseUrl'])url(reyes[field],'verified Point Reyes photo');assert.equal(reyes.imageCredit,'NPS Photo/A. Kopshever');assert(reyes.imageLicense.includes('Public domain'));assert(reyes.imageNote&&reyes.imageNoteKo);
const holland=catalog.find(p=>p.id==='world-gb-holland-park');assert(!holland.image&&!holland.imageRemote&&!holland.photos?.length,'unverified Holland Park photo remains hidden');
for(const [id,label] of [['tour-3082222','Closures'],['tour-3445436','Hours'],['tour-3456352','Closures'],['tour-2833269','Hours']])assert(/confirm|unclear|incomplete/i.test(catalog.find(p=>p.id===id).visitDetails.find(d=>d.labelEn===label).textEn),'ambiguous source is disclosed');
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'wrangler.json'),'utf8')).vars.PAYMENTS_LIVE_ENABLED,'false');
console.log(`PASS: ${catalog.length} catalog entries, ${dates} dated facts, ${urls} source URLs, ${photos} referenced local photos; ${operationalFlags} remaining operational Hangul flags (translation review, not venue re-verification).`);
