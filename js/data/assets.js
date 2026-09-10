// =============================================================
//  에셋 파이프라인 (외부 AI 이미지 연동용)
// =============================================================
//  그림이 준비되면 이곳 SPRITES_READY 에 "종류/아이디" 를 추가하세요.
//  파일 위치 규칙:  assets/sprites/<종류>/<아이디>.png
//  예)  영웅 숲 캐릭터  ->  assets/sprites/heroes/forest.png   ->  "heroes/forest"
//       슬라임 몬스터    ->  assets/sprites/monsters/slime.png  ->  "monsters/slime"
//       나뭇가지 아이템  ->  assets/sprites/items/branch.png    ->  "items/branch"
//       숲 배경          ->  assets/sprites/places/forest.png   ->  "places/forest"
//
//  SET 에 없는 항목은 자동으로 이모지로 표시됩니다. (점진적 교체 가능)
//  필요한 전체 목록과 생성 프롬프트는  assets/README.md  참고.
// =============================================================

export const SPRITE_BASE = "assets/sprites/";

// 준비된 이미지 목록 (처음엔 비어있음 → 전부 이모지로 표시)
export const SPRITES_READY = new Set([
  // "heroes/forest",
  // "monsters/slime",
  // "items/branch",
  // "places/forest",
]);

export function spritePath(kind, id) {
  return `${SPRITE_BASE}${kind}/${id}.png`;
}

export function hasSprite(kind, id) {
  return id != null && SPRITES_READY.has(`${kind}/${id}`);
}
