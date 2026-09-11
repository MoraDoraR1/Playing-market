// 렌더러: HUD / 씬 / 인벤토리 / 동적 패널 / 내비게이션
import { S, playerAtk, rankName, nextRank, invSlots } from "../core/state.js";
import { RANKS, HEAVEN_DEED } from "../data/ranks.js";
import { PLACES } from "../data/places.js";
import { won } from "../core/format.js";
import { sfx } from "../core/audio.js";
import { hasSprite, spritePath } from "../data/assets.js";
import { $, sprite, say, toast } from "./view.js";

// 시스템 로직 (버튼 핸들러용) — 런타임 호출이라 순환참조 안전
import { doWork } from "../systems/gather.js";
import { pickFoe, startBattle, startBoss, battleAttack, strongAttack, usePotion, fleeBattle } from "../systems/battle.js";
import { availableBoss } from "../data/monsters.js";
import { sellTotal, unitPrice, sellOne, sellAll, toolCost, buyTool, weaponCost, buyWeapon, armorCost, buyArmor, buyPotion } from "../systems/economy.js";
import { donate } from "../systems/progress.js";
import { doSleep, buyBed } from "../systems/rest.js";
import { craft, cook, plant, harvest, hasItems, needsText } from "../systems/home.js";
import { CRAFT, COOK, CROPS, MAX_PLOTS } from "../data/recipes.js";
import { claimQuest, buyStar, achievementsStatus } from "../systems/meta.js";
import { STAR_SHOP } from "../data/meta.js";
import { ITEM_INDEX, itemDef } from "../data/items.js";
import { MONSTERS } from "../data/monsters.js";
import * as world from "./world.js";

// ---------- HUD ----------
export function renderHud() {
  $("rankName").textContent = rankName();
  const nr = nextRank();
  if (nr) {
    const base = RANKS[S.rankIdx].g, span = nr.g - base;
    const p = Math.max(0, Math.min(100, ((S.gong - base) / span) * 100));
    $("gongBar").style.width = p + "%";
    $("rankNext").textContent = "다음:" + nr.n + " (" + S.gong + "/" + nr.g + ")";
  } else {
    $("gongBar").style.width = "100%";
    $("rankNext").textContent = "최고 계급!";
  }
  const fp = Math.min(100, S.fatigue);
  $("fatBar").style.width = fp + "%";
  $("fatTxt").textContent = Math.round(fp) + "%";
  $("money").textContent = won(S.money);
  $("deed").textContent = S.deed + "점";
}

// ---------- 인벤토리 ----------
export function renderInv() {
  const box = $("inv"); const slots = invSlots();
  $("invCount").textContent = slots.length + "칸";
  if (slots.length === 0) {
    box.innerHTML = '<span class="muted">아직 비어있어요~ 자원을 모아보세요!</span>';
    return;
  }
  box.innerHTML = "";
  slots.forEach((x) => {
    const el = document.createElement("div");
    el.className = "slot" + (x.rare ? " rare" : "");
    el.innerHTML = `${sprite("items", x.id, x.pic)} ${x.nm} <span class="cnt">${x.count}</span>`;
    box.appendChild(el);
  });
}

// ---------- 씬 ----------
// PLACES에 없는 기능 화면(상점/집/기부소)의 씬 표시용
const SCREENS = {
  shop:    { name: "🏪 상점",     desc: "모은 자원을 팔고 장비를 사요", bg: "linear-gradient(180deg,#ffe8b0,#ffd166)", hero: "🧑‍🍳" },
  home:    { name: "🏠 우리 집",   desc: "쉬면서 피로와 체력을 회복해요", bg: "linear-gradient(180deg,#ffd6e7,#ffa8c5)", hero: "🛏️" },
  donate:  { name: "❤️ 기부소",    desc: "착한 일로 선행점수를 쌓아요",   bg: "linear-gradient(180deg,#ffc9c9,#ff8787)", hero: "💝" },
  journal: { name: "📋 모험수첩",  desc: "퀘스트·도감·업적·별상점",       bg: "linear-gradient(180deg,#d0ebff,#a5d8ff)", hero: "📖" },
};

// 도감 '자원' 전체 개수 (장소에서 얻는 자원만)
const GATHERABLE_IDS = (() => {
  const set = new Set();
  Object.values(PLACES).forEach((p) => { (p.loot || []).forEach((x) => set.add(x.id)); if (p.rare) set.add(p.rare.id); });
  return [...set];
})();

function sceneBackground(key, p) {
  const sc = $("scene");
  if (hasSprite("places", key)) {
    sc.style.background = `center/cover no-repeat url(${spritePath("places", key)})`;
  } else {
    sc.style.background = p.bg;
  }
}

export function renderScene() {
  const sc = $("scene");
  if (S.mode === "battle") {
    world.unmount();
    sceneBackground("battle", PLACES.battle);
    renderBattleScene(sc, PLACES.battle);
  } else {
    // 월드 모드: 캐릭터를 걸어다니는 맵 (캔버스는 유지)
    world.ensureMounted(sc);
  }
}

function hpBar(cur, max, color) {
  const p = Math.max(0, Math.min(100, (cur / max) * 100));
  return `<div class="bar" style="width:150px;margin:3px auto;background:#0003"><i style="display:block;height:100%;width:${p}%;border-radius:8px;background:${color};transition:width .25s"></i></div>`;
}

function renderBattleScene(sc, p) {
  sc.style.color = "#fff";
  if (!S.foe) {
    const foe = pickFoe();
    sc.innerHTML = `<div class="placeName">${p.name}</div>
      <div class="placeDesc" style="color:rgba(255,255,255,.7)">${p.desc}</div>
      <div class="hero">${sprite("monsters", foe.id, foe.pic, "spr-hero")}</div>
      <div style="margin-top:6px;font-size:15px">야생의 <b>${foe.nm}</b> 등장!</div>
      <div style="font-size:12px;color:rgba(255,255,255,.7)">체력 ${foe.hp} · 공격 ${foe.atk} · 보상 ${won(foe.gold)}+전리품</div>
      <div class="act" id="act"></div>`;
    const b = document.createElement("button");
    b.className = "btn work"; b.textContent = "⚔️ 싸우기 시작!";
    b.onclick = () => startBattle(foe);
    if (S.fatigue >= 100 || S.hp <= 0) b.disabled = true;
    $("act").appendChild(b);
    const boss = availableBoss(S.rankIdx);
    if (boss) {
      const bb = document.createElement("button");
      bb.className = "btn give"; bb.textContent = `🔥 보스 도전 (${boss.pic}${boss.nm})`;
      bb.onclick = startBoss;
      if (S.fatigue >= 100 || S.hp <= 0) bb.disabled = true;
      $("act").appendChild(bb);
    }
    const out = document.createElement("button");
    out.className = "btn sleep"; out.textContent = "🚪 마을로 나가기";
    out.onclick = world.exitDungeon;
    $("act").appendChild(out);
  } else {
    const f = S.foe;
    sc.innerHTML = `
      <div style="display:flex;justify-content:space-around;width:100%;align-items:flex-end;margin-bottom:4px">
        <div><div class="hero" id="pHero">${sprite("heroes", "player", "🧑‍🚀", "spr-hero")}</div><div style="font-size:12px">나 (내공 ${playerAtk()})</div>${hpBar(S.hp, S.maxHp, "#20bf6b")}<div style="font-size:12px">❤️ ${S.hp}/${S.maxHp}</div></div>
        <div style="font-size:22px;align-self:center">⚔️</div>
        <div><div class="hero" id="fHero">${sprite("monsters", f.ref.id, f.ref.pic, "spr-hero")}</div><div style="font-size:12px">${f.ref.nm}</div>${hpBar(f.hp, f.ref.hp, "#eb3b5a")}<div style="font-size:12px">💀 ${Math.max(0, f.hp)}/${f.ref.hp}</div></div>
      </div>
      <div class="act" id="act"></div>`;
    const act = $("act");
    const atk = document.createElement("button"); atk.className = "btn work"; atk.textContent = "🗡️ 공격!"; atk.onclick = battleAttack; act.appendChild(atk);
    const str = document.createElement("button"); str.className = "btn up"; str.textContent = "💥 강공격"; str.onclick = strongAttack; if (S.fatigue >= 100) str.disabled = true; act.appendChild(str);
    const pot = document.createElement("button"); pot.className = "btn sleep"; pot.textContent = `🧪 물약(${S.potions})`; pot.onclick = usePotion; if (S.potions <= 0) pot.disabled = true; act.appendChild(pot);
    const run = document.createElement("button"); run.className = "btn give"; run.textContent = "🏃 도망"; run.onclick = fleeBattle; act.appendChild(run);
  }
}

// ---------- 동적 패널 ----------
export function renderPanel() {
  const pan = $("dynPanel");
  const pl = S.place;
  if (pl === "shop") { renderShop(pan); }
  else if (pl === "home") { renderHome(pan); }
  else if (pl === "donate") { renderDonate(pan); }
  else if (pl === "journal") { renderJournal(pan); }
  else if (pl === "battle") {
    pan.innerHTML = `<h3>⚔️ 나의 전투 정보</h3>
      <div class="inv">
        <div class="slot">❤️ 체력 <span class="cnt">${S.hp}/${S.maxHp}</span></div>
        <div class="slot">🗡️ 공격력 <span class="cnt">${playerAtk()}</span></div>
        <div class="slot">🛡️ 방어 <span class="cnt">${S.armor}</span></div>
        <div class="slot">🧪 물약 <span class="cnt">${S.potions}개</span></div>
      </div>
      <div class="muted" style="margin-top:7px">몬스터를 이기면 <b>전리품·별머니·내공</b>을 얻어요! <b>💥강공격</b>은 2배 피해(피로↑). 방어구를 입으면 피해가 줄어요. 계급이 오르면 <b>🔥보스</b>에 도전할 수 있어요!</div>`;
  }
  else {
    pan.innerHTML = `<h3>🧭 활동 안내</h3>
      <div class="muted">여기서 <b>${PLACES[pl].verb}</b>로 자원을 모아요. 피로도가 쌓이면 🏠집에서 쉬어야 해요! 모은 자원은 🏪상점에서 팔 수 있어요.</div>`;
  }
}

function renderShop(pan) {
  const slots = invSlots();
  const m = S.market || { mult: 1, hotItem: null };
  const trend = m.mult > 1.05 ? "📈 호황! (비싸게 팔려요)" : m.mult < 0.95 ? "📉 불황… (값이 낮아요)" : "➖ 보통";
  const hotNm = m.hotItem && itemDef(m.hotItem) ? itemDef(m.hotItem).nm : null;
  let html = `<h3>🏪 상점 <span class="muted">자원을 팔아요</span></h3>`;
  html += `<div class="muted" style="margin-bottom:8px">오늘의 시세: <b>×${m.mult}</b> ${trend}${hotNm ? ` · 인기품목 <b>${itemDef(m.hotItem).pic}${hotNm}</b>(+30%)` : ""}</div>`;
  if (slots.length === 0) {
    html += `<div class="muted">팔 자원이 없어요~ 먼저 자원을 모아오세요!</div>`;
  } else {
    html += `<div style="margin-bottom:8px"><button class="btn sell" id="sellAll" style="width:100%;box-shadow:0 4px 0 rgba(0,0,0,.15)">💰 전부 팔기 (${won(sellTotal())})</button></div>`;
    html += `<div class="shopgrid">`;
    slots.forEach((x) => {
      const hot = m.hotItem === x.id;
      html += `<div class="row"><span>${sprite("items", x.id, x.pic)}${x.nm} <span class="muted">×${x.count}</span></span>
        <button data-sell="${x.id}"${hot ? ' style="background:var(--red)"' : ""}>${won(unitPrice(x))}</button></div>`;
    });
    html += `</div>`;
  }
  html += `<h3 style="margin-top:12px">⚒️ 도구 강화 <span class="muted">Lv.${S.tool}</span></h3>
    <div class="row"><span>수확량 +1 (현재 한 번에 ${1 + S.tool}개까지)</span>
    <button id="buyTool">${won(toolCost())}</button></div>`;
  html += `<h3 style="margin-top:12px">🗡️ 무기 강화 <span class="muted">Lv.${S.weapon}</span></h3>
    <div class="row"><span>공격력 +4 (현재 공격 ${playerAtk()})</span>
    <button id="buyWeapon">${won(weaponCost())}</button></div>`;
  html += `<h3 style="margin-top:12px">🛡️ 방어구 강화 <span class="muted">Lv.${S.armor}</span></h3>
    <div class="row"><span>받는 피해 -3 (현재 감소 ${S.armor * 3})</span>
    <button id="buyArmor">${won(armorCost())}</button></div>`;
  html += `<h3 style="margin-top:12px">🧪 회복 물약 <span class="muted">보유 ${S.potions}개</span></h3>
    <div class="row"><span>전투 중 체력 35 회복</span>
    <button id="buyPotion">${won(200)}</button></div>`;
  pan.innerHTML = html;
  if ($("sellAll")) $("sellAll").onclick = sellAll;
  pan.querySelectorAll("[data-sell]").forEach((b) => (b.onclick = () => sellOne(b.getAttribute("data-sell"))));
  $("buyTool").onclick = buyTool;
  $("buyWeapon").onclick = buyWeapon;
  $("buyArmor").onclick = buyArmor;
  $("buyPotion").onclick = buyPotion;
}

function renderHome(pan) {
  const tab = S.homeTab || "rest";
  const tabs = [["rest", "😴 휴식"], ["craft", "🔨 작업대"], ["cook", "🍳 부엌"], ["farm", "🌱 농지"], ["deco", "🛋️ 꾸미기"]];
  let html = `<h3>🏠 우리 집 <span class="muted">무엇을 해볼까요?</span></h3>`;
  html += `<div class="tabs">` + tabs.map(([k, t]) => `<button class="tab${tab === k ? " on" : ""}" data-tab="${k}">${t}</button>`).join("") + `</div>`;
  html += `<div class="homebody">` + homeBody(tab) + `</div>`;
  pan.innerHTML = html;
  pan.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { S.homeTab = b.getAttribute("data-tab"); renderPanel(); }));
  wireHome(tab, pan);
}

function homeBody(tab) {
  if (tab === "rest") {
    let h = `<div class="muted" style="margin-bottom:8px">피로도 <b>${Math.round(S.fatigue)}%</b> · 체력 <b>❤️${S.hp}/${S.maxHp}</b>${S.foodBuff ? ` · 버프 <b>${S.foodBuff.pic}${S.foodBuff.nm}</b>(${S.foodBuff.turns}회)` : ""}</div>`;
    h += `<div class="row"><span>😴 잠자기 (피로도 ${S.bed ? "전부" : "70"} 회복)</span><button id="sleepBtn" style="background:var(--blue)">쉬기</button></div>`;
    if (!S.bed) h += `<div class="row" style="margin-top:7px"><span>🛏️ 푹신침대 사기 (완전 회복)</span><button id="bedBtn" style="background:var(--brown)">${won(1500)}</button></div>`;
    else h += `<div class="row" style="margin-top:7px"><span>🛏️ 푹신침대 보유중! 😊</span><button disabled style="background:#ccc">완료</button></div>`;
    return h;
  }
  if (tab === "craft") {
    let h = `<div class="muted" style="margin-bottom:6px">나뭇가지로 합판을 만들고, 합판으로 가구를 제작해요!</div>`;
    h += CRAFT.map(craftRow).join("");
    return h;
  }
  if (tab === "cook") {
    let h = `<div class="muted" style="margin-bottom:6px">재료를 모아 음식을 만들면 체력 회복·버프를 얻어요!${S.foodBuff ? ` (지금: ${S.foodBuff.pic}${S.foodBuff.nm} ${S.foodBuff.turns}회)` : ""}</div>`;
    h += COOK.map(cookRow).join("");
    return h;
  }
  if (tab === "farm") {
    let h = `<div class="muted" style="margin-bottom:6px">밭 ${S.farm.length}/${MAX_PLOTS} · 활동(채집·전투)하면 자라요</div>`;
    if (S.farm.length === 0) h += `<div class="muted">아직 심은 게 없어요~ 아래에서 씨앗을 심어봐요!</div>`;
    S.farm.forEach((p, i) => {
      const c = CROPS[p.cropId];
      const ready = p.progress >= c.grow;
      const pct = Math.min(100, (p.progress / c.grow) * 100);
      h += `<div class="row"><span style="flex:1">${c.pic}${c.nm} ${ready ? "🌟 다 자랐어요!" : `<span class="muted">(${p.progress}/${c.grow})</span>`}
        <div class="bar" style="height:8px;margin-top:4px;width:130px"><i style="display:block;height:100%;width:${pct}%;background:var(--green);border-radius:8px"></i></div></span>
        <button data-harvest="${i}" ${ready ? "" : "disabled"} style="background:${ready ? "var(--green)" : "#ccc"}">수확</button></div>`;
    });
    h += `<h3 style="margin-top:10px">🌱 씨앗 심기</h3>`;
    Object.values(CROPS).forEach((c) => {
      h += `<div class="row"><span>${c.pic}${c.nm} <span class="muted">· ${c.grow}회 성장 → ${c.yield.map((y) => y.pic + y.nm + "×" + y.qty).join(",")}</span></span>
        <button data-plant="${c.id}" style="background:var(--green)">${won(c.seedCost)}</button></div>`;
    });
    return h;
  }
  if (tab === "deco") {
    const score = S.furniture.reduce((s, id) => { const r = CRAFT.find((x) => x.id === id); return s + (r ? r.deco || 0 : 0); }, 0);
    let h = `<div class="muted">집 꾸미기 점수: <b>⭐ ${score}</b></div>`;
    if (S.furniture.length === 0) h += `<div class="muted" style="margin-top:6px">아직 가구가 없어요~ 작업대에서 만들어 꾸며봐요!</div>`;
    else h += `<div class="inv" style="margin-top:8px">` + S.furniture.map((id) => { const r = CRAFT.find((x) => x.id === id); return `<div class="slot">${r.pic} ${r.nm}</div>`; }).join("") + `</div>`;
    return h;
  }
  return "";
}

function craftRow(r) {
  const owned = !r.makesItem && S.furniture.includes(r.id);
  const can = hasItems(r.needs);
  const label = owned ? "보유중" : (r.makesItem ? "만들기" : "제작");
  const dis = owned || !can ? "disabled" : "";
  const style = owned || !can ? "background:#ccc" : "background:var(--brown)";
  return `<div class="row" style="flex-wrap:wrap;gap:4px">
    <span style="flex:1 1 58%">${r.pic}${r.nm} <span class="muted">· ${r.desc}</span><br><span class="muted">재료: ${needsText(r.needs)}</span></span>
    <button data-craft="${r.id}" ${dis} style="${style}">${label}</button></div>`;
}

function cookRow(c) {
  const can = hasItems(c.needs);
  const style = can ? "background:var(--gold)" : "background:#ccc";
  return `<div class="row" style="flex-wrap:wrap;gap:4px">
    <span style="flex:1 1 58%">${c.pic}${c.nm} <span class="muted">· ${c.desc}</span><br><span class="muted">재료: ${needsText(c.needs)}</span></span>
    <button data-cook="${c.id}" ${can ? "" : "disabled"} style="${style}">요리</button></div>`;
}

function wireHome(tab, pan) {
  if (tab === "rest") {
    if ($("sleepBtn")) $("sleepBtn").onclick = doSleep;
    if ($("bedBtn")) $("bedBtn").onclick = buyBed;
  } else if (tab === "craft") {
    pan.querySelectorAll("[data-craft]").forEach((b) => (b.onclick = () => craft(b.getAttribute("data-craft"))));
  } else if (tab === "cook") {
    pan.querySelectorAll("[data-cook]").forEach((b) => (b.onclick = () => cook(b.getAttribute("data-cook"))));
  } else if (tab === "farm") {
    pan.querySelectorAll("[data-plant]").forEach((b) => (b.onclick = () => plant(b.getAttribute("data-plant"))));
    pan.querySelectorAll("[data-harvest]").forEach((b) => (b.onclick = () => harvest(+b.getAttribute("data-harvest"))));
  }
}

function renderDonate(pan) {
  let html = `<h3>❤️ 기부소 <span class="muted">착한 일을 하면 선행점수!</span></h3>`;
  html += `<div class="muted" style="margin-bottom:8px">돈을 기부하면 선행점수가 올라요. 선행점수 <b>${HEAVEN_DEED}점</b>을 모으면 <b>☁️하늘나라</b>가 열려요! (현재 ${S.deed}점)</div>`;
  [[100, 1], [500, 6], [1000, 14]].forEach(([m, d]) => {
    html += `<div class="row" style="margin-top:6px"><span>💝 ${won(m)} 기부 → 선행 +${d}점</span>
      <button data-give="${m}" data-deed="${d}" style="background:var(--red)">기부</button></div>`;
  });
  pan.innerHTML = html;
  pan.querySelectorAll("[data-give]").forEach((b) => (b.onclick = () => donate(+b.getAttribute("data-give"), +b.getAttribute("data-deed"))));
}

// ---------- 모험수첩 (퀘스트/도감/업적/별상점) ----------
function renderJournal(pan) {
  const tab = S.journalTab || "quest";
  const tabs = [["quest", "📜 퀘스트"], ["codex", "📖 도감"], ["achieve", "🏆 업적"], ["star", "🛒 특수샵"]];
  let html = `<h3>📋 모험수첩 <span class="muted">오늘의 할 일과 수집</span></h3>`;
  html += `<div class="tabs">` + tabs.map(([k, t]) => `<button class="tab${tab === k ? " on" : ""}" data-jtab="${k}">${t}</button>`).join("") + `</div>`;
  html += `<div class="homebody">` + journalBody(tab) + `</div>`;
  pan.innerHTML = html;
  pan.querySelectorAll("[data-jtab]").forEach((b) => (b.onclick = () => { S.journalTab = b.getAttribute("data-jtab"); renderPanel(); }));
  if (tab === "quest") pan.querySelectorAll("[data-claim]").forEach((b) => (b.onclick = () => claimQuest(+b.getAttribute("data-claim"))));
  if (tab === "star") pan.querySelectorAll("[data-star]").forEach((b) => (b.onclick = () => buyStar(b.getAttribute("data-star"))));
}

function journalBody(tab) {
  if (tab === "quest") {
    const list = S.quests.list || [];
    if (!list.length) return `<div class="muted">오늘의 퀘스트를 준비 중이에요~</div>`;
    return list.map((q, i) => {
      const pct = Math.min(100, (q.progress / q.goal) * 100);
      const reward = `${won(q.rewardMoney)}`;
      let btn;
      if (q.claimed) btn = `<button disabled style="background:#ccc">완료 ✓</button>`;
      else if (q.done) btn = `<button data-claim="${i}" style="background:var(--green)">보상받기</button>`;
      else btn = `<button disabled style="background:#ccc">${q.progress}/${q.goal}${q.unit}</button>`;
      return `<div class="row" style="flex-wrap:wrap;gap:4px"><span style="flex:1 1 58%">📜 ${q.nm} <span class="muted">· 목표 ${q.goal}${q.unit} · 보상 ${reward}</span>
        <div class="bar" style="height:8px;margin-top:4px;width:140px"><i style="display:block;height:100%;width:${pct}%;background:var(--gold);border-radius:8px"></i></div></span>${btn}</div>`;
    }).join("");
  }
  if (tab === "codex") {
    const iF = S.codex.items.length, iT = GATHERABLE_IDS.length;
    const mF = S.codex.monsters.length, mT = MONSTERS.length;
    let h = `<div class="muted" style="margin-bottom:6px">자원 도감 <b>${iF}/${iT}</b> · 몬스터 도감 <b>${mF}/${mT}</b></div>`;
    h += `<h3>🎒 자원</h3><div class="inv">` + GATHERABLE_IDS.map((id) => {
      const f = S.codex.items.includes(id), d = itemDef(id);
      return `<div class="slot"${f ? "" : ' style="opacity:.35;filter:grayscale(1)"'}>${f ? d.pic : "❔"} ${f ? d.nm : "???"}</div>`;
    }).join("") + `</div>`;
    h += `<h3 style="margin-top:10px">👾 몬스터</h3><div class="inv">` + MONSTERS.map((mo) => {
      const f = S.codex.monsters.includes(mo.id);
      return `<div class="slot"${f ? "" : ' style="opacity:.35;filter:grayscale(1)"'}>${f ? mo.pic : "❔"} ${f ? mo.nm : "???"}</div>`;
    }).join("") + `</div>`;
    return h;
  }
  if (tab === "achieve") {
    return achievementsStatus().map((a) =>
      `<div class="row"><span>${a.done ? a.pic : "🔒"} <b>${a.nm}</b> <span class="muted">· ${a.desc}</span></span><span>${a.done ? "✅" : "…"}</span></div>`
    ).join("");
  }
  if (tab === "star") {
    let h = `<div class="muted" style="margin-bottom:6px">🛒 특수아이템샵 · 보유 별머니 <b>${won(S.money)}</b> · 원작처럼 고가의 사기템을 팔아요!</div>`;
    h += STAR_SHOP.map((it) =>
      `<div class="row" style="flex-wrap:wrap;gap:4px"><span style="flex:1 1 55%">${it.pic}${it.nm} <span class="muted">· ${it.desc}</span></span>
        <button data-star="${it.id}"${S.money < it.cost ? " disabled" : ""} style="background:${S.money < it.cost ? "#ccc" : "#b197fc"}">${won(it.cost)}</button></div>`
    ).join("");
    return h;
  }
  return "";
}

// ---------- 내비게이션 ----------
export function renderNav() {
  const nav = $("nav");
  const items = [
    { k: "forest", ic: "🌲", t: "숲" }, { k: "sea", ic: "🌊", t: "바다" },
    { k: "river", ic: "🏞️", t: "강" }, { k: "mine", ic: "⛏️", t: "광산" },
    { k: "field", ic: "🌾", t: "들판" }, { k: "dump", ic: "🗑️", t: "쓰레기장" },
    { k: "pirate", ic: "🏴‍☠️", t: "해적선", minReq: 3 }, { k: "battle", ic: "⚔️", t: "던전" },
    { k: "shop", ic: "🏪", t: "상점" }, { k: "home", ic: "🏠", t: "집" },
    { k: "donate", ic: "❤️", t: "기부소" }, { k: "journal", ic: "📋", t: "수첩" },
    { k: "heaven", ic: "☁️", t: "하늘나라" },
  ];
  nav.innerHTML = "";
  items.forEach((it) => {
    const b = document.createElement("button");
    const rankLocked = it.minReq != null && S.rankIdx < it.minReq;
    const heavenLocked = it.k === "heaven" && !S.heavenOpen;
    const locked = rankLocked || heavenLocked;
    b.className = (S.place === it.k ? "on " : "") + (locked ? "lock" : "");
    b.innerHTML = `<span class="ic">${it.ic}</span>${locked ? "🔒" : it.t}`;
    b.onclick = () => {
      if (heavenLocked) { sfx.bad(); toast(`선행 ${HEAVEN_DEED}점을 모아야 열려요! (지금 ${S.deed}점)`); return; }
      if (rankLocked) { sfx.bad(); toast(`상인 계급부터 갈 수 있어요! 계급을 올려봐요~`); return; }
      go(it.k);
    };
    nav.appendChild(b);
  });
}

export function renderAll() { renderHud(); renderScene(); renderPanel(); renderInv(); renderNav(); }

// 내비게이션 = 빠른 이동: 캐릭터를 해당 위치로 보내고 상호작용
export function go(k) {
  world.goTo(k);
}
