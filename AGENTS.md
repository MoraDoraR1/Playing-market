# AGENTS.md — 키즈짱 시장놀이 (에이전트 작업 지침)

> 이 파일은 GitHub 연동 코딩 에이전트(예: Codex)가 자동으로 읽는 작업 지침서입니다.
> **목표: 게임에 들어가는 모든 UI와 이미지(캐릭터·자원·몬스터·건물·아이콘·이펙트)를
> 통일감 있게 SVG로 생성/개선하는 것.** 게임 로직은 건드리지 말고, 아트/스타일만 다룹니다.

## 0. 먼저 읽을 것 (필수)
1. **`docs/VISUAL_GUIDE.md`** — 팔레트·비율·사이즈·캐릭터 리그·UI 규격 (통일성의 기준)
2. **`docs/ASSET_CHECKLIST.md`** — 생성할 에셋 전체 목록 + 규격 + 체크박스
작업 전 위 두 문서를 반드시 읽고, 규칙을 벗어나지 마세요.

## 1. 프로젝트 개요
- 순수 Vanilla HTML/CSS/JS (프레임워크·빌드도구 없음), ES 모듈 구조.
- 게임 월드는 `<canvas>`에 그리며, **스프라이트는 SVG를 Image로 캐싱해 drawImage** 합니다.
- 구조: `js/data`(데이터) · `js/core`(상태·저장·오디오) · `js/systems`(로직) · `js/ui`(렌더·월드·스프라이트).

## 2. ⚠️ 아트 통합 규칙 (가장 중요 — 반드시 준수)
**모든 런타임 아트는 "코드 안의 SVG"여야 합니다.** 이유: 배포되는 플레이 링크(아티팩트)는
CSP로 외부 이미지 파일 로드를 차단하므로, `<img src="assets/xxx.png">` 같은 외부 파일은 링크에서 안 보입니다.

- **월드/캐릭터/오브젝트 스프라이트** → `js/ui/sprites.js` 의 `SVGS` 객체에 **SVG 문자열**로 추가/수정.
  (기존 `char_down_0`, `tree`, `b_shop` 등과 같은 형식. viewBox `0 0 64 64`.)
- **HUD·버튼·아이콘 등 UI** → `index.html`의 인라인 `<svg>` 또는 `css/style.css`.
- **외부 PNG 파이프라인**(`assets/sprites/<kind>/<id>.png` + `js/data/assets.js`의 `SPRITES_READY`)은
  GitHub Pages 전용 옵션일 뿐, **플레이 링크에선 표시되지 않으므로 이번 작업에서는 사용하지 마세요.**
- 벡터로만 작업(래스터/base64 금지). 파일 용량을 작게 유지.

## 3. 실행·빌드·검증
```bash
# 로컬 실행 (ES 모듈은 서버 필요)
python3 -m http.server 8000        # → http://localhost:8000

# 단일 파일/아티팩트 재빌드 (sprites.js/CSS 수정 후 필수)
node tools/build-standalone.mjs    # → dist/kidszzang-standalone.html, dist/artifact.html

# 문법 검사
for f in $(find js -name '*.js'); do node --check "$f"; done

# 번들 유효성(에러 없이 파싱되는지)
node -e "const fs=require('fs');new Function(fs.readFileSync('dist/kidszzang-standalone.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1]);console.log('bundle OK')"
```
- 시각 확인: `dist/kidszzang-standalone.html`를 브라우저로 열어(또는 로컬서버) 실제 렌더를 확인.
- **PR 전 체크리스트**: ① 문법검사 통과 ② 번들 OK ③ 콘솔 에러 0 ④ 비주얼 가이드 규격 준수 ⑤ 관련 체크박스 갱신.

## 4. 작업 방식 (GitHub)
- 한 번에 **한 카테고리씩**(예: "몬스터 6종 SVG", "HUD 아이콘 세트") 작은 PR로.
- 브랜치: `codex/asset-<카테고리>` 형태.
- 커밋 메시지: `art(<category>): <요약>` (예: `art(monsters): add SVG sprites for 6 base monsters`).
- PR 설명에 **Before/After 스크린샷**과 `docs/ASSET_CHECKLIST.md`에서 체크한 항목을 적으세요.
- `docs/ASSET_CHECKLIST.md`의 해당 `- [ ]`를 `- [x]`로 갱신.

## 5. 하지 말 것 (Do NOT)
- 게임 로직(`js/systems`, `js/core`, `js/data/*.js`의 수치) 변경 금지 — 아트/스타일만.
- 외부 이미지 파일(png/jpg)로 런타임 아트 대체 금지(§2).
- 팔레트·비율·코너/그림자 규칙(비주얼 가이드) 이탈 금지.
- 스프라이트 viewBox·크기·피벗(발끝 기준) 규격 변경 금지 — 게임이 그 규격으로 배치함.
- 커밋 메시지/코드/PR에 특정 AI 모델명 기입 금지.

## 6. 통일성 자가 점검 (매 PR)
- [ ] 같은 광원(위→아래), 같은 발밑 그림자(ellipse), 같은 코너 라운드 감성
- [ ] 비주얼 가이드 팔레트 색만 사용
- [ ] 캐릭터/오브젝트 비율·크기 일관
- [ ] 새 스프라이트가 기존 것들과 나란히 놨을 때 이질감 없음
