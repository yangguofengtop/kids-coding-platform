import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(import.meta.dirname, "../dist");
async function collect(directory = "") {
  const entries = await readdir(resolve(output, directory), {
    withFileTypes: true,
  });
  const groups = await Promise.all(
    entries.map((entry) => {
      const path = directory ? `${directory}/${entry.name}` : entry.name;
      return entry.isDirectory() ? collect(path) : [path];
    }),
  );
  return groups.flat();
}
const assets = (await collect())
  .filter((path) => !["sw.js", "service-worker.js"].includes(path))
  .sort();
const hash = createHash("sha256");
for (const path of assets)
  hash.update(path).update(await readFile(resolve(output, path)));
const cacheName = `zaowu-vue-${hash.digest("hex").slice(0, 12)}`;

// 构建时枚举带哈希的资源文件，避免缓存旧版 app.js 或 Vite 开发模块。
const worker = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const ASSETS = ${JSON.stringify(assets.map((path) => `./${path}`))};
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) =>
    (key.startsWith('zaowu-vue-') || key.startsWith('zaowu-xingqiu-shell-')) && key !== CACHE_NAME
  ).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(new URL('./index.html', self.location).href)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
`;
await writeFile(resolve(output, "sw.js"), worker, "utf8");
console.log(`离线缓存已生成：${assets.length} 个资源。`);
