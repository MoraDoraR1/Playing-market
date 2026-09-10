// 숫자 → "1,234원" 표기
export const won = (n) => Math.round(n).toLocaleString("ko-KR") + "원";
