// Every scene layer's draw runs against a stub canvas at a spread of view
// radii and centers, so a missing import or a bad reference in a layer
// fails here instead of leaving a blank layer in the browser.
import test from 'node:test';
import assert from 'node:assert/strict';

const noop = () => {};
const gradient = { addColorStop: noop };
const ctxHandler = {
  get(target, prop) {
    if (prop === 'measureText') return () => ({ width: 40 });
    if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => gradient;
    if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    if (prop === 'canvas') return { width: 1440, height: 900 };
    return noop;
  },
  set() { return true; },
};
const makeCtx = () => new Proxy({}, ctxHandler);
globalThis.document = { createElement: () => ({ getContext: makeCtx, width: 0, height: 0 }) };
globalThis.Image = class { constructor() { this.complete = false; this.naturalWidth = 0; } };
globalThis.fetch = () => new Promise(noop);

const { LAYERS, GALACTIC_CENTER, M87_POSITION } = await import('../js/scenes.js');
const { AU, LY } = await import('../js/data.js');
const { layerAlpha } = await import('../js/util.js');

test('every layer draws at every scale and around the Sun, the galactic center and M87', () => {
  const w = 1440;
  const h = 900;
  const centers = [{ x: 0, y: 0 }, GALACTIC_CENTER, M87_POSITION, { x: 1.5e11, y: 0 }];
  const radii = [1e9, 1 * AU, 2 * AU, 50 * AU, 1000 * AU, 20 * LY, 700 * LY, 8000 * LY, 60e3 * LY, 3e6 * LY, 60e6 * LY, 2e9 * LY, 58e9 * LY, 460e9 * LY];
  let calls = 0;
  for (const c of centers) {
    for (const radius of radii) {
      const mpp = radius / (Math.min(w, h) / 2);
      const view = {
        w, h, cx: c.x, cy: c.y, mpp, radius,
        sx: (x) => w / 2 + (x - c.x) / mpp,
        sy: (y) => h / 2 - (y - c.y) / mpp,
        hits: [], labels: [], frame: null,
      };
      for (const layer of LAYERS) {
        const alpha = layerAlpha(radius, layer.range);
        if (alpha <= 0) continue;
        assert.doesNotThrow(() => layer.draw(makeCtx(), view, alpha, 9800), `${layer.name} at ${radius.toExponential(1)} m`);
        calls++;
      }
    }
  }
  assert.ok(LAYERS.length >= 48 && calls > 500, `${LAYERS.length} layers, ${calls} draw calls`);
});
