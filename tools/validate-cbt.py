#!/usr/bin/env python3
"""기출 CBT 데이터 검증 — public/data/cbt/*.json 과 이미지 파일을 점검한다.

    python3 tools/validate-cbt.py

검사 항목
  · 회차마다 정확히 100문항 (1~100번, 빠짐/중복 없음)
  · 과목이 1~5로 20문항씩
  · 정답이 1~4 안에 있음
  · 보기가 4개이고, 이미지가 없는 문항은 본문·보기가 비어 있지 않음
  · image 경로의 파일이 실제로 존재하고 2KB 이상
  · 해설이 있으면 비어 있지 않음
"""
import json
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data')
CBT = os.path.join(ROOT, 'cbt')


def main() -> int:
    index = json.load(open(os.path.join(CBT, 'index.json')))
    problems = []
    total_q = 0
    total_img = 0
    total_expl = 0

    for exam in index['exams']:
        for rnd in exam['rounds']:
            path = os.path.join(ROOT, rnd['file'])
            data = json.load(open(path))
            qs = data['questions']
            tag = f"{exam['id']}-{rnd['id']}"
            total_q += len(qs)
            if len(qs) != 100:
                problems.append(f'{tag}: 문항 수 {len(qs)} (100이 아님)')
            if [q['n'] for q in qs] != list(range(1, 101)):
                problems.append(f'{tag}: 문항 번호가 1~100 연속이 아님')
            for subj in range(1, 6):
                if sum(1 for q in qs if q['subject'] == subj) != 20:
                    problems.append(f'{tag}: {subj}과목 문항 수가 20이 아님')
            for q in qs:
                if q.get('answer') not in (1, 2, 3, 4):
                    problems.append(f"{tag} {q['n']}: 정답 {q.get('answer')}")
                if len(q.get('choices') or []) != 4:
                    problems.append(f"{tag} {q['n']}: 보기 개수 {len(q.get('choices') or [])}")
                img = q.get('image')
                if img:
                    total_img += 1
                    p = os.path.join(ROOT, img)
                    if not os.path.exists(p):
                        problems.append(f"{tag} {q['n']}: 이미지 없음 {img}")
                    elif os.path.getsize(p) < 2048:
                        problems.append(f"{tag} {q['n']}: 이미지가 너무 작음 {img}")
                else:
                    if not (q.get('body') or '').strip():
                        problems.append(f"{tag} {q['n']}: 본문 비어 있음")
                    if any(not (c or '').strip() for c in q['choices']):
                        problems.append(f"{tag} {q['n']}: 빈 보기가 있음")
                if q.get('explain'):
                    total_expl += 1
                    if len(q['explain'].strip()) < 5:
                        problems.append(f"{tag} {q['n']}: 해설이 너무 짧음")

    print(f'회차 {sum(len(e["rounds"]) for e in index["exams"])}개 · 문항 {total_q}개 · 이미지 {total_img}개 · 해설 {total_expl}개')
    if problems:
        print(f'문제 {len(problems)}건:')
        for p in problems:
            print('  -', p)
        return 1
    print('모든 검사 통과')
    return 0


if __name__ == '__main__':
    sys.exit(main())
