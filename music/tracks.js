/* Общий датасет треков rensite.
   Единый источник: каталог LP читает LP_ALBUMS отсюда, Джеки Чан остаётся
   в своём data.json (генерируется build_data.py) и подгружается loadAll().
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

  /* Реестр гидов — единый источник для витрины /music/, сводного прогресса и ⌘K.
     total — длина маршрута (знаменатель прогресса), storage — ключ localStorage гида,
     accent — цвет «мира» гида (полоса + заливка прогресс-бара). */
  /* hook/stats/name — переводимые поля: строка = язык-нейтрально,
     объект { en, ru } выбирается по текущему языку (хаб выбирает через pick). */
  var GUIDES = [
    { key:'mj', name:'Michael Jackson', native:'King of Pop', url:'/music/michael/',
      accent:'#d4af37', status:'live', total:24, storage:'mj-listened',
      img:'/music/michael/posters/micheal.jpeg',
      hook:{ en:'He sang with breath, pauses, accents. A route from Jackson 5 to Bad — and the films.',
             ru:'Он пел дыханием, паузами, акцентами. Маршрут от Jackson 5 до Bad — и кино.' },
      stats:{ en:'24 tracks · 4 eras · film', ru:'24 трека · 4 эпохи · кино' } },
    { key:'jc', name:'Jackie Chan', native:'成龍', url:'/music/jackie-chan/',
      accent:'#cd2c24', status:'live', total:166, storage:'jc-listened',
      motif:'成龍',
      hook:{ en:'You watched the stunts — and slept through the fact that he sang. Himself, in five languages, for forty years.',
             ru:'Ты следил за трюками — и проспал, что он пел. Сам, на пяти языках, сорок лет.' },
      stats:{ en:'166 songs · 40 years · 5 languages', ru:'166 песен · 40 лет · 5 языков' } },
    { key:'lp', name:'Linkin Park', native:'2000—', url:'/music/linkin-park/',
      accent:'#16181d', status:'live', total:97, storage:'lp-listened',
      motif:'LP', mono:true,
      hook:{ en:'Roots, trunk, side projects, and the return with Emily — the whole arc, in order.',
             ru:'Корни, ствол, сайд-проекты и возвращение с Эмили — вся дуга по порядку.' },
      stats:{ en:'97 tracks · 8 albums · 4 side projects', ru:'97 треков · 8 альбомов · 4 сайд-проекта' } },
    { key:'em', name:'Eminem', native:'Slim Shady', url:'/music/eminem/',
      accent:'#16181d', status:'live', total:847, storage:'em-listened',
      motif:'Ǝ', mono:true,
      hook:{ en:'The whole career on one axis — from the birth of Slim Shady to his death, and “8 Mile”.',
             ru:'Вся карьера на одной оси — от рождения Slim Shady до его смерти, и «8 Mile».' },
      stats:{ en:'847 tracks · full discography · 8 Mile', ru:'847 треков · вся дискография · 8 Mile' } },
    { key:'tj', name:{ en:'Tom and Jerry', ru:'Том и Джерри' }, native:'MGM · 1944—1967', url:'/music/tom-and-jerry/',
      accent:'#e5202b', status:'live', total:10, storage:'tj-listened',
      img:'/music/tom-and-jerry/img/title-card.jpeg',
      hook:{ en:"Ten shorts where music isn't the background — it's the plot. A comic issue with covers and two Oscars.",
             ru:'Десять короткометражек, где музыка не фон, а сам сюжет. Комикс-выпуск с обложками и двумя «Оскарами».' },
      stats:{ en:'10 shorts · 2 Oscars · 1944—1967', ru:'10 серий · 2 «Оскара» · 1944—1967' } }
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
  function loadAll(){
    if (allPromise) return allPromise;
    var jc = grab('/music/jackie-chan/data.json', function(t){
      return {artist:'Jackie Chan', yr:t.yr, alb:t.s||t.type, n:t.n, q:t.q, guide:'/music/jackie-chan/'};
    });
    var em = grab('/music/eminem/data.json', function(t){
      return {artist:'Eminem', yr:t.yr, alb:t.s||t.type, n:t.n, q:t.q, ft:t.ft, guide:'/music/eminem/'};
    });
    allPromise = Promise.all([jc, em]).then(function(r){ return LP_TRACKS.concat(r[0], r[1]); });
    return allPromise;
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

  return { LP_ALBUMS: LP_ALBUMS, LP_TRACKS: LP_TRACKS, GUIDES: GUIDES, loadAll: loadAll, progress: progress, yt: yt };
})();
