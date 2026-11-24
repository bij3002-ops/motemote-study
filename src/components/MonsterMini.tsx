import { monsterAt } from '../lib/rpg';
import { useStore } from '../store';

/** 타이머 화면에서 공부하는 동안 HP가 깎이는 걸 보는 미니 바 */
export default function MonsterMini({ onOpen }: { onOpen?: () => void }) {
  const { data } = useStore();
  const rpg = data.rpg;
  const monster = monsterAt(rpg.stage);
  const hp = Math.max(0, Math.min(monster.maxHp, rpg.hp));
  const pct = monster.maxHp > 0 ? (hp / monster.maxHp) * 100 : 0;
  const progress = Math.round(100 - pct);

  const inner = (
    <>
      <span className="mm-face" aria-hidden="true">
        {monster.emoji}
      </span>
      <span className="mm-body">
        <span className="mm-top">
          <span className="mm-stage">STAGE {rpg.stage}</span>
          <span className="mm-name">{monster.label}</span>
          <span className="mm-hp num">
            {hp}/{monster.maxHp}
          </span>
        </span>
        <span className="hpbar mm-bar">
          <span style={{ width: `${pct}%` }} />
        </span>
      </span>
      <span className="mm-side">
        <span className="mm-gold num">🪙 {monster.gold}</span>
        {onOpen && <span className="mm-arrow">›</span>}
      </span>
    </>
  );

  if (!onOpen) return <div className="monster-mini">{inner}</div>;
  return (
    <button
      className="monster-mini as-button"
      onClick={onOpen}
      aria-label={`현재 몬스터 ${monster.label}, ${hp}/${monster.maxHp} HP, ${progress}% 진행. RPG 탭 열기`}
    >
      {inner}
    </button>
  );
}
