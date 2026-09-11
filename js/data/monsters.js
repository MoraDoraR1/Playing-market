// 몬스터 데이터. 계급(rankIdx)이 오를수록 강한 몬스터가 등장.
// drop: 처치 시 얻는 전리품 아이템
export const MONSTERS = [
  { id: "slime",  pic: "🟢", nm: "슬라임",   hp: 24,  atk: 4,  gong: 10,  gold: 45,  drop: { id: "jelly",   pic: "🫧", nm: "슬라임젤리", pr: 35 } },
  { id: "bat",    pic: "🦇", nm: "박쥐",     hp: 40,  atk: 7,  gong: 16,  gold: 80,  drop: { id: "batwing", pic: "🪶", nm: "박쥐날개",   pr: 55 } },
  { id: "boar",   pic: "🐗", nm: "멧돼지",   hp: 65,  atk: 11, gong: 26,  gold: 130, drop: { id: "tusk",    pic: "🦷", nm: "멧돼지엄니", pr: 95 } },
  { id: "ghost",  pic: "👻", nm: "유령",     hp: 95,  atk: 16, gong: 42,  gold: 210, drop: { id: "soul",    pic: "🔮", nm: "영혼구슬",   pr: 160 } },
  { id: "golem",  pic: "🗿", nm: "바위골렘", hp: 150, atk: 22, gong: 66,  gold: 340, drop: { id: "core",    pic: "🟥", nm: "골렘핵",     pr: 300 } },
  { id: "dragon", pic: "🐉", nm: "드래곤",   hp: 230, atk: 32, gong: 110, gold: 600, drop: { id: "scale",   pic: "🐲", nm: "용비늘",     pr: 520 } },
];

// 보스 — 계급 관문마다 도전할 수 있는 강력한 적. 처치 시 큰 별머니 보상.
export const BOSSES = [
  { id: "kingslime", pic: "👑", nm: "슬라임 왕",  hp: 260,  atk: 16, gong: 150, gold: 600,  boss: true, reqRank: 2, drop: { id: "crown",    pic: "👑", nm: "왕관",          pr: 700 } },
  { id: "kraken",    pic: "🐙", nm: "크라켄",     hp: 480,  atk: 26, gong: 320, gold: 1300, boss: true, reqRank: 4, drop: { id: "tentacle", pic: "🦑", nm: "크라켄 촉수",    pr: 1300 } },
  { id: "darklord",  pic: "😈", nm: "마왕",       hp: 820,  atk: 40, gong: 600, gold: 2800, boss: true, reqRank: 6, drop: { id: "darkgem",  pic: "🟣", nm: "마왕의 보석",    pr: 2800 } },
];

// 현재 계급에서 도전 가능한 가장 높은 보스
export function availableBoss(rankIdx) {
  let boss = null;
  for (const b of BOSSES) if (rankIdx >= b.reqRank) boss = b;
  return boss;
}
