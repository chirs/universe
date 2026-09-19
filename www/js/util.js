import { J2000_MS, DAY_S } from './data.js';

export function daysSinceJ2000(ms) {
  return (ms - J2000_MS) / (DAY_S * 1000);
}

// Mean longitude in degrees at `days` after J2000, for a circular orbit.
export function meanLongitude(body, days) {
  const L = body.L0 + (body.retrograde ? -360 : 360) * days / body.period;
  return ((L % 360) + 360) % 360;
}

// Eccentric anomaly from mean anomaly (radians) by Newton's method.
export function solveKepler(M, e) {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 30; i++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  return E;
}

// Position in meters, Sun at the focus, counterclockwise from +x.
export function orbitalPosition(body, days) {
  const e = body.e || 0;
  const varpi = (body.varpi || 0) * Math.PI / 180;
  const M = meanLongitude(body, days) * Math.PI / 180 - varpi;
  const E = solveKepler(M, e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = body.a * (1 - e * Math.cos(E));
  return { x: r * Math.cos(nu + varpi), y: r * Math.sin(nu + varpi) };
}

export function lerp(a, b, u) {
  return a + (b - a) * u;
}

export function lerpLog(a, b, u) {
  return Math.exp(lerp(Math.log(a), Math.log(b), u));
}

export function easeInOut(u) {
  return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
}

// Alpha for a layer visible between range[0] and range[1] meters/pixel,
// fading over half a decade at each edge.
export function layerAlpha(mpp, [lo, hi]) {
  const l = Math.log10(mpp);
  const fade = 0.5;
  const a = Math.min(1, (l - Math.log10(lo)) / fade + 1);
  const b = Math.min(1, (Math.log10(hi) - l) / fade + 1);
  return Math.max(0, Math.min(a, b));
}

// Largest 1/2/5 x 10^n length in a sensible unit that fits in maxPx.
export function niceScaleBar(mpp, maxPx, units) {
  const maxMeters = mpp * maxPx;
  for (const [name, size] of units) {
    const value = maxMeters / size;
    if (value < 1) continue;
    const exp = Math.floor(Math.log10(value));
    const mant = value / Math.pow(10, exp);
    const nice = mant >= 5 ? 5 : mant >= 2 ? 2 : 1;
    const n = nice * Math.pow(10, exp);
    return { meters: n * size, px: n * size / mpp, label: `${formatNumber(n)} ${name}` };
  }
  const [name, size] = units[units.length - 1];
  return { meters: size, px: size / mpp, label: `1 ${name}` };
}

export function formatNumber(n) {
  return n >= 1000 ? n.toLocaleString('en-US') : String(n);
}

// Deterministic 32-bit PRNG. Returns floats in [0, 1).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Place an object at its true distance, in the direction of its galactic
// longitude: +x toward the galactic center, +y toward l = 90. Latitude is
// dropped rather than projected so distances stay to scale.
export function skyToPlane(l, dist) {
  const lr = l * Math.PI / 180;
  return { x: dist * Math.cos(lr), y: dist * Math.sin(lr) };
}

export function levelFromHash(hash, levels) {
  const id = (hash || '').replace(/^#/, '');
  return levels.find((lv) => lv.id === id) || levels[0];
}

export function formatDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function shouldIgnoreGlobalKeys(tagName, isContentEditable = false) {
  return isContentEditable || ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tagName);
}

// Find a spot for a w x h label beside the point (x, y): to the right, then
// left, above, below. Returns the rect, or null if every spot collides with a
// placed rect or leaves the bounds.
export function placeLabel(x, y, w, h, placed, bounds, gap = 8) {
  const candidates = [
    { x: x + gap, y: y - h / 2 },
    { x: x - gap - w, y: y - h / 2 },
    { x: x - w / 2, y: y - gap - h },
    { x: x - w / 2, y: y + gap },
  ];
  for (const c of candidates) {
    const rect = { x: c.x, y: c.y, w, h };
    if (rect.x < 0 || rect.y < 0 || rect.x + w > bounds.w || rect.y + h > bounds.h) continue;
    const clash = placed.some((r) => rect.x < r.x + r.w && rect.x + w > r.x && rect.y < r.y + r.h && rect.y + h > r.y);
    if (!clash) return rect;
  }
  return null;
}

// Stops of the guided tour, in order, and how long a leg between two zooms
// should take: a fixed rate of about a second per decade, plus a floor.
export const TOUR = ['earth-moon', 'inner', 'outer', 'stars', 'milky-way', 'local-group', 'virgo', 'universe'];
export const TOUR_HOLD_MS = 2500;

export function tourLegMs(fromMpp, toMpp) {
  const decades = Math.abs(Math.log10(toMpp / fromMpp));
  return 900 + 1000 * decades;
}
