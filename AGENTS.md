# AGENTS.md

Static site served from `www/`. Vanilla JS ES modules, 2D canvas, no build
step, no dependencies. Deployed to universe.edgemon.org by the homelab
playbooks, which clone the repo and serve `www/` as the document root.

## Development

- Run locally: `python3 -m http.server -d www`
- Tests: `npm test` (Node's built-in runner, `www/tests/test.js`). Covers the
  math in `util.js`, level lookup, and data sanity. Rendering is not tested.

## Architecture

- `www/js/data.js` — astronomical data and unit constants (`AU`, `LY`, `PC`,
  all in meters). The values were written by a model from memory of the
  references cited at the top of the file, not transcribed from them. They
  spot-check well, but no number here has been checked against its source
  line by line. Treat any single value as approximate until you have.
- `www/js/util.js` — pure functions: orbital position, log interpolation,
  nice-number scale bar, seeded PRNG, galactic-plane projection.
- `www/js/scenes.js` — one draw function per layer. Each layer has a
  `[minScale, maxScale]` range in meters per pixel and fades at the edges, so
  zooming between levels is continuous rather than a scene cut.
- `www/js/overview.js` — the log-radius overview mode: pure mapping helpers
  (`logY`, `angleX`, `frame`) and `drawOverview`, which fills the same
  `labels` and `hits` arrays as the layers so hover and label placement are
  shared. Toggled with the Overview button, `o`, or `#overview`.
- `www/js/main.js` — camera state `{center, metersPerPixel}`, the animation
  loop, level stops, and input (buttons, wheel, keys, hash). A level with
  `follow` keeps the camera pinned to that planet as it moves; following
  drops automatically once the view is wider than a fraction of an AU.
  Planets with moons but no button get an `EXTRA_LEVELS` entry, reached by
  clicking the planet or by `#uranus` and the like. The guided tour walks
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
- Do not add a Co-Authored-By line to commit messages.
