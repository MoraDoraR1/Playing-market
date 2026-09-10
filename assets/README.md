# 🎨 에셋 파이프라인 가이드 (외부 AI 이미지 연동)

게임의 이모지를 **AI로 생성한 이미지**로 교체하기 위한 안내서입니다.
이미지가 없어도 게임은 **자동으로 이모지로 표시**되며, 넣은 것만 교체됩니다.

## 📁 폴더 규칙

```
assets/sprites/<종류>/<아이디>.png
```
- 종류: `heroes`(캐릭터) · `places`(배경) · `monsters`(몬스터) · `items`(자원/전리품)
- 파일형식: **PNG** (투명 배경 권장, 배경은 불투명)
- 파일명은 반드시 아래 표의 **아이디**와 일치해야 합니다.

## 🔌 교체 방법 (3단계)

1. 아래 표의 프롬프트로 이미지를 생성
2. `assets/sprites/<종류>/<아이디>.png` 위치에 저장
3. `js/data/assets.js` 의 `SPRITES_READY` 에 `"종류/아이디"` 추가
   ```js
   export const SPRITES_READY = new Set([
     "monsters/slime",
     "items/branch",
     "places/forest",
   ]);
   ```

> 팁: 통일감을 위해 **같은 화풍**(예: 둥글둥글한 플랫 카툰, 밝은 파스텔, 굵은 외곽선)으로
> 전부 생성하세요. 아래 각 프롬프트 끝에 공통 스타일 문구를 붙이면 좋습니다.
> 공통 스타일 예: *"flat cartoon sticker, thick outline, soft pastel colors, centered, transparent background"*

---

## 🧑‍🌾 heroes (캐릭터) — 권장 256×256, 투명 배경

| 아이디 | 이모지 | 설명 | 프롬프트(영문 예시) |
|---|---|---|---|
| forest | 🧑‍🌾 | 숲 채집가 | cute kid forager with basket in a forest |
| sea | 🎣 | 바다 낚시꾼 | cute kid fishing with a rod at the seaside |
| mine | 👷 | 광부 | cute kid miner with helmet and pickaxe |
| field | 🏹 | 들판 사냥꾼 | cute kid hunter with a small bow in a field |
| heaven | 😇 | 천사 | cute kid angel with halo on clouds |
| player | 🧑‍🚀 | 전투 주인공 | cute kid adventurer ready to fight |

## 🏞️ places (배경) — 권장 1024×512, 불투명

| 아이디 | 이모지 | 설명 | 프롬프트(영문 예시) |
|---|---|---|---|
| forest | 🌲 | 숲 | bright cartoon forest background |
| sea | 🌊 | 바닷가 | sunny cartoon seaside beach background |
| mine | ⛏️ | 광산 | cartoon mine cave interior background |
| field | 🌾 | 들판 | golden cartoon grassland field background |
| heaven | ☁️ | 하늘나라 | dreamy pastel sky with clouds background |
| battle | ⚔️ | 던전 | dark cartoon dungeon background |

## 👾 monsters (몬스터) — 권장 256×256, 투명 배경

| 아이디 | 이모지 | 이름 | 프롬프트(영문 예시) |
|---|---|---|---|
| slime | 🟢 | 슬라임 | cute green slime monster |
| bat | 🦇 | 박쥐 | cute purple bat monster |
| boar | 🐗 | 멧돼지 | cute wild boar monster |
| ghost | 👻 | 유령 | cute friendly ghost monster |
| golem | 🗿 | 바위골렘 | cute rock golem monster |
| dragon | 🐉 | 드래곤 | cute baby dragon monster |

## 🎒 items (자원/전리품) — 권장 128×128, 투명 배경

| 아이디 | 이모지 | 이름 | 출처 |
|---|---|---|---|
| branch | 🪵 | 나뭇가지 | 숲 |
| mushroom | 🍄 | 버섯 | 숲 |
| herb | 🌿 | 약초 | 숲 |
| ginseng | 🫚 | 산삼(레어) | 숲 |
| anchovy | 🐟 | 멸치 | 바다 |
| shell | 🐚 | 조개 | 바다 |
| squid | 🦑 | 오징어 | 바다 |
| pearl | 🦪 | 진주(레어) | 바다 |
| stone | 🪨 | 돌멩이 | 광산 |
| copper | 🟤 | 구리 | 광산 |
| iron | ⚙️ | 철광석 | 광산 |
| gem | 💎 | 보석(레어) | 광산 |
| berry | 🍓 | 산딸기 | 들판 |
| grain | 🌾 | 곡식 | 들판 |
| meat | 🍖 | 고기 | 들판 |
| goldegg | 🥚 | 황금알(레어) | 들판 |
| stardust | ✨ | 별가루 | 하늘나라 |
| cloud | 🌈 | 무지개조각 | 하늘나라 |
| wing | 🪽 | 천사의날개(레어) | 하늘나라 |
| jelly | 🫧 | 슬라임젤리 | 몬스터 |
| batwing | 🪶 | 박쥐날개 | 몬스터 |
| tusk | 🦷 | 멧돼지엄니 | 몬스터 |
| soul | 🔮 | 영혼구슬 | 몬스터 |
| core | 🟥 | 골렘핵 | 몬스터 |
| scale | 🐲 | 용비늘 | 몬스터 |

---

## ✅ 빠른 검증

이미지를 넣고 `SPRITES_READY`에 추가한 뒤 브라우저에서 새로고침하면 바로 반영됩니다.
이미지를 빼면(또는 목록에서 지우면) 다시 이모지로 돌아갑니다.
