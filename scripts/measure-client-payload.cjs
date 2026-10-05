// Run after the production build; gzip counts use level 9 separately per file.
// Component graphs include static imports; they are not browser network timings.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),client=path.join(root,'dist/client'),files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(file.endsWith('.js')){const data=fs.readFileSync(file);files.push({file:path.relative(root,file),raw:data.length,gzip:zlib.gzipSync(data,{level:9}).length});}}}
walk(client);files.sort((a,b)=>b.raw-a.raw);
const sum=rows=>rows.reduce((total,row)=>({files:total.files+1,raw:total.raw+row.raw,gzip:total.gzip+row.gzip}),{files:0,raw:0,gzip:0});
const manifest=JSON.parse(fs.readFileSync(path.join(client,'.vite/manifest.json'),'utf8'));
const entries=['app/globe.tsx','app/explorer.tsx','app/places/place-interactions.tsx','app/journal/journal.tsx'];
const componentGraphs=Object.fromEntries(entries.map(entry=>{const keys=new Set();function add(key){if(keys.has(key)||!manifest[key])return;keys.add(key);for(const dependency of manifest[key].imports||[])add(dependency);}add(entry);const names=[...keys].map(key=>'dist/client/'+manifest[key].file);const rows=files.filter(file=>names.includes(file.file));return [entry,{...sum(rows),chunks:rows.map(file=>file.file)}];}));
console.log(JSON.stringify({measurement:'all dist/client .js, gzip level 9 per file; componentGraphs = entry + static import closure',totals:sum(files),chunks:sum(files.filter(file=>file.file.includes('/_next/static/'))),componentGraphs,files},null,2));
