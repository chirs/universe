import { AU, LY, SCALE_UNITS, DAY_S, PLANETS, STARS, STAR_SYSTEMS, LOCAL_GROUP, LOCAL_GROUP_STOPS } from './data.js';
import {
  daysSinceJ2000, lerp, lerpLog, easeInOut, layerAlpha, niceScaleBar,
  levelFromHash, levelFromShortcut, hashForView, planetLevels, formatDate, shouldIgnoreGlobalKeys,
  skyToPlane, orbitalPosition, placeLabel, pickLevel, systemLevels, galaxyLevels, TOUR, TOUR_HOLD_MS, tourLegMs,
} from './util.js';
import { LAYERS, GALACTIC_CENTER } from './scenes.js';
import { drawOverview } from './overview.js';
import { createAmbient } from './audio.js';

const M31 = skyToPlane(121.2, 2.54e6 * LY);
const VIRGO = skyToPlane(284, 54e6 * LY);

// Planets: one level per planet and dwarf planet, listed in the Planets menu and
// reached by clicking the planet or by hash. Each has `follow`, so the camera
// stays centered on the planet as it moves.
export const PLANET_LEVELS = planetLevels(PLANETS);
for (const lv of PLANET_LEVELS) lv.shortcut = { earth: '1', jupiter: '2', saturn: '3' }[lv.id];

const SYSTEM_LEVELS = systemLevels(STAR_SYSTEMS, STARS);
const GALAXY_LEVELS = galaxyLevels(LOCAL_GROUP_STOPS, LOCAL_GROUP);

export const LEVELS = [
  { id: 'inner', name: 'Inner solar system', shortcut: '4', radius: 2 * AU, cx: 0, cy: 0 },
  { id: 'outer', name: 'Outer solar system', shortcut: '5', radius: 50 * AU, cx: 0, cy: 0 },
  { id: 'trans-neptunian', name: 'TNOs', shortcut: 'k', radius: 120 * AU, cx: 0, cy: 0,
    caption: 'Official dwarf planets: Pluto, Haumea, Makemake, Eris. Other labeled TNOs are candidates.' },
  { id: 'heliosphere', name: 'Heliosphere', radius: 240 * AU, cx: 0, cy: 0,
    clickNames: ['Voyager 1', 'Voyager 2', 'Pioneer 10', 'Pioneer 11', 'Termination shock', 'Heliopause'],
    caption: 'The Sun\u2019s wind gives way to interstellar gas at the heliopause, which both Voyagers have crossed. Spacecraft paths from JPL Horizons, laid into the ecliptic at their true distance.' },
  { id: 'stars', name: 'Stellar neighborhood', shortcut: '6', radius: 20 * LY, cx: 0, cy: 0,
    caption: 'Every known system within 16 light-years. Most are red dwarfs too faint for the eye; two of the nearest are brown dwarfs. Rings mark systems with known planets.' },
  ...SYSTEM_LEVELS,
  { id: 'local-bubble', name: 'Local Bubble', shortcut: 'u', radius: 700 * LY, cx: 0, cy: 0,
    caption: 'A cavity about 1,000 ly across, swept out by supernovae over the last 14 million years. The star-forming clouds lie on its shell; the outline between them is schematic. Brown is dust, mapped in 3D from Gaia (Lallement et al. 2022); stars are Gaia\u2019s most luminous within 1,500 ly.' },
  { id: 'local-arm', name: 'Local arm', shortcut: 'l', radius: 8000 * LY, cx: 0, cy: 0,
    caption: 'The Sun sits in the Local arm, between the Sagittarius–Carina arm toward the center and the Perseus arm away from it. Arm positions are from maser parallaxes; faint stretches are extrapolated.' },
  { id: 'milky-way', name: 'Milky Way', shortcut: '7', radius: 60e3 * LY, cx: GALACTIC_CENTER.x, cy: GALACTIC_CENTER.y,
    caption: 'Arms fitted to maser parallaxes (Reid et al. 2019), faint where extrapolated. Disk, bulge and bar are schematic.' },
  { id: 'galactic-center', name: 'Galactic center', shortcut: 'g', radius: 4000 * AU, cx: GALACTIC_CENTER.x, cy: GALACTIC_CENTER.y,
    clickName: 'Galactic center',
    caption: 'Stars orbiting Sgr A*, on their measured orbits projected onto the galactic plane, moving with their real periods.' },
  { id: 'sgr-a', name: 'Sgr A*', shortcut: 'b', radius: 1 * AU, cx: GALACTIC_CENTER.x, cy: GALACTIC_CENTER.y,
    clickName: 'Sgr A*',
    caption: 'Horizon, shadow and innermost stable orbit to scale. The glow stands in for the accretion flow.' },
  { id: 'milky-way-halo', name: 'MW halo', shortcut: 'h', radius: 500e3 * LY, cx: 0, cy: 0,
    caption: 'Schematic top-down projection. Radial distances are to scale; galactic latitude is omitted and galaxy sizes are approximate.' },
  { id: 'local-group', name: 'Local Group', shortcut: '8', radius: 3e6 * LY, cx: M31.x / 2, cy: M31.y / 2 },
  ...GALAXY_LEVELS,
  { id: 'virgo', name: 'Virgo Supercluster', shortcut: '9', radius: 60e6 * LY, cx: VIRGO.x / 2, cy: VIRGO.y / 2 },
  { id: 'universe', name: 'Observable universe', shortcut: '0', radius: 58e9 * LY, cx: 0, cy: 0,
    caption: 'Looking outward means looking back in time. Schematic 2D comoving slice; the cosmic web is procedural, not a present-day map.' },
];

// Close-ups around Earth, reached by clicking the craft.
const EARTH_LEVELS = [
  { id: 'iss', name: 'ISS', radius: 20000e3, follow: PLANETS.find((p) => p.name === 'Earth'), clickName: 'ISS' },
  { id: 'jwst', name: 'JWST', radius: 2.2e9, follow: PLANETS.find((p) => p.name === 'Earth'), clickName: 'JWST',
    caption: 'JWST loops around the Sun\u2013Earth L2 point, 1.5 million km beyond Earth, keeping the Sun, Earth and Moon behind its shield.' },
];

// LEVELS first so the inner solar system is the default view.
const ALL_LEVELS = [...LEVELS, ...PLANET_LEVELS, ...EARTH_LEVELS];

// The level bar: a plain level id, or a menu of levels in sections, listed
// widest at the top so a menu reads like the sky above the bar.
const byId = (id) => LEVELS.find((lv) => lv.id === id);
const BAR = [
  { label: 'Planets', sections: [
    { title: 'Dwarf planets', levels: PLANET_LEVELS.filter((lv) => lv.follow.dwarf).reverse() },
    { title: 'Planets', levels: PLANET_LEVELS.filter((lv) => !lv.follow.dwarf).reverse() },
  ] },
  { label: 'Solar system', sections: [{ levels: ['heliosphere', 'trans-neptunian', 'outer', 'inner'].map(byId) }] },
  { label: 'Stellar neighborhood', sections: [
    { levels: [byId('stars')] },
    { title: 'Star systems, farthest first', levels: [...SYSTEM_LEVELS].reverse() },
  ] },
  { label: 'Milky Way', sections: [{ levels: ['milky-way-halo', 'milky-way', 'local-arm', 'local-bubble', 'galactic-center', 'sgr-a'].map(byId) }] },
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
const tourBtn = document.getElementById('tour');
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
let tour = null;
let shownLabels = [];
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
  goTo(ALL_LEVELS.find((lv) => lv.id === TOUR[0]));
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
  const level = ALL_LEVELS.find((lv) => lv.id === TOUR[tour.index]);
  tour.holdUntil = 0;
  goTo(level, false, tourLegMs(cam.mpp, mppFor(level)));
}

function zoomAt(sx, sy, factor) {
  if (overview) return;
  stopTour();
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
  const body = anim ? anim.level.follow : cam.follow;
  if (body) {
    const mpp = anim ? mppFor(anim.level) : cam.mpp;
    const stops = [...PLANET_LEVELS, ...EARTH_LEVELS].filter((lv) => lv.follow === body);
    return stops.reduce((best, lv) => (Math.abs(Math.log(mppFor(lv) / mpp)) < Math.abs(Math.log(mppFor(best) / mpp)) ? lv : best));
  }
  return pickLevel(LEVELS, cam.cx, cam.cy, cam.mpp * halfMin());
}

function drawLabels(view) {
  shownLabels = [];
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';
  const sorted = view.labels.sort((a, b) => b.priority - a.priority);
  // Labels are hidden, never moved. Important labels (priority 2 and up)
  // keep their space from lesser ones, and a faint label, from a layer
  // fading in or out, gives way to anything already drawn.
  const reserved = [];
  const drawn = [];
  const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (const l of sorted) {
    if (l.x < 0 || l.x > w || l.y < 0 || l.y > h) continue;
    const isHover = hover && hover.name === l.text;
    const tw = ctx.measureText(l.text).width;
    const rect = placeLabel(l.x, l.y, tw + 4, 16, { w, h });
    const faint = l.alpha < 0.5;
    if (!isHover && faint && drawn.some((r) => overlaps(r, rect))) continue;
    if (!isHover && l.priority < 2 && reserved.some((r) => overlaps(r, rect))) continue;
    if (l.priority >= 2 && !faint) reserved.push(rect);
    drawn.push(rect);
    shownLabels.push({ rect, text: l.text, x: l.x, y: l.y });
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
  // The Earth close-ups are not in the bar; they show as Earth there.
  const inBar = EARTH_LEVELS.includes(near) ? PLANET_LEVELS.find((lv) => lv.follow === near.follow) : near;
  for (const b of levelsEl.querySelectorAll('button[data-id]')) b.classList.toggle('active', !overview && b.dataset.id === inBar.id);
  for (const m of menus) {
    const open = !overview && m.levels.includes(inBar);
    m.toggle.textContent = `${open ? inBar.name : m.label} ▾`;
    m.toggle.classList.toggle('active', open);
  }
  for (const b of speedsEl.children) b.classList.toggle('active', b.dataset.label === runSpeed.label);
  playBtn.textContent = speed.perSec ? '⏸' : '▶';
  speedToggle.textContent = `${runSpeed.label} ▾`;
  overviewBtn.classList.toggle('active', overview);
  soundBtn.classList.toggle('active', soundOn);
  volumeEl.hidden = !soundOn;
  tourBtn.textContent = tour ? 'Stop tour' : 'Tour';
  tourBtn.classList.toggle('active', !!tour);
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
  b.addEventListener('click', () => { stopTour(); goTo(lv); });
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
  if (!drag.moved) { stopTour(); anim = null; canvas.classList.add('dragging'); drag.moved = true; }
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
  if (level) { stopTour(); goTo(level); }
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
  else if (level) { stopTour(); goTo(level); }
  else if (e.key === ' ') { e.preventDefault(); setSpeed(speed.perSec ? SPEEDS[0] : runSpeed); }
  else if (e.key === '?') { const wasOpen = !helpEl.hidden; closeMenus(); helpEl.hidden = wasOpen; }
  else if (e.key === 'o') { stopTour(); setOverview(!overview); }
  else if (e.key === 'p') { if (tour) stopTour(); else startTour(); }
  else if (e.key === 'm') setSound(!soundOn);
});
window.addEventListener('keydown', resumeSound, { once: true });
window.addEventListener('pointerdown', resumeSound, { once: true });

window.addEventListener('hashchange', () => {
  if (location.hash === '#overview') setOverview(true);
  else goTo(levelFromHash(location.hash, ALL_LEVELS));
});
playBtn.addEventListener('click', () => setSpeed(speed.perSec ? SPEEDS[0] : runSpeed));
overviewBtn.addEventListener('click', () => { stopTour(); setOverview(!overview); });
tourBtn.addEventListener('click', () => { if (tour) stopTour(); else startTour(); });
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
const startOverview = location.hash === '#overview';
goTo(levelFromHash(location.hash, ALL_LEVELS), true);
if (startOverview) setOverview(true);
requestAnimationFrame(frame);
