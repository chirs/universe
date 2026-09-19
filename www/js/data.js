// Hand-entered from standard references. Planetary elements: NASA JPL
// "Approximate Positions of the Planets" (Keplerian elements for 1800-2050);
// mean longitude L0 at J2000 from the same table. Radii: NASA planetary fact
// sheets. Nearest stars: RECONS 10 pc list; galactic coordinates rounded to
// a tenth of a degree. Local Group members: McConnachie (2012). Galaxy and
// supercluster sizes are round numbers from the usual encyclopedia values.
// Everything is close enough to look right, not to navigate by.

export const AU = 1.495978707e11;       // meters
export const LY = 9.4607304725808e15;
export const PC = 3.0856775814913673e16;
export const KM = 1000;
export const DAY_S = 86400;
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
// are drawn in the ecliptic plane; inclination is ignored.
export const PLANETS = [
  { name: 'Mercury', a: 0.387098 * AU, period: 87.969, radius: 2439.7 * KM, L0: 252.251, e: 0.20563593, varpi: 77.458, color: '#b5b1a8' },
  { name: 'Venus', a: 0.723332 * AU, period: 224.701, radius: 6051.8 * KM, L0: 181.980, e: 0.00677672, varpi: 131.602, color: '#e8cda0' },
  { name: 'Earth', a: 1.000000 * AU, period: 365.256, radius: 6371.0 * KM, L0: 100.464, e: 0.01671123, varpi: 102.938, color: '#6b9bd8' },
  { name: 'Mars', a: 1.523679 * AU, period: 686.980, radius: 3389.5 * KM, L0: 355.453, e: 0.0933941, varpi: 336.056, color: '#d1693f' },
  { name: 'Jupiter', a: 5.2044 * AU, period: 4332.59, radius: 69911 * KM, L0: 34.404, e: 0.04838624, varpi: 14.728, color: '#d9b48a' },
  { name: 'Saturn', a: 9.5826 * AU, period: 10759.22, radius: 58232 * KM, L0: 49.944, e: 0.05386179, varpi: 92.599, color: '#e6d2a0' },
  { name: 'Uranus', a: 19.2184 * AU, period: 30688.5, radius: 25362 * KM, L0: 313.232, e: 0.04725744, varpi: 170.954, color: '#9fd6dc' },
  { name: 'Neptune', a: 30.11 * AU, period: 60182, radius: 24622 * KM, L0: 304.880, e: 0.00859048, varpi: 44.965, color: '#5a7fd6' },
  { name: 'Pluto', a: 39.482 * AU, period: 90560, radius: 1188.3 * KM, L0: 238.93, e: 0.2488273, varpi: 224.069, color: '#c9b8a8', dwarf: true },
];

export const BELTS = {
  asteroid: { inner: 2.2 * AU, outer: 3.2 * AU, count: 1500, seed: 1 },
  kuiper: { inner: 30 * AU, outer: 50 * AU, count: 2500, seed: 2 },
  oort: { inner: 0.3 * LY, outer: 1.6 * LY, count: 4000, seed: 3 },
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
  { name: 'Ross 248', dist: 10.3, l: 110.0, b: -20.1 },
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

export const MILKY_WAY = {
  sunDistance: 26000 * LY,   // Sun to galactic center
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

export const UNIVERSE = {
  radius: 46.5e9 * LY,        // comoving radius of the observable universe
  webSeed: 5,
  webPoints: 9000,
  voids: 140,
  landmarks: [
    { name: 'Virgo Supercluster', dist: 54e6 * LY, l: 284, b: 74, size: 55e6 * LY },
    { name: 'Laniakea', dist: 250e6 * LY, l: 307, b: 9, size: 260e6 * LY },
  ],
};
