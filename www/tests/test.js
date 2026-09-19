import test from 'node:test';
import assert from 'node:assert/strict';
import {
  meanLongitude, orbitalPosition, solveKepler, lerpLog, easeInOut, layerAlpha,
  niceScaleBar, mulberry32, skyToPlane, levelFromHash, daysSinceJ2000,
} from '../js/util.js';
import { PLANETS, STARS, LOCAL_GROUP, SCALE_UNITS, AU, LY, J2000_MS } from '../js/data.js';

const earth = PLANETS.find((p) => p.name === 'Earth');

test('mean longitude at J2000 is L0 and advances a full turn per period', () => {
  assert.equal(meanLongitude(earth, 0), earth.L0);
  assert.ok(Math.abs(meanLongitude(earth, earth.period) - earth.L0) < 1e-9);
  assert.ok(Math.abs(meanLongitude(earth, earth.period / 2) - ((earth.L0 + 180) % 360)) < 1e-9);
});

test('solveKepler satisfies Kepler\'s equation', () => {
  for (const e of [0, 0.0167, 0.2056, 0.25, 0.9]) {
    for (const M of [0, 0.5, 2, Math.PI, 5]) {
      const E = solveKepler(M, e);
      assert.ok(Math.abs(E - e * Math.sin(E) - M) < 1e-9, `e=${e} M=${M}`);
    }
  }
});

test('orbital radius runs from perihelion to aphelion', () => {
  const mercury = PLANETS.find((p) => p.name === 'Mercury');
  const lo = mercury.a * (1 - mercury.e);
  const hi = mercury.a * (1 + mercury.e);
  let min = Infinity;
  let max = 0;
  for (let d = 0; d < mercury.period; d += 0.25) {
    const { x, y } = orbitalPosition(mercury, d);
    const r = Math.hypot(x, y);
    min = Math.min(min, r);
    max = Math.max(max, r);
  }
  assert.ok(Math.abs(min - lo) / lo < 1e-4);
  assert.ok(Math.abs(max - hi) / hi < 1e-4);
});

test('perihelion lies in the direction of varpi', () => {
  const mercury = PLANETS.find((p) => p.name === 'Mercury');
  // Mean anomaly is zero when the mean longitude equals varpi.
  const days = ((mercury.varpi - mercury.L0 + 360) % 360) / 360 * mercury.period;
  const { x, y } = orbitalPosition(mercury, days);
  const angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  assert.ok(Math.abs(angle - mercury.varpi) < 1e-6);
  assert.ok(Math.abs(Math.hypot(x, y) - mercury.a * (1 - mercury.e)) < 1);
});

test('a circular orbit stays at the semi-major axis', () => {
  const circle = { ...earth, e: 0 };
  for (const d of [0, 100, 1000]) {
    const { x, y } = orbitalPosition(circle, d);
    assert.ok(Math.abs(Math.hypot(x, y) - earth.a) < 1);
  }
});

test('daysSinceJ2000 is zero at the epoch', () => {
  assert.equal(daysSinceJ2000(J2000_MS), 0);
  assert.equal(daysSinceJ2000(J2000_MS + 86400e3), 1);
});

test('lerpLog hits endpoints and the geometric midpoint', () => {
  assert.equal(lerpLog(1, 100, 0), 1);
  assert.ok(Math.abs(lerpLog(1, 100, 1) - 100) < 1e-9);
  assert.ok(Math.abs(lerpLog(1, 100, 0.5) - 10) < 1e-9);
});

test('easeInOut is monotonic through the endpoints', () => {
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.equal(easeInOut(0.5), 0.5);
  assert.ok(easeInOut(0.25) < easeInOut(0.5));
});

test('layerAlpha is 1 inside the range and fades to 0 outside', () => {
  const r = [1e6, 1e9];
  assert.equal(layerAlpha(1e7, r), 1);
  assert.equal(layerAlpha(1e6, r), 1);
  assert.ok(layerAlpha(10 ** 5.75, r) > 0 && layerAlpha(10 ** 5.75, r) < 1);
  assert.equal(layerAlpha(1e5, r), 0);
  assert.equal(layerAlpha(1e10, r), 0);
});

test('niceScaleBar picks a 1/2/5 length that fits', () => {
  for (const mpp of [1e3, 1e7, 1e9, 1e12, 1e15, 1e20, 1e24]) {
    const bar = niceScaleBar(mpp, 200, SCALE_UNITS);
    assert.ok(bar.px <= 200 && bar.px > 40, `${mpp}: ${bar.px}`);
    const mant = Number(bar.label.split(' ')[0].replace(/,/g, ''));
    const lead = Number(String(mant).replace(/0+$/, '').replace(/\./, ''));
    assert.ok([1, 2, 5].includes(lead), bar.label);
  }
  assert.equal(niceScaleBar(AU / 100, 200, SCALE_UNITS).label, '2 AU');
  assert.equal(niceScaleBar(LY * 1e6 / 100, 200, SCALE_UNITS).label, '2 Mly');
});

test('mulberry32 is deterministic and in [0, 1)', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 100; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
});

test('skyToPlane keeps the true distance', () => {
  const p = skyToPlane(0, 10);
  assert.ok(Math.abs(p.x - 10) < 1e-9 && Math.abs(p.y) < 1e-9);
  const q = skyToPlane(90, 10);
  assert.ok(Math.abs(q.x) < 1e-9 && Math.abs(q.y - 10) < 1e-9);
  const r = skyToPlane(217, 10);
  assert.ok(Math.abs(Math.hypot(r.x, r.y) - 10) < 1e-9);
});

test('levelFromHash falls back to the first level', () => {
  const levels = [{ id: 'inner' }, { id: 'milky-way' }];
  assert.equal(levelFromHash('#milky-way', levels).id, 'milky-way');
  assert.equal(levelFromHash('#nope', levels).id, 'inner');
  assert.equal(levelFromHash('', levels).id, 'inner');
  assert.equal(levelFromHash(undefined, levels).id, 'inner');
});

test('planet data is complete and ordered outward', () => {
  let last = 0;
  for (const p of PLANETS) {
    assert.ok(p.a > last, p.name);
    assert.ok(p.period > 0 && p.radius > 0 && p.L0 >= 0 && p.L0 < 360, p.name);
    assert.ok(p.e >= 0 && p.e < 1 && p.varpi >= 0 && p.varpi < 360, p.name);
    last = p.a;
  }
});

test('moons orbit well inside their planet\'s neighborhood', () => {
  const withMoons = PLANETS.filter((p) => p.moons);
  assert.deepEqual(withMoons.map((p) => p.name), ['Earth', 'Jupiter']);
  for (const p of withMoons) {
    let last = 0;
    for (const m of p.moons) {
      assert.ok(m.a > last && m.a < p.a / 50, m.name);
      assert.ok(m.period > 0 && m.radius > 0 && m.L0 >= 0 && m.L0 < 360, m.name);
      last = m.a;
    }
  }
  const moon = withMoons[0].moons[0];
  const { x, y } = orbitalPosition(moon, 0);
  const r = Math.hypot(x, y);
  assert.ok(r > moon.a * (1 - moon.e) - 1 && r < moon.a * (1 + moon.e) + 1);
});

test('star and galaxy coordinates are in range', () => {
  for (const s of [...STARS, ...LOCAL_GROUP]) {
    assert.ok(s.dist >= 0 && s.l >= 0 && s.l < 360 && s.b >= -90 && s.b <= 90, s.name);
  }
  assert.ok(STARS.every((s) => s.dist < 20));
});
