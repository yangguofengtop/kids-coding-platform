# 造物星球

基于 Vue 3、Composition API 和 Vite 的少儿编程前端项目。提供入门、初级、中级三个学习模式，包含 12 个任务和独立的自由创作工作台。

## 运行

要求 Node.js 20.19+ 或 22.12+，推荐 Node.js 24。

```powershell
cd D:\git\kids-coding-platform
npm install
npm run dev
```

打开 `http://localhost:5174/srbc/`。保持同一域名、协议和端口时，可以直接继承原项目在同一浏览器中的任务进度和作品。

```powershell
npm test          # 任务行为和 Vue 组件交互测试
npm run build     # 生产构建，输出 dist/ 并生成离线缓存
npm run preview   # 预览生产构建，默认 http://localhost:4173/srbc/
```

需要指定开发端口时：`npm run dev -- --port 5173`。浏览器本地数据按域名和端口隔离，切换地址不会自动转移进度。

## 部署到服务器

访问前缀已配置为 `/srbc/`，静态资源、应用清单和离线缓存均使用此子路径。

1. 执行 `npm run build`。
2. 将 `dist/` 内的全部文件上传到网站根目录下的 `srbc/` 文件夹，确保文件位置为 `srbc/index.html`，不要再套一层 `dist/`。
3. 访问 `https://你的域名/srbc/`。

如果服务器使用 Nginx，可在现有 `server` 中加入（假设网站根目录为 `/var/www/html`）：

```nginx
root /var/www/html;

location = /srbc {
    return 301 /srbc/;
}

location /srbc/ {
    try_files $uri $uri/ =404;
}

location = /srbc/sw.js {
    add_header Cache-Control "no-cache";
}

location = /srbc/index.html {
    add_header Cache-Control "no-cache";
}
```

当前页面在应用内部切换，没有需要服务器回退的前端路由。服务器只需提供静态文件，不需要运行 Node.js。离线功能需要 HTTPS（本机 localhost 除外）；换到服务器域名后，本机浏览器进度不会自动同步过去。

## 源码结构

```text
src/
  main.js                    Vue 应用入口及缓存升级
  App.vue                    页面装配和状态注入
  components/                导航、积木库、程序编辑器和预览场景
  views/                     地图、任务、工作台、作品、创作和家长报告
  composables/createStudio.js 任务执行、进度、作品和持久化
  composables/useStudio.js   组件共享状态
  data/catalog.js            模式、任务和积木定义
  scenes/renderScene.js      保留现有 CSS 场景画稿
  assets/styles.css          页面样式和动画
public/                      清单、图标及旧缓存退出脚本
scripts/build-offline.mjs     生产环境离线缓存构建
tests/                       任务和组件回归测试
legacy/                      迁移前的 JavaScript 和静态服务器留档
```

页面使用 Vue 单文件组件、响应式状态和组件事件。场景画稿通过 `SceneArtwork` 转换为 Vue 节点，角色节点在运行时保持稳定，使 CSS 位移、转向和射击动画连续更新。

## 已实现

- 入门、初级、中级切换及不同任务内容
- 任务地图和主题路线
- 任务卡和任务目标
- 积木点击添加与拖拽添加
- 积木/代码视图切换
- 运行、重置、单步提示和分级反馈
- 自由创作、作品重命名、本地保存和继续编辑
- 完成任务后直接进入下一关，家长报告读取本地真实记录
- 响应式布局和生产版本的基础 PWA 离线缓存

当前数据只保存在浏览器本地，尚未接入账号、后端和云同步。

迁移继续使用 `zaowu-xingqiu-mvp-v1` 数据键，不清除浏览器进度。开发环境退出旧版 Service Worker，防止旧缓存影响 Vite 热更新；生产版本首次联网加载后可离线打开。
