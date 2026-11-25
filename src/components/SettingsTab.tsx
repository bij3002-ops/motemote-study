import { useRef, useState } from 'react';
import { useToast } from '../hooks/useToast';
import { addDays, diffDays, formatDotDate, todayKey } from '../lib/date';
import { COLOR_PALETTE } from '../lib/storage';
import { loadCbt, normalizeCbt, saveCbt } from '../lib/cbt';
import { broadcastProgressChange, loadProgress, normalizeProgress, saveProgress } from '../lib/voca';
import {
  broadcastSpeakingChange,
  loadSpeakingStore,
  normalizeSpeakingStore,
  saveSpeakingStore,
} from '../lib/speaking';
import { useStore } from '../store';
import type { AppData, ThemeSetting } from '../types';

function ddayBadge(date: string): { top: string; bottom: string } {
  const rest = diffDays(todayKey(), date);
  if (rest > 0) return { top: `D-${rest}`, bottom: '남음' };
  if (rest === 0) return { top: 'D-DAY', bottom: '오늘' };
  return { top: `D+${Math.abs(rest)}`, bottom: '지남' };
}

const THEMES: Array<{ key: ThemeSetting; label: string }> = [
  { key: 'light', label: '라이트' },
  { key: 'dark', label: '다크' },
  { key: 'system', label: '시스템' },
];

export default function SettingsTab() {
  const store = useStore();
  const { data } = store;
  const [toast, showToast] = useToast();

  const [newDdayTitle, setNewDdayTitle] = useState('');
  const [newDdayDate, setNewDdayDate] = useState(addDays(todayKey(), 30));
  const [newSubject, setNewSubject] = useState('');
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [paletteFor, setPaletteFor] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const sortedDDays = [...data.ddays].sort((a, b) => (a.date < b.date ? -1 : 1));

  const exportJson = () => {
    // 단어장 학습 기록 · 기출 CBT 기록 · 내 영어 스크립트도 같은 백업 파일에 담는다.
    const payload = { ...data, voca: loadProgress(), cbt: loadCbt(), speaking: loadSpeakingStore() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motemote-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('백업 파일을 만들었어요');
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData & {
          voca?: unknown;
          cbt?: unknown;
          speaking?: unknown;
        };
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.subjects)) {
          showToast('이 파일은 백업 형식이 아니에요');
          return;
        }
        if (!window.confirm('지금 기록을 불러온 파일로 바꿀까요? (되돌릴 수 없어요)')) return;
        store.importData(parsed);
        if (parsed.voca) {
          saveProgress(normalizeProgress(parsed.voca));
          broadcastProgressChange();
        }
        if (parsed.cbt) saveCbt(normalizeCbt(parsed.cbt));
        if (parsed.speaking) {
          saveSpeakingStore(normalizeSpeakingStore(parsed.speaking));
          broadcastSpeakingChange();
        }
        const extra = [parsed.voca ? '단어장' : '', parsed.cbt ? '기출 CBT' : '', parsed.speaking ? '영어 스크립트' : '']
          .filter(Boolean)
          .join('·');
        showToast(extra ? `기록과 ${extra}를 불러왔어요` : '기록을 불러왔어요');
      } catch {
        showToast('파일을 읽지 못했어요');
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="screen">
      {toast}
      <header className="topbar">
        <div>
          <p className="eyebrow">{formatDotDate(todayKey())}</p>
          <h1 className="title">D-Day · 설정</h1>
        </div>
      </header>

      <div className="section-title">
        <h2>D-DAY</h2>
        <span className="hint">{sortedDDays.length}개</span>
      </div>

      <div className="card-flat" style={{ overflow: 'hidden' }}>
        {sortedDDays.length === 0 && <div className="empty">D-Day를 추가해 보세요</div>}
        {sortedDDays.map((d) => {
          const badge = ddayBadge(d.date);
          return (
            <div className="dday-card" key={d.id} style={{ borderTop: '1px solid var(--line)' }}>
              <div className="dday-badge num">
                {badge.top}
                <small>{badge.bottom}</small>
              </div>
              <div className="dday-fields">
                <input
                  className="title-input"
                  value={d.title}
                  onChange={(e) => store.updateDDay(d.id, { title: e.target.value })}
                  aria-label="D-Day 이름"
                />
                <input
                  className="date-input num"
                  type="date"
                  value={d.date}
                  onChange={(e) => {
                    if (e.target.value) store.updateDDay(d.id, { date: e.target.value });
                  }}
                  aria-label="D-Day 날짜"
                />
              </div>
              <button
                className="task-del"
                onClick={() => store.deleteDDay(d.id)}
                aria-label="D-Day 삭제"
              >
                ×
              </button>
            </div>
          );
        })}
        <div className="add-form">
          <input
            type="text"
            value={newDdayTitle}
            onChange={(e) => setNewDdayTitle(e.target.value)}
            placeholder="D-Day 이름 (예: 시험일)"
            aria-label="새 D-Day 이름"
          />
          <input
            type="date"
            value={newDdayDate}
            onChange={(e) => setNewDdayDate(e.target.value)}
            aria-label="새 D-Day 날짜"
          />
          <button
            className="btn btn-primary btn-sm"
            style={{ height: 40 }}
            onClick={() => {
              store.addDDay(newDdayTitle, newDdayDate);
              setNewDdayTitle('');
            }}
          >
            추가
          </button>
        </div>
      </div>

      <div className="section-title">
        <h2>과목</h2>
        <span className="hint">색을 누르면 바뀌어요</span>
      </div>

      <div className="card-flat" style={{ overflow: 'hidden' }}>
        {data.subjects.map((s, index) => (
          <div key={s.id}>
            <div className="subject-row" style={index === 0 ? undefined : { borderTop: '1px solid var(--line)' }}>
              <button
                className="color-dot"
                style={{ background: s.color }}
                onClick={() => setPaletteFor(paletteFor === s.id ? null : s.id)}
                aria-label={`${s.name} 색 변경`}
              />
              <input
                value={s.name}
                onChange={(e) => store.updateSubject(s.id, { name: e.target.value })}
                aria-label="과목 이름"
              />
              <button
                className="task-del"
                onClick={() => {
                  if (data.subjects.length <= 1) {
                    showToast('과목은 하나 이상 있어야 해요');
                    return;
                  }
                  if (window.confirm(`'${s.name}' 과목과 관련 기록을 지울까요?`)) store.deleteSubject(s.id);
                }}
                aria-label="과목 삭제"
              >
                ×
              </button>
            </div>
            {paletteFor === s.id && (
              <div className="palette">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    style={{ background: c }}
                    aria-pressed={s.color === c}
                    aria-label={`색 ${c}`}
                    onClick={() => {
                      store.updateSubject(s.id, { color: c });
                      setPaletteFor(null);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="add-form" style={{ flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="새 과목 이름"
            aria-label="새 과목 이름"
          />
          <div className="palette" style={{ borderTop: 'none', padding: '0', width: '100%' }}>
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                style={{ background: c }}
                aria-pressed={newColor === c}
                aria-label={`새 과목 색 ${c}`}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ height: 40, width: '100%' }}
            onClick={() => {
              store.addSubject(newSubject, newColor);
              setNewSubject('');
            }}
          >
            과목 추가
          </button>
        </div>
      </div>

      <div className="section-title">
        <h2>설정</h2>
      </div>

      <div className="card-flat" style={{ overflow: 'hidden' }}>
        <div className="toggle-row">
          <div>
            <div className="label">테마</div>
            <div className="sub">아이보리 페이퍼 / 다크</div>
          </div>
          <div className="seg" style={{ width: 168 }}>
            {THEMES.map((t) => (
              <button
                key={t.key}
                aria-pressed={data.settings.theme === t.key}
                onClick={() => store.updateSettings({ theme: t.key })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="toggle-row" style={{ borderTop: '1px solid var(--line)' }}>
          <div>
            <div className="label">타이머 실행 시 흑백 집중 모드</div>
            <div className="sub">재는 동안 화면 색을 빼서 도파민 자극을 줄여요</div>
          </div>
          <button
            className="switch"
            aria-pressed={data.settings.focusGrayscale !== false}
            aria-label="타이머 실행 시 흑백 집중 모드"
            onClick={() => store.updateSettings({ focusGrayscale: data.settings.focusGrayscale === false })}
          />
        </div>
        <div className="toggle-row" style={{ borderTop: '1px solid var(--line)' }}>
          <div>
            <div className="label">내일로 이월 자동 복사</div>
            <div className="sub">‘→’ 로 넘기면 다음 날 플래너에도 생겨요</div>
          </div>
          <button
            className="switch"
            aria-pressed={data.settings.autoCarry}
            aria-label="이월 자동 복사"
            onClick={() => store.updateSettings({ autoCarry: !data.settings.autoCarry })}
          />
        </div>
      </div>

      <div className="section-title">
        <h2>데이터</h2>
        <span className="hint">이 기기에만 저장돼요</span>
      </div>

      <div className="card info-text">
        <b>초기화는 두 가지예요</b>
        <br />· <b>공부 기록만 초기화</b> — 타이머로 잰 공부 기록만 모두 지워요. 과목·D-Day·할 일·RPG·단어장은
        그대로 남아요.
        <br />· <b>전체 초기화</b> — 과목·D-Day·할 일·RPG·공부 기록까지 전부 처음 상태로 돌려요. (단어장 학습
        기록은 남아요)
        <br />
        실수로 저장된 기록 한두 개만 지우려면 플래너·통계 탭의 기록 목록에서 <b>삭제</b>를 누르세요.
      </div>

      <div className="card row-actions" style={{ gap: 10 }}>
        <button className="btn btn-ghost" onClick={exportJson}>
          JSON으로 내보내기 (백업)
        </button>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          JSON 불러오기 (복원)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importJson(file);
            e.target.value = '';
          }}
        />
        <button
          className="btn btn-line"
          onClick={() => {
            const date = store.fillSampleDay();
            showToast(`${date} 에 예시 기록을 넣었어요`);
          }}
        >
          어제에 예시 하루 채우기
        </button>
        <button
          className="btn btn-line"
          style={{
            color: 'var(--danger)',
            borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)',
          }}
          disabled={data.sessions.length === 0}
          onClick={() => {
            if (data.sessions.length === 0) return;
            if (
              window.confirm(
                `공부 기록 ${data.sessions.length}개를 모두 지울까요?\n과목·D-Day·할 일·RPG는 그대로 남아요.`,
              )
            ) {
              store.resetSessions();
              showToast('공부 기록만 지웠어요');
            }
          }}
        >
          공부 기록만 초기화{data.sessions.length > 0 ? ` (${data.sessions.length}개)` : ''}
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (
              window.confirm(
                '과목·D-Day·할 일·RPG·공부 기록을 모두 처음 상태로 되돌릴까요?\n이 작업은 되돌릴 수 없어요.',
              )
            ) {
              store.resetAll();
              showToast('처음 상태로 되돌렸어요');
            }
          }}
        >
          전체 초기화
        </button>
      </div>

      <div className="card info-text">
        <b>홈 화면에 추가</b>
        <br />
        iPhone Safari에서 공유 버튼 → ‘홈 화면에 추가’를 누르면 앱처럼 전체 화면으로 열려요.
        <br />
        <br />
        10분 공부 플래너 · 기록은 서버 없이 이 기기 브라우저(localStorage)에만 저장되고, 백업은 JSON 내보내기로
        보관하세요.
      </div>
    </main>
  );
}
