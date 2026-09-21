# ROADMAP.md — Development Roadmap

Open work only; completed items are removed as they land (see git history).

---

## Original 2D explorer

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

## Deferred

- Converting the original explorer to 3D. It retains its 2D view and no
  dependencies; the separate `/v2/` atlas explores 3D instead.
- Further tour work or narration. Prioritize direct exploration and spatial
  relationships; the existing tour did not prove useful.
- Zooming inward past the Earth to cells and atoms, as Boeke and the Eameses
  did. A different site; this one is about the universe.
