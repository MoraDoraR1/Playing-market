# AGENTS.md — 키즈짱 시장놀이 (에이전트 작업 지침)

> 이 파일은 GitHub 연동 코딩 에이전트(예: Codex)가 자동으로 읽는 작업 지침서입니다.
> **목표: 게임에 들어가는 모든 UI와 이미지(캐릭터·자원·몬스터·건물·아이콘·이펙트)를
> 통일감 있게 고품질 PNG(이미지 생성 AI)로 만드는 것.** (SVG 아님 — §2 참고) 게임 로직은 건드리지 말고, 아트/스타일만 다룹니다.

## 0. 먼저 읽을 것 (필수)
1. **`docs/VISUAL_GUIDE.md`** — 팔레트·비율·사이즈·캐릭터 리그·UI 규격 (통일성의 기준)
2. **`docs/ASSET_CHECKLIST.md`** — 생성할 에셋 전체 목록 + 규격 + 체크박스
작업 전 위 두 문서를 반드시 읽고, 규칙을 벗어나지 마세요.

## 1. 프로젝트 개요
- 순수 Vanilla HTML/CSS/JS (프레임워크·빌드도구 없음), ES 모듈 구조.
- 게임 월드는 `<canvas>`에 그리며, **스프라이트는 PNG(준비되면)를 Image로 캐싱해 drawImage**, 아직 없는 것만 임시 SVG로 표시합니다.
- 구조: `js/data`(데이터) · `js/core`(상태·저장·오디오) · `js/systems`(로직) · `js/ui`(렌더·월드·스프라이트).

## 2. ⚠️ 아트 규격 (가장 중요 — 반드시 준수)
**모든 아트는 이미지 생성 AI로 만든 고품질 PNG(투명 배경)** 로 제작합니다. (코드용 SVG는 저품질이라 사용 X — 현재 코드의 SVG는 임시 플레이스홀더이며 PNG로 대체 대상.)
- 규격(스타일·팔레트·해상도·투명배경·프롬프트)은 **`docs/VISUAL_GUIDE.md`**, 목록/경로/아이디는 **`docs/ASSET_CHECKLIST.md`** 를 그대로 따르세요.
- 파일 경로: `assets/sprites/<종류>/<id>.png` (종류: char/mon/item/obj/ui/bg). 해상도·투명은 체크리스트/가이드 준수.
- **통일성**: 모든 프롬프트에 가이드 §2 "마스터 스타일" 문구 + 고정 팔레트를 붙여 한 세트처럼.
- ⚠️ **표시 연결(런타임/빌드 와이어링)은 아직 미구현이며, 지금은 규격/이미지 생성까지가 범위입니다.**
  준비되면 별도 과제로: ① `js/data/assets.js`의 `SPRITES_READY`에 `"<종류>/<id>"` 등록 ② 렌더가 PNG를 쓰도록 연결
  ③ **플레이 링크(아티팩트)는 외부 PNG를 CSP로 차단**하므로 **빌드시 data URI로 인라인**해야 링크에서 표시됨.

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
- `docs/VISUAL_GUIDE.md` 규격(마스터 스타일·팔레트·해상도·투명배경·비율) 이탈 금지.
- 배경 불투명 PNG(캐릭터/아이템/오브젝트/아이콘), 텍스트·워터마크·테두리 포함 금지.
- 저품질 SVG로 최종 아트 제작 금지(플레이스홀더 외).
- 커밋 메시지/코드/PR에 특정 AI 모델명 기입 금지.

## 6. 통일성 자가 점검 (매 PR)
- [ ] 같은 광원(위→아래), 같은 발밑 그림자(ellipse), 같은 코너 라운드 감성
- [ ] 비주얼 가이드 팔레트 색만 사용
- [ ] 캐릭터/오브젝트 비율·크기 일관
- [ ] 새 스프라이트가 기존 것들과 나란히 놨을 때 이질감 없음
