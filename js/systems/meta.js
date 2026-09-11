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
  q.claimed = true;
  sfx.up();
  toast(`보상 획득! +${q.rewardMoney.toLocaleString("ko-KR")}별`);
  say(`퀘스트 보상을 받았어요! 내일 또 새로운 퀘스트가 와요~ 📜`);
  renderHud(); renderPanel();
}

// ---- 특수아이템샵 (별머니로 고가 사기템 구매) ----
export function buyStar(id) {
  const item = STAR_SHOP.find((x) => x.id === id);
  if (!item) return;
  if (S.money < item.cost) { sfx.bad(); toast("별머니가 부족해요!"); say("최고급 사기템은 엄청 비싸요~ 자원을 팔고 보스를 잡아 모아봐요! ⭐"); return; }
  S.money -= item.cost;
  item.apply(S);
  sfx.up();
  toast(`${item.pic}${item.nm} 구매!`);
  say(`${item.pic}${item.nm}을(를) 샀어요! ${item.desc} ✨`);
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
