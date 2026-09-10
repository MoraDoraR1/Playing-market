// 성장 — 계급 승급 / 기부(선행점수) / 하늘나라 개방
import { S, rankName, nextRank } from "../core/state.js";
import { RANKS, HEAVEN_DEED } from "../data/ranks.js";
import { won } from "../core/format.js";
import { sfx } from "../core/audio.js";
import { say, toast, showModal } from "../ui/view.js";
import { renderHud, renderPanel, renderNav } from "../ui/render.js";

export function checkRankUp() {
  const nr = nextRank();
  if (nr && S.gong >= nr.g) {
    S.rankIdx++; sfx.up();
    const isKing = S.rankIdx === RANKS.length - 1;
    showModal(
      isKing ? "👑" : "🏅",
      isKing ? "최고 계급 달성!" : "계급 상승!",
      isKing
        ? `축하해요! 마침내 '생명의 왕'이 되었어요! 시장의 전설이에요! 👑✨`
        : `계급이 '${rankName()}'(으)로 올랐어요! 더 열심히 모아봐요! 🎉`
    );
    checkRankUp(); // 여러 단계 동시 승급 대비
  }
}

export function donate(m, d) {
  if (S.money < m) { sfx.bad(); toast("돈이 부족해요!"); say("기부하고 싶은데 돈이 모자라요~ 조금 더 벌어와요! 💸"); return; }
  S.money -= m; S.deed += d; sfx.sell();
  toast(`선행 +${d}점! ❤️`);
  say(`${won(m)}을 기부했어요! 마음이 따뜻해지네요~ 선행점수 ${S.deed}점! ❤️`);
  if (!S.heavenOpen && S.deed >= HEAVEN_DEED) {
    S.heavenOpen = true; sfx.up();
    showModal("😇", "하늘나라 개방!", `선행점수 ${HEAVEN_DEED}점 달성! 이제 아래 ☁️하늘나라에 갈 수 있어요. 귀한 보물이 가득해요!`);
  }
  renderHud(); renderPanel(); renderNav();
}
