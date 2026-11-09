# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-11-09
Mod: `PAIRED_RELEASE_COMPLETE / OWNER_ONLY_DEV / 5F26C70`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
Earlier handoff history remains in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md)
and the dated release reports/receipts.

## Son checkpoint

Owner direction9 November: do not require a USB/ADB device connection. Continue
with the unchanged Android bundle/shared-code checks locally; owner-run Android
installation/smoke follows an approved coordinated release. The companion web
delivery and release approvals remain. A one-shot native probe connected but
found the latest eligible cycle about113 minutes old, so live acceptance remains
unmet. Populated-history component DOM checks now pass with a clearly synthetic
BFF fixture (state change, pending/error/empty/foreign-key cases, narrow/desktop,
dark/light). Browser screenshot capture failed, so no new visual/native/live
acceptance is claimed. The owner replied “Approve” to the9 November validation
package's scoped three-repository commit/push request; no activation or release
is included.
Evidence: BTB Logs `selection_programme_20261108/native_acceptance_20261109/`
and `populated_history_20261109/` under the active cutover observations.

Selection Lab (TASK-0230/TASK-0229) now also has a read-only C1 history endpoint
and shared Android/web historical-decision panel. Original quotes remain history,
with `currentOffer=false`; the live comparison keeps its15-second expiry.
The BTB-owned complete-capture operator is implemented and tested locally, with
no actual registration, live collection, runtime activation or client release.
The owner explicitly approved this continuation's four-repository commit/push
through popup `call_3405b9e31f434f29bd3c13e51155047b`; no activation or release
is included. Mobile canonical checks/Doctor, Android bundle and verified
web export pass. Empty-history browser layouts pass in dark/light at narrow and
desktop widths; populated browser/live-publication and Android-device smokes
remain outstanding (ADB:0 connected devices).
See [the continuation checkpoint](C1_HISTORY_AND_ADAPTER_2026-11-08.md).
The accepted pair and running BFF below are the recorded baseline, not a new
live-read claim; this continuation changes neither deployment.

Accepted source: **5f26c706e5ecadccc79da81bce02b4108ac0284a** (master
fast-forwarded from 26780bc). Batch:
`client-5f26c706e5ecadccc79da81bce02b4108ac0284a-DE08B3613F0D-06513353370C`.
Canonical paired completion passed on 8 November 2026.

NXT-OBS-246: the Super log keeps the last verified report, with a "Yenilenemedi"
note, when a refresh fails or answers UNAVAILABLE. It shipped with BFF d8d652f,
which reuses verified proofs between reports (each re-verified within 10-15
minutes), shares simultaneous identical reads and allows 12 s for v2 reports.
Real SAP, 40 decisions: about 1 s after a 9.6 s cold read, 0.38 MB instead of
10.12 MB. A restart empties the proof cache, so the next report is a cold read.
No platform exception. The owner replied "Installed, works" after installing the
exact APK and "Web works" after publication. Live-hour conflicts are not yet
measured. Receipts in `btb-codex/docs/evidence/`:
`super-report-{APPROVAL,PREPARED,DRIVE,ANDROID-INSTALLED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE,LOCAL-APK-RETENTION,STATUS}-2026-11-08.json`.

### Previous pair: 6A416A1 Expo patch

Accepted source: **6a416a1af9851ae2488f669049ceb1a4b731c852** (master
fast-forwarded from 5286655). Batch:
`client-6a416a1af9851ae2488f669049ceb1a4b731c852-7A512C0C9A9C-3850448F2B14`.
Canonical paired completion passed on 7 November 2026.

This dependency-only batch brings expo, expo-constants, expo-dev-client,
expo-notifications, expo-router, expo-splash-screen and expo-task-manager to
SDK 57's current patch versions, closing the Expo Doctor exception recorded for
ED30743. The lockfile moves 37 versions inside Expo's tree and tooling; app code
is unchanged; npm audit findings drop from 22 to 16. The expo-modules-core patch
keeps the headless task loader in R8-minified release builds (the app's
background notification task; minification is not configured here). The owner
replied “Looks good” after installing the exact APK and “Web looks good” after
publication. Receipts: `expo-patch-{APPROVAL,PREPARED,DRIVE,ANDROID-INSTALLED,POST-INSTALL-VERIFIED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE,LOCAL-APK-RETENTION,STATUS}-2026-11-07.json`.
Background-notification delivery while the app is closed was not measured
separately.

### Previous pair: ED30743 splash and Özet

The splash and Özet redesign was delivered and accepted on Android and desktop
web earlier the same day (source ed30743, master fast-forwarded from 183aed9).
Batch: `client-ed30743b5a3b5a45841aab2bd8d229839fc7ad0c-D303F543EC50-2B5A8F2E9D20`.

The launch keeps the owner's bounded brand hold (800 ms normal, 500 ms reduced
motion, lower-bound tests retained) with a code-drawn ball landing in the crest
on the night pitch in both themes. Özet gains the greeting header, Jinx's
opening line, a merged Jinx Bugün card, compact match cards, named quiet/empty
states, press feedback and the "Yenilendi" refresh confirmation. The five owner
decisions listed in the redesign doc shipped with it.
[Design, scores and validation](SPLASH_OZET_EXPERIENCE_2026-11-07.md).

The owner installed the exact private APK and replied “Looks good”, then
accepted the published web: “Web looks good”. These are owner smoke
attestations, not device-side hash measurements or exhaustive
accessibility/performance tests (haptics, TalkBack and native-driver smoothness
were not measured separately).

Canonical receipts in `btb-codex/docs/evidence/`:
`splash-ozet-{APPROVAL,PREPARED,DRIVE,ANDROID-INSTALLED,POST-INSTALL-VERIFIED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE,LOCAL-APK-RETENTION,STATUS}-2026-11-07.json`.
Preparation and publication receipts preserve their original intermediate
states; COMPLETE and current STATUS establish final completion.

The previous accepted E549 pair (TASK-0222 pressure activity v2,
[evidence](PRESSURE_ACTIVITY_REPAIR_2026-11-04.md)) and the E3 pair
(NXT-OBS-242/243/244) keep their historical receipts:
`pressure-activity-v2-*-2026-11-04.json` and
`super-menu-release-e3ae5df-*-2026-11-03.json`.
Intermediate6141e2f and1fcf5cf batches remain incomplete/superseded, without
retrospective release credit. Their reports and receipts are preserved.

## Repo durumu

| Repository | Source checkpoint | Meaning |
| --- | --- | --- |
| zbet-mobile / master | 5f26c706e5ecadccc79da81bce02b4108ac0284a | Accepted artifact source; subsequent handoff-only commits do not rebuild/release the app |
| zbet-cap / main | d8d652fee939df08e097bae2570cff8c09fa906d | Running BFF with report proof reuse; previous revision 178ca6d |
| zbet-abap / main | 5751cbfdaf705478d21459de533a62ca19c4a101 | Previously accepted reader repair, policy71AC/producerDE3C; unchanged by this Mobile batch |

Android and desktop use `api.surklase.com`; local BFF origin127.0.0.1:4004.
Cloudflare Access protects `app.surklase.com`. This remains owner-only DEV.
Web publications replaced the BFF process (PID24544 to8004 for ED30743, then
to26348 for 6A416A1, then to12244 for 5F26C70 after the approved d8d652f restart to4668) through its scheduled task;
`/health` reported ok with pilot auth and web, SAP backend and notifications
configured.
Published root: `C:/Users/omera/AppData/Local/BTB Mobile Next/web/releases/20261108T104911Z-5f26c70`
(previous `20261107T185107Z-6a416a1`, `20261107T182409Z-ed30743` and `20261104T091348Z-e549cb0` preserved).

## Doğrulama

- 5F26C70: the full canonical gate passed, Expo Doctor included, on the identical
  content before commit; the web export was rebuilt and verified from the
  committed source. BFF d8d652f: 721 tests. Publisher verified all served files,
  zero mismatches.
- 6A416A1: the full canonical gate (`invoke-mobile-check.ps1 -BundleOnly`)
  passed, Expo Doctor included: type check, lint, unit tests, tooling, brand,
  Doctor, Android bundle and verified edge web export (secret scan clean). The
  web export was rebuilt and verified from the committed source.
- ED30743 (historical): the same gate passed except Expo Doctor, which failed
  only on the upstream patch drift that 6A416A1 resolves; the owner chose to
  build and the bundle/web steps were run separately and passed.
- Signed ARM64 pilot APK built from the clean commit; embedded settings match
  E549 (pilot, `api.surklase.com`, mocks off, Match Journey/Team Form/Jinx LIVE).
- Drive delivery: pilot certificate, ARM64-only, owner-only, SHA-256 readback.
- Publisher verified57 served files (56 expected assets plus receipt verification),
  zero mismatches. Shell/deep-link/API-refusal probes passed; public Access
  redirect remains protected.
- The redesign's own headless-browser checks (320–1440 px, both themes) are in
  its doc. Owner accepted both final client smokes.

Technical delivery is not proof of calibrated probability, profitability,
complete live-feed availability or universal defect absence.

## Final yerel pilot APK

- Accepted APK: `btb-mobile-next-arm64-super-report-5f26c70.apk`
- Source: `5f26c706e5ecadccc79da81bce02b4108ac0284a`
- SHA-256: `DE08B3613F0DD2961E77F4B69D02F5DF9D7FB1AF5933912EA5D54E2E0EB78CA3`
- Size/ABI:50,609,985 bytes, ARM64; certificate `FAC61745…3B9C` unchanged
- Matching web tree: `06513353370C32582F3715E5F4BB61691C1589375837D2E26050B4484D2CF3B7`
- Web release: `20261108T104911Z-5f26c70`
- Private Drive file: `1pZtL3jqQ9pb99DFJSzSUu1ElOW9U5hbc`
- Pair: `COMPLETE`, both owner smokes accepted

Delivery used `deliver-apk-drive.ps1` through the configured `btbdrive` rclone
remote; no sharing link, policy or authentication configuration changed.

After each acceptance and COMPLETE, the superseded local APK was removed under
the owner's29 October retention rule: E549 (`FDBF2981…367C`) for ED30743, then
ED30743 (`D303F543…D003`,50,608,225 bytes) for 6A416A1, then 6A416A1 (`7A512C0C…02D8`,50,608,417 bytes) for 5F26C70. 5F26C70 is the sole
permanent local APK in the artifact directory. Config/hash/delivery/acceptance
receipts, source, cloud copies (6A416A1 Drive file `1cJgY9SbY5mfjpasomEHWEJijAT82Wwva`, ED30743 Drive file `1QPScFiQbZZyOjvtbRRLDA_vKTMGg8GIP`,
E549 `1woDYD2ZCPgDf0nhEjRbe4viQF3ERQQMe`) and versioned web releases remain preserved.

## Açık observation / blokajlar

The splash/Özet and Expo patch batches have no remaining release step; the
Expo Doctor exception is resolved in 6A416A1. TASK-0222 is DONE in E549.
NXT-OBS-242/243/244 remain delivered inE3, NXT-OBS-241 inba88590 and
NXT-OBS-235/238/239/240 inc8188ca. Existing deferred observations retain their gates:

| Observation | Remaining scope |
| --- | --- |
| NXT-OBS-032 | Genuine SAP freshness timestamp; request time must not masquerade as upstream freshness |
| NXT-OBS-068 | Future corporate login; not a prerequisite for this owner-only pilot |
| NXT-OBS-073 | Trusted participant identity/logo chain and separately approved backend contract |
| NXT-OBS-074 | Notification producer continuity; unresolved source-side cause |
| NXT-OBS-086 | Toto producer event identity/idempotency; Toto ownership retained |
| NXT-OBS-089 | Owner design decision about intentional result/decision presentation |
| NXT-OBS-236 | Per-match decision notification; blocked byNXT-OBS-074 |
| NXT-OBS-237 | No single RB1 threshold; frozen model; BTB - Aktif first |

Historical TASK-0177/0169/0168/0171 closures and archived dispositions remain
unchanged. Actual A5 learning and prospective promotion gates stay separate.
Probability work TASK-0150/0153/0190 remains retired without success credit.
No unrelated deferred item was implemented or closed.

## Exact next steps

Continue normal owner observation. Record concrete client findings in
OBSERVATION_LOG.md; reopen the original task on evidence of recurrence.
No extra daily/weekly signature-wait task is needed for these batches or TASK-0222.
When Expo publishes further SDK 57 patches, Doctor will flag them again; the
2026-11-07 update (`npx expo install --check` / `--fix` in the preview-only
environment, full gate, coordinated pair) is the procedure to repeat.

Future releases still require one clean pushed source, verified pair, private
APK installation before matching web publication, and both owner smokes under
explicit release approval. Deferred work retains its evidence/approval conditions.

## Documents

[Architecture](ARCHITECTURE.md), [next cutover procedure](NEXT_CUTOVER_PROCEDURE.md),
[coordinated release](COORDINATED_CLIENT_RELEASE.md), OpenAPI, rebuild schemas
and historical handoffs retain their roles. Mobile/BFF expose read-only DTOs;
BTB/Toto model and learning decisions stay with their owners.
