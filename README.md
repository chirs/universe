# [universe](https://universe.edgemon.org)

A cosmic zoom in vanilla JavaScript. Start at the inner solar system and pull
back, level by level, to the observable universe. Distances are to scale at
every level; the dots are not, because at true scale nothing but the Sun would
be visible past the first level.

Levels: Earth and Moon, Jupiter and its Galilean moons, Saturn with its rings
and moons, inner solar system, outer solar system, trans-Neptunian region,
stellar neighborhood, Milky Way, Milky Way halo, Local Group, Virgo
Supercluster, observable universe. The halo view shows the Magellanic Clouds
and nearby dwarf satellite galaxies. Planets move on
approximate fixed ellipses with their real periods, initialized from J2000
elements, with a time-speed control. Scroll to zoom continuously between
levels; `#trans-neptunian`, `#milky-way-halo`, and the other level ids link
straight to a level. The `k` key jumps to the trans-Neptunian view; `h` jumps
to the Milky Way halo.

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

No build step, no dependencies. 2D canvas.

### Development

Serve the `www/` directory with any static file server:

    python3 -m http.server -d www

Run tests (Node's built-in runner):

    npm test

See [ROADMAP.md](ROADMAP.md) for planned work.
