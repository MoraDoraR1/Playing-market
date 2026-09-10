// 모든 아이템의 통합 색인 (장소 자원 + 몬스터 전리품 + 가공품)
// 레시피/농사/UI에서 id로 이름·이모지·판매가를 조회할 때 사용.
import { PLACES } from "./places.js";
import { MONSTERS } from "./monsters.js";

export const ITEM_INDEX = {};

function reg(it) {
  if (it && it.id && !ITEM_INDEX[it.id]) {
    ITEM_INDEX[it.id] = { id: it.id, pic: it.pic, nm: it.nm, pr: it.pr || 0, rare: !!it.rare };
  }
}

Object.values(PLACES).forEach((p) => {
  (p.loot || []).forEach(reg);
  if (p.rare) reg(p.rare);
});
MONSTERS.forEach((m) => reg(m.drop));

// 가공품(작업대 산출물)
reg({ id: "plank", pic: "🟫", nm: "합판", pr: 45 });

export function itemDef(id) { return ITEM_INDEX[id] || { id, pic: "❔", nm: id, pr: 0 }; }
export function itemName(id) { return itemDef(id).nm; }
export function itemPic(id) { return itemDef(id).pic; }
