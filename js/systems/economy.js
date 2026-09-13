// 경제 — 판매 / 도구·무기 강화 / 물약 구매
import { S, invSlots, playerAtk, addMoney } from "../core/state.js";
import { won } from "../core/format.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "../ui/view.js";
import { renderHud, renderInv, renderPanel } from "../ui/render.js";
import { sellPrice, recordStat, questProgress } from "./meta.js";
import { TOOLS, BAIT, nextTierCost } from "../data/tools.js";
import { PLACES } from "../data/places.js";

// 시세가 적용된 개당 판매가
export function unitPrice(it) { return sellPrice(it); }
export function sellTotal() { return invSlots().reduce((s, x) => s + unitPrice(x) * x.count, 0); }

export function sellOne(id) {
  const it = S.inv[id];
  if (!it || it.count <= 0) return;
  const gain = unitPrice(it) * it.count; addMoney(gain);
  toast(`${it.pic}${it.nm} ×${it.count} → +${won(gain)}`);
  it.count = 0; sfx.sell();
  recordStat("sold", gain); questProgress("sell", gain);
  renderHud(); renderInv(); renderPanel();
  say(`${it.nm}을(를) 팔아서 ${won(gain)} 벌었어요! 💰`);
}

export function sellAll() {
  const total = sellTotal();
  if (total <= 0) return;
  addMoney(total);
  Object.values(S.inv).forEach((x) => (x.count = 0));
  sfx.sell(); toast(`전부 팔았어요! +${won(total)}`);
  recordStat("sold", total); questProgress("sell", total);
  say(`자원을 몽땅 팔아서 ${won(total)} 벌었어요! 부자 되는 중~ 🤑`);
  renderHud(); renderInv(); renderPanel();
}

// 도구 카테고리(axe/pickaxe/rod/sickle/bow) 다음 단계 구매
export function nextTool(cat) { return nextTierCost(cat, S.equip[cat] || 0); }
export function buyToolTier(cat) {
  const next = nextTool(cat);
  if (!next) { toast("이미 최고 등급이에요!"); return; }
  if (S.money < next.price) { sfx.bad(); toast("돈이 부족해요!"); say("돈이 조금 모자라요~ 자원을 더 팔아봐요! 💸"); return; }
  S.money -= next.price; S.equip[cat] = next.tier; sfx.up();
  const t = TOOLS[cat];
  const placeNames = t.places.map((id) => (PLACES[id] ? PLACES[id].name : id)).join("·");
  toast(`${t.nm} 강화! ${next.nm}등급`);
  say(`${next.label} 장만했어요! 이제 ${placeNames}에서 더 빠르고 좋은 걸 얻을 수 있어요! 💪`);
  renderHud(); renderPanel();
}

// 미끼(바다/민물) 구매 — 5개씩 구매
export function buyBait(kind) {
  const b = BAIT[kind]; if (!b) return;
  const qty = 5, cost = b.price * qty;
  if (S.money < cost) { sfx.bad(); toast("돈이 부족해요!"); return; }
  S.money -= cost; S.bait[kind] = (S.bait[kind] || 0) + qty; sfx.sell();
  toast(`${b.pic}${b.nm} ×${qty} 구매!`);
  say(`${b.nm}를 챙겼어요! 이제 낚시하러 가볼까요? 🎣`);
  renderHud(); renderPanel();
}

export function weaponCost() { return 400000 + (S.weapon - 1) * 360000; }
export function buyWeapon() {
  const c = weaponCost();
  if (S.money < c) { sfx.bad(); toast("돈이 부족해요!"); say("무기 살 돈이 모자라요~ 더 벌어봐요! 💸"); return; }
  S.money -= c; S.weapon++; sfx.up();
  toast(`무기 강화! Lv.${S.weapon}`);
  say(`무기를 강화했어요! 공격력이 ${playerAtk()}(으)로 올랐어요! 🗡️`);
  renderHud(); renderPanel();
}

export function armorCost() { return 360000 + S.armor * 320000; }
export function buyArmor() {
  const c = armorCost();
  if (S.money < c) { sfx.bad(); toast("돈이 부족해요!"); say("방어구 살 돈이 모자라요~ 더 벌어봐요! 💸"); return; }
  S.money -= c; S.armor++; sfx.up();
  toast(`방어구 강화! Lv.${S.armor}`);
  say(`방어구를 강화했어요! 이제 받는 피해가 ${S.armor * 3}만큼 줄어요! 🛡️`);
  renderHud(); renderPanel();
}

export const POTION_COST = 80000;
export function buyPotion() {
  if (S.money < POTION_COST) { sfx.bad(); toast("돈이 부족해요!"); return; }
  S.money -= POTION_COST; S.potions++; sfx.sell();
  toast(`물약 구매! (${S.potions}개)`);
  say(`회복 물약을 샀어요! 전투 중에 위험하면 써요~ 🧪`);
  renderHud(); renderPanel();
}
