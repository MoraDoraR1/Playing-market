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
- [ ] `mon/slime` 슬라임 - [ ] `mon/bat` 박쥐 - [ ] `mon/boar` 멧돼지
- [ ] `mon/ghost` 유령 - [ ] `mon/golem` 바위골렘 - [ ] `mon/dragon` 아기 드래곤
- [ ] `mon/kingslime` 슬라임 왕(보스) - [ ] `mon/kraken` 크라켄(보스) - [ ] `mon/darklord` 마왕(보스)
> 보스는 더 크고 위엄 있게. 예: `cute round green slime monster, big shiny eyes` (+마스터 스타일)

## C. 자원/전리품/가공품 `item/` — 512×512, 투명 (단일 오브젝트, 심플·굵게)
숲: [x] `item/branch` 나뭇가지 [x] `item/mushroom` 버섯 [x] `item/herb` 약초 [x] `item/ginseng` 산삼
바다: [x] `item/anchovy` 멸치 [x] `item/shell` 조개 [x] `item/squid` 오징어 [x] `item/pearl` 진주
강: [x] `item/loach` 미꾸라지 [x] `item/crayfish` 가재 [x] `item/carp` 잉어 [x] `item/goldcarp` 황금잉어
광산: [x] `item/stone` 돌멩이 [x] `item/copper` 구리 [x] `item/iron` 철광석 [x] `item/gem` 보석
들판: [ ] `item/berry` 산딸기 [ ] `item/grain` 곡식 [ ] `item/meat` 고기 [ ] `item/goldegg` 황금알
쓰레기장: [ ] `item/scrap` 고철 [ ] `item/bottle` 빈병 [ ] `item/radio` 고장난 라디오 [ ] `item/record` 희귀음반
해적선: [ ] `item/coin` 금화 [ ] `item/map` 낡은지도 [ ] `item/rum` 럼주 [ ] `item/chest` 보물상자
하늘나라: [ ] `item/stardust` 별가루 [ ] `item/cloud` 무지개조각 [ ] `item/wing` 천사의날개
가공: [ ] `item/plank` 합판
전리품: [ ] `item/jelly` 슬라임젤리 [ ] `item/batwing` 박쥐날개 [ ] `item/tusk` 멧돼지엄니 [ ] `item/soul` 영혼구슬 [ ] `item/core` 골렘핵 [ ] `item/scale` 용비늘 [ ] `item/crown` 왕관 [ ] `item/tentacle` 크라켄촉수 [ ] `item/darkgem` 마왕의보석

## D. 월드 오브젝트/건물 `obj/` — 512×512, 투명
- [ ] `obj/tree` 채집터 나무 - [ ] `obj/fishspot` 낚시터 - [ ] `obj/ore` 광맥 - [ ] `obj/wheat` 밀밭
- [ ] `obj/trash` 고물더미 - [ ] `obj/pirate` 해적선 - [ ] `obj/cave` 던전 입구 - [ ] `obj/cloud` 하늘나라 구름
- [ ] `obj/b_shop` 상점 - [ ] `obj/b_home` 집 - [ ] `obj/b_donate` 기부소 - [ ] `obj/b_journal` 수첩(책 좌판)
- [ ] `obj/sign` 표지판(나무 팻말) - [ ] (선택) `obj/portal` 하늘나라 포탈

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

## ⚠️ 표시 연결(별도 구현 과제 — 규격만 정의)
이미지가 준비되면 표시되려면 다음이 필요(현재 미구현):
1. `js/data/assets.js`의 준비목록(`SPRITES_READY`)에 `"<종류>/<id>"` 추가
2. 렌더가 이모지/SVG 대신 해당 PNG를 쓰도록 연결(캐릭터/월드/몬스터/아이템/아이콘)
3. **플레이 링크용**: 빌드시 PNG를 **data URI로 인라인**(외부 파일 CSP 차단 회피)
> 위 3번까지 되어야 배포 링크에서 이미지가 보인다. (이 문서는 "무엇을 어떤 규격으로 만들지"만 정의)
