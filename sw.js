// Umbral: caché sencilla. La página se sirve de la caché y se actualiza en segundo plano.
const V='umbral-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  if(/googleapis\.com|firebaseio|gstatic\.com\/firebase/.test(u.host))return; // datos y acceso: siempre en red
  const own=u.origin===location.origin,lib=u.host==='cdnjs.cloudflare.com';
  if(!own&&!lib)return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(x=>{if(x&&x.ok)c.put(r,x.clone());return x}).catch(()=>hit);
    return hit||net;
  }));
});

// Avisos en el móvil: muestra la notificación que manda el proceso diario de GitHub y abre Umbral al pulsarla.
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'Umbral',{body:d.body||'',icon:'icon-192.png',tag:d.tag||'umbral',renotify:true,lang:'es',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.startsWith(self.registration.scope)&&'focus' in c)return c.focus()}return clients.openWindow(u)}))});
