# Match Path touch and event UX — local delivery candidate

The owner's three phone screenshots and October 13 request authorize this
Mobile presentation batch under supporting TASK-0124. The previous numbered
`1+2` clusters obscured event types; interaction was tap-only, the selected
minute was below the plot, and finished matches without history showed a large
empty chart. The changes preserve the existing data and model contracts.

## Implemented

- Horizontal dragging selects the nearest retained sample, with a cursor and
  persistent minute/score readout. No interpolated score or pressure is created.
  Same-minute samples resolve to the latest retained capture. Vertical movement
  yields to page scrolling; a diagonal hesitation does not immediately select.
- Plot event targets are 48 points. Shared vector symbols identify goals, red
  cards, pool changes and corrections. Close events show multiple types and a
  count badge; their separate choices and the chronological event rail preserve
  every member. Events with unknown minutes remain selectable without a plotted
  timestamp.
- Physical marker input goes through the same gesture canvas as the line.
  This fixes an origin-button release overriding the destination of an icon
  drag. Keyboard/screen-reader marker actions remain separate. Zero-coordinate
  synthetic activation cannot select the opening sample.
- Previous/next buttons and the adjustable selection readout remain available.
  Inspecting history stays pinned across new captures; **Son kayıt** resets that
  pin and resumes following the latest capture. The current match score stays
  separate from the selected historical score.
- Finished matches with no path history use a compact event timeline and
  explicit missing-history wording. Full-time records say the match completed.
  Unknown-minute events explicitly say the minute is unknown; no exact source
  timestamp or event probability is inferred.

## Validation and release boundary

TypeScript, ESLint, **603 Mobile tests, 13 tooling tests and brand checks pass**.
The supported Node24 Android/Hermes export passes with public environment values
cleared, dotenv disabled and explicit synthetic settings. It is a compilation
artifact, not a signed APK. Existing SDK57 Doctor 20/20 is reused: package and
lockfile hashes match the preceding validated checkpoint, with no dependency or
native configuration change at that earlier checkpoint.

The actual component was rendered through React Native Web with synthetic data,
including 320/390-width views, normal/empty history, horizontal and vertical
input, separate group choices, icon-drag release, keyboard activation, unknown
minutes, pinned history and new-capture following. Thirteen UI checks pass.
The preview's browser font-context shim is outside app source; gesture/chart
code uses the installed libraries. This is not physical Android or TalkBack proof.

Evidence: workspace `.codex-artifacts/match-path-ux-2026-10-13/`, including
`ui-verification.json`, `closeout.json`, `preview-390.jpg`, `preview-320.jpg`,
`preview-empty-320.jpg`, final check/export logs and the source hashes.
Android export: Expo app `.codex-artifacts/match-path-ux-2026-10-13/android-frozen`.

## Approved Android continuation

The owner subsequently approved BFF integration, Android verification, final
ARM64 pilot APK and private Drive delivery. Native testing reproduced a real
failure: manual gesture activation on JS emits `setGestureState` warnings and
never selects. Activation/arbitration now runs on UI worklets; `scheduleOnRN`
updates React state. The existing native build was reused through Expo reload.

Eight synthetic Android API35/x86_64 checks pass: component opening, horizontal
selection, release persistence, mixed-marker selection, separate group choice,
event-origin drag destination, return to latest and vertical page scrolling.
Fresh final core checks pass (603+13); Doctor is 20/20 after six required Expo
patch alignments. A targeted `shell-quote` update removes the critical build
advisory; the audit is not otherwise clean. The final ARM64 APK is built and
privately delivered; signature, embedded config, source freeze and authenticated
Drive download checksum pass. See
[exact APK delivery](TASK_0124_CONSUMER_PILOT_DELIVERY_2026_10_13.md).

The compatible BFF is active with producer capture disabled; unproved pressure
stays unavailable. Physical owner-phone/TalkBack acceptance remains unmeasured.
No commit/push or model promotion occurred. TASK-0121 remains accepted rollback;
M3/M10 and economic gates are unchanged. New evidence is in workspace
`.codex-artifacts/task0124-delivery-2026-10-13/`, including `native-smoke.json`,
three native screenshots, exact frozen input hashes and runtime receipts.

## Phone screenshot follow-up

Seven subsequent owner screenshots exposed a confirmed presentation issue:
opposing grouped goals lost one team's color. The continued TASK-0124 batch
preserves both sides, keeps unknown-side goals neutral, adds minute ranges and
team names, and hides the duplicate event strip while choices are open. The
selected goal now shows its source score separately from the linked graph
capture, including explicit missing-capture wording. Current scores and model
inputs are unchanged. Final 605+13 checks, six Android interactions and recorded
DTO phone-width checks pass. The corrective ARM64 APK is signed and privately
uploaded; Drive metadata/size and the later authenticated download checksum match.
Five later Al Seeb phone screenshots evidence its presentation; continued
dragging/TalkBack acceptance remains. Exact findings and source limits:
[phone follow-up](TASK_0124_PHONE_FOLLOWUP_2026_10_13.md).
