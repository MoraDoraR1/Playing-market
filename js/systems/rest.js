// 휴식 — 잠자기(피로/체력 회복) / 푹신침대 구매
import { S } from "../core/state.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "../ui/view.js";
import { renderHud, renderScene, renderPanel } from "../ui/render.js";

export function doSleep() {
  if (S.fatigue <= 0 && S.hp >= S.maxHp) { say("전혀 안 피곤한데요? 쌩쌩해요! 😆"); return; }
  // 자고 나면 한동안 안 졸려요 — 채집/전투 등으로 다시 피곤해져야 잘 수 있어요.
  // 이게 없으면 계속 눌러서 피로를 공짜로 무한 회복할 수 있어 침대·가구를 살 이유가 없어져요.
  if (!S.canSleep) {
    sfx.bad(); toast("아직 안 졸려요!");
    say("방금 잘 잤잖아요~ 아직 안 졸려요! 채집이나 전투를 좀 더 하고 다시 와요 😅");
    return;
  }
  const rec = S.bed ? 100 : 70;
  S.fatigue = Math.max(0, S.fatigue - rec);
  S.hp = S.bed ? S.maxHp : Math.min(S.maxHp, S.hp + Math.ceil(S.maxHp * 0.7));
  S.canSleep = false;
  sfx.sleep();
  say(S.bed
    ? "푹신침대에서 쿨쿨~ 피로와 체력이 싹 회복됐어요! 😴✨"
    : "쿨쿨 잘 잤다~ 피로가 풀리고 체력도 많이 찼어요! 하지만 침대가 없어서 다 풀리진 않았어요~ 😴");
  renderHud(); renderScene(); renderPanel();
}

export const BED_COST = 600000;
export function buyBed() {
  if (S.money < BED_COST) { sfx.bad(); toast("돈이 부족해요!"); return; }
  S.money -= BED_COST; S.bed = true; sfx.up();
  toast("푹신침대 구매!");
  say("푹신침대를 샀어요! 이제 자면 피로가 완전히 풀려요~ 🛏️");
  renderHud(); renderPanel();
}
