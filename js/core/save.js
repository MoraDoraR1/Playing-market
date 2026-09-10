// localStorage 자동 저장/불러오기/초기화
import { S, applyState, resetState, SAVE_VERSION } from "./state.js";

const KEY = "kidszzang_market_save_v1";

export function save() {
  try {
    const data = JSON.parse(JSON.stringify(S));
    data.foe = null; // 전투 중 상태는 저장하지 않음
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || data.version !== SAVE_VERSION) {
      // 스키마 불일치 — 추후 마이그레이션 지점. 지금은 새 게임으로.
      return false;
    }
    applyState(data);
    return true;
  } catch (e) {
    return false;
  }
}

export function hardReset() {
  try { localStorage.removeItem(KEY); } catch (e) { /* noop */ }
  resetState();
}

export function hasSave() {
  try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
}

// 주기적 자동 저장 + 이탈 시 저장
export function startAutosave(intervalMs = 3000) {
  setInterval(save, intervalMs);
  window.addEventListener("beforeunload", save);
  document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });
}
