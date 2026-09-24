// The atlas of moments: dated events, each a camera stop and a clock time,
// walked with the Moments menu or the [ and ] keys. Where the drawing
// already carries the instant (an orbit's periapsis time, a swap epoch, a
// broadcast date), `t` is derived from it so the moment cannot disagree
// with what is drawn; the rest are literals with their source. Times are
// on the minute, the precision a `#level?t=` link carries. Entries with
// `far` lie beyond the clock's reach (a JS Date spans about 270,000
// years) and are listed but not reachable.
import {
  DAY_S, J2000_MS, PLANETS, COMETS, INTERSTELLAR, S_STARS, WR_140, ARECIBO_MESSAGE, RADIO,
} from './data.js';

const MINUTE = 60 * 1000;
const minute = (ms) => Math.floor(ms / MINUTE) * MINUTE;
const atDays = (days) => minute(J2000_MS + days * DAY_S * 1000);
const SATURN = PLANETS.find((p) => p.name === 'Saturn');
const HALLEY = COMETS.find((c) => c.name === 'Halley');
const S2 = S_STARS.find((s) => s.name === 'S2');
const visitor = (name) => INTERSTELLAR.find((b) => b.name === name);
const HALLEY_1986 = Date.UTC(1986, 1, 9);

export const MOMENTS = [
  { level: 'stars', t: ARECIBO_MESSAGE.sent, title: 'The Arecibo message leaves Earth',
    caption: 'Three minutes of radio toward the cluster M13, 23,000 light-years away, moving out with the clock at the speed of light. It reaches M13 in about the year 25,000.',
    source: 'Arecibo Observatory, 16 November 1974' },
  { level: 'inner', t: HALLEY_1986, title: 'Halley at perihelion',
    caption: 'The 1986 return, met by the Giotto and Vega probes. It reached aphelion beyond Neptune in December 2023 and is on its way back.',
    source: 'JPL Small-Body Database' },
  { level: 'inner', t: Date.UTC(1997, 3, 1), title: 'Hale–Bopp at perihelion',
    caption: 'The great comet of 1997, visible to the naked eye for eighteen months, the longest on record; here at its closest to the Sun, 0.9 AU.',
    source: 'JPL Small-Body Database' },
  { level: 'heliosphere', t: Date.UTC(2012, 7, 25), title: 'Voyager 1 crosses the heliopause', track: 'Voyager 1',
    caption: '121 AU out, the plasma around the craft grew forty times denser: the Sun’s wind had given way to interstellar gas. The first craft to leave the heliosphere.',
    source: 'NASA/JPL; Gurnett et al. 2013' },
  { level: 'trans-neptunian', t: Date.UTC(2015, 6, 14, 11, 49), title: 'New Horizons flies past Pluto', track: 'New Horizons',
    caption: 'Nine and a half years from Earth, 12,500 km above Pluto at 14 km/s. The craft is drawn from a 30-day track, so here it sits within a fraction of an AU.',
    source: 'NASA/JHUAPL' },
  { level: 'inner', t: atDays(visitor('ʻOumuamua').tP), title: 'ʻOumuamua at perihelion',
    caption: 'Inside Mercury’s orbit, 0.26 AU from the Sun, and no one had seen it yet: it was found five weeks later, already outbound. The first known visitor from another star.',
    source: 'JPL Small-Body Database' },
  { level: 'galactic-center', t: atDays(S2.tP + S2.period), title: 'S2 sweeps past Sgr A*',
    caption: 'Closest approach, 120 AU from the black hole at 7,700 km/s. The GRAVITY interferometer watched its light redden and its orbit precess, as general relativity says. Measured on 19 May; this orbit is the 2017 fit.',
    source: 'Gillessen et al. 2017; GRAVITY Collaboration 2018, 2020' },
  { level: 'heliosphere', t: Date.UTC(2018, 10, 5), title: 'Voyager 2 crosses the heliopause', track: 'Voyager 2',
    caption: 'Six years after its twin, 119 AU out in another direction, with its plasma instrument still working: the first direct measurement of the boundary.',
    source: 'NASA/JPL; Richardson et al. 2019' },
  { level: 'inner', t: atDays(visitor('2I/Borisov').tP), title: '2I/Borisov at perihelion',
    caption: 'The first interstellar comet, 2 AU from the Sun, just outside Mars’s orbit, shedding gas rich in carbon monoxide. Found by an amateur astronomer four months earlier.',
    source: 'JPL Small-Body Database' },
  { level: 'local-bubble', t: Date.UTC(2020, 10, 2), title: 'A century of broadcasting',
    caption: 'KDKA’s election-night broadcast of 1920 has reached 100 light-years. Everything humanity has ever transmitted lies inside this sphere.',
    source: 'first scheduled broadcast, 2 November 1920' },
  { level: 'outer', t: Date.UTC(2020, 11, 21), title: 'Jupiter and Saturn in great conjunction',
    caption: 'Seen from Earth the two passed a tenth of a degree apart, the closest since 1623. From above they are simply on the same side of the Sun, Jupiter lapping Saturn as it does every twenty years.',
    source: 'JPL Horizons' },
  { level: 'inner', t: Date.UTC(2022, 8, 26, 23, 14), title: 'DART strikes Dimorphos',
    caption: 'A 580 kg craft hit the 150 m moon of Didymos at 6 km/s, 11 million km from Earth, and shortened its orbit around Didymos by 33 minutes: the first test of moving an asteroid.',
    source: 'NASA/JHUAPL' },
  { level: 'wr-140', t: atDays(WR_140.orbit.tP), title: 'WR 140 at periastron',
    caption: 'The two stars pass within 1.4 AU, their winds collide, and a new shell of dust condenses and sails out after the seventeen before it. Run the clock at a year per second.',
    source: 'Thomas et al. 2021' },
  { level: 'inner', t: atDays(visitor('3I/ATLAS').tP), title: '3I/ATLAS at perihelion',
    caption: '1.36 AU from the Sun, just inside Mars’s orbit and behind the Sun as seen from Earth. The third interstellar visitor and the fastest, an active comet that may be older than the Sun.',
    source: 'JPL Small-Body Database' },
  { level: 'janus-epimetheus', t: atDays(SATURN.coorbitals.swapEpoch + 5 * SATURN.coorbitals.swapInterval), title: 'Janus and Epimetheus swap orbits',
    caption: 'The inner moon catches the outer, their pull trades their orbits, and they part without meeting, 15,000 km apart at the closest. The next swap is four years on.',
    source: 'swap dates from JPL; the pair’s phase is a display phase' },
  { level: 'earth', t: Date.UTC(2029, 3, 13, 21, 45), title: 'Apophis passes inside the geostationary ring', track: 'Apophis flyby',
    caption: 'A 340 m asteroid 32,000 km above Earth, closer than the satellites that relay television, visible to the eye from Europe and Africa. Earth’s pull bends its path here; OSIRIS-APEX arrives soon after to see what the tides did.',
    source: 'JPL Horizons' },
  { level: 'galactic-center', t: atDays(S2.tP + 2 * S2.period), title: 'S2 returns to periapsis',
    caption: 'Sixteen years on, S2 comes round again, its orbit turned a fifth of a degree by the mass of Sgr A* since the last pass.',
    source: 'Gillessen et al. 2017' },
  { level: 'inner', t: minute(HALLEY_1986 + HALLEY.period * DAY_S * 1000), title: 'Halley returns',
    caption: 'Its next perihelion is due on 28 July 2061; the fixed orbit drawn here, without the planets’ pulls, brings it round five months late. Earth will be well placed to see it this time, unlike 1986.',
    source: 'JPL Small-Body Database; the 2061 date from the note in data.js' },
  { far: true, when: 'in 230 million years', title: 'The Sun completes a galactic orbit',
    caption: 'One galactic year: the Sun back where it is now, the Local arm long dissolved.' },
  { far: true, when: 'in 4.5 billion years', title: 'Andromeda arrives',
    caption: 'The Milky Way and M31 meet and merge.' },
];
