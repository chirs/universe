# ROADMAP.md — Development Roadmap

Open work only; completed items are removed as they land (see git history).

---

## Interface

- [ ] Smarter label placement: try left, above, and below before dropping a label that collides
- [ ] Signpost the empty stretches (Kuiper belt to Oort cloud, Local Group to superclusters) with running commentary in the manner of Worth's "If the Moon Were Only 1 Pixel", so scrolling through nothing reads as intended
- [ ] Guided tour: a play button that pulls back at a fixed rate through all ten levels with the scale bar ticking, after Powers of Ten

## Views

- [ ] Log-radius overview after Gott and Jurić's Map of the Universe: a second mode with distance from the Sun log-scaled, so every level shows on one screen

## Data

- [ ] Cross-check star, Local Group and Virgo positions against Powell's Atlas of the Universe, whose Sun-centered plates line up with those levels

## Deferred

- 3D rendering (Three.js). The 2D top-down view reads better at the galaxy and
  universe levels, and it keeps the site dependency-free.
- Zooming inward past the Earth to cells and atoms, as Boeke and the Eameses
  did. A different site; this one is about the universe.
