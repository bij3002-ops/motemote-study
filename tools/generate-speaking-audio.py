# -*- coding: utf-8 -*-
"""말하기 학습용 원어민 MP3 생성기 (edge-tts).

사용법:
  python3 tools/generate-speaking-audio.py            # 없는 파일만 생성
  python3 tools/generate-speaking-audio.py --force    # 전부 다시 생성

- 질문/지문: en-US-GuyNeural (면접관 느낌)
- 모범답안/단어 예문: en-US-JennyNeural
출력: public/data/speaking-audio/*.mp3
데이터(speaking-data.json)의 audio 경로와 파일명이 1:1로 맞는다.
"""
import argparse
import asyncio
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "public", "data", "speaking-data.json")
OUTDIR = os.path.join(ROOT, "public", "data", "speaking-audio")

MODEL_VOICE = "en-US-JennyNeural"
QUESTION_VOICE = "en-US-GuyNeural"


def collect_jobs(data):
    jobs = []
    for topic in data["opic"]["topics"]:
        for q in topic["questions"]:
            jobs.append((q["audio"]["q"], q["q"], QUESTION_VOICE))
            jobs.append((q["audio"]["a"], q["a"], MODEL_VOICE))

    for part in data["toeic"]["parts"]:
        for q in part["questions"]:
            if q.get("passage"):
                jobs.append((q["audio"]["p"], q["passage"], MODEL_VOICE))
            else:
                jobs.append((q["audio"]["q"], q["q"], QUESTION_VOICE))
            if q.get("a"):
                jobs.append((q["audio"]["a"], q["a"], MODEL_VOICE))

    for card in data["morning"]["cards"]:
        text = card.get("speakText") or card.get("example") or card.get("back")
        if text:
            jobs.append((card["audio"], text, MODEL_VOICE))
    return jobs


async def synth(sem, edge_tts, rel_path, text, voice, force):
    path = os.path.join(ROOT, "public", rel_path.replace("data/", "data/", 1))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path) and os.path.getsize(path) > 1000 and not force:
        return ("skip", rel_path, os.path.getsize(path))
    async with sem:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(path)
    size = os.path.getsize(path)
    return ("made", rel_path, size)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--concurrency", type=int, default=5)
    args = ap.parse_args()

    try:
        import edge_tts
    except ImportError:
        print("edge-tts가 필요합니다: pip install edge-tts", file=sys.stderr)
        return 1

    with open(DATA, encoding="utf-8") as f:
        data = json.load(f)

    jobs = collect_jobs(data)
    sem = asyncio.Semaphore(args.concurrency)
    tasks = [synth(sem, edge_tts, *job, args.force) for job in jobs]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    made = skipped = failed = 0
    total = 0
    for r in results:
        if isinstance(r, Exception):
            failed += 1
            print("  ! 실패:", r)
            continue
        kind, path, size = r
        total += size
        if kind == "made":
            made += 1
        else:
            skipped += 1
    print(f"생성 {made} · 건너뜀 {skipped} · 실패 {failed} · 총 {total/1024/1024:.1f} MB")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
