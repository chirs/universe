import { mulberry32 } from '../js/util.js';

export const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function spherical(longitude, latitude, distance) {
  const l = longitude * Math.PI / 180;
  const b = latitude * Math.PI / 180;
  return [distance * Math.cos(b) * Math.cos(l), distance * Math.cos(b) * Math.sin(l), distance * Math.sin(b)];
}

// Supergalactic pole and zero longitude: de Vaucouleurs convention.
const sgX = spherical(137.37, 0, 1);
const sgZ = spherical(47.37, 6.32, 1);
const sgY = cross(sgZ, sgX);
export const SG_AXES = [sgX, sgY, sgZ];
export function toSupergalactic(position) {
  return SG_AXES.map(axis => dot(axis, position));
}
export function fromSupergalactic(position) {
  return [0, 1, 2].map(i => dot(position, SG_AXES.map(axis => axis[i])));
}
export function galacticPosition(l, b, distance) {
  return toSupergalactic(spherical(l, b, distance));
}

// Distances are Mly; time is Gyr. Flat LCDM, including radiation at early times.
// Planck-like parameters: H0=67.4, Omega_m=0.315, Omega_r=0.000092.
export function cosmologyTable(steps = 4096) {
  const matter = 0.315, radiation = 0.000092;
  const expansion = a => Math.sqrt(radiation / a ** 4 + matter / a ** 3 + 1 - matter - radiation);
  const hubbleDistance = 299792.458 / 67.4 * 3.261563777;
  const hubbleTime = 9.778 / 0.674;
  const rows = [{ z: 0, distance: 0, lookback: 0 }];
  let distance = 0, lookback = 0, previous = 1;
  for (let i = 1; i <= steps; i++) {
    const a = Math.exp(-i / steps * Math.log(1e8));
    const da = previous - a;
    distance += da / 2 * (1 / (a * a * expansion(a)) + 1 / (previous * previous * expansion(previous))) * hubbleDistance;
    lookback += da / 2 * (1 / (a * expansion(a)) + 1 / (previous * expansion(previous))) * hubbleTime;
    rows.push({ z: 1 / a - 1, distance, lookback });
    previous = a;
  }
  return rows;
}
export const COSMOLOGY = cosmologyTable();
export function cosmologyAt(value, key = 'distance') {
  const v = clamp(value, 0, COSMOLOGY.at(-1)[key]);
  let lo = 0, hi = COSMOLOGY.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (COSMOLOGY[mid][key] < v) lo = mid;
    else hi = mid;
  }
  const a = COSMOLOGY[lo], b = COSMOLOGY[hi];
  const t = (v - a[key]) / (b[key] - a[key]);
  return Object.fromEntries(['z', 'distance', 'lookback'].map(k => [k, a[k] + (b[k] - a[k]) * t]));
}
export const HORIZON = COSMOLOGY.at(-1).distance;
export const CMB = cosmologyAt(1089, 'z').distance;
export const FIRST_GALAXIES = cosmologyAt(20, 'z').distance;
export const MIN_RADIUS = 0.18;
export const MAX_RADIUS = HORIZON * 1.35;

export function formatDistance(mly) {
  if (mly >= 1000) return `${(mly / 1000).toLocaleString('en', { maximumFractionDigits: 1 })} billion ly`;
  if (mly >= 1) return `${mly.toLocaleString('en', { maximumFractionDigits: 2 })} million ly`;
  return `${(mly * 1e6).toLocaleString('en', { maximumSignificantDigits: 3 })} ly`;
}

export function cameraBasis(yaw, pitch) {
  const forward = [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)];
  const right = [-Math.sin(yaw), Math.cos(yaw), 0];
  return { forward, right, up: cross(forward, right) };
}
export function inCutaway(point, basis) {
  return dot(point, basis.forward) > 0 && dot(point, basis.right) > Math.abs(dot(point, basis.up)) * 0.2;
}
export function renderPosition(position, center, radius) {
  return position.map((v, i) => (v - center[i]) / radius);
}
export function serializeView(view) {
  const params = new URLSearchParams({ r: view.radius.toPrecision(8), c: view.center.map(v => v.toPrecision(8)).join(','),
    a: [view.yaw, view.pitch].map(v => v.toFixed(5)).join(','), cut: view.cutaway ? '1' : '0' });
  if (view.focus) params.set('f', view.focus);
  return params.toString();
}
export function parseView(hash, fallback) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const radius = Number(params.get('r'));
  const center = (params.get('c') || '').split(',').map(Number);
  const angles = (params.get('a') || '').split(',').map(Number);
  if (!params.has('r') || !Number.isFinite(radius) || center.length !== 3 || angles.length !== 2 ||
      [...center, ...angles].some(v => !Number.isFinite(v)) || Math.hypot(...center) > HORIZON * 2) return { ...fallback, center: [...fallback.center] };
  const result = { radius: clamp(radius, MIN_RADIUS, MAX_RADIUS), center, yaw: angles[0] % (2 * Math.PI),
    pitch: clamp(angles[1], -1.5, 1.5), cutaway: params.get('cut') !== '0' };
  if (/^[a-z0-9-]+$/.test(params.get('f') || '')) result.focus = params.get('f');
  return result;
}

export function makeCloud(count, radius, seed, hole = 0) {
  const random = mulberry32(seed);
  const points = [];
  for (let i = 0; i < count; i++) {
    const r = Math.cbrt(hole ** 3 + random() * (radius ** 3 - hole ** 3));
    const z = random() * 2 - 1, angle = random() * Math.PI * 2;
    const xy = Math.sqrt(1 - z * z);
    points.push([r * xy * Math.cos(angle), r * xy * Math.sin(angle), r * z]);
  }
  return points;
}

// A deterministic illustrative 3D web. No particle is a catalogued galaxy.
export function makeWeb(radius, seed, count = 700) {
  const nodes = makeCloud(count, radius, seed);
  const random = mulberry32(seed + 1), points = [];
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const neighbors = nodes.map((b, j) => ({ j, d: Math.hypot(...a.map((v, k) => v - b[k])) }))
      .filter(n => n.j !== i).sort((a, b) => a.d - b.d).slice(0, 3);
    for (const { j, d } of neighbors) {
      if (j < i) continue;
      const b = nodes[j], bend = [random() - 0.5, random() - 0.5, random() - 0.5];
      for (let n = 0; n < 52; n++) {
        const t = random();
        points.push(a.map((v, k) => v + (b[k] - v) * t + Math.sin(t * Math.PI) * bend[k] * d * 0.35 + (random() - 0.5) * radius * 0.014));
      }
    }
  }
  return points.filter(p => Math.hypot(...p) > 550 && Math.hypot(...p) < radius);
}
