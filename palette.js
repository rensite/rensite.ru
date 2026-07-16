/* Cmd+K палитра: поиск по страницам сайта и всем трекам гидов.
   Самодостаточна: инжектит свои стили, датасет (/music/tracks.js)
   подгружает лениво при первом открытии. Тёмная панель — читается
   и на светлых страницах, и в тёмных гидах. */
(function(){
  'use strict';

  /* t/d — переводимые поля: строка = язык-нейтрально (имена собственные),
     объект { en, ru } выбирается по текущему языку через pick.
     k — поисковые синонимы (EN+RU сразу), язык-нейтральны. */
  var PAGES = [
    {t:{en:'Home',ru:'Главная'},                d:'rensite',                                                              url:'/',                    k:'home главная renat'},
    {t:{en:'Music guides',ru:'Музыкальные гиды'},d:{en:'routes through discographies',ru:'маршруты сквозь дискографии'},   url:'/music/',              k:'music музыка'},
    {t:'Linkin Park',       d:{en:'guide: roots, side projects, the return',ru:'гид: корни, сайд-проекты, возвращение'},   url:'/music/linkin-park/',  k:'линкин парк lp честер майк'},
    {t:'Jackie Chan',       d:{en:'discography: forty years, five languages',ru:'дискография: сорок лет, пять языков'},    url:'/music/jackie-chan/',  k:'джеки чан 成龍'},
    {t:'Michael Jackson',   d:{en:'guide to the film: eras and tracks',ru:'гид к фильму: эпохи и треки'},                  url:'/music/michael/',      k:'майкл джексон mj'},
    {t:'Eminem',            d:{en:'guide: the whole career and “8 Mile”',ru:'гид: вся карьера и «8 Mile»'},                url:'/music/eminem/',       k:'эминем eminem slim shady marshall маршалл'},
    {t:{en:'Tom and Jerry',ru:'Том и Джерри'},  d:{en:'comic issue: music as the plot',ru:'комикс-выпуск: музыка как сюжет'},url:'/music/tom-and-jerry/',k:'том джерри tom and jerry мультфильм оскар'},
    {t:{en:'Microblog',ru:'Микроблог'},         d:{en:'weekly statuses and insights',ru:'статусы и инсайты недели'},       url:'/status/',             k:'status статус инсайт blog'},
    {t:{en:'Notes',ru:'Заметки'},               d:{en:'longer writeups',ru:'лонгриды'},                                   url:'/notes/',              k:'notes заметки longread лонгрид'},
    {t:{en:'How to brew great coffee',ru:'Как сварить отличный кофе'},d:{en:'guide: levers, methods, calculators',ru:'гайд: рычаги, методы, калькуляторы'},url:'/notes/coffee/',k:'coffee кофе brew заваривание espresso эспрессо pour-over v60 френч-пресс grind помол ratio пропорция'},
    {t:{en:'Projects',ru:'Проекты'},            d:{en:'agents, guides, and this site',ru:'агенты, гиды и этот сайт'},      url:'/projects/',           k:'projects проекты агенты'}
  ];
  var TRACK_LIMIT = 9;

  /* Язык из i18n.js (дефолт en). pick — выбор перевода, tt — инлайн-строки UI,
     txt — плоский поиск сразу по обоим языкам (не зависит от текущего). */
  function lang(){ try { return (window.I18N && I18N.get) ? I18N.get() : (document.documentElement.lang === 'ru' ? 'ru' : 'en'); } catch(e){ return 'en'; } }
  function pick(v){ if (v && typeof v === 'object' && !Array.isArray(v)){ var l = lang(); return v[l] != null ? v[l] : (v.en != null ? v.en : v.ru); } return v == null ? '' : v; }
  function tt(en, ru){ return lang() === 'ru' ? ru : en; }
  function txt(v){ return (v && typeof v === 'object') ? ((v.en || '') + ' ' + (v.ru || '')) : (v || ''); }

  var CSS =
    '.kpal-ov{position:fixed;inset:0;z-index:9999;background:rgba(8,8,12,.45);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:flex;justify-content:center;align-items:flex-start;padding:12vh 16px 16px}' +
    '.kpal-ov[hidden]{display:none}' +
    '.kpal{width:100%;max-width:560px;background:#101015;color:#efece5;border:1px solid #2a2a33;border-radius:14px;box-shadow:0 24px 80px rgba(0,0,0,.5);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif}' +
    '.kpal input{width:100%;box-sizing:border-box;background:transparent;border:none;outline:none;color:#efece5;font-size:16px;padding:15px 18px;border-bottom:1px solid #22222a}' +
    '.kpal input::placeholder{color:#6b6a73}' +
    '.kpal-list{max-height:46vh;overflow:auto;padding:6px;overscroll-behavior:contain}' +
    '.kpal-cap{font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#6b6a73;padding:8px 12px 4px}' +
    '.kpal-it{display:flex;gap:10px;align-items:baseline;padding:9px 12px;border-radius:8px;cursor:pointer}' +
    '.kpal-it.on{background:#1d1d25}' +
    '.kpal-it .t{font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.kpal-it .d{font-size:12px;color:#8e8d96;margin-left:auto;text-align:right;flex-shrink:0;max-width:45%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.kpal-empty{padding:18px 14px;font-size:13.5px;color:#8e8d96}' +
    '.kpal-foot{display:flex;gap:16px;padding:9px 14px;border-top:1px solid #22222a;font-family:ui-monospace,monospace;font-size:11px;color:#6b6a73}' +
    '@media(prefers-reduced-motion:no-preference){.kpal{animation:kpalin .14s ease-out}@keyframes kpalin{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}}';

  var ov = null, input, listEl, flat = [], sel = 0, tracks = null;

  function ensureData(){
    if (tracks) return Promise.resolve(tracks);
    var mod = window.RENSITE_MUSIC
      ? Promise.resolve(window.RENSITE_MUSIC)
      : new Promise(function(res){
          var sc = document.createElement('script');
          sc.src = '/music/tracks.js?v=20260717a';
          sc.onload = function(){ res(window.RENSITE_MUSIC); };
          sc.onerror = function(){ res(null); };
          document.head.appendChild(sc);
        });
    return mod.then(function(M){
      if (!M) return (tracks = []);
      return M.loadAll().then(function(ts){ return (tracks = ts); });
    });
  }

  function build(){
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    ov = document.createElement('div'); ov.className = 'kpal-ov'; ov.hidden = true;
    ov.innerHTML =
      '<div class="kpal" role="dialog" aria-modal="true" aria-label="' + tt('Search the site','Поиск по сайту') + '">' +
        '<input type="text" placeholder="' + tt('Page or track…','Страница или трек…') + '" aria-label="' + tt('Search','Поиск') + '" autocomplete="off" spellcheck="false">' +
        '<div class="kpal-list"></div>' +
        '<div class="kpal-foot"><span>' + tt('↑↓ navigate','↑↓ выбор') + '</span><span>' + tt('↵ open','↵ открыть') + '</span><span>' + tt('esc close','esc закрыть') + '</span></div>' +
      '</div>';
    document.body.appendChild(ov);
    input = ov.querySelector('input');
    listEl = ov.querySelector('.kpal-list');
    ov.addEventListener('mousedown', function(e){ if (e.target === ov) close(); });
    input.addEventListener('input', function(){ render(input.value.trim().toLowerCase()); });
    input.addEventListener('keydown', function(e){
      if (e.key === 'ArrowDown'){ e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); move(-1); }
      else if (e.key === 'Enter'){ e.preventDefault(); go(); }
    });
    listEl.addEventListener('click', function(e){
      var it = e.target.closest('.kpal-it'); if (!it) return;
      sel = +it.dataset.i; go();
    });
    listEl.addEventListener('mousemove', function(e){
      var it = e.target.closest('.kpal-it'); if (!it || +it.dataset.i === sel) return;
      sel = +it.dataset.i; paint();
    });
  }

  function esc(x){ return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  function render(q){
    var pages = PAGES.filter(function(p){
      return !q || (txt(p.t) + ' ' + txt(p.d) + ' ' + p.url + ' ' + p.k).toLowerCase().indexOf(q) !== -1;
    });
    var trs = (q && tracks) ? tracks.filter(function(t){
      return (t.n + ' ' + t.alb + ' ' + t.artist + ' ' + (t.ft || '')).toLowerCase().indexOf(q) !== -1;
    }).slice(0, TRACK_LIMIT) : [];

    flat = []; sel = 0;
    var html = '';
    if (pages.length){
      html += '<div class="kpal-cap">' + tt('pages','страницы') + '</div>';
      pages.forEach(function(p){
        html += '<div class="kpal-it" data-i="' + flat.length + '"><span class="t">' + esc(pick(p.t)) + '</span><span class="d">' + esc(pick(p.d)) + '</span></div>';
        flat.push({kind:'page', url:p.url});
      });
    }
    if (trs.length){
      html += '<div class="kpal-cap">' + tt('tracks · ▶ youtube','треки · ▶ youtube') + '</div>';
      trs.forEach(function(t){
        html += '<div class="kpal-it" data-i="' + flat.length + '"><span class="t">' + esc(t.n) + '</span><span class="d">' + esc(t.artist + ' · ' + t.yr) + '</span></div>';
        flat.push({kind:'track', t:t});
      });
    }
    if (!flat.length) html = '<div class="kpal-empty">' + tt('Nothing found. Try a track title — for example, “numb”.','Ничего не нашлось. Попробуй название трека — например, «numb».') + '</div>';
    else if (!q) html += '<div class="kpal-empty">' + tt('Start typing — tracks from every guide show up too.','Начни печатать — найдутся и треки всех гидов.') + '</div>';
    listEl.innerHTML = html;
    paint();
  }

  function paint(){
    var its = listEl.querySelectorAll('.kpal-it');
    its.forEach(function(el){ el.classList.toggle('on', +el.dataset.i === sel); });
    var on = listEl.querySelector('.kpal-it.on');
    if (on && on.scrollIntoView) on.scrollIntoView({block:'nearest'});
  }

  function move(d){
    if (!flat.length) return;
    sel = (sel + d + flat.length) % flat.length;
    paint();
  }

  function go(){
    var it = flat[sel]; if (!it) return;
    if (it.kind === 'page'){ close(); location.href = it.url; }
    else { window.open(window.RENSITE_MUSIC.link(it.t), '_blank', 'noopener'); }
  }

  var lastFocus = null;
  function open(){
    if (!ov) build();
    lastFocus = document.activeElement;
    ov.hidden = false;
    input.value = '';
    render('');
    input.focus();
    ensureData().then(function(){ if (!ov.hidden) render(input.value.trim().toLowerCase()); });
  }
  function close(){
    if (!ov || ov.hidden) return;
    ov.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', function(e){
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л')){
      e.preventDefault();
      (ov && !ov.hidden) ? close() : open();
    } else if (e.key === 'Escape'){ close(); }
  });

  /* Смена языка на лету: обновляем статические строки (собираются один раз
     в build()) и перерисовываем список, если палитра открыта. */
  document.addEventListener('i18n:change', function(){
    if (!ov) return;
    var dlg = ov.querySelector('.kpal');
    if (dlg) dlg.setAttribute('aria-label', tt('Search the site','Поиск по сайту'));
    if (input){ input.placeholder = tt('Page or track…','Страница или трек…'); input.setAttribute('aria-label', tt('Search','Поиск')); }
    var hints = ov.querySelectorAll('.kpal-foot span'), h = [tt('↑↓ navigate','↑↓ выбор'), tt('↵ open','↵ открыть'), tt('esc close','esc закрыть')];
    hints.forEach(function(s, i){ if (h[i]) s.textContent = h[i]; });
    if (!ov.hidden) render(input.value.trim().toLowerCase());
  });

  window.KPAL = { open: open, close: close };
})();
