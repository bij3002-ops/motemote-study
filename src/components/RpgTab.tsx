import { useMemo } from 'react';
import { useToast } from '../hooks/useToast';
import {
  BADGE_FOCUS_50,
  ITEMS,
  MONSTERS,
  TITLES,
  itemById,
  monsterAt,
  titleById,
  totalKills,
  xpToNext,
} from '../lib/rpg';
import { useStore } from '../store';

export default function RpgTab({ onStartStudy }: { onStartStudy?: () => void }) {
  const { data, buyTitle, equipTitle, buyItem, equipItem } = useStore();
  const [toast, showToast] = useToast();
  const rpg = data.rpg;

  const monster = monsterAt(rpg.stage);
  const hp = Math.max(0, Math.min(monster.maxHp, rpg.hp));
  const hpPct = monster.maxHp > 0 ? (hp / monster.maxHp) * 100 : 0;
  const dealtPct = Math.round(100 - hpPct);
  const needXp = xpToNext(rpg.level);
  const xpPct = needXp > 0 ? Math.min(100, (rpg.xp / needXp) * 100) : 0;
  const kills = totalKills(rpg);
  const equippedTitle = titleById(rpg.title);
  const equippedItem = itemById(rpg.item);
  const defeatedTypes = MONSTERS.filter((m) => (rpg.kills[m.id] ?? 0) > 0).length;

  const lootList = useMemo(
    () =>
      MONSTERS.map((m) => ({ def: m.loot, count: rpg.loot[m.loot.id] ?? 0 })).filter((x) => x.count > 0),
    [rpg.loot],
  );

  return (
    <main className="screen">
      {toast}
      <header className="topbar">
        <div>
          <p className="eyebrow">공부가 곧 공격</p>
          <h1 className="title">RPG</h1>
        </div>
        <div className="topbar-right">
          <span className="pill num gold-pill">🪙 {rpg.gold}</span>
        </div>
      </header>

      {/* 내 캐릭터 */}
      <section className="card char-card">
        <div className="char-top">
          <div className="char-avatar" aria-hidden="true">
            🧑‍🎓
          </div>
          <div className="char-id">
            <div className="char-name">
              Lv.<b className="num">{rpg.level}</b> 공부 전사
            </div>
            <div className="char-title">
              {equippedTitle ? `‘${equippedTitle.name}’` : '칭호 없음'}
              {equippedItem && equippedItem.atk > 0 && (
                <span className="char-item"> · {equippedItem.emoji} {equippedItem.name}</span>
              )}
            </div>
          </div>
          <div className={`char-streak${rpg.streak > 0 ? ' on' : ''}`}>
            🔥 <b className="num">{rpg.streak}</b>일
            <small>연속 집중</small>
          </div>
        </div>

        <div className="xp-row">
          <span className="xp-k">XP</span>
          <span className="xpbar">
            <span style={{ width: `${xpPct}%` }} />
          </span>
          <span className="xp-v num">
            {rpg.xp} / {needXp}
          </span>
        </div>

        <div className="char-stats">
          <div>
            <b className="num">{rpg.gold}</b>
            <span>보유 골드</span>
          </div>
          <div>
            <b className="num">{kills}</b>
            <span>처치한 몬스터</span>
          </div>
          <div>
            <b className="num">{Math.round(rpg.totalMinutes)}</b>
            <span>누적 공부(분)</span>
          </div>
          <div>
            <b className="num">{rpg.bestSession}</b>
            <span>최고 집중(분)</span>
          </div>
        </div>
      </section>

      {/* 현재 몬스터 */}
      <section className={`card battle-card${rpg.stage > 5 ? ' elite' : ''}`}>
        <div className="battle-head">
          <span className="stage-chip">
            STAGE {rpg.stage} · Lv.{monster.cycle}
          </span>
          <span className="reward-chip num">🪙 +{monster.gold}</span>
        </div>
        <div className="monster-face" aria-hidden="true">
          {monster.emoji}
        </div>
        <h2 className="monster-name">{monster.label}</h2>
        <p className="monster-blurb">{monster.blurb}</p>

        <div className="hpbar big">
          <span style={{ width: `${hpPct}%` }} />
        </div>
        <div className="hp-meta">
          <span className="num">
            {hp} / {monster.maxHp} HP
          </span>
          <span className="muted num">{dealtPct}% 격파</span>
        </div>

        <div className="battle-rules">
          <span>1분 = 1 데미지</span>
          <span>25분+ +20%</span>
          <span>50분+ ×1.5</span>
        </div>

        <button className="btn btn-primary" onClick={onStartStudy}>
          공부하고 때리러 가기
        </button>
      </section>

      {/* 몬스터 도감 */}
      <div className="section-title">
        <h2>몬스터 도감</h2>
        <span className="hint num">
          {defeatedTypes} / {MONSTERS.length} 발견
        </span>
      </div>
      <div className="dex-grid">
        {MONSTERS.map((m) => {
          const count = rpg.kills[m.id] ?? 0;
          return (
            <div className={`dex-item${count > 0 ? '' : ' locked'}`} key={m.id}>
              <div className="dex-emoji" aria-hidden="true">
                {count > 0 ? m.emoji : '❔'}
              </div>
              <div className="dex-name">{count > 0 ? m.name : '???'}</div>
              <div className="dex-sub num">
                {count > 0 ? `${count}회 처치` : `HP ${m.hp}`}
              </div>
              <div className="dex-loot">{count > 0 ? m.loot.name : '미발견'}</div>
            </div>
          );
        })}
      </div>

      {/* 칭호 상점 */}
      <div className="section-title">
        <h2>칭호</h2>
        <span className="hint">처치 보상 · 골드 구매</span>
      </div>
      <div className="card-flat shop">
        {TITLES.map((t) => {
          const owned = rpg.titles.includes(t.id);
          const equipped = rpg.title === t.id;
          return (
            <div className="shop-row" key={t.id}>
              <div className="shop-info">
                <div className="shop-name">
                  {t.name}
                  {equipped && <span className="tag on">장착 중</span>}
                </div>
                <div className="shop-desc">{t.desc}</div>
              </div>
              {owned ? (
                <button
                  className="btn btn-line btn-sm shop-btn"
                  disabled={equipped}
                  onClick={() => {
                    equipTitle(t.id);
                    showToast(`‘${t.name}’ 칭호를 장착했어요`);
                  }}
                >
                  {equipped ? '장착됨' : '장착'}
                </button>
              ) : t.source === 'shop' ? (
                <button
                  className="btn btn-ghost btn-sm shop-btn"
                  disabled={rpg.gold < t.cost}
                  onClick={() => {
                    if (buyTitle(t.id)) showToast(`‘${t.name}’ 칭호를 샀어요`);
                  }}
                >
                  🪙 {t.cost}
                </button>
              ) : (
                <span className="shop-lock">처치 보상</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 장비 상점 */}
      <div className="section-title">
        <h2>장비</h2>
        <span className="hint">{equippedItem ? `공격력 +${Math.round(equippedItem.atk * 100)}%` : '공격력 보너스'}</span>
      </div>
      <div className="card-flat shop">
        {ITEMS.map((item) => {
          const owned = rpg.items.includes(item.id);
          const equipped = rpg.item === item.id;
          return (
            <div className="shop-row" key={item.id}>
              <span className="shop-emoji" aria-hidden="true">
                {item.emoji}
              </span>
              <div className="shop-info">
                <div className="shop-name">
                  {item.name}
                  {equipped && <span className="tag on">장착 중</span>}
                </div>
                <div className="shop-desc">{item.desc}</div>
              </div>
              {owned ? (
                <button
                  className="btn btn-line btn-sm shop-btn"
                  disabled={equipped}
                  onClick={() => {
                    equipItem(item.id);
                    showToast(`${item.name} 장착 · 공부 공격력 +${Math.round(item.atk * 100)}%`);
                  }}
                >
                  {equipped ? '장착됨' : '장착'}
                </button>
              ) : (
                <button
                  className="btn btn-ghost btn-sm shop-btn"
                  disabled={rpg.gold < item.cost}
                  onClick={() => {
                    if (buyItem(item.id)) showToast(`${item.name} 구매 · 공부 공격력 +${Math.round(item.atk * 100)}%`);
                  }}
                >
                  🪙 {item.cost}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 전리품 */}
      <div className="section-title">
        <h2>전리품</h2>
        <span className="hint num">🎁 상자 {rpg.boxes}개</span>
      </div>
      <div className="card-flat loot-card">
        {lootList.length === 0 && rpg.boxes === 0 ? (
          <div className="empty">몬스터를 처치하면 전리품이 쌓여요</div>
        ) : (
          <div className="loot-wrap">
            {lootList.map((x) => (
              <span className="loot-chip" key={x.def.id}>
                {x.def.name} ×{x.count}
              </span>
            ))}
            {rpg.boxes > 0 && <span className="loot-chip box">🎁 집중 상자 ×{rpg.boxes}</span>}
            {(rpg.badges[BADGE_FOCUS_50.id] ?? 0) > 0 && (
              <span className="loot-chip badge">
                🏅 {BADGE_FOCUS_50.name} ×{rpg.badges[BADGE_FOCUS_50.id]}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 보상 규칙 */}
      <div className="card info-text rpg-rules">
        <b>집중 보상 규칙</b>
        <br />· 공부 1분 = 몬스터 HP 1
        <br />· <b>25분 이상</b> 한 번에 집중 → 데미지 +20%, 🎁 집중 상자, 보너스 10골드
        <br />· <b>50분 이상</b> 한 번에 집중 → 데미지 ×1.5, 🏅 집중의 증표, 상자 2개, 보너스 25골드
        <br />· 장비를 장착하면 데미지가 더 올라가요 (최대 +50%)
        <br />· 5단계를 다 잡으면 Lv.2 몬스터가 더 강해져서 다시 나타나요
      </div>
    </main>
  );
}
