import { useMemo, useState } from 'react';
import { useStore } from '../store';
import type { TaskStatus } from '../types';
import AddSubjectChip from './AddSubjectChip';

const STATUS_GLYPH: Record<TaskStatus, string> = {
  todo: '○',
  doing: '△',
  done: '✓',
  carry: '→',
};

const STATUS_NAME: Record<TaskStatus, string> = {
  todo: '미완료',
  doing: '진행중',
  done: '완료',
  carry: '내일로 이월',
};

export default function TaskManager({ date }: { date: string }) {
  const { subjects, dayOf, addTask, cycleTask, deleteTask } = useStore();
  const day = dayOf(date);
  const [filter, setFilter] = useState<string>('all');
  const [text, setText] = useState('');
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? '');

  const activeSubjectId = subjects.some((s) => s.id === subjectId) ? subjectId : subjects[0]?.id ?? '';

  const tasks = useMemo(() => {
    const list = day.tasks ?? [];
    return filter === 'all' ? list : list.filter((t) => t.subjectId === filter);
  }, [day.tasks, filter]);

  const doneCount = (day.tasks ?? []).filter((t) => t.status === 'done').length;
  const totalCount = (day.tasks ?? []).length;

  const submit = () => {
    if (!text.trim() || !activeSubjectId) return;
    addTask(date, activeSubjectId, text);
    setText('');
  };

  return (
    <section className="card-flat" style={{ overflow: 'hidden' }}>
      <div className="task-head">
        <h2>할 일</h2>
        <span className="count num">
          {doneCount} / {totalCount}
        </span>
      </div>

      <div className="chip-row" style={{ padding: '0 12px 8px' }}>
        <button
          className="chip"
          aria-pressed={filter === 'all'}
          style={{ height: 28, fontSize: 11.5, padding: '0 10px' }}
          onClick={() => setFilter('all')}
        >
          전체
        </button>
        {subjects.map((s) => (
          <button
            key={s.id}
            className="chip"
            aria-pressed={filter === s.id}
            style={{ ['--chip-color' as string]: s.color, height: 28, fontSize: 11.5, padding: '0 10px' }}
            onClick={() => setFilter(s.id)}
          >
            <span className="dot" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
        <AddSubjectChip
          compact
          onAdded={(id) => {
            setFilter('all');
            setSubjectId(id);
          }}
        />
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty" style={{ padding: '12px 8px 18px' }}>
            {totalCount === 0 ? '오늘의 할 일을 적어 보세요' : '이 과목에는 할 일이 없어요'}
          </div>
        ) : (
          tasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);
            return (
              <div className="task-item" key={task.id}>
                <button
                  className={`status-btn ${task.status}`}
                  onClick={() => cycleTask(date, task.id)}
                  aria-label={`${task.text} · ${STATUS_NAME[task.status]} (누르면 상태 변경)`}
                  title={STATUS_NAME[task.status]}
                >
                  {STATUS_GLYPH[task.status]}
                </button>
                <span
                  className="dot"
                  style={{ width: 7, height: 7, borderRadius: 4, background: subject?.color ?? '#8D8D99', flex: '0 0 auto' }}
                />
                <span className={`task-text${task.status === 'done' ? ' done' : ''}`}>{task.text}</span>
                <button className="task-del" onClick={() => deleteTask(date, task.id)} aria-label="할 일 삭제">
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="task-add">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="할 일 추가"
          aria-label="할 일 추가"
        />
        <select
          value={activeSubjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          aria-label="과목 선택"
          style={{ color: subjects.find((s) => s.id === activeSubjectId)?.color }}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id} style={{ color: 'var(--ink)' }}>
              {s.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" onClick={submit} style={{ height: 40, borderRadius: 11 }}>
          추가
        </button>
      </div>
    </section>
  );
}
