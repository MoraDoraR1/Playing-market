// 게임 전역 상태 + 상태 헬퍼
import { RANKS } from "../data/ranks.js";

export const SAVE_VERSION = 1;

// 새 게임 기본 상태 (reset 시 이 값으로 되돌림)
export function defaultState() {
  return {
    version: SAVE_VERSION,
    // 재화 & 성장 (단일 통화: 별머니)
    money: 0,            // 별머니 잔액 (게임의 유일한 통화)
    gong: 0,             // 내공점수(계급 경험치)
    deed: 0,             // 선행점수
    rankIdx: 0,
    // 전투/체력
    hp: 60, maxHp: 60,
    fatigue: 0,
    // 장비
    tool: 1,             // 도구 레벨(수확량)
    weapon: 1,           // 무기 레벨(공격력)
    armor: 0,            // 방어구 레벨(피해 감소)
    potions: 0,          // 회복 물약
    bed: false,          // 푹신침대 보유
    // 인벤토리
    inv: {},             // id -> {id,pic,nm,pr,count,rare}
    // 집 콘텐츠 (P2)
    furniture: [],       // 보유 가구 id 목록
    mods: { fatigueReduce: 0, atkBonus: 0, gatherBonus: 0, gongBonus: 0 }, // 가구 영구 보너스
    foodBuff: null,      // {id,nm,stat,amount,turns} 요리 일시 버프
    farm: [],            // [{cropId, progress}]
    homeTab: "rest",     // 집 화면 탭
    // 메타 (P4)
    stats: { gather: 0, kills: 0, bossKills: 0, sold: 0, cook: 0, harvest: 0, craft: 0 },
    codex: { items: [], monsters: [], recipes: [] }, // 발견 목록
    quests: { date: "", list: [] },                  // 일일 퀘스트
    market: { date: "", mult: 1, hotItem: null },    // 상점 시세
    journalTab: "quest", // 모험수첩 탭
    // 진행
    place: "forest",     // 현재 상호작용 중인 장소/건물 컨텍스트
    mode: "world",       // "world"(맵을 걸어다님) | "battle"(전투 화면)
    heavenOpen: false,
    foe: null,           // 전투 중 몬스터(저장하지 않음)
    flags: { tutorialDone: false },
    settings: { sound: true, bgm: false },
  };
}

// 살아있는 전역 상태 객체 (모듈들이 이 참조를 공유)
export const S = defaultState();

// 상태를 obj 값으로 교체(참조는 유지)
export function applyState(obj) {
  const fresh = defaultState();
  Object.keys(S).forEach((k) => delete S[k]);
  Object.assign(S, fresh, obj || {});
  // 중첩 객체 보정
  S.inv = (obj && obj.inv) || {};
  S.flags = Object.assign({}, fresh.flags, (obj && obj.flags) || {});
  S.settings = Object.assign({}, fresh.settings, (obj && obj.settings) || {});
  S.mods = Object.assign({}, fresh.mods, (obj && obj.mods) || {});
  S.furniture = (obj && obj.furniture) || [];
  S.farm = (obj && obj.farm) || [];
  S.foodBuff = (obj && obj.foodBuff) || null;
  S.stats = Object.assign({}, fresh.stats, (obj && obj.stats) || {});
  S.codex = Object.assign({ items: [], monsters: [], recipes: [] }, (obj && obj.codex) || {});
  S.quests = (obj && obj.quests) || { date: "", list: [] };
  S.market = (obj && obj.market) || { date: "", mult: 1, hotItem: null };
  S.foe = null;      // 전투 상태는 복원하지 않음
  S.mode = "world";  // 항상 월드에서 시작
}

export function resetState() {
  applyState(defaultState());
}

// ---- 파생/헬퍼 ----
export function playerAtk() {
  const food = (S.foodBuff && S.foodBuff.stat === "atk") ? S.foodBuff.amount : 0;
  return 6 + S.weapon * 4 + (S.mods.atkBonus || 0) + food;
}
// 채집 1회 피로 소모(가구 보너스 반영)
export function gatherFatigue() { return Math.max(3, 12 - (S.mods.fatigueReduce || 0)); }
// 채집 추가 수확량(가구 + 요리 버프)
export function gatherBonus() {
  const food = (S.foodBuff && S.foodBuff.stat === "gather") ? S.foodBuff.amount : 0;
  return (S.mods.gatherBonus || 0) + food;
}
export function rankName() { return RANKS[S.rankIdx].n; }
export function nextRank() { return RANKS[S.rankIdx + 1]; }

export function addItem(it) {
  if (!S.inv[it.id]) S.inv[it.id] = { id: it.id, pic: it.pic, nm: it.nm, pr: it.pr, count: 0, rare: !!it.rare };
  S.inv[it.id].count++;
}
export function invSlots() { return Object.values(S.inv).filter((x) => x.count > 0); }
