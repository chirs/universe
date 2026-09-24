// Hover text for everything on the map. Pure functions of the data.
import { J2000_MS, DAY_S, YEAR_D, LY, PC, G_SI, SOLAR_MASS } from './data.js';
import {
  compactNumber, formatDistance, formatPeriod, starStyle, schwarzschildRadius, sunOrbitPeriodMyr, yearsAgo,
  hyperbolicPosition, horseshoe,
} from './util.js';

const OFFICIAL_DWARF_PLANETS = new Set(['Ceres', 'Pluto', 'Haumea', 'Makemake', 'Eris']);

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

export function blackHoleSummary(bh) {
  const suns = bh.mass / SOLAR_MASS;
  const mass = suns >= 1e9 ? `${compactNumber(suns / 1e9)} billion` : `${compactNumber(suns / 1e6)} million`;
  return `Supermassive black hole · ${mass} solar masses · Schwarzschild radius ${formatDistance(schwarzschildRadius(bh.mass))} · ${formatDistance(bh.distance)} from the Sun`;
}

export function notableGalaxySummary(g) {
  return `${g.kind} · ${formatDistance(g.dist * LY)} from the Milky Way · ${g.note}`;
}

// The Arecibo message, `traveled` meters out along its path to M13.
export function messageSummary(m, traveled) {
  const left = m.targetDist - traveled;
  const when = left > 0
    ? `${formatDistance(left)} still to go, arriving in about ${compactNumber(Math.round(left / LY / 100) * 100)} years`
    : `passed M13 ${compactNumber(Math.round(-left / LY))} years ago`;
  return `Radio message sent from Arecibo toward M13 on 16 November 1974 · ${formatDistance(traveled)} out, ${when} · ${m.note}`;
}

export function sStarSummary(star) {
  return `Star orbiting Sgr A* · periapsis ${formatDistance(star.a * (1 - star.e))} · apoapsis ${formatDistance(star.a * (1 + star.e))} · period ${formatPeriod(star.period)}`;
}

export function wallSummary(wall) {
  const shape = wall.honest ? '' : ' · high galactic latitude, so dropping latitude stretches it into an arc here';
  return `Great wall · about ${formatDistance(wall.waypoints[1][2] * 1e6 * LY)} away · ${wall.note}${shape}`;
}

export function distantSummary(o) {
  return `${o.kind} · redshift ${o.z} · ${formatDistance(o.dist * 1e6 * LY)} away now; its light left ${o.lookback.toFixed(1)} billion years ago · ${o.note}`;
}

export function sunOrbitSummary(mw) {
  const period = sunOrbitPeriodMyr(mw);
  return `The Sun\u2019s orbit · ${formatDistance(mw.sunDistance)} from the galactic center at about ${mw.circularSpeed} km/s · one lap every ${Math.round(period / 10) * 10} million years, about 20 laps since the Sun formed; one lap ago was the Late Triassic, when dinosaurs were new · drawn as a circle; the real path wanders slightly in and out and bobs through the disk`;
}

export function galacticObjectSummary(o) {
  return `${o.kind} · ${formatDistance(o.dist * LY)} from the Sun · ${o.note}`;
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

export function lookbackPowerSummary(years, dist) {
  const comoving = years >= 1e8 ? ' (comoving; space has stretched since)' : '';
  return `Lookback ${yearsAgo(years)} · light from ${formatDistance(dist)} away${comoving} set out then`;
}

export function observableUniverseSummary(radius) {
  return `Observable horizon · radius ${formatDistance(radius)} (comoving) · universe age about 13.8 billion years`;
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

export function interstellarSummary(body, days) {
  const p = hyperbolicPosition(body, days);
  const vInf = Math.sqrt(G_SI * SOLAR_MASS * (body.e - 1) / body.q) / 1000;
  const when = new Date(J2000_MS + body.tP * DAY_S * 1000).toISOString().slice(0, 7);
  return `Interstellar object · passed ${formatDistance(body.q)} from the Sun in ${when} · now ${formatDistance(Math.hypot(p.x, p.y))} out, leaving at ${compactNumber(vInf)} km/s · ${body.note}`;
}

export function companionSummary(body) {
  return `Asteroid · Earth companion · radius ${formatDistance(body.radius)} · period ${formatPeriod(body.period)} · ${body.note}`;
}

export function hypervelocitySummary(star) {
  return `Hypervelocity star · leaving the galaxy at ${star.speed.toLocaleString('en-US')} km/s, flung from Sgr A* about ${star.ejected / 1e6} million years ago `
    + `· ${formatDistance(star.dist)} from the Sun · path drawn straight from the center in this flattened map · Koposov et al. 2020`;
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
