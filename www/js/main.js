import { AU, LY, KM, SCALE_UNITS, DAY_S, PLANETS } from './data.js';
import {
  daysSinceJ2000, lerp, lerpLog, easeInOut, layerAlpha, niceScaleBar,
  levelFromHash, formatDate, skyToPlane, orbitalPosition,
} from './util.js';
import { LAYERS, GALACTIC_CENTER } from './scenes.js';

const M31 = skyToPlane(121.2, 2.54e6 * LY);

const planet = (name) => PLANETS.find((p) => p.name === name);

// A level with `follow` is centered on that planet's current position.
export const LEVELS = [
  { id: 'earth-moon', name: 'Earth & Moon', radius: 5e5 * KM, follow: planet('Earth') },
  { id: 'jupiter', name: 'Jupiter & moons', radius: 2.4e6 * KM, follow: planet('Jupiter') },
  { id: 'inner', name: 'Inner solar system', radius: 2 * AU, cx: 0, cy: 0 },
  { id: 'outer', name: 'Outer solar system', radius: 50 * AU, cx: 0, cy: 0 },
  { id: 'stars', name: 'Stellar neighborhood', radius: 20 * LY, cx: 0, cy: 0 },
  { id: 'milky-way', name: 'Milky Way', radius: 60e3 * LY, cx: GALACTIC_CENTER.x, cy: GALACTIC_CENTER.y },
  { id: 'local-group', name: 'Local Group', radius: 3e6 * LY, cx: M31.x / 2, cy: M31.y / 2 },
  { id: 'universe', name: 'Observable universe', radius: 50e9 * LY, cx: 0, cy: 0 },
];

const SPEEDS = [
  { label: 'paused', perSec: 0 },
  { label: '1 hour/s', perSec: 3600 },
  { label: '1 day/s', perSec: DAY_S },
  { label: '1 month/s', perSec: 30 * DAY_S },
  { label: '1 year/s', perSec: 365.25 * DAY_S },
];

const canvas = document.getElementById('space');
const ctx = canvas.getContext('2d');
const levelsEl = document.getElementById('levels');
const speedsEl = document.getElementById('speeds');
const dateEl = document.getElementById('date');
const barEl = document.querySelector('#scalebar .bar');
const barLabel = document.querySelector('#scalebar .label');

const cam = { cx: 0, cy: 0, mpp: 1, follow: null, followPos: null };
let anim = null;
let w = 0;
let h = 0;
let dpr = 1;
let simMs = Date.now();
let speed = SPEEDS[2];
let lastFrame = performance.now();
let mouse = null;
let hover = null;

function halfMin() {
  return Math.min(w, h) / 2;
}

function mppFor(level) {
  return level.radius / halfMin();
}

function resize() {
  dpr = window.devicePixelRatio || 1;
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function levelCenter(level) {
  if (!level.follow) return { cx: level.cx, cy: level.cy };
  const p = orbitalPosition(level.follow, daysSinceJ2000(simMs));
  return { cx: p.x, cy: p.y };
}

function setFollow(body) {
  cam.follow = body;
  cam.followPos = body ? orbitalPosition(body, daysSinceJ2000(simMs)) : null;
}

// Keep the camera pinned to the followed body as it moves.
function trackFollow() {
  if (!cam.follow) return;
  const p = orbitalPosition(cam.follow, daysSinceJ2000(simMs));
  cam.cx += p.x - cam.followPos.x;
  cam.cy += p.y - cam.followPos.y;
  cam.followPos = p;
}

function goTo(level, instant = false) {
  setFollow(null);
  const to = { ...levelCenter(level), mpp: mppFor(level) };
  if (instant) {
    Object.assign(cam, to);
    setFollow(level.follow || null);
    anim = null;
  } else {
    anim = { from: { cx: cam.cx, cy: cam.cy, mpp: cam.mpp }, level, start: performance.now(), dur: 1400 };
  }
  history.replaceState(null, '', `#${level.id}`);
}

function stepAnim(now) {
  if (!anim) return;
  const u = Math.min(1, (now - anim.start) / anim.dur);
  const e = easeInOut(u);
  const { from } = anim;
  const to = { ...levelCenter(anim.level), mpp: mppFor(anim.level) };
  cam.mpp = lerpLog(from.mpp, to.mpp, e);
  // Move the center in step with the zoom so nothing flies off screen.
  const ratio = to.mpp / from.mpp;
  const wgt = Math.abs(Math.log(ratio)) < 1e-6 ? e : (Math.pow(ratio, e) - 1) / (ratio - 1);
  cam.cx = lerp(from.cx, to.cx, wgt);
  cam.cy = lerp(from.cy, to.cy, wgt);
  if (u >= 1) {
    setFollow(anim.level.follow || null);
    anim = null;
  }
}

function zoomAt(sx, sy, factor) {
  anim = null;
  const minMpp = mppFor(LEVELS[0]) / 4;
  const maxMpp = mppFor(LEVELS[LEVELS.length - 1]) * 1.5;
  const next = Math.min(maxMpp, Math.max(minMpp, cam.mpp * factor));
  const wx = cam.cx + (sx - w / 2) * cam.mpp;
  const wy = cam.cy - (sy - h / 2) * cam.mpp;
  cam.cx = wx - (sx - w / 2) * next;
  cam.cy = wy + (sy - h / 2) * next;
  cam.mpp = next;
}

function nearestLevel() {
  let best = LEVELS[0];
  let bestD = Infinity;
  for (const lv of LEVELS) {
    const d = Math.abs(Math.log(mppFor(lv)) - Math.log(cam.mpp));
    if (d < bestD) { bestD = d; best = lv; }
  }
  return best;
}

function drawLabels(view) {
  const placed = [];
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  const sorted = view.labels.sort((a, b) => b.priority - a.priority);
  for (const l of sorted) {
    const isHover = hover && hover.name === l.text;
    const tw = ctx.measureText(l.text).width;
    const rect = { x: l.x + 8, y: l.y - 8, w: tw + 4, h: 16 };
    const clash = placed.some((r) => rect.x < r.x + r.w && rect.x + rect.w > r.x && rect.y < r.y + r.h && rect.y + rect.h > r.y);
    if (clash && !isHover) continue;
    if (rect.x + rect.w > w || rect.y < 0 || rect.y + rect.h > h) continue;
    placed.push(rect);
    ctx.globalAlpha = l.alpha * (isHover ? 1 : 0.8);
    ctx.fillStyle = isHover ? '#ffffff' : '#cfd3dc';
    ctx.fillText(l.text, rect.x + 2, l.y);
  }
  ctx.globalAlpha = 1;
}

function updateHover(view) {
  hover = null;
  if (!mouse) return;
  let bestD = 14;
  for (const hit of view.hits) {
    const d = Math.hypot(hit.x - mouse.x, hit.y - mouse.y);
    if (d < bestD) { bestD = d; hover = hit; }
  }
  if (hover) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(hover.x, hover.y, 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  canvas.style.cursor = hover ? 'pointer' : 'default';
}

function updateHud() {
  const bar = niceScaleBar(cam.mpp, Math.min(220, w * 0.3), SCALE_UNITS);
  barEl.style.width = `${bar.px}px`;
  barLabel.textContent = bar.label;
  dateEl.textContent = formatDate(simMs);
  const near = nearestLevel();
  for (const b of levelsEl.children) b.classList.toggle('active', b.dataset.id === near.id);
  for (const b of speedsEl.children) b.classList.toggle('active', b.dataset.label === speed.label);
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  simMs += speed.perSec * dt * 1000;
  stepAnim(now);
  trackFollow();
  if (cam.follow && cam.mpp * halfMin() > 0.2 * AU) setFollow(null);

  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, w, h);

  const view = {
    w, h, cx: cam.cx, cy: cam.cy, mpp: cam.mpp,
    radius: cam.mpp * halfMin(),
    sx: (x) => w / 2 + (x - cam.cx) / cam.mpp,
    sy: (y) => h / 2 - (y - cam.cy) / cam.mpp,
    hits: [],
    labels: [],
  };
  const days = daysSinceJ2000(simMs);
  for (const layer of LAYERS) {
    const alpha = layerAlpha(view.radius, layer.range);
    if (alpha > 0) layer.draw(ctx, view, alpha, days);
  }
  updateHover(view);
  drawLabels(view);
  updateHud();
  requestAnimationFrame(frame);
}

function buildHud() {
  LEVELS.forEach((lv, i) => {
    const b = document.createElement('button');
    b.textContent = lv.name;
    b.dataset.id = lv.id;
    b.title = `${i + 1}`;
    b.addEventListener('click', () => goTo(lv));
    levelsEl.appendChild(b);
  });
  for (const s of SPEEDS) {
    const b = document.createElement('button');
    b.textContent = s.label;
    b.dataset.label = s.label;
    b.addEventListener('click', () => { speed = s; });
    speedsEl.appendChild(b);
  }
}

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomAt(e.offsetX, e.offsetY, Math.exp(e.deltaY * 0.002));
}, { passive: false });

canvas.addEventListener('mousemove', (e) => { mouse = { x: e.offsetX, y: e.offsetY }; });
canvas.addEventListener('mouseleave', () => { mouse = null; });

window.addEventListener('keydown', (e) => {
  if (e.key === '+' || e.key === '=') zoomAt(w / 2, h / 2, 0.8);
  else if (e.key === '-' || e.key === '_') zoomAt(w / 2, h / 2, 1.25);
  else if (e.key >= '1' && e.key <= String(LEVELS.length)) goTo(LEVELS[Number(e.key) - 1]);
  else if (e.key === ' ') { e.preventDefault(); speed = speed.perSec ? SPEEDS[0] : SPEEDS[1]; }
});

window.addEventListener('hashchange', () => goTo(levelFromHash(location.hash, LEVELS)));
window.addEventListener('resize', () => {
  const level = nearestLevel();
  const ratio = cam.mpp / mppFor(level);
  resize();
  cam.mpp = mppFor(level) * ratio;
});

buildHud();
resize();
goTo(levelFromHash(location.hash, LEVELS), true);
requestAnimationFrame(frame);
