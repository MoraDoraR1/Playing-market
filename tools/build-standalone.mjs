// 모듈형 게임을 단일 HTML로 번들링 (더블클릭/공유/아티팩트용)
// 사용: 저장소 루트에서  `node tools/build-standalone.mjs`
//  → dist/kidszzang-standalone.html (완전한 단일 HTML, 더블클릭 실행)
//  → dist/artifact.html          (아티팩트 발행용: doctype/head/body 없음)
import fs from "fs";
const ROOT = process.cwd();
const R = (p) => fs.readFileSync(ROOT + "/" + p, "utf8");

// 최상위 const 초기화 의존성 안전 순서 (world는 render보다 먼저)
const ORDER = [
  "js/core/format.js", "js/core/rng.js",
  "js/data/ranks.js", "js/data/places.js", "js/data/monsters.js",
  "js/data/recipes.js", "js/data/items.js", "js/data/assets.js", "js/data/meta.js",
  "js/core/audio.js", "js/core/state.js", "js/core/save.js",
  "js/ui/view.js", "js/ui/minigame.js", "js/ui/sprites.js",
  "js/systems/gather.js", "js/systems/battle.js", "js/systems/economy.js",
  "js/systems/progress.js", "js/systems/rest.js", "js/systems/home.js", "js/systems/meta.js",
  "js/ui/world.js", "js/ui/render.js", "js/ui/tutorial.js", "js/main.js",
];
const FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&display=swap" />';

function strip(src, file) {
  return src.split("\n").map((line) => {
    if (/^\s*import\s.+from\s.+;\s*$/.test(line)) return null;          // import 제거
    if (file === "js/main.js" && /function \$\(id\)\s*\{\s*return document\.getElementById/.test(line)) return null; // 중복 $ 제거
    return line.replace(/^(\s*)export\s+/, "$1");                        // export 키워드 제거
  }).filter((l) => l !== null).join("\n");
}

let bundle = ORDER.map((f) => `\n// ===== ${f} =====\n` + strip(R(f), f)).join("\n");
// `import * as world` 네임스페이스를 대체하는 shim (world.js의 export 함수들을 모음)
bundle += `\n// ===== world 네임스페이스 shim =====\nvar world = { ensureMounted, unmount, interact, goTo, enterDungeon, exitDungeon };\n`;

const css = R("css/style.css");
let html = R("index.html");
let body = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"));
body = body.replace(/<script type="module"[^>]*><\/script>/g, "").trim();

const scriptBlock = `<script>\n(function(){\n"use strict";\n${bundle}\n})();\n</script>`;

const standalone =
`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<title>키즈짱 시장놀이</title>
${FONT}
<style>
${css}
</style>
</head>
<body>
${body}
${scriptBlock}
</body>
</html>
`;

const artifact =
`<title>키즈짱 시장놀이</title>
${FONT}
<style>
${css}
</style>
${body}
${scriptBlock}
`;

fs.mkdirSync(ROOT + "/dist", { recursive: true });
fs.writeFileSync(ROOT + "/dist/kidszzang-standalone.html", standalone);
fs.writeFileSync(ROOT + "/dist/artifact.html", artifact);
console.log("dist/kidszzang-standalone.html", standalone.length, "· dist/artifact.html", artifact.length);
