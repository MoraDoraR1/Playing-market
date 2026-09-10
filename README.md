# 🏘️ 키즈짱 시장놀이

추억의 **다음 키즈짱 「시장놀이」(원제 조이월드, 2007~2015)** 를 오마주한 웹 게임입니다.
자원을 모아 팔고, 몬스터와 싸우고, 계급을 올리고, 선행을 쌓는 **생활·경제 시뮬레이션**이에요.

> 📋 전체 개발 계획은 [`docs/GAME_PLAN.md`](docs/GAME_PLAN.md), 밸런스 수치는 [`docs/BALANCE.md`](docs/BALANCE.md) 참고.

## 🎮 핵심 게임 루프

1. **채집·낚시·채광·사냥** — 숲🌲 / 바다🌊 / 광산⛏️ / 들판🌾 에서 자원 수집
2. **전투** — 던전⚔️에서 몬스터와 싸워 전리품·게임머니·내공 획득
3. **판매** — 상점🏪에서 자원을 팔고 도구·무기·물약 구매
4. **성장** — 내공점수로 계급(평민→생명의 왕) 승급
5. **선행** — 기부소❤️에서 기부 → 선행점수 50점이면 하늘나라☁️ 개방
6. **휴식** — 집🏠에서 잠자기로 피로도·체력 회복 (피로 100%면 활동 불가)

## 🗂️ 프로젝트 구조 (모듈 분리)

```
index.html          진입점 (CSS/JS 모듈 로드)
css/style.css       스타일
js/
  main.js           엔트리: 저장 불러오기 → 렌더 → 튜토리얼
  data/             데이터 테이블 (places, monsters, ranks, assets)
  core/             상태·저장·오디오·유틸 (state, save, audio, rng, format)
  systems/          게임 로직 (gather, battle, economy, progress, rest)
  ui/               렌더·이펙트·튜토리얼 (render, view, tutorial)
assets/             이미지 에셋 (AI 생성 이미지 투입 지점, assets/README.md 참고)
docs/               기획·밸런스 문서
```

## ▶️ 실행 방법

ES 모듈을 쓰기 때문에 **파일 더블클릭(file://)이 아니라 웹서버**로 열어야 해요.

```bash
# 로컬에서
python3 -m http.server 8000
# → 브라우저에서 http://localhost:8000 접속
```

**배포(GitHub Pages):** 저장소 Settings → Pages → 브랜치 선택 → `/ (root)` 게시.
(`.nojekyll` 파일이 있어 `js/`·`css/`·`assets/` 폴더가 그대로 서빙됩니다.)

## 🎨 이미지 교체 (AI 생성 연동)

이모지를 AI로 만든 이미지로 바꿀 수 있어요. 없으면 자동으로 이모지로 표시됩니다.
방법과 필요한 전체 목록·프롬프트는 **[`assets/README.md`](assets/README.md)** 참고.

## 💾 저장

진행은 브라우저 `localStorage`에 **자동 저장**돼요 (3초마다 + 이탈 시).
하단 **🔄 처음부터** 버튼으로 초기화, **🔊/🔇** 버튼으로 소리 토글.

## 🛠️ 기술

- 순수 Vanilla HTML/CSS/JS (프레임워크·빌드 없음), ES 모듈 구조
- Web Audio API 효과음, localStorage 저장, 모바일 반응형
