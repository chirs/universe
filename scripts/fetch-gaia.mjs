// Query the Gaia DR3 archive for every luminous star (absolute G brighter
// than 1, no extinction correction) within 1500 light-years, and write
// www/data/gaia-stars.bin. Usage: node scripts/fetch-gaia.mjs
//
// Layout, little-endian: n pairs of int16 x, y (galactic plane, latitude
// dropped, in twentieths of a light-year: +x toward the center, +y toward
// l = 90), then n bytes of class: spectral bin * 4 + luminosity bin.
// Spectral bins 0-5 are B A F G K M, from the GSP-Phot temperature where
// Gaia has one, else from the observed BP-RP color; luminosity bins 0-2 are
// absolute G brighter than -3, -3 to -1, and -1 to 1.
import { writeFileSync, mkdirSync } from 'node:fs';

const LY_PER_PC = 3.261563777;
const MAX_LY = 1500;
const QUERY = `SELECT l, parallax, phot_g_mean_mag, bp_rp, teff_gspphot FROM gaiadr3.gaia_source
  WHERE parallax > ${(1000 * LY_PER_PC / MAX_LY).toFixed(3)} AND parallax_over_error > 10
  AND phot_g_mean_mag + 5 * LOG10(parallax / 100) < 1.0`;

const body = new URLSearchParams({ REQUEST: 'doQuery', LANG: 'ADQL', FORMAT: 'csv', QUERY });
const res = await fetch('https://gea.esac.esa.int/tap-server/tap/sync', { method: 'POST', body });
const lines = (await res.text()).trim().split('\n').slice(1);

const byTeff = (t) => (t > 10000 ? 0 : t > 7300 ? 1 : t > 6000 ? 2 : t > 5300 ? 3 : t > 3900 ? 4 : 5);
const byColor = (c) => (c < 0 ? 0 : c < 0.35 ? 1 : c < 0.7 ? 2 : c < 0.95 ? 3 : c < 1.7 ? 4 : 5);
const stars = [];
for (const line of lines) {
  const [l, plx, g, bpRp, teff] = line.split(',').map((s) => (s === '' ? NaN : Number(s)));
  const ly = 1000 / plx * LY_PER_PC;
  const absG = g + 5 * Math.log10(plx / 100);
  const spec = Number.isFinite(teff) ? byTeff(teff) : Number.isFinite(bpRp) ? byColor(bpRp) : 3;
  const lum = absG < -3 ? 0 : absG < -1 ? 1 : 2;
  const lr = l * Math.PI / 180;
  stars.push([Math.round(ly * Math.cos(lr) * 20), Math.round(ly * Math.sin(lr) * 20), spec * 4 + lum]);
}
const n = stars.length;
const buf = Buffer.alloc(n * 5);
stars.forEach(([x, y, c], i) => {
  buf.writeInt16LE(x, 4 * i);
  buf.writeInt16LE(y, 4 * i + 2);
  buf[4 * n + i] = c;
});
mkdirSync(new URL('../www/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../www/data/gaia-stars.bin', import.meta.url), buf);
console.log(`${n} stars`);
