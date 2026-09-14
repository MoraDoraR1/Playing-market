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

## B. 몬스터/보스 `mon/` — 512×512, 투명 — ✅ 9종 전부 완료
- [x] `mon/slime` 슬라임 - [x] `mon/bat` 박쥐 - [x] `mon/boar` 멧돼지
- [x] `mon/ghost` 유령 - [x] `mon/golem` 바위골렘 - [x] `mon/dragon` 아기 드래곤
- [x] `mon/kingslime` 슬라임 왕(보스) - [x] `mon/kraken` 크라켄(보스) - [x] `mon/darklord` 마왕(보스)

## C. 자원/전리품/가공품 `item/` — 512×512, 투명 (단일 오브젝트, 심플·굵게) — ✅ 41종 전부 완료
숲: [x] `item/branch` 나뭇가지 [x] `item/mushroom` 버섯 [x] `item/herb` 약초 [x] `item/ginseng` 산삼
바다: [x] `item/anchovy` 멸치 [x] `item/shell` 조개 [x] `item/squid` 오징어 [x] `item/pearl` 진주
강: [x] `item/loach` 미꾸라지 [x] `item/crayfish` 가재 [x] `item/carp` 잉어 [x] `item/goldcarp` 황금잉어
광산: [x] `item/stone` 돌멩이 [x] `item/copper` 구리 [x] `item/iron` 철광석 [x] `item/gem` 보석
들판: [x] `item/berry` 산딸기 [x] `item/grain` 곡식 [x] `item/meat` 고기 [x] `item/goldegg` 황금알
쓰레기장: [x] `item/scrap` 고철 [x] `item/bottle` 빈병 [x] `item/radio` 고장난 라디오 [x] `item/record` 희귀음반
해적선: [x] `item/coin` 금화 [x] `item/map` 낡은지도 [x] `item/rum` 럼주 [x] `item/chest` 보물상자
하늘나라: [x] `item/stardust` 별가루 [x] `item/cloud` 무지개조각 [x] `item/wing` 천사의날개
가공: [x] `item/plank` 합판
전리품: [x] `item/jelly` 슬라임젤리 [x] `item/batwing` 박쥐날개 [x] `item/tusk` 멧돼지엄니 [x] `item/soul` 영혼구슬 [x] `item/core` 골렘핵 [x] `item/scale` 용비늘 [x] `item/crown` 왕관 [x] `item/tentacle` 크라켄촉수 [x] `item/darkgem` 마왕의보석

## D. 월드 오브젝트/건물 `obj/` — 512×512, 투명
- [x] `obj/tree` 채집터 나무 - [x] `obj/fishspot` 낚시터 - [x] `obj/ore` 광맥 - [x] `obj/wheat` 밀밭
- [x] `obj/trash` 고물더미 - [x] `obj/pirate` 해적선 - [x] `obj/cave` 던전 입구 - [x] `obj/cloud` 하늘나라 구름
- [x] `obj/b_shop` 상점 - [x] `obj/b_home` 집 - [x] `obj/b_donate` 기부소 - [x] `obj/b_journal` 수첩(책 좌판)
- [x] `obj/sign` 표지판(나무 팻말, 현재 🗺️빠른이동 팝업 제목 아이콘으로 사용 — 방향별 회전이 필요한 맵 표지판 자체는 기존 벡터 방식 유지) - [ ] (선택) `obj/portal` 하늘나라 포탈

## E. UI 아이콘 `ui/` — 256×256, 투명 (픽토그램·세트감) — ✅ 9종 전부 완료
HUD: [x] `ui/hud_rank` 계급메달 [x] `ui/hud_star` 별머니 [x] `ui/hud_hp` 체력하트 [x] `ui/hud_fat` 피로 [x] `ui/hud_deed` 선행선물
액션바: [x] `ui/bag` 가방 [x] `ui/travel` 빠른이동(지도) [x] `ui/manual` 설명서(책) [x] `ui/gear` 설정
기타: [ ] `ui/close` 닫기(✕) [ ] (선택) `ui/dpad` 방향버튼

## F. 맵 배경/길 타일 `bg/` — 512×512, 불투명, **이음매 없이 타일링**(규격은 `VISUAL_GUIDE.md` §7-1) — ✅ 13종 전부 완료
### F-1. 바닥(ground) 텍스처 — 맵 9개당 1종
- [x] `bg/ground_village` [x] `bg/ground_forest` [x] `bg/ground_sea` [x] `bg/ground_river` [x] `bg/ground_mine`
- [x] `bg/ground_field` [x] `bg/ground_dump` [x] `bg/ground_dungeon` [x] `bg/ground_heaven`

### F-2. 길(road) 텍스처 — 생물군계별 4종 (여러 맵이 공유)
- [x] `bg/road_dirt` [x] `bg/road_sand` [x] `bg/road_stone` [x] `bg/road_cloud`

> `js/ui/world.js`의 `GROUND_TEX`/`ROAD_TEX` 맵이 mapId→텍스처를 연결, `ctx.createPattern()`으로
> 반복 채움. 맵의 실제 길 모양(십자/L자/직선/반쪽)은 `exits` 배열 기준으로 코드가 계산해 그 자리에
> 패턴을 채우는 것이라, 이미지 자체는 모양·위치를 신경 쓸 필요 없이 재질만 만들면 됨.

## G. 이펙트 `fx/` — 512×512, 투명 — ✅ 4종 전부 완료
- [x] `fx/sparkle` 채집 반짝임(월드 채집 애니메이션에 적용) [x] `fx/levelup` 승급(계급 상승 모달에 적용)
- [x] `fx/hit` 타격(전투 클릭 시 임팩트 이펙트로 적용) [x] `fx/win` 승리(보스 격파 모달에 적용)

---

## 남은 항목 (전부 선택사항)
- `char/idle` 정지 1프레임, `obj/portal` 하늘나라 포탈 전용 오브젝트, `ui/close`·`ui/dpad`
- 이 문서의 A~G 전 카테고리 핵심 목록은 이제 전부 생성·배선 완료.

## ⚠️ 표시 연결 — ✅ 완료(전 카테고리 공통 파이프라인)
1. `js/data/assets.js`의 `PNG` 맵에 `"<종류>_<아이디>"` 키로 등록(예: `obj_tree`, `mon_slime`, `item_shell`, `bg_ground_forest`, `ui_hud_star`, `fx_win`)
2. 월드(캔버스): `js/ui/world.js`의 `ART`/`GROUND_TEX`/`ROAD_TEX` 값 + `js/ui/sprites.js`의 `SVGS` 키를 동일 접두 이름으로 통일 → `getSprite()`가 PNG 우선, 없으면 벡터/색상 폴백으로 자동 대체
3. 배틀/가방/상점/도감(HTML): `js/ui/view.js`의 `sprite(kind, id, emoji)` 헬퍼가 `PNG["<kind>_<id>"]`가 있으면 `<img class="spr">`, 없으면 이모지 텍스트로 자동 폴백(`kind`는 "mon"/"item"/"fx")
4. HUD/액션바 아이콘: `js/main.js`의 `applyUiIcons()`가 초기 1회 기존 SVG/이모지를 PNG로 교체(있을 때만)
5. **플레이 링크용**: `tools/build-standalone.mjs`가 `assets/sprites/**/*.png`를 전부 `data:` URI로 인라인(`__SPRITE_DATA`) — 새 PNG를 폴더에 커밋만 하면 다음 빌드에 자동 포함됨
> 새 이미지 추가 절차: PNG를 `assets/sprites/<종류>/<id>.png`로 커밋 → `assets.js`의 `PNG` 맵에 한 줄 등록 → 빌드. 그 외 코드 변경은 카테고리에 따라 다름(mon/item/fx는 자동, obj/bg는 맵/키 연결 1줄 추가 필요).
