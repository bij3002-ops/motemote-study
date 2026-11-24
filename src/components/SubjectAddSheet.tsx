import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { COLOR_PALETTE } from '../lib/storage';
import { useStore } from '../store';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded: (id: string) => void;
};

/** 타이머·플래너·타임테이블 어디서든 바로 쓰는 과목 빠른 추가 시트 */
export default function SubjectAddSheet({ open, onClose, onAdded }: Props) {
  const { addSubject } = useStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);

  useEffect(() => {
    if (open) {
      setName('');
      setColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)] ?? COLOR_PALETTE[0]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = addSubject(trimmed, color);
    if (id) onAdded(id);
    onClose();
  };

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="과목 빠른 추가"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" />
        <h3 className="sheet-title">새 과목 추가</h3>
        <p className="sheet-sub">이름을 적고 색을 고르면 바로 선택돼요</p>
        <input
          className="sheet-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="예: 전공공부, 재무회계, 데이터분석"
          aria-label="새 과목 이름"
          autoFocus
          maxLength={20}
        />
        <div className="palette sheet-palette">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              style={{ background: c }}
              aria-pressed={color === c}
              aria-label={`과목 색 ${c}`}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="sheet-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            취소
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={!name.trim()}>
            추가하고 선택
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
