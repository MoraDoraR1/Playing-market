// 월드 맵: 캐릭터를 방향키/WASD/마우스로 직접 움직여 자원·건물에 다가가
// Space(또는 A버튼)로 상호작용하는 원작 「시장놀이」의 조작·문법을 재현.
import { S } from "../core/state.js";
import { PLACES } from "../data/places.js";
import { HEAVEN_DEED } from "../data/ranks.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "./view.js";
import { doWork } from "../systems/gather.js";
import { renderScene, renderPanel, renderNav } from "./render.js";

const W = 480, H = 320;      // 캔버스 내부 해상도
const SPEED = 2.6;           // 이동 속도(px/frame)
const REACH = 46;            // 상호작용 가능 거리

// 맵 위 오브젝트 (kind: gather 자원 / build 건물 / dungeon 던전)
// place: PLACES 키 또는 건물 키. minReq: 계급 잠금. heaven: 선행 잠금.
const OBJECTS = [
  { place: "sea",    kind: "gather", x: 78,  y: 46,  pic: "🌊", label: "바다" },
  { place: "pirate", kind: "gather", x: 240, y: 40,  pic: "🏴‍☠️", label: "해적선", minReq: 3 },
  { place: "river",  kind: "gather", x: 402, y: 46,  pic: "🏞️", label: "강" },
  { place: "forest", kind: "gather", x: 50,  y: 150, pic: "🌳", label: "숲" },
  { place: "mine",   kind: "gather", x: 432, y: 150, pic: "⛏️", label: "광산" },
  { place: "heaven", kind: "gather", x: 240, y: 96,  pic: "☁️", label: "하늘나라", heaven: true },
  { place: "shop",   kind: "build",  x: 168, y: 168, pic: "🏪", label: "상점" },
  { place: "home",   kind: "build",  x: 240, y: 158, pic: "🏠", label: "집" },
  { place: "donate", kind: "build",  x: 312, y: 168, pic: "❤️", label: "기부소" },
  { place: "journal",kind: "build",  x: 205, y: 214, pic: "📋", label: "수첩" },
  { place: "battle", kind: "dungeon",x: 372, y: 236, pic: "🕳️", label: "던전" },
  { place: "field",  kind: "gather", x: 70,  y: 274, pic: "🌾", label: "들판" },
  { place: "dump",   kind: "gather", x: 410, y: 276, pic: "🗑️", label: "쓰레기장" },
];

const HERO = "🧑‍🌾";
const char = { x: 240, y: 188, bob: 0 };   // 캐릭터 위치(저장 안 함)
const held = new Set();                     // 눌린 방향
let target = null;                          // 마우스 이동 목적지
let active = null;                          // 상호작용 가능한 오브젝트
let canvas = null, ctx = null, raf = null, keysBound = false;

function locked(o) {
  if (o.minReq != null && S.rankIdx < o.minReq) return "rank";
  if (o.heaven && !S.heavenOpen) return "heaven";
  return null;
}

// ---- 이동 입력 ----
function bindKeys() {
  if (keysBound) return; keysBound = true;
  const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
  window.addEventListener("keydown", (e) => {
    if (S.mode !== "world") return;
    const d = map[e.key];
    if (d) { held.add(d); target = null; e.preventDefault(); }
  });
  window.addEventListener("keyup", (e) => { const d = map[e.key]; if (d) held.delete(d); });
}

// ---- 마운트 / 언마운트 ----
export function ensureMounted(sc) {
  bindKeys();
  if (canvas && sc.contains(canvas)) { start(); return; }
  sc.style.background = "#bfe3b0";
  sc.style.color = "";
  sc.innerHTML = "";
  canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  canvas.className = "world";
  canvas.setAttribute("aria-label", "게임 월드 지도. 방향키나 WASD, 화면 버튼으로 이동하고 Space로 상호작용");
  sc.appendChild(canvas);
  ctx = canvas.getContext("2d");
  canvas.addEventListener("pointerdown", onCanvasTap);
  sc.appendChild(buildDpad());
  start();
}

export function unmount() { stop(); canvas = null; ctx = null; }

function start() { if (!raf) raf = requestAnimationFrame(loop); }
function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

// 캔버스 좌표로 변환 후: 오브젝트 클릭=그쪽으로 이동, 빈곳 클릭=목적지 설정
function onCanvasTap(e) {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (W / r.width);
  const y = (e.clientY - r.top) * (H / r.height);
  target = { x: Math.max(16, Math.min(W - 16, x)), y: Math.max(24, Math.min(H - 12, y)) };
  held.clear();
}

// ---- 게임 루프 ----
function loop() {
  raf = null;
  if (!canvas || S.mode !== "world") return;
  update();
  draw();
  raf = requestAnimationFrame(loop);
}

function update() {
  let dx = 0, dy = 0;
  if (held.size) {
    if (held.has("up")) dy -= 1;
    if (held.has("down")) dy += 1;
    if (held.has("left")) dx -= 1;
    if (held.has("right")) dx += 1;
  } else if (target) {
    const tx = target.x - char.x, ty = target.y - char.y;
    const dist = Math.hypot(tx, ty);
    if (dist < SPEED) { char.x = target.x; char.y = target.y; target = null; }
    else { dx = tx / dist; dy = ty / dist; }
  }
  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    char.x = Math.max(16, Math.min(W - 16, char.x + (dx / len) * SPEED));
    char.y = Math.max(24, Math.min(H - 12, char.y + (dy / len) * SPEED));
    char.bob += 0.3;
  }
  // 가장 가까운 상호작용 대상
  active = null; let best = REACH;
  for (const o of OBJECTS) {
    const d = Math.hypot(o.x - char.x, o.y - char.y);
    if (d < best) { best = d; active = o; }
  }
}

function draw() {
  // 배경 (풀밭 + 물 + 마을 광장)
  ctx.fillStyle = "#a8e6a1"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#7ec8f0"; ctx.fillRect(0, 0, W, 74);           // 물가(위쪽)
  ctx.fillStyle = "#f2e2b6"; roundRect(150, 140, 190, 96, 16); ctx.fill(); // 마을 광장
  ctx.fillStyle = "#c8b98a"; ctx.fillRect(232, 236, 16, 60);     // 길

  // 오브젝트
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const o of OBJECTS) {
    const lk = locked(o);
    ctx.globalAlpha = lk ? 0.5 : 1;
    ctx.font = "30px serif";
    ctx.fillText(o.pic, o.x, o.y);
    ctx.globalAlpha = 1;
    ctx.font = "11px sans-serif"; ctx.fillStyle = "#2e2620";
    ctx.fillText(lk ? "🔒" + o.label : o.label, o.x, o.y + 22);
  }

  // 상호작용 프롬프트 (활성 대상 위에)
  if (active) {
    ctx.font = "28px serif"; ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(active.x, active.y, 24, 0, Math.PI * 2); ctx.stroke();
    const msg = locked(active) ? "🔒 잠김" : "Space / Ⓐ";
    ctx.font = "bold 11px sans-serif";
    const w = ctx.measureText(msg).width + 12;
    ctx.fillStyle = "#2e2620"; roundRect(active.x - w / 2, active.y - 44, w, 17, 8); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(msg, active.x, active.y - 35);
  }

  // 캐릭터
  ctx.font = "30px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const by = char.y + Math.sin(char.bob) * 2;
  ctx.fillText(HERO, char.x, by);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---- 상호작용 ----
export function interact() {
  if (S.mode !== "world" || !active) return;
  doInteract(active);
}

function doInteract(o) {
  const lk = locked(o);
  if (lk === "rank") { sfx.bad(); toast("상인 계급부터 갈 수 있어요!"); return; }
  if (lk === "heaven") { sfx.bad(); toast(`선행 ${HEAVEN_DEED}점을 모아야 열려요! (지금 ${S.deed}점)`); return; }

  if (o.kind === "gather") {
    S.place = o.place;
    say(`${PLACES[o.place].name}에서 ${PLACES[o.place].verb}!`);
    renderNav();
    doWork();                       // 자원 채집(미니게임 장소는 미니게임)
  } else if (o.kind === "dungeon") {
    enterDungeon();
  } else { // build
    openBuilding(o.place);
  }
}

function openBuilding(place) {
  S.place = place;
  renderPanel(); renderNav();
  const names = { shop: "🏪 상점", home: "🏠 우리 집", donate: "❤️ 기부소", journal: "📋 모험수첩" };
  say(`${names[place] || place}에 들어왔어요! 아래에서 이용해봐요~`);
}

export function enterDungeon() {
  S.mode = "battle"; S.place = "battle"; S.foe = null;
  renderScene(); renderPanel(); renderNav();
  say("던전에 들어왔어요! 몬스터와 싸우거나, 나가기로 마을로 돌아가요 ⚔️");
}

export function exitDungeon() {
  S.mode = "world"; S.place = "forest"; S.foe = null;
  renderScene(); renderPanel(); renderNav();
  say("마을로 돌아왔어요! 자유롭게 돌아다녀 보세요~ 🏘️");
}

// 내비/단축키에서 호출: 그 장소로 순간 이동 후 상호작용 (빠른 이동)
export function goTo(key) {
  const o = OBJECTS.find((x) => x.place === key);
  if (!o) return;
  if (S.mode !== "world") { S.mode = "world"; renderScene(); }
  // 오브젝트 바로 아래로 이동시키고 상호작용
  char.x = o.x; char.y = Math.min(H - 12, o.y + 30); target = null; held.clear();
  active = o;
  doInteract(o);
}

// 터치용 방향 패드 + 액션 버튼
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
    } else {
      b.addEventListener("click", (e) => { e.preventDefault(); interact(); });
    }
    return b;
  };
  wrap.appendChild(mk("up", "▲", "up"));
  wrap.appendChild(mk("left", "◀", "left"));
  wrap.appendChild(mk("act", "Ⓐ", null));
  wrap.appendChild(mk("right", "▶", "right"));
  wrap.appendChild(mk("down", "▼", "down"));
  return wrap;
}
