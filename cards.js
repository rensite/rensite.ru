/* cards.js — единый рендер карточек projects/notes из /content.json.
 *
 * Прогрессивное улучшение: статическая разметка в HTML — это фолбэк
 * (видна, если JS выключен или fetch упал). При успехе JS заменяет её
 * данными из content.json — единственного источника правды.
 *
 * Правила карточки:
 *   - item.url с http(s):// → внешняя ссылка (новая вкладка, стрелка ↗)
 *   - item.url без протокола (напр. "/music/") → внутренняя ссылка (стрелка →)
 *   - без item.url → некликабельная карточка с бейджем «скоро» (не мёртвый href="#")
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function isExternal(url) {
    return /^https?:\/\//i.test(url);
  }

  function cardHTML(item, cls) {
    var name = esc(item.name);
    var desc = esc(item.desc || '');

    // Заглушка без ссылки → бейдж «скоро», без href.
    if (!item.url) {
      return '<li><span class="' + cls.dead + '">'
        + '<span class="' + cls.name + '">' + name
        + ' <span class="' + cls.soon + '">скоро</span></span>'
        + '<span class="' + cls.desc + '">' + desc + '</span></span></li>';
    }

    var ext = isExternal(item.url);
    var arrow = ext ? '↗' : '→';
    var attrs = ext ? ' target="_blank" rel="noopener"' : '';
    return '<li><a href="' + esc(item.url) + '"' + attrs + '>'
      + '<span class="' + cls.name + '">' + name
      + ' <span class="' + cls.arrow + '">' + arrow + '</span></span>'
      + '<span class="' + cls.desc + '">' + desc + '</span></a></li>';
  }

  function fill(ul, items, cls, limit) {
    if (!ul || !Array.isArray(items)) return;
    var list = limit ? items.slice(0, limit) : items;
    ul.innerHTML = list.map(function (i) { return cardHTML(i, cls); }).join('');
  }

  /* targets: [{ sel, key, limit?, cls }]
   *   sel   — CSS-селектор контейнера <ul>
   *   key   — ключ в content.json ("projects" | "notes")
   *   limit — сколько карточек показать (для превью на главной)
   *   cls   — карта классов { name, desc, arrow, dead, soon } под разметку страницы
   */
  window.renderCards = function (targets) {
    fetch('/content.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        targets.forEach(function (t) {
          fill(document.querySelector(t.sel), data[t.key] || [], t.cls, t.limit);
        });
      })
      .catch(function () { /* фолбэк: статическая разметка остаётся как есть */ });
  };
})();
