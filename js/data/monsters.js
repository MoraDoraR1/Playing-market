// 몬스터 데이터. 계급(rankIdx)이 오를수록 강한 몬스터가 등장.
// drop: 처치 시 얻는 전리품 아이템
// atkInterval: 전투가 클리커형으로 바뀌면서 생긴 필드 — 몬스터가 "일정 시간(ms)마다" 스스로
//   공격하는 주기. 더 이상 "내가 때릴 때마다 반격"이 아니라 몬스터가 자기 시계로 독립적으로
//   공격하므로, 플레이어가 빨리 잡을수록(장비가 좋을수록) 맞는 횟수 자체가 줄어든다.
// HP·공격력·골드 수치 자체는 이전(턴제) 밸런스 검증 결과를 그대로 물려받음 — 피로 소모는
// 여전히 "클릭 1회당 고정량"이라(공격+5·강공격+12) 때리는 횟수가 그대로면 피로 대비 수익도
// 그대로 유지되기 때문. 즉 HP를 다시 바꿀 필요는 없고, 새로 추가된 건 atkInterval뿐.
export const MONSTERS = [
  { id: "slime",  pic: "🟢", nm: "슬라임",   hp: 60,  atk: 6,  atkInterval: 2200, gong: 10,  gold: 24,  drop: { id: "jelly",   pic: "🫧", nm: "슬라임젤리", pr: 35 } },
  { id: "bat",    pic: "🦇", nm: "박쥐",     hp: 100, atk: 10, atkInterval: 1500, gong: 16,  gold: 45,  drop: { id: "batwing", pic: "🪶", nm: "박쥐날개",   pr: 55 } },
  { id: "boar",   pic: "🐗", nm: "멧돼지",   hp: 150, atk: 15, atkInterval: 1900, gong: 26,  gold: 75,  drop: { id: "tusk",    pic: "🦷", nm: "멧돼지엄니", pr: 95 } },
  { id: "ghost",  pic: "👻", nm: "유령",     hp: 180, atk: 22, atkInterval: 1700, gong: 42,  gold: 130, drop: { id: "soul",    pic: "🔮", nm: "영혼구슬",   pr: 160 } },
  { id: "golem",  pic: "🗿", nm: "바위골렘", hp: 260, atk: 28, atkInterval: 2000, gong: 66,  gold: 220, drop: { id: "core",    pic: "🟥", nm: "골렘핵",     pr: 300 } },
  { id: "dragon", pic: "🐉", nm: "드래곤",   hp: 380, atk: 40, atkInterval: 1600, gong: 110, gold: 400, drop: { id: "scale",   pic: "🐲", nm: "용비늘",     pr: 520 } },
];

// 보스 — 계급 관문마다 도전할 수 있는 강력한 적. 처치 시 큰 별머니 보상.
// atkInterval은 일반 몬스터보다 짧게(더 자주 공격) 잡아 "보스답게 위협적인" 압박감을 준다.
export const BOSSES = [
  { id: "kingslime", pic: "👑", nm: "슬라임 왕",  hp: 320,  atk: 20, atkInterval: 1300, gong: 150, gold: 500,  boss: true, reqRank: 2, drop: { id: "crown",    pic: "👑", nm: "왕관",          pr: 700 } },
  { id: "kraken",    pic: "🐙", nm: "크라켄",     hp: 560,  atk: 32, atkInterval: 1100, gong: 320, gold: 1100, boss: true, reqRank: 4, drop: { id: "tentacle", pic: "🦑", nm: "크라켄 촉수",    pr: 1300 } },
  { id: "darklord",  pic: "😈", nm: "마왕",       hp: 1350, atk: 48, atkInterval: 900,  gong: 600, gold: 1680, boss: true, reqRank: 6, drop: { id: "darkgem",  pic: "🟣", nm: "마왕의 보석",    pr: 1960 } },
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
