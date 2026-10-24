# Intermittent report and selection verification warnings

Read-only diagnosis, 24 October 2026. Owner screenshots show Super report,
Live card and Overview warnings. Both Android and web use these shared queries.
No application code, model, SAP data, runtime or delivery was changed.

## Confirmed cause and propagation

The real SAP-backed BFF provider returned `UNAVAILABLE` with
`TRANSACTION_RECONCILIATION_REQUIRED` in 1,576 ms, then `AVAILABLE` with 26
recommendations in 3,092 ms on the next bounded check. The first run started
and ended with zero pending attempts; no persistent pending attempt was
observed. The reason is raised only after reading a nonempty global
`RebuildAttempts` filter `phase eq 'PREPARED'`. A transient pending attempt was
therefore encountered during the read; its exact identity was not captured.

`rebuild-provider.js` checks that global filter in `load` and `currentQuotes`,
without restricting it to the requested fixture. One failed fixture load
rejects the whole cohorts report. Active SAP `ZBET_CL_RB_RUN` explicitly writes
PREPARED before decision work and acknowledges it after a known commit or
abort. The BFF check does not distinguish a short ordinary in-progress attempt
from an abandoned/uncertain attempt. Do not remove this reconciliation guard.

Deterministic local reproduction using the existing RB1 fixture:
report AVAILABLE -> add PREPARED for a different fixture -> report UNAVAILABLE
with the same reason -> remove the simulated row -> report AVAILABLE.
This simulation changed only test memory, never SAP.

`usePublishedSelections` and `RebuildDecisionLog` share
`rebuildCohortsReportQuery`. An unavailable report disables verified selection
display across Overview, Super and Live cards; it does not prove that no
recommendations exist. The screenshots alone cannot identify every historical
failure reason; timeouts are also present in the running BFF log.

## Measured read cost

| Observation | Measured result |
| --- | --- |
| Successful full cohorts report | 375 SAP GETs, 3,092 ms, 26 decisions |
| Failed report | 361 GETs initiated before return, 1,576 ms; other workers continued briefly |
| Selected match pressure history, activity enabled | 12 SAP GETs, 374 ms, 16 intervals / 69 observations |
| Additional five-minute activity calculation | 18.09 ms over the same 85 decoded captures; no additional SAP reads |
| Runtime log report requests | 76 requests, 1 HTTP error, p95 6,263 ms, maximum 8,004 ms |
| Runtime log Live list requests | 79 requests, 3 HTTP errors, p95 8,024 ms |
| Runtime log dashboard requests | 28 requests, 3 HTTP errors, p95 8,189 ms |

These are diagnostic samples and current runtime-log observations, not a SAP
capacity benchmark or an estimate of all user sessions. HTTP 200 report
responses may still contain semantic UNAVAILABLE, so HTTP error counts alone
understate the visible warnings. The router's default provider timeout is
8,000 ms. The report scans and verifies accepted decision histories again on
each call; there is no shared verified-report cache in this path. At the
current 30-second report refresh, two calls of the successful sample's size
would mean about 750 SAP GETs per minute per independent client cache.
Actual traffic depends on mounts, manual refreshes, source changes and clients.

## Pressure hypothesis

The two chart tabs are render modes over one `pressure-history` response.
Switching mode calls only `setMode`. The native intervals already exist; rolling
activity is derived in BFF memory from their observation captures. It does not
start another provider acquisition, SAP writer or model evaluation. The focused
live detail requests pressure history every 60 seconds, current statistics
every 30 seconds, and pool path separately every 60 seconds. History reads do
add traffic, and pressure/pool paths read overlapping evidence, but the second
chart calculation is not the reproduced report rejection trigger.

## Evidence and limits

- MCP readiness passed with 13 visible SAP tools, but the tool set offers no
  existing-object source/table reader for this diagnosis. All live SAP evidence
  here is **direct ADT/OData fallback, not MCP evidence**.
- Active source GET: `ZBET_CL_RB_RUN`, SHA256
  `B1AE693F73867116109646D6A8122B70BC5D8C4F8777EEAA8AD27906939E35F7`.
- Local diagnostic files in `C:/dev/btb-cdoex/.codex-artifacts/`:
  `pressure-diagnostic.json`, `pressure-diagnostic-followup.json`,
  `pressure-diagnostic.cjs`, `pressure-diagnostic-live-rb-run.abap`.
  Evidence contains no credentials, keys or authorization headers.
- Existing provider / pressure-history / pressure-activity tests: 29 passed.
- No SAP CPU, work-process saturation or database-load measurement was taken;
  system overload is not established.

## Bounded follow-up

NXT-OBS-220 / TASK-0187, owner `btb-mobile`: improve BFF read availability and
reduce repeated proof reads while preserving all evidence and reconciliation
requirements. Evaluate bounded stable-read retries, cancellation of sibling
workers after failure, shared in-flight reads and caching immutable verified
captures with fresh mutable-state verification. Avoid making every live card
depend on rebuilding the whole statistical report. Do not reactivate stale
selections or suppress a genuine uncertain transaction. Any necessary change
to the SAP writer/guard belongs to BTB and retains its separate approval.
No pressure/model tuning is justified by this diagnosis.
