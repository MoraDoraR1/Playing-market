// 채집/낚시/채광/사냥 — 생산 활동 로직 (미니게임 지원)
import { S, addItem, gatherFatigue, gatherBonus } from "../core/state.js";
import { PLACES } from "../data/places.js";
import { rnd, weighted } from "../core/rng.js";
import { sfx } from "../core/audio.js";
import { say, floatLoot, shake } from "../ui/view.js";
import { playTiming } from "../ui/minigame.js";
import { renderHud, renderInv, renderScene, renderPanel } from "../ui/render.js";
import { checkRankUp } from "./progress.js";
import { onProductionAction } from "./home.js";
import { discoverItem, recordStat, questProgress } from "./meta.js";

export function doWork() {
  const p = PLACES[S.place];
  if (!p || !p.loot) return;
  if (S.fatigue >= 100) {
    sfx.bad();
    say("너무 피곤해서 쓰러질 것 같아요! 🏠집에서 쉬어야 해요~");
    return;
  }
  if (p.minigame) {
    playTiming(p.verb, (tier) => doHarvest(p, tier));
  } else {
    doHarvest(p, { mult: 1, name: "" });
  }
}

function doHarvest(p, tier) {
  shake("hero");
  const mult = tier.mult != null ? tier.mult : 1;

  // 수확량: 기본 × 성공도 배수
  const base = 1 + rnd(1 + S.tool) + gatherBonus();
  const amount = Math.max(1, Math.round(base * mult));
  const rareMul = tier.perfect ? 2 : 1;

  let got = [], gongGain = 0, rareHit = false;
  for (let i = 0; i < amount; i++) {
    if (Math.random() < (0.04 + S.tool * 0.015) * rareMul) {
      addItem(p.rare); got.push(p.rare); rareHit = true; gongGain += 8;
    } else {
      const it = weighted(p.loot);
      addItem(it); got.push(it); gongGain += 2;
    }
  }
  gongGain += S.mods.gongBonus || 0;
  S.gong += gongGain;
  S.fatigue = Math.min(100, S.fatigue + gatherFatigue());
  got.forEach((g) => discoverItem(g.id));
  recordStat("gather", got.length);
  questProgress("gather", got.length);
  onProductionAction();

  floatLoot(got);
  const tierMsg = tier.name ? `[${tier.name}] ` : "";
  if (rareHit) {
    sfx.rare();
    say(`${tierMsg}우와! ${p.rare.pic}${p.rare.nm} 같은 귀한 걸 얻었어요!! 🎉`);
  } else {
    sfx.get();
    const first = got[0];
    say(`${tierMsg}${first.pic}${first.nm}${got.length > 1 ? " 외 " + (got.length - 1) + "개" : ""} 획득! (내공 +${gongGain})`);
  }

  checkRankUp();
  if (S.fatigue >= 100) say("헉헉... 완전 지쳤어요! 이제 집에서 쉬어야 해요~ 😵");
  renderHud(); renderInv(); renderScene(); renderPanel();
}
