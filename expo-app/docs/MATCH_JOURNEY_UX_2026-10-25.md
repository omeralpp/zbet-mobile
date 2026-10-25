# Maçın yolu UX — 25 October 2026

Owner: BTB Mobile Next. Status: COMPLETE — Android installed/accepted, matching
web published/accepted, and canonical paired-release completion passed.
Baseline: delivered client pair `3f53834`. The owner's request covers only this
section's UX on Android and desktop web. The subsequent owner approval below
authorizes its bounded Git and paired pilot delivery steps.

## Design and behavior

- Clear reading order: match rhythm and reference context, key moments, then the
  timeline and the selected event. Quiet supporting information and stronger
  selected states replace the competing header legend and dense captions.
- Previous/next controls visit every retained event, including separate decisions
  at the same minute, and stop at the ends. The event strip follows selection.
- Wide cards show event details beside the chart. Narrow cards show them directly
  below the event strip, before the chart, to keep a tap's result close to its
  control. Both surfaces expose the same information and actions.
- A blue cursor and minute label identify the inspected time. Nearby tick labels
  yield to the cursor. Crowded decision markers show a neutral time range and
  count, rather than overlapping quotes or one member's stars/result.
- The selected card separates minute, historical score, selection, frozen odds,
  result and hypothetical units. Reading guidance and symbol legend are disclosed
  on demand. Missing measurements remain missing.

Changes are limited to `MatchPathCard`, its activity summary, and a small tested
navigation helper. There are no backend, contract, source-data, model, star,
activity-formula, pool, or settlement changes. Pool percentages remain reference
support, activity remains an estimate excluded from selection, and stars remain
consistency/evidence quality rather than winning probability.

## Verification

Registered `btb-codex/scripts/invoke-mobile-check.ps1 -BundleOnly` passed:
TypeScript, ESLint, unit/tooling/brand checks, Expo Doctor, Android production
JavaScript bundle, and `node scripts/web.mjs export` with embedded edge-auth
verification and secret scan. `git diff --check` passed.

Browser checks used a temporary, explicitly synthetic match scenario matching the
owner's example, plus the existing synthetic live match route. Desktop dark/light
and 390px phone dark/light were inspected; 320px and 390px page widths had no
horizontal overflow. Previous/next, exact frozen 52′/58′ facts, end disabling,
keyboard activation, chart-minute inspection, decision-ID callback, and
collapse/expand passed. The temporary scenario route was removed before the final
quality gate. No mock scenario is included in the candidate or exported app.

Local evidence in the workspace's `.codex-artifacts/`:
`match-journey-ux-20261025-{desktop,light,phone,phone-light}.png` and
`match-journey-ux-20261025-quality.log`. Screenshots demonstrate sample UI only,
not current SAP state, live performance or model acceptance. Native device,
TalkBack and production performance smoke are still unverified.

Owner approved the design on 25 October after confirming that the phone chart
remains below the selected-moment card ("Tamamdır onayliyorum"). The owner then
explicitly approved all named steps ("Onaylıyorum tüm adimlari"): bounded Mobile
commit/push, APK build/signing and private delivery, and matching web publication
for the owner-only pilot. This approves no BFF code rollout, SAP/model change,
Access-policy change or production deployment.
Both final artifacts were built/verified from clean pushed `3f3b5fd`. Private
delivery/readback passed; the owner confirmed APK installation/basic smoke before
matching web publication. Served-byte, protection and health checks passed.
The owner then supplied a real-match web screenshot and confirmed that it looked
correct and could be closed. Both basic client smokes and `client-release.mjs
complete` passed on 25 October. The previous accepted pair is retained; no further
release is authorized by this closure. [Delivery](MATCH_JOURNEY_UX_DELIVERY_2026-10-25.md).
