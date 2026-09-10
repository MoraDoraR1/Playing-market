// 채집/낚시/채광/사냥 — 생산 활동 로직
import { S, addItem, gatherFatigue, gatherBonus } from "../core/state.js";
import { PLACES } from "../data/places.js";
import { rnd, weighted } from "../core/rng.js";
import { sfx } from "../core/audio.js";
import { say, floatLoot, shake } from "../ui/view.js";
import { renderHud, renderInv, renderScene, renderPanel } from "../ui/render.js";
import { checkRankUp } from "./progress.js";
import { onProductionAction } from "./home.js";

export function doWork() {
  const p = PLACES[S.place];
  if (!p || !p.loot) return;
  if (S.fatigue >= 100) {
    sfx.bad();
    say("너무 피곤해서 쓰러질 것 같아요! 🏠집에서 쉬어야 해요~");
    return;
  }
  shake("hero");

  // 수확량: 1 ~ (1+도구레벨) + 가구/요리 보너스
  const amount = 1 + rnd(1 + S.tool) + gatherBonus();
  let got = [], gongGain = 0, rareHit = false;
  for (let i = 0; i < amount; i++) {
    // 레어 확률: 4% + 도구레벨*1.5%
    if (Math.random() < 0.04 + S.tool * 0.015) {
      addItem(p.rare); got.push(p.rare); rareHit = true; gongGain += 8;
    } else {
      const it = weighted(p.loot);
      addItem(it); got.push(it); gongGain += 2;
    }
  }
  gongGain += S.mods.gongBonus || 0;      // 가구(책장) 보너스
  S.gong += gongGain;
  S.fatigue = Math.min(100, S.fatigue + gatherFatigue());
  onProductionAction();                    // 요리 버프 경과 + 농작물 성장

  floatLoot(got);
  if (rareHit) {
    sfx.rare();
    say(`우와! ${p.rare.pic}${p.rare.nm} 같은 귀한 걸 얻었어요!! 🎉`);
  } else {
    sfx.get();
    const first = got[0];
    say(`${first.pic}${first.nm}${got.length > 1 ? " 외 " + (got.length - 1) + "개" : ""} 획득! (내공 +${gongGain})`);
  }

  checkRankUp();
  if (S.fatigue >= 100) say("헉헉... 완전 지쳤어요! 이제 집에서 쉬어야 해요~ 😵");
  renderHud(); renderInv(); renderScene(); renderPanel();
}
