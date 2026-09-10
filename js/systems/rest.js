// 휴식 — 잠자기(피로/체력 회복) / 푹신침대 구매
import { S } from "../core/state.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "../ui/view.js";
import { renderHud, renderScene, renderPanel } from "../ui/render.js";

export function doSleep() {
  if (S.fatigue <= 0 && S.hp >= S.maxHp) { say("전혀 안 피곤한데요? 쌩쌩해요! 😆"); return; }
  const rec = S.bed ? 100 : 70;
  S.fatigue = Math.max(0, S.fatigue - rec);
  S.hp = S.bed ? S.maxHp : Math.min(S.maxHp, S.hp + Math.ceil(S.maxHp * 0.7));
  sfx.sleep();
  say(S.bed
    ? "푹신침대에서 쿨쿨~ 피로와 체력이 싹 회복됐어요! 😴✨"
    : "쿨쿨 잘 잤다~ 피로가 풀리고 체력도 많이 찼어요! 😴");
  renderHud(); renderScene(); renderPanel();
}

export function buyBed() {
  if (S.money < 1500) { sfx.bad(); toast("돈이 부족해요!"); return; }
  S.money -= 1500; S.bed = true; sfx.up();
  toast("푹신침대 구매!");
  say("푹신침대를 샀어요! 이제 자면 피로가 완전히 풀려요~ 🛏️");
  renderHud(); renderPanel();
}
