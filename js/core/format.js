// 별머니 표기: 숫자 → "1,234별" (단일 통화)
export const won = (n) => Math.round(n).toLocaleString("ko-KR") + "별";
