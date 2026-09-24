import {
  AU, LY, PC, MILKY_WAY, LOCAL_GROUP, SGR_A_STAR, S_STARS, SPIRAL_ARMS, MILKY_WAY_OBJECTS, RADCLIFFE_WAVE,
  MAGELLANIC_STREAM, J2000_MS, DAY_S, YEAR_D, WR_140, S5_HVS1,
} from '../data.js';
import { SGR_STREAM } from '../sgrstream.js';
import { GLOBULAR_CLUSTERS } from '../globulars.js';
import { HII_REGIONS } from '../hii.js';
import {
  mulberry32, skyToPlane, layerAlpha, formatDistance, schwarzschildRadius, skyOrbitPosition, skyOrbitPath,
  galacticPlanePositionAngle, skyOffsetToPlane, makeArm, makeExpDisk, diskToSky, greatCircleToSky,
  quadraticThrough,
} from '../util.js';
import {
  galaxySummary, blackHoleSummary, sStarSummary, galacticObjectSummary, globularSummary, sunOrbitSummary,
  hiiSummary, wr140Summary, dustShellSummary, hypervelocitySummary,
} from '../summaries.js';
import {
  TAU, gaussian, makeBlob, annulus, drawPoints, dot, glow, label, hit, ringHit, onScreen,
} from '../draw.js';

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

export const GC = skyToPlane(0, MILKY_WAY.sunDistance);

// The disk, bulge and bar are schematic; the bar is tilted so its near end
// lies at positive longitude. The arms are the Reid et al. 2019 fits, with
// faint extrapolations beyond the measured azimuth ranges.
// A radial glow whose brightness falls as exp(-r / scale), for the disk.
const ARM_PASSES = 8;

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

export const milkyWay = (() => {
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
  const arms = SPIRAL_ARMS.map((arm, k) => {
    const made = makeArm(arm, mw.sunDistance, mw.seed + 10 + k, 50, fade);
    // A few percent of arm stars are young and bright.
    const rand = mulberry32(mw.seed + 40 + k);
    const bright = [];
    for (let i = 0; i < made.fitted.length; i += 2) if (rand() < 0.05) bright.push(made.fitted[i], made.fitted[i + 1]);
    // A denser set that fades in up close, so arms stay textured.
    const close = makeArm(arm, mw.sunDistance, mw.seed + 30 + k, 200, fade);
    // The dust lane runs along the inner, concave edge of the fitted arm.
    const dust = made.fittedSpine.map((p) => {
      const dx = GC.x - p.x;
      const dy = GC.y - p.y;
      const d = Math.hypot(dx, dy);
      return { x: p.x + dx / d * made.width * 0.7, y: p.y + dy / d * made.width * 0.7 };
    });
    return { ...arm, ...made, bright: Float64Array.from(bright), close: Float64Array.from([...close.fitted, ...close.extra]), dust };
  });
  // Knots of young stars beaded along the arms, denser where the fit is.
  // The pink ones they once included are now the real HII regions.
  const knots = (() => {
    const rand = mulberry32(mw.seed + 20);
    const out = [];
    for (const arm of arms) {
      const walk = (spine, p) => {
        for (const q of spine) {
          if (rand() < p * fade(Math.hypot(q.x - GC.x, q.y - GC.y))) {
            out.push({ x: q.x + (rand() - 0.5) * arm.width, y: q.y + (rand() - 0.5) * arm.width, size: (300 + rand() * 500) * LY, pink: rand() < 0.35 });
          }
        }
      };
      walk(arm.fittedSpine, 0.35);
      for (const s of arm.extraSpines) walk(s, 0.2);
    }
    return out.filter((k) => !k.pink);
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
      // Arms: stacked strokes blended additively give each arm a bright core
      // fading to soft edges, then a dark dust lane on its inner edge.
      const trace = (spine) => {
        ctx.beginPath();
        spine.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](view.sx(p.x), view.sy(p.y)));
      };
      // Up close the bands would be hundreds of pixels wide; the stars
      // carry the arm there, so the bands fade out as they widen.
      const bandFade = (arm) => Math.min(1, Math.max(0, (60 - px(arm.width)) / 45));
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'lighter';
      for (const arm of arms) {
        const fadeK = bandFade(arm);
        if (fadeK <= 0) continue;
        const band = (spine, k) => {
          if (spine.length < 2) return;
          trace(spine);
          for (let i = 0; i < ARM_PASSES; i++) {
            const t = i / (ARM_PASSES - 1);
            ctx.lineWidth = (2.6 - 2.2 * t) * 2 * px(arm.width);
            ctx.strokeStyle = `rgba(${Math.round(140 + 90 * t)},${Math.round(160 + 72 * t)},${Math.round(230 + 20 * t)},${0.017 * k * fadeK * alpha})`;
            ctx.stroke();
          }
        };
        for (const spine of arm.extraSpines) band(spine, 0.55);
        band(arm.fittedSpine, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
      const lane = px(arms[0].width);
      if (lane > 1.5) {
        for (const arm of arms) {
          if (arm.dust.length < 2) continue;
          trace(arm.dust);
          ctx.lineWidth = 0.45 * 2 * px(arm.width);
          ctx.strokeStyle = `rgba(4,5,10,${0.35 * alpha * bandFade(arm) * Math.min(1, (lane - 1.5) / 3)})`;
          ctx.stroke();
        }
      }
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      const closeAlpha = alpha * Math.min(1, Math.max(0, Math.log(80e3 * LY / view.radius) / Math.log(8)));
      for (const arm of arms) {
        drawPoints(ctx, view, arm.extra, 0, 0, '#dfe6ff', 0.4 * alpha);
        drawPoints(ctx, view, arm.fitted, 0, 0, '#e8eeff', 0.45 * alpha);
        if (closeAlpha > 0.02) drawPoints(ctx, view, arm.close, 0, 0, '#dfe6ff', 0.4 * closeAlpha);
        drawPoints(ctx, view, arm.bright, 0, 0, '#cfe0ff', 0.85 * alpha, 2);
      }
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
      // The Sun's orbit: a circle about the center through the Sun, with an
      // arrow at the Sun pointing the way it moves (toward l = 90, +y).
      const orbitR = px(mw.sunDistance);
      ctx.strokeStyle = `rgba(255,215,106,${0.8 * alpha})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(gx, gy, orbitR, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      const sx0 = view.sx(0);
      const sy0 = view.sy(0);
      const head = Math.min(10, Math.max(5, orbitR * 0.04));
      ctx.fillStyle = `rgba(255,215,106,${0.8 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(sx0, sy0 - 3 * head);
      ctx.lineTo(sx0 - head * 0.6, sy0 - 1.8 * head);
      ctx.lineTo(sx0 + head * 0.6, sy0 - 1.8 * head);
      ctx.fill();
      const tag = [gx - orbitR * Math.cos(Math.PI / 4), gy + orbitR * Math.sin(Math.PI / 4)];
      label(view, ...tag, 'Sun\u2019s orbit', 0.7 * alpha, 0);
      ringHit(view, gx, gy, orbitR, 'Sun\u2019s orbit', alpha, sunOrbitSummary(mw));
    },
  };
})();

// Dust within 3 kpc: the Lallement et al. 2022 3D map collapsed onto the
// plane by scripts/import-dust.mjs, one 10 pc column per pixel, drawn over
// the disk and under the stars.
export const dust = (() => {
  const HALF = 3005 * PC;
  let img = null;
  return {
    name: 'dust',
    range: [300 * LY, 40e3 * LY],
    draw(ctx, view, alpha) {
      if (!img) {
        img = new Image();
        img.src = 'data/dust.png';
      }
      if (!img.complete || !img.naturalWidth) return;
      const size = 2 * HALF / view.mpp;
      ctx.globalAlpha = 0.85 * alpha;
      ctx.drawImage(img, view.sx(-HALF), view.sy(HALF), size, size);
      ctx.globalAlpha = 1;
    },
  };
})();

// HII regions from the WISE catalog: hydrogen lit pink by young massive
// stars, at their catalog distances and sizes, with a floor so the smallest
// still show as a glow.
export const hiiRegions = (() => {
  const ARCSEC = Math.PI / 180 / 3600;
  const items = HII_REGIONS.map(([name, l, b, dist, rad, parallax]) => {
    const d = dist * 1000 * PC;
    const r = rad * ARCSEC * d;
    // The biggest complexes are the brightest.
    return { name, l, b, dist: d, radius: r, parallax, ...skyToPlane(l, d), strength: 0.3 + 0.35 * Math.min(1, r / (30 * PC)) };
  });
  let sprite = null;
  const makeSprite = () => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const t = c.getContext('2d');
    const g = t.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,170,200,1)');
    g.addColorStop(0.3, 'rgba(255,120,165,0.55)');
    g.addColorStop(1, 'rgba(255,90,140,0)');
    t.fillStyle = g;
    t.fillRect(0, 0, 64, 64);
    return c;
  };
  return {
    name: 'hii regions',
    range: [300 * LY, 500e3 * LY],
    draw(ctx, view, alpha) {
      sprite ??= makeSprite();
      for (const h of items) {
        const x = view.sx(h.x);
        const y = view.sy(h.y);
        const r = Math.max(3, 1.5 * h.radius / view.mpp);
        if (!onScreen(view, x, y, r)) continue;
        ctx.globalAlpha = h.strength * alpha;
        ctx.drawImage(sprite, x - r, y - r, 2 * r, 2 * r);
        hit(view, x, y, h.name || 'HII region', alpha, hiiSummary(h));
      }
      ctx.globalAlpha = 1;
    },
  };
})();

// WR 140: a dot among the galactic objects; closer, its dust shells, one
// per periastron, growing with the clock; closer still, the two stars on
// their orbit, projected onto the galactic plane.
export const wr140 = (() => {
  const wr = WR_140;
  const at = skyToPlane(wr.l, wr.dist);
  const planePA = galacticPlanePositionAngle(wr.ra, wr.dec);
  const toPlane = (p) => skyOffsetToPlane(p, planePA, wr.l);
  const path = skyOrbitPath(wr.orbit).map(toPlane);
  const total = wr.primary.mass + wr.secondary.mass;
  const pair = [[wr.primary, -wr.secondary.mass / total], [wr.secondary, wr.primary.mass / total]];
  const detail = wr140Summary(wr);
  return {
    name: 'wr 140',
    range: [0, 15e3 * LY],
    draw(ctx, view, alpha, days) {
      const x = view.sx(at.x);
      const y = view.sy(at.y);
      if (!onScreen(view, x, y, 200e3 * AU / view.mpp)) return;
      const o = wr.orbit;
      const newest = Math.floor((days - o.tP) / o.period);
      const oldest = wr.shellStart + wr.shellSpeed * wr.shellsShown * o.period;
      if (oldest / view.mpp > 6) {
        for (let k = newest; k > newest - wr.shellsShown; k--) {
          const age = days - (o.tP + k * o.period);
          const r = wr.shellStart + wr.shellSpeed * age;
          const rp = r / view.mpp;
          if (rp < 2) continue;
          // Older shells are cooler and fainter.
          const a = alpha * (1 - age / (wr.shellsShown * o.period)) ** 1.5;
          // Dust forms for a few months around periastron, so each shell
          // has a thickness.
          ctx.strokeStyle = `rgba(255,150,90,${0.25 * a})`;
          ctx.lineWidth = Math.max(1, wr.shellSpeed * 0.3 * YEAR_D / view.mpp);
          ctx.beginPath();
          ctx.arc(x, y, rp, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = `rgba(255,205,160,${0.55 * a})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          const year = new Date(J2000_MS + (o.tP + k * o.period) * DAY_S * 1000).getUTCFullYear();
          ringHit(view, x, y, rp, `Dust shell of ${year}`, alpha, dustShellSummary(year, r));
        }
      }
      if (o.a / view.mpp > 4) {
        const rel = toPlane(skyOrbitPosition(o, days));
        ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
        ctx.lineWidth = 1;
        for (const [star, f] of pair) {
          ctx.beginPath();
          path.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](view.sx(at.x + f * p.x), view.sy(at.y + f * p.y)));
          ctx.closePath();
          ctx.stroke();
          const sx = view.sx(at.x + f * rel.x);
          const sy = view.sy(at.y + f * rel.y);
          glow(ctx, sx, sy, 12, star.color, 0.4 * alpha);
          dot(ctx, sx, sy, 3, star.color, alpha);
          label(view, sx, sy, star.name, alpha, 1);
          hit(view, sx, sy, star.name, alpha, `${star.type} · ${star.mass} solar masses`);
        }
      } else {
        glow(ctx, x, y, 9, 'rgba(255,170,110,0.5)', alpha);
        dot(ctx, x, y, 2.5, '#d8e0ff', alpha);
        label(view, x, y, wr.name, alpha, 1);
        hit(view, x, y, wr.name, alpha, detail);
      }
    },
  };
})();

// Nebulae, clusters and black holes in the nearby arms.
export const galacticObjects = (() => {
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

// The Radcliffe Wave: scatter about its fitted centerline, in the plane.
export const radcliffeWave = (() => {
  const w = RADCLIFFE_WAVE;
  const rand = mulberry32(w.seed);
  const at = (t) => quadraticThrough(w.anchors, t).map((v) => v * PC);
  const pts = new Float64Array(w.count * 2);
  for (let i = 0; i < w.count; i++) {
    const t = rand();
    const [x, y] = at(t);
    const [x2, y2] = at(Math.min(1, t + 0.001));
    const len = Math.hypot(x2 - x, y2 - y) || 1;
    const off = gaussian(rand) * w.width * PC;
    pts[2 * i] = x - (y2 - y) / len * off;
    pts[2 * i + 1] = y + (x2 - x) / len * off;
  }
  const marks = [0.1, 0.3, 0.5, 0.7, 0.9].map(at);
  const detail = `Gas wave · ${w.note} · Alves et al. 2020`;
  return {
    name: 'radcliffe wave',
    range: [200 * LY, 30e3 * LY],
    draw(ctx, view, alpha) {
      drawPoints(ctx, view, pts, 0, 0, '#ffb4a8', 0.45 * alpha, 1.5);
      const [lx, ly] = marks[2];
      label(view, view.sx(lx), view.sy(ly), 'Radcliffe Wave', 0.9 * alpha, 1);
      for (const [x, y] of marks) hit(view, view.sx(x), view.sy(y), 'Radcliffe Wave', alpha, detail);
    },
  };
})();

// Globular clusters from the Harris catalog, sized by luminosity. Only the
// brighter named ones, and the nearest, are labelled.
export const globularClusters = (() => {
  const DISPLAY = { 'omega Cen': 'Omega Centauri', '47 Tuc': '47 Tucanae' };
  const items = GLOBULAR_CLUSTERS.map(([id, name, l, b, dist, mv]) => {
    const shown = DISPLAY[name] || name || id;
    return {
      id, name: shown, l, b, dist, mv, ...skyToPlane(l, dist * 1000 * PC),
      r: mv === null ? 1 : Math.min(3, Math.max(1, 1 + (-mv - 5) * 0.45)),
      labelled: Boolean(name) && ((mv !== null && mv <= -8.4) || dist < 3),
    };
  });
  return {
    name: 'globular clusters',
    range: [3e3 * LY, 800e3 * LY],
    draw(ctx, view, alpha) {
      for (const c of items) {
        const x = view.sx(c.x);
        const y = view.sy(c.y);
        if (!onScreen(view, x, y)) continue;
        glow(ctx, x, y, c.r * 3, 'rgba(255,225,160,0.45)', alpha);
        dot(ctx, x, y, c.r, '#ffe9bf', alpha);
        if (c.labelled) label(view, x, y, c.name, 0.85 * alpha, 0);
        hit(view, x, y, c.name, alpha, globularSummary(c));
      }
    },
  };
})();

// ------------------------------------------------------------ galactic center

// Sgr A* and the S-stars. The orbits are the real three-dimensional ones,
// projected onto the galactic plane like everything else on the map. Below
// the dot threshold the black hole is a dot; resolved, it shows the horizon,
// the shadow an observer would see and the innermost stable circular orbit,
// all to scale, ringed by a schematic glow like the EHT image.
// A supermassive black hole at screen (gx, gy): a dot until its shadow
// resolves, then horizon, shadow and innermost stable orbit to scale.
export function drawBlackHole(ctx, view, alpha, bh, gx, gy) {
  const rs = schwarzschildRadius(bh.mass);
  const shadowR = Math.sqrt(27) / 2 * rs;
  const iscoR = 3 * rs;
  const ring = (r, style, width, dash) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.arc(gx, gy, r, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  const shadowPx = shadowR / view.mpp;
  if (shadowPx < 3) {
    glow(ctx, gx, gy, 10, 'rgba(255,170,90,0.5)', alpha);
    dot(ctx, gx, gy, 3, '#ffc890', alpha);
  } else {
    // Emission peaks in a ring just outside the shadow, as in the Event
    // Horizon Telescope image, and fades outward. Its brightness is
    // schematic; the photon ring is its thin bright inner edge.
    const g = ctx.createRadialGradient(gx, gy, shadowPx, gx, gy, 3.2 * shadowPx);
    g.addColorStop(0, 'rgba(255,205,150,0.95)');
    g.addColorStop(0.06, 'rgba(255,160,80,0.7)');
    g.addColorStop(0.3, 'rgba(225,105,45,0.28)');
    g.addColorStop(1, 'rgba(160,60,30,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(gx, gy, 3.2 * shadowPx, 0, TAU);
    ctx.arc(gx, gy, shadowPx, 0, TAU, true);
    ctx.fill();
    ctx.globalAlpha = 1;
    dot(ctx, gx, gy, shadowPx, '#000000', alpha);
    ring(shadowPx + 1, `rgba(255,190,130,${0.3 * alpha})`, 5, []);
    ring(shadowPx, `rgba(255,240,220,${0.95 * alpha})`, 1.5, []);
    ring(rs / view.mpp, `rgba(140,140,160,${0.7 * alpha})`, 1, [4, 4]);
    ring(iscoR / view.mpp, `rgba(255,255,255,${0.25 * alpha})`, 1, [2, 6]);
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
}

export const nucleus = (() => {
  const bh = SGR_A_STAR;
  const planePA = galacticPlanePositionAngle(bh.ra, bh.dec);
  const toPlane = (p) => skyOffsetToPlane(p, planePA);
  const stars = S_STARS.map((s) => ({ ...s, path: skyOrbitPath(s).map(toPlane) }));
  return {
    name: 'galactic nucleus',
    range: [0, 1 * LY],
    draw(ctx, view, alpha, days) {
      const gx = view.sx(GC.x);
      const gy = view.sy(GC.y);
      if (!onScreen(view, gx, gy, 1e6)) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,${0.14 * alpha})`;
      for (const s of stars) {
        ctx.beginPath();
        s.path.forEach((p, k) => ctx[k ? 'lineTo' : 'moveTo'](view.sx(GC.x + p.x), view.sy(GC.y + p.y)));
        ctx.closePath();
        ctx.stroke();
      }
      drawBlackHole(ctx, view, alpha, bh, gx, gy);
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
export const nuclearCluster = (() => {
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

// A unit spiral galaxy: arms, an exponential disk and a core, in the disk
// plane with x along the major axis. Each spiral member gets its own copy,
// rotated by its real inclination and position angle into the galactic
// plane when those are known, or by an arbitrary in-plane angle when not.
const galaxyGlyph = {
  arms: makeSpiral(21, 2, 18, 0.12, 1, 5000),
  disk: makeExpDisk(23, 0.3, 1, 2500),
  core: makeBlob(22, 0.1, 0.1, 400),
};

function orientGlyph(pts, g, sizeM, angle) {
  const out = new Float64Array(pts.length);
  const planePA = g.inclination !== undefined ? galacticPlanePositionAngle(g.ra, g.dec) : 0;
  for (let i = 0; i < pts.length; i += 2) {
    let x;
    let y;
    if (g.inclination !== undefined) {
      const p = skyOffsetToPlane(diskToSky(g.inclination, g.pa, pts[i], pts[i + 1]), planePA, g.l);
      x = p.x;
      y = p.y;
    } else {
      x = pts[i] * Math.cos(angle) - pts[i + 1] * Math.sin(angle);
      y = pts[i] * Math.sin(angle) + pts[i + 1] * Math.cos(angle);
    }
    out[i] = x * sizeM;
    out[i + 1] = y * sizeM;
  }
  return out;
}

export const localGroup = (() => {
  const rand = mulberry32(31);
  const members = LOCAL_GROUP.map((g) => {
    const m = { ...g, ...skyToPlane(g.l, g.dist * LY), sizeM: g.size * LY };
    const angle = rand() * TAU;
    if (!g.spiral) {
      // Dwarfs are diffuse swarms of stars, densest at the middle.
      m.stars = makeBlob(60 + Math.round(g.dist % 997), m.sizeM * 0.35, m.sizeM * 0.35, 700);
    } else {
      m.arms = orientGlyph(galaxyGlyph.arms, g, m.sizeM, angle);
      m.disk = orientGlyph(galaxyGlyph.disk, g, m.sizeM, angle);
      m.core = orientGlyph(galaxyGlyph.core, g, m.sizeM, angle);
    }
    return m;
  });
  return {
    name: 'local group',
    range: [20e3 * LY, 25e6 * LY],
    draw(ctx, view, alpha) {
      for (const g of members) {
        const gAlpha = g.name === 'Milky Way' ? alpha * (1 - layerAlpha(view.radius, milkyWay.range)) : alpha;
        if (gAlpha <= 0.05) continue;
        const x = view.sx(g.x);
        const y = view.sy(g.y);
        const r = g.sizeM / view.mpp;
        if (!onScreen(view, x, y, Math.max(200, r))) continue;
        if (g.spiral) {
          glow(ctx, x, y, Math.max(r, 3), 'rgba(140,150,200,0.5)', gAlpha);
          if (r < 3) {
            dot(ctx, x, y, 2, '#e4e9ff', gAlpha);
          } else {
            drawPoints(ctx, view, g.disk, g.x, g.y, '#b8c4e8', 0.3 * gAlpha);
            drawPoints(ctx, view, g.arms, g.x, g.y, '#e4e9ff', 0.6 * gAlpha);
            drawPoints(ctx, view, g.core, g.x, g.y, '#fff2d8', 0.7 * gAlpha);
            glow(ctx, x, y, Math.max(r * 0.15, 3), 'rgba(255,240,215,0.8)', gAlpha);
          }
        } else if (r < 3) {
          glow(ctx, x, y, 5, 'rgba(220,210,190,0.7)', gAlpha);
          dot(ctx, x, y, 1.5, '#e6dcc8', gAlpha);
        } else {
          glow(ctx, x, y, r * 1.2, 'rgba(220,210,190,0.3)', gAlpha);
          drawPoints(ctx, view, g.stars, g.x, g.y, '#e6dcc8', 0.55 * gAlpha);
          glow(ctx, x, y, Math.max(r * 0.2, 3), 'rgba(240,230,210,0.6)', gAlpha);
        }
        label(view, x, y, g.name, gAlpha, g.spiral ? 2 : 0);
        hit(view, x, y, g.name, gAlpha, galaxySummary(g));
      }
    },
  };
})();

// The Magellanic Stream, placed along its great circle at the distances in
// data.js and dropped into the plane by longitude like everything else.
export const magellanicStream = (() => {
  const ms = MAGELLANIC_STREAM;
  const rand = mulberry32(ms.seed);
  const place = (L, B) => {
    const { l } = greatCircleToSky(ms.pole, ms.origin, L, B);
    const kpc = L < 0 ? ms.cloudsKpc - ms.gradientKpcPerDeg * L : ms.cloudsKpc;
    // Spread in depth too, or the Leading Arm, which runs mostly in
    // latitude, collapses onto one thin arc once latitude is dropped.
    return skyToPlane(l, kpc * 1000 * PC * (1 + 0.08 * gaussian(rand)));
  };
  const pts = new Float64Array(ms.count * 2);
  for (let i = 0; i < ms.count; i++) {
    // Denser near the Clouds, thinning toward the tip.
    const L = rand() < 0.12 ? rand() * ms.leadingArm : ms.tail * rand() ** 1.4;
    const p = place(L, gaussian(rand) * ms.sigmaB);
    pts[2 * i] = p.x;
    pts[2 * i + 1] = p.y;
  }
  const marks = [-120, -90, -60, -30, 30].map((L) => place(L, 0));
  const detail = `Gas stream · ${ms.note} · Nidever et al. 2008, 2010`;
  return {
    name: 'magellanic stream',
    range: [20e3 * LY, 4e6 * LY],
    draw(ctx, view, alpha) {
      ctx.globalCompositeOperation = 'lighter';
      drawPoints(ctx, view, pts, 0, 0, '#8fb8ff', 0.35 * alpha, 1.5);
      ctx.globalCompositeOperation = 'source-over';
      label(view, view.sx(marks[1].x), view.sy(marks[1].y), 'Magellanic Stream', 0.9 * alpha, 1);
      for (const m of marks) hit(view, view.sx(m.x), view.sy(m.y), 'Magellanic Stream', alpha, detail);
    },
  };
})();

// The Sagittarius stream: Gaia stars torn from the Sagittarius Dwarf,
// wrapped almost pole to pole around the galaxy and dropped into the plane
// by longitude like everything else, so here it folds onto the line
// through the galactic center.
export const sgrStream = (() => {
  const pts = new Float64Array(SGR_STREAM.length);
  for (let i = 0; i < SGR_STREAM.length; i += 2) {
    const p = skyToPlane(SGR_STREAM[i], SGR_STREAM[i + 1] * 1000 * PC);
    pts[i] = p.x;
    pts[i + 1] = p.y;
  }
  // Hover points along the stream, away from the dwarf itself.
  const marks = [];
  for (let i = 0; i < pts.length; i += 2 * 400) marks.push({ x: pts[i], y: pts[i + 1] });
  const detail = 'Star stream · stars torn from the Sagittarius Dwarf over billions of years, wrapped nearly pole to pole around the galaxy; '
    + 'it folds onto one line in this flattened map · Gaia members to about 60 kpc, Vasiliev et al. 2021; the stream reaches farther';
  return {
    name: 'sagittarius stream',
    range: [20e3 * LY, 3e6 * LY],
    draw(ctx, view, alpha) {
      ctx.globalCompositeOperation = 'lighter';
      drawPoints(ctx, view, pts, 0, 0, '#ffd9a0', 0.3 * alpha, 1.5);
      ctx.globalCompositeOperation = 'source-over';
      const m = marks[Math.floor(marks.length / 3)];
      label(view, view.sx(m.x), view.sy(m.y), 'Sagittarius stream', 0.9 * alpha, 1);
      for (const k of marks) hit(view, view.sx(k.x), view.sy(k.y), 'Sagittarius stream', alpha, detail);
    },
  };
})();

// S5-HVS1 and the straight path back to Sgr A*, and on out of the galaxy.
export const hypervelocityStar = (() => {
  const star = { ...S5_HVS1, ...skyToPlane(S5_HVS1.l, S5_HVS1.dist) };
  return {
    name: 'hypervelocity star',
    range: [3e3 * LY, 800e3 * LY],
    draw(ctx, view, alpha) {
      const gx = view.sx(GC.x);
      const gy = view.sy(GC.y);
      const x = view.sx(star.x);
      const y = view.sy(star.y);
      const g = ctx.createLinearGradient(gx, gy, x, y);
      g.addColorStop(0, 'rgba(160,210,255,0)');
      g.addColorStop(1, `rgba(160,210,255,${0.6 * alpha})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(x, y);
      ctx.stroke();
      // Ahead: as far again in the next few million years.
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = `rgba(160,210,255,${0.3 * alpha})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(2 * x - gx, 2 * y - gy);
      ctx.stroke();
      ctx.setLineDash([]);
      glow(ctx, x, y, 8, 'rgba(170,215,255,0.6)', alpha);
      dot(ctx, x, y, 2, '#e8f2ff', alpha);
      label(view, x, y, star.name, alpha, 1);
      hit(view, x, y, star.name, alpha, hypervelocitySummary(star));
    },
  };
})();
