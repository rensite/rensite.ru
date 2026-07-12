/* cards.js — единый рендер карточек projects/notes и статусов микроблога из /content.json.
 *
 * Прогрессивное улучшение: статическая разметка в HTML — это фолбэк
 * (видна, если JS выключен или fetch упал). При успехе JS заменяет её
 * данными из content.json — единственного источника правды.
 *
 * Правила карточки:
 *   - item.url с http(s):// → внешняя ссылка (новая вкладка)
 *   - item.url без протокола (напр. "/music/") → внутренняя ссылка
 *   - без item.url → некликабельная карточка (не мёртвый href="#")
 *   - item.status: "live" | "wip" | иначе «скоро» — чип у названия
 *   - item.tags[] и item.yr → мono-строка метаданных под описанием
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

  /* Язык берём из общего движка i18n.js. Если его на странице нет
     (страница ещё не переведена) — остаёмся на русском, как было. */
  function currentLang() {
    return (window.I18N && window.I18N.get) ? window.I18N.get() : 'ru';
  }

  /* Значение поля может быть строкой (нейтрально к языку, напр. "frontend")
     или объектом { en, ru }. pick() выбирает нужный язык с деградацией. */
  function pick(v) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      var l = currentLang();
      return v[l] != null ? v[l] : (v.en != null ? v.en : (v.ru != null ? v.ru : ''));
    }
    return v == null ? '' : v;
  }

  var STATUS = { live: { en: 'live', ru: 'live' }, wip: { en: 'in progress', ru: 'в работе' } };
  var SOON = { en: 'soon', ru: 'скоро' };

  function chipHTML(item, cls) {
    var st = STATUS[item.status] ? item.status : 'soon';
    var label = pick(STATUS[item.status] || SOON);
    return ' <span class="' + cls.soon + ' chip-' + st + '">' + esc(label) + '</span>';
  }

  function metaHTML(item, cls) {
    var parts = (item.tags || []).map(pick);
    if (item.yr) parts.push(item.yr);
    if (!parts.length) return '';
    return '<span class="' + (cls.meta || 'm') + '">' + parts.map(esc).join(' · ') + '</span>';
  }

  function cardHTML(item, cls) {
    var name = esc(pick(item.name));
    var desc = esc(pick(item.desc));
    var inner = '<span class="' + cls.name + '">' + name + chipHTML(item, cls) + '</span>'
      + '<span class="' + cls.desc + '">' + desc + '</span>'
      + metaHTML(item, cls);

    // Без ссылки → некликабельная карточка (не мёртвый href="#").
    if (!item.url) {
      return '<li><span class="' + cls.dead + '">' + inner + '</span></li>';
    }
    var ext = isExternal(item.url);
    var attrs = ext ? ' target="_blank" rel="noopener"' : '';
    return '<li><a href="' + esc(item.url) + '"' + attrs + '>' + inner + '</a></li>';
  }

  function fill(ul, items, cls, limit) {
    if (!ul || !Array.isArray(items)) return;
    var list = limit ? items.slice(0, limit) : items;
    ul.innerHTML = list.map(function (i) { return cardHTML(i, cls); }).join('');
  }

  /* Общая (кэшируемая) загрузка content.json — один fetch на страницу,
     даже если рендерятся и карточки, и статусы. */
  var contentPromise = null;
  function loadContent() {
    if (!contentPromise) {
      contentPromise = fetch('/content.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }
    return contentPromise;
  }
  window.loadContent = loadContent;

  /* targets: [{ sel, key, limit?, cls }]
   *   sel   — CSS-селектор контейнера <ul>
   *   key   — ключ в content.json ("projects" | "notes")
   *   limit — сколько карточек показать (для превью на главной)
   *   cls   — карта классов { name, desc, meta, dead, soon } под разметку страницы
   */
  var lastCards = null, lastStatuses = null;

  window.renderCards = function (targets) {
    lastCards = targets;
    loadContent()
      .then(function (data) {
        targets.forEach(function (t) {
          fill(document.querySelector(t.sel), data[t.key] || [], t.cls, t.limit);
        });
      })
      .catch(function () { /* фолбэк: статическая разметка остаётся как есть */ });
  };

  /* ── Микроблог: статусы из content.json (ключ "statuses", свежие сверху) ──
   * Разметка фиксированная, страницы стилизуют классы st-row/st-date/st-tag/st-text.
   * targets: [{ sel, limit?, skip? }] — sel указывает на <ul>; skip позволяет
   * колонке на главной показывать статусы после тизера (skip:1).
   */
  function fmtDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return esc(iso);
    var loc = currentLang() === 'ru' ? 'ru-RU' : 'en-US';
    try {
      return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short' }).format(d).replace('.', '');
    } catch (e) { return esc(iso); }
  }

  /* Есть ли у записи текст на текущем языке? Строка = язык-нейтрально (да);
     объект {en,ru} без нужного языка = запись пропускается (напр. русская
     шутка не показывается в EN). */
  function hasText(s) {
    var v = s && s.text;
    if (v == null) return false;
    if (typeof v === 'object' && !Array.isArray(v)) {
      var l = currentLang();
      return v[l] != null && v[l] !== '';
    }
    return true;
  }

  function statusHTML(s) {
    var tag = pick(s.tag);
    return '<li class="st-row">'
      + '<span class="st-meta"><span class="st-date">' + fmtDate(s.date) + '</span>'
      + (tag ? '<span class="st-tag">' + esc(tag) + '</span>' : '') + '</span>'
      + '<p class="st-text">' + esc(pick(s.text)) + '</p></li>';
  }

  window.renderStatuses = function (targets) {
    lastStatuses = targets;
    loadContent()
      .then(function (data) {
        var items = (data.statuses || []).filter(hasText);
        if (!items.length) return;
        targets.forEach(function (t) {
          var ul = document.querySelector(t.sel);
          if (!ul) return;
          var from = t.skip || 0;
          var list = items.slice(from, t.limit ? from + t.limit : undefined);
          if (!list.length) return;
          ul.innerHTML = list.map(statusHTML).join('');
        });
      })
      .catch(function () { /* фолбэк: статическая разметка остаётся как есть */ });
  };

  /* Смена языка (i18n.js) — перерисовываем уже отрендеренные цели из кэша. */
  document.addEventListener('i18n:change', function () {
    if (lastCards) window.renderCards(lastCards);
    if (lastStatuses) window.renderStatuses(lastStatuses);
  });
})();
