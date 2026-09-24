import { drawBlackHole } from './galaxy.js';
import {
  LY, LOCAL_GROUP, CLUSTERS, SUPERCLUSTERS, VOIDS, UNIVERSE, SIGNPOSTS, GREAT_WALLS, DISTANT_OBJECTS,
  HERCULES_CORONA_BOREALIS, GALAXIES,
} from '../data.js';
import {
  mulberry32, skyToPlane, makeZeldovichWeb, slerpSky, yearsAgo,
} from '../util.js';
import {
  galaxySummary, clusterSummary, landmarkSummary, observableUniverseSummary, superclusterSummary, voidSummary,
  darkAgesSummary, cmbSummary, lookbackSummary, wallSummary, distantSummary, herculesSummary,
  lookbackPowerSummary, notableGalaxySummary, visibilityLimitSummary, otherHorizonSummary,
} from '../summaries.js';
import {
  TAU, INF, gaussian, makeBlob, drawPoints, dot, glow, label, hit, ringHit, onScreen,
} from '../draw.js';

export const clusters = (() => {
  const items = CLUSTERS.map((c, i) => ({
    ...c,
    ...skyToPlane(c.l, c.dist * 1e6 * LY),
    pts: makeBlob(40 + i, c.size * 1e6 * LY / 4, c.size * 1e6 * LY / 4, c.n),
  }));
  return {
    name: 'clusters',
    range: [5e6 * LY, 1.2e9 * LY],
    draw(ctx, view, alpha) {
      for (const c of items) {
        const x = view.sx(c.x);
        const y = view.sy(c.y);
        if (!onScreen(view, x, y, 300)) continue;
        const r = c.size * 1e6 * LY / 2 / view.mpp;
        glow(ctx, x, y, Math.max(r, 4), 'rgba(200,190,230,0.35)', alpha);
        drawPoints(ctx, view, c.pts, c.x, c.y, '#e8e4f4', 0.6 * alpha);
        // Clusters known only by catalogue number are labelled once they resolve.
        if (!c.name.startsWith('Abell') || r >= 3) label(view, x, y, c.name, alpha, c.n >= 200 ? 2 : c.n >= 100 ? 1 : 0);
        hit(view, x, y, c.name, alpha, clusterSummary(c));
      }
    },
  };
})();

// ---------------------------------------------------------------- superclusters and voids

// A strand of jittered points threaded through a set of positions, ordered
// along their principal axis so the polyline does not double back.
function makeStrand(rand, points, width) {
  const n = points.length;
  const cx = points.reduce((s, p) => s + p.x, 0) / n;
  const cy = points.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const p of points) {
    sxx += (p.x - cx) ** 2;
    sxy += (p.x - cx) * (p.y - cy);
    syy += (p.y - cy) ** 2;
  }
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const ax = Math.cos(angle);
  const ay = Math.sin(angle);
  const ordered = [...points].sort((p, q) => (p.x * ax + p.y * ay) - (q.x * ax + q.y * ay));
  const out = [];
  for (let i = 0; i + 1 < ordered.length; i++) {
    const p = ordered[i];
    const q = ordered[i + 1];
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    const count = Math.max(8, Math.round(len / (width / 3)));
    const nx = -(q.y - p.y) / len;
    const ny = (q.x - p.x) / len;
    for (let k = 0; k < count; k++) {
      const t = (k + rand()) / count;
      const bow = Math.sin(t * Math.PI) * width * 0.6 * (i % 2 ? 1 : -1);
      const off = gaussian(rand) * width / 2 + bow;
      out.push(p.x + (q.x - p.x) * t + nx * off, p.y + (q.y - p.y) * t + ny * off);
    }
  }
  return Float64Array.from(out);
}

export const superclusterWalls = (() => {
  const rand = mulberry32(77);
  const byAbell = new Map(CLUSTERS.filter((c) => c.abell).map((c) => [c.abell, c]));
  const items = SUPERCLUSTERS.map((sc) => {
    const sizeM = sc.size * 1e6 * LY;
    const members = sc.members.map((a) => byAbell.get(a)).filter(Boolean)
      .map((c) => skyToPlane(c.l, c.dist * 1e6 * LY));
    // Latitude is dropped, so members of a high-latitude supercluster can land
    // far apart in the plane. Thread a strand only where they hold together.
    let spread = 0;
    for (const a of members) for (const b of members) spread = Math.max(spread, Math.hypot(a.x - b.x, a.y - b.y));
    const strand = members.length >= 2 && spread <= 2 * sizeM ? makeStrand(rand, members, sizeM / 6) : null;
    return { ...sc, ...skyToPlane(sc.l, sc.dist * 1e6 * LY), sizeM, strand };
  });
  const voids = VOIDS.map((v) => ({ ...v, ...skyToPlane(v.l, v.dist * 1e6 * LY), sizeM: v.size * 1e6 * LY }));
  return {
    name: 'superclusters',
    range: [40e6 * LY, 1.5e9 * LY],
    draw(ctx, view, alpha) {
      for (const sc of items) {
        const x = view.sx(sc.x);
        const y = view.sy(sc.y);
        const r = sc.sizeM / 2 / view.mpp;
        if (r < 4 || !onScreen(view, x, y, r + 50)) continue;
        glow(ctx, x, y, r, 'rgba(150,140,200,0.22)', alpha);
        if (sc.strand) drawPoints(ctx, view, sc.strand, 0, 0, '#b4b0d4', 0.55 * alpha);
        label(view, x, y, sc.name, alpha, 1);
        hit(view, x, y, sc.name, alpha, superclusterSummary(sc));
      }
      for (const v of voids) {
        const x = view.sx(v.x);
        const y = view.sy(v.y);
        const r = v.sizeM / 2 / view.mpp;
        if (r < 6) continue;
        ctx.strokeStyle = `rgba(120,160,255,${0.3 * alpha})`;
        ctx.setLineDash([3, 7]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        label(view, x, y, v.name, alpha, 1);
        ringHit(view, x, y, r, v.name, alpha, voidSummary(v));
      }
    },
  };
})();

// Great walls: points along the great circles between waypoints, at the
// interpolated distance, dropped into the plane by longitude. Walls that
// cross high galactic latitude sweep round in longitude here, as the
// Magellanic Stream does.
export const greatWalls = (() => {
  const rand = mulberry32(88);
  const items = GREAT_WALLS.map((wall) => {
    // A fine polyline in the plane, then points spread evenly along it, so
    // the stretch near the galactic pole is not left sparse.
    const line = [];
    for (let k = 0; k + 1 < wall.waypoints.length; k++) {
      const [a, b] = [wall.waypoints[k], wall.waypoints[k + 1]];
      for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        line.push(skyToPlane(slerpSky(a, b, t).l, (a[2] + (b[2] - a[2]) * t) * 1e6 * LY));
      }
    }
    const cum = [0];
    for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + Math.hypot(line[i].x - line[i - 1].x, line[i].y - line[i - 1].y));
    const pts = [];
    for (let i = 0; i < 1500; i++) {
      const target = rand() * cum[cum.length - 1];
      let j = 1;
      while (cum[j] < target) j++;
      const f = (target - cum[j - 1]) / (cum[j] - cum[j - 1] || 1);
      const x = line[j - 1].x + (line[j].x - line[j - 1].x) * f;
      const y = line[j - 1].y + (line[j].y - line[j - 1].y) * f;
      pts.push(x + gaussian(rand) * wall.width * 1e6 * LY / 2, y + gaussian(rand) * wall.width * 1e6 * LY / 2);
    }
    const mid = wall.waypoints[1];
    return { ...wall, pts: Float64Array.from(pts), mid: skyToPlane(mid[0], mid[2] * 1e6 * LY) };
  });
  return {
    name: 'great walls',
    range: [80e6 * LY, 12e9 * LY],
    draw(ctx, view, alpha) {
      for (const wall of items) {
        drawPoints(ctx, view, wall.pts, 0, 0, '#ffd8a0', 0.5 * alpha, 1.5);
        const x = view.sx(wall.mid.x);
        const y = view.sy(wall.mid.y);
        label(view, x, y, wall.name, alpha, 1);
        hit(view, x, y, wall.name, alpha, wallSummary(wall));
      }
    },
  };
})();

// The farthest things with names, near the edge, and the disputed
// Notable galaxies beyond the Local Group, and M87's black hole up close.
const M87 = GALAXIES.find((g) => g.name === 'M87');
export const notableGalaxies = (() => {
  const items = GALAXIES.map((g) => ({ ...g, ...skyToPlane(g.l, g.dist * LY) }));
  return {
    name: 'notable galaxies',
    range: [1e6 * LY, 1.2e9 * LY],
    draw(ctx, view, alpha) {
      for (const g of items) {
        const x = view.sx(g.x);
        const y = view.sy(g.y);
        if (!onScreen(view, x, y)) continue;
        const r = Math.max(2.5, g.size * LY / view.mpp);
        glow(ctx, x, y, Math.max(8, 2.5 * r), g.spiral ? 'rgba(200,215,255,0.5)' : 'rgba(240,225,200,0.5)', alpha);
        dot(ctx, x, y, r, g.spiral ? '#e4e9ff' : '#f0e6d2', alpha);
        label(view, x, y, g.name, alpha, 1);
        hit(view, x, y, g.name, alpha, notableGalaxySummary(g));
      }
    },
  };
})();

export const m87Nucleus = (() => {
  const at = skyToPlane(M87.l, M87.dist * LY);
  return {
    name: 'M87 nucleus',
    range: [0, 1 * LY],
    draw(ctx, view, alpha) {
      const x = view.sx(at.x);
      const y = view.sy(at.y);
      if (!onScreen(view, x, y, 1e6)) return;
      drawBlackHole(ctx, view, alpha, M87.blackHole, x, y);
    },
  };
})();
export const M87_POSITION = skyToPlane(M87.l, M87.dist * LY);

// Hercules-Corona Borealis wall as a dashed outline.
export const distantObjects = (() => {
  const items = DISTANT_OBJECTS.map((o) => ({ ...o, ...skyToPlane(o.l, o.dist * 1e6 * LY) }));
  const hcb = { ...HERCULES_CORONA_BOREALIS, ...skyToPlane(HERCULES_CORONA_BOREALIS.l, HERCULES_CORONA_BOREALIS.dist * 1e6 * LY) };
  return {
    name: 'distant objects',
    range: [3e9 * LY, INF],
    draw(ctx, view, alpha) {
      for (const o of items) {
        const x = view.sx(o.x);
        const y = view.sy(o.y);
        if (!onScreen(view, x, y)) continue;
        glow(ctx, x, y, 7, o.kind === 'Quasar' ? 'rgba(170,200,255,0.6)' : 'rgba(255,190,150,0.6)', alpha);
        dot(ctx, x, y, 2, '#ffffff', alpha);
        label(view, x, y, o.name, alpha, 1);
        hit(view, x, y, o.name, alpha, distantSummary(o));
      }
      const x = view.sx(hcb.x);
      const y = view.sy(hcb.y);
      const r = hcb.size / 2 * 1e6 * LY / view.mpp;
      ctx.strokeStyle = `rgba(255,200,140,${0.6 * alpha})`;
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      label(view, x, y, `${hcb.name} (disputed)`, 0.8 * alpha, 0);
      ringHit(view, x, y, r, hcb.name, alpha, herculesSummary(hcb));
    },
  };
})();

// ---------------------------------------------------------------- cosmic web

// The procedural web, one potential throughout. Dense out to 6 Gly, around
// a hole over the real cluster data; sparse beyond, where it is a grain at the universe scale. Far too
// many points to draw every frame: wide views use an image made once,
// closer views only the 1 Gly buckets on screen. Farther out is earlier, so
// galaxies thin toward the first ones at z = 20; the fade is per bucket.
export const cosmicWeb = (() => {
  const R = UNIVERSE.radius;
  const G = 1e9 * LY;
  const nCells = Math.round((2 * R / UNIVERSE.webCell) ** 2);
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const lookbackFade = (r) => clamp01((UNIVERSE.firstGalaxies.dist - r) / (UNIVERSE.firstGalaxies.dist - UNIVERSE.webFade)) ** 1.5;
  // [zone, style per kind (color, alpha, size), weight in the image]
  const ZONES = [
    [{ count: Math.round(2000 * Math.PI * 36), hole: 0.5 * G, zone: { inner: 0, outer: 6 * G, taper: (r) => clamp01((6 * G - r) / (2 * G)) } },
      [['#78809f', 0.18, 1], ['#c8d0f0', 0.45, 1], ['#f0f2ff', 0.7, 1.5]], 0.08],
    [{ count: UNIVERSE.webPoints, hole: 0, zone: { inner: 4 * G, outer: R, taper: (r) => clamp01((r - 4 * G) / (1.5 * G)) } },
      [['#78809f', 0.07, 1], ['#c8d0f0', 0.18, 1], ['#f0f2ff', 0.3, 1]], 0.8],
  ];
  const B = G;
  const nb = Math.ceil(2 * R / B);
  let buckets = null;
  const build = () => {
    buckets = Array.from({ length: nb * nb }, (_, k) => {
      const cx = (k % nb + 0.5) * B - R;
      const cy = (Math.floor(k / nb) + 0.5) * B - R;
      return { fade: lookbackFade(Math.hypot(cx, cy)), zones: ZONES.map(() => [[], [], []]) };
    });
    ZONES.forEach(([cfg], z) => {
      const { pts, kind } = makeZeldovichWeb(UNIVERSE.webSeed, R, nCells, cfg.count, cfg.hole, cfg.zone);
      for (let i = 0; i < kind.length; i++) {
        const x = pts[2 * i];
        const y = pts[2 * i + 1];
        buckets[Math.floor((y + R) / B) * nb + Math.floor((x + R) / B)].zones[z][kind[i]].push(x, y);
      }
    });
    for (const b of buckets) b.zones = b.zones.map((kinds) => kinds.map((a) => Float64Array.from(a)));
  };
  // Images of the web made once: the whole disc for the widest views, and
  // the dense zone alone, at finer resolution, for the middle scales.
  const TEX = 2048;
  const makeImage = (half, zonesIn, weight) => {
    const canvas = document.createElement('canvas');
    canvas.width = TEX;
    canvas.height = TEX;
    const t = canvas.getContext('2d');
    t.globalCompositeOperation = 'lighter';
    const s = TEX / (2 * half);
    for (const { fade, zones } of buckets) {
      if (fade <= 0.01) continue;
      for (const z of zonesIn) {
        zones[z].forEach((a, k) => {
          const [color, a0] = ZONES[z][1][k];
          t.fillStyle = color;
          t.globalAlpha = a0 * weight(z) * fade;
          for (let i = 0; i < a.length; i += 2) t.fillRect((a[i] + half) * s, (half - a[i + 1]) * s, 1, 1);
        });
      }
    }
    return { canvas, half };
  };
  let whole = null;
  let dense = null;
  const drawImage = (ctx, view, img, a) => {
    const size = 2 * img.half / view.mpp;
    ctx.globalAlpha = a;
    ctx.drawImage(img.canvas, view.sx(-img.half), view.sy(img.half), size, size);
    ctx.globalAlpha = 1;
  };
  return {
    name: 'cosmic web',
    range: [250e6 * LY, INF],
    draw(ctx, view, alpha) {
      if (!buckets) build();
      // 0 below 8 Gly, 1 above 16 Gly: the image takes over as the view widens.
      const wide = clamp01(Math.log2(view.radius / (8 * G)));
      ctx.globalCompositeOperation = 'lighter';
      if (wide > 0) {
        whole ??= makeImage(R, [0, 1], (z) => ZONES[z][2]);
        drawImage(ctx, view, whole, alpha * wide);
      }
      // The dense zone has about ten times the points per area, so it dims
      // as the view widens to keep the same surface brightness as the rest.
      const dim = 1 - 0.6 * clamp01(Math.log2(view.radius / (1.5 * G)) / 2);
      // Past about 2 Gly the dense zone comes from its image, not its points.
      const mid = clamp01(Math.log2(view.radius / (1.5 * G)) / 0.75);
      if (mid > 0 && wide < 1) {
        // Brighter than the points: shrunk on screen, the image averages away
        // the single bright pixels that points keep.
        dense ??= makeImage(6 * G, [0], () => 6);
        drawImage(ctx, view, dense, alpha * (1 - wide) * mid * dim);
      }
      if (wide < 1) {
        // The sparse grain is for wide views; up close the resolved web leads.
        const grain = 0.35 + 0.65 * clamp01(Math.log2(view.radius / (2 * G)) / 1.5);
        const x0 = Math.max(0, Math.floor((view.cx - view.w / 2 * view.mpp + R) / B));
        const x1 = Math.min(nb - 1, Math.floor((view.cx + view.w / 2 * view.mpp + R) / B));
        const y0 = Math.max(0, Math.floor((view.cy - view.h / 2 * view.mpp + R) / B));
        const y1 = Math.min(nb - 1, Math.floor((view.cy + view.h / 2 * view.mpp + R) / B));
        for (let by = y0; by <= y1; by++) {
          for (let bx = x0; bx <= x1; bx++) {
            const { fade, zones } = buckets[by * nb + bx];
            const a = alpha * (1 - wide) * fade;
            if (a <= 0.01) continue;
            zones.forEach((kinds, z) => kinds.forEach((pts, k) => {
              const [color, a0, size] = ZONES[z][1][k];
              if (z === 0 && mid >= 1) return;
              drawPoints(ctx, view, pts, 0, 0, color, a0 * a * (z === 0 ? dim * (1 - mid) : grain), size);
            }));
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
})();

// Looking out is looking back: lookback rings, the dark ages, the glowing
// microwave background and the opaque plasma just inside the horizon.
export const eras = {
  name: 'eras',
  range: [4e9 * LY, INF],
  draw(ctx, view, alpha) {
    const x = view.sx(0);
    const y = view.sy(0);
    const px = (m) => m / view.mpp;
    const u = UNIVERSE;
    // One gradient from the last galaxies out to the horizon: the dark
    // ages deepen, the microwave background glows, the plasma beyond it
    // stays warm and opaque.
    const r0 = px(u.firstGalaxies.dist);
    const r1 = px(u.radius);
    const t = (u.cmb.dist - u.firstGalaxies.dist) / (u.radius - u.firstGalaxies.dist);
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    g.addColorStop(0, 'rgba(70,40,55,0)');
    g.addColorStop(t * 0.5, 'rgba(70,40,55,0.12)');
    g.addColorStop(t - 0.04, 'rgba(90,45,50,0.22)');
    g.addColorStop(t, 'rgba(255,175,110,0.5)');
    g.addColorStop(1, 'rgba(255,150,90,0.16)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r1, 0, TAU);
    ctx.arc(x, y, r0, 0, TAU, true);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,195,140,0.7)';
    ctx.beginPath();
    ctx.arc(x, y, px(u.cmb.dist), 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Labels sit on a diagonal so they clear the horizon label at the top.
    const at = (r, deg) => [x + px(r) * Math.cos(deg * Math.PI / 180), y - px(r) * Math.sin(deg * Math.PI / 180)];
    const mid = (u.firstGalaxies.dist + u.cmb.dist) / 2;
    label(view, ...at(mid, -25), 'The dark ages', 0.8 * alpha, 1);
    ringHit(view, x, y, px(mid), 'The dark ages', alpha, darkAgesSummary(u));
    label(view, ...at(u.cmb.dist, 45), 'Cosmic microwave background', alpha, 2);
    ringHit(view, x, y, px(u.cmb.dist), 'Cosmic microwave background', alpha, cmbSummary(u));
    ctx.setLineDash([2, 6]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(200,210,240,${0.3 * alpha})`;
    for (const [years, r] of u.lookbackRings) {
      if (px(r) < 20) continue;
      ctx.beginPath();
      ctx.arc(x, y, px(r), 0, TAU);
      ctx.stroke();
      const name = `${years} billion years ago`;
      label(view, ...at(r, -60), name, 0.6 * alpha, 0);
      ringHit(view, x, y, px(r), name, alpha, lookbackSummary(years, r));
    }
    ctx.setLineDash([]);
  },
};

// A ring for every power of ten in years, from 10 years to a billion,
// each shown while it is a sensible size on screen.
export const lookbackPowers = {
  name: 'lookback powers',
  range: [0, INF],
  draw(ctx, view, alpha) {
    const x = view.sx(0);
    const y = view.sy(0);
    const span = Math.hypot(view.w, view.h);
    ctx.setLineDash([2, 6]);
    ctx.lineWidth = 1;
    for (const [years, dist] of UNIVERSE.lookbackPowers) {
      const r = dist / view.mpp;
      if (r < 20 || r > 4 * span) continue;
      // Fade in from 20 px, out as the ring grows well past the screen.
      const a = alpha * Math.min(1, (r - 20) / 30, (4 * span - r) / (2 * span));
      ctx.strokeStyle = `rgba(200,210,240,${0.3 * a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.stroke();
      const name = yearsAgo(years);
      label(view, x + r * Math.cos(-Math.PI / 3), y - r * Math.sin(-Math.PI / 3), name, 0.6 * a, 0);
      ringHit(view, x, y, r, name, a, lookbackPowerSummary(years, dist));
    }
    ctx.setLineDash([]);
  },
};

export const landmarks = {
  name: 'landmarks',
  range: [20e6 * LY, 12e9 * LY],
  draw(ctx, view, alpha) {
    for (const m of UNIVERSE.landmarks) {
      const p = skyToPlane(m.l, m.dist);
      const x = view.sx(p.x);
      const y = view.sy(p.y);
      const r = m.size / 2 / view.mpp;
      if (r < 3) continue;
      ctx.strokeStyle = `rgba(255,200,140,${0.35 * alpha})`;
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      label(view, x, y - r, m.name, alpha, 1);
      hit(view, x, y - r, m.name, alpha, landmarkSummary(m));
    }
  },
};

// Past the horizon: the farthest we will ever see, and, zoomed far out,
// other galaxies' horizons, to show ours is one of many. They sit on a
// sparse jittered lattice, close enough that some overlap.
export const beyond = (() => {
  const R = UNIVERSE.radius;
  const others = (() => {
    const rand = mulberry32(11);
    const step = 1.5 * R;
    const out = [];
    for (let j = -14; j <= 14; j++) {
      for (let i = -14; i <= 14; i++) {
        const x = (i + rand() - 0.5) * step;
        const y = (j + rand() - 0.5) * step;
        if (rand() < 0.25 && Math.hypot(x, y) > 1.4 * R) out.push({ x, y, dist: Math.hypot(x, y) });
      }
    }
    return out.sort((a, b) => a.dist - b.dist);
  })();
  return {
    name: 'beyond',
    range: [40e9 * LY, INF],
    draw(ctx, view, alpha) {
      const x = view.sx(0);
      const y = view.sy(0);
      const r = R / view.mpp;
      const limit = UNIVERSE.visibilityLimit / view.mpp;
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(200,210,240,${0.45 * alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, limit, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      label(view, x, y + limit, 'Farthest we will ever see', 0.8 * alpha, 1);
      ringHit(view, x, y, limit, 'Farthest we will ever see', alpha, visibilityLimitSummary(UNIVERSE));
      // 0 below 100 Gly, 1 above 200 Gly.
      const a = alpha * Math.min(1, Math.max(0, Math.log2(view.radius / (100e9 * LY))));
      if (a <= 0) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,170,120,${0.2 * a})`;
      ctx.fillStyle = `rgba(255,215,160,${0.6 * a})`;
      others.forEach((o, k) => {
        const ox = view.sx(o.x);
        const oy = view.sy(o.y);
        if (!onScreen(view, ox, oy, r)) return;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, TAU);
        ctx.stroke();
        ctx.fillRect(ox - 1, oy - 1, 2, 2);
        const name = 'Another galaxy\u2019s observable universe';
        if (k === 0) label(view, ox, oy - r, name, 0.8 * a, 0);
        ringHit(view, ox, oy, r, name, a, otherHorizonSummary(o.dist, R));
      });
    },
  };
})();

export const youAreHere = {
  name: 'you are here',
  range: [300e6 * LY, INF],
  draw(ctx, view, alpha) {
    const x = view.sx(0);
    const y = view.sy(0);
    ctx.strokeStyle = `rgba(255,215,106,${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 8, y); ctx.lineTo(x - 3, y);
    ctx.moveTo(x + 3, y); ctx.lineTo(x + 8, y);
    ctx.moveTo(x, y - 8); ctx.lineTo(x, y - 3);
    ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 8);
    ctx.stroke();
    label(view, x, y, 'Milky Way', alpha, 3);
    hit(view, x, y, 'Milky Way', alpha, galaxySummary(LOCAL_GROUP[0]));
  },
};

export const horizon = {
  name: 'horizon',
  range: [4e9 * LY, INF],
  draw(ctx, view, alpha) {
    const x = view.sx(0);
    const y = view.sy(0);
    const r = UNIVERSE.radius / view.mpp;
    ctx.strokeStyle = `rgba(255,170,120,${0.6 * alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
    label(view, x, y - r, 'Edge of the observable universe', alpha, 2);
    ringHit(view, x, y, r, 'Edge of the observable universe', alpha,
      observableUniverseSummary(UNIVERSE.radius));
  },
};

// Signposts describe the emptiness around the Sun, so they stay home:
// nothing shows once the camera is a few view widths away from it.
export const signposts = SIGNPOSTS.map((sp) => ({
  name: 'signpost',
  range: sp.range,
  draw(ctx, view, alpha) {
    if (Math.hypot(view.cx, view.cy) > 3 * view.radius) return;
    ctx.font = 'italic 17px "Instrument Serif", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.8 * alpha;
    ctx.fillStyle = '#8a90a0';
    ctx.fillText(sp.text, view.w / 2, view.h * 0.8);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  },
}));
