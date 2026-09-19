import { AU, LY, KM, SCALE_UNITS, DAY_S, PLANETS } from './data.js';
import {
  daysSinceJ2000, lerp, lerpLog, easeInOut, layerAlpha, niceScaleBar,
  levelFromHash, levelFromShortcut, hashForView, moonSystemRadius, formatDate, shouldIgnoreGlobalKeys,
  skyToPlane, orbitalPosition, placeLabel, TOUR, TOUR_HOLD_MS, tourLegMs,
} from './util.js';
import { LAYERS, GALACTIC_CENTER } from './scenes.js';
import { drawOverview } from './overview.js';

const M31 = skyToPlane(121.2, 2.54e6 * LY);
const VIRGO = skyToPlane(284, 54e6 * LY);

const planet = (name) => PLANETS.find((p) => p.name === name);

// A level with `follow` is centered on that planet's current position.
export const LEVELS = [
  { id: 'earth-moon', name: 'Earth & Moon', shortcut: '1', radius: 5e5 * KM, follow: planet('Earth') },
  { id: 'jupiter', name: 'Jupiter & moons', shortcut: '2', radius: 2.4e6 * KM, follow: planet('Jupiter') },
  { id: 'saturn', name: 'Saturn & moons', shortcut: '3', radius: moonSystemRadius(planet('Saturn')), follow: planet('Saturn') },
  { id: 'inner', name: 'Inner solar system', shortcut: '4', radius: 2 * AU, cx: 0, cy: 0 },
  { id: 'outer', name: 'Outer solar system', shortcut: '5', radius: 50 * AU, cx: 0, cy: 0 },
  { id: 'trans-neptunian', name: 'TNOs', shortcut: 'k', radius: 120 * AU, cx: 0, cy: 0,
    caption: 'Official dwarf planets: Pluto, Haumea, Makemake, Eris. Other labeled TNOs are candidates.' },
  { id: 'stars', name: 'Stellar neighborhood', shortcut: '6', radius: 20 * LY, cx: 0, cy: 0 },
  { id: 'milky-way', name: 'Milky Way', shortcut: '7', radius: 60e3 * LY, cx: GALACTIC_CENTER.x, cy: GALACTIC_CENTER.y },
  { id: 'milky-way-halo', name: 'MW halo', shortcut: 'h', radius: 500e3 * LY, cx: 0, cy: 0,
    caption: 'Schematic top-down projection. Radial distances are to scale; galactic latitude is omitted and galaxy sizes are approximate.' },
  { id: 'local-group', name: 'Local Group', shortcut: '8', radius: 3e6 * LY, cx: M31.x / 2, cy: M31.y / 2 },
  { id: 'virgo', name: 'Virgo Supercluster', shortcut: '9', radius: 60e6 * LY, cx: VIRGO.x / 2, cy: VIRGO.y / 2 },
  { id: 'universe', name: 'Observable universe', shortcut: '0', radius: 58e9 * LY, cx: 0, cy: 0,
    caption: 'Looking outward means looking back in time. Schematic 2D comoving slice; the cosmic web is procedural, not a present-day map.' },
];

// Moon systems without a button, reached by clicking the planet or by hash.
export const EXTRA_LEVELS = PLANETS.filter((p) => p.moons && !LEVELS.some((lv) => lv.follow === p))
  .map((p) => ({
    id: p.name.toLowerCase(),
    name: `${p.name} & moons`,
    radius: moonSystemRadius(p),
    follow: p,
  }));
const ALL_LEVELS = [...LEVELS, ...EXTRA_LEVELS];

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
const scalebarEl = document.getElementById('scalebar');
const overviewBtn = document.getElementById('overview');
const tourBtn = document.getElementById('tour');
const captionEl = document.getElementById('caption');
const hoverInfoEl = document.getElementById('hover-info');
const hoverNameEl = hoverInfoEl.querySelector('.name');
const hoverDetailsEl = hoverInfoEl.querySelector('.details');
const DEFAULT_CAPTION = 'Distances to scale. Dots are not.';

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
let overview = false;
let lastLevelId = LEVELS[0].id;
let tour = null;

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

function setOverview(on) {
  overview = on;
  history.replaceState(null, '', hashForView(on, lastLevelId));
}

function goTo(level, instant = false, dur = 1400) {
  setOverview(false);
  setFollow(null);
  const to = { ...levelCenter(level), mpp: mppFor(level) };
  if (instant) {
    Object.assign(cam, to);
    setFollow(level.follow || null);
    anim = null;
  } else {
    anim = { from: { cx: cam.cx, cy: cam.cy, mpp: cam.mpp }, level, start: performance.now(), dur };
  }
  lastLevelId = level.id;
  history.replaceState(null, '', hashForView(false, lastLevelId));
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

// The guided tour: pull back through TOUR at a fixed rate, holding at each stop.
function startTour() {
  tour = { index: 0, holdUntil: 0 };
  goTo(LEVELS.find((lv) => lv.id === TOUR[0]));
}

function stopTour() {
  tour = null;
}

function stepTour(now) {
  if (!tour || anim) return;
  if (!tour.holdUntil) { tour.holdUntil = now + TOUR_HOLD_MS; return; }
  if (now < tour.holdUntil) return;
  tour.index += 1;
  if (tour.index >= TOUR.length) { stopTour(); return; }
  const level = LEVELS.find((lv) => lv.id === TOUR[tour.index]);
  tour.holdUntil = 0;
  goTo(level, false, tourLegMs(cam.mpp, mppFor(level)));
}

function zoomAt(sx, sy, factor) {
  if (overview) return;
  stopTour();
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
    let rect = placeLabel(l.x, l.y, tw + 4, 16, placed, { w, h });
    if (!rect && isHover) rect = { x: l.x + 8, y: l.y - 8, w: tw + 4, h: 16 };
    if (!rect) continue;
    placed.push(rect);
    ctx.globalAlpha = l.alpha * (isHover ? 1 : 0.8);
    ctx.fillStyle = isHover ? '#ffffff' : '#cfd3dc';
    ctx.fillText(l.text, rect.x + 2, rect.y + 8);
  }
  ctx.globalAlpha = 1;
}

function updateHover(view) {
  hover = null;
  if (!mouse) return;
  let bestD = 14;
  for (const hit of view.hits) {
    const dx = mouse.x - hit.x;
    const dy = mouse.y - hit.y;
    const radial = Math.hypot(dx, dy);
    const d = hit.radius === undefined ? radial : Math.abs(radial - hit.radius);
    if (d < bestD) {
      bestD = d;
      hover = hit.radius === undefined || radial === 0
        ? hit
        : { ...hit, markerX: hit.x + dx / radial * hit.radius, markerY: hit.y + dy / radial * hit.radius };
    }
  }
  if (hover) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(hover.markerX ?? hover.x, hover.markerY ?? hover.y, 9, 0, Math.PI * 2);
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
  for (const b of levelsEl.children) b.classList.toggle('active', !overview && b.dataset.id === near.id);
  for (const b of speedsEl.children) b.classList.toggle('active', b.dataset.label === speed.label);
  overviewBtn.classList.toggle('active', overview);
  tourBtn.textContent = tour ? 'Stop tour' : 'Tour';
  tourBtn.classList.toggle('active', !!tour);
  scalebarEl.hidden = overview;
  captionEl.hidden = overview;
  captionEl.textContent = near.caption || DEFAULT_CAPTION;
  hoverInfoEl.hidden = !hover;
  if (hover) {
    hoverNameEl.textContent = hover.name;
    hoverDetailsEl.textContent = hover.detail;
  }
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  simMs += speed.perSec * dt * 1000;
  stepAnim(now);
  stepTour(now);
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
  if (overview) {
    drawOverview(ctx, view, days);
  } else {
    for (const layer of LAYERS) {
      const alpha = layerAlpha(view.radius, layer.range);
      if (alpha > 0) layer.draw(ctx, view, alpha, days);
    }
  }
  updateHover(view);
  drawLabels(view);
  updateHud();
  requestAnimationFrame(frame);
}

function buildHud() {
  LEVELS.forEach((lv) => {
    const b = document.createElement('button');
    b.textContent = lv.name;
    b.dataset.id = lv.id;
    b.title = lv.shortcut;
    b.addEventListener('click', () => { stopTour(); goTo(lv); });
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
canvas.addEventListener('click', () => {
  if (!hover) return;
  const level = ALL_LEVELS.find((lv) => lv.follow && lv.follow.name === hover.name);
  if (level) { stopTour(); goTo(level); }
});

window.addEventListener('keydown', (e) => {
  if (shouldIgnoreGlobalKeys(e.target.tagName, e.target.isContentEditable)) return;
  const level = levelFromShortcut(e.key, LEVELS);
  if (e.key === '+' || e.key === '=') zoomAt(w / 2, h / 2, 0.8);
  else if (e.key === '-' || e.key === '_') zoomAt(w / 2, h / 2, 1.25);
  else if (level) { stopTour(); goTo(level); }
  else if (e.key === ' ') { e.preventDefault(); speed = speed.perSec ? SPEEDS[0] : SPEEDS[1]; }
  else if (e.key === 'o') { stopTour(); setOverview(!overview); }
  else if (e.key === 'p') { if (tour) stopTour(); else startTour(); }
});

window.addEventListener('hashchange', () => {
  if (location.hash === '#overview') setOverview(true);
  else goTo(levelFromHash(location.hash, ALL_LEVELS));
});
overviewBtn.addEventListener('click', () => { stopTour(); setOverview(!overview); });
tourBtn.addEventListener('click', () => { if (tour) stopTour(); else startTour(); });
window.addEventListener('resize', () => {
  const level = nearestLevel();
  const ratio = cam.mpp / mppFor(level);
  resize();
  cam.mpp = mppFor(level) * ratio;
});

buildHud();
resize();
const startOverview = location.hash === '#overview';
goTo(levelFromHash(location.hash, ALL_LEVELS), true);
if (startOverview) setOverview(true);
requestAnimationFrame(frame);
