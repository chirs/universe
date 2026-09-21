import test from 'node:test';
import assert from 'node:assert/strict';
import { spherical, toSupergalactic, fromSupergalactic, galacticPosition, cameraBasis, dot, renderPosition,
  COSMOLOGY, cosmologyAt, HORIZON, CMB, FIRST_GALAXIES, MIN_RADIUS, MAX_RADIUS, makeCloud, makeWeb, inCutaway, parseView, serializeView } from '../v2/model.js';
import { CATALOG, GALAXIES, GROUPS, STOPS } from '../v2/catalog.js';

const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
test('3D coordinates retain latitude, preserve distances, and round trip between frames', () => {
  near(Math.hypot(...spherical(42, 83, 100)), 100);
  near(spherical(0, 90, 10)[2], 10);
  const a = spherical(121.2, -21.6, 2.54), b = spherical(133.6, -31.3, 2.73);
  const aa = toSupergalactic(a), bb = toSupergalactic(b);
  a.forEach((v, i) => near(fromSupergalactic(aa)[i], v));
  near(Math.hypot(...a.map((v, i) => v - b[i])), Math.hypot(...aa.map((v, i) => v - bb[i])));
  near(galacticPosition(47.37, 6.32, 1)[2], 1);
});
test('camera rotation is orthonormal and preserves pairwise 3D separation', () => {
  for (const [yaw, pitch] of [[0, 0], [0.95, 0.48], [-3, 1.49]]) {
    const basis = Object.values(cameraBasis(yaw, pitch));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) near(dot(basis[i], basis[j]), i === j ? 1 : 0);
    const offset = [2.5, -3, 0.8];
    near(Math.hypot(...basis.map(axis => dot(axis, offset))), Math.hypot(...offset));
  }
});
test('camera rebasing preserves small offsets in a distant focus', () => {
  const center = [32000, -14000, 27000];
  const p = center.map((v, i) => v + [0.0001, -0.0002, 0.0003][i]);
  renderPosition(p, center, 0.001).forEach((v, i) => near(v, [0.1, -0.2, 0.3][i], 1e-8));
});
test('cosmology follows expected LCDM reference ranges and distinguishes light time from distance', () => {
  const z1 = cosmologyAt(1, 'z');
  near(z1.distance / 3.261563777, 3401, 12);
  near(z1.lookback, 7.95, 0.04);
  near(COSMOLOGY.at(-1).lookback, 13.80, 0.04);
  assert.ok(HORIZON > 45000 && HORIZON < 47500);
  assert.ok(FIRST_GALAXIES < CMB && CMB < HORIZON);
  assert.ok(z1.distance / 1000 > z1.lookback);
  for (let i = 1; i < COSMOLOGY.length; i++) {
    assert.ok(COSMOLOGY[i].distance > COSMOLOGY[i - 1].distance);
    assert.ok(COSMOLOGY[i].lookback >= COSMOLOGY[i - 1].lookback);
  }
  near(cosmologyAt(z1.distance).z, 1, 1e-5);
});
test('catalog objects have complete positions, unique identities, and a monotonic inward journey', () => {
  assert.equal(new Set(CATALOG.map(o => o.id)).size, CATALOG.length);
  for (const o of CATALOG) {
    assert.ok(o.position.every(Number.isFinite));
    near(Math.hypot(...o.position), o.distance, 1e-6);
    assert.ok(o.radius > 0 && o.source.startsWith('https://'));
  }
  assert.equal(GALAXIES.length, 18);
  assert.ok(GROUPS.find(o => o.name === 'Virgo Cluster'));
  for (let i = 1; i < STOPS.length; i++) assert.ok(STOPS[i].radius < STOPS[i - 1].radius);
});
test('share URLs round trip and reject malformed or unbounded state', () => {
  const view = { radius: 3.2, center: [1, -2, 0.1], yaw: 0.95, pitch: 0.48, cutaway: false };
  assert.deepEqual(parseView(serializeView(view), {}), view);
  const focused = { ...view, focus: 'andromeda-m31' };
  assert.deepEqual(parseView(serializeView(focused), {}), focused);
  assert.deepEqual(parseView('#r=oops', view), view);
  assert.deepEqual(parseView('#r=1&c=Infinity,0,0&a=0,0', view), view);
  assert.equal(parseView('#r=-2&c=0,0,0&a=0,3', view).radius, MIN_RADIUS);
  assert.equal(parseView('#r=1e30&c=0,0,0&a=0,3', view).radius, MAX_RADIUS);
});
test('illustrations are reproducible, bounded, and leave the catalog region empty', () => {
  assert.deepEqual(makeCloud(10, 100, 4, 50), makeCloud(10, 100, 4, 50));
  for (const p of makeCloud(100, 100, 4, 50)) assert.ok(Math.hypot(...p) >= 50 && Math.hypot(...p) <= 100);
  const web = makeWeb(1000, 19, 30);
  assert.deepEqual(web, makeWeb(1000, 19, 30));
  assert.ok(web.length > 0);
  for (const p of web) assert.ok(Math.hypot(...p) > 550 && Math.hypot(...p) < 1000);
});
test('cutaway removes the front wedge while retaining the back and opposite side', () => {
  const basis = cameraBasis(0, 0);
  assert.equal(inCutaway([1, 1, 0], basis), true);
  assert.equal(inCutaway([-1, 1, 0], basis), false);
  assert.equal(inCutaway([1, -1, 0], basis), false);
});
