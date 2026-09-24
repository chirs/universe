# ROADMAP.md — Development Roadmap

Open work only; completed items are removed as they land (see git history).

---

## Original 2D explorer

- [ ] Decide whether the extragalactic levels should project onto the
      supergalactic plane instead of the galactic one. Most local structure
      is flat in that plane, which is why every map of the region uses it;
      the cost is a rotation between the Milky Way levels and the cluster
      levels.

## 3D explorer

- [ ] Expand `/v2/` with sourced 3D positions for nearby groups and individual
      Virgo members. Prioritize the Local Group–Virgo neighborhood; the first
      draft only adapts existing entries with latitude. Preserve source release,
      distance method, and uncertainty through a reproducible catalog import.
- [ ] Make group clouds resolve into their actual member galaxies as you zoom,
      with stable positions and readable labels. Distinguish incomplete catalog
      coverage from physical voids directly in the view.
- [ ] Improve the cosmic cutaway and add an interactive distance/lookback-time
      ruler; the first draft's era surfaces are schematic. Make the removed
      volume clear and keep the CMB distinct from the observable horizon.
- [ ] Compare orthographic and mild perspective views with the same Local Group
      data. Keep the camera model that best reveals depth without making
      navigation harder; a second public camera mode is not a requirement.
- [ ] Add an offscreen home indicator and check recovery after panning or
      focusing on another galaxy. Test whether the Milky Way halo is a useful
      endpoint beyond the Local Group before expanding inward any further.
- [ ] Check real phones and Safari, including pinch/pan, dense-label selection,
      keyboard access, and reduced motion. Measure startup and rotation
      performance; current mobile checks use Chrome emulation.
- [ ] Evaluate a wider redshift survey, with explicit coverage and distance
      uncertainty, before replacing the illustrative 3D web.

## v3: time as a dimension

The agreed direction: the map is about where; the best moments are about
when. Build the atlas of moments first, with provenance underneath.

- [ ] An atlas of moments: a curated timeline of dated events, each a level
      plus a clock time (the `#level?t=` links), from Voyager's heliopause
      crossing and Apophis in 2029 through S2's periapsis in 2034 and Halley
      in 2061 to Andromeda's arrival. The space tour did not prove useful;
      a walk through time may.
- [ ] Let the clock's rate follow the zoom: years per second among the
      planets, centuries at the S-stars, millions of years at the galaxy, so
      S2 whips round Sgr A* and the Sun circles the galaxy on screen. The
      spiral arms are density waves, not rigid bodies, so they should not
      simply rotate; decide what moves (stars, the Sun, clusters) and what
      holds still before building it.

## Provenance

- [ ] Make sources first-class: each object carries where its numbers came
      from, shown in the hover text, and anything fetched has a script that
      refreshes it. Retire the values written from memory in data.js one
      group at a time, starting with the ones a reader would quote.

## Decisions to make

- [ ] Whether `/v2/` becomes the site, with the 2D explorer folded into it,
      or the 2D map is the work and the 3D draft is retired. Carrying both
      means every addition is made once and owed twice.
- [ ] Only if additions keep coming at the current pace: lazy, per-level
      binary assets and a frame budget. `spacecraft.js` is 441 KB of
      JavaScript parsed on every load, and every layer is drawn every frame.

## Deferred

- Converting the original explorer to 3D. It retains its 2D view and no
  dependencies; the separate `/v2/` atlas explores 3D instead.
- A guided space tour or narration. One was built, did not prove useful,
  and was removed in September 2026; prefer direct exploration.
- Zooming inward past the Earth to cells and atoms, as Boeke and the Eameses
  did. A different site; this one is about the universe.
