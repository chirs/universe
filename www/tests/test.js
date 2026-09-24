import test from 'node:test';
import assert from 'node:assert/strict';
import {
  meanLongitude, orbitalPosition, solveKepler, lerpLog, easeInOut, layerAlpha,
  niceScaleBar, mulberry32, skyToPlane, levelFromHash, daysSinceJ2000, placeLabel,
  levelFromShortcut, hashForView, moonSystemRadius, planetLevels, shouldIgnoreGlobalKeys, TOUR, tourLegMs,
  formatDistance, formatPeriod, planetSummary, moonSummary, starSummary,
  galaxySummary, clusterSummary, superclusterSummary, voidSummary, landmarkSummary, observableUniverseSummary,
  makeZeldovichWeb, schwarzschildRadius, blackHoleSummary, sStarSummary, skyOrbitPosition, skyOrbitPath,
  galacticPlanePositionAngle, skyOffsetToPlane, pickLevel, armRadius, galactocentricToPlane, makeArm, galacticObjectSummary,
  starStyle, starSystemSummary, cloudSummary, makeExpDisk, componentSummary, exoplanetSummary, habitableZone, systemLevels,
  diskToSky, galaxyLevels, sampledPosition, trackPath, trojanPoints, greatCircleToSky, quadraticThrough, slerpSky,
} from '../js/util.js';
import { frame, logY, angleX, TICKS, R_MIN, R_MAX } from '../js/overview.js';
import { soundParams } from '../js/audio.js';
import {
  PLANETS, BELTS, STARS, BRIGHT_STARS, LOCAL_GROUP, CLUSTERS, SUPERCLUSTERS, VOIDS, SIGNPOSTS, SCALE_UNITS, AU, LY, J2000_MS,
  SGR_A_STAR, S_STARS, MILKY_WAY, YEAR_D, SOLAR_MASS, SPIRAL_ARMS, MILKY_WAY_OBJECTS, PC, LOCAL_BUBBLE, STAR_SYSTEMS, LOCAL_GROUP_STOPS,
  SPACECRAFT, COMETS, ASTEROIDS, RADCLIFFE_WAVE, MAGELLANIC_STREAM, DISTANT_OBJECTS, UNIVERSE,
} from '../js/data.js';
import { TRACKS } from '../js/spacecraft.js';
import { GLOBULAR_CLUSTERS } from '../js/globulars.js';
import { cosmologyAt } from '../v2/model.js';

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
  assert.equal(starSummary(BRIGHT_STARS[0]), `Star · ${formatDistance(BRIGHT_STARS[0].dist * LY)} from the Sun · apparent magnitude 0.03`);
  assert.match(galaxySummary(LOCAL_GROUP[1]), /^Spiral galaxy /);
  assert.match(clusterSummary(CLUSTERS[0]), /^Galaxy group · centered on the Milky Way/);
  assert.match(clusterSummary(CLUSTERS.find((c) => c.name === 'Virgo Cluster')), /^Galaxy cluster /);
  assert.match(clusterSummary(CLUSTERS.find((c) => c.abell === 426)), /^Galaxy cluster · Abell 426 · .* · Perseus-Pisces supercluster$/);
  assert.match(superclusterSummary(SUPERCLUSTERS[0]), /^Supercluster · .* · Abell 1060, 3526/);
  assert.match(voidSummary(VOIDS[0]), /^Void · centre /);
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

test('planet levels cover every planet, moons or not', () => {
  const levels = planetLevels(PLANETS);
  assert.equal(levels.length, PLANETS.length);
  assert.equal(new Set(levels.map((lv) => lv.id)).size, levels.length);
  assert.equal(levels[0].id, 'mercury');
  assert.equal(levels[0].name, 'Mercury');
  assert.equal(levelFromHash('#venus', levels).radius, 25 * PLANETS[1].radius);
  assert.equal(levelFromHash('#earth', levels).name, 'Earth');
  assert.equal(levelFromHash('#uranus', levels).name, 'Uranus');
  assert.equal(levelFromHash('#orcus', levels).name, 'Orcus');
  for (const lv of levels) assert.equal(lv.radius, lv.follow.moons ? moonSystemRadius(lv.follow) : 25 * lv.follow.radius);
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

test('superclusters resolve to listed clusters and the Local Void matches its source vector', () => {
  const abell = new Set(CLUSTERS.filter((c) => c.abell).map((c) => c.abell));
  assert.equal(abell.size, CLUSTERS.filter((c) => c.abell).length);
  for (const sc of SUPERCLUSTERS) {
    assert.ok(sc.members.filter((a) => abell.has(a)).length >= 2, sc.name);
    assert.ok(sc.l >= 0 && sc.l < 360 && sc.dist > 0 && sc.size > 0, sc.name);
  }
  const mpcToMly = 3.2616;
  const localVoid = VOIDS.find((v) => v.name === 'Local Void');
  assert.ok(Math.abs(localVoid.dist - Math.hypot(22, 9, 22) * mpcToMly) / localVoid.dist < 0.01);
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

test('placeLabel always sits to the right, pushed inside the bounds', () => {
  const bounds = { w: 800, h: 600 };
  assert.deepEqual(placeLabel(400, 300, 60, 16, bounds), { x: 408, y: 292, w: 60, h: 16 });
  assert.deepEqual(placeLabel(400, 300, 60, 16, bounds), placeLabel(400, 300, 60, 16, bounds));
  assert.deepEqual(placeLabel(790, 300, 60, 16, bounds), { x: 740, y: 292, w: 60, h: 16 });
  assert.deepEqual(placeLabel(5, 3, 60, 16, bounds), { x: 13, y: 0, w: 60, h: 16 });
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
  assert.equal(TOUR[0], 'earth');
  assert.equal(TOUR[TOUR.length - 1], 'universe');
  assert.ok(TOUR.indexOf('outer') < TOUR.indexOf('trans-neptunian'));
  assert.ok(TOUR.indexOf('trans-neptunian') < TOUR.indexOf('stars'));
  assert.ok(TOUR.indexOf('stars') < TOUR.indexOf('local-bubble') && TOUR.indexOf('local-bubble') < TOUR.indexOf('local-arm'));
  assert.ok(TOUR.indexOf('local-arm') < TOUR.indexOf('milky-way'));
  assert.ok(TOUR.indexOf('milky-way') < TOUR.indexOf('milky-way-halo'));
  assert.ok(TOUR.indexOf('milky-way-halo') < TOUR.indexOf('local-group'));
});

test('Sgr A* has the right Schwarzschild radius and sits at the galactic center', () => {
  const rs = schwarzschildRadius(SGR_A_STAR.mass);
  assert.ok(Math.abs(rs / 1.27e10 - 1) < 0.01, String(rs));
  assert.ok(Math.abs(rs / AU - 0.085) < 0.002);
  assert.equal(MILKY_WAY.sunDistance, SGR_A_STAR.distance);
  assert.ok(Math.abs(SGR_A_STAR.distance / LY - 27000) < 100);
  assert.match(blackHoleSummary(SGR_A_STAR), /^Supermassive black hole · 4.3 million solar masses · Schwarzschild radius 12.7 million km · 27 kly from the Sun$/);
});

test('S2 orbit matches Kepler and the published pericenter', () => {
  const s2 = S_STARS.find((s) => s.name === 'S2');
  const periYears = (s2.period / YEAR_D) ** 2 * (SGR_A_STAR.mass / SOLAR_MASS);
  assert.ok(Math.abs((s2.a / AU) ** 3 / periYears - 1) < 0.03, 'a^3 = M P^2');
  assert.ok(Math.abs(s2.a * (1 - s2.e) / AU - 120) < 3, 'periapsis about 120 AU');
  const atPeri = skyOrbitPosition(s2, s2.tP);
  const rPeri = Math.hypot(atPeri.east, atPeri.north, atPeri.depth);
  assert.ok(Math.abs(rPeri - s2.a * (1 - s2.e)) < 1e-3 * s2.a);
  assert.ok(atPeri.north < 0, 'S2 passes pericenter south of Sgr A*');
  const atApo = skyOrbitPosition(s2, s2.tP + s2.period / 2);
  assert.ok(Math.abs(Math.hypot(atApo.east, atApo.north, atApo.depth) - s2.a * (1 + s2.e)) < 1e-3 * s2.a);
  assert.ok(atApo.north > 0);
  // S2 was still receding at pericenter in 2018 and approaching a few months later.
  const dt = 2;
  const before = skyOrbitPosition(s2, s2.tP + s2.period - dt);
  const after = skyOrbitPosition(s2, s2.tP + s2.period + dt);
  assert.ok(after.depth > before.depth, 'receding through pericenter');
  const later = skyOrbitPosition(s2, s2.tP + s2.period + 120);
  const laterStill = skyOrbitPosition(s2, s2.tP + s2.period + 122);
  assert.ok(laterStill.depth < later.depth, 'approaching by late 2018');
  assert.match(sStarSummary(s2), /^Star orbiting Sgr A\* · periapsis 1\d\d AU · apoapsis 1,9\d\d AU · period 16 years$/);
});

test('orbit paths close on the true ellipse', () => {
  for (const s of S_STARS) {
    const path = skyOrbitPath(s, 64);
    assert.equal(path.length, 64);
    const rs = path.map((p) => Math.hypot(p.east, p.north, p.depth));
    assert.ok(Math.abs(Math.min(...rs) - s.a * (1 - s.e)) < 1e-6 * s.a, s.name);
    assert.ok(Math.abs(Math.max(...rs) - s.a * (1 + s.e)) < 1e-6 * s.a, s.name);
  }
});

test('the galactic plane runs at position angle 31.4 degrees through Sgr A*', () => {
  const pa = galacticPlanePositionAngle(SGR_A_STAR.ra, SGR_A_STAR.dec);
  assert.ok(Math.abs(pa - 31.4) < 0.2, String(pa));
  // At the north galactic pole's meridian, far from the pole, the plane runs east-west.
  assert.ok(Math.abs(galacticPlanePositionAngle(192.86, -62.87) - 90) < 0.5);
});

test('sky offsets drop galactic latitude and keep depth along +x', () => {
  const pa = 30;
  assert.deepEqual(skyOffsetToPlane({ east: 0, north: 0, depth: 5 }, pa), { x: 5, y: 0 });
  const alongL = skyOffsetToPlane({ east: Math.sin(pa * Math.PI / 180), north: Math.cos(pa * Math.PI / 180), depth: 0 }, pa);
  assert.ok(Math.abs(alongL.y - 1) < 1e-12 && alongL.x === 0);
  const towardB = skyOffsetToPlane({ east: -Math.cos(pa * Math.PI / 180), north: Math.sin(pa * Math.PI / 180), depth: 0 }, pa);
  assert.ok(Math.abs(towardB.y) < 1e-12);
});

test('pickLevel prefers a stop near the camera and falls back to scale alone', () => {
  const gc = skyToPlane(0, MILKY_WAY.sunDistance);
  const levels = [
    { id: 'inner', radius: 2 * AU, cx: 0, cy: 0 },
    { id: 'stars', radius: 20 * LY, cx: 0, cy: 0 },
    { id: 'sgr-a', radius: 1 * AU, cx: gc.x, cy: gc.y },
    { id: 'galactic-center', radius: 4000 * AU, cx: gc.x, cy: gc.y },
    { id: 'universe', radius: 58e9 * LY, cx: 0, cy: 0 },
  ];
  assert.equal(pickLevel(levels, 0, 0, 1 * AU).id, 'inner');
  assert.equal(pickLevel(levels, gc.x, gc.y, 1 * AU).id, 'sgr-a');
  assert.equal(pickLevel(levels, gc.x, gc.y, 2000 * AU).id, 'galactic-center');
  assert.equal(pickLevel(levels, gc.x / 2, 0, 20 * LY).id, 'stars');
});

test('spiral arm fits put the known arms where they are seen from the Sun', () => {
  const D = MILKY_WAY.sunDistance;
  const arm = (name) => SPIRAL_ARMS.find((a) => a.name.startsWith(name));
  const at = (a, beta) => galactocentricToPlane(armRadius(a, beta), beta, D);
  assert.ok(Math.abs(armRadius(arm('Local'), 9) / (8.26e3 * PC) - 1) < 1e-12, 'radius at the kink is R_kink');
  // Trailing arms: radius shrinks with azimuth outside the kink.
  assert.ok(armRadius(arm('Perseus'), 60) < armRadius(arm('Perseus'), 40));
  // The Sun sits just inside the Local arm; Perseus is about 2 kpc toward the anticenter.
  const local = at(arm('Local'), 0);
  assert.ok(local.x < 0 && Math.hypot(local.x, local.y) < 0.6e3 * PC, String(local.x / PC));
  const perseus = at(arm('Perseus'), 0);
  assert.ok(perseus.x < 0 && Math.abs(-perseus.x / (1.9e3 * PC) - 1) < 0.1);
  // The Sagittarius arm passes the Lagoon Nebula; extrapolated, it passes the Carina Nebula.
  const near = (a, o, betas, tol) => {
    const p = skyToPlane(o.l, o.dist * LY);
    return Math.min(...betas.map((b) => { const q = at(a, b); return Math.hypot(q.x - p.x, q.y - p.y); })) < tol;
  };
  const lagoon = MILKY_WAY_OBJECTS.find((o) => o.name === 'Lagoon Nebula');
  const carina = MILKY_WAY_OBJECTS.find((o) => o.name === 'Carina Nebula');
  const betas = Array.from({ length: 200 }, (_, k) => -40 + k);
  assert.ok(near(arm('Sagittarius'), lagoon, betas, 0.5e3 * PC));
  assert.ok(near(arm('Sagittarius'), carina, betas, 0.5e3 * PC));
  // The Perseus arm holds the Crab Nebula and the Local arm the Orion Nebula and Cygnus X-1.
  assert.ok(near(arm('Perseus'), MILKY_WAY_OBJECTS.find((o) => o.name === 'Crab Nebula'), betas, 0.6e3 * PC));
  assert.ok(near(arm('Local'), MILKY_WAY_OBJECTS.find((o) => o.name === 'Orion Nebula'), betas, 0.6e3 * PC));
  assert.ok(near(arm('Local'), MILKY_WAY_OBJECTS.find((o) => o.name === 'Cygnus X-1'), betas, 0.6e3 * PC));
});

test('makeArm is deterministic and keeps points in the disk', () => {
  const D = MILKY_WAY.sunDistance;
  const a = makeArm(SPIRAL_ARMS[1], D, 7);
  const b = makeArm(SPIRAL_ARMS[1], D, 7);
  assert.deepEqual(a.fitted, b.fitted);
  assert.ok(a.fitted.length > 500 && a.extra.length > 100);
  for (const pts of [a.fitted, a.extra]) {
    for (let i = 0; i < pts.length; i += 2) {
      const r = Math.hypot(pts[i] - D, pts[i + 1]);
      assert.ok(r > 2e3 * PC && r < 16e3 * PC);
    }
  }
  assert.ok(Math.hypot(a.label.x - D, a.label.y) < 15e3 * PC);
  assert.ok(a.fittedSpine.length >= 100 && a.extraSpines.length === 2);
});

test('galactic objects are unique, within the disk, and summarized', () => {
  assert.equal(new Set(MILKY_WAY_OBJECTS.map((o) => o.name)).size, MILKY_WAY_OBJECTS.length);
  for (const o of MILKY_WAY_OBJECTS) {
    assert.ok(o.dist > 100 && o.dist < 30000, o.name);
    assert.ok(o.l >= 0 && o.l < 360 && Math.abs(o.b) < 40, o.name);
  }
  const bh = MILKY_WAY_OBJECTS.find((o) => o.name === 'Gaia BH1');
  assert.match(galacticObjectSummary(bh), /^Black hole · 1.56 kly from the Sun · /);
});

test('nearest systems are sorted, typed, and summarized by kind', () => {
  let last = 0;
  for (const s of STARS) {
    assert.ok(s.dist >= last, s.name);
    last = s.dist;
    assert.ok(s.types.length >= 1 && s.types.every((t) => /^[OBAFGKMLTYD]/.test(t)), s.name);
    if (s.planets !== undefined) assert.ok(Number.isInteger(s.planets) && s.planets > 0, s.name);
  }
  assert.equal(new Set(STARS.map((s) => s.name)).size, STARS.length);
  assert.equal(STARS[0].name, 'Proxima Centauri');
  assert.ok(STARS.some((s) => s.name === 'Luhman 16') && STARS.some((s) => s.name === 'WISE 0855-0714'));
  assert.equal(starStyle('M5.5V').kind, 'star');
  assert.equal(starStyle('T1').kind, 'brown dwarf');
  assert.equal(starStyle('DA2').kind, 'white dwarf');
  assert.ok(starStyle('A1V').visible && !starStyle('M2V').visible);
  assert.equal(starSystemSummary(STARS.find((s) => s.name === 'Sirius')), 'Star + white dwarf · A1V + DA2 · 8.71 ly from the Sun');
  assert.equal(starSystemSummary(STARS.find((s) => s.name === 'Luhman 16')), '2 brown dwarfs · L8 + T1 · 6.51 ly from the Sun');
  assert.match(starSystemSummary(STARS[0]), /^Star · M5.5V · 4.25 ly from the Sun · 2 known planets$/);
  assert.match(starSystemSummary(STARS.find((s) => s.name === 'Epsilon Eridani')), / · 1 known planet$/);
});

test('Local Bubble clouds sit a few hundred light-years out', () => {
  for (const c of LOCAL_BUBBLE.clouds) {
    assert.ok(c.dist > 300 && c.dist < 1100 && c.l >= 0 && c.l < 360, c.name);
    assert.match(cloudSummary(c), /^Molecular cloud · \d+ ly from the Sun · /);
  }
  assert.ok(LOCAL_BUBBLE.radius > 400 * LY && LOCAL_BUBBLE.radius < 600 * LY);
});

test('makeExpDisk follows an exponential surface density', () => {
  const pts = makeExpDisk(3, 1, 200, 20000);
  assert.deepEqual(pts, makeExpDisk(3, 1, 200, 20000));
  let sum = 0;
  let inside = 0;
  for (let i = 0; i < pts.length; i += 2) {
    const r = Math.hypot(pts[i], pts[i + 1]);
    assert.ok(r <= 200);
    sum += r;
    if (r < 1) inside++;
  }
  assert.ok(Math.abs(sum / 20000 - 2) < 0.06, 'mean radius is twice the scale length');
  // Fraction inside one scale length is 1 - 2/e for a Gamma(2) law.
  assert.ok(Math.abs(inside / 20000 - (1 - 2 / Math.E)) < 0.02);
});

test('star systems obey Kepler with the transcribed masses and are wired to the neighbourhood', () => {
  const kepler = (aAU, periodYears, mass) => (aAU ** 3) / (periodYears ** 2) / mass;
  assert.equal(new Set(STAR_SYSTEMS.map((s) => s.id)).size, STAR_SYSTEMS.length);
  for (const sys of STAR_SYSTEMS) {
    assert.ok(STARS.some((st) => st.name === sys.star), sys.star);
    assert.ok(sys.host || sys.binary, sys.id);
    if (sys.binary) {
      const b = sys.binary;
      assert.ok(Math.abs(kepler(b.orbit.a / AU, b.orbit.period / YEAR_D, b.primary.mass + b.secondary.mass) - 1) < 0.02, sys.id);
      const rs = skyOrbitPath(b.orbit, 64).map((p) => Math.hypot(p.east, p.north, p.depth));
      assert.ok(Math.abs(Math.min(...rs) - b.orbit.a * (1 - b.orbit.e)) < 1e-3 * b.orbit.a, sys.id);
    }
    for (const p of sys.planets || []) {
      assert.ok(Math.abs(kepler(p.a / AU, p.period / YEAR_D, sys.host.mass) - 1) < 0.03, p.name);
      assert.ok(p.a * (1 + (p.e || 0)) < sys.radius * 1.6, `${p.name} fits its stop`);
    }
  }
  const ac = STAR_SYSTEMS.find((s) => s.id === 'alpha-centauri').binary;
  assert.match(componentSummary(ac.primary, 'Alpha Centauri B', ac.orbit.period), /^Star · G2V · 1.08 solar masses · radius [\d.,]+ .* · orbits Alpha Centauri B every 79.8 years$/);
  const sirius = STAR_SYSTEMS.find((s) => s.id === 'sirius').binary;
  assert.match(componentSummary(sirius.secondary, 'Sirius A', sirius.orbit.period), /^White dwarf · DA2 · 1.02 solar masses · radius 5,634 km · orbits Sirius A every 50.1 years$/);
  const prox = STAR_SYSTEMS.find((s) => s.id === 'proxima-centauri');
  assert.match(exoplanetSummary(prox.planets[1], 'Proxima Centauri'), /^Planet of Proxima Centauri · 1.05 Earth masses · orbit 7.25 million km · period 11.2 days$/);
  const tau = STAR_SYSTEMS.find((s) => s.id === 'tau-ceti');
  assert.match(exoplanetSummary(tau.planets[0], 'Tau Ceti'), /^Candidate planet of Tau Ceti · .* · detection disputed$/);
  const eri = STAR_SYSTEMS.find((s) => s.id === 'epsilon-eridani');
  assert.match(exoplanetSummary(eri.planets[0], 'Epsilon Eridani'), /^Planet of Epsilon Eridani · 1 Jupiter masses · /);
  for (const lv of systemLevels(STAR_SYSTEMS, STARS)) {
    assert.ok(Number.isFinite(lv.cx) && Number.isFinite(lv.cy) && lv.radius > 0 && lv.clickName && lv.caption, lv.id);
  }
  const hz = habitableZone(1);
  assert.ok(Math.abs(hz.inner / AU - 0.95) < 1e-9 && Math.abs(hz.outer / AU - 1.67) < 1e-9);
  assert.ok(habitableZone(0.00072).outer < 0.05 * AU);
});

test('galaxy disks rotate like orbits and the Local Group stops are centered on their members', () => {
  // Face-on at position angle 0: the disk is the sky.
  let p = diskToSky(0, 0, 1, 0);
  assert.ok(Math.abs(p.north - 1) < 1e-12 && Math.abs(p.east) < 1e-12 && Math.abs(p.depth) < 1e-12);
  p = diskToSky(0, 0, 0, 1);
  assert.ok(Math.abs(p.east - 1) < 1e-12 && Math.abs(p.depth) < 1e-12);
  // Edge-on: the minor axis is all depth.
  p = diskToSky(90, 0, 0, 1);
  assert.ok(Math.abs(p.east) < 1e-12 && Math.abs(p.north) < 1e-12 && Math.abs(p.depth - 1) < 1e-12);
  // The major axis follows the position angle, north through east.
  p = diskToSky(77, 90, 1, 0);
  assert.ok(Math.abs(p.east - 1) < 1e-12 && Math.abs(p.north) < 1e-12);
  const levels = galaxyLevels(LOCAL_GROUP_STOPS, LOCAL_GROUP);
  assert.equal(levels.length, 3);
  for (const lv of levels) {
    assert.ok(Number.isFinite(lv.cx) && Number.isFinite(lv.cy) && lv.radius > 0 && lv.clickNames.length >= 1 && lv.caption, lv.id);
    for (const name of lv.clickNames) assert.ok(LOCAL_GROUP.some((g) => g.name === name), name);
  }
  const m31 = LOCAL_GROUP.find((g) => g.name === 'Andromeda (M31)');
  const andromeda = levels.find((lv) => lv.id === 'andromeda');
  const m31pos = skyToPlane(m31.l, m31.dist * LY);
  assert.ok(Math.hypot(andromeda.cx - m31pos.x, andromeda.cy - m31pos.y) < andromeda.radius / 2);
  for (const g of LOCAL_GROUP) if (g.inclination !== undefined) assert.ok(g.ra !== undefined && g.pa !== undefined && g.spiral, g.name);
});

test('soundParams deepens and thins out as the view widens', () => {
  let prev = soundParams(R_MIN);
  for (let r = R_MIN * 10; r < R_MAX; r *= 10) {
    const p = soundParams(r);
    assert.ok(p.root < prev.root && p.cutoff < prev.cutoff && p.wet > prev.wet && p.chimeRate < prev.chimeRate);
    prev = p;
  }
  assert.deepEqual(soundParams(R_MIN / 1e6), soundParams(R_MIN));
  assert.deepEqual(soundParams(R_MAX * 1e6), soundParams(R_MAX));
  assert.deepEqual(soundParams(LY), soundParams(LY));
  assert.ok(Math.abs(soundParams(R_MAX).root - 55) < 1e-9);
});

test('sampled tracks interpolate, stop, and extrapolate escaping craft', () => {
  const track = { start: 0, step: 10, lon: [0, 90, 90], r: [1, 1, 2] };
  assert.equal(sampledPosition(track, -1), null);
  const mid = sampledPosition(track, 5);
  assert.ok(Math.abs(mid.x - 0.5 * AU) < 1 && Math.abs(mid.y - 0.5 * AU) < 1);
  assert.equal(sampledPosition(track, 30), null);
  const beyond = sampledPosition(track, 30, true);
  assert.ok(Math.abs(beyond.y - 3 * AU) < 1 && Math.abs(beyond.x) < 1);
  assert.equal(trackPath(track, 0, 15).length, 6);
});

test('spacecraft tracks cover every listed craft and put Voyager 1 near 170 AU in 2026', () => {
  for (const sc of SPACECRAFT) {
    const t = TRACKS[sc.name];
    assert.ok(t && t.lon.length === t.r.length && t.r.length > 10, sc.name);
  }
  const days = daysSinceJ2000(Date.UTC(2026, 0, 1));
  const v1 = sampledPosition(TRACKS['Voyager 1'], days, true);
  const r = Math.hypot(v1.x, v1.y) / AU;
  assert.ok(r > 165 && r < 175, `Voyager 1 at ${r} AU`);
});

test('comets reach their SBDB perihelion and aphelion, Halley at perihelion in February 1986', () => {
  const halley = COMETS.find((c) => c.name === 'Halley');
  const at1986 = orbitalPosition(halley, daysSinceJ2000(Date.UTC(1986, 1, 9)));
  assert.ok(Math.abs(Math.hypot(at1986.x, at1986.y) / AU - 0.575) < 0.01);
  const aphelion = orbitalPosition(halley, daysSinceJ2000(Date.UTC(1986, 1, 9)) + halley.period / 2);
  assert.ok(Math.abs(Math.hypot(aphelion.x, aphelion.y) / AU - 35.28) < 0.05);
  const hb = COMETS.find((c) => c.name.startsWith('Hale'));
  const at1997 = orbitalPosition(hb, daysSinceJ2000(Date.UTC(1997, 3, 1)));
  assert.ok(Math.abs(Math.hypot(at1997.x, at1997.y) / AU - 0.8905) < 0.01);
});

test('solveKepler converges for high eccentricity on either side of apocenter', () => {
  for (const M of [-3.1417, -3.1, -2, -6, 3.1417, 6]) {
    const E = solveKepler(M, 0.968);
    assert.ok(Math.abs(E - 0.968 * Math.sin(E) - M) < 1e-9, `M=${M}`);
  }
});

test('skyOffsetToPlane turns depth to the line of sight at the object\'s longitude', () => {
  const p = skyOffsetToPlane({ east: 0, north: 0, depth: 1 }, 0, 90);
  assert.ok(Math.abs(p.x) < 1e-12 && Math.abs(p.y - 1) < 1e-12);
  const q = skyOffsetToPlane({ east: 0, north: 1, depth: 0 }, 0, 90);
  assert.ok(Math.abs(q.x + 1) < 1e-12 && Math.abs(q.y) < 1e-12);
});

test('the Harris globular clusters are all there, with Omega Centauri the brightest', () => {
  assert.equal(GLOBULAR_CLUSTERS.length, 157);
  for (const [id, , l, b, dist] of GLOBULAR_CLUSTERS) {
    assert.ok(l >= 0 && l < 360 && Math.abs(b) <= 90 && dist > 0 && dist < 150, id);
  }
  const brightest = GLOBULAR_CLUSTERS.filter((c) => c[5] !== null).sort((a, b) => a[5] - b[5])[0];
  assert.equal(brightest[1], 'omega Cen');
});

test('Trojan points sit 60 degrees either side of the body on its circle', () => {
  const { l4, l5 } = trojanPoints({ x: 5 * AU, y: 0 });
  assert.ok(Math.abs(Math.atan2(l4.y, l4.x) - Math.PI / 3) < 1e-12);
  assert.ok(Math.abs(Math.atan2(l5.y, l5.x) + Math.PI / 3) < 1e-12);
  assert.ok(Math.abs(Math.hypot(l4.x, l4.y) - 5 * AU) < 1);
});

test('Magellanic Stream frame starts at the LMC and runs over the south galactic pole', () => {
  const [pole, origin] = [MAGELLANIC_STREAM.pole, MAGELLANIC_STREAM.origin];
  const start = greatCircleToSky(pole, origin, 0, 0);
  assert.ok(Math.abs(start.l - 280.5) < 5 && Math.abs(start.b + 32.8) < 3);
  assert.ok(greatCircleToSky(pole, origin, -60, 0).b < -75);
  assert.ok(greatCircleToSky(pole, origin, 60, 0).b > 20);
  const onPole = greatCircleToSky(pole, origin, 0, 90);
  assert.ok(Math.abs(onPole.l - 188.5) < 1e-6 && Math.abs(onPole.b + 7.5) < 1e-6);
});

test('Radcliffe Wave runs 2.7 kpc from Canis Major to Cygnus through its anchors', () => {
  const { anchors } = RADCLIFFE_WAVE;
  assert.deepEqual(quadraticThrough(anchors, 0.5), anchors[1]);
  let length = 0;
  for (let i = 0; i < 100; i++) {
    const [x0, y0] = quadraticThrough(anchors, i / 100);
    const [x1, y1] = quadraticThrough(anchors, (i + 1) / 100);
    length += Math.hypot(x1 - x0, y1 - y0);
  }
  assert.ok(Math.abs(length - 2700) < 250, `length ${length}`);
  const l = (p) => ((Math.atan2(p[1], p[0]) * 180 / Math.PI) + 360) % 360;
  assert.ok(Math.abs(l(anchors[0]) - 224) < 5 && Math.abs(l(anchors[2]) - 80) < 5);
});

test('distant objects sit at the comoving distance for their redshift and inside the horizon', () => {
  for (const o of DISTANT_OBJECTS) {
    const c = cosmologyAt(o.z, 'z');
    assert.ok(Math.abs(c.distance - o.dist) / o.dist < 0.005, o.name);
    assert.ok(Math.abs(c.lookback - o.lookback) < 0.02, o.name);
    assert.ok(o.dist * 1e6 * LY < UNIVERSE.radius, o.name);
  }
  const zs = DISTANT_OBJECTS.map((o) => o.z);
  assert.deepEqual(zs, [...zs].sort((a, b) => a - b));
});

test('slerpSky follows the great circle between two points', () => {
  const mid = slerpSky([0, 0], [90, 0], 0.5);
  assert.ok(Math.abs(mid.l - 45) < 1e-9 && Math.abs(mid.b) < 1e-9);
  const pole = slerpSky([0, 60], [180, 60], 0.5);
  assert.ok(Math.abs(pole.b - 90) < 1e-6);
});

test('the Psyche spacecraft closes on 16 Psyche by the end of its Horizons track', () => {
  const asteroid = ASTEROIDS.find((a) => a.name === '16 Psyche');
  const gap = (date) => {
    const days = daysSinceJ2000(date);
    const rock = orbitalPosition(asteroid, days);
    const craft = sampledPosition(TRACKS.Psyche, days);
    return Math.hypot(rock.x - craft.x, rock.y - craft.y) / AU;
  };
  assert.ok(gap(Date.UTC(2028, 0, 1)) > 0.1);
  assert.ok(gap(Date.UTC(2029, 0, 15)) < 0.02);
});
