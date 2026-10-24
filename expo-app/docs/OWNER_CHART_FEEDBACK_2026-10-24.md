# Owner chart feedback — 24 October 2026

Owner: Mobile Next. Initially recorded in post-release observation; subsequently implemented and locally validated under the owner's `Mobile cutover next` command. [Batch/checks](CHART_FEEDBACK_BATCH_2026-10-24.md). No release performed; current accepted pair remains `26f491c`. The screenshots themselves do not establish their exact application build.

Six owner screenshots from yesterday/this morning are preserved with matching original/copy SHA256 hashes in [the evidence manifest](evidence/OWNER_CHART_FEEDBACK_2026-10-24/manifest.json). Images 3 and 5 show the pressure/activity goal markers; image 3 also shows historical score distribution. Other images supply match/source/UI context, without establishing a separate defect.

## NXT-OBS-216 — five-minute activity is not a confirmed defect

The owner reports that data appeared in later records, so the initially empty five-minute activity panel may be normal. Preserve this as an observation. Do not classify the screenshot alone as a pressure calculation failure, replace missing measurements with zero, interpolate across gaps or change the activity/native pressure formulas. A future defect claim needs the actual window/source timing and counter coverage.

## NXT-OBS-217 — team-colored football goal markers

Replace the gold full-height goal overlay in the pressure/activity charts with a football-shaped marker and a darker shade of the scoring side's existing chart color: home blue, away orange. Use the same color family for its event line. The line must stop at the horizontal midline and stay entirely in the scoring side's half; it must not extend across the opposite team's data.

Keep the event's exact minute anchor, existing close-goal grouping and edge-safe label placement. The darker marker must remain readable against both light/dark backgrounds. Only confirmed goals get a football goal marker; score corrections remain score updates. Update any gold-line legend/copy to match the new encoding.

Likely shared entry points: `src/components/PressureGoalMarkers.tsx`, `PressureChart.tsx` and `pressure-chart.ts`. These are inspection targets for the implementation batch, not a claim that the change is already made.

Acceptance: home and away goals are visually distinct in both five-minute and native pressure modes; the marker looks like a football; no goal line crosses into the other half; minute labels/nearby goals remain legible at narrow Android and wide desktop sizes.

## NXT-OBS-218 — visibly inactive unreachable historical scores

After the current score changes, keep historical score rows visible but use a clearly different muted/deactivated style for outcomes that cannot be reached from the displayed, verified current score. For a full-time distribution, an outcome is unreachable when its home goals are below the current home goals or its away goals are below the current away goals. At 2–1, for example, 1–1/1–2/1–3 become inactive while 2–1/2–2 remain reachable.

Preserve original reference counts, percentages, ordering and historical scope: this is presentation only, not deletion, probability recomputation, renormalization or a decision-pool/model change. Make the inactive meaning understandable beyond color alone, for example a short accessible status/legend. A verified score correction downward must restore any newly reachable row. Unknown/stale current-score evidence must not fabricate an unreachable classification. Respect the distribution's period: later second-half goals must not deactivate an already completed first-half historical distribution.

Inspection target: the historical-score section of `src/screens/MatchDetailView.tsx` and its shared distribution component.

## Next batch and validation

The owner started the existing `btb next cutover start` workflow. NXT-OBS-217 and 218 now share one locally validated Android/web implementation; 216 remains unconfirmed. Both themes, home/away goals, goal/score corrections, close event labels, narrow/wide layouts and historical period scope were checked. Final Android bundle and verified web export passed. Physical-device/published-client acceptance remains NXT-OBS-219 for the separately approved coordinated release. No SAP/BFF model change was requested or made.

Commit/push and coordinated signed APK/web delivery keep their separate explicit approvals. This feedback grants no publication or distribution approval.
