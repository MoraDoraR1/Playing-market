// 휴식 — 잠자기(피로/체력 회복) / 푹신침대 구매
import { S, applyNaturalRegen, sleepCooldownLeftMs, SLEEP_COOLDOWN_MS } from "../core/state.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "../ui/view.js";
import { renderHud, renderScene, renderPanel } from "../ui/render.js";

export function doSleep() {
  applyNaturalRegen();
  if (S.fatigue <= 0 && S.hp >= S.maxHp) { say("전혀 안 피곤한데요? 쌩쌩해요! 😆"); return; }
  // 잠자기엔 실제 시간 기준 쿨타임이 있어요 — 없으면 계속 눌러서 피로를 공짜로 무한
  // 회복할 수 있어 침대·가구를 살 이유가 없어져요. 대신 가만히 있어도 시간이 지나면
  // 자연 회복(분당 소량)이 되니 "영영 못 푼다"는 답답함은 없어요.
  const left = sleepCooldownLeftMs();
  if (left > 0) {
    const m = Math.ceil(left / 60000);
    sfx.bad(); toast(`아직 안 졸려요! (${m}분 후 가능)`);
    say(`방금 잘 잤잖아요~ ${m}분 정도 더 있어야 다시 잘 수 있어요! 그동안 채집이나 전투를 해봐요 😅`);
    return;
  }
  const rec = S.bed ? 100 : 70;
  S.fatigue = Math.max(0, S.fatigue - rec);
  S.hp = S.bed ? S.maxHp : Math.min(S.maxHp, S.hp + Math.ceil(S.maxHp * 0.7));
  S.lastSleepAt = Date.now();
  sfx.sleep();
  say(S.bed
    ? "푹신침대에서 쿨쿨~ 피로와 체력이 싹 회복됐어요! 😴✨"
    : "쿨쿨 잘 잤다~ 피로가 풀리고 체력도 많이 찼어요! 하지만 침대가 없어서 다 풀리진 않았어요~ 😴");
  renderHud(); renderScene(); renderPanel();
}

export const SLEEP_COOLDOWN_MIN = SLEEP_COOLDOWN_MS / 60000;

export const BED_COST = 600000;
export function buyBed() {
  if (S.money < BED_COST) { sfx.bad(); toast("돈이 부족해요!"); return; }
  S.money -= BED_COST; S.bed = true; sfx.up();
  toast("푹신침대 구매!");
  say("푹신침대를 샀어요! 이제 자면 피로가 완전히 풀려요~ 🛏️");
  renderHud(); renderPanel();
}
