# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-10

Mod: `OBSERVATION`

Çalışma alanı: `C:\dev\btb-cdoex` · Aktif task: `BTB Mobile Next - Aktif`

This file carries current state only. Every dated entry through 2026-09-16 19:58
is kept verbatim in
[handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md](handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md);
open it only for a specific past checkpoint. New checkpoints replace the
sections below instead of stacking above them; the section headings are selected
by `btb-codex/config/thread-context.config.json`, so keep them.

## Son checkpoint

2026-10-10: TASK-0102 pilot BFF deployed and signed arm64 APK delivered privately in Drive;
physical-phone installation and screen acceptance remain pending.

- **Mode.** Observation; no open `btb next cutover start` run.
- **Work.** BTB-owned TASK-0102 has an approved BFF/Mobile implementation:
  opt-in `match-journey.v4` shows a goal's effect on all tied leading scorelines.
  Local delivery evidence and remaining gates are in
  [TASK_0102_GOAL_EFFECT_2026-10-10.md](TASK_0102_GOAL_EFFECT_2026-10-10.md).
  Runtime update and signed local APK are verified. Phone acceptance remains
  pending, with the next evidence review on 2026-10-12.
  TASK-0011 (Jinx match analyst) is DONE
  (`btb-codex` `ab9b7c8`) and TASK-0109 (Toto prize currency) is DONE. Mobile
  milestones M1, M2, M11 and M15 are closed. Legacy Cordova was retired on
  2026-08-16.
- **Runtime route.** Phone → `https://api.surklase.com` (Cloudflare) → pilot BFF
  `zbet-cap/standalone-server.js` on `127.0.0.1:4004`, auth mode `pilot`, run
  from the `zbet-cap` main checkout by the Windows task `BTB Mobile BFF`
  (`ensure-mobile-bff.ps1` → `start-mobile-bff.ps1 -AuthMode pilot`). Running
  `zbet-cap` `626ef1d`, PID 20716 after the approved restart (previous PID 22656).
  Local/public `/health` 200, unauthenticated `/v1/btb/matches` 401; authenticated
  V3/V4 real-fixture reads and exact V3 projection parity verified.
- **Restart.** Stop the node PID listening on 4004, wait for its parent launcher
  to exit, then `Start-ScheduledTask 'BTB Mobile BFF'`. Logs are under
  `%LOCALAPPDATA%\BTB Mobile Next\runtime`; each start archives the previous
  pair to `runtime\archive` (30 per stream).
- **Jinx as delivered.** Provider `gemini-3.5-flash-lite` (free tier 15 RPM, 500
  requests per day), key only in `BTB_JINX_LLM_API_KEY`, never printed; owner
  decisions: keep this model, and a factual summary during a provider outage is
  enough. The BFF computes the verdict and headline for 16 markets from the live
  score; the provider writes Turkish commentary only, and validation rejects
  judgment words and field names. Generations are spaced one second apart with a
  bounded one-second wait; telemetry is on `/health` (`jinxOutlookTelemetry`).
  Freshness: the "may not be current" badge follows only fetch-timed sources, the
  displayed decision shows its minute, league standings have no age budget, and
  pressure is current for 240 s against SAP's 180 s write cycle. Only live
  matches with a displayed star selection can ask.

## Final yerel pilot APK

- **Ready to install.** `btb-mobile-next-arm64-task0102.apk`, 54,355,121 bytes,
  SHA-256 `FD60A83A7B3249DD623BB50D131D3D12B4F6DC7F3156DFA45700881FE64886EE`,
  built from Mobile code `cd29701`, arm64-v8a. Signature V2 verified, same pilot
  certificate `fac61745…033b9c` and package `com.btb.mobile.next` as the installed
  baseline, versionCode 1 / versionName 0.1.0. API `https://api.surklase.com`,
  auth `pilot`, mocks off; Match Journey, Team Form and Jinx `LIVE`. V4 consumer
  code and pilot credential readback verified inside the APK. File and public
  config receipt are under `.codex-artifacts/` in the Expo app.
- **Installed / rollback baseline.** `btb-mobile-next-arm64-task0109.apk`, 54,351,369 bytes, SHA-256
  `208E50D792D822FD0832C8B7571F404C892E09A9B02F321C91CAF625120371DB`, arm64-v8a,
  pilot certificate `fac61745…033b9c`. Effective settings: API
  `https://api.surklase.com`, auth `pilot`, mocks off, Match Journey `LIVE`,
  Team Form `LIVE`, Jinx `LIVE`. Evidence file:
  `.codex-artifacts/btb-mobile-next-arm64-task0109.apk.config.json`.
- The TASK-0109 client keeps requesting V3 against the new BFF. A BFF rollback
  to `6c3fce1` also supplies V3 to the new client, leaving goal effect unmeasured.
  ADB had no connected device; the new APK is not claimed installed or accepted.
- **Delivery preference (owner, 2026-10-10).** Upload each final verified,
  owner-authorized pilot APK privately to the owner's connected Google Drive,
  then return its download link. Standing upload approval and readback rules
  are in `NEXT_CUTOVER_PROCEDURE.md` (APK delivery preference).
  TASK-0102 upload completed on 2026-10-10 after Drive tools became available.
  APK: [private owner download](https://drive.google.com/file/d/12xEGoUhYMpBXc1PIXbkotg0ueIhFQai4/view?usp=drivesdk),
  file ID `12xEGoUhYMpBXc1PIXbkotg0ueIhFQai4`, in the private
  [BTB Mobile Next APK folder](https://drive.google.com/drive/folders/18poabE-hnuRNKTEYSR3knALfU9t_otqE).
  Metadata confirmed 54,355,121 bytes, the expected folder and owner-only
  permissions (`shared=false`). Authenticated download readback matched the
  SHA-256 above exactly. No public sharing was enabled. Reuse this folder for
  future approved pilot APK deliveries. Phone acceptance remains due for review
  on 2026-10-12; upload does not prove installation.

## Repo durumu

Delivered code: `zbet-cap` `626ef1d` (`main`), Mobile `cd29701` (`master`).
The delivery notes and task evidence are committed separately after verification.
Run `btb status` for the live SHAs instead of trusting this line later.

## Doğrulama

- Mobile gate: `btb-codex/scripts/invoke-mobile-check.ps1` (Expo Doctor carries a
  known 16-package version mismatch). BFF gate:
  `btb-codex/scripts/invoke-mobile-bff-check.ps1 -ProductionBuild`; full tests
  and production build PASS on `626ef1d`. Mobile core gate passed on `cd29701`;
  the native arm64 release build passed after bounded memory/worker retry.
- Pilot APK: `zbet-mobile/expo-app/scripts/build-pilot-apk.ps1` needs explicit
  `EXPO_PUBLIC_MATCH_PATH_INTELLIGENCE`, `EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE` and
  `EXPO_PUBLIC_MOBILE_INTELLIGENCE` (`off`/`synthetic`/`live`) plus
  `EXPO_PUBLIC_MOBILE_AUTH_MODE=pilot`; it reads the embedded config back and
  writes a secret-free evidence file. Run it outside `2>&1` redirection.
- Client schemas are strict (`z.strictObject`): an unknown BFF field breaks
  parsing. TASK-0102 explicitly negotiates V4 with
  `X-BTB-Match-Journey-Version`; omitted headers retain V3. The updated client
  also accepts V3, allowing either deployment order without exposing V4 fields
  to old clients. Keep new schemas versioned rather than silently adding fields.
- Commit/push, BTP deploy, Cloudflare publication, SAP or Firebase changes and
  APK distribution each need their own owner approval (`AGENTS.md`).

## Açık observation / blokajlar

- `OBSERVATION_LOG.md` holds no OBSERVED or READY rows; 10 rows are DEFERRED
  behind external gates. Nothing waits on the owner.
- BTB-owned TASK-0102 remains IN_PROGRESS; event probability is unmeasured.
  Phone install and real goal-detail acceptance evidence are reviewed next on
  2026-10-12; if missing, record the finding and a new date.
  TASK-0101 red-card measurement requires new capture/population evidence;
  its read-only review is scheduled for 2026-10-15.

## Exact next steps

1. Install TASK-0102's verified APK as an update and verify one real goal detail
   on the phone before claiming screen acceptance. Keep the TASK-0109 rollback.
2. Keep observing on the phone; record each new finding as a row in
   `OBSERVATION_LOG.md` without code changes.
3. Start `btb next cutover start` only when the owner says so and OBSERVED rows
   exist; follow `NEXT_CUTOVER_PROCEDURE.md`.

## Documents

`OBSERVATION_LOG.md` (open rows), `NEXT_CUTOVER_PROCEDURE.md`, `ARCHITECTURE.md`,
`contracts/mobile-api.openapi.yaml`, `zbet-cap/docs/mobile-bff-sap-mapping.md`,
`zbet-cap/docs/prospective-evidence.md`.
