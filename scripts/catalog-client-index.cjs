// Regenerate after editing catalog sources: node scripts/catalog-client-index.cjs
// CI checks the committed client-safe IDs and country summaries with --check.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),cache={};
function load(file){file=path.resolve(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));if(cache[file])return cache[file].exports;const mod={exports:{}};cache[file]=mod;const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('require','module','exports',js)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts')):require(name),mod,mod.exports);return mod.exports;}
const {catalog}=load(path.join(root,'lib/catalog.ts')),{countryCodes}=load(path.join(root,'lib/countries.ts')),{trips}=load(path.join(root,'lib/trips.ts'));
const output={
 'catalog-ids.json':catalog.map(p=>p.id),
 'journal-places.json':catalog.map(({id,country,name,area,image,imageCredit,imageLicense,lat,lon})=>({id,country,name,area,image,imageCredit,imageLicense,lat,lon})),
 'catalog-directory.json':Object.fromEntries(countryCodes.map(country=>{const places=catalog.filter(p=>(p.country||'KR')===country);return [country,{count:places.length,cities:[...new Set(places.map(p=>p.city))].slice(0,3)}];})),
 'trip-place-names.json':Object.fromEntries(trips.filter(t=>t.placeId).map(t=>[t.placeId,catalog.find(p=>p.id===t.placeId)?.name])),
};
for(const [name,data] of Object.entries(output)){const file=path.join(root,'lib',name),content=JSON.stringify(data)+'\n';if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),content,name+' is stale; run node scripts/catalog-client-index.cjs');else fs.writeFileSync(file,content);}
console.log((process.argv.includes('--check')?'Verified':'Generated')+' compact client catalog metadata for '+catalog.length+' places.');
