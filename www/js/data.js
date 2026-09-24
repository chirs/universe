// Written by a model from memory of the references named below, not
// transcribed from them -- see AGENTS.md. Planetary elements: NASA JPL
// "Approximate Positions of the Planets" (Keplerian elements for 1800-2050);
// mean longitude L0 at J2000 from the same table. Radii: NASA planetary fact
// sheets. Nearest stars: RECONS 10 pc list; galactic coordinates rounded to
// a tenth of a degree. Local Group members: McConnachie (2012). Galaxy and
// supercluster sizes are round numbers from the usual encyclopedia values.
// Ring radii are from NASA's planetary ring fact sheets; narrow rings are
// given their mean radius plus or minus half their width, and gaps (Encke,
// Keeler) are left between pieces of the ring they cut. Alpha is a rough
// opacity for drawing, not a measured optical depth.
// Moon orbits and radii are from JPL's planetary-satellite tables and the
// published mutual-orbit solutions for trans-Neptunian binaries. L0 is the
// mean longitude at J2000 where an epoch phase is available. For distant
// dwarf-planet satellites without one, L0 is an arbitrary display phase; the
// measured orbit size, period, and eccentricity are retained. Moons are drawn
// as face-on circles around their planet even where the real orbit is steeply
// tilted to the ecliptic (Uranus, Pluto); orbits inclined past 90 degrees run
// clockwise from above and are flagged retrograde.
// The star, Local Group and galaxy-group positions were cross-checked against
// Richard Powell's Atlas of the Universe (atlasoftheuniverse.com); group
// directions use his centroids, distances stay with newer values.
// Exceptions, transcribed rather than recalled: the Abell clusters,
// SUPERCLUSTERS (both from Powell's tables), VOIDS (Tully et al. 2019) and
// the S_STARS orbital elements (Gillessen et al. 2017, Table 3) and the
// SPIRAL_ARMS (Reid et al. 2019, Table 2). SGR_A_STAR uses the GRAVITY
// collaboration's 2022 mass and distance. MILKY_WAY_OBJECTS are from memory
// again; their longitudes were computed from J2000 equatorial positions.
// Everything else is close enough to look right, not to navigate by.

export const AU = 1.495978707e11;       // meters
export const LY = 9.4607304725808e15;
export const PC = 3.0856775814913673e16;
export const KM = 1000;
export const DAY_S = 86400;
export const YEAR_D = 365.25;
export const G_SI = 6.6743e-11;         // m^3 kg^-1 s^-2
export const C_SI = 299792458;          // m/s
export const SOLAR_MASS = 1.98892e30;   // kg
export const J2000_MS = Date.UTC(2000, 0, 1, 12);

export const SCALE_UNITS = [
  ['Gly', 1e9 * LY],
  ['Mly', 1e6 * LY],
  ['kly', 1e3 * LY],
  ['ly', LY],
  ['AU', AU],
  ['million km', 1e9],
  ['km', KM],
];

export const SUN = { name: 'Sun', radius: 695700 * KM, color: '#ffd76a' };

// a in meters, period in days, radius in meters, L0 (mean longitude at
// J2000), varpi (longitude of perihelion) in degrees, e eccentricity. Orbits
// are drawn in the ecliptic plane; inclination is ignored. Dwarf planets
// and selected large dwarf-planet candidates use JPL Horizons heliocentric
// elements at J2000.
export const PLANETS = [
  { name: 'Mercury', a: 0.387098 * AU, period: 87.969, radius: 2439.7 * KM, L0: 252.251, e: 0.20563593, varpi: 77.458, color: '#b5b1a8' },
  { name: 'Venus', a: 0.723332 * AU, period: 224.701, radius: 6051.8 * KM, L0: 181.980, e: 0.00677672, varpi: 131.602, color: '#e8cda0' },
  { name: 'Earth', a: 1.000000 * AU, period: 365.256, radius: 6371.0 * KM, L0: 100.464, e: 0.01671123, varpi: 102.938, color: '#6b9bd8',
    moons: [
      { name: 'Moon', a: 384400 * KM, period: 27.321661, radius: 1737.4 * KM, L0: 219.554, e: 0.0549, varpi: 83.353, color: '#c8c4bc' },
    ] },
  { name: 'Mars', a: 1.523679 * AU, period: 686.980, radius: 3389.5 * KM, L0: 355.453, e: 0.0933941, varpi: 336.056, color: '#d1693f',
    moons: [
      { name: 'Phobos', a: 9375 * KM, period: 0.3187, radius: 11.08 * KM, L0: 215.2, e: 0.015, varpi: 25.5, color: '#9b8b78' },
      { name: 'Deimos', a: 23457 * KM, period: 1.2625, radius: 6.2 * KM, L0: 259.3, color: '#aaa090' },
    ] },
  { name: 'Ceres', a: 2.7665 * AU, period: 1680.7, radius: 469.7 * KM, L0: 160.594, e: 0.07838, varpi: 154.417, color: '#a09a90', dwarf: true },
  { name: 'Jupiter', a: 5.2044 * AU, period: 4332.59, radius: 69911 * KM, L0: 34.404, e: 0.04838624, varpi: 14.728, color: '#d9b48a',
    ringColor: '#b8a58c',
    rings: [
      { name: 'Halo ring', inner: 92000 * KM, outer: 122500 * KM, alpha: 0.06 },
      { name: 'Main ring', inner: 122500 * KM, outer: 129000 * KM, alpha: 0.25 },
      { name: 'Amalthea gossamer ring', inner: 129000 * KM, outer: 182000 * KM, alpha: 0.04 },
      { name: 'Thebe gossamer ring', inner: 182000 * KM, outer: 226000 * KM, alpha: 0.03 },
    ],
    moons: [
      { name: 'Amalthea', a: 181400 * KM, period: 0.499918, radius: 83.5 * KM, L0: 53.6, e: 0.003, varpi: 103.0, color: '#b86f54' },
      { name: 'Io', a: 421800 * KM, period: 1.769138, radius: 1821.6 * KM, L0: 18.171, color: '#e0c66a' },
      { name: 'Europa', a: 671100 * KM, period: 3.551181, radius: 1560.8 * KM, L0: 212.687, color: '#d8cfc0' },
      { name: 'Ganymede', a: 1070400 * KM, period: 7.154553, radius: 2634.1 * KM, L0: 220.029, color: '#b8ada0' },
      { name: 'Callisto', a: 1882700 * KM, period: 16.689018, radius: 2410.3 * KM, L0: 79.188, color: '#8f8478' },
    ] },
  { name: 'Saturn', a: 9.5826 * AU, period: 10759.22, radius: 58232 * KM, L0: 49.944, e: 0.05386179, varpi: 92.599, color: '#e6d2a0',
    rings: [
      { name: 'D ring', inner: 66900 * KM, outer: 74510 * KM, alpha: 0.08 },
      { name: 'C ring', inner: 74658 * KM, outer: 92000 * KM, alpha: 0.25 },
      { name: 'B ring', inner: 92000 * KM, outer: 117580 * KM, alpha: 0.7 },
      { name: 'A ring', inner: 122170 * KM, outer: 133423 * KM, alpha: 0.5 },
      { name: 'A ring', inner: 133745 * KM, outer: 136485 * KM, alpha: 0.5 },
      { name: 'A ring', inner: 136530 * KM, outer: 136775 * KM, alpha: 0.5 },
      { name: 'F ring', inner: 140155 * KM, outer: 140205 * KM, alpha: 0.45 },
      { name: 'G ring', inner: 166000 * KM, outer: 175000 * KM, alpha: 0.06 },
      { name: 'E ring', inner: 180000 * KM, outer: 480000 * KM, alpha: 0.035 },
    ],
    moons: [
      { name: 'Mimas', a: 185539 * KM, period: 0.942, radius: 198.2 * KM, L0: 318.18, color: '#cfcac0' },
      { name: 'Enceladus', a: 237948 * KM, period: 1.37, radius: 252.1 * KM, L0: 311.943, color: '#f0f0f4' },
      { name: 'Tethys', a: 294619 * KM, period: 1.888, radius: 531.1 * KM, L0: 316.438, color: '#d8d4cc' },
      { name: 'Dione', a: 377396 * KM, period: 2.737, radius: 561.4 * KM, L0: 306.462, color: '#cfc8bc' },
      { name: 'Rhea', a: 527108 * KM, period: 4.518, radius: 763.8 * KM, L0: 181.668, color: '#c8c0b4' },
      { name: 'Titan', a: 1221870 * KM, period: 15.945, radius: 2574.7 * KM, L0: 137.084, color: '#d9a85a' },
      { name: 'Hyperion', a: 1481500 * KM, period: 21.276658, radius: 135 * KM, L0: 64.0, e: 0.105, varpi: 301.1, color: '#a99b87' },
      { name: 'Iapetus', a: 3560820 * KM, period: 79.32, radius: 734.5 * KM, L0: 217.368, color: '#9a9088' },
    ],
    // Janus and Epimetheus share one orbit and trade places every four
    // years (swaps in January 2006, 2010, ...; Janus took the inner orbit in
    // 2006). Masses from Jacobson et al. 2008, radii and the pair's mean
    // orbit from JPL's satellite tables; the pair's phase is a display
    // phase. The horseshoe between swaps is modeled in util.js.
    coorbitals: {
      a: 151450 * KM, period: 0.6945, L0: 120, phaseApprox: true, planetMass: 5.6834e26,
      swapEpoch: (Date.UTC(2006, 0, 21) - J2000_MS) / (DAY_S * 1000), swapInterval: 4 * YEAR_D,
      moons: [
        { name: 'Janus', mass: 1.8975e18, radius: 89.5 * KM, color: '#b8b0a4' },
        { name: 'Epimetheus', mass: 5.266e17, radius: 58.1 * KM, color: '#a8a096' },
      ],
    } },
  { name: 'Uranus', a: 19.2184 * AU, period: 30688.5, radius: 25362 * KM, L0: 313.232, e: 0.04725744, varpi: 170.954, color: '#9fd6dc',
    ringColor: '#9a9ca4',
    rings: [
      { name: '6 ring', inner: 41836.2 * KM, outer: 41837.8 * KM, alpha: 0.35 },
      { name: '5 ring', inner: 42233 * KM, outer: 42235 * KM, alpha: 0.35 },
      { name: '4 ring', inner: 42570 * KM, outer: 42572 * KM, alpha: 0.35 },
      { name: 'Alpha ring', inner: 44714.5 * KM, outer: 44721.5 * KM, alpha: 0.4 },
      { name: 'Beta ring', inner: 45657 * KM, outer: 45665 * KM, alpha: 0.4 },
      { name: 'Eta ring', inner: 47175.2 * KM, outer: 47176.8 * KM, alpha: 0.3 },
      { name: 'Gamma ring', inner: 47625.5 * KM, outer: 47628.5 * KM, alpha: 0.4 },
      { name: 'Delta ring', inner: 48297.5 * KM, outer: 48302.5 * KM, alpha: 0.4 },
      { name: 'Lambda ring', inner: 50022 * KM, outer: 50024 * KM, alpha: 0.25 },
      { name: 'Epsilon ring', inner: 51120 * KM, outer: 51178 * KM, alpha: 0.6 },
      { name: 'Nu ring', inner: 66100 * KM, outer: 69900 * KM, alpha: 0.04 },
      { name: 'Mu ring', inner: 86000 * KM, outer: 103000 * KM, alpha: 0.03 },
    ],
    moons: [
      { name: 'Puck', a: 86004 * KM, period: 0.761833, radius: 81 * KM, L0: 266.2, retrograde: true, color: '#9298a0' },
      { name: 'Miranda', a: 129900 * KM, period: 1.413, radius: 235.8 * KM, L0: 209.004, retrograde: true, color: '#c4c8d0' },
      { name: 'Ariel', a: 190900 * KM, period: 2.52, radius: 578.9 * KM, L0: 329.494, retrograde: true, color: '#d0d4dc' },
      { name: 'Umbriel', a: 266000 * KM, period: 4.144, radius: 584.7 * KM, L0: 281.463, retrograde: true, color: '#8c9098' },
      { name: 'Titania', a: 436300 * KM, period: 8.706, radius: 788.4 * KM, L0: 251.084, retrograde: true, color: '#b8bcc4' },
      { name: 'Oberon', a: 583500 * KM, period: 13.463, radius: 761.4 * KM, L0: 180.253, retrograde: true, color: '#a8acb4' },
    ] },
  { name: 'Neptune', a: 30.11 * AU, period: 60182, radius: 24622 * KM, L0: 304.880, e: 0.00859048, varpi: 44.965, color: '#5a7fd6',
    ringColor: '#9a9ca4',
    rings: [
      { name: 'Galle ring', inner: 40900 * KM, outer: 42900 * KM, alpha: 0.05 },
      { name: 'Le Verrier ring', inner: 53144 * KM, outer: 53256 * KM, alpha: 0.3 },
      { name: 'Lassell ring', inner: 53256 * KM, outer: 57200 * KM, alpha: 0.04 },
      { name: 'Arago ring', inner: 57200 * KM, outer: 57300 * KM, alpha: 0.15 },
      { name: 'Adams ring', inner: 62915 * KM, outer: 62950 * KM, alpha: 0.4 },
    ],
    moons: [
      { name: 'Proteus', a: 117647 * KM, period: 1.122, radius: 210.0 * KM, L0: 298.707, color: '#8890a0' },
      { name: 'Triton', a: 354760 * KM, period: 5.877, radius: 1353.4 * KM, L0: 141.227, retrograde: true, color: '#d8c8c0' },
      { name: 'Nereid', a: 5513900 * KM, period: 360.133039, radius: 170 * KM, L0: 112.998, e: 0.751, varpi: 256.3, color: '#aaa9a5' },
    ] },
  { name: 'Orcus', a: 39.2625223 * AU, period: 89859.8565, radius: 455 * KM, L0: 132.248, e: 0.225751, varpi: 342.208, color: '#aaa29a', dwarf: true,
    moons: [
      { name: 'Vanth', a: 8980 * KM, period: 9.5393, radius: 140 * KM, L0: 310, phaseApprox: true, color: '#8e8984' },
    ] },
  // Pluto and Charon circle a point between them, above Pluto's surface;
  // the elements are for that barycenter, which the small moons orbit.
  // Masses from New Horizons (Stern et al. 2015), from memory.
  { name: 'Pluto', a: 39.482 * AU, period: 90560, radius: 1188.3 * KM, L0: 238.93, e: 0.2488273, varpi: 224.069, color: '#c9b8a8', dwarf: true,
    mass: 1.303e22, binary: 'Charon',
    moons: [
      { name: 'Charon', a: 19591 * KM, period: 6.387, radius: 606.0 * KM, L0: 266.141, retrograde: true, color: '#a8a4a0', mass: 1.586e21 },
      { name: 'Styx', a: 43200 * KM, period: 20.16, radius: 5.2 * KM, L0: 320.6, e: 0.025, varpi: 322.5, retrograde: true, color: '#8e8a88' },
      { name: 'Nix', a: 49300 * KM, period: 24.85, radius: 18 * KM, L0: 9.6, e: 0.015, varpi: 31.4, retrograde: true, color: '#bab6b2' },
      { name: 'Kerberos', a: 58300 * KM, period: 32.17, radius: 6 * KM, L0: 262.5, e: 0.010, varpi: 346.4, retrograde: true, color: '#777472' },
      { name: 'Hydra', a: 65200 * KM, period: 38.20, radius: 18.5 * KM, L0: 228.6, e: 0.009, varpi: 253.6, retrograde: true, color: '#c4c0bc' },
    ] },
  { name: 'Máni', a: 41.6181413 * AU, period: 98066.9003, radius: 398 * KM, L0: 266.877, e: 0.149012, varpi: 70.112, color: '#9d8f82', dwarf: true },
  { name: 'Salacia', a: 42.2352204 * AU, period: 100256.0465, radius: 423 * KM, L0: 328.995, e: 0.102751, varpi: 232.231, color: '#807a74', dwarf: true,
    moons: [
      { name: 'Actaea', a: 5700 * KM, period: 5.49389, radius: 142 * KM, L0: 306.9, e: 0.008, varpi: 149.9, phaseApprox: true, color: '#aaa19a' },
    ] },
  { name: 'Haumea', a: 42.9093 * AU, period: 102665.6, radius: 780 * KM, L0: 192.119, e: 0.19992, varpi: 2.524, color: '#d8d4d0', dwarf: true,
    moons: [
      { name: 'Namaka', a: 25657 * KM, period: 18.2783, radius: 85 * KM, L0: 260, e: 0.249, varpi: 154, phaseApprox: true, color: '#aaa8a6' },
      { name: 'Hiʻiaka', a: 49880 * KM, period: 49.462, radius: 185 * KM, L0: 120, e: 0.0513, varpi: 202, phaseApprox: true, color: '#e2e0de' },
    ] },
  { name: 'Quaoar', a: 43.1330074 * AU, period: 103469.6634, radius: 547 * KM, L0: 251.821, e: 0.0395101, varpi: 352.865, color: '#b58e72', dwarf: true,
    moons: [
      { name: 'Weywot', a: 13329 * KM, period: 12.42727, radius: 85 * KM, L0: 70, e: 0.011, phaseApprox: true, color: '#8f7768' },
    ] },
  { name: 'Makemake', a: 45.3721 * AU, period: 111630.1, radius: 715 * KM, L0: 155.276, e: 0.16452, varpi: 15.556, color: '#c8a890', dwarf: true },
  { name: 'Varda', a: 45.5399356 * AU, period: 112250.1796, radius: 361 * KM, L0: 255.682, e: 0.146416, varpi: 8.693, color: '#a99080', dwarf: true,
    moons: [
      { name: 'Ilmarë', a: 4810 * KM, period: 5.75, radius: 163 * KM, L0: 20, phaseApprox: true, color: '#91867e' },
    ] },
  { name: 'Gonggong', a: 67.0512841 * AU, period: 200543.7246, radius: 615 * KM, L0: 278.020, e: 0.499574, varpi: 183.816, color: '#a95648', dwarf: true,
    moons: [
      { name: 'Xiangliu', a: 24021 * KM, period: 25.22073, radius: 100 * KM, L0: 190, e: 0.2908, phaseApprox: true, color: '#7d5d55' },
    ] },
  { name: 'Eris', a: 68.1399 * AU, period: 205447.3, radius: 1163 * KM, L0: 21.264, e: 0.43251, varpi: 186.973, color: '#e0e0e8', dwarf: true,
    moons: [
      { name: 'Dysnomia', a: 37273 * KM, period: 15.785899, radius: 350 * KM, L0: 45, e: 0.0062, phaseApprox: true, color: '#85858d' },
    ] },
  { name: 'Sedna', a: 549.8733 * AU, period: 4709690.2, radius: 500 * KM, L0: 92.951, e: 0.86098, varpi: 95.05, color: '#c86a50', dwarf: true },
];

export const BELTS = {
  asteroid: { inner: 2.2 * AU, outer: 3.2 * AU, count: 1500, seed: 1 },
  kuiper: { inner: 30 * AU, outer: 50 * AU, count: 2500, seed: 2 },
  oort: { inner: 2000 * AU, outer: 1.6 * LY, count: 4000, seed: 3 },
};

// Jupiter's Trojans: swarms leading (L4) and trailing (L5) Jupiter by 60
// degrees. Scatter is illustrative: sigma in longitude and in distance, with
// L4 the more populous swarm as observed.
export const TROJANS = { l4: { count: 900, seed: 11 }, l5: { count: 600, seed: 12 }, sigmaLon: 9, sigmaR: 0.25 * AU };

// Comets, from JPL's Small-Body Database (full-precision elements; Halley
// epoch 1968, Hale-Bopp 2022). Laid flat in the ecliptic like the planets:
// varpi is om + w, or om - w for the retrograde Halley; L0 is the mean
// longitude at J2000 from the time of perihelion tp.
export const COMETS = [
  { name: 'Halley', a: 17.92863504856923 * AU, e: 0.9679359956953211, period: 27728.04608790421, varpi: 306.858, L0: 240.967,
    retrograde: true, radius: 5.5 * KM, color: '#cfe8ff', note: 'last at perihelion in February 1986, next in July 2061' },
  { name: 'Hale\u2013Bopp', a: 177.4333839117583 * AU, e: 0.9949810027633206, period: 863279.5034870314, varpi: 53.148, L0: 53.568,
    radius: 30 * KM, color: '#cfe8ff', note: 'the great comet of 1997, visible to the eye for 18 months; back in about 4380' },
];

// Named asteroids beyond the belt scatter, from the same database (epoch
// 2026) and laid flat the same way. Radius is half the mean diameter.
export const ASTEROIDS = [
  { name: '16 Psyche', a: 2.925720466462538 * AU, e: 0.1349324738201893, period: 1827.87996016922, varpi: 20.008, L0: 358.132,
    radius: 111 * KM, color: '#c8c0b0', note: 'about 280 by 240 by 170 km, dense and metal-rich, perhaps the exposed core of a shattered protoplanet; NASA\u2019s Psyche arrives in 2029' },
  // JPL solution 240, epoch 2026-10-08, laid flat like the planets.
  { name: 'Didymos', a: 1.642709608529702 * AU, e: 0.3831233242624545, period: 769.0235207660371, varpi: 32.567, L0: 93.436,
    radius: 0.39 * KM, color: '#c8c0b0', note: 'a 780 m asteroid with a 150 m moon, Dimorphos, whose orbit DART shortened by 33 minutes in 2022, the first test of deflecting an asteroid; Hera arrives in December 2026 to survey the result' },
  // Earth's companions, on Earth-length years (epoch 2026, full-precision
  // SBDB elements). Seen turning with Earth, Cruithne traces a kidney each
  // year and Kamo\u02bboalewa a loop around Earth; over centuries planetary
  // pulls, not modeled here, slide them along Earth's orbit.
  { name: 'Cruithne', a: 0.9977971735251305 * AU, e: 0.5149036013028605, period: 364.0506668686161, varpi: 170.072, L0: 164.138,
    radius: 1.04 * KM, color: '#c8c0b0', companion: true,
    note: 'on a year just shorter than Earth\u2019s; seen from Earth it traces a kidney each year, and over 770 years a horseshoe along Earth\u2019s orbit' },
  { name: 'Kamo\u02bboalewa', a: 1.000810461656002 * AU, e: 0.1022388434937281, period: 365.7010283504758, varpi: 9.956, L0: 108.366,
    radius: 0.03 * KM, color: '#c8c0b0', companion: true,
    note: 'a quasi-moon, 40 to 100 m across: it circles the Sun, but seen from Earth it loops around us, never nearer than about 40 times the Moon\u2019s distance' },
];

// The two interstellar visitors, on open hyperbolic paths (full-precision
// SBDB elements): q perihelion distance, e eccentricity, tP perihelion in
// days after J2000, varpi as for comets (om - w when retrograde).
export const INTERSTELLAR = [
  { name: '\u02bbOumuamua', q: 0.2559115812959116 * AU, e: 1.201133796102373, tP: 6461.007, varpi: 142.786, retrograde: true,
    color: '#e8c8a8', note: 'the first known interstellar object, found in October 2017 after it passed the Sun; elongated, perhaps 100 m long, and nudged by something other than gravity' },
  { name: '2I/Borisov', q: 2.006520878500843 * AU, e: 3.356475782676596, tP: 7281.053, varpi: 157.271,
    color: '#cfe8ff', note: 'the first known interstellar comet, found in August 2019 by an amateur astronomer; richer in carbon monoxide than comets born here' },
  // JPL solution 54 (782 observations, 2025-2026), epoch 2026-02-19.
  { name: '3I/ATLAS', q: 1.356481057231181 * AU, e: 6.141351449317625, tP: 9432.995, varpi: 194.147, retrograde: true,
    color: '#d8e8d0', note: 'the third interstellar visitor, found in July 2025 and the fastest yet at 58 km/s; an active comet, perhaps older than the Sun, that passed the Sun in October 2025 and is on its way out' },
];

// Spacecraft whose paths come from JPL Horizons: scripts/fetch-spacecraft.mjs
// reads this list and writes the sampled tracks to spacecraft.js. `horizons`
// is the Horizons id, `step` the sample spacing in days, `from` an optional
// first date (Parker needs fine steps near the Sun, so only recent years are
// kept), `center` the body the track is relative to (Sun unless given),
// `trail` how many days of past
// path to draw. Escaping craft are extrapolated past the end of the
// ephemeris; the rest disappear there. Launch dates are Horizons' first
// ephemeris epoch; the notes are from memory.
export const SPACECRAFT = [
  { name: 'Voyager 1', horizons: -31, step: 30, escape: true, trail: Infinity,
    note: 'flew past Jupiter and Saturn; crossed the heliopause in August 2012, the first craft in interstellar space' },
  { name: 'Voyager 2', horizons: -32, step: 30, escape: true, trail: Infinity,
    note: 'the only craft to visit Uranus and Neptune; crossed the heliopause in November 2018' },
  { name: 'Pioneer 10', horizons: -23, step: 30, escape: true, trail: Infinity,
    note: 'the first craft through the asteroid belt and past Jupiter; silent since 2003' },
  { name: 'Pioneer 11', horizons: -24, step: 30, escape: true, trail: Infinity,
    note: 'flew past Jupiter and Saturn; silent since 1995' },
  { name: 'New Horizons', horizons: -98, step: 30, escape: true, trail: Infinity,
    note: 'flew past Pluto in 2015 and Arrokoth in 2019' },
  { name: 'Europa Clipper', horizons: -159, step: 10, trail: 180,
    note: 'bound for Jupiter and Europa, arriving 2030' },
  { name: 'JUICE', horizons: -28, step: 10, trail: 180,
    note: 'bound for Jupiter and Ganymede, arriving 2031' },
  { name: 'Psyche', horizons: -255, step: 10, trail: 180,
    note: 'bound for the metal-rich asteroid 16 Psyche, arriving 2029' },
  { name: 'Lucy', horizons: -49, step: 10, trail: 180,
    note: 'touring Jupiter\u2019s Trojan asteroids from 2027 to 2033' },
  { name: 'Hera', horizons: -91, step: 5, trail: 180,
    note: 'bound for Didymos and Dimorphos, the asteroid pair DART struck in 2022' },
  { name: 'BepiColombo', horizons: -121, step: 5, trail: 180,
    note: 'bound for orbit around Mercury, arriving November 2026' },
  { name: 'Parker Solar Probe', horizons: -96, step: 0.5, from: '2024-06-01', trail: 88,
    note: 'has passed about 6 million km from the Sun\u2019s surface, closer than anything else' },
  { name: 'Solar Orbiter', horizons: -144, step: 5, trail: 180,
    note: 'the first craft to image the Sun\u2019s poles' },
  { name: 'OSIRIS-APEX', horizons: -64, step: 10, trail: 180,
    note: 'returned samples of Bennu in 2023; now bound for Apophis, arriving 2029' },
  { name: 'JWST', horizons: -170, step: 2, center: 399, trail: 182,
    note: 'infrared telescope in a halo orbit around the Sun\u2013Earth L2 point' },
  { name: 'Euclid', horizons: -680, step: 2, center: 399, trail: 182,
    note: 'dark-energy survey telescope in a halo orbit around the Sun\u2013Earth L2 point' },
  { name: 'SOHO', horizons: -21, step: 2, center: 399, trail: 182,
    note: 'solar observatory in a halo orbit around the Sun\u2013Earth L1 point since 1996' },
  { name: 'DSCOVR', horizons: -78, step: 2, center: 399, trail: 182,
    note: 'watches the solar wind and the sunlit Earth from a Lissajous orbit around the Sun\u2013Earth L1 point' },
  { name: 'IMAP', horizons: -43, step: 2, center: 399, trail: 182,
    note: 'maps the heliosphere\u2019s boundary from a halo orbit around the Sun\u2013Earth L1 point' },
];

// Small bodies tracked from Horizons like the craft, because their close
// passes by Earth bend their orbits too much for fixed elements. Apophis
// has two tracks: a heliocentric one for the map, and an Earth-relative
// one at half-hour steps through the week of its 2029 flyby, drawn in
// Earth's frame, which stands in for the first while it runs.
export const NEAR_EARTH = [
  { name: 'Apophis', track: 'Apophis', horizons: '99942;', step: 2, from: '2015-01-01', to: '2045-01-01', trail: 200,
    kind: 'Asteroid', color: '#d8c8a8', flyby: 'Apophis flyby',
    note: 'a 340 m asteroid that passes 32,000 km above Earth on 13 April 2029, inside the ring of geostationary satellites, visible to the naked eye; OSIRIS-APEX follows it in to see what the pass did. Set the clock to that day' },
  { name: 'Apophis', track: 'Apophis flyby', horizons: '99942;', step: 1 / 48, center: 399, from: '2029-04-11', to: '2029-04-17', trail: 2,
    kind: 'Asteroid', color: '#d8c8a8',
    note: 'a 340 m asteroid passing 32,000 km above Earth on 13 April 2029, inside the ring of geostationary satellites; Earth\u2019s pull bends its path here and stretches it by tides' },
];

// Rings of our satellites around Earth: orbit radii from the center.
export const EARTH_RINGS = [
  { name: 'GPS orbits', radius: 26560 * KM, note: 'the navigation constellations circle here, 20,000 km up, twice a day' },
  { name: 'Geostationary ring', radius: 42164 * KM, note: 'satellites that keep pace with Earth\u2019s spin, 36,000 km up, so they hang over one spot on the equator' },
];

// The ISS, drawn face-on around Earth like the moons. Altitude and period
// are round values; the position along the orbit is illustrative, since a
// real one needs a fresh orbit solution every few days.
export const ISS = { name: 'ISS', a: 6798 * KM, period: 92.9 / 1440, radius: 0.05 * KM, L0: 0, color: '#e8f0ff',
  note: 'about 420 km up, once around every 93 minutes; crewed continuously since November 2000' };

// Where the Voyagers crossed the heliosphere's boundaries (NASA mission
// reports, from memory). The termination shock is drawn as a circle at the
// mean crossing. The heliopause is blunt toward the Sun's motion through
// the local cloud and stretched into a tail of unknown length behind; it is
// drawn as the textbook Rankine half-body (a flow past a source) through
// the crossings, its nose at the ecliptic longitude the interstellar wind
// blows from (IBEX, McComas et al. 2015), fading down the tail.
export const HELIOSPHERE = {
  nose: 255.7,
  terminationShock: { name: 'Termination shock', crossings: [['Voyager 1', 2004, 94 * AU], ['Voyager 2', 2007, 84 * AU]] },
  heliopause: { name: 'Heliopause', crossings: [['Voyager 1', 2012, 121.6 * AU, 259.6], ['Voyager 2', 2018, 119 * AU, 292.8]] },
};

// Star systems within about 16.7 light-years, transcribed from the
// Wikipedia list of nearest stars (Gaia-era distances). Distance in
// light-years; galactic l and b computed from the J2000 positions; types
// are the spectral types of the components, brown dwarfs L/T/Y and white
// dwarfs D; planets counts confirmed planets where the list gives any.
export const STARS = [
  { name: 'Proxima Centauri', dist: 4.25, l: 313.9, b: -1.9, types: ['M5.5V'], planets: 2 },
  { name: 'Alpha Centauri', dist: 4.34, l: 315.7, b: -0.7, types: ['G2V', 'K1V'] },
  { name: "Barnard's Star", dist: 5.96, l: 31.0, b: 14.1, types: ['M4V'], planets: 4 },
  { name: 'Luhman 16', dist: 6.51, l: 285.2, b: 5.3, types: ['L8', 'T1'] },
  { name: 'WISE 0855-0714', dist: 7.43, l: 235.0, b: 23.4, types: ['Y4'] },
  { name: 'Wolf 359', dist: 7.86, l: 244.1, b: 56.1, types: ['M6V'] },
  { name: 'Lalande 21185', dist: 8.3, l: 185.1, b: 65.4, types: ['M2V'], planets: 2 },
  { name: 'Sirius', dist: 8.71, l: 227.2, b: -8.9, types: ['A1V', 'DA2'] },
  { name: 'Gliese 65', dist: 8.77, l: 175.5, b: -75.7, types: ['M5.5V', 'M6V'] },
  { name: 'Ross 154', dist: 9.71, l: 11.3, b: -10.3, types: ['M3.5V'] },
  { name: 'Ross 248', dist: 10.31, l: 110.0, b: -16.9, types: ['M5.5V'] },
  { name: 'Epsilon Eridani', dist: 10.47, l: 195.8, b: -48.1, types: ['K2V'], planets: 1 },
  { name: 'Lacaille 9352', dist: 10.72, l: 5.1, b: -66.0, types: ['M0.5V'], planets: 4 },
  { name: 'Ross 128', dist: 11.01, l: 270.1, b: 59.6, types: ['M4V'], planets: 1 },
  { name: 'EZ Aquarii', dist: 11.11, l: 47.1, b: -57.0, types: ['M5V', 'M5V', 'M5V'] },
  { name: '61 Cygni', dist: 11.4, l: 82.3, b: -5.8, types: ['K5V', 'K7V'] },
  { name: 'Procyon', dist: 11.46, l: 213.7, b: 13.0, types: ['F5IV-V', 'DQZ'] },
  { name: 'Struve 2398', dist: 11.49, l: 89.3, b: 24.2, types: ['M3V', 'M3.5V'] },
  { name: 'Groombridge 34', dist: 11.62, l: 116.7, b: -18.4, types: ['M1.5V', 'M3.5V'], planets: 2 },
  { name: 'DX Cancri', dist: 11.68, l: 197.0, b: 32.4, types: ['M6.5V'] },
  { name: 'Epsilon Indi', dist: 11.87, l: 336.2, b: -48.0, types: ['K5V', 'T1', 'T6'], planets: 1 },
  { name: 'Tau Ceti', dist: 11.91, l: 173.1, b: -73.4, types: ['G8.5V'], planets: 4 },
  { name: 'GJ 1061', dist: 11.98, l: 251.9, b: -52.9, types: ['M5.5V'], planets: 3 },
  { name: 'YZ Ceti', dist: 12.12, l: 149.7, b: -78.8, types: ['M4.5V'], planets: 3 },
  { name: "Luyten's Star", dist: 12.35, l: 212.3, b: 10.4, types: ['M3.5V'], planets: 2 },
  { name: "Teegarden's Star", dist: 12.5, l: 160.3, b: -37.0, types: ['M6.5V'], planets: 3 },
  { name: "Kapteyn's Star", dist: 12.83, l: 250.5, b: -36.0, types: ['M1.5VI'] },
  { name: 'Lacaille 8760', dist: 12.95, l: 3.9, b: -44.3, types: ['M0V'] },
  { name: 'SCR 1845-6357', dist: 13.06, l: 331.5, b: -23.5, types: ['M8.5V', 'T6'] },
  { name: 'Kruger 60', dist: 13.07, l: 104.7, b: -0.0, types: ['M3V', 'M4V'] },
  { name: 'DENIS J1048-3956', dist: 13.19, l: 278.7, b: 17.1, types: ['M8.5V'] },
  { name: 'Ross 614', dist: 13.36, l: 212.9, b: -6.2, types: ['M4.5V', 'M5.5V'] },
  { name: 'UGPS J0722-0540', dist: 13.43, l: 221.5, b: 4.3, types: ['T9'] },
  { name: 'Wolf 1061', dist: 14.05, l: 3.4, b: 23.7, types: ['M3V'], planets: 3 },
  { name: "Van Maanen's Star", dist: 14.07, l: 121.9, b: -57.5, types: ['DZ7'] },
  { name: 'Gliese 1', dist: 14.17, l: 343.6, b: -75.9, types: ['M1.5V'] },
  { name: 'TZ Arietis', dist: 14.58, l: 147.7, b: -46.5, types: ['M4.5V'], planets: 1 },
  { name: 'Wolf 424', dist: 14.6, l: 288.8, b: 71.4, types: ['M5.5V', 'M7V'] },
  { name: 'Gliese 687', dist: 14.84, l: 98.6, b: 32.0, types: ['M3V'], planets: 2 },
  { name: 'Gliese 674', dist: 14.85, l: 343.0, b: -6.8, types: ['M3V'], planets: 1 },
  { name: 'LHS 292', dist: 14.87, l: 261.0, b: 41.3, types: ['M6.5V'] },
  { name: 'Gliese 440', dist: 15.12, l: 296.0, b: -2.9, types: ['DQ6'] },
  { name: 'GJ 1245', dist: 15.2, l: 78.9, b: 8.5, types: ['M5.5V', 'M6V', 'M5.5V'] },
  { name: 'WISE 1741+2553', dist: 15.22, l: 50.1, b: 26.1, types: ['T9'] },
  { name: 'Gliese 876', dist: 15.24, l: 52.0, b: -59.6, types: ['M3.5V'], planets: 4 },
  { name: 'WISE 1639-6847', dist: 15.34, l: 321.2, b: -14.5, types: ['Y0.5'] },
  { name: 'LHS 288', dist: 15.76, l: 288.2, b: -2.0, types: ['M5.5V'] },
  { name: 'GJ 1002', dist: 15.81, l: 92.5, b: -67.7, types: ['M5.5V'], planets: 2 },
  { name: 'DENIS 0255-4700', dist: 15.88, l: 260.6, b: -58.7, types: ['L7.5'] },
  { name: 'Groombridge 1618', dist: 15.89, l: 165.9, b: 52.1, types: ['K7V'] },
  { name: 'Gliese 412', dist: 16.0, l: 168.5, b: 63.1, types: ['M1V', 'M5.5V'] },
  { name: 'AD Leonis', dist: 16.19, l: 216.5, b: 54.6, types: ['M3V'] },
  { name: 'Gliese 832', dist: 16.2, l: 349.2, b: -46.3, types: ['M1.5V'], planets: 1 },
  { name: 'Gliese 682', dist: 16.33, l: 346.0, b: -6.6, types: ['M4V'] },
  { name: '40 Eridani', dist: 16.33, l: 200.8, b: -38.0, types: ['K0.5V', 'DA4', 'M4V'] },
  { name: 'EV Lacertae', dist: 16.48, l: 100.6, b: -13.1, types: ['M3.5V'] },
  { name: '70 Ophiuchi', dist: 16.71, l: 29.9, b: 11.4, types: ['K0V', 'K5V'] },
  { name: 'Altair', dist: 16.73, l: 47.7, b: -8.9, types: ['A7IV-V'] },
];

// The leading edge of Earth's radio broadcasts: the first scheduled
// broadcast, KDKA Pittsburgh's election-night program (from memory). Earlier
// spark and voice transmissions were weaker and sporadic.
export const RADIO = { start: Date.UTC(1920, 10, 2), first: 'KDKA Pittsburgh', date: '2 November 1920' };

// Close-up star systems, reached by clicking the star in the neighbourhood.
// Binary orbits are in the visual-binary convention used for S_STARS,
// transcribed from the Wikipedia orbit tables (which follow the published
// solutions); planets are from the NASA Exoplanet Archive (pscomppars),
// drawn face-on with an arbitrary display phase L0 because their tilts
// are unknown, and flagged `candidate` where the archive marks them
// controversial. Stellar masses and luminosities in solar units, planet
// masses in Earth masses, radii in meters. Epsilon Eridani's belts and the
// 40 Eridani A-BC separation are round numbers from memory.
// Mean longitude at J2000 of a transiting planet on a face-on circle about
// a star at galactic longitude l: at mid-transit (a JD) it lies toward the
// Sun, at l + 180 degrees.
function transitPhase(l, tTransit, period) {
  const L = l + 180 - 360 * (tTransit - 2451545.0) / period;
  return ((L % 360) + 360) % 360;
}
const SOL = SUN.radius;
const MJ = 0.000954;   // Jupiter masses in solar masses
export const STAR_SYSTEMS = [
  { id: 'proxima-centauri', name: 'Proxima Centauri', star: 'Proxima Centauri', radius: 0.07 * AU,
    host: { name: 'Proxima Centauri', mass: 0.1221, radius: 0.141 * SOL, type: 'M5.5V', luminosity: 0.00151 },
    planets: [
      { name: 'Proxima d', a: 0.02881 * AU, period: 5.12338, L0: 40, massEarth: 0.26 },
      { name: 'Proxima b', a: 0.04848 * AU, period: 11.18465, L0: 200, massEarth: 1.055 },
    ],
    caption: 'Proxima b and d on their measured orbit sizes and periods, drawn face-on; their tilts are unknown. The green band is a rough habitable zone.' },
  { id: 'barnards-star', name: "Barnard's Star", star: "Barnard's Star", radius: 0.06 * AU,
    host: { name: "Barnard's Star", mass: 0.162, radius: 0.185 * SOL, type: 'M4V', luminosity: 0.00355 },
    planets: [
      { name: 'Barnard d', a: 0.0188 * AU, period: 2.3402, e: 0.04, L0: 0, massEarth: 0.263 },
      { name: 'Barnard b', a: 0.0229 * AU, period: 3.1542, e: 0.03, L0: 100, massEarth: 0.299 },
      { name: 'Barnard c', a: 0.0274 * AU, period: 4.1244, e: 0.08, L0: 200, massEarth: 0.335 },
      { name: 'Barnard e', a: 0.0381 * AU, period: 6.7392, e: 0.04, L0: 300, massEarth: 0.193 },
    ],
    caption: 'Four planets lighter than Earth, all inside a tenth of Mercury’s orbit, found by radial velocity in 2024 and 2025 after a century of false alarms. Too close in for liquid water.' },
  { id: 'alpha-centauri', name: 'Alpha Centauri', star: 'Alpha Centauri', radius: 40 * AU,
    binary: { ra: 219.90206, dec: -60.83399,
      primary: { name: 'Alpha Centauri A', mass: 1.0788, radius: 1.223 * SOL, type: 'G2V', luminosity: 1.52 },
      secondary: { name: 'Alpha Centauri B', mass: 0.9092, radius: 0.864 * SOL, type: 'K1V' },
      orbit: { a: 23.299 * AU, e: 0.51947, i: 79.243, Omega: 205.073, omega: 231.519, tP: (1875.66 - 2000) * YEAR_D, period: 79.762 * YEAR_D } },
    caption: 'A and B circle each other every 80 years on an orbit tilted 79° to the sky, projected here onto the galactic plane. Proxima lies 13,000 AU away.' },
  { id: 'luhman-16', name: 'Luhman 16', star: 'Luhman 16', radius: 6 * AU,
    binary: { ra: 162.32821, dec: -53.31941,
      primary: { name: 'Luhman 16A', mass: 35.4 * MJ, radius: 0.1 * SOL, type: 'L7.5' },
      secondary: { name: 'Luhman 16B', mass: 29.4 * MJ, radius: 0.1 * SOL, type: 'T0.5' },
      orbit: { a: 3.52 * AU, e: 0.344, i: 79.92, Omega: 130.02, omega: 136.67, tP: (2018.060 - 2000) * YEAR_D, period: 26.55 * YEAR_D } },
    caption: 'Two brown dwarfs, 35 and 29 Jupiter masses, orbiting each other every 27 years. The third-nearest system to the Sun.' },
  { id: 'sirius', name: 'Sirius', star: 'Sirius', radius: 35 * AU,
    binary: { ra: 101.28716, dec: -16.71612,
      primary: { name: 'Sirius A', mass: 2.063, radius: 1.7144 * SOL, type: 'A1V', luminosity: 24.74 },
      secondary: { name: 'Sirius B', mass: 1.018, radius: 0.008098 * SOL, type: 'DA2' },
      orbit: { a: 19.8 * AU, e: 0.59142, i: 136.336, Omega: 45.400, omega: 149.161, tP: (1994.5715 - 2000) * YEAR_D, period: 50.1284 * YEAR_D } },
    caption: 'The brightest star in the night sky and its white dwarf companion, a Sun’s mass packed into an Earth-sized body, on a 50-year orbit. Bessel predicted it from the wobble in 1844.' },
  { id: 'epsilon-eridani', name: 'Epsilon Eridani', star: 'Epsilon Eridani', radius: 12 * AU,
    host: { name: 'Epsilon Eridani', mass: 0.82, radius: 0.759 * SOL, type: 'K2V', luminosity: 0.381 },
    planets: [{ name: 'Epsilon Eridani b', a: 3.53 * AU, period: 2680, e: 0.06, L0: 120, massEarth: 317.8 }],
    belts: [{ name: 'inner belt', inner: 2.5 * AU, outer: 3.5 * AU }, { name: 'outer ring', inner: 35 * AU, outer: 90 * AU }],
    caption: 'A young Sun-like star with a Jupiter-mass planet at 3.5 AU, an asteroid belt beside it, and a Kuiper-like ring at 35 to 90 AU, out beyond this view.' },
  { id: 'procyon', name: 'Procyon', star: 'Procyon', radius: 25 * AU,
    binary: { ra: 114.82550, dec: 5.22499,
      primary: { name: 'Procyon A', mass: 1.478, radius: 2.043 * SOL, type: 'F5IV-V', luminosity: 7.049 },
      secondary: { name: 'Procyon B', mass: 0.592, radius: 0.01234 * SOL, type: 'DQZ' },
      orbit: { a: 15.137 * AU, e: 0.39785, i: 31.408, Omega: 100.683, omega: 89.23, tP: (1968.076 - 2000) * YEAR_D, period: 40.840 * YEAR_D } },
    caption: 'A subgiant and its white dwarf companion on a 41-year orbit, the second such pair within a dozen light-years.' },
  { id: 'tau-ceti', name: 'Tau Ceti', star: 'Tau Ceti', radius: 2 * AU,
    host: { name: 'Tau Ceti', mass: 0.783, radius: 0.83 * SOL, type: 'G8.5V', luminosity: 0.495 },
    planets: [
      { name: 'Tau Ceti g', a: 0.133 * AU, period: 20.0, e: 0.06, L0: 10, massEarth: 1.75, candidate: true },
      { name: 'Tau Ceti h', a: 0.243 * AU, period: 49.41, e: 0.23, L0: 150, massEarth: 1.83, candidate: true },
      { name: 'Tau Ceti f', a: 1.334 * AU, period: 636.13, e: 0.16, L0: 260, massEarth: 3.93, candidate: true },
    ],
    caption: 'A Sun-like star with three candidate planets from radial velocities, still disputed, so their orbits are dashed. f sits at the outer edge of the habitable zone.' },
  { id: 'teegardens-star', name: "Teegarden's Star", star: "Teegarden's Star", radius: 0.12 * AU,
    host: { name: "Teegarden's Star", mass: 0.097, radius: 0.12 * SOL, type: 'M6.5V', luminosity: 0.00072 },
    planets: [
      { name: "Teegarden's Star b", a: 0.0259 * AU, period: 4.90634, e: 0.03, L0: 0, massEarth: 1.16 },
      { name: "Teegarden's Star c", a: 0.0455 * AU, period: 11.416, e: 0.04, L0: 130, massEarth: 1.05 },
      { name: "Teegarden's Star d", a: 0.0791 * AU, period: 26.13, e: 0.07, L0: 250, massEarth: 0.82 },
    ],
    caption: 'Three Earth-mass planets around an ultra-cool dwarf, the inner two inside a habitable zone only a few million kilometres across.' },
  { id: 'gliese-876', name: 'Gliese 876', star: 'Gliese 876', radius: 0.5 * AU,
    host: { name: 'Gliese 876', mass: 0.32, radius: 0.30 * SOL, type: 'M3.5V', luminosity: 0.0124 },
    planets: [
      { name: 'Gliese 876 d', a: 0.02080665 * AU, period: 1.93778, e: 0.207, L0: 0, massEarth: 6.83 },
      { name: 'Gliese 876 c', a: 0.12959 * AU, period: 30.0881, e: 0.25591, L0: 0, massEarth: 226.98 },
      { name: 'Gliese 876 b', a: 0.208317 * AU, period: 61.1166, e: 0.0324, L0: 0, massEarth: 723.22 },
      { name: 'Gliese 876 e', a: 0.3343 * AU, period: 124.26, e: 0.055, L0: 0, massEarth: 14.6 },
    ],
    caption: 'Four planets; c, b and e are locked in a 1:2:4 resonance with periods of 30, 61 and 124 days. Run the clock at a day per second to watch it.' },
  { id: '40-eridani', name: '40 Eridani', star: '40 Eridani', radius: 550 * AU,
    host: { name: '40 Eridani A', mass: 0.78, radius: 0.804 * SOL, type: 'K0.5V', luminosity: 0.4 },
    binary: { ra: 63.81800, dec: -7.65287,
      primary: { name: '40 Eridani B', mass: 0.558, radius: 0.01308 * SOL, type: 'DA4' },
      secondary: { name: '40 Eridani C', mass: 0.198, radius: 0.274 * SOL, type: 'M4.5V' },
      orbit: { a: 34.5 * AU, e: 0.4141, i: 107.98, Omega: 151.58, omega: 321.2, tP: (1848.7888 - 2000) * YEAR_D, period: 233.20 * YEAR_D },
      around: { a: 400 * AU, period: 8000 * YEAR_D, L0: 210 } },
    caption: 'Three kinds of star in one system: an orange dwarf, and 400 AU out a white dwarf and a red dwarf circling each other every 233 years. The A-BC orbit is a display circle; only its size and period are known.' },
  // Agol et al. 2021 via the NASA Exoplanet Archive. The planets transit,
  // so their phases are real: each is placed by its transit time, when it
  // lies between its star and the Sun.
  { id: 'trappist-1', name: 'TRAPPIST-1', star: 'TRAPPIST-1', radius: 0.075 * AU,
    host: { name: 'TRAPPIST-1', mass: 0.0898, radius: 0.1192 * SOL, type: 'M8V', luminosity: 10 ** -3.25727 },
    planets: [
      ['b', 1.510826, 0.01154, 1.374, 2457322.514193, 0.00622],
      ['c', 2.421937, 0.01580, 1.308, 2457282.8113871, 0.00654],
      ['d', 4.049219, 0.02227, 0.388, 2457670.1463014, 0.00837],
      ['e', 6.101013, 0.02925, 0.692, 2457660.3676621, 0.0051],
      ['f', 9.20754, 0.03849, 1.039, 2457671.3737299, 0.01007],
      ['g', 12.352446, 0.04683, 1.321, 2457665.3628439, 0.00208],
      ['h', 18.772866, 0.06189, 0.326, 2457662.5741486, 0.00567],
    ].map(([k, period, a, massEarth, tTransit, e]) => ({
      name: `TRAPPIST-1 ${k}`, a: a * AU, period, e, massEarth,
      L0: transitPhase(69.715, tTransit, period),
    })),
    caption: 'Seven Earth-sized planets, all far closer to their star than Mercury is to the Sun, their periods locked in ratios of 8:5, 5:3, 3:2, 3:2, 4:3 and 3:2. Placed by their transit times; three sit in the habitable zone.' },
  // Four giant planets photographed directly: orbit sizes and periods from
  // the Zurlo et al. 2016 fit (NASA Exoplanet Archive), masses from Marois
  // et al. 2008 and 2010. The orbits are tilted about 30 degrees to our view
  // and drawn face-on with display phases. The belts are round numbers
  // from memory (Su et al. 2009).
  { id: 'hr-8799', name: 'HR 8799', star: 'HR 8799', radius: 85 * AU,
    host: { name: 'HR 8799', mass: 1.51, radius: 1.49338 * SOL, type: 'A5V', luminosity: 10 ** 0.69197 },
    planets: [
      { name: 'HR 8799 e', a: 16.99 * AU, period: 20815.6, L0: 290, massEarth: 10 * 317.8 },
      { name: 'HR 8799 d', a: 26.97 * AU, period: 41627.54, L0: 200, massEarth: 10 * 317.8 },
      { name: 'HR 8799 c', a: 42.81 * AU, period: 83255.09, L0: 330, massEarth: 10 * 317.8 },
      { name: 'HR 8799 b', a: 67.96 * AU, period: 166510.17, L0: 60, massEarth: 7 * 317.8 },
    ],
    belts: [{ name: 'warm belt', inner: 6 * AU, outer: 15 * AU }, { name: 'cold belt', inner: 90 * AU, outer: 300 * AU }],
    caption: 'Four planets five to ten times Jupiter\u2019s mass, the first photographed around another star, their periods near 1:2:4:8. Between two dust belts, like a scaled-up solar system.' },
];

// Colliding-wind binary WR 140: a Wolf-Rayet star and an O supergiant on
// an 8-year orbit (Thomas et al. 2021: period, eccentricity, angles,
// periastron, masses, distance; a from Kepler's law). Near each periastron
// the winds collide and make dust, which flies out as a shell; JWST saw 17
// of them, out to about 70,000 AU (Lau et al. 2022). The shells here expand
// at the one speed that puts the 17th there; the dust really starts slower
// and accelerates (Han et al. 2022). Their shapes are schematic circles.
export const WR_140 = {
  name: 'WR 140', ra: 305.11657, dec: 43.85452, l: 80.930, b: 4.177, dist: 1518 * PC,
  primary: { name: 'WR 140 O star', type: 'O5.5fc', mass: 29.27, color: '#b4c6ff' },
  secondary: { name: 'WR 140 Wolf\u2013Rayet star', type: 'WC7pd', mass: 10.31, color: '#d8e0ff' },
  orbit: { a: 13.548 * AU, e: 0.8993, i: 119.07, Omega: 353.87, omega: 227.44, tP: 60636.23 - 51544.5, period: 2895.00 },
  shellSpeed: 70000 * AU / (17 * 2895.00),   // meters per day
  shellStart: 50 * AU,
  shellsShown: 20,
};

// S5-HVS1 (Koposov et al. 2020): an A star moving at 1,755 km/s from the
// galactic center, thrown out by Sgr A* about 4.8 million years ago,
// probably when a binary came too close and its partner was captured.
export const S5_HVS1 = { name: 'S5-HVS1', l: 337.436, b: -57.400, dist: 8629 * PC, speed: 1755, ejected: 4.8e6 };

// Hosts of close-up systems beyond the 16.7 light-year list above, drawn
// in the neighbourhood like its stars. TRAPPIST-1 from the NASA Exoplanet
// Archive (Gaia distance, galactic l and b as listed there).
export const SYSTEM_STARS = [
  { name: 'TRAPPIST-1', dist: 40.54, l: 69.715, b: -56.649, types: ['M8V'], planets: 7 },
  { name: 'HR 8799', dist: 134.52, l: 92.764, b: -35.575, types: ['A5V'], planets: 4 },
];

// The Local Bubble: the cavity of hot thin gas the Sun sits in, swept out
// by supernovae over the last 14 million years (Zucker et al. 2022). The
// nearby star-forming clouds lie on its shell; the shell between them is
// drawn at a schematic radius. Cloud distances (Zucker et al. 2020) and
// directions are from memory. Perseus is on the far shell but, with its
// latitude dropped, would pull the outline into a spike, so it is drawn
// as a cloud only.
export const LOCAL_BUBBLE = {
  radius: 490 * LY,   // about 150 pc, "at least 1000 light-years across"
  clouds: [
    { name: 'Ophiuchus', dist: 455, l: 353, b: 17 },
    { name: 'Pipe Nebula', dist: 530, l: 0, b: 5 },
    { name: 'Corona Australis', dist: 490, l: 0, b: -20 },
    { name: 'Perseus', dist: 960, l: 160, b: -20, outline: false },
    { name: 'Taurus', dist: 460, l: 172, b: -15 },
    { name: 'Chamaeleon', dist: 620, l: 300, b: -16 },
    { name: 'Musca', dist: 555, l: 301, b: -9 },
    { name: 'Lupus', dist: 520, l: 339, b: 15 },
  ],
};

// Naked-eye stars beyond the nearest-star list. Distance in light-years
// (Hipparcos-derived, rounded), galactic longitude in degrees, apparent
// magnitude, and a color class: b blue-white, w white, y yellow, o orange-red.
export const BRIGHT_STARS = [
  { name: 'Vega', dist: 25, l: 67.4, mag: 0.03, hue: 'w' },
  { name: 'Fomalhaut', dist: 25, l: 20.5, mag: 1.16, hue: 'w' },
  { name: 'Pollux', dist: 34, l: 192.2, mag: 1.14, hue: 'o' },
  { name: 'Denebola', dist: 36, l: 250.9, mag: 2.14, hue: 'w' },
  { name: 'Arcturus', dist: 37, l: 15.1, mag: -0.05, hue: 'o' },
  { name: 'Capella', dist: 43, l: 162.6, mag: 0.08, hue: 'y' },
  { name: 'Rasalhague', dist: 49, l: 35.9, mag: 2.08, hue: 'w' },
  { name: 'Castor', dist: 51, l: 187.4, mag: 1.58, hue: 'w' },
  { name: 'Aldebaran', dist: 65, l: 181.0, mag: 0.86, hue: 'o' },
  { name: 'Hamal', dist: 66, l: 144.6, mag: 2.0, hue: 'o' },
  { name: 'Alphecca', dist: 75, l: 41.9, mag: 2.23, hue: 'w' },
  { name: 'Regulus', dist: 79, l: 226.4, mag: 1.36, hue: 'b' },
  { name: 'Menkalinan', dist: 81, l: 167.5, mag: 1.9, hue: 'w' },
  { name: 'Mizar', dist: 83, l: 113.1, mag: 2.23, hue: 'w' },
  { name: 'Alioth', dist: 83, l: 122.2, mag: 1.76, hue: 'w' },
  { name: 'Gacrux', dist: 89, l: 300.2, mag: 1.63, hue: 'o' },
  { name: 'Algol', dist: 90, l: 149.0, mag: 2.12, hue: 'b' },
  { name: 'Diphda', dist: 96, l: 112.0, mag: 2.0, hue: 'o' },
  { name: 'Alpheratz', dist: 97, l: 111.7, mag: 2.06, hue: 'b' },
  { name: 'Alnair', dist: 101, l: 350.0, mag: 1.74, hue: 'b' },
  { name: 'Alkaid', dist: 104, l: 100.7, mag: 1.86, hue: 'b' },
  { name: 'Alhena', dist: 109, l: 196.8, mag: 1.93, hue: 'w' },
  { name: 'Dubhe', dist: 123, l: 142.8, mag: 1.79, hue: 'o' },
  { name: 'Algieba', dist: 130, l: 216.6, mag: 2.0, hue: 'o' },
  { name: 'Elnath', dist: 134, l: 178.0, mag: 1.65, hue: 'b' },
  { name: 'Achernar', dist: 139, l: 290.8, mag: 0.46, hue: 'b' },
  { name: 'Alphard', dist: 177, l: 241.5, mag: 2.0, hue: 'o' },
  { name: 'Peacock', dist: 179, l: 340.9, mag: 1.94, hue: 'b' },
  { name: 'Nunki', dist: 228, l: 9.5, mag: 2.05, hue: 'b' },
  { name: 'Bellatrix', dist: 250, l: 196.9, mag: 1.64, hue: 'b' },
  { name: 'Spica', dist: 250, l: 316.1, mag: 0.97, hue: 'b' },
  { name: 'Sargas', dist: 270, l: 347.1, mag: 1.86, hue: 'y' },
  { name: 'Mimosa', dist: 280, l: 302.5, mag: 1.25, hue: 'b' },
  { name: 'Canopus', dist: 310, l: 261.2, mag: -0.74, hue: 'w' },
  { name: 'Acrux', dist: 320, l: 300.1, mag: 0.77, hue: 'b' },
  { name: 'Hadar', dist: 390, l: 311.8, mag: 0.61, hue: 'b' },
  { name: 'Adhara', dist: 430, l: 239.8, mag: 1.5, hue: 'b' },
  { name: 'Polaris', dist: 433, l: 123.3, mag: 1.98, hue: 'y' },
  { name: 'Mirzam', dist: 500, l: 226.1, mag: 1.98, hue: 'b' },
  { name: 'Mirfak', dist: 510, l: 146.6, mag: 1.79, hue: 'y' },
  { name: 'Betelgeuse', dist: 550, l: 199.8, mag: 0.42, hue: 'o' },
  { name: 'Antares', dist: 550, l: 351.9, mag: 0.96, hue: 'o' },
  { name: 'Shaula', dist: 570, l: 351.7, mag: 1.62, hue: 'b' },
  { name: 'Rigel', dist: 860, l: 209.2, mag: 0.13, hue: 'b' },
];

// The black hole at the galactic center. Equatorial position in degrees
// (J2000) fixes how the sky at the center maps onto the galactic plane.
export const SGR_A_STAR = {
  name: 'Sgr A*',
  mass: 4.297e6 * SOLAR_MASS,
  distance: 8277 * PC,
  ra: 266.41683,
  dec: -29.00781,
};

// Stars orbiting Sgr A*, in the visual-binary convention: a in meters (from
// arcseconds at the distance above), i inclination, Omega longitude of the
// ascending node from north through east, omega argument of periapsis, all
// in degrees; tP periapsis passage in days after J2000; period in days.
function sStar(name, aArcsec, e, i, Omega, omega, tPYears, periodYears) {
  const a = aArcsec * (SGR_A_STAR.distance / PC) * AU;
  return { name, a, e, i, Omega, omega, tP: (tPYears - 2000) * YEAR_D, period: periodYears * YEAR_D };
}
export const S_STARS = [
  sStar('S2', 0.1255, 0.8839, 134.18, 226.94, 65.51, 2002.33, 16.00),
  sStar('S38', 0.1416, 0.8201, 171.1, 101.06, 17.99, 2003.19, 19.2),
  sStar('S55', 0.1078, 0.7209, 150.1, 325.5, 331.5, 2009.34, 12.80),
  sStar('S9', 0.2724, 0.644, 82.41, 156.60, 150.6, 1976.71, 51.3),
  sStar('S13', 0.2641, 0.4250, 24.70, 74.5, 245.2, 2004.86, 49.00),
  sStar('S1', 0.595, 0.556, 119.14, 342.04, 122.3, 2001.80, 166.0),
];

export const MILKY_WAY = {
  sunDistance: SGR_A_STAR.distance,   // Sun to galactic center
  circularSpeed: 236,                 // km/s at the Sun, Reid et al. 2019
  diskRadius: 50000 * LY,
  diskScaleLength: 8500 * LY,       // exponential disk, about 2.6 kpc
  bulgeRadius: 6000 * LY,
  barHalfLength: 16000 * LY,          // Wegg et al. 2015 long bar, about 5 kpc
  barAngle: 28,                       // degrees from the Sun-center line, near end at positive longitude
  seed: 4,
};

// Spiral arms as log spirals with a kink, fitted to maser parallaxes by Reid
// et al. 2019 (Table 2). beta is galactocentric azimuth in degrees, zero
// toward the Sun and increasing with galactic rotation; radii are kpc and
// the pitch angles, in degrees, apply inside and outside the kink. Their fit
// used R0 = 8.15 kpc; the arms are placed about the center as fitted, so the
// Sun here sits 0.13 kpc farther out than in their figure. labelBeta is
// where the name goes. extend is how far, in degrees of azimuth, each arm
// is continued beyond the fit: outward against rotation, then inward with
// it, as in their Figure 2; the continuation stops at the disk edge or
// inside the bar. The Local arm is a short spur and is barely extended.
export const SPIRAL_ARMS = [
  { name: 'Norma arm', beta: [5, 54], betaKink: 18, rKink: 4.46, pitchIn: -1.0, pitchOut: 19.5, width: 0.14, labelBeta: 35, extend: [100, 30] },
  { name: 'Scutum–Centaurus arm', beta: [0, 104], betaKink: 23, rKink: 4.91, pitchIn: 14.1, pitchOut: 12.1, width: 0.23, labelBeta: 60, extend: [250, 30] },
  { name: 'Sagittarius–Carina arm', beta: [2, 97], betaKink: 24, rKink: 6.04, pitchIn: 17.1, pitchOut: 1.0, width: 0.27, labelBeta: 2, extend: [140, 70] },
  { name: 'Local arm', beta: [-8, 34], betaKink: 9, rKink: 8.26, pitchIn: 11.4, pitchOut: 11.4, width: 0.31, labelBeta: -6, extend: [30, 30] },
  { name: 'Perseus arm', beta: [-23, 115], betaKink: 40, rKink: 8.87, pitchIn: 10.3, pitchOut: 8.7, width: 0.35, labelBeta: 25, extend: [130, 150] },
  { name: 'Outer arm', beta: [-16, 71], betaKink: 18, rKink: 12.24, pitchIn: 3.0, pitchOut: 9.4, width: 0.65, labelBeta: -30, extend: [160, 180] },
];

// Landmarks within the nearby arms. Distance in light-years, galactic l and
// b in degrees.
export const MILKY_WAY_OBJECTS = [
  { name: 'Hyades', dist: 153, l: 180.1, b: -22.3, kind: 'Open cluster', note: 'the nearest open cluster, the face of Taurus' },
  { name: 'Pleiades', dist: 444, l: 166.6, b: -23.5, kind: 'Open cluster', note: 'the Seven Sisters' },
  { name: 'Polaris', dist: 445, l: 123.3, b: 26.5, kind: 'Star', note: 'the North Star, a Cepheid variable' },
  { name: 'Vela pulsar', dist: 950, l: 263.6, b: -2.8, kind: 'Supernova remnant', note: 'neutron star spinning 11 times a second, born about 11,000 years ago' },
  { name: 'Orion Nebula', dist: 1344, l: 209.0, b: -19.4, kind: 'Emission nebula', note: 'the nearest massive star-forming region' },
  { name: 'Gaia BH1', dist: 1560, l: 23.7, b: 18.6, kind: 'Black hole', note: 'the nearest known black hole, 9.6 solar masses, orbited by a Sun-like star' },
  { name: 'Gaia BH3', dist: 1926, l: 51.7, b: -3.5, kind: 'Black hole', note: '33 solar masses, the most massive stellar black hole known in the galaxy' },
  { name: 'Lagoon Nebula', dist: 4100, l: 6.0, b: -1.2, kind: 'Emission nebula', note: 'star-forming cloud in the Sagittarius arm' },
  { name: 'Eagle Nebula', dist: 5700, l: 16.9, b: 0.8, kind: 'Emission nebula', note: 'home of the Pillars of Creation' },
  { name: 'Crab Nebula', dist: 6500, l: 184.6, b: -5.8, kind: 'Supernova remnant', note: 'remnant of the supernova seen in 1054' },
  { name: 'Cygnus X-1', dist: 7200, l: 71.3, b: 3.1, kind: 'Black hole', note: '21 solar masses, the first black hole identified, in 1971' },
  // The historical supernovae: positions from SIMBAD, distances from memory
  // of the remnant literature (each uncertain by a quarter or so).
  { name: 'SN 1006', dist: 7200, l: 327.4, b: 14.5, kind: 'Supernova remnant', note: 'remnant of the brightest supernova in recorded history, seen in 1006 from Egypt to Japan' },
  { name: 'Carina Nebula', dist: 7500, l: 287.7, b: -0.8, kind: 'Emission nebula', note: 'home of Eta Carinae' },
  { name: 'Tycho’s supernova', dist: 8500, l: 120.1, b: 1.4, kind: 'Supernova remnant', note: 'the new star of 1572, which Tycho Brahe showed lay beyond the Moon' },
  { name: 'Cassiopeia A', dist: 11000, l: 111.7, b: -2.1, kind: 'Supernova remnant', note: 'the youngest known remnant in the galaxy; its light reached Earth around 1680 and was hardly noticed' },
  { name: 'Westerlund 1', dist: 13000, l: 339.5, b: -0.4, kind: 'Super star cluster', note: 'the most massive young cluster known in the galaxy' },
  { name: 'Kepler’s supernova', dist: 16000, l: 4.5, b: 6.8, kind: 'Supernova remnant', note: 'the new star of 1604, the last supernova seen in the Milky Way' },
];

// The Arecibo message, sent toward M13 on 16 November 1974, travels at the
// speed of light with the clock. M13's position is the Harris catalog's.
export const ARECIBO_MESSAGE = { name: 'Arecibo message', sent: Date.UTC(1974, 10, 16), target: 'M 13', l: 59.01, b: 40.91, targetDist: 7100 * PC,
  note: '1,679 bits from the Arecibo telescope: our numbers, DNA, a figure, the solar system and the dish' };

// The Radcliffe Wave (Alves et al. 2020, Nature 578, 237; Extended Data
// Table 2): the centerline is the quadratic through three anchor points in
// heliocentric galactic X (toward the center) and Y (toward l = 90), in pc.
// The minus signs were lost in the PDF's table and are restored from the
// ends: Canis Major at l ~ 224, Cygnus at l ~ 80. width is the fitted
// scatter about the centerline; the vertical wave (amplitude 160 pc) is out
// of the plane and not drawn.
export const RADCLIFFE_WAVE = {
  anchors: [[-910, -860], [-270, 20], [290, 1400]], width: 62, amplitude: 160, length: 2700, count: 1400, seed: 21,
  note: 'a 9,000 ly ribbon of star-forming gas, from Canis Major through Orion, Perseus, Taurus and Cepheus to Cygnus. It rises and falls up to 520 ly out of the galactic plane, which this flat map cannot show',
};

// The Magellanic Stream, in Nidever et al. (2008) Magellanic Stream
// coordinates: a great circle with its pole at galactic (188.5, -7.5) and
// longitude zero at the LMC, decreasing along the trailing stream (to about
// -140) and increasing along the Leading Arm (to about +60). Distance along
// the tail follows the stellar stream's gradient of -0.5 kpc per degree
// (Chandra et al. 2023) from the LMC's 50 kpc; the Leading Arm's distance is
// poorly known and held at 50 kpc. sigmaB is the drawn width in degrees.
export const MAGELLANIC_STREAM = {
  pole: [188.5, -7.5], origin: [280.47, -32.75], tail: -140, leadingArm: 60,
  cloudsKpc: 50, gradientKpcPerDeg: 0.5, sigmaB: 3, count: 2400, seed: 22,
  note: 'gas torn from the Magellanic Clouds, trailing 200 degrees across the sky. Distances past the Clouds are uncertain',
};

// Distance in light-years from the Milky Way, galactic l and b in degrees.
// Size is a rough visual radius in light-years.
// Spirals with `inclination` and `pa` (position angle of the major axis,
// degrees) are drawn with their real tilt, rotated into the galactic plane
// from `ra`/`dec`; those without get an arbitrary in-plane angle. The
// orientations are the usual catalogue values from memory; M32 and M110
// distances follow McConnachie (2012), which puts them beyond M31 along
// the line of sight.
export const LOCAL_GROUP = [
  { name: 'Milky Way', dist: 0, l: 0, b: 0, size: 50000, spiral: true },
  { name: 'Andromeda (M31)', dist: 2540000, l: 121.2, b: -21.6, size: 76000, spiral: true, ra: 10.6847, dec: 41.2687, inclination: 77, pa: 35 },
  { name: 'M32', dist: 2630000, l: 121.15, b: -22.0, size: 4000 },
  { name: 'M110', dist: 2690000, l: 120.7, b: -21.1, size: 8500 },
  { name: 'Triangulum (M33)', dist: 2730000, l: 133.6, b: -31.3, size: 30000, spiral: true, ra: 23.4621, dec: 30.6599, inclination: 54, pa: 23 },
  { name: 'Large Magellanic Cloud', dist: 163000, l: 280.5, b: -32.9, size: 7000, spiral: true, ra: 80.8942, dec: -69.7561, inclination: 34.7, pa: 122.5 },
  { name: 'Small Magellanic Cloud', dist: 200000, l: 302.8, b: -44.3, size: 3500 },
  { name: 'Sagittarius Dwarf', dist: 70000, l: 5.6, b: -14.2, size: 3000 },
  { name: 'Draco', dist: 260000, l: 86.4, b: 34.7, size: 1000 },
  { name: 'Ursa Minor', dist: 225000, l: 105.0, b: 44.8, size: 1000 },
  { name: 'Sculptor', dist: 290000, l: 287.5, b: -83.2, size: 1500 },
  { name: 'Fornax', dist: 460000, l: 237.1, b: -65.7, size: 2500 },
  { name: 'Leo I', dist: 820000, l: 226.0, b: 49.1, size: 1500 },
  { name: 'Leo II', dist: 700000, l: 220.2, b: 67.2, size: 1000 },
  { name: 'NGC 6822', dist: 1600000, l: 25.3, b: -18.4, size: 4000 },
  { name: 'IC 10', dist: 2200000, l: 119.0, b: -3.3, size: 3000 },
  { name: 'IC 1613', dist: 2400000, l: 129.7, b: -60.6, size: 3500 },
  { name: 'NGC 185', dist: 2000000, l: 120.8, b: -14.5, size: 2000 },
  { name: 'NGC 147', dist: 2200000, l: 119.8, b: -14.3, size: 2000 },
  { name: 'WLM', dist: 3000000, l: 75.9, b: -73.6, size: 3000 },
];

// Notable galaxies beyond the Local Group, each with a story. Positions from
// SIMBAD; distances (ly) and sizes (radius, ly) from memory of the usual
// estimates. M87 carries the black hole the Event Horizon Telescope imaged.
export const GALAXIES = [
  { name: 'M82', dist: 11.5e6, l: 141.41, b: 40.57, size: 18000, kind: 'Starburst galaxy',
    note: 'the Cigar Galaxy, forming stars ten times faster than the Milky Way after a close pass by M81' },
  { name: 'M51', dist: 28e6, l: 104.85, b: 68.56, size: 38000, kind: 'Spiral galaxy', spiral: true,
    note: 'the Whirlpool, tugged by its companion NGC 5195; the first spiral structure ever seen, by Lord Rosse in 1845' },
  { name: 'M104', dist: 31e6, l: 298.46, b: 51.15, size: 25000, kind: 'Spiral galaxy', spiral: true,
    note: 'the Sombrero, a spiral seen almost edge-on through its dust lane, with a bulge and halo out of proportion to its disk' },
  { name: 'Antennae', dist: 45e6, l: 286.96, b: 42.46, size: 30000, kind: 'Colliding galaxies',
    note: 'NGC 4038 and 4039 in mid-collision, with tidal tails 500,000 ly long; distance estimates run from 45 to 70 million ly' },
  { name: 'M87', dist: 54.8e6, l: 283.78, b: 74.49, size: 60000, kind: 'Giant elliptical galaxy',
    note: 'the heart of the Virgo Cluster, with a 5,000 ly jet; home of the first black hole ever imaged. Click to see it',
    blackHole: { name: 'M87*', mass: 6.5e9 * SOLAR_MASS, distance: 16.8e6 * PC } },
  { name: 'NGC 4993', dist: 130e6, l: 308.38, b: 39.29, size: 12000, kind: 'Lenticular galaxy',
    note: 'where two neutron stars merged in 2017, GW170817, the first event seen in both gravitational waves and light' },
  { name: 'Stephan’s Quintet', dist: 290e6, l: 93.26, b: -20.99, size: 40000, kind: 'Galaxy group',
    note: 'four galaxies colliding, the fifth a foreground galaxy 40 million ly away; among the first images from JWST' },
  { name: 'Cygnus A', dist: 760e6, l: 76.19, b: 5.76, size: 40000, kind: 'Radio galaxy',
    note: 'the brightest radio galaxy in the sky, its twin jets ending in lobes 500,000 ly apart' },
];

// Close-up stops in the Local Group: centered on the mean position of the
// named members, reached by clicking any of them. radius in light-years.
export const LOCAL_GROUP_STOPS = [
  { id: 'andromeda', name: 'Andromeda', galaxies: ['Andromeda (M31)', 'M32', 'M110'], radius: 250000,
    caption: 'M31, the nearest big spiral, tilted 77° to our line of sight and projected onto the galactic plane. Its companions M32 and M110 sit beyond it here because their measured distances are a little larger.' },
  { id: 'magellanic-clouds', name: 'Magellanic Clouds', galaxies: ['Large Magellanic Cloud', 'Small Magellanic Cloud'], radius: 80000,
    caption: 'The Milky Way’s two brightest satellites: a barred dwarf spiral seen at 35°, and an irregular, 160,000 and 200,000 ly from the Sun.' },
  { id: 'triangulum', name: 'Triangulum', galaxies: ['Triangulum (M33)'], radius: 60000,
    caption: 'M33, the third-largest galaxy in the Local Group, a loosely wound spiral tilted 54° to the line of sight.' },
];

// Nearby galaxy groups and clusters. Distance in millions of light-years,
// galactic longitude in degrees, size a rough diameter in Mly, n the number
// of points drawn (a stand-in for richness).
// Galaxy groups and clusters. dist in Mly, size in Mly (diameter), n the
// number of dots drawn. The groups within 35 Mly and the Ursa Major, Fornax,
// Eridanus and Antlia clusters are from memory as described above. Every
// entry with an `abell` number, plus the Virgo Cluster, is transcribed from
// Richard Powell's "The Nearest Superclusters" table (Abell, Corwin & Olowin
// 1989; redshifts from Struble & Rood 1999; distances for H0 = 70 in the
// CMB frame). Powell lists supergalactic coordinates; l and b here are the
// same directions converted to galactic (SG pole at l = 47.37, b = +6.32;
// SGL = 0 at l = 137.37). size and n follow Abell richness class (0/1/2).
// `sc` is Powell's supercluster membership.
export const CLUSTERS = [
  { name: 'Local Group', dist: 0, l: 0, size: 6, n: 40 },
  { name: 'Sculptor Group', dist: 9, l: 343, size: 4, n: 40 },
  { name: 'Maffei Group', dist: 10.7, l: 138, size: 3, n: 30 },
  { name: 'M81 Group', dist: 12, l: 142, size: 4, n: 40 },
  { name: 'Centaurus A Group', dist: 12.5, l: 309.5, size: 5, n: 50 },
  { name: 'Canes Venatici I', dist: 14, l: 160, size: 5, n: 40 },
  { name: 'M101 Group', dist: 21, l: 102, size: 4, n: 30 },
  { name: 'NGC 1023 Group', dist: 33, l: 144, size: 4, n: 30 },
  { name: 'Leo I Group', dist: 35, l: 236, size: 5, n: 40 },
  { name: 'Virgo Cluster', dist: 52, l: 283.3, b: 73.9, size: 15, n: 400, sc: 'Virgo' },
  { name: 'Ursa Major Cluster', dist: 60, l: 145, size: 12, n: 120 },
  { name: 'Fornax Cluster', dist: 62, l: 237, size: 8, n: 120 },
  { name: 'Eridanus Cluster', dist: 75, l: 213, size: 8, n: 80 },
  { name: 'Antlia Cluster', dist: 130, l: 273, size: 8, n: 100 },
  { name: 'Centaurus Cluster', abell: 3526, dist: 142, l: 302.4, b: 21.6, size: 8, n: 90, sc: 'Centaurus' },
  { name: 'Abell 3565', abell: 3565, dist: 154, l: 313.5, b: 28.0, size: 11, n: 150, sc: 'Centaurus' },
  { name: 'Hydra Cluster', abell: 1060, dist: 158, l: 269.7, b: 26.5, size: 11, n: 150, sc: 'Hydra' },
  { name: 'Norma Cluster', abell: 3627, dist: 201, l: 325.4, b: -7.2, size: 11, n: 150 },
  { name: 'Abell 3574', abell: 3574, dist: 205, l: 317.4, b: 31.0, size: 8, n: 90, sc: 'Centaurus' },
  { name: 'Abell 262', abell: 262, dist: 209, l: 136.6, b: -25.1, size: 8, n: 90, sc: 'Perseus-Pisces' },
  { name: 'Abell 3742', abell: 3742, dist: 211, l: 352.5, b: -42.2, size: 8, n: 90, sc: 'Pavo-Indus' },
  { name: 'Perseus Cluster', abell: 426, dist: 231, l: 150.4, b: -13.4, size: 14, n: 250, sc: 'Perseus-Pisces' },
  { name: 'Abell 194', abell: 194, dist: 233, l: 142.2, b: -63.1, size: 8, n: 90 },
  { name: 'Abell 347', abell: 347, dist: 238, l: 141.2, b: -17.6, size: 8, n: 90, sc: 'Perseus-Pisces' },
  { name: 'Abell 3656', abell: 3656, dist: 246, l: 1.9, b: -29.4, size: 8, n: 90, sc: 'Pavo-Indus' },
  { name: 'Abell 3698', abell: 3698, dist: 260, l: 19.2, b: -33.3, size: 11, n: 150, sc: 'Pavo-Indus' },
  { name: 'Abell 569', abell: 569, dist: 262, l: 168.6, b: 22.9, size: 8, n: 90 },
  { name: 'Leo Cluster', abell: 1367, dist: 288, l: 234.8, b: 73.0, size: 14, n: 250, sc: 'Coma' },
  { name: 'Abell 779', abell: 779, dist: 300, l: 191.1, b: 44.4, size: 8, n: 90 },
  { name: 'Abell 3581', abell: 3581, dist: 301, l: 323.2, b: 32.9, size: 8, n: 90, sc: 'Centaurus' },
  { name: 'Coma Cluster', abell: 1656, dist: 303, l: 59.3, b: 88.1, size: 14, n: 250, sc: 'Coma' },
  { name: 'Abell 2870', abell: 2870, dist: 311, l: 294.9, b: -70.0, size: 8, n: 90, sc: 'Phoenix' },
  { name: 'Abell 400', abell: 400, dist: 320, l: 170.3, b: -44.9, size: 11, n: 150 },
  { name: 'Abell 2877', abell: 2877, dist: 324, l: 293.0, b: -70.9, size: 8, n: 90, sc: 'Phoenix' },
  { name: 'Abell 634', abell: 634, dist: 349, l: 159.4, b: 33.7, size: 8, n: 90 },
  { name: 'Abell 3389', abell: 3389, dist: 352, l: 274.7, b: -27.5, size: 8, n: 90 },
  { name: 'Abell 2666', abell: 2666, dist: 358, l: 106.7, b: -33.8, size: 8, n: 90 },
  { name: 'Abell 2806', abell: 2806, dist: 365, l: 306.1, b: -60.9, size: 8, n: 90, sc: 'Phoenix' },
  { name: 'Abell 539', abell: 539, dist: 375, l: 195.7, b: -17.7, size: 11, n: 150 },
  { name: 'Abell 2199', abell: 2199, dist: 395, l: 62.9, b: 43.7, size: 14, n: 250, sc: 'Hercules' },
  { name: 'Abell 2836', abell: 2836, dist: 397, l: 301.9, b: -69.5, size: 8, n: 90, sc: 'Phoenix' },
  { name: 'Abell 4038', abell: 4038, dist: 397, l: 25.3, b: -75.9, size: 14, n: 250 },
  { name: 'Abell 2197', abell: 2197, dist: 407, l: 64.9, b: 43.8, size: 11, n: 150, sc: 'Hercules' },
  { name: 'Abell 3747', abell: 3747, dist: 410, l: 357.6, b: -42.7, size: 8, n: 90 },
  { name: 'Abell 2634', abell: 2634, dist: 410, l: 103.4, b: -33.1, size: 11, n: 150 },
  { name: 'Abell 2731', abell: 2731, dist: 413, l: 313.9, b: -59.3, size: 8, n: 90, sc: 'Phoenix' },
  { name: 'Abell 1177', abell: 1177, dist: 418, l: 220.5, b: 66.2, size: 8, n: 90, sc: 'Leo' },
  { name: 'Abell 2896', abell: 2896, dist: 421, l: 274.8, b: -78.5, size: 8, n: 90, sc: 'Phoenix' },
  { name: 'Abell 3537', abell: 3537, dist: 424, l: 305.3, b: 30.4, size: 8, n: 90 },
  { name: 'Abell 1016', abell: 1016, dist: 426, l: 231.3, b: 52.5, size: 8, n: 90, sc: 'Leo' },
  { name: 'Abell 2162', abell: 2162, dist: 426, l: 48.4, b: 46.0, size: 8, n: 90, sc: 'Hercules' },
  { name: 'Abell 999', abell: 999, dist: 428, l: 227.9, b: 52.6, size: 8, n: 90, sc: 'Leo' },
  { name: 'Abell 1185', abell: 1185, dist: 430, l: 203.1, b: 67.8, size: 11, n: 150, sc: 'Leo' },
  { name: 'Abell 397', abell: 397, dist: 433, l: 161.9, b: -37.3, size: 8, n: 90 },
  { name: 'Abell 189', abell: 189, dist: 434, l: 139.4, b: -60.2, size: 11, n: 150 },
  { name: 'Abell 496', abell: 496, dist: 436, l: 209.5, b: -36.5, size: 11, n: 150 },
  { name: 'Abell 1267', abell: 1267, dist: 436, l: 208.9, b: 71.4, size: 8, n: 90, sc: 'Leo' },
  { name: 'Abell 3390', abell: 3390, dist: 441, l: 245.1, b: -21.0, size: 11, n: 150, sc: 'Columba' },
  { name: 'Abell 1314', abell: 1314, dist: 444, l: 151.9, b: 63.6, size: 8, n: 90 },
  { name: 'Abell 1257', abell: 1257, dist: 456, l: 183.5, b: 70.1, size: 8, n: 90, sc: 'Leo' },
  { name: 'Abell 1142', abell: 1142, dist: 463, l: 240.1, b: 59.2, size: 8, n: 90, sc: 'Leo' },
  { name: 'Abell 2052', abell: 2052, dist: 464, l: 9.4, b: 50.1, size: 8, n: 90, sc: 'Hercules-b' },
  { name: 'Abell 2147', abell: 2147, dist: 464, l: 28.8, b: 44.5, size: 11, n: 150, sc: 'Hercules-b' },
  { name: 'Abell 1228', abell: 1228, dist: 467, l: 186.9, b: 69.5, size: 11, n: 150, sc: 'Leo' },
  { name: 'Abell 2063', abell: 2063, dist: 468, l: 12.8, b: 49.7, size: 11, n: 150, sc: 'Hercules-b' },
  { name: 'Abell 3193', abell: 3193, dist: 474, l: 262.0, b: -47.2, size: 8, n: 90 },
  { name: 'Abell 3381', abell: 3381, dist: 476, l: 240.3, b: -22.7, size: 11, n: 150, sc: 'Columba' },
  { name: 'Abell 260', abell: 260, dist: 482, l: 137.3, b: -28.0, size: 11, n: 150 },
  { name: 'Abell 1836', abell: 1836, dist: 482, l: 329.0, b: 47.7, size: 8, n: 90 },
  { name: 'Hercules Cluster', abell: 2151, dist: 486, l: 31.6, b: 44.5, size: 14, n: 250, sc: 'Hercules-b' },
  { name: 'Abell 3570', abell: 3570, dist: 486, l: 314.8, b: 23.7, size: 8, n: 90, sc: 'Shapley' },
  { name: 'Abell 3664', abell: 3664, dist: 490, l: 313.0, b: -30.0, size: 11, n: 150 },
  { name: 'Abell 2995', abell: 2995, dist: 494, l: 210.6, b: -71.1, size: 11, n: 150 },
  { name: 'Abell 3575', abell: 3575, dist: 501, l: 317.5, b: 28.3, size: 8, n: 90, sc: 'Shapley' },
];

// Superclusters within about 500 Mly, from Powell's "A List of the Nearest
// Superclusters" (same conversion). size is his characteristic extent in
// Mly; members are Abell numbers, drawn where they appear in CLUSTERS.
export const SUPERCLUSTERS = [
  { name: 'Centaurus', dist: 194, l: 305.4, b: 30.6, size: 150, members: [1060, 3526, 3565, 3574, 3581] },
  { name: 'Perseus-Pisces', dist: 222, l: 143.6, b: -19.6, size: 100, members: [262, 347, 426] },
  { name: 'Pavo-Indus', dist: 235, l: 5.0, b: -36.0, size: 100, members: [3656, 3698, 3742] },
  { name: 'Coma', dist: 290, l: 235.2, b: 82.6, size: 100, members: [1367, 1656] },
  { name: 'Phoenix', dist: 372, l: 303.2, b: -68.7, size: 150, members: [2731, 2806, 2836, 2870, 2877, 2896] },
  { name: 'Hercules', dist: 413, l: 59.2, b: 45.0, size: 100, members: [2162, 2197, 2199] },
  { name: 'Leo', dist: 440, l: 216.0, b: 65.2, size: 150, members: [999, 1016, 1142, 1177, 1185, 1228, 1257, 1267] },
  { name: 'Shapley', dist: 507, l: 317.3, b: 29.1, size: 100, members: [3570, 3571, 3575, 3578] },
];

// The Local Void, from Tully et al. 2019 (Cosmicflows-3, arXiv 1905.08329):
// deepest density minimum at supergalactic [+22, -9, +22] Mpc, extent about
// 69 x 51 x 60 Mpc at the -0.7 isodensity contour, beginning 1 Mpc from the
// Local Group and bounded by the Perseus-Pisces and Norma-Pavo-Indus
// filaments. dist and size in Mly.
export const VOIDS = [
  { name: 'Local Void', dist: 106, l: 91.3, b: -11.6, size: 200,
    note: 'begins at the edge of the Local Group; bounded by the Perseus-Pisces and Norma-Pavo-Indus filaments' },
  // Kirshner et al. 1981; center RA 14h50m, Dec +46 converted to galactic.
  // Distance and diameter are the usual round values; quoted sizes vary with
  // how the edge is defined.
  { name: 'Bo\u00f6tes Void', dist: 700, l: 79.7, b: 59.9, size: 330,
    note: 'the \u201cGreat Nothing\u201d, one of the largest known voids, holding only a few dozen galaxies' },
];

// Great walls, as chains of waypoints (galactic l, b in degrees, distance in
// Mly) converted from equatorial positions, and drawn width in Mly. The CfA2
// wall follows Geller & Huchra's 1989 slice (Dec 26.5 to 32.5, RA 9h to
// 16.5h, through Coma, at about Coma's distance); the Sloan wall follows
// Gott et al. 2005 (RA 9.8h to 14.5h near the celestial equator, z 0.07 to
// 0.08). Waypoints are from memory of those papers and approximate; the
// South Pole Wall's are read from its paper's description.
export const GREAT_WALLS = [
  { name: 'CfA2 Great Wall', width: 12, length: 500, waypoints: [[195.8, 39.5, 300], [58.1, 88.0, 300], [49.3, 42.3, 300]],
    note: 'the first great wall found, in 1989: a sheet of galaxies 500 million ly long, passing through the Coma Cluster' },
  { name: 'Sloan Great Wall', width: 25, length: 1370, waypoints: [[238.8, 37.1, 1000], [288.5, 57.0, 1030], [346.7, 52.1, 1060]],
    note: 'a chain of superclusters 1.37 billion ly long, found in the Sloan Digital Sky Survey in 2003' },
  // Pomarède et al. 2020 (Cosmicflows-3, arXiv 2007.04414, section 3): near
  // galactic latitude -20, from Apus to Lepus over about 98 degrees of
  // longitude at 12,000 km/s, peaking at the celestial south pole in
  // Chamaeleon, then bending in to 7,000 km/s over 85 degrees to the Funnel
  // in Cetus; distances for their H0 = 75. It lies near the galactic plane,
  // so dropping latitude barely changes it.
  { name: 'South Pole Wall', width: 30, length: 1370, waypoints: [[320, -20, 522], [302.9, -27.1, 522], [222, -20, 522], [137, -20, 304]],
    note: 'found in 2020 from galaxy motions, 1.4 billion ly end to end, densest behind the celestial south pole where Milky Way dust hides it', honest: true },
];

// Distant landmarks, placed at their present (comoving) distance for the
// redshift given, with the Planck cosmology of www/v2/model.js (H0 = 67.4,
// Omega_m = 0.315); lookback in billions of years. Positions from J2000
// RA/Dec (Wikipedia infoboxes), redshifts from the discovery papers.
// Hercules-Corona Borealis is a clustering of gamma-ray bursts at z 1.6 to
// 2.1 (Horv\u00e1th et al. 2014); size is its major axis, and its reality
// is disputed.
export const DISTANT_OBJECTS = [
  { name: '3C 273', kind: 'Quasar', z: 0.158, l: 290.0, b: 64.4, dist: 2204, lookback: 2.05,
    note: 'the first quasar identified, and the brightest in our sky' },
  { name: 'TON 618', kind: 'Quasar', z: 2.219, l: 170.6, b: 83.4, dist: 18320, lookback: 10.84,
    note: 'powered by one of the most massive black holes known, around 40 billion solar masses' },
  { name: 'Earendel', kind: 'Star', z: 6.2, l: 155.3, b: -68.4, dist: 27738, lookback: 12.90,
    note: 'the most distant single star known, magnified thousands of times by a galaxy cluster in front of it; found by Hubble in 2022 in the Sunrise Arc' },
  { name: 'J0313\u22121806', kind: 'Quasar', z: 7.64, l: 205.1, b: -56.1, dist: 29411, lookback: 13.12,
    note: 'the most distant quasar known, its black hole already 1.6 billion solar masses' },
  { name: 'GN-z11', kind: 'Galaxy', z: 10.603, l: 126.0, b: 54.8, dist: 31816, lookback: 13.36,
    note: 'the record-holder from 2016 until JWST, found by Hubble' },
  { name: 'JADES-GS-z14-0', kind: 'Galaxy', z: 14.18, l: 223.6, b: -54.5, dist: 33719, lookback: 13.50,
    note: 'found by JWST in 2024, its redshift confirmed by ALMA' },
  { name: 'MoM-z14', kind: 'Galaxy', z: 14.44, l: 236.7, b: 42.1, dist: 33831, lookback: 13.51,
    note: 'the most distant galaxy confirmed, seen 280 million years after the Big Bang' },
];

export const HERCULES_CORONA_BOREALIS = { name: 'Hercules\u2013Corona Borealis Great Wall', z: [1.6, 2.1], l: 49.0, b: 35.5, dist: 16579, size: 10000,
  note: 'a clustering of gamma-ray bursts about 10 billion ly across, the largest structure claimed; disputed' };

// Notes shown while the view radius is inside an otherwise empty stretch,
// so the emptiness reads as real space rather than a rendering gap.
export const SIGNPOSTS = [
  { range: [800 * AU, 1500 * AU], text: 'Nothing out here but Sedna\u2019s orbit. The Voyagers, our farthest craft, are inside 200 AU; the Oort cloud, if real, begins near 2,000 AU.' },
  { range: [2 * LY, 3.6 * LY], text: 'The nearest star, Proxima Centauri, is 4.2 light-years away, just off the edge.' },
  { range: [4e6 * LY, 8e6 * LY], text: 'The Local Group is on its own out to about 10 million light-years, where the Maffei and M81 groups begin.' },
  { range: [200e9 * LY, Infinity], text: 'Beyond our horizon, as far as anyone can tell, more of the same: hundreds of times this volume at least, and perhaps without end.' },
];

// Distances here are comoving, from the Planck cosmology in www/v2/model.js
// (the same one DISTANT_OBJECTS use); a test recomputes them. The galaxies
// thin out from webFade toward firstGalaxies (z = 20); the dark ages run
// from there to the microwave background (z = 1089). lookbackRings pairs a
// lookback time in billions of years with the distance its light left from.
export const UNIVERSE = {
  radius: 46.133e9 * LY,      // comoving radius of the observable universe
  webFade: 20e9 * LY,
  firstGalaxies: { dist: 35.701e9 * LY, z: 20, sinceBigBang: '180 million years' },
  cmb: { dist: 45.219e9 * LY, z: 1089, sinceBigBang: '380,000 years' },
  // The horizon plus the event horizon: as the expansion accelerates, the
  // horizon grows toward this and never passes it.
  visibilityLimit: 62.813e9 * LY,
  eventHorizon: 16.680e9 * LY,
  lookbackRings: [[4, 4.643e9 * LY], [8, 11.193e9 * LY], [12, 22.690e9 * LY], [13, 28.469e9 * LY]],
  // Every power of ten in years, drawn at every scale. Up to a million
  // years the comoving distance is the light-travel distance to well under
  // a percent; the last two come from the same cosmology.
  lookbackPowers: [
    ...[1, 2, 3, 4, 5, 6, 7].map((k) => [10 ** k, 10 ** k * LY]),
    [1e8, 100.382e6 * LY], [1e9, 1035.72e6 * LY],
  ],
  webSeed: 5,
  // The top-level web: cells about as wide as real voids and supercluster
  // spacing, so at the universe scale it is a fine grain and resolves into
  // filaments only below a few Gly. The inner 6 Gly is a
  // denser zone of the same web, around the real cluster data.
  webCell: 0.35e9 * LY,
  webPoints: 1200000,
  landmarks: [
    // size is the diameter; the Milky Way lies near the edge of both.
    { name: 'Virgo Supercluster', dist: 54e6 * LY, l: 284, b: 74, size: 110e6 * LY },
    { name: 'Laniakea', dist: 250e6 * LY, l: 307, b: 9, size: 520e6 * LY },
  ],
};
