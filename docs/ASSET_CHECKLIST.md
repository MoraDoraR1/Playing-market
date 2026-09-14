# ✅ 에셋 체크리스트 (이미지 생성 목록) — 키즈짱 시장놀이

> 생성할 모든 이미지 목록. **모두 고품질 PNG(투명 배경)**, 규격은 `docs/VISUAL_GUIDE.md`.
> 각 프롬프트 = "**주제(subject)** + §2 마스터 스타일 문구". 경로 규칙: `assets/sprites/<종류>/<id>.png`.
> 상태: `[ ]` 미생성 · `[x]` 완료. (현재 코드의 SVG는 임시 플레이스홀더이며 전부 PNG로 대체)

## A. 캐릭터 `char/` — 512×512, 투명  ⚠️ 부분 재생성 필요
동일 인물(밀짚모자 소년, 파란셔츠+남색바지). right는 left 반전이라 생성 X.
- [x] `char/down_0` `char/down_1` — 정면 걷기 2프레임 — **재생성 필요**: 1차 생성분은 두 프레임 다리 포즈가 거의 동일해 걷는 게 아니라 미끄러지는 것처럼 보임. `VISUAL_GUIDE.md` §5의 "명확히 다른 포즈" 지침(반대발/반대팔, 좌우 반전 수준 차이)으로 다시 생성.
- [x] `char/up_0` `char/up_1` — 뒷면(뒤통수+작은 가방) 걷기 2프레임 — **재생성 필요**(down과 동일 사유)
- [x] `char/left_0` `char/left_1` — 옆모습(왼쪽) 걷기 2프레임 (다리 교차 뚜렷 — 통과, 재생성 불필요, 새 생성물도 이 수준 유지)
- [x] `char/work_0` `char/work_1` — 채집 2프레임 (도구 위로/아래로 — 차이 뚜렷, 통과)
- [ ] (선택) `char/idle` 정지 1프레임
> 프롬프트 예: `a chubby 2-head cute boy in straw hat, blue shirt navy pants, top-down 3/4 view, walking, left foot forward` (+마스터 스타일). **정면/뒷면은 반드시 §5의 프레임별 포즈 지정을 그대로 따를 것.**

## B. 몬스터/보스 `mon/` — 512×512, 투명
- [x] `mon/slime` 슬라임 - [ ] `mon/bat` 박쥐 - [ ] `mon/boar` 멧돼지
- [x] `mon/ghost` 유령 - [x] `mon/golem` 바위골렘 - [ ] `mon/dragon` 아기 드래곤
- [x] `mon/kingslime` 슬라임 왕(보스) - [x] `mon/kraken` 크라켄(보스) - [ ] `mon/darklord` 마왕(보스)
> 보스는 더 크고 위엄 있게. 예: `cute round green slime monster, big shiny eyes` (+마스터 스타일)
> 미생성분(bat/boar/dragon/darklord)은 표시 연결 완료 상태라 이모지로 폴백 표시됨 — 생성되는 대로 자동 적용.

## C. 자원/전리품/가공품 `item/` — 512×512, 투명 (단일 오브젝트, 심플·굵게)
숲: [ ] `item/branch` 나뭇가지 [ ] `item/mushroom` 버섯 [ ] `item/herb` 약초 [ ] `item/ginseng` 산삼
바다: [ ] `item/anchovy` 멸치 [x] `item/shell` 조개 [x] `item/squid` 오징어 [ ] `item/pearl` 진주
강: [ ] `item/loach` 미꾸라지 [ ] `item/crayfish` 가재 [ ] `item/carp` 잉어 [ ] `item/goldcarp` 황금잉어
광산: [x] `item/stone` 돌멩이 [ ] `item/copper` 구리 [ ] `item/iron` 철광석 [ ] `item/gem` 보석
들판: [ ] `item/berry` 산딸기 [ ] `item/grain` 곡식 [ ] `item/meat` 고기 [ ] `item/goldegg` 황금알
쓰레기장: [ ] `item/scrap` 고철 [ ] `item/bottle` 빈병 [ ] `item/radio` 고장난 라디오 [ ] `item/record` 희귀음반
해적선: [ ] `item/coin` 금화 [ ] `item/map` 낡은지도 [ ] `item/rum` 럼주 [ ] `item/chest` 보물상자
하늘나라: [x] `item/stardust` 별가루 [ ] `item/cloud` 무지개조각 [x] `item/wing` 천사의날개
가공: [ ] `item/plank` 합판
전리품: [ ] `item/jelly` 슬라임젤리 [ ] `item/batwing` 박쥐날개 [x] `item/tusk` 멧돼지엄니 [x] `item/soul` 영혼구슬 [ ] `item/core` 골렘핵 [ ] `item/scale` 용비늘 [ ] `item/crown` 왕관 [x] `item/tentacle` 크라켄촉수 [ ] `item/darkgem` 마왕의보석
> 미생성 아이템은 표시 연결 완료 상태라 이모지로 폴백 표시됨 — 생성되는 대로 자동 적용.

## D. 월드 오브젝트/건물 `obj/` — 512×512, 투명
- [x] `obj/tree` 채집터 나무 - [x] `obj/fishspot` 낚시터 - [x] `obj/ore` 광맥 - [x] `obj/wheat` 밀밭
- [x] `obj/trash` 고물더미 - [x] `obj/pirate` 해적선 - [x] `obj/cave` 던전 입구 - [x] `obj/cloud` 하늘나라 구름
- [x] `obj/b_shop` 상점 - [x] `obj/b_home` 집 - [x] `obj/b_donate` 기부소 - [x] `obj/b_journal` 수첩(책 좌판)
- [x] `obj/sign` 표지판(나무 팻말, 현재 🗺️빠른이동 팝업 제목 아이콘으로 사용 — 방향별 회전이 필요한 맵 표지판 자체는 기존 벡터 방식 유지) - [ ] (선택) `obj/portal` 하늘나라 포탈

## E. UI 아이콘 `ui/` — 256×256, 투명 (픽토그램·세트감)
HUD: [ ] `ui/hud_rank` 계급메달 [ ] `ui/hud_star` 별머니 [ ] `ui/hud_hp` 체력하트 [ ] `ui/hud_fat` 피로 [ ] `ui/hud_deed` 선행선물
액션바: [ ] `ui/bag` 가방 [ ] `ui/travel` 빠른이동(지도) [ ] `ui/manual` 설명서(책) [ ] `ui/gear` 설정
기타: [ ] `ui/close` 닫기(✕) [ ] (선택) `ui/dpad` 방향버튼

## F. 배경/타일 `bg/` (선택) — 1200×880, 불투명
- [ ] 맵별 바닥/분위기 배경: `bg/village` `bg/forest` `bg/sea` `bg/river` `bg/mine` `bg/field` `bg/dump` `bg/pirate` `bg/dungeon` `bg/heaven`

## G. 이펙트(선택) `fx/` — 512×512, 투명
- [ ] `fx/sparkle` 채집 반짝임 [ ] `fx/levelup` 승급 [ ] `fx/hit` 타격 [ ] `fx/win` 승리

---

## 권장 생성 순서 (작은 배치)
1. **A. 캐릭터 10프레임** (게임 중 항상 노출·통일성 기준점)
2. **B. 몬스터/보스 9종**
3. **C. 아이템**(장소별로 나눠서)
4. **D. 월드/건물** → **E. UI 아이콘**
5. **F/G. 배경·이펙트**(선택)

## ⚠️ 표시 연결 — ✅ 완료(B/C/D 전 종류 공통 파이프라인)
1. `js/data/assets.js`의 `PNG` 맵에 `"<종류>_<아이디>"` 키로 등록(예: `obj_tree`, `mon_slime`, `item_shell`)
2. 월드(캔버스): `js/ui/world.js`의 `ART` 값 + `js/ui/sprites.js`의 `SVGS` 키를 동일 접두("obj_") 이름으로 통일 → `getSprite()`가 PNG 우선, 없으면 벡터 플레이스홀더로 자동 폴백
3. 배틀/가방/상점/도감(HTML): `js/ui/view.js`의 `sprite(kind, id, emoji)` 헬퍼가 `PNG["<kind>_<id>"]`가 있으면 `<img class="spr">`, 없으면 이모지 텍스트로 자동 폴백(`kind`는 "mon"/"item")
4. **플레이 링크용**: `tools/build-standalone.mjs`가 `assets/sprites/**/*.png`를 전부 `data:` URI로 인라인(`__SPRITE_DATA`) — 새 PNG를 폴더에 커밋만 하면 다음 빌드에 자동 포함됨
> 새 이미지 추가 절차: PNG를 `assets/sprites/<종류>/<id>.png`로 커밋 → `assets.js`의 `PNG` 맵에 한 줄 등록 → 빌드. 그 외 코드 변경 불필요(이모지 폴백이 자동으로 이미지로 교체됨).
