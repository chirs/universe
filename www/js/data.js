// Hand-entered from standard references. Planetary elements: NASA JPL
// "Approximate Positions of the Planets" (Keplerian elements for 1800-2050);
// mean longitude L0 at J2000 from the same table. Radii: NASA planetary fact
// sheets. Nearest stars: RECONS 10 pc list; galactic coordinates rounded to
// a tenth of a degree. Local Group members: McConnachie (2012). Galaxy and
// supercluster sizes are round numbers from the usual encyclopedia values.
// Moons: NASA fact sheets for sizes and orbits; the Moon's J2000 mean longitude
// and perigee from Meeus ch. 47, the Galilean mean longitudes from Lieske's E5
// theory (Meeus ch. 44) propagated to J2000. Saturn's moon phases are not
// epoch-accurate; their L0 values are placeholders. Ring radii from NASA's
// Saturnian rings fact sheet. Moons orbit in their planet's plane here, which
// is drawn as the ecliptic.
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
  { name: 'Earth', a: 1.000000 * AU, period: 365.256, radius: 6371.0 * KM, L0: 100.464, e: 0.01671123, varpi: 102.938, color: '#6b9bd8',
    moons: [
      { name: 'Moon', a: 384400 * KM, period: 27.321661, radius: 1737.4 * KM, L0: 218.316, e: 0.0549, varpi: 83.353, color: '#c8c4bc' },
    ] },
  { name: 'Mars', a: 1.523679 * AU, period: 686.980, radius: 3389.5 * KM, L0: 355.453, e: 0.0933941, varpi: 336.056, color: '#d1693f' },
  { name: 'Jupiter', a: 5.2044 * AU, period: 4332.59, radius: 69911 * KM, L0: 34.404, e: 0.04838624, varpi: 14.728, color: '#d9b48a',
    moons: [
      { name: 'Io', a: 421800 * KM, period: 1.769138, radius: 1821.6 * KM, L0: 17.46, color: '#e0c66a' },
      { name: 'Europa', a: 671100 * KM, period: 3.551181, radius: 1560.8 * KM, L0: 212.067, color: '#d8cfc0' },
      { name: 'Ganymede', a: 1070400 * KM, period: 7.154553, radius: 2634.1 * KM, L0: 219.371, color: '#b8ada0' },
      { name: 'Callisto', a: 1882700 * KM, period: 16.689018, radius: 2410.3 * KM, L0: 78.462, color: '#8f8478' },
    ] },
  { name: 'Saturn', a: 9.5826 * AU, period: 10759.22, radius: 58232 * KM, L0: 49.944, e: 0.05386179, varpi: 92.599, color: '#e6d2a0',
    rings: [
      { name: 'C ring', inner: 74500 * KM, outer: 92000 * KM, alpha: 0.25 },
      { name: 'B ring', inner: 92000 * KM, outer: 117580 * KM, alpha: 0.7 },
      { name: 'A ring', inner: 122170 * KM, outer: 136775 * KM, alpha: 0.5 },
    ],
    moons: [
      { name: 'Mimas', a: 185539 * KM, period: 0.942, radius: 198 * KM, L0: 40, color: '#cfcac0' },
      { name: 'Enceladus', a: 237948 * KM, period: 1.370, radius: 252 * KM, L0: 150, color: '#f0f0f4' },
      { name: 'Tethys', a: 294619 * KM, period: 1.888, radius: 531 * KM, L0: 260, color: '#d8d4cc' },
      { name: 'Dione', a: 377396 * KM, period: 2.737, radius: 561 * KM, L0: 15, color: '#cfc8bc' },
      { name: 'Rhea', a: 527108 * KM, period: 4.518, radius: 764 * KM, L0: 200, color: '#c8c0b4' },
      { name: 'Titan', a: 1221870 * KM, period: 15.945, radius: 2575 * KM, L0: 95, color: '#d9a85a' },
      { name: 'Iapetus', a: 3560820 * KM, period: 79.32, radius: 735 * KM, L0: 300, color: '#9a9088' },
    ] },
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
  { name: 'Diphda', dist: 96, l: 111.3, mag: 2.0, hue: 'o' },
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
  { name: 'Nunki', dist: 228, l: 13.3, mag: 2.05, hue: 'b' },
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
