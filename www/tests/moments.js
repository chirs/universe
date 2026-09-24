// The atlas of moments: every moment names a real stop, its time is on the
// minute and in date order, the tracks it depends on cover it, and the
// model really does what the moment says at that instant, so a stale
// Horizons fetch or a changed orbit fails here rather than leaving the
// clock on an empty moment.
import test from 'node:test';
import assert from 'node:assert/strict';

const noop = () => {};
const gradient = { addColorStop: noop };
const ctxHandler = {
  get(target, prop) {
    if (prop === 'measureText') return () => ({ width: 40 });
    if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => gradient;
    if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    if (prop === 'canvas') return { width: 1440, height: 900 };
    return noop;
  },
  set() { return true; },
};
const makeCtx = () => new Proxy({}, ctxHandler);
globalThis.document = { createElement: () => ({ getContext: makeCtx, width: 0, height: 0 }) };
globalThis.Image = class { constructor() { this.complete = false; this.naturalWidth = 0; } };
globalThis.fetch = () => new Promise(noop);

const { ALL_LEVELS } = await import('../js/levels.js');
const { MOMENTS } = await import('../js/moments.js');
const { TRACKS } = await import('../js/spacecraft.js');
const { AU, DAY_S, PLANETS, COMETS, S_STARS, HELIOSPHERE, ASTEROIDS } = await import('../js/data.js');
const {
  daysSinceJ2000, orbitalPosition, sampledPosition, skyOrbitPosition, coorbitalState, momentAround, hashForView, timeFromHash,
} = await import('../js/util.js');

const dated = MOMENTS.filter((m) => !m.far);
const days = (m) => daysSinceJ2000(m.t);
const by = (title) => MOMENTS.find((m) => m.title === title);
const dist = (p) => Math.hypot(p.x, p.y);
const planet = (name) => PLANETS.find((p) => p.name === name);
// The time of the least value of fn over [from, to] days, sampled every `step`.
function argmin(fn, from, to, step) {
  let best = { t: from, v: Infinity };
  for (let t = from; t <= to; t += step) {
    const v = fn(t);
    if (v < best.v) best = { t, v };
  }
  return best;
}

test('every moment names a stop, has a caption and a source, and the list is in date order', () => {
  const ids = new Set(ALL_LEVELS.map((lv) => lv.id));
  for (const m of dated) {
    assert.ok(ids.has(m.level), `${m.title}: level ${m.level}`);
    assert.ok(Number.isFinite(m.t) && m.t % 60000 === 0, `${m.title}: time on the minute`);
    assert.ok(m.t > Date.UTC(1900, 0, 1) && m.t < Date.UTC(2100, 0, 1), `${m.title}: within the century`);
    assert.ok(m.caption && m.source, m.title);
  }
  for (const m of MOMENTS.filter((m) => m.far)) assert.ok(m.when && m.caption && !m.level && m.t === undefined, m.title);
  assert.equal(new Set(MOMENTS.map((m) => m.title)).size, MOMENTS.length);
  for (let i = 1; i < dated.length; i++) assert.ok(dated[i].t > dated[i - 1].t, dated[i].title);
  assert.ok(dated.length >= 15);
});

test('the tracks a moment depends on cover its time', () => {
  for (const m of dated.filter((m) => m.track)) {
    const track = TRACKS[m.track];
    assert.ok(track, `${m.title}: track ${m.track}`);
    const end = track.start + track.step * (track.r.length - 1);
    assert.ok(days(m) >= track.start && days(m) <= end, `${m.title}: ${m.track} runs ${track.start}..${end}, moment at ${days(m)}`);
  }
});

test('the Voyagers are at the heliopause when they cross it', () => {
  for (const [craft, , r] of HELIOSPHERE.heliopause.crossings) {
    const m = by(`${craft} crosses the heliopause`);
    assert.ok(Math.abs(dist(sampledPosition(TRACKS[craft], days(m))) - r) < 1 * AU, craft);
  }
});

test('the comets are at perihelion at their moments', () => {
  const halley = COMETS.find((c) => c.name === 'Halley');
  const haleBopp = COMETS.find((c) => c.name === 'Hale–Bopp');
  const check = (m, comet, tolDays) => {
    const t = days(m);
    const best = argmin((d) => dist(orbitalPosition(comet, d)), t - 400, t + 400, 0.25);
    assert.ok(Math.abs(best.t - t) <= tolDays, `${m.title}: model perihelion ${best.t - t} days off`);
  };
  check(by('Halley at perihelion'), halley, 2);
  check(by('Halley returns'), halley, 2);
  check(by('Hale–Bopp at perihelion'), haleBopp, 3);
});

test('S2 is nearest Sgr A* at its periapsis moments', () => {
  const s2 = S_STARS.find((s) => s.name === 'S2');
  const r = (d) => { const p = skyOrbitPosition(s2, d); return Math.hypot(p.north, p.east, p.depth); };
  for (const title of ['S2 sweeps past Sgr A*', 'S2 returns to periapsis']) {
    const t = days(by(title));
    const best = argmin(r, t - 365, t + 365, 0.5);
    assert.ok(Math.abs(best.t - t) <= 1, `${title}: ${best.t - t} days off`);
    assert.ok(best.v < 130 * AU && best.v > 110 * AU, `${title}: ${best.v / AU} AU`);
  }
});

test('Apophis is closest to Earth at its moment, inside the geostationary ring', () => {
  const m = by('Apophis passes inside the geostationary ring');
  const track = TRACKS[m.track];
  const end = track.start + track.step * (track.r.length - 1);
  const best = argmin((d) => dist(sampledPosition(track, d)), track.start, end, 1 / 1440);
  assert.ok(Math.abs(best.t - days(m)) * 1440 <= 2, `${(best.t - days(m)) * 1440} minutes off`);
  assert.ok(best.v < 42164e3 && best.v > 30000e3, `${best.v / 1e3} km`);
});

test('Janus and Epimetheus are at their swap', () => {
  const pair = planet('Saturn').coorbitals;
  const t = days(by('Janus and Epimetheus swap orbits'));
  const at = coorbitalState(pair, t);
  assert.ok(at.phi < 0.2 && Math.abs(at.delta) < 1e-6, `phi ${at.phi}, delta ${at.delta}`);
  assert.ok(coorbitalState(pair, t + 365).phi > 1);
});

test('the solar-system moments put their bodies where the captions say', () => {
  const conj = days(by('Jupiter and Saturn in great conjunction'));
  const lon = (p) => Math.atan2(p.y, p.x);
  const gap = Math.abs(lon(orbitalPosition(planet('Jupiter'), conj)) - lon(orbitalPosition(planet('Saturn'), conj)));
  assert.ok(Math.min(gap, 2 * Math.PI - gap) < 5 * Math.PI / 180);

  const dart = days(by('DART strikes Dimorphos'));
  const didymos = orbitalPosition(ASTEROIDS.find((a) => a.name === 'Didymos'), dart);
  const earth = orbitalPosition(planet('Earth'), dart);
  assert.ok(Math.hypot(didymos.x - earth.x, didymos.y - earth.y) < 0.1 * AU);

  const nh = days(by('New Horizons flies past Pluto'));
  const craft = sampledPosition(TRACKS['New Horizons'], nh);
  const pluto = orbitalPosition(planet('Pluto'), nh);
  assert.ok(Math.hypot(craft.x - pluto.x, craft.y - pluto.y) < 0.3 * AU);
});

test('momentAround steps through the dated moments and stops at the ends', () => {
  assert.equal(momentAround(MOMENTS, Date.UTC(1900, 0, 1), 1), dated[0]);
  assert.equal(momentAround(MOMENTS, Date.UTC(1900, 0, 1), -1), null);
  assert.equal(momentAround(MOMENTS, Date.UTC(2100, 0, 1), -1), dated[dated.length - 1]);
  assert.equal(momentAround(MOMENTS, Date.UTC(2100, 0, 1), 1), null);
  const apophis = by('Apophis passes inside the geostationary ring');
  assert.equal(momentAround(MOMENTS, apophis.t, 1), dated[dated.indexOf(apophis) + 1]);
  assert.equal(momentAround(MOMENTS, apophis.t, -1), dated[dated.indexOf(apophis) - 1]);
});

test('a moment link carries its time to the minute and reads back', () => {
  for (const m of dated) {
    const hash = hashForView(false, m.level, m.t);
    assert.equal(timeFromHash(hash), m.t, m.title);
    assert.equal(hash.split('?')[0], `#${m.level}`);
  }
  assert.equal(hashForView(false, 'earth', Date.UTC(2029, 3, 13, 21, 45)), '#earth?t=2029-04-13T21:45');
});
