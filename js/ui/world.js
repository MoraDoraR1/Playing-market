// 월드 맵(맵별 분리 · SVG 스프라이트). 방향키/WASD/마우스로 이동,
// 다가가 Space로 상호작용, 길을 따라 맵 끝에 닿으면 옆 맵으로 전환.
import { S } from "../core/state.js";
import { PLACES } from "../data/places.js";
import { HEAVEN_DEED } from "../data/ranks.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "./view.js";
import { doWork } from "../systems/gather.js";
import { renderScene, renderPanel, renderNav, openPopup } from "./render.js";
import { getSprite, preloadSprites } from "./sprites.js";

const W = 600, H = 440;
const SPEED = 3.0, REACH = 58, EDGE = 22, ALIGN = 72;

const ART = {
  forest: "tree", sea: "fishspot", river: "fishspot", mine: "ore", field: "wheat",
  dump: "trash", pirate: "pirate", heaven: "cloud", battle: "cave",
  shop: "b_shop", home: "b_home", donate: "b_donate", journal: "b_journal",
};

const MAPS = {
  village: {
    name: "🏘️ 마을 광장", ground: ["#bff0b4", "#9fe08f"],
    objects: [
      { kind: "build", place: "shop",    x: 132, y: 150, label: "상점" },
      { kind: "build", place: "home",    x: 468, y: 150, label: "집" },
      { kind: "build", place: "donate",  x: 132, y: 302, label: "기부소" },
      { kind: "build", place: "journal", x: 468, y: 302, label: "수첩" },
      { kind: "portal",place: "heaven",  x: 540, y: 84,  label: "하늘나라", heaven: true, to: "heaven" },
    ],
    exits: [{ dir: "N", to: "sea", label: "바닷가" }, { dir: "W", to: "forest", label: "숲" },
            { dir: "E", to: "mine", label: "광산" }, { dir: "S", to: "field", label: "들판" }],
  },
  sea: {
    name: "🌊 바닷가", ground: ["#a9dcf5", "#7ec2ea"],
    objects: [{ kind: "gather", place: "sea", x: 300, y: 250, label: "낚시터" },
              { kind: "gather", place: "pirate", x: 300, y: 96, label: "해적선", minReq: 3 }],
    exits: [{ dir: "S", to: "village", label: "마을" }, { dir: "E", to: "river", label: "강가" }],
  },
  river: {
    name: "🏞️ 강가", ground: ["#a9edd0", "#7fdcb4"],
    objects: [{ kind: "gather", place: "river", x: 300, y: 236, label: "민물 낚시" }],
    exits: [{ dir: "W", to: "sea", label: "바닷가" }, { dir: "N", to: "mine", label: "광산" }],
  },
  forest: {
    name: "🌲 숲속", ground: ["#a6ecab", "#82d68c"],
    objects: [{ kind: "gather", place: "forest", x: 300, y: 236, label: "채집터" }],
    exits: [{ dir: "E", to: "village", label: "마을" }, { dir: "W", to: "dungeon", label: "던전" }],
  },
  dungeon: {
    name: "⚔️ 던전 입구", ground: ["#9aa0a8", "#7c828c"],
    objects: [{ kind: "dungeon", place: "battle", x: 300, y: 236, label: "던전 입구" }],
    exits: [{ dir: "E", to: "forest", label: "숲" }],
  },
  mine: {
    name: "⛏️ 광산", ground: ["#cdd2d8", "#aeb4bc"],
    objects: [{ kind: "gather", place: "mine", x: 300, y: 236, label: "광맥" }],
    exits: [{ dir: "W", to: "village", label: "마을" }, { dir: "S", to: "river", label: "강가" }],
  },
  field: {
    name: "🌾 들판", ground: ["#ffe9a0", "#ffd76a"],
    objects: [{ kind: "gather", place: "field", x: 300, y: 236, label: "사냥터" }],
    exits: [{ dir: "N", to: "village", label: "마을" }, { dir: "E", to: "dump", label: "쓰레기장" }],
  },
  dump: {
    name: "🗑️ 쓰레기장", ground: ["#d5d9cf", "#b8bdb0"],
    objects: [{ kind: "gather", place: "dump", x: 300, y: 236, label: "고물 더미" }],
    exits: [{ dir: "W", to: "field", label: "들판" }],
  },
  heaven: {
    name: "☁️ 하늘나라", ground: ["#e0d4ff", "#c3aaff"],
    objects: [{ kind: "gather", place: "heaven", x: 300, y: 236, label: "별밭" }],
    exits: [{ dir: "S", to: "village", label: "마을" }],
  },
};

const char = { x: 300, y: 344, bob: 0 };
const held = new Set();
let target = null, active = null;
let canvas = null, ctx = null, raf = null, keysBound = false;

function map() { return MAPS[S.mapId] || MAPS.village; }
function blocked() {
  return ["popup", "ov", "tutOv", "mgOv"].some((id) => { const e = document.getElementById(id); return e && e.classList.contains("show"); });
}
function locked(o) {
  if (o.minReq != null && S.rankIdx < o.minReq) return "rank";
  if (o.heaven && !S.heavenOpen) return "heaven";
  return null;
}

function bindKeys() {
  if (keysBound) return; keysBound = true;
  preloadSprites();
  const m = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
  window.addEventListener("keydown", (e) => { if (S.mode !== "world" || blocked()) return; const d = m[e.key]; if (d) { held.add(d); target = null; e.preventDefault(); } });
  window.addEventListener("keyup", (e) => { const d = m[e.key]; if (d) held.delete(d); });
}

export function ensureMounted(sc) {
  bindKeys();
  if (canvas && sc.contains(canvas)) { start(); return; }
  sc.innerHTML = "";
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
    y: Math.max(EDGE, Math.min(H - 16, (e.clientY - r.top) * (H / r.height))),
  };
  held.clear();
}

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
    char.x = Math.max(10, Math.min(W - 10, char.x + (dx / len) * SPEED));
    char.y = Math.max(10, Math.min(H - 10, char.y + (dy / len) * SPEED));
    char.bob += 0.3;
  }
  for (const ex of map().exits) {
    if (ex.dir === "W" && char.x <= EDGE && Math.abs(char.y - H / 2) < ALIGN) return changeMap(ex, "W");
    if (ex.dir === "E" && char.x >= W - EDGE && Math.abs(char.y - H / 2) < ALIGN) return changeMap(ex, "E");
    if (ex.dir === "N" && char.y <= EDGE && Math.abs(char.x - W / 2) < ALIGN) return changeMap(ex, "N");
    if (ex.dir === "S" && char.y >= H - EDGE && Math.abs(char.x - W / 2) < ALIGN) return changeMap(ex, "S");
  }
  active = null; let best = REACH;
  for (const o of map().objects) {
    const d = Math.hypot(o.x - char.x, o.y - char.y);
    if (d < best) { best = d; active = o; }
  }
}

function changeMap(ex, dir) {
  S.mapId = ex.to; held.clear(); target = null; active = null;
  if (dir === "W") { char.x = W - 44; char.y = H / 2; }
  else if (dir === "E") { char.x = 44; char.y = H / 2; }
  else if (dir === "N") { char.x = W / 2; char.y = H - 44; }
  else { char.x = W / 2; char.y = 44; }
  sfx.get();
  say(`${map().name}에 도착! 표지판을 보고 이동해봐요~`);
}

// ---- 그리기 ----
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function drawSprite(name, x, y, size) {
  const img = getSprite(name);
  if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
}

function draw() {
  const M = map();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, M.ground[0]); g.addColorStop(1, M.ground[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // 잔디 점무늬
  ctx.fillStyle = "rgba(255,255,255,.10)";
  for (let i = 0; i < 60; i++) ctx.fillRect((i * 97) % W, (i * 53) % H, 3, 3);

  // 길
  const RW = 46;
  for (const ex of M.exits) {
    ctx.fillStyle = "#d8c48c";
    if (ex.dir === "N") ctx.fillRect(W / 2 - RW / 2, 0, RW, H / 2);
    if (ex.dir === "S") ctx.fillRect(W / 2 - RW / 2, H / 2, RW, H / 2);
    if (ex.dir === "W") ctx.fillRect(0, H / 2 - RW / 2, W / 2, RW);
    if (ex.dir === "E") ctx.fillRect(W / 2, H / 2 - RW / 2, W / 2, RW);
  }
  // 길 가운데 점선
  ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
  for (const ex of M.exits) {
    ctx.beginPath();
    if (ex.dir === "N") { ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H / 2); }
    if (ex.dir === "S") { ctx.moveTo(W / 2, H); ctx.lineTo(W / 2, H / 2); }
    if (ex.dir === "W") { ctx.moveTo(0, H / 2); ctx.lineTo(W / 2, H / 2); }
    if (ex.dir === "E") { ctx.moveTo(W, H / 2); ctx.lineTo(W / 2, H / 2); }
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // 표지판
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const ex of M.exits) drawSign(ex);

  // 오브젝트 (뒤→앞 y정렬)
  const objs = [...M.objects].sort((a, b) => a.y - b.y);
  for (const o of objs) {
    const lk = locked(o);
    ctx.globalAlpha = lk ? 0.55 : 1;
    drawSprite(ART[o.place], o.x, o.y - 6, o.kind === "build" ? 84 : 76);
    ctx.globalAlpha = 1;
    // 라벨 칩
    ctx.font = "bold 13px Jua, sans-serif";
    const t = (lk ? "🔒" : "") + o.label, w = ctx.measureText(t).width + 14;
    ctx.fillStyle = "rgba(255,255,255,.85)"; roundRect(o.x - w / 2, o.y + 26, w, 18, 9); ctx.fill();
    ctx.fillStyle = "#2e2620"; ctx.fillText(t, o.x, o.y + 35);
  }

  // 프롬프트
  if (active) {
    ctx.strokeStyle = "#ffcf33"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(active.x, active.y - 6, 40, 0, Math.PI * 2); ctx.stroke();
    const msg = locked(active) ? "🔒 잠김" : "Space / Ⓐ";
    ctx.font = "bold 12px Jua, sans-serif";
    const w = ctx.measureText(msg).width + 14;
    ctx.fillStyle = "#2e2620"; roundRect(active.x - w / 2, active.y - 62, w, 19, 9); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(msg, active.x, active.y - 52);
  }

  // 캐릭터
  drawSprite("char", char.x, char.y - 10 + Math.sin(char.bob) * 2, 52);
}

function drawSign(ex) {
  const arrow = { N: "⬆", S: "⬇", W: "⬅", E: "➡" }[ex.dir];
  let x, y;
  if (ex.dir === "N") { x = W / 2 + 60; y = 46; }
  else if (ex.dir === "S") { x = W / 2 + 60; y = H - 46; }
  else if (ex.dir === "W") { x = 60; y = H / 2 - 42; }
  else { x = W - 60; y = H / 2 - 42; }
  const text = `${arrow} ${ex.label}`;
  ctx.font = "bold 13px Jua, sans-serif";
  const w = ctx.measureText(text).width + 18;
  ctx.fillStyle = "#7b4a2a"; ctx.fillRect(x - 3, y, 6, 30);
  ctx.fillStyle = "#fff6e0"; ctx.strokeStyle = "#7b4a2a"; ctx.lineWidth = 2.5;
  roundRect(x - w / 2, y - 20, w, 22, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3a2b1f"; ctx.fillText(text, x, y - 9);
}

// ---- 상호작용 ----
export function interact() { if (S.mode === "world" && active) doInteract(active); }
function doInteract(o) {
  const lk = locked(o);
  if (lk === "rank") { sfx.bad(); toast("상인 계급부터 갈 수 있어요!"); return; }
  if (lk === "heaven") { sfx.bad(); toast(`선행 ${HEAVEN_DEED}점을 모아야 열려요! (지금 ${S.deed}점)`); return; }
  if (o.kind === "gather") { S.place = o.place; renderNav(); say(`${PLACES[o.place].name}에서 ${PLACES[o.place].verb}!`); doWork(); }
  else if (o.kind === "dungeon") { enterDungeon(); }
  else if (o.kind === "portal") { changeToMap(o.to); }
  else { openBuilding(o.place); }
}

function openBuilding(place) {
  S.place = place;
  openPopup(place);   // 인게임 팝업 열기
  const names = { shop: "🏪 상점", home: "🏠 우리 집", donate: "❤️ 기부소", journal: "📋 모험수첩" };
  say(`${names[place] || place}에 들어왔어요!`);
}

function changeToMap(mid, atPlace) {
  S.mapId = mid; held.clear(); target = null;
  const o = atPlace ? MAPS[mid].objects.find((x) => x.place === atPlace) : null;
  if (o) { char.x = o.x; char.y = Math.min(H - 16, o.y + 46); active = o; }
  else { char.x = W / 2; char.y = H - 44; active = null; }
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

function buildDpad() {
  const wrap = document.createElement("div");
  wrap.className = "dpad";
  const mk = (cls, txt, dir) => {
    const b = document.createElement("button");
    b.className = "dbtn " + cls; b.textContent = txt; b.setAttribute("aria-label", cls);
    if (dir) {
      const on = (e) => { e.preventDefault(); held.add(dir); target = null; };
      const off = (e) => { e.preventDefault(); held.delete(dir); };
      b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off);
      b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
    } else b.addEventListener("click", (e) => { e.preventDefault(); interact(); });
    return b;
  };
  wrap.appendChild(mk("up", "▲", "up")); wrap.appendChild(mk("left", "◀", "left"));
  wrap.appendChild(mk("act", "Ⓐ", null)); wrap.appendChild(mk("right", "▶", "right"));
  wrap.appendChild(mk("down", "▼", "down"));
  return wrap;
}
