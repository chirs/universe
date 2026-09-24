# [universe](https://universe.edgemony.org)

Start at the inner solar system and pull back, level by level, to the observable universe.
Distances are to scale at every level
(the dots are way bigger than real life)

Planets move on approximate fixed ellipses with their real periods, initialized
from J2000 elements.
The `k` key jumps to the trans-Neptunian view; `h` jumps to the Milky Way halo.
The stellar neighborhood shows every known system within 16 light-years,
drawn by spectral type, with rings on systems that have known planets.
Clicking Alpha Centauri zooms to A and B on their 80-year orbit, projected
onto the galactic plane; clicking Proxima Centauri shows its two planets,
drawn face-on with their measured periods. `u`
jumps to the Local Bubble, the supernova-blown cavity the Sun sits in, with
the star-forming clouds that lie on its shell.
`l` jumps to the Local arm, with nearby nebulae, clusters and black holes at
their distances. The spiral arms are the log-spiral fits of Reid et al. 2019
to maser parallaxes, drawn bright over the measured azimuth ranges and faint
where extrapolated; the disk, bulge and bar are schematic.
`g` jumps to the galactic center, where the S-stars run their measured orbits
around Sgr A* (Gillessen et al. 2017), projected onto the galactic plane and
moving with their real periods. `b` jumps to the black hole itself, with its
event horizon, shadow and innermost stable orbit to scale under a schematic
accretion glow. Clicking the galactic center at the Milky Way level zooms in
the same way.

The moon systems include the major satellites plus selected smaller bodies
such as Phobos, Amalthea, Hyperion, Puck, Nereid, and Pluto's four small moons.
The dwarf-planet layer includes Ceres, Pluto, Haumea, Makemake, Eris, Sedna,
and six large candidates: Orcus, Máni, Salacia, Quaoar, Varda, and Gonggong.

Heliocentric positions come from JPL Horizons elements at J2000. Clicking any
body with modeled moons zooms to its satellite system. For remote satellites
without a published J2000 phase, the displayed phase is illustrative while
the modeled orbit size, period, and eccentricity remain measured values.

The Tour button (or `p`) pulls back from the Earth and Moon to the observable
universe at a steady rate, pausing at each level, after Powers of Ten. The
Overview button (or `o`) switches to a log-radius map after Gott and
Jurić: direction across, distance from the Sun up on a log scale, everything
on one screen.

The widest level is not a present-day snapshot. Looking farther out also means
looking farther back in time, so it is presented as a schematic 2D comoving
slice. Its cosmic web is procedural rather than a survey reconstruction.

The original explorer uses 2D canvas, with no build step or dependencies.

### 3D draft

[Open the 3D atlas](https://universe.edgemony.org/v2/). It begins at the
observable universe and zooms inward to the Local Group and Milky Way's
satellite neighborhood. Drag to rotate, scroll to zoom, Shift-drag to pan,
and click an object for details. Touch supports rotation, pinch zoom, and
two-finger pan. Scale bookmarks and object search provide direct navigation.
The URL preserves the current view, including the focused object.

The draft uses full 3D positions for the existing Local Group galaxies and
clusters with known latitude. The nearby catalog is incomplete; cluster
clouds, galaxy shapes, and the wider web are explicitly illustrative. It
uses an orthographic camera and a schematic cosmic cutaway, with comoving
distance and lookback time derived from a flat LCDM model. No automatic tour.

`www/v2/` is independent of the original renderer. Three.js 0.180.0 is
vendored from the npm distribution via jsDelivr in `www/v2/vendor/`, with its
MIT license. No CDN requests or build step are needed at runtime.

### Development

Serve the `www/` directory with any static file server:

    python3 -m http.server -d www

Run tests (Node's built-in runner):

    npm test

Optional browser checks use a separate Chrome session with
`--remote-debugging-port=9331` and a local server on port 8766:

    node scripts/check-v2.mjs http://127.0.0.1:8766/v2/

The script checks desktop and emulated mobile interaction and saves
screenshots under `/private/tmp/universe-v2-*.png`. It has no npm dependencies.

See [ROADMAP.md](ROADMAP.md) for planned work.

The [v2 design](V2-DESIGN.md) describes the direction beyond this first draft.
