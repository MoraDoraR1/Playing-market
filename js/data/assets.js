// =============================================================
//  에셋 파이프라인 (생성된 고품질 PNG 연동)
// =============================================================
//  런타임 규칙:
//   - PNG 키 → 파일 경로는 아래 PNG 맵에 등록한다. (키: "<종류>_<아이디>")
//   - 개발/GitHub Pages: 파일 경로로 로드.
//   - 플레이 링크(아티팩트): 빌드가 globalThis.__SPRITE_DATA[key] 에 data URI를
//     넣어두므로 그걸 우선 사용(외부 PNG는 CSP 차단).
//  새 이미지를 붙일 때: assets/sprites/<종류>/<id>.png 커밋 + 아래 PNG 맵에 등록.
// =============================================================

export const SPRITE_BASE = "assets/sprites/";

// 준비된 PNG:  키 "<종류>_<아이디>"  →  파일 경로
export const PNG = {
  // 캐릭터 (Codex 생성) — 걷기 2프레임 × 3방향 + 채집 2프레임
  char_down_0: "assets/sprites/char/down_0.png",
  char_down_1: "assets/sprites/char/down_1.png",
  char_up_0:   "assets/sprites/char/up_0.png",
  char_up_1:   "assets/sprites/char/up_1.png",
  char_left_0: "assets/sprites/char/left_0.png",
  char_left_1: "assets/sprites/char/left_1.png",
  char_work_0: "assets/sprites/char/work_0.png",
  char_work_1: "assets/sprites/char/work_1.png",
};

export function hasPng(key) { return !!PNG[key]; }

// 아티팩트(data URI) 우선, 없으면 파일 경로
export function pngURL(key) {
  const embedded = (typeof globalThis !== "undefined") && globalThis.__SPRITE_DATA;
  if (embedded && embedded[key]) return embedded[key];
  return PNG[key] || null;
}

// ---- (구) 아이템용 kind/id 파이프라인 — 아직 사용, PNG 붙기 전까지 이모지 폴백 ----
export const SPRITES_READY = new Set([]);
export function spritePath(kind, id) { return `${SPRITE_BASE}${kind}/${id}.png`; }
export function hasSprite(kind, id) { return id != null && SPRITES_READY.has(`${kind}/${id}`); }
