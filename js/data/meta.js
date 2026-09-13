// P4 메타 데이터: 일일 퀘스트 / 업적 / 별머니 상점
import { CROPS } from "./recipes.js";
import { ECON_SCALE } from "./places.js";

// ---------- 일일 퀘스트 템플릿 ----------
// type: gather/kill/sell/cook/harvest (이벤트 훅에서 진행도 증가)
// moneyPer 원안값 — 최고 소지 금액 10억별에 맞춰 ECON_SCALE(×400) 적용
const QUEST_TEMPLATES = [
  { id: "gather", type: "gather", nm: "자원 모으기", unit: "개", min: 12, max: 22, moneyPer: 20 * ECON_SCALE },
  { id: "kill",   type: "kill",   nm: "몬스터 처치", unit: "마리", min: 3,  max: 6,  moneyPer: 80 * ECON_SCALE },
  { id: "sell",   type: "sell",   nm: "자원 판매",   unit: "별", min: 600 * ECON_SCALE, max: 1500 * ECON_SCALE, moneyPer: 0.3 },
  { id: "cook",   type: "cook",   nm: "요리하기",     unit: "번", min: 2,  max: 4,  moneyPer: 120 * ECON_SCALE },
  { id: "harvest",type: "harvest",nm: "농작물 수확", unit: "번", min: 1,  max: 3,  moneyPer: 150 * ECON_SCALE },
];

function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

// 오늘의 퀘스트 3개 생성 (보상: 별머니). 첫 퀘스트는 보상 1.5배(도전 보상)
export function generateDailyQuests(dateStr) {
  const pool = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
  const list = pool.map((t, i) => {
    const goal = rint(t.min, t.max);
    return {
      key: t.id + "_" + i, type: t.type, nm: t.nm, unit: t.unit, goal,
      progress: 0, done: false, claimed: false,
      rewardMoney: Math.round(goal * t.moneyPer * (i === 0 ? 1.5 : 1)),
    };
  });
  return { date: dateStr, list };
}

// ---------- 업적 ----------
// check(stats, S) → boolean
export const ACHIEVEMENTS = [
  { id: "first_kill", nm: "첫 사냥",   pic: "⚔️", desc: "몬스터 1마리 처치",   check: (s) => s.kills >= 1 },
  { id: "hunter",     nm: "사냥꾼",    pic: "🏹", desc: "몬스터 50마리 처치",  check: (s) => s.kills >= 50 },
  { id: "bosskill",   nm: "보스 헌터", pic: "🔥", desc: "보스 1마리 처치",     check: (s) => s.bossKills >= 1 },
  { id: "rich",       nm: "부자",      pic: "💰", desc: "별머니 400만 보유",   check: (s, S) => S.money >= 4000000 },
  { id: "king",       nm: "생명의 왕", pic: "👑", desc: "최고 계급 달성",      check: (s, S) => S.rankIdx >= 9 },
  { id: "collector",  nm: "수집왕",    pic: "📖", desc: "자원 20종 발견",      check: (s, S) => S.codex.items.length >= 20 },
  { id: "chef",       nm: "요리사",    pic: "🍳", desc: "요리 10번",          check: (s) => s.cook >= 10 },
  { id: "farmer",     nm: "농부",      pic: "🌾", desc: "수확 10번",          check: (s) => s.harvest >= 10 },
  { id: "kind",       nm: "천사",      pic: "😇", desc: "하늘나라 개방",      check: (s, S) => S.heavenOpen },
  { id: "billionaire",nm: "억만장자",  pic: "💎", desc: "별머니 10억(최고 소지 금액) 달성", check: (s, S) => S.money >= 1000000000 },
];

// ---------- 특수아이템샵 (원작: 현금 없이 고가의 별머니로 사기템 구매) ----------
// 최고 소지 금액(=이 게임의 최종 앵커) 10억별에 맞춰 재설계.
// 도구/장비 같은 "필수 진행" 경제(ECON_SCALE=×400, places.js)와는 별개로,
// 특수샵은 "선택적·과시용 사기템" 성격이라 훨씬 가파른 자체 곡선(1백만 → 10억, 약 6~10배씩 점프)을 씀.
// 최상위 "행운의 부적"은 정확히 10억 = 최고 소지 금액 전액을 요구하는 궁극의 엔드게임 플렉스 아이템.
// apply(S) → 상태 변경. cost 단위: 별머니
export const STAR_SHOP = [
  { id: "elixir",   nm: "만능 물약",   pic: "✨", cost: 1000000,   desc: "체력·피로 완전 회복", apply: (S) => { S.hp = S.maxHp; S.fatigue = 0; } },
  { id: "fastfarm", nm: "성장촉진제",  pic: "🌱", cost: 3000000,   desc: "모든 농작물 즉시 완성", apply: (S) => { S.farm.forEach((p) => { const c = CROPS[p.cropId]; if (c) p.progress = c.grow; }); } },
  { id: "medal",    nm: "명예 훈장",   pic: "🎖️", cost: 30000000,  desc: "공격력 +3 (영구)",   apply: (S) => { S.mods.atkBonus += 3; } },
  { id: "goldtool", nm: "만능 공구함", pic: "🧰", cost: 150000000, desc: "보유한 모든 채집 도구 등급 +1 (영구, 최대 8단계)",
    apply: (S) => { Object.keys(S.equip).forEach((k) => { S.equip[k] = Math.min(8, S.equip[k] + 1); }); } },
  { id: "charm",    nm: "행운의 부적", pic: "🍀", cost: 1000000000, desc: "채집 수확 +1 (영구) — 전 재산을 쏟아붓는 궁극의 사기템!", apply: (S) => { S.mods.gatherBonus += 1; } },
];

// ---------- 상점 시세 ----------
const MULTS = [0.85, 0.9, 1.0, 1.1, 1.25];
export function generateMarket(dateStr, itemIds) {
  const mult = MULTS[Math.floor(Math.random() * MULTS.length)];
  const hotItem = itemIds.length ? itemIds[Math.floor(Math.random() * itemIds.length)] : null;
  return { date: dateStr, mult, hotItem };
}
