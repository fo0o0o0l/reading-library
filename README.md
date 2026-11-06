# 手机复习阅读库

把项目里的学习资料整理成手机优先的静态阅读站：点开即读、深色模式、长文回顶、宽表格与代码块可横向滚动。**核心使用场景是电脑不开机、手机用移动流量也能直接打开公网站点。**

**站点形态：纯静态、无构建步骤、资源全部本地化（不依赖外网 CDN）、无大图/外链字体/前端框架；正文为纯文本 HTML，手机流量下加载轻快。相对路径优先，可部署在 GitHub Pages 的 `/repo-name/` 子路径下。**

## 目录结构

```
d:\手机看\
├─ index.html                    资料索引（卡片列表 + 标签筛选）
├─ notes\
│  └─ tcp-protocol-notes.html    TCP 协议学习笔记（自包含静态页）
└─ README.md                     本文件
```

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

1. **放文件**：把文章放进 `notes\`，建议命名为英文短横线格式（如 `notes\http-cache-notes.html`）。页面需自包含：CSS/JS 内联，不引用外网 CDN；尽量不要放大图，必要图片先压缩并放进本地目录、用相对路径引用。
2. **加卡片**：打开 `index.html`，复制 `id="list"` 里的任意一张 `<a class="card">`，改这几处：
   - `href="notes/你的文件名.html"`
   - `data-tags="标签A,标签B"`（筛选按钮会根据所有卡片自动生成，不用手改筛选区）
   - `data-added="YYYY-MM-DD"`（列表按它倒序排列）
   - 标题 `<h2>`、摘要 `<p class="card-desc">`
   - 卡片底部 `card-foot` 里的标签 `<span class="tag">`、加入时间、阅读时长
3. **本地预览**：`python -m http.server 8000`，浏览器打开 `http://localhost:8000`，点卡片确认正文与「返回目录」正常。
4. **重新发布**：见下一节。

## 发布到公网

本站已通过 **GitHub Pages** 发布（仓库 `fo0o0o0l/reading-library`，`main` 分支根目录，已生成 `https://fo0o0o0l.github.io/reading-library/`）。站点使用相对路径，部署在 `/reading-library/` 子路径下可正常工作；如改仓库名，子路径会随之变化，无需改代码。

### 以后新增资料后怎么重新发布

在 `d:\手机看` 下执行：

```powershell
git add index.html notes README.md
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
- **流量友好**：全站无大图、无外链字体、无前端框架。首页约 12 KB，TCP 笔记约 110 KB（未压缩，GitHub Pages 会以 gzip 传输），移动流量下可快速打开。
- 深色模式偏好保存在浏览器 `localStorage`，首次访问跟随系统设置。
