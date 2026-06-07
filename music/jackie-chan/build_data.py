#!/usr/bin/env python3
"""
Генератор данных лендинга Jackie Chan.
Единственный источник правды — Jackie_Chan_Discography.xlsx.
Запуск:  python3 build_data.py   →  пишет data.json рядом.
Лендинг (index.html) фетчит data.json и рендерит все секции.

Зависимостей нет: xlsx парсится напрямую как zip с XML (стандартная библиотека).
"""
import zipfile, re, json, os
from xml.etree import ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.join(HERE, "Jackie_Chan_Discography.xlsx")
OUT  = os.path.join(HERE, "data.json")
NS   = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# ---- низкоуровневый парсер xlsx (строки хранятся инлайн) ----
def _col_idx(ref):
    s = re.match(r"([A-Z]+)", ref).group(1); n = 0
    for ch in s: n = n * 26 + (ord(ch) - 64)
    return n - 1

def _read_sheet(z, path):
    t = ET.fromstring(z.read(path)); rows = []
    for row in t.iter(f"{NS}row"):
        cells = {}; mx = -1
        for c in row.findall(f"{NS}c"):
            ci = _col_idx(c.get("r")); ty = c.get("t")
            v = c.find(f"{NS}v"); isv = c.find(f"{NS}is"); val = None
            if ty == "str" and v is not None:
                val = v.text
            elif isv is not None:
                val = "".join(n.text or "" for n in isv.iter(f"{NS}t"))
            elif v is not None and ty != "s":
                val = v.text
            cells[ci] = val; mx = max(mx, ci)
        rows.append([cells.get(i) for i in range(mx + 1)])
    return rows

def load_sheets():
    z = zipfile.ZipFile(XLSX)
    sf = sorted(n for n in z.namelist() if re.match(r"xl/worksheets/sheet\d+\.xml$", n))
    return [_read_sheet(z, s) for s in sf]

# ---- помощники ----
def g(row, i):
    v = row[i] if i < len(row) else None
    return ("" if v is None else str(v).strip())

EMPTY = {"", "—", "·", "-"}
def clean(s):
    s = (s or "").strip()
    return "" if s in EMPTY else s

def year_int(s):
    m = re.search(r"\d{4}", s or "")
    return int(m.group()) if m else 9999

def yq(*parts):
    """YouTube-запрос: 'Jackie Chan ' + значимые части."""
    q = "Jackie Chan " + " ".join(clean(p) for p in parts if clean(p))
    return re.sub(r"\s+", " ", q).strip()

def film_ru(f):   # 'Миф / The Myth' -> 'Миф'
    return clean(f.split("/")[0]) if f else ""
def film_en(f):   # 'Миф / The Myth' -> 'The Myth'
    return clean(f.split("/")[-1]) if (f and "/" in f) else ""

def meta_line(film, collab):
    bits = []
    fr = film_ru(film)
    if fr: bits.append(f"из «{fr}»")
    c = clean(collab)
    if c: bits.append(f"с {c}")
    return " · ".join(bits)

# ---------------------------------------------------------------------------
def build():
    LG, DASH, ALB, TBT, SING, OTHER, SRC = load_sheets()

    # ---- Listening Guide: разбор по ШАГам ----
    step = None
    lg_rows = []  # (step, num, year, title, transl, film, collab)
    for r in LG:
        c0 = g(r, 0)
        if c0.startswith("ШАГ"):
            step = c0.split("—")[0].strip()  # 'ШАГ 1'
            continue
        if c0.isdigit():
            lg_rows.append((step, c0, g(r, 1), g(r, 2), g(r, 3), g(r, 4), g(r, 5)))

    def lg_in(*steps):
        return [x for x in lg_rows if x[0] in steps]

    # ---- HITS (ШАГ 1) ----
    hits = []
    for _, _, yr, title, _, film, collab in lg_in("ШАГ 1"):
        hits.append({"yr": yr, "t": title,
                     "m": meta_line(film, collab),
                     "q": yq(title, film_en(film), collab)})

    # ---- TIMELINE: альбомы (ALB) + треклисты (TBT), 1:1 по порядку ----
    # блоки TBT: заголовок = одиночная ячейка вида 'Название — ГОД — Лейбл', под ним
    # строки-треки (digit | name). Требуем год в заголовке, иначе строка-заголовок
    # самого листа ('Альбомы по трекам — …') ошибочно создаёт пустой блок и сдвигает
    # все треклисты на один альбом.
    tbt_blocks = []  # [tracks...]
    cur = None
    for r in TBT:
        c0 = g(r, 0)
        only_first = c0 and all(g(r, i) == "" for i in range(1, len(r)))
        if only_first and ("—" in c0) and not c0[:1].isdigit() and re.search(r"\d{4}", c0):
            cur = []; tbt_blocks.append(cur)
        elif c0.isdigit() and cur is not None:
            song = g(r, 1)
            if song.startswith("("):                              # заметка-заглушка, не песня
                continue
            if any(s.lower() == song.lower() for s in cur):       # дубль внутри одного альбома
                continue
            cur.append(song)
    alb_rows = [r for r in ALB if g(r, 0)[:2].isdigit()]  # строки с годом
    timeline = []
    for idx, r in enumerate(alb_rows):
        songs = tbt_blocks[idx] if idx < len(tbt_blocks) else []
        timeline.append({"yr": g(r, 0), "t": g(r, 1), "d": g(r, 2), "songs": songs})

    # переиздания: тот же треклист, что у оригинала → не дублируем песни.
    # Альбом остаётся в таймлайне с пометкой, но в каталог его треки не идут.
    REPACK = {"shangri": "The Boy's Life"}  # подстрока названия → оригинал
    for alb in timeline:
        low = alb["t"].lower()
        for key, orig in REPACK.items():
            if key in low:
                alb["repack"] = orig
                alb["songs"] = []
                break

    # ---- TRACKS: полный каталог с типами ----
    tracks = []
    # альбомы → каждая песня треклиста отдельной строкой (тип «Альбом»).
    # Альбом-как-единица (лейбл, формат) остаётся в таймлайне; здесь — песни.
    for alb in timeline:
        if alb.get("repack"):
            continue  # переиздание — его песни уже есть у оригинала, в каталог не дублируем
        album, yr = alb["t"], alb["yr"]
        if alb["songs"]:
            for song in alb["songs"]:
                tracks.append({"yr": yr, "n": song, "s": f"из «{album}»",
                               "type": "Альбом", "q": yq(album, song)})
        else:
            # подстраховка: если у альбома нет треклиста в источнике — не теряем его
            label = clean((alb.get("d") or "").split("/")[0])
            tracks.append({"yr": yr, "n": album,
                           "s": "студийный альбом" + (f" · {label}" if label else ""),
                           "type": "Альбом", "q": yq(album, "album")})
    # саундтреки (ШАГ 1 + ШАГ 3 — у них есть фильм)
    for _, _, yr, title, _, film, collab in lg_in("ШАГ 1", "ШАГ 3"):
        s = " · ".join(x for x in [film_ru(film), ("с " + clean(collab)) if clean(collab) else ""] if x)
        tracks.append({"yr": yr, "n": title, "s": s, "type": "Саундтрек",
                       "q": yq(title, film_en(film), collab)})
    # синглы и EP
    for r in SING[2:]:
        if not g(r, 0): continue
        fmt = clean(g(r, 2))
        tracks.append({"yr": g(r, 0), "n": g(r, 1),
                       "s": "сингл" + (f" · {fmt}" if fmt else ""),
                       "type": "Сингл", "q": yq(g(r, 1), "single")})
    # прочее (дуэты/благотворительность)
    for r in OTHER[2:]:
        if not g(r, 0): continue
        tracks.append({"yr": g(r, 0), "n": g(r, 1), "s": clean(g(r, 2)),
                       "type": "Прочее", "q": yq(g(r, 1))})
    # ШАГ 4 — прочие песни (олимпийские/благотворительные/COVID + Skibidi).
    # Дедуп против листа OTHER по имени; строку-сводку про сборники пропускаем
    # (сборники учтены отдельным счётчиком, это не отдельный трек).
    seen = {t["n"].strip().lower() for t in tracks}
    for _, _, yr, title, transl, film, collab in lg_in("ШАГ 4"):
        name = clean(title.split("—")[0])
        low = name.lower()
        if not name or "сборник" in low or "сборник" in (film or "").lower():
            continue
        if low in seen:
            continue  # уже есть из листа OTHER (напр. Hard to Say Goodbye)
        q = yq(name, film_en(film), collab)  # запрос по оригинальному названию (до перевода)
        # китайские названия без латиницы дополняем русским переводом для читаемости
        if not re.search(r"[A-Za-z]", name) and clean(transl):
            name = f"{name} ({clean(transl)})"
        ctx = " · ".join(x for x in [clean(film), ("с " + clean(collab)) if clean(collab) else ""] if x)
        tracks.append({"yr": yr, "n": name, "s": ctx, "type": "Прочее", "q": q})
        seen.add(low)
    tracks.sort(key=lambda t: (year_int(t["yr"]), t["n"]))

    # ---- ЗНАЧИМЫЕ: авторский короткий список + «почему слушать» ----
    # Редакторский текст (в исходных данных его нет). Ключ — уникальная подстрока
    # названия; китайские иероглифы различают одноимённые треки (напр. Hero Story).
    # ⚠ Тексты черновые — правь под свой голос меломана.
    # (подстрока названия, тип или None для любого, текст «почему»). Тип нужен, когда
    # песня вышла на нескольких релизах (Tokyo Saturday Night — альбом/сингл/саундтрек).
    SIGNIFICANT = [
        ("英雄故事",            None, "Тема «Полицейской истории» — кантопоп-классика 80-х из, возможно, лучшего его боевика. Вход в раннего, гонконгского Джеки."),
        ("Tokyo Saturday Night", "Саундтрек", "Тема «Сердца дракона» и визитка японского периода Джеки — лёгкий сити-поп 80-х. Совсем другой Джеки, чем в боевиках."),
        ("Pang Yao",           None, "Ранний кантонский дуэт с Аланом Тамом, связанный с «Доспехами бога». Гонконгский поп 80-х в чистом виде — с чего начинался Джеки-певец."),
        ("醉拳",               None, "Тема к «Пьяному мастеру 2» — одному из величайших боевиков в его карьере. Кунг-фу-энергия, упакованная в песню."),
        ("我是誰",             None, "Заглавная тема «Кто я?» с Эмилем Чау — эталонный мандопоп конца 90-х и образец «песни Джеки к собственному фильму»."),
        ("Unforgettable",      None, "Неожиданный англоязычный дуэт с американкой Ани ДиФранко («When Pigs Fly»). Самый нетипичный трек в каталоге — Джеки вне азиатского контекста."),
        ("九月風暴",            None, "Тема «Новой полицейской истории» — спустя 19 лет после Hero Story. Слышно, как повзрослел и звук франшизы, и сам Джеки."),
        ("無盡的愛",            None, "Любовная тема «Мифа» — дуэт с Ким Хи Сон. Самая известная песня Джеки: парящая баллада, с которой проще всего влюбиться в его вокал."),
        ("北京欢迎你",          None, "Песня-приглашение Олимпиады-2008, где Джеки — среди десятков звёзд. Не боевик, а культурный момент, который в Китае знают все."),
        ("明明白白",            None, "Дуэт с Сарой Чэнь к «Скиптрейсу» — переосмысление кантопоп-классики. Тёплый, ламповый поздний Джеки."),
        ("美麗的神話",          None, "Поздний Джеки и узнаваемая мелодия из вселенной «Мифа». Хорошо ставить сразу после Endless Love — сравнить эпохи."),
        ("青春故事",            None, "Открывает ретроспективный альбом «I Am Me» (2018) — единственный полноценный сольник за десятилетия. Личный, итожащий Джеки, а не саундтрек."),
        ("傳說",               None, "Самый свежий трек (2024): снова «Легенда» и снова Ким Хи Сон, плюс LAY из EXO. Мост между классикой и современным C-pop."),
    ]
    sig_hits = {}
    for t in tracks:
        for key, typ, why in SIGNIFICANT:
            if key in t["n"] and (typ is None or t["type"] == typ):
                t["significant"] = True
                t["why"] = why
                sig_hits[key] = sig_hits.get(key, 0) + 1
                break

    # ---- STATS из Dashboard ----
    def dash_pair_block(c_label, c_val, stop=("",)):
        out = []
        for r in DASH[2:]:
            lab = g(r, c_label)
            if lab in stop or not lab: break
            out.append((lab, g(r, c_val)))
        return out

    # ---- ТОП фильмов / франшиз по числу саундтреков ----
    # У большинства фильмов по одной песне, числа >1 даёт только группировка
    # серий (Полицейская история, Проект А, Доспехи бога) + фильмы с 2 песнями.
    FRANCH = {
        "Полицейская история": ["полицейск", "суперполиц"],
        "Проект А": ["проект а"],
        "Доспехи бога": ["доспехи бога"],
    }
    st_tracks = [t for t in tracks if t["type"] == "Саундтрек"]
    groups, film_names = {}, set()
    for t in st_tracks:
        film = clean((t.get("s") or "").split("·")[0])
        if not film:
            continue
        film_names.add(film)
        key, low = film, film.lower()
        for label, pats in FRANCH.items():
            if any(p in low for p in pats):
                key = label; break
        groups[key] = groups.get(key, 0) + 1
    top = sorted(([k, v] for k, v in groups.items() if v > 1), key=lambda x: -x[1])
    yrs = [year_int(t["yr"]) for t in st_tracks if year_int(t["yr"]) < 9999]
    films = {
        "soundtracks": len(st_tracks),
        "filmCount": len(film_names),
        "span": f"{min(yrs)}–{max(yrs)}",
        "top": [{"name": k, "n": v} for k, v in top],
        "more": sum(1 for v in groups.values() if v == 1),
    }

    # языки: схлопываем дубликаты-обрезки (Cant→Cantonese, Mand→Mandarin, Jpn→Japanese, Eng→English)
    lang_raw = [(l, v) for l, v in dash_pair_block(6, 7) if l]
    norm = {"Cant": "Cantonese", "Mand": "Mandarin", "Jpn": "Japanese",
            "Eng": "English", "Taiw": "Taiwanese"}
    langs = {}
    for l, v in lang_raw:
        key = norm.get(l, l)
        langs[key] = langs.get(key, 0) + int(v)

    def dash_summary(label_sub):
        for r in DASH:
            if label_sub.lower() in g(r, 0).lower():
                m = re.search(r"\d+", g(r, 1))
                return int(m.group()) if m else None
        return None

    # число отдельных песен = число строк каталога (каждая строка — одна песня:
    # треки альбомов развёрнуты). Округляем вниз до 10 и показываем с «+», т.к. часть
    # альбомных треклистов в источнике обрезана — так цифра гарантированно честная.
    song_total = len(tracks)
    counters = [
        {"n": (song_total // 10) * 10, "plus": True, "l": "песен в дискографии"},  # из данных, ~178 → 170+
        {"n": len(alb_rows),            "l": "студийных альбомов"},   # = 12
        {"n": dash_summary("Сборников") or len(langs), "l": "сборников"},  # Dashboard = 9
        {"n": len([r for r in SING[2:] if g(r, 0)]), "l": "синглов / EP"},  # = 9
        {"n": len(langs),               "l": "языков"},              # = 5
    ]

    data = {
        "_generated_from": "Jackie_Chan_Discography.xlsx",
        "_compiled_by": "rensite · renatgalin.pro",
        "_license": "CC BY-NC 4.0 — авторская компиляция; републикация только с указанием автора, без коммерции",
        "_signature": "rensite·renatgalin.pro·jc-curation·9f3a2c — уникальная компиляция rensite",
        "hits": hits,
        "timeline": timeline,
        "tracks": tracks,
        "stats": {
            "counters": counters,
            "films": films,
        },
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"OK → {os.path.basename(OUT)}")
    print(f"  hits={len(hits)}  timeline={len(timeline)} albums  tracks={len(tracks)}")
    print(f"  films: soundtracks={films['soundtracks']} filmCount={films['filmCount']} span={films['span']}")
    print(f"  top={films['top']}  +singles={films['more']}")
    print(f"  langs={langs}")
    print(f"  counters={[(c['n'], c['l']) for c in counters]}")
    print(f"  significant: matched={sig_hits} total={sum(1 for t in tracks if t.get('significant'))} (ожидается по 1 на ключ)")
    from collections import Counter
    print(f"  track types={dict(Counter(t['type'] for t in tracks))}")

if __name__ == "__main__":
    build()
