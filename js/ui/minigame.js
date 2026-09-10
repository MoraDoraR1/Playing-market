// 타이밍 미니게임: 움직이는 막대를 가운데 목표칸에서 멈추면 성공도↑
let rafId = null;

export function playTiming(label, onDone) {
  let ov = document.getElementById("mgOv");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "mgOv";
    ov.className = "ov show";
    document.getElementById("frame").appendChild(ov);
  } else {
    ov.classList.add("show");
  }
  ov.innerHTML = `
    <div class="modal">
      <div class="em">🎯</div>
      <h2>${label}!</h2>
      <p>움직이는 막대가 <b>가운데 초록 칸</b>에 올 때 잡아요!</p>
      <div class="mgtrack"><div class="mgzone"></div><div class="mgmarker" id="mgMarker"></div></div>
      <button class="btn work" id="mgHit" style="box-shadow:0 5px 0 rgba(0,0,0,.18);width:100%">잡기! 🖐️</button>
    </div>`;

  const marker = document.getElementById("mgMarker");
  let pos = 0, dir = 1;
  const speed = 0.016 + Math.random() * 0.008;

  function frame() {
    pos += dir * speed;
    if (pos >= 1) { pos = 1; dir = -1; }
    if (pos <= 0) { pos = 0; dir = 1; }
    marker.style.left = (pos * 100) + "%";
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  function finish() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    const d = Math.abs(pos - 0.5);
    let tier;
    if (d <= 0.06) tier = { mult: 2, name: "완벽", perfect: true };
    else if (d <= 0.14) tier = { mult: 1.5, name: "좋음" };
    else if (d <= 0.24) tier = { mult: 1, name: "성공" };
    else tier = { mult: 0.4, name: "아쉬움" };
    ov.classList.remove("show");
    ov.innerHTML = "";
    onDone(tier);
  }
  document.getElementById("mgHit").onclick = finish;
}
