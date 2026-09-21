import { AtlasRenderer } from './render.js';
import { CATALOG, STOPS, nearestStop } from './catalog.js';
import { clamp, cameraBasis, formatDistance, MIN_RADIUS, MAX_RADIUS, HORIZON, parseView, serializeView } from './model.js';

const $ = id => document.getElementById(id);
const defaultView = { radius: STOPS[0].radius, center: [0, 0, 0], yaw: 0.95, pitch: 0.48, cutaway: true };
let view = parseView(location.hash, defaultView);
let selected = null, animation = null, scheduled = false, saveTimer = 0, currentStop = null;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const atlas = new AtlasRenderer($('space'), $('labels'));
const canvas = $('space');

function invalidate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(frame); }
}
function saveView() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => history.replaceState(null, '', `#${serializeView(view)}`), 250);
}
function frame(now) {
  scheduled = false;
  if (animation) {
    const t = clamp((now - animation.start) / animation.duration, 0, 1);
    const eased = t * t * (3 - 2 * t);
    view.radius = Math.exp(Math.log(animation.from.radius) * (1 - eased) + Math.log(animation.to.radius) * eased);
    view.center = animation.from.center.map((v, i) => v + (animation.to.center[i] - v) * eased);
    if (t === 1) { animation = null; saveView(); }
    else invalidate();
  }
  atlas.draw(view, selected);
  updateUI();
}
function moveTo(radius, center) {
  const to = { radius: clamp(radius, MIN_RADIUS, MAX_RADIUS), center: [...center] };
  if (reducedMotion.matches) { Object.assign(view, to); saveView(); }
  else animation = { from: { radius: view.radius, center: [...view.center] }, to, start: performance.now(), duration: 1100 };
  invalidate();
}
function changeView(change) {
  animation = null;
  change();
  view.radius = clamp(view.radius, MIN_RADIUS, MAX_RADIUS);
  view.pitch = clamp(view.pitch, -1.5, 1.5);
  if (Math.hypot(...view.center) > HORIZON * 1.2) view.center = view.center.map(v => v / Math.hypot(...view.center) * HORIZON * 1.2);
  saveView(); invalidate();
}
function goTo(stop) {
  delete view.focus;
  closeSelection();
  $('search-panel').hidden = true;
  $('search-toggle').setAttribute('aria-expanded', 'false');
  moveTo(stop.radius, stop.center);
}
function reset() {
  const stop = nearestStop(view.radius);
  view.yaw = defaultView.yaw; view.pitch = defaultView.pitch;
  const focused = CATALOG.find(object => object.id === view.focus);
  if (focused) moveTo(Math.max(MIN_RADIUS, focused.radius * 4), focused.position);
  else moveTo(stop.radius, stop.center);
}
function updateUI() {
  const stop = nearestStop(view.radius);
  const focused = CATALOG.find(object => object.id === view.focus);
  const context = `${stop.id}:${focused?.id || ''}`;
  if (context !== currentStop) {
    currentStop = context;
    $('eyebrow').textContent = focused ? `EXPLORING / ${focused.type.toUpperCase()}` : stop.eyebrow;
    $('scene-title').textContent = focused ? focused.name : stop.title;
    $('scene-description').textContent = focused ? `Part of the ${focused.group}. Rotate to see its surroundings, or zoom out to find its place in the larger neighborhood.` : stop.text;
    $('data-key').textContent = focused ? 'Approximate catalog position · illustrative appearance' : stop.key;
    $('data-key').title = stop.detail;
    for (const button of $('stops').children) button.setAttribute('aria-current', String(!focused && button.dataset.stop === stop.id));
    $('find-home').hidden = !focused && stop.id === 'home';
  }
  const fit = atlas.width < 760 ? Math.max(1, atlas.height / atlas.width) : 1;
  $('scale').textContent = `View width · ${formatDistance(view.radius * 2 * atlas.width / atlas.height * fit)}`;
  $('era-key').hidden = view.radius < 5000;
  $('cutaway').hidden = view.radius < 5000;
  $('cutaway').setAttribute('aria-pressed', String(view.cutaway));
  $('cutaway').querySelector('span').textContent = view.cutaway ? 'on' : 'off';
}
for (const stop of STOPS) {
  const button = document.createElement('button');
  button.textContent = matchMedia('(max-width: 760px)').matches ? stop.short : stop.name;
  button.dataset.stop = stop.id;
  button.title = stop.name;
  button.addEventListener('click', () => goTo(stop));
  $('stops').append(button);
}

function closeSelection() { selected = null; $('selection').hidden = true; invalidate(); }
function select(object) {
  selected = object;
  $('selection').hidden = false;
  $('object-type').textContent = object.type.toUpperCase();
  $('object-name').textContent = object.name;
  $('object-distance').textContent = `≈ ${formatDistance(object.distance)}`;
  $('object-group').textContent = object.group;
  $('object-note').textContent = object.note;
  $('object-source').href = object.source;
  $('search-panel').hidden = true;
  $('search-toggle').setAttribute('aria-expanded', 'false');
  invalidate();
}
$('close-selection').addEventListener('click', closeSelection);
$('focus-object').addEventListener('click', () => {
  if (selected) {
    view.focus = selected.id;
    moveTo(Math.max(MIN_RADIUS, selected.radius * 4), selected.position);
  }
});
$('find-home').addEventListener('click', () => goTo(STOPS[3]));
$('reset-view').addEventListener('click', reset);
$('zoom-in').addEventListener('click', () => changeView(() => { view.radius /= 1.7; }));
$('zoom-out').addEventListener('click', () => changeView(() => { view.radius *= 1.7; }));
$('cutaway').addEventListener('click', () => changeView(() => { view.cutaway = !view.cutaway; }));
$('about-toggle').addEventListener('click', () => $('about').showModal());
$('close-about').addEventListener('click', () => $('about').close());

function search() {
  const query = $('search').value.trim().toLowerCase();
  const matches = CATALOG.filter(object => object.name.toLowerCase().includes(query));
  $('search-results').replaceChildren();
  for (const object of matches) {
    const button = document.createElement('button');
    button.append(document.createTextNode(object.name));
    const small = document.createElement('small');
    small.textContent = `${object.type} · ${formatDistance(object.distance)}`;
    button.append(small);
    button.addEventListener('click', () => { select(object); $('focus-object').focus(); });
    $('search-results').append(button);
  }
  if (!matches.length) $('search-results').textContent = 'No match in this draft’s selected catalog.';
}
function toggleSearch() {
  $('search-panel').hidden = !$('search-panel').hidden;
  $('search-toggle').setAttribute('aria-expanded', String(!$('search-panel').hidden));
  if (!$('search-panel').hidden) { $('selection').hidden = true; search(); $('search').focus(); }
}
$('search-toggle').addEventListener('click', toggleSearch);
$('search').addEventListener('input', search);
$('search').addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') { event.preventDefault(); $('search-results').querySelector('button')?.focus(); }
  if (event.key === 'Enter') $('search-results').querySelector('button')?.click();
});

const pointers = new Map();
let startPoint = null, dragged = false;
function pan(dx, dy) {
  const basis = cameraBasis(view.yaw, view.pitch);
  const fit = atlas.width < 760 ? Math.max(1, atlas.height / atlas.width) : 1;
  const scale = view.radius * 2 * fit / atlas.height;
  view.center = view.center.map((v, i) => v - basis.right[i] * dx * scale + basis.up[i] * dy * scale);
}
canvas.addEventListener('pointerdown', event => {
  canvas.focus({ preventScroll: true });
  animation = null;
  canvas.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 1) { startPoint = { x: event.clientX, y: event.clientY }; dragged = false; }
  else dragged = true;
});
canvas.addEventListener('pointermove', event => {
  const old = pointers.get(event.pointerId);
  if (!old) return;
  const next = { x: event.clientX, y: event.clientY };
  if (Math.hypot(next.x - startPoint.x, next.y - startPoint.y) > 5) dragged = true;
  if (!dragged) return;
  changeView(() => {
    if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)[1];
      const before = Math.hypot(old.x - other.x, old.y - other.y);
      const after = Math.hypot(next.x - other.x, next.y - other.y);
      if (before > 2 && after > 2) view.radius *= before / after;
      pan((next.x - old.x) / 2, (next.y - old.y) / 2);
    } else if (event.shiftKey || event.buttons === 2) pan(next.x - old.x, next.y - old.y);
    else { view.yaw -= (next.x - old.x) * 0.006; view.pitch += (next.y - old.y) * 0.006; }
    pointers.set(event.pointerId, next);
  });
});
function release(event) {
  if (!pointers.has(event.pointerId)) return;
  if (!dragged && event.type === 'pointerup') {
    const bounds = canvas.getBoundingClientRect();
    const object = atlas.pick(event.clientX - bounds.left, event.clientY - bounds.top);
    if (object) select(object); else closeSelection();
  }
  pointers.delete(event.pointerId);
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('lostpointercapture', event => pointers.delete(event.pointerId));
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? atlas.height : 1);
  changeView(() => { view.radius *= Math.exp(clamp(delta, -300, 300) * 0.002); });
}, { passive: false });
document.addEventListener('keydown', event => {
  if ($('about').open) return;
  if (event.key === 'Escape') {
    $('search-panel').hidden = true; $('search-toggle').setAttribute('aria-expanded', 'false');
    closeSelection(); canvas.focus(); return;
  }
  if (event.target.closest('input, textarea, button, a, [contenteditable]')) return;
  if (event.key === '/') { event.preventDefault(); toggleSearch(); return; }
  if (event.key.toLowerCase() === 'r') { reset(); return; }
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_'].includes(event.key)) return;
  event.preventDefault();
  changeView(() => {
    if (event.key === 'ArrowLeft') view.yaw -= 0.12;
    if (event.key === 'ArrowRight') view.yaw += 0.12;
    if (event.key === 'ArrowUp') view.pitch += 0.12;
    if (event.key === 'ArrowDown') view.pitch -= 0.12;
    if (['+', '='].includes(event.key)) view.radius /= 1.3;
    if (['-', '_'].includes(event.key)) view.radius *= 1.3;
  });
});
window.addEventListener('hashchange', () => { animation = null; view = parseView(location.hash, defaultView); invalidate(); });
new ResizeObserver(() => {
  atlas.resize();
  for (const button of $('stops').children) {
    const stop = STOPS.find(stop => stop.id === button.dataset.stop);
    button.textContent = atlas.width < 760 ? stop.short : stop.name;
  }
  invalidate();
}).observe($('stage'));
canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); $('fallback').hidden = false; });
canvas.addEventListener('webglcontextrestored', () => location.reload());
$('loading').hidden = true;
if (matchMedia('(pointer: coarse)').matches) $('gesture-hint').textContent = 'One finger rotates · Two fingers zoom and pan · Tap to discover';
atlas.resize();
invalidate();
