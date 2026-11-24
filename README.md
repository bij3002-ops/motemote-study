# 10분 공부 플래너 (motemote-study)

모트모트(올클 · 텐미닛 플래너) 감성의 **개인용 공부 웹앱(PWA)**.
아이폰 Safari에서 열고 ‘홈 화면에 추가’하면 전체화면 앱처럼 쓸 수 있습니다.

- 라이브: https://bij3002-ops.github.io/motemote-study/
- 스택: Vite + React + TypeScript, 손으로 쓴 CSS (프레임워크·백엔드 없음)
- 저장: 브라우저 `localStorage` (서버 전송 없음) + JSON 백업/복원

## 기능

### 1. 타이머 (타이머 탭)
- **스톱워치**: 과목 선택 → 시작 / 일시정지 / 저장
- **뽀모도로**: 25·5 / 50·10 / 15·3 프리셋, 집중이 끝나면 알림음과 함께 휴식으로 자동 전환
- 새로고침·백그라운드 전환에도 `startedAt` 타임스탬프로 경과 시간이 정확합니다
- Screen Wake Lock API로 타이머 중 화면 꺼짐 방지(지원 브라우저)
- **저장하면 그 시간대가 10분 타임테이블에 과목 색으로 자동 기록**됩니다

### 2. 텐미닛 플래너 (플래너 탭)
- 날짜 이동(‹ › / 날짜 선택 / 오늘), 대표 D-Day 배지, 오늘의 한 줄 다짐
- 모트모트식 태스크 매니저: `○` 미완료 → `△` 진행중 → `✓` 완료 → `→` 내일로 이월 순환
  (이월 시 다음 날로 자동 복사 옵션, 설정 탭)
- 10분 타임테이블 05:00–04:00, 한 줄 60분 × 6칸
  - 타이머 기록 자동 색칠 + 손가락 터치/가로 드래그로 수동 색칠·지우개
  - 현재 시각 표시선

### 3. 통계 (통계 탭)
- 오늘 / 이번 주 / 이번 달 누적, 최근 7일 막대그래프
- 과목별 비율(스택 바 + 범례), 월간 공부 히트맵(월 이동)

### 4. D-Day · 설정 (설정 탭)
- D-Day 추가·수정·삭제 (기본값: 제82회 한능검 접수 2027-01-12, 정기기사 1회 필기 접수 2027-01-18, 정기기사 1회 필기 시작 2027-02-12)
- 과목 추가·이름/색 변경·삭제 (기본: 품질경영기사 · 산업안전기사 · 토익/오픽 · 학교 전공·팀플 · 한국사)
- 라이트 / 다크 / 시스템 테마
- JSON 내보내기·불러오기, 어제 하루 예시 채우기, 전체 초기화

## 개발

```bash
export PATH="$HOME/.tools/node-v24.22.3-linux-x64/bin:$PATH"
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # docs/ 로 정적 빌드 (GitHub Pages 소스)
```

아이콘 재생성: `python3 tools/generate_icons.py`

## 배포

`main` 브랜치의 `docs/` 폴더를 GitHub Pages 소스로 사용합니다.
빌드 결과물이 `docs/`에 들어가므로 `npm run build` 후 커밋·푸시하면 바로 반영됩니다.
`vite.config.ts`의 `base: './'` 덕분에 저장소 하위 경로(`/motemote-study/`)에서도 자산 경로가 맞습니다.

## 데이터 구조

```ts
AppData {
  subjects: { id, name, color }[]
  ddays:    { id, title, date }[]
  sessions: { id, subjectId, start, end }[]        // 타이머 기록(epoch ms)
  days:     Record<'YYYY-MM-DD', { tasks, memo, marks }>
  settings: { theme, wakeLock, autoCarry }
  timer:    { subjectId, mode, startedAt, accumulated, phase, focusMin, breakMin } | null
}
```

플래너의 하루는 새벽 05:00에 시작해 다음날 04:59에 끝나며, 통계도 같은 기준으로 집계합니다.
