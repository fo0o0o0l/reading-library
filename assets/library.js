/* ==========================================================================
   手机复习阅读库 · 首页逻辑
   数据来源：assets/notes-data.js（window.NOTES）
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'reading-library-theme';

  /* ---------------------------- 主题 ---------------------------- */
  var toggles = document.querySelectorAll('.theme-toggle');

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    toggles.forEach(function (b) {
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      var label = b.querySelector('.theme-label');
      if (label) label.textContent = t === 'dark' ? '浅色模式' : '深色模式';
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0f151b' : '#f3f5f8');
  }

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  toggles.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  });

  /* ---------------------------- 数据 ---------------------------- */
  var notes = (window.NOTES || []).slice().sort(function (a, b) {
    return String(b.added || '').localeCompare(String(a.added || ''));
  });

  var listEl = document.getElementById('list');
  var filtersEl = document.getElementById('filters');
  var emptyEl = document.getElementById('empty');
  var resultEl = document.getElementById('result-line');
  var searchWrap = document.querySelector('.search');
  var searchInput = document.getElementById('search');
  var clearBtn = document.getElementById('search-clear');
  var totalEl = document.getElementById('stat-total');
  var tagTotalEl = document.getElementById('stat-tags');

  if (!listEl || !notes.length) return;

  /* ------------------------- 标签汇总 ------------------------- */
  var allTags = [];
  var seenTag = {};
  notes.forEach(function (n) {
    (n.tags || []).forEach(function (t) {
      if (!t || seenTag[t]) return;
      seenTag[t] = 1;
      allTags.push(t);
    });
  });
  allTags.sort(function (a, b) { return countByTag(b) - countByTag(a) || a.localeCompare(b); });

  if (totalEl) totalEl.textContent = notes.length;
  if (tagTotalEl) tagTotalEl.textContent = allTags.length;

  function countByTag(tag) {
    return notes.filter(function (n) { return (n.tags || []).indexOf(tag) > -1; }).length;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlight(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    var idx = safe.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return safe;
    return safe.slice(0, idx) + '<mark>' + safe.slice(idx, idx + q.length) + '</mark>' + safe.slice(idx + q.length);
  }

  /* -------------------------- 卡片渲染 -------------------------- */
  function buildCard(n) {
    var a = document.createElement('a');
    a.className = 'card';
    a.href = n.href;
    a.setAttribute('data-id', n.id || '');
    a.setAttribute('data-tags', (n.tags || []).join(','));
    var tagsHtml = (n.tags || []).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');
    a.innerHTML =
      (n.kicker ? '<div class="card-kicker">' + esc(n.kicker) + '</div>' : '') +
      '<h2 class="card-title">' + esc(n.title) + '</h2>' +
      '<p class="card-desc">' + esc(n.desc) + '</p>' +
      '<div class="card-foot">' + tagsHtml +
        '<span class="card-date">' + esc(n.added) + ' 加入</span>' +
        (n.minutes ? '<span class="card-time">' + esc(n.minutes) + '</span>' : '') +
        '<span class="card-go">阅读 →</span>' +
      '</div>';
    return a;
  }

  notes.forEach(function (n) { listEl.appendChild(buildCard(n)); });
  var cards = Array.prototype.slice.call(listEl.querySelectorAll('.card'));
  // 以 data-id 建索引，避免依赖「数组顺序 == 卡片顺序」，防止后续增删时错位
  var cardById = {};
  cards.forEach(function (card) { cardById[card.getAttribute('data-id')] = card; });

  /* ------------------------- 筛选与搜索 ------------------------- */
  var state = { tag: '*', q: '' };

  function matches(n, tag, q) {
    if (tag !== '*' && (n.tags || []).indexOf(tag) === -1) return false;
    if (!q) return true;
    var hay = [n.title, n.desc, n.kicker, (n.tags || []).join(' ')].join(' ').toLowerCase();
    return hay.indexOf(q.toLowerCase()) > -1;
  }

  function countFor(tag) {
    return notes.filter(function (n) { return matches(n, tag, state.q); }).length;
  }

  function renderChips() {
    filtersEl.innerHTML = '';
    var items = [{ tag: '*', label: '全部' }].concat(allTags.map(function (t) { return { tag: t, label: t }; }));
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.setAttribute('data-tag', it.tag);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span>' + esc(it.label) + '</span><span class="chip-count">' + countFor(it.tag) + '</span>';
      b.addEventListener('click', function () { state.tag = it.tag; render(); });
      filtersEl.appendChild(b);
    });
  }

  function render() {
    var q = state.q.trim();
    var shown = 0;

    notes.forEach(function (n) {
      var card = cardById[n.id];
      if (!card) return;
      var ok = matches(n, state.tag, q);
      card.hidden = !ok;
      if (ok) shown++;
      var titleEl = card.querySelector('.card-title');
      if (titleEl) titleEl.innerHTML = highlight(n.title, q);
    });

    Array.prototype.forEach.call(filtersEl.querySelectorAll('.chip'), function (chip) {
      var on = chip.getAttribute('data-tag') === state.tag;
      chip.classList.toggle('active', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      var count = chip.querySelector('.chip-count');
      if (count) count.textContent = countFor(chip.getAttribute('data-tag'));
    });

    emptyEl.classList.toggle('show', shown === 0);

    if (resultEl) {
      var parts = ['共 <b>' + shown + '</b> 份资料'];
      if (state.tag !== '*') parts.push('标签「' + esc(state.tag) + '」');
      if (q) parts.push('关键词「' + esc(q) + '」');
      resultEl.innerHTML = parts.join(' · ');
    }

    if (searchWrap) searchWrap.classList.toggle('has-value', !!searchInput.value);
  }

  searchInput.addEventListener('input', function () {
    state.q = searchInput.value;
    render();
  });
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { searchInput.value = ''; state.q = ''; render(); }
  });
  clearBtn.addEventListener('click', function () {
    searchInput.value = '';
    state.q = '';
    render();
    searchInput.focus();
  });
  // 斜杠快捷聚焦搜索
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  /* ---------------------- 跳转加速 ----------------------
     ① 悬停/触摸即预取目标页（rel=prefetch，全平台）
     ② 支持的浏览器用 Speculation Rules 预渲染（Chrome 系，点开即见正文）
     ③ 同时预热资料页共用的 note.css / note.js，避免二次 RTT
     ------------------------------------------------------ */
  var assetVersion = (document.querySelector('meta[name="asset-version"]') || {}).content || '';
  var prefetched = {};

  function prefetch(url) {
    if (!url || prefetched[url]) return;
    prefetched[url] = 1;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  function warmSharedAssets() {
    if (!assetVersion) return;
    prefetch('assets/note.css?v=' + assetVersion);
    prefetch('assets/note.js?v=' + assetVersion);
  }

  function warmCard(card) {
    if (!card) return;
    prefetch(card.getAttribute('href'));
    warmSharedAssets();
  }

  // 预渲染：point 到卡片就后台准备好整页
  if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
    try {
      var rules = document.createElement('script');
      rules.type = 'speculationrules';
      rules.textContent = JSON.stringify({
        prerender: [{ source: 'list', urls: notes.map(function (n) { return n.href; }), eagerness: 'moderate' }]
      });
      document.head.appendChild(rules);
    } catch (e) {}
  }

  ['pointerenter', 'touchstart', 'focusin'].forEach(function (evt) {
    listEl.addEventListener(evt, function (e) {
      warmCard(e.target.closest && e.target.closest('.card'));
    }, { passive: true });
  });

  // 空闲时静默预热前两篇 + 共享资源，避开首屏关键路径
  var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
  idle(function () {
    notes.slice(0, 2).forEach(function (n) { prefetch(n.href); });
    warmSharedAssets();
  });

  // 点击即反馈：先画出「打开中…」，下一帧再跳转，避免白屏等待
  listEl.addEventListener('click', function (e) {
    var card = e.target.closest && e.target.closest('.card');
    if (!card || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = card.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    card.classList.add('is-loading');
    var go = card.querySelector('.card-go');
    if (go) go.textContent = '打开中…';
    var bar = document.getElementById('loadbar');
    if (bar) bar.classList.add('show');
    warmCard(card);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { window.location.href = href; });
    });
  });

  // 浏览器「返回」后恢复原样，避免卡片一直停在「打开中…」
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    document.querySelectorAll('.card.is-loading').forEach(function (card) {
      card.classList.remove('is-loading');
      var go = card.querySelector('.card-go');
      if (go) go.textContent = '阅读 →';
    });
    var bar = document.getElementById('loadbar');
    if (bar) bar.classList.remove('show');
  });

  renderChips();
  render();
})();
