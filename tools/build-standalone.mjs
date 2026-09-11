// 모듈형 게임을 단일 HTML 파일로 번들링 (더블클릭/공유용)
// 사용: 저장소 루트에서  `node tools/build-standalone.mjs`
//  → dist/kidszzang-standalone.html 생성
import fs from "fs";
const ROOT = process.cwd();
const R = (p) => fs.readFileSync(ROOT + "/" + p, "utf8");

// 최상위 const 초기화 의존성 안전 순서
const ORDER = [
  "js/core/format.js", "js/core/rng.js",
  "js/data/ranks.js", "js/data/places.js", "js/data/monsters.js",
  "js/data/recipes.js", "js/data/items.js", "js/data/assets.js", "js/data/meta.js",
  "js/core/audio.js", "js/core/state.js", "js/core/save.js",
  "js/ui/view.js", "js/ui/minigame.js",
  "js/systems/gather.js", "js/systems/battle.js", "js/systems/economy.js",
  "js/systems/progress.js", "js/systems/rest.js", "js/systems/home.js", "js/systems/meta.js",
  "js/ui/render.js", "js/ui/tutorial.js", "js/main.js",
];

function strip(src, file) {
  return src.split("\n").map((line) => {
    if (/^\s*import\s.+from\s.+;\s*$/.test(line)) return null;          // import 제거
    if (file === "js/main.js" && /function \$\(id\)\s*\{\s*return document\.getElementById/.test(line)) return null; // 중복 $ 제거
    return line.replace(/^(\s*)export\s+/, "$1");                        // export 키워드 제거
  }).filter((l) => l !== null).join("\n");
}

const bundle = ORDER.map((f) => `\n// ===== ${f} =====\n` + strip(R(f), f)).join("\n");
const css = R("css/style.css");

let html = R("index.html");
let body = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"));
body = body.replace(/<script type="module"[^>]*><\/script>/g, "").trim();

const out =
`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<title>키즈짱 시장놀이</title>
<style>
${css}
</style>
</head>
<body>
${body}
<script>
(function(){
"use strict";
${bundle}
})();
</script>
</body>
</html>
`;

fs.mkdirSync(ROOT + "/dist", { recursive: true });
fs.writeFileSync(ROOT + "/dist/kidszzang-standalone.html", out);
console.log("dist/kidszzang-standalone.html 생성 완료 ·", out.length, "bytes");
