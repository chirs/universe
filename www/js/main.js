import { AU, SCALE_UNITS, DAY_S } from './data.js';
import {
  daysSinceJ2000, lerp, lerpLog, easeInOut, layerAlpha, niceScaleBar,
  levelFromHash, levelFromShortcut, hashForView, timeFromHash, formatDate, shouldIgnoreGlobalKeys,
  orbitalPosition, placeLabel, pickLevel, coorbitalState,
} from './util.js';
import { LAYERS } from './scenes.js';
import { LEVELS, PLANET_LEVELS, CLOSE_UPS, COMPANION_LEVELS, ALL_LEVELS, SATURN, EARTH } from './levels.js';
import { drawOverview } from './overview.js';
import { createAmbient } from './audio.js';

// The level bar: a plain level id, or a menu of levels in sections, listed
// widest at the top so a menu reads like the sky above the bar.
const byId = (id) => LEVELS.find((lv) => lv.id === id);
const BAR = [
  { label: 'Planets', sections: [
    { title: 'Dwarf planets', levels: PLANET_LEVELS.filter((lv) => lv.follow.dwarf).reverse() },
    { title: 'Planets', levels: PLANET_LEVELS.filter((lv) => !lv.follow.dwarf).reverse() },
  ] },
  { label: 'Solar system', sections: [
    { levels: ['heliosphere', 'trans-neptunian', 'outer', 'inner'].map(byId) },
    { title: 'Earth\u2019s companions', levels: COMPANION_LEVELS },
  ] },
  { label: 'Stellar neighborhood', sections: [
    { levels: [byId('stars')] },
    { title: 'Star systems, farthest first', levels: [...SYSTEM_LEVELS].reverse() },
  ] },
  { label: 'Milky Way', sections: [{ levels: ['milky-way-halo', 'milky-way', 'local-arm', 'wr-140', 'local-bubble', 'galactic-center', 'sgr-a'].map(byId) }] },
  { label: 'Local Group', sections: [{ levels: ['local-group', 'andromeda', 'magellanic-clouds', 'triangulum'].map(byId) }] },
  'virgo', 'universe',
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
const menus = [];
const speedsEl = document.getElementById('speeds');
const dateEl = document.getElementById('date');
const playBtn = document.getElementById('play');
const speedToggle = document.getElementById('speed-toggle');
const helpEl = document.getElementById('help');
const barEl = document.querySelector('#scalebar .bar');
const barLabel = document.querySelector('#scalebar .label');
const scalebarEl = document.getElementById('scalebar');
const overviewBtn = document.getElementById('overview');
const soundBtn = document.getElementById('sound');
const volumeEl = document.getElementById('volume');
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
let runSpeed = speed;
let lastFrame = performance.now();
let mouse = null;
let hover = null;
let overview = false;
let lastLevelId = ALL_LEVELS[0].id;
let shownLabels = [];
let labelSides = new Map();
let sound = null;
let soundOn = false;
try {
  soundOn = localStorage.getItem('sound') === 'on';
  volumeEl.value = localStorage.getItem('volume') ?? volumeEl.value;
} catch {}

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
  if (level.at) return level.at(daysSinceJ2000(simMs));
  if (!level.follow) return { cx: level.cx, cy: level.cy };
  const p = orbitalPosition(level.follow, daysSinceJ2000(simMs));
  return { cx: p.x, cy: p.y };
}

function setFollow(body) {
  cam.follow = body;
  cam.followPos = body ? orbitalPosition(body, daysSinceJ2000(simMs)) : null;
}

// Turning frames, by name: the angle (radians) the frame has turned by at
// `days`. Janus and Epimetheus turn it with the pair, Earth's companions
// with Earth.
const FRAMES = {
  janus: (days) => coorbitalState(SATURN.coorbitals, days).center,
  earth: (days) => {
    const p = orbitalPosition(EARTH, days);
    return Math.atan2(p.y, p.x);
  },
};

// A level with `frame` is drawn turning about the followed planet, or
// about its `pivot`. The turn starts from where it is, so nothing jumps,
// and stops once the view is much wider than the level.
function setSpin(level) {
  const fn = level && FRAMES[level.frame];
  cam.spin = fn ? { level, fn, ref: fn(daysSinceJ2000(simMs)), pivot: level.pivot || null } : null;
}



// Keep the camera pinned to the followed body as it moves.
function trackFollow() {
  if (!cam.follow) return;
  const p = orbitalPosition(cam.follow, daysSinceJ2000(simMs));
  cam.cx += p.x - cam.followPos.x;
  cam.cy += p.y - cam.followPos.y;
  cam.followPos = p;
}

function setSound(on) {
  soundOn = on;
  try { localStorage.setItem('sound', on ? 'on' : 'off'); } catch {}
  if (on && !sound) sound = createAmbient(Number(volumeEl.value));
  if (sound) sound.setEnabled(on);
}

// Browsers only start audio from a user gesture, so a stored "on" waits for one.
function resumeSound() {
  if (soundOn && !sound) setSound(true);
}

function setOverview(on) {
  overview = on;
  history.replaceState(null, '', hashForView(on, lastLevelId));
}

function goTo(level, instant = false, dur = 1400) {
  closeMenus();
  setOverview(false);
  setFollow(null);
  setSpin(null);
  const to = { ...levelCenter(level), mpp: mppFor(level) };
  if (instant) {
    Object.assign(cam, to);
    setFollow(level.follow || null);
    setSpin(level);
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
    setSpin(anim.level);
    anim = null;
  }
}

function zoomAt(sx, sy, factor) {
  if (overview) return;
  closeMenus();
  anim = null;
  const minMpp = Math.min(...ALL_LEVELS.map(mppFor)) / 4;
  const maxMpp = mppFor(LEVELS[LEVELS.length - 1]) * 1.5;
  const next = Math.min(maxMpp, Math.max(minMpp, cam.mpp * factor));
  const wx = cam.cx + (sx - w / 2) * cam.mpp;
  const wy = cam.cy - (sy - h / 2) * cam.mpp;
  cam.cx = wx - (sx - w / 2) * next;
  cam.cy = wy + (sy - h / 2) * next;
  cam.mpp = next;
}

// The level to highlight: the followed moon system if there is one, else
// whichever wide level is closest in scale.
function nearestLevel() {
  const turning = anim ? anim.level : cam.spin?.level;
  if (turning && COMPANION_LEVELS.includes(turning)) return turning;
  const body = anim ? anim.level.follow : cam.follow;
  if (body) {
    const mpp = anim ? mppFor(anim.level) : cam.mpp;
    const stops = [...PLANET_LEVELS, ...CLOSE_UPS].filter((lv) => lv.follow === body);
    return stops.reduce((best, lv) => (Math.abs(Math.log(mppFor(lv) / mpp)) < Math.abs(Math.log(mppFor(best) / mpp)) ? lv : best));
  }
  return pickLevel(LEVELS, cam.cx, cam.cy, cam.mpp * halfMin());
}

// A soft darkening toward the corners, under the labels and HUD.
function drawVignette() {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) / 2);
  g.addColorStop(0, 'rgba(5, 6, 10, 0)');
  g.addColorStop(1, 'rgba(5, 6, 10, 0.5)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawLabels(view) {
  shownLabels = [];
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(5, 6, 10, 0.85)';
  // Higher priority first; a faint label, from a layer fading in or out,
  // goes after every solid one. Each drawn label keeps its space, so a
  // later label moves to a free side or is hidden. A label tries the side
  // it had last frame first, so it stays put while there is room.
  const rank = (l) => l.priority - (l.alpha < 0.5 ? 10 : 0);
  const sorted = view.labels.sort((a, b) => rank(b) - rank(a));
  const inView = sorted.filter((l) => l.x >= 0 && l.x <= w && l.y >= 0 && l.y <= h);
  // Every labeled point keeps a small box, so a label never covers the dot
  // of anything as important as its own.
  const boxes = inView.map((l) => ({ x: l.x - 5, y: l.y - 5, w: 10, h: 10, priority: l.priority }));
  const drawn = [...(view.keepOut ?? [])];
  const sides = new Map();
  for (const l of inView) {
    const isHover = hover && hover.name === l.text;
    const tw = ctx.measureText(l.text).width;
    const taken = isHover ? [] : [...drawn, ...boxes.filter((b) => b.priority >= l.priority)];
    const rect = placeLabel(l.x, l.y, tw + 4, 16, { w, h }, 8, taken, labelSides.get(l.text) ?? 0);
    if (!rect) continue;
    sides.set(l.text, rect.side);
    drawn.push(rect);
    shownLabels.push({ rect, text: l.text, x: l.x, y: l.y });
    ctx.globalAlpha = l.alpha * (isHover ? 1 : 0.8);
    ctx.fillStyle = isHover ? '#ffffff' : '#cfd3dc';
    ctx.strokeText(l.text, rect.x + 2, rect.y + 8);
    ctx.fillText(l.text, rect.x + 2, rect.y + 8);
  }
  labelSides = sides;
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
  // A name counts as its object. Labels are placed after hover is decided,
  // so this uses last frame's positions.
  const label = shownLabels.find(({ rect: r }) =>
    mouse.x >= r.x && mouse.x <= r.x + r.w && mouse.y >= r.y && mouse.y <= r.y + r.h);
  const hit = label && view.hits.find((h) => h.name === label.text);
  if (hit) hover = { ...hit, markerX: label.x, markerY: label.y };
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
  // The close-ups are not in the bar; they light their planet's menu, which
  // names the close-up.
  const inBar = CLOSE_UPS.includes(near) ? PLANET_LEVELS.find((lv) => lv.follow === near.follow) : near;
  for (const b of levelsEl.querySelectorAll('button[data-id]')) b.classList.toggle('active', !overview && b.dataset.id === inBar.id);
  for (const m of menus) {
    const open = !overview && m.levels.includes(inBar);
    m.toggle.textContent = `${open ? near.name : m.label} ▾`;
    m.toggle.classList.toggle('active', open);
  }
  for (const b of speedsEl.children) b.classList.toggle('active', b.dataset.label === runSpeed.label);
  playBtn.textContent = speed.perSec ? '⏸' : '▶';
  speedToggle.textContent = `${runSpeed.label} ▾`;
  overviewBtn.classList.toggle('active', overview);
  soundBtn.classList.toggle('active', soundOn);
  volumeEl.hidden = !soundOn;
  scalebarEl.hidden = overview;
  captionEl.hidden = overview;
  captionEl.textContent = near.caption || DEFAULT_CAPTION;
  hoverInfoEl.hidden = !hover;
  if (hover) {
    hoverNameEl.textContent = hover.name;
    hoverDetailsEl.textContent = hover.detail;
    // Beside the marker, flipped to the other side near the right or bottom edge.
    const x = hover.markerX ?? hover.x;
    const y = hover.markerY ?? hover.y;
    const pw = hoverInfoEl.offsetWidth;
    const ph = hoverInfoEl.offsetHeight;
    hoverInfoEl.style.left = `${x + 16 + pw > w - 8 ? x - 16 - pw : x + 16}px`;
    hoverInfoEl.style.top = `${Math.max(8, y + 16 + ph > h - 8 ? y - 16 - ph : y + 16)}px`;
  }
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

  const days = daysSinceJ2000(simMs);
  if (cam.spin && cam.mpp * halfMin() > 6 * cam.spin.level.radius) cam.spin = null;
  // In a turning frame the camera lives in turned coordinates. The layers
  // draw real positions into a square big enough to cover the screen at any
  // angle, centered where the camera sits in real coordinates (turned back
  // about the pivot); that square is then turned about the screen center.
  const spin = cam.spin && !overview ? cam.spin : null;
  const rot = spin ? spin.fn(days) - spin.ref : 0;
  let { cx, cy } = cam;
  let vw = w;
  let vh = h;
  if (spin) {
    const pivot = spin.pivot || cam.followPos;
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    cx = pivot.x + (cam.cx - pivot.x) * c - (cam.cy - pivot.y) * s;
    cy = pivot.y + (cam.cx - pivot.x) * s + (cam.cy - pivot.y) * c;
    vw = vh = Math.ceil(Math.hypot(w, h));
  }
  const view = {
    w: vw, h: vh, cx, cy, mpp: cam.mpp,
    radius: cam.mpp * halfMin(),
    sx: (x) => vw / 2 + (x - cx) / cam.mpp,
    sy: (y) => vh / 2 - (y - cy) / cam.mpp,
    hits: [],
    labels: [],
    frame: spin ? spin.level.frame : null,
  };
  if (overview) {
    drawOverview(ctx, view, days);
  } else {
    if (spin) {
      // The world turns counterclockwise on screen; turn it back.
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(rot);
      ctx.translate(-vw / 2, -vh / 2);
    }
    for (const layer of LAYERS) {
      const alpha = layerAlpha(view.radius, layer.range);
      if (alpha > 0) layer.draw(ctx, view, alpha, days);
    }
    if (spin) {
      ctx.restore();
      // Labels and hover targets were placed in the square; carry them to
      // the screen.
      const c = Math.cos(rot);
      const s = Math.sin(rot);
      for (const p of [...view.labels, ...view.hits]) {
        const dx = p.x - vw / 2;
        const dy = p.y - vh / 2;
        p.x = w / 2 + dx * c - dy * s;
        p.y = h / 2 + dx * s + dy * c;
      }
    }
  }
  if (!overview) drawVignette();
  if (sound && !overview) sound.update(view.radius);
  updateHover(view);
  drawLabels(view);
  updateHud();
  requestAnimationFrame(frame);
}

function closeMenus() {
  for (const list of document.querySelectorAll('#hud .menu-list')) list.hidden = true;
}

function setSpeed(s) {
  speed = s;
  if (s.perSec) runSpeed = s;
}

function wireMenu(toggle, list) {
  toggle.addEventListener('click', () => {
    const wasOpen = !list.hidden;
    closeMenus();
    list.hidden = wasOpen;
  });
}

function levelButton(lv) {
  const b = document.createElement('button');
  b.textContent = lv.name;
  b.dataset.id = lv.id;
  if (lv.shortcut) b.title = lv.shortcut;
  b.addEventListener('click', () => goTo(lv));
  return b;
}

function buildMenu(spec) {
  const wrap = document.createElement('div');
  wrap.className = 'menu';
  const toggle = document.createElement('button');
  toggle.textContent = `${spec.label} ▾`;
  const list = document.createElement('div');
  list.className = 'menu-list';
  list.hidden = true;
  for (const section of spec.sections) {
    if (section.title) {
      const head = document.createElement('div');
      head.className = 'group';
      head.textContent = section.title;
      list.appendChild(head);
    }
    for (const lv of section.levels) list.appendChild(levelButton(lv));
  }
  wrap.append(toggle, list);
  const menu = { label: spec.label, toggle, list, levels: spec.sections.flatMap((s) => s.levels) };
  wireMenu(toggle, list);
  menus.push(menu);
  return wrap;
}

function buildHud() {
  for (const entry of BAR) {
    levelsEl.appendChild(typeof entry === 'string' ? levelButton(byId(entry)) : buildMenu(entry));
  }
  for (const s of SPEEDS.filter((s) => s.perSec)) {
    const b = document.createElement('button');
    b.textContent = s.label;
    b.dataset.label = s.label;
    b.addEventListener('click', () => { setSpeed(s); closeMenus(); });
    speedsEl.appendChild(b);
  }
  wireMenu(speedToggle, speedsEl);
  wireMenu(document.getElementById('help-toggle'), helpEl);
  const jumps = document.getElementById('help-jumps');
  for (const lv of ALL_LEVELS.filter((lv) => lv.shortcut).sort((a, b) => a.radius - b.radius)) {
    const dt = document.createElement('dt');
    dt.textContent = lv.shortcut;
    const dd = document.createElement('dd');
    dd.textContent = lv.name;
    jumps.append(dt, dd);
  }
}

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomAt(e.offsetX, e.offsetY, Math.exp(e.deltaY * 0.002));
}, { passive: false });

// Drag to pan. A press that barely moves is still a click.
let drag = null;
canvas.addEventListener('mousedown', (e) => {
  if (overview || e.button !== 0) return;
  drag = { x: e.offsetX, y: e.offsetY, moved: false };
});
canvas.addEventListener('mousemove', (e) => {
  mouse = { x: e.offsetX, y: e.offsetY };
  if (!drag) return;
  const dx = e.offsetX - drag.x;
  const dy = e.offsetY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) < 4) return;
  if (!drag.moved) { anim = null; canvas.classList.add('dragging'); drag.moved = true; }
  cam.cx -= dx * cam.mpp;
  cam.cy += dy * cam.mpp;
  drag.x = e.offsetX;
  drag.y = e.offsetY;
});
let dragged = false;
window.addEventListener('mouseup', () => {
  dragged = !!(drag && drag.moved);
  drag = null;
  canvas.classList.remove('dragging');
});
canvas.addEventListener('mouseleave', () => { mouse = null; });
canvas.addEventListener('click', () => {
  if (!hover || dragged) return;
  const level = ALL_LEVELS.find((lv) => (lv.clickNames || [lv.clickName || lv.follow?.name]).includes(hover.name));
  if (level) goTo(level);
});

document.addEventListener('click', (e) => {
  for (const wrap of document.querySelectorAll('#hud .menu')) {
    if (!wrap.contains(e.target)) wrap.querySelector('.menu-list').hidden = true;
  }
});

window.addEventListener('keydown', (e) => {
  if (shouldIgnoreGlobalKeys(e.target.tagName, e.target.isContentEditable)) return;
  const level = levelFromShortcut(e.key, ALL_LEVELS);
  if (e.key === 'Escape') closeMenus();
  else if (e.key === '+' || e.key === '=') zoomAt(w / 2, h / 2, 0.8);
  else if (e.key === '-' || e.key === '_') zoomAt(w / 2, h / 2, 1.25);
  else if (level) goTo(level);
  else if (e.key === ' ') { e.preventDefault(); setSpeed(speed.perSec ? SPEEDS[0] : runSpeed); }
  else if (e.key === '?') { const wasOpen = !helpEl.hidden; closeMenus(); helpEl.hidden = wasOpen; }
  else if (e.key === 'o') setOverview(!overview);
  else if (e.key === 'm') setSound(!soundOn);
});
window.addEventListener('keydown', resumeSound, { once: true });
window.addEventListener('pointerdown', resumeSound, { once: true });

// A hash with a time, like #earth?t=2029-04-13T21:45, sets the clock to
// that moment and pauses it, so a moment can be linked. Read before goTo,
// which rewrites the hash to the level alone.
function applyHashTime(hash) {
  const t = timeFromHash(hash);
  if (t === null) return;
  simMs = t;
  setSpeed(SPEEDS[0]);
}

window.addEventListener('hashchange', () => {
  const hash = location.hash;
  if (hash === '#overview') setOverview(true);
  else goTo(levelFromHash(hash, ALL_LEVELS));
  applyHashTime(hash);
});
playBtn.addEventListener('click', () => setSpeed(speed.perSec ? SPEEDS[0] : runSpeed));
overviewBtn.addEventListener('click', () => setOverview(!overview));
soundBtn.addEventListener('click', () => setSound(!soundOn));
volumeEl.addEventListener('input', () => {
  try { localStorage.setItem('volume', volumeEl.value); } catch {}
  if (sound) sound.setVolume(Number(volumeEl.value));
});
window.addEventListener('resize', () => {
  const level = nearestLevel();
  const ratio = cam.mpp / mppFor(level);
  resize();
  cam.mpp = mppFor(level) * ratio;
});

buildHud();
resize();
const startHash = location.hash;
goTo(levelFromHash(startHash, ALL_LEVELS), true);
if (startHash === '#overview') setOverview(true);
applyHashTime(startHash);
requestAnimationFrame(frame);
