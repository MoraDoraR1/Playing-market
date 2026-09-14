// 엔트리: 저장 불러오기 → 렌더 → 튜토리얼. 액션바·팝업·키보드 조작 연결.
import { S } from "./core/state.js";
import { load, startAutosave } from "./core/save.js";
import { setMuted, startBgm, stopBgm } from "./core/audio.js";
import { renderAll, renderHud, renderPanel, openPopup, closePopup, go } from "./ui/render.js";
import { hideModal, $ } from "./ui/view.js";
import { maybeTutorial } from "./ui/tutorial.js";
import { ensureDaily } from "./systems/meta.js";
import * as world from "./ui/world.js";
import { clickMonster } from "./systems/battle.js";
import { hasPng, pngURL } from "./data/assets.js";

const KEYMAP = {
  "1": "forest", "2": "sea", "3": "river", "4": "mine", "5": "gather",
  "6": "battle", "7": "shop", "8": "home", "9": "journal", "0": "donate",
  "y": "dump", "p": "pirate", "v": "heaven", "h": "hunt",
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
    else if (S.foe) clickMonster();
    else { const b = document.querySelector("#act .btn.work"); if (b && !b.disabled) b.click(); }
    return;
  }
  // 빠른 이동
  const place = KEYMAP[k.toLowerCase()];
  if (place) { e.preventDefault(); go(place); }
}

function applyBgm() { if (S.settings.bgm && S.settings.sound) startBgm(); else stopBgm(); }

// HUD/액션바의 기본 SVG·이모지 아이콘을 Codex가 만든 PNG로 교체(있을 때만, 1회성 — 값 표시용
// id는 그대로 두고 아이콘 요소만 갈아끼움).
function swapIcon(selector, key, cls) {
  if (!hasPng(key)) return;
  const el = document.querySelector(selector);
  if (el) el.outerHTML = `<img class="${cls}" src="${pngURL(key)}" alt="">`;
}
function applyUiIcons() {
  swapIcon("#rankChip svg.ic", "ui_hud_rank", "ic");
  swapIcon('.chip[title="별머니"] svg.ic', "ui_hud_star", "ic");
  swapIcon('.chip[title="체력"] svg.ic', "ui_hud_hp", "ic");
  swapIcon('.chip[title="피로도"] svg.ic', "ui_hud_fat", "ic");
  swapIcon('.chip[title="선행점수"] svg.ic', "ui_hud_deed", "ic");
  swapIcon("#bagBtn .e", "ui_bag", "e");
  swapIcon("#travelBtn .e", "ui_travel", "e");
  swapIcon("#manualBtn .e", "ui_manual", "e");
  swapIcon("#gearBtn .e", "ui_gear", "e");
}

function init() {
  load();
  setMuted(!S.settings.sound);
  ensureDaily();
  applyUiIcons();
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

  // 피로 자연 회복 + 잠자기 쿨타임 표시를 실시간으로 갱신(가만히 있어도 화면에 반영)
  setInterval(() => { renderHud(); renderPanel(); }, 15000);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
