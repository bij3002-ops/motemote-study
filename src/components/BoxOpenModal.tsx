import { createPortal } from 'react-dom';
import type { BoxOpenResult } from '../lib/rpg';

export default function BoxOpenModal({
  results,
  boxesLeft,
  onOpenMore,
  onOpenAll,
  onClose,
}: {
  results: BoxOpenResult[];
  boxesLeft: number;
  onOpenMore: () => void;
  onOpenAll: () => void;
  onClose: () => void;
}) {
  const totalGold = results.reduce((a, r) => a + r.gold + r.killGold, 0);
  const totalXp = results.reduce((a, r) => a + r.xp + r.killXp, 0);
  const totalDamage = results.reduce((a, r) => a + r.damage, 0);
  const last = results[results.length - 1];
  const levelUps = results.reduce((a, r) => a + r.levelsGained, 0);
  const anyKill = results.some((r) => r.kills.length > 0);

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet result-sheet box-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="집중 상자 개봉 결과"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" />

        <div className="box-head">
          <span className="box-head-emoji" aria-hidden="true">
            🎁
          </span>
          <div>
            <h2 className="sheet-title">집중 상자 개봉</h2>
            <p className="sheet-sub">
              {results.length}개 열었어요 · 남은 상자 <b className="num">{boxesLeft}</b>개
            </p>
          </div>
        </div>

        <div className="box-total">
          <div>
            <b className="num gold">+{totalGold}</b>
            <span>골드</span>
          </div>
          <div>
            <b className="num">+{totalXp}</b>
            <span>XP</span>
          </div>
          <div>
            <b className="num">{totalDamage > 0 ? `-${totalDamage}` : '0'}</b>
            <span>추가 데미지</span>
          </div>
        </div>

        <div className="box-list">
          {results.map((r, i) => (
            <div className={`box-open tier-${r.tier}`} key={`${r.tier}-${i}`}>
              <div className="box-open-top">
                <span className="box-open-emoji" aria-hidden="true">
                  {r.emoji}
                </span>
                <b className={`box-open-tier tier-${r.tier}`}>{r.label}</b>
                <span className="box-open-gain num">
                  {r.gold + r.killGold > 0 && <>🪙 +{r.gold + r.killGold} </>}
                  {r.xp + r.killXp > 0 && <>· +{r.xp + r.killXp} XP</>}
                  {r.damage > 0 && <>· -{r.damage} HP</>}
                </span>
              </div>

              {r.damage > 0 && r.kills.length === 0 && (
                <div className="box-open-sub num">{r.monsterEmoji} {r.monsterLabel} HP를 깎았어요</div>
              )}

              {r.kills.map((k, ki) => (
                <div className="box-open-kill" key={`${k.id}-${ki}`}>
                  <span aria-hidden="true">{k.emoji}</span>
                  <span>
                    <b>{k.label} 처치!</b> +{k.gold} 골드 · {k.loot}
                    {k.newTitle && <em className="rk-title"> · 칭호 ‘{k.newTitle}’ 획득</em>}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {levelUps > 0 && last && (
          <div className="result-banner">🎉 레벨 업! Lv.{last.level} 이 됐어요</div>
        )}

        <div className="result-next">
          {anyKill ? '다음 상대' : '현재 상대'} <b>{last?.monsterEmoji} {last?.monsterLabel}</b>
        </div>

        <div className="sheet-actions">
          {boxesLeft > 0 && (
            <>
              <button className="btn btn-line" onClick={onOpenMore}>
                하나 더 열기
              </button>
              {boxesLeft > 1 && (
                <button className="btn btn-ghost" onClick={onOpenAll}>
                  모두 열기
                </button>
              )}
            </>
          )}
          <button className="btn btn-primary" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
