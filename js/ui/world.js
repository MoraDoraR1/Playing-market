// 월드 맵(맵별 분리 · SVG 스프라이트). 방향키/WASD/마우스로 이동,
// 다가가 Space로 상호작용, 길을 따라 맵 끝에 닿으면 옆 맵으로 전환.
import { S } from "../core/state.js";
import { PLACES } from "../data/places.js";
import { HEAVEN_DEED } from "../data/ranks.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "./view.js";
import { doWork, doHarvest } from "../systems/gather.js";
import { renderScene, renderPanel, renderNav, openPopup } from "./render.js";
import { getSprite, preloadSprites } from "./sprites.js";
import { TOOLS, BAIT, toolStat } from "../data/tools.js";

// ---- 해상도: 1920x1080(16:9)을 앵커로 고정 ----
// 캔버스 실물 해상도는 항상 1920x1080. 기존에 600x440 기준으로 튜닝된 모든 좌표·크기는
// 세로 기준 균일 배율(SCALE)로 확대해 왜곡 없이 그대로 재사용하고(비율 유지),
// 가로는 스케일 후 남는 여백만큼 콘텐츠를 화면 중앙에 배치한다(레터박스).
const DESIGN_W = 600, DESIGN_H = 440;
const CANVAS_W = 1920, CANVAS_H = 1080;
const SCALE = CANVAS_H / DESIGN_H;                    // 세로를 정확히 채우는 균일 배율(비율 왜곡 없음)
const s = (n) => n * SCALE;                            // 기존 튜닝값 → 새 해상도로 환산
const W = Math.round(DESIGN_W * SCALE), H = CANVAS_H;  // 로직(콘텐츠) 공간 크기
const OFFSET_X = (CANVAS_W - W) / 2;                   // 콘텐츠를 캔버스 중앙에 배치하기 위한 여백

const SPEED = s(1.9), REACH = s(58), EDGE = s(22), ALIGN = s(72);
const CS = s(74), COFF = s(18);   // 캐릭터 렌더 크기 / 발끝 보정
const RW = s(46);                 // 길 폭
const DOTS = Math.round(60 * SCALE * SCALE); // 잔디 점무늬 개수(면적 비례)

const ART = {
  forest: "obj_tree", forest_deep: "obj_tree",
  sea: "obj_fishspot", sea_deep: "obj_fishspot",
  river: "obj_fishspot", river_deep: "obj_fishspot",
  mine: "obj_ore", mine_deep: "obj_ore",
  gather: "obj_wheat", gather_deep: "obj_wheat", hunt: null, hunt_deep: null,
  dump: "obj_trash", pirate: "obj_pirate", heaven: "obj_cloud", battle: "obj_cave",
  shop: "obj_b_shop", home: "obj_b_home", donate: "obj_b_donate", journal: "obj_b_journal",
};

// 오브젝트 이름 규칙: 같은 자원을 주는 노드는 이름을 통일하고("낚시터"가 여러 개),
// 자원 구성이 다른("고급") 노드만 별도 이름 + 별도 place(도구 최소 등급 조건)를 씀.
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
    objects: [{ kind: "gather", place: "sea", x: 150, y: 300, label: "낚시터" },
              { kind: "gather", place: "sea", x: 470, y: 320, label: "낚시터" },
              { kind: "gather", place: "sea_deep", x: 480, y: 110, label: "심해" },
              { kind: "gather", place: "sea_deep", x: 150, y: 120, label: "심해" },
              { kind: "gather", place: "pirate", x: 300, y: 96, label: "해적선", minReq: 3 }],
    exits: [{ dir: "S", to: "village", label: "마을" }, { dir: "E", to: "river", label: "강가" }],
  },
  river: {
    name: "🏞️ 강가", ground: ["#a9edd0", "#7fdcb4"],
    objects: [{ kind: "gather", place: "river", x: 150, y: 320, label: "낚시터" },
              { kind: "gather", place: "river", x: 450, y: 300, label: "낚시터" },
              { kind: "gather", place: "river", x: 450, y: 120, label: "낚시터" },
              { kind: "gather", place: "river_deep", x: 150, y: 120, label: "깊은 여울" },
              { kind: "gather", place: "river_deep", x: 500, y: 220, label: "깊은 여울" }],
    exits: [{ dir: "W", to: "sea", label: "바닷가" }, { dir: "N", to: "mine", label: "광산" }],
  },
  forest: {
    name: "🌲 숲속", ground: ["#a6ecab", "#82d68c"],
    objects: [{ kind: "gather", place: "forest", x: 460, y: 150, label: "벌목터" },
              { kind: "gather", place: "forest", x: 150, y: 330, label: "벌목터" },
              { kind: "gather", place: "forest", x: 300, y: 120, label: "벌목터" },
              { kind: "gather", place: "forest_deep", x: 500, y: 330, label: "깊은 숲" },
              { kind: "gather", place: "forest_deep", x: 150, y: 150, label: "깊은 숲" }],
    exits: [{ dir: "E", to: "village", label: "마을" }, { dir: "W", to: "dungeon", label: "던전" }],
  },
  dungeon: {
    name: "⚔️ 던전 입구", ground: ["#9aa0a8", "#7c828c"],
    objects: [{ kind: "dungeon", place: "battle", x: 300, y: 236, label: "던전 입구" }],
    exits: [{ dir: "E", to: "forest", label: "숲" }],
  },
  mine: {
    name: "⛏️ 광산", ground: ["#cdd2d8", "#aeb4bc"],
    objects: [{ kind: "gather", place: "mine_deep", x: 460, y: 150, label: "심층 갱도" },
              { kind: "gather", place: "mine", x: 150, y: 120, label: "광맥" },
              { kind: "gather", place: "mine", x: 500, y: 320, label: "광맥" },
              { kind: "gather", place: "mine_deep", x: 450, y: 250, label: "심층 갱도" },
              { kind: "gather", place: "mine", x: 150, y: 350, label: "광맥" }],
    exits: [{ dir: "W", to: "village", label: "마을" }, { dir: "S", to: "river", label: "강가" }],
  },
  field: {
    name: "🌾 들판", ground: ["#ffe9a0", "#ffd76a"],
    objects: [{ kind: "gather", place: "gather", x: 210, y: 230, label: "채집터" },
              { kind: "gather", place: "gather", x: 150, y: 340, label: "채집터" },
              { kind: "gather", place: "gather_deep", x: 480, y: 110, label: "약초밭" },
              { kind: "gather", place: "hunt",   x: 430, y: 290, label: "사냥터" },
              { kind: "gather", place: "hunt_deep", x: 500, y: 340, label: "매복터" }],
    exits: [{ dir: "N", to: "village", label: "마을" }, { dir: "E", to: "dump", label: "쓰레기장" }],
  },
  dump: {
    name: "🗑️ 쓰레기장", ground: ["#d5d9cf", "#b8bdb0"],
    objects: [{ kind: "gather", place: "dump", x: 460, y: 150, label: "고물 더미" },
              { kind: "gather", place: "dump", x: 150, y: 320, label: "고물 더미" },
              { kind: "gather", place: "dump", x: 500, y: 300, label: "고물 더미" },
              { kind: "gather", place: "dump", x: 450, y: 380, label: "고물 더미" },
              { kind: "gather", place: "dump", x: 150, y: 120, label: "고물 더미" }],
    exits: [{ dir: "W", to: "field", label: "들판" }],
  },
  heaven: {
    name: "☁️ 하늘나라", ground: ["#e0d4ff", "#c3aaff"],
    objects: [{ kind: "gather", place: "heaven", x: 460, y: 150, label: "별밭" },
              { kind: "gather", place: "heaven", x: 150, y: 150, label: "별밭" },
              { kind: "gather", place: "heaven", x: 150, y: 300, label: "별밭" },
              { kind: "gather", place: "heaven", x: 500, y: 320, label: "별밭" },
              { kind: "gather", place: "heaven", x: 150, y: 380, label: "별밭" }],
    exits: [{ dir: "S", to: "village", label: "마을" }],
  },
};
// 위 좌표는 600x440 디자인 기준값 — 새 해상도로 일괄 환산(비율 왜곡 없이 균일 배율)
for (const m of Object.values(MAPS)) for (const o of m.objects) { o.x = s(o.x); o.y = s(o.y); }

const char = { x: W / 2, y: s(344), bob: 0, dir: "down", step: 0, moving: false };
const held = new Set();
let target = null, active = null;
let gather = null;   // 채집 중: { place, prog(0~1), anim }
let canvas = null, ctx = null, raf = null, keysBound = false;

function map() { return MAPS[S.mapId] || MAPS.village; }
function blocked() {
  return ["popup", "ov", "tutOv", "mgOv"].some((id) => { const e = document.getElementById(id); return e && e.classList.contains("show"); });
}
function locked(o) {
  if (o.minReq != null && S.rankIdx < o.minReq) return "rank";
  if (o.heaven && !S.heavenOpen) return "heaven";
  if (o.kind === "gather") {
    const p = PLACES[o.place];
    if (p && p.toolRequired && !(S.equip[p.tool] > 0)) return "tool";
    if (p && p.bait && !((S.bait[p.bait] || 0) > 0)) return "bait";
    if (p && p.minTier && (S.equip[p.tool] || 0) < p.minTier) return "minTier";
  }
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
  canvas.width = CANVAS_W; canvas.height = CANVAS_H; canvas.className = "world";
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
  const px = (e.clientX - r.left) * (CANVAS_W / r.width) - OFFSET_X;
  const py = (e.clientY - r.top) * (CANVAS_H / r.height);
  target = {
    x: Math.max(EDGE, Math.min(W - EDGE, px)),
    y: Math.max(EDGE, Math.min(H - s(16), py)),
  };
  held.clear();
}

function loop() {
  // 주의: update()가 채집 완료(finishGather→doHarvest→renderScene→ensureMounted→start())를
  // 재귀적으로 트리거할 수 있다. 여기서 raf를 미리 null로 비워두면 그 사이에 start()가
  // "안 돌고 있네?" 하고 착각해 rAF 체인을 하나 더 만들어버려서, 채집할 때마다 루프가
  // 2배·4배·8배로 배가되며 이동/애니메이션 속도가 기하급수적으로 빨라지는 버그가 있었다.
  // (raf를 끝까지 값이 있는 상태로 유지 → start()의 재진입 방지)
  if (!canvas || S.mode !== "world") { raf = null; return; }
  update(); draw();
  raf = requestAnimationFrame(loop);
}

function update() {
  // 채집 중: 게이지 자동 충전(시간 기반, 이동/전환 잠금)
  if (gather) {
    gather.anim++;
    gather.prog = (performance.now() - gather.start) / gather.dur;
    if (gather.prog >= 1) finishGather();
    char.moving = false;
    return;
  }

  let dx = 0, dy = 0;
  if (held.size) {
    if (held.has("up")) dy -= 1; if (held.has("down")) dy += 1;
    if (held.has("left")) dx -= 1; if (held.has("right")) dx += 1;
  } else if (target) {
    const tx = target.x - char.x, ty = target.y - char.y, dist = Math.hypot(tx, ty);
    if (dist < SPEED) { char.x = target.x; char.y = target.y; target = null; }
    else { dx = tx / dist; dy = ty / dist; }
  }
  char.moving = !!(dx || dy);
  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    char.x = Math.max(s(10), Math.min(W - s(10), char.x + (dx / len) * SPEED));
    char.y = Math.max(s(10), Math.min(H - s(10), char.y + (dy / len) * SPEED));
    char.bob += 0.3; char.step++;
    if (Math.abs(dx) > Math.abs(dy)) char.dir = dx < 0 ? "left" : "right";
    else char.dir = dy < 0 ? "up" : "down";
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
  if (dir === "W") { char.x = W - s(44); char.y = H / 2; }
  else if (dir === "E") { char.x = s(44); char.y = H / 2; }
  else if (dir === "N") { char.x = W / 2; char.y = H - s(44); }
  else { char.x = W / 2; char.y = s(44); }
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
// 이음매 없이 타일링되는 재질(Codex 생성) → 캔버스 패턴. 아직 로드 전이면 null(폴백 색상 사용).
// scale로 타일 자체를 확대해서 화면에 보이는 반복 횟수를 줄인다(너무 촘촘하면 눈이 아프다는 피드백).
function pattern(key, scale) {
  if (!key) return null;
  const img = getSprite(key);
  if (img && img.complete && img.naturalWidth) {
    const pat = ctx.createPattern(img, "repeat");
    if (pat && scale && scale !== 1 && pat.setTransform) {
      try { pat.setTransform(new DOMMatrix().scale(scale)); } catch (e) { /* 구형 브라우저 폴백 무시 */ }
    }
    return pat;
  }
  return null;
}
const GROUND_TILE_SCALE = 1.15; // 바닥 타일 확대 배율(타일이 너무 촘촘해 눈이 아프다는 피드백 반영)
const ROAD_TILE_SCALE = 1.1;    // 길 타일 확대 배율
// 길을 반듯한 직사각형이 아니라 살짝 구불구불한(발로 다져진 듯한) 오솔길처럼 보이게 하는 흔들림.
// t: 교차로(0)~맵 끝(1) 사이 진행도, seed: 방향별로 흔들림 패턴이 겹치지 않게 하는 위상차.
function roadWobble(t, seed) {
  return Math.sin(t * 7 + seed) * s(5) + Math.sin(t * 3.1 + seed * 1.7) * s(3);
}
const ROAD_SEED = { N: 0, S: 10, W: 20, E: 30 };
// 교차로 중심에서 맵 끝까지, 살짝 굽이치는 폭 가변 오솔길을 여러 개의 원을 이어붙여 채운다
// (원 여러 개를 하나의 path로 합쳐 채우면 각지지 않고 자연스럽게 이어짐).
function drawOrganicRoad(dir) {
  const halfW = RW / 2, steps = 16, seed = ROAD_SEED[dir];
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const along = t * (dir === "N" || dir === "S" ? H / 2 : W / 2);
    const wob = roadWobble(t, seed);
    const rr = halfW + Math.sin(t * 5 + seed * 1.3) * s(3);
    let cx, cy;
    if (dir === "N") { cx = W / 2 + wob; cy = H / 2 - along; }
    else if (dir === "S") { cx = W / 2 + wob; cy = H / 2 + along; }
    else if (dir === "W") { cx = W / 2 - along; cy = H / 2 + wob; }
    else { cx = W / 2 + along; cy = H / 2 + wob; }
    ctx.moveTo(cx + rr, cy);
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
  }
}
// 맵마다 다른 바닥 재질 — 몰입감을 위해 맵별로 실제 지형처럼 보이게(요청: "맵 배경 다 다르게").
const GROUND_TEX = {
  village: "bg_ground_village", forest: "bg_ground_forest", sea: "bg_ground_sea",
  river: "bg_ground_river", mine: "bg_ground_mine", field: "bg_ground_field",
  dump: "bg_ground_dump", dungeon: "bg_ground_dungeon", heaven: "bg_ground_heaven",
};
// 길 재질은 생물군계별로 공유(흙길/모랫길/돌길/구름길)
const ROAD_TEX = {
  village: "bg_road_dirt", forest: "bg_road_dirt", field: "bg_road_dirt", dump: "bg_road_dirt",
  sea: "bg_road_sand", river: "bg_road_sand",
  mine: "bg_road_stone", dungeon: "bg_road_stone",
  heaven: "bg_road_cloud",
};

function draw() {
  const M = map();
  // 배경은 캔버스 전체(레터박스 여백 포함)를 채워 여백이 비어 보이지 않게 함
  const groundPat = pattern(GROUND_TEX[S.mapId], GROUND_TILE_SCALE);
  if (groundPat) { ctx.fillStyle = groundPat; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
  else {
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    g.addColorStop(0, M.ground[0]); g.addColorStop(1, M.ground[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  ctx.save();
  ctx.translate(OFFSET_X, 0);   // 이후 모든 좌표는 로직 공간(W x H) 기준, 캔버스 중앙에 배치

  // 잔디 점무늬 — 실제 바닥 재질이 로드되기 전(또는 없을 때)의 임시 폴백 질감
  if (!groundPat) {
    ctx.fillStyle = "rgba(255,255,255,.10)";
    for (let i = 0; i < DOTS; i++) ctx.fillRect((i * 97) % W, (i * 53) % H, s(3), s(3));
  }

  // 길 — 각진 직사각형 대신, 발로 다져진 듯 살짝 굽이치는 오솔길(요청: "너무 직선적").
  const roadPat = pattern(ROAD_TEX[S.mapId], ROAD_TILE_SCALE);
  ctx.fillStyle = roadPat || "#d8c48c";
  for (const ex of M.exits) { drawOrganicRoad(ex.dir); ctx.fill(); }
  // 길 가운데 점선 — 길과 같은 방향으로 살짝 흔들리게 해서 자연스럽게 이어지도록 함
  ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = s(3); ctx.setLineDash([s(10), s(10)]);
  for (const ex of M.exits) {
    const seed = ROAD_SEED[ex.dir], steps = 16;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const along = t * (ex.dir === "N" || ex.dir === "S" ? H / 2 : W / 2);
      const wob = roadWobble(t, seed);
      let x, y;
      if (ex.dir === "N") { x = W / 2 + wob; y = H / 2 - along; }
      else if (ex.dir === "S") { x = W / 2 + wob; y = H / 2 + along; }
      else if (ex.dir === "W") { x = W / 2 - along; y = H / 2 + wob; }
      else { x = W / 2 + along; y = H / 2 + wob; }
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
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
    const artKey = ART[o.place];
    if (artKey) drawSprite(artKey, o.x, o.y - s(6), o.kind === "build" ? s(84) : s(76));
    else { ctx.font = `${s(56)}px serif`; ctx.fillText((PLACES[o.place] || {}).hero || "❓", o.x, o.y - s(6)); }
    ctx.globalAlpha = 1;
    // 라벨 칩
    ctx.font = `bold ${s(13)}px Jua, sans-serif`;
    const t = (lk ? "🔒" : "") + o.label, w = ctx.measureText(t).width + s(14);
    ctx.fillStyle = "rgba(255,255,255,.85)"; roundRect(o.x - w / 2, o.y + s(26), w, s(18), s(9)); ctx.fill();
    ctx.fillStyle = "#2e2620"; ctx.fillText(t, o.x, o.y + s(35));
  }

  // 프롬프트
  if (active && !gather) {
    ctx.strokeStyle = "#ffcf33"; ctx.lineWidth = s(4);
    ctx.beginPath(); ctx.arc(active.x, active.y - s(6), s(40), 0, Math.PI * 2); ctx.stroke();
    const msg = locked(active) ? "🔒 잠김" : "Space / Ⓐ";
    ctx.font = `bold ${s(12)}px Jua, sans-serif`;
    const w = ctx.measureText(msg).width + s(14);
    ctx.fillStyle = "#2e2620"; roundRect(active.x - w / 2, active.y - s(62), w, s(19), s(9)); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(msg, active.x, active.y - s(52));
  }

  // 캐릭터 (512px PNG 구도에 맞춰 크게/오프셋)
  if (gather) {
    // 채집 애니메이션 (도구 위아래) + 게이지
    const wf = Math.floor(gather.anim / 8) % 2;
    drawSprite("char_work_" + wf, char.x, char.y - COFF, CS);
    // 게이지 바
    const gw = s(56), gx = char.x - gw / 2, gy = char.y - s(80);
    ctx.fillStyle = "rgba(46,38,32,.75)"; roundRect(gx - s(3), gy - s(3), gw + s(6), s(14), s(7)); ctx.fill();
    ctx.fillStyle = "#5a4a3a"; roundRect(gx, gy, gw, s(8), s(4)); ctx.fill();
    ctx.fillStyle = "#4cd68a"; roundRect(gx, gy, gw * Math.min(1, gather.prog), s(8), s(4)); ctx.fill();
    // 반짝임
    if (wf === 0) {
      const spark = getSprite("fx_sparkle");
      if (spark && spark.complete && spark.naturalWidth) drawSprite("fx_sparkle", char.x + s(22), char.y - s(24), s(28));
      else { ctx.font = `${s(14)}px serif`; ctx.fillStyle = "#fff"; ctx.fillText("✨", char.x + s(22), char.y - s(24)); }
    }
  } else {
    const frame = char.moving ? Math.floor(char.step / 9) % 2 : 0;
    // 발걸음에 맞춘 통통 바운스(떠다니는 sin 흔들림 대신)
    const cy = char.y - COFF - (char.moving && frame ? s(2) : 0);
    if (char.dir === "right") {
      ctx.save(); ctx.translate(char.x, 0); ctx.scale(-1, 1);
      drawSprite("char_left_" + frame, 0, cy, CS); ctx.restore();
    } else {
      drawSprite("char_" + (char.dir || "down") + "_" + frame, char.x, cy, CS);
    }
  }

  ctx.restore();
}

function drawSign(ex) {
  const arrow = { N: "⬆", S: "⬇", W: "⬅", E: "➡" }[ex.dir];
  let x, y;
  if (ex.dir === "N") { x = W / 2 + s(60); y = s(46); }
  else if (ex.dir === "S") { x = W / 2 + s(60); y = H - s(46); }
  else if (ex.dir === "W") { x = s(60); y = H / 2 - s(42); }
  else { x = W - s(60); y = H / 2 - s(42); }
  const text = `${arrow} ${ex.label}`;
  ctx.font = `bold ${s(13)}px Jua, sans-serif`;
  const w = ctx.measureText(text).width + s(18);
  ctx.fillStyle = "#7b4a2a"; ctx.fillRect(x - s(3), y, s(6), s(30));
  ctx.fillStyle = "#fff6e0"; ctx.strokeStyle = "#7b4a2a"; ctx.lineWidth = s(2.5);
  roundRect(x - w / 2, y - s(20), w, s(22), s(7)); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3a2b1f"; ctx.fillText(text, x, y - s(9));
}

// 한글 받침 유무에 따라 "이/가" 조사 선택
function ga(word) {
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return "가";
  return (c - 0xac00) % 28 === 0 ? "가" : "이";
}

// ---- 상호작용 ----
export function interact() { if (S.mode === "world" && !gather && active) doInteract(active); }
function doInteract(o) {
  if (gather) return;
  const lk = locked(o);
  if (lk === "rank") { sfx.bad(); toast("상인 계급부터 갈 수 있어요!"); return; }
  if (lk === "heaven") { sfx.bad(); toast(`선행 ${HEAVEN_DEED}점을 모아야 열려요! (지금 ${S.deed}점)`); return; }
  if (lk === "tool") {
    const p = PLACES[o.place], t = TOOLS[p.tool];
    sfx.bad(); toast(`${t.pic} ${t.nm}이(가) 필요해요!`);
    say(`${t.pic} ${t.nm}${ga(t.nm)} 있어야 여기서 활동할 수 있어요! 상점에서 구매해보세요~ 🏪`);
    return;
  }
  if (lk === "bait") {
    const p = PLACES[o.place], b = BAIT[p.bait];
    sfx.bad(); toast(`${b.pic} ${b.nm}가 없어요!`);
    say(`${b.pic} ${b.nm}${ga(b.nm)} 있어야 낚시할 수 있어요! 상점에서 구매해보세요~ 🏪`);
    return;
  }
  if (lk === "minTier") {
    const p = PLACES[o.place], t = TOOLS[p.tool], need = t.tiers[p.minTier - 1];
    sfx.bad(); toast(`${need.nm} 등급 이상의 ${t.nm}이(가) 필요해요!`);
    say(`여긴 고급 채집지예요! ${t.pic} ${t.nm} ${need.nm} 등급 이상이어야 캘 수 있어요. 상점에서 강화해보세요~ 🏪`);
    return;
  }
  if (o.kind === "gather") {
    const p = PLACES[o.place];
    if (p.minigame) { S.place = o.place; renderNav(); say(`${p.name}에서 ${p.verb}!`); doWork(); }
    else startGather(o);
  }
  else if (o.kind === "dungeon") { enterDungeon(); }
  else if (o.kind === "portal") { changeToMap(o.to); }
  else { openBuilding(o.place); }
}

// 채집 게이지 시작/완료
function startGather(o) {
  if (S.fatigue >= 100) { sfx.bad(); say("너무 피곤해요! 🏠집에서 쉬어야 해요~"); return; }
  const p = PLACES[o.place];
  S.place = o.place; renderNav();
  held.clear(); target = null;
  // 장소가 요구하는 도구 카테고리의 현재 등급에 따라 채집 소요 시간 결정(등급↑ → 더 빠름)
  const dur = toolStat(p.tool, p.tool ? S.equip[p.tool] : 0).dur;
  gather = { place: o.place, prog: 0, anim: 0, start: performance.now(), dur };
  sfx.get();
  say(`${p.name}에서 ${p.verb} 중... ⏳`);
}
function finishGather() {
  const place = gather.place; gather = null;
  doHarvest(PLACES[place], { mult: 1, name: "" });
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
  if (o) { char.x = o.x; char.y = Math.min(H - s(16), o.y + s(46)); active = o; }
  else { char.x = W / 2; char.y = H - s(44); active = null; }
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
