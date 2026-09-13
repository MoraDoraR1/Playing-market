// 도구 8단계 체계 — 도끼/곡괭이/낚싯대/낫/활
// 등급: 나무→돌→철→강철→은→금→미스릴→천사(1~8단계). 등급이 높을수록 채집이 빠르고
// 최대 수확량이 늘고 희귀 자원 확률이 올라간다. 가격은 카테고리마다 다른 곡선(균일 배율 X).
// 아래 원안 가격은 기존 밸런스 기준값 — 최고 소지 금액 10억별에 맞춰 ECON_SCALE(×400,
// places.js와 동일 배율)을 곱해 실제 가격으로 사용(가장 비싼 도구=낚싯대 8단계 8,800만별,
// 10억별의 8.8% 수준으로 5종을 모두 최고 등급까지 올려도 캡의 1/3 정도만 쓰게 설계).
import { ECON_SCALE } from "./places.js";
const TIER_NAMES = ["나무", "돌", "철", "강철", "은", "금", "미스릴", "천사"];

// 공통 성능 곡선(지수 감소/완만 증가) — 카테고리 상관없이 "등급 하나가 어느 정도 강한가"는 동일하게 유지
const DUR  = [4900, 4000, 3300, 2700, 2200, 1800, 1500, 1200]; // 1회 채집 소요(ms), 1~8단계
const RARE = [0.042, 0.054, 0.066, 0.078, 0.090, 0.102, 0.114, 0.126]; // 희귀 자원 확률, 1~8단계
const AMT  = [0, 1, 1, 2, 3, 3, 4, 4]; // 1회 수확 추가량(최대 보너스 개수), 1~8단계
// 맨손(0단계, 낫 미보유 시 채집터에서만 허용)
export const BAREHAND = { dur: 6000, rare: 0.030, amt: 0 };

function tiers(pic, prices) {
  return TIER_NAMES.map((nm, i) => ({
    tier: i + 1, nm, label: `${nm} ${pic}`, pic,
    price: prices[i] * ECON_SCALE, dur: DUR[i], rare: RARE[i], amt: AMT[i],
  }));
}

// 가격: 8단계, 카테고리별로 완전히 다른 곡선.
// - 도끼/곡괭이/활: 위치 진입 필수(게이트) → 저단계는 적당히 저렴, 고단계는 매우 비쌈
// - 낚싯대: 바다+강 두 곳을 동시에 열어주는 값어치 반영 → 곡괭이보다 살짝 비싸게
// - 낫: 맨손도 되므로(선택 장비) 전 구간 가장 저렴
export const TOOLS = {
  axe: {
    nm: "도끼", pic: "🪓", places: ["forest"], required: true,
    desc: "숲에서 나무를 베려면 필요해요",
    tiers: tiers("🪓", [300, 900, 2200, 5000, 11000, 26000, 60000, 150000]),
  },
  pickaxe: {
    nm: "곡괭이", pic: "⛏️", places: ["mine"], required: true,
    desc: "광산에서 광맥을 캐려면 필요해요",
    tiers: tiers("⛏️", [400, 1100, 2600, 6000, 13500, 32000, 75000, 190000]),
  },
  rod: {
    nm: "낚싯대", pic: "🎣", places: ["sea", "river"], required: true,
    desc: "바다·민물 낚시 공용 (미끼도 필요해요)",
    tiers: tiers("🎣", [450, 1300, 3000, 7000, 16000, 38000, 88000, 220000]),
  },
  sickle: {
    nm: "낫", pic: "🌾", places: ["gather"], required: false,
    desc: "채집터는 맨손도 되지만, 낫이 있으면 더 빠르고 좋은 걸 캐요",
    tiers: tiers("🌾", [150, 450, 1100, 2500, 5800, 13500, 32000, 80000]),
  },
  bow: {
    nm: "활", pic: "🏹", places: ["hunt"], required: true,
    desc: "사냥터에서 사냥하려면 반드시 필요해요",
    tiers: tiers("🏹", [350, 1000, 2400, 5500, 12500, 29000, 68000, 170000]),
  },
};

export function toolTier(cat, tierNum) {
  const t = TOOLS[cat]; if (!t || tierNum <= 0) return null;
  return t.tiers[tierNum - 1] || t.tiers[t.tiers.length - 1];
}
// 현재 보유 등급의 성능 스탯(0단계=맨손 허용 시 BAREHAND)
export function toolStat(cat, tierNum) {
  if (!tierNum || tierNum <= 0) return BAREHAND;
  return toolTier(cat, tierNum) || BAREHAND;
}
export function nextTierCost(cat, curTier) {
  const t = TOOLS[cat]; if (!t) return null;
  return t.tiers[curTier] || null; // curTier가 0이면 tiers[0]=1단계, 즉 다음 구매 대상
}
export const TOOL_CATS = Object.keys(TOOLS);

// 미끼(낚시 소모품) — 바다/민물 별도, 낚시 1회(채집 1사이클)당 1개 소모
export const BAIT = {
  sea:   { id: "bait_sea",   nm: "새우 미끼",   pic: "🦐", price: 8 * ECON_SCALE,  place: "sea" },
  river: { id: "bait_river", nm: "지렁이 미끼", pic: "🪱", price: 6 * ECON_SCALE,  place: "river" },
};
