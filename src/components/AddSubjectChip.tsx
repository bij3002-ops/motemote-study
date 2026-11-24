import { useState } from 'react';
import SubjectAddSheet from './SubjectAddSheet';

type Props = {
  onAdded: (id: string) => void;
  /** 작은 칩 줄(할 일·타임테이블)에서 쓰는 축소 스타일 */
  compact?: boolean;
  label?: string;
};

export default function AddSubjectChip({ onAdded, compact, label = '+ 과목' }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="chip chip-add"
        style={compact ? { height: 28, fontSize: 11.5, padding: '0 10px' } : undefined}
        onClick={() => setOpen(true)}
        aria-label="새 과목 추가"
      >
        {label}
      </button>
      <SubjectAddSheet open={open} onClose={() => setOpen(false)} onAdded={onAdded} />
    </>
  );
}
