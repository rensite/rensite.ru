/* Общий датасет треков rensite.
   Единый источник: каталог LP читает LP_ALBUMS отсюда, Джеки Чан остаётся
   в своём data.json (правится вручную) и подгружается loadAll().
   Поверх датасета работает Cmd+K палитра. */
window.RENSITE_MUSIC = (function(){
  'use strict';

  var LP_ALBUMS = [
    {alb:"From Zero",yr:2024,tr:["From Zero (Intro)","The Emptiness Machine","Cut the Bridge","Heavy Is the Crown","Over Each Other","Casualty","Overflow","Two Faced","Stained","IGYEIH","Good Things Go"]},
    {alb:"One More Light",yr:2017,tr:["Nobody Can Save Me","Good Goodbye","Talking to Myself","Battle Symphony","Invisible","Heavy","Sorry for Now","Halfway Right","One More Light","Sharp Edges"]},
    {alb:"The Hunting Party",yr:2014,tr:["Keys to the Kingdom","All for Nothing","Guilty All the Same","The Summoning","War","Wastelands","Until It's Gone","Rebellion","Mark the Graves","Drawbar","Final Masquerade","A Line in the Sand"]},
    {alb:"Living Things",yr:2012,tr:["Lost in the Echo","In My Remains","Burn It Down","Lies Greed Misery","I'll Be Gone","Castle of Glass","Victimized","Roads Untraveled","Skin to Bone","Until It Breaks","Tinfoil","Powerless"]},
    {alb:"A Thousand Suns",yr:2010,tr:["The Requiem","The Radiance","Burning in the Skies","Empty Spaces","When They Come for Me","Robot Boy","Jornada del Muerto","Waiting for the End","Blackout","Wretches and Kings","Wisdom, Justice, and Love","Iridescent","Fallout","The Catalyst","The Messenger"]},
    {alb:"Minutes to Midnight",yr:2007,tr:["Wake","Given Up","Leave Out All the Rest","Bleed It Out","Shadow of the Day","What I've Done","Hands Held High","No More Sorrow","Valentine's Day","In Between","In Pieces","The Little Things Give You Away"]},
    {alb:"Meteora",yr:2003,tr:["Foreword","Don't Stay","Somewhere I Belong","Lying from You","Hit the Floor","Easier to Run","Faint","Figure.09","Breaking the Habit","From the Inside","Nobody's Listening","Session","Numb"]},
    {alb:"Hybrid Theory",yr:2000,tr:["Papercut","One Step Closer","With You","Points of Authority","Crawling","Runaway","By Myself","In the End","A Place for My Head","Forgotten","Cure for the Itch","Pushing Me Away"]}
  ];

  var LP_TRACKS = [];
  LP_ALBUMS.forEach(function(a){
    a.tr.forEach(function(n){
      LP_TRACKS.push({artist:'Linkin Park', yr:a.yr, alb:a.alb, n:n, q:'Linkin Park '+n, guide:'/music/linkin-park/'});
    });
  });

  function yt(q){ return 'https://www.youtube.com/results?search_query='+encodeURIComponent(q); }

  /* Куда ведёт трек: точная ссылка, если она известна, иначе поиск по q.
     y — прямая ссылка на YouTube (полный URL). Конвенция пришла от Eminem,
     где её пишет генератор из колонки youtube_url; здесь она общая на весь
     сайт — иначе получается как было: страница гида ссылку чтит, а палитра
     и «случайный трек» на хабе открывают поиск для трека, у которого точный
     адрес уже лежит в данных.
     q остаётся обязательным всегда: это не только фолбэк, но и ключ прогресса
     в localStorage и строка поиска ⌘K. Прямая ссылка его не заменяет.
     Ссылка, не похожая на http(s), — это опечатка в данных (частый случай:
     «youtube.com/...» без протокола, что дало бы относительный путь и 404).
     Ругаемся в консоль и уходим в поиск: рабочий поиск лучше битой ссылки. */
  function link(t){
    var y = t && t.y;
    if (!y) return yt(t.q);
    if (/^https?:\/\//i.test(y)) return y;
    if (window.console && console.warn){
      console.warn('RENSITE_MUSIC.link: y не похож на ссылку (нужен http:// или https://): ' + y);
    }
    return yt(t.q);
  }

  /* Реестр гидов — единый источник для витрины /music/, сводного прогресса и ⌘K.
     storage — ключ localStorage гида, accent — цвет «мира» (полоса + заливка прогресс-бара).

     total — длина маршрута (знаменатель прогресса) ТОЛЬКО там, где её неоткуда взять:
     у Michael и Tom & Jerry нет своего data.json, их числа заданы руками и иначе никак.
     У остальных total отсутствует намеренно — его считает totals() из реальных треков,
     чтобы число не разъезжалось с каталогом при каждой правке. LP считается синхронно
     (LP_TRACKS лежит здесь же), Джеки и Eminem — из своих data.json, то есть асинхронно.

     hook/stats/name — переводимые поля: строка = язык-нейтрально, объект { en, ru }
     выбирается по текущему языку (хаб выбирает через pick).
     stats — шаблон под fill(): {n} — число из totals(), {a|b|c} — существительное,
     согласованное с ним. Число в строке не дублируем, форму не угадываем. */
  var GUIDES = [
    { key:'mj', name:'Michael Jackson', native:'King of Pop', url:'/music/michael/',
      accent:'#d4af37', status:'live', total:24, storage:'mj-listened',
      img:'/music/michael/posters/micheal.jpeg',
      hook:{ en:'He sang with breath, pauses, accents. A route from Jackson 5 to Bad — and the films.',
             ru:'Он пел дыханием, паузами, акцентами. Маршрут от Jackson 5 до Bad — и кино.' },
      stats:{ en:'{n} {track|tracks} · 4 eras · film', ru:'{n} {трек|трека|треков} · 4 эпохи · кино' } },
    { key:'jc', name:'Jackie Chan', native:'成龍', url:'/music/jackie-chan/',
      accent:'#cd2c24', status:'live', storage:'jc-listened',
      motif:'成龍',
      hook:{ en:'You watched the stunts — and slept through the fact that he sang. Himself, in five languages, for forty years.',
             ru:'Ты следил за трюками — и проспал, что он пел. Сам, на пяти языках, сорок лет.' },
      stats:{ en:'{n} {song|songs} · 40 years · 5 languages', ru:'{n} {песня|песни|песен} · 40 лет · 5 языков' } },
    { key:'lp', name:'Linkin Park', native:'2000—', url:'/music/linkin-park/',
      accent:'#16181d', status:'live', total:LP_TRACKS.length, storage:'lp-listened',
      motif:'LP', mono:true,
      hook:{ en:'Roots, trunk, side projects, and the return with Emily — the whole arc, in order.',
             ru:'Корни, ствол, сайд-проекты и возвращение с Эмили — вся дуга по порядку.' },
      stats:{ en:'{n} {track|tracks} · 8 albums · 4 side projects', ru:'{n} {трек|трека|треков} · 8 альбомов · 4 сайд-проекта' } },
    { key:'em', name:'Eminem', native:'Slim Shady', url:'/music/eminem/',
      accent:'#16181d', status:'live', storage:'em-listened',
      motif:'Ǝ', mono:true,
      hook:{ en:'The whole career on one axis — from the birth of Slim Shady to his death, and “8 Mile”.',
             ru:'Вся карьера на одной оси — от рождения Slim Shady до его смерти, и «8 Mile».' },
      stats:{ en:'{n} {track|tracks} · full discography · 8 Mile', ru:'{n} {трек|трека|треков} · вся дискография · 8 Mile' } },
    { key:'tj', name:{ en:'Tom and Jerry', ru:'Том и Джерри' }, native:'MGM · 1944—1967', url:'/music/tom-and-jerry/',
      accent:'#e5202b', status:'live', total:10, storage:'tj-listened',
      img:'/music/tom-and-jerry/img/title-card.jpeg',
      hook:{ en:"Ten shorts where music isn't the background — it's the plot. A comic issue with covers and two Oscars.",
             ru:'Десять короткометражек, где музыка не фон, а сам сюжет. Комикс-выпуск с обложками и двумя «Оскарами».' },
      stats:{ en:'{n} {short|shorts} · 2 Oscars · 1944—1967', ru:'{n} {серия|серии|серий} · 2 «Оскара» · 1944—1967' } }
  ];

  /* Все треки всех гидов для ⌘K. LP — из LP_ALBUMS (синхронно), Джеки Чан и
     Eminem — из своих data.json (лениво); если файл недоступен — гид просто
     выпадает из палитры, остальные работают. */
  var allPromise = null;
  function grab(url, map){
    return fetch(url)
      .then(function(r){ if (!r.ok) throw new Error(url+' '+r.status); return r.json(); })
      .then(function(d){ return (d.tracks||[]).map(map); })
      .catch(function(){ return []; });
  }
  /* alb уходит только в строку поиска ⌘K (palette.js его не рендерит), поэтому
     сюда сгребаем всё, по чему трек разумно искать: контекст релиза, подписи
     вариантов, типы. Поля s/l у Джеки билингвальные ({en,ru}) — склеиваем оба
     языка, чтобы искалось на любом; у Eminem это обычные строки, они проходят
     насквозь. Без этого объект молча превращался бы в "[object Object]". */
  function albText(t){
    var bits = [];
    function push(v){
      if (!v) return;
      if (typeof v === 'object'){ if (v.en) bits.push(v.en); if (v.ru) bits.push(v.ru); }
      else bits.push(v);
    }
    push(t.s);
    (t.variants || []).forEach(function(v){ push(v.l); });
    if (!bits.length) push((t.types || []).join(' ') || t.type);
    return bits.join(' ');
  }
  function loadAll(){
    if (allPromise) return allPromise;
    /* y тащим наравне с q: без него палитра и хаб зовут link() на объекте без
       прямой ссылки и молча уходят в поиск — трек-то найдётся, но мимо. */
    var jc = grab('/music/jackie-chan/data.json', function(t){
      return {artist:'Jackie Chan', yr:t.yr, alb:albText(t), n:t.n, q:t.q, y:t.y, guide:'/music/jackie-chan/'};
    });
    var em = grab('/music/eminem/data.json', function(t){
      return {artist:'Eminem', yr:t.yr, alb:albText(t), n:t.n, q:t.q, y:t.y, ft:t.ft, guide:'/music/eminem/'};
    });
    allPromise = Promise.all([jc, em]).then(function(r){ return LP_TRACKS.concat(r[0], r[1]); });
    return allPromise;
  }

  /* Длины маршрутов всех гидов: { key: n|null }. Асинхронна, потому что Джеки и
     Eminem живут в своих data.json — синхронно их не сосчитать. Гид со своим total
     (нет data.json: Michael, Tom & Jerry) отдаётся как есть; остальные считаются
     по полю guide загруженных треков — так число всегда равно каталогу.
     Если data.json не доехал, grab() вернул [] — такой гид получает null, а не 0:
     «не знаем» и «ноль песен» это разные вещи, и показывать ноль нельзя. */
  function totals(){
    return loadAll().then(function(ts){
      var by = {};
      ts.forEach(function(t){ by[t.guide] = (by[t.guide] || 0) + 1; });
      var out = {};
      GUIDES.forEach(function(g){
        out[g.key] = (g.total != null) ? g.total : (by[g.url] || null);
      });
      return out;
    });
  }

  /* Согласование существительного с числом. Правило выбирает ЯЗЫК, а не длина
     массива, поэтому форм должно быть ровно столько, сколько язык ждёт:
       ru — три формы (1 / 2–4 / 5+):  plural(5, ['мир','мира','миров'])
       en — две формы (1 / прочее):    plural(5, ['world','worlds'], 'en')
     Язык по умолчанию русский: en-строки без склонения писать незачем, а вот
     ru-код зовёт plural() россыпью (каталог Джеки), и третий аргумент там шум.
     Форм не столько, сколько надо, — это опечатка в строке: ругаемся в консоль
     и отдаём последнюю форму (в обоих языках это множественное число, самый
     безопасный дефолт), чтобы кривая подпись не уронила страницу.
     Общий на весь сайт — каталог Джеки берёт его отсюда же. */
  var FORMS_EXPECTED = { ru: 3, en: 2 };

  function plural(n, forms, lang){
    lang = lang || 'ru';
    var want = FORMS_EXPECTED[lang] || 3;
    if (forms.length !== want){
      if (window.console && console.warn){
        console.warn('RENSITE_MUSIC.plural: для «' + lang + '» нужно форм: ' + want +
                     ', а в строке ' + forms.length + ' (' + forms.join('|') + ')');
      }
      return forms[forms.length - 1];
    }
    if (lang === 'en') return forms[n === 1 ? 0 : 1];
    var a = Math.abs(n) % 100, b = a % 10;
    return forms[(a > 10 && a < 20) ? 2 : (b > 1 && b < 5) ? 1 : (b === 1 ? 0 : 2)];
  }

  /* Подстановка числа в строку: {n} — само число, {песня|песни|песен} —
     существительное, согласованное с ним. Формы живут прямо в строке, рядом
     с текстом: правишь фразу — сразу видно, что склоняется.
       fill('{n} {песня|песни|песен} · 40 лет', 158, 'ru') -> '158 песен · 40 лет'
       fill('{n} {song|songs} · 40 years', 1, 'en')        -> '1 song · 40 years'
     Числа, зашитые в строку руками («40 лет», «5 языков»), скобок не просят:
     они написаны рядом со своим числом и меняются вместе с ним.
     Строка ровно про одно число; если чисел два — зови fill дважды. */
  function fill(tpl, n, lang){
    return String(tpl)
      .replace(/\{([^{}|]*\|[^{}]*)\}/g, function(_, s){ return plural(n, s.split('|'), lang); })
      .replace(/\{n\}/g, n);
  }

  /* Прогресс «прослушано» поверх localStorage: общий хелпер для каталогов.
     storageKey — свой на гид (lp-listened, jc-listened). */
  function progress(storageKey){
    var set;
    try { set = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); }
    catch(e){ set = new Set(); }
    function save(){
      try { localStorage.setItem(storageKey, JSON.stringify(Array.from(set))); } catch(e){}
    }
    return {
      has: function(k){ return set.has(k); },
      add: function(k){ if (!set.has(k)){ set.add(k); save(); return true; } return false; },
      toggle: function(k){ set.has(k) ? set.delete(k) : set.add(k); save(); return set.has(k); },
      size: function(){ return set.size; }
    };
  }

  return { LP_ALBUMS: LP_ALBUMS, LP_TRACKS: LP_TRACKS, GUIDES: GUIDES,
           loadAll: loadAll, totals: totals, progress: progress, plural: plural, fill: fill,
           yt: yt, link: link };
})();
