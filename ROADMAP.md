# ROADMAP.md — Development Roadmap

Open work only; completed items are removed as they land (see git history).

---

## Cosmic web

- [ ] Lookback structure at the top level: fade galaxies out past about
      27 Gly comoving, a dim band for the dark ages, and a warm rim for the
      microwave background at 46 Gly (Ménard and Shtarkman's Map of the
      Universe is the precedent).
- [ ] Scale-honest void size at the universe level, so the web is a fine
      grain there and only resolves as filaments below a few Gly.
- [ ] Decide whether the extragalactic levels should project onto the
      supergalactic plane instead of the galactic one. Most local structure
      is flat in that plane, which is why every map of the region uses it;
      the cost is a rotation between the Milky Way levels and the cluster
      levels.

## 3D explorer

- [ ] Expand `/v2/` with sourced 3D positions for nearby groups and individual
      Virgo members. The first draft only adapts existing entries with latitude.
- [ ] Improve the cosmic cutaway and add an interactive distance/lookback-time
      ruler; the first draft's era surfaces are schematic.
- [ ] Evaluate a wider redshift survey, with explicit coverage and distance
      uncertainty, before replacing the illustrative 3D web.

## Deferred

- Converting the original explorer to 3D. It retains its 2D view and no
  dependencies; the separate `/v2/` atlas explores 3D instead.
- Zooming inward past the Earth to cells and atoms, as Boeke and the Eameses
  did. A different site; this one is about the universe.
