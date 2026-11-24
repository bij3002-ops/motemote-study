import { diffDays, todayKey } from '../lib/date';
import { useStore } from '../store';

export function ddayRemaining(date: string): number {
  return diffDays(todayKey(), date);
}

export function ddayLabel(date: string): string {
  const rest = ddayRemaining(date);
  if (rest > 0) return `D-${rest}`;
  if (rest === 0) return 'D-DAY';
  return `D+${Math.abs(rest)}`;
}

export default function DDayStrip({ limit = 3 }: { limit?: number }) {
  const { data } = useStore();
  const today = todayKey();
  const sorted = [...data.ddays]
    .filter((d) => d.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, limit);

  if (sorted.length === 0) return null;

  return (
    <div className="dday-strip">
      {sorted.map((d) => (
        <div className="dday-pill" key={d.id}>
          <span className="dday-num num">{ddayLabel(d.date)}</span>
          <span className="dday-label">{d.title}</span>
        </div>
      ))}
    </div>
  );
}
