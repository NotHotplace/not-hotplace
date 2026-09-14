const CACHE='nothotplace-offline-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')));});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('nothotplace-offline-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  // Never cache account pages, OAuth responses, API data or user submissions.
  if(event.request.method!=='GET'||event.request.mode!=='navigate'||url.origin!==self.location.origin||url.pathname.startsWith('/auth/')||url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).catch(async()=>await caches.match('/offline.html')||Response.error()));
});
