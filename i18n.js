/* i18n.js — переключатель языка EN/RU для всего сайта.
 *
 * Самодостаточен (как palette.js): инжектит свои стили и кнопку-тоггл,
 * вешает один глобал window.I18N. Английский — язык по умолчанию,
 * выбор хранится в localStorage (ключ 'rensite:lang').
 *
 * Разметка на страницах:
 *   - текст:     <p data-ru="Русский">English</p>
 *                Видимый текст элемента = английский (дефолт и SEO/no-JS).
 *                Русский лежит в data-ru. Оригинальный английский движок
 *                снимает в data-en при первом применении — дублировать не нужно.
 *   - атрибуты:  data-ru-title / data-ru-aria-label / data-ru-placeholder
 *   - тоггл:     <span data-lang-toggle></span> — сюда встанет переключатель.
 *                Если хука на странице нет — кнопка всплывает в правом нижнем углу.
 *
 * Динамический контент (cards.js и пр.): слушайте событие 'i18n:change'
 * на document и перерисовывайтесь; текущий язык — window.I18N.get().
 */
(function () {
  'use strict';

  var KEY = 'rensite:lang';
  var ATTRS = ['title', 'aria-label', 'placeholder'];
  var lang = read();

  function read() {
    try { var v = localStorage.getItem(KEY); if (v === 'en' || v === 'ru') return v; } catch (e) {}
    return 'en';
  }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // ── Применение перевода к поддереву ──
  function applyText(root, l) {
    var nodes = root.querySelectorAll('[data-ru]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.textContent); // снимок англ.
      var val = el.getAttribute('data-' + l);
      el.textContent = (val == null) ? el.getAttribute('data-en') : val;
    }
  }
  function applyAttrs(root, l) {
    for (var a = 0; a < ATTRS.length; a++) {
      var attr = ATTRS[a], enKey = 'data-en-' + attr;
      var nodes = root.querySelectorAll('[data-ru-' + attr + ']');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (!el.hasAttribute(enKey)) el.setAttribute(enKey, el.getAttribute(attr) || '');
        var val = el.getAttribute('data-' + l + '-' + attr);
        if (val == null) val = el.getAttribute(enKey);
        if (val != null) el.setAttribute(attr, val);
      }
    }
  }
  function apply(root) {
    root = root || document;
    applyText(root, lang);
    applyAttrs(root, lang);
  }

  // ── Подписки + событие ──
  var subs = [];
  function emit() {
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: lang } }));
    for (var i = 0; i < subs.length; i++) { try { subs[i](lang); } catch (e) {} }
    paintToggle();
  }
  function set(l) {
    if (l !== 'en' && l !== 'ru' || l === lang) return;
    lang = l; save(l);
    apply(document);
    emit();
  }

  // ── Кнопка-тоггл ──
  // Тихий текстовый переключатель — без рамки и заливки, в тон muted-топлайну.
  var CSS =
    '.lang-tg{display:inline-flex;align-items:center;gap:1px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;line-height:1;color:var(--soft,#94A3B8)}' +
    '.lang-tg button{appearance:none;-webkit-appearance:none;background:transparent;border:0;color:var(--soft,#94A3B8);padding:0 2px;cursor:pointer;font:inherit;letter-spacing:.02em;text-transform:lowercase;opacity:.6;transition:color .15s ease,opacity .15s ease}' +
    '.lang-tg button[aria-pressed="true"]{color:var(--ink,#0F172A);opacity:1}' +
    '.lang-tg button:hover{color:var(--navy,#1E3A8A);opacity:1}' +
    '.lang-tg .sep{opacity:.4;padding:0 1px}' +
    '.lang-tg--float{position:fixed;bottom:12px;right:12px;z-index:9998;background:var(--bg,#fff);padding:3px 7px;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.10)}';

  var tgEl = null;
  function buildToggle() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    tgEl = document.createElement('span');
    tgEl.className = 'lang-tg';
    tgEl.setAttribute('role', 'group');
    tgEl.setAttribute('aria-label', 'Language / Язык');
    tgEl.innerHTML =
      '<button type="button" data-l="en">en</button>' +
      '<span class="sep" aria-hidden="true">·</span>' +
      '<button type="button" data-l="ru">ru</button>';
    tgEl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      set(b.getAttribute('data-l'));
    });
    var host = document.querySelector('[data-lang-toggle]');
    if (host) host.appendChild(tgEl);
    else { tgEl.classList.add('lang-tg--float'); document.body.appendChild(tgEl); }
    paintToggle();
  }
  function paintToggle() {
    if (!tgEl) return;
    var bs = tgEl.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-l') === lang ? 'true' : 'false');
    }
  }

  window.I18N = {
    get: function () { return lang; },
    set: set,
    toggle: function () { set(lang === 'en' ? 'ru' : 'en'); },
    apply: apply,
    onChange: function (cb) { if (typeof cb === 'function') subs.push(cb); }
  };

  function init() {
    document.documentElement.lang = lang;
    apply(document);
    buildToggle();
  }
  // Скрипт грузится с defer: DOM уже разобран, но подстрахуемся.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
