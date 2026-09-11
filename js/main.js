// 엔트리: 저장 불러오기 → 렌더 → 튜토리얼. 액션바·팝업·키보드 조작 연결.
import { S } from "./core/state.js";
import { load, startAutosave } from "./core/save.js";
import { setMuted, startBgm, stopBgm } from "./core/audio.js";
import { renderAll, openPopup, closePopup, go } from "./ui/render.js";
import { hideModal, $ } from "./ui/view.js";
import { maybeTutorial } from "./ui/tutorial.js";
import { ensureDaily } from "./systems/meta.js";
import * as world from "./ui/world.js";

const KEYMAP = {
  "1": "forest", "2": "sea", "3": "river", "4": "mine", "5": "field",
  "6": "battle", "7": "shop", "8": "home", "9": "journal", "0": "donate",
  "y": "dump", "p": "pirate", "v": "heaven",
};

function shown(id) { const e = $(id); return e && e.classList.contains("show"); }

function handleKey(e) {
  const t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
  const k = e.key;

  // 미니게임
  if (shown("mgOv")) { if (k === " " || k === "Enter") { e.preventDefault(); $("mgHit") && $("mgHit").click(); } return; }
  // 튜토리얼
  const tut = $("tutOv");
  if (tut && tut.classList.contains("show")) {
    if (k === "Enter" || k === " ") { e.preventDefault(); $("tutNext") && $("tutNext").click(); }
    else if (k === "Escape") { $("tutSkip") && $("tutSkip").click(); }
    return;
  }
  // 이벤트 모달
  if (shown("ov")) { if (k === " " || k === "Enter" || k === "Escape") { e.preventDefault(); $("ovBtn") && $("ovBtn").click(); } return; }
  // 팝업 열림 → Esc로 닫기, 그 외 키는 무시(뒤에서 이동 방지)
  if (shown("popup")) { if (k === "Escape") { e.preventDefault(); closePopup(); } return; }

  if (k === "?") { e.preventDefault(); openPopup("manual"); return; }
  if (k === "i" || k === "I") { e.preventDefault(); openPopup("bag"); return; }

  // 주요 행동
  if (k === " " || k === "Enter") {
    e.preventDefault();
    if (S.mode === "world") world.interact();
    else { const b = document.querySelector("#act .btn.work"); if (b && !b.disabled) b.click(); }
    return;
  }
  // 빠른 이동
  const place = KEYMAP[k.toLowerCase()];
  if (place) { e.preventDefault(); go(place); }
}

function applyBgm() { if (S.settings.bgm && S.settings.sound) startBgm(); else stopBgm(); }

function init() {
  load();
  setMuted(!S.settings.sound);
  ensureDaily();
  renderAll();

  $("ovBtn").onclick = hideModal;
  $("popClose").onclick = closePopup;
  $("popup").addEventListener("click", (e) => { if (e.target.id === "popup") closePopup(); });

  $("bagBtn").onclick = () => openPopup("bag");
  $("travelBtn").onclick = () => openPopup("travel");
  $("manualBtn").onclick = () => openPopup("manual");
  $("gearBtn").onclick = () => openPopup("settings");

  document.addEventListener("keydown", handleKey);
  window.addEventListener("pointerdown", applyBgm, { once: true });

  startAutosave();
  maybeTutorial();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
