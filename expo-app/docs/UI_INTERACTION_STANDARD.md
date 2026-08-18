# BTB Mobile Next UI and interaction standard

This is the shared acceptance contract for native Mobile Next screens.

## Design system v2

The token layer lives in `src/theme` and is imported through `theme.ts`. A
screen asks for a role, never a literal.

### Typography — `typography.ts`

- Use a `typeScale` role. New literal `fontSize` values are a review finding.
- Weights are `400 / 500 / 700 / 900` only. Android's default family ships no
  other faces, so a requested `800` silently resolves to a neighbour and reads
  as the same step as `900`.
- Minimum rendered size is 11pt. Sizes 8–10 do not survive Android font scaling
  on a live match surface.
- Prose is `400`/`500`. `900` is reserved for numerics — scores, odds, metrics.
  Weight is the product's primary emphasis channel and only works while most of
  the screen is not using it.
- Large numerics track negative; small text tracks positive. `eyebrow` is the
  only uppercased role.

### Colour — `semantic.ts`

- Ask for meaning (`semantic.live`, `semantic.positive`, `semantic.stale`), not
  hue (`colors.red`, `colors.green`).
- Known overlaps are recorded in `semanticCollisions` and covered by a test. A
  new overlap belongs on that register with a note, not in a component.
- `live` is BTB's own aqua-teal and is never loss red. The hue was picked for
  hue *distance*, not brightness: pure cyan sits 15-18 degrees from Fiori blue
  and collapses into it at the size a live dot actually renders, while the
  aqua-teal holds 28 degrees from blue and 50 from BTB green.
- A live signal reports that a match is in progress and nothing about how it is
  going. A status pill that renders for every status is not a live signal — gate
  it on `LIVE`/`HALF_TIME` or leave it neutral.
- Red is reserved for loss, red cards and errors. Green is reserved for positive
  outcomes and brand navigation; it is no longer spent on screen eyebrows.

### Depth — `elevation.ts`

- Four rungs: `flat`, `raised`, `floating`, `glow`. Call `depth(level)`.
- A surface picks exactly one rung. Border plus shadow plus glow on the same
  card is the specific failure that turns futuristic into noisy.
- `glow` is reserved for meaning — live state, a fresh decision — and takes the
  semantic colour of whatever it reports. A glow with no meaning is decoration.

### Motion — `motion.ts`

- Use a named duration (`reveal`, `transition`, `ambient`), not a literal.
- Resolve every duration through `motionDuration(name, reduceMotion)`. Reduced
  motion returns `0`, so a skipped animation must still land on its end state.
- `emphasis.alert` is reserved for change the user is waiting on — a goal, a new
  Super decision. Routine refetches use `emphasis.arrive`.
- Ambient loops are the first thing reduced motion drops.

## Layout

- Use the shared spacing, radius, semantic color, and typography tokens.
- Keep content centered with a bounded width; preserve Android/iOS safe areas.
- Align related values to a predictable grid. On phone widths, dense metrics use
  two readable columns instead of compressed three-column rows.
- Keep section titles, cards, filters, empty states, and actions in a consistent
  vertical rhythm. Text must wrap or truncate intentionally and never collide.

## Interaction

- Interactive controls use at least a 44 dp hit target; 48 dp is preferred for
  primary actions.
- Primary, secondary, external, destructive, selected, disabled, loading, empty,
  and error states must remain visually distinct and accessible.
- Press feedback must not move surrounding layout. Back gestures must share the
  same navigation history as the Android back action.
- Frequent actions stay reachable with one hand and do not collide with the
  system navigation bar or the Bibi overlay.

## Theme

- Dark is the default. Light is an explicit persisted device preference.
- Both themes use the same semantic tokens and preserve the meaning of BTB green,
  Fiori blue, warning gold, and loss/error red.
- A theme is not accepted if only the page background changes; text, cards,
  borders, menus, charts, states, Bibi, status bar, and native appearance must
  remain readable together.

## Bibi guidance

### Presence

- Presence is a property of the surface, resolved by `bibi-presence.ts`.
- `FULL` — the ambient mascot with drag, idle motion, greeting and quick menu.
  Brand, orientation and helper surfaces.
- `GUIDE_ONLY` — no ambient presence. Bibi appears solely to deliver an active
  tutorial step and leaves when it finishes. Match Detail and Super Decision
  Detail are `GUIDE_ONLY`: a floating character the user has to move aside is
  competing with the data they opened the screen to read.
- `GUIDE_ONLY` never means "not rendered". The tutorial targets components on
  `/match/` and `/super/` and Bibi is what renders those steps, so removing her
  outright would break the guide rather than withdraw her from it.
- Adding a route to `denseAnalyticalRoutes` requires a matching prefix *and* a
  segment after it, so a list route never inherits its detail route's rule.

### Behaviour

- A guide step binds to a real rendered component by target ID and measured
  layout. Estimated screen coordinates are not allowed.
- Only the described component receives the temporary BTB-green border.
- Completing, closing, or leaving the step restores the component immediately.
- The speech bubble is placed above or below the target and must not hide it.

## Evidence

- Type, lint, and unit tests must pass.
- Android production bundle and release APK must pass.
- Visual acceptance covers dark and light themes plus target highlighting at a
  compact phone width and a larger phone/tablet width.
