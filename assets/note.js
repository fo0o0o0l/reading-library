/* ==========================================================================
   资料页统一脚本（手机优先）
   依赖 DOM 结构：见 notes/_template.html
   主题偏好按页面区分：<html data-note-key="唯一标识">
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'reading-library-note-theme-' + (root.getAttribute('data-note-key') || 'default');
  var bar = document.getElementById('bar');
  var toTop = document.getElementById('toTop');
  var sidebar = document.getElementById('sidebar');
  var body = document.body;
  var heads = Array.prototype.slice.call(document.querySelectorAll('h2[id],h3[id]'));
  var links = {};
  document.querySelectorAll('[data-target]').forEach(function (a) { links[a.dataset.target] = a; });

  /* 主题
     html[data-theme-lock="light"] 的页面固定浅色：不读偏好、不绑定切换按钮 */
  var themeLocked = root.getAttribute('data-theme-lock') === 'light';
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-label').forEach(function (el) {
      el.textContent = t === 'dark' ? '浅色模式' : '深色模式';
    });
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', t === 'dark');
    });
  }
  if (themeLocked) {
    applyTheme('light');
  } else {
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (!stored) stored = root.getAttribute('data-theme') || 'light';
    applyTheme(stored);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
      });
    });
  }

  /* 滚动高亮 */
  var current = null;
  function spy() {
    if (!heads.length || !sidebar) return;
    var y = window.scrollY + 120, cur = heads[0];
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].getBoundingClientRect().top + window.scrollY <= y) cur = heads[i];
      else break;
    }
    if (current && current.id === cur.id) return;
    current = cur;
    Object.keys(links).forEach(function (k) {
      links[k].classList.remove('active', 'section-active');
    });
    var active = links[cur.id];
    if (active) {
      active.classList.add('active');
      if (cur.tagName === 'H3') {
        for (var j = heads.indexOf(cur) - 1; j >= 0; j--) {
          if (heads[j].tagName === 'H2') {
            if (links[heads[j].id]) links[heads[j].id].classList.add('section-active');
            break;
          }
        }
      }
      var r = active.getBoundingClientRect(), sr = sidebar.getBoundingClientRect();
      if (r.top < sr.top + 60 || r.bottom > sr.bottom - 40) active.scrollIntoView({ block: 'nearest' });
    }
  }

  /* 进度与回顶 */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement, max = h.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0) + '%';
      if (toTop) toTop.classList.toggle('show', h.scrollTop > 420);
      spy();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  var footTop = document.getElementById('footTop');
  if (footTop) {
    footTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 目录抽屉 */
  var tocToggle = document.getElementById('tocToggle');
  function closeNav() { body.classList.remove('nav-open'); }
  if (tocToggle) tocToggle.addEventListener('click', function () { body.classList.toggle('nav-open'); });
  var backdrop = document.getElementById('backdrop');
  if (backdrop) backdrop.addEventListener('click', closeNav);
  document.querySelectorAll('#sidebar a').forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* 复制代码 */
  function copyText(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (ok) return Promise.resolve();
    if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error('copy failed'));
  }
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('.codeblock').querySelector('pre');
      copyText(pre.textContent).then(function () {
        btn.classList.add('done');
        btn.textContent = '已复制';
        setTimeout(function () { btn.classList.remove('done'); btn.textContent = '复制'; }, 2200);
      }).catch(function () {
        btn.textContent = '复制失败';
        setTimeout(function () { btn.textContent = '复制'; }, 2200);
      });
    });
  });

  /* 横向溢出提示 */
  document.querySelectorAll('.codeblock pre').forEach(function (pre) {
    if (pre.scrollWidth > pre.clientWidth + 2) pre.closest('.codeblock').classList.add('scrollable');
  });

  /* 打印 */
  var printBtn = document.getElementById('printBtn');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  /* 标题锚点 */
  heads.forEach(function (h) {
    var a = document.createElement('a');
    a.className = 'anchor-link';
    a.href = '#' + h.id;
    a.textContent = '#';
    a.setAttribute('aria-label', '本节链接');
    h.appendChild(a);
  });

  onScroll();
})();
