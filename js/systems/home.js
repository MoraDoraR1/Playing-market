// P2 집 콘텐츠 로직: 제작 / 요리 / 농사 + 활동 경과 처리
import { S, addItem } from "../core/state.js";
import { CRAFT, COOK, CROPS, MAX_PLOTS } from "../data/recipes.js";
import { itemDef } from "../data/items.js";
import { sfx } from "../core/audio.js";
import { say, toast, showModal } from "../ui/view.js";
import { renderHud, renderInv, renderScene, renderPanel } from "../ui/render.js";

// ---- 인벤토리 재료 확인/차감 ----
export function hasItems(needs) {
  return Object.entries(needs).every(([id, q]) => (S.inv[id] ? S.inv[id].count : 0) >= q);
}
function takeItems(needs) {
  Object.entries(needs).forEach(([id, q]) => { if (S.inv[id]) S.inv[id].count -= q; });
}
export function needsText(needs) {
  return Object.entries(needs)
    .map(([id, q]) => `${itemDef(id).pic}${itemDef(id).nm}×${q}`)
    .join(" + ");
}

// ---- 매 활동(채집/전투)마다 호출: 요리 버프 경과 + 농작물 성장 ----
export function onProductionAction() {
  if (S.foodBuff) {
    S.foodBuff.turns--;
    if (S.foodBuff.turns <= 0) S.foodBuff = null;
  }
  S.farm.forEach((p) => {
    const c = CROPS[p.cropId];
    if (c && p.progress < c.grow) p.progress++;
  });
}

// ---- 작업대(제작) ----
export function craft(recipeId) {
  const r = CRAFT.find((x) => x.id === recipeId);
  if (!r) return;
  if (!r.makesItem && S.furniture.includes(r.id)) { toast("이미 가지고 있어요!"); return; }
  if (!hasItems(r.needs)) { sfx.bad(); toast("재료가 부족해요!"); say(`${r.nm} 만들 재료가 모자라요~ (${needsText(r.needs)}) 🔨`); return; }

  takeItems(r.needs);
  if (r.makesItem) {
    const def = itemDef(r.id);
    addItem(def);
    sfx.up(); toast(`${r.pic}${r.nm} 제작!`);
    say(`${r.pic}${r.nm}을(를) 만들었어요! 가구 재료로 써봐요~ 🪚`);
  } else {
    S.furniture.push(r.id);
    applyFurnitureEffect(r.effect);
    sfx.up();
    showModal(r.pic, `${r.nm} 완성!`, `${r.desc}. 집이 더 좋아졌어요! 🛋️`);
  }
  renderHud(); renderInv(); renderPanel();
}

function applyFurnitureEffect(eff) {
  if (!eff) return;
  if (eff.maxHp) { S.maxHp += eff.maxHp; S.hp += eff.maxHp; }
  if (eff.fatigueReduce) S.mods.fatigueReduce += eff.fatigueReduce;
  if (eff.atkBonus) S.mods.atkBonus += eff.atkBonus;
  if (eff.gatherBonus) S.mods.gatherBonus += eff.gatherBonus;
  if (eff.gongBonus) S.mods.gongBonus += eff.gongBonus;
}

// ---- 부엌(요리) ----
export function cook(recipeId) {
  const c = COOK.find((x) => x.id === recipeId);
  if (!c) return;
  if (!hasItems(c.needs)) { sfx.bad(); toast("재료가 부족해요!"); say(`${c.nm} 요리 재료가 모자라요~ (${needsText(c.needs)}) 🍳`); return; }

  takeItems(c.needs);
  sfx.heal();
  if (c.kind === "instant") {
    if (c.hp) S.hp = Math.min(S.maxHp, S.hp + c.hp);
    if (c.fatigue) S.fatigue = Math.max(0, S.fatigue + c.fatigue);
    say(`${c.pic}${c.nm} 냠냠~ ${c.desc}! 맛있어요! 😋`);
  } else {
    S.foodBuff = { id: c.id, nm: c.nm, pic: c.pic, stat: c.stat, amount: c.amount, turns: c.turns };
    say(`${c.pic}${c.nm}을(를) 먹었어요! ${c.desc} 💪`);
  }
  renderHud(); renderInv(); renderPanel();
}

// ---- 농지(농사) ----
export function plant(cropId) {
  const c = CROPS[cropId];
  if (!c) return;
  if (S.farm.length >= MAX_PLOTS) { sfx.bad(); toast("밭이 가득 찼어요!"); return; }
  if (S.money < c.seedCost) { sfx.bad(); toast("씨앗 살 돈이 부족해요!"); return; }
  S.money -= c.seedCost;
  S.farm.push({ cropId, progress: 0 });
  sfx.get(); toast(`${c.pic}${c.nm} 씨앗을 심었어요!`);
  say(`${c.pic}${c.nm} 씨앗을 심었어요! 활동하며 기다리면 자라나요~ 🌱`);
  renderHud(); renderPanel();
}

export function harvest(index) {
  const p = S.farm[index];
  if (!p) return;
  const c = CROPS[p.cropId];
  if (p.progress < c.grow) { toast("아직 덜 자랐어요!"); return; }
  let msg = [];
  c.yield.forEach((y) => { for (let i = 0; i < y.qty; i++) addItem(y); msg.push(`${y.pic}${y.nm}×${y.qty}`); });
  S.farm.splice(index, 1);
  sfx.up(); toast(`수확! ${msg.join(", ")}`);
  say(`${c.pic}${c.nm}을(를) 수확했어요! ${msg.join(", ")} 획득! 🧺`);
  renderHud(); renderInv(); renderPanel();
}
