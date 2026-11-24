import type { RpgKill, RpgReward, RpgState, RpgTier } from '../types';
import { addDays, todayKey } from './date';

/* =========================================================
   공부 RPG — 공부한 1분이 몬스터에게 1 데미지
   ========================================================= */

export type LootDef = { id: string; name: string };

export type MonsterDef = {
  id: string;
  name: string;
  emoji: string;
  /** 기본 HP = 처치에 필요한 공부 분 */
  hp: number;
  gold: number;
  blurb: string;
  loot: LootDef;
  titleId: string;
};

export const MONSTERS: MonsterDef[] = [
  {
    id: 'slime',
    name: '졸음 슬라임',
    emoji: '😴',
    hp: 30,
    gold: 60,
    blurb: '30분만 공부하면 물러가는 게으름 덩어리',
    loot: { id: 'loot_jelly', name: '슬라임 젤리' },
    titleId: 'title_slime',
  },
  {
    id: 'goblin',
    name: '딴짓 고블린',
    emoji: '👺',
    hp: 50,
    gold: 110,
    blurb: '폰을 만지려는 순간 튀어나오는 방해꾼',
    loot: { id: 'loot_coin', name: '고블린 동전' },
    titleId: 'title_goblin',
  },
  {
    id: 'orc',
    name: '벼락치기 오크',
    emoji: '👹',
    hp: 90,
    gold: 190,
    blurb: '시험 전날에만 나타나는 힘센 녀석',
    loot: { id: 'loot_horn', name: '오크의 뿔' },
    titleId: 'title_orc',
  },
  {
    id: 'golem',
    name: '기출 골렘',
    emoji: '🗿',
    hp: 120,
    gold: 260,
    blurb: '기출문제가 단단히 뭉쳐진 돌덩이',
    loot: { id: 'loot_shard', name: '기출 파편' },
    titleId: 'title_golem',
  },
  {
    id: 'dragon',
    name: '시험 드래곤',
    emoji: '🐉',
    hp: 180,
    gold: 400,
    blurb: '마지막 관문. 3시간의 집중이 필요해',
    loot: { id: 'loot_scale', name: '드래곤 비늘' },
    titleId: 'title_dragon',
  },
];

export const BADGE_FOCUS_50 = { id: 'badge_focus50', name: '집중의 증표' } as const;

export type ResolvedMonster = MonsterDef & {
  cycle: number;
  maxHp: number;
  label: string;
  gold: number;
};

/** stage(1부터) -> 그 스테이지의 몬스터. 5단계를 돌면 Lv.2, Lv.3로 강화된다. */
export function monsterAt(stage: number): ResolvedMonster {
  const safeStage = Math.max(1, Math.floor(stage));
  const index = (safeStage - 1) % MONSTERS.length;
  const cycle = Math.floor((safeStage - 1) / MONSTERS.length) + 1;
  const base = MONSTERS[index];
  const scale = 1 + (cycle - 1) * 0.5;
  return {
    ...base,
    cycle,
    maxHp: Math.round(base.hp * scale),
    gold: Math.round(base.gold * (1 + (cycle - 1) * 0.6)),
    label: cycle === 1 ? base.name : `Lv.${cycle} ${base.name}`,
  };
}

export type TitleDef = {
  id: string;
  name: string;
  desc: string;
  cost: number;
  source: 'default' | 'kill' | 'shop';
};

export const TITLES: TitleDef[] = [
  { id: 'title_newbie', name: '새내기 집중러', desc: '모든 공부 전사의 시작', cost: 0, source: 'default' },
  { id: 'title_slime', name: '슬라임 학살자', desc: '졸음 슬라임 첫 처치 보상', cost: 0, source: 'kill' },
  { id: 'title_goblin', name: '딴짓 분쇄자', desc: '딴짓 고블린 첫 처치 보상', cost: 0, source: 'kill' },
  { id: 'title_orc', name: '벼락치기 파괴자', desc: '벼락치기 오크 첫 처치 보상', cost: 0, source: 'kill' },
  { id: 'title_golem', name: '기출 숙달자', desc: '기출 골렘 첫 처치 보상', cost: 0, source: 'kill' },
  { id: 'title_dragon', name: '드래곤 슬레이어', desc: '시험 드래곤 첫 처치 보상', cost: 0, source: 'kill' },
  { id: 'title_dawn', name: '새벽 5시의 지배자', desc: '남들 잘 때 공부하는 사람', cost: 180, source: 'shop' },
  { id: 'title_steel', name: '강철 멘탈', desc: '딴짓을 이겨낸 단단한 정신', cost: 320, source: 'shop' },
  { id: 'title_legend', name: '공부의 신', desc: '골드로 사는 최고의 칭호', cost: 800, source: 'shop' },
];

export type ItemDef = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  cost: number;
  /** 공부 공격력 보너스 (0.1 = +10%) */
  atk: number;
};

export const ITEMS: ItemDef[] = [
  { id: 'item_none', name: '맨손', emoji: '✊', desc: '기본 공격력', cost: 0, atk: 0 },
  { id: 'item_pencil', name: '몽당연필', emoji: '✏️', desc: '공부 공격력 +10%', cost: 120, atk: 0.1 },
  { id: 'item_highlighter', name: '형광펜', emoji: '🖍️', desc: '공부 공격력 +20%', cost: 260, atk: 0.2 },
  { id: 'item_lamp', name: '집중 스탠드', emoji: '💡', desc: '공부 공격력 +35%', cost: 480, atk: 0.35 },
  { id: 'item_sword', name: '기출의 검', emoji: '⚔️', desc: '공부 공격력 +50%', cost: 900, atk: 0.5 },
];

export function titleById(id: string | null): TitleDef | undefined {
  return TITLES.find((t) => t.id === id);
}

export function itemById(id: string | null): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}

export function itemAttack(id: string | null): number {
  return itemById(id)?.atk ?? 0;
}

export function createRpgState(): RpgState {
  return {
    level: 1,
    xp: 0,
    gold: 0,
    stage: 1,
    hp: monsterAt(1).maxHp,
    kills: {},
    loot: {},
    titles: ['title_newbie'],
    title: 'title_newbie',
    items: ['item_none'],
    item: 'item_none',
    badges: {},
    boxes: 0,
    totalMinutes: 0,
    totalDamage: 0,
    bestSession: 0,
    streak: 0,
    lastStudyDay: null,
  };
}

export function normalizeRpg(input: Partial<RpgState> | null | undefined): RpgState {
  const base = createRpgState();
  if (!input || typeof input !== 'object') return base;
  const stage = Number.isFinite(input.stage) ? Math.max(1, Math.floor(input.stage as number)) : 1;
  const maxHp = monsterAt(stage).maxHp;
  const hp = Number.isFinite(input.hp) ? Math.min(maxHp, Math.max(0, Math.round(input.hp as number))) : maxHp;
  const titles = Array.isArray(input.titles) && input.titles.length ? input.titles : base.titles;
  const items = Array.isArray(input.items) && input.items.length ? input.items : base.items;
  return {
    ...base,
    ...input,
    stage,
    hp: hp === 0 ? maxHp : hp,
    level: Number.isFinite(input.level) ? Math.max(1, Math.floor(input.level as number)) : 1,
    xp: Number.isFinite(input.xp) ? Math.max(0, Math.round(input.xp as number)) : 0,
    gold: Number.isFinite(input.gold) ? Math.max(0, Math.round(input.gold as number)) : 0,
    kills: input.kills && typeof input.kills === 'object' ? input.kills : {},
    loot: input.loot && typeof input.loot === 'object' ? input.loot : {},
    badges: input.badges && typeof input.badges === 'object' ? input.badges : {},
    boxes: Number.isFinite(input.boxes) ? Math.max(0, Math.round(input.boxes as number)) : 0,
    titles,
    title: titles.includes(input.title ?? '') ? (input.title as string) : titles[0],
    items,
    item: items.includes(input.item ?? '') ? (input.item as string) : items[0],
    totalMinutes: Number.isFinite(input.totalMinutes) ? Math.max(0, input.totalMinutes as number) : 0,
    totalDamage: Number.isFinite(input.totalDamage) ? Math.max(0, input.totalDamage as number) : 0,
    bestSession: Number.isFinite(input.bestSession) ? Math.max(0, input.bestSession as number) : 0,
    streak: Number.isFinite(input.streak) ? Math.max(0, input.streak as number) : 0,
    lastStudyDay: typeof input.lastStudyDay === 'string' ? input.lastStudyDay : null,
  };
}

/** 다음 레벨까지 필요한 XP */
export function xpToNext(level: number): number {
  return 80 + Math.max(1, level) * 40;
}

export function totalKills(rpg: RpgState): number {
  return Object.values(rpg.kills ?? {}).reduce((a, b) => a + b, 0);
}

export type AttackPreview = {
  minutes: number;
  tier: RpgTier;
  multiplier: number;
  attackBonus: number;
  damage: number;
};

/** 이번 공부가 몇 분으로 인정되고, 어떤 보너스가 붙는지 미리 계산한다. */
export function previewAttack(rpg: RpgState, minutesRaw: number): AttackPreview {
  const minutes = Math.max(1, Math.round(minutesRaw));
  const tier: RpgTier = minutes >= 50 ? 'critical' : minutes >= 25 ? 'focus' : 'plain';
  const multiplier = tier === 'critical' ? 1.5 : tier === 'focus' ? 1.2 : 1;
  const attackBonus = itemAttack(rpg.item);
  const damage = Math.max(1, Math.round(minutes * multiplier * (1 + attackBonus)));
  return { minutes, tier, multiplier, attackBonus, damage };
}

function applyXp(level: number, xp: number, gain: number): { level: number; xp: number; levelsGained: number } {
  let nextLevel = level;
  let nextXp = xp + Math.max(0, gain);
  let levelsGained = 0;
  let guard = 0;
  while (nextXp >= xpToNext(nextLevel) && guard < 200) {
    nextXp -= xpToNext(nextLevel);
    nextLevel += 1;
    levelsGained += 1;
    guard += 1;
  }
  return { level: nextLevel, xp: nextXp, levelsGained };
}

/**
 * 공부 분(min)을 RPG에 반영한다. 데미지는 남은 HP를 넘어가면 다음 몬스터로 이어진다.
 * 상태를 직접 바꾸지 않고 새 상태와 결과를 돌려준다.
 */
export function applyStudy(rpg: RpgState, minutesRaw: number, day = todayKey()): { rpg: RpgState; reward: RpgReward } {
  const attack = previewAttack(rpg, minutesRaw);
  const { damage, minutes, tier } = attack;

  let stage = rpg.stage;
  let hp = rpg.hp;
  let gold = rpg.gold;
  const kills = { ...rpg.kills };
  const loot = { ...rpg.loot };
  const titles = [...rpg.titles];
  const badges = { ...rpg.badges };
  const killed: RpgKill[] = [];
  let goldGained = 0;
  let remaining = damage;
  let guard = 0;

  while (remaining >= hp && guard < 500) {
    guard += 1;
    const monster = monsterAt(stage);
    remaining -= hp;
    kills[monster.id] = (kills[monster.id] ?? 0) + 1;
    loot[monster.loot.id] = (loot[monster.loot.id] ?? 0) + 1;
    gold += monster.gold;
    goldGained += monster.gold;

    let newTitle: string | undefined;
    if (!titles.includes(monster.titleId)) {
      titles.push(monster.titleId);
      newTitle = titleById(monster.titleId)?.name;
    }

    killed.push({
      id: monster.id,
      label: monster.label,
      emoji: monster.emoji,
      gold: monster.gold,
      loot: monster.loot.name,
      newTitle,
    });

    stage += 1;
    hp = monsterAt(stage).maxHp;
  }
  hp = Math.max(1, hp - remaining);

  // 25분+ 보너스 상자, 50분+ 특별 배지
  let boxes = 0;
  const newBadges: string[] = [];
  if (tier === 'focus' || tier === 'critical') boxes = tier === 'critical' ? 2 : 1;
  if (tier === 'critical') {
    badges[BADGE_FOCUS_50.id] = (badges[BADGE_FOCUS_50.id] ?? 0) + 1;
    newBadges.push(BADGE_FOCUS_50.name);
  }

  const bonusGold = tier === 'critical' ? 25 : tier === 'focus' ? 10 : 0;
  gold += bonusGold;
  goldGained += bonusGold;

  const bonusXp = tier === 'critical' ? 15 : tier === 'focus' ? 5 : 0;
  const killXp = killed.length * 20;
  const xpGained = damage + bonusXp + killXp;
  const levelResult = applyXp(rpg.level, rpg.xp, xpGained);

  // 연속 집중(일) 계산
  let streak = rpg.streak;
  if (rpg.lastStudyDay !== day) {
    streak = rpg.lastStudyDay && addDays(rpg.lastStudyDay, 1) === day ? rpg.streak + 1 : 1;
  }
  if (streak === 0) streak = 1;

  const nextMonster = monsterAt(stage);
  const nextRpg: RpgState = {
    ...rpg,
    stage,
    hp,
    gold,
    kills,
    loot,
    titles,
    badges,
    boxes: rpg.boxes + boxes,
    level: levelResult.level,
    xp: levelResult.xp,
    totalMinutes: rpg.totalMinutes + minutes,
    totalDamage: rpg.totalDamage + damage,
    bestSession: Math.max(rpg.bestSession, minutes),
    streak,
    lastStudyDay: day,
  };

  return {
    rpg: nextRpg,
    reward: {
      minutes,
      tier,
      damage,
      xpGained,
      goldGained,
      levelsGained: levelResult.levelsGained,
      level: levelResult.level,
      boxes,
      badges: newBadges,
      hpBefore: rpg.hp,
      monsterHpBefore: monsterAt(rpg.stage).maxHp,
      hpAfter: hp,
      monsterMaxAfter: nextMonster.maxHp,
      monsterLabel: nextMonster.label,
      monsterEmoji: nextMonster.emoji,
      kills: killed,
    },
  };
}

export function tierLabel(tier: RpgTier): string {
  if (tier === 'critical') return '50분+ 크리티컬 · 데미지 ×1.5';
  if (tier === 'focus') return '25분+ 집중 보너스 · 데미지 +20%';
  return '공부 1분 = 1 데미지';
}
