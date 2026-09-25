import {
  AU, LY, SUN, PLANETS, BELTS, SPACECRAFT, HELIOSPHERE, ISS, TROJANS, COMETS, ASTEROIDS, YEAR_D, INTERSTELLAR,
  NEAR_EARTH, EARTH_RINGS,
} from '../data.js';
import { TRACKS } from '../spacecraft.js';
import {
  orbitalPosition, layerAlpha, formatDistance, sampledPosition, trackPath, rankineNose, rankineRadius,
  trojanPoints, coorbitalState, hyperbolicPosition, hyperbolicPath, binaryShares, binaryOffset,
} from '../util.js';
import {
  planetSummary, moonSummary, ringSummary, starSummary, spacecraftSummary, heliosphereSummary, issSummary,
  cometSummary, asteroidSummary, coorbitalSummary, interstellarSummary, companionSummary,
} from '../summaries.js';
import {
  TAU, makeBlob, annulus, drawPoints, dot, glow, label, hit, ringHit, SIGNAL, signal, onScreen,
} from '../draw.js';

function orbitEllipse(ctx, view, body, style) {
  const a = body.a / view.mpp;
  if (a > 30000) return;
  const e = body.e || 0;
  const varpi = (body.varpi || 0) * Math.PI / 180;
  // The Sun sits at a focus, a*e from the ellipse center toward perihelion.
  const cx = view.sx(0) - a * e * Math.cos(varpi);
  const cy = view.sy(0) + a * e * Math.sin(varpi);
  ctx.strokeStyle = style;
  ctx.beginPath();
  ctx.ellipse(cx, cy, a, a * Math.sqrt(1 - e * e), -varpi, 0, TAU);
  ctx.stroke();
}

// The last stretch of an orbit, brightening toward the body, so which way
// it moves shows. The body's orbit is about (ox, oy), scaled by k (a binary
// partner's share). Skipped when the orbit is so wide on screen that chords
// would stray from it.
function orbitTrail(ctx, view, body, days, ox, oy, k, color, alpha) {
  if (k * body.a / view.mpp > 3000) return;
  const span = 0.12 * body.period;
  const n = 24;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = color;
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = orbitalPosition(body, days - span * (1 - t));
    const x = view.sx(ox + k * p.x);
    const y = view.sy(oy + k * p.y);
    if (prev) {
      ctx.globalAlpha = 0.6 * alpha * t * t;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    prev = { x, y };
  }
  ctx.globalAlpha = 1;
}

export const solarSystem = {
  name: 'solar system',
  range: [0, 1500 * AU],
  draw(ctx, view, alpha, days) {
    const sx = view.sx(0);
    const sy = view.sy(0);
    ctx.lineWidth = 1;
    for (const p of PLANETS) orbitEllipse(ctx, view, p, `rgba(255,255,255,${0.14 * alpha})`);
    for (const p of PLANETS) orbitTrail(ctx, view, p, days, 0, 0, 1, p.color, alpha);
    const sunR = Math.max(SUN.radius / view.mpp, 4);
    glow(ctx, sx, sy, Math.max(sunR * 12, 70), SUN.color, 0.12 * alpha);
    glow(ctx, sx, sy, sunR * 4, SUN.color, 0.35 * alpha);
    dot(ctx, sx, sy, sunR, SUN.color, alpha);
    label(view, sx, sy, SUN.name, alpha, 2);
    hit(view, sx, sy, SUN.name, alpha, starSummary(SUN));
    for (const p of PLANETS) {
      const pos = orbitalPosition(p, days);
      const off = binaryOffset(p, days);
      const x = view.sx(pos.x + off.x);
      const y = view.sy(pos.y + off.y);
      if (!onScreen(view, x, y)) continue;
      const r = Math.max(p.radius / view.mpp, p.dwarf ? 1.5 : 2.5);
      if (r < 6) glow(ctx, x, y, r * 3, p.color, 0.3 * alpha);
      dot(ctx, x, y, r, p.color, alpha);
      const far = Math.hypot(x - sx, y - sy) > 14;
      label(view, x, y, p.name, far ? alpha : 0, p.dwarf ? 0 : 1);
      hit(view, x, y, p.name, far ? alpha : 0, planetSummary(p));
    }
  },
};

export const moons = {
  name: 'moons',
  range: [0, 0.08 * AU],
  draw(ctx, view, alpha, days) {
    for (const p of PLANETS) {
      if (!p.moons) continue;
      const pos = orbitalPosition(p, days);
      const px = view.sx(pos.x);
      const py = view.sy(pos.y);
      if (!onScreen(view, px, py, 2000)) continue;
      ctx.lineWidth = 1;
      for (const ring of p.rings || []) {
        const ro = ring.outer / view.mpp;
        if (ro < 6) continue;
        const ri = ring.inner / view.mpp;
        ctx.globalAlpha = ring.alpha * alpha;
        ctx.beginPath();
        // Narrow rings keep a hairline, as small bodies keep a dot.
        if (ro - ri < 1) {
          ctx.strokeStyle = p.ringColor || p.color;
          ctx.arc(px, py, (ro + ri) / 2, 0, TAU);
          ctx.stroke();
        } else {
          ctx.fillStyle = p.ringColor || p.color;
          ctx.arc(px, py, ro, 0, TAU);
          ctx.arc(px, py, ri, 0, TAU, true);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ringHit(view, px, py, (ro + ri) / 2, `${p.name}\u2019s ${ring.name}`, alpha, ringSummary(ring, p.name));
      }
      const shares = p.binary ? binaryShares(p) : null;
      if (shares) {
        // The planet's own small circle about the barycenter, which is marked.
        const r = shares.planet * shares.partner.a / view.mpp;
        if (r > 3) {
          ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,255,${0.5 * alpha})`;
          ctx.beginPath();
          ctx.moveTo(px - 4, py); ctx.lineTo(px + 4, py);
          ctx.moveTo(px, py - 4); ctx.lineTo(px, py + 4);
          ctx.stroke();
          hit(view, px, py, 'Barycenter', alpha,
            `${p.name} and ${shares.partner.name} both circle this point, ${formatDistance(shares.planet * shares.partner.a)} from ${p.name}\u2019s center and outside it; the small moons orbit it too`);
        }
      }
      for (const m of p.moons) {
        // A binary partner circles the barycenter at its share of the separation.
        const k = shares && m === shares.partner ? shares.moon : 1;
        const a = k * m.a / view.mpp;
        const e = m.e || 0;
        const varpi = (m.varpi || 0) * Math.PI / 180;
        ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(px - a * e * Math.cos(varpi), py + a * e * Math.sin(varpi),
          a, a * Math.sqrt(1 - e * e), -varpi, 0, TAU);
        ctx.stroke();
        if (a > 14) orbitTrail(ctx, view, m, days, pos.x, pos.y, k, m.color, alpha);
        const mp = orbitalPosition(m, days);
        const x = view.sx(pos.x + k * mp.x);
        const y = view.sy(pos.y + k * mp.y);
        if (!onScreen(view, x, y)) continue;
        const r = Math.max(m.radius / view.mpp, 2);
        if (r < 6) glow(ctx, x, y, r * 3, m.color, 0.3 * alpha);
        dot(ctx, x, y, r, m.color, alpha);
        const far = Math.hypot(x - px, y - py) > 14;
        label(view, x, y, m.name, far ? alpha : 0, 0);
        hit(view, x, y, m.name, far ? alpha : 0, moonSummary(m, p.name));
      }
    }
  },
};

// Janus and Epimetheus on their shared orbit. In the frame that turns with
// the pair (main.js), each trails the last four years of its horseshoe:
// past positions turned forward by the pair's motion since.
export const coorbitals = (() => {
  const saturn = PLANETS.find((p) => p.name === 'Saturn');
  const pair = saturn.coorbitals;
  return {
    name: 'co-orbital moons',
    range: [0, 0.08 * AU],
    draw(ctx, view, alpha, days) {
      const pos = orbitalPosition(saturn, days);
      const px = view.sx(pos.x);
      const py = view.sy(pos.y);
      if (!onScreen(view, px, py, 2000)) return;
      const now = coorbitalState(pair, days);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, pair.a / view.mpp, 0, TAU);
      ctx.stroke();
      if (view.frame === 'janus') {
        const span = pair.swapInterval;
        const step = 4;
        pair.moons.forEach((m, i) => {
          let last = null;
          for (let d = days - span; d <= days; d += step) {
            const st = coorbitalState(pair, d);
            const b = st.bodies[i];
            const lon = b.lon - st.center + now.center;
            const x = view.sx(pos.x + b.r * Math.cos(lon));
            const y = view.sy(pos.y + b.r * Math.sin(lon));
            if (last) {
              ctx.strokeStyle = `rgba(200,220,255,${0.5 * alpha * (d - days + span) / span})`;
              ctx.beginPath();
              ctx.moveTo(last[0], last[1]);
              ctx.lineTo(x, y);
              ctx.stroke();
            }
            last = [x, y];
          }
        });
      }
      pair.moons.forEach((m, i) => {
        const b = now.bodies[i];
        const x = view.sx(pos.x + b.x);
        const y = view.sy(pos.y + b.y);
        if (!onScreen(view, x, y)) return;
        dot(ctx, x, y, Math.max(m.radius / view.mpp, 2), m.color, alpha);
        const far = Math.hypot(x - px, y - py) > 14;
        label(view, x, y, m.name, far ? alpha : 0, 0);
        hit(view, x, y, m.name, far ? alpha : 0, coorbitalSummary(pair, i, now));
      });
    },
  };
})();

function belt(name, cfg, range, color, log = false) {
  const pts = annulus(cfg.seed, cfg.count, cfg.inner, cfg.outer, log);
  return {
    name,
    range,
    draw(ctx, view, alpha) {
      drawPoints(ctx, view, pts, 0, 0, color, 0.55 * alpha);
    },
  };
}

export const asteroidBelt = belt('asteroid belt', BELTS.asteroid, [0, 60 * AU], '#8f8a80');
export const kuiperBelt = belt('kuiper belt', BELTS.kuiper, [4 * AU, 1500 * AU], '#8fa0b8');
// Jupiter's Trojans ride 60 degrees ahead of and behind the planet.
export const trojans = (() => {
  const jupiter = PLANETS.find((p) => p.name === 'Jupiter');
  const swarm = (cfg) => makeBlob(cfg.seed, TROJANS.sigmaLon * Math.PI / 180, TROJANS.sigmaR, cfg.count);
  const swarms = [['Trojans (L4)', swarm(TROJANS.l4), TAU / 6], ['Trojans (L5)', swarm(TROJANS.l5), -TAU / 6]];
  const pts = new Float64Array(Math.max(TROJANS.l4.count, TROJANS.l5.count) * 2);
  return {
    name: 'trojans',
    range: [0, 60 * AU],
    draw(ctx, view, alpha, days) {
      const pos = orbitalPosition(jupiter, days);
      const r = Math.hypot(pos.x, pos.y);
      const t = Math.atan2(pos.y, pos.x);
      const centers = trojanPoints(pos);
      for (const [name, s, offset] of swarms) {
        const n = s.length / 2;
        for (let i = 0; i < n; i++) {
          const lon = t + offset + s[2 * i];
          const rr = r + s[2 * i + 1];
          pts[2 * i] = rr * Math.cos(lon);
          pts[2 * i + 1] = rr * Math.sin(lon);
        }
        drawPoints(ctx, view, pts.subarray(0, 2 * n), 0, 0, '#b8a888', 0.25 * alpha);
        const c = offset > 0 ? centers.l4 : centers.l5;
        label(view, view.sx(c.x), view.sy(c.y), name, 0.8 * alpha, 0);
      }
    },
  };
})();

// Comets and named asteroids on their flattened orbits. Earth's companions
// also trail their last year as seen turning with Earth, when the frame
// turns with it (main.js), which is where their loops show.
const EARTH = PLANETS.find((p) => p.name === 'Earth');
const earthLon = (days) => {
  const e = orbitalPosition(EARTH, days);
  return Math.atan2(e.y, e.x);
};
export const smallBodies = {
  name: 'small bodies',
  range: [0, 1500 * AU],
  draw(ctx, view, alpha, days) {
    ctx.lineWidth = 1;
    const earthFrame = view.frame === 'earth';
    for (const c of [...COMETS, ...ASTEROIDS]) {
      const comet = COMETS.includes(c);
      if (!(earthFrame && c.companion)) {
        orbitEllipse(ctx, view, c, comet ? `rgba(190,220,255,${0.16 * alpha})` : `rgba(255,255,255,${0.1 * alpha})`);
      }
      if (earthFrame && c.companion) {
        const now = earthLon(days);
        ctx.beginPath();
        for (let d = days - 366; d <= days; d += 1) {
          const p = orbitalPosition(c, d);
          const turn = now - earthLon(d);
          ctx.lineTo(view.sx(p.x * Math.cos(turn) - p.y * Math.sin(turn)), view.sy(p.x * Math.sin(turn) + p.y * Math.cos(turn)));
        }
        ctx.strokeStyle = `rgba(230,215,180,${0.45 * alpha})`;
        ctx.stroke();
      }
      const pos = orbitalPosition(c, days);
      const x = view.sx(pos.x);
      const y = view.sy(pos.y);
      if (!onScreen(view, x, y)) continue;
      dot(ctx, x, y, 2, c.color, alpha);
      const far = Math.hypot(x - view.sx(0), y - view.sy(0)) > 14;
      label(view, x, y, c.name, far ? alpha : 0, 0);
      hit(view, x, y, c.name, far ? alpha : 0, comet ? cometSummary(c) : c.companion ? companionSummary(c) : asteroidSummary(c));
    }
  },
};

// The interstellar visitors on their open paths: behind them solid, ahead
// dashed, both fading with distance from the present. The vertices are
// fixed; the clock only moves the split and the fade.
const paths = new Map();
export const interstellar = {
  name: 'interstellar',
  range: [0, 3000 * AU],
  draw(ctx, view, alpha, days) {
    ctx.lineWidth = 1;
    for (const b of INTERSTELLAR) {
      if (!paths.has(b)) paths.set(b, hyperbolicPath(b, 4000 * AU));
      const path = paths.get(b);
      const now = { ...hyperbolicPosition(b, days), days };
      const split = path.findIndex((p) => p.days > days);
      const behind = split < 0 ? [...path, now] : [...path.slice(0, split), now];
      const ahead = split < 0 ? [] : [now, ...path.slice(split)];
      for (const [pts, dash] of [[behind, []], [ahead, [3, 5]]]) {
        ctx.setLineDash(dash);
        for (let i = 1; i < pts.length; i++) {
          const fade = 1 - Math.abs(pts[i - 1].days - days) / (40 * YEAR_D);
          if (fade <= 0) continue;
          ctx.strokeStyle = `rgba(230,200,170,${0.35 * alpha * fade})`;
          ctx.beginPath();
          ctx.moveTo(view.sx(pts[i - 1].x), view.sy(pts[i - 1].y));
          ctx.lineTo(view.sx(pts[i].x), view.sy(pts[i].y));
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      const x = view.sx(now.x);
      const y = view.sy(now.y);
      if (!onScreen(view, x, y)) continue;
      dot(ctx, x, y, 2, b.color, alpha);
      label(view, x, y, b.name, alpha, 0);
      hit(view, x, y, b.name, alpha, interstellarSummary(b, days));
    }
  },
};

// Inferred, never observed, and presumably not unique to the Sun, so it fades
// out before other stars come on screen rather than mark us out.
export const oortCloud = (() => {
  const inner = belt('oort cloud', BELTS.oort, [0.02 * LY, 4 * LY], '#7f8ea8', true);
  return {
    ...inner,
    draw(ctx, view, alpha) {
      inner.draw(ctx, view, alpha);
      const r = BELTS.oort.outer / view.mpp;
      if (r > 60) label(view, view.sx(0), view.sy(0) - r, 'Oort cloud (inferred)', alpha, 0);
    },
  };
})();

// Spacecraft on their Horizons tracks, with the recent path behind them.
export const spacecraft = {
  name: 'spacecraft',
  range: [0, 1500 * AU],
  draw(ctx, view, alpha, days) {
    ctx.lineWidth = 1;
    for (const sc of [...SPACECRAFT, ...NEAR_EARTH]) {
      if (sc.center) continue;
      // A body with an Earth-relative flyby track hands over to it while it runs.
      if (sc.flyby && sampledPosition(TRACKS[sc.flyby], days)) continue;
      const track = TRACKS[sc.track || sc.name];
      const pos = sampledPosition(track, days, sc.escape);
      if (!pos) continue;
      const path = trackPath(track, days - sc.trail, days, sc.escape);
      ctx.strokeStyle = sc.color ? `${sc.color}22` : signal(0.1 * alpha);
      ctx.beginPath();
      for (let i = 0; i < path.length; i += 2) ctx.lineTo(view.sx(path[i]), view.sy(path[i + 1]));
      ctx.stroke();
      const x = view.sx(pos.x);
      const y = view.sy(pos.y);
      if (!onScreen(view, x, y)) continue;
      dot(ctx, x, y, 2, sc.color || SIGNAL, alpha);
      const far = Math.hypot(x - view.sx(0), y - view.sy(0)) > 14;
      label(view, x, y, sc.name, far ? alpha : 0, 0);
      hit(view, x, y, sc.name, far ? alpha : 0, spacecraftSummary(sc, Math.hypot(pos.x, pos.y)));
    }
  },
};

// Around Earth: the ISS on a face-on circle, and craft whose Horizons track
// is relative to Earth (the halo orbits around L1 and L2).
export const earthOrbiters = {
  name: 'earth orbiters',
  range: [0, 0.08 * AU],
  draw(ctx, view, alpha, days) {
    const e = orbitalPosition(EARTH, days);
    const ex = view.sx(e.x);
    const ey = view.sy(e.y);
    if (!onScreen(view, ex, ey, 2000)) return;
    const a = ISS.a / view.mpp;
    const issFar = a > 14;
    if (issFar) {
      ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ex, ey, a, 0, TAU);
      ctx.stroke();
      const p = orbitalPosition(ISS, days);
      const x = view.sx(e.x + p.x);
      const y = view.sy(e.y + p.y);
      dot(ctx, x, y, 2, ISS.color, alpha);
      label(view, x, y, ISS.name, alpha, 0);
      hit(view, x, y, ISS.name, alpha, issSummary(ISS));
    }
    for (const ring of EARTH_RINGS) {
      const r = ring.radius / view.mpp;
      if (r < 8) continue;
      ctx.strokeStyle = `rgba(255,255,255,${0.2 * alpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([1, 3]);
      ctx.beginPath();
      ctx.arc(ex, ey, r, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      label(view, ex - r * Math.SQRT1_2, ey + r * Math.SQRT1_2, ring.name, r > 24 ? 0.8 * alpha : 0, 0);
      ringHit(view, ex, ey, r, ring.name, alpha, `${ring.name} · ${formatDistance(ring.radius)} from Earth’s center · ${ring.note}`);
    }
    for (const sc of [...SPACECRAFT, ...NEAR_EARTH]) {
      if (sc.center !== 399) continue;
      const track = TRACKS[sc.track || sc.name];
      const pos = sampledPosition(track, days);
      if (!pos) continue;
      // Past positions turned by Earth's motion since, so the trail keeps
      // its place relative to the Sun-Earth line.
      const eAngle = Math.atan2(e.y, e.x);
      ctx.strokeStyle = sc.color ? `${sc.color}55` : signal(0.1 * alpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let d = days - sc.trail; d <= days; d += sc.step) {
        const p = sampledPosition(track, d);
        if (!p) continue;
        const then = orbitalPosition(EARTH, d);
        const turn = eAngle - Math.atan2(then.y, then.x);
        const c = Math.cos(turn);
        const sn = Math.sin(turn);
        ctx.lineTo(view.sx(e.x + p.x * c - p.y * sn), view.sy(e.y + p.x * sn + p.y * c));
      }
      ctx.lineTo(view.sx(e.x + pos.x), view.sy(e.y + pos.y));
      ctx.stroke();
      const x = view.sx(e.x + pos.x);
      const y = view.sy(e.y + pos.y);
      if (!onScreen(view, x, y)) continue;
      dot(ctx, x, y, 2, sc.color || SIGNAL, alpha);
      const far = Math.hypot(x - ex, y - ey) > 14;
      label(view, x, y, sc.name, far ? alpha : 0, 0);
      hit(view, x, y, sc.name, far ? alpha : 0, spacecraftSummary(sc, Math.hypot(pos.x, pos.y), 'Earth'));
    }
  },
};

// The termination shock at the Voyagers' mean crossing, and the heliopause
// through theirs, blunt toward the interstellar wind and trailing away.
export const heliosphere = (() => {
  const ts = HELIOSPHERE.terminationShock;
  const hp = HELIOSPHERE.heliopause;
  const tsR = ts.crossings.reduce((sum, c) => sum + c[2], 0) / ts.crossings.length;
  const nose = HELIOSPHERE.nose * Math.PI / 180;
  const off = (lon) => Math.abs(((lon - HELIOSPHERE.nose + 540) % 360) - 180);
  const hpNose = rankineNose(hp.crossings.map((c) => [c[2], off(c[3])]));
  // Out to 150 degrees from the nose, about five times the nose distance.
  const PSI_MAX = 150 * Math.PI / 180;
  const outline = [];
  for (let k = -60; k <= 60; k++) {
    const psi = PSI_MAX * k / 60;
    const r = rankineRadius(hpNose, Math.abs(psi));
    outline.push({ x: r * Math.cos(nose + psi), y: r * Math.sin(nose + psi) });
  }
  const tail = rankineRadius(hpNose, PSI_MAX) * Math.cos(PSI_MAX);
  return {
    name: 'heliosphere',
    range: [20 * AU, 3000 * AU],
    draw(ctx, view, alpha) {
      const x = view.sx(0);
      const y = view.sy(0);
      const r = tsR / view.mpp;
      if (r >= 8) {
        ctx.strokeStyle = `rgba(150,190,255,${0.2 * alpha})`;
        ctx.setLineDash([3, 6]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        label(view, x, y - r, ts.name, alpha, 1);
        ringHit(view, x, y, r, ts.name, alpha, heliosphereSummary(ts));
      }
      if (hpNose / view.mpp < 8) return;
      // Brightest at the nose, gone by the end of the drawn tail.
      const g = ctx.createLinearGradient(view.sx(hpNose * Math.cos(nose)), view.sy(hpNose * Math.sin(nose)),
        view.sx(tail * Math.cos(nose)), view.sy(tail * Math.sin(nose)));
      g.addColorStop(0, 'rgba(150,190,255,1)');
      g.addColorStop(0.35, 'rgba(150,190,255,0.5)');
      g.addColorStop(1, 'rgba(150,190,255,0)');
      ctx.beginPath();
      outline.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](view.sx(p.x), view.sy(p.y)));
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.05 * alpha;
      ctx.fill();
      ctx.strokeStyle = g;
      ctx.globalAlpha = 0.4 * alpha;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      const nx = view.sx(hpNose * Math.cos(nose));
      const ny = view.sy(hpNose * Math.sin(nose));
      label(view, nx, ny, hp.name, alpha, 1);
      hit(view, nx, ny, hp.name, alpha, heliosphereSummary(hp));
      for (const p of outline.filter((_, k) => k % 10 === 0)) hit(view, view.sx(p.x), view.sy(p.y), hp.name, alpha, heliosphereSummary(hp));
    },
  };
})();

// The Sun as a bare dot once the planets are sub-pixel.
export const sunDot = {
  name: 'sun dot',
  range: [100 * AU, 200e3 * LY],
  draw(ctx, view, alpha) {
    const x = view.sx(0);
    const y = view.sy(0);
    glow(ctx, x, y, 8, SUN.color, 0.5 * alpha);
    dot(ctx, x, y, 2, SUN.color, alpha);
    // The solar system layer names the Sun where the two overlap.
    const own = alpha * (1 - layerAlpha(view.radius, solarSystem.range));
    label(view, x, y, 'Sun', own, 3);
    hit(view, x, y, 'Sun', own, starSummary(SUN));
  },
};
