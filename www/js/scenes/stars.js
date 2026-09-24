import {
  LY, PC, STARS, BRIGHT_STARS, LOCAL_BUBBLE, STAR_SYSTEMS, RADIO, J2000_MS, DAY_S, SYSTEM_STARS, ARECIBO_MESSAGE,
} from '../data.js';
import {
  orbitalPosition, skyToPlane, formatDistance, skyOrbitPosition, skyOrbitPath, galacticPlanePositionAngle,
  skyOffsetToPlane, starStyle, habitableZone, radioRadius,
} from '../util.js';
import {
  starSummary, starSystemSummary, cloudSummary, componentSummary, exoplanetSummary, radioSummary,
  messageSummary,
} from '../summaries.js';
import {
  TAU, makeBlob, drawPoints, dot, glow, label, hit, ringHit, signal, onScreen,
} from '../draw.js';
import { SCO_CEN } from '../scocen.js';

// Scorpius-Centaurus, the nearest OB association: the 37 Gaia clusters of
// Ratzenboeck et al. 2023 scattered at their distances, each spread by its
// members' width along the sky and along the line of sight, with the
// subregions labeled at their member-weighted centers.
export const scoCen = (() => {
  const REGIONS = {
    US: ['Upper Scorpius', 1], UCL: ['Upper Centaurus–Lupus', 1], LCC: ['Lower Centaurus–Crux', 1],
    Pipe: ['Pipe Nebula clusters', 0], CrA: ['Corona Australis clusters', 0], Cham: ['Chamaeleon clusters', 0], NE: ['Ophiuchus north-east', 0],
  };
  const clusters = SCO_CEN.map(([region, group, l, , distPc, halfLon, halfDist, n], i) => {
    const dist = distPc * PC;
    const across = halfLon * Math.PI / 180 * dist;
    return {
      region, group, n, dist, ...skyToPlane(l, dist),
      pts: makeBlob(700 + i, halfDist * PC, across, Math.max(10, Math.round(n / 6)), l),
    };
  });
  const regions = Object.entries(REGIONS).map(([key, [name, priority]]) => {
    const own = clusters.filter((c) => c.region.trim() === key);
    const total = own.reduce((s, c) => s + c.n, 0);
    return {
      name, priority, n: total,
      x: own.reduce((s, c) => s + c.x * c.n, 0) / total,
      y: own.reduce((s, c) => s + c.y * c.n, 0) / total,
      groups: own.length,
    };
  });
  const about = 'part of Scorpius–Centaurus, the nearest OB association: its massive stars were born over the last 20 million years, and the supernovae among them blew the Local Bubble';
  return {
    name: 'sco-cen',
    range: [40 * LY, 3000 * LY],
    draw(ctx, view, alpha) {
      for (const c of clusters) {
        const x = view.sx(c.x);
        const y = view.sy(c.y);
        if (!onScreen(view, x, y, 300)) continue;
        drawPoints(ctx, view, c.pts, c.x, c.y, '#b8ccff', 0.55 * alpha, 1.3);
        hit(view, x, y, `${c.group} cluster`, alpha,
          `Young cluster in ${REGIONS[c.region.trim()][0]} · ${c.n} Gaia members · ${formatDistance(c.dist)} from the Sun · ${about} · Ratzenböck et al. 2023`);
      }
      for (const r of regions) {
        const x = view.sx(r.x);
        const y = view.sy(r.y);
        if (!onScreen(view, x, y)) continue;
        label(view, x, y, r.name, 0.9 * alpha, r.priority);
        hit(view, x, y, r.name, alpha, `${r.groups} clusters, ${r.n} Gaia members · ${about} · Ratzenböck et al. 2023`);
      }
    },
  };
})();

// Each system is drawn by its primary's spectral type; a ring marks systems
// with known planets.
const starPositions = [...STARS, ...SYSTEM_STARS].map((s) => ({ ...s, ...skyToPlane(s.l, s.dist * LY), style: starStyle(s.types[0]) }));

export const nearestStars = {
  name: 'nearest stars',
  range: [0.5 * LY, 300 * LY],
  draw(ctx, view, alpha) {
    for (const s of starPositions) {
      const x = view.sx(s.x);
      const y = view.sy(s.y);
      if (!onScreen(view, x, y)) continue;
      const { color, radius, visible } = s.style;
      glow(ctx, x, y, radius * 4, color, (visible ? 0.35 : 0.2) * alpha);
      dot(ctx, x, y, radius, color, alpha);
      if (s.planets) {
        ctx.strokeStyle = `rgba(255,255,255,${0.5 * alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, TAU);
        ctx.stroke();
      }
      label(view, x, y, s.name, alpha, visible ? 1 : 0);
      hit(view, x, y, s.name, alpha, starSystemSummary(s));
    }
  },
};

// Close-up star systems: a host star with planets, belts and a habitable
// zone, and/or a binary on its real orbit projected onto the galactic
// plane, its barycenter at the system's position or circling the host.
export const starSystems = (() => {
  const systems = STAR_SYSTEMS.map((sys) => {
    const pos = starPositions.find((st) => st.name === sys.star);
    const out = { ...sys, x: pos.x, y: pos.y, summary: starSystemSummary(pos) };
    if (sys.binary) {
      const b = sys.binary;
      const planePA = galacticPlanePositionAngle(b.ra, b.dec);
      const toPlane = (p) => skyOffsetToPlane(p, planePA, pos.l);
      const total = b.primary.mass + b.secondary.mass;
      out.toPlane = toPlane;
      out.path = skyOrbitPath(b.orbit).map(toPlane);
      out.pair = [[b.primary, -b.secondary.mass / total, b.secondary.name], [b.secondary, b.primary.mass / total, b.primary.name]];
    }
    return out;
  });
  const planetColor = (p) => (p.massEarth >= 100 ? '#d9b48a' : p.massEarth >= 5 ? '#8fb8d8' : '#c9b8a8');
  const star = (ctx, view, x, y, s, alpha) => {
    const { color } = starStyle(s.type);
    const r = Math.max(s.radius / view.mpp, 3);
    glow(ctx, x, y, r * 4, color, 0.35 * alpha);
    dot(ctx, x, y, r, color, alpha);
  };
  const zone = (ctx, view, x, y, luminosity, alpha) => {
    const hz = habitableZone(luminosity);
    if (hz.outer / view.mpp < 6) return;
    ctx.globalAlpha = 0.12 * alpha;
    ctx.fillStyle = '#7fd8a0';
    ctx.beginPath();
    ctx.arc(x, y, hz.outer / view.mpp, 0, TAU);
    ctx.arc(x, y, hz.inner / view.mpp, 0, TAU, true);
    ctx.fill();
    ctx.globalAlpha = 1;
    ringHit(view, x, y, hz.outer / view.mpp, 'Habitable zone', alpha,
      `Rough habitable zone · ${formatDistance(hz.inner)} to ${formatDistance(hz.outer)} from the star · where liquid water could last on a rocky planet`);
  };
  return {
    name: 'star systems',
    range: [0, 0.05 * LY],
    draw(ctx, view, alpha, days) {
      ctx.lineWidth = 1;
      for (const sys of systems) {
        const sx = view.sx(sys.x);
        const sy = view.sy(sys.y);
        if (!onScreen(view, sx, sy, 5000)) continue;
        if (sys.host) {
          for (const belt of sys.belts || []) {
            ctx.globalAlpha = 0.1 * alpha;
            ctx.fillStyle = '#c8c0b0';
            ctx.beginPath();
            ctx.arc(sx, sy, belt.outer / view.mpp, 0, TAU);
            ctx.arc(sx, sy, belt.inner / view.mpp, 0, TAU, true);
            ctx.fill();
            ctx.globalAlpha = 1;
            ringHit(view, sx, sy, (belt.inner + belt.outer) / 2 / view.mpp, `${sys.host.name} ${belt.name}`, alpha,
              `Debris belt · ${formatDistance(belt.inner)} to ${formatDistance(belt.outer)} from the star`);
          }
          if (sys.host.luminosity) zone(ctx, view, sx, sy, sys.host.luminosity, alpha);
          for (const p of sys.planets || []) {
            const a = p.a / view.mpp;
            const e = p.e || 0;
            ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
            ctx.setLineDash(p.candidate ? [4, 4] : []);
            ctx.beginPath();
            ctx.ellipse(sx - a * e, sy, a, a * Math.sqrt(1 - e * e), 0, 0, TAU);
            ctx.stroke();
          }
          ctx.setLineDash([]);
          star(ctx, view, sx, sy, sys.host, alpha);
          label(view, sx, sy, sys.host.name, alpha, 1);
          hit(view, sx, sy, sys.host.name, alpha, sys.binary ? componentSummary(sys.host) : sys.summary);
          for (const p of sys.planets || []) {
            const pos = orbitalPosition(p, days);
            const x = view.sx(sys.x + pos.x);
            const y = view.sy(sys.y + pos.y);
            if (!onScreen(view, x, y)) continue;
            dot(ctx, x, y, 2.5, planetColor(p), alpha);
            const far = Math.hypot(x - sx, y - sy) > 14;
            label(view, x, y, p.name, far ? alpha : 0, 0);
            hit(view, x, y, p.name, far ? alpha : 0, exoplanetSummary(p, sys.host.name));
          }
        }
        if (sys.binary) {
          const b = sys.binary;
          let bx = sys.x;
          let by = sys.y;
          if (b.around) {
            const o = orbitalPosition(b.around, days);
            bx += o.x;
            by += o.y;
            ctx.strokeStyle = `rgba(255,255,255,${0.1 * alpha})`;
            ctx.setLineDash([3, 6]);
            ctx.beginPath();
            ctx.arc(sx, sy, b.around.a / view.mpp, 0, TAU);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          const rel = sys.toPlane(skyOrbitPosition(b.orbit, days));
          if (b.primary.luminosity) {
            const f = sys.pair[0][1];
            zone(ctx, view, view.sx(bx + f * rel.x), view.sy(by + f * rel.y), b.primary.luminosity, alpha);
          }
          ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
          for (const [s, f, partner] of sys.pair) {
            ctx.beginPath();
            sys.path.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](view.sx(bx + f * p.x), view.sy(by + f * p.y)));
            ctx.closePath();
            ctx.stroke();
            const x = view.sx(bx + f * rel.x);
            const y = view.sy(by + f * rel.y);
            star(ctx, view, x, y, s, alpha);
            const far = Math.hypot(x - sx, y - sy) > 14 || !sys.host;
            label(view, x, y, s.name, far ? alpha : 0, 1);
            hit(view, x, y, s.name, far ? alpha : 0, componentSummary(s, partner, b.orbit.period));
          }
        }
      }
    },
  };
})();

// The Local Bubble: a soft cavity whose shell passes through the nearby
// star-forming clouds, at a schematic radius between them.
export const localBubble = (() => {
  const clouds = LOCAL_BUBBLE.clouds.map((c) => ({ ...c, ...skyToPlane(c.l, c.dist * LY) }));
  const anchors = [...clouds.filter((c) => c.outline !== false).map((c) => [c.l, c.dist * LY]), [90, LOCAL_BUBBLE.radius], [240, LOCAL_BUBBLE.radius]]
    .sort((a, b) => a[0] - b[0]);
  // Shell radius at longitude l, interpolated between anchors around the circle.
  const shell = (l) => {
    const n = anchors.length;
    for (let i = 0; i < n; i++) {
      const [l0, r0] = anchors[i];
      const [l1raw, r1] = anchors[(i + 1) % n];
      const l1 = i + 1 < n ? l1raw : l1raw + 360;
      const lw = l < l0 ? l + 360 : l;
      if (lw >= l0 && lw <= l1) {
        const u = l1 === l0 ? 0 : (lw - l0) / (l1 - l0);
        const e = u * u * (3 - 2 * u);
        return Math.exp(Math.log(r0) + e * (Math.log(r1) - Math.log(r0)));
      }
    }
    return anchors[0][1];
  };
  const outline = [];
  for (let l = 0; l < 360; l += 2) outline.push(skyToPlane(l, shell(l)));
  return {
    name: 'local bubble',
    range: [50 * LY, 3000 * LY],
    draw(ctx, view, alpha) {
      ctx.beginPath();
      outline.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](view.sx(p.x), view.sy(p.y)));
      ctx.closePath();
      ctx.fillStyle = `rgba(120,150,210,${0.06 * alpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(150,180,240,${0.35 * alpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      const edge = skyToPlane(120, shell(120));
      label(view, view.sx(edge.x), view.sy(edge.y), 'Local Bubble', alpha, 1);
      for (const c of clouds) {
        const x = view.sx(c.x);
        const y = view.sy(c.y);
        if (!onScreen(view, x, y)) continue;
        const r = Math.max(6, 25 * LY / view.mpp);
        glow(ctx, x, y, r, 'rgba(255,160,150,0.7)', alpha);
        label(view, x, y, c.name, alpha, 0);
        hit(view, x, y, c.name, alpha, cloudSummary(c));
      }
    },
  };
})();

// The sphere our radio broadcasts have filled, growing at the speed of
// light with the clock. The named stars it has passed are the bright stars
// and the nearest systems.
export const radioSphere = (() => {
  const named = [...STARS, ...BRIGHT_STARS];
  return {
    name: 'radio sphere',
    range: [3 * LY, 3000 * LY],
    draw(ctx, view, alpha, days) {
      const radius = radioRadius(RADIO, J2000_MS + days * DAY_S * 1000);
      const r = radius / view.mpp;
      if (r < 6) return;
      const x = view.sx(0);
      const y = view.sy(0);
      // A wavefront: brightest at the edge, thinning back toward the Sun.
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, signal(0));
      g.addColorStop(0.7, signal(0.015));
      g.addColorStop(1, signal(0.08));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = signal(0.45);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      const at = [x + r * Math.SQRT1_2, y + r * Math.SQRT1_2];
      label(view, ...at, 'Our radio broadcasts', 0.8 * alpha, 1);
      ringHit(view, x, y, r, 'Our radio broadcasts', alpha, radioSummary(RADIO, radius, named));
    },
  };
})();

// The Arecibo message: a pulse moving at light speed toward M13 with the
// clock, with the rest of its path dashed ahead of it.
export const areciboMessage = (() => {
  const m = ARECIBO_MESSAGE;
  const dir = skyToPlane(m.l, 1);
  return {
    name: 'arecibo message',
    range: [1 * LY, 100e3 * LY],
    draw(ctx, view, alpha, days) {
      const r = radioRadius({ start: m.sent }, J2000_MS + days * DAY_S * 1000);
      if (r <= 0) return;
      const x = view.sx(dir.x * r);
      const y = view.sy(dir.y * r);
      if (Math.hypot(x - view.sx(0), y - view.sy(0)) < 14) return;
      if (!onScreen(view, x, y, 1e6)) return;
      ctx.lineWidth = 1;
      if (r < m.targetDist) {
        ctx.strokeStyle = signal(0.25 * alpha);
        ctx.setLineDash([2, 6]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(view.sx(dir.x * m.targetDist), view.sy(dir.y * m.targetDist));
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.strokeStyle = signal(0.6 * alpha);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(view.sx(dir.x * (r - 10 * view.mpp)), view.sy(dir.y * (r - 10 * view.mpp)));
      ctx.lineTo(x, y);
      ctx.stroke();
      glow(ctx, x, y, 8, signal(0.6), alpha);
      dot(ctx, x, y, 2, '#d8fff2', alpha);
      label(view, x, y, m.name, alpha, 1);
      hit(view, x, y, m.name, alpha, messageSummary(m, r));
    },
  };
})();

const HUES = { b: '#c8d8ff', w: '#f4f4ff', y: '#fff0c0', o: '#ffb884' };

const brightPositions = BRIGHT_STARS.map((s) => ({ ...s, ...skyToPlane(s.l, s.dist * LY) }));

export const brightStars = {
  name: 'bright stars',
  range: [5 * LY, 3000 * LY],
  draw(ctx, view, alpha) {
    for (const s of brightPositions) {
      const x = view.sx(s.x);
      const y = view.sy(s.y);
      if (!onScreen(view, x, y)) continue;
      const r = Math.min(3.2, Math.max(1.3, 2.6 - 0.6 * s.mag));
      const color = HUES[s.hue];
      glow(ctx, x, y, r * 4, color, 0.3 * alpha);
      dot(ctx, x, y, r, color, alpha);
      label(view, x, y, s.name, alpha, s.mag < 1.5 ? 1 : 0);
      hit(view, x, y, s.name, alpha, starSummary(s));
    }
  },
};

// Every star within 1500 light-years more luminous than absolute G = 1,
// from Gaia DR3 (scripts/fetch-gaia.mjs), in its spectral color. Fetched on
// first use; the layer is empty until it arrives.
export const fieldStars = (() => {
  const SPECTRAL = 'BAFGKM';
  const SIZE = [2, 1.5, 1];
  const ALPHA = [0.95, 0.8, 0.6];
  // The less luminous classes would pile into a solid disc as the view
  // widens, so they fade out first, leaving the O and B stars and giants.
  const FADE = [null, [1500 * LY, 5000 * LY], [700 * LY, 2500 * LY]];
  const fade = (lum, r) => (FADE[lum] ? Math.min(1, Math.max(0, Math.log(FADE[lum][1] / r) / Math.log(FADE[lum][1] / FADE[lum][0]))) : 1);
  let groups = null;
  const load = async () => {
    const buf = await (await fetch('data/gaia-stars.bin')).arrayBuffer();
    const n = buf.byteLength / 5;
    const view = new DataView(buf);
    const byClass = Array.from({ length: SPECTRAL.length * 4 }, () => []);
    for (let i = 0; i < n; i++) {
      byClass[view.getUint8(4 * n + i)].push(view.getInt16(4 * i, true) / 20 * LY, view.getInt16(4 * i + 2, true) / 20 * LY);
    }
    // Faintest first, so the luminous ones draw on top.
    groups = byClass.map((pts, c) => ({ pts: Float64Array.from(pts), color: starStyle(SPECTRAL[c >> 2]).color, lum: c & 3 }))
      .filter((g) => g.pts.length).sort((a, b) => b.lum - a.lum);
  };
  let loading = null;
  return {
    name: 'field stars',
    range: [15 * LY, 5000 * LY],
    draw(ctx, view, alpha) {
      loading ??= load();
      if (!groups) return;
      for (const g of groups) {
        const a = ALPHA[g.lum] * alpha * fade(g.lum, view.radius);
        if (a > 0.01) drawPoints(ctx, view, g.pts, 0, 0, g.color, a, SIZE[g.lum]);
      }
    },
  };
})();
