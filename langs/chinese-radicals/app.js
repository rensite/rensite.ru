/* RadicalIQ — ваниль-логика (фаза 1).
   Порт Pinia-стора + рендеринга из Vue-приложения без фреймворка.
   Реактивность = стор с pub/sub + явные render*()-функции.
   Сессии study/quiz и панель «почему это работает» подключаются в фазе 2. */
(function () {
  'use strict';

  var DATA = window.RIQ_DATA;
  if (!DATA) { console.error('[RadicalIQ] radicals.js не загрузился — нет window.RIQ_DATA'); return; }

  var CATEGORIES = DATA.CATEGORIES;
  var RADICALS   = DATA.RADICALS;
  var CAT_LIST   = Object.keys(CATEGORIES).map(function (k) { return CATEGORIES[k]; });

  var CAT_GLYPH = { human:'人', nature:'水', structural:'宀', tools:'刀', abstract:'心' };
  var STORE_KEY = 'radicaliq:v1';

  var $  = function (id) { return document.getElementById(id); };

  // ── STORE ──────────────────────────────────────────────────────
  function freshRadicals() {
    var o = {};
    RADICALS.forEach(function (r) { o[r.id] = { mastery: 0, lastSeen: null, seenCount: 0 }; });
    return o;
  }
  function freshState() {
    return { radicals: freshRadicals(), streak: 0, lastStudyDate: null, sessionStats: { correct: 0, total: 0 } };
  }
  function clampMastery(m) { m = m | 0; return m < 0 ? 0 : (m > 3 ? 3 : m); }

  function loadState() {
    var state = freshState();
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return state;
      var saved = JSON.parse(raw);
      // Наложить сохранённый прогресс на свежую карту — устойчиво к изменению датасета.
      if (saved && saved.radicals) {
        RADICALS.forEach(function (r) {
          var s = saved.radicals[r.id];
          if (s) state.radicals[r.id] = {
            mastery: clampMastery(s.mastery),
            lastSeen: s.lastSeen != null ? s.lastSeen : null,
            seenCount: s.seenCount | 0,
          };
        });
      }
      if (saved) {
        state.streak = saved.streak | 0;
        state.lastStudyDate = saved.lastStudyDate != null ? saved.lastStudyDate : null;
        if (saved.sessionStats) state.sessionStats = {
          correct: saved.sessionStats.correct | 0,
          total: saved.sessionStats.total | 0,
        };
      }
    } catch (e) { /* повреждённое хранилище — стартуем с чистого состояния */ }
    return state;
  }

  var state = loadState();
  var subscribers = [];

  function subscribe(fn) { subscribers.push(fn); }
  function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} }
  function emit() { persist(); subscribers.forEach(function (fn) { fn(); }); }

  // getters
  function masteryOf(id) { return state.radicals[id] ? state.radicals[id].mastery : 0; }
  function categoryProgress(catId) {
    var inCat = RADICALS.filter(function (r) { return r.category === catId; });
    var total = inCat.length * 3;
    if (!total) return 0;
    var earned = inCat.reduce(function (s, r) { return s + masteryOf(r.id); }, 0);
    return Math.round((earned / total) * 100);
  }
  function overallProgress() {
    var total = RADICALS.length * 3;
    var earned = RADICALS.reduce(function (s, r) { return s + masteryOf(r.id); }, 0);
    return Math.round((earned / total) * 100);
  }
  function knownCount() { return RADICALS.filter(function (r) { return masteryOf(r.id) >= 3; }).length; }
  function dueForReview() {
    var now = Date.now();
    var intervals = [0, 60000, 300000, 86400000]; // 0, 1мин, 5мин, 1день
    return RADICALS.filter(function (r) {
      var info = state.radicals[r.id];
      if (!info || !info.lastSeen) return true;
      var iv = intervals[info.mastery] != null ? intervals[info.mastery] : 0;
      return (now - info.lastSeen) >= iv;
    });
  }
  // actions
  function markReviewed(id) {
    var i = state.radicals[id]; if (!i) return;
    i.lastSeen = Date.now(); i.seenCount++; emit();
  }
  function markQuizAnswer(id, correct) {
    var i = state.radicals[id]; if (!i) return;
    if (correct) { i.mastery = Math.min(3, i.mastery + 1); state.sessionStats.correct++; }
    else { i.mastery = Math.max(0, i.mastery - 1); }
    i.lastSeen = Date.now(); i.seenCount++; state.sessionStats.total++; emit();
  }
  function updateStreak() {
    var today = new Date().toDateString();
    if (state.lastStudyDate === today) return;
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    state.streak = state.lastStudyDate === yesterday ? state.streak + 1 : 1;
    state.lastStudyDate = today; emit();
  }
  function resetSession() { state.sessionStats = { correct: 0, total: 0 }; emit(); }
  function resetAll() { state = freshState(); emit(); }

  // Публичный стор — пригодится сессиям в фазе 2.
  window.RIQ = {
    state: function () { return state; },
    subscribe: subscribe, masteryOf: masteryOf, categoryProgress: categoryProgress,
    overallProgress: overallProgress, knownCount: knownCount, dueForReview: dueForReview,
    markReviewed: markReviewed, markQuizAnswer: markQuizAnswer, updateStreak: updateStreak,
    resetSession: resetSession, resetAll: resetAll,
  };

  // ── TOAST (временная заглушка для действий фазы 2) ──────────────
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  // ── RENDER: stats (hero + nav) ─────────────────────────────────
  function renderStats() {
    $('stat-known').textContent = knownCount();
    $('stat-streak').textContent = state.streak;
    $('stat-due').textContent = dueForReview().length;
    $('stat-mastered').textContent = overallProgress();
    $('nav-streak').textContent = 'Streak ' + state.streak;
    $('nav-pct').textContent = overallProgress() + '%';
  }

  // ── RENDER: category rows ──────────────────────────────────────
  function renderCategories() {
    var host = $('cat-list');
    host.innerHTML = CAT_LIST.map(function (cat, i) {
      var count = RADICALS.filter(function (r) { return r.category === cat.id; }).length;
      var prog = categoryProgress(cat.id);
      var num = String(i + 1).length < 2 ? '0' + (i + 1) : String(i + 1);
      return '' +
        '<div class="cat-row">' +
          '<span class="cat-row__num mono">' + num + '</span>' +
          '<span class="cat-row__glyph glyph">' + (CAT_GLYPH[cat.id] || '字') + '</span>' +
          '<div class="cat-row__meta">' +
            '<h3 class="cat-row__name">' + cat.label + '</h3>' +
            '<span class="cat-row__count mono">' + count + ' radicals · ' + prog + '%</span>' +
            '<div class="cat-row__bar"><div class="cat-row__bar-fill" style="width:' + prog + '%"></div></div>' +
          '</div>' +
          '<div class="cat-row__actions">' +
            '<button class="cat-row__link" type="button" data-action="study" data-cat="' + cat.id + '">Study →</button>' +
            '<button class="cat-row__link" type="button" data-action="quiz" data-cat="' + cat.id + '">Quiz →</button>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  // ── RENDER: mastery heatmap ────────────────────────────────────
  function renderHeatmap() {
    var host = $('mmap-grid');
    host.innerHTML = RADICALS.map(function (r) {
      var m = masteryOf(r.id);
      var title = r.glyph + ' · ' + r.pinyin + ' — ' + r.meaning;
      return '<div class="mmap__cell glyph mmap__cell--m' + m + '" title="' + title + '">' + r.glyph + '</div>';
    }).join('');
  }

  // ── CATALOG (sec 04) ───────────────────────────────────────────
  var catFilters = [{ id: 'all', label: 'All categories' }].concat(CAT_LIST);
  var masteryFilters = [
    { id: 'all', label: 'All' },
    { id: 'unlearned', label: 'New' },
    { id: 'learning', label: 'Learning' },
    { id: 'mastered', label: 'Mastered' },
  ];
  var selectedCat = 'all', selectedMastery = 'all', searchTerm = '';

  // Снять тоновые диакритики: "ren" находит "rén", "shi" — "shǐ".
  function normalizePinyin(str) {
    return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  function filteredRadicals() {
    var q = normalizePinyin(searchTerm);
    return RADICALS.filter(function (r) {
      if (selectedCat !== 'all' && r.category !== selectedCat) return false;
      var m = masteryOf(r.id);
      if (selectedMastery === 'unlearned' && m !== 0) return false;
      if (selectedMastery === 'learning' && (m === 0 || m === 3)) return false;
      if (selectedMastery === 'mastered' && m < 3) return false;
      if (searchTerm) {
        return r.glyph.indexOf(searchTerm) !== -1 ||
               normalizePinyin(r.pinyin).indexOf(q) !== -1 ||
               r.meaning.toLowerCase().indexOf(q) !== -1;
      }
      return true;
    });
  }
  function renderCatalog() {
    var list = filteredRadicals();
    $('browse-count').textContent = list.length;
    $('rad-grid').innerHTML = list.map(function (r) {
      return '' +
        '<div class="radical-tile" data-id="' + r.id + '">' +
          (r.alt ? '<div class="radical-tile__alt glyph">' + r.alt + '</div>' : '') +
          '<div class="radical-tile__glyph glyph">' + r.glyph + '</div>' +
          '<div class="radical-tile__pinyin mono">' + r.pinyin + '</div>' +
          '<div class="radical-tile__meaning">' + r.meaning + '</div>' +
        '</div>';
    }).join('');
    $('browse-empty').hidden = list.length > 0;
  }

  function buildCatalogControls() {
    $('filter-cat').innerHTML = catFilters.map(function (o) {
      return '<option value="' + o.id + '">' + o.label + '</option>';
    }).join('');
    $('filter-mastery-dd').innerHTML = masteryFilters.map(function (m) {
      return '<option value="' + m.id + '">' + m.label + '</option>';
    }).join('');
    $('mastery-chips').innerHTML = masteryFilters.map(function (m) {
      return '<button class="filter-chip filter-mastery-chips" type="button" data-mastery="' + m.id + '">' + m.label + '</button>';
    }).join('');
    syncMasteryChips();
  }
  function syncMasteryChips() {
    var chips = $('mastery-chips').querySelectorAll('.filter-chip');
    Array.prototype.forEach.call(chips, function (c) {
      c.classList.toggle('filter-chip--active', c.getAttribute('data-mastery') === selectedMastery);
    });
    $('filter-mastery-dd').value = selectedMastery;
  }

  // ── DETAIL MODAL ───────────────────────────────────────────────
  function openModal(r) {
    $('modal-glyph').textContent = r.glyph;
    var alt = $('modal-alt');
    if (r.alt) { $('modal-alt-glyph').textContent = r.alt; alt.hidden = false; }
    else { alt.hidden = true; }
    $('modal-image').textContent = r.image;
    $('modal-pinyin').textContent = r.pinyin;
    $('modal-meaning').textContent = r.meaning;
    $('modal-logic').textContent = r.logic;
    $('modal-cat').textContent = CATEGORIES[r.category].label;
    $('modal').hidden = false;
  }
  function closeModal() { $('modal').hidden = true; }

  // ── TRY CARD (sec 01) ──────────────────────────────────────────
  var tryCard = { el: null, glyphF: null, glyphB: null, image: null, pinyin: null, meaning: null, current: null, flipped: false, busy: false };
  function pickCard(exclude) {
    var r = exclude;
    while (!r || r === exclude) r = RADICALS[Math.floor(Math.random() * RADICALS.length)];
    return r;
  }
  function paintFront(r) {
    tryCard.glyphF.textContent = r.glyph;
  }
  function paintBack(r) {
    tryCard.glyphB.textContent = r.glyph;
    tryCard.image.textContent = r.image;
    tryCard.pinyin.textContent = r.pinyin;
    tryCard.meaning.textContent = r.meaning;
  }
  function paintCard(r) { paintFront(r); paintBack(r); }
  // Клик по карточке — единственное управление:
  //   закрытая → раскрыть значение (= «просмотрено»);
  //   открытая → закрыть и подставить новый случайный иероглиф.
  function onTryClick() {
    if (tryCard.busy) return; // игнорируем клики во время смены иероглифа
    if (!tryCard.flipped) {
      markReviewed(tryCard.current.id); // раскрытие = «просмотрено»
      tryCard.flipped = true;
      tryCard.el.classList.add('flipped');
    } else {
      tryCard.busy = true;
      // Новый иероглиф выбираем сразу по клику. Лицо карточки сейчас скрыто
      // (к нам повёрнут ответ), поэтому обновляем его немедленно — когда
      // оборот довернёт фронт к зрителю, там уже новый знак.
      tryCard.current = pickCard(tryCard.current);
      paintFront(tryCard.current);
      tryCard.flipped = false;
      tryCard.el.classList.remove('flipped');
      // Изнанку (ответ) перерисовываем на «ребре» оборота (.55s / 2 ≈ 275ms),
      // когда она уже скрыта, чтобы не мелькнул старый ответ.
      setTimeout(function () {
        paintBack(tryCard.current);
        tryCard.busy = false;
      }, 275);
    }
  }
  function initTryCard() {
    tryCard.el = $('try-card');
    tryCard.glyphF = $('try-glyph');
    tryCard.glyphB = $('try-glyph-back');
    tryCard.image = $('try-image');
    tryCard.pinyin = $('try-pinyin');
    tryCard.meaning = $('try-meaning');
    tryCard.current = pickCard(null);
    paintCard(tryCard.current);
    tryCard.el.addEventListener('click', onTryClick);
  }

  // ── SESSIONS + METHOD PANEL (фаза 2) ───────────────────────────
  var sesOverlay, sesInner, mpOverlay, mpPanel;
  var sesActive = false, mpActive = false;

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  // И сессии, и панель метода блокируют прокрутку страницы — снимаем только когда оба закрыты.
  function updateScrollLock() { document.body.style.overflow = (sesActive || mpActive) ? 'hidden' : ''; }

  function showSession() {
    sesActive = true;
    sesOverlay.classList.add('is-open');
    sesOverlay.setAttribute('aria-hidden', 'false');
    sesOverlay.scrollTop = 0;
    updateScrollLock();
  }
  function closeSession() {
    sesActive = false;
    sesOverlay.classList.remove('is-open');
    sesOverlay.setAttribute('aria-hidden', 'true');
    sesInner.innerHTML = '';
    updateScrollLock();
  }
  function switchSession(mode, catId) {
    sesInner.innerHTML = '';
    if (mode === 'quiz') runQuiz(catId); else runStudy(catId);
    sesOverlay.scrollTop = 0;
  }
  function openStudy(catId) { runStudy(catId); showSession(); }
  function openQuiz(catId)  { runQuiz(catId);  showSession(); }

  // — STUDY: перетасованная колода, флип, advance = markReviewed + updateStreak —
  function runStudy(catId) {
    var cat = CATEGORIES[catId];
    var deck = shuffle(DATA.getByCategory(catId));
    var idx = 0, flipped = false, done = false, transitioning = false;

    sesInner.innerHTML =
      '<div class="session study">' +
        '<div class="study-header">' +
          '<button class="btn btn--ghost btn--sm" data-close>✕ Close</button>' +
          '<div class="study-header__info">' +
            '<span class="study-header__cat mono">' + cat.label + '</span>' +
            '<span class="study-header__progress mono" data-progress></span>' +
          '</div>' +
        '</div>' +
        '<div class="study-bar"><div class="study-bar__fill" data-bar></div></div>' +
        '<div class="card-area" data-area>' +
          '<div class="flashcard" data-card>' +
            '<div class="flashcard__face flashcard__front">' +
              '<div class="fc-glyph glyph" data-fg></div>' +
              '<div class="fc-alt-corner glyph" data-fa></div>' +
              '<p class="fc-hint mono">Tap to reveal →</p>' +
            '</div>' +
            '<div class="flashcard__face flashcard__back">' +
              '<div class="fc-glyph fc-glyph--sm glyph" data-bg></div>' +
              '<div class="fc-alt-corner fc-alt-corner--gold glyph" data-ba></div>' +
              '<div class="fc-image" data-bi></div>' +
              '<div class="fc-pinyin" data-bp></div>' +
              '<div class="fc-meaning" data-bm></div>' +
              '<div class="fc-logic" data-bl></div>' +
            '</div>' +
          '</div>' +
          '<p class="card-area__tip mono" data-tip>Click card to reveal</p>' +
        '</div>' +
        '<div class="next-bar" data-nextbar hidden><button class="btn btn--primary next-btn" data-next></button></div>' +
        '<button class="why-chip mono" data-why="03">Why recall first? · 03 →</button>' +
      '</div>';

    var q = function (s) { return sesInner.querySelector(s); };
    var card = q('[data-card]'), area = q('[data-area]'), nextBar = q('[data-nextbar]'),
        nextBtn = q('[data-next]'), tip = q('[data-tip]'), bar = q('[data-bar]'), progress = q('[data-progress]');

    function paint() {
      var c = deck[idx];
      q('[data-fg]').textContent = c.glyph;
      var fa = q('[data-fa]'); fa.textContent = c.alt || ''; fa.style.display = c.alt ? '' : 'none';
      q('[data-bg]').textContent = c.glyph;
      var ba = q('[data-ba]'); ba.textContent = c.alt || ''; ba.style.display = c.alt ? '' : 'none';
      q('[data-bi]').textContent = c.image;
      q('[data-bp]').textContent = c.pinyin;
      q('[data-bm]').textContent = c.meaning;
      q('[data-bl]').textContent = c.logic;
      progress.textContent = pad2(idx + 1) + ' / ' + deck.length;
      bar.style.width = ((idx + 1) / deck.length * 100) + '%';
      nextBtn.textContent = idx < deck.length - 1 ? 'Next card →' : 'Finish';
    }
    function setFlipped(f) {
      flipped = f;
      card.classList.toggle('flipped', f);
      tip.textContent = f ? 'Take a moment, then move on' : 'Click card to reveal';
      nextBar.hidden = !f;
    }
    function flip() { if (transitioning || done) return; setFlipped(!flipped); }
    function advance() {
      if (transitioning) return;
      markReviewed(deck[idx].id); updateStreak();
      setFlipped(false); transitioning = true;
      // repaint mid-rotation (card edge-on ~275ms) so the swap isn't visible
      setTimeout(function () {
        if (idx < deck.length - 1) { idx++; paint(); transitioning = false; }
        else showDone();
      }, 275);
    }
    function showDone() {
      done = true; transitioning = false;
      area.style.display = 'none'; nextBar.hidden = true;
      var dc = document.createElement('div');
      dc.className = 'done-card';
      dc.innerHTML =
        '<div class="done-card__seal seal">完</div>' +
        '<h2>Session complete</h2>' +
        '<p>You reviewed <strong>' + deck.length + '</strong> radicals.</p>' +
        '<div class="done-card__actions">' +
          '<button class="btn btn--primary" data-restart>Study Again</button>' +
          '<button class="btn" data-switch>Take Quiz</button>' +
          '<button class="btn btn--ghost" data-close>Back to page</button>' +
        '</div>';
      area.parentNode.insertBefore(dc, area);
      dc.querySelector('[data-restart]').addEventListener('click', restart);
      dc.querySelector('[data-switch]').addEventListener('click', function () { switchSession('quiz', catId); });
      dc.querySelector('[data-close]').addEventListener('click', closeSession);
    }
    function restart() {
      var dc = sesInner.querySelector('.done-card'); if (dc) dc.remove();
      deck = shuffle(deck); idx = 0; done = false; transitioning = false;
      area.style.display = ''; setFlipped(false); paint();
    }

    area.addEventListener('click', flip);
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); advance(); });
    q('[data-close]').addEventListener('click', closeSession);
    q('[data-why]').addEventListener('click', function () { openMethod('03'); });

    paint(); setFlipped(false);
  }

  // — QUIZ: MCQ (1 верный + 3 дистрактора), answer = markQuizAnswer + updateStreak —
  function runQuiz(catId) {
    var cat = CATEGORIES[catId];
    var deck = shuffle(DATA.getByCategory(catId));
    var idx = 0, done = false, answered = false, correct = 0, total = 0, selected = null;

    sesInner.innerHTML =
      '<div class="session quiz">' +
        '<div class="quiz-header">' +
          '<button class="btn btn--ghost btn--sm" data-close>✕ Close</button>' +
          '<div class="quiz-header__info">' +
            '<span class="quiz-header__cat mono">' + cat.label + '</span>' +
            '<span class="quiz-header__score mono" data-score></span>' +
          '</div>' +
        '</div>' +
        '<div class="study-bar"><div class="study-bar__fill" data-bar></div></div>' +
        '<div class="quiz-arena" data-arena></div>' +
      '</div>';

    var q = function (s) { return sesInner.querySelector(s); };
    var arena = q('[data-arena]'), score = q('[data-score]'), bar = q('[data-bar]');
    q('[data-close]').addEventListener('click', closeSession);

    function updateHud() { score.textContent = correct + ' / ' + total; bar.style.width = (total / deck.length * 100) + '%'; }
    function renderQuestion() {
      var cur = deck[idx];
      var distractors = shuffle(RADICALS.filter(function (r) { return r.id !== cur.id; })).slice(0, 3);
      var opts = shuffle([cur].concat(distractors));
      answered = false; selected = null;
      updateHud();
      arena.innerHTML =
        '<div class="quiz-question"><div class="quiz-glyph glyph">' + cur.glyph + '</div><p class="quiz-prompt mono">What does this radical mean?</p></div>' +
        '<div class="quiz-options">' +
          opts.map(function (o) {
            return '<button class="quiz-option" data-opt="' + o.id + '"><span class="quiz-option__meaning">' + o.meaning + '</span><span class="quiz-option__pinyin mono">' + o.pinyin + '</span></button>';
          }).join('') +
        '</div>' +
        '<div data-feedback></div>' +
        '<button class="why-chip mono" data-why="04">How mastery is earned · 04 →</button>';
      var byId = {}; opts.forEach(function (o) { byId[o.id] = o; });
      Array.prototype.forEach.call(arena.querySelectorAll('[data-opt]'), function (b) {
        b.addEventListener('click', function () { onAnswer(byId[b.getAttribute('data-opt')], cur); });
      });
      arena.querySelector('[data-why]').addEventListener('click', function () { openMethod('04'); });
    }
    function onAnswer(opt, cur) {
      if (answered) return;
      answered = true; selected = opt;
      var isCorrect = opt.id === cur.id;
      markQuizAnswer(cur.id, isCorrect); updateStreak();
      total++; if (isCorrect) correct++;
      updateHud();
      Array.prototype.forEach.call(arena.querySelectorAll('[data-opt]'), function (b) {
        b.disabled = true;
        var id = b.getAttribute('data-opt');
        if (id === cur.id) b.classList.add('quiz-option--correct');
        else if (id === selected.id) b.classList.add('quiz-option--wrong');
        else b.classList.add('quiz-option--dim');
      });
      var fb = arena.querySelector('[data-feedback]');
      fb.className = 'quiz-feedback ' + (isCorrect ? 'quiz-feedback--ok' : 'quiz-feedback--err');
      fb.innerHTML =
        '<span class="quiz-feedback__img">' + cur.image + '</span>' +
        '<strong>' + (isCorrect ? 'Correct' : 'Wrong') + '</strong> ' +
        (isCorrect ? '— ' + cur.meaning : '— it was: ' + cur.meaning + ' (' + cur.pinyin + ')') +
        '<button class="btn btn--sm" data-next style="margin-left:auto">' + (total < deck.length ? 'Next →' : 'Finish') + '</button>';
      fb.querySelector('[data-next]').addEventListener('click', next);
    }
    function next() { if (idx < deck.length - 1) { idx++; renderQuestion(); } else showDone(); }
    function showDone() {
      done = true;
      var pct = correct / deck.length;
      var seal = pct === 1 ? '滿' : pct >= 0.7 ? '好' : pct >= 0.4 ? '學' : '再';
      var title = pct === 1 ? 'Perfect score!' : pct >= 0.7 ? 'Great work!' : pct >= 0.4 ? 'Keep studying!' : 'Need more practice';
      arena.innerHTML =
        '<div class="done-card">' +
          '<div class="done-card__seal seal">' + seal + '</div>' +
          '<h2>' + title + '</h2>' +
          '<p>You scored <strong>' + correct + ' / ' + deck.length + '</strong> (' + Math.round(correct / deck.length * 100) + '%)</p>' +
          '<div class="done-card__actions">' +
            '<button class="btn btn--primary" data-restart>Play Again</button>' +
            '<button class="btn" data-switch>Review Cards</button>' +
            '<button class="btn btn--ghost" data-close>Back to page</button>' +
          '</div>' +
        '</div>';
      arena.querySelector('[data-restart]').addEventListener('click', restart);
      arena.querySelector('[data-switch]').addEventListener('click', function () { switchSession('study', catId); });
      arena.querySelector('[data-close]').addEventListener('click', closeSession);
    }
    function restart() { deck = shuffle(deck); idx = 0; done = false; answered = false; selected = null; correct = 0; total = 0; renderQuestion(); }

    renderQuestion();
  }

  // — METHOD PANEL: slide-over, deep-link scroll + подсветка принципа —
  function openMethod(target) {
    mpActive = true;
    Array.prototype.forEach.call(mpPanel.querySelectorAll('.mp-principle'), function (a) { a.classList.remove('mp-principle--active'); });
    mpOverlay.classList.add('is-open');
    mpOverlay.setAttribute('aria-hidden', 'false');
    updateScrollLock();
    // Панель не display:none (visibility/opacity), раскладка есть сразу — можно синхронно.
    var t = target ? mpPanel.querySelector('#mp-' + target) : null;
    if (t) {
      t.classList.add('mp-principle--active');
      t.scrollIntoView({ block: 'start' });
    } else {
      mpPanel.scrollTop = 0;
    }
  }
  function closeMethod() {
    mpActive = false;
    mpOverlay.classList.remove('is-open');
    mpOverlay.setAttribute('aria-hidden', 'true');
    updateScrollLock();
  }

  // ── EVENTS ─────────────────────────────────────────────────────
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function bindEvents() {
    // nav
    $('nav-brand').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.querySelectorAll('[data-scroll]').forEach(function (b) {
      b.addEventListener('click', function () { scrollToId(b.getAttribute('data-scroll')); });
    });
    document.querySelectorAll('[data-method]').forEach(function (b) {
      b.addEventListener('click', function () { openMethod(b.getAttribute('data-method') || ''); });
    });

    // category study/quiz (делегирование)
    $('cat-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]'); if (!btn) return;
      var cat = btn.getAttribute('data-cat');
      if (btn.getAttribute('data-action') === 'study') openStudy(cat); else openQuiz(cat);
    });

    // catalog filters
    $('filter-cat').addEventListener('change', function (e) { selectedCat = e.target.value; renderCatalog(); });
    $('filter-mastery-dd').addEventListener('change', function (e) { selectedMastery = e.target.value; syncMasteryChips(); renderCatalog(); });
    $('mastery-chips').addEventListener('click', function (e) {
      var chip = e.target.closest('[data-mastery]'); if (!chip) return;
      selectedMastery = chip.getAttribute('data-mastery'); syncMasteryChips(); renderCatalog();
    });
    var searchInput = $('filter-search');
    searchInput.addEventListener('input', function (e) {
      searchTerm = e.target.value;
      $('filter-clear').hidden = !searchTerm;
      renderCatalog();
    });
    $('filter-clear').addEventListener('click', function () {
      searchTerm = ''; searchInput.value = ''; $('filter-clear').hidden = true; renderCatalog(); searchInput.focus();
    });

    // catalog tiles → modal (делегирование)
    $('rad-grid').addEventListener('click', function (e) {
      var tile = e.target.closest('[data-id]'); if (!tile) return;
      var r = DATA.getById(tile.getAttribute('data-id')); if (r) openModal(r);
    });
    $('modal-close').addEventListener('click', closeModal);
    $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) closeModal(); });

    // method panel: close on ✕ and on backdrop click
    $('mp-close').addEventListener('click', closeMethod);
    mpOverlay.addEventListener('click', function (e) { if (e.target === mpOverlay) closeMethod(); });

    // Escape closes the topmost layer: method panel → session → modal
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (mpActive) closeMethod();
      else if (sesActive) closeSession();
      else if (!$('modal').hidden) closeModal();
    });

    // reset
    $('reset-btn').addEventListener('click', function () {
      if (window.confirm('Reset all progress? This cannot be undone.')) { resetAll(); toast('Прогресс сброшен'); }
    });
  }

  // ── INIT ───────────────────────────────────────────────────────
  function init() {
    toastEl = $('toast');
    sesOverlay = $('ses-overlay'); sesInner = $('ses-inner');
    mpOverlay = $('mp-overlay');   mpPanel = $('mp-panel');
    $('foot-year').textContent = new Date().getFullYear();

    buildCatalogControls();
    initTryCard();
    bindEvents();

    // Первичный рендер всего, что зависит от стора.
    renderStats();
    renderCategories();
    renderHeatmap();
    renderCatalog();

    // Перерисовывать зависимое от прогресса при любом изменении стора.
    subscribe(function () {
      renderStats();
      renderCategories();
      renderHeatmap();
      renderCatalog();
      syncMasteryChips();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
