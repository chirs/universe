# [universe](https://universe.edgemon.org)

A cosmic zoom in vanilla JavaScript. Start at the inner solar system and pull
back, level by level, to the observable universe. Distances are to scale at
every level; the dots are not, because at true scale nothing but the Sun would
be visible past the first level.

Levels: Earth and Moon, Jupiter and its Galilean moons, Saturn with its rings
and moons, inner solar system, outer solar system, stellar neighborhood, Milky
Way, Local Group, Virgo Supercluster, observable universe. Planets move on
approximate fixed ellipses with their real periods, initialized from J2000
elements, with a time-speed control. Scroll to zoom continuously between
levels; `#milky-way` and the other level ids link straight to a level.

Every moon at least about 400 km across is included, and the dwarf planets
Ceres, Haumea, Makemake, Eris and Sedna, with positions from JPL Horizons at
J2000. Clicking Uranus, Neptune or Pluto zooms to their moons.

The Tour button (or `p`) pulls back from the Earth and Moon to the observable
universe at a steady rate, pausing at each level, after Powers of Ten. The
Overview button (or `o`) switches to a log-radius map after Gott and
Jurić: direction across, distance from the Sun up on a log scale, everything
on one screen.

No build step, no dependencies. 2D canvas.

### Development

Serve the `www/` directory with any static file server:

    python3 -m http.server -d www

Run tests (Node's built-in runner):

    npm test

See [ROADMAP.md](ROADMAP.md) for planned work.
