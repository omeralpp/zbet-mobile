# Core BTB UX and short Jinx V3 — local implementation

Owner requested implementation on 2026-10-17 after selecting the core BTB flow,
existing visual identity, displayed selection only, ask/refresh interaction and
validated economic value as the prerequisite for a favorable recommendation.

## Delivered source behavior

- Android and web share compact match cards, readable market names, team/league
  search, an explicit no-selection message and a focused Overview without the
  decorative hero. Odds movement uses analytical color rather than won/lost color.
- Match details use one BFF analysis-context snapshot for all nine screen sources.
  Jinx sits below the selection, outside reorder/collapse preferences. A compact
  score/selection header remains above scrolling content. The journey starts open;
  secondary panels start closed only when there is no saved preference. Reset
  restores these defaults; existing secondary-module order/collapse choices survive.
- Super labels distinguish recorded odds, current conditions and settled outcomes.
  Historical score shares are labeled as historical, not forecast probabilities.
- Jinx V3 returns FAVORABLE / UNFAVORABLE / WAIT, a maximum 240-character reason,
  an optional 120-character risk and up to two grounded evidence facts behind an
  explicit disclosure. Match/selection changes, evidence revisions and expiry
  invalidate the previous assessment. Opening/focusing/polling never generates it.
- V1/V2 routes and guards remain supported. A provider failure preserves the
  approved policy verdict with a deterministic explanation. A WAIT makes no
  commentary provider call. Estimated interval pressure retains its caveat.

## Boundaries and upstream prerequisites

No approved value policy is registered in the current runtime. Live V3 therefore
returns WAIT with its missing prerequisite; stars, legacy BASE_PROB, historical
pool shares, pressure and an upstream response timestamp cannot enable FAVORABLE.
Probability, odds and quote-state evidence must match the displayed selection and
score/minute/card state, pass source age/sample checks and belong to an explicitly
registered BTB policy. No model, selection, learning or SAP object was changed.

The future BTB adapter is `getMatchValueEvidence`; policy registration is server
configuration (`approvedValuePolicy`), never client input. Its required fields are
documented in OpenAPI and covered by synthetic tests. Economic parameters in the
tests are TEST_ONLY and are not approved production/pilot parameters.

Phase 0 now has a canonical weekly scorecard (`market_scorecard.py`, latest report
week 2026-10-05..11). It defines the decision units, match-clustered ROI intervals,
no-skill baselines and provenance. Its closed calendar-week and pooled-trend output
does not supply TASK-0156's rolling 7/30-day windows or a runtime BFF data feed.
Those real-data fields await the corresponding BTB output; probability/fair-price/EV
separately await the approved Phase 2/3 policy and evidence. No local denominator,
weekly-to-rolling conversion or validated probability is invented. TASK-0156 retains
its OPEN status with a dated evidence gate (next read-only review 2026-10-19);
independent UI preparation remains possible.

The newer BTB findings do not change this boundary: TASK-0157 concerns censored
17.45 long-shot prices on open markets, not a closed-market placeholder;
TASK-0159 concerns missing provider market-state checks in the core odds parser.
V3 requires explicit OPEN quote-state evidence and cannot infer it from a price
or a recent response timestamp. Their model/parser fixes remain owned by BTB.

Snapshot acquisition does not assert simultaneous provider measurements. Snapshots
are subject/match scoped, expire after 120 seconds and are held in a bounded
128-entry memory store. Optional reader failure is explicit and does not remove
the core match. A missing/expired snapshot returns 409; the next explicit ask
refreshes it. No new transport, host, credential or provider is introduced.

## Verification and release

Verification commands: registered Mobile gate `invoke-mobile-check.ps1 -BundleOnly`
(type/lint/unit/tooling/brand, Doctor, Android JS bundle, verified edge web export);
full BFF Node tests; CAP build; cross-repo `verify-jinx-contract.ts`; mock browser
smoke at desktop and phone width. Local run receipts are under
`.codex-artifacts/ux-jinx-2026-10-17/` in the workspace. Browser preview is synthetic,
not authenticated pilot/SAP evidence or physical Android acceptance.
Desktop and 390x844 screenshots are `desktop-preview.jpg` and `phone-preview.jpg`
in that folder; the local mock preview is `http://127.0.0.1:8092`.

At the local validation checkpoint the source was unstaged/uncommitted. The owner
approved scoped commit/push on 2026-10-17; exact heads and remote verification belong
to the workspace verification receipt above. The installed APK, published web client,
pilot BFF runtime and previous accepted Android/web recovery pair were not changed.
After the approved Git batch: obtain the separate final build/sign, BFF runtime and
coordinated Android-delivery/web-publication approvals. Deliver
and verify installation of the matching APK before publishing web. Close the
release only with both actual smoke receipts. Physical TalkBack, native interaction,
real-data latency and owner usability acceptance remain release checks.
