# Android and web refinement batch — 23 October 2026

Final status: COMPLETE, source `26f491c`, after exact APK installation and both
owner smokes on 2026-10-23. Web `20261023T195703Z-26f491c`; BFF code `35ed90c`.
See [paired release evidence](evidence/JURY_REFINEMENT_RELEASE_2026-10-23.json).
Owner accepted the dated 87 score; TalkBack/text scaling and source cadence
remain follow-ups. Earlier phase statements below are historical checkpoints.

Initial status: LOCAL_VALIDATED / NATIVE_AND_OWNER_ACCEPTANCE_PENDING. Owner explicitly authorised starting
the consolidated improvements after observation collection. Frozen scope:
NXT-OBS-200..213 and JURY_DESIGN_REVIEW_2026-10-23.md. Existing unrelated work
is preserved. Targets: Today, period-correct historical scores, pressure cause
and possession, compact hierarchy, readable metadata, desktop composition,
non-obstructing overlays and proportional accessibility checks.

Repositories: zbet-mobile client/contracts/docs and zbet-cap Mobile BFF/tests.
No model change, SAP write, Git stage/commit/push or release is authorised.
The existing b501352 accepted Android/web pair remains the delivered version.
90+ is a design target; no score or physical acceptance is assumed in advance.
Subsequent jury re-audit: **87/100, refinement required**, documented in
`JURY_REAUDIT_2026-10-23.md` / NXT-OBS-214. Local check passes do not close
the newly reproduced responsive and state-presentation findings.

Plan: preserve existing contracts with opt-in headers for additional report
periods and pool score distribution; aggregate display-only verified reference
counts in BFF; improve shared client sections for both surfaces; run client
type/lint/tests/doctor, BFF tests/build, Android bundle and verified web export,
then browser review at phone/desktop widths. Physical and published-client
checks remain separate from local validation. No signing or distribution.

Evidence mode: sap-adt readiness reports 14 visible tools, but none reads
existing active object source. Active source is read through the catalogued
get-abap-source.ps1 GET fallback, never described as MCP object evidence.
ZBET_CDS_SCORE_001 active hash C42D675B3EC539191EE134AE86D74DB3D6AC6B70E7CFBACC2E55E88CD7393C67;
ZBET_CDS_002 active hash 36F9746625BABA7EED6C95796DA2320E38EAFCA1A05F7B1FF5730544E14895D1.
The legacy score table is produced from full-time outcomes. First-half display
pool records already carry historical half-time scores; never relabel the
legacy full-time score distribution as half-time.

## Implementation

- Today uses an additional backend days=1 period at Istanbul midnight, with
  exact existing result accounting. `X-BTB-Report-Periods: today.v1` opts the new
  client into 1/7/30-day combined/cohort periods. Absent preserves old v2 and v1
  response shapes. Learning and frozen recommendations are unchanged.
- `X-BTB-Pool-Distribution: score-distribution.v1` adds nullable period-specific
  outcome counts/shares to the verified pool-path read. Half-time scores come
  from native display-path 1H members; full-time scores from 2H members. The
  newest missing pool never revives an older one. Client guards phase, score,
  minute and live age; displays six rows plus an accessible full-list control.
  These are reference frequencies, never win probabilities or model inputs.
- After owner correction, possession stays in statistics and is removed from
  the pressure card on both surfaces. Pressure gaps stay gaps. Measured
  zero stays zero; wholly missing statistics collapse behind a detail control.
- Repeated module eyebrows are suppressed; module spacing is tighter; comparison
  labels/numbers are larger with spoken home/away values. Full names remain
  accessible; the sticky header wraps. Missing selection hides meaningless odds
  placeholders. Metadata separates publication/cohort from pressure/pool evidence.
- Desktop groups score/team identities and selection/status in bounded widths;
  Jinx explanations and metrics become neighbouring groups. Android stacks the
  same information. Desktop table cells wrap names/evidence instead of clipping.
- Automatic daily Jinx bubbles no longer cover filters. Daily comment remains
  available from the mascot menu and the inline Overview card. First-use guides
  remain explicit/dismissible. Escape dismisses desktop journal menus; collapse
  headings have explicit accessible names. Empty Jinx evidence buttons are hidden.

## Pressure investigation: confirmed source behaviour

Read-only source and verified capsule evidence, not a new calibration hypothesis:
Olympique Akbou–Constantine (3266301, 2026-10-23) transitions report
COUNTERS_MISSING through minute 16, BASELINE_READY at 17 and
OBS_ACTIVITY_UNPROVEN at 18/19. At the later bounded read there were 88 OBS rows
and 11 INTERVAL rows; first stored interval is 24–26. The photographed cumulative
shots/possession therefore did not establish a verified pressure interval at
17–18. No SAP/model patch or synthetic continuous curve is justified.

Evidence directory:
`C:/dev/btb-cdoex/.codex-artifacts/jury-refinement-20261023/`.
`akbou-pressure-transitions.json` retains verified capsule hashes and transitions;
`akbou-pressure-history.json` retains the bounded BFF history. Active direct ADT
GET hashes: runtime BE5A0229397D4981B94D6F364004651929253632065F4B79C896E29F6BDDEF88;
archive 59A05A1B8E805657590F288230DEAE1F5C044CF0A3116631C8A91E76C16683EC;
state 5B2EA3F1AC375A5CC2A69B46426CF82487A9840F4F85C947F9FDF078D91AD532.

## Validation and limits

- Client: typecheck/lint, 672 tests, 32 tooling tests, brand validation; Doctor
  20/20. Regression coverage includes score correction, stale pool, wrong half,
  half-time transition, exact Istanbul midnight and unchanged legacy periods.
- BFF: full suite and production build via invoke-mobile-bff-check.ps1 pass.
  Opt-in tests cover old response identity, native upper-case/omitted-zero
  records, header versions, no-store/Vary, authentication and query rejection.
- Android: shared source exports to a Hermes bundle in a sanitized preview
  environment. No signed APK, emulator or physical smoke is claimed; adb has no
  connected target. New native inputs were not introduced.
- Web: canonical `node scripts/web.mjs export --out <scratch>` passes edge-mode
  and secret scan, preserving the served accepted pair. Local candidate uses a
  separate loopback-only read-only BFF; deployed pilot process is untouched.
- Actual candidate contract smoke: 1/7/30 periods, old 7/30 totals and learning
  identical. Motor Lublin–Zaglebie Lubin 1H shows 624 verified references across
  17 outcomes; the browser expands the six-row card correctly. Possession and
  missing-statistic toggles use real current source responses, not fixtures.
- Browser screenshots/review cover phone-width web and desktop. Phone-width
  web is not Android native evidence. Native text scaling, TalkBack and actual
  touch behaviour remain in TASK-0180, next evidence review 2026-10-24.
  Tested widths: 320/393 phone, 1280/1600/1920 desktop; light and dark journal
  at 1280. Enter opens the period menu and Escape dismisses it. Today scopes
  the live journal to one Brisbane decision and +0.07 units at this read.
  First-half rows expand/collapse; real source possession is shown alongside
  pressure. Temporary browser viewport override was reset after checks.

Final local receipts: `validation.json`, `contract-smoke.json`,
`client-check-final.txt`, `typecheck-final.txt`, `lint-final.txt`,
`web-export-verified.txt`, `android-bundle-verified.txt`, `doctor.txt`,
`bff-check.txt` and the named screenshots in the evidence directory above.
No signed APK or coordinated release receipt was produced. The optional local
preview remains on port 4186; it is a separate GET-only loopback process.

The 90+ design goal remains subject to owner visual review and native acceptance;
there is no whole-product 90+ certification from these checks. NXT-OBS-200..209
stay acceptance-pending rather than being archived as delivered. Separate Git,
runtime/deploy, signing/distribution and paired publication approvals remain.

## Pressure continuation: accepted activity and possession choices (203/211)

The owner first removed the large possession row and clarified the dense graph
reference. On continuation, the owner explicitly selected a separate five-minute
rolling activity view, then reintroduced possession as supporting information
only. That final choice supersedes the earlier removal; it authorizes no model
weight. Owner clarification pop-ups must be Turkish.

The chart defaults to `5 dk hareketlilik`, with `Doğrulanmış baskı` selectable.
Both share rounded home/away columns, pressure/activity balance, latest range,
live current-time marker, muted future time, goal/score marks and compact native
measurement details. Possession is a separate current context line, also shown
in Jinx, with matching fixture/score/clock and a 120-second age guard. It changes
no selection, star, frozen evidence or activity value. Observation-derived score
increases are labelled `skor`; only provider goal events say `gol`, so historical
score corrections do not become claims of extra confirmed goals.

BFF opt-in `X-BTB-Pressure-Activity: rolling-5m.v1` adds nullable display-only
activity to the native history response. Old payloads are unchanged. No extra
source reads or new SAP producer are required. Complete raw/source-bound native
counters and 0–15-second fetch times are mandatory. The receipt nearest 300s ago
within 270–330s anchors each window; units are existing base activity weights:
`(delta shots + 2 * delta on-target + 0.5 * delta corners) * 60 / actual seconds`.
Every receipt supports continuity, including a repeated match-clock minute; the
last observation in each minute supplies its column. Gaps over 90s, decreasing
counters/scores, invalid source, regressed or implausibly advancing clocks,
phase/policy/producer changes reset the window. No interpolation. An unchanged
all-zero feed stays a gap unless provider time and measurement advance throughout
the window. Native 74A pressure and Super rules remain unchanged.

The original feasibility read: 69 OBS, 68 complete counters, none with proven
provider time. The activity view is therefore explicitly an acquisition-time
estimate, not confirmed per-minute pressure. Active ZBET_CL_RB_SCORE was read
by direct ADT GET fallback (not MCP): SHA256
F46D5E615867E4D64C44D4148C00ACFE1308CF005CF21A4ED28DBC197FAC7E72.
Real candidate smoke at 17:19:53Z: Al Ittihad 23 native intervals, 52 available
activity columns, 24 missing windows; possession 52/48 at 88 minutes. Another
Motor Lublin read had 9 intervals versus 32 columns, possession 50/50 at 65.
These readings demonstrate denser coverage without claiming full-match coverage.

Validation: 684 client + 32 tooling tests, type/lint/brand, full BFF tests and
production build, 19 focused BFF and 11 focused client cases, Android Hermes
export and verified edge web export pass. Browser checks cover mode switching,
phone/desktop composition, context possession and native detail availability.
Latest evidence: `rolling-activity-*` in the existing artifact directory. The
GET-only candidate preview alone was restarted on port 4186; pilot runtime,
accepted pair, SAP, Git and publication remain untouched. Native/paired owner
acceptance remains TASK-0180; 90+ is not certified from local checks.

## Owner correction: published-selection playability (NXT-OBS-210)

The Al Ittihad–AL Draih screenshot has a pending 50′ Kgyok decision, first
quote 1.52, while hero/Jinx immediately say inactive. The old label meant
native current eligibility AND its quote/pressure expiry, rather than whether
the published market was open and undecided. These are separate questions.

Shared hero/Jinx/list cards now show SEÇİM AKTİF when their own market has a
verified fresh quote and the native evaluator passed its undecided-market
check. Pressure/leader/confirmation failure does not alone deactivate the
published selection. Early evaluator exits before market_open validation do
not prove playability. Closed, decided, settled, terminal, failed/future/missing
or duplicate quote cases cannot become playable. A quote older than 15 seconds
says PİYASA DOĞRULANIYOR, never infers market closure or borrows the first quote.
Fresh proof can restore playability without another publication. Frozen stars,
price, evidence and result accounting remain unchanged. Native current model
eligibility is unchanged. The owner subsequently extended display star filters
and counts to this playable last-selection rule (212 below).

Active ZBET_CL_RB_EVAL was read through the direct ADT GET fallback (not MCP
object evidence): SHA256 4FA2C2AB46F7AED1B312F6D6378CB6918B2C07D3F3DB34C61706D5F6D8020504.
It also enforces 15-second quote freshness. A read-only preview sample at
16:50:34.980Z, fixture 3230514, 59′ 1–0, returned NO_SELECTION, Kgyok
CONFIRMATION_PENDING, quote 1.30 at 16:50:18.444Z (16.536 seconds old).
This is evidence of this reading, not proof that its market closed. The preview
correctly displays verification pending. Continuous active visibility remains
dependent on fresher verified source updates; no arbitrary timeout extension,
polling load increase, SAP write or model change was made. Cadence/source-state
investigation remains open under the observation, not silently marked fixed.

Validation: 22 focused hero/card cases and full client check (677 client tests,
32 tooling), Android Hermes and verified edge web export pass. Phone/desktop
browser checks use real pending-market data; active/closed/result transitions
are covered by tests, not fabricated browser data. Evidence: selection-state-*
in the existing local artifact directory. No native or paired delivery claimed.

## Owner extensions: goal emphasis and active last-selection filters

203: confirmed GOAL events now have a gold full-height line, football icon and
minute label. Close goals share a label but retain their true positions. Plain
SCORE_UPDATE observations keep the existing team-coloured score marker. Goals
do not change bar heights, pressure balance, activity or selection weights.
The frame can show a recorded goal with explicitly missing pressure. Browser
goal-emphasis-* screenshots at desktop/390/320 use a visibly labelled fixed
fixture (including 1′/3′, 90′ and missing-pressure cases), not live goal proof.

212: the owner requested last selections in star filters for their active
lifetime. Cards, Live filter/count and Overview count/featured selections now
share the latest fixture-bound published record and its frozen stars. A fresh
open/undecided quote remains eligible for display even if native model admission
has ended. Latest means one publication per fixture; no older market fallback.
Closed, decided, settled, terminal, unknown, failed or expired quotes are
excluded; fresh verification can restore the same record. The native 15-second
quote limit is retained. Thus stale source cadence can still leave no verified
active entries; it is not fixed by keeping an unverified selection in a filter.

One shared publication query/cache serves all cards and filters, with a refresh
when a new current decision is absent. Overview shares the complete Live match
cache rather than counting only its three featured cards. Publication failures
show an unavailable state, not a misleading zero-result assertion. Legacy
non-RB1 filtering remains unchanged. No BFF, SAP or model change in this extension.
The shared render clock includes the snapshot's actual client receipt time so
a quote arriving after the preceding one-second tick does not flicker inactive.
Future quotes remain rejected and the 15-second expiry is unchanged.

Labelled isolated browser fixtures verify 1+ = 2, 3+ = 1, 4+ = 0, with the
closed four-star entry excluded and the same Overview total/featured cards on
phone and desktop. Evidence: active-last-selection-*.png; no live selection
acceptance is inferred. Temporary fixture routes are absent from the final
export and their loopback servers were stopped after screenshots. The real
candidate still renders Motor Lublin's retained activity with explicit gaps.

Final client check: 690 tests + 32 tooling, type/lint/brand pass; Android Hermes
bundle and verified edge web export pass (goal-star-* logs). Existing BFF checks
and Doctor remain valid for unchanged layers. Native Android/owner acceptance
and coordinated delivery remain pending TASK-0180; no release performed.

## Match clock and extra-time period (213)

Owner reported 45+/90+ showing zero and a 105′ extra-time match labelled
2. YARI. A bounded read-only OData fallback (not MCP) returned fixture 3309433,
elapsed `105'`, status `06`. The broad LIVE enum loses this period distinction;
the previous detail label could then borrow a 2H pressure phase. The current
37-row source sample contained no added-time-plus or zero clock, so the exact
zero input is not reproduced. Existing numeric parsing already accepts 45+/90+;
the new display contract preserves the notation instead of reconstructing it.

Optional `clock` on summary/detail contains contractVersion=match-clock.v1,
source period and nullable normalized label. `X-BTB-Match-Clock: match-clock.v1`
opts dashboard, Live, detail and analysis-context into it. Absent leaves old
strict payloads unchanged; response acknowledgement, Vary and no-store are set;
unsupported versions return 400. Source chain: Mobile clock -> BFF mapMatch ->
ZBET_CDS_005_CDS/zbet_cds_005 elapsed and Status -> local CDS projection of
matches.elapsed/status (active ABAP/CDS source not read in this client task).

Cards/detail/path header/current-state copy retain 45+, 90+, 45+2 and 90+4;
status 06 is UZATMA, 07 PENALTILAR. Source period overrides old pressure phase.
Older BFFs do not infer 2H from a post-90 minute. Missing/invalid display clocks
and impossible second-half/extra-time zero show unknown, distinct from a real
0′ kick-off. Numeric elapsed, model selection, history and settlement stay intact.
No SAP change or numerical correction inferred from presentation.

Validation: 70 focused BFF cases, full BFF tests/production build; 693 client
tests + 32 tooling, type/lint/brand; Android Hermes bundle and verified edge web
export. Real 105′ UZATMA browser proof plus labelled stoppage-time fixture;
clock-* artifacts. The GET-only candidate preview was restarted; pilot/release
untouched. Native/owner acceptance remains TASK-0180.

## Accepted jury score and quick polish (214–215)

Owner accepted the dated 87/100 assessment and requested bounded pre-release
fixes. See the follow-up in `JURY_REAUDIT_2026-10-23.md`: readable 320 px Toto
header, web resize alignment without remounting or losing Live search, unknown
unavailable counts and frozen publication retention with fail-closed playability,
recorded-window-first chart copy and one less repeated evidence paragraph.

694 client tests + 32 tooling, type/lint/brand, Android Hermes export and verified
edge web pass. Labelled available/outage/recovery fixture and 320/390/768/1440
responsive transitions pass. Existing BFF/Doctor checks are reused for unchanged
inputs. No final APK, runtime restart or publication was performed. The native
and paired smoke gates remain. Publication intent is approved; separate source
freeze/runtime/signing gates are listed in `JURY_REFINEMENT_DELIVERY_2026-10-23.md`.
