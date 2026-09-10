// 장소 데이터. 각 장소의 배경/캐릭터/활동/자원을 정의.
// loot 요소: {id, pic(이모지), nm(이름), pr(판매가), w(가중치)}
// rare: 낮은 확률로 등장하는 귀한 자원
// combat:true 인 장소는 전투 씬으로 렌더링됨
export const PLACES = {
  forest: {
    name: "🌲 숲속", desc: "나무와 약초를 채집해요",
    bg: "linear-gradient(180deg,#d3f9d8,#8ce99a)", hero: "🧑‍🌾", verb: "채집하기",
    loot: [
      { id: "branch", pic: "🪵", nm: "나뭇가지", pr: 10, w: 5 },
      { id: "mushroom", pic: "🍄", nm: "버섯", pr: 22, w: 3 },
      { id: "herb", pic: "🌿", nm: "약초", pr: 38, w: 2 },
    ],
    rare: { id: "ginseng", pic: "🫚", nm: "산삼", pr: 320, rare: true },
  },
  sea: {
    name: "🌊 바닷가", desc: "낚시로 물고기를 잡아요",
    bg: "linear-gradient(180deg,#a5d8ff,#4dabf7)", hero: "🎣", verb: "낚시하기",
    loot: [
      { id: "anchovy", pic: "🐟", nm: "멸치", pr: 14, w: 5 },
      { id: "shell", pic: "🐚", nm: "조개", pr: 26, w: 3 },
      { id: "squid", pic: "🦑", nm: "오징어", pr: 42, w: 2 },
    ],
    rare: { id: "pearl", pic: "🦪", nm: "진주", pr: 360, rare: true },
  },
  mine: {
    name: "⛏️ 광산", desc: "광석을 캐내요",
    bg: "linear-gradient(180deg,#ced4da,#868e96)", hero: "👷", verb: "채광하기",
    loot: [
      { id: "stone", pic: "🪨", nm: "돌멩이", pr: 8, w: 5 },
      { id: "copper", pic: "🟤", nm: "구리", pr: 30, w: 3 },
      { id: "iron", pic: "⚙️", nm: "철광석", pr: 48, w: 2 },
    ],
    rare: { id: "gem", pic: "💎", nm: "보석", pr: 420, rare: true },
  },
  field: {
    name: "🌾 들판", desc: "열매를 따고 사냥해요",
    bg: "linear-gradient(180deg,#ffec99,#ffd43b)", hero: "🏹", verb: "사냥하기",
    loot: [
      { id: "berry", pic: "🍓", nm: "산딸기", pr: 12, w: 5 },
      { id: "grain", pic: "🌾", nm: "곡식", pr: 24, w: 3 },
      { id: "meat", pic: "🍖", nm: "고기", pr: 40, w: 2 },
    ],
    rare: { id: "goldegg", pic: "🥚", nm: "황금알", pr: 340, rare: true },
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
  battle: {
    name: "⚔️ 던전", desc: "몬스터와 싸워 전리품을 얻어요",
    bg: "linear-gradient(180deg,#495057,#212529)", hero: "🧑‍🚀", combat: true,
  },
};
