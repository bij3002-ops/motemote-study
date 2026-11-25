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
    key: 'voca',
    label: '단어장',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 5.2c0-.9.7-1.6 1.6-1.6H11v16.2H6.1c-.9 0-1.6-.7-1.6-1.6V5.2Z" />
        <path d="M19.5 5.2c0-.9-.7-1.6-1.6-1.6H13v16.2h4.9c.9 0 1.6-.7 1.6-1.6V5.2Z" />
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
    key: 'rpg',
    label: 'RPG',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.2 5 6v5.9c0 4.2 3 7.5 7 8.9 4-1.4 7-4.7 7-8.9V6l-7-2.8Z" />
        <path d="m8.8 12 2.2 2.2 4.3-4.4" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: '설정',
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
