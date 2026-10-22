import { createApp } from "vue";
import App from "./App.vue";
import "./assets/styles.css";

// 清除旧版页面缓存；保持同一地址和 localStorage，继承任务与作品。
async function retireLegacyCache() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) =>
        [
          registration.active,
          registration.waiting,
          registration.installing,
        ].some(
          (worker) =>
            worker?.scriptURL ===
            new URL(`${import.meta.env.BASE_URL}service-worker.js`, location.origin).href,
        ),
      )
      .map((registration) => registration.unregister()),
  );
  if ("caches" in globalThis) {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("zaowu-xingqiu-shell-"))
        .map((key) => caches.delete(key)),
    );
  }
}

retireLegacyCache()
  .catch(() => {})
  .then(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .catch(() => {});
    }
  });
createApp(App).mount("#app");
