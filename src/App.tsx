import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav';
import TimerTab from './components/TimerTab';
import PlannerTab from './components/PlannerTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import { useStore } from './store';
import type { Tab } from './types';

function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const { data } = useStore();
  const [tab, setTab] = useState<Tab>('timer');

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(data.settings.theme);
    };
    apply();
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (!mq) return;
    const onChange = () => {
      if (data.settings.theme === 'system') apply();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [data.settings.theme]);

  return (
    <div className="app">
      {tab === 'timer' && <TimerTab />}
      {tab === 'planner' && <PlannerTab />}
      {tab === 'stats' && <StatsTab />}
      {tab === 'settings' && <SettingsTab />}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
