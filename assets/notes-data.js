/* ==========================================================================
   资料数据（唯一需要维护的地方）
   --------------------------------------------------------------------------
   新增一份资料：在下面的数组里加一条对象即可，首页会自动生成卡片、标签筛选和搜索。
   字段说明：
     id      唯一标识，短横线小写，用于搜索锚点，不要重复
     title   卡片标题
     kicker  卡片上方的分类小字（可选，留空则不显示）
     desc    一句话摘要
     href    相对路径，例如 "notes/xxx.html"
     tags    标签数组，首页的筛选按钮由所有标签自动汇总生成
     added   加入时间 YYYY-MM-DD，列表按它倒序排列
     minutes 篇幅提示，例如 "约 10 分钟"、"9 篇 · 约 45 分钟"
   ========================================================================== */
window.NOTES = [
  {
    id: 'mysql',
    title: 'MySQL 数据库操作笔记（九篇合集）',
    kicker: '数据库 · 笔记合集',
    desc: 'DDL、DML、DQL、DCL 四篇打底，再补进阶用法、函数、事务与多表操作，按「先会用 → 再懂规矩 → 最后会避坑」的顺序排好。',
    href: 'notes/mysql-notes.html',
    tags: ['数据库', 'MySQL', 'SQL', '面试'],
    added: '2026-11-28',
    minutes: '9 篇 · 约 45 分钟'
  },
  {
    id: 'http',
    title: 'HTTP 协议笔记',
    kicker: '网络协议 · 学习笔记',
    desc: '从「一问一答」讲清请求与响应的三块结构、请求方法与状态码的语义，并把每条机制对应回 FastAPI 的写法，附五个易混点辨析。',
    href: 'notes/http-protocol-notes.html',
    tags: ['网络', '应用层', 'HTTP', 'FastAPI', '面试'],
    added: '2026-11-21',
    minutes: '约 10 分钟'
  },
  {
    id: 'tcp-flow',
    title: 'TCP 开发流程图',
    kicker: '网络协议 · 图解',
    desc: '服务端与客户端两条泳道，把 socket/bind/listen/accept 与 connect/close 对应到内核状态迁移，并标出 ①–⑤ 五处最容易翻车的坑。',
    href: 'notes/tcp-flow-chart.html',
    tags: ['网络', '传输层', 'TCP', '图解'],
    added: '2026-11-06',
    minutes: '1 张流程图'
  },
  {
    id: 'tcp',
    title: 'TCP 协议学习笔记',
    kicker: '网络协议 · 学习笔记',
    desc: '三次握手、四次挥手、可靠传输、流量控制、拥塞控制、报文段结构、UDP 对比与自测题，含 18 章目录与校正记录。',
    href: 'notes/tcp-protocol-notes.html',
    tags: ['网络', '传输层', '面试', '自测'],
    added: '2026-11-06',
    minutes: '约 23 分钟'
  }
];
