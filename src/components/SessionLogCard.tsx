import { useMemo, type ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { durationText, formatTime, plannerDayKey } from '../lib/date';
import { useStore } from '../store';

/**
 * 선택한 날짜의 공부 기록(세션) 목록.
 * 실수로 켜 둔 기록처럼 필요 없는 세션 하나만 골라 지울 수 있다.
 */
export default function SessionLogCard({
  date,
  title = '공부 기록',
  headRight,
}: {
  date: string;
  title?: string;
  /** 섹션 제목 오른쪽에 같이 둘 요소 (날짜 이동 등) */
  headRight?: ReactNode;
}) {
  const { data, subjectById, deleteSession } = useStore();
  const [toast, showToast] = useToast();

  const sessions = useMemo(
    () =>
      data.sessions
        .filter((s) => plannerDayKey(s.start) === date)
        .sort((a, b) => a.start - b.start),
    [data.sessions, date],
  );

  return (
    <>
      {toast}
      <div className="section-title">
        <h2>{title}</h2>
        <div className="row" style={{ gap: 6, alignItems: 'center' }}>
          <span className="hint num">{sessions.length > 0 ? `${sessions.length}개` : '기록 없음'}</span>
          {headRight}
        </div>
      </div>

      <div className="card-flat" style={{ overflow: 'hidden' }}>
        {sessions.length === 0 ? (
          <div className="empty">이 날 저장된 공부 기록이 없어요</div>
        ) : (
          <div className="log-list">
            {sessions.map((s) => {
              const subject = subjectById(s.subjectId);
              const label = subject?.name ?? '삭제된 과목';
              const duration = durationText(s.end - s.start);
              return (
                <div className="log-item" key={s.id}>
                  <span className="bar" style={{ background: subject?.color ?? '#8D8D99' }} />
                  <div className="log-main">
                    <span className="name">{label}</span>
                    <span className="time num">
                      {formatTime(s.start)} ~ {formatTime(s.end)} · {duration}
                    </span>
                  </div>
                  <button
                    className="log-del"
                    aria-label={`${label} ${duration} 기록 삭제`}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `${label} ${duration} 기록을 지울까요?\n통계와 타임테이블에서도 바로 빠져요.`,
                        )
                      ) {
                        return;
                      }
                      deleteSession(s.id);
                      showToast('기록을 삭제했어요');
                    }}
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
