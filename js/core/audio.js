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

// ---------- 배경음악 (BGM) — Web Audio로 생성하는 잔잔한 루프 ----------
let bgmTimer = null;
let bgmStep = 0;
// 펜타토닉 느낌의 잔잔한 멜로디 + 낮은 베이스
const BGM_MELODY = [523, 587, 659, 784, 659, 587, 523, 440];
const BGM_BASS = [131, 131, 165, 165, 196, 196, 131, 131];

function bgmNote(freq, dur, vol, type) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    o.connect(g); g.connect(AC.destination);
    g.gain.setValueAtTime(0.0001, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(vol, AC.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
    o.start(); o.stop(AC.currentTime + dur);
  } catch (e) { /* 무시 */ }
}

export function isBgmOn() { return !!bgmTimer; }

export function startBgm() {
  if (bgmTimer) return;
  bgmStep = 0;
  bgmTimer = setInterval(() => {
    const m = BGM_MELODY[bgmStep % BGM_MELODY.length];
    const b = BGM_BASS[bgmStep % BGM_BASS.length];
    bgmNote(m, 0.42, 0.06, "triangle");     // 멜로디 (작게)
    bgmNote(b, 0.5, 0.05, "sine");          // 베이스
    bgmStep++;
  }, 500);
}

export function stopBgm() {
  if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
}

export function toggleBgm() {
  if (bgmTimer) { stopBgm(); return false; }
  startBgm(); return true;
}
