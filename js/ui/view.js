// UI 기본 요소: DOM 헬퍼, 말풍선, 토스트, 모달, 이펙트, 스프라이트
import { hasSprite, spritePath } from "../data/assets.js";

export const $ = (id) => document.getElementById(id);

// 스프라이트: 준비된 이미지가 있으면 <img>, 없으면 이모지 텍스트
export function sprite(kind, id, emoji, cls = "spr") {
  if (hasSprite(kind, id)) {
    return `<img class="${cls}" src="${spritePath(kind, id)}" alt="" draggable="false">`;
  }
  return emoji || "";
}

export function say(msg) { const t = $("talk"); if (t) t.textContent = msg; }

export function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 1400);
}

export function showModal(em, title, text, onClose) {
  $("ovEm").textContent = em;
  $("ovTitle").textContent = title;
  $("ovText").textContent = text;
  $("ov").classList.add("show");
  $("ov")._onClose = typeof onClose === "function" ? onClose : null;
}
export function hideModal() {
  $("ov").classList.remove("show");
  const cb = $("ov")._onClose; $("ov")._onClose = null;
  if (cb) cb();
}

// 작은 요소 흔들기 애니메이션
export function shake(id) {
  const el = $(id);
  if (el) { el.classList.remove("work"); void el.offsetWidth; el.classList.add("work"); }
}

// 획득 아이템이 위로 떠오르는 이펙트
export function floatLoot(got) {
  const sc = $("scene");
  if (!sc) return;
  const r = sc.getBoundingClientRect();
  got.slice(0, 6).forEach((it, i) => {
    const f = document.createElement("div");
    f.className = "float";
    f.textContent = it.pic;
    f.style.left = (r.width / 2 - 10 + (i - 2) * 22) + "px";
    f.style.top = (r.height / 2) + "px";
    f.style.setProperty("--dx", ((i - 2) * 10) + "px");
    sc.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  });
}
