# 🤖 Codex 작업 명령문 모음 — 키즈짱 시장놀이

> GitHub 연동된 Codex에게 그대로 붙여넣을 명령문들. 배치별로 하나씩 순서대로 실행.
> (이 문서는 저장소에 보관해서, 대화가 길어져도 명령문이 유실되지 않게 함.)

## 공통 규칙 (모든 배치 공통 — 각 명령문에도 반복 포함)
- 저장소: `MoraDoraR1/Playing-market`, 베이스 브랜치: `claude/gracious-keller-3wsvdl`
- 작업 전 **`AGENTS.md`**, **`docs/VISUAL_GUIDE.md`**, **`docs/ASSET_CHECKLIST.md`** 를 반드시 읽을 것.
- 아트는 **고품질 PNG(투명 배경)** 만. SVG 최종 아트 금지.
- 새 브랜치 `codex/asset-<카테고리>` → 커밋 `art(<category>): ...` → **베이스 브랜치로 PR**.
- 표시 연결(런타임 와이어링/데이터URI 임베드)은 **범위 밖** — 이미지 생성 + 체크리스트 갱신까지만.

---

## 🔴 배치 A-REDO — 캐릭터 정면/뒷면 걷기 프레임 재생성 (긴급, 최우선)

```
저장소 MoraDoraR1/Playing-market, 베이스 브랜치 claude/gracious-keller-3wsvdl 에서 작업해줘.

먼저 AGENTS.md, docs/VISUAL_GUIDE.md, docs/ASSET_CHECKLIST.md 를 읽어줘.

문제 상황: assets/sprites/char/down_0.png, down_1.png 와 up_0.png, up_1.png 를
실제 게임에 적용해서 걸어봤더니, 두 프레임의 다리/팔 포즈가 거의 동일해서
"걷는 애니메이션"이 아니라 "그림이 옆으로 미끄러지는" 것처럼 보이는 문제가 있었어.
(참고로 char/left_0.png, left_1.png 는 다리가 뚜렷이 벌어져 교차하는 활보 자세라 문제없었음.
이 4개를 나란히 비교해보면 왜 정면/뒷면만 문제인지 바로 보일 거야.)

요청: docs/VISUAL_GUIDE.md §5 "⚠️ 걷기 2프레임" 섹션에 이번에 추가한
프레임별 포즈 지정을 그대로 따라서 아래 4장을 다시 생성해줘 (기존 파일 덮어쓰기):
- assets/sprites/char/down_0.png : 왼발 크게 앞으로 내딛어 발바닥 보임, 오른발 뒤꿈치 들림,
  오른팔 앞으로 크게 스윙, 왼팔 뒤로. 몸통 아주 살짝 오른쪽 회전.
- assets/sprites/char/down_1.png : down_0의 정반대 포즈 — 오른발 앞, 왼발 뒤,
  왼팔 앞, 오른팔 뒤. 몸통 살짝 왼쪽 회전. (down_0을 세로축 기준 좌우반전한 것과
  거의 같은 실루엣이 되어야 함)
- assets/sprites/char/up_0.png : 뒤통수+가방 기준, 왼발 앞 스텝, 오른팔 앞 스윙.
- assets/sprites/char/up_1.png : up_0의 정반대 — 오른발 앞 스텝, 왼팔 앞 스윙.

동일 인물(밀짚모자 소년, 파란 셔츠+남색 바지, 기존 4장과 같은 얼굴·비율·크기)로
512×512, 투명 배경, §2 마스터 스타일 문구 + §3 팔레트 그대로 적용.
실제 사람보다 스텝과 팔 스윙을 과장해서, 두 프레임을 나란히 놓았을 때
누가 봐도 "반대발"이라는 게 한눈에 보여야 해. 다리를 모으고 서 있는 듯한
포즈는 절대 안 돼.

완료 후 docs/ASSET_CHECKLIST.md의 해당 4개 체크박스를 다시 [x]로 표시하고,
PR 설명에 새로 생성한 4장 이미지를 첨부(또는 미리보기)해줘.
브랜치는 codex/asset-characters-redo, 커밋은 art(characters): fix down/up walk frame poses,
PR은 claude/gracious-keller-3wsvdl로.

표시 연결(코드 와이어링)은 이미 되어 있으니 건드리지 마 — 이미지 파일만 교체하면 돼.
```

---

## 🟡 배치 B — 몬스터/보스 9종

```
저장소 MoraDoraR1/Playing-market, 베이스 브랜치 claude/gracious-keller-3wsvdl 에서 작업해줘.

먼저 AGENTS.md, docs/VISUAL_GUIDE.md, docs/ASSET_CHECKLIST.md 를 읽어줘.
docs/ASSET_CHECKLIST.md의 "B. 몬스터/보스" 섹션에 있는 9종을 전부 생성해줘:
mon/slime, mon/bat, mon/boar, mon/ghost, mon/golem, mon/dragon (이상 일반),
mon/kingslime, mon/kraken, mon/darklord (이상 보스 — 더 크고 위엄있게).

각각 512×512, 투명 배경, docs/VISUAL_GUIDE.md §2 마스터 스타일 문구 +
§3 팔레트를 프롬프트에 그대로 붙여서 통일감 있게. §6 몬스터 규격(귀엽지만
종류 구분 뚜렷, 보스는 더 크고 위엄있게, 동일 광원·바닥 그림자) 준수.
9종을 나란히 놓았을 때 한 세트처럼 보여야 해 — 스타일/채도/그림자가
제각각이면 안 됨.

완료 후 docs/ASSET_CHECKLIST.md의 B 섹션 체크박스 9개를 [x]로 갱신.
브랜치 codex/asset-monsters, 커밋 art(monsters): add 9 monster/boss sprites,
PR은 claude/gracious-keller-3wsvdl로. 표시 연결(코드 와이어링)은 범위 밖 —
이미지 생성 + 체크리스트 갱신까지만 해줘.
```

---

## 🟡 배치 C — 자원/전리품/가공품 (장소별로 나눠 소배치 권장)

```
저장소 MoraDoraR1/Playing-market, 베이스 브랜치 claude/gracious-keller-3wsvdl 에서 작업해줘.

먼저 AGENTS.md, docs/VISUAL_GUIDE.md, docs/ASSET_CHECKLIST.md 를 읽어줘.
docs/ASSET_CHECKLIST.md의 "C. 자원/전리품/가공품" 섹션 항목을 생성해줘
(한 번에 너무 많으면 숲→바다→강→광산→들판→쓰레기장→해적선→하늘나라→가공→전리품
순서로 나눠서 여러 PR로 진행해도 됨).

각각 512×512, 투명 배경, §2 마스터 스타일 문구 + §3 팔레트 고정.
§7 아이템 규격(단일 오브젝트, 정면-살짝 부감, 작은 크기에서도 식별되게
심플하고 굵게) 준수. 같은 장소 아이템끼리는 물론, 전체 아이템 세트가
나란히 놓였을 때 통일감 있어야 함.

완료한 항목만큼 docs/ASSET_CHECKLIST.md의 C 섹션 체크박스를 [x]로 갱신
(부분 완료 PR이면 완료한 항목만 체크).
브랜치 codex/asset-items(-<장소>), 커밋 art(items): add <장소> item sprites,
PR은 claude/gracious-keller-3wsvdl로. 표시 연결(코드 와이어링)은 범위 밖.
```

---

## 🟡 배치 D — 월드 오브젝트/건물

```
저장소 MoraDoraR1/Playing-market, 베이스 브랜치 claude/gracious-keller-3wsvdl 에서 작업해줘.

먼저 AGENTS.md, docs/VISUAL_GUIDE.md, docs/ASSET_CHECKLIST.md 를 읽어줘.
docs/ASSET_CHECKLIST.md의 "D. 월드 오브젝트/건물" 섹션 전체를 생성해줘:
obj/tree, obj/fishspot, obj/ore, obj/wheat, obj/trash, obj/pirate, obj/cave,
obj/cloud, obj/b_shop, obj/b_home, obj/b_donate, obj/b_journal, obj/sign
(obj/portal은 선택, 시간 되면).

각각 512×512, 투명 배경, §2 마스터 스타일 문구 + §3 팔레트 고정.
§6 규격 준수 — 특히 오브젝트는 멀리서 봐도 "무엇을 하는 곳"인지 즉시
파악되게(나무=채집, 낚시터=물+찌, 광맥=반짝이는 돌벽 등), 건물은 작은
단일 건물에 상징 요소(차양/하트/책 좌판 등)를 명확히. 전체가 동일한
정면-부감 각도·광원·바닥 그림자로 통일.

완료 후 docs/ASSET_CHECKLIST.md의 D 섹션 체크박스를 [x]로 갱신.
브랜치 codex/asset-objects, 커밋 art(objects): add world object/building sprites,
PR은 claude/gracious-keller-3wsvdl로. 표시 연결(코드 와이어링)은 범위 밖.
```

---

## 🟡 배치 E — UI 아이콘

```
저장소 MoraDoraR1/Playing-market, 베이스 브랜치 claude/gracious-keller-3wsvdl 에서 작업해줘.

먼저 AGENTS.md, docs/VISUAL_GUIDE.md, docs/ASSET_CHECKLIST.md 를 읽어줘.
docs/ASSET_CHECKLIST.md의 "E. UI 아이콘" 섹션 전체를 생성해줘:
ui/hud_rank, ui/hud_star, ui/hud_hp, ui/hud_fat, ui/hud_deed (HUD),
ui/bag, ui/travel, ui/manual, ui/gear (액션바), ui/close (기타)
(ui/dpad는 선택).

각각 256×256, 투명 배경, §2 마스터 스타일 문구 + §3 팔레트 고정.
§7 UI 아이콘 규격 준수 — 동일한 선 두께·모서리 라운드·채도로 픽토그램에
가깝게 단순화, 10개를 나란히 놓았을 때 하나의 아이콘 세트처럼 보여야 함
(개별 아이콘마다 스타일이 달라 보이면 안 됨).

완료 후 docs/ASSET_CHECKLIST.md의 E 섹션 체크박스를 [x]로 갱신.
브랜치 codex/asset-ui, 커밋 art(ui): add HUD/action bar icon set,
PR은 claude/gracious-keller-3wsvdl로. 표시 연결(코드 와이어링)은 범위 밖.
```
