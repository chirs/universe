import { LOCAL_GROUP, CLUSTERS } from '../js/data.js';
import { galacticPosition, HORIZON } from './model.js';

const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
export const GALAXIES = LOCAL_GROUP.map(g => ({
  id: slug(g.name), name: g.name, type: g.spiral ? 'Spiral galaxy' : 'Dwarf galaxy',
  position: galacticPosition(g.l, g.b, g.dist / 1e6), radius: g.size / 1e6,
  distance: g.dist / 1e6, group: 'Local Group', spiral: !!g.spiral,
  note: 'Approximate catalog position. Size and appearance are schematic; galaxy orientations are illustrative.',
  source: 'https://arxiv.org/abs/1204.1562',
}));
const milkyWay = GALAXIES[0];
milkyWay.position = galacticPosition(0, 0, 0.026);
milkyWay.distance = 0.026;
milkyWay.note = 'Our galaxy, seen from outside. The Sun is about 26,000 light-years from its center. Spiral arms are schematic.';

// Entries with no latitude cannot be placed in a 3D atlas without inventing depth.
export const GROUPS = CLUSTERS.filter(c => Number.isFinite(c.b)).map(c => ({
  id: slug(c.name), name: c.name, type: 'Galaxy cluster', position: galacticPosition(c.l, c.b, c.dist),
  radius: c.size / 2, distance: c.dist, group: c.sc ? `${c.sc} region` : 'Nearby universe',
  note: 'Catalogued cluster center. The surrounding cloud illustrates its approximate extent; its particles are not individual measured galaxies.',
  source: 'https://www.atlasoftheuniverse.com/nearsc.html',
}));
export const CATALOG = [...GALAXIES, ...GROUPS];
const virgo = GROUPS.find(c => c.name === 'Virgo Cluster');
const andromeda = GALAXIES.find(g => g.name.startsWith('Andromeda'));
export const STOPS = [
  { id: 'universe', name: 'Observable universe', short: 'Universe', radius: HORIZON * 1.2, center: [0, 0, 0],
    eyebrow: '01 / THE WIDEST VIEW', title: 'Everything we can see.',
    text: 'Look outward into the past. Turn the cutaway, then zoom inward to find our galaxy.',
    key: 'Illustrative cosmic structure', detail: 'A diagram of our observable volume. The outer bands show earlier cosmic eras; they are not walls in space.' },
  { id: 'web', name: 'Nearby cosmic web', short: 'Cosmic web', radius: 1800, center: [0, 0, 0],
    eyebrow: '02 / THE COSMIC WEB', title: 'Space has a structure.',
    text: 'Filaments surround broad gaps. Rotate to see how a strand can disappear behind another.',
    key: 'Illustrative web · catalogued cluster centers', detail: 'The web is a seeded 3D illustration. Named clusters are approximate catalog positions; this is not a complete survey.' },
  { id: 'virgo', name: 'Virgo neighborhood', short: 'Virgo', radius: 68, center: virgo.position.map(v => v / 2),
    eyebrow: '03 / OUR LARGER NEIGHBORHOOD', title: 'One small group among many.',
    text: 'Virgo is our nearest large galaxy cluster. Our Local Group lies outside it, across the intervening space.',
    key: 'Selected catalog centers · illustrative extents', detail: 'This draft includes Virgo and selected clusters. Missing nearby groups will be added from a catalog with complete 3D positions; empty areas here are not necessarily voids.' },
  { id: 'local-group', name: 'Local Group', short: 'Local Group', radius: 3.2, center: andromeda.position.map(v => v / 2),
    eyebrow: '04 / THE LOCAL GROUP', title: 'Meet the neighbors.',
    text: 'The Milky Way, Andromeda, Triangulum, and their smaller neighbors. Rotate to discover the depth between them.',
    key: '18 galaxies · approximate catalog positions', detail: 'Galactic latitude is retained. Dots have a minimum visible size; the 3D distances are not stretched to make objects fit.' },
  { id: 'home', name: 'Milky Way & satellites', short: 'Home', radius: 0.48, center: [...milkyWay.position],
    eyebrow: '05 / HOME', title: 'Our island of stars.',
    text: 'The Milky Way and its satellite neighborhood. This is where the journey inward ends.',
    key: 'Catalogued companions · schematic galaxy disk', detail: 'The disk follows the galactic plane. Its spiral structure is illustrative. Explore the solar system in the original 2D version.' },
];
export function nearestStop(radius) {
  return STOPS.reduce((best, stop) => Math.abs(Math.log(radius / stop.radius)) < Math.abs(Math.log(radius / best.radius)) ? stop : best);
}
