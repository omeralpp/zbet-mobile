# TASK-0011 — Local Jinx analyst batch

The owner explicitly widened M10 for this batch on 2026-09-12: implement a
read-only consistency analyst, select its provider/model and environment key,
validate locally and build one physical-phone ARM64 pilot APK. Observation intake
was empty. This exception does not change M9/M14 or authorize scoring, selection,
decision-log writes, event surprise, deployment or runtime rollout.

## Implementation

`GET /v1/btb/matches/{key}/jinx-outlook` uses the existing authenticated Mobile
router and `mobile.read` scope. It rejects query parameters and malformed match
identities, returns `Cache-Control: no-store`, and calls the existing
`getMatchPath`, `getMatchTeamForm`, and `getMatchSuperLogs` readers on the server.
There is no fourth source or new SAP object. Individual failed reads degrade
independently and retain their source name in the caveat.

The per-match decision reader has a private `outlookEvidence` option that selects
the already-existing `post_score_pool` from the same SuperLog entity. Its public
strict summary shape and field selection are unchanged. The internal envelope
uses the newest decision's `createdAt` as the age of that evidence; it never
substitutes request time for a decision timestamp. Only the most recent decision
is evaluated. Subsequent observations must not be described as known at decision
time. Raw outcomes, profit, names, identity, credentials and base probability are
excluded from the provider prompt.

Gemini `gemini-3.5-flash-lite` supplies a short Turkish headline and consistency
paragraph. The key remains in `BTB_JINX_LLM_API_KEY`; an optional server-side
`BTB_JINX_OUTLOOK_MODEL` override selects the model independently of mascot quips.
The default model is pinned in the server adapter. No new persistent environment
setting or runtime restart was performed. Endpoint is fixed HTTPS, key is sent
only in the API header, and failures never log the upstream body or credential.
Requests have a 6-second provider deadline, 512 output-token maximum, at most
60 generations per process/hour and one new generation/second. A bounded cache
and same-evidence in-flight coalescing apply. The three source reads each have a
5-second deadline, keeping the path within Mobile's existing 15-second deadline.

`jinx-quip.js` adds a separate analyst validator without changing quip rules.
Consistency and tension are permitted; correctness verdicts, advice, predictions,
event-surprise claims, provider-written confidence claims and unsupported digits
are rejected. Invalid provider output produces UNAVAILABLE; it is not cropped or
turned into an invented analysis. The server appends the sufficiency conclusion.

Provider references: [model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite),
[structured output](https://ai.google.dev/gemini-api/docs/structured-output).

## Data sufficiency

- Team Form: each side independently compares `matchesSampled` with that
  response's `minimumReliableSample`. Caveats name `teamForm.home` and/or
  `teamForm.away` with the failing counts.
- Match Path: `initialCohortSize` compares with that response's
  `minimumReliableCohort`. `points: null` means not retrieved; `points: []`
  means the route returned no path yet. They have distinct evidence states and
  caveat text.
- Every source's availability and capture time are checked. This reader's
  freshness budgets are 600 seconds for form, 120 for path and 300 for decision
  evidence. These are operational age budgets, not calibrated model thresholds.
  Missing timestamps and timestamps more than 30 seconds in the future are
  explicitly uncertain. Aggregate freshness never masks an unknown timestamp
  with the current request time.
- `post_score_pool` is inspected independently of `base_prob`. The current
  source publishes **no reliable-pool floor**, so the analyst does not invent
  one or borrow the cohort/form minimum. Its caveat names the pool count and
  missing published floor. HIGH is withheld even for a large pool. Missing,
  zero or one-row pools cap the band at LOW. Other partial evidence is at most
  MEDIUM. Changing base probability cannot change the confidence or prompt.
- TASK-0102/0101 remain outside scope. Only HALF_TIME/FULL_TIME points are
  passed to the provider, with `eventSurprise` renamed to `periodSurprise` in
  the private prompt projection. Event-level fields and red-card points are
  omitted. The caveat always states that event surprise is not measured.

## Validation evidence

- Fixture route tests cover authorization, key/query validation, independent
  source failure, unchanged public summary shape, pool field conversion, null
  versus empty path, each published threshold, freshness, tiny pools,
  base-probability independence, wording refusal, cache/coalescing and malformed
  provider output.
- `scripts/verify-jinx-contract.ts` consumes six fixture variants plus a real
  response through the unchanged Mobile schema and presentation guards. It
  verifies that the detailed caveat survives and an unasked surface remains IDLE.
  No Mobile runtime, schema, query or UI source was changed.
- Full Mobile type/lint/test/tooling/brand check passed. The new verification
  script additionally passed TypeScript and ESLint checks.
- Full BFF tests and production build passed; changed JavaScript passed syntax
  and ESLint correctness checks. BFF is JavaScript and has no separate configured
  TypeScript pipeline.
- Expo Doctor: **19/20, failed**, due to the same 16 Expo SDK patch-version
  mismatches already recorded in the incoming handoff. No dependency versions
  were changed, no exclusion was added, and this is not recorded as a passed gate.
- Direct OData plus local HTTP/provider smoke, 2026-09-12 18:17 UTC:
  match `2026-09-12:3126020:20:00:00`; form samples 5/5 against minimum 5;
  initial cohort 486 against minimum 30; two period-path points; decision pool
  71. Provider and local route returned HTTP 200; outlook DEGRADED, confidence
  0.5. Missing path capture time, old decision evidence and unpublished pool
  floor are named. This is direct OData evidence, **not sap-adt MCP** evidence.
- Physical device smoke is pending: `adb devices` listed no connected device.

## Delivery and remaining gates

The pilot build selects Match Journey LIVE, Team Form LIVE and Jinx LIVE with
mocks off, pilot authentication and the existing `https://api.surklase.com`
route. The build-only prohibition on Jinx LIVE was removed for this authorized
artifact. No BFF runtime was restarted or published. Therefore the public host
does not gain this endpoint from receiving this APK; Jinx remains unavailable
there until a separately authorized BFF rollout.

Artifact verification and batch closure are recorded in CURRENT_HANDOFF.md.
TASK-0011 remains IN_PROGRESS pending the owner's separate commit/push approval.
Do not mark deployment, device acceptance or the existing Doctor failure as passed.
