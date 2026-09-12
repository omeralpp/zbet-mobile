# TASK-0011 — Seven-source football commentary

Owner authorization on 2026-09-13 extends the M10 exception through implementation,
commit/push, controlled existing pilot BFF restart, public checks, one ARM64 APK
and rollout-evidence commits. Gemini stays unchanged. No production, new SAP
object, scoring/selection change or analyst feedback into decision logging.

## What changed

Jinx now composes seven existing readers: match-path, team-form, super-logs,
match detail, period-score, league-context and live-context. Each request has its
own failure boundary. The live-context reader uses the same SAP bridge, identity
resolution and cache as its existing route, not a new provider pipeline.

The explicit private projection includes possession, shots/on-target/xG, corners,
cards, pressure, score and status, decision context, score distribution and phase
ratios; form goal profiles, BTTS/over-2.5 percentages, rest days and recent results;
half-time score; standings; and the existing live goal/card timeline without
person identities. Score-distribution ratios are converted to named percentage
fields on the server, so Gemini need not invent converted numbers. Event surprise
is not available or claimed. Completed-period context stays separate from event
facts. `decisionConfidence` is included only as explicitly uncalibrated decision
context; tests prove it cannot alter Jinx confidence.

The prompt asks a Turkish football commentator to choose the strongest contrasts
in the actual data. It does not encode the owner's examples as decision rules.
It avoids the first version's generic reason-comparison apology. Advice,
correctness verdicts, future certainty, event-surprise and unprovided numbers
remain refused. The numeric allowlist now excludes timestamps, reason strings and
descriptions. Observed red-card counts can be mentioned; surprise cannot.

Reported zero xG is not treated as proof of chance quality or goal causation:
the existing mapper can default missing coverage to zero. A named xG caveat
preserves this limitation. `lastUpdatedAt` on match detail is the response snapshot,
not the measurement timestamp; it cannot erase unknown measurement freshness.
Pressure has its own capture-time check. Every new source checks availability,
published capture time and any published sample/cohort threshold, using only that
source's own sample. Unpublished thresholds are not invented. Existing pool guard,
separate form-side minima, null versus empty paths and aggregate freshness remain.

Seven named source caveats can exceed the old 400-character caveat guard. The
server and Mobile caveat allowance is now 1,200; paragraph and headline limits
stay unchanged. The schema, request-on-ask behavior and other Mobile UI stay intact.

## Form strip finding

The ordering is intentional: `TeamFormCard.tsx` sets HOME `OLDEST_FIRST` and AWAY
`NEWEST_FIRST`; the existing `team-form-view.test.ts` explicitly documents the
mirrored centre-oriented reading. Under the owner's condition to align them only
if the reversal was not intentional, no form order or caption was changed.

## Pre-restart validation

- Mobile type/lint/brand passed; 583 Mobile and 13 tooling tests passed.
- BFF full tests and production build passed; 21 focused Jinx tests and syntax/
  ESLint correctness checks passed.
- Six fixture variants plus a real response passed the Mobile schema and current
  wording/caveat guards. Null, empty, absent, stale, tiny-pool and source-specific
  failures are covered. Identity fields and provider names are not sent to Gemini.
- Doctor **FAILED: 19/20**, with 16 known Expo patch-version mismatches. It is
  not a historical pass, waived check or hidden exception.
- Live direct-OData/provider smoke at 2026-09-12 23:01 UTC, match
  `2026-09-12:3213471:00:00:00`: HTTP 200, Gemini HTTP 200, DEGRADED, confidence
  0.5. The commentary compared away 8 shots/7 corners with home 3 shots/2 goals.
  Match Path and league-context gaps were named; other sources remained usable.
  Evidence is direct OData and local HTTP, not sap-adt MCP source inspection.

Final pushed SHA, process identity, public readback and APK verification are
recorded in CURRENT_HANDOFF.md after the mandatory restart and artifact build.
