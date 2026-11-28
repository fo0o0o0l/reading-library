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

    notes.forEach(function (n, i) {
      var card = cards[i];
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

  renderChips();
  render();
})();
