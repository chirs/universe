import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

// Run against a separate Chrome with --remote-debugging-port=9331.
// Usage: node scripts/check-v2.mjs [site URL] [debugging port]
const base = process.argv[2] || 'http://127.0.0.1:8766/v2/';
const endpoint = `http://127.0.0.1:${process.argv[3] || 9331}`;
const tab = await (await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' })).json();
const socket = new WebSocket(tab.webSocketDebuggerUrl);
const pending = new Map(), errors = [];
let id = 0;
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    pending.delete(message.id);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(a => a.value || a.description).join(' '));
});
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression) {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    if (errors.length) throw new Error(errors.join('\n'));
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out: ${expression}`);
}
async function click(selector) {
  const point = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x:r.x+r.width/2,y:r.y+r.height/2 }; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`/private/tmp/universe-v2-${name}.png`, Buffer.from(result.data, 'base64'));
}
async function settle() {
  await until(`new URLSearchParams(location.hash.slice(1)).has('r')`);
  await evaluate(`new Promise(resolve => setTimeout(resolve, 1450))`);
}
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base });
  await until(`document.querySelector('#loading')?.hidden && document.querySelector('#scene-title')?.textContent.length > 0`);
  assert.equal(await evaluate(`document.querySelector('#fallback').hidden`), true);
  await screenshot('universe');
  await click('#cutaway');
  await until(`document.querySelector('#cutaway').getAttribute('aria-pressed') === 'false'`);
  await click('#cutaway');
  await click('[data-stop="web"]'); await settle(); await screenshot('web');
  await click('[data-stop="virgo"]'); await settle(); await screenshot('virgo');
  await click('[data-stop="local-group"]'); await settle();
  assert.equal(await evaluate(`document.querySelector('#scene-title').textContent`), 'Meet the neighbors.');
  await screenshot('local-group');
  const before = await evaluate('location.hash');
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 780, y: 520, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 910, y: 555, button: 'left', buttons: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 910, y: 555, button: 'left', clickCount: 1 });
  await until(`location.hash !== ${JSON.stringify(before)}`);
  await screenshot('rotated');
  await click('#search-toggle');
  await send('Input.insertText', { text: 'Andromeda' });
  await until(`document.querySelectorAll('#search-results button').length === 1`);
  await click('#search-results button');
  assert.equal(await evaluate(`document.querySelector('#object-name').textContent`), 'Andromeda (M31)');
  await click('#focus-object'); await settle();
  assert.ok(Number(new URLSearchParams((await evaluate('location.hash')).slice(1)).get('r')) < 1);
  assert.equal(await evaluate(`document.querySelector('#scene-title').textContent`), 'Andromeda (M31)');
  const shared = await evaluate('location.href');
  await send('Page.reload', { ignoreCache: true });
  await until(`document.querySelector('#loading')?.hidden && document.querySelector('#scene-title')?.textContent.length > 0`);
  assert.equal(await evaluate('location.href'), shared);
  assert.equal(await evaluate(`document.querySelector('#scene-title').textContent`), 'Andromeda (M31)');
  await click('[data-stop="home"]'); await settle(); await screenshot('home');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
  await click('[data-stop="universe"]'); await settle(); await screenshot('mobile-universe');
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  await click('[data-stop="local-group"]'); await settle();
  const touchBefore = await evaluate('location.hash');
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 420, id: 1 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 260, y: 450, id: 1 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await until(`location.hash !== ${JSON.stringify(touchBefore)}`);
  const pinchBefore = Number(new URLSearchParams((await evaluate('location.hash')).slice(1)).get('r'));
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 140, y: 420, id: 1 }, { x: 240, y: 420, id: 2 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 110, y: 420, id: 1 }, { x: 270, y: 420, id: 2 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await until(`Number(new URLSearchParams(location.hash.slice(1)).get('r')) < ${pinchBefore}`);
  await screenshot('mobile-local-group');
  await click('#search-toggle');
  await send('Input.insertText', { text: 'Virgo' });
  await until(`document.querySelectorAll('#search-results button').length === 1`);
  await click('#search-results button');
  await screenshot('mobile-selection');
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS: desktop scales, cutaway, rotation, search, focus, share URL, mobile layout, touch rotation, pinch zoom, and selection.');
  console.log('Screenshots: /private/tmp/universe-v2-*.png');
} finally {
  socket.close();
  await fetch(`${endpoint}/json/close/${tab.id}`);
}
