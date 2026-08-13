# BTB Mobile Next UI and interaction standard

This is the shared acceptance contract for native Mobile Next screens.

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
