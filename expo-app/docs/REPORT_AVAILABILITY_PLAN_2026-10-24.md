# Report availability repair plan

24 October 2026. TASK-0187 / NXT-OBS-220, owner `btb-mobile`.
Status: COMPLETE; approved DEV rollout and both actual owner client checks passed.
See [implementation and receipts](REPORT_AVAILABILITY_IMPLEMENTATION_2026-10-24.md).
Baseline: [diagnosis](REPORT_AVAILABILITY_DIAGNOSIS_2026-10-24.md).

## Intended result and scope

Reduce repeated SAP evidence reads and avoid visible report outages caused by
short, ordinary maintenance overlap. Preserve genuine reconciliation failures,
freshness rules, immutable decision facts, result revisions and complete report
totals. Overview, Super and Live must recover together on Android and web.

Start within `zbet-cap/srv/mobile-bff` and its tests. Keep both pressure modes,
their calculations, model admission and stars unchanged. An initial BFF-only
repair preserves the existing client contract. A separate lightweight
publication endpoint/client migration is a later option only if this bounded
repair fails its measured goals; it is not part of the initial implementation.

## 1. Freeze reproduction and measurement

- Add deterministic regression cases for a temporary PREPARED attempt, a
  persistent/uncertain attempt, changing snapshots and recovery. Include an
  attempt on another fixture: the existing global protection must survive.
- Measure SAP GET count, wall time, bytes, semantic availability/reason and
  timeouts for full reports, Live, Overview and pressure history. Add safe
  aggregate diagnostics; never log secrets, raw payloads or request headers.
- Use the recorded 375-GET / 3.092-second report as a historical baseline;
  compare before/after on the same fixture set and source revisions.

## 2. Reduce duplicate work first

- Add bounded request-local reuse of immutable capture/proof reads; evaluate
  a bounded in-memory cache shared by the provider instance for repeated polls.
  Key it by full capture/source identity and accepted policy/producer scope.
- Cache only verified immutable evidence. Recheck mutable context, publication
  membership, result chains, accepted identities and transaction state against
  SAP. A cache hit must never renew source time or selection validity.
- Reuse overlapping observation evidence between pressure history and pool
  path where compatible. Keep calculations and wire shapes unchanged.
- Coalesce identical in-flight work only within compatible source/options and
  caller scope. One caller disconnecting must not cancel another caller's read.
- Stop scheduling sibling workers after a failure and cancel exclusively owned
  outstanding requests; no background scan may continue after a failed report.
- Bound cache entries/bytes, define eviction and ensure a cold process still
  behaves correctly. No persistent evidence deletion or retention-policy change.

## 3. Handle short transaction overlap within the existing deadline

- Keep the global PREPARED check and before/after consistency checks.
- When a read encounters PREPARED or a changing snapshot, allow at most one
  bounded retry with a short backoff, only if enough of the existing 8-second
  request budget remains. Retry against freshly read mutable state; reuse only
  immutable evidence that remains eligible under step 2.
- Return verified results only after all required checks pass. A persistent
  pending attempt, uncertainty, corruption or exhausted deadline still returns
  unavailable. Age alone never proves that an attempt is safe or abandoned.
- Do not raise the timeout, remove the guard, filter away unrelated pending
  attempts, return a partial report as complete or promote stale selections.

## 4. Validate correctness and performance

- Run targeted regression tests, then required BFF tests/build and contract
  checks. Compare all published facts, totals, cohort summaries and latest
  result revisions against the unmodified reader on identical inputs.
- Cover transient/persistent attempts, result corrections, new publications,
  snapshot advancement, unsupported producer, malformed parts, cache poisoning,
  policy transitions, cancellation, deadlines, concurrent callers and eviction.
- Validate the unchanged clients at desktop and phone widths, then use the
  owner-only pilot to check actual Android and web: Overview, Live, Super,
  refresh, filter/count recovery and both pressure tabs.
- Proposed acceptance targets: at least 70% fewer SAP GETs on a warm unchanged
  report; warm report p95 below 4 seconds; no 8-second timeout across 20 normal
  refresh intervals in the measured pilot window. Record cold/warm results and
  all semantic failures separately. These are targets, not established results.
- Safety acceptance is mandatory: persistent uncertainty remains blocked;
  transient overlap recovers when a verified snapshot can be obtained inside
  the deadline; no stale or partial data becomes an active selection. If the
  bounded retry cannot meet availability, report that limit and design a
  separately owned SAP transaction-state contract rather than weakening checks.

## 5. Review and release

Deliver the local patch, test results, before/after measurements, remaining
limits and rollback instructions for review. Commit/push and DEV BFF runtime
publication retain their separate explicit approvals. Retain the previous BFF
revision/configuration for coordinated recovery.

A BFF-only repair requires both client smoke checks but no new APK/web artifact.
If client source changes become necessary, keep Android/web parity in one batch,
run the required Android checks and verified web export, and follow the existing
coordinated release rules from one clean pushed client commit, with explicit
approval covering both deliveries and both smoke receipts.

The subsequent owner messages authorised local implementation, then “Approve”
authorised the reviewed Git and DEV BFF rollout gates. Both are executed;
owner confirmed "Both Android and web work" on 24 October. No SAP/client release.
