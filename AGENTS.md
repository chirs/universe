# AGENTS.md

Static site served from `www/`. The original explorer uses vanilla JS ES
modules and 2D canvas, with no build step or dependencies. The separate 3D
draft at `/v2/` uses a vendored Three.js distribution. Deployed to
universe.edgemony.org by the homelab
playbooks, which clone the repo and serve `www/` as the document root.

## Development

- Run locally: `python3 -m http.server -d www`
- Tests: `npm test` (Node's built-in runner, `www/tests/*.js`). Covers the
  original math and data, plus v2 coordinate transforms, cosmology, camera
  math, view URLs, and deterministic illustrations.
- V2 browser checks: `node scripts/check-v2.mjs [URL] [debugging port]`.
  Requires a separate Chrome with remote debugging enabled; see README.md.

## Architecture

- `www/v2/` — separate 3D atlas. `model.js` holds pure math (Mly units,
  solar origin, supergalactic Cartesian axes); `catalog.js` adapts the
  existing data without inventing missing latitude; `render.js` uses
  orthographic WebGL rendering; `main.js` owns camera state and input.
  Third-party code in `vendor/` is pinned at Three.js 0.180.0 with its license.
  The conventions below describe v1; v2 retains all three spatial dimensions.
  Read `V2-DESIGN.md` for the intended scope and first-draft limitations.

- `www/js/data.js` — astronomical data and unit constants (`AU`, `LY`, `PC`,
  all in meters). Most values were written by a model from memory of the
  references cited at the top of the file, not transcribed from them. They
  spot-check well, but no number here has been checked against its source
  line by line. Treat any single value as approximate until you have. The
  exceptions are the Abell clusters, `SUPERCLUSTERS` and `VOIDS`, which are
  transcribed from Powell's Atlas tables (H0 = 70, CMB frame) and Tully et
  al. 2019, with supergalactic coordinates converted to galactic, and the
  `S_STARS` orbital elements, transcribed from Gillessen et al. 2017.
  `SGR_A_STAR` carries the GRAVITY 2022 mass and distance, and the Sun's
  distance to the galactic center is taken from it.
- `www/js/util.js` — pure functions: orbital position, log interpolation,
  nice-number scale bar, seeded PRNG, galactic-plane projection, and the
  cosmic web generator `makeZeldovichWeb` (a lattice of particles pushed
  along the gradient of a noise potential, so filaments curve and voids
  come in a range of sizes). The supercluster web leaves a hole over the
  500 Mly the real cluster data covers. `skyOrbitPosition` places a star on
  an orbit given in the visual-binary convention (sky east, north, depth),
  and `skyOffsetToPlane` drops that into the map's galactic plane using the
  plane's position angle at Sgr A*; `pickLevel` chooses the level to
  highlight by scale among stops near the camera.
- `www/js/scenes.js` — one draw function per layer. Each layer has a
  `[minScale, maxScale]` range in meters per pixel and fades at the edges, so
  zooming between levels is continuous rather than a scene cut. The galactic
  center has two layers: the nuclear star cluster, which owns the
  "Galactic center" label from the Milky Way level inward, and the nucleus,
  which draws the S-star orbits and Sgr A* (a dot until its shadow resolves,
  then horizon, shadow and innermost stable orbit to scale).
- `www/js/overview.js` — the log-radius overview mode: pure mapping helpers
  (`logY`, `angleX`, `frame`) and `drawOverview`, which fills the same
  `labels` and `hits` arrays as the layers so hover and label placement are
  shared. Toggled with the Overview button, `o`, or `#overview`.
- `www/js/main.js` — camera state `{center, metersPerPixel}`, the animation
  loop, level stops, and input (buttons, wheel, keys, hash). A level with
  `follow` keeps the camera pinned to that planet as it moves; following
  drops automatically once the view is wider than a fraction of an AU.
  Every body with moons gets a `MOON_LEVELS` entry (built by `moonLevels`
  in `util.js`), listed in the Moons menu and reached by clicking the planet
  or by `#uranus` and the like. A level with `clickName` is reached by
  clicking that label, which is how the galactic center and Sgr A* stops
  work. The guided tour walks
  the `TOUR` stops from `util.js` with `goTo` legs timed by `tourLegMs`;
  any user input stops it.

## Conventions

- The Sun is the world origin. World coordinates are meters. Objects are
  placed at their true distance in the direction of their galactic longitude
  (+x toward the galactic center, +y in the direction of galactic rotation).
  Galactic latitude is dropped, not projected, so distances stay to scale.
- Bodies smaller than the dot threshold draw as fixed-size dots. Never fake a
  distance to make something fit.
- Procedural content (belts, spiral arms, cosmic web) comes from a fixed-seed
  PRNG so the picture is stable across reloads.
- Dropping galactic latitude scatters structures near the galactic poles:
  the Coma, Leo and Phoenix superclusters have members that land far apart
  in the plane, so they get a glow and label but no strand.
- Do not add a Co-Authored-By line to commit messages.
