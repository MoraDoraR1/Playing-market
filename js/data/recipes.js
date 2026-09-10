// P2 집 콘텐츠 데이터: 제작(작업대) / 요리(부엌) / 농사(농지)

// ---------- 작업대 (제작) ----------
// needs: { 아이템id: 개수 }
// makesItem:true  → 결과를 인벤토리 아이템으로 생성 (plank 등)
// 그 외          → 가구(고유). effect를 영구 적용, deco=꾸미기 점수
export const CRAFT = [
  { id: "plank",    nm: "합판",         pic: "🟫", needs: { branch: 3 }, makesItem: true,
    desc: "나뭇가지를 다듬어 만든 기본 재료" },
  { id: "bedframe", nm: "튼튼 침대틀",   pic: "🛏️", needs: { plank: 3 },            effect: { maxHp: 20 }, deco: 2,
    desc: "최대 체력 +20" },
  { id: "musicbox", nm: "뮤직박스",     pic: "🎵", needs: { plank: 2, gem: 1 },     effect: { fatigueReduce: 2 }, deco: 3,
    desc: "생산 활동 피로 -2" },
  { id: "rack",     nm: "수련 목검대",   pic: "🗡️", needs: { plank: 2, iron: 2 },    effect: { atkBonus: 4 }, deco: 2,
    desc: "공격력 +4" },
  { id: "bookshelf",nm: "책장",         pic: "📚", needs: { plank: 3, herb: 2 },    effect: { gongBonus: 2 }, deco: 2,
    desc: "활동 시 내공 +2 보너스" },
  { id: "plantpot", nm: "화분",         pic: "🪴", needs: { plank: 1, mushroom: 2 }, effect: {}, deco: 1,
    desc: "집을 예쁘게 꾸며요" },
];

// ---------- 부엌 (요리) ----------
// kind:"instant" → 즉시 효과 {hp, fatigue}
// kind:"buff"    → 일정 횟수(turns) 지속 효과 {stat:"atk"|"gather", amount, turns}
export const COOK = [
  { id: "herbporridge", nm: "약초죽",   pic: "🥣", needs: { herb: 2, grain: 1 }, kind: "instant", hp: 0,  fatigue: -35, desc: "피로 -35" },
  { id: "shellsoup",    nm: "조개탕",   pic: "🥘", needs: { shell: 2 },          kind: "instant", hp: 15, fatigue: -15, desc: "체력 +15, 피로 -15" },
  { id: "fruitice",     nm: "과일빙수", pic: "🍧", needs: { berry: 3 },          kind: "instant", hp: 25, fatigue: 0,   desc: "체력 +25" },
  { id: "grillfish",    nm: "생선구이", pic: "🐟", needs: { anchovy: 2 },        kind: "buff", stat: "gather", amount: 1, turns: 5, desc: "5회 동안 채집 수확 +1" },
  { id: "meatstew",     nm: "고기스튜", pic: "🍲", needs: { meat: 1, grain: 1 }, kind: "buff", stat: "atk", amount: 6, turns: 5, desc: "5회 동안 공격력 +6" },
];

// ---------- 농지 (농사) ----------
// grow: 성장에 필요한 활동 횟수(틱). yield: 수확 아이템 목록.
export const MAX_PLOTS = 3;
export const CROPS = {
  wheat: { id: "wheat", nm: "밀",     pic: "🌾", seedCost: 40, grow: 4, yield: [{ id: "grain", pic: "🌾", nm: "곡식",   pr: 24, qty: 3 }] },
  berry: { id: "berry", nm: "딸기",   pic: "🍓", seedCost: 60, grow: 5, yield: [{ id: "berry", pic: "🍓", nm: "산딸기", pr: 12, qty: 4 }] },
  herb:  { id: "herb",  nm: "약초",   pic: "🌿", seedCost: 80, grow: 6, yield: [{ id: "herb",  pic: "🌿", nm: "약초",   pr: 38, qty: 3 }] },
};
