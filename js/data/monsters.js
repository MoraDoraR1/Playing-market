// 몬스터 데이터. 계급(rankIdx)이 오를수록 강한 몬스터가 등장.
// drop: 처치 시 얻는 전리품 아이템
// 밸런스 재조정(v2): 무강화(무기Lv1·방어구0) 기준 전투가 채집보다 피로 대비 훨씬 남는 문제 수정.
// - HP를 대폭 상향(슬라임 기준 2~3방 컷 → 5방 안팎)해 무투자 전투가 더는 "거의 공짜"가 아니게 함.
// - 공격력도 함께 올려 무방어 전투에 실질 리스크(반격 피해)를 부여 → 방어구 구매 유인.
// - 처치 보상(gold)은 낮추고, 전리품(drop) 판매가는 SELL_BOOST(×5) 적용 대상에서 제외
//   (채집물과 달리 몬스터 드랍은 "매번 100% 확정 지급"이라 확률형 채집물과 동일한 가산은 과함).
export const MONSTERS = [
  { id: "slime",  pic: "🟢", nm: "슬라임",   hp: 60,  atk: 6,  gong: 10,  gold: 24,  drop: { id: "jelly",   pic: "🫧", nm: "슬라임젤리", pr: 35 } },
  { id: "bat",    pic: "🦇", nm: "박쥐",     hp: 100, atk: 10, gong: 16,  gold: 45,  drop: { id: "batwing", pic: "🪶", nm: "박쥐날개",   pr: 55 } },
  { id: "boar",   pic: "🐗", nm: "멧돼지",   hp: 150, atk: 15, gong: 26,  gold: 75,  drop: { id: "tusk",    pic: "🦷", nm: "멧돼지엄니", pr: 95 } },
  { id: "ghost",  pic: "👻", nm: "유령",     hp: 180, atk: 22, gong: 42,  gold: 130, drop: { id: "soul",    pic: "🔮", nm: "영혼구슬",   pr: 160 } },
  { id: "golem",  pic: "🗿", nm: "바위골렘", hp: 260, atk: 28, gong: 66,  gold: 220, drop: { id: "core",    pic: "🟥", nm: "골렘핵",     pr: 300 } },
  { id: "dragon", pic: "🐉", nm: "드래곤",   hp: 380, atk: 40, gong: 110, gold: 400, drop: { id: "scale",   pic: "🐲", nm: "용비늘",     pr: 520 } },
];

// 보스 — 계급 관문마다 도전할 수 있는 강력한 적. 처치 시 큰 별머니 보상.
export const BOSSES = [
  { id: "kingslime", pic: "👑", nm: "슬라임 왕",  hp: 320,  atk: 20, gong: 150, gold: 500,  boss: true, reqRank: 2, drop: { id: "crown",    pic: "👑", nm: "왕관",          pr: 700 } },
  { id: "kraken",    pic: "🐙", nm: "크라켄",     hp: 560,  atk: 32, gong: 320, gold: 1100, boss: true, reqRank: 4, drop: { id: "tentacle", pic: "🦑", nm: "크라켄 촉수",    pr: 1300 } },
  { id: "darklord",  pic: "😈", nm: "마왕",       hp: 900,  atk: 48, gong: 600, gold: 2400, boss: true, reqRank: 6, drop: { id: "darkgem",  pic: "🟣", nm: "마왕의 보석",    pr: 2800 } },
];

// 현재 계급에서 도전 가능한 가장 높은 보스
export function availableBoss(rankIdx) {
  let boss = null;
  for (const b of BOSSES) if (rankIdx >= b.reqRank) boss = b;
  return boss;
}

// 최고 소지 금액 10억별에 맞춘 경제 재조정(×400, places.js ECON_SCALE과 동일 배율)
// 전리품(drop) 판매가는 SELL_BOOST 없이 ECON_SCALE만 적용 — 채집물과 달리 처치할 때마다
// 100% 확정 지급이라, 확률형 채집물과 같은 가산을 주면 사냥이 과도하게 유리해짐(위 설명 참고).
import { ECON_SCALE } from "./places.js";
for (const m of [...MONSTERS, ...BOSSES]) {
  m.gold *= ECON_SCALE;
  if (m.drop) m.drop.pr *= ECON_SCALE;
}
