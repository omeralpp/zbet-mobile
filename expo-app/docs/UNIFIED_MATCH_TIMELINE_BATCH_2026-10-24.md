# Single match timeline and compact reports — 24 October 2026

TASK-0188 / NXT-OBS-221/222. Owner ended intake with "bu kadar bu iki talebi
yapalım". Scope is reversible local Mobile/BFF implementation on Android and
desktop web. Owner accepted the design and approved web/APK publication, then
explicitly approved this batch's bounded commit/push in Mobile/CAP/tooling and
the BFF DEV rollout. Final APK signing/private delivery and paired web publication
are authorized for this batch. No SAP/model/production change is authorized.
The accepted a5dca4a client pair and 310a57a BFF remain the retained baseline.

## Result

- Removed the report's match breakdown and its captions. Stars/markets, totals,
  uncertainty and decision history remain. A versioned opt-in BFF header omits
  every nested `byMatch` array; default old-client responses are preserved.
- Replaced the RB1 two-mode pressure card with one integrated "Maçın yolu"
  timeline. Blue/orange five-minute rolling activity, teal period-specific pool
  share, scores, goals/cards/half-time and frozen BTB decisions share one axis.
- A tap/scrub inspects the minute; the existing event rail selects exact frozen
  facts. Phone details appear below; desktop details beside a sufficiently wide
  canvas. Score ribbons simplify on narrow widths; every event remains in the rail.
- Rolling activity is still an estimate excluded from selection/star calculation.
  Native model pressure remains in decision evidence; it is never replaced by
  rolling values. Units are separate from pool percentages, missing windows stay
  gaps, and a missing rolling packet never falls back to native pressure.

The old standalone RB1 chart component is removed. Legacy non-RB1 pressure
display remains for its different contract. No pressure formula, sampling,
selection/star rule, settlement, frozen record or SAP object changed.

## Verification

Registered `invoke-mobile-check.ps1 -BundleOnly`: type/lint/unit/tooling/brand,
Expo Doctor, Android production JS bundle and verified edge web export pass.
Registered `invoke-mobile-bff-check.ps1 -ProductionBuild`: tests/build pass.
New tests cover compact/full semantic equivalence, compatibility/auth/cache,
strict required statistical fields, no native fallback, missing/future windows,
wrong-match packets and activity inspection without invented decisions/scores.

Isolated read-only loopback preview uses real Napoli–Roma data. Direct OData
fallback evidence, not SAP MCP evidence; no SAP source/activation claim. Browser
checks: desktop dark/light, 390px phone dark/light and 320px overflow; one chart,
no mode switch, frozen 54′/2–0/H1/2-star/1.44 decision retained, activity selection
and event selection work. Report details still show stars/markets and no
"MAÇA GÖRE". Screenshots and measurement receipts are in the workspace's
`.codex-artifacts/task0188-*` files (local evidence, not published assets).

Same-source full/compact report has 49 decisions: 194,855 vs 120,731 serialized
UTF-8 bytes (38% smaller). Every other field equals the full response after
removing `byMatch` and request `asOf`. Source verification reads are unchanged;
internal match clustering is still required for uncertainty. Decision-history
growth/pagination is a separate scope, not solved by hiding the breakdown.

## Pending delivery

No new native APK was built, signed, installed or accepted. Browser phone-width
checks do not establish Android touch/TalkBack/performance acceptance. Use
the same clean pushed Mobile commit for the approved coordinated
Android/web release, verify artifact hashes, privately deliver/install the APK
before publishing its matching web build, then collect both owner smokes.
Deploy the opt-in BFF contract under the owner's separate approval; a new client against
the currently running old BFF remains compatible but still receives the larger
payload. TASK-0188 remains open for delivery/acceptance.
