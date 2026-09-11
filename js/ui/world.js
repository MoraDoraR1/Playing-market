// 월드 맵: 맵별로 분리된 화면. 캐릭터를 방향키/WASD/마우스로 움직여
// 자원·건물에 다가가 Space로 상호작용하고, 길을 따라 맵 끝에 닿으면 옆 맵으로 전환.
import { S } from "../core/state.js";
import { PLACES } from "../data/places.js";
import { HEAVEN_DEED } from "../data/ranks.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "./view.js";
import { doWork } from "../systems/gather.js";
import { renderScene, renderPanel, renderNav } from "./render.js";

const W = 480, H = 320;
const SPEED = 2.6, REACH = 46, EDGE = 16, ALIGN = 60;

// 맵 정의: objects(자원/건물/던전/포탈) + exits(가장자리 길 → 연결 맵)
const MAPS = {
  village: {
    name: "🏘️ 마을 광장", ground: "#a8e6a1",
    objects: [
      { kind: "build", place: "shop",   x: 108, y: 116, pic: "🏪", label: "상점" },
      { kind: "build", place: "home",   x: 372, y: 116, pic: "🏠", label: "집" },
      { kind: "build", place: "donate", x: 108, y: 214, pic: "❤️", label: "기부소" },
      { kind: "build", place: "journal",x: 372, y: 214, pic: "📋", label: "수첩" },
      { kind: "portal",place: "heaven", x: 430, y: 60,  pic: "☁️", label: "하늘나라", heaven: true, to: "heaven" },
    ],
    exits: [
      { dir: "N", to: "sea", label: "바닷가" },
      { dir: "W", to: "forest", label: "숲" },
      { dir: "E", to: "mine", label: "광산" },
      { dir: "S", to: "field", label: "들판" },
    ],
  },
  sea: {
    name: "🌊 바닷가", ground: "#8fd0f0",
    objects: [
      { kind: "gather", place: "sea", x: 240, y: 170, pic: "🎣", label: "낚시터" },
      { kind: "gather", place: "pirate", x: 240, y: 66, pic: "🏴‍☠️", label: "해적선", minReq: 3 },
    ],
    exits: [{ dir: "S", to: "village", label: "마을" }, { dir: "E", to: "river", label: "강가" }],
  },
  river: {
    name: "🏞️ 강가", ground: "#8fe0c0",
    objects: [{ kind: "gather", place: "river", x: 240, y: 160, pic: "🎣", label: "민물 낚시" }],
    exits: [{ dir: "W", to: "sea", label: "바닷가" }],
  },
  forest: {
    name: "🌲 숲속", ground: "#8ce09a",
    objects: [{ kind: "gather", place: "forest", x: 240, y: 160, pic: "🌳", label: "채집터" }],
    exits: [{ dir: "E", to: "village", label: "마을" }, { dir: "W", to: "dungeon", label: "던전" }],
  },
  dungeon: {
    name: "⚔️ 던전 입구", ground: "#8a8f98",
    objects: [{ kind: "dungeon", place: "battle", x: 240, y: 160, pic: "🕳️", label: "던전 입구" }],
    exits: [{ dir: "E", to: "forest", label: "숲" }],
  },
  mine: {
    name: "⛏️ 광산", ground: "#b7bcc4",
    objects: [{ kind: "gather", place: "mine", x: 240, y: 160, pic: "⛏️", label: "광맥" }],
    exits: [{ dir: "W", to: "village", label: "마을" }],
  },
  field: {
    name: "🌾 들판", ground: "#ffe08a",
    objects: [{ kind: "gather", place: "field", x: 240, y: 160, pic: "🌾", label: "사냥터" }],
    exits: [{ dir: "N", to: "village", label: "마을" }, { dir: "E", to: "dump", label: "쓰레기장" }],
  },
  dump: {
    name: "🗑️ 쓰레기장", ground: "#c8ccc0",
    objects: [{ kind: "gather", place: "dump", x: 240, y: 160, pic: "🗑️", label: "고물 더미" }],
    exits: [{ dir: "W", to: "field", label: "들판" }],
  },
  heaven: {
    name: "☁️ 하늘나라", ground: "#cdb8ff",
    objects: [{ kind: "gather", place: "heaven", x: 240, y: 160, pic: "😇", label: "별밭" }],
    exits: [{ dir: "S", to: "village", label: "마을" }],
  },
};

const HERO = "🧑‍🌾";
const char = { x: 240, y: 250, bob: 0 };
const held = new Set();
let target = null, active = null;
let canvas = null, ctx = null, raf = null, keysBound = false;

function map() { return MAPS[S.mapId] || MAPS.village; }
function locked(o) {
  if (o.minReq != null && S.rankIdx < o.minReq) return "rank";
  if (o.heaven && !S.heavenOpen) return "heaven";
  return null;
}

// ---- 입력 ----
function bindKeys() {
  if (keysBound) return; keysBound = true;
  const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
  window.addEventListener("keydown", (e) => { if (S.mode !== "world") return; const d = m[e.key]; if (d) { held.add(d); target = null; e.preventDefault(); } });
  window.addEventListener("keyup", (e) => { const d = m[e.key]; if (d) held.delete(d); });
}

// ---- 마운트 ----
export function ensureMounted(sc) {
  bindKeys();
  if (canvas && sc.contains(canvas)) { start(); return; }
  sc.style.color = ""; sc.innerHTML = "";
  canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H; canvas.className = "world";
  canvas.setAttribute("aria-label", "게임 월드 지도. 방향키/WASD/마우스로 이동, Space로 상호작용, 길 끝으로 가면 다음 맵");
  sc.appendChild(canvas);
  ctx = canvas.getContext("2d");
  canvas.addEventListener("pointerdown", onTap);
  sc.appendChild(buildDpad());
  start();
}
export function unmount() { stop(); canvas = null; ctx = null; }
function start() { if (!raf) raf = requestAnimationFrame(loop); }
function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

function onTap(e) {
  const r = canvas.getBoundingClientRect();
  target = {
    x: Math.max(EDGE, Math.min(W - EDGE, (e.clientX - r.left) * (W / r.width))),
    y: Math.max(EDGE, Math.min(H - 12, (e.clientY - r.top) * (H / r.height))),
  };
  held.clear();
}

// ---- 루프 ----
function loop() {
  raf = null;
  if (!canvas || S.mode !== "world") return;
  update(); draw();
  raf = requestAnimationFrame(loop);
}

function update() {
  let dx = 0, dy = 0;
  if (held.size) {
    if (held.has("up")) dy -= 1; if (held.has("down")) dy += 1;
    if (held.has("left")) dx -= 1; if (held.has("right")) dx += 1;
  } else if (target) {
    const tx = target.x - char.x, ty = target.y - char.y, dist = Math.hypot(tx, ty);
    if (dist < SPEED) { char.x = target.x; char.y = target.y; target = null; }
    else { dx = tx / dist; dy = ty / dist; }
  }
  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    char.x = Math.max(12, Math.min(W - 12, char.x + (dx / len) * SPEED));
    char.y = Math.max(14, Math.min(H - 12, char.y + (dy / len) * SPEED));
    char.bob += 0.3;
  }
  // 길을 따라 가장자리 도달 → 맵 전환
  for (const ex of map().exits) {
    if (ex.dir === "W" && char.x <= EDGE && Math.abs(char.y - H / 2) < ALIGN) return changeMap(ex, "W");
    if (ex.dir === "E" && char.x >= W - EDGE && Math.abs(char.y - H / 2) < ALIGN) return changeMap(ex, "E");
    if (ex.dir === "N" && char.y <= EDGE && Math.abs(char.x - W / 2) < ALIGN) return changeMap(ex, "N");
    if (ex.dir === "S" && char.y >= H - EDGE && Math.abs(char.x - W / 2) < ALIGN) return changeMap(ex, "S");
  }
  // 상호작용 대상
  active = null; let best = REACH;
  for (const o of map().objects) {
    const d = Math.hypot(o.x - char.x, o.y - char.y);
    if (d < best) { best = d; active = o; }
  }
}

function changeMap(ex, dir) {
  S.mapId = ex.to; held.clear(); target = null; active = null;
  if (dir === "W") { char.x = W - 40; char.y = H / 2; }
  else if (dir === "E") { char.x = 40; char.y = H / 2; }
  else if (dir === "N") { char.x = W / 2; char.y = H - 40; }
  else { char.x = W / 2; char.y = 40; }
  sfx.get();
  say(`${map().name}에 도착했어요! 표지판을 보고 이동해봐요~`);
}

// ---- 그리기 ----
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function draw() {
  const M = map();
  ctx.fillStyle = M.ground; ctx.fillRect(0, 0, W, H);

  // 길(가장자리 방향으로) — 있는 출구 방향만
  ctx.fillStyle = "rgba(210,190,140,.9)";
  for (const ex of M.exits) {
    if (ex.dir === "N") ctx.fillRect(W / 2 - 20, 0, 40, H / 2);
    if (ex.dir === "S") ctx.fillRect(W / 2 - 20, H / 2, 40, H / 2);
    if (ex.dir === "W") ctx.fillRect(0, H / 2 - 20, W / 2, 40);
    if (ex.dir === "E") ctx.fillRect(W / 2, H / 2 - 20, W / 2, 40);
  }

  // 맵 이름 배너
  ctx.font = "bold 14px sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(46,38,32,.75)"; roundRect(8, 8, ctx.measureText(M.name).width + 16, 22, 8); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillText(M.name, 16, 12);

  // 표지판(각 출구)
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const ex of M.exits) drawSign(ex);

  // 오브젝트
  for (const o of M.objects) {
    const lk = locked(o);
    ctx.globalAlpha = lk ? 0.5 : 1; ctx.font = "32px serif"; ctx.fillText(o.pic, o.x, o.y);
    ctx.globalAlpha = 1; ctx.font = "12px sans-serif"; ctx.fillStyle = "#2e2620";
    ctx.fillText((lk ? "🔒" : "") + o.label, o.x, o.y + 24);
  }

  // 상호작용 프롬프트
  if (active) {
    ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(active.x, active.y, 25, 0, Math.PI * 2); ctx.stroke();
    const msg = locked(active) ? "🔒 잠김" : "Space / Ⓐ";
    ctx.font = "bold 11px sans-serif";
    const w = ctx.measureText(msg).width + 12;
    ctx.fillStyle = "#2e2620"; roundRect(active.x - w / 2, active.y - 46, w, 17, 8); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(msg, active.x, active.y - 37);
  }

  // 캐릭터
  ctx.font = "30px serif";
  ctx.fillText(HERO, char.x, char.y + Math.sin(char.bob) * 2);
}

function drawSign(ex) {
  const arrow = { N: "⬆", S: "⬇", W: "⬅", E: "➡" }[ex.dir];
  let x, y;
  if (ex.dir === "N") { x = W / 2; y = 40; }
  else if (ex.dir === "S") { x = W / 2; y = H - 40; }
  else if (ex.dir === "W") { x = 46; y = H / 2 - 30; }
  else { x = W - 46; y = H / 2 - 30; }
  const text = `${arrow} ${ex.label}`;
  ctx.font = "bold 12px sans-serif";
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = "#6b4a24"; ctx.fillRect(x - 2, y, 4, 26);          // 기둥
  ctx.fillStyle = "#fff8e6"; ctx.strokeStyle = "#6b4a24"; ctx.lineWidth = 2;
  roundRect(x - w / 2, y - 18, w, 20, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3a2b1f"; ctx.fillText(text, x, y - 8);
}

// ---- 상호작용 ----
export function interact() { if (S.mode === "world" && active) doInteract(active); }

function doInteract(o) {
  const lk = locked(o);
  if (lk === "rank") { sfx.bad(); toast("상인 계급부터 갈 수 있어요!"); return; }
  if (lk === "heaven") { sfx.bad(); toast(`선행 ${HEAVEN_DEED}점을 모아야 열려요! (지금 ${S.deed}점)`); return; }

  if (o.kind === "gather") {
    S.place = o.place; renderNav();
    say(`${PLACES[o.place].name}에서 ${PLACES[o.place].verb}!`);
    doWork();
  } else if (o.kind === "dungeon") {
    enterDungeon();
  } else if (o.kind === "portal") {
    changeToMap(o.to);
  } else {
    openBuilding(o.place);
  }
}

function openBuilding(place) {
  S.place = place; renderPanel(); renderNav();
  const names = { shop: "🏪 상점", home: "🏠 우리 집", donate: "❤️ 기부소", journal: "📋 모험수첩" };
  say(`${names[place] || place}에 들어왔어요! 아래에서 이용해봐요~`);
}

// 포탈/빠른이동으로 특정 맵의 특정 오브젝트 앞으로
function changeToMap(mid, atPlace) {
  S.mapId = mid; held.clear(); target = null;
  const o = atPlace ? MAPS[mid].objects.find((x) => x.place === atPlace) : null;
  if (o) { char.x = o.x; char.y = Math.min(H - 14, o.y + 34); active = o; }
  else { char.x = W / 2; char.y = H - 40; active = null; }
}

export function enterDungeon() {
  S.mode = "battle"; S.place = "battle"; S.foe = null;
  renderScene(); renderPanel(); renderNav();
  say("던전에 들어왔어요! 몬스터와 싸우거나 나가기로 돌아가요 ⚔️");
}
export function exitDungeon() {
  S.mode = "world"; S.mapId = "dungeon"; S.foe = null;
  renderScene(); renderPanel(); renderNav();
  say("던전 입구로 나왔어요. 동쪽 길로 가면 숲이에요~ 🌲");
}

// 내비/숫자키 빠른 이동: 해당 장소 맵으로 이동 후 상호작용
export function goTo(key) {
  for (const mid in MAPS) {
    const o = MAPS[mid].objects.find((x) => x.place === key);
    if (o) {
      if (S.mode !== "world") { S.mode = "world"; renderScene(); }
      changeToMap(mid, key);
      doInteract(o);
      return;
    }
  }
}

// 터치 방향 패드 + 액션 버튼
function buildDpad() {
  const wrap = document.createElement("div");
  wrap.className = "dpad";
  const mk = (cls, txt, dir) => {
    const b = document.createElement("button");
    b.className = "dbtn " + cls; b.textContent = txt; b.setAttribute("aria-label", cls);
    if (dir) {
      const on = (e) => { e.preventDefault(); held.add(dir); target = null; };
      const off = (e) => { e.preventDefault(); held.delete(dir); };
      b.addEventListener("pointerdown", on);
      b.addEventListener("pointerup", off);
      b.addEventListener("pointerleave", off);
      b.addEventListener("pointercancel", off);
    } else b.addEventListener("click", (e) => { e.preventDefault(); interact(); });
    return b;
  };
  wrap.appendChild(mk("up", "▲", "up")); wrap.appendChild(mk("left", "◀", "left"));
  wrap.appendChild(mk("act", "Ⓐ", null)); wrap.appendChild(mk("right", "▶", "right"));
  wrap.appendChild(mk("down", "▼", "down"));
  return wrap;
}
