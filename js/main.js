// 엔트리 포인트 — 모든 모듈을 묶어 게임을 시작
import { S } from "./core/state.js";
import { load, hardReset, startAutosave, save } from "./core/save.js";
import { setMuted, toggleMuted } from "./core/audio.js";
import { renderAll } from "./ui/render.js";
import { hideModal } from "./ui/view.js";
import { maybeTutorial } from "./ui/tutorial.js";
import { ensureDaily } from "./systems/meta.js";

function $(id) { return document.getElementById(id); }

function updateMuteBtn() {
  const b = $("muteBtn");
  if (b) b.textContent = S.settings.sound ? "🔊 소리" : "🔇 음소거";
}

function init() {
  // 저장된 진행 불러오기
  load();
  setMuted(!S.settings.sound);
  ensureDaily(); // 날짜 바뀌면 퀘스트·시세 갱신

  renderAll();

  // 계급/이벤트 모달 닫기
  $("ovBtn").onclick = hideModal;

  // 음소거 토글
  $("muteBtn").onclick = () => {
    const muted = toggleMuted();
    S.settings.sound = !muted;
    updateMuteBtn();
    save();
  };
  updateMuteBtn();

  // 처음부터 (초기화)
  $("resetBtn").onclick = () => {
    if (!confirm("정말 처음부터 다시 시작할까요? 모은 자원과 계급이 모두 사라져요!")) return;
    hardReset();
    setMuted(!S.settings.sound);
    ensureDaily();
    renderAll();
    updateMuteBtn();
    maybeTutorial();
  };

  startAutosave();
  maybeTutorial();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
