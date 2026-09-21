# Universe v2 — A 3D atlas, from the observable universe to home

Design proposal, 2026-09-20. A first implementation now lives at `/v2/`,
separate from the existing explorer. It includes the cosmic opening, 3D
rotation and zoom, scale bookmarks, object selection/search, saved views,
and the Milky Way endpoint. The catalog is still the original selected data;
nearby group expansion, actual Virgo members, survey imports, adjustable
slices, and an interactive era ruler remain future work. The sections below
describe the intended design, not a claim that every feature has landed.

## Purpose

Start with everything we can observe, then let the visitor find our galaxy
within it. Distance, cosmic history, and the arrangement of galaxies are the
subject. Rotation should reveal relationships that a flat map conceals.

The recommended inner limit is the Milky Way and its satellite neighborhood:
close enough to recognize home as a galaxy with companions, with the full disk
still in view. The Local Group is the minimum useful endpoint if the halo
detail proves too much for the first release. Stars and planets belong to v1.

Success means a visitor can find home, explore a neighboring group, rotate to
understand its depth, and return without losing their bearings.

## The first screen

A dark, quiet canvas contains an oblique cutaway of our observable volume.
A restrained outer boundary surrounds a view through cosmic history toward
a small central marker: “Our galaxy.” A short introduction reads:

> Farther away, earlier in time. Explore inward to our galaxy.

The outermost view emphasizes eras and the extent of the observable volume.
The cosmic web only becomes individually legible as the visitor zooms in;
filaments must not be inflated to fill the opening screen.

Drag rotates the map immediately. Scroll or pinch zooms toward its current
focus, initially home. “Find our galaxy” fits the Local Group with one
interruptible camera move. Nothing advances automatically.

```text
universe                                      Search   Reset view
from the observable universe to home

                    [rotatable 3D cutaway]
                         Our galaxy

                                      [selected object details]

Observable universe   Nearby web   Virgo neighborhood   Local Group   Home
View width: …          Farther away = earlier           Cutaway: on
```

These are scale bookmarks, not a breadcrumb claiming that each named object
contains the next. In particular, the Local Group is not inside the Virgo
Cluster. “Virgo neighborhood” frames both systems and the region between them.

## The inward journey

| View | What becomes visible | What the visitor can understand |
| --- | --- | --- |
| Observable universe | Early-universe eras, CMB surface, home marker | The outer view is also a view into the past |
| Nearby cosmic web | Filaments, clusters, voids, survey coverage | Galaxies have structure on scales larger than individual clusters |
| Virgo neighborhood | Virgo and surrounding groups, including ours | Our group is one small part of a larger neighborhood |
| Local Volume | Individual nearby groups and their major galaxies | Groups have distinct shapes and separations in depth |
| Local Group | Milky Way, Andromeda, Triangulum, dwarf galaxies | Rotation reveals the actual arrangement of our immediate neighbors |
| Home | Milky Way disk and selected satellite galaxies | Our galaxy is an extended object with companions |

Bookmarks change focus and scale while preserving the user's viewing angle.
Ordinary zoom never swaps coordinate systems. Overlapping levels of detail
retain the same objects at the same positions; density summaries resolve into
their members rather than crossfading into an unrelated distribution.

## Space and time

The map represents observations made from our location, arranged in three
spatial dimensions. Distant objects are shown as observed at earlier times.
It is not a simultaneous present-day snapshot of the entire universe.

The scientific observer stays fixed near the Sun, effectively at the Milky
Way on the largest scales. Moving the viewing camera does not relocate that
observer, recompute the observable boundary, or change an object's lookback
time. The external camera is a way of examining the diagram.

Use one documented cosmological model to convert distant redshifts to
comoving distance and lookback time. Comoving distance expresses separation
on a common expansion-normalized scale; it is not light travel time times
the speed of light. Nearby measured distances require their own documented
methods and uncertainties rather than blindly applying a redshift conversion.

Selected distant objects show both “Comoving distance” and “Light travel
time.” An optional era ruler highlights spherical distance bands centered
on the observer. It does not animate the evolution of individual galaxies.
The whole viewport has no single lookback time.

The CMB surface and observable horizon are separate concepts and should not
be assigned an identical radius by convenience. Label the CMB “Oldest light
we can see,” and explain the enclosing observable limit without suggesting
a physical wall or an edge to all space. Represent the dark ages and the
appearance of early luminous objects as broad, sourced eras, not arbitrary
hard galaxy cutoffs. [NASA's cosmological timeline](https://lambda.gsfc.nasa.gov/education/graphic_history/univ_evol.html)
provides the physical sequence; [Map of the Universe](https://mapoftheuniverse.net/)
is the visual precedent for connecting distance and time.

## Geometry and camera

Store complete 3D positions in a single Cartesian frame with a fixed solar
origin. Use supergalactic axes for the large-scale frame and a fixed rotation
to place the Milky Way disk correctly within it. Galactic latitude is retained.
The coordinate axes are a storage convention, not a restriction on viewing.

Start with an orthographic camera: rotation and depth without perspective
making otherwise identical distant objects smaller. Choose an oblique initial
angle that reveals depth while keeping the local supergalactic structure
readable. The orthographic camera is supported directly by
[Three.js](https://threejs.org/docs/#api/en/cameras/OrthographicCamera).

Rotational motion, restrained depth fading, and occlusion provide depth cues.
Avoid decorative stars behind the map, luminous connecting lines without
physical justification, and opaque bubbles around every group. Galaxy glyphs
resolve into disks or ellipsoids only where size and orientation are supported;
otherwise they remain schematic markers with approximate sizes disclosed.

The scale readout describes projected view width. It does not imply that
screen separation equals full 3D separation. Selection details retain actual
distance from us; a later two-object comparison can report spatial separation
with the limitations of the input distances.

## Seeing inside the volume

A complete sphere of points can hide its interior. At the widest scale,
remove a front-facing wedge through the observer to reveal the inner volume.
Keep it tied to the camera so rotating the map reveals different structures
through a stable opening. A faint outline and “Cutaway” label explain the
missing region. Clipping changes visibility, never position or scientific data.

The cutaway is initially on and can be toggled. Fade the global shells and
cutaway out as the view narrows to the nearby universe. At local scales use
the full catalog volume, with optional “Thin slice” controls for dense regions.
A slice's orientation and thickness must be visible; empty space caused by a
slice or incomplete survey must not masquerade as a physical void.

Keep a faint, labeled footprint for incomplete survey coverage. Illustrative
material can provide context beyond catalogs, but must use a distinct visual
treatment and an “Illustrative structure” key. It cannot supply named galaxies
or imply a measured connection between real clusters.

## Interaction and interface

- Drag or one-finger drag rotates around the current focus, without roll.
- Wheel or pinch changes scale around that focus. Selection does not silently
  redirect subsequent zoom until the visitor chooses “Focus.”
- Shift-drag or two-finger drag pans. Keyboard controls expose rotate, zoom,
  and reset; all buttons and search results are keyboard accessible.
- Click or tap selects an object and opens a small details panel. “Focus”
  frames it and establishes the new rotation pivot. Hover is a convenience.
- Search covers catalogued objects. Overlapping markers offer a short choice
  list; hidden or clipped objects cannot intercept clicks.
- “Reset view” restores a useful angle and framing at the current scale.
  “Find our galaxy” returns to the Local Group. The outer bookmark returns
  to the opening view. An offscreen home indicator helps during exploration.
- Shareable URLs retain focus, scale, rotation, and slice settings.

The details panel prioritizes name, object type, group membership, distance,
and one meaningful fact. Sources and measurement uncertainty are expandable.
On phones it becomes a bottom sheet above a compact scale navigator. Reduced
motion disables animated reframing and inertia. There is no tour or autoplay.

## Data strategy

The full observable sphere is a cosmological illustration with measured
content where available. Do not promise a complete galaxy catalog out to its
boundary. Start detailed coverage locally and expand it deliberately.

| Region | Candidate source | Intended role and limitation |
| --- | --- | --- |
| Local Group and halo | [McConnachie compilation](https://arxiv.org/abs/1204.1562) and its maintained catalog | Individual dwarf-galaxy distances and properties; pin and review the actual release |
| Nearby groups | [Local Volume database](https://www.sao.ru/lv/lvgdb/information.php) | Nearby galaxies, principally within 11 Mpc; does not by itself cover Virgo |
| Virgo and wider neighborhood | [Cosmicflows-4](https://arxiv.org/abs/2209.11238), via [EDD](https://edd.ifa.hawaii.edu/) | Distance measurements and group associations; individual distance errors matter |
| Wider survey structure | A separately evaluated redshift survey | Coverage, selection effects, and peculiar velocities must be handled before inclusion |
| Distant eras and unsurveyed context | Sourced cosmology plus explicitly illustrative geometry | Explain history and typical structure without inventing a survey reconstruction |

The first data exercise must confirm downloadable fields, reuse terms,
coordinate conventions, distance calibrations, and uncertainties for the
chosen releases. These are candidates, not completed imports. Do not mix
catalog distance scales silently or place every Virgo member at one group
distance and describe the resulting depth as measured.

Each imported object needs a stable ID, aliases, source and release, sky
coordinates, distance and its definition/method, available uncertainty,
group association, and optional sourced physical size and orientation.
Deduplicate overlapping catalogs. Preserve original measurements alongside
derived coordinates so the conversion is reproducible.

Unknown depth stays unknown: an object without a defensible distance can
appear in a clearly labeled group schematic or be omitted from the spatial
catalog. Never manufacture depth to make the scene look three-dimensional.

## Implementation direction

Develop v2 at a separate `/v2/` route. Keep static hosting. Use Three.js with
a pinned, locally served distribution and license; this is a deliberate v2
dependency decision. The existing site's dependency-free convention remains
appropriate for v1. A framework for the interface is unnecessary.

Use GPU point batches and instanced galaxy glyphs, with HTML for controls and
details. Keep coordinate conversion, cosmology, catalog normalization, camera
state, and selection math independent of rendering so they can be tested.

Store scientific positions as double-precision values in a documented unit
such as Mpc. Before sending positions to the GPU, subtract a nearby render
origin and scale to manageable units. Rebase without moving the apparent
scene. Avoid a single enormous depth range spanning every level at once.

Load local catalogs and higher detail progressively. Set screen-space detail
and label budgets, cull offscreen data, cap device pixel ratio on constrained
devices, and stop rendering when idle. Targets to validate on named devices:
60 fps during desktop interaction, 30 fps on a representative phone, and an
initial compressed transfer under 3 MB excluding optional catalogs.

If WebGL is unavailable, provide an explanatory link to the existing 2D
explorer. Retain a searchable, readable object list outside the canvas.

## Build order and checks

1. Prove the spatial interaction with sourced Local Group objects and one
   neighboring group: rotate, zoom, select, focus, reset, and use touch.
   The first acceptance test is whether rotation makes depth understandable.
2. Add Virgo and the intervening groups. Verify the same galaxies persist
   through changes in detail and that catalog uncertainties are represented.
3. Add the observable-volume opening, cosmological conversions, era surfaces,
   and cutaway. Check that the early universe is not filled with a modern web.
4. Finish the Milky Way halo endpoint, navigation, sharing, loading budgets,
   and desktop/mobile accessibility checks. Release only when the opening-to-
   home journey works as one continuous, reversible interaction.

Implementation tests should cover coordinate transforms and inverse transforms,
invariance of 3D separations under camera rotation, cosmology against published
reference values, catalog deduplication, camera rebasing, clipping-aware
selection, and URL state round trips. Browser checks must cover both endpoints,
an off-center focus, dense Virgo labels, the cutaway, and touch interaction.

## Decisions to revisit after the first prototype

- Whether orthographic rotation gives enough depth perception; compare a mild
  perspective view using the same data before adding another public mode.
- Whether the Milky Way halo adds enough to justify going closer than the
  Local Group. The proposed endpoint is the halo, not the solar system.
- Whether a cutaway wedge or adjustable slab makes the widest view clearer.
- Which larger survey is useful once nearby catalog quality is established.

The scope excludes galaxy evolution playback, free-flight controls, gravity
simulation, stellar catalogs, and planetary systems. The principal interaction
is inspecting one spatial model at many scales.
