# Accepted design comparison — 23 October 2026

Final status: owner accepted the design and recovered names, then confirmed the
installed APK and published web from `b501352`. Paired release is COMPLETE; see
[completion evidence](evidence/HERO_SELECTION_RELEASE_2026-10-23.json).
The preview limitations and approval waits below describe the earlier review.

Owner requested comparison with Claude's latest accepted design before another
web review; APK creation remains on hold. Reference is the accepted 43d2e7d
pair, its deployed web receipt `20261022T195402Z-43d2e7d`, v40/v45 implementation
notes and the owner's supplied screenshots. The private Design canvas itself
is not available in this workspace; this is not a pixel certification of it.

## Findings and action

| Difference | Cause and evidence | Action/status |
| --- | --- | --- |
| Two evidence columns versus three in the owner's wide screenshots | Existing responsive layout: `wide` is 1200–1599 px, `ultra` begins at 1600 px; modules use two/three columns respectively. Local browser comparison uses 1280 px. | Preserved Claude's layout. Compare at equal viewport width; a narrow embedded preview cannot match a full-width desktop screenshot. |
| Fonts, colours, crests/brand and Jinx artwork | Theme/assets are unchanged from 43d2e7d; all 14 exported brand/font/mascot assets match their accepted hashes. Both versions use Manrope headings and the same grid anchors at 1280 px. | No theme replacement. |
| Different teams, missing crests and unrelated events in the first layout example | The earlier explicitly labelled synthetic fixture combined a mock template with real frozen RB1 decisions. Missing participant IDs intentionally produced initials. | Replaced that example with one recorded Braga review: owner-screenshot names; verified score, decisions, pressure and pool history. No synthetic form/provider event timeline; unavailable sections remain unavailable. This is a local review fixture, not restored SAP data or learning evidence. |
| First-use Jinx guide in a preview | New localhost origins have their own browser preferences; the accepted app's completed guide state is not copied. | Dismissed the guide for the recorded review; production preferences unchanged. |
| Last selection and first/current prices | Owner-approved change after the accepted release. The finished Braga example retains the 55′ / 1.28 / three-star publication and its result in the hero. A finished match has no current price. | Implemented; the separate last-publication card is removed. Jinx explains frozen evidence, with current status separate. |
| More recent-decision rows and -1.11 instead of +0.28 | Approved report-scope correction: seven decisions from all accepted cohorts rather than the current cohort's single decision. | Implemented. Learning cohorts and original decision/result facts remain separate. |
| A crest stays as initials after selecting another match | Component-local failure state survived a participant URL change in reused Live detail. | Fixed by remounting the image state for each logo URL. Unavailable/placeholder crests still use initials, never guessed logos. |
| Generic historical names (`Ev sahibi – Deplasman`) | Initial API/source inspection traced the labels to a current-match join. Follow-up direct ADT reads confirmed the active join; bounded OData capsule verification found the names already frozen in the publication's provider quote/statistics proof. | New BFF decoder recovers all seven examined decisions without SAP changes or backfill; 706 tests pass. Running BFF deployment remains pending. See `zbet-cap/docs/RB1_HISTORICAL_NAMES_2026-10-23.md`. |
| Missing current odds or current statistics | Real RB1 endpoints may withhold stale/unverified observations/prices. The deployed BFF has not loaded this batch's opt-in quote extension. | Preserve explicit unavailable/stale/closed labels. The tested BFF deployment/restart remains separately gated; no stale value becomes current to fill the design. |

## Review evidence and limits

`C:/dev/btb-cdoex/.codex-artifacts/hero-selection-20261023/` contains the
comparison screenshots, real API summary, source index and refreshed exports.
Typecheck/lint and all 670 client tests pass after the crest fix. The edge web
export passes its secret scan; the Android Metro/Hermes bundle passes in a
sanitized preview environment. No signed APK or physical Android acceptance is
claimed. Unchanged BFF code retains its 688-test receipt.

Real-data web: `http://127.0.0.1:4183`.
Recorded layout review:
`http://127.0.0.1:4184/match/2026-10-22:3229972:22:00:00`.
The local preview now uses the candidate frozen-name decoder against the seven
hash-verified captured records, guarded by immutable decision facts. Names are
no longer manually supplied in the recorded review. The running BFF remains
unchanged. No SAP change, Git stage/commit/push or public publication was
performed. Web appearance acceptance is pending; final APK work waits for it.
