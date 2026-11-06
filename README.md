# 手机复习阅读库

把项目里的学习资料整理成手机优先的静态阅读站：点开即读、深色模式、长文回顶、宽表格与代码块可横向滚动、离线可单文件打开。

**站点形态：纯静态、无构建步骤、资源全部本地化（不依赖外网 CDN），相对路径优先，可部署在 GitHub Pages 的 `/repo-name/` 子路径下。**

## 目录结构

```
d:\手机看\
├─ index.html                    资料索引（卡片列表 + 标签筛选）
├─ notes\
│  └─ tcp-protocol-notes.html    TCP 协议学习笔记（单文件、离线可读）
└─ README.md                     本文件
```

全站页面均已加 `<meta name="robots" content="noindex, nofollow">`，尽量不被搜索引擎收录。注意：这**不能阻止**任何拿到链接的人访问，公网托管的内容本质上是公开的。

## 怎么在手机上看

### 方式一：公网访问（推荐）

部署成功后访问：

> 部署地址：见下方「发布到公网」一节的最终输出（或直接问维护者要链接）。

任何网络环境都能打开，不需要和电脑在同一 Wi-Fi。

### 方式二：家里同一 Wi-Fi（备用）

在电脑上进入 `d:\手机看`，启动静态服务（Python 或 Node 任选其一）：

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

在「无线局域网适配器 WLAN」下找到 `IPv4 地址`，例如 `192.168.1.23`。手机连**同一个 Wi-Fi**，浏览器访问：

```
http://192.168.1.23:8000
```

首次启动时 Windows 防火墙可能弹窗，选择「允许访问」（专用网络即可）。

**限制：只在家里同一 Wi-Fi 可用。** 出门、切到流量、或路由器开了 AP 隔离，都打不开；端口 8000 被占用时换一个（如 8080）并同步改网址。

### 方式三：完全离线

每个文章页都是自包含的单文件 HTML。把 `index.html` 和整个 `notes\` 文件夹拷到手机（或用文件传输工具发过去），用浏览器打开 `index.html` 即可，正文不依赖外网。注意保持 `index.html` 与 `notes\` 的相对位置不变，否则卡片链接会失效。

## 新增一篇资料

1. **放文件**：把文章放进 `notes\`，建议命名为英文短横线格式（如 `notes\http-cache-notes.html`）。页面需自包含：CSS/JS 内联，不引用外网 CDN；图片尽量内嵌或放进本地目录并用相对路径。
2. **加卡片**：打开 `index.html`，复制 `id="list"` 里的任意一张 `<a class="card">`，改这几处：
   - `href="notes/你的文件名.html"`
   - `data-tags="标签A,标签B"`（筛选按钮会根据所有卡片自动生成，不用手改筛选区）
   - `data-added="YYYY-MM-DD"`（列表按它倒序排列）
   - 标题 `<h2>`、摘要 `<p class="card-desc">`
   - 卡片底部 `card-foot` 里的标签 `<span class="tag">`、加入时间、阅读时长
3. **本地预览**：`python -m http.server 8000`，浏览器打开 `http://localhost:8000`，点卡片确认正文与「返回目录」正常。
4. **重新发布**：见下一节。

## 发布到公网

### 方案 A：GitHub Pages（子路径兼容，推荐）

首次发布（在 `d:\手机看` 下）：

```powershell
git init
git add index.html notes README.md
git commit -m "Add mobile reading library"
gh auth login          # 需要你本人完成浏览器授权
gh repo create reading-library --public --source=. --push
gh api -X POST repos/{owner}/reading-library/pages -f "source[branch]=main" -f "source[path]=/"
```

然后访问 `https://<你的GitHub用户名>.github.io/reading-library/`。站点使用相对路径，部署在 `/reading-library/` 子路径下可正常工作。

以后更新：

```powershell
git add -A
git commit -m "Add notes: 新资料标题"
git push
```

GitHub Pages 会自动重建，通常一两分钟后生效。

### 方案 B：Vercel

首次发布：

```powershell
npx --yes vercel login    # 需要你本人完成邮箱/浏览器授权
npx --yes vercel --prod
```

按提示确认项目名与目录（直接回车使用当前目录即可），命令结束会输出公网地址。

以后更新：

```powershell
npx --yes vercel --prod
```

### 需要用户动手的情况

- `gh auth login`：需要浏览器打开 GitHub 授权页并输入一次性设备码；或提供已授权的 `GH_TOKEN`。
- `vercel login`：需要按提示在浏览器/邮箱确认；或提供 `VERCEL_TOKEN`。
- 创建仓库、开启 Pages 属于公开发布动作，需本人确认。

## 说明与注意

- **公网 = 公开**：托管在 GitHub Pages / Vercel 的站点，任何拿到链接的人都能访问。`noindex` 只是降低被搜索引擎收录的概率，不等于访问控制。请不要把密码、密钥、公司内部资料放进来。
- 页面为纯静态，无后端、无数据库、无构建产物；新增资料不需要安装依赖。
- 深色模式偏好保存在浏览器 `localStorage`，首次访问跟随系统设置。
