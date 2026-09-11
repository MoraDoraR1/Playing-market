// SVG 스프라이트: 월드의 캐릭터·자원·건물을 벡터 이미지로 그려 폴리싱.
// 각 SVG를 Image로 캐싱해 캔버스에 drawImage 한다(로드 전이면 건너뜀 → 다음 프레임에 표시).

const V = (inner) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const shadow = `<ellipse cx="32" cy="58" rx="15" ry="4" fill="rgba(0,0,0,.16)"/>`;

const SVGS = {
  char: V(`${shadow}
    <rect x="23" y="33" width="18" height="19" rx="8" fill="#4a90d9"/>
    <rect x="23" y="33" width="18" height="9" rx="6" fill="#5aa9e6"/>
    <circle cx="32" cy="23" r="12" fill="#ffdcae"/>
    <path d="M20 22 q12 -14 24 0 q-12 -6 -24 0Z" fill="#c98a4a"/>
    <ellipse cx="32" cy="15" rx="13" ry="6" fill="#e0a95e"/>
    <circle cx="27.5" cy="24" r="1.7" fill="#3a2b1f"/><circle cx="36.5" cy="24" r="1.7" fill="#3a2b1f"/>
    <path d="M29 29 q3 2.5 6 0" stroke="#3a2b1f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="25" cy="28" r="2" fill="#ff9db0" opacity=".7"/><circle cx="39" cy="28" r="2" fill="#ff9db0" opacity=".7"/>`),

  tree: V(`${shadow}
    <rect x="29" y="34" width="6" height="18" rx="3" fill="#8a5a34"/>
    <circle cx="32" cy="26" r="16" fill="#4fbf6a"/>
    <circle cx="22" cy="32" r="11" fill="#5ccd78"/><circle cx="42" cy="32" r="11" fill="#43b25f"/>
    <circle cx="32" cy="22" r="12" fill="#63d885"/>
    <circle cx="27" cy="20" r="2.5" fill="#bff0c9" opacity=".8"/>`),

  fishspot: V(`${shadow}
    <ellipse cx="32" cy="40" rx="24" ry="14" fill="#57b7ea"/>
    <ellipse cx="32" cy="37" rx="24" ry="12" fill="#7cccf2"/>
    <path d="M20 36 h9 l-4 4Z" fill="#ff8a4c"/><circle cx="30" cy="35" r="4.5" fill="#ff9f5c"/><circle cx="31.5" cy="34" r="1" fill="#3a2b1f"/>
    <path d="M14 30 q4 -3 8 0" stroke="#eaf6ff" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M40 44 q4 -3 8 0" stroke="#eaf6ff" stroke-width="2" fill="none" stroke-linecap="round"/>`),

  ore: V(`${shadow}
    <path d="M14 46 L20 26 L32 20 L46 26 L50 46 Z" fill="#8b939c"/>
    <path d="M20 26 L32 20 L32 46 L20 46 Z" fill="#9aa2ab"/>
    <path d="M32 20 L46 26 L50 46 L32 46 Z" fill="#7c848d"/>
    <path d="M30 30 l5 -4 5 4 -3 7 -4 0 Z" fill="#59d3e0"/>
    <path d="M30 30 l5 -4 0 11 -2 0 Z" fill="#8ff0f8"/>`),

  wheat: V(`${shadow}
    <g stroke="#c98f2e" stroke-width="2" fill="none">
      <path d="M24 52 q-2 -20 -2 -28"/><path d="M32 52 q0 -22 0 -30"/><path d="M40 52 q2 -20 2 -28"/></g>
    <g fill="#f2c14e"><ellipse cx="22" cy="20" rx="4" ry="8"/><ellipse cx="32" cy="17" rx="4.5" ry="9"/><ellipse cx="42" cy="20" rx="4" ry="8"/></g>
    <g stroke="#e0a92e" stroke-width="1" opacity=".7"><path d="M22 16 v8"/><path d="M32 12 v10"/><path d="M42 16 v8"/></g>`),

  trash: V(`${shadow}
    <rect x="18" y="26" width="28" height="26" rx="4" fill="#7f8a94"/>
    <rect x="18" y="26" width="28" height="7" rx="3" fill="#9aa4ad"/>
    <rect x="15" y="20" width="34" height="6" rx="3" fill="#5f6a73"/>
    <rect x="29" y="15" width="6" height="6" rx="2" fill="#5f6a73"/>
    <circle cx="40" cy="18" r="5" fill="#f2c14e"/><path d="M38 18 h4 M40 16 v4" stroke="#8a5a1a" stroke-width="1.4"/>
    <path d="M24 33 v14 M32 33 v14 M40 33 v14" stroke="#68727b" stroke-width="1.6"/>`),

  pirate: V(`${shadow}
    <path d="M12 44 h40 l-6 8 h-28 Z" fill="#8a5a34"/>
    <path d="M12 44 h40 l-2 3 h-36 Z" fill="#a06a3e"/>
    <rect x="31" y="14" width="3" height="30" fill="#6b4a2a"/>
    <path d="M34 16 q14 4 0 16 Z" fill="#f4f1ea"/>
    <path d="M34 16 q14 4 0 16" fill="none" stroke="#d9d4c6" stroke-width="1"/>
    <rect x="20" y="10" width="12" height="8" rx="1" fill="#2e2620"/>
    <circle cx="26" cy="14" r="2" fill="#fff"/><path d="M23 12 l6 4 M29 12 l-6 4" stroke="#fff" stroke-width="1"/>`),

  cave: V(`${shadow}
    <path d="M10 52 Q10 22 32 20 Q54 22 54 52 Z" fill="#6b7480"/>
    <path d="M14 52 Q14 26 32 24 Q50 26 50 52 Z" fill="#4a525c"/>
    <path d="M22 52 Q22 34 32 33 Q42 34 42 52 Z" fill="#1c2126"/>
    <circle cx="20" cy="30" r="2.5" fill="#8b939c"/><circle cx="45" cy="32" r="2" fill="#8b939c"/>`),

  cloud: V(`
    <ellipse cx="32" cy="14" rx="9" ry="3" fill="none" stroke="#ffe066" stroke-width="2.5"/>
    <circle cx="32" cy="30" r="11" fill="#ffdcae"/>
    <circle cx="28" cy="30" r="1.6" fill="#3a2b1f"/><circle cx="36" cy="30" r="1.6" fill="#3a2b1f"/>
    <path d="M29 34 q3 2 6 0" stroke="#3a2b1f" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <g fill="#ffffff"><circle cx="22" cy="48" r="10"/><circle cx="34" cy="46" r="12"/><circle cx="46" cy="49" r="9"/><rect x="20" y="46" width="28" height="10" rx="5"/></g>`),

  b_shop: V(`${shadow}
    <rect x="14" y="30" width="36" height="22" rx="2" fill="#f4e4c1"/>
    <rect x="16" y="36" width="14" height="16" rx="1" fill="#8fd0f0"/>
    <rect x="34" y="36" width="14" height="16" rx="1" fill="#7b4a2a"/>
    <path d="M12 30 h40 l-4 -10 h-32 Z" fill="#e0503a"/>
    <g fill="#fff"><path d="M16 30 l3 -8 h5 l-3 8Z"/><path d="M30 30 l3 -8 h5 l-3 8Z"/><path d="M44 30 l3 -8 h-5 l-3 8"/></g>
    <rect x="30" y="14" width="4" height="8" fill="#8a5a34"/><circle cx="32" cy="12" r="4" fill="#f2c14e"/>`),

  b_home: V(`${shadow}
    <rect x="16" y="30" width="32" height="22" rx="2" fill="#ffe1b0"/>
    <path d="M12 30 L32 14 L52 30 Z" fill="#c76b4a"/>
    <path d="M12 30 L32 14 L32 30 Z" fill="#d47a58"/>
    <rect x="28" y="38" width="8" height="14" rx="1" fill="#8a5a34"/>
    <rect x="19" y="35" width="7" height="7" rx="1" fill="#8fd0f0"/><rect x="38" y="35" width="7" height="7" rx="1" fill="#8fd0f0"/>
    <rect x="40" y="16" width="4" height="8" fill="#a06a3e"/><path d="M38 16 q6 -4 8 2" fill="#cfd8df"/>`),

  b_donate: V(`${shadow}
    <rect x="16" y="30" width="32" height="22" rx="2" fill="#ffd3dc"/>
    <path d="M12 30 L32 14 L52 30 Z" fill="#e2607a"/>
    <rect x="28" y="40" width="8" height="12" rx="1" fill="#b34a60"/>
    <path d="M32 40 c-6 -8 -14 0 0 8 c14 -8 6 -16 0 -8Z" fill="#ff6b8a"/>
    <rect x="20" y="35" width="6" height="6" rx="1" fill="#fff"/><rect x="38" y="35" width="6" height="6" rx="1" fill="#fff"/>`),

  b_journal: V(`${shadow}
    <rect x="14" y="44" width="36" height="8" rx="2" fill="#8a5a34"/>
    <path d="M32 20 q-14 -4 -16 4 v22 q14 -6 16 -2Z" fill="#f4f1ea"/>
    <path d="M32 20 q14 -4 16 4 v22 q-14 -6 -16 -2Z" fill="#fbf8f0"/>
    <path d="M32 22 v24" stroke="#c9bfa8" stroke-width="1.5"/>
    <g stroke="#b7d0e8" stroke-width="1.4"><path d="M20 28 h9 M20 33 h9 M35 28 h9 M35 33 h9"/></g>
    <path d="M40 16 l3 6 -6 0Z" fill="#f2c14e"/>`),
};

const cache = {};
export function getSprite(name) {
  if (cache[name]) return cache[name];
  const img = new Image();
  img.src = "data:image/svg+xml;utf8," + encodeURIComponent(SVGS[name] || "");
  cache[name] = img;
  return img;
}
// 미리 로드
export function preloadSprites() { Object.keys(SVGS).forEach(getSprite); }
