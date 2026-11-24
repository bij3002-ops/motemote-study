import type { Tab } from '../types';

const items: Array<{ key: Tab; label: string; icon: JSX.Element }> = [
  {
    key: 'timer',
    label: '타이머',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9.5V13l2.5 1.7" />
        <path d="M9 2.5h6" />
        <path d="M12 2.5V5" />
      </svg>
    ),
  },
  {
    key: 'planner',
    label: '플래너',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
        <path d="M3.5 9.5h17" />
        <path d="M9 9.5v11" />
        <path d="M9 14.5h11.5" />
        <path d="M15 14.5v6" />
      </svg>
    ),
  },
  {
    key: 'stats',
    label: '통계',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10" />
        <path d="M10 20V4.5" />
        <path d="M16 20v-6" />
        <path d="M21.5 20H2.5" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'D-Day',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
        <path d="M9 2.5h6" />
      </svg>
    ),
  },
];

export default function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="주요 탭">
      <div className="bottom-nav-inner">
        {items.map((item) => (
          <button
            key={item.key}
            className={`nav-item${tab === item.key ? ' active' : ''}`}
            onClick={() => onChange(item.key)}
            aria-current={tab === item.key ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
