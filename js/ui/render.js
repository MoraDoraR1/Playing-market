// 렌더러: 인게임 HUD / 월드·전투 화면 / 팝업(가방·상점·집·수첩·설명서·설정)
import { S, playerAtk, rankName, nextRank, invSlots } from "../core/state.js";
import { RANKS, HEAVEN_DEED } from "../data/ranks.js";
import { PLACES } from "../data/places.js";
import { won } from "../core/format.js";
import { sfx, toggleMuted, setMuted, startBgm, stopBgm } from "../core/audio.js";
import { $, sprite, say, toast } from "./view.js";

import { doWork } from "../systems/gather.js";
import { pickFoe, startBattle, startBoss, battleAttack, strongAttack, usePotion, fleeBattle } from "../systems/battle.js";
import { availableBoss } from "../data/monsters.js";
import { sellTotal, unitPrice, sellOne, sellAll, toolCost, buyTool, weaponCost, buyWeapon, armorCost, buyArmor, buyPotion } from "../systems/economy.js";
import { donate } from "../systems/progress.js";
import { doSleep, buyBed } from "../systems/rest.js";
import { craft, cook, plant, harvest, hasItems, needsText } from "../systems/home.js";
import { CRAFT, COOK, CROPS, MAX_PLOTS } from "../data/recipes.js";
import { claimQuest, buyStar, achievementsStatus, ensureDaily } from "../systems/meta.js";
import { STAR_SHOP } from "../data/meta.js";
import { itemDef } from "../data/items.js";
import { MONSTERS } from "../data/monsters.js";
import { hardReset } from "../core/save.js";
import { maybeTutorial } from "./tutorial.js";
import * as world from "./world.js";

const GATHERABLE_IDS = (() => {
  const set = new Set();
  Object.values(PLACES).forEach((p) => { (p.loot || []).forEach((x) => set.add(x.id)); if (p.rare) set.add(p.rare.id); });
  return [...set];
})();
const DYNAMIC_POPS = new Set(["shop", "home", "donate", "journal", "bag", "travel"]);

// ---------- HUD ----------
export function renderHud() {
  $("rankName").textContent = rankName();
  const nr = nextRank();
  if (nr) {
    const base = RANKS[S.rankIdx].g, span = nr.g - base;
    $("gongBar").style.width = Math.max(0, Math.min(100, ((S.gong - base) / span) * 100)) + "%";
    $("rankChip").title = `다음: ${nr.n} (${S.gong}/${nr.g})`;
  } else { $("gongBar").style.width = "100%"; $("rankChip").title = "최고 계급!"; }
  const fp = Math.min(100, S.fatigue);
  $("fatBar").style.width = fp + "%"; $("fatTxt").textContent = Math.round(fp) + "%";
  $("money").textContent = won(S.money);
  $("hp").textContent = `${S.hp}/${S.maxHp}`;
  $("deed").textContent = S.deed + "점";
}

// ---------- 인벤토리(가방) ----------
export function renderInv() {
  const slots = invSlots();
  const badge = $("bagCount");
  if (badge) badge.textContent = slots.length;
  if (S.popup === "bag") refreshPopup();
}

// ---------- 씬(월드/전투) ----------
export function renderScene() {
  const battle = $("battle");
  if (S.mode === "battle") { world.unmount(); battle.classList.add("show"); renderBattle(); }
  else { battle.classList.remove("show"); world.ensureMounted($("scene")); }
}

function hpBar(cur, max, color) {
  const p = Math.max(0, Math.min(100, (cur / max) * 100));
  return `<div style="width:130px;height:9px;border-radius:6px;background:#0004;margin:4px auto"><i style="display:block;height:100%;width:${p}%;border-radius:6px;background:${color}"></i></div>`;
}

function renderBattle() {
  const box = $("battleBox");
  if (!S.foe) {
    const foe = pickFoe();
    const boss = availableBoss(S.rankIdx);
    box.innerHTML = `
      <div class="bfield"><div class="who"><div class="em">${foe.pic}</div><div>야생의 ${foe.nm}</div>
        <div style="font-size:12px;opacity:.8">체력 ${foe.hp}·공격 ${foe.atk}·보상 ${won(foe.gold)}</div></div></div>
      <div class="act" id="act"></div>`;
    const act = $("act");
    const b = mkbtn("btn work", "⚔️ 싸우기 시작!", () => startBattle(foe)); if (S.fatigue >= 100 || S.hp <= 0) b.disabled = true; act.appendChild(b);
    if (boss) { const bb = mkbtn("btn give", `🔥 보스 (${boss.pic}${boss.nm})`, startBoss); if (S.fatigue >= 100 || S.hp <= 0) bb.disabled = true; act.appendChild(bb); }
    act.appendChild(mkbtn("btn sleep", "🚪 마을로 나가기", world.exitDungeon));
  } else {
    const f = S.foe;
    box.innerHTML = `
      <div class="bfield">
        <div class="who"><div class="em">🧑‍🌾</div><div>나 (공격 ${playerAtk()})</div>${hpBar(S.hp, S.maxHp, "#20bf6b")}<div style="font-size:12px">❤️ ${S.hp}/${S.maxHp}</div></div>
        <div style="align-self:center;font-size:22px">⚔️</div>
        <div class="who"><div class="em">${f.ref.pic}</div><div>${f.ref.nm}</div>${hpBar(f.hp, f.ref.hp, "#eb3b5a")}<div style="font-size:12px">💀 ${Math.max(0, f.hp)}/${f.ref.hp}</div></div>
      </div>
      <div class="act" id="act"></div>`;
    const act = $("act");
    act.appendChild(mkbtn("btn work", "🗡️ 공격!", battleAttack));
    const s = mkbtn("btn up", "💥 강공격", strongAttack); if (S.fatigue >= 100) s.disabled = true; act.appendChild(s);
    const pot = mkbtn("btn sleep", `🧪 물약(${S.potions})`, usePotion); if (S.potions <= 0) pot.disabled = true; act.appendChild(pot);
    act.appendChild(mkbtn("btn give", "🏃 도망", fleeBattle));
  }
}

function mkbtn(cls, text, on) { const b = document.createElement("button"); b.className = cls; b.textContent = text; b.onclick = on; return b; }

// ---------- 팝업 시스템 ----------
export function openPopup(kind) { S.popup = kind; buildPopup(kind); $("popup").classList.add("show"); }
export function closePopup() { S.popup = null; $("popup").classList.remove("show"); }
export function refreshPopup() { if (S.popup) buildPopup(S.popup); }
// 시스템들이 호출하는 renderPanel = 현재 열린 팝업 갱신
export function renderPanel() { if (S.popup && DYNAMIC_POPS.has(S.popup)) refreshPopup(); }
// 내비 제거됨 → no-op (하위 호환)
export function renderNav() {}

function buildPopup(kind) {
  const pan = $("popBody");
  if (kind === "shop") renderShop(pan);
  else if (kind === "home") renderHome(pan);
  else if (kind === "donate") renderDonate(pan);
  else if (kind === "journal") renderJournal(pan);
  else if (kind === "bag") renderBag(pan);
  else if (kind === "manual") renderManual(pan);
  else if (kind === "settings") renderSettings(pan);
  else if (kind === "travel") renderTravel(pan);
}

// ---------- 가방 ----------
function renderBag(pan) {
  const slots = invSlots();
  let h = `<h2>🎒 내 가방 <span class="muted">${slots.length}칸</span></h2>`;
  h += slots.length ? `<div class="inv">` + slots.map((x) =>
    `<div class="slot${x.rare ? " rare" : ""}">${sprite("items", x.id, x.pic)} ${x.nm} <span class="cnt">${x.count}</span></div>`).join("") + `</div>`
    : `<div class="muted">아직 비어있어요~ 자원을 모아보세요!</div>`;
  pan.innerHTML = h;
}

// ---------- 상점 ----------
function renderShop(pan) {
  const slots = invSlots();
  const m = S.market || { mult: 1, hotItem: null };
  const trend = m.mult > 1.05 ? "📈 호황!" : m.mult < 0.95 ? "📉 불황…" : "➖ 보통";
  const hot = m.hotItem && itemDef(m.hotItem);
  let h = `<h2>🏪 상점</h2>`;
  h += `<div class="muted" style="margin-bottom:8px">오늘의 시세 <b>×${m.mult}</b> ${trend}${hot ? ` · 인기 <b>${hot.pic}${hot.nm}</b>(+30%)` : ""}</div>`;
  if (!slots.length) h += `<div class="muted">팔 자원이 없어요~ 먼저 자원을 모아오세요!</div>`;
  else {
    h += `<button class="btn sell" id="sellAll" style="width:100%;margin-bottom:8px">💰 전부 팔기 (${won(sellTotal())})</button>`;
    h += `<div class="shopgrid">` + slots.map((x) =>
      `<div class="row"><span>${sprite("items", x.id, x.pic)}${x.nm} <span class="muted">×${x.count}</span></span>
       <button data-sell="${x.id}"${m.hotItem === x.id ? ' style="background:var(--red)"' : ""}>${won(unitPrice(x))}</button></div>`).join("") + `</div>`;
  }
  h += `<h3>⚒️ 도구 강화 <span class="muted">Lv.${S.tool}</span></h3><div class="row"><span>수확량 +1 (한 번에 ${1 + S.tool}개)</span><button id="buyTool">${won(toolCost())}</button></div>`;
  h += `<h3>🗡️ 무기 강화 <span class="muted">Lv.${S.weapon}</span></h3><div class="row"><span>공격력 +4 (현재 ${playerAtk()})</span><button id="buyWeapon">${won(weaponCost())}</button></div>`;
  h += `<h3>🛡️ 방어구 강화 <span class="muted">Lv.${S.armor}</span></h3><div class="row"><span>받는 피해 -3 (현재 ${S.armor * 3})</span><button id="buyArmor">${won(armorCost())}</button></div>`;
  h += `<h3>🧪 회복 물약 <span class="muted">보유 ${S.potions}</span></h3><div class="row"><span>전투 중 체력 35 회복</span><button id="buyPotion">${won(200)}</button></div>`;
  pan.innerHTML = h;
  if ($("sellAll")) $("sellAll").onclick = sellAll;
  pan.querySelectorAll("[data-sell]").forEach((b) => (b.onclick = () => sellOne(b.getAttribute("data-sell"))));
  $("buyTool").onclick = buyTool; $("buyWeapon").onclick = buyWeapon; $("buyArmor").onclick = buyArmor; $("buyPotion").onclick = buyPotion;
}

// ---------- 집 ----------
function renderHome(pan) {
  const tab = S.homeTab || "rest";
  const tabs = [["rest", "😴 휴식"], ["craft", "🔨 작업대"], ["cook", "🍳 부엌"], ["farm", "🌱 농지"], ["deco", "🛋️ 꾸미기"]];
  let h = `<h2>🏠 우리 집</h2><div class="tabs">` + tabs.map(([k, t]) => `<button class="tab${tab === k ? " on" : ""}" data-tab="${k}">${t}</button>`).join("") + `</div><div>${homeBody(tab)}</div>`;
  pan.innerHTML = h;
  pan.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { S.homeTab = b.getAttribute("data-tab"); refreshPopup(); }));
  if (tab === "rest") { if ($("sleepBtn")) $("sleepBtn").onclick = doSleep; if ($("bedBtn")) $("bedBtn").onclick = buyBed; }
  else if (tab === "craft") pan.querySelectorAll("[data-craft]").forEach((b) => (b.onclick = () => craft(b.getAttribute("data-craft"))));
  else if (tab === "cook") pan.querySelectorAll("[data-cook]").forEach((b) => (b.onclick = () => cook(b.getAttribute("data-cook"))));
  else if (tab === "farm") {
    pan.querySelectorAll("[data-plant]").forEach((b) => (b.onclick = () => plant(b.getAttribute("data-plant"))));
    pan.querySelectorAll("[data-harvest]").forEach((b) => (b.onclick = () => harvest(+b.getAttribute("data-harvest"))));
  }
}
function homeBody(tab) {
  if (tab === "rest") {
    let h = `<div class="muted" style="margin-bottom:8px">피로도 <b>${Math.round(S.fatigue)}%</b> · 체력 <b>❤️${S.hp}/${S.maxHp}</b>${S.foodBuff ? ` · 버프 <b>${S.foodBuff.pic}${S.foodBuff.nm}</b>(${S.foodBuff.turns})` : ""}</div>`;
    h += `<div class="row"><span>😴 잠자기 (피로 ${S.bed ? "전부" : "70"} 회복)</span><button id="sleepBtn" style="background:var(--blue)">쉬기</button></div>`;
    h += S.bed ? `<div class="row"><span>🛏️ 푹신침대 보유중! 😊</span><button disabled style="background:#ccc">완료</button></div>`
      : `<div class="row"><span>🛏️ 푹신침대 (완전 회복)</span><button id="bedBtn" style="background:var(--brown)">${won(1500)}</button></div>`;
    return h;
  }
  if (tab === "craft") return `<div class="muted" style="margin-bottom:6px">나뭇가지→합판→가구를 만들어요!</div>` + CRAFT.map(craftRow).join("");
  if (tab === "cook") return `<div class="muted" style="margin-bottom:6px">재료로 요리해 체력·버프를 얻어요!</div>` + COOK.map(cookRow).join("");
  if (tab === "farm") {
    let h = `<div class="muted" style="margin-bottom:6px">밭 ${S.farm.length}/${MAX_PLOTS} · 활동하면 자라요</div>`;
    if (!S.farm.length) h += `<div class="muted">아직 심은 게 없어요~</div>`;
    S.farm.forEach((p, i) => { const c = CROPS[p.cropId], ready = p.progress >= c.grow, pct = Math.min(100, p.progress / c.grow * 100);
      h += `<div class="row"><span style="flex:1">${c.pic}${c.nm} ${ready ? "🌟 다 자람!" : `<span class="muted">(${p.progress}/${c.grow})</span>`}<div style="height:8px;margin-top:4px;width:130px;background:#eee;border-radius:6px"><i style="display:block;height:100%;width:${pct}%;background:var(--green);border-radius:6px"></i></div></span><button data-harvest="${i}" ${ready ? "" : "disabled"} style="background:${ready ? "var(--green)" : "#ccc"}">수확</button></div>`; });
    h += `<h3>🌱 씨앗 심기</h3>` + Object.values(CROPS).map((c) => `<div class="row"><span>${c.pic}${c.nm} <span class="muted">· ${c.grow}회 → ${c.yield.map((y) => y.pic + y.nm + "×" + y.qty).join(",")}</span></span><button data-plant="${c.id}" style="background:var(--green)">${won(c.seedCost)}</button></div>`).join("");
    return h;
  }
  if (tab === "deco") {
    const score = S.furniture.reduce((s, id) => { const r = CRAFT.find((x) => x.id === id); return s + (r ? r.deco || 0 : 0); }, 0);
    let h = `<div class="muted">집 꾸미기 점수: <b>⭐ ${score}</b></div>`;
    h += S.furniture.length ? `<div class="inv" style="margin-top:8px">` + S.furniture.map((id) => { const r = CRAFT.find((x) => x.id === id); return `<div class="slot">${r.pic} ${r.nm}</div>`; }).join("") + `</div>` : `<div class="muted" style="margin-top:6px">작업대에서 가구를 만들어 꾸며봐요!</div>`;
    return h;
  }
  return "";
}
function craftRow(r) {
  const owned = !r.makesItem && S.furniture.includes(r.id), can = hasItems(r.needs);
  const dis = owned || !can ? "disabled" : "", style = owned || !can ? "background:#ccc" : "background:var(--brown)";
  return `<div class="row" style="flex-wrap:wrap;gap:4px"><span style="flex:1 1 58%">${r.pic}${r.nm} <span class="muted">· ${r.desc}</span><br><span class="muted">재료: ${needsText(r.needs)}</span></span><button data-craft="${r.id}" ${dis} style="${style}">${owned ? "보유중" : (r.makesItem ? "만들기" : "제작")}</button></div>`;
}
function cookRow(c) {
  const can = hasItems(c.needs);
  return `<div class="row" style="flex-wrap:wrap;gap:4px"><span style="flex:1 1 58%">${c.pic}${c.nm} <span class="muted">· ${c.desc}</span><br><span class="muted">재료: ${needsText(c.needs)}</span></span><button data-cook="${c.id}" ${can ? "" : "disabled"} style="background:${can ? "var(--gold)" : "#ccc"}">요리</button></div>`;
}

// ---------- 기부소 ----------
function renderDonate(pan) {
  let h = `<h2>❤️ 기부소</h2><div class="muted" style="margin-bottom:8px">기부하면 선행점수↑. <b>${HEAVEN_DEED}점</b>이면 ☁️하늘나라가 열려요! (현재 ${S.deed}점)</div>`;
  [[100, 1], [500, 6], [1000, 14]].forEach(([m, d]) => { h += `<div class="row"><span>💝 ${won(m)} 기부 → 선행 +${d}점</span><button data-give="${m}" data-deed="${d}" style="background:var(--red)">기부</button></div>`; });
  pan.innerHTML = h;
  pan.querySelectorAll("[data-give]").forEach((b) => (b.onclick = () => donate(+b.getAttribute("data-give"), +b.getAttribute("data-deed"))));
}

// ---------- 모험수첩 ----------
function renderJournal(pan) {
  const tab = S.journalTab || "quest";
  const tabs = [["quest", "📜 퀘스트"], ["codex", "📖 도감"], ["achieve", "🏆 업적"], ["star", "🛒 특수샵"]];
  pan.innerHTML = `<h2>📋 모험수첩</h2><div class="tabs">` + tabs.map(([k, t]) => `<button class="tab${tab === k ? " on" : ""}" data-jtab="${k}">${t}</button>`).join("") + `</div><div>${journalBody(tab)}</div>`;
  pan.querySelectorAll("[data-jtab]").forEach((b) => (b.onclick = () => { S.journalTab = b.getAttribute("data-jtab"); refreshPopup(); }));
  if (tab === "quest") pan.querySelectorAll("[data-claim]").forEach((b) => (b.onclick = () => claimQuest(+b.getAttribute("data-claim"))));
  if (tab === "star") pan.querySelectorAll("[data-star]").forEach((b) => (b.onclick = () => buyStar(b.getAttribute("data-star"))));
}
function journalBody(tab) {
  if (tab === "quest") {
    const list = S.quests.list || [];
    if (!list.length) return `<div class="muted">오늘의 퀘스트를 준비 중이에요~</div>`;
    return list.map((q, i) => {
      const pct = Math.min(100, q.progress / q.goal * 100);
      const btn = q.claimed ? `<button disabled style="background:#ccc">완료 ✓</button>` : q.done ? `<button data-claim="${i}" style="background:var(--green)">보상받기</button>` : `<button disabled style="background:#ccc">${q.progress}/${q.goal}${q.unit}</button>`;
      return `<div class="row" style="flex-wrap:wrap;gap:4px"><span style="flex:1 1 58%">📜 ${q.nm} <span class="muted">· 목표 ${q.goal}${q.unit} · 보상 ${won(q.rewardMoney)}</span><div style="height:8px;margin-top:4px;width:140px;background:#eee;border-radius:6px"><i style="display:block;height:100%;width:${pct}%;background:var(--gold);border-radius:6px"></i></div></span>${btn}</div>`;
    }).join("");
  }
  if (tab === "codex") {
    const iF = S.codex.items.length, iT = GATHERABLE_IDS.length, mF = S.codex.monsters.length, mT = MONSTERS.length;
    let h = `<div class="muted" style="margin-bottom:6px">자원 <b>${iF}/${iT}</b> · 몬스터 <b>${mF}/${mT}</b></div><h3>🎒 자원</h3><div class="inv">`;
    h += GATHERABLE_IDS.map((id) => { const f = S.codex.items.includes(id), d = itemDef(id); return `<div class="slot"${f ? "" : ' style="opacity:.35;filter:grayscale(1)"'}>${f ? d.pic : "❔"} ${f ? d.nm : "???"}</div>`; }).join("") + `</div>`;
    h += `<h3>👾 몬스터</h3><div class="inv">` + MONSTERS.map((mo) => { const f = S.codex.monsters.includes(mo.id); return `<div class="slot"${f ? "" : ' style="opacity:.35;filter:grayscale(1)"'}>${f ? mo.pic : "❔"} ${f ? mo.nm : "???"}</div>`; }).join("") + `</div>`;
    return h;
  }
  if (tab === "achieve") return achievementsStatus().map((a) => `<div class="row"><span>${a.done ? a.pic : "🔒"} <b>${a.nm}</b> <span class="muted">· ${a.desc}</span></span><span>${a.done ? "✅" : "…"}</span></div>`).join("");
  if (tab === "star") {
    let h = `<div class="muted" style="margin-bottom:6px">🛒 특수아이템샵 · 보유 <b>${won(S.money)}</b> · 원작처럼 고가의 사기템!</div>`;
    return h + STAR_SHOP.map((it) => `<div class="row" style="flex-wrap:wrap;gap:4px"><span style="flex:1 1 55%">${it.pic}${it.nm} <span class="muted">· ${it.desc}</span></span><button data-star="${it.id}"${S.money < it.cost ? " disabled" : ""} style="background:${S.money < it.cost ? "#ccc" : "#b197fc"}">${won(it.cost)}</button></div>`).join("");
  }
  return "";
}

// ---------- 빠른 이동 ----------
function renderTravel(pan) {
  const items = [["forest", "🌲 숲"], ["sea", "🌊 바다"], ["river", "🏞️ 강"], ["mine", "⛏️ 광산"], ["field", "🌾 들판"], ["dump", "🗑️ 쓰레기장"], ["pirate", "🏴‍☠️ 해적선"], ["battle", "⚔️ 던전"], ["shop", "🏪 상점"], ["home", "🏠 집"], ["donate", "❤️ 기부소"], ["journal", "📋 수첩"], ["heaven", "☁️ 하늘나라"]];
  let h = `<h2>🗺️ 빠른 이동</h2><div class="muted" style="margin-bottom:8px">가고 싶은 곳으로 바로 이동해요 (숫자키로도 가능)</div><div class="shopgrid">`;
  h += items.map(([k, t]) => `<button class="btn" data-go="${k}" style="background:var(--brown)">${t}</button>`).join("");
  pan.innerHTML = h + `</div>`;
  pan.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => { closePopup(); go(b.getAttribute("data-go")); }));
}

// ---------- 설명서 ----------
function renderManual(pan) {
  pan.innerHTML = `<h2>📖 설명서</h2>
    <h3>🎯 목표</h3><div class="muted">자원을 모아 팔고, 몬스터와 싸우고, 계급을 올리고, 선행을 쌓는 생활·경제 게임이에요. 최고 계급 '생명의 왕'에 도전!</div>
    <h3>🕹️ 조작</h3><div class="muted">· 걷기: 방향키 / WASD / 마우스 클릭<br>· 상호작용: 자원·건물에 다가가 <b>Space</b>(또는 Ⓐ)<br>· 맵 이동: 길을 따라 맵 끝으로 가면 표지판 방향의 맵으로 전환<br>· 빠른 이동: 숫자키 1~0, Y·P·V<br>· 팝업 닫기: Esc</div>
    <h3>🗺️ 맵</h3><div class="muted">마을 광장을 중심으로 숲·바다·강·광산·들판·쓰레기장·해적선·던전·하늘나라가 연결돼 있어요. 표지판이 어느 방향에 뭐가 있는지 알려줘요.</div>
    <h3>🌿 자원 & 판매</h3><div class="muted">각 맵에서 채집/낚시/채광/사냥으로 자원을 모아 상점에 팔아요. 바다·강·광산은 타이밍 미니게임! (막대를 초록칸에 맞춰 잡으면 더 많이)</div>
    <h3>🏠 집</h3><div class="muted">휴식으로 회복, 작업대(제작)·부엌(요리)·농지(농사)·꾸미기.</div>
    <h3>⚔️ 전투</h3><div class="muted">던전에서 몬스터와 싸워요. 강공격은 2배 피해(피로↑), 방어구는 피해 감소. 계급이 오르면 보스 도전!</div>
    <h3>❤️ 선행 & 계급</h3><div class="muted">기부로 선행점수를 쌓으면 하늘나라가 열려요. 활동으로 내공을 모아 계급 승급!</div>
    <h3>💰 통화</h3><div class="muted">유일한 통화는 <b>별머니(별)</b>. 특수아이템샵의 최고급 사기템은 원작처럼 아주 비싸요(최상위 10만별).</div>`;
}

// ---------- 설정 ----------
function renderSettings(pan) {
  pan.innerHTML = `<h2>⚙️ 설정</h2>
    <div class="row"><span>🔊 효과음</span><button id="setSound" style="background:${S.settings.sound ? "var(--green)" : "#ccc"}">${S.settings.sound ? "켜짐" : "꺼짐"}</button></div>
    <div class="row"><span>🎵 배경음악</span><button id="setBgm" style="background:${S.settings.bgm ? "var(--green)" : "#ccc"}">${S.settings.bgm ? "켜짐" : "꺼짐"}</button></div>
    <div class="row"><span>🔄 처음부터 다시</span><button id="setReset" style="background:var(--red)">초기화</button></div>
    <div class="muted" style="margin-top:8px">진행은 자동 저장돼요.</div>`;
  $("setSound").onclick = () => { const muted = toggleMuted(); S.settings.sound = !muted; if (muted) stopBgm(); else if (S.settings.bgm) startBgm(); refreshPopup(); };
  $("setBgm").onclick = () => { S.settings.bgm = !S.settings.bgm; if (S.settings.bgm && S.settings.sound) startBgm(); else stopBgm(); refreshPopup(); };
  $("setReset").onclick = () => {
    if (!confirm("정말 처음부터 다시 시작할까요? 모든 진행이 사라져요!")) return;
    hardReset(); setMuted(!S.settings.sound); ensureDaily(); closePopup(); renderAll(); maybeTutorial();
  };
}

// ---------- 전체 ----------
export function renderAll() { renderHud(); renderScene(); renderInv(); }

// 빠른 이동/포탈 (world에 위임)
export function go(k) { world.goTo(k); }
