# TASK-0187 — BFF report availability repair

24 October 2026. Owner authorised local work with “çalışmaya başla” / “devam et”,
then approved the reviewed commit/push and DEV BFF rollout with “Approve”.
BFF `310a57a52a7997932edd90bfe3874fb0ace4591d` is clean, pushed and running in
the owner-only DEV pilot. The accepted Android/web pair remains unchanged;
actual owner checks on both clients are pending.

## Result and implementation

The report reader now batches fixture context/results, decision/settlement
headers and signed proof parts instead of re-fetching each proof separately.
Every report still reads its source evidence from SAP. It verifies the same
immutable first facts, identities, hash/part integrity, result chains and
complete totals through the existing per-decision validator.

After validation, it rereads publication membership, contexts, results and the
global PREPARED guard. A new fixture, result correction or changed state
invalidates the entire snapshot. Unreferenced settlement capsules stay outside
the accounting set, preserving the previous reader's referenced revision rules.

Transient PREPARED / SNAPSHOT_ADVANCED failures get at most one retry with a
200 ms backoff inside the existing eight-second deadline. Failed attempts
cancel their own outstanding work. Retrying uses fresh mutable reads and fresh
manifests. Already verified proof payloads may be reused only within that one
logical request, keyed by the complete manifest and client identity and checked
again for producer permission and time. The request-local cache is bounded to
1,024 entries / 32 MiB and is discarded after the response. It never persists
across polls or callers and cannot refresh a quote timestamp or validUntil.

The global transaction guard remains global. Persistent uncertainty, corrupt
proofs, unsupported source identities and exhausted deadlines still withhold
the report. No partial report is presented as complete. No SAP writer, pressure
calculation, star/model rule, DTO or client source changed.

Report routes also log bounded availability/reason/count metadata alongside
the correlation ID. An HTTP 200 containing UNAVAILABLE is now visible in the
runtime diagnostics. Only fixed reason codes are logged; payloads, headers and
arbitrary provider messages are excluded.

## Same-source comparison

A read-only direct OData baseline captured source rows in memory. The old and
new readers then consumed the identical frozen rows and clock; no source
payload or credential was written to the comparison artifact.

| Same frozen data: 48 decisions, 42 fixtures | Previous reader | New reader |
| --- | --- | --- |
| SAP-style GET count | 723 | 86 |
| JSON wire volume in replay | 13,885,280 bytes | 13,767,021 bytes |
| Published facts and all cohort/combined totals | Baseline | Exact deep equality |

Requests decreased **88.1%**. Bytes decreased only about 0.9% because the same
proofs are retained. This is a round-trip reduction, not a claim of equivalent
bandwidth or SAP CPU reduction. The baseline live read took 3,404 ms. Replay
timings are not network benchmarks; the measured HTTP window is recorded
separately.

## Validation

- Fifteen new regressions cover multiple fixture/query/part pages, exact
  totals, temporary/foreign/persistent transactions, end-of-read overlap,
  advancing contexts, new publications/revisions, corrupt and unreferenced
  proofs, fresh manifest/producer checks, cache bounds/time, cancellation,
  retry budget, stale-quote eligibility and safe semantic HTTP diagnostics.
- Full registered Mobile BFF test and production-build gate passed after the
  final source change. Existing pressure/activity and source identity tests pass.
- The unchanged Android/web client schemas accepted eight isolated HTTP
  responses: v1/v2 report, detail, pressure history, statistics, pool path, Live
  and Overview. An expired statistics response correctly stayed unavailable.
- The existing verified edge web export was reused without rebuilding client
  artifacts; `node scripts/web.mjs verify` passed its mode and secret scan.
- Desktop and phone-width browser checks exercise Overview, Super and recovery
  from a deliberately simulated unavailable report. No JavaScript page errors
  were observed. Live and both pressure modes also passed at both widths;
  switching modes produced zero extra history reads.
- Twenty isolated HTTP checks at 30-second intervals all returned AVAILABLE
  with 48 decisions: zero HTTP failures, zero timeouts and zero unavailable
  reports. Nearest-rank p95 was 3,675 ms, maximum 4,278 ms; 19 checks used 86
  SAP GETs and one early transient overlap used 87. This met the proposed local
  targets in this roughly ten-minute window, including browser test traffic.
  This is bounded DEV evidence, not a guarantee against future uncertainty or
  a substitute for post-rollout owner checks.

Portable summary and source hashes:
[TASK0187_LOCAL_VALIDATION_2026-10-24.json](evidence/TASK0187_LOCAL_VALIDATION_2026-10-24.json).

Local evidence in `C:/dev/btb-cdoex/.codex-artifacts/`:
`task0187-comparison.json`, `task0187-contract.json`, `task0187-browser.json`,
`task0187-http-smoke.json`, `task0187-live-charts.json`; matching diagnostic
scripts are alongside them.
The first HTTP revision's four checks included one transient miss and are
preserved in `task0187-http-smoke-initial.json`; that finding led to the
within-request proof reuse above. Do not count those checks as final acceptance.

## Limits and delivery gate

SAP evidence is direct ADT/OData fallback, not MCP. The report has bounded
request/wire/decoded evidence budgets; growth beyond those budgets still fails
closed and is not hidden by truncation. There is no process-wide proof cache,
cross-caller request sharing or lightweight publication API in this patch.
Pressure/pool observation reads remain separate. Further optimisation is
optional and must be justified by measured remaining traffic.

The approved DEV rollout restarted the registered BFF from exact pushed
revision `310a57a`; the previous revision is `12c3b92`. The first launch failed
because fresh User environment lacked the prior process-only authentication
mode. The registered launcher recovered with explicit `-AuthMode pilot`,
matching the pre-restart mode. Health configuration parity passed for auth,
web, SAP, device registration, notifications, live context and collection mode.
No secret, Access policy or authentication behaviour changed.

Local and public health, v1/v2 reports and Live API all passed. The v2 report
returned 48 verified decisions; public elapsed time was 3,888 ms. The published
web hostname still redirects anonymous access to its existing Access gate.
The restarted runtime emitted the new bounded semantic report log.
See [rollout receipt](evidence/TASK0187_DEV_ROLLOUT_2026-10-24.json).

Actual installed-Android and published-web owner smoke checks remain pending;
they were requested after rollout. No new APK/web artifact is needed for the
unchanged client contract. No SAP write or client publication occurred.
TASK-0187 stays open until both owner receipts exist. The previous BFF revision
and existing client pair remain retained for controlled recovery.
