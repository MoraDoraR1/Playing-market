// 난수 유틸
export const rnd = (n) => Math.floor(Math.random() * n);

// 가중치 기반 무작위 선택. list 요소는 {w:가중치} 를 가짐
export function weighted(list) {
  const total = list.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of list) {
    if ((r -= x.w) < 0) return x;
  }
  return list[0];
}
