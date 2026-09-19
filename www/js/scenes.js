import {
  AU, LY, SUN, PLANETS, BELTS, STARS, MILKY_WAY, LOCAL_GROUP, UNIVERSE,
} from './data.js';
import { orbitalPosition, mulberry32, skyToPlane } from './util.js';

const TAU = Math.PI * 2;
const INF = Infinity;

// A layer is { name, range: [lo, hi] in view-radius meters, draw(ctx, view, alpha, days) }.
// view = { w, h, cx, cy, mpp, radius, sx(x), sy(y), hits, labels }.

function gaussian(rand) {
  return Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(TAU * rand());
}

function makeBlob(seed, sigmaX, sigmaY, count) {
  const rand = mulberry32(seed);
  const pts = new Float64Array(count * 2);
  for (let i = 0; i < count; i++) {
    pts[2 * i] = gaussian(rand) * sigmaX;
    pts[2 * i + 1] = gaussian(rand) * sigmaY;
  }
  return pts;
}

function annulus(seed, count, inner, outer, log) {
  const rand = mulberry32(seed);
  const pts = new Float64Array(count * 2);
  for (let i = 0; i < count; i++) {
    const r = log
      ? Math.exp(Math.log(inner) + rand() * (Math.log(outer) - Math.log(inner)))
      : Math.sqrt(inner * inner + rand() * (outer * outer - inner * inner));
    const t = rand() * TAU;
    pts[2 * i] = r * Math.cos(t);
    pts[2 * i + 1] = r * Math.sin(t);
  }
  return pts;
}

function drawPoints(ctx, view, pts, ox, oy, color, alpha, size = 1) {
  const { w, h } = view;
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < pts.length; i += 2) {
    const x = view.sx(pts[i] + ox);
    const y = view.sy(pts[i + 1] + oy);
    if (x < -1 || x > w + 1 || y < -1 || y > h + 1) continue;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}

function dot(ctx, x, y, r, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function glow(ctx, x, y, r, color, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// Queue a label; main.js draws them last, skipping overlaps.
function label(view, x, y, text, alpha, priority = 0) {
  if (alpha <= 0.05) return;
  view.labels.push({ x, y, text, alpha, priority });
}

function hit(view, x, y, name, alpha) {
  if (alpha > 0.5) view.hits.push({ x, y, name });
}

function onScreen(view, x, y, pad = 20) {
  return x > -pad && x < view.w + pad && y > -pad && y < view.h + pad;
}

// ---------------------------------------------------------------- solar system

const solarSystem = {
  name: 'solar system',
  range: [0, 400 * AU],
  draw(ctx, view, alpha, days) {
    const sx = view.sx(0);
    const sy = view.sy(0);
    ctx.lineWidth = 1;
    for (const p of PLANETS) {
      const rp = p.a / view.mpp;
      if (rp > 30000) continue;
      ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, rp, 0, TAU);
      ctx.stroke();
    }
    const sunR = Math.max(SUN.radius / view.mpp, 4);
    glow(ctx, sx, sy, sunR * 4, SUN.color, 0.35 * alpha);
    dot(ctx, sx, sy, sunR, SUN.color, alpha);
    label(view, sx, sy, SUN.name, alpha, 2);
    hit(view, sx, sy, SUN.name, alpha);
    for (const p of PLANETS) {
      const pos = orbitalPosition(p, days);
      const x = view.sx(pos.x);
      const y = view.sy(pos.y);
      if (!onScreen(view, x, y)) continue;
      const r = Math.max(p.radius / view.mpp, p.dwarf ? 1.5 : 2.5);
      dot(ctx, x, y, r, p.color, alpha);
      const far = Math.hypot(x - sx, y - sy) > 14;
      label(view, x, y, p.name, far ? alpha : 0, p.dwarf ? 0 : 1);
      hit(view, x, y, p.name, far ? alpha : 0);
    }
  },
};

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

const asteroidBelt = belt('asteroid belt', BELTS.asteroid, [0, 60 * AU], '#8f8a80');
const kuiperBelt = belt('kuiper belt', BELTS.kuiper, [4 * AU, 1500 * AU], '#8fa0b8');
const oortCloud = belt('oort cloud', BELTS.oort, [0.02 * LY, 60 * LY], '#7f8ea8', true);

// The Sun as a bare dot once the planets are sub-pixel.
const sunDot = {
  name: 'sun dot',
  range: [100 * AU, 200e3 * LY],
  draw(ctx, view, alpha) {
    const x = view.sx(0);
    const y = view.sy(0);
    glow(ctx, x, y, 8, SUN.color, 0.5 * alpha);
    dot(ctx, x, y, 2, SUN.color, alpha);
    label(view, x, y, 'Sun', alpha, 3);
    hit(view, x, y, 'Sun', alpha);
  },
};

// ---------------------------------------------------------------- stars

const starPositions = STARS.map((s) => ({ ...s, ...skyToPlane(s.l, s.dist * LY) }));

const nearestStars = {
  name: 'nearest stars',
  range: [0.5 * LY, 300 * LY],
  draw(ctx, view, alpha) {
    for (const s of starPositions) {
      const x = view.sx(s.x);
      const y = view.sy(s.y);
      if (!onScreen(view, x, y)) continue;
      const r = s.bright ? 2.5 : 1.8;
      glow(ctx, x, y, r * 4, '#ffffff', 0.25 * alpha);
      dot(ctx, x, y, r, s.bright ? '#fff6dc' : '#d9c9b0', alpha);
      label(view, x, y, s.name, alpha, s.bright ? 1 : 0);
      hit(view, x, y, s.name, alpha);
    }
  },
};

const fieldStars = (() => {
  const pts = makeBlob(11, 900 * LY, 900 * LY, 6000);
  return {
    name: 'field stars',
    range: [15 * LY, 1500 * LY],
    draw(ctx, view, alpha) {
      drawPoints(ctx, view, pts, 0, 0, '#e8e0d0', 0.7 * alpha, 1.5);
    },
  };
})();

// ---------------------------------------------------------------- Milky Way

function makeSpiral(seed, arms, pitchDeg, innerR, outerR, count) {
  const rand = mulberry32(seed);
  const k = Math.tan(pitchDeg * Math.PI / 180);
  const tMax = Math.log(outerR / innerR) / k;
  const pts = new Float64Array(count * 2);
  for (let i = 0; i < count; i++) {
    const arm = i % arms;
    const t = rand() * tMax;
    const r = innerR * Math.exp(k * t);
    const theta = t + arm * TAU / arms + gaussian(rand) * 0.12;
    const rr = r * (1 + gaussian(rand) * 0.07);
    pts[2 * i] = rr * Math.cos(theta);
    pts[2 * i + 1] = rr * Math.sin(theta);
  }
  return pts;
}

const GC = skyToPlane(0, MILKY_WAY.sunDistance);

const milkyWay = (() => {
  const mw = MILKY_WAY;
  const arms = makeSpiral(mw.seed, mw.arms, mw.pitch, mw.bulgeRadius * 0.6, mw.diskRadius, 14000);
  const disk = makeBlob(mw.seed + 1, mw.diskRadius * 0.45, mw.diskRadius * 0.45, 6000);
  const bulge = makeBlob(mw.seed + 2, mw.bulgeRadius * 0.5, mw.bulgeRadius * 0.5, 2500);
  const bar = makeBlob(mw.seed + 3, mw.bulgeRadius * 0.9, mw.bulgeRadius * 0.25, 1500);
  return {
    name: 'milky way',
    range: [2000 * LY, 500e3 * LY],
    draw(ctx, view, alpha) {
      const gx = view.sx(GC.x);
      const gy = view.sy(GC.y);
      glow(ctx, gx, gy, mw.diskRadius / view.mpp, 'rgba(120,130,180,0.35)', alpha);
      drawPoints(ctx, view, disk, GC.x, GC.y, '#9aa4c8', 0.35 * alpha);
      drawPoints(ctx, view, arms, GC.x, GC.y, '#dfe6ff', 0.55 * alpha);
      drawPoints(ctx, view, bar, GC.x, GC.y, '#ffe2b0', 0.6 * alpha);
      drawPoints(ctx, view, bulge, GC.x, GC.y, '#fff0cc', 0.7 * alpha);
      glow(ctx, gx, gy, mw.bulgeRadius / view.mpp, 'rgba(255,230,180,0.6)', alpha);
      label(view, gx, gy, 'Galactic center', alpha, 2);
      hit(view, gx, gy, 'Galactic center', alpha);
    },
  };
})();

// ---------------------------------------------------------------- Local Group

const galaxyGlyph = makeSpiral(21, 2, 18, 0.12, 1, 900);
const galaxyCore = makeBlob(22, 0.12, 0.12, 300);

const localGroup = (() => {
  const rand = mulberry32(31);
  const members = LOCAL_GROUP.map((g) => ({
    ...g,
    ...skyToPlane(g.l, g.dist * LY),
    angle: rand() * TAU,
    sizeM: g.size * LY,
  }));
  return {
    name: 'local group',
    range: [250e3 * LY, 300e6 * LY],
    draw(ctx, view, alpha) {
      for (const g of members) {
        const x = view.sx(g.x);
        const y = view.sy(g.y);
        if (!onScreen(view, x, y, 200)) continue;
        const r = g.sizeM / view.mpp;
        if (g.spiral) {
          glow(ctx, x, y, Math.max(r, 3), 'rgba(140,150,200,0.5)', alpha);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(g.angle);
          ctx.fillStyle = '#e4e9ff';
          ctx.globalAlpha = 0.6 * alpha;
          const s = Math.max(r, 2);
          for (let i = 0; i < galaxyGlyph.length; i += 2) {
            ctx.fillRect(galaxyGlyph[i] * s, galaxyGlyph[i + 1] * s, 1, 1);
          }
          ctx.fillStyle = '#fff2d8';
          for (let i = 0; i < galaxyCore.length; i += 2) {
            ctx.fillRect(galaxyCore[i] * s, galaxyCore[i + 1] * s, 1, 1);
          }
          ctx.restore();
          ctx.globalAlpha = 1;
        } else {
          glow(ctx, x, y, Math.max(r * 2, 5), 'rgba(220,210,190,0.7)', alpha);
          dot(ctx, x, y, Math.max(r * 0.5, 1.5), '#e6dcc8', alpha);
        }
        label(view, x, y, g.name, alpha, g.spiral ? 2 : 0);
        hit(view, x, y, g.name, alpha);
      }
    },
  };
})();

// ---------------------------------------------------------------- cosmic web

function makeWeb(seed, radius, nVoids, nPoints) {
  const rand = mulberry32(seed);
  const voids = [];
  const typical = radius / Math.sqrt(nVoids) * 0.9;
  for (let i = 0; i < nVoids; i++) {
    const r = radius * Math.sqrt(rand());
    const t = rand() * TAU;
    voids.push({ x: r * Math.cos(t), y: r * Math.sin(t), r: typical * (0.5 + rand()) });
  }
  const pts = new Float64Array(nPoints * 2);
  const wall = new Uint8Array(nPoints);
  for (let i = 0; i < nPoints; i++) {
    const r = radius * Math.sqrt(rand());
    const t = rand() * TAU;
    let x = r * Math.cos(t);
    let y = r * Math.sin(t);
    let best = null;
    let bestD = INF;
    for (const v of voids) {
      const d = Math.hypot(x - v.x, y - v.y) / v.r;
      if (d < bestD) { bestD = d; best = v; }
    }
    if (bestD < 1) {
      const push = best.r * (0.97 + 0.06 * rand());
      const d = Math.hypot(x - best.x, y - best.y) || 1;
      x = best.x + (x - best.x) / d * push;
      y = best.y + (y - best.y) / d * push;
      wall[i] = 1;
    }
    pts[2 * i] = x;
    pts[2 * i + 1] = y;
  }
  return { pts, wall };
}

function webLayer(name, seed, radius, nVoids, nPoints, range) {
  const { pts, wall } = makeWeb(seed, radius, nVoids, nPoints);
  const walls = new Float64Array(wall.reduce((n, w) => n + w, 0) * 2);
  const field = new Float64Array(pts.length - walls.length);
  let a = 0;
  let b = 0;
  for (let i = 0; i < wall.length; i++) {
    const target = wall[i] ? walls : field;
    const idx = wall[i] ? a : b;
    target[idx] = pts[2 * i];
    target[idx + 1] = pts[2 * i + 1];
    if (wall[i]) a += 2; else b += 2;
  }
  return {
    name,
    range,
    draw(ctx, view, alpha) {
      drawPoints(ctx, view, field, 0, 0, '#8a90b8', 0.3 * alpha);
      drawPoints(ctx, view, walls, 0, 0, '#d6dcff', 0.7 * alpha, 1.5);
    },
  };
}

const superclusters = webLayer('superclusters', UNIVERSE.webSeed + 1, 1.5e9 * LY, 70, 7000,
  [30e6 * LY, 4e9 * LY]);
const cosmicWeb = webLayer('cosmic web', UNIVERSE.webSeed, UNIVERSE.radius, UNIVERSE.voids,
  UNIVERSE.webPoints, [2e9 * LY, INF]);

const landmarks = {
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
      hit(view, x, y - r, m.name, alpha);
    }
  },
};

const youAreHere = {
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
    hit(view, x, y, 'Milky Way', alpha);
  },
};

const horizon = {
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
  },
};

export const LAYERS = [
  cosmicWeb, superclusters, landmarks, localGroup, milkyWay, fieldStars,
  oortCloud, nearestStars, kuiperBelt, asteroidBelt, solarSystem, sunDot,
  youAreHere, horizon,
];

export const GALACTIC_CENTER = GC;
