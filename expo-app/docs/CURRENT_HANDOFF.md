# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-11-09
Mod: `PAIRED_RELEASE_COMPLETE / OWNER_ONLY_DEV / 49EE2E5`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
Earlier handoff history remains in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md)
and the dated release reports/receipts.

## Son checkpoint

Selection Lab is delivered on Android and desktop web from clean pushed source
**49ee2e5f864eb11d89c1b7ceb995e6f5febbd17f**. Batch:
`client-49ee2e5f864eb11d89c1b7ceb995e6f5febbd17f-40F6490FEA4A-CC6653A39FE6`.
The owner accepted the exact private APK with “APK sorunsuz calisti”, then the
published web with “Web works properly”. Canonical paired completion passed on
9 November. These are owner smoke attestations, without a device-side hash
measurement. No USB/ADB connection was required, as directed by the owner.

The shared panel and read-only BFF expose comparison and first-C1 history.
Historical quotes have `currentOffer=false`; live comparison retains its
15-second expiry. BFF **8f519232add09d3114682b1d833e700ec2726596** is published;
the final supervised replacement was PID14504 to41016. The publisher verified
57 served files, zero mismatches; shell/deep-link/API-refusal and public
Cloudflare Access checks pass. Receipts in `btb-codex/docs/evidence/`:
`selection-lab-*-2026-11-09.json`. COMPLETE and STATUS establish the final state;
preparation/delivery/publication receipts retain their original interim states.

Actual C1 registration and production remain **inactive** (TASK-0229; TASK-0230
retains that dependency). The latest bounded native probe at08:59:50Z observed
a04:10:12.267Z cycle, about4h50m old; it did not establish complete-source or
15-second latency acceptance. This is dated evidence, not present SAP state.
The owner requested activation/publication, but the source gate is not waived.
The C1 operator is callable only, without a daemon; client delivery does not
activate it. C2/C3 remain unvalidated/unavailable. The populated component QA
was explicitly synthetic; screenshot capture failed and no populated real C1
decision was accepted. See [the implementation checkpoint](C1_HISTORY_AND_ADAPTER_2026-11-08.md)
and BTB Logs `selection_programme_20261108/activation_release_20261109/`.

### Previous pair: 5F26C70 Super report

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
| zbet-mobile / master | 49ee2e5f864eb11d89c1b7ceb995e6f5febbd17f | Accepted artifact source; subsequent handoff-only commits do not rebuild/release the app |
| zbet-cap / main | 8f519232add09d3114682b1d833e700ec2726596 | Running BFF with Selection Lab/history and launcher paths; retains the report proof reuse |
| zbet-abap / main | 5751cbfdaf705478d21459de533a62ca19c4a101 | Previously accepted reader repair, policy71AC/producerDE3C; unchanged by this Mobile batch |

Android and desktop use `api.surklase.com`; local BFF origin127.0.0.1:4004.
Cloudflare Access protects `app.surklase.com`. This remains owner-only DEV.
The Selection Lab source update replaced PID12244 with14504; its web
publication replaced14504 with41016 through the existing scheduled task.
Local/public health passed. Published root:
`C:/Users/omera/AppData/Local/BTB Mobile Next/web/releases/20261109T095638Z-49ee2e5`.
The previous5F26C70 web root and earlier versioned releases remain preserved.

## Doğrulama

- 49EE2E5: the unchanged application inputs had passed the canonical Mobile
  checks/Doctor, Android bundle and BFF tests/build. The final edge web export
  and signed ARM64 APK were built and paired from the clean pushed commit.
  The two-line BFF launcher correction passed syntax,19 BFF tests and21 process
  checks under each of PowerShell7 and Windows PowerShell5.1. Both owner smokes
  and canonical paired completion pass. Real C1 source/decision acceptance is
  still unmet; synthetic DOM checks do not supply it.
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

- Accepted APK: `btb-mobile-next-arm64-selection-lab-49ee2e5.apk`
- Source: `49ee2e5f864eb11d89c1b7ceb995e6f5febbd17f`
- SHA-256: `40F6490FEA4A470A636FBBF12778370AA2BFF38D6BB4A38E2E5686693E1DF7CA`
- Size/ABI:50,630,161 bytes, ARM64; certificate `FAC61745…3B9C` unchanged
- Matching web tree: `CC6653A39FE6E7FF1C146AC01984200E1FA091C3ECA076D164CEEB9F23F1F017`
- Web release: `20261109T095638Z-49ee2e5`
- Private Drive file: `19o_O6UnlyiEAsksj-sW5xaCdjCkOLkmr`
- Pair: `COMPLETE`, both owner smokes accepted

Delivery used the connected Google Drive upload into the existing private
BTB APK folder because the local rclone config/remote was absent. Owner-only
permission metadata and an authenticated Windows HTTPS streamed download
verified exact size/SHA-256. No local readback copy, sharing link, policy or
authentication configuration change was created.

After each acceptance and COMPLETE, the superseded local APK was removed under
the owner's29 October retention rule: E549 (`FDBF2981…367C`) for ED30743, then
ED30743 (`D303F543…D003`,50,608,225 bytes) for 6A416A1, then 6A416A1 (`7A512C0C…02D8`,50,608,417 bytes) for 5F26C70, then5F26C70
(`DE08B361…8CA3`,50,609,985 bytes) for49EE2E5. 49EE2E5 is the sole
permanent local APK in the artifact directory. Config/hash/delivery/acceptance
receipts, source, cloud copies (6A416A1 Drive file `1cJgY9SbY5mfjpasomEHWEJijAT82Wwva`, ED30743 Drive file `1QPScFiQbZZyOjvtbRRLDA_vKTMGg8GIP`,
E549 `1woDYD2ZCPgDf0nhEjRbe4viQF3ERQQMe`,5F26C70 `1pZtL3jqQ9pb99DFJSzSUu1ElOW9U5hbc`) and versioned web releases remain preserved.

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

The paired Selection Lab release is complete. Actual challenger delivery remains
dependent on BTB-owned TASK-0229 source/latency acceptance and real C1
registration/execution; TASK-0230 retains that dependency. C2/C3 require their
separate scientific/identity gates. Do not recreate owner smoke-wait tasks or
infer model success from this UI release.

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
