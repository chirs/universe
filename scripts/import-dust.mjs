// Collapse the Lallement et al. 2022 3D dust map (VizieR J/A+A/661/A147:
// extinction density at 550 nm on a 10 pc grid, 6 x 6 x 0.8 kpc around the
// Sun) onto the galactic plane and write www/data/dust.png. Each pixel is
// one 10 pc column, its alpha the total extinction through the whole 800 pc
// thickness, as the map drops latitude everywhere else.
// Usage: node scripts/import-dust.mjs [local copy of cube_ext.fits.gz]
// (without one it downloads about 100 MB)
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { gunzipSync, deflateSync, crc32 } from 'node:zlib';

const URL_ = 'https://cdsarc.cds.unistra.fr/ftp/J/A+A/661/A147/cube_ext.fits.gz';
const fits = gunzipSync(process.argv[2] ? readFileSync(process.argv[2]) : Buffer.from(await (await fetch(URL_)).arrayBuffer()));

// FITS: 2880-byte header blocks of 80-character cards, then big-endian data.
const header = {};
let offset = 0;
for (let done = false; !done; offset += 2880) {
  for (let i = 0; i < 36; i++) {
    const card = fits.toString('latin1', offset + 80 * i, offset + 80 * (i + 1));
    if (card.startsWith('END')) done = true;
    const m = card.match(/^(\w+)\s*=\s*('?[^'/]*'?)/);
    if (m) header[m[1]] = m[2].trim();
  }
}
const [nx, ny, nz] = [header.NAXIS1, header.NAXIS2, header.NAXIS3].map(Number);
const step = Number(header.STEP);
const column = new Float64Array(nx * ny);
for (let z = 0; z < nz; z++) {
  for (let k = 0; k < nx * ny; k++) {
    const v = fits.readFloatBE(offset + 4 * (z * nx * ny + k));
    if (v > 0) column[k] += v * step;
  }
}

// Extinction in magnitudes to opacity: the diffuse floor of a tenth of a
// magnitude or so is left clear, a cloud of a magnitude or more is near
// opaque. Beyond about 2 kpc the map is less certain and streaks along
// sight lines, so it fades out from there to the cube's edge.
const FLOOR = 0.1;
const A0 = 0.5;
const FADE = 1200;
const half = (nx - 1) / 2;
const png = Buffer.alloc(ny * (1 + 4 * nx));
for (let r = 0; r < ny; r++) {
  png[r * (1 + 4 * nx)] = 0;
  const y = ny - 1 - r;   // the first row is +y, toward l = 90
  for (let x = 0; x < nx; x++) {
    const d = Math.hypot(x - half, y - half) * step;
    const edge = Math.min(1, Math.max(0, (half * step - d) / FADE));
    const a = (1 - Math.exp(-Math.max(0, column[y * nx + x] - FLOOR) / A0)) * edge;
    png.set([150, 95, 70, Math.round(255 * a)], r * (1 + 4 * nx) + 1 + 4 * x);
  }
}
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'latin1');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(nx, 0);
ihdr.writeUInt32BE(ny, 4);
ihdr.set([8, 6, 0, 0, 0], 8);   // 8-bit RGBA
mkdirSync(new URL('../www/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../www/data/dust.png', import.meta.url), Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(png, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]));
const sorted = [...column].sort((a, b) => a - b);
const pct = (p) => sorted[Math.floor(p * (sorted.length - 1))].toFixed(2);
console.log(`${nx} x ${ny} columns of ${step} pc; extinction (mag) median ${pct(0.5)}, 90% ${pct(0.9)}, 99% ${pct(0.99)}, max ${pct(1)}`);
