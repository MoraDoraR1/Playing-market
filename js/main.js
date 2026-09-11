// 엔트리 포인트 — 모든 모듈을 묶어 게임을 시작 (PC/키보드 지원 포함)
import { S } from "./core/state.js";
import { load, hardReset, startAutosave, save } from "./core/save.js";
import { setMuted, toggleMuted, startBgm, stopBgm } from "./core/audio.js";
import { renderAll } from "./ui/render.js";
import { hideModal, showModal } from "./ui/view.js";
import { maybeTutorial } from "./ui/tutorial.js";
import { ensureDaily } from "./systems/meta.js";
import * as world from "./ui/world.js";

function $(id) { return document.getElementById(id); }

// 숫자/문자 키 → 내비 버튼 순서(1-based)
const KEYMAP = {
  "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,   // 숲/바다/강/광산/들판
  "6": 8, "7": 9, "8": 10, "9": 12, "0": 11, // 던전/상점/집/수첩/기부소
  "y": 6, "p": 7, "v": 13,                    // 쓰레기장/해적선/하늘나라
};

const HELP_TEXT =
  "걷기: 방향키 / WASD / 마우스 클릭 (캐릭터가 직접 걸어가요)\n" +
  "상호작용: 다가가서 Space 또는 Enter (채집·건물 입장·공격)\n" +
  "빠른 이동(숫자키): 1숲 2바다 3강 4광산 5들판 · 6던전 7상점 8집 9수첩 0기부소 · Y쓰레기장 P해적선 V하늘나라\n" +
  "닫기: Esc";

function overlayShown(id) { const e = $(id); return e && e.classList.contains("show"); }

function handleKey(e) {
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
  const k = e.key;

  // 미니게임이 떠 있으면 Space/Enter로 잡기
  if (overlayShown("mgOv")) {
    if (k === " " || k === "Enter") { e.preventDefault(); $("mgHit") && $("mgHit").click(); }
    return;
  }
  // 튜토리얼 오버레이
  const tut = $("tutOv");
  if (tut && tut.classList.contains("show")) {
    if (k === "Enter" || k === " ") { e.preventDefault(); $("tutNext") && $("tutNext").click(); }
    else if (k === "Escape") { $("tutSkip") && $("tutSkip").click(); }
    return;
  }
  // 이벤트/계급 모달
  if (overlayShown("ov")) {
    if (k === " " || k === "Enter" || k === "Escape") { e.preventDefault(); $("ovBtn") && $("ovBtn").click(); }
    return;
  }
  // 도움말
  if (k === "?") { e.preventDefault(); showHelp(); return; }
  // 주요 행동: 월드에서는 상호작용, 전투에서는 공격 버튼
  if (k === " " || k === "Enter") {
    e.preventDefault();
    if (S.mode === "world") { world.interact(); }
    else { const b = document.querySelector("#act .btn.work"); if (b && !b.disabled) b.click(); }
    return;
  }
  // 장소 이동 단축키
  const idx = KEYMAP[k.toLowerCase()];
  if (idx) {
    const btn = document.querySelector(`.nav button:nth-child(${idx})`);
    if (btn) btn.click();
  }
}

function showHelp() { showModal("⌨️", "조작 도움말", HELP_TEXT); }

function updateMuteBtn() { const b = $("muteBtn"); if (b) b.textContent = S.settings.sound ? "🔊 소리" : "🔇 음소거"; }
function updateBgmBtn() { const b = $("bgmBtn"); if (b) b.textContent = S.settings.bgm ? "🎵 음악끄기" : "🎵 음악" ; }

function applyBgm() { if (S.settings.bgm && S.settings.sound) startBgm(); else stopBgm(); }

function init() {
  load();
  setMuted(!S.settings.sound);
  ensureDaily();

  renderAll();

  $("ovBtn").onclick = hideModal;

  $("muteBtn").onclick = () => {
    const muted = toggleMuted();
    S.settings.sound = !muted;
    updateMuteBtn();
    applyBgm();           // 소리 끄면 BGM도 멈춤
    save();
  };
  $("bgmBtn").onclick = () => {
    S.settings.bgm = !S.settings.bgm;
    updateBgmBtn();
    applyBgm();
    save();
  };
  $("helpBtn").onclick = showHelp;
  updateMuteBtn();
  updateBgmBtn();

  $("resetBtn").onclick = () => {
    if (!confirm("정말 처음부터 다시 시작할까요? 모은 자원과 계급이 모두 사라져요!")) return;
    hardReset();
    setMuted(!S.settings.sound);
    ensureDaily();
    renderAll();
    updateMuteBtn();
    updateBgmBtn();
    maybeTutorial();
  };

  document.addEventListener("keydown", handleKey);
  // 첫 상호작용 때 BGM 시작 (브라우저 자동재생 정책 대응)
  window.addEventListener("pointerdown", applyBgm, { once: true });

  startAutosave();
  maybeTutorial();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
