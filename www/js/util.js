import { J2000_MS, DAY_S, YEAR_D, AU, LY, PC, G_SI, C_SI, SOLAR_MASS } from './data.js';

const TAU = Math.PI * 2;
const D2R = Math.PI / 180;

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

export function ringSummary(ring, planetName) {
  const width = ring.outer - ring.inner;
  const where = width < 0.02 * ring.outer
    ? `${formatDistance((ring.inner + ring.outer) / 2)} from the center, ${formatDistance(width)} wide`
    : `${formatDistance(ring.inner)} to ${formatDistance(ring.outer)} from the center`;
  return `Ring of ${planetName} · ${where}`;
}

export function hiiSummary(region) {
  const how = region.parallax ? 'by maser parallax' : 'kinematic distance, uncertain';
  return `HII region · hydrogen lit by young massive stars · radius ${formatDistance(region.radius)} · `
    + `${formatDistance(region.dist)} from the Sun, ${how} · WISE catalog, Anderson et al. 2014`;
}

export function starSummary(star) {
  const parts = ['Star'];
  if (star.radius) parts.push(`radius ${formatDistance(star.radius)}`);
  if (star.dist) parts.push(`${formatDistance(star.dist * LY)} from the Sun`);
  if (star.mag !== undefined) parts.push(`apparent magnitude ${compactNumber(star.mag)}`);
  return parts.join(' · ');
}

// Colour, dot radius and kind for a spectral type: the letter sets the
// colour and size, with brown dwarfs (L, T, Y) dark and small and white
// dwarfs (D) small and white.
const STAR_STYLES = {
  O: ['#9bb0ff', 3.2], B: ['#aabfff', 3], A: ['#cad7ff', 2.8], F: ['#f8f7ff', 2.5], G: ['#fff4e8', 2.3],
  K: ['#ffd2a1', 2], M: ['#ff9f6e', 1.6], L: ['#c8603a', 1.3], T: ['#a04a5a', 1.2], Y: ['#7a3a6a', 1.1], D: ['#e8f0ff', 1.1],
};
export function starStyle(type) {
  const c = type[0];
  const [color, radius] = STAR_STYLES[c] || ['#d9c9b0', 1.6];
  const kind = 'LTY'.includes(c) ? 'brown dwarf' : c === 'D' ? 'white dwarf' : 'star';
  return { color, radius, kind, visible: 'OBAFGK'.includes(c) };
}

export function starSystemSummary(system) {
  const counts = new Map();
  for (const t of system.types) {
    const { kind } = starStyle(t);
    counts.set(kind, (counts.get(kind) || 0) + 1);
  }
  const what = [...counts].map(([kind, n]) => (n > 1 ? `${n} ${kind}s` : kind)).join(' + ');
  const parts = [what[0].toUpperCase() + what.slice(1), system.types.join(' + '), `${formatDistance(system.dist * LY)} from the Sun`];
  if (system.planets) parts.push(`${system.planets} known ${system.planets > 1 ? 'planets' : 'planet'}`);
  return parts.join(' · ');
}

export function componentSummary(star, partner, period) {
  const { kind } = starStyle(star.type);
  const what = kind[0].toUpperCase() + kind.slice(1);
  const parts = [what, star.type, `${compactNumber(star.mass)} solar masses`, `radius ${formatDistance(star.radius)}`];
  if (partner) parts.push(`orbits ${partner} every ${formatPeriod(period)}`);
  return parts.join(' · ');
}

export function exoplanetSummary(planet, hostName) {
  const mass = planet.massEarth >= 100 ? `${compactNumber(planet.massEarth / 317.8)} Jupiter masses` : `${compactNumber(planet.massEarth)} Earth masses`;
  const parts = [`${planet.candidate ? 'Candidate planet' : 'Planet'} of ${hostName}`, mass, `orbit ${formatDistance(planet.a)}`, `period ${formatPeriod(planet.period)}`];
  if (planet.candidate) parts.push('detection disputed');
  return parts.join(' · ');
}

// A rough habitable zone for a star of the given luminosity (solar units):
// the conservative Kopparapu et al. 2013 limits scale as the square root.
export function habitableZone(luminosity) {
  const s = Math.sqrt(luminosity);
  return { inner: 0.95 * s * AU, outer: 1.67 * s * AU };
}

export function cloudSummary(cloud) {
  return `Molecular cloud · ${formatDistance(cloud.dist * LY)} from the Sun · star-forming, on the shell of the Local Bubble`;
}

export function galaxySummary(galaxy) {
  const kind = galaxy.spiral ? 'Spiral galaxy' : 'Galaxy';
  const distance = galaxy.dist ? `${formatDistance(galaxy.dist * LY)} from the Milky Way` : 'our galaxy';
  return `${kind} · ${distance} · approximate radius ${formatDistance(galaxy.size * LY)}`;
}

export function clusterSummary(cluster) {
  const kind = cluster.name.includes('Group') ? 'Galaxy group' : 'Galaxy cluster';
  const parts = [kind];
  if (cluster.abell && !cluster.name.includes('Abell')) parts.push(`Abell ${cluster.abell}`);
  parts.push(cluster.dist ? `${formatDistance(cluster.dist * 1e6 * LY)} from the Milky Way` : 'centered on the Milky Way');
  parts.push(`approximate diameter ${formatDistance(cluster.size * 1e6 * LY)}`);
  if (cluster.sc) parts.push(`${cluster.sc} supercluster`);
  return parts.join(' · ');
}

export function superclusterSummary(sc) {
  return `Supercluster · ${formatDistance(sc.dist * 1e6 * LY)} from the Milky Way · about ${formatDistance(sc.size * 1e6 * LY)} across · Abell ${sc.members.join(', ')}`;
}

export function voidSummary(v) {
  return `Void · centre ${formatDistance(v.dist * 1e6 * LY)} from the Milky Way · about ${formatDistance(v.size * 1e6 * LY)} across · ${v.note}`;
}

export function schwarzschildRadius(massKg) {
  return 2 * G_SI * massKg / (C_SI * C_SI);
}

export function blackHoleSummary(bh) {
  return `Supermassive black hole · ${compactNumber(bh.mass / SOLAR_MASS / 1e6)} million solar masses · Schwarzschild radius ${formatDistance(schwarzschildRadius(bh.mass))} · ${formatDistance(bh.distance)} from the Sun`;
}

export function sStarSummary(star) {
  return `Star orbiting Sgr A* · periapsis ${formatDistance(star.a * (1 - star.e))} · apoapsis ${formatDistance(star.a * (1 + star.e))} · period ${formatPeriod(star.period)}`;
}

// Unit vector for galactic (l, b) in degrees, and back.
function skyVector(l, b) {
  return [Math.cos(b * D2R) * Math.cos(l * D2R), Math.cos(b * D2R) * Math.sin(l * D2R), Math.sin(b * D2R)];
}

function vectorSky([x, y, z]) {
  return { l: ((Math.atan2(y, x) / D2R) + 360) % 360, b: Math.asin(Math.max(-1, Math.min(1, z))) / D2R };
}

// Galactic (l, b) of a point at longitude L and latitude B (degrees) on the
// great-circle frame with the given pole and longitude zero toward `origin`,
// longitude increasing counterclockwise about the pole.
export function greatCircleToSky(pole, origin, L, B) {
  const p = skyVector(...pole);
  const o0 = skyVector(...origin);
  const dot = o0[0] * p[0] + o0[1] * p[1] + o0[2] * p[2];
  let o = o0.map((c, i) => c - dot * p[i]);
  const n = Math.hypot(...o);
  o = o.map((c) => c / n);
  const q = [p[1] * o[2] - p[2] * o[1], p[2] * o[0] - p[0] * o[2], p[0] * o[1] - p[1] * o[0]];
  const cL = Math.cos(L * D2R);
  const sL = Math.sin(L * D2R);
  const cB = Math.cos(B * D2R);
  const sB = Math.sin(B * D2R);
  return vectorSky([0, 1, 2].map((i) => cB * (cL * o[i] + sL * q[i]) + sB * p[i]));
}

// A point on the quadratic through three anchors at t = 0, 1/2 and 1.
export function quadraticThrough([a, b, c], t) {
  const la = 2 * (t - 0.5) * (t - 1);
  const lb = -4 * t * (t - 1);
  const lc = 2 * t * (t - 0.5);
  return [la * a[0] + lb * b[0] + lc * c[0], la * a[1] + lb * b[1] + lc * c[1]];
}

// A point a fraction t along the great circle from sky position a to b
// (galactic l, b in degrees).
export function slerpSky(a, b, t) {
  const u = skyVector(...a);
  const v = skyVector(...b);
  const omega = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2])));
  if (omega < 1e-9) return vectorSky(u);
  const wa = Math.sin((1 - t) * omega) / Math.sin(omega);
  const wb = Math.sin(t * omega) / Math.sin(omega);
  return vectorSky([0, 1, 2].map((i) => wa * u[i] + wb * v[i]));
}

export function wallSummary(wall) {
  const shape = wall.honest ? '' : ' · high galactic latitude, so dropping latitude stretches it into an arc here';
  return `Great wall · about ${formatDistance(wall.waypoints[1][2] * 1e6 * LY)} away · ${wall.note}${shape}`;
}

export function distantSummary(o) {
  return `${o.kind} · redshift ${o.z} · ${formatDistance(o.dist * 1e6 * LY)} away now; its light left ${o.lookback.toFixed(1)} billion years ago · ${o.note}`;
}

// One lap of the Sun's orbit, in millions of years, for a circular orbit at
// the galaxy's circular speed.
export function sunOrbitPeriodMyr(mw) {
  return TAU * mw.sunDistance / (mw.circularSpeed * 1000) / (365.25 * DAY_S) / 1e6;
}

export function sunOrbitSummary(mw) {
  const period = sunOrbitPeriodMyr(mw);
  return `The Sun\u2019s orbit · ${formatDistance(mw.sunDistance)} from the galactic center at about ${mw.circularSpeed} km/s · one lap every ${Math.round(period / 10) * 10} million years, about 20 laps since the Sun formed; one lap ago was the Late Triassic, when dinosaurs were new · drawn as a circle; the real path wanders slightly in and out and bobs through the disk`;
}

export function galacticObjectSummary(o) {
  return `${o.kind} · ${formatDistance(o.dist * LY)} from the Sun · ${o.note}`;
}

// Galactocentric radius in meters of a spiral arm at azimuth beta (degrees):
// a log spiral whose pitch angle changes at the kink (Reid et al. 2019).
export function armRadius(arm, beta) {
  const pitch = beta < arm.betaKink ? arm.pitchIn : arm.pitchOut;
  return arm.rKink * 1000 * PC * Math.exp(-(beta - arm.betaKink) * D2R * Math.tan(pitch * D2R));
}

// Galactocentric polar coordinates to the map: the Sun is at beta = 0, and
// beta increases with galactic rotation, toward +y.
export function galactocentricToPlane(r, beta, sunDistance) {
  return { x: sunDistance - r * Math.cos(beta * D2R), y: r * Math.sin(beta * D2R) };
}

// Points along an arm: the fitted azimuth range, and its continuation by
// arm.extend degrees at each end, kept between 3 and 14 kpc from the
// center. Points scatter across the arm's width, in map meters about the
// Sun. The spines are the centerlines, one per stretch, for a soft band.
// `weight(r)` thins points with galactocentric radius, so the arms fade
// with the disk; the continuations ramp down to half density over their
// first 40 degrees rather than stepping.
export function makeArm(arm, sunDistance, seed, perDegree = 50, weight = () => 1) {
  const rand = mulberry32(seed);
  const gaussian = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(TAU * rand());
  const width = arm.width * 1000 * PC;
  const sample = (lo, hi, density, rampFrom) => {
    const out = [];
    const n = Math.round((hi - lo) * density);
    for (let k = 0; k < n; k++) {
      const beta = lo + rand() * (hi - lo);
      const r = armRadius(arm, beta);
      if (r < 3000 * PC || r > 14000 * PC) continue;
      const ramp = rampFrom === undefined ? 1 : 1 - 0.5 * Math.min(1, Math.abs(beta - rampFrom) / 40);
      if (rand() > weight(r) * ramp) continue;
      const p = galactocentricToPlane(r, beta, sunDistance);
      out.push(p.x + gaussian() * width * 1.5, p.y + gaussian() * width * 1.5);
    }
    return Float64Array.from(out);
  };
  const spine = (lo, hi) => {
    const out = [];
    for (let beta = lo; beta <= hi; beta += 1) {
      const r = armRadius(arm, beta);
      if (r >= 3000 * PC && r <= 14000 * PC) out.push(galactocentricToPlane(r, beta, sunDistance));
    }
    return out;
  };
  const [lo, hi] = arm.beta;
  const [lead, trail] = arm.extend || [60, 60];
  return {
    fitted: sample(lo, hi, perDegree),
    extra: Float64Array.from([...sample(lo - lead, lo, perDegree, lo), ...sample(hi, hi + trail, perDegree, hi)]),
    fittedSpine: spine(lo, hi),
    extraSpines: [spine(lo - lead, lo), spine(hi, hi + trail)],
    width,
    label: galactocentricToPlane(armRadius(arm, arm.labelBeta), arm.labelBeta, sunDistance),
  };
}

// Points of an exponential disk about the origin: surface density falling
// as exp(-r / scaleLength), cut at maxRadius. The radial law is a Gamma(2)
// draw, -scaleLength * ln(u1 * u2).
export function makeExpDisk(seed, scaleLength, maxRadius, count) {
  const rand = mulberry32(seed);
  const pts = new Float64Array(count * 2);
  for (let i = 0; i < count; i++) {
    let r;
    do { r = -scaleLength * Math.log(rand() * rand() || 1e-12); } while (r > maxRadius);
    const t = rand() * TAU;
    pts[2 * i] = r * Math.cos(t);
    pts[2 * i + 1] = r * Math.sin(t);
  }
  return pts;
}

export function herculesSummary(h) {
  return `Structure · redshift ${h.z[0]} to ${h.z[1]}, about ${formatDistance(h.dist * 1e6 * LY)} away now · ${h.note}`;
}

export function landmarkSummary(landmark) {
  return `Large-scale structure · ${formatDistance(landmark.dist)} from the Milky Way · approximate size ${formatDistance(landmark.size)}`;
}

export function darkAgesSummary(u) {
  return `The dark ages · ${formatDistance(u.firstGalaxies.dist)} to ${formatDistance(u.cmb.dist)} away now · redshift ${u.firstGalaxies.z} to ${u.cmb.z} · neutral hydrogen and no stars yet, until the first galaxies about ${u.firstGalaxies.sinceBigBang} after the Big Bang`;
}

export function cmbSummary(u) {
  return `Cosmic microwave background · ${formatDistance(u.cmb.dist)} away now · redshift ${u.cmb.z} · light from ${u.cmb.sinceBigBang} after the Big Bang, when the universe first turned transparent; nothing beyond it can be seen`;
}

export function lookbackSummary(years, dist) {
  return `Lookback ${years} billion years · light from ${formatDistance(dist)} away (comoving) left when the universe was ${(13.8 - years).toFixed(1)} billion years old`;
}

export function yearsAgo(years) {
  if (years >= 1e9) return `${years / 1e9} billion years ago`;
  if (years >= 1e6) return `${years / 1e6} million years ago`;
  return `${years.toLocaleString('en-US')} years ago`;
}

export function lookbackPowerSummary(years, dist) {
  const comoving = years >= 1e8 ? ' (comoving; space has stretched since)' : '';
  return `Lookback ${yearsAgo(years)} · light from ${formatDistance(dist)} away${comoving} set out then`;
}

export function observableUniverseSummary(radius) {
  return `Observable horizon · radius ${formatDistance(radius)} (comoving) · universe age about 13.8 billion years`;
}

// Position on a sampled track (see spacecraft.js) at `days` since J2000, in
// meters in the map plane. Null before the first sample, and after the last
// unless `escape`, when it carries on along the final sample's heading.
export function sampledPosition(track, days, escape = false) {
  const n = track.r.length;
  const f = (days - track.start) / track.step;
  if (f < 0 || (f > n - 1 && !escape)) return null;
  const i = Math.min(Math.floor(f), n - 2);
  const t = f - i;
  const a = trackPoint(track, i);
  const b = trackPoint(track, i + 1);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function trackPoint(track, i) {
  const lon = track.lon[i] * D2R;
  return { x: track.r[i] * AU * Math.cos(lon), y: track.r[i] * AU * Math.sin(lon) };
}

// Flat [x, y, ...] of the samples between `from` and `to` days, ending at
// the interpolated position at `to`.
export function trackPath(track, from, to, escape = false) {
  const out = [];
  const first = Math.max(0, Math.ceil((from - track.start) / track.step));
  const last = Math.min(track.r.length - 1, Math.floor((to - track.start) / track.step));
  for (let i = first; i <= last; i++) {
    const p = trackPoint(track, i);
    out.push(p.x, p.y);
  }
  const end = sampledPosition(track, to, escape);
  if (end) out.push(end.x, end.y);
  return out;
}

export function spacecraftSummary(sc, distance, center = 'the Sun') {
  return `Spacecraft · ${formatDistance(distance)} from ${center} · ${sc.note}`;
}

export function globularSummary(c) {
  const lum = c.mv === null ? '' : ` · absolute magnitude ${c.mv.toFixed(1)}`;
  return `Globular cluster${c.name ? ` ${c.id}` : ''} · ${formatDistance(c.dist * 1000 * PC)} from the Sun${lum} · an old, dense ball of hundreds of thousands of stars in the halo · Harris 2010`;
}

export function asteroidSummary(asteroid) {
  return `Asteroid · radius ${formatDistance(asteroid.radius)} · orbit ${formatDistance(asteroid.a)} · period ${formatPeriod(asteroid.period)} · ${asteroid.note}`;
}

export function cometSummary(comet) {
  const q = comet.a * (1 - comet.e);
  const Q = comet.a * (1 + comet.e);
  return `Comet · perihelion ${formatDistance(q)} · aphelion ${formatDistance(Q)} · period ${formatPeriod(comet.period)} · ${comet.note}`;
}

// Position on an open (hyperbolic) orbit about the Sun, laid flat like the
// comets: q perihelion distance, e > 1, tP perihelion (days after J2000).
export function hyperbolicPosition(body, days) {
  const a = body.q / (1 - body.e);
  const n = Math.sqrt(G_SI * SOLAR_MASS / (-a) ** 3) * DAY_S;
  const M = n * (days - body.tP);
  let H = Math.asinh(M / body.e);
  for (let i = 0; i < 50; i++) {
    const dH = (body.e * Math.sinh(H) - H - M) / (body.e * Math.cosh(H) - 1);
    H -= dH;
    if (Math.abs(dH) < 1e-12) break;
  }
  const r = a * (1 - body.e * Math.cosh(H));
  const nu = 2 * Math.atan(Math.sqrt((body.e + 1) / (body.e - 1)) * Math.tanh(H / 2));
  const lon = body.varpi * D2R + (body.retrograde ? -nu : nu);
  return { x: r * Math.cos(lon), y: r * Math.sin(lon) };
}

export function interstellarSummary(body, days) {
  const p = hyperbolicPosition(body, days);
  const vInf = Math.sqrt(G_SI * SOLAR_MASS * (body.e - 1) / body.q) / 1000;
  const when = new Date(J2000_MS + body.tP * DAY_S * 1000).toISOString().slice(0, 7);
  return `Interstellar object · passed ${formatDistance(body.q)} from the Sun in ${when} · now ${formatDistance(Math.hypot(p.x, p.y))} out, leaving at ${compactNumber(vInf)} km/s · ${body.note}`;
}

export function companionSummary(body) {
  return `Asteroid · Earth companion · radius ${formatDistance(body.radius)} · period ${formatPeriod(body.period)} · ${body.note}`;
}

// A planet and its binary partner (Pluto and Charon) circle their
// barycenter, which carries the planet's orbital elements: the share of
// the separation each stands off it.
export function binaryShares(planet) {
  const partner = planet.moons.find((m) => m.name === planet.binary);
  const total = planet.mass + partner.mass;
  return { partner, planet: partner.mass / total, moon: planet.mass / total };
}

// Where the planet itself sits relative to its barycenter at `days`.
export function binaryOffset(planet, days) {
  if (!planet.binary) return { x: 0, y: 0 };
  const { partner, planet: share } = binaryShares(planet);
  const rel = orbitalPosition(partner, days);
  return { x: -share * rel.x, y: -share * rel.y };
}

export function hypervelocitySummary(star) {
  return `Hypervelocity star · leaving the galaxy at ${star.speed.toLocaleString('en-US')} km/s, flung from Sgr A* about ${star.ejected / 1e6} million years ago `
    + `· ${formatDistance(star.dist)} from the Sun · path drawn straight from the center in this flattened map · Koposov et al. 2020`;
}

// The Lagrange points leading (L4) and trailing (L5) a body at `pos` by 60
// degrees on a circle through it.
export function trojanPoints(pos) {
  const r = Math.hypot(pos.x, pos.y);
  const t = Math.atan2(pos.y, pos.x);
  const at = (d) => ({ x: r * Math.cos(t + d), y: r * Math.sin(t + d) });
  return { l4: at(TAU / 6), l5: at(-TAU / 6) };
}

export function issSummary(iss) {
  return `Space station · ${iss.note} · position along the orbit is illustrative`;
}

export function heliosphereSummary(boundary) {
  const crossings = boundary.crossings.map(([craft, year, r]) => `${craft} at ${formatDistance(r)} in ${year}`).join(', ');
  const shape = boundary.crossings[0][3] === undefined
    ? 'drawn as a circle; the real surface is blunt ahead and trails behind'
    : 'blunt toward the interstellar wind, trailing a tail of unknown length; the shape is schematic';
  return `${boundary.name} · crossed by ${crossings} · ${shape}`;
}

// A Rankine half-body: the boundary between a uniform flow and a point
// source, at distance nose * psi / sin(psi) from the source, psi measured
// from the upstream direction. The nose distance is fitted to crossings
// given as [distance, angle from upstream in degrees].
export function rankineNose(crossings) {
  const f = (deg) => (deg === 0 ? 1 : (deg * Math.PI / 180) / Math.sin(deg * Math.PI / 180));
  return crossings.reduce((sum, [r, deg]) => sum + r / f(deg), 0) / crossings.length;
}

export function rankineRadius(nose, psi) {
  return psi === 0 ? nose : nose * psi / Math.sin(psi);
}

// How far the first broadcasts have travelled by a moment (ms), in meters.
export function radioRadius(radio, ms) {
  return Math.max(0, (ms - radio.start) / (YEAR_D * DAY_S * 1000)) * LY;
}

// stars: [{ name, dist (ly) }]; names the last one reached and the next.
export function radioSummary(radio, radius, stars) {
  const ly = radius / LY;
  const year = (d) => new Date(radio.start + d * YEAR_D * DAY_S * 1000).getUTCFullYear();
  const sorted = [...stars].sort((a, b) => a.dist - b.dist);
  const last = sorted.filter((s) => s.dist <= ly).pop();
  const next = sorted.find((s) => s.dist > ly);
  const parts = [`Leading edge of our radio broadcasts, from ${radio.first} on ${radio.date}`, `now ${formatDistance(radius)} out`];
  if (last) parts.push(`reached ${last.name} in ${year(last.dist)}`);
  if (next) parts.push(`${next.name} next, in ${year(next.dist)}`);
  parts.push('long since too faint for telescopes like ours to pick out');
  return parts.join(' · ');
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
// Solved on M wrapped to (-pi, pi], starting a high-eccentricity orbit at
// the apocenter on M's side so Newton's method converges.
export function solveKepler(M, e) {
  const wrap = Math.round(M / TAU) * TAU;
  const m = M - wrap;
  let E = e < 0.8 ? m : Math.sign(m) * Math.PI;
  for (let i = 0; i < 30; i++) {
    const d = (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-12) break;
  }
  return E + wrap;
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

// Two moons sharing an orbit, as Janus and Epimetheus do. Between swaps
// their relative longitude phi (Epimetheus minus Janus) sweeps a horseshoe
// (Murray & Dermott 1999, section 3.10): the orbits differ by
// da/a = +-sqrt(K (C - S(phi))), K = 8/3 of the pair's mass over the
// planet's, S(phi) = 1 / (2 sin(phi/2)) - cos(phi), and phi drifts at
// -3/2 n da/a. C is fitted so one leg, from one close approach to the next,
// lasts the observed time between swaps.
const horseshoeS = (phi) => 1 / (2 * Math.abs(Math.sin(phi / 2))) - Math.cos(phi);

function horseshoeLeg(K, n, C, steps = 2000) {
  let lo = 1e-9;
  let hi = Math.PI;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (horseshoeS(mid) > C) lo = mid; else hi = mid;
  }
  const pmin = hi;
  // phi = pi - (pi - pmin) cos(s) spreads samples toward the turning points,
  // where the drift slows to nothing.
  const phis = new Float64Array(steps + 1);
  const times = new Float64Array(steps + 1);
  for (let i = 0; i <= steps; i++) {
    const sv = Math.PI * i / steps;
    phis[i] = Math.PI - (Math.PI - pmin) * Math.cos(sv);
    if (i === 0) continue;
    const sm = Math.PI * (i - 0.5) / steps;
    const phi = Math.PI - (Math.PI - pmin) * Math.cos(sm);
    const rate = 1.5 * n * Math.sqrt(Math.max(1e-30, K * (C - horseshoeS(phi))));
    times[i] = times[i - 1] + (Math.PI - pmin) * Math.sin(sm) * (Math.PI / steps) / rate;
  }
  return { C, pmin, phis, times };
}

export function horseshoe(pair) {
  if (pair.leg) return pair.leg;
  const [m1, m2] = pair.moons.map((m) => m.mass);
  const K = 8 / 3 * (m1 + m2) / pair.planetMass;
  const n = TAU / pair.period;
  let lo = 1.5 + 1e-6;
  let hi = 1e4;
  for (let i = 0; i < 60; i++) {
    const mid = Math.sqrt(lo * hi);
    if (horseshoeLeg(K, n, mid, 400).times.at(-1) > pair.swapInterval) lo = mid; else hi = mid;
  }
  pair.leg = { ...horseshoeLeg(K, n, lo), K };
  return pair.leg;
}

// Where the pair is at `days`: the mean longitude of their shared orbit
// (radians), phi, the fractional orbit difference (Epimetheus minus Janus),
// the swaps either side, and each moon's position about the planet.
export function coorbitalState(pair, days) {
  const leg = horseshoe(pair);
  const t = days - pair.swapEpoch;
  const k = Math.floor(t / pair.swapInterval);
  const u = t - k * pair.swapInterval;
  const { phis, times } = leg;
  let lo = 0;
  let hi = times.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= u) lo = mid; else hi = mid;
  }
  const f = Math.min(1, (u - times[lo]) / (times[hi] - times[lo]));
  const up = phis[lo] + (phis[hi] - phis[lo]) * f;
  // Even legs follow a swap that put the first moon (Janus) inside: the
  // second is then outside, slower, and phi falls.
  const even = ((k % 2) + 2) % 2 === 0;
  const phi = even ? TAU - up : up;
  const delta = (even ? 1 : -1) * Math.sqrt(Math.max(0, leg.K * (leg.C - horseshoeS(phi))));
  const center = (pair.L0 + 360 * days / pair.period) * D2R;
  const [m1, m2] = pair.moons.map((m) => m.mass);
  const f1 = m2 / (m1 + m2);
  const f2 = m1 / (m1 + m2);
  const at = (lon, r) => ({ lon, r, x: r * Math.cos(lon), y: r * Math.sin(lon) });
  return {
    center, phi, delta,
    lastSwap: pair.swapEpoch + k * pair.swapInterval,
    nextSwap: pair.swapEpoch + (k + 1) * pair.swapInterval,
    bodies: [at(center - f1 * phi, pair.a * (1 - f1 * delta)), at(center + f2 * phi, pair.a * (1 + f2 * delta))],
  };
}

export function coorbitalSummary(pair, i, state) {
  const moon = pair.moons[i];
  const other = pair.moons[1 - i].name;
  const leg = horseshoe(pair);
  const gap = Math.abs(state.delta) * pair.a;
  const outer = (state.delta > 0) === (i === 1);
  const closest = 2 * pair.a * Math.sin(leg.pmin / 2);
  const when = new Date(J2000_MS + state.nextSwap * DAY_S * 1000).toISOString().slice(0, 7);
  return [
    `Moon of Saturn · radius ${formatDistance(moon.radius)}`,
    `shares its orbit with ${other}; every ${formatPeriod(pair.swapInterval)} they swap orbits, never closer than ${formatDistance(closest)}`,
    `now ${formatDistance(gap)} ${outer ? 'outside' : 'inside'} ${other}\u2019s orbit`,
    `next swap ${when}`,
  ].join(' · ');
}

export function wr140Summary(wr) {
  const o = wr.orbit;
  return [
    `Colliding-wind binary · a ${wr.secondary.mass}-solar-mass Wolf\u2013Rayet star and a ${wr.primary.mass}-solar-mass O star`,
    `${formatDistance(o.a * (1 - o.e))} to ${formatDistance(o.a * (1 + o.e))} apart every ${formatPeriod(o.period)}`,
    `each close pass makes a shell of dust`,
    `${formatDistance(wr.dist)} from the Sun · Thomas et al. 2021, Lau et al. 2022`,
  ].join(' · ');
}

export function dustShellSummary(year, radius) {
  return `Dust shell from the ${year} close pass · now ${formatDistance(radius)} out · its shape here is schematic`;
}

// Position on an orbit given in the visual-binary convention (see S_STARS in
// data.js): offsets from the focus in meters, east and north on the sky and
// depth positive away from the observer, so that a receding star has
// increasing depth. Uses the standard Thiele-Innes geometry.
export function skyOrbitPosition(orbit, days) {
  const e = orbit.e || 0;
  const M = ((TAU * (days - orbit.tP) / orbit.period) % TAU + TAU) % TAU;
  const E = solveKepler(M, e);
  return skyOrbitPoint(orbit, E);
}

function skyOrbitPoint(orbit, E) {
  const e = orbit.e || 0;
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = orbit.a * (1 - e * Math.cos(E));
  const u = orbit.omega * D2R + nu;
  const cO = Math.cos(orbit.Omega * D2R);
  const sO = Math.sin(orbit.Omega * D2R);
  const ci = Math.cos(orbit.i * D2R);
  return {
    north: r * (cO * Math.cos(u) - sO * Math.sin(u) * ci),
    east: r * (sO * Math.cos(u) + cO * Math.sin(u) * ci),
    depth: r * Math.sin(u) * Math.sin(orbit.i * D2R),
  };
}

// The whole orbit as n points, evenly spaced in eccentric anomaly.
export function skyOrbitPath(orbit, n = 128) {
  const pts = [];
  for (let k = 0; k < n; k++) pts.push(skyOrbitPoint(orbit, TAU * k / n));
  return pts;
}

const NGP = { ra: 192.85948, dec: 27.12825 }; // north galactic pole, J2000

// Position angle, from north through east, of the direction of increasing
// galactic longitude on the sky at equatorial (ra, dec) in degrees.
export function galacticPlanePositionAngle(ra, dec) {
  const dA = (NGP.ra - ra) * D2R;
  const toPole = Math.atan2(Math.sin(dA), Math.cos(dec * D2R) * Math.tan(NGP.dec * D2R) - Math.sin(dec * D2R) * Math.cos(dA));
  return ((toPole / D2R + 90) % 360 + 360) % 360;
}

// Drop a sky offset at the galactic center into the plane of the map: depth
// runs along +x, since the Sun looks toward the center along +x; the part
// along increasing longitude runs along +y; the part toward galactic north
// is dropped, as latitude is everywhere else.
export function skyOffsetToPlane({ east, north, depth }, planePA, l = 0) {
  const pa = planePA * D2R;
  const along = east * Math.sin(pa) + north * Math.cos(pa);
  // Depth runs along the line of sight at longitude l; `along` is the
  // direction of increasing l at the object.
  const c = Math.cos(l * D2R);
  const s = Math.sin(l * D2R);
  return { x: depth * c - along * s, y: depth * s + along * c };
}

// The level closest in scale to a view of the given radius at (cx, cy),
// preferring levels whose center is within a few view widths of the camera
// so a stop at the galactic center is not picked while looking at the Sun.
export function pickLevel(levels, cx, cy, radius) {
  const near = levels.filter((lv) => Math.hypot(cx - lv.cx, cy - lv.cy) < 10 * radius);
  let best = null;
  let bestD = Infinity;
  for (const lv of near.length ? near : levels) {
    const d = Math.abs(Math.log(lv.radius / radius));
    if (d < bestD) { bestD = d; best = lv; }
  }
  return best;
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
// `zone` limits the particles to an annulus of the same web: { inner,
// outer, taper(r) in 0..1 }, with nPoints spread over that annulus. The
// potential depends only on seed, radius and nCells, so zones of one web
// line up.
export function makeZeldovichWeb(seed, radius, nCells, nPoints, hole = 0, zone = null) {
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

  // Particles on a jittered lattice inside the disc (or zone), outside the hole.
  const inner = zone ? zone.inner : 0;
  const outer = zone ? zone.outer : radius;
  const side = Math.ceil(Math.sqrt(nPoints * 4 * outer * outer / (Math.PI * (outer * outer - inner * inner))));
  const step = 2 * outer / side;
  const q = [];
  for (let j = 0; j < side; j++) {
    for (let i = 0; i < side; i++) {
      const x = -outer + (i + rand()) * step;
      const y = -outer + (j + rand()) * step;
      const r = Math.hypot(x, y);
      if (r > outer || r < inner) continue;
      if (hole && r < hole && rand() > (r - 0.85 * hole) / (0.15 * hole)) continue;
      if (zone && zone.taper && rand() > zone.taper(r)) continue;
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

// One camera stop per planet and dwarf planet, in distance order: wide
// enough for its moons, or a couple of dozen radii around a moonless body.
export function planetLevels(planets) {
  return planets.map((p) => ({
    id: p.name.toLowerCase(),
    name: p.name,
    radius: p.moons ? moonSystemRadius(p) : 25 * p.radius,
    follow: p,
  }));
}

// One camera stop per close-up star system, centered on its star in the
// neighbourhood list and reached by clicking that star's label.
// A point in a galaxy's disk (x along the major axis, y across it, any
// units) to sky offsets for a disk inclined i degrees with its major axis at
// position angle pa; the same rotation as a circular orbit's.
export function diskToSky(i, pa, x, y) {
  const cO = Math.cos(pa * D2R);
  const sO = Math.sin(pa * D2R);
  const ci = Math.cos(i * D2R);
  return { north: x * cO - y * ci * sO, east: x * sO + y * ci * cO, depth: y * Math.sin(i * D2R) };
}

// One camera stop per Local Group close-up, centered on the mean position
// of its member galaxies and reached by clicking any of them.
export function galaxyLevels(stops, galaxies) {
  return stops.map((stop) => {
    const pts = stop.galaxies.map((name) => {
      const g = galaxies.find((gal) => gal.name === name);
      return skyToPlane(g.l, g.dist * LY);
    });
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return { id: stop.id, name: stop.name, radius: stop.radius * LY, cx, cy, clickNames: stop.galaxies, caption: stop.caption };
  });
}

export function systemLevels(systems, stars) {
  return systems.map((sys) => {
    const star = stars.find((st) => st.name === sys.star);
    const { x, y } = skyToPlane(star.l, star.dist * LY);
    return { id: sys.id, name: sys.name, radius: sys.radius, cx: x, cy: y, clickName: sys.star, caption: sys.caption };
  });
}

export function formatDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function shouldIgnoreGlobalKeys(tagName, isContentEditable = false) {
  return isContentEditable || ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tagName);
}

// A w x h label to the right of the point (x, y), pushed back inside the
// bounds. Always the same side, so a label never jumps around as things
// move; labels may overlap where objects crowd.
// A label sits to the right of its point, or, when that would cover a
// rectangle in `taken`, to the left, above or below, trying `first` before the
// others so a label keeps its side from frame to frame. Returns null when
// every side is taken. Without `taken`, always the right.
export const LABEL_SIDES = 4;
export function placeLabel(x, y, w, h, bounds, gap = 8, taken = [], first = 0) {
  const sides = [
    [x + gap, y - h / 2],
    [x - gap - w, y - h / 2],
    [x - w / 2, y - gap - h],
    [x - w / 2, y + gap],
  ];
  const clamp = ([sx, sy]) => ({
    x: Math.max(0, Math.min(sx, bounds.w - w)),
    y: Math.max(0, Math.min(sy, bounds.h - h)),
    w,
    h,
  });
  const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (let i = 0; i < sides.length; i++) {
    const side = (first + i) % sides.length;
    const rect = clamp(sides[side]);
    if (!taken.some((r) => overlaps(r, rect))) return { ...rect, side };
  }
  return null;
}

// Stops of the guided tour, in order, and how long a leg between two zooms
// should take: a fixed rate of about a second per decade, plus a floor.
export const TOUR = [
  'earth', 'inner', 'outer', 'trans-neptunian', 'stars', 'local-bubble', 'local-arm',
  'milky-way', 'milky-way-halo', 'local-group', 'virgo', 'universe',
];
export const TOUR_HOLD_MS = 2500;

export function tourLegMs(fromMpp, toMpp) {
  const decades = Math.abs(Math.log10(toMpp / fromMpp));
  return 900 + 1000 * decades;
}
