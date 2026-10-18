# Pressure display and event wheel investigation — 2026-10-18

Owner finding: Karlsruhe–Darmstadt 98 shows no pressure history; horizontal mouse
input moves once in each direction and cannot traverse the event rail.

## Current outcome after explicit display acceptance

The owner subsequently authorized separate Mobile display acceptance and the
BFF update now, retaining the 27 October Super/model evaluation gate. The
display-only sealed configuration and BFF `4`/`04` normalization are active from
13:25:22 UTC. Local/public routes pass shared client schemas: Karlsruhe has 13
valid historical samples, 8 directional marks and the 56′ Super interval. A
separate live public-route check on Osasuna–R. Santander returns valid current
pressure. Details and recovery: `zbet-cap/docs/MOBILE_PRESSURE_DISPLAY_2026_10_18.md`.

The diagnosis below describes the pre-approval state. Original BTB manifests and
the model/performance gate remain unchanged; Mobile visibility has a separate
receipt. Client wheel/UX publication and physical Android/authenticated browser
acceptance remain pending.

## Confirmed pressure evidence

Read-only direct ADT/OData evidence (fallback, **not SAP MCP evidence**). Readiness
passed with 15 visible SAP tools, but none returns existing source/data. No SAP,
model, BFF runtime, sealed manifest or acceptance setting was changed.

Exact match: `2026-10-18:3217608:14:30:00`. The bounded initial read returned 31
journey snapshots, 25 observation captures, 7 decision captures and one Super log.
All 32 complete native captures decoded with their stored hashes and partitions.
14 had valid interval pressure; others contained explicit unavailable reasons.
The later OData/BFF read returned 33 points as the match continued; these are
separate read times, not a claim of an atomic same-frame snapshot.

At 56′, score 3–0, the persisted `Ms35a`, 4-star Super binds exactly to decision
`5DF222E22FD890AF91DB99531AB69083075E3A3E6AE0F372F8A0F0785B9A5295`.
That capture has valid estimated interval pressure over 180.7676 seconds:

| Value | Captured value | Persisted Super log |
|---|---|---|
| Home pressure | 0.149363049573043 | 0.15 |
| Away pressure | 0 | 0.00 |
| Pressure adjustment | independent A3 replay agrees | −0.10 |
| Final score | independent A3 replay agrees | 23.40 |

Units: `EST_SAMPLED_ACTIVITY_PER_MIN`. These are estimated counter-based activity
rates, not provider-proven pressure measurements or calibrated probabilities.
The actual active `ZBET_CL_MAIN` source copies the admitted A3 pressure adjustment
and the observed interval values into the selected Super. Invalid pressure or
failed state/coherence checks cannot authorize a new selection.

Independent `observed_shadow.py` replay of all seven decisions compared **532
candidate branches with zero disagreements and zero decode/replay failures**.
This is bounded technical evidence for this match, not universal correctness or
economic validation. Local pressure edge-case tests: 15 passed; BFF native
capture/observed context/sealed-policy guards: 18 passed.

## Why the chart is empty

The live records identify scorer `45AEFC22…` / observer `DE026A0B…`. Host User
configuration points to the correctly sealed accepted maintenance manifest
`PRESSURE_PATH_MAINTENANCE_20261015.json`, scorer `2DC743F7…` / observer `2E843753…`.
The provider, exercised against real read-only OData with that configured policy,
rejects the new observations with `CAPTURE_REGIME_MISMATCH`. Every one of the
initial 32 decoded native records is rejected by that policy. The later journey
DTO contains 26 version mismatches and 7 unaccepted/unavailable contexts.
This run does not attest the environment of an already-running BFF process.

The new `PRESSURE_PATH_CEILING_20261017.json` declares native acceptance but
**accepted_observed_capture=false**. TASK-0152 retains the 2026-10-27 evidence
gate. Changing the acceptance flag, substituting a producer SHA or using legacy
cumulative pressure would bypass that boundary and is not the correction.

BTB must review the exact current producer/capture cohort and its existing gate.
After acceptance, the explicitly approved BFF configuration can adopt a sealed
manifest. Then verify current/history/Super contexts with real OData and both
authenticated clients. This was the dependency before the separate owner-approved
Mobile display acceptance recorded above.

Client correction: rejected records no longer say that pressure was never
measured. The chart gives a wrapping version-mismatch status and the selected
record explains the reason; unknown values remain null. State resets, unchanged
counters, missing counters and stale intervals have distinct explanations.

## Confirmed wheel defect and local fix

The old lock measured inactivity since the latest input. Continuous same-direction
ticks refreshed that timestamp indefinitely, so only reversal released the lock.
The fix measures time since the latest **advance**, permits sustained/renewed
input to repeat at most four times per second, and suppresses decreasing inertia.
Vertical scrolling and Ctrl/Meta zoom are untouched. Native touch gestures use
their existing independent input path.

Regression checks traverse six events both ways, including distinct events at
the same minute, quick reversal, bounds, small steps, unit conversion, noise and
a long decaying coast. Mock web browser native horizontal-scroll input traversed
**1→2→3→4→5→6→7→8 and 8→7→6→5→4→3→2→1**; the first/last arrows disable correctly.
This is actual browser wheel input, not a synthesized DOM event or just arrow
clicks. Physical Android acceptance remains pending.

## Evidence and release boundary

Workspace `.codex-artifacts/ux-review-2026-10-18/`: `pressure-match.json`,
`pressure-snapshots.json`, `pressure-heads.json`, `pressure-super.json`, complete
`pressure-record-*.json`, `pressure-review.json`, `pressure-replay.json`,
`pressure-bff.json`, `live-main.abap`, `live-pressure.abap` and the bounded reader
scripts. Credential material is not recorded. Quality receipt:
`pressure-wheel-quality.log`: registered BundleOnly gate **passed (exit 0)**,
including type/lint/unit/tooling/brand, Doctor, Android production JS bundle and
verified edge web export/config/secret scan. Existing accepted Android/web pair is unchanged;
the fix is local source only. No commit/push, signing, delivery or publication.
