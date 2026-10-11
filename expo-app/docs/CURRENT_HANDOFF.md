# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-11

Mod: `OBSERVATION`

Çalışma alanı: `C:\dev\btb-cdoex` · Aktif task: `BTB Mobile Next - Aktif`

This file carries current state only. Every dated entry through 2026-09-16 19:58
is kept verbatim in
[handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md](handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md);
open it only for a specific past checkpoint. New checkpoints replace the
sections below instead of stacking above them; the section headings are selected
by `btb-codex/config/thread-context.config.json`, so keep them.

## Son checkpoint

2026-10-11: owner approved BTB-owned TASK-0121 through APK creation. Grounded
Jinx V2 reading is implemented locally with supporting, limiting and watch
sections, version negotiation and V1 compatibility. Full BFF tests/production
build, Mobile core checks and authentic V2 contract smoke pass. Signed ARM64 APK
is privately delivered with matching download SHA-256. Details:
[TASK_0121_JINX_READING_2026-10-11.md](TASK_0121_JINX_READING_2026-10-11.md).
Owner subsequently approved scoped commit/push and updating the existing pilot
BFF. CAP `18709ae` is pushed and active, PID 30048. Public LIVE-origin V2,
V1 compatibility, 97-match Mobile schema and V2 paragraph guards pass.
Owner Hartberg–Lustenau phone screenshots show all three V2 blocks; physical
presentation is evidenced, explicit quality acceptance remains pending. Details:
[phone evidence](observation_archive/task0121_phone_evidence_2026-10-11.md).
No SAP, scorer, provider, Cloudflare or Firebase behavior changed.

TASK-0102 is DONE: owner confirmed the main Match Path phone smoke and closed
remaining physical edge checks; they were waived, not measured. Evidence:
[task0102_phone_acceptance_2026-10-11.md](observation_archive/task0102_phone_acceptance_2026-10-11.md).
Event probability remains unmeasured. Docker/SAP incident is resolved; checkpoint
`btb-codex/docs/THREAD_CLOSE_2026-10-10.md` remains valid for that delivery.

- **Mode.** Observation; no open `btb next cutover start` run. Explicit TASK-0121
  batch and pilot runtime are delivered; V2 phone presentation evidenced,
  explicit owner quality acceptance pending.
- **Work.** TASK-0121 IN_PROGRESS; TASK-0102, TASK-0011 and TASK-0109 DONE.
  Mobile milestones M1, M2, M11 and M15 are closed. Legacy Cordova retired
  2026-08-16. Retain TASK-0102 as the installed rollback baseline.
- **Runtime route.** Phone → `https://api.surklase.com` (Cloudflare) → pilot BFF
  `zbet-cap/standalone-server.js` on `127.0.0.1:4004`, auth mode `pilot`, run
  from the `zbet-cap` main checkout by the Windows task `BTB Mobile BFF`
  (`ensure-mobile-bff.ps1` → `start-mobile-bff.ps1 -AuthMode pilot`). Running
  `zbet-cap` `18709ae`, PID 30048 after TASK-0121 approved restart (prior PID 20716).
  Local/public `/health` 200, unauthenticated `/v1/btb/matches` 401; authenticated
  V3/V4 real-fixture reads and exact V3 projection parity verified.
- **Restart.** Stop the node PID listening on 4004, wait for its parent launcher
  to exit, then `Start-ScheduledTask 'BTB Mobile BFF'`. Logs are under
  `%LOCALAPPDATA%\BTB Mobile Next\runtime`; each start archives the previous
  pair to `runtime\archive` (30 per stream).
- **Jinx currently running (V1/V2).** Same provider `gemini-3.5-flash-lite`,
  key only in `BTB_JINX_LLM_API_KEY`, never printed; owner
  decisions: keep this model, and a factual summary during a provider outage is
  enough. The BFF computes the verdict and headline for 16 markets from the live
  score. V1 retains its validated short commentary. V2 provider orders complete
  source-bound fact IDs; BFF renders supporting/limiting/watch sentences without
  allowing new statistics or omitted counterevidence. Generations are spaced one second apart with a
  bounded one-second wait; telemetry is on `/health` (`jinxOutlookTelemetry`).
  Freshness: the "may not be current" badge follows only fetch-timed sources, the
  displayed decision shows its minute, league standings have no age budget, and
  pressure is current for 240 s against SAP's 180 s write cycle. Only live
  matches with a displayed star selection can ask.

## Final yerel pilot APK

- **TASK-0121 privately delivered; V2 phone presentation evidenced, quality acceptance pending.**
  `btb-mobile-next-arm64-task0121.apk`, 54,356,433 bytes, SHA-256
  `2CF051C696A08DD5794B46C8D24E944D0A093F83DD5B4D0C2D2C2184A855F4B2`.
  Mobile implementation based on `3f41b47`, recorded with this handoff; per-file manifest is
  under CAP `.codex-artifacts/task0121-source-manifest.json`. ARM64, verified V2
  signature, existing pilot certificate/package/version, API, auth and all three
  LIVE flags. Packaged V2 consumer/header and secret scan passed. Private Drive
  [owner download](https://drive.google.com/file/d/1UFEvhszZLgfZgyz3jcBiNsMqBu1fLLDS/view?usp=drivesdk)
  has owner-only permissions; authenticated download checksum matches exactly.
  Matching BFF `18709ae` is active and serves V2; older clients retain V1.
- **Installed rollback; main phone smoke accepted October 11.** `btb-mobile-next-arm64-task0102.apk`, 54,355,121 bytes,
  SHA-256 `FD60A83A7B3249DD623BB50D131D3D12B4F6DC7F3156DFA45700881FE64886EE`,
  built from Mobile code `cd29701`, arm64-v8a. Signature V2 verified, same pilot
  certificate `fac61745…033b9c` and package `com.btb.mobile.next` as the installed
  baseline, versionCode 1 / versionName 0.1.0. API `https://api.surklase.com`,
  auth `pilot`, mocks off; Match Journey, Team Form and Jinx `LIVE`. V4 consumer
  code and pilot credential readback verified inside the APK. File and public
  config receipt are under `.codex-artifacts/` in the Expo app.
- **Previous / rollback baseline.** `btb-mobile-next-arm64-task0109.apk`, 54,351,369 bytes, SHA-256
  `208E50D792D822FD0832C8B7571F404C892E09A9B02F321C91CAF625120371DB`, arm64-v8a,
  pilot certificate `fac61745…033b9c`. Effective settings: API
  `https://api.surklase.com`, auth `pilot`, mocks off, Match Journey `LIVE`,
  Team Form `LIVE`, Jinx `LIVE`. Evidence file:
  `.codex-artifacts/btb-mobile-next-arm64-task0109.apk.config.json`.
- The TASK-0109 client keeps requesting V3 against the new BFF. A BFF rollback
  to `6c3fce1` also supplies V3 to the new client, leaving goal effect unmeasured.
  No ADB installation evidence exists; TASK-0102 installation is owner-reported,
  and main screen acceptance is owner-confirmed with screenshots. Physical edge
  checks were closed by owner decision; limits are in the October 11 evidence note.
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
  future approved pilot APK deliveries. Main phone smoke is accepted; the owner
  closed the remaining phone checks, with no October 12 review pending.

## Repo durumu

CAP `18709ae` (`main`) is pushed and active. TASK-0121 Mobile implementation,
contract and verified delivery notes are recorded together on `master`, based on
`3f41b47`; Codex registry records the approved delivery and remaining phone gate.
Run `btb status` for the live SHAs instead of trusting this line later.

## Doğrulama

- Mobile gate: `btb-codex/scripts/invoke-mobile-check.ps1` (Expo Doctor carries a
  known 16-package version mismatch). BFF gate:
  `btb-codex/scripts/invoke-mobile-bff-check.ps1 -ProductionBuild`; full tests
  and production build PASS for the unchanged validated TASK-0121 sources in
  `18709ae`. Mobile core, native ARM64 build and actual public V1/V2 schema/
  paragraph smoke pass. Source hashes match the delivered APK's build inputs.
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

- `OBSERVATION_LOG.md` holds no OBSERVED/READY rows and 11 DEFERRED rows.
  New Jinx commentary-quality feedback is routed to BTB-owned TASK-0121.
  Its authorized local batch/APK checkpoint is in
  `TASK_0121_JINX_READING_2026-10-11.md`. Approved runtime update is verified;
  V2 phone acceptance is scheduled for read-only review on 2026-10-12.
  The Docker/SAP runtime incident is resolved and archived. All three existing
  containers are running; the BFF is now on PID 30048. Recovery proof is
  local Docker/transport and authenticated BFF data, not a SAP MCP object read.
  Cleanup preserved sources, data, signing/configuration, Docker volumes/SAP
  backup and both current/rollback APKs; only generated paths/caches were removed.
- BTB-owned TASK-0102 is DONE for accepted descriptive goal-effect delivery;
  event probability remains unmeasured and is outside this closure. Main phone
  smoke and one real nonzero goal detail were accepted October 11. Owner closed
  remaining physical edge checks and will report any new defect for a new task.
  TASK-0101 red-card measurement requires new capture/population evidence;
  its read-only review is scheduled for 2026-10-15.

## Exact next steps

1. Matching BFF `18709ae` is active; owner screenshots show physical V2 presentation.
2. Confirm that TASK-0121 commentary quality is satisfactory. Keep TASK-0102
   as rollback. Review the
   evidence gate on 2026-10-12; the date grants no approval or acceptance.
3. Keep observing; new findings become observation rows or separately owned tasks.

## Documents

`OBSERVATION_LOG.md` (open rows), `NEXT_CUTOVER_PROCEDURE.md`, `ARCHITECTURE.md`,
`contracts/mobile-api.openapi.yaml`, `zbet-cap/docs/mobile-bff-sap-mapping.md`,
`zbet-cap/docs/prospective-evidence.md`.
