const assert=require('node:assert/strict');
const {ownerEmail,freshTestValue,installOfflineFetch}=require('./test-fixtures.cjs');
const originalFetch=globalThis.fetch;
let nativeCalls=0;
// A sentinel proves the guard never delegates, without any real network access.
const nativeSentinel=async()=>{nativeCalls++;throw new Error('Native fetch must never run');};
globalThis.fetch=nativeSentinel;
const url='https://provider.example.test/confirm';
const expectation=()=>({url,method:'POST',response:{ok:true},inspect:async request=>{assert.equal(request.headers.get('Content-Type'),'application/json');assert.deepEqual(await request.json(),{amount:100});}});
const request=()=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:100})});
async function guardCase(run){const guard=installOfflineFetch();try{await run(guard);}finally{guard.restore();assert.equal(globalThis.fetch,nativeSentinel,'restore previous fetch after success or failure');}}
(async()=>{
 assert.equal(ownerEmail,'google-owner@example.test');
 const values=Array.from({length:20},freshTestValue);assert.equal(new Set(values).size,values.length,'each fixture is generated independently');assert(values.every(value=>/^[a-f0-9]{64}$/.test(value)),'disposable values meet setup token length without fixed credentials');
 await guardCase(async guard=>{await guard.withMock(expectation(),async()=>assert.deepEqual(await(await request()).json(),{ok:true}));guard.assertClean();});
 await guardCase(async guard=>{await assert.rejects(fetch('https://unexpected.example.test/'));assert.throws(()=>guard.assertClean(),/unexpected requests/,'caught app errors still fail the suite');});
 for(const invalid of [()=>fetch('https://other.example.test/confirm',{method:'POST'}),()=>fetch(url),()=>fetch(url,{method:'POST',body:JSON.stringify({amount:100})}),()=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:1})})]){
  await guardCase(async guard=>{await assert.rejects(guard.withMock(expectation(),invalid));assert.throws(()=>guard.assertClean(),/unexpected requests/);});
 }
 await guardCase(async guard=>{await guard.withMock({...expectation(),inspect:async()=>{throw new Error('Unexpected network request in offline test');}},async()=>{try{await request();}catch{}});assert.throws(()=>guard.assertClean(),/unexpected requests/,'caught inspector failure cannot impersonate an internal guard error');});
 await guardCase(async guard=>{await assert.rejects(guard.withMock(expectation(),async()=>{await request();await request();}));assert.throws(()=>guard.assertClean(),/unexpected requests/,'extra provider calls cannot pass as idempotent');});
 await guardCase(async guard=>{await assert.rejects(guard.withMock(expectation(),async()=>{}),/exactly one/,'unused mock is a test failure');guard.assertClean();});
 await guardCase(async guard=>{await assert.rejects(guard.withMock(expectation(),async()=>{throw new Error('test callback failure');}),/callback failure/);await assert.rejects(request());assert.throws(()=>guard.assertClean(),/unexpected requests/,'failed callback removes its provider allowance');});
 await guardCase(async guard=>{await guard.withMock(expectation(),request);await assert.rejects(request());assert.throws(()=>guard.assertClean(),/unexpected requests/,'completed mock is no longer allowed');});
 assert.equal(nativeCalls,0,'all expected and unexpected calls stayed in memory');
 console.log('PASS: reserved identity, fresh disposable values, deny-by-default fetch, exact method/URL/body/headers, one-call expectations, caught-error detection, scoped teardown and zero native fetch calls.');
})().finally(()=>{globalThis.fetch=originalFetch;}).catch(error=>{console.error(error);process.exitCode=1;});
