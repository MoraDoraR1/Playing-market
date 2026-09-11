// 첫 진입 튜토리얼 (코치마크 형태의 단계별 안내)
import { S } from "../core/state.js";
import { save } from "../core/save.js";

const STEPS = [
  { em: "🏘️", title: "키즈짱 시장놀이에 온 걸 환영해요!", text: "자원을 모아 팔고, 계급을 올리고, 선행을 쌓는 생활 게임이에요. 천천히 배워볼까요?" },
  { em: "🕹️", title: "① 걸어다녀요", text: "방향키·WASD·마우스로 캐릭터를 움직여요. 길을 따라 맵 끝으로 가면 옆 맵으로 이동! 표지판이 어느 쪽에 뭐가 있는지 알려줘요. 자원·건물에 다가가 Space로 상호작용해요." },
  { em: "⚔️", title: "② 던전에서 싸워요", text: "던전에서 몬스터와 전투! 이기면 전리품·별머니·내공을 얻어요. 무기와 물약을 챙기면 더 든든해요." },
  { em: "🏪", title: "③ 상점에 팔아요", text: "모은 자원은 상점에서 팔아 별머니로! 그 돈으로 도구·무기를 강화하면 더 강해져요. (게임의 유일한 통화는 별머니예요)" },
  { em: "😴", title: "④ 집에서 쉬어요", text: "활동하면 피로도가 쌓이고 체력이 닳아요. 피로도가 가득 차기 전에 집에서 잠을 자 회복하세요!" },
  { em: "❤️", title: "⑤ 선행을 쌓아요", text: "기부소에서 돈을 기부하면 선행점수가 올라요. 50점을 모으면 하늘나라가 열려요! 자, 시작해볼까요?" },
];

export function maybeTutorial() {
  if (S.flags && S.flags.tutorialDone) return;
  open(0);
}

function finish() {
  const ov = document.getElementById("tutOv");
  if (ov) ov.remove();
  S.flags = S.flags || {};
  S.flags.tutorialDone = true;
  save();
}

function open(idx) {
  let ov = document.getElementById("tutOv");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "tutOv";
    ov.className = "ov show";
    document.getElementById("frame").appendChild(ov);
  }
  const s = STEPS[idx];
  const last = idx === STEPS.length - 1;
  ov.innerHTML = `
    <div class="modal">
      <div class="em">${s.em}</div>
      <h2>${s.title}</h2>
      <p>${s.text}</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn sleep" id="tutSkip" style="box-shadow:0 5px 0 rgba(0,0,0,.18);flex:0 0 auto">건너뛰기</button>
        <button class="btn work" id="tutNext" style="box-shadow:0 5px 0 rgba(0,0,0,.18);flex:1">${last ? "시작하기! 🚀" : "다음 ▶"} (${idx + 1}/${STEPS.length})</button>
      </div>
    </div>`;
  document.getElementById("tutSkip").onclick = finish;
  document.getElementById("tutNext").onclick = () => { if (last) finish(); else open(idx + 1); };
}
