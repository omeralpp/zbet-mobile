# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-11-04
Mod: `PAIRED_RELEASE_COMPLETE / OWNER_ONLY_DEV / E549CB0`

Owner: BTB Mobile Next - Aktif. Workspace: C:/dev/btb-cdoex.
Earlier handoff history remains in [the historical document](HANDOFF_HISTORY_THROUGH_2026-10-29.md)
and the dated release reports/receipts.

## Son checkpoint

TASK-0222 is delivered and accepted on Android and desktop web.
Accepted source: **e549cb0478403bb8a36146224f3973343a536e37**.
Batch: `client-e549cb0478403bb8a36146224f3973343a536e37-FDBF298101CF-D76F5484F65C`.
Canonical paired completion passed on 4 November 2026.

The graph requests `observed-window.v2`: proven 240–360 second windows support
the observed 120-second capture cadence; shared labels show the actual interval
and activity per minute. Source, missing-data, reset and continuity guards
remain enforced. V1 clients retain their previous contract.
[Repair and release evidence](PRESSURE_ACTIVITY_REPAIR_2026-11-04.md).

The owner installed the exact private APK and confirmed “Bu APK’yı kurdum;
uygulama ve grafik sorunsuz”, then accepted the published web:
“Web’de de uygulama ve grafik sorunsuz”. These are owner smoke attestations,
not device-side hash measurements or exhaustive accessibility/performance tests.

Canonical receipts in `btb-codex/docs/evidence/`:
`pressure-activity-v2-{APPROVAL,PREPARED,DRIVE,ANDROID-DELIVERY,ANDROID-INSTALLED,POST-INSTALL-VERIFIED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE,LOCAL-APK-RETENTION,STATUS}-2026-11-04.json`.
Preparation and publication receipts preserve their original intermediate
states; COMPLETE and current STATUS establish final completion.

The previous accepted E3 pair delivered NXT-OBS-242/243/244 (Super decision
facts, Bilyoner consistency, chunked 7/30-day views and period-menu repair).
Its receipts remain historical:
`super-menu-release-e3ae5df-{PREPARED,DELIVERY,ANDROID-INSTALLED,PUBLICATION,OWNER-ACCEPTANCE,COMPLETE}-2026-11-03.json`.
Intermediate6141e2f and1fcf5cf batches remain incomplete/superseded, without
retrospective release credit. Their reports and receipts are preserved.

## Repo durumu

| Repository | Source checkpoint | Meaning |
| --- | --- | --- |
| zbet-mobile / master | e549cb0478403bb8a36146224f3973343a536e37 | Accepted artifact source; subsequent handoff-only commits do not rebuild/release the app |
| zbet-cap / main | 178ca6df248c93a64da6b25a9bd2d0d54a1d38cf | Running BFF, versioned pressure activity fix |
| zbet-abap / main | 5751cbfdaf705478d21459de533a62ca19c4a101 | Previously accepted reader repair, policy71AC/producerDE3C; unchanged by this Mobile batch |

Android and desktop use `api.surklase.com`; local BFF origin127.0.0.1:4004.
Cloudflare Access protects `app.surklase.com`. This remains owner-only DEV.
The approved BFF restart changed PID10648 to30828; web publication changed it
to10148 on the same CAP source. Policy71AC/producerDE3C and historical-source
configuration were preserved.
Published root: `C:/Users/omera/AppData/Local/BTB Mobile Next/web/releases/20261104T091348Z-e549cb0`.

## Doğrulama

- BFF713/713 tests and production build passed on Node24.
- Shared client type/lint/brand,797/797 tests,33/33 tooling and Doctor20/20 passed.
- Android bundle, signed ARM64 APK and verified edge web export passed;
  artifact secret scans found0 findings.
- Bounded retained fixture3264677: default/v1/v2 preserved8 native intervals
  and74 observations; v1 produced0 activity columns, v2 produced23 valid
  columns spanning241.962–354.321 seconds. The actual response also passed
  the frozen shared client schema offline.
- Publisher verified57 served files (56 expected assets plus receipt verification),
  zero mismatches. Shell/deep-link/API-refusal probes passed; public Access
  redirect remains protected.
- Owner accepted the preview and both final client smokes. Automated browser
  visual smoke was not observed: Computer Use could not verify the Windows URL.

Technical delivery is not proof of calibrated probability, profitability,
complete live-feed availability or universal defect absence.

## Final yerel pilot APK

- Accepted APK: `btb-mobile-next-arm64-pressure-e549cb0.apk`
- Source: `e549cb0478403bb8a36146224f3973343a536e37`
- SHA-256: `FDBF298101CFF746B294721C45948E4D8750F4D01A2D39C0534A012A0D26367C`
- Size/ABI:50,584,645 bytes, ARM64; certificate `FAC61745…B9C` unchanged
- Matching web tree: `D76F5484F65C314D00014701AF94A3B37CF16423779672A6D30A514F0F726907`
- Web release: `20261104T091348Z-e549cb0`
- Private Drive file: `1woDYD2ZCPgDf0nhEjRbe4viQF3ERQQMe`
- Pair: `COMPLETE`, both owner smokes accepted

Rclone had no local remote configuration and stopped before upload. The
authorized connected Drive fallback used the existing owner-only BTB APK
folder; remote size/hash and owner-only permissions were verified.
No sharing policy or authentication configuration changed.

After acceptance and COMPLETE, the exact superseded local E3 APK
(`17989A70…AEEE`,50,579,109 bytes) was removed under the owner's29 October
retention rule. E549 is the sole permanent local APK in the artifact directory.
Config/hash/delivery/acceptance receipts, source, cloud copies and versioned
web releases remain preserved.

## Açık observation / blokajlar

TASK-0222 is DONE; no pressure-graph release step remains.
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
No extra daily/weekly signature-wait task is needed forTASK-0222.
Regression checks now cover the real120-second cadence, missing captures,
phase/source/reset boundaries, interval labels and v1/v2 compatibility.
Source gaps remain unavailable rather than invented values.

Future releases still require one clean pushed source, verified pair, private
APK installation before matching web publication, and both owner smokes under
explicit release approval. Deferred work retains its evidence/approval conditions.

## Documents

[Architecture](ARCHITECTURE.md), [next cutover procedure](NEXT_CUTOVER_PROCEDURE.md),
[coordinated release](COORDINATED_CLIENT_RELEASE.md), OpenAPI, rebuild schemas
and historical handoffs retain their roles. Mobile/BFF expose read-only DTOs;
BTB/Toto model and learning decisions stay with their owners.
