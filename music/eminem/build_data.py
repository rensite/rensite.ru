#!/usr/bin/env python3
"""
Генератор базы треков лендинга Eminem.
Единственный источник правды — таблица `tracks` в Артефакте (emall/pipeline/out/artefakt.db).
Запуск:  python3 build_data.py            →  пишет data.json рядом.
         python3 build_data.py --check    →  только сверка, файл не трогает (exit 1 если расходится).
         ARTEFAKT_DB=/путь/artefakt.db python3 build_data.py   →  своя БД.

Лендинг (index.html, секция #base «База треков») фетчит data.json и рендерит каталог;
shared /music/tracks.js loadAll() подмешивает эти треки в ⌘K-палитру.
Зависимостей нет: только стандартная библиотека (sqlite3).
"""
import sqlite3, json, os, sys, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(HERE, "data.json")

# БД Артефакта лежит в соседнем репозитории emall. Путь можно переопределить через ARTEFAKT_DB.
DEFAULT_DB = os.path.normpath(os.path.join(HERE, "..", "..", "..", "emall", "pipeline", "out", "artefakt.db"))
DB = os.environ.get("ARTEFAKT_DB", DEFAULT_DB)

GENERATED_FROM = "emall/artefakt.db (Артефакт)"
LICENSE = ("Независимый некоммерческий фан-проект. Все права на песни — "
           "у правообладателей. Ссылки ведут на поиск YouTube.")

# Тип трека в БД → русская категория для чипов-фильтров каталога.
TYPE_RU = {
    "studio_lead":      "Соло",
    "studio_featured":  "Фиты",
    "freestyle_cypher": "Фристайлы",
    "skit":             "Скиты",
    "leak_demo":        "Утечки",
}

EMPTY_RELEASE = {"", "unknown"}  # release == 'Unknown'/'' → секцию-альбом не показываем

TITLE_SEP = " – "  # en dash: «Артист[ ft. Фиты] – Название»
FEAT_RE = re.compile(r"\s+(?:ft\.|feat\.|featuring)\s+", re.I)
SPLIT_FEATS_RE = re.compile(r",\s*|\s+&\s+")


def credits_from_title(title):
    """«Lead ft. F1, F2 – Песня» → (primary, [артисты кроме Eminem, по порядку]).

    У гостевых треков (studio_featured) ведущий артист есть только в текстовом
    `title`, а структурированный `other_artists` хранит лишь вторичные фиты (и
    бывает зашумлён названиями альбомов). Поэтому кредиты берём из чистого title.
    Возвращает (None, None), если формат не распознан (нет разделителя ' – ')."""
    if not title or TITLE_SEP not in title:
        return None, None
    credit_part = title.split(TITLE_SEP, 1)[0]
    parts = FEAT_RE.split(credit_part, maxsplit=1)
    primary = parts[0].strip()
    feats = []
    if len(parts) > 1:
        feats = [a.strip() for a in SPLIT_FEATS_RE.split(parts[1]) if a.strip()]
    seen, others = set(), []
    for a in [primary] + feats:
        if a.lower() == "eminem":
            continue
        if a.lower() in seen:
            continue
        seen.add(a.lower())
        others.append(a)
    return primary, others


def build_tracks(conn):
    """Возвращает список треков в порядке год↓, значимость↓, название."""
    cur = conn.execute("""
        SELECT COALESCE(NULLIF(song_title, ''), title) AS n,
               title, type, year, release, other_artists, youtube_url
        FROM tracks
        ORDER BY year DESC, significance DESC, n COLLATE NOCASE
    """)
    out = []
    for n, title, typ, year, release, other_artists, youtube_url in cur:
        ru = TYPE_RU.get(typ)
        if ru is None:
            raise SystemExit(f"Неизвестный type в БД: {typ!r} (трек {n!r}). "
                             f"Добавь его в TYPE_RU.")

        try:
            others = json.loads(other_artists or "[]")
        except (ValueError, TypeError):
            others = []

        if typ == "studio_featured":
            # Гостевой трек: ведущий артист — в title, а other_artists ненадёжен.
            # Кредиты берём из title; ведущего ставим впереди YouTube-запроса, чтобы
            # «Eminem <название>» находило трек на чужом альбоме.
            primary, ft_list = credits_from_title(title)
            if primary is None:  # title не распознан — запасной путь по other_artists
                ft_list = [a for a in others if a.lower() != "eminem"]
                primary = ft_list[0] if ft_list else "Eminem"
            q = "Eminem " + n if primary.lower() == "eminem" else "Eminem " + primary + " " + n
        else:
            # Соло/Фристайлы/Скиты/Утечки: ведущий — сам Eminem, ft = другие артисты.
            ft_list = others
            q = "Eminem " + n
        t = {"n": n, "type": ru, "q": q}

        if year is not None:
            t["yr"] = year

        rel = (release or "").strip()
        if rel.lower() not in EMPTY_RELEASE:
            t["s"] = rel

        if ft_list:
            t["ft"] = ", ".join(ft_list)

        yurl = (youtube_url or "").strip()
        if yurl:
            t["y"] = yurl

        out.append(t)
    return out


def serialize(tracks):
    # count не пишем: длина tracks и так есть у любого, кто открыл файл, а
    # отдельным полем она только разъезжается с фактом. Читателей у него не было.
    doc = {
        "_generated_from": GENERATED_FROM,
        "_license": LICENSE,
        "tracks": tracks,
    }
    return json.dumps(doc, ensure_ascii=False, separators=(",", ":"))


def main():
    check = "--check" in sys.argv[1:]
    if not os.path.exists(DB):
        raise SystemExit(f"Не найдена БД Артефакта: {DB}\n"
                         f"Укажи путь через ARTEFAKT_DB=/путь/к/artefakt.db")

    conn = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    try:
        tracks = build_tracks(conn)
    finally:
        conn.close()

    payload = serialize(tracks)

    # сводка по категориям для глаза
    by_type = {}
    for t in tracks:
        by_type[t["type"]] = by_type.get(t["type"], 0) + 1
    summary = " · ".join(f"{k} {v}" for k, v in sorted(by_type.items(), key=lambda kv: -kv[1]))

    if check:
        old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else None
        if old == payload:
            print(f"✓ data.json актуален — {len(tracks)} треков ({summary})")
            return 0
        print(f"✗ data.json расходится с БД — нужно пересобрать "
              f"(сейчас в БД {len(tracks)}: {summary})", file=sys.stderr)
        return 1

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(payload)
    print(f"✓ {os.path.relpath(OUT, HERE)} — {len(tracks)} треков ({summary})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
