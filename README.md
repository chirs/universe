# [universe](https://universe.edgemon.org)

A cosmic zoom in vanilla JavaScript. Start at the inner solar system and pull
back, level by level, to the observable universe. Distances are to scale at
every level; the dots are not, because at true scale nothing but the Sun would
be visible past the first level.

Levels: Earth and Moon, Jupiter and its Galilean moons, Saturn with its rings
and moons, inner solar system, outer solar system, stellar neighborhood, Milky
Way, Local Group, Virgo Supercluster, observable universe. Planets orbit on their real periods
from the J2000 epoch, with a time-speed control. Scroll to zoom continuously
between levels; `#milky-way` and the other level ids link straight to a level.

No build step, no dependencies. 2D canvas.

### Development

Serve the `www/` directory with any static file server:

    python3 -m http.server -d www

Run tests (Node's built-in runner):

    npm test

See [ROADMAP.md](ROADMAP.md) for planned work.
