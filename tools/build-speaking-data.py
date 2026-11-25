# -*- coding: utf-8 -*-
"""motemote-study 말하기 학습 데이터 빌더.

사용법: python3 tools/build-speaking-data.py
출력:   public/data/speaking-data.json

- 오픽/토스 콘텐츠: tools/speaking_content_opic.py, tools/speaking_content_toeic.py
- 모닝콜 복습: projects/ngsl-talk 의 review-seed.json (아침 통화로 쌓인 카드)
"""
import json
import os
import sys
from datetime import datetime, timezone, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import speaking_content_opic as opic_mod  # noqa: E402
import speaking_content_toeic as toeic_mod  # noqa: E402

NGSL_SEED = os.path.join(ROOT, "..", "ngsl-talk", "frontend", "src", "generated", "review-seed.json")
NGSL_VOCAB = os.path.join(ROOT, "..", "ngsl-talk", "vocab", "toeic-ngsl.md")
OUT = os.path.join(ROOT, "public", "data", "speaking-data.json")

OPIC_ORDER = [
    "opic-intro",
    "opic-housing",
    "opic-neighborhood",
    "opic-leisure",
    "opic-cafe",
    "opic-music",
    "opic-movie",
    "opic-travel-domestic",
    "opic-travel-overseas",
    "opic-technology",
    "opic-past-experience",
    "opic-roleplay-call",
    "opic-roleplay-problem",
    "opic-roleplay-suggest",
    "opic-surprise-transport",
    "opic-surprise-season",
    "opic-surprise-shopping",
]


def audio_name(item_id, suffix):
    return f"data/speaking-audio/{item_id}{suffix}.mp3"


def build_opic():
    by_id = {t["id"]: t for t in opic_mod.TOPICS}
    missing = [i for i in OPIC_ORDER if i not in by_id]
    if missing:
        raise SystemExit(f"OPIC_ORDER에 없는 주제: {missing}")
    topics = []
    for tid in OPIC_ORDER:
        t = by_id[tid]
        qs = []
        for q in t["questions"]:
            qs.append(
                {
                    **q,
                    "audio": {
                        "q": audio_name(q["id"], "-q"),
                        "a": audio_name(q["id"], "-a"),
                    },
                }
            )
        topics.append({"id": t["id"], "title": t["title"], "emoji": t["emoji"], "questions": qs})
    return {
        "label": "오픽 AL 실전",
        "note": "빈출 주제 17개 · 24문항. 질문 → 3초 생각 → 답변 순서로, 모범답안은 그림자처럼 따라 말해 보세요.",
        "topics": topics,
    }


def build_toeic():
    parts = []
    for p in toeic_mod.PARTS:
        part = {k: v for k, v in p.items() if k != "questions"}
        qs = []
        for q in p["questions"]:
            audio = {}
            if q.get("passage"):
                audio["p"] = audio_name(q["id"], "-p")
            else:
                audio["q"] = audio_name(q["id"], "-q")
            audio["a"] = audio_name(q["id"], "-a")
            # Part 1처럼 문항별 답변 시간이 없는 파트는 파트 기본값을 쓴다.
            qs.append({**q, "answerSec": q.get("answerSec", p["answerSec"]), "audio": audio})
        part["questions"] = qs
        parts.append(part)
    return {
        "label": "토익스피킹 IH~AL",
        "note": "Part 1~5 실제 시험 규격. 준비 시간 → 비프음 → 답변 시간이 자동으로 흘러갑니다.",
        "parts": parts,
    }


def build_morning():
    if not os.path.exists(NGSL_SEED):
        raise SystemExit(f"모닝콜 복습 시드를 찾을 수 없습니다: {NGSL_SEED}")
    with open(NGSL_SEED, encoding="utf-8") as f:
        seed = json.load(f)

    cards = []
    for c in seed.get("cards", []):
        example = (c.get("example") or "").strip()
        back = (c.get("back") or "").strip()
        speak_text = example if example else back
        cards.append(
            {
                "id": f"morning-{c['id']}",
                "kind": c.get("kind") or "word",
                "front": c.get("front") or "",
                "back": back,
                "example": example,
                "note": c.get("note") or "",
                "tag": c.get("tag") or "",
                "day": c.get("day") or "",
                "audio": audio_name(f"morning-{c['id']}", ""),
                "speakText": speak_text,
            }
        )
    cards.sort(key=lambda x: (x["day"], x["id"]), reverse=True)

    days = sorted({c["day"] for c in cards}, reverse=True)
    kinds = {
        "word": sum(1 for c in cards if c["kind"] == "word"),
        "pattern": sum(1 for c in cards if c["kind"] == "pattern"),
        "sentence": sum(1 for c in cards if c["kind"] == "sentence"),
    }
    return {
        "label": "내 모닝콜 복습",
        "note": "매일 아침 전화영어(ngsl-talk)에서 실제로 틀리거나 새로 배운 표현입니다. '내가 말한 문장 → 교정'으로 다시 말해 보세요.",
        "days": days,
        "counts": kinds,
        "cards": cards,
    }


def main():
    data = {
        "version": 1,
        "generatedAt": datetime.now(timezone(timedelta(hours=9))).isoformat(timespec="seconds"),
        "source": "motemote-study tools/build-speaking-data.py",
        "opic": build_opic(),
        "toeic": build_toeic(),
        "morning": build_morning(),
    }
    data["stats"] = {
        "opicTopics": len(data["opic"]["topics"]),
        "opicQuestions": sum(len(t["questions"]) for t in data["opic"]["topics"]),
        "toeicParts": len(data["toeic"]["parts"]),
        "toeicQuestions": sum(len(p["questions"]) for p in data["toeic"]["parts"]),
        "morningCards": len(data["morning"]["cards"]),
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    size = os.path.getsize(OUT)
    print(f"wrote {OUT} ({size:,} bytes)")
    print(json.dumps(data["stats"], ensure_ascii=False))


if __name__ == "__main__":
    main()
