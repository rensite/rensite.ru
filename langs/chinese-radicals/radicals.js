/* RadicalIQ — датасет: 84 китайских ключа + 5 категорий.
   Порт 1:1 из исходного Vue-приложения (github.com/rensite/Learn-Chinese, src/data/radicals.js).
   `image` — эмодзи-якорь смысла (показывается в момент раскрытия карточки/квиза),
   `logic` — «системная» мнемоника. `meaning`/`logic`/`label` двуязычны: { en, ru }.
   Экспортируется как window.RIQ_DATA. */
(function () {
  'use strict';

  var CATEGORIES = {
    human:      { id: 'human',      label: { en: 'Human & Interaction',  ru: 'Человек и взаимодействие' }, emoji: '👤', color: '#f5a623' },
    nature:     { id: 'nature',     label: { en: 'Nature & Materials',   ru: 'Природа и материалы' },      emoji: '🌿', color: '#4caf7d' },
    structural: { id: 'structural', label: { en: 'Structural & Pathing', ru: 'Структура и пути' },          emoji: '🏗️', color: '#5b8dee' },
    tools:      { id: 'tools',      label: { en: 'Tools & Objects',      ru: 'Инструменты и предметы' },    emoji: '🔧', color: '#e07b54' },
    abstract:   { id: 'abstract',   label: { en: 'Abstract & Condition', ru: 'Абстракции и состояния' },    emoji: '📊', color: '#a78bfa' },
  };

  function m(en, ru) { return { en: en, ru: ru }; }

  var RADICALS = [
    // ── HUMAN & INTERACTION ──────────────────────────────────────
    { id:'ren',   glyph:'人', alt:'亻', pinyin:'rén',  meaning:m('Person','Человек'),        image:'🧑', logic:m('The primary operator or subject of the action.','Главный оператор или субъект действия.'),        category:'human' },
    { id:'nv',    glyph:'女', alt:'',   pinyin:'nǚ',   meaning:m('Woman','Женщина'),         image:'👩', logic:m('Relational roles or traditionally "feminine" traits.','Реляционные роли или традиционно «женские» черты.'), category:'human' },
    { id:'zi',    glyph:'子', alt:'',   pinyin:'zǐ',   meaning:m('Child','Ребёнок'),         image:'👶', logic:m('New growth, seeds, or the product of a process.','Новый рост, семена или продукт процесса.'),         category:'human' },
    { id:'kou',   glyph:'口', alt:'',   pinyin:'kǒu',  meaning:m('Mouth','Рот'),             image:'👄', logic:m('The I/O port for speech or food.','Порт ввода-вывода: речь или еда.'),                              category:'human' },
    { id:'xin',   glyph:'心', alt:'忄', pinyin:'xīn',  meaning:m('Heart','Сердце'),          image:'❤️', logic:m('The CPU; handles emotions and logic.','Процессор: обрабатывает эмоции и логику.'),                    category:'human' },
    { id:'shou',  glyph:'手', alt:'扌', pinyin:'shǒu', meaning:m('Hand','Рука'),             image:'✋', logic:m('The manual override; represents physical work.','Ручное управление: физическая работа.'),           category:'human' },
    { id:'mu_eye',glyph:'目', alt:'',   pinyin:'mù',   meaning:m('Eye','Глаз'),              image:'👁️', logic:m('The visual sensor; used for seeing or scanning.','Визуальный сенсор: смотреть или сканировать.'),     category:'human' },
    { id:'zu',    glyph:'足', alt:'⻊', pinyin:'zú',   meaning:m('Foot','Нога'),             image:'🦶', logic:m('The mobility module; handles walking or running.','Модуль движения: ходьба и бег.'),                  category:'human' },
    { id:'yan',   glyph:'言', alt:'讠', pinyin:'yán',  meaning:m('Speech','Речь'),           image:'💬', logic:m('The communication protocol; words and debate.','Протокол связи: слова и споры.'),                    category:'human' },
    { id:'li',    glyph:'力', alt:'',   pinyin:'lì',   meaning:m('Power','Сила'),            image:'💪', logic:m('The torque; represents physical effort or energy.','Крутящий момент: усилие или энергия.'),          category:'human' },
    { id:'shen',  glyph:'身', alt:'',   pinyin:'shēn', meaning:m('Body','Тело'),             image:'🧍', logic:m('The chassis; refers to the physical frame.','Корпус: физический каркас тела.'),                     category:'human' },
    { id:'fu',    glyph:'父', alt:'',   pinyin:'fù',   meaning:m('Father','Отец'),           image:'👨', logic:m('Authority or the "root" of a family tree.','Права root или корень семейного дерева.'),               category:'human' },
    { id:'er',    glyph:'耳', alt:'',   pinyin:'ěr',   meaning:m('Ear','Ухо'),               image:'👂', logic:m('The audio input sensor; listening or hearing.','Аудиовход: слушать и слышать.'),                     category:'human' },
    { id:'jian',  glyph:'见', alt:'',   pinyin:'jiàn', meaning:m('See','Видеть'),            image:'👀', logic:m('Visual perception or the act of meeting/encountering.','Визуальное восприятие или встреча.'),        category:'human' },
    { id:'lao',   glyph:'老', alt:'',   pinyin:'lǎo',  meaning:m('Old','Старый'),            image:'👴', logic:m('Seniority flag; age or experience ranking.','Флаг старшинства: возраст или опыт.'),                 category:'human' },
    { id:'mao',   glyph:'毛', alt:'',   pinyin:'máo',  meaning:m('Hair/Fur','Волосы/Шерсть'),image:'🪶', logic:m('Surface texture layer; feathers or fiber.','Слой текстуры поверхности: перья или волокно.'),        category:'human' },
    { id:'gu',    glyph:'骨', alt:'',   pinyin:'gǔ',   meaning:m('Bone','Кость'),            image:'🦴', logic:m('The internal load-bearing structural framework.','Внутренний несущий каркас.'),                     category:'human' },
    { id:'xue_b', glyph:'血', alt:'',   pinyin:'xuè',  meaning:m('Blood','Кровь'),           image:'🩸', logic:m('The vital circuit fluid; life-force resource.','Жидкость жизненного контура: ресурс жизни.'),        category:'human' },

    // ── NATURE & MATERIALS ───────────────────────────────────────
    { id:'shui',  glyph:'水', alt:'氵', pinyin:'shuǐ', meaning:m('Water','Вода'),            image:'💧', logic:m('Fluidity, cleaning, or hydraulic states.','Текучесть, очистка, гидравлика.'),                       category:'nature' },
    { id:'huo',   glyph:'火', alt:'灬', pinyin:'huǒ',  meaning:m('Fire','Огонь'),            image:'🔥', logic:m('The combustion engine; heat or rapid change.','Двигатель внутреннего сгорания: жар и резкие перемены.'), category:'nature' },
    { id:'mu',    glyph:'木', alt:'',   pinyin:'mù',   meaning:m('Wood','Дерево'),           image:'🪵', logic:m('The structural timber; raw material for building.','Строительный лес: сырьё для постройки.'),        category:'nature' },
    { id:'tu',    glyph:'土', alt:'',   pinyin:'tǔ',   meaning:m('Earth','Земля'),           image:'🟫', logic:m('The ground layer; soil, dust, or foundations.','Слой земли: почва, пыль, фундамент.'),             category:'nature' },
    { id:'ri',    glyph:'日', alt:'',   pinyin:'rì',   meaning:m('Sun','Солнце'),            image:'☀️', logic:m('The system clock; marks days, time, and brightness.','Системные часы: дни, время, яркость.'),        category:'nature' },
    { id:'yue',   glyph:'月', alt:'',   pinyin:'yuè',  meaning:m('Moon/Flesh','Луна/Плоть'), image:'🌙', logic:m('Night cycles or the organic material of bodies.','Ночные циклы или органика тела.'),               category:'nature' },
    { id:'jin',   glyph:'金', alt:'钅', pinyin:'jīn',  meaning:m('Metal','Металл'),          image:'🔩', logic:m('The hardware; tools, technology, and currency.','Железо: инструменты, техника, деньги.'),           category:'nature' },
    { id:'shi_s', glyph:'石', alt:'',   pinyin:'shí',  meaning:m('Stone','Камень'),          image:'🪨', logic:m('Hard-coded objects; minerals or heavy mass.','Захардкоженные объекты: минералы, тяжёлая масса.'),   category:'nature' },
    { id:'cao',   glyph:'艹', alt:'',   pinyin:'cǎo',  meaning:m('Grass','Трава'),           image:'🌿', logic:m('Organic software; plants, herbs, and medicine.','Органический софт: растения, травы, лекарства.'),   category:'nature' },
    { id:'yu_r',  glyph:'雨', alt:'',   pinyin:'yǔ',   meaning:m('Rain','Дождь'),            image:'🌧️', logic:m('Weather-state variables or atmospheric moisture.','Переменные погоды или влага в атмосфере.'),      category:'nature' },
    { id:'shan',  glyph:'山', alt:'',   pinyin:'shān', meaning:m('Mountain','Гора'),         image:'⛰️', logic:m('Large-scale geography or static obstacles.','Крупный рельеф или статичные препятствия.'),          category:'nature' },
    { id:'qi',    glyph:'气', alt:'',   pinyin:'qì',   meaning:m('Gas','Пар/Газ'),           image:'💨', logic:m('Invisible energy or the atmosphere (air/steam).','Невидимая энергия или атмосфера (воздух/пар).'),   category:'nature' },
    { id:'chong', glyph:'虫', alt:'',   pinyin:'chóng',meaning:m('Insect','Насекомое'),      image:'🐛', logic:m('Small organism processes; bugs or larvae.','Процессы мелких организмов: жучки и личинки.'),        category:'nature' },
    { id:'yu_f',  glyph:'鱼', alt:'',   pinyin:'yú',   meaning:m('Fish','Рыба'),             image:'🐟', logic:m('Aquatic organism module.','Модуль водных организмов.'),                                              category:'nature' },
    { id:'niao',  glyph:'鸟', alt:'',   pinyin:'niǎo', meaning:m('Bird','Птица'),            image:'🐦', logic:m('Aerial mobile entities; winged creatures.','Летающие сущности: крылатые создания.'),               category:'nature' },
    { id:'ma',    glyph:'马', alt:'',   pinyin:'mǎ',   meaning:m('Horse','Лошадь'),          image:'🐴', logic:m('Large-scale locomotion engine; speed and power.','Мощный двигатель передвижения: скорость и сила.'), category:'nature' },
    { id:'yang',  glyph:'羊', alt:'',   pinyin:'yáng', meaning:m('Sheep','Овца'),            image:'🐑', logic:m('Docile/domestic entity; also the root of "beauty" (美).','Кроткая/домашняя сущность; ещё и корень «красоты» (美).'), category:'nature' },
    { id:'yu_g',  glyph:'玉', alt:'王', pinyin:'yù',   meaning:m('Jade','Нефрит'),           image:'💎', logic:m('Precious material; gems and royal status.','Ценный материал: самоцветы и царский статус.'),        category:'nature' },
    { id:'pi',    glyph:'皮', alt:'',   pinyin:'pí',   meaning:m('Skin/Hide','Кожа/Шкура'),  image:'🧥', logic:m('The outer casing or raw material layer.','Внешний корпус или слой сырья.'),                       category:'nature' },

    // ── STRUCTURAL & PATHING ─────────────────────────────────────
    { id:'mian',  glyph:'宀', alt:'',   pinyin:'mián', meaning:m('Roof','Крыша'),            image:'🏠', logic:m('The enclosure; defines a protected indoor space.','Оболочка: защищённое внутреннее пространство.'),   category:'structural' },
    { id:'men',   glyph:'门', alt:'',   pinyin:'mén',  meaning:m('Door','Дверь'),            image:'🚪', logic:m('The gateway or the access point of a room.','Шлюз или точка входа в комнату.'),                    category:'structural' },
    { id:'chuo',  glyph:'辵', alt:'辶', pinyin:'chuò', meaning:m('Walk','Идти'),             image:'🚶', logic:m('The navigation path; movement from A to B.','Путь навигации: движение из A в B.'),                  category:'structural' },
    { id:'chi',   glyph:'彳', alt:'',   pinyin:'chì',  meaning:m('Step','Шаг'),              image:'👣', logic:m('A small movement or a sequence in a process.','Малое движение или шаг в процессе.'),               category:'structural' },
    { id:'guang', glyph:'广', alt:'',   pinyin:'guǎng',meaning:m('Shelter','Навес'),         image:'🏚️', logic:m('A lean-to or a large, open shed/factory.','Навес или большой открытый цех/фабрика.'),              category:'structural' },
    { id:'wei',   glyph:'囗', alt:'',   pinyin:'wéi',  meaning:m('Enclosure','Ограда'),      image:'📦', logic:m('The boundary; a container or a border.','Граница: контейнер или рамка.'),                          category:'structural' },
    { id:'chang', glyph:'厂', alt:'',   pinyin:'chǎng',meaning:m('Cliff/Yard','Обрыв/Двор'), image:'🏭', logic:m('A steep edge or an industrial workspace.','Крутой край или промышленный цех.'),                    category:'structural' },
    { id:'fu_l',  glyph:'阝', alt:'',   pinyin:'fù',   meaning:m('Mound','Холм'),            image:'🏔️', logic:m('Land-based geography (hills/slopes). Left-side form.','Рельеф суши (холмы/склоны). Левая форма.'),   category:'structural' },
    { id:'yi_r',  glyph:'阝', alt:'',   pinyin:'yì',   meaning:m('City','Город'),            image:'🏙️', logic:m('High-density population zones (towns). Right-side form.','Зоны плотного населения (города). Правая форма.'), category:'structural' },
    { id:'che',   glyph:'车', alt:'',   pinyin:'chē',  meaning:m('Vehicle','Повозка'),       image:'🚗', logic:m('Transport machinery or mechanical gears.','Транспортная техника или шестерни.'),                   category:'structural' },
    { id:'zou',   glyph:'走', alt:'',   pinyin:'zǒu',  meaning:m('Run','Бежать'),            image:'🏃', logic:m('High-speed mobility or leaving a state.','Быстрое движение или выход из состояния.'),               category:'structural' },
    { id:'fang',  glyph:'方', alt:'',   pinyin:'fāng', meaning:m('Square','Сторона'),        image:'🧭', logic:m('Directional orientation (North, South, East, West).','Ориентация по сторонам света (С, Ю, В, З).'),  category:'structural' },
    { id:'hu',    glyph:'户', alt:'',   pinyin:'hù',   meaning:m('Household','Двор'),         image:'🏡', logic:m('Single-door access unit; a home entry port.','Одностворчатая дверь: вход в дом.'),                 category:'structural' },
    { id:'xue_c', glyph:'穴', alt:'',   pinyin:'xué',  meaning:m('Cave/Hole','Пещера/Дыра'), image:'🕳️', logic:m('Underground or hollow enclosed space.','Подземное или полое замкнутое пространство.'),             category:'structural' },
    { id:'gong',  glyph:'工', alt:'',   pinyin:'gōng', meaning:m('Work','Работа'),           image:'🛠️', logic:m('The construction scaffold; the assembly layer.','Строительные леса: слой сборки.'),                 category:'structural' },
    { id:'zhou',  glyph:'舟', alt:'',   pinyin:'zhōu', meaning:m('Boat','Лодка'),            image:'🛶', logic:m('Water transport vessel; the nautical module.','Водный транспорт: морской модуль.'),                category:'structural' },
    { id:'xing',  glyph:'行', alt:'',   pinyin:'xíng', meaning:m('Road','Дорога'),           image:'🛣️', logic:m('The street or path network grid.','Сеть улиц и дорог.'),                                          category:'structural' },

    // ── TOOLS & OBJECTS ──────────────────────────────────────────
    { id:'dao',   glyph:'刀', alt:'刂', pinyin:'dāo',  meaning:m('Knife','Нож'),             image:'🔪', logic:m('The cutting tool; used for dividing or refining.','Режущий инструмент: делить или обтачивать.'),     category:'tools' },
    { id:'shi_f', glyph:'食', alt:'饣', pinyin:'shí',  meaning:m('Food','Еда'),              image:'🍚', logic:m('The fuel source for the human system.','Источник топлива для человека.'),                          category:'tools' },
    { id:'yi',    glyph:'衣', alt:'衤', pinyin:'yī',   meaning:m('Clothing','Одежда'),       image:'👕', logic:m('The external skin or aesthetic layer.','Внешняя оболочка или эстетический слой.'),                 category:'tools' },
    { id:'mi',    glyph:'糸', alt:'纟', pinyin:'mì',   meaning:m('Silk','Шёлк'),             image:'🧵', logic:m('The wiring; connectors, threads, and links.','Проводка: коннекторы, нити, связи.'),               category:'tools' },
    { id:'jin_c', glyph:'巾', alt:'',   pinyin:'jīn',  meaning:m('Cloth','Ткань'),           image:'🧣', logic:m('Soft materials; towels, banners, or covers.','Мягкие материалы: полотенца, флаги, чехлы.'),        category:'tools' },
    { id:'bei',   glyph:'贝', alt:'',   pinyin:'bèi',  meaning:m('Shell','Раковина'),        image:'🐚', logic:m('The transactional unit; money and value.','Единица транзакции: деньги и ценность.'),               category:'tools' },
    { id:'zhu',   glyph:'竹', alt:'⺮', pinyin:'zhú',  meaning:m('Bamboo','Бамбук'),         image:'🎋', logic:m('The versatile composite; used for writing or tools.','Универсальный композит: для письма и инструментов.'), category:'tools' },
    { id:'he',    glyph:'禾', alt:'',   pinyin:'hé',   meaning:m('Grain','Злак'),            image:'🌾', logic:m('The agricultural harvest; sustenance.','Сельский урожай: пропитание.'),                           category:'tools' },
    { id:'ge',    glyph:'戈', alt:'',   pinyin:'gē',   meaning:m('Spear','Копьё'),           image:'🗡️', logic:m('The defense system; weaponry and "Self" (我).','Система обороны: оружие и «я» (我).'),               category:'tools' },
    { id:'gong_b',glyph:'弓', alt:'',   pinyin:'gōng', meaning:m('Bow','Лук'),               image:'🏹', logic:m('Tension and release; used in stretching or arcs.','Натяжение и спуск: растяжение или дуги.'),        category:'tools' },
    { id:'shi_a', glyph:'矢', alt:'',   pinyin:'shǐ',  meaning:m('Arrow','Стрела'),          image:'➡️', logic:m('The projectile or pointer; a direction indicator.','Снаряд или указатель: индикатор направления.'),  category:'tools' },
    { id:'jin_a', glyph:'斤', alt:'',   pinyin:'jīn',  meaning:m('Axe','Топор'),             image:'🪓', logic:m('The chopping and measuring implement.','Орудие для рубки и меры.'),                                category:'tools' },
    { id:'min',   glyph:'皿', alt:'',   pinyin:'mǐn',  meaning:m('Dish','Блюдо'),            image:'🍽️', logic:m('The container or storage vessel.','Контейнер или сосуд для хранения.'),                          category:'tools' },
    { id:'jiao',  glyph:'角', alt:'',   pinyin:'jiǎo', meaning:m('Horn','Рог'),              image:'🎺', logic:m('Pointed instrument; corner or angle.','Острый инструмент; угол.'),                                category:'tools' },
    { id:'wa',    glyph:'瓦', alt:'',   pinyin:'wǎ',   meaning:m('Tile','Черепица'),         image:'🧱', logic:m('Ceramic or pottery material; the roofing unit.','Керамика: черепица для крыши.'),                  category:'tools' },
    { id:'ye',    glyph:'页', alt:'',   pinyin:'yè',   meaning:m('Page','Страница'),         image:'📄', logic:m('Document leaf; data sheet or printed output.','Лист документа: страница или распечатка.'),         category:'tools' },

    // ── ABSTRACT & CONDITION ─────────────────────────────────────
    { id:'ne',    glyph:'疒', alt:'',   pinyin:'nè',   meaning:m('Sickness','Болезнь'),      image:'🤒', logic:m('The "Error Code"; indicates a health or system failure.','«Код ошибки»: сбой здоровья или системы.'), category:'abstract' },
    { id:'quan',  glyph:'犬', alt:'犭', pinyin:'quǎn', meaning:m('Animal','Зверь'),          image:'🐕', logic:m('Non-human entities or instinctive behaviors.','Не-человеческие сущности или инстинкты.'),           category:'abstract' },
    { id:'da',    glyph:'大', alt:'',   pinyin:'dà',   meaning:m('Big','Большой'),           image:'🐘', logic:m('Scale expansion; an increase in size.','Увеличение масштаба: рост размера.'),                     category:'abstract' },
    { id:'xiao',  glyph:'小', alt:'',   pinyin:'xiǎo', meaning:m('Small','Маленький'),       image:'🐜', logic:m('Scale reduction; a decrease in size.','Уменьшение масштаба: спад размера.'),                      category:'abstract' },
    { id:'bai',   glyph:'白', alt:'',   pinyin:'bái',  meaning:m('White','Белый'),           image:'⚪', logic:m('Clarity, emptiness, or a default "null" state.','Ясность, пустота или дефолтный «null».'),         category:'abstract' },
    { id:'tian',  glyph:'田', alt:'',   pinyin:'tián', meaning:m('Field','Поле'),            image:'🟩', logic:m('Data grid or mapped-out territory.','Сетка данных или размеченная территория.'),                  category:'abstract' },
    { id:'you',   glyph:'又', alt:'',   pinyin:'yòu',  meaning:m('Again/Hand','Снова/Рука'), image:'🔁', logic:m('Repetition operator or the right hand.','Оператор повтора или правая рука.'),                     category:'abstract' },
    { id:'wen',   glyph:'文', alt:'',   pinyin:'wén',  meaning:m('Pattern','Узор'),          image:'✍️', logic:m('Cultural data layer; writing or civilization.','Культурный слой данных: письмо и цивилизация.'),    category:'abstract' },
    { id:'shi_d', glyph:'示', alt:'礻', pinyin:'shì',  meaning:m('Spirit','Дух'),            image:'🙏', logic:m('Divine signal display; ritual or reverence.','Дисплей божественного сигнала: ритуал и почитание.'), category:'abstract' },
    { id:'zhi',   glyph:'止', alt:'',   pinyin:'zhǐ',  meaning:m('Stop','Стоп'),             image:'🛑', logic:m('Halt or terminate command; a foot standing still.','Команда стоп: замершая нога.'),                category:'abstract' },
    { id:'fei',   glyph:'非', alt:'',   pinyin:'fēi',  meaning:m('Not/Wrong','Не/Нет'),      image:'❌', logic:m('The negation operator; Boolean false.','Оператор отрицания: булев false.'),                      category:'abstract' },
    { id:'ji',    glyph:'己', alt:'',   pinyin:'jǐ',   meaning:m('Self','Сам'),              image:'🪞', logic:m('First-person reference; the self-variable.','Ссылка от первого лица: переменная self.'),          category:'abstract' },
    { id:'hei',   glyph:'黑', alt:'',   pinyin:'hēi',  meaning:m('Black','Чёрный'),          image:'⚫', logic:m('Void or dark state; full opacity or total absence.','Тьма или пустота: полная непрозрачность или отсутствие.'), category:'abstract' },
    { id:'shi_p', glyph:'尸', alt:'',   pinyin:'shī',  meaning:m('Body/Prone','Тело/Лёжа'),  image:'🛌', logic:m('A horizontal body; the shell or prone structural form.','Горизонтальное тело: оболочка или лежачая форма.'), category:'abstract' },
  ];

  function getByCategory(catId) { return RADICALS.filter(function (r) { return r.category === catId; }); }
  function getById(id) { return RADICALS.find(function (r) { return r.id === id; }); }

  window.RIQ_DATA = { CATEGORIES: CATEGORIES, RADICALS: RADICALS, getByCategory: getByCategory, getById: getById };
})();
