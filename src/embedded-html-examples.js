export default [
  {
    key: 'metronome',
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
        <tr><td>Prime</td><td>0</td><td>C – C</td><td>neutral</td></tr>
        <tr><td>Kleine Sekunde</td><td>1</td><td>C – Des</td><td>dissonant</td></tr>
        <tr><td>Große Sekunde</td><td>2</td><td>C – D</td><td>leicht dissonant</td></tr>
        <tr><td>Kleine Terz</td><td>3</td><td>C – Es</td><td>konsonant, dunkel</td></tr>
        <tr><td>Große Terz</td><td>4</td><td>C – E</td><td>konsonant, hell</td></tr>
        <tr><td>Quarte</td><td>5</td><td>C – F</td><td>konsonant</td></tr>
        <tr><td>Tritonus</td><td>6</td><td>C – Ges</td><td>stark dissonant</td></tr>
        <tr><td>Quinte</td><td>7</td><td>C – G</td><td>konsonant, offen</td></tr>
        <tr><td>Kleine Sexte</td><td>8</td><td>C – As</td><td>konsonant, weich</td></tr>
        <tr><td>Große Sexte</td><td>9</td><td>C – A</td><td>konsonant, hell</td></tr>
        <tr><td>Kleine Septime</td><td>10</td><td>C – B</td><td>dissonant</td></tr>
        <tr><td>Große Septime</td><td>11</td><td>C – H</td><td>stark dissonant</td></tr>
        <tr><td>Oktave</td><td>12</td><td>C – C'</td><td>konsonant, vollkommen</td></tr>
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
  min-width: 500px;
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
  }
];
