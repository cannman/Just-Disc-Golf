// JDG offline support: keeps the app working on the course with no signal.
const CACHE="jdg-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const url=new URL(r.url);
  if(url.origin===location.origin&&(r.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith(".html"))){
    // App page: try the network first so updates show up, fall back to the saved copy offline
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(ca=>ca.put("./index.html",c));return res}).catch(()=>caches.match("./index.html")));return;
  }
  // Everything else (icons, fonts): saved copy first, refreshed in the background
  e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const c=res.clone();caches.open(CACHE).then(ca=>ca.put(r,c))}return res}).catch(()=>hit);return hit||net}));
});
