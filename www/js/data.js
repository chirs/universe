// Written by a model from memory of the references named below, not
// transcribed from them -- see AGENTS.md. Planetary elements: NASA JPL
// "Approximate Positions of the Planets" (Keplerian elements for 1800-2050);
// mean longitude L0 at J2000 from the same table. Radii: NASA planetary fact
// sheets. Nearest stars: RECONS 10 pc list; galactic coordinates rounded to
// a tenth of a degree. Local Group members: McConnachie (2012). Galaxy and
// supercluster sizes are round numbers from the usual encyclopedia values.
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
// the S_STARS orbital elements (Gillessen et al. 2017, Table 3). SGR_A_STAR
// uses the GRAVITY collaboration's 2022 mass and distance.
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
    moons: [
      { name: 'Amalthea', a: 181400 * KM, period: 0.499918, radius: 83.5 * KM, L0: 53.6, e: 0.003, varpi: 103.0, color: '#b86f54' },
      { name: 'Io', a: 421800 * KM, period: 1.769138, radius: 1821.6 * KM, L0: 18.171, color: '#e0c66a' },
      { name: 'Europa', a: 671100 * KM, period: 3.551181, radius: 1560.8 * KM, L0: 212.687, color: '#d8cfc0' },
      { name: 'Ganymede', a: 1070400 * KM, period: 7.154553, radius: 2634.1 * KM, L0: 220.029, color: '#b8ada0' },
      { name: 'Callisto', a: 1882700 * KM, period: 16.689018, radius: 2410.3 * KM, L0: 79.188, color: '#8f8478' },
    ] },
  { name: 'Saturn', a: 9.5826 * AU, period: 10759.22, radius: 58232 * KM, L0: 49.944, e: 0.05386179, varpi: 92.599, color: '#e6d2a0',
    rings: [
      { name: 'C ring', inner: 74500 * KM, outer: 92000 * KM, alpha: 0.25 },
      { name: 'B ring', inner: 92000 * KM, outer: 117580 * KM, alpha: 0.7 },
      { name: 'A ring', inner: 122170 * KM, outer: 136775 * KM, alpha: 0.5 },
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
    ] },
  { name: 'Uranus', a: 19.2184 * AU, period: 30688.5, radius: 25362 * KM, L0: 313.232, e: 0.04725744, varpi: 170.954, color: '#9fd6dc',
    moons: [
      { name: 'Puck', a: 86004 * KM, period: 0.761833, radius: 81 * KM, L0: 266.2, retrograde: true, color: '#9298a0' },
      { name: 'Miranda', a: 129900 * KM, period: 1.413, radius: 235.8 * KM, L0: 209.004, retrograde: true, color: '#c4c8d0' },
      { name: 'Ariel', a: 190900 * KM, period: 2.52, radius: 578.9 * KM, L0: 329.494, retrograde: true, color: '#d0d4dc' },
      { name: 'Umbriel', a: 266000 * KM, period: 4.144, radius: 584.7 * KM, L0: 281.463, retrograde: true, color: '#8c9098' },
      { name: 'Titania', a: 436300 * KM, period: 8.706, radius: 788.4 * KM, L0: 251.084, retrograde: true, color: '#b8bcc4' },
      { name: 'Oberon', a: 583500 * KM, period: 13.463, radius: 761.4 * KM, L0: 180.253, retrograde: true, color: '#a8acb4' },
    ] },
  { name: 'Neptune', a: 30.11 * AU, period: 60182, radius: 24622 * KM, L0: 304.880, e: 0.00859048, varpi: 44.965, color: '#5a7fd6',
    moons: [
      { name: 'Proteus', a: 117647 * KM, period: 1.122, radius: 210.0 * KM, L0: 298.707, color: '#8890a0' },
      { name: 'Triton', a: 354760 * KM, period: 5.877, radius: 1353.4 * KM, L0: 141.227, retrograde: true, color: '#d8c8c0' },
      { name: 'Nereid', a: 5513900 * KM, period: 360.133039, radius: 170 * KM, L0: 112.998, e: 0.751, varpi: 256.3, color: '#aaa9a5' },
    ] },
  { name: 'Orcus', a: 39.2625223 * AU, period: 89859.8565, radius: 455 * KM, L0: 132.248, e: 0.225751, varpi: 342.208, color: '#aaa29a', dwarf: true,
    moons: [
      { name: 'Vanth', a: 8980 * KM, period: 9.5393, radius: 140 * KM, L0: 310, phaseApprox: true, color: '#8e8984' },
    ] },
  { name: 'Pluto', a: 39.482 * AU, period: 90560, radius: 1188.3 * KM, L0: 238.93, e: 0.2488273, varpi: 224.069, color: '#c9b8a8', dwarf: true,
    moons: [
      { name: 'Charon', a: 19591 * KM, period: 6.387, radius: 606.0 * KM, L0: 266.141, retrograde: true, color: '#a8a4a0' },
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

// Distance in light-years, galactic longitude and latitude in degrees.
export const STARS = [
  { name: 'Proxima Centauri', dist: 4.25, l: 313.9, b: -1.9 },
  { name: 'Alpha Centauri', dist: 4.37, l: 315.7, b: -0.7 },
  { name: "Barnard's Star", dist: 5.96, l: 31.0, b: 14.1 },
  { name: 'Wolf 359', dist: 7.86, l: 244.1, b: 56.1 },
  { name: 'Lalande 21185', dist: 8.31, l: 185.1, b: 65.4 },
  { name: 'Sirius', dist: 8.60, l: 227.2, b: -8.9, bright: true },
  { name: 'Luyten 726-8', dist: 8.73, l: 175.5, b: -75.7 },
  { name: 'Ross 154', dist: 9.70, l: 11.3, b: -10.3 },
  { name: 'Ross 248', dist: 10.3, l: 110.0, b: -16.9 },
  { name: 'Epsilon Eridani', dist: 10.5, l: 195.8, b: -48.1, bright: true },
  { name: 'Lacaille 9352', dist: 10.7, l: 5.1, b: -66.0 },
  { name: 'Ross 128', dist: 11.0, l: 270.1, b: 59.6 },
  { name: '61 Cygni', dist: 11.4, l: 82.3, b: -5.8 },
  { name: 'Procyon', dist: 11.5, l: 213.7, b: 13.0, bright: true },
  { name: 'Struve 2398', dist: 11.5, l: 89.3, b: 24.2 },
  { name: 'Groombridge 34', dist: 11.6, l: 116.7, b: -18.4 },
  { name: 'Epsilon Indi', dist: 11.9, l: 336.2, b: -48.0 },
  { name: 'Tau Ceti', dist: 11.9, l: 173.1, b: -73.4, bright: true },
  { name: "Luyten's Star", dist: 12.3, l: 212.3, b: 10.4 },
  { name: "Kapteyn's Star", dist: 12.8, l: 250.5, b: -36.0 },
  { name: 'Altair', dist: 16.7, l: 47.7, b: -8.9, bright: true },
];

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
  diskRadius: 50000 * LY,
  bulgeRadius: 6000 * LY,
  arms: 4,
  pitch: 12,                 // degrees
  seed: 4,
};

// Distance in light-years from the Milky Way, galactic l and b in degrees.
// Size is a rough visual radius in light-years.
export const LOCAL_GROUP = [
  { name: 'Milky Way', dist: 0, l: 0, b: 0, size: 50000, spiral: true },
  { name: 'Andromeda (M31)', dist: 2540000, l: 121.2, b: -21.6, size: 110000, spiral: true },
  { name: 'Triangulum (M33)', dist: 2730000, l: 133.6, b: -31.3, size: 30000, spiral: true },
  { name: 'Large Magellanic Cloud', dist: 163000, l: 280.5, b: -32.9, size: 7000 },
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
];

// Notes shown while the view radius is inside an otherwise empty stretch,
// so the emptiness reads as real space rather than a rendering gap.
export const SIGNPOSTS = [
  { range: [220 * AU, 1000 * AU], text: 'Nothing out here but Sedna\u2019s orbit. The Kuiper belt ends near 50 AU; the Oort cloud, if it is there, begins around 2,000 AU.' },
  { range: [2 * LY, 3.6 * LY], text: 'The nearest star, Proxima Centauri, is 4.2 light-years away, just off the edge.' },
  { range: [4e6 * LY, 8e6 * LY], text: 'The Local Group is on its own out to about 10 million light-years, where the Maffei and M81 groups begin.' },
];

export const UNIVERSE = {
  radius: 46.5e9 * LY,        // comoving radius of the observable universe
  webSeed: 5,
  webPoints: 20000,
  voids: 140,
  landmarks: [
    { name: 'Virgo Supercluster', dist: 54e6 * LY, l: 284, b: 74, size: 55e6 * LY },
    { name: 'Laniakea', dist: 250e6 * LY, l: 307, b: 9, size: 260e6 * LY },
  ],
};
