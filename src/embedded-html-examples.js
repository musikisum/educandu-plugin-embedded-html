export default [
  {
    key: 'metronome',
    height: 500,
    html: `<div class="metronome">
  <h2>Metronom</h2>
  <div class="display">
    <span id="bpm-display">80</span>
    <span class="unit">BPM</span>
  </div>
  <div class="pendulum">
    <div class="arm" id="arm">
      <div class="weight"></div>
    </div>
  </div>
  <input type="range" id="bpm-slider" min="40" max="208" value="80">
  <div class="labels">
    <span>Largo 40</span>
    <span>Allegro 120</span>
    <span>Presto 208</span>
  </div>
  <button id="toggle-btn" onclick="toggle()">▶ Start</button>
</div>`,
    css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: sans-serif;
  background: #f5f0e8;
  display: flex;
  justify-content: center;
  padding: 24px 16px;
}
.metronome {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 32px 40px;
  text-align: center;
  width: 320px;
}
h2 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.display {
  font-size: 3rem;
  font-weight: bold;
  color: #222;
  line-height: 1;
  margin-bottom: 4px;
}
.unit {
  font-size: 1rem;
  color: #888;
  display: block;
  margin-bottom: 20px;
}
.pendulum {
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 20px;
}
.arm {
  width: 4px;
  height: 100px;
  background: #555;
  border-radius: 2px;
  transform-origin: top center;
  position: relative;
  transition: none;
}
.arm.tick {
  animation: swing var(--duration) ease-in-out infinite alternate;
}
.weight {
  width: 20px;
  height: 20px;
  background: #c0392b;
  border-radius: 50%;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
@keyframes swing {
  from { transform: rotate(-30deg); }
  to   { transform: rotate(30deg); }
}
input[type="range"] {
  width: 100%;
  margin-bottom: 6px;
  accent-color: #c0392b;
}
.labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #999;
  margin-bottom: 20px;
}
button {
  background: #c0392b;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 32px;
  font-size: 1rem;
  cursor: pointer;
}
button:hover {
  background: #a93226;
}`,
    js: `const slider = document.getElementById('bpm-slider');
const display = document.getElementById('bpm-display');
const arm = document.getElementById('arm');
const btn = document.getElementById('toggle-btn');

let running = false;
let intervalId = null;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playClick() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

function getBpm() {
  return parseInt(slider.value, 10);
}

function getDuration() {
  return (60 / getBpm()).toFixed(3);
}

function updateArm() {
  arm.style.setProperty('--duration', getDuration() + 's');
}

function start() {
  updateArm();
  arm.classList.add('tick');
  btn.textContent = '⏹ Stop';
  running = true;
  playClick();
  intervalId = setInterval(playClick, (60 / getBpm()) * 1000);
}

function stop() {
  clearInterval(intervalId);
  intervalId = null;
  arm.classList.remove('tick');
  btn.textContent = '▶ Start';
  running = false;
}

function toggle() {
  if (running) {
    stop();
  } else {
    start();
  }
}

slider.addEventListener('input', function() {
  display.textContent = slider.value;
  if (running) {
    stop();
    start();
  }
});`
  },
  {
    key: 'intervals',
    html: `<div class="wrapper">
  <h2>Intervall-Tabelle</h2>
  <div class="scroll-box">
    <table>
      <thead>
        <tr><th>Intervall</th><th>Halbtonschritte</th><th>Beispiel (ab C)</th><th>Charakter</th></tr>
      </thead>
      <tbody>
        <tr><td>Prime</td><td>0</td><td>c – c</td><td>vollkommen konsonant, schließend</td></tr>
        <tr><td>Kleine Sekunde</td><td>1</td><td>c – d♭</td><td>stark dissonant</td></tr>
        <tr><td>Große Sekunde</td><td>2</td><td>c – d</td><td>leicht dissonant</td></tr>
        <tr><td>Kleine Terz</td><td>3</td><td>c – e♭</td><td>unvollkommen konsonant</td></tr>
        <tr><td>Große Terz</td><td>4</td><td>c – e</td><td>unvollkommen konsonant</td></tr>
        <tr><td>Quarte</td><td>5</td><td>c – f</td><td>dissonant oder konsonant</td></tr>
        <tr><td>Tritonus</td><td>6</td><td>C – f♯</td><td>dissonant</td></tr>
        <tr><td>Quinte</td><td>7</td><td>c – g</td><td>vollkommen konsonant, öffnend</td></tr>
        <tr><td>Kleine Sexte</td><td>8</td><td>c – a♭</td><td>unvollkommen konsonant</td></tr>
        <tr><td>Große Sexte</td><td>9</td><td>c – a</td><td>unvollkommen konsonant</td></tr>
        <tr><td>Kleine Septime</td><td>10</td><td>c – b♭</td><td>leicht dissonant</td></tr>
        <tr><td>Große Septime</td><td>11</td><td>c – h</td><td>stark dissonant</td></tr>
        <tr><td>Oktave</td><td>12</td><td>C – c</td><td>vollommen konsonant, schließend</td></tr>
      </tbody>
    </table>
  </div>
</div>`,
    css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: sans-serif;
  background: #f9f9f9;
  padding: 24px 16px;
  overflow: auto;
}
.wrapper {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  padding: 24px;
}
h2 {
  margin-bottom: 16px;
  color: #333;
}
.scroll-box {
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
}
thead {
  background: #f0f4ff;
}
th, td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}
th {
  font-weight: 600;
  color: #444;
}
tr:last-child td {
  border-bottom: none;
}
tr:nth-child(even) {
  background: #fafafa;
}`,
    js: `document.querySelectorAll('tbody tr').forEach(function(row) {
  row.addEventListener('click', function() {
    document.querySelectorAll('tbody tr').forEach(function(r) {
      r.style.background = '';
    });
    row.style.background = '#e8f0fe';
  });
});`
  },
  {
    key: 'infobox',
    height: 400,
    html: `<div class="cards">
  <div class="card card--info">
    <div class="card__icon">ℹ</div>
    <div class="card__body">
      <div class="card__title">Hinweis</div>
      <div class="card__text">Der Quintenzirkel zeigt alle 12 Dur- und Molltonarten und ihre Verwandtschaft zueinander. Benachbarte Tonarten unterscheiden sich nur um ein Vorzeichen.</div>
    </div>
  </div>
  <div class="card card--tip">
    <div class="card__icon">✦</div>
    <div class="card__body">
      <div class="card__title">Tipp</div>
      <div class="card__text">Paralleltonarten teilen dieselben Vorzeichen — z. B. C-Dur und a-Moll. Sie stehen sich im Quintenzirkel gegenüber.</div>
    </div>
  </div>
  <div class="card card--warning">
    <div class="card__icon">⚠</div>
    <div class="card__body">
      <div class="card__title">Achtung</div>
      <div class="card__text">Nicht verwechseln: <em>Parallel</em>tonarten (gleiche Vorzeichen) und <em>Varianten</em>tonarten (gleicher Grundton, aber Dur/Moll).</div>
    </div>
  </div>
</div>`,
    css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: sans-serif;
  padding: 24px 16px;
}
.cards {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 70%;
  background: #fff;
  border-radius: 8px;
  border-left: 5px solid #ccc;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  padding: 16px 20px;
}
.card--info    { border-left-color: #3b82f6; margin-right: auto; }
.card--tip     { border-left-color: #10b981; margin-left: auto; margin-right: auto; }
.card--warning { border-left-color: #f59e0b; margin-left: auto; }
.card__icon {
  font-size: 1.4rem;
  line-height: 1.3;
  flex-shrink: 0;
}
.card--info    .card__icon { color: #3b82f6; }
.card--tip     .card__icon { color: #10b981; }
.card--warning .card__icon { color: #f59e0b; }
.card__title {
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
  color: #555;
}
.card__text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.55;
}`,
    js: ''
  },
  {
    key: 'turntable',
    height: 380,
    html: `<div class="scene">
  <div class="turntable">
    <div class="platter">
      <div class="record" id="record">
        <div class="label">
          <span class="label-text">OMA</span>
          <div class="hole"></div>
        </div>
      </div>
    </div>
    <div class="arm-pivot">
      <div class="arm">
        <div class="head">
          <div class="stylus"></div>
        </div>
      </div>
    </div>
    <div class="knobs">
      <div class="knob"></div>
      <div class="knob"></div>
      <div class="knob"></div>
    </div>
  </div>
  <button id="btn" onclick="toggle()">⏸ Pause</button>
</div>`,
    css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  gap: 20px;
}
.turntable {
  position: relative;
  width: 360px;
  height: 240px;
  background: linear-gradient(160deg, #c8b89a, #a8916a);
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25);
}
.platter {
  position: absolute;
  width: 196px;
  height: 196px;
  background: #2c2c2c;
  border-radius: 50%;
  top: 50%;
  left: 118px;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 5px #383838, 0 4px 16px rgba(0,0,0,0.7);
}
.record {
  position: absolute;
  width: 178px;
  height: 178px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: repeating-radial-gradient(circle, #0a0a0a 0, #161616 1px, #0a0a0a 2px, #0a0a0a 5px);
  animation: spin 1.8s linear infinite;
}
@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
.label {
  position: absolute;
  width: 64px;
  height: 64px;
  background: radial-gradient(circle at 40% 40%, #e05a4a, #8b1a0e);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.label-text {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}
.hole {
  position: absolute;
  width: 9px;
  height: 9px;
  background: #2c2c2c;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.arm-pivot {
  position: absolute;
  width: 14px;
  height: 14px;
  background: radial-gradient(circle at 40% 35%, #ccc, #888);
  border-radius: 50%;
  top: 34px;
  right: 48px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  z-index: 2;
}
.arm {
  position: absolute;
  width: 5px;
  height: 120px;
  background: linear-gradient(to right, #bbb, #999, #bbb);
  border-radius: 3px 3px 2px 2px;
  top: 7px;
  left: 50%;
  transform: translateX(-50%) rotate(72deg);
  transform-origin: top center;
}
.head {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 13px;
  height: 9px;
  background: #aaa;
  border-radius: 2px;
}
.stylus {
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 7px;
  background: #ddd;
  border-radius: 0 0 1px 1px;
}
.knobs {
  position: absolute;
  bottom: 20px;
  right: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.knob {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #e0e0e0, #888);
  box-shadow: 0 2px 5px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
}
button {
  margin-top: 16px;
  background: #2a2a2a;
  color: #ddd;
  border: 1px solid #444;
  border-radius: 20px;
  padding: 7px 28px;
  font-size: 0.85rem;
  cursor: pointer;
  letter-spacing: 0.05em;
}
button:hover {
  background: #383838;
}`,
    js: `var playing = true;
var record = document.getElementById('record');
var btn = document.getElementById('btn');

function toggle() {
  playing = !playing;
  record.style.animationPlayState = playing ? 'running' : 'paused';
  btn.textContent = playing ? '⏸ Pause' : '▶ Play';
}`
  }
];
