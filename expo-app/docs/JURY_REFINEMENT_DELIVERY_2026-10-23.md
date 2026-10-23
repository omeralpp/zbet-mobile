# Jury refinement release — 23 October 2026

Status: LOCAL_VALIDATED / UPDATED_WEB_ACCEPTANCE_AND_EXECUTION_GATES_PENDING.
The owner accepted 87/100 and requested quick fixes followed by publication.
This plan makes that request reviewable; no release action has run.

## Reviewed behavior and source

Shared Android/web batch NXT-OBS-200..215: Today journal; half-specific historic
scores; five-minute activity with honest gaps and confirmed-goal event markers;
possession as context only; verified playable latest selections in star filters;
45+/90+ clock notation and source extra-time/penalty labels; compact analytics;
responsive Toto/journal fixes and honest unavailable-report states.
No SAP write, model/star weight or learning/settlement change is proposed.
Details: `JURY_REFINEMENT_BATCH_2026-10-23.md`, `JURY_REAUDIT_2026-10-23.md`.

Baselines: client `879160f79e34dbb4575e1a7e6320415b5df8d375` (master),
BFF `88d30c3bc5b78dbffcb1a65950915f9edff0d972` (main).
Exact changed-file SHA256 index, including bounded task-registry evidence in
btb-codex: `.codex-artifacts/quick-polish-20261023/delivery-package.json`.
Recheck every indexed hash before staging; stop for unrelated source drift.
Only indexed files and bounded release receipts are proposed for commit/push.
No blanket staging or destructive Git. Final artifact/source SHAs are measured
after the approved freeze, never invented here.

Checks: client type/lint/brand, 694 tests + 32 tooling; Android Hermes bundle and
verified edge web export; desktop/320/390/768 px browser and labelled report
outage/recovery checks. Prior BFF tests/production build, contract smoke and
Doctor 20/20 remain valid for unchanged inputs. Physical Android, accessibility
text scaling/TalkBack and both final client smokes remain unverified.
The dirty preview at `http://127.0.0.1:4186/super` is not a publishable artifact.

## Coordinated execution after explicit gates

1. Accept the updated web preview; obtain separate Git commit/push, pilot BFF
   restart, and final ARM64 APK build/sign approval. User publication intent is
   already recorded; execution covers the coordinated owner-only Android/web pair.
2. Recheck hashes/status/whitespace. Commit and push only reviewed source/docs
   in zbet-mobile/zbet-cap and the task-registry record in btb-codex. Verify each
   remote SHA; freeze the clean pushed client SHA for both artifacts.
3. Refresh the BFF Process environment from existing User configuration without
   logging secrets. Preserve identities/auth/notifications/web root and disabled
   legacy collector. Restart only the verified port-4004 pilot BFF with
   `zbet-cap/scripts/ensure-mobile-bff.ps1`. Check legacy compatibility and
   opt-in Today/distribution/activity/clock behavior. No model reseal.
4. Export verified edge web via `node scripts/web.mjs export`; then build/sign
   the final owner-phone ARM64 APK with `scripts/build-pilot-apk.ps1`, using a
   unique artifact name and its same-source web receipt. Verify both hashes
   with `scripts/client-release.mjs verify`.
5. Privately deliver that exact APK to the existing owner-only BTB APK Drive
   folder with `scripts/deliver-apk-drive.ps1 -Confirm DELIVER-APK`. Verify
   signature/ABI/remote downloaded bytes. Wait for actual owner installation
   confirmation of this exact hash; do not fabricate installation evidence.
6. Dry-run then publish the companion web with `zbet-cap/scripts/publish-web-client.ps1`
   and the verified APK/install receipt, then `-Confirm PUBLISH-WEB`. Retain
   existing Access/routing policy; verify served asset hash and API behavior.
7. Record actual Android and web smokes, run `client-release.mjs complete`,
   and commit/push bounded completion receipts under the same source approval.
   An unmet smoke or installation gate keeps the batch INCOMPLETE.

## Recovery and approval basis

Retain accepted client pair `b501352158a5ea9b9749868ebcad8f4c9e70e44f`, web
`20261023T120240Z-b501352` and BFF runtime code `99ac116be61d1265bab640d63e2a02310fe10f39`.
Retain its exact APK/receipts and prior 43d2e7d pair. Stop before the next action
on a failed check. No deletion, production, SAP activation or unrelated changes.

AGENTS.md: "No stage/commit/push unless the user explicitly approves it."
`COORDINATED_CLIENT_RELEASE.md`: "Wait for the owner's web acceptance before
building/signing the APK" and "Commit/push, BFF restart, signing/distribution
and Cloudflare publication retain their explicit approvals."
The btb-thread-optimizer skill preserves these gates; it grants no approval.
