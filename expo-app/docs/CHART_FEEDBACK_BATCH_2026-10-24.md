# Chart feedback local batch — 24 October 2026

Authorization: owner command `Mobile cutover next`, routed through `btb next cutover start`. Frozen scope: NXT-OBS-217 and 218, Android and desktop web together. NXT-OBS-216 remains unconfirmed and its activity calculations/gaps stay unchanged. The previously accepted `26f491c` Android/web pair remains the recovery pair.

Plan:

1. Reuse the existing football SVG, draw darker scoring-side markers/lines only in that team's half, and update the legend. Preserve exact minute anchors, close-event grouping and score-update distinction.
2. Retain a verified, explicitly labeled historical reference distribution for the displayed half while the screen is mounted. Preserve original counts, shares and ordering. Use a fresh verified current score only to mute unreachable rows; restore styling after corrections and reset the retained reference on a period/match change. No first-half outcome is compared with a later second-half score.
3. Validate meaningful reachability/period/freshness regressions, client type/lint/test/doctor, Android JS bundle, verified scratch web export and wide/narrow browser checks in both themes. Keep source contract, BFF, SAP, model, stars, pressure/activity calculations and releases outside this batch.

Only Mobile client utilities/components and these batch/handoff/observation records are implementation targets. Existing BTB review work and six original screenshot receipts are preserved. Completed feedback will be archived with local-validation status; physical-device and coordinated-release receipts are separate from local checks.

Stage/commit/push, signing, distribution and web publication require their existing explicit approvals. Local implementation and verification outcomes are appended when actually reached.

## Completed local result

- NXT-OBS-217/218 implemented in the existing shared goal-marker and historical-score components/utilities. No platform exception: Android/web use the same changes.
- Pressure/activity data and arithmetic unchanged. Goals use the existing football vector in a darker version of their scoring-side plot color; the line reaches only that side of the midline. Existing minute grouping and non-goal score-update distinction remain.
- Historical reference counts/shares/order are frozen per displayed period, clearly labeled with minute and recorded score. A fresh current score controls muted/unreachable styling only. Downward corrections restore rows; match-clock period precedence prevents stale observation phases from applying second-half goals to first-half outcomes.
- Full client type/lint/unit/tooling/brand checks and Expo Doctor passed after the final code change. Final Android Hermes export passed at `.codex-artifacts/chart-feedback-android-final`. Final edge web export passed through `node scripts/web.mjs export --out .codex-artifacts/chart-feedback-edge-final`, including embedded-mode verification and secret scan.
- Synthetic local browser checks passed for both chart modes, home/away goals, grouped close goals, a non-goal score update, 1–1→2–1 unreachable rows without changed percentages, correction back to 1–1, and period reset. Default desktop and 390×844 phone viewport, dark/light themes, zero browser error logs. Theme/viewport overrides restored.
- The temporary preview route was restored byte-for-byte and its harness removed from production source before final bundles. The local preview is synthetic validation, not live SAP evidence or physical Android acceptance. A final clock-period precedence guard was additionally covered by unit regressions and refreshed final bundles.
- Sources/documents remain uncommitted. No release/signing/distribution, web publication, SAP/BFF/runtime, model or data change. Physical Android and actual published-client smoke checks remain NXT-OBS-219 for a separately approved coordinated release.

Evidence: [validation receipt](evidence/CHART_FEEDBACK_LOCAL_2026-10-24/validation.json), [dark desktop](evidence/CHART_FEEDBACK_LOCAL_2026-10-24/dark-desktop-final.png), [light phone](evidence/CHART_FEEDBACK_LOCAL_2026-10-24/light-phone.png). Prior accepted pair and all original screenshots are retained.
