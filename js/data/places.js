// 장소 데이터. 각 장소의 배경/캐릭터/활동/자원을 정의.
// loot 요소: {id, pic(이모지), nm(이름), pr(판매가), w(가중치)}
// rare: 낮은 확률로 등장하는 귀한 자원
// combat:true 인 장소는 전투 씬으로 렌더링됨
// tool: 필요 도구 카테고리(data/tools.js) — required:true면 미보유 시 진입 불가
// bait: "sea"|"river" — 해당 미끼가 있어야 함(낚시 전용)
// minTier: 이 장소가 요구하는 도구의 "최소 등급"(장비 등급이 낮으면 소유해도 진입 불가) —
//   같은 맵 안에서도 "고급" 채집지는 더 좋은 자원 위주(가중치 역전)라 아무 등급으로나
//   함부로 캐지 못하게 막는 용도. 기본 채집지는 minTier 없음(도구만 있으면 OK).
export const PLACES = {
  forest: {
    name: "🌲 숲속", desc: "도끼로 나무를 베어 채집해요",
    bg: "linear-gradient(180deg,#d3f9d8,#8ce99a)", hero: "🧑‍🌾", verb: "채집하기",
    tool: "axe", toolRequired: true,
    loot: [
      { id: "branch", pic: "🪵", nm: "나뭇가지", pr: 10, w: 5 },
      { id: "mushroom", pic: "🍄", nm: "버섯", pr: 22, w: 3 },
      { id: "herb", pic: "🌿", nm: "약초", pr: 38, w: 2 },
    ],
    rare: { id: "ginseng", pic: "🫚", nm: "산삼", pr: 320, rare: true },
  },
  sea: {
    name: "🌊 바닷가", desc: "낚싯대+새우 미끼로 바다 낚시를 해요",
    bg: "linear-gradient(180deg,#a5d8ff,#4dabf7)", hero: "🎣", verb: "낚시하기", minigame: true,
    tool: "rod", toolRequired: true, bait: "sea",
    loot: [
      { id: "anchovy", pic: "🐟", nm: "멸치", pr: 14, w: 5 },
      { id: "shell", pic: "🐚", nm: "조개", pr: 26, w: 3 },
      { id: "squid", pic: "🦑", nm: "오징어", pr: 42, w: 2 },
    ],
    rare: { id: "pearl", pic: "🦪", nm: "진주", pr: 360, rare: true },
  },
  mine: {
    name: "⛏️ 광산", desc: "곡괭이로 광석을 캐내요",
    bg: "linear-gradient(180deg,#ced4da,#868e96)", hero: "👷", verb: "채광하기", minigame: true,
    tool: "pickaxe", toolRequired: true,
    loot: [
      { id: "stone", pic: "🪨", nm: "돌멩이", pr: 8, w: 5 },
      { id: "copper", pic: "🟤", nm: "구리", pr: 30, w: 3 },
      { id: "iron", pic: "⚙️", nm: "철광석", pr: 48, w: 2 },
    ],
    rare: { id: "gem", pic: "💎", nm: "보석", pr: 420, rare: true },
  },
  gather: {
    name: "🌿 채집터", desc: "맨손으로도 되지만, 낫이 있으면 더 빨라요",
    bg: "linear-gradient(180deg,#ffec99,#ffd43b)", hero: "🧺", verb: "채집하기",
    tool: "sickle", toolRequired: false,
    loot: [
      { id: "berry", pic: "🍓", nm: "산딸기", pr: 12, w: 5 },
      { id: "grain", pic: "🌾", nm: "곡식", pr: 24, w: 3 },
      { id: "flower", pic: "🌼", nm: "들꽃", pr: 20, w: 2 },
    ],
    rare: { id: "clover", pic: "🍀", nm: "네잎클로버", pr: 300, rare: true },
  },
  hunt: {
    name: "🏹 사냥터", desc: "활이 있어야 사냥할 수 있어요",
    bg: "linear-gradient(180deg,#ffd8a8,#ffa94d)", hero: "🏹", verb: "사냥하기",
    tool: "bow", toolRequired: true,
    loot: [
      { id: "meat", pic: "🍖", nm: "고기", pr: 40, w: 5 },
      { id: "feather", pic: "🪶", nm: "깃털", pr: 30, w: 3 },
      { id: "bone", pic: "🦴", nm: "뼈", pr: 50, w: 2 },
    ],
    rare: { id: "goldegg", pic: "🥚", nm: "황금알", pr: 340, rare: true },
  },
  river: {
    name: "🏞️ 강가", desc: "낚싯대+지렁이 미끼로 민물 낚시를 해요",
    bg: "linear-gradient(180deg,#b2f2bb,#63e6be)", hero: "🎣", verb: "낚시하기", minigame: true,
    tool: "rod", toolRequired: true, bait: "river",
    loot: [
      { id: "loach", pic: "🐡", nm: "미꾸라지", pr: 16, w: 5 },
      { id: "crayfish", pic: "🦐", nm: "가재", pr: 28, w: 3 },
      { id: "carp", pic: "🐟", nm: "잉어", pr: 46, w: 2 },
    ],
    rare: { id: "goldcarp", pic: "🐠", nm: "황금잉어", pr: 380, rare: true },
  },
  dump: {
    name: "🗑️ 쓰레기장", desc: "고물을 주워 재활용해요",
    bg: "linear-gradient(180deg,#e9ecef,#adb5bd)", hero: "🧹", verb: "고물줍기",
    loot: [
      { id: "scrap", pic: "🔩", nm: "고철", pr: 10, w: 5 },
      { id: "bottle", pic: "🍶", nm: "빈병", pr: 14, w: 3 },
      { id: "radio", pic: "📻", nm: "고장난 라디오", pr: 32, w: 2 },
    ],
    rare: { id: "record", pic: "💿", nm: "희귀 음반", pr: 260, rare: true },
  },
  pirate: {
    name: "🏴‍☠️ 해적선", desc: "보물을 찾아 탐험해요 (상인 계급부터)",
    bg: "linear-gradient(180deg,#845ef7,#5f3dc4)", hero: "🏴‍☠️", verb: "탐험하기", minReq: 3,
    loot: [
      { id: "coin", pic: "🪙", nm: "금화", pr: 60, w: 4 },
      { id: "map", pic: "🗺️", nm: "낡은 지도", pr: 90, w: 3 },
      { id: "rum", pic: "🍾", nm: "럼주", pr: 55, w: 2 },
    ],
    rare: { id: "chest", pic: "🧰", nm: "보물상자", pr: 650, rare: true },
  },
  heaven: {
    name: "☁️ 하늘나라", desc: "선행을 쌓은 자만의 낙원!",
    bg: "linear-gradient(180deg,#d0bfff,#b197fc)", hero: "😇", verb: "별줍기",
    loot: [
      { id: "stardust", pic: "✨", nm: "별가루", pr: 180, w: 5 },
      { id: "cloud", pic: "🌈", nm: "무지개조각", pr: 420, w: 2 },
    ],
    rare: { id: "wing", pic: "🪽", nm: "천사의날개", pr: 1100, rare: true },
  },
  // ---- "고급" 채집지 변형 — 같은 자원이지만 가중치를 역전(귀한 것 위주)해 실질 기대값을 높임.
  // 도구를 "소유"만 해선 못 들어가고 minTier 이상 등급이어야 함(장비 등급 조건).
  forest_deep: {
    name: "🌲 깊은 숲", desc: "도끼 철 등급 이상만 들어갈 수 있는 깊은 숲",
    bg: "linear-gradient(180deg,#d3f9d8,#8ce99a)", hero: "🧑‍🌾", verb: "채집하기",
    tool: "axe", toolRequired: true, minTier: 3,
    loot: [
      { id: "branch", pic: "🪵", nm: "나뭇가지", pr: 10, w: 2 },
      { id: "mushroom", pic: "🍄", nm: "버섯", pr: 22, w: 3 },
      { id: "herb", pic: "🌿", nm: "약초", pr: 38, w: 5 },
    ],
    rare: { id: "ginseng", pic: "🫚", nm: "산삼", pr: 320, rare: true },
  },
  mine_deep: {
    name: "⛏️ 심층 갱도", desc: "곡괭이 철 등급 이상만 들어갈 수 있는 깊은 갱도",
    bg: "linear-gradient(180deg,#ced4da,#868e96)", hero: "👷", verb: "채광하기", minigame: true,
    tool: "pickaxe", toolRequired: true, minTier: 3,
    loot: [
      { id: "stone", pic: "🪨", nm: "돌멩이", pr: 8, w: 2 },
      { id: "copper", pic: "🟤", nm: "구리", pr: 30, w: 3 },
      { id: "iron", pic: "⚙️", nm: "철광석", pr: 48, w: 5 },
    ],
    rare: { id: "gem", pic: "💎", nm: "보석", pr: 420, rare: true },
  },
  sea_deep: {
    name: "🌊 심해", desc: "낚싯대 철 등급 이상만 갈 수 있는 심해(미끼 필요)",
    bg: "linear-gradient(180deg,#a5d8ff,#4dabf7)", hero: "🎣", verb: "낚시하기", minigame: true,
    tool: "rod", toolRequired: true, bait: "sea", minTier: 3,
    loot: [
      { id: "anchovy", pic: "🐟", nm: "멸치", pr: 14, w: 2 },
      { id: "shell", pic: "🐚", nm: "조개", pr: 26, w: 3 },
      { id: "squid", pic: "🦑", nm: "오징어", pr: 42, w: 5 },
    ],
    rare: { id: "pearl", pic: "🦪", nm: "진주", pr: 360, rare: true },
  },
  river_deep: {
    name: "🏞️ 깊은 여울", desc: "낚싯대 철 등급 이상만 갈 수 있는 깊은 여울(미끼 필요)",
    bg: "linear-gradient(180deg,#b2f2bb,#63e6be)", hero: "🎣", verb: "낚시하기", minigame: true,
    tool: "rod", toolRequired: true, bait: "river", minTier: 3,
    loot: [
      { id: "loach", pic: "🐡", nm: "미꾸라지", pr: 16, w: 2 },
      { id: "crayfish", pic: "🦐", nm: "가재", pr: 28, w: 3 },
      { id: "carp", pic: "🐟", nm: "잉어", pr: 46, w: 5 },
    ],
    rare: { id: "goldcarp", pic: "🐠", nm: "황금잉어", pr: 380, rare: true },
  },
  gather_deep: {
    name: "🌿 약초밭", desc: "낫 철 등급 이상만 들어갈 수 있는 기름진 밭",
    bg: "linear-gradient(180deg,#ffec99,#ffd43b)", hero: "🧺", verb: "채집하기",
    tool: "sickle", toolRequired: false, minTier: 3,
    loot: [
      { id: "berry", pic: "🍓", nm: "산딸기", pr: 12, w: 2 },
      { id: "flower", pic: "🌼", nm: "들꽃", pr: 20, w: 3 },
      { id: "grain", pic: "🌾", nm: "곡식", pr: 24, w: 5 },
    ],
    rare: { id: "clover", pic: "🍀", nm: "네잎클로버", pr: 300, rare: true },
  },
  hunt_deep: {
    name: "🏹 매복터", desc: "활 철 등급 이상만 들어갈 수 있는 매복터",
    bg: "linear-gradient(180deg,#ffd8a8,#ffa94d)", hero: "🏹", verb: "사냥하기",
    tool: "bow", toolRequired: true, minTier: 3,
    loot: [
      { id: "feather", pic: "🪶", nm: "깃털", pr: 30, w: 2 },
      { id: "meat", pic: "🍖", nm: "고기", pr: 40, w: 3 },
      { id: "bone", pic: "🦴", nm: "뼈", pr: 50, w: 5 },
    ],
    rare: { id: "goldegg", pic: "🥚", nm: "황금알", pr: 340, rare: true },
  },
  battle: {
    name: "⚔️ 던전", desc: "몬스터와 싸워 전리품을 얻어요",
    bg: "linear-gradient(180deg,#495057,#212529)", hero: "🧑‍🚀", combat: true,
  },
};
// 위 pr(판매가)는 기존 밸런스 기준 원안값 — 최고 소지 금액 10억별에 맞춰 경제 전체를
// ×400 배율로 재조정(도구·몬스터·퀘스트 등 다른 수치도 동일 배율 적용, meta.js 참고)
export const ECON_SCALE = 400;
// 채집물 판매가가 도구/장비 등 지출 대비 너무 낮다는 피드백에 따라, "판매가(pr)"에만
// 별도로 추가 배율을 적용(도구값·비용은 그대로 둬서 상대적으로 판매가 훨씬 후해지도록 함).
export const SELL_BOOST = 5;
for (const p of Object.values(PLACES)) {
  (p.loot || []).forEach((x) => { x.pr *= ECON_SCALE * SELL_BOOST; });
  if (p.rare) p.rare.pr *= ECON_SCALE * SELL_BOOST;
}
