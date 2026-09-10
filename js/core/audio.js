// Web Audio 기반 간단 효과음. 음소거 토글 지원.
let AC = null;
let muted = false;

export function setMuted(v) { muted = !!v; }
export function isMuted() { return muted; }
export function toggleMuted() { muted = !muted; return muted; }

function beep(freq, dur, type) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    o.connect(g); g.connect(AC.destination);
    g.gain.setValueAtTime(0.0001, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.22, AC.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
    o.start(); o.stop(AC.currentTime + dur);
  } catch (e) { /* 오디오 미지원 무시 */ }
}

export const sfx = {
  get:  () => beep(600, 0.09, "triangle"),
  rare: () => { beep(660, 0.1); setTimeout(() => beep(880, 0.12), 90); setTimeout(() => beep(1040, 0.16), 190); },
  sell: () => { beep(520, 0.08, "square"); setTimeout(() => beep(680, 0.09, "square"), 70); },
  sleep: () => beep(300, 0.3, "sine"),
  bad:  () => beep(150, 0.25, "sawtooth"),
  up:   () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.16), i * 110)),
  hit:  () => beep(220, 0.08, "square"),
  hurt: () => beep(120, 0.18, "sawtooth"),
  heal: () => { beep(500, 0.1, "sine"); setTimeout(() => beep(760, 0.12, "sine"), 90); },
};
