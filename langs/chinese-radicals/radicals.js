/* RadicalIQ — датасет: 84 китайских ключа + 5 категорий.
   Порт 1:1 из исходного Vue-приложения (github.com/rensite/Learn-Chinese, src/data/radicals.js).
   `image` — эмодзи-якорь смысла (показывается в момент раскрытия карточки/квиза),
   `logic` — «системная» мнемоника. Экспортируется как window.RIQ_DATA. */
(function () {
  'use strict';

  var CATEGORIES = {
    human:      { id: 'human',      label: 'Human & Interaction',  emoji: '👤', color: '#f5a623' },
    nature:     { id: 'nature',     label: 'Nature & Materials',   emoji: '🌿', color: '#4caf7d' },
    structural: { id: 'structural', label: 'Structural & Pathing', emoji: '🏗️', color: '#5b8dee' },
    tools:      { id: 'tools',      label: 'Tools & Objects',      emoji: '🔧', color: '#e07b54' },
    abstract:   { id: 'abstract',   label: 'Abstract & Condition', emoji: '📊', color: '#a78bfa' },
  };

  var RADICALS = [
    // ── HUMAN & INTERACTION ──────────────────────────────────────
    { id:'ren',   glyph:'人', alt:'亻', pinyin:'rén',  meaning:'Person',    image:'🧑', logic:'The primary operator or subject of the action.',            category:'human' },
    { id:'nv',    glyph:'女', alt:'',   pinyin:'nǚ',   meaning:'Woman',     image:'👩', logic:'Relational roles or traditionally "feminine" traits.',      category:'human' },
    { id:'zi',    glyph:'子', alt:'',   pinyin:'zǐ',   meaning:'Child',     image:'👶', logic:'New growth, seeds, or the product of a process.',           category:'human' },
    { id:'kou',   glyph:'口', alt:'',   pinyin:'kǒu',  meaning:'Mouth',     image:'👄', logic:'The I/O port for speech or food.',                          category:'human' },
    { id:'xin',   glyph:'心', alt:'忄', pinyin:'xīn',  meaning:'Heart',     image:'❤️', logic:'The CPU; handles emotions and logic.',                      category:'human' },
    { id:'shou',  glyph:'手', alt:'扌', pinyin:'shǒu', meaning:'Hand',      image:'✋', logic:'The manual override; represents physical work.',            category:'human' },
    { id:'mu_eye',glyph:'目', alt:'',   pinyin:'mù',   meaning:'Eye',       image:'👁️', logic:'The visual sensor; used for seeing or scanning.',           category:'human' },
    { id:'zu',    glyph:'足', alt:'⻊', pinyin:'zú',   meaning:'Foot',      image:'🦶', logic:'The mobility module; handles walking or running.',          category:'human' },
    { id:'yan',   glyph:'言', alt:'讠', pinyin:'yán',  meaning:'Speech',    image:'💬', logic:'The communication protocol; words and debate.',             category:'human' },
    { id:'li',    glyph:'力', alt:'',   pinyin:'lì',   meaning:'Power',     image:'💪', logic:'The torque; represents physical effort or energy.',         category:'human' },
    { id:'shen',  glyph:'身', alt:'',   pinyin:'shēn', meaning:'Body',      image:'🧍', logic:'The chassis; refers to the physical frame.',                category:'human' },
    { id:'fu',    glyph:'父', alt:'',   pinyin:'fù',   meaning:'Father',    image:'👨', logic:'Authority or the "root" of a family tree.',                 category:'human' },
    { id:'er',    glyph:'耳', alt:'',   pinyin:'ěr',   meaning:'Ear',       image:'👂', logic:'The audio input sensor; listening or hearing.',             category:'human' },
    { id:'jian',  glyph:'见', alt:'',   pinyin:'jiàn', meaning:'See',       image:'👀', logic:'Visual perception or the act of meeting/encountering.',     category:'human' },
    { id:'lao',   glyph:'老', alt:'',   pinyin:'lǎo',  meaning:'Old',       image:'👴', logic:'Seniority flag; age or experience ranking.',                category:'human' },
    { id:'mao',   glyph:'毛', alt:'',   pinyin:'máo',  meaning:'Hair/Fur',  image:'🪶', logic:'Surface texture layer; feathers or fiber.',                 category:'human' },
    { id:'gu',    glyph:'骨', alt:'',   pinyin:'gǔ',   meaning:'Bone',      image:'🦴', logic:'The internal load-bearing structural framework.',           category:'human' },
    { id:'xue_b', glyph:'血', alt:'',   pinyin:'xuè',  meaning:'Blood',     image:'🩸', logic:'The vital circuit fluid; life-force resource.',             category:'human' },

    // ── NATURE & MATERIALS ───────────────────────────────────────
    { id:'shui',  glyph:'水', alt:'氵', pinyin:'shuǐ', meaning:'Water',     image:'💧', logic:'Fluidity, cleaning, or hydraulic states.',                  category:'nature' },
    { id:'huo',   glyph:'火', alt:'灬', pinyin:'huǒ',  meaning:'Fire',      image:'🔥', logic:'The combustion engine; heat or rapid change.',              category:'nature' },
    { id:'mu',    glyph:'木', alt:'',   pinyin:'mù',   meaning:'Wood',      image:'🪵', logic:'The structural timber; raw material for building.',         category:'nature' },
    { id:'tu',    glyph:'土', alt:'',   pinyin:'tǔ',   meaning:'Earth',     image:'🟫', logic:'The ground layer; soil, dust, or foundations.',             category:'nature' },
    { id:'ri',    glyph:'日', alt:'',   pinyin:'rì',   meaning:'Sun',       image:'☀️', logic:'The system clock; marks days, time, and brightness.',       category:'nature' },
    { id:'yue',   glyph:'月', alt:'',   pinyin:'yuè',  meaning:'Moon/Flesh',image:'🌙', logic:'Night cycles or the organic material of bodies.',           category:'nature' },
    { id:'jin',   glyph:'金', alt:'钅', pinyin:'jīn',  meaning:'Metal',     image:'🔩', logic:'The hardware; tools, technology, and currency.',            category:'nature' },
    { id:'shi_s', glyph:'石', alt:'',   pinyin:'shí',  meaning:'Stone',     image:'🪨', logic:'Hard-coded objects; minerals or heavy mass.',               category:'nature' },
    { id:'cao',   glyph:'艹', alt:'',   pinyin:'cǎo',  meaning:'Grass',     image:'🌿', logic:'Organic software; plants, herbs, and medicine.',            category:'nature' },
    { id:'yu_r',  glyph:'雨', alt:'',   pinyin:'yǔ',   meaning:'Rain',      image:'🌧️', logic:'Weather-state variables or atmospheric moisture.',          category:'nature' },
    { id:'shan',  glyph:'山', alt:'',   pinyin:'shān', meaning:'Mountain',  image:'⛰️', logic:'Large-scale geography or static obstacles.',                category:'nature' },
    { id:'qi',    glyph:'气', alt:'',   pinyin:'qì',   meaning:'Gas',       image:'💨', logic:'Invisible energy or the atmosphere (air/steam).',           category:'nature' },
    { id:'chong', glyph:'虫', alt:'',   pinyin:'chóng',meaning:'Insect',    image:'🐛', logic:'Small organism processes; bugs or larvae.',                 category:'nature' },
    { id:'yu_f',  glyph:'鱼', alt:'',   pinyin:'yú',   meaning:'Fish',      image:'🐟', logic:'Aquatic organism module.',                                  category:'nature' },
    { id:'niao',  glyph:'鸟', alt:'',   pinyin:'niǎo', meaning:'Bird',      image:'🐦', logic:'Aerial mobile entities; winged creatures.',                 category:'nature' },
    { id:'ma',    glyph:'马', alt:'',   pinyin:'mǎ',   meaning:'Horse',     image:'🐴', logic:'Large-scale locomotion engine; speed and power.',           category:'nature' },
    { id:'yang',  glyph:'羊', alt:'',   pinyin:'yáng', meaning:'Sheep',     image:'🐑', logic:'Docile/domestic entity; also the root of "beauty" (美).',   category:'nature' },
    { id:'yu_g',  glyph:'玉', alt:'王', pinyin:'yù',   meaning:'Jade',      image:'💎', logic:'Precious material; gems and royal status.',                 category:'nature' },
    { id:'pi',    glyph:'皮', alt:'',   pinyin:'pí',   meaning:'Skin/Hide', image:'🧥', logic:'The outer casing or raw material layer.',                   category:'nature' },

    // ── STRUCTURAL & PATHING ─────────────────────────────────────
    { id:'mian',  glyph:'宀', alt:'',   pinyin:'mián', meaning:'Roof',      image:'🏠', logic:'The enclosure; defines a protected indoor space.',          category:'structural' },
    { id:'men',   glyph:'门', alt:'',   pinyin:'mén',  meaning:'Door',      image:'🚪', logic:'The gateway or the access point of a room.',                category:'structural' },
    { id:'chuo',  glyph:'辵', alt:'辶', pinyin:'chuò', meaning:'Walk',      image:'🚶', logic:'The navigation path; movement from A to B.',                category:'structural' },
    { id:'chi',   glyph:'彳', alt:'',   pinyin:'chì',  meaning:'Step',      image:'👣', logic:'A small movement or a sequence in a process.',              category:'structural' },
    { id:'guang', glyph:'广', alt:'',   pinyin:'guǎng',meaning:'Shelter',   image:'🏚️', logic:'A lean-to or a large, open shed/factory.',                  category:'structural' },
    { id:'wei',   glyph:'囗', alt:'',   pinyin:'wéi',  meaning:'Enclosure', image:'📦', logic:'The boundary; a container or a border.',                    category:'structural' },
    { id:'chang', glyph:'厂', alt:'',   pinyin:'chǎng',meaning:'Cliff/Yard',image:'🏭', logic:'A steep edge or an industrial workspace.',                  category:'structural' },
    { id:'fu_l',  glyph:'阝', alt:'',   pinyin:'fù',   meaning:'Mound',     image:'🏔️', logic:'Land-based geography (hills/slopes). Left-side form.',      category:'structural' },
    { id:'yi_r',  glyph:'阝', alt:'',   pinyin:'yì',   meaning:'City',      image:'🏙️', logic:'High-density population zones (towns). Right-side form.',   category:'structural' },
    { id:'che',   glyph:'车', alt:'',   pinyin:'chē',  meaning:'Vehicle',   image:'🚗', logic:'Transport machinery or mechanical gears.',                   category:'structural' },
    { id:'zou',   glyph:'走', alt:'',   pinyin:'zǒu',  meaning:'Run',       image:'🏃', logic:'High-speed mobility or leaving a state.',                   category:'structural' },
    { id:'fang',  glyph:'方', alt:'',   pinyin:'fāng', meaning:'Square',    image:'🧭', logic:'Directional orientation (North, South, East, West).',       category:'structural' },
    { id:'hu',    glyph:'户', alt:'',   pinyin:'hù',   meaning:'Household', image:'🏡', logic:'Single-door access unit; a home entry port.',               category:'structural' },
    { id:'xue_c', glyph:'穴', alt:'',   pinyin:'xué',  meaning:'Cave/Hole', image:'🕳️', logic:'Underground or hollow enclosed space.',                     category:'structural' },
    { id:'gong',  glyph:'工', alt:'',   pinyin:'gōng', meaning:'Work',      image:'🛠️', logic:'The construction scaffold; the assembly layer.',            category:'structural' },
    { id:'zhou',  glyph:'舟', alt:'',   pinyin:'zhōu', meaning:'Boat',      image:'🛶', logic:'Water transport vessel; the nautical module.',              category:'structural' },
    { id:'xing',  glyph:'行', alt:'',   pinyin:'xíng', meaning:'Road',      image:'🛣️', logic:'The street or path network grid.',                          category:'structural' },

    // ── TOOLS & OBJECTS ──────────────────────────────────────────
    { id:'dao',   glyph:'刀', alt:'刂', pinyin:'dāo',  meaning:'Knife',     image:'🔪', logic:'The cutting tool; used for dividing or refining.',          category:'tools' },
    { id:'shi_f', glyph:'食', alt:'饣', pinyin:'shí',  meaning:'Food',      image:'🍚', logic:'The fuel source for the human system.',                     category:'tools' },
    { id:'yi',    glyph:'衣', alt:'衤', pinyin:'yī',   meaning:'Clothing',  image:'👕', logic:'The external skin or aesthetic layer.',                     category:'tools' },
    { id:'mi',    glyph:'糸', alt:'纟', pinyin:'mì',   meaning:'Silk',      image:'🧵', logic:'The wiring; connectors, threads, and links.',               category:'tools' },
    { id:'jin_c', glyph:'巾', alt:'',   pinyin:'jīn',  meaning:'Cloth',     image:'🧣', logic:'Soft materials; towels, banners, or covers.',               category:'tools' },
    { id:'bei',   glyph:'贝', alt:'',   pinyin:'bèi',  meaning:'Shell',     image:'🐚', logic:'The transactional unit; money and value.',                  category:'tools' },
    { id:'zhu',   glyph:'竹', alt:'⺮', pinyin:'zhú',  meaning:'Bamboo',    image:'🎋', logic:'The versatile composite; used for writing or tools.',       category:'tools' },
    { id:'he',    glyph:'禾', alt:'',   pinyin:'hé',   meaning:'Grain',     image:'🌾', logic:'The agricultural harvest; sustenance.',                     category:'tools' },
    { id:'ge',    glyph:'戈', alt:'',   pinyin:'gē',   meaning:'Spear',     image:'🗡️', logic:'The defense system; weaponry and "Self" (我).',              category:'tools' },
    { id:'gong_b',glyph:'弓', alt:'',   pinyin:'gōng', meaning:'Bow',       image:'🏹', logic:'Tension and release; used in stretching or arcs.',          category:'tools' },
    { id:'shi_a', glyph:'矢', alt:'',   pinyin:'shǐ',  meaning:'Arrow',     image:'➡️', logic:'The projectile or pointer; a direction indicator.',         category:'tools' },
    { id:'jin_a', glyph:'斤', alt:'',   pinyin:'jīn',  meaning:'Axe',       image:'🪓', logic:'The chopping and measuring implement.',                     category:'tools' },
    { id:'min',   glyph:'皿', alt:'',   pinyin:'mǐn',  meaning:'Dish',      image:'🍽️', logic:'The container or storage vessel.',                          category:'tools' },
    { id:'jiao',  glyph:'角', alt:'',   pinyin:'jiǎo', meaning:'Horn',      image:'🎺', logic:'Pointed instrument; corner or angle.',                      category:'tools' },
    { id:'wa',    glyph:'瓦', alt:'',   pinyin:'wǎ',   meaning:'Tile',      image:'🧱', logic:'Ceramic or pottery material; the roofing unit.',            category:'tools' },
    { id:'ye',    glyph:'页', alt:'',   pinyin:'yè',   meaning:'Page',      image:'📄', logic:'Document leaf; data sheet or printed output.',              category:'tools' },

    // ── ABSTRACT & CONDITION ─────────────────────────────────────
    { id:'ne',    glyph:'疒', alt:'',   pinyin:'nè',   meaning:'Sickness',  image:'🤒', logic:'The "Error Code"; indicates a health or system failure.',   category:'abstract' },
    { id:'quan',  glyph:'犬', alt:'犭', pinyin:'quǎn', meaning:'Animal',    image:'🐕', logic:'Non-human entities or instinctive behaviors.',              category:'abstract' },
    { id:'da',    glyph:'大', alt:'',   pinyin:'dà',   meaning:'Big',       image:'🐘', logic:'Scale expansion; an increase in size.',                     category:'abstract' },
    { id:'xiao',  glyph:'小', alt:'',   pinyin:'xiǎo', meaning:'Small',     image:'🐜', logic:'Scale reduction; a decrease in size.',                      category:'abstract' },
    { id:'bai',   glyph:'白', alt:'',   pinyin:'bái',  meaning:'White',     image:'⚪', logic:'Clarity, emptiness, or a default "null" state.',            category:'abstract' },
    { id:'tian',  glyph:'田', alt:'',   pinyin:'tián', meaning:'Field',     image:'🟩', logic:'Data grid or mapped-out territory.',                        category:'abstract' },
    { id:'you',   glyph:'又', alt:'',   pinyin:'yòu',  meaning:'Again/Hand',image:'🔁', logic:'Repetition operator or the right hand.',                    category:'abstract' },
    { id:'wen',   glyph:'文', alt:'',   pinyin:'wén',  meaning:'Pattern',   image:'✍️', logic:'Cultural data layer; writing or civilization.',             category:'abstract' },
    { id:'shi_d', glyph:'示', alt:'礻', pinyin:'shì',  meaning:'Spirit',    image:'🙏', logic:'Divine signal display; ritual or reverence.',               category:'abstract' },
    { id:'zhi',   glyph:'止', alt:'',   pinyin:'zhǐ',  meaning:'Stop',      image:'🛑', logic:'Halt or terminate command; a foot standing still.',         category:'abstract' },
    { id:'fei',   glyph:'非', alt:'',   pinyin:'fēi',  meaning:'Not/Wrong', image:'❌', logic:'The negation operator; Boolean false.',                     category:'abstract' },
    { id:'ji',    glyph:'己', alt:'',   pinyin:'jǐ',   meaning:'Self',      image:'🪞', logic:'First-person reference; the self-variable.',                category:'abstract' },
    { id:'hei',   glyph:'黑', alt:'',   pinyin:'hēi',  meaning:'Black',     image:'⚫', logic:'Void or dark state; full opacity or total absence.',        category:'abstract' },
    { id:'shi_p', glyph:'尸', alt:'',   pinyin:'shī',  meaning:'Body/Prone',image:'🛌', logic:'A horizontal body; the shell or prone structural form.',    category:'abstract' },
  ];

  function getByCategory(catId) { return RADICALS.filter(function (r) { return r.category === catId; }); }
  function getById(id) { return RADICALS.find(function (r) { return r.id === id; }); }

  window.RIQ_DATA = { CATEGORIES: CATEGORIES, RADICALS: RADICALS, getByCategory: getByCategory, getById: getById };
})();
