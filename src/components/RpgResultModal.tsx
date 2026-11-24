import { createPortal } from 'react-dom';
import { tierLabel } from '../lib/rpg';
import type { RpgReward } from '../types';

export default function RpgResultModal({ reward, onClose }: { reward: RpgReward; onClose: () => void }) {
  const killed = reward.kills.length > 0;

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet result-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="공부 보상 결과"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" />
        <div className={`result-hero${reward.tier === 'critical' ? ' critical' : reward.tier === 'focus' ? ' focus' : ''}`}>
          <div className="result-damage num">-{reward.damage} HP</div>
          <div className="result-tier">{tierLabel(reward.tier)}</div>
        </div>

        <div className="result-hp">
          <span className="num">
            {reward.hpBefore} → {reward.hpAfter} HP
          </span>
          <span className="hpbar">
            <span style={{ width: `${reward.monsterMaxAfter > 0 ? (reward.hpAfter / reward.monsterMaxAfter) * 100 : 0}%` }} />
          </span>
        </div>

        <div className="result-stats">
          <div>
            <b className="num">+{reward.xpGained}</b>
            <span>XP</span>
          </div>
          <div>
            <b className="num gold">+{reward.goldGained}</b>
            <span>골드</span>
          </div>
          <div>
            <b className="num">{reward.minutes}</b>
            <span>분 공부</span>
          </div>
        </div>

        {reward.levelsGained > 0 && (
          <div className="result-banner">🎉 레벨 업! Lv.{reward.level} 이 됐어요</div>
        )}

        {killed && (
          <div className="result-kills">
            {reward.kills.map((k, i) => (
              <div className="result-kill" key={`${k.id}-${i}`}>
                <span className="rk-emoji" aria-hidden="true">
                  {k.emoji}
                </span>
                <span>
                  <b>{k.label} 처치!</b> +{k.gold} 골드 · {k.loot}
                  {k.newTitle && <em className="rk-title"> · 칭호 ‘{k.newTitle}’ 획득</em>}
                </span>
              </div>
            ))}
          </div>
        )}

        {(reward.boxes > 0 || reward.badges.length > 0) && (
          <div className="result-extra">
            {reward.boxes > 0 && <span className="tag">🎁 집중 상자 ×{reward.boxes}</span>}
            {reward.badges.map((b) => (
              <span className="tag" key={b}>
                🏅 {b}
              </span>
            ))}
          </div>
        )}

        <div className="result-next">
          다음 상대 <b>{reward.monsterEmoji} {reward.monsterLabel}</b>
        </div>

        <button className="btn btn-primary" onClick={onClose}>
          확인
        </button>
      </div>
    </div>,
    document.body,
  );
}
