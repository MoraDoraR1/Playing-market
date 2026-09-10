// 경제 — 판매 / 도구·무기 강화 / 물약 구매
import { S, invSlots, playerAtk } from "../core/state.js";
import { won } from "../core/format.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "../ui/view.js";
import { renderHud, renderInv, renderPanel } from "../ui/render.js";

export function sellTotal() { return invSlots().reduce((s, x) => s + x.pr * x.count, 0); }

export function sellOne(id) {
  const it = S.inv[id];
  if (!it || it.count <= 0) return;
  const gain = it.pr * it.count; S.money += gain;
  toast(`${it.pic}${it.nm} ×${it.count} → +${won(gain)}`);
  it.count = 0; sfx.sell();
  renderHud(); renderInv(); renderPanel();
  say(`${it.nm}을(를) 팔아서 ${won(gain)} 벌었어요! 💰`);
}

export function sellAll() {
  const total = sellTotal();
  if (total <= 0) return;
  S.money += total;
  Object.values(S.inv).forEach((x) => (x.count = 0));
  sfx.sell(); toast(`전부 팔았어요! +${won(total)}`);
  say(`자원을 몽땅 팔아서 ${won(total)} 벌었어요! 부자 되는 중~ 🤑`);
  renderHud(); renderInv(); renderPanel();
}

export function toolCost() { return 800 + (S.tool - 1) * 700; }
export function buyTool() {
  const c = toolCost();
  if (S.money < c) { sfx.bad(); toast("돈이 부족해요!"); say("돈이 조금 모자라요~ 자원을 더 팔아봐요! 💸"); return; }
  S.money -= c; S.tool++; sfx.up();
  toast(`도구 강화! Lv.${S.tool}`);
  say(`도구를 강화했어요! 이제 한 번에 최대 ${1 + S.tool}개까지 얻어요! 💪`);
  renderHud(); renderPanel();
}

export function weaponCost() { return 1000 + (S.weapon - 1) * 900; }
export function buyWeapon() {
  const c = weaponCost();
  if (S.money < c) { sfx.bad(); toast("돈이 부족해요!"); say("무기 살 돈이 모자라요~ 더 벌어봐요! 💸"); return; }
  S.money -= c; S.weapon++; sfx.up();
  toast(`무기 강화! Lv.${S.weapon}`);
  say(`무기를 강화했어요! 공격력이 ${playerAtk()}(으)로 올랐어요! 🗡️`);
  renderHud(); renderPanel();
}

export function armorCost() { return 900 + S.armor * 800; }
export function buyArmor() {
  const c = armorCost();
  if (S.money < c) { sfx.bad(); toast("돈이 부족해요!"); say("방어구 살 돈이 모자라요~ 더 벌어봐요! 💸"); return; }
  S.money -= c; S.armor++; sfx.up();
  toast(`방어구 강화! Lv.${S.armor}`);
  say(`방어구를 강화했어요! 이제 받는 피해가 ${S.armor * 3}만큼 줄어요! 🛡️`);
  renderHud(); renderPanel();
}

export function buyPotion() {
  if (S.money < 200) { sfx.bad(); toast("돈이 부족해요!"); return; }
  S.money -= 200; S.potions++; sfx.sell();
  toast(`물약 구매! (${S.potions}개)`);
  say(`회복 물약을 샀어요! 전투 중에 위험하면 써요~ 🧪`);
  renderHud(); renderPanel();
}
