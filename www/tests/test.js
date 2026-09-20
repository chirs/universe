import test from 'node:test';
import assert from 'node:assert/strict';
import {
  meanLongitude, orbitalPosition, solveKepler, lerpLog, easeInOut, layerAlpha,
  niceScaleBar, mulberry32, skyToPlane, levelFromHash, daysSinceJ2000, placeLabel,
  levelFromShortcut, hashForView, moonSystemRadius, moonLevels, shouldIgnoreGlobalKeys, TOUR, tourLegMs,
  formatDistance, formatPeriod, planetSummary, moonSummary, starSummary,
  galaxySummary, clusterSummary, landmarkSummary, observableUniverseSummary,
  makeZeldovichWeb,
} from '../js/util.js';
import { frame, logY, angleX, TICKS, R_MIN, R_MAX } from '../js/overview.js';
import { PLANETS, BELTS, STARS, BRIGHT_STARS, LOCAL_GROUP, CLUSTERS, SIGNPOSTS, SCALE_UNITS, AU, LY, J2000_MS } from '../js/data.js';

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

test('a retrograde moon runs backward', () => {
  const triton = PLANETS.find((p) => p.name === 'Neptune').moons.find((m) => m.name === 'Triton');
  assert.ok(triton.retrograde);
  const later = meanLongitude(triton, triton.period / 4);
  assert.ok(Math.abs(later - ((triton.L0 - 90 + 360) % 360)) < 1e-9);
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

test('hover summaries use compact units appropriate to the scale', () => {
  assert.equal(formatDistance(384400000), '384,400 km');
  assert.equal(formatDistance(AU), '1 AU');
  assert.equal(formatDistance(4.25 * LY), '4.25 ly');
  assert.equal(formatDistance(26000 * LY), '26 kly');
  assert.equal(formatDistance(2.54e6 * LY), '2.54 Mly');
  assert.equal(formatDistance(46.5e9 * LY), '46.5 Gly');
  assert.equal(formatPeriod(0.3187), '7.65 hours');
  assert.equal(formatPeriod(27.321661), '27.3 days');
  assert.equal(formatPeriod(365.256), '1 year');
  assert.equal(formatPeriod(90560), '248 years');
});

test('hover summaries describe each kind of named object', () => {
  const moon = earth.moons[0];
  const pluto = PLANETS.find((p) => p.name === 'Pluto');
  const sedna = PLANETS.find((p) => p.name === 'Sedna');
  assert.match(planetSummary(earth), /^Planet · radius 6,371 km/);
  assert.match(planetSummary(pluto), /^Dwarf planet /);
  assert.match(planetSummary(sedna), /^Dwarf-planet candidate /);
  assert.match(moonSummary(moon, earth.name), /^Moon of Earth /);
  assert.equal(starSummary(STARS[0]), `Star · ${formatDistance(STARS[0].dist * LY)} from the Sun`);
  assert.match(galaxySummary(LOCAL_GROUP[1]), /^Spiral galaxy /);
  assert.match(clusterSummary(CLUSTERS[0]), /^Galaxy group · centered on the Milky Way/);
  assert.match(clusterSummary(CLUSTERS.find((c) => c.name === 'Virgo Cluster')), /^Galaxy cluster /);
  assert.match(landmarkSummary({ dist: 54e6 * LY, size: 55e6 * LY }), /^Large-scale structure /);
  assert.equal(
    observableUniverseSummary(46.5e9 * LY),
    'Observable horizon · radius 46.5 Gly (comoving) · universe age about 13.8 billion years',
  );
});

test('zeldovich web is deterministic, bounded, tiered, and honours the hole', () => {
  const a = makeZeldovichWeb(5, 1000, 20, 2000);
  const b = makeZeldovichWeb(5, 1000, 20, 2000);
  assert.deepEqual(a, b);
  assert.equal(a.pts.length, a.kind.length * 2);
  assert.ok(a.kind.length > 1000);
  assert.ok(a.kind.includes(0));
  assert.ok(a.kind.includes(1));
  assert.ok(a.kind.includes(2));
  for (let i = 0; i < a.kind.length; i++) {
    assert.ok(Math.hypot(a.pts[2 * i], a.pts[2 * i + 1]) <= 1000);
  }
  const holed = makeZeldovichWeb(5, 1000, 20, 2000, 400);
  let inner = 0;
  for (let i = 0; i < holed.kind.length; i++) {
    if (Math.hypot(holed.pts[2 * i], holed.pts[2 * i + 1]) < 250) inner++;
  }
  assert.ok(inner < holed.kind.length * 0.01);
  assert.ok(holed.kind.length < a.kind.length);
});

test('global shortcuts ignore focused controls and editable content', () => {
  for (const tag of ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']) {
    assert.equal(shouldIgnoreGlobalKeys(tag), true, tag);
  }
  assert.equal(shouldIgnoreGlobalKeys('DIV', true), true);
  assert.equal(shouldIgnoreGlobalKeys('BODY'), false);
  assert.equal(shouldIgnoreGlobalKeys('CANVAS'), false);
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
  const levels = [
    { id: 'inner' }, { id: 'trans-neptunian' },
    { id: 'milky-way' }, { id: 'milky-way-halo' },
  ];
  assert.equal(levelFromHash('#trans-neptunian', levels).id, 'trans-neptunian');
  assert.equal(levelFromHash('#milky-way', levels).id, 'milky-way');
  assert.equal(levelFromHash('#milky-way-halo', levels).id, 'milky-way-halo');
  assert.equal(levelFromHash('#nope', levels).id, 'inner');
  assert.equal(levelFromHash('', levels).id, 'inner');
  assert.equal(levelFromHash(undefined, levels).id, 'inner');
});

test('moon levels cover every body with moons', () => {
  const levels = moonLevels(PLANETS);
  assert.equal(levels.length, PLANETS.filter((p) => p.moons).length);
  assert.equal(new Set(levels.map((lv) => lv.id)).size, levels.length);
  assert.equal(levels[0].id, 'earth-moon');
  assert.equal(levels[0].name, 'Earth & Moon');
  assert.equal(levelFromHash('#uranus', levels).name, 'Uranus & moons');
  assert.equal(levelFromHash('#orcus', levels).name, 'Orcus & Vanth');
  for (const lv of levels) assert.equal(lv.radius, moonSystemRadius(lv.follow));
});

test('level shortcuts preserve digits and add named intermediate keys', () => {
  const levels = [
    { id: 'outer', shortcut: '5' },
    { id: 'trans-neptunian', shortcut: 'k' },
    { id: 'stars', shortcut: '6' },
    { id: 'milky-way', shortcut: '7' },
    { id: 'milky-way-halo', shortcut: 'h' },
    { id: 'local-group', shortcut: '8' },
  ];
  assert.equal(levelFromShortcut('5', levels).id, 'outer');
  assert.equal(levelFromShortcut('k', levels).id, 'trans-neptunian');
  assert.equal(levelFromShortcut('K', levels).id, 'trans-neptunian');
  assert.equal(levelFromShortcut('6', levels).id, 'stars');
  assert.equal(levelFromShortcut('7', levels).id, 'milky-way');
  assert.equal(levelFromShortcut('h', levels).id, 'milky-way-halo');
  assert.equal(levelFromShortcut('H', levels).id, 'milky-way-halo');
  assert.equal(levelFromShortcut('8', levels).id, 'local-group');
  assert.equal(levelFromShortcut('x', levels), null);
});

test('view hashes distinguish overview from the last level', () => {
  assert.equal(hashForView(true, 'saturn'), '#overview');
  assert.equal(hashForView(false, 'saturn'), '#saturn');
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

test('the selected dwarf planets and candidates are present', () => {
  assert.deepEqual(
    PLANETS.filter((p) => p.dwarf).map((p) => p.name),
    ['Ceres', 'Orcus', 'Pluto', 'Máni', 'Salacia', 'Haumea', 'Quaoar', 'Makemake', 'Varda', 'Gonggong', 'Eris', 'Sedna'],
  );
});

test('moons orbit well inside their planet\'s neighborhood', () => {
  const withMoons = PLANETS.filter((p) => p.moons);
  assert.deepEqual(withMoons.map((p) => p.name), [
    'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Orcus',
    'Pluto', 'Salacia', 'Haumea', 'Quaoar', 'Varda', 'Gonggong', 'Eris',
  ]);
  for (const p of withMoons) {
    let last = 0;
    for (const m of p.moons) {
      assert.ok(m.a > last && m.a < p.a / 50, m.name);
      assert.ok(m.period > 0 && m.radius > 0 && m.L0 >= 0 && m.L0 < 360, m.name);
      assert.ok((m.e || 0) >= 0 && (m.e || 0) < 1, m.name);
      assert.ok((m.varpi || 0) >= 0 && (m.varpi || 0) < 360, m.name);
      last = m.a;
    }
  }
  assert.equal(withMoons.flatMap((p) => p.moons).length, 38);
  const moon = withMoons[0].moons[0];
  const { x, y } = orbitalPosition(moon, 0);
  const r = Math.hypot(x, y);
  assert.ok(r > moon.a * (1 - moon.e) - 1 && r < moon.a * (1 + moon.e) + 1);
  const saturn = PLANETS.find((p) => p.name === 'Saturn');
  const iapetus = saturn.moons.find((m) => m.name === 'Iapetus');
  assert.equal(moonSystemRadius(saturn), 1.3 * iapetus.a);
  const neptune = PLANETS.find((p) => p.name === 'Neptune');
  const nereid = neptune.moons.find((m) => m.name === 'Nereid');
  assert.equal(moonSystemRadius(neptune), 1.3 * nereid.a * (1 + nereid.e));
});

test('inner planets and Pluto have the expected moon sets', () => {
  const moons = (name) => PLANETS.find((p) => p.name === name).moons?.map((m) => m.name) || [];
  assert.deepEqual(moons('Mercury'), []);
  assert.deepEqual(moons('Venus'), []);
  assert.deepEqual(moons('Mars'), ['Phobos', 'Deimos']);
  assert.deepEqual(moons('Pluto'), ['Charon', 'Styx', 'Nix', 'Kerberos', 'Hydra']);
  assert.deepEqual(moons('Eris'), ['Dysnomia']);
});

test('the modeled Oort cloud begins at the annotated distance', () => {
  assert.equal(BELTS.oort.inner, 2000 * AU);
  assert.ok(BELTS.oort.outer > BELTS.oort.inner);
});

test('Saturn\'s rings sit outside the planet and inside the moons', () => {
  const saturn = PLANETS.find((p) => p.name === 'Saturn');
  let last = saturn.radius;
  for (const ring of saturn.rings) {
    assert.ok(ring.inner >= last && ring.outer > ring.inner, ring.name);
    assert.ok(ring.alpha > 0 && ring.alpha <= 1, ring.name);
    last = ring.outer;
  }
  assert.ok(last < saturn.moons[0].a);
});

test('clusters are ordered outward with sane sizes', () => {
  let last = -1;
  for (const c of CLUSTERS) {
    assert.ok(c.dist >= last && c.l >= 0 && c.l < 360, c.name);
    assert.ok(c.size > 0 && c.size < c.dist + 10 && c.n > 0, c.name);
    last = c.dist;
  }
});

test('star and galaxy coordinates are in range', () => {
  for (const s of [...STARS, ...LOCAL_GROUP]) {
    assert.ok(s.dist >= 0 && s.l >= 0 && s.l < 360 && s.b >= -90 && s.b <= 90, s.name);
  }
  assert.ok(STARS.every((s) => s.dist < 20));
  let last = 0;
  for (const s of BRIGHT_STARS) {
    assert.ok(s.dist >= last && s.dist > 20 && s.l >= 0 && s.l < 360, s.name);
    assert.ok(s.mag > -2 && s.mag < 3 && 'bwyo'.includes(s.hue), s.name);
    last = s.dist;
  }
});

test('placeLabel tries right, left, above, below, then gives up', () => {
  const bounds = { w: 800, h: 600 };
  const placed = [];
  const spots = [];
  for (let i = 0; i < 5; i++) {
    const r = placeLabel(400, 300, 60, 16, placed, bounds);
    spots.push(r);
    if (r) placed.push(r);
  }
  assert.deepEqual(spots[0], { x: 408, y: 292, w: 60, h: 16 });
  assert.deepEqual(spots[1], { x: 332, y: 292, w: 60, h: 16 });
  assert.deepEqual(spots[2], { x: 370, y: 276, w: 60, h: 16 });
  assert.deepEqual(spots[3], { x: 370, y: 308, w: 60, h: 16 });
  assert.equal(spots[4], null);
});

test('placeLabel keeps labels inside the bounds', () => {
  const bounds = { w: 800, h: 600 };
  const nearRight = placeLabel(790, 300, 60, 16, [], bounds);
  assert.deepEqual(nearRight, { x: 722, y: 292, w: 60, h: 16 });
  const nearTop = placeLabel(5, 40, 60, 16, [], bounds);
  assert.deepEqual(nearTop, { x: 13, y: 32, w: 60, h: 16 });
  assert.equal(placeLabel(5, 5, 60, 16, [], bounds), null);
});

test('signposts have ordered, non-overlapping ranges', () => {
  let last = 0;
  for (const sp of SIGNPOSTS) {
    assert.ok(sp.range[0] > last && sp.range[1] > sp.range[0], sp.text);
    assert.ok(sp.text.length > 0 && sp.text.length < 160, sp.text);
    last = sp.range[1];
  }
});

test('overview maps log distance and longitude into the frame', () => {
  const fr = frame(1000, 800);
  assert.ok(Math.abs(logY(R_MIN, fr) - fr.bottom) < 1e-9);
  assert.ok(Math.abs(logY(R_MAX, fr) - fr.top) < 1e-9);
  assert.ok(logY(1e15, fr) < logY(1e12, fr));
  let last = Infinity;
  for (const [r] of TICKS) {
    const y = logY(r, fr);
    assert.ok(y < last && y > fr.top && y < fr.bottom, String(r));
    last = y;
  }
  assert.ok(Math.abs(angleX(0, fr) - (fr.left + fr.right) / 2) < 1e-9);
  assert.ok(Math.abs(angleX(180, fr) - fr.left) < 1e-9);
  assert.ok(Math.abs(angleX(-180, fr) - fr.left) < 1e-9);
  assert.ok(angleX(90, fr) > angleX(0, fr) && angleX(270, fr) < angleX(0, fr));
});

test('tour legs take longer over more decades and never go to zero', () => {
  assert.ok(tourLegMs(1, 1) >= 900);
  assert.ok(tourLegMs(1, 100) > tourLegMs(1, 10));
  assert.equal(tourLegMs(1, 1000), tourLegMs(1000, 1));
  assert.equal(new Set(TOUR).size, TOUR.length);
  assert.equal(TOUR[0], 'earth-moon');
  assert.equal(TOUR[TOUR.length - 1], 'universe');
  assert.ok(TOUR.indexOf('outer') < TOUR.indexOf('trans-neptunian'));
  assert.ok(TOUR.indexOf('trans-neptunian') < TOUR.indexOf('stars'));
  assert.ok(TOUR.indexOf('milky-way') < TOUR.indexOf('milky-way-halo'));
  assert.ok(TOUR.indexOf('milky-way-halo') < TOUR.indexOf('local-group'));
});
