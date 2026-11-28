# 手机复习阅读库

把项目里的学习资料整理成手机优先的静态阅读站：点开即读、深色模式、长文回顶、宽表格与代码块可横向滚动。**核心使用场景是电脑不开机、手机用移动流量也能直接打开公网站点。**

**站点形态：纯静态、无构建步骤、资源全部本地化（不依赖外网 CDN）、无大图/外链字体/前端框架；正文为纯文本 HTML，手机流量下加载轻快。相对路径优先，可部署在 GitHub Pages 的 `/repo-name/` 子路径下。**

## 目录结构

```
d:\手机看\
├─ index.html                     首页壳：只有结构，卡片由 JS 渲染
├─ assets\
│  ├─ notes-data.js               资料数据（唯一需要维护的清单）
│  ├─ library.js                  首页逻辑：卡片渲染、标签筛选、关键词搜索、深色模式
│  ├─ library.css                 首页样式
│  ├─ note.css                    资料页统一样式（模板与后续新页面共用）
│  └─ note.js                     资料页统一脚本：目录高亮、进度条、回顶、复制、深色模式
├─ notes\
│  ├─ _template.html              资料页模板（新资料从这里复制）
│  ├─ tcp-protocol-notes.html     TCP 协议学习笔记
│  ├─ http-protocol-notes.html    HTTP 协议笔记
│  ├─ http-protocol-notes.md      HTTP 笔记的 Markdown 源稿（仅存档，未被站点引用）
│  └─ mysql-notes.html            MySQL 数据库操作笔记（九篇合集，自带封面与路由）
└─ README.md                      本文件
```

**可扩展性：**首页不再逐篇堆 HTML。所有卡片数据集中在 [assets/notes-data.js](assets/notes-data.js)，标签筛选按钮由所有标签自动汇总，搜索框对标题、摘要、标签做纯前端匹配。新增一份资料 = 放一个页面文件 + 加一条数据，改一处即可。

全站页面均已加 `<meta name="robots" content="noindex, nofollow">`，尽量不被搜索引擎收录。注意：这**不能阻止**任何拿到链接的人访问，公网托管的内容本质上是公开的。

## 怎么在手机上看

### 公网访问（主要方式）

已部署在 GitHub Pages，**电脑关机、手机用移动流量**都能直接打开：

> **https://fo0o0o0l.github.io/reading-library/**

仓库地址：`https://github.com/fo0o0o0l/reading-library`（公开仓库）。

### 本地预览（可选，仅用于发布前检查）

这不是交付方式，只是改完资料后在本机先看一眼效果。在电脑上进入 `d:\手机看`，启动静态服务（Python 或 Node 任选其一）：

```powershell
# Python
python -m http.server 8000 --bind 0.0.0.0

# 或者 Node
npx --yes http-server . -p 8000 -a 0.0.0.0
```

然后查电脑局域网 IP：

```powershell
ipconfig
```

在「无线局域网适配器 WLAN」下找到 `IPv4 地址`，例如 `192.168.1.23`。手机连**同一个 Wi-Fi**，浏览器访问 `http://192.168.1.23:8000`。

首次启动时 Windows 防火墙可能弹窗，选择「允许访问」（专用网络即可）。该地址**只在同一 Wi-Fi 下可用**，出门或切到流量就打不开，所以不要把它当作正式入口。

## 新增一篇资料

### 第一步：用模板生成页面

复制 `notes\_template.html`，改名为英文短横线格式（如 `notes\http-cache-notes.html`），然后用编辑器全局替换 `TODO` 处：

| 要改的地方 | 说明 |
| --- | --- |
| `data-note-key="note-id"` | 改成唯一值（如 `http-cache`），用来分别记住每页的深色模式偏好 |
| `<title>` / `<meta name="description">` | 页面标题与摘要 |
| `.topbar-title` / 侧栏 `.brand` | 顶栏与侧栏显示的短标题、角标文字 |
| `.side-meta` | 章数、小节数、阅读时长 |
| `#toc` | 目录：每个 `h2` 配一个 `.toc-item`，每个 `h3` 配一个 `.toc-sub`，`data-target` 必须与正文的 `id` 一一对应 |
| `.hero` | 标题、副标题、`.pills` 提示 |
| `<article>` | 正文 |

正文写法约定（样式已在 `assets/note.css` 里，不要在页面里另写 CSS）：

- 章节标题用 `<h2 id="s2">2. 标题</h2>`，小节用 `<h3 id="s2-1">2.1 标题</h3>`，编号与目录保持一致。
- 表格必须包一层 `<div class="table-wrap">`，窄屏才会横向滚动而不撑破页面。
- 代码 / ASCII 图用 `.codeblock` + `<pre class="cb-pre ascii"><code>…</code></pre>` 结构，自动带复制按钮和横向滚动。
- 提示块：普通用 `.callout`，勘误用 `.callout correction`；要点/记忆锚点用 `.aux brief` / `.aux remember`。
- 行内代码用 `<code class="ic">…</code>`。

### 第二步：在数据清单里登记

打开 `assets/notes-data.js`，在 `window.NOTES` 数组里加一条（只有这一处，不用改 `index.html`）：

```js
{
  id: 'http-cache',
  title: 'HTTP 缓存笔记',
  kicker: '网络协议 · 学习笔记',
  desc: '一句话摘要，会显示在卡片上，也会被搜索命中。',
  href: 'notes/http-cache-notes.html',
  tags: ['网络', 'HTTP', '缓存'],
  added: '2026-12-01',
  minutes: '约 12 分钟'
}
```

保存后首页会自动：按 `added` 倒序排卡片、汇总出新标签的筛选按钮、把新标题纳入搜索。列表条目很多时，靠搜索框和标签筛选仍然能快速定位。

### 第三步：本地看一眼，再发布

```powershell
python -m http.server 8000
```

浏览器打开 `http://localhost:8000`，确认：卡片出现、标签能筛到、搜索能搜到、正文目录跳转正常、「返回资料目录」能回首页。然后按下节发布。

### 现成页面需要改成统一风格时

`notes\mysql-notes.html` 这类自带整套设计的多篇合集，可以直接保留自己的样式；只有在想统一外观时，才需要改成模板结构（把内容搬进模板的 `<article>`，删掉页面内联 `<style>`，换成 `../assets/note.css` + `note.js`）。

## 发布到公网

本站已通过 **GitHub Pages** 发布（仓库 `fo0o0o0l/reading-library`，`main` 分支根目录，已生成 `https://fo0o0o0l.github.io/reading-library/`）。站点使用相对路径，部署在 `/reading-library/` 子路径下可正常工作；如改仓库名，子路径会随之变化，无需改代码。

### 以后新增资料后怎么重新发布

在 `d:\手机看` 下执行：

```powershell
git add -A
git commit -m "Add notes: 新资料标题"
git push
```

GitHub Pages 会自动重建，通常一两分钟后生效。

### 首次发布（已完成，供重装时参考）

```powershell
git init -b main
git add index.html notes README.md .nojekyll
git commit -m "Add mobile-first reading library"
git remote add origin https://github.com/fo0o0o0l/reading-library.git
git push -u origin main
```

然后在仓库 **Settings → Pages** 中选择 `Deploy from a branch`、`main`、`/ (root)`，或在已登录 `gh` 的环境中执行：

```powershell
gh api -X POST repos/{owner}/{repo}/pages -f "source[branch]=main" -f "source[path]=/"
```

### 备选：Vercel

```powershell
npx --yes vercel login
npx --yes vercel --prod
```

`vercel login` 需要本人完成浏览器/邮箱授权；授权后 `vercel --prod` 会输出公网地址。后续更新重新执行 `npx --yes vercel --prod` 即可。

### 需要用户动手的情况

- 当前机器未安装 `gh`，但 Git 凭据管理器已有 GitHub 账号，本次发布直接复用了该账号的授权。
- 如果以后授权失效：`git push` 会提示登录，按 Git Credential Manager 弹窗完成浏览器授权即可。
- 若改用 Vercel：`vercel login` 需要本人完成授权，或自行提供 `VERCEL_TOKEN`。


## 说明与注意

- **公网 = 公开**：托管在 GitHub Pages / Vercel 的站点，任何拿到链接的人都能访问。`noindex` 只是降低被搜索引擎收录的概率，不等于访问控制。请不要把密码、密钥、公司内部资料放进来。
- 页面为纯静态，无后端、无数据库、无构建产物；新增资料不需要安装依赖。
- **流量友好**：全站无大图、无外链字体、无前端框架。首页壳约 3 KB，加上数据与脚本共约 12 KB；TCP 笔记约 110 KB（未压缩，GitHub Pages 会以 gzip 传输），移动流量下可快速打开。
- **目录能力**：标签筛选 + 纯前端关键词搜索（标题、摘要、标签），无后端、无第三方服务；资料数量增长后仍然可用。
- 深色模式偏好保存在浏览器 `localStorage`，首次访问跟随系统设置。
