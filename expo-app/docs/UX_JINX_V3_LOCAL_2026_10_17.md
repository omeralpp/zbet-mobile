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
  approved policy verdict with a deterministic explanation. A missing-policy or
  missing-value WAIT still receives factual match commentary on explicit ask;
  stale/conflicting/unverified contexts do not. Estimated interval pressure
  retains its caveat. The editor selects grounded facts and cannot change the verdict.

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

The owner approved scoped commit/push and then completion of the coordinated
owner-only pilot release on 2026-10-17. The first candidate was privately delivered
but failed the owner's usability review; its companion web was not published.
Corrected BFF 71732a6 is now active; local/public actual-data snapshot and V3 schema
smokes passed. The prior accepted Android/web recovery pair remains retained.
The replacement client must be built from a new clean pushed commit. Verify private
APK delivery and actual installation before publishing its matching web artifact.
Close the release only with both corrected client smoke receipts. Physical TalkBack,
native interaction, real-data latency and owner usability acceptance remain release
checks, never inferred from mock browser checks.

## Owner phone correction — NXT-OBS-163/164

The owner reviewed the privately delivered 93e8330 APK on R.Sociedad B–Almeria
(87′, 1–3) and reported excessive journey length and unhelpful Jinx commentary.
TASK-0160 remains incomplete; the matching web candidate is not published.

The local correction removes the duplicate score header inside the journey,
reduces the plot height, and opens selected-event/point detail in an inspector
from a graph tap. Scrubbing still updates the readout without opening the panel;
vertical motion still scrolls the page. Closing the inspector preserves page
position. Its horizontal event choices retain every goal/card/Super, including
coincident events. The full duplicate timeline opens only on demand.

Jinx leads with the displayed score/minute and what changes the selection's score
condition, then a concrete grounded observation when available. For the owner's
example it explains that one more goal breaks 4.5 under; the separate short risk
line says that the displayed 1.20 price lacks validated value evidence. WAIT
therefore gates a new wager without suppressing match interpretation. Technical
source status is a second disclosure, rather than nine default explanation rows.
Neither this local correction nor the screenshots accept either client smoke or
authorize an economic policy. A corrected release must rebuild and verify both
artifacts from its new clean pushed client commit.
