# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-11-07
Mod: `PAIRED_RELEASE_COMPLETE / OWNER_ONLY_DEV / ED30743`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
Earlier handoff history remains in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md)
and the dated release reports/receipts.

## Son checkpoint

The splash and Özet redesign is delivered and accepted on Android and desktop web.
Accepted source: **ed30743b5a3b5a45841aab2bd8d229839fc7ad0c** (master fast-forwarded
from 183aed9; no merge commit).
Batch: `client-ed30743b5a3b5a45841aab2bd8d229839fc7ad0c-D303F543EC50-2B5A8F2E9D20`.
Canonical paired completion passed on 7 November 2026.

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
| zbet-mobile / master | ed30743b5a3b5a45841aab2bd8d229839fc7ad0c | Accepted artifact source; subsequent handoff-only commits do not rebuild/release the app |
| zbet-cap / main | 178ca6df248c93a64da6b25a9bd2d0d54a1d38cf | Running BFF, unchanged by this client-only batch |
| zbet-abap / main | 5751cbfdaf705478d21459de533a62ca19c4a101 | Previously accepted reader repair, policy71AC/producerDE3C; unchanged by this Mobile batch |

Android and desktop use `api.surklase.com`; local BFF origin127.0.0.1:4004.
Cloudflare Access protects `app.surklase.com`. This remains owner-only DEV.
Web publication replaced the BFF process (PID24544 to8004) through its
scheduled task on the same CAP source; `/health` reported ok with pilot auth
and web, SAP backend and notifications configured.
Published root: `C:/Users/omera/AppData/Local/BTB Mobile Next/web/releases/20261107T182409Z-ed30743`
(previous `20261104T091348Z-e549cb0` preserved).

## Doğrulama

- Canonical gate (`invoke-mobile-check.ps1 -BundleOnly`): type check, lint,
  unit tests, tooling tests and brand check passed.
- **Known gate exception:** Expo Doctor failed only because 7 Expo packages are
  one patch behind upstream (`expo` 57.0.31 vs 57.0.32, plus expo-constants,
  expo-dev-client, expo-notifications, expo-router, expo-splash-screen,
  expo-task-manager). `package.json` is unchanged since 2026-10-22; the owner
  chose to build. The gate's Android bundle and verified edge web export were
  then run separately with its exact commands and passed (secret scan clean).
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

- Accepted APK: `btb-mobile-next-arm64-splash-ozet-ed30743.apk`
- Source: `ed30743b5a3b5a45841aab2bd8d229839fc7ad0c`
- SHA-256: `D303F543EC5080438BFFCE7F49EC98B36E4B80D51E6CC4A7BBCF183BEBBCD003`
- Size/ABI:50,608,225 bytes, ARM64; certificate `FAC61745…3B9C` unchanged
- Matching web tree: `2B5A8F2E9D205542ADED687A2A4491F5660A3E0D18A0B7C8A82AFEBF5B733569`
- Web release: `20261107T182409Z-ed30743`
- Private Drive file: `1QPScFiQbZZyOjvtbRRLDA_vKTMGg8GIP`
- Pair: `COMPLETE`, both owner smokes accepted

Delivery used `deliver-apk-drive.ps1` through the configured `btbdrive` rclone
remote; no sharing link, policy or authentication configuration changed.

After acceptance and COMPLETE, the exact superseded local E549 APK
(`FDBF2981…367C`,50,584,645 bytes) was removed under the owner's29 October
retention rule. ED30743 is the sole permanent local APK in the artifact directory.
Config/hash/delivery/acceptance receipts, source, cloud copies (E549 Drive file
`1woDYD2ZCPgDf0nhEjRbe4viQF3ERQQMe`) and versioned web releases remain preserved.

## Açık observation / blokajlar

The splash/Özet batch has no remaining release step. Open maintenance item:
the Expo SDK 57 patch update behind the Doctor exception above; it needs its
own change, full gate (Doctor included) and a new coordinated batch.
TASK-0222 is DONE in E549.
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
No extra daily/weekly signature-wait task is needed for this batch or TASK-0222.
Next client maintenance: bring the seven Expo packages to the SDK's current
patch versions (`npx expo install --check`), rerun the full gate with Doctor,
and release as a new coordinated pair.

Future releases still require one clean pushed source, verified pair, private
APK installation before matching web publication, and both owner smokes under
explicit release approval. Deferred work retains its evidence/approval conditions.

## Documents

[Architecture](ARCHITECTURE.md), [next cutover procedure](NEXT_CUTOVER_PROCEDURE.md),
[coordinated release](COORDINATED_CLIENT_RELEASE.md), OpenAPI, rebuild schemas
and historical handoffs retain their roles. Mobile/BFF expose read-only DTOs;
BTB/Toto model and learning decisions stay with their owners.
