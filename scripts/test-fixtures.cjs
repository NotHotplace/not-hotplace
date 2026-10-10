const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');

// Reserved identities and disposable values are test data, never deployment config.
const ownerEmail='google-owner@example.test';
const freshTestValue=()=>randomBytes(32).toString('hex');

// No fallback to real fetch. Unexpected requests also fail the suite when an
// application handler catches the mock's rejection and returns an error response.
function installOfflineFetch(){
 const original=globalThis.fetch;
 let active=null,unexpected=0;
 const blocked=()=>{unexpected++;throw new Error('Unexpected network request in offline test');};
 const offlineFetch=async(input,init)=>{
  if(!active)return blocked();
  try{
   const request=new Request(input,init);
   if(request.url!==active.url||request.method!==active.method||active.calls>=1)return blocked();
   active.calls++;
   await active.inspect(request);
   return Response.json(active.response);
  }catch(error){
   // Keep URLs, headers and transient fixture values out of failure output.
   unexpected++;
   throw new Error('Offline test request did not match its expectation');
  }
 };
 globalThis.fetch=offlineFetch;
 return {
  async withMock(expectation,run){
   assert.equal(active,null,'fetch mocks cannot overlap');
   const mock={...expectation,calls:0};active=mock;
   try{const result=await run();assert.equal(mock.calls,1,'expected exactly one mocked provider request');return result;}
   finally{active=null;}
  },
  assertClean(){assert.equal(globalThis.fetch,offlineFetch,'offline fetch guard must remain installed');assert.equal(unexpected,0,'no unexpected requests, including caught failures');},
  restore(){globalThis.fetch=original;},
 };
}
module.exports={ownerEmail,freshTestValue,installOfflineFetch};
