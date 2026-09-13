# Jinx live selection observation — 2026-09-13

Owner clarified that the requested prompt describes product behavior and must be
implemented, under the continuing TASK-0011/M10 pilot exception.

Jinx is available only for LIVE and HALF_TIME matches. Other known states show
`Maç canlı değil.` without a Mobile request. The BFF independently refuses
non-live, missing or historical-only match records before cache/provider access.
The private `currentMatchRecord` projection is never added to the public match
DTO. Seven sources still start in parallel; no additional transport was added.

Match Detail already chooses the highest-star non-VOID recorded selection,
breaking ties by recency. Jinx uses that selection, not the newest arbitrary
Super Log and not a new ranking policy. Its pool and adjustments come only from
a log matching market, stars, minute and reason. A missing matching log is a
named gap; its pool stays unknown and confidence stays LOW. The selected log's
own timestamp determines freshness. No scoring, selection or logging feedback.

The prompt requires the selected market code in the commentary and concrete
support/tension with current football facts. The server also refuses a reading
that omits the selected code. Existing advice/verdict/future/number guards were
not weakened. Market labels are a read-only projection of the local existing
ZBET_CL_MAIN mapping (Ms15a is total goals 1.5 under); this is local evidence,
not a claim of new live SAP/MCP inspection. Unknown codes get no invented label.
Decision-time evidence and later match facts must remain distinct. Confidence
still derives from data sufficiency, never base_prob; a tiny pool cannot be HIGH.
Event-level surprise remains unmeasured.

Mobile binds the user's explicit ask and query cache to the displayed selection.
A changed selection requires another tap. Optional response `selectionKey` and
`reasonCode` distinguish a selection race, non-live match and absent selection.
These are additive fields on jinx-match-outlook.v1, with fixture compatibility.

Validation before rollout: Mobile type/lint, 585 tests, 13 tooling tests and brand
checks PASS; six fixture DTOs pass Mobile schema and presentation guards. Full
BFF tests/build PASS; 34 focused Jinx tests are included. Doctor freshly FAILED
19/20, with 16 Expo patch mismatches; it is not waived into a pass.

Twenty sequential uncached live analyses of `2026-09-13:3122235:15:30:00`:
20/20 visible (100%), 20 HTTP-200 provider invocations, zero refusals/timeouts.
Provider min/median/p90/p99: 1149/1238/1514/1555ms; source phase
97/110.5/225/252ms; total 1257/1392/1641/1766ms. Prompt 4436 characters.
Keep the previously measured shared budget: parallel sources 5000 + provider
7450 + allowance 2550 = 15000ms. The new p90 fits; no deadline increase needed.
Evidence: cap `.codex-artifacts/jinx-reliability-2026-09-13/live-selection`.

Review of the actual first public texts found fact lists without a relationship
to the selection, and a later candidate described a live score as finished.
The final prompt requires the relationship explicitly. Additional refusal codes
cover missing consistency observation and live-match-presented-as-finished;
existing protections remain intact. These checks reject observed bad examples,
but are not a proof that every semantic claim is correct.

The same Gemini 3.5 Flash-Lite model now uses LOW thinking and a 1536-token
ceiling (including thinking) within the unchanged shared deadline. Supported
thinking levels were checked in Google's official documentation:
https://ai.google.dev/gemini-api/docs/thinking . A larger Flash experiment hit
the existing deadline and was stopped; it was not selected for rollout.
Intermediate trials are retained, not counted as final acceptance. One stricter
MINIMAL trial returned 16/20 readings, including three wording failures and one
HTTP 429. A concurrent LOW trial stopped on HTTP 429 after 9/10 visible readings.
Final measurement must run without overlapping provider trials at a slower pace.

The previously reported mirrored form strips still existed in Mobile source;
both now use OLDEST_FIRST and the existing `Eski → en yeni` label. This is a
display-only correction using the existing result-order helper.

Rollout, final measurement and final APK evidence are in CURRENT_HANDOFF.md.

## Final fallback and phone presentation

The final uncached trial before fallback produced only 15/20 valid LLM readings
(75%): the remaining five failed wording/content guards, not transport. This
supersedes the early 20/20 result as evidence of model-only reliability.
Because Mobile already changes, the earlier decision against a contract change
no longer applies: provider/refusal/rate-limit failures now return an explicitly
`origin=DETERMINISTIC`, `availability=DEGRADED` factual summary. Mobile labels it
`Veri özeti · Jinx yorumu alınamadı`. It is never reported as an LLM observation.
It uses selected market/current score/form/historical pool facts, runs the same
wording/number safety guard, and preserves named caveats and data confidence.
The live-match and selection gates run before this fallback as well.

Final 20 sequential uncached calls (10s spacing, no concurrent trial): **20/20
visible: 16 Gemini readings + 4 deterministic summaries**. 32 provider invocations,
zero timeouts; provider phase min/median/p90/p99 **1109/2470.5/2680/2813ms**;
sources **100/110/204/381ms**; total **1210/2600/2827/3008ms**. Model-only success
is 80%, not 100%. Evidence folder: `live-selection-delivery`.

Owner's later Neom/Amed phone screenshots add a compact-chart request and clarify
that data coverage is secondary to selection consistency. The chart retains tap,
event rail and previous/next navigation; height falls from 328 to 280 layout
units, title/score spacing shrinks, markers use 44-unit touch targets with wider
grouping, navigation uses 48-unit targets, and event tiles have bounded width.
Jinx leads with selection/data consistency. Data-support labels replace generic
confidence labels; all named gaps remain accessible in a 44-unit disclosure.
The `Kısmi veri` flag is not changed into a verdict or hidden by inflating quality.
