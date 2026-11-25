#!/usr/bin/env python3
"""해커스 토익 노랭이 Anki 덱 → 웹앱용 JSON 추출.

원본: data/noraengi-apkg/extracted/collection_real.sqlite (cards + notes + decks)
출력: public/data/noraengi-words.json

- 덱 이름은 `노랭이\x1f01.빈출단어\x1fDAY01` 처럼 \x1f(unit separator)로 구분된다.
- notes.flds[0] = 영단어 + [sound:...mp3], notes.flds[1] = 한국어 뜻.
- 정렬은 cards.id 순서를 그대로 유지한다(원본 암기 순서).
- 5,101개 단어를 `[영단어, 뜻, 파트번호, DAY]` 튜플 배열로 저장해 용량을 줄인다.
"""

from __future__ import annotations

import html
import json
import re
import sqlite3
from collections import Counter, OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DB = ROOT.parent.parent / "data" / "noraengi-apkg" / "extracted" / "collection_real.sqlite"
OUT = ROOT / "public" / "data" / "noraengi-words.json"

SOUND_RE = re.compile(r"\[sound:[^\]]*\]")
TAG_RE = re.compile(r"<[^>]+>")


def clean_field(value: str) -> str:
    value = SOUND_RE.sub("", value)
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.IGNORECASE)
    value = TAG_RE.sub("", value)
    value = html.unescape(value)
    lines = [line.strip() for line in value.split("\n")]
    return "\n".join(line for line in lines if line)


def main() -> None:
    conn = sqlite3.connect(SOURCE_DB)
    conn.create_collation("unicase", lambda a, b: (a.lower() > b.lower()) - (a.lower() < b.lower()))
    cur = conn.cursor()
    cur.execute(
        """
        SELECT c.id, c.nid, d.name, n.flds
        FROM cards c
        JOIN decks d ON d.id = c.did
        JOIN notes n ON n.id = c.nid
        ORDER BY c.id
        """
    )
    rows = cur.fetchall()

    parts: "OrderedDict[str, dict]" = OrderedDict()
    words: list[list] = []
    seen_parts: Counter[str] = Counter()

    for _card_id, _note_id, deck_name, flds in rows:
        segments = deck_name.split("\x1f")
        if len(segments) < 3:
            # 하위 덱이 아닌 경우는 건너뛴다 (이 덱에는 없음).
            continue
        part_raw, day_raw = segments[1], segments[2]
        part_no = part_raw.split(".")[0]
        part_name = part_raw.split(".", 1)[1] if "." in part_raw else part_raw
        day = int(re.sub(r"\D", "", day_raw) or 0)

        fields = flds.split("\x1f")
        word = clean_field(fields[0])
        meaning = clean_field(fields[1]) if len(fields) > 1 else ""
        if not word or not meaning:
            continue

        index = len(parts)
        if part_raw not in parts:
            parts[part_raw] = {
                "id": part_no,
                "name": part_name,
                "label": part_name.replace("토익기초단어", "기초").replace("빈출단어", "빈출"),
                "index": index,
                "count": 0,
                "days": 0,
            }
            seen_parts[part_raw] = 0
        seen_parts[part_raw] += 1
        words.append([word, meaning, parts[part_raw]["index"], day])

    for part_raw, info in parts.items():
        info["count"] = seen_parts[part_raw]
        info["days"] = max(w[3] for w in words if w[2] == info["index"])

    payload = {
        "version": 1,
        "source": "해커스 토익 노랭이 (Anki 덱)",
        "count": len(words),
        "parts": list(parts.values()),
        "words": words,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    print(f"words: {len(words)}")
    for raw, info in parts.items():
        print(f"  {raw}: {info['count']} (DAY 1~{info['days']})")
    print(f"wrote: {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
