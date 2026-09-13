// 별머니 표기: 숫자 → "1,234별" / 큰 금액은 "8,800만별", "12억 500만별"처럼 만·억 단위로 (단일 통화)
export function won(n) {
  n = Math.round(n);
  if (n < 10000) return n.toLocaleString("ko-KR") + "별";
  const eok = Math.floor(n / 100000000);
  const man = Math.floor((n % 100000000) / 10000);
  const rest = n % 10000;
  let s = "";
  if (eok > 0) s += `${eok.toLocaleString("ko-KR")}억`;
  if (man > 0) s += `${eok > 0 ? " " : ""}${man.toLocaleString("ko-KR")}만`;
  if (eok === 0 && rest > 0) s += `${man > 0 ? " " : ""}${rest.toLocaleString("ko-KR")}`;
  return s + "별";
}
