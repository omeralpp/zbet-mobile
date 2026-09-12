# Jinx Analyst — Readiness at the M10 Gate

Prepared `2026-09-12`. This states exactly where the centralized read-only Jinx
match analyst (`TASK-0011`) stops today and what the first step is when its gate
opens, so that day is implementation rather than rediscovery.

**It approves nothing.** `TASK-0011` is `M10`-gated with risk `DEPLOYMENT`.
Provider/model/budget selection, server-side credentials, live snapshot access,
runtime rollout and deployment each remain separate gates.

## The gate, and why it cannot be shortened

`M10` waits on `M9`, which waits on `M14`. `M14` criterion 2 is calendar-bound:
the exactly-`100` bin needs `n = 96` under a pre-registered stopping rule and
held `32` on `2026-09-12`, accruing about two rows a day. Mid-October is the
planning figure. `CRITERION_2_STOPPING_RULE_2026-09-10.md` forbids revising the
floor downward once evidence accumulates.

`M9` must precede this work for a reason worth restating: `base_prob` feeds
every rating, so ROI measured on an uncalibrated probability is not ROI. An
analyst built on it would inherit the same defect and sound confident about it.

## What is already built

| Piece | Where | State |
| --- | --- | --- |
| Response contract | `src/api/schemas.ts:713` `jinxMatchOutlookSchema` | done |
| Client call | `src/api/http-mobile-api.ts:171` → `GET /v1/btb/matches/{key}/jinx-outlook` | done |
| Synthetic/real switch | `src/api/index.ts`, `runtimeConfig.mobileIntelligence` (default `OFF`) | done |
| Validators and states | `src/mascot/jinx-match-outlook.ts` — `acceptHeadline`, `acceptBody`, `acceptUncertaintyNote`, `resolveOutlookState`, `confidenceBand`, `outlookFreshnessNotice`, `informativeOnlyNotice` | done |
| Surface | `src/components/AskJinxCard.tsx` with `OriginBadge`, `CaveatLine`, `SystemState` | done |
| Provider path | `zbet-cap/srv/mobile-bff/jinx-quip.js` — single adapter, env key, fail-closed, per-boundary cache, validator rejecting advice/prediction phrasing and ungiven digits | done, mascot wording only |

The surface is deliberately pull-based: the outlook is fetched only when the user
asks, because one appearing on its own would read as a recommendation.

## The single missing piece

`GET /v1/btb/matches/{key}/jinx-outlook` **does not exist**. The string
`jinx-outlook` appears nowhere in `zbet-cap`. Mobile calls a route that has never
been implemented and currently runs the synthetic branch.

So the first step at the gate is one route in the Mobile BFF, returning a payload
that satisfies `jinxMatchOutlookSchema`, backed by real analysis rather than
fixtures. Mobile needs no change to consume it — only `mobileIntelligence`
flipped off `SYNTHETIC`.

## Order when the gate opens

1. Implement the BFF route against the existing schema, still fixture-backed, and
   prove Mobile consumes it unchanged.
2. Replace the fixture source with real analysis. This is the part `M10` gates,
   because it is model-adjacent.
3. Provider, model and budget selection: separate approval. The adapter exists so
   this is a one-file change.
4. Rollout and deployment: separate approval. Never inferred from a pilot.

## The one guard worth building in from the start

The surface already refuses to show a raw percentage: `confidenceBand` collapses
confidence to `LOW` / `MEDIUM` / `HIGH` precisely because "a percentage on an
informative reading invites arithmetic the reading cannot support", and
`uncertaintyNote` is rendered and never summarised away. That absorbs most of the
known calibration error, since the `>= 0.65` boundary sits near a region that
realises about `0.60`.

One case is not absorbed. `base_prob` can reach `100.0` from a single supporting
row, and the exactly-`100` bin realises **`40.62%`** on the forward evidence. Fed
straight through, that reading renders as `Yüksek güven` on something right about
two times in five — the worst possible pairing of tone and truth.

The fix does not wait on `M14`, because the cause is not calibration but sample
size. **Do not let a small `post_score_pool` reach the `HIGH` band.** Gate it on
pool size in the route, or hand the band a confidence already damped by pool, and
say so in `uncertaintyNote` when it fires. One condition, written once, at the
point the route is first built — far cheaper than retrofitting it after the
readings have been trusted.

## Do not

- Do not surface an outlook that appeared without the user asking.
- Do not let the key reach the client, source, logs, handoffs or the APK. The
  last APK scan over 1321 entries found no key, provider host or model id.
- Do not let the analyst feed anything back into scoring, selection or logging.
  `Get Prediction from Jinx` stays informative only, per the owner's `2026-09-02`
  reconfirmation.
