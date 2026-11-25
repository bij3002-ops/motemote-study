import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav';
import TimerTab from './components/TimerTab';
import PlannerTab from './components/PlannerTab';
import VocaTab from './components/VocaTab';
import RpgTab from './components/RpgTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import { applyFocusGray, isFocusGrayOn } from './lib/focus';
import { useStore } from './store';
import type { Tab } from './types';

function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const { data } = useStore();
  const [tab, setTab] = useState<Tab>('timer');
  const focusGray = isFocusGrayOn(data);

  // 타이머가 도는 동안에만 앱 전체를 흑백으로 (일시정지·저장·초기화·휴식이면 원래 색으로)
  useEffect(() => {
    applyFocusGray(focusGray);
  }, [focusGray]);

  useEffect(() => () => applyFocusGray(false), []);

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
      {tab === 'timer' && <TimerTab onOpenRpg={() => setTab('rpg')} />}
      {tab === 'planner' && <PlannerTab />}
      {tab === 'voca' && <VocaTab />}
      {tab === 'rpg' && <RpgTab onStartStudy={() => setTab('timer')} />}
      {tab === 'stats' && <StatsTab />}
      {tab === 'settings' && <SettingsTab />}
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
