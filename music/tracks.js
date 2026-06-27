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
  var GUIDES = [
    { key:'mj', name:'Michael Jackson', native:'King of Pop', url:'/music/michael/',
      accent:'#d4af37', status:'live', total:24, storage:'mj-listened',
      img:'/music/michael/posters/micheal.jpeg',
      hook:'Он пел дыханием, паузами, акцентами. Маршрут от Jackson 5 до Bad — и кино.',
      stats:'24 трека · 4 эпохи · кино' },
    { key:'jc', name:'Jackie Chan', native:'成龍', url:'/music/jackie-chan/',
      accent:'#cd2c24', status:'live', total:166, storage:'jc-listened',
      motif:'成龍',
      hook:'Ты следил за трюками — и проспал, что он пел. Сам, на пяти языках, сорок лет.',
      stats:'166 песен · 40 лет · 5 языков' },
    { key:'lp', name:'Linkin Park', native:'2000—', url:'/music/linkin-park/',
      accent:'#16181d', status:'live', total:97, storage:'lp-listened',
      motif:'LP', mono:true,
      hook:'Корни, ствол, сайд-проекты и возвращение с Эмили — вся дуга по порядку.',
      stats:'97 треков · 8 альбомов · 4 сайд-проекта' },
    { key:'em', name:'Eminem', native:'Slim Shady', url:'/music/eminem/',
      accent:'#16181d', status:'live', total:0, storage:'em-listened',
      motif:'Ǝ', mono:true,
      hook:'Вся карьера на одной оси — от рождения Slim Shady до его смерти, и «8 Mile».',
      stats:'13 альбомов · 5 эпох · 8 Mile' }
  ];

  /* Все треки всех гидов. Джеки Чан тянется из data.json;
     если файл недоступен (открыто как file://) — живём на треках LP. */
  var allPromise = null;
  function loadAll(){
    if (allPromise) return allPromise;
    allPromise = fetch('/music/jackie-chan/data.json')
      .then(function(r){ if (!r.ok) throw new Error('data.json '+r.status); return r.json(); })
      .then(function(d){
        return d.tracks.map(function(t){
          return {artist:'Jackie Chan', yr:t.yr, alb:t.s||t.type, n:t.n, q:t.q, guide:'/music/jackie-chan/'};
        });
      })
      .catch(function(){ return []; })
      .then(function(jc){ return LP_TRACKS.concat(jc); });
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
