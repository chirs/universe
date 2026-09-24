// Log-radius overview after Gott and Juric's Map of the Universe: direction
// across the screen, distance from the Sun up it on a log scale, so every
// level of the zoom is on one screen. Moons are omitted; they would sit on
// top of their planets here.
import {
  AU, LY, PLANETS, BELTS, STARS, BRIGHT_STARS, MILKY_WAY, LOCAL_GROUP, CLUSTERS,
  UNIVERSE, SUN, MILKY_WAY_OBJECTS, LOCAL_BUBBLE,
} from './data.js';
import {
  orbitalPosition, skyToPlane, formatDistance, planetSummary, starSummary,
  galaxySummary, clusterSummary, landmarkSummary, galacticObjectSummary, starStyle, starSystemSummary, cloudSummary,
} from './util.js';

export const R_MIN = 0.05 * AU;
export const R_MAX = UNIVERSE.radius * 1.08;

export const TICKS = [
  [0.1 * AU, '0.1 AU'], [AU, '1 AU'], [10 * AU, '10 AU'], [100 * AU, '100 AU'],
  [1000 * AU, '1,000 AU'], [0.1 * LY, '0.1 ly'], [LY, '1 ly'], [10 * LY, '10 ly'],
  [100 * LY, '100 ly'], [1e3 * LY, '1 kly'], [1e4 * LY, '10 kly'], [1e5 * LY, '100 kly'],
  [1e6 * LY, '1 Mly'], [1e7 * LY, '10 Mly'], [1e8 * LY, '100 Mly'], [1e9 * LY, '1 Gly'],
  [1e10 * LY, '10 Gly'],
];

// Screen frame for a w x h canvas.
export function frame(w, h) {
  return { left: 70, right: w - 24, top: 104, bottom: h - 100 };
}

// Log distance to a y coordinate within the frame.
export function logY(r, fr) {
  const t = (Math.log10(r) - Math.log10(R_MIN)) / (Math.log10(R_MAX) - Math.log10(R_MIN));
  return fr.bottom - t * (fr.bottom - fr.top);
}

// Galactic longitude in degrees to an x coordinate, l = 0 at the center.
export function angleX(l, fr) {
  const t = (((l % 360) + 360 + 180) % 360) / 360;
  return fr.left + t * (fr.right - fr.left);
}

function lonOf(x, y) {
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

const BANDS = [
  { inner: BELTS.asteroid.inner, outer: BELTS.asteroid.outer, color: 'rgba(143,138,128,0.22)', label: 'Asteroid belt' },
  { inner: BELTS.kuiper.inner, outer: BELTS.kuiper.outer, color: 'rgba(143,160,184,0.22)', label: 'Kuiper belt' },
  { inner: BELTS.oort.inner, outer: BELTS.oort.outer, color: 'rgba(127,142,168,0.18)', label: 'Oort cloud (inferred)' },
  { inner: 1e3 * LY, outer: MILKY_WAY.diskRadius + MILKY_WAY.sunDistance, color: 'rgba(154,164,200,0.12)', label: 'Milky Way disk' },
];

function pointsFor(days) {
  const pts = [];
  for (const p of PLANETS) {
    const pos = orbitalPosition(p, days);
    pts.push({ name: p.name, l: lonOf(pos.x, pos.y), r: Math.hypot(pos.x, pos.y), color: p.color, size: p.dwarf ? 1.8 : 2.8, priority: p.dwarf ? 0 : 2, detail: planetSummary(p) });
  }
  for (const s of STARS) {
    const st = starStyle(s.types[0]);
    pts.push({ name: s.name, l: s.l, r: s.dist * LY, color: st.color, size: st.radius + 0.6, priority: st.visible ? 1 : 0, detail: starSystemSummary(s) });
  }
  for (const c of LOCAL_BUBBLE.clouds) pts.push({ name: c.name, l: c.l, r: c.dist * LY, color: '#ffa096', size: 3, priority: 1, detail: cloudSummary(c) });
  for (const s of BRIGHT_STARS) pts.push({ name: s.name, l: s.l, r: s.dist * LY, color: '#f4f4ff', size: Math.min(3, Math.max(1.3, 2.4 - 0.5 * s.mag)), priority: s.mag < 1 ? 1 : 0, detail: starSummary(s) });
  for (const o of MILKY_WAY_OBJECTS) pts.push({ name: o.name, l: o.l, r: o.dist * LY, color: o.kind === 'Black hole' ? '#ffc890' : '#e8e4f4', size: 2.2, priority: 1, detail: galacticObjectSummary(o) });
  pts.push({ name: 'Galactic center', l: 0, r: MILKY_WAY.sunDistance, color: '#fff0cc', size: 4, priority: 3, detail: `Milky Way center · ${formatDistance(MILKY_WAY.sunDistance)} from the Sun` });
  for (const g of LOCAL_GROUP) if (g.dist > 0) pts.push({ name: g.name, l: g.l, r: g.dist * LY, color: g.spiral ? '#e4e9ff' : '#e6dcc8', size: g.spiral ? 3.2 : 1.8, priority: g.spiral ? 2 : 0, detail: galaxySummary(g) });
  for (const c of CLUSTERS) if (c.dist > 0) pts.push({ name: c.name, l: c.l, r: c.dist * 1e6 * LY, color: '#e8e4f4', size: c.n >= 200 ? 3.4 : 2.2, priority: c.n >= 200 ? 2 : c.n >= 100 ? 1 : 0, detail: clusterSummary(c) });
  for (const m of UNIVERSE.landmarks) pts.push({ name: m.name, l: m.l, r: m.dist, color: '#ffc88c', size: 3, priority: 2, ring: m.size / 2, detail: landmarkSummary(m) });
  return pts;
}

export function drawOverview(ctx, view, days) {
  const fr = frame(view.w, view.h);
  // The axes and their labels are outside the frame; keep labels off them.
  view.keepOut = [
    { x: 0, y: 0, w: fr.left, h: view.h },
    { x: 0, y: 0, w: view.w, h: fr.top },
    { x: 0, y: fr.bottom, w: view.w, h: view.h - fr.bottom },
  ];
  ctx.font = '11px system-ui, -apple-system, sans-serif';
  ctx.textBaseline = 'middle';

  for (const b of BANDS) {
    const y1 = logY(b.outer, fr);
    const y2 = logY(b.inner, fr);
    ctx.fillStyle = b.color;
    ctx.fillRect(fr.left, y1, fr.right - fr.left, y2 - y1);
    ctx.fillStyle = '#6a7080';
    ctx.textAlign = 'right';
    ctx.fillText(b.label, fr.right - 4, (y1 + y2) / 2);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#8a90a0';
  ctx.textAlign = 'right';
  for (const [r, label] of TICKS) {
    const y = logY(r, fr);
    ctx.beginPath();
    ctx.moveTo(fr.left, y);
    ctx.lineTo(fr.right, y);
    ctx.stroke();
    ctx.fillText(label, fr.left - 8, y);
  }
  const yEdge = logY(UNIVERSE.radius, fr);
  ctx.strokeStyle = 'rgba(255,170,120,0.6)';
  ctx.beginPath();
  ctx.moveTo(fr.left, yEdge);
  ctx.lineTo(fr.right, yEdge);
  ctx.stroke();
  ctx.fillStyle = '#ffaa78';
  ctx.textAlign = 'left';
  ctx.fillText('Edge of the observable universe', fr.left + 6, yEdge - 9);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8a90a0';
  for (const [l, label] of [[180, '180°'], [270, '270°'], [0, '0° toward the galactic center'], [90, '90°']]) {
    const x = angleX(l, fr);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(x, fr.top);
    ctx.lineTo(x, fr.bottom);
    ctx.stroke();
    ctx.fillText(label, x, fr.bottom + 14);
  }
  ctx.fillText('180°', fr.right, fr.bottom + 14);
  ctx.fillText('direction, by galactic longitude · distance from the Sun, log scale · moons omitted', (fr.left + fr.right) / 2, fr.bottom + 32);
  ctx.textAlign = 'left';
  ctx.fillStyle = SUN.color;
  ctx.fillText('Sun', fr.left + 6, fr.bottom - 8);

  for (const p of pointsFor(days)) {
    if (p.r < R_MIN || p.r > R_MAX) continue;
    const x = angleX(p.l, fr);
    const y = logY(p.r, fr);
    if (p.ring) {
      const ry = logY(p.r + p.ring, fr);
      ctx.strokeStyle = 'rgba(255,200,140,0.35)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(x, y, Math.max(12, (fr.right - fr.left) * Math.min(0.2, p.ring / p.r / 6)), Math.abs(y - ry), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fill();
    view.labels.push({ x, y, text: p.name, alpha: 1, priority: p.priority });
    view.hits.push({ x, y, name: p.name, detail: p.detail });
  }
}
