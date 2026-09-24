// A layer is { name, range: [lo, hi] in view-radius meters, draw(ctx, view, alpha, days) }.
// view = { w, h, cx, cy, mpp, radius, sx(x), sy(y), hits, labels }.

import {
  oortCloud, heliosphere, kuiperBelt, asteroidBelt, trojans, solarSystem, smallBodies, interstellar,
  spacecraft, moons, coorbitals, earthOrbiters, sunDot,
} from './scenes/solar.js';
import {
  fieldStars, localBubble, radioSphere, areciboMessage, brightStars, nearestStars, starSystems, scoCen,
} from './scenes/stars.js';
import {
  magellanicStream, sgrStream, localGroup, milkyWay, dust, hiiRegions, globularClusters, nuclearCluster,
  nucleus, hypervelocityStar, radcliffeWave, galacticObjects, wr140,
} from './scenes/galaxy.js';
import {
  cosmicWeb, eras, lookbackPowers, landmarks, greatWalls, distantObjects, superclusterWalls, clusters,
  notableGalaxies, m87Nucleus, youAreHere, horizon, signposts,
} from './scenes/cosmos.js';
import { GC } from './scenes/galaxy.js';
import { M87_POSITION } from './scenes/cosmos.js';

export const LAYERS = [
  cosmicWeb, eras, lookbackPowers, landmarks, greatWalls, distantObjects, superclusterWalls, clusters, notableGalaxies, m87Nucleus, magellanicStream, sgrStream, localGroup, milkyWay, dust, hiiRegions, globularClusters, nuclearCluster,
  nucleus, hypervelocityStar, fieldStars, localBubble, scoCen, radioSphere, areciboMessage, radcliffeWave, galacticObjects, wr140, oortCloud, brightStars, nearestStars, starSystems, heliosphere, kuiperBelt, asteroidBelt, trojans, solarSystem, smallBodies, interstellar, spacecraft, moons, coorbitals, earthOrbiters, sunDot,
  youAreHere, horizon, ...signposts,
];

export const GALACTIC_CENTER = GC;
export { M87_POSITION };
