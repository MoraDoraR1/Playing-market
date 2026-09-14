// 몬스터 전투 — 클리커형: 몬스터를 직접 클릭/탭해서 공격하고, 몬스터는 자기 시계(atkInterval)로
// 독립적으로 반격한다(더 이상 "내가 때릴 때마다 반격"이 아님). 장비가 좋아 빨리 잡을수록
// 실제로 맞는 횟수 자체가 줄어드는 게 핵심 — 방어구만으로 위험을 지워버리던 예전 문제를
// 자연스럽게 완화한다. 피로 소모는 여전히 "클릭 1회당 고정량"이라 기존 밸런스 수치를 그대로 물려받음.
import { S, addItem, addMoney, playerAtk } from "../core/state.js";
import { MONSTERS, availableBoss } from "../data/monsters.js";
import { rnd } from "../core/rng.js";
import { won } from "../core/format.js";
import { sfx } from "../core/audio.js";
import { say, toast, showModal, sprite } from "../ui/view.js";
import { renderHud, renderInv, renderScene, renderPanel, renderNav, hitFx, tickAtkBar } from "../ui/render.js";
import { checkRankUp } from "./progress.js";
import { onProductionAction } from "./home.js";
import { discoverMonster, recordStat, questProgress } from "./meta.js";

// 계급이 오를수록 강한 몬스터가 등장
export function pickFoe() {
  const maxIdx = Math.min(MONSTERS.length - 1, 1 + Math.floor(S.rankIdx * 0.8));
  return MONSTERS[rnd(maxIdx + 1)];
}

// 연타가 실제로 먹혀야 "클리커"답다는 피드백 반영 — 예전 220ms는 사람 손으로도 눌리는
// 진짜 연타를 다 씹어먹었음. 이제는 같은 클릭 이벤트가 겹쳐 들어오는 것만 막는 최소한의
// 디바운스(60ms)로 낮춤. 데미지/피로 소모는 클릭 1회=1회 그대로라 밸런스는 안 바뀜 —
// 빨리 때릴수록 몬스터의 공격 타이머가 덜 도는 만큼 더 안전해지기만 함(의도된 보상).
const CLICK_COOLDOWN_MS = 60;
const STRONG_COOLDOWN_MS = 3000; // 강공격 재사용 대기시간
const COMBO_WINDOW_MS = 700;     // 이 시간 안에 다시 클릭하면 콤보 유지, 넘기면 리셋(연출 전용)

let atkTimer = null;      // 몬스터의 "일정 시간마다 공격" 타이머(setInterval id)
let lastClickAt = 0;
let lastStrongAt = 0;
let foeAtkElapsed = 0;    // 다음 몬스터 공격까지 경과 시간(ms) — 게이지 표시용
let combo = 0;            // 연속 클릭 콤보 수 — 순수 연출용(데미지에는 영향 없음)

function stopAtkTimer() { if (atkTimer) { clearInterval(atkTimer); atkTimer = null; } }

function foeTick() {
  // 전투가 끝났거나(승리/패배/도망) 화면을 벗어났으면 스스로 정리(어디서 끝났든 안전).
  if (!S.foe || S.mode !== "battle") { stopAtkTimer(); return; }
  const interval = S.foe.ref.atkInterval || 1800;
  const TICK = 100;
  // 팝업(가방 등)을 열어본 동안은 몬스터도 "잠깐 멈춤" — 부당한 피해 방지.
  if (!S.popup) {
    foeAtkElapsed += TICK;
    if (foeAtkElapsed >= interval) {
      foeAtkElapsed = 0;
      foeAttack();
      if (!S.foe) return; // 그 공격으로 전투가 끝났으면(패배) 더 진행하지 않음
    }
  }
  tickAtkBar(foeAtkElapsed / interval);
}

function foeAttack() {
  const f = S.foe;
  const pdmg = Math.max(1, f.ref.atk + rnd(5) - S.armor * 3);
  S.hp = Math.max(0, S.hp - pdmg);
  sfx.hurt();
  hitFx("pHero", pdmg, "hero");
  if (S.hp <= 0) { loseBattle(); return; }
  renderHud();
}

export function startBattle(foe) {
  if (S.hp <= 0) { sfx.bad(); say("체력이 없어요! 🏠집에서 쉬고 와야 해요~"); return; }
  if (S.fatigue >= 100) { sfx.bad(); say("너무 지쳤어요! 싸우려면 먼저 쉬어야 해요~ 😵"); return; }
  stopAtkTimer();
  S.foe = { ref: foe, hp: foe.hp, boss: !!foe.boss };
  foeAtkElapsed = 0; lastClickAt = 0; lastStrongAt = 0; combo = 0;
  say(`${foe.pic}${foe.nm}와(과)의 전투 시작! 몬스터를 클릭해서 공격해요! 👆`);
  renderScene(); renderPanel();
  atkTimer = setInterval(foeTick, 100);
}

export function startBoss() {
  const boss = availableBoss(S.rankIdx);
  if (!boss) { sfx.bad(); toast("아직 보스에 도전할 수 없어요!"); say("계급을 더 올리면 무시무시한 보스가 나타나요! 🔥"); return; }
  startBattle(boss);
  if (S.foe) say(`🔥 보스 ${boss.pic}${boss.nm} 등장!! 조심해요~ 강공격과 물약을 잘 써봐요!`);
}

// 클릭(탭) 공격 — 클리커형 전투의 핵심 조작
export function clickMonster(e) {
  if (!S.foe) return;
  const now = Date.now();
  if (now - lastClickAt < CLICK_COOLDOWN_MS) return; // 같은 클릭이 겹쳐 들어오는 것만 방지
  combo = (now - lastClickAt < COMBO_WINDOW_MS) ? combo + 1 : 1;
  lastClickAt = now;
  const f = S.foe;
  const dmg = playerAtk() + rnd(6);
  f.hp -= dmg; sfx.hit();
  hitFx("fHero", dmg, "foe", combo, e);
  S.fatigue = Math.min(100, S.fatigue + 5);
  if (f.hp <= 0) { combo = 0; winBattle(); return; }
  renderHud(); renderPanel();
}

export function strongAttack() {
  if (!S.foe) return;
  const now = Date.now();
  if (now - lastStrongAt < STRONG_COOLDOWN_MS) { toast("강공격 준비 중... ⏳"); return; }
  if (S.fatigue >= 100) { sfx.bad(); say("너무 지쳐서 강공격을 할 수 없어요! 😵"); return; }
  lastStrongAt = now;
  const f = S.foe;
  const dmg = playerAtk() * 2 + rnd(8);
  f.hp -= dmg; sfx.hit();
  hitFx("fHero", dmg, "foe");
  S.fatigue = Math.min(100, S.fatigue + 12);
  if (f.hp <= 0) { winBattle(); return; }
  renderHud(); renderPanel();
}

export function usePotion() {
  if (!S.foe) return;
  if (S.potions <= 0) { toast("물약이 없어요!"); return; }
  S.potions--;
  const before = S.hp;
  S.hp = Math.min(S.maxHp, S.hp + 35); sfx.heal();
  const realHeal = S.hp - before;
  toast(`🧪 체력 +${realHeal}!`);
  renderHud(); renderPanel();
}

export function fleeBattle() {
  stopAtkTimer();
  combo = 0;
  S.foe = null; S.fatigue = Math.min(100, S.fatigue + 3);
  onProductionAction();
  say("잽싸게 도망쳤어요! 전리품은 없지만 안전이 최고죠~ 🏃💨");
  renderHud(); renderScene(); renderPanel();
}

function winBattle() {
  stopAtkTimer();
  const f = S.foe.ref;
  const boss = S.foe.boss;
  addItem(f.drop);
  addMoney(f.gold);
  S.gong += f.gong;
  discoverMonster(f.id);
  recordStat("kills", 1);
  if (boss) recordStat("bossKills", 1);
  questProgress("kill", 1);
  onProductionAction();
  S.foe = null; sfx.up();
  if (boss) {
    showModal(sprite("fx", "win", "🏆"), `보스 ${f.nm} 격파!`, `대단해요!! 전리품 ${f.drop.pic}${f.drop.nm} + ${won(f.gold)} + 내공 ${f.gong} 획득! 🎉`);
  } else {
    say(`${f.pic}${f.nm} 처치! 전리품 ${f.drop.pic}${f.drop.nm} + ${won(f.gold)} + 내공 ${f.gong} 획득! 🎉`);
    toast(`승리! +${won(f.gold)} / 내공 +${f.gong}`);
  }
  checkRankUp();
  renderHud(); renderInv(); renderScene(); renderPanel(); renderNav();
}

function loseBattle() {
  stopAtkTimer();
  combo = 0;
  const lost = Math.floor(S.money * 0.1);
  S.money -= lost; S.foe = null; S.hp = S.maxHp; S.place = "home"; S.mode = "world";
  onProductionAction();
  sfx.bad();
  showModal("😵", "기절했어요...", `몬스터에게 졌어요! ${won(lost)}을 떨어뜨렸지만, 착한 이웃이 집으로 데려다줬어요. 체력은 회복됐으니 다시 도전! 💪`);
  renderHud(); renderScene(); renderPanel(); renderNav();
}
