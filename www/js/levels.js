// The camera stops: the wide levels, one per planet, the close-ups that
// follow a planet, and Earth's companions. Pure data, kept apart from the
// input and drawing in main.js so tests can check what names them.
import { AU, LY, KM, PLANETS, STARS, SYSTEM_STARS, STAR_SYSTEMS, LOCAL_GROUP, LOCAL_GROUP_STOPS, WR_140 } from './data.js';
import { skyToPlane, orbitalPosition, planetLevels, systemLevels, galaxyLevels } from './util.js';
import { GALACTIC_CENTER, M87_POSITION } from './scenes.js';

const M31 = skyToPlane(121.2, 2.54e6 * LY);
const VIRGO = skyToPlane(284, 54e6 * LY);

// Planets: one level per planet and dwarf planet, listed in the Planets menu and
// reached by clicking the planet or by hash. Each has `follow`, so the camera
// stays centered on the planet as it moves.
export const PLANET_LEVELS = planetLevels(PLANETS);
for (const lv of PLANET_LEVELS) lv.shortcut = { earth: '1', jupiter: '2', saturn: '3' }[lv.id];

const SYSTEM_LEVELS = systemLevels(STAR_SYSTEMS, [...STARS, ...SYSTEM_STARS]);
const WR140 = skyToPlane(WR_140.l, WR_140.dist);
const GALAXY_LEVELS = galaxyLevels(LOCAL_GROUP_STOPS, LOCAL_GROUP);

export const LEVELS = [
  { id: 'inner', name: 'Inner solar system', shortcut: '4', radius: 2 * AU, cx: 0, cy: 0 },
  { id: 'outer', name: 'Outer solar system', shortcut: '5', radius: 50 * AU, cx: 0, cy: 0 },
  { id: 'trans-neptunian', name: 'TNOs', shortcut: 'k', radius: 120 * AU, cx: 0, cy: 0,
    caption: 'Official dwarf planets: Pluto, Haumea, Makemake, Eris. Other labeled TNOs are candidates.' },
  { id: 'heliosphere', name: 'Heliosphere', radius: 240 * AU, cx: 0, cy: 0,
    clickNames: ['Voyager 1', 'Voyager 2', 'Pioneer 10', 'Pioneer 11', 'Termination shock', 'Heliopause'],
    caption: 'The Sun\u2019s wind gives way to interstellar gas at the heliopause, which both Voyagers have crossed. Spacecraft paths from JPL Horizons, laid into the ecliptic at their true distance.' },
  { id: 'stars', name: 'Stellar neighborhood', shortcut: '6', radius: 20 * LY, cx: 0, cy: 0,
    caption: 'Every known system within 16 light-years. Most are red dwarfs too faint for the eye; two of the nearest are brown dwarfs. Rings mark systems with known planets.' },
  ...SYSTEM_LEVELS,
  { id: 'local-bubble', name: 'Local Bubble', shortcut: 'u', radius: 700 * LY, cx: 0, cy: 0,
    caption: 'A cavity about 1,000 ly across, swept out by supernovae over the last 14 million years. The star-forming clouds lie on its shell; the outline between them is schematic. Brown is dust, mapped in 3D from Gaia (Lallement et al. 2022); stars are Gaia\u2019s most luminous within 1,500 ly.' },
  { id: 'local-arm', name: 'Local arm', shortcut: 'l', radius: 8000 * LY, cx: 0, cy: 0,
    caption: 'The Sun sits in the Local arm, between the Sagittarius–Carina arm toward the center and the Perseus arm away from it. Arm positions are from maser parallaxes; faint stretches are extrapolated.' },
  { id: 'milky-way', name: 'Milky Way', shortcut: '7', radius: 60e3 * LY, cx: GALACTIC_CENTER.x, cy: GALACTIC_CENTER.y,
    caption: 'Arms fitted to maser parallaxes (Reid et al. 2019), faint where extrapolated. Disk, bulge and bar are schematic.' },
  { id: 'wr-140', name: 'WR 140', radius: 1.3 * LY, cx: WR140.x, cy: WR140.y, clickName: 'WR 140',
    caption: 'Two massive stars on an 8-year orbit. At each close pass their winds collide and make dust, which flies out as a shell: 17 are seen, over 130 years. Run the clock at a year per second.' },
  { id: 'galactic-center', name: 'Galactic center', shortcut: 'g', radius: 4000 * AU, cx: GALACTIC_CENTER.x, cy: GALACTIC_CENTER.y,
    clickName: 'Galactic center',
    caption: 'Stars orbiting Sgr A*, on their measured orbits projected onto the galactic plane, moving with their real periods.' },
  { id: 'sgr-a', name: 'Sgr A*', shortcut: 'b', radius: 1 * AU, cx: GALACTIC_CENTER.x, cy: GALACTIC_CENTER.y,
    clickName: 'Sgr A*',
    caption: 'Horizon, shadow and innermost stable orbit to scale. The glow is schematic, ringing the shadow as in the Event Horizon Telescope image.' },
  { id: 'm87', name: 'M87*', radius: 2500 * AU, cx: M87_POSITION.x, cy: M87_POSITION.y, clickNames: ['M87', 'M87*'],
    caption: 'The black hole the Event Horizon Telescope imaged in 2019, 6.5 billion solar masses: its shadow alone is wider than Pluto’s orbit, 1,500 times Sgr A*’s. Horizon, shadow and innermost stable orbit to scale.' },
  { id: 'milky-way-halo', name: 'MW halo', shortcut: 'h', radius: 500e3 * LY, cx: 0, cy: 0,
    caption: 'Schematic top-down projection. Radial distances are to scale; galactic latitude is omitted and galaxy sizes are approximate.' },
  { id: 'local-group', name: 'Local Group', shortcut: '8', radius: 3e6 * LY, cx: M31.x / 2, cy: M31.y / 2 },
  ...GALAXY_LEVELS,
  { id: 'virgo', name: 'Virgo Supercluster', shortcut: '9', radius: 60e6 * LY, cx: VIRGO.x / 2, cy: VIRGO.y / 2 },
  { id: 'universe', name: 'Observable universe', shortcut: '0', radius: 58e9 * LY, cx: 0, cy: 0,
    caption: 'Looking outward means looking back in time. Schematic 2D comoving slice; the cosmic web is procedural, not a present-day map.' },
];

// Close-ups that follow a planet, reached by clicking what they show. A
// level with `spin` is drawn in a frame turning by that angle (radians, a
// function of days) about the planet.
export const SATURN = PLANETS.find((p) => p.name === 'Saturn');
export const EARTH = PLANETS.find((p) => p.name === 'Earth');
export const CLOSE_UPS = [
  { id: 'iss', name: 'ISS', radius: 20000e3, follow: PLANETS.find((p) => p.name === 'Earth'), clickName: 'ISS' },
  { id: 'lagrange', name: 'Sun\u2013Earth L1 and L2', radius: 2.2e9, follow: PLANETS.find((p) => p.name === 'Earth'),
    clickNames: ['JWST', 'Euclid', 'SOHO', 'DSCOVR', 'IMAP'],
    caption: 'Craft loop around the Sun\u2013Earth Lagrange points, 1.5 million km from Earth: JWST and Euclid beyond it at L2, with the Sun, Earth and Moon behind their shields; SOHO, DSCOVR and IMAP sunward at L1, watching the Sun and the solar wind.' },
  { id: 'janus-epimetheus', name: 'Janus and Epimetheus', radius: 190000 * KM, follow: SATURN, clickNames: ['Janus', 'Epimetheus'],
    frame: 'janus',
    caption: 'Two moons on one orbit, 50 km apart. Every four years the inner one catches up, and they swap orbits before they meet. Drawn turning with the pair; run the clock at a year per second.' },
];

// Earth's companions, seen from a frame turning with Earth about the Sun.
export const COMPANION_LEVELS = [
  { id: 'cruithne', name: 'Cruithne', radius: 1.8 * AU, cx: 0, cy: 0, frame: 'earth', pivot: { x: 0, y: 0 }, clickName: 'Cruithne',
    caption: 'Seen turning with Earth, Cruithne traces a kidney each year. Over centuries it creeps along Earth\u2019s orbit and back in a horseshoe, which is not modeled here.' },
  { id: 'kamooalewa', name: 'Kamo\u02bboalewa', radius: 0.3 * AU, frame: 'earth', pivot: { x: 0, y: 0 }, clickName: 'Kamo\u02bboalewa',
    at: (days) => { const p = orbitalPosition(EARTH, days); return { cx: p.x, cy: p.y }; },
    caption: 'A small asteroid on its own orbit round the Sun that, seen turning with Earth, loops around us once a year: a quasi-moon. It may be a chip off our Moon.' },
];

// LEVELS first so the inner solar system is the default view.
export const ALL_LEVELS = [...LEVELS, ...PLANET_LEVELS, ...CLOSE_UPS, ...COMPANION_LEVELS];
