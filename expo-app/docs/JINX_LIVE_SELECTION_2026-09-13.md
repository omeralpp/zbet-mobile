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

Rollout and final APK evidence will be recorded in CURRENT_HANDOFF.md.
