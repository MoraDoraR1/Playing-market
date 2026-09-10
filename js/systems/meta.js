// P4 메타 로직: 일일 퀘스트 / 도감 / 업적 / 별머니 상점 / 상점 시세
import { S } from "../core/state.js";
import { generateDailyQuests, generateMarket, STAR_SHOP, ACHIEVEMENTS } from "../data/meta.js";
import { ITEM_INDEX } from "../data/items.js";
import { sfx } from "../core/audio.js";
import { say, toast } from "../ui/view.js";
import { renderHud, renderPanel } from "../ui/render.js";

export function today() { return new Date().toISOString().slice(0, 10); }

// 날짜가 바뀌면 퀘스트·시세 갱신
export function ensureDaily() {
  const d = today();
  if (S.quests.date !== d) S.quests = generateDailyQuests(d);
  if (S.market.date !== d) S.market = generateMarket(d, Object.keys(ITEM_INDEX));
}

// ---- 진행/기록 훅 ----
export function recordStat(key, n = 1) { S.stats[key] = (S.stats[key] || 0) + n; }

export function questProgress(type, amount) {
  let any = false;
  S.quests.list.forEach((q) => {
    if (q.type === type && !q.done) {
      q.progress += amount;
      if (q.progress >= q.goal) { q.progress = q.goal; q.done = true; any = true; }
    }
  });
  if (any) { sfx.get(); toast("퀘스트 완료! 📜 수첩에서 보상을 받아요!"); }
}

export function discoverItem(id) { if (id && !S.codex.items.includes(id)) S.codex.items.push(id); }
export function discoverMonster(id) { if (id && !S.codex.monsters.includes(id)) S.codex.monsters.push(id); }
export function discoverRecipe(id) { if (id && !S.codex.recipes.includes(id)) S.codex.recipes.push(id); }

// ---- 퀘스트 보상 수령 ----
export function claimQuest(index) {
  const q = S.quests.list[index];
  if (!q || !q.done || q.claimed) return;
  S.money += q.rewardMoney;
  if (q.rewardStar) S.starMoney += q.rewardStar;
  q.claimed = true;
  sfx.up();
  toast(`보상 획득! +${q.rewardMoney.toLocaleString("ko-KR")}원${q.rewardStar ? ` +⭐${q.rewardStar}` : ""}`);
  say(`퀘스트 보상을 받았어요! 내일 또 새로운 퀘스트가 와요~ 📜`);
  renderHud(); renderPanel();
}

// ---- 별머니 상점 ----
export function buyStar(id) {
  const item = STAR_SHOP.find((x) => x.id === id);
  if (!item) return;
  if (S.starMoney < item.cost) { sfx.bad(); toast("별머니가 부족해요!"); say("별머니는 보스를 잡거나 퀘스트로 모아요~ ⭐"); return; }
  S.starMoney -= item.cost;
  item.apply(S);
  sfx.up();
  toast(`${item.pic}${item.nm} 사용!`);
  say(`${item.pic}${item.nm}을(를) 얻었어요! ${item.desc} ✨`);
  renderHud(); renderPanel();
}

// ---- 업적 상태 ----
export function achievementsStatus() {
  return ACHIEVEMENTS.map((a) => ({ ...a, done: !!a.check(S.stats, S) }));
}

// ---- 상점 시세 적용 판매가 ----
export function sellPrice(item) {
  const mult = S.market.mult || 1;
  const hot = S.market.hotItem === item.id ? 1.3 : 1;
  return Math.max(1, Math.round(item.pr * mult * hot));
}
