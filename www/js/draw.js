// Drawing helpers shared by the scene layers.
import { mulberry32 } from './util.js';

export const TAU = Math.PI * 2;
export const INF = Infinity;

export function gaussian(rand) {
  return Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(TAU * rand());
}

export function makeBlob(seed, sigmaX, sigmaY, count, angleDeg = 0) {
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

export function annulus(seed, count, inner, outer, log) {
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

export function drawPoints(ctx, view, pts, ox, oy, color, alpha, size = 1) {
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

export function dot(ctx, x, y, r, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function glow(ctx, x, y, r, color, alpha = 1) {
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

// Queue a label; main.js draws them last, each to the right of its point.
export function label(view, x, y, text, alpha, priority = 0) {
  if (alpha <= 0.05) return;
  view.labels.push({ x, y, text, alpha, priority });
}

export function hit(view, x, y, name, alpha, detail) {
  if (alpha > 0.5) view.hits.push({ x, y, name, detail });
}

export function ringHit(view, x, y, radius, name, alpha, detail) {
  if (alpha > 0.5) view.hits.push({ x, y, radius, name, detail });
}

// The teal of our own signals and craft: radio, spacecraft, the Arecibo pulse.
export const SIGNAL = '#7fe0c0';
export const signal = (alpha) => `rgba(127,224,192,${alpha})`;

export function onScreen(view, x, y, pad = 20) {
  return x > -pad && x < view.w + pad && y > -pad && y < view.h + pad;
}
