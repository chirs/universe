// Generative ambient sound: a drone, a seeded reverb and occasional chimes,
// all synthesized with the Web Audio API. It follows the zoom: warm and full
// close in, low and sparse at the cosmic web.
import { mulberry32 } from './util.js';
import { R_MIN, R_MAX } from './overview.js';

const DRONE = [1, 1.5, 2, 2.25];
const DETUNE = [-4, 3, -2, 5];
const DRONE_GAIN = [0.1, 0.06, 0.04, 0.03];
const SWELL_HZ = [0.021, 0.034, 0.047, 0.029];
const CHIMES = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];
const GLIDE_S = 1.5;
const FADE_S = 3;
const MAX_GAIN = 0.4;
const CHIME_S = 7;

function span(a, b, t) {
  return a * Math.pow(b / a, t);
}

export function soundParams(radius) {
  const t = Math.min(1, Math.max(0,
    (Math.log10(radius) - Math.log10(R_MIN)) / (Math.log10(R_MAX) - Math.log10(R_MIN))));
  return {
    root: span(110, 55, t),
    cutoff: span(1400, 350, t),
    wet: 0.5 + 0.35 * t,
    chimeRate: span(10, 2, t),
  };
}

// Squared so the slider feels even to the ear.
function gainFor(volume) {
  return MAX_GAIN * volume * volume;
}

function impulse(ctx, seconds, seed) {
  const rand = mulberry32(seed);
  const n = Math.round(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < n; i++) data[i] = (rand() * 2 - 1) * Math.pow(1 - i / n, 2.5);
  }
  return buf;
}

export function createAmbient(volume) {
  const ctx = new AudioContext();
  const rand = mulberry32(1977);
  let params = soundParams(R_MIN);
  let enabled = false;
  let level = volume;
  let nextChime = 0;

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 7, 42);
  dry.connect(master);
  reverb.connect(wet).connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.5;
  filter.connect(dry);
  filter.connect(reverb);

  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoDepth.gain.value = 200;
  lfo.connect(lfoDepth).connect(filter.frequency);
  lfo.start();

  const voices = DRONE.map((ratio, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const swell = ctx.createOscillator();
    const depth = ctx.createGain();
    osc.detune.value = DETUNE[i];
    gain.gain.value = DRONE_GAIN[i];
    swell.frequency.value = SWELL_HZ[i];
    depth.gain.value = DRONE_GAIN[i] * 0.8;
    swell.connect(depth).connect(gain.gain);
    osc.connect(gain).connect(filter);
    osc.start();
    swell.start();
    return { osc, ratio };
  });

  function set(param, value) {
    param.setTargetAtTime(value, ctx.currentTime, GLIDE_S);
  }

  function chime(now) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.value = params.root * 4 * CHIMES[Math.floor(rand() * CHIMES.length)];
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.12, now + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, now + CHIME_S);
    osc.connect(env);
    env.connect(dry);
    env.connect(reverb);
    osc.start(now);
    osc.stop(now + CHIME_S);
  }

  function apply() {
    for (const v of voices) set(v.osc.frequency, params.root * v.ratio);
    set(filter.frequency, params.cutoff);
    set(wet.gain, params.wet);
    set(dry.gain, 1 - params.wet);
  }

  apply();

  return {
    update(radius) {
      params = soundParams(radius);
      apply();
      const now = ctx.currentTime;
      if (!enabled || now < nextChime) return;
      if (nextChime) chime(now);
      nextChime = now - Math.log(1 - rand()) * 60 / params.chimeRate;
    },
    setVolume(v) {
      level = v;
      if (enabled) set(master.gain, gainFor(level));
    },
    setEnabled(on) {
      enabled = on;
      const now = ctx.currentTime;
      if (on) ctx.resume();
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(on ? gainFor(level) : 0, now + FADE_S);
      if (!on) setTimeout(() => { if (!enabled) ctx.suspend(); }, FADE_S * 1000 + 100);
    },
  };
}
