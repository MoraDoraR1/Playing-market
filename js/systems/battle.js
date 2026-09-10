// 몬스터 전투 — 턴제 로직 (보스·강공격·방어구 포함)
import { S, addItem, playerAtk } from "../core/state.js";
import { MONSTERS, availableBoss } from "../data/monsters.js";
import { rnd } from "../core/rng.js";
import { won } from "../core/format.js";
import { sfx } from "../core/audio.js";
import { say, toast, showModal, shake } from "../ui/view.js";
import { renderHud, renderInv, renderScene, renderPanel, renderNav } from "../ui/render.js";
import { checkRankUp } from "./progress.js";
import { onProductionAction } from "./home.js";

// 계급이 오를수록 강한 몬스터가 등장
export function pickFoe() {
  const maxIdx = Math.min(MONSTERS.length - 1, 1 + Math.floor(S.rankIdx * 0.8));
  return MONSTERS[rnd(maxIdx + 1)];
}

export function startBattle(foe) {
  if (S.hp <= 0) { sfx.bad(); say("체력이 없어요! 🏠집에서 쉬고 와야 해요~"); return; }
  if (S.fatigue >= 100) { sfx.bad(); say("너무 지쳤어요! 싸우려면 먼저 쉬어야 해요~ 😵"); return; }
  S.foe = { ref: foe, hp: foe.hp, boss: !!foe.star };
  say(`${foe.pic}${foe.nm}와(과)의 전투 시작! 공격 버튼을 눌러요! ⚔️`);
  renderScene(); renderPanel();
}

export function startBoss() {
  const boss = availableBoss(S.rankIdx);
  if (!boss) { sfx.bad(); toast("아직 보스에 도전할 수 없어요!"); say("계급을 더 올리면 무시무시한 보스가 나타나요! 🔥"); return; }
  startBattle(boss);
  if (S.foe) say(`🔥 보스 ${boss.pic}${boss.nm} 등장!! 조심해요~ 강공격과 물약을 잘 써봐요!`);
}

// 몬스터 반격 (방어구로 피해 감소)
function foeCounter() {
  const f = S.foe;
  const pdmg = Math.max(1, f.ref.atk + rnd(5) - S.armor * 3);
  S.hp = Math.max(0, S.hp - pdmg); sfx.hurt(); shake("pHero");
  return pdmg;
}

export function battleAttack() {
  if (!S.foe) return;
  const f = S.foe;
  const dmg = playerAtk() + rnd(6);
  f.hp -= dmg; sfx.hit(); shake("fHero");
  S.fatigue = Math.min(100, S.fatigue + 5);
  onProductionAction();

  if (f.hp <= 0) { winBattle(); return; }
  const pdmg = foeCounter();
  say(`🗡️ ${dmg} 피해! ${f.ref.pic}의 반격 💥 ${pdmg} 피해!`);
  if (S.hp <= 0) { loseBattle(); return; }
  renderHud(); renderScene(); renderPanel();
}

export function strongAttack() {
  if (!S.foe) return;
  if (S.fatigue >= 100) { sfx.bad(); say("너무 지쳐서 강공격을 할 수 없어요! 😵"); return; }
  const f = S.foe;
  const dmg = playerAtk() * 2 + rnd(8);
  f.hp -= dmg; sfx.hit(); shake("fHero");
  S.fatigue = Math.min(100, S.fatigue + 12);
  onProductionAction();

  if (f.hp <= 0) { winBattle(); return; }
  const pdmg = foeCounter();
  say(`💥 강공격! ${dmg} 피해! ${f.ref.pic}의 반격 💢 ${pdmg} 피해!`);
  if (S.hp <= 0) { loseBattle(); return; }
  renderHud(); renderScene(); renderPanel();
}

export function usePotion() {
  if (!S.foe) return;
  if (S.potions <= 0) { toast("물약이 없어요!"); return; }
  S.potions--;
  const before = S.hp;
  S.hp = Math.min(S.maxHp, S.hp + 35); sfx.heal();
  const realHeal = S.hp - before;
  const pdmg = foeCounter();
  say(`🧪 물약으로 체력 +${realHeal}! 하지만 ${S.foe.ref.pic}의 반격 💥 ${pdmg} 피해!`);
  if (S.hp <= 0) { loseBattle(); return; }
  renderHud(); renderScene(); renderPanel();
}

export function fleeBattle() {
  S.foe = null; S.fatigue = Math.min(100, S.fatigue + 3);
  say("잽싸게 도망쳤어요! 전리품은 없지만 안전이 최고죠~ 🏃💨");
  renderHud(); renderScene(); renderPanel();
}

function winBattle() {
  const f = S.foe.ref;
  const boss = S.foe.boss;
  addItem(f.drop);
  S.money += f.gold;
  S.gong += f.gong;
  if (boss && f.star) S.starMoney += f.star;
  S.fatigue = Math.min(100, S.fatigue + (boss ? 20 : 12));
  S.foe = null; sfx.up();
  if (boss) {
    showModal("🏆", `보스 ${f.nm} 격파!`, `대단해요!! 전리품 ${f.drop.pic}${f.drop.nm} + ${won(f.gold)} + 내공 ${f.gong}${f.star ? ` + 별머니 ⭐${f.star}` : ""} 획득! 🎉`);
  } else {
    say(`${f.pic}${f.nm} 처치! 전리품 ${f.drop.pic}${f.drop.nm} + ${won(f.gold)} + 내공 ${f.gong} 획득! 🎉`);
    toast(`승리! +${won(f.gold)} / 내공 +${f.gong}`);
  }
  checkRankUp();
  renderHud(); renderInv(); renderScene(); renderPanel(); renderNav();
}

function loseBattle() {
  const lost = Math.floor(S.money * 0.1);
  S.money -= lost; S.foe = null; S.hp = S.maxHp; S.place = "home";
  sfx.bad();
  showModal("😵", "기절했어요...", `몬스터에게 졌어요! 게임머니 ${won(lost)}을 떨어뜨렸지만, 착한 이웃이 집으로 데려다줬어요. 체력은 회복됐으니 다시 도전! 💪`);
  renderHud(); renderScene(); renderPanel(); renderNav();
}
