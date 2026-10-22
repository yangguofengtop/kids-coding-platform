// 兼容旧版安装：接管旧缓存后退出，由 Vue 生产版本的 sw.js 提供离线能力。
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('zaowu-xingqiu-shell-')).map((key) => caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
