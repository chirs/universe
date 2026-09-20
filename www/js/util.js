import { J2000_MS, DAY_S, AU, LY } from './data.js';

const OFFICIAL_DWARF_PLANETS = new Set(['Ceres', 'Pluto', 'Haumea', 'Makemake', 'Eris']);

function compactNumber(value) {
  const abs = Math.abs(value);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return Number(value.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
}

export function formatDistance(meters) {
  const units = [
    [1e9 * LY, 1e9 * LY, 'Gly'],
    [1e6 * LY, 1e6 * LY, 'Mly'],
    [1e3 * LY, 1e3 * LY, 'kly'],
    [0.1 * LY, LY, 'ly'],
    [0.1 * AU, AU, 'AU'],
    [1e9, 1e9, 'million km'],
    [1000, 1000, 'km'],
  ];
  const [, size, name] = units.find(([threshold]) => meters >= threshold) || units[units.length - 1];
  return `${compactNumber(meters / size)} ${name}`;
}

export function formatPeriod(days) {
  let value;
  let singular;
  let plural;
  if (days >= 365) {
    value = days / 365.25;
    singular = 'year';
    plural = 'years';
  } else if (days >= 1) {
    value = days;
    singular = 'day';
    plural = 'days';
  } else {
    value = days * 24;
    singular = 'hour';
    plural = 'hours';
  }
  return `${compactNumber(value)} ${Math.abs(value - 1) < 0.005 ? singular : plural}`;
}

export function planetSummary(body) {
  const kind = body.dwarf
    ? OFFICIAL_DWARF_PLANETS.has(body.name) ? 'Dwarf planet' : 'Dwarf-planet candidate'
    : 'Planet';
  return `${kind} · radius ${formatDistance(body.radius)} · orbit ${formatDistance(body.a)} · period ${formatPeriod(body.period)}`;
}

export function moonSummary(moon, parentName) {
  return `Moon of ${parentName} · radius ${formatDistance(moon.radius)} · orbit ${formatDistance(moon.a)} · period ${formatPeriod(moon.period)}`;
}

export function starSummary(star) {
  const parts = ['Star'];
  if (star.radius) parts.push(`radius ${formatDistance(star.radius)}`);
  if (star.dist) parts.push(`${formatDistance(star.dist * LY)} from the Sun`);
  if (star.mag !== undefined) parts.push(`apparent magnitude ${compactNumber(star.mag)}`);
  return parts.join(' · ');
}

export function galaxySummary(galaxy) {
  const kind = galaxy.spiral ? 'Spiral galaxy' : 'Galaxy';
  const distance = galaxy.dist ? `${formatDistance(galaxy.dist * LY)} from the Milky Way` : 'our galaxy';
  return `${kind} · ${distance} · approximate radius ${formatDistance(galaxy.size * LY)}`;
}

export function clusterSummary(cluster) {
  const kind = cluster.name.includes('Group') ? 'Galaxy group' : 'Galaxy cluster';
  const distance = cluster.dist ? `${formatDistance(cluster.dist * 1e6 * LY)} from the Milky Way` : 'centered on the Milky Way';
  return `${kind} · ${distance} · approximate diameter ${formatDistance(cluster.size * 1e6 * LY)}`;
}

export function landmarkSummary(landmark) {
  return `Large-scale structure · ${formatDistance(landmark.dist)} from the Milky Way · approximate size ${formatDistance(landmark.size)}`;
}

export function observableUniverseSummary(radius) {
  return `Observable horizon · radius ${formatDistance(radius)} (comoving) · universe age about 13.8 billion years`;
}

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

// A procedural cosmic web by the Zel'dovich approximation: particles on a
// lattice are pushed along the gradient of a smooth random potential and pile
// up into curved sheets, filaments and knots. kind 2 marks the densest knots,
// kind 1 filaments, kind 0 the sparse field between. Particles whose starting
// point lies within `hole` of the origin are left out, with a soft edge.
export function makeZeldovichWeb(seed, radius, nCells, nPoints, hole = 0) {
  const rand = mulberry32(seed);
  const L = 2 * radius / Math.sqrt(nCells);

  // Potential: three octaves of value noise on lattices of spacing L, L/2, L/4.
  const octaves = [1, 0.4, 0.15].map((amp, k) => {
    const spacing = L / 2 ** k;
    const n = Math.ceil(2 * radius / spacing) + 3;
    const grid = new Float64Array(n * n);
    for (let i = 0; i < grid.length; i++) grid[i] = rand() - 0.5;
    return { amp, spacing, n, grid };
  });
  const smooth = (t) => t * t * (3 - 2 * t);
  const phi = (x, y) => {
    let v = 0;
    for (const { amp, spacing, n, grid } of octaves) {
      const gx = (x + radius) / spacing + 1;
      const gy = (y + radius) / spacing + 1;
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      const fx = smooth(gx - ix);
      const fy = smooth(gy - iy);
      const top = grid[iy * n + ix] * (1 - fx) + grid[iy * n + ix + 1] * fx;
      const bottom = grid[(iy + 1) * n + ix] * (1 - fx) + grid[(iy + 1) * n + ix + 1] * fx;
      v += amp * (top * (1 - fy) + bottom * fy);
    }
    return v;
  };

  // Particles on a jittered lattice inside the disc, outside the hole.
  const side = Math.ceil(Math.sqrt(nPoints * 4 / Math.PI));
  const step = 2 * radius / side;
  const q = [];
  for (let j = 0; j < side; j++) {
    for (let i = 0; i < side; i++) {
      const x = -radius + (i + rand()) * step;
      const y = -radius + (j + rand()) * step;
      const r = Math.hypot(x, y);
      if (r > radius) continue;
      if (hole && r < hole && rand() > (r - 0.85 * hole) / (0.15 * hole)) continue;
      q.push(x, y);
    }
  }

  // Displace along -grad(phi), scaled so the rms push is a fraction of a cell.
  const h = L / 16;
  const psi = new Float64Array(q.length);
  let sum = 0;
  for (let i = 0; i < q.length; i += 2) {
    const x = q[i];
    const y = q[i + 1];
    psi[i] = -(phi(x + h, y) - phi(x - h, y)) / (2 * h);
    psi[i + 1] = -(phi(x, y + h) - phi(x, y - h)) / (2 * h);
    sum += psi[i] * psi[i] + psi[i + 1] * psi[i + 1];
  }
  const D = 0.2 * L / Math.sqrt(sum / (q.length / 2));
  const moved = [];
  for (let i = 0; i < q.length; i += 2) {
    const x = q[i] + D * psi[i];
    const y = q[i + 1] + D * psi[i + 1];
    if (Math.hypot(x, y) <= radius) moved.push(x, y);
  }
  const pts = Float64Array.from(moved);

  // Classify by local crowding: bin the final positions and rank by count.
  const bin = L / 10;
  const m = Math.ceil(2 * radius / bin) + 1;
  const counts = new Uint16Array(m * m);
  const cell = (i) => Math.floor((pts[i + 1] + radius) / bin) * m + Math.floor((pts[i] + radius) / bin);
  for (let i = 0; i < pts.length; i += 2) counts[cell(i)]++;
  const per = new Uint16Array(pts.length / 2);
  for (let i = 0; i < pts.length; i += 2) per[i / 2] = counts[cell(i)];
  const sorted = Uint16Array.from(per).sort();
  const t1 = sorted[Math.floor(sorted.length * 0.5)];
  const t2 = sorted[Math.floor(sorted.length * 0.9)];
  const kind = new Uint8Array(per.length);
  for (let i = 0; i < per.length; i++) kind[i] = per[i] >= t2 ? 2 : per[i] >= t1 ? 1 : 0;
  return { pts, kind };
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

export function levelFromShortcut(key, levels) {
  return levels.find((lv) => lv.shortcut === key.toLowerCase()) || null;
}

export function hashForView(overview, levelId) {
  return overview ? '#overview' : `#${levelId}`;
}

export function moonSystemRadius(body) {
  return 1.3 * Math.max(...body.moons.map((moon) => moon.a * (1 + (moon.e || 0))));
}

// One camera stop per body with modeled moons, in distance order.
export function moonLevels(planets) {
  return planets.filter((p) => p.moons).map((p) => ({
    id: p.name === 'Earth' ? 'earth-moon' : p.name.toLowerCase(),
    name: `${p.name} & ${p.moons.length === 1 ? p.moons[0].name : 'moons'}`,
    radius: moonSystemRadius(p),
    follow: p,
  }));
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
export const TOUR = [
  'earth-moon', 'inner', 'outer', 'trans-neptunian', 'stars',
  'milky-way', 'milky-way-halo', 'local-group', 'virgo', 'universe',
];
export const TOUR_HOLD_MS = 2500;

export function tourLegMs(fromMpp, toMpp) {
  const decades = Math.abs(Math.log10(toMpp / fromMpp));
  return 900 + 1000 * decades;
}
