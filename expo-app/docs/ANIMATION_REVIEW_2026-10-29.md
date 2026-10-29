# Android and web motion review: Jinx and launch

Date: 2026-10-29. Owner: BTB Mobile Next - Aktif.
Status: baseline assessment; owner approved the recommendations and local
implementation is now validated. Findings below describe the pre-change source.
[Implementation and current evidence](ANIMATION_IMPLEMENTATION_2026-10-29.md).

## Evidence and scoring limits

Reviewed the shared client at Mobile HEAD
`38e885c27d35011a92e6b9fa052ee51fe9b055fe` (a release-verification tooling
change after accepted client source `e4def5973dd4169a19556663d415b466ee46f309`).
Scores are a principal motion-design heuristic, not a user study or measured
frame-rate result. They consider purpose, timing, character expression,
interruption/control and accessibility. Source behavior and inspected character
assets support the scores; Android device playback, browser playback, slow-device
performance and assistive-technology experience remain unobserved in this review.
The prior computer-use attempt ended because the browser URL could not be
confidently determined for policy enforcement. No access barrier was bypassed.

Inspected the deployed orb character's open/closed PNG frames. The character has
a coherent football identity and a readable face; its three-frame blink avoids
a new asset system. Runtime readability at its actual 68 px/dp presentation
still needs observation. The fox comparison and full scene catalogue are preview
tools, not evidence that every scene is delivered.

| Component | Android | Desktop web | Decision |
| --- | --- | --- | --- |
| Jinx character and interaction motion | 8.0/10 | 8.0/10 | Preserve design; make targeted consistency improvements |
| Branded launch sequence | 6.5/10 | 6.5/10 | Improve reduced motion, entry timing and progress truthfulness |

These component scores supplement the earlier provisional whole-client motion
scores (Android 7.0, web 7.5). They are not an arithmetic recalculation or proof
of completed runtime review.

## Jinx

### Strengths confirmed in source

- Shared renderer and state vocabulary provide Android/web parity. Transform
  animations use the native driver on Android and the JS driver on web.
- `JinxAnimator.tsx:33` respects system reduced motion, explicit forced reduction,
  sleep and foreground state. Effect cleanup stops scene and ambient animations.
- `jinx-motion.ts:90` resolves LIVE/CALM/OFF consistently. CALM lowers amplitude
  and slows breathing; OFF removes decorative motion. CALM intentionally still
  moves and should not be represented as a complete stop.
- Settings expose the modes and character visibility. Preferences are persisted,
  and a save failure is reported rather than silently promising persistence.
- `BtbMascotOverlay.tsx:209` provides sleep after 30 seconds of inactivity.
  Dense match/Super analytical surfaces suppress ambient presence while keeping
  an explicitly requested guide available. This protects reading space.
- Idle micro-moves vary rather than repeating one gesture. Breathing, scale and
  spark share one phase, which avoids independent loops drifting apart.
- The event reducer rejects stale context/duplicate events and stale completion.
  This is useful infrastructure, but does not prove those scenes are connected
  to real pilot events.

### Delivered scope matters

The runtime overlay instantiates the orb character with a navigation context.
Its current dispatch sites provide navigation/interaction, greeting and idle;
guide and drag select presentation overrides. The overlay explicitly retains
the owner's neutral daily comment, without a performance mood/reaction show.
Goal, half-time, favorable/unfavorable answer and celebration scenes exist in the
shared renderer/reducer and design lab. No live delivery credit is assigned to
those prototype demonstrations. This review proposes no new betting reactions.

### Improvements

1. **Medium — make menu interruption complete.** The overlay marks the state
   blocked while its menu is open (`BtbMascotOverlay.tsx:206`), and the scene
   scheduler checks it (`use-jinx-motion.ts:21`). The renderer's motion policy
   (`JinxAnimator.tsx:39`) does not read `state.blocked`; breathing and idle
   micro-moves (`:65`, `:80`) can therefore continue during the menu. Add an
   explicit ambient-suspension policy. Preserve directly manipulated dragging
   and requested guide behavior instead of indiscriminately disabling them.
   Verify there is no queued replay when the menu closes.
2. **Optional design refinement — reduce simultaneous ornament.** Breathing,
   spark, blinking and periodic hop/glance/tilt can coexist in LIVE mode. Preserve
   recognizable character motion, but trial a quieter spark or fewer idle
   movements on scanning surfaces. This is a visual hypothesis, not a confirmed
   usability defect; decide after representative playback, not from code alone.
3. **Observation — measure, then tune web cost.** Web uses JS-driven transforms
   and timers. That alone does not establish jank or battery drain. Check actual
   foreground/background transitions, long lists, resize and interaction on a
   representative device/browser before changing the renderer or adding assets.

No character redesign, new mascot, new scene library or reinstated mood system
is justified by the present evidence.

## Launch sequence

### Strengths confirmed in source

- Football landing, pitch geometry and brand mark form a coherent introduction.
- Ball translation/rotation/scale/opacity use the native driver; effects stop
  on unmount.
- Entry waits for both auth resolution and fonts, avoiding premature routing.
- The web twin remembers a completed launch once per tab via sessionStorage;
  subsequent reloads/deep links in that tab skip the branded sequence. Native
  cold starts play it again. Blocked web storage can cause replay.

### Improvements

1. **High — respect reduced motion.** `AppLaunchScreen.tsx` has no reduced-motion
   branch, even though the root navigator reads that preference. It always
   translates the ball from -260 to 86, rotates it from -80 to 420 degrees and
   settles/shrinks it. Provide static branding and readable loading status under
   reduced motion, then enter when actual initialization is ready.
2. **Medium — remove mandatory decorative waiting.** The minimum progress stage
   is 1,250 ms (`:29`, `:89`), followed by 320 ms (`:111`) before completion.
   With initialization already ready, that still imposes approximately 1.57 s
   plus scheduling. Keep a brief normal-motion introduction if useful, but do
   not require its full timeline before access. A proposed 600–900 ms normal
   introduction is a design target to trial, not an external standard.
3. **Medium — make progress truthful and synchronized.** The bar advances from
   8% to 84% by elapsed time, not measured initialization work. Once `ready` is
   true, the label immediately says 100%/completed (`:190`, `:202`) while the
   bar can still be in its earlier phase. Use an indeterminate preparation
   state or genuine milestones, and show completion consistently with entry.
   Do not manufacture a numerical work percentage.

For both components, user preference and interrupted motion must land in a
stable final state without delaying access. The relevant accessibility design
references are [W3C Animation from Interactions (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
and [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
This source review is not a WCAG conformance certification.

## Validation performed and remaining

Existing focused tests passed: **28/28** across `src/design-lab/jinx-motion.test.ts`,
`src/mascot/jinx-preferences.test.ts`, `src/mascot/bibi-presence.test.ts`,
`src/mascot/idle-behavior.test.ts` and `src/theme/motion.test.ts`.
Log: `.codex-artifacts/animation-review-20261029/motion-tests.txt`.
These are policy/state tests; they do not render the launch screen or prove
the renderer honors every interaction policy. No new tests were written.

If implementation is requested, validate normal/reduced motion, preference
changes while visible, fast/slow initialization, first/repeated web-tab launch,
Jinx menu/drag/guide/sleep/background and dense-screen presence on both surfaces.
Android bundle and verified web export remain companion checks; actual device
and browser playback are needed before final motion/performance scoring.
Keep changes scoped to presentation. A new paired release keeps its normal
approval, artifact and acceptance requirements. No release or task closeout is
claimed by this assessment.
