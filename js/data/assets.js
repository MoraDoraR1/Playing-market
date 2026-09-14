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

  // 월드 오브젝트/건물 (Codex 생성)
  obj_tree: "assets/sprites/obj/tree.png",
  obj_fishspot: "assets/sprites/obj/fishspot.png",
  obj_ore: "assets/sprites/obj/ore.png",
  obj_wheat: "assets/sprites/obj/wheat.png",
  obj_trash: "assets/sprites/obj/trash.png",
  obj_pirate: "assets/sprites/obj/pirate.png",
  obj_cave: "assets/sprites/obj/cave.png",
  obj_cloud: "assets/sprites/obj/cloud.png",
  obj_b_shop: "assets/sprites/obj/b_shop.png",
  obj_b_home: "assets/sprites/obj/b_home.png",
  obj_b_donate: "assets/sprites/obj/b_donate.png",
  obj_b_journal: "assets/sprites/obj/b_journal.png",
  obj_sign: "assets/sprites/obj/sign.png",

  // 몬스터/보스 (Codex 생성 — 9종 전부 완료)
  mon_slime: "assets/sprites/mon/slime.png",
  mon_bat: "assets/sprites/mon/bat.png",
  mon_boar: "assets/sprites/mon/boar.png",
  mon_ghost: "assets/sprites/mon/ghost.png",
  mon_golem: "assets/sprites/mon/golem.png",
  mon_dragon: "assets/sprites/mon/dragon.png",
  mon_kingslime: "assets/sprites/mon/kingslime.png",
  mon_kraken: "assets/sprites/mon/kraken.png",
  mon_darklord: "assets/sprites/mon/darklord.png",

  // 자원/전리품/가공품 아이템 (Codex 생성 — 41종 전부 완료)
  item_branch: "assets/sprites/item/branch.png",
  item_mushroom: "assets/sprites/item/mushroom.png",
  item_herb: "assets/sprites/item/herb.png",
  item_ginseng: "assets/sprites/item/ginseng.png",
  item_anchovy: "assets/sprites/item/anchovy.png",
  item_shell: "assets/sprites/item/shell.png",
  item_squid: "assets/sprites/item/squid.png",
  item_pearl: "assets/sprites/item/pearl.png",
  item_loach: "assets/sprites/item/loach.png",
  item_crayfish: "assets/sprites/item/crayfish.png",
  item_carp: "assets/sprites/item/carp.png",
  item_goldcarp: "assets/sprites/item/goldcarp.png",
  item_stone: "assets/sprites/item/stone.png",
  item_copper: "assets/sprites/item/copper.png",
  item_iron: "assets/sprites/item/iron.png",
  item_gem: "assets/sprites/item/gem.png",
  item_berry: "assets/sprites/item/berry.png",
  item_grain: "assets/sprites/item/grain.png",
  item_meat: "assets/sprites/item/meat.png",
  item_goldegg: "assets/sprites/item/goldegg.png",
  item_scrap: "assets/sprites/item/scrap.png",
  item_bottle: "assets/sprites/item/bottle.png",
  item_radio: "assets/sprites/item/radio.png",
  item_record: "assets/sprites/item/record.png",
  item_coin: "assets/sprites/item/coin.png",
  item_map: "assets/sprites/item/map.png",
  item_rum: "assets/sprites/item/rum.png",
  item_chest: "assets/sprites/item/chest.png",
  item_stardust: "assets/sprites/item/stardust.png",
  item_cloud: "assets/sprites/item/cloud.png",
  item_wing: "assets/sprites/item/wing.png",
  item_plank: "assets/sprites/item/plank.png",
  item_jelly: "assets/sprites/item/jelly.png",
  item_batwing: "assets/sprites/item/batwing.png",
  item_tusk: "assets/sprites/item/tusk.png",
  item_soul: "assets/sprites/item/soul.png",
  item_core: "assets/sprites/item/core.png",
  item_scale: "assets/sprites/item/scale.png",
  item_crown: "assets/sprites/item/crown.png",
  item_tentacle: "assets/sprites/item/tentacle.png",
  item_darkgem: "assets/sprites/item/darkgem.png",
};

export function hasPng(key) { return !!PNG[key]; }

// 아티팩트(data URI) 우선, 없으면 파일 경로
export function pngURL(key) {
  const embedded = (typeof globalThis !== "undefined") && globalThis.__SPRITE_DATA;
  if (embedded && embedded[key]) return embedded[key];
  return PNG[key] || null;
}
