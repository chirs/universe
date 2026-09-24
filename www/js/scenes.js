import {
  AU, LY, PC, SUN, PLANETS, BELTS, STARS, BRIGHT_STARS, MILKY_WAY, LOCAL_GROUP, CLUSTERS,
  SUPERCLUSTERS, VOIDS, UNIVERSE, SIGNPOSTS, SGR_A_STAR, S_STARS, SPIRAL_ARMS, MILKY_WAY_OBJECTS, LOCAL_BUBBLE,
} from './data.js';
import {
  orbitalPosition, mulberry32, skyToPlane, layerAlpha, formatDistance,
  planetSummary, moonSummary, starSummary, galaxySummary, clusterSummary,
  landmarkSummary, observableUniverseSummary, makeZeldovichWeb, superclusterSummary, voidSummary,
  schwarzschildRadius, blackHoleSummary, sStarSummary, skyOrbitPosition, skyOrbitPath,
  galacticPlanePositionAngle, skyOffsetToPlane, makeArm, makeExpDisk, galacticObjectSummary, starStyle, starSystemSummary, cloudSummary,
} from './util.js';

const TAU = Math.PI * 2;
const INF = Infinity;

// A layer is { name, range: [lo, hi] in view-radius meters, draw(ctx, view, alpha, days) }.
// view = { w, h, cx, cy, mpp, radius, sx(x), sy(y), hits, labels }.

function gaussian(rand) {
  return Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(TAU * rand());
}

function makeBlob(seed, sigmaX, sigmaY, count, angleDeg = 0) {
  const rand = mulberry32(seed);
  const pts = new Float64Array(count * 2);
  const c = Math.cos(angleDeg * Math.PI / 180);
  const s = Math.sin(angleDeg * Math.PI / 180);
  for (let i = 0; i < count; i++) {
    const x = gaussian(rand) * sigmaX;
    const y = gaussian(rand) * sigmaY;
    pts[2 * i] = x * c - y * s;
    pts[2 * i + 1] = x * s + y * c;
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

function hit(view, x, y, name, alpha, detail) {
  if (alpha > 0.5) view.hits.push({ x, y, name, detail });
}

function ringHit(view, x, y, radius, name, alpha, detail) {
  if (alpha > 0.5) view.hits.push({ x, y, radius, name, detail });
}

function onScreen(view, x, y, pad = 20) {
  return x > -pad && x < view.w + pad && y > -pad && y < view.h + pad;
}

// ---------------------------------------------------------------- solar system

const solarSystem = {
  name: 'solar system',
  range: [0, 1500 * AU],
  draw(ctx, view, alpha, days) {
    const sx = view.sx(0);
    const sy = view.sy(0);
    ctx.lineWidth = 1;
    for (const p of PLANETS) {
      const a = p.a / view.mpp;
      if (a > 30000) continue;
      const e = p.e || 0;
      const varpi = (p.varpi || 0) * Math.PI / 180;
      // The Sun sits at a focus, a*e from the ellipse center toward perihelion.
      const cx = sx - a * e * Math.cos(varpi);
      const cy = sy + a * e * Math.sin(varpi);
      ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, a, a * Math.sqrt(1 - e * e), -varpi, 0, TAU);
      ctx.stroke();
    }
    const sunR = Math.max(SUN.radius / view.mpp, 4);
    glow(ctx, sx, sy, sunR * 4, SUN.color, 0.35 * alpha);
    dot(ctx, sx, sy, sunR, SUN.color, alpha);
    label(view, sx, sy, SUN.name, alpha, 2);
    hit(view, sx, sy, SUN.name, alpha, starSummary(SUN));
    for (const p of PLANETS) {
      const pos = orbitalPosition(p, days);
      const x = view.sx(pos.x);
      const y = view.sy(pos.y);
      if (!onScreen(view, x, y)) continue;
      const r = Math.max(p.radius / view.mpp, p.dwarf ? 1.5 : 2.5);
      dot(ctx, x, y, r, p.color, alpha);
      const far = Math.hypot(x - sx, y - sy) > 14;
      label(view, x, y, p.name, far ? alpha : 0, p.dwarf ? 0 : 1);
      hit(view, x, y, p.name, far ? alpha : 0, planetSummary(p));
    }
  },
};

const moons = {
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
        ctx.globalAlpha = ring.alpha * alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, ro, 0, TAU);
        ctx.arc(px, py, ring.inner / view.mpp, 0, TAU, true);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      for (const m of p.moons) {
        const a = m.a / view.mpp;
        const e = m.e || 0;
        const varpi = (m.varpi || 0) * Math.PI / 180;
        ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(px - a * e * Math.cos(varpi), py + a * e * Math.sin(varpi),
          a, a * Math.sqrt(1 - e * e), -varpi, 0, TAU);
        ctx.stroke();
        const mp = orbitalPosition(m, days);
        const x = view.sx(pos.x + mp.x);
        const y = view.sy(pos.y + mp.y);
        if (!onScreen(view, x, y)) continue;
        dot(ctx, x, y, Math.max(m.radius / view.mpp, 2), m.color, alpha);
        const far = Math.hypot(x - px, y - py) > 14;
        label(view, x, y, m.name, far ? alpha : 0, 0);
        hit(view, x, y, m.name, far ? alpha : 0, moonSummary(m, p.name));
      }
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
// Inferred, never observed, and presumably not unique to the Sun, so it fades
// out before other stars come on screen rather than mark us out.
const oortCloud = (() => {
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
    hit(view, x, y, 'Sun', alpha, starSummary(SUN));
  },
};

// ---------------------------------------------------------------- stars

// Each system is drawn by its primary's spectral type; a ring marks systems
// with known planets.
const starPositions = STARS.map((s) => ({ ...s, ...skyToPlane(s.l, s.dist * LY), style: starStyle(s.types[0]) }));

const nearestStars = {
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

// The Local Bubble: a soft cavity whose shell passes through the nearby
// star-forming clouds, at a schematic radius between them.
const localBubble = (() => {
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

const HUES = { b: '#c8d8ff', w: '#f4f4ff', y: '#fff0c0', o: '#ffb884' };

const brightPositions = BRIGHT_STARS.map((s) => ({ ...s, ...skyToPlane(s.l, s.dist * LY) }));

const brightStars = {
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

// The disk, bulge and bar are schematic; the bar is tilted so its near end
// lies at positive longitude. The arms are the Reid et al. 2019 fits, with
// faint extrapolations beyond the measured azimuth ranges.
// A radial glow whose brightness falls as exp(-r / scale), for the disk.
function expGlow(ctx, x, y, rMax, scale, rgb, peak, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rMax);
  for (let i = 0; i <= 10; i++) g.addColorStop(i / 10, `rgba(${rgb},${peak * Math.exp(-i / 10 * rMax / scale)})`);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rMax, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

const milkyWay = (() => {
  const mw = MILKY_WAY;
  const scale = mw.diskScaleLength;
  const diskPts = makeExpDisk(mw.seed + 1, scale, mw.diskRadius, 16000);
  // Warm inside a few kpc, blue-white outside, like a real disk.
  const split = 13000 * LY;
  const inner = [];
  const outer = [];
  for (let i = 0; i < diskPts.length; i += 2) (Math.hypot(diskPts[i], diskPts[i + 1]) < split ? inner : outer).push(diskPts[i], diskPts[i + 1]);
  const diskInner = Float64Array.from(inner);
  const diskOuter = Float64Array.from(outer);
  const bulge = makeBlob(mw.seed + 2, mw.bulgeRadius * 0.45, mw.bulgeRadius * 0.45, 3000);
  const bar = makeBlob(mw.seed + 3, mw.barHalfLength * 0.5, mw.bulgeRadius * 0.22, 3500, 180 - mw.barAngle);
  const fade = (r) => Math.exp(-(r - 3000 * PC) / (8000 * PC));
  const arms = SPIRAL_ARMS.map((arm, k) => ({ ...arm, ...makeArm(arm, mw.sunDistance, mw.seed + 10 + k, 50, fade) }));
  // Star-forming knots beaded along the arms, denser where the fit is.
  const knots = (() => {
    const rand = mulberry32(mw.seed + 20);
    const out = [];
    for (const arm of arms) {
      const walk = (spine, p) => {
        for (const q of spine) {
          if (rand() < p * fade(Math.hypot(q.x - GC.x, q.y - GC.y))) {
            out.push({ x: q.x + (rand() - 0.5) * arm.width, y: q.y + (rand() - 0.5) * arm.width, size: (300 + rand() * 500) * LY });
          }
        }
      };
      walk(arm.fittedSpine, 0.35);
      for (const s of arm.extraSpines) walk(s, 0.2);
    }
    return out;
  })();
  return {
    name: 'milky way',
    range: [2000 * LY, 500e3 * LY],
    draw(ctx, view, alpha) {
      const gx = view.sx(GC.x);
      const gy = view.sy(GC.y);
      const px = (m) => m / view.mpp;
      expGlow(ctx, gx, gy, px(mw.diskRadius), px(scale), '165,178,225', 0.75, alpha);
      drawPoints(ctx, view, diskOuter, GC.x, GC.y, '#b8c4e8', 0.22 * alpha);
      drawPoints(ctx, view, diskInner, GC.x, GC.y, '#f0dcc0', 0.25 * alpha);
      ctx.lineJoin = 'round';
      for (const arm of arms) {
        ctx.lineWidth = 2 * px(arm.width);
        const band = (spine, a) => {
          if (spine.length < 2) return;
          ctx.strokeStyle = `rgba(170,185,230,${a * alpha})`;
          ctx.beginPath();
          spine.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](view.sx(p.x), view.sy(p.y)));
          ctx.stroke();
        };
        for (const spine of arm.extraSpines) band(spine, 0.04);
        band(arm.fittedSpine, 0.07);
        drawPoints(ctx, view, arm.extra, 0, 0, '#dfe6ff', 0.5 * alpha);
        drawPoints(ctx, view, arm.fitted, 0, 0, '#e8eeff', 0.6 * alpha);
      }
      ctx.lineJoin = 'miter';
      // Knots are texture at galaxy scale, not objects: they fade out once
      // they would be more than a few pixels across.
      const knotAlpha = alpha * Math.min(1, Math.max(0, (10 - px(500 * LY)) / 5));
      if (knotAlpha > 0) {
        for (const k of knots) {
          const x = view.sx(k.x);
          const y = view.sy(k.y);
          if (!onScreen(view, x, y)) continue;
          glow(ctx, x, y, Math.max(2.5, 1.4 * px(k.size)), 'rgba(205,225,255,0.8)', knotAlpha);
        }
      }
      // The bar: an elliptical glow along its axis, plus its points.
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(-(180 - mw.barAngle) * Math.PI / 180);
      ctx.scale(1, 0.38);
      glow(ctx, 0, 0, px(mw.barHalfLength), 'rgba(255,222,170,0.55)', alpha);
      ctx.restore();
      drawPoints(ctx, view, bar, GC.x, GC.y, '#ffe2b0', 0.55 * alpha);
      drawPoints(ctx, view, bulge, GC.x, GC.y, '#fff0cc', 0.6 * alpha);
      glow(ctx, gx, gy, px(mw.bulgeRadius), 'rgba(255,235,195,0.7)', alpha);
      glow(ctx, gx, gy, px(mw.bulgeRadius) * 0.3, 'rgba(255,248,230,0.9)', alpha);
      for (const arm of arms) label(view, view.sx(arm.label.x), view.sy(arm.label.y), arm.name, 0.8 * alpha, 0);
    },
  };
})();

// Nebulae, clusters and black holes in the nearby arms.
const galacticObjects = (() => {
  const objects = MILKY_WAY_OBJECTS.map((o) => ({ ...o, ...skyToPlane(o.l, o.dist * LY) }));
  const colors = {
    'Open cluster': '#cfe0ff', Star: '#fff6dc', 'Supernova remnant': '#9fd6ff',
    'Emission nebula': '#ff9fb0', 'Black hole': '#ffc890', 'Super star cluster': '#ffffff',
  };
  return {
    name: 'galactic objects',
    range: [100 * LY, 15e3 * LY],
    draw(ctx, view, alpha) {
      for (const o of objects) {
        const x = view.sx(o.x);
        const y = view.sy(o.y);
        if (!onScreen(view, x, y)) continue;
        if (o.kind === 'Black hole') glow(ctx, x, y, 9, 'rgba(255,170,90,0.5)', alpha);
        dot(ctx, x, y, o.kind === 'Star' ? 2 : 2.5, colors[o.kind], alpha);
        label(view, x, y, o.name, alpha, 1);
        hit(view, x, y, o.name, alpha, galacticObjectSummary(o));
      }
    },
  };
})();

// ------------------------------------------------------------ galactic center

// Sgr A* and the S-stars. The orbits are the real three-dimensional ones,
// projected onto the galactic plane like everything else on the map. Below
// the dot threshold the black hole is a dot; resolved, it shows the horizon,
// the shadow an observer would see and the innermost stable circular orbit,
// all to scale, under a schematic accretion glow.
const nucleus = (() => {
  const bh = SGR_A_STAR;
  const rs = schwarzschildRadius(bh.mass);
  const shadowR = Math.sqrt(27) / 2 * rs;
  const iscoR = 3 * rs;
  const planePA = galacticPlanePositionAngle(bh.ra, bh.dec);
  const toPlane = (p) => skyOffsetToPlane(p, planePA);
  const stars = S_STARS.map((s) => ({ ...s, path: skyOrbitPath(s).map(toPlane) }));
  const ring = (ctx, x, y, r, style, width, dash) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  return {
    name: 'galactic nucleus',
    range: [0, 1 * LY],
    draw(ctx, view, alpha, days) {
      const gx = view.sx(GC.x);
      const gy = view.sy(GC.y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
      for (const s of stars) {
        ctx.beginPath();
        s.path.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](view.sx(GC.x + p.x), view.sy(GC.y + p.y)));
        ctx.closePath();
        ctx.stroke();
      }
      const shadowPx = shadowR / view.mpp;
      if (shadowPx < 3) {
        glow(ctx, gx, gy, 10, 'rgba(255,170,90,0.5)', alpha);
        dot(ctx, gx, gy, 3, '#ffc890', alpha);
      } else {
        glow(ctx, gx, gy, 3.5 * shadowPx, 'rgba(255,150,70,0.6)', alpha);
        dot(ctx, gx, gy, shadowPx, '#000000', alpha);
        ring(ctx, gx, gy, shadowPx, `rgba(255,225,190,${0.9 * alpha})`, 1.5, []);
        ring(ctx, gx, gy, rs / view.mpp, `rgba(140,140,160,${0.7 * alpha})`, 1, [4, 4]);
        ring(ctx, gx, gy, iscoR / view.mpp, `rgba(255,255,255,${0.25 * alpha})`, 1, [2, 6]);
        if (shadowPx > 30) {
          const d = Math.SQRT1_2 * iscoR / view.mpp;
          label(view, gx - rs / view.mpp, gy, 'Event horizon', alpha, 0);
          label(view, gx + shadowPx, gy, 'Shadow', alpha, 0);
          label(view, gx + d, gy + d, 'Innermost stable orbit', alpha, 0);
        }
        ringHit(view, gx, gy, rs / view.mpp, 'Event horizon', alpha,
          `Schwarzschild radius ${formatDistance(rs)} · nothing inside can be seen`);
        ringHit(view, gx, gy, shadowPx, 'Shadow', alpha,
          `Apparent dark disc, radius ${formatDistance(shadowR)} (2.6 Schwarzschild radii) · light rays at its edge circle the hole`);
        ringHit(view, gx, gy, iscoR / view.mpp, 'Innermost stable orbit', alpha,
          `Radius ${formatDistance(iscoR)} (3 Schwarzschild radii) · matter closer in spirals through the horizon`);
      }
      label(view, gx, gy, bh.name, alpha, 2);
      hit(view, gx, gy, bh.name, alpha, blackHoleSummary(bh));
      for (const s of stars) {
        const p = toPlane(skyOrbitPosition(s, days));
        const x = view.sx(GC.x + p.x);
        const y = view.sy(GC.y + p.y);
        if (!onScreen(view, x, y)) continue;
        dot(ctx, x, y, 2.5, '#cfe0ff', alpha);
        const far = Math.hypot(x - gx, y - gy) > 14;
        label(view, x, y, s.name, far ? alpha : 0, 1);
        hit(view, x, y, s.name, far ? alpha : 0, sStarSummary(s));
      }
    },
  };
})();

// The nuclear star cluster around Sgr A*, a few tens of light-years across.
// It also owns the galactic-center label, which hands over to Sgr A* as the
// nucleus layer fades in.
const nuclearCluster = (() => {
  const pts = annulus(41, 4000, 0.01 * LY, 40 * LY, true);
  return {
    name: 'nuclear star cluster',
    range: [0, 500e3 * LY],
    draw(ctx, view, alpha) {
      const gx = view.sx(GC.x);
      const gy = view.sy(GC.y);
      const spread = Math.min(1, 40 * LY / view.mpp / 200);
      drawPoints(ctx, view, pts, GC.x, GC.y, '#fff0cc', 0.5 * alpha * spread);
      const own = alpha * (1 - layerAlpha(view.radius, nucleus.range));
      label(view, gx, gy, 'Galactic center', own, 2);
      hit(view, gx, gy, 'Galactic center', own,
        `Milky Way center · nuclear star cluster around Sgr A* · ${formatDistance(MILKY_WAY.sunDistance)} from the Sun · click to zoom in`);
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
    range: [250e3 * LY, 25e6 * LY],
    draw(ctx, view, alpha) {
      for (const g of members) {
        const gAlpha = g.name === 'Milky Way' ? alpha * (1 - layerAlpha(view.radius, milkyWay.range)) : alpha;
        if (gAlpha <= 0.05) continue;
        const x = view.sx(g.x);
        const y = view.sy(g.y);
        if (!onScreen(view, x, y, 200)) continue;
        const r = g.sizeM / view.mpp;
        if (g.spiral) {
          glow(ctx, x, y, Math.max(r, 3), 'rgba(140,150,200,0.5)', gAlpha);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(g.angle);
          ctx.fillStyle = '#e4e9ff';
          ctx.globalAlpha = 0.6 * gAlpha;
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
          glow(ctx, x, y, Math.max(r * 2, 5), 'rgba(220,210,190,0.7)', gAlpha);
          dot(ctx, x, y, Math.max(r * 0.5, 1.5), '#e6dcc8', gAlpha);
        }
        label(view, x, y, g.name, gAlpha, g.spiral ? 2 : 0);
        hit(view, x, y, g.name, gAlpha, galaxySummary(g));
      }
    },
  };
})();

// ---------------------------------------------------------------- clusters

const clusters = (() => {
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

const superclusterWalls = (() => {
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

// ---------------------------------------------------------------- cosmic web

function webLayer(name, seed, radius, nCells, nPoints, range, hole = 0) {
  const { pts, kind } = makeZeldovichWeb(seed, radius, nCells, nPoints, hole);
  const filaments = new Float64Array(kind.reduce((n, k) => n + (k === 1), 0) * 2);
  const nodes = new Float64Array(kind.reduce((n, k) => n + (k === 2), 0) * 2);
  const field = new Float64Array(kind.reduce((n, k) => n + (k === 0), 0) * 2);
  const indices = [0, 0, 0];
  for (let i = 0; i < kind.length; i++) {
    const target = kind[i] === 2 ? nodes : kind[i] === 1 ? filaments : field;
    const idx = indices[kind[i]];
    target[idx] = pts[2 * i];
    target[idx + 1] = pts[2 * i + 1];
    indices[kind[i]] += 2;
  }
  return {
    name,
    range,
    draw(ctx, view, alpha) {
      ctx.globalCompositeOperation = 'lighter';
      drawPoints(ctx, view, field, 0, 0, '#78809f', 0.18 * alpha);
      drawPoints(ctx, view, filaments, 0, 0, '#c8d0f0', 0.45 * alpha, 1);
      drawPoints(ctx, view, nodes, 0, 0, '#f0f2ff', 0.1 * alpha, 3);
      drawPoints(ctx, view, nodes, 0, 0, '#f0f2ff', 0.7 * alpha, 1.5);
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}

const superclusters = webLayer('supercluster web', UNIVERSE.webSeed + 1, 1.5e9 * LY, 70, 14000,
  [250e6 * LY, 4e9 * LY], 500e6 * LY);
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
      hit(view, x, y - r, m.name, alpha, landmarkSummary(m));
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
    hit(view, x, y, 'Milky Way', alpha, galaxySummary(LOCAL_GROUP[0]));
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
    ringHit(view, x, y, r, 'Edge of the observable universe', alpha,
      observableUniverseSummary(UNIVERSE.radius));
  },
};

const signposts = SIGNPOSTS.map((sp) => ({
  name: 'signpost',
  range: sp.range,
  draw(ctx, view, alpha) {
    ctx.font = 'italic 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.8 * alpha;
    ctx.fillStyle = '#8a90a0';
    ctx.fillText(sp.text, view.w / 2, view.h * 0.8);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  },
}));

export const LAYERS = [
  cosmicWeb, superclusters, landmarks, superclusterWalls, clusters, localGroup, milkyWay, nuclearCluster,
  nucleus, fieldStars, localBubble, galacticObjects, oortCloud, brightStars, nearestStars, kuiperBelt, asteroidBelt, solarSystem, moons, sunDot,
  youAreHere, horizon, ...signposts,
];

export const GALACTIC_CENTER = GC;
