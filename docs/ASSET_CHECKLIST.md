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

## E. UI 아이콘 `ui/` — 256×256, 투명 (픽토그램·세트감)
HUD: [ ] `ui/hud_rank` 계급메달 [ ] `ui/hud_star` 별머니 [ ] `ui/hud_hp` 체력하트 [ ] `ui/hud_fat` 피로 [ ] `ui/hud_deed` 선행선물
액션바: [ ] `ui/bag` 가방 [ ] `ui/travel` 빠른이동(지도) [ ] `ui/manual` 설명서(책) [ ] `ui/gear` 설정
기타: [ ] `ui/close` 닫기(✕) [ ] (선택) `ui/dpad` 방향버튼

## F. 맵 배경/길 타일 `bg/` — 512×512, 불투명, **이음매 없이 타일링**(규격은 `VISUAL_GUIDE.md` §7-1)
> 지금은 맵마다 단색 그라디언트 바닥 + 단색 흙길 사각형이라 9개 맵이 다 비슷해 보임(몰입 저하).
> 맵마다 실제 지형처럼 보이는 **바닥 텍스처**와, 그 위를 지나는 **길 텍스처**를 따로 만들어서
> 코드에서 `ctx.createPattern()`으로 반복 채운다(바닥 전체 1장 그리는 게 아니라 "이어붙이는 작은 타일").

### F-1. 바닥(ground) 텍스처 — 맵 9개당 1종
| id | 맵 | 현재 그라디언트(참고 톤) | 소재 설명 |
|---|---|---|---|
| `bg/ground_village` | 마을 광장 | `#bff0b4→#9fe08f` | 잔디 마당 사이사이 낮은 돌포석(디딤돌), 아기자기한 광장 느낌 |
| `bg/ground_forest` | 숲속 | `#a6ecab→#82d68c` | 짙은 잔디 + 낙엽 몇 장 + 작은 클로버, 나무 그늘 |
| `bg/ground_sea` | 바닷가 | `#a9dcf5→#7ec2ea` | 젖은 모래사장, 잔물결 자국, 작은 조개껍데기 알갱이 |
| `bg/ground_river` | 강가 | `#a9edd0→#7fdcb4` | 강둑의 짧은 초록 풀 + 둥근 냇돌(자갈) 몇 개 |
| `bg/ground_mine` | 광산 | `#cdd2d8→#aeb4bc` | 회색 암반 바닥, 희미한 광물 반짝임 알갱이 |
| `bg/ground_field` | 들판 | `#ffe9a0→#ffd76a` | 마른 황토색 농지, 그루터기 자국, 잔디 섞임 |
| `bg/ground_dump` | 쓰레기장 | `#d5d9cf→#b8bdb0` | 금 간 회색 콘크리트 + 잡초 틈새 |
| `bg/ground_dungeon` | 던전 입구 | `#9aa0a8→#7c828c` | 이끼 낀 어두운 돌바닥, 습기 자국 |
| `bg/ground_heaven` | 하늘나라 | `#e0d4ff→#c3aaff` | 폭신폭신한 파스텔 구름 바닥, 은은한 반짝임 |
- [ ] `bg/ground_village` [ ] `bg/ground_forest` [ ] `bg/ground_sea` [ ] `bg/ground_river` [ ] `bg/ground_mine`
- [ ] `bg/ground_field` [ ] `bg/ground_dump` [ ] `bg/ground_dungeon` [ ] `bg/ground_heaven`

### F-2. 길(road) 텍스처 — 생물군계별 4종 (여러 맵이 공유)
| id | 사용 맵 | 소재 설명 |
|---|---|---|
| `bg/road_dirt` | 마을, 숲속, 들판, 쓰레기장 | 다져진 흙길, 옅은 자갈·발자국 자국, 바닥보다 살짝 어두운 갈색 |
| `bg/road_sand` | 바닷가, 강가 | 나무 판자 데크길 또는 다져진 모랫길, 바닥보다 밝은 베이지 |
| `bg/road_stone` | 광산, 던전 입구 | 거친 회색 돌길, 바닥보다 어둡고 각진 돌판 이음선 |
| `bg/road_cloud` | 하늘나라 | 은은하게 빛나는 금빛~흰색 구름 디딤길 |
- [ ] `bg/road_dirt` [ ] `bg/road_sand` [ ] `bg/road_stone` [ ] `bg/road_cloud`

> 참고: 맵의 실제 길 모양(십자/L자/직선/반쪽)은 `js/ui/world.js`의 `exits` 배열에 따라
> **코드가 이미 정확히 계산**해서 그 위치에 사각형을 그리고 있음 — 이미지는 "그 사각형을 채울 재질"만
> 만들면 되고, 길의 모양·위치를 직접 그릴 필요는 없음(타일링이라 어차피 잘림).

## G. 이펙트(선택) `fx/` — 512×512, 투명
- [ ] `fx/sparkle` 채집 반짝임 [ ] `fx/levelup` 승급 [ ] `fx/hit` 타격 [ ] `fx/win` 승리

---

## 권장 생성 순서 (작은 배치)
1. **A. 캐릭터 10프레임** (게임 중 항상 노출·통일성 기준점) — ✅ 완료
2. **B. 몬스터/보스 9종** — ✅ 완료
3. **C. 아이템 41종** — ✅ 완료
4. **D. 월드/건물 13종** — ✅ 완료
5. **F. 맵 배경/길 타일 13종**(바닥 9 + 길 4) — 다음 우선순위(몰입감 개선 요청)
6. **E. UI 아이콘 9종**
7. **G. 이펙트 4종**(선택)

## ⚠️ 표시 연결 — ✅ 완료(B/C/D 전 종류 공통 파이프라인)
1. `js/data/assets.js`의 `PNG` 맵에 `"<종류>_<아이디>"` 키로 등록(예: `obj_tree`, `mon_slime`, `item_shell`)
2. 월드(캔버스): `js/ui/world.js`의 `ART` 값 + `js/ui/sprites.js`의 `SVGS` 키를 동일 접두("obj_") 이름으로 통일 → `getSprite()`가 PNG 우선, 없으면 벡터 플레이스홀더로 자동 폴백
3. 배틀/가방/상점/도감(HTML): `js/ui/view.js`의 `sprite(kind, id, emoji)` 헬퍼가 `PNG["<kind>_<id>"]`가 있으면 `<img class="spr">`, 없으면 이모지 텍스트로 자동 폴백(`kind`는 "mon"/"item")
4. **플레이 링크용**: `tools/build-standalone.mjs`가 `assets/sprites/**/*.png`를 전부 `data:` URI로 인라인(`__SPRITE_DATA`) — 새 PNG를 폴더에 커밋만 하면 다음 빌드에 자동 포함됨
> 새 이미지 추가 절차: PNG를 `assets/sprites/<종류>/<id>.png`로 커밋 → `assets.js`의 `PNG` 맵에 한 줄 등록 → 빌드. 그 외 코드 변경 불필요(이모지 폴백이 자동으로 이미지로 교체됨).
