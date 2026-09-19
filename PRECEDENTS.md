# PRECEDENTS.md — Prior Art

The cosmic zoom is an old form. This file lists the works universe descends
from or sits next to, what each got right, and where universe differs.

universe, for reference: a 2D canvas that starts at the Earth and Moon and
pulls back through ten levels to the observable universe. Distances are to
scale at every level; bodies are not, and are drawn as dots instead. Planets
move on real orbits from J2000. Zooming is continuous, with layers fading in
and out across their scale ranges rather than cutting between scenes.

---

## The zoom as a form

**Cosmic View: The Universe in 40 Jumps** — Kees Boeke, 1957. A picture book
by a Dutch schoolteacher: a girl in a chair, then each page ten times farther
out (and, in the second half, ten times closer in). Every cosmic zoom since
descends from it. Its unit of change is the discrete jump, one power of ten per
page. ([Wikipedia](https://en.wikipedia.org/wiki/Cosmic_View))

**Cosmic Zoom** — National Film Board of Canada, 1968; directed by Robert
Verrall, drawings by Eva Szasz. Eight minutes of animation from a boy rowing on
the Ottawa River out past the Moon, the planets and the Milky Way, and back in
to an atom. It turned Boeke's jumps into one continuous camera move, the same
choice universe makes with its fading layers.
([Wikipedia](https://en.wikipedia.org/wiki/Cosmic_Zoom),
[NFB](https://www.nfb.ca/film/cosmic_zoom/))

**Powers of Ten** — Charles and Ray Eames, 1977 (prototype 1968). From a picnic
in Chicago, the camera pulls back by a factor of ten every ten seconds to
10^24 m, then dives into a carbon nucleus. The fixed rate of zoom and the
on-screen scale readout are the ancestors of universe's scale bar. It is the
canonical reference; anyone who sees universe will think of it.
([Eames Foundation](https://eamesfoundation.org/work/powers-of-ten-and-the-relative-size-of-things-in-the-universe/),
[Wikipedia](https://en.wikipedia.org/wiki/Powers_of_Ten_(film)))

**Cosmic Eye** — Danail Obreschkow (ICRAR), 2012, remastered 2018. A modern
Powers of Ten built from current survey imagery and simulations, zooming out
from a woman's face to the cosmic web. Made for teaching, then went viral
(tens of millions of views). Shows the appetite for the form hasn't faded.
([Wikipedia](https://en.wikipedia.org/wiki/Cosmic_Eye),
[ICRAR](https://www.icrar.org/cosmic-eye-goes-viral/))

These are all films: one fixed path, one fixed tempo. universe is the same
journey with the viewer holding the camera.

## Interactive scale on the web

**The Scale of the Universe** (1 and 2) — Cary and Michael Huang, 2010 and
2012. A Flash slider from the Planck length to the observable universe, with
hundreds of clickable objects. The most-shared web precedent. It is a size
comparison, not a map: objects are lined up side by side by size, with no
positions or distances between them. universe does the opposite: positions are
real and sizes are given up.
([Wikipedia](https://en.wikipedia.org/wiki/The_Scale_of_the_Universe),
[htwins.net/scale](https://htwins.net/scale/),
[scaleofuniverse.com](https://scaleofuniverse.com/en))

**If the Moon Were Only 1 Pixel** — Josh Worth, 2014. One horizontal scroll
across the solar system at a scale where the Moon is a single pixel. Almost all
of it is empty black, with running commentary to keep you scrolling. It is the
strongest argument for universe's "distances to scale" rule: the emptiness is
the point, and you can only feel it if nothing is faked. Worth keeps bodies to
scale too and pays for it in scroll length; universe keeps distances to scale
and gives up body size so a whole level fits on one screen.
([site](https://www.joshworth.com/dev/pixelspace/pixelspace_solarsystem.html),
[project notes](https://www.joshworth.com/projects/if-the-moon-were-only-1-pixel))

**100,000 Stars** — Google Data Arts Team, 2012. A WebGL Chrome Experiment of
the stellar neighborhood, zooming from the Sun out to the Milky Way. It overlaps
universe's stars and Milky Way levels, in 3D and with far more stars.
([Experiments with Google](https://experiments.withgoogle.com/100000-stars),
[case study](https://web.dev/case-studies/100000stars))

**NASA's Eyes on the Solar System** — JPL, 2010, now a browser app. Planets,
moons and spacecraft on real ephemerides, with time controls. The authority for
the solar-system levels; universe's J2000 orbits and time-speed buttons are a
tiny version of the same idea.
([Eyes](https://eyes.nasa.gov/apps/solar-system/),
[Wikipedia](https://en.wikipedia.org/wiki/NASA%27s_Eyes))

## Maps at fixed levels

**An Atlas of the Universe** — Richard Powell, from the late 1990s. Nine static
maps, each centered on the Sun and each about ten times wider than the last:
12.5 light years, 250, 5,000, the Milky Way, the satellite galaxies, the Local
Group, the Virgo Supercluster, the neighboring superclusters, the visible
universe. This is the closest precedent to universe's level structure, and a
good data cross-check for the stars, Local Group and Virgo levels. universe adds
the continuous zoom between Powell's plates, and time.
([atlasoftheuniverse.com](http://www.atlasoftheuniverse.com/virgo.html),
[ComPADRE](https://www.compadre.org/Portal/items/detail.cfm?ID=96))

**A Map of the Universe** — J. Richard Gott III, Mario Jurić et al., 2003. A
single conformal map using log(radius), running from the Earth's surface out to
the cosmic microwave background, with Sloan survey galaxies plotted. It shows
every scale at once by bending distance, which is the other way to answer
universe's question: log-scale the map, or keep it linear and move the camera.
It is also where the Sloan Great Wall was announced.
([Princeton](https://www.astro.princeton.edu/universe/),
[arXiv](https://arxiv.org/abs/astro-ph/0310571))

## Full 3D simulators

**Celestia** (2001, open source), **SpaceEngine**, **Universe Sandbox**,
**WorldWide Telescope** (Microsoft Research, now AAS, runs in a browser), and
the Hayden Planetarium's **Digital Universe Atlas** shown through **OpenSpace**
all let you fly continuously from a planet's surface to the edge of the
observable universe, with real catalogs, 3D positions and textured bodies.
They are what universe would become with no scope limit. universe stays 2D, has
no dependencies, loads instantly, and gives up galactic latitude, catalogs and
free flight in exchange for a view you understand in seconds.
([Celestia](https://celestiaproject.space/),
[Universe Sandbox](https://universesandbox.com/faq/),
[WorldWide Telescope](https://en.wikipedia.org/wiki/WorldWide_Telescope),
[Digital Universe](https://www.amnh.org/research/hayden-planetarium/science-visualization/digital-universe-atlas))

## Physical scale models

**Voyage** (National Mall, 2001) puts the solar system at 1:10 billion along
about 600 m between the Air and Space Museum and the Smithsonian Castle.
**Sweden Solar System** is 1:20 million, with the Globe Arena as the Sun and
Saturn in Uppsala. Both keep sizes and distances at the same scale, and so only
cover the solar system: you have to walk the gaps. universe solves the same
problem for a screen by giving up size.
([Voyage](http://voyagesolarsystem.org/voyage-on-the-national-mall/),
[Sweden Solar System](https://en.wikipedia.org/wiki/Sweden_Solar_System))

## Where universe sits

- **Continuous zoom** from the films (Cosmic Zoom, Powers of Ten), made
  interactive.
- **Sun-centered levels at ~10× steps** from Powell's Atlas.
- **Real distances, fake sizes**, the reverse of the Huangs' size comparison
  and a softer version of Worth's full-scale honesty.
- **Real orbits and time** from NASA's Eyes, at toy scale.
- **2D, no dependencies, instant load** as the deliberate difference from the
  3D simulators.

The precedents also mark out directions universe has not taken: zooming inward
(Boeke, Eames, the Huangs), a log-radius overview (Gott and Jurić), and 3D
positions (everything in the simulator group).
