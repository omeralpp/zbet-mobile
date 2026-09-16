# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-09-16

Mod: `OBSERVATION`

Çalışma alanı: `C:\dev\btb-cdoex` · Aktif task: `BTB Mobile Next - Aktif`

This file carries current state only. Every dated entry through 2026-09-16 19:58
is kept verbatim in
[handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md](handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md);
open it only for a specific past checkpoint. New checkpoints replace the
sections below instead of stacking above them; the section headings are selected
by `btb-codex/config/thread-context.config.json`, so keep them.

## Son checkpoint

2026-09-16 20:30 TRT.

- **Mode.** Observation; no open `btb next cutover start` run.
- **Work.** No open Mobile task. TASK-0011 (Jinx match analyst) is DONE
  (`btb-codex` `ab9b7c8`) and TASK-0109 (Toto prize currency) is DONE. Mobile
  milestones M1, M2, M11 and M15 are closed. Legacy Cordova was retired on
  2026-08-16.
- **Runtime route.** Phone → `https://api.surklase.com` (Cloudflare) → pilot BFF
  `zbet-cap/standalone-server.js` on `127.0.0.1:4004`, auth mode `pilot`, run
  from the `zbet-cap` main checkout by the Windows task `BTB Mobile BFF`
  (`ensure-mobile-bff.ps1` → `start-mobile-bff.ps1 -AuthMode pilot`). Running
  `zbet-cap` `6c3fce1`, PID 14216 since 19:58 TRT; `/health` 200, unauthenticated
  `/v1/btb/matches` 401.
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

- **Installed.** `btb-mobile-next-arm64-task0109.apk`, 54,351,369 bytes, SHA-256
  `208E50D792D822FD0832C8B7571F404C892E09A9B02F321C91CAF625120371DB`, arm64-v8a,
  pilot certificate `fac61745…033b9c`. Effective settings: API
  `https://api.surklase.com`, auth `pilot`, mocks off, Match Journey `LIVE`,
  Team Form `LIVE`, Jinx `LIVE`. Evidence file:
  `.codex-artifacts/btb-mobile-next-arm64-task0109.apk.config.json`.
- **Rollback.** `btb-mobile-next-arm64-jinx-live.apk`, 54,352,593 bytes, SHA-256
  `6250DDEE70BC53B2BDA5200ABAB7C4597F02EAB90A97DD8F8797A0B60EA7DD63`. It predates
  the optional `theoreticalPrizeCurrency` field, so rolling the phone back also
  needs a BFF that does not emit it.

## Repo durumu

At this checkpoint every repository was clean and level with its remote:
`zbet-cap` `6c3fce1` (`main`), `zbet-mobile` (`master`), `btb-codex` (`main`).
Run `btb status` for the live SHAs instead of trusting this line later.

## Doğrulama

- Mobile gate: `btb-codex/scripts/invoke-mobile-check.ps1` (Expo Doctor carries a
  known 16-package version mismatch). BFF gate:
  `btb-codex/scripts/invoke-mobile-bff-check.ps1 -ProductionBuild`; last run
  533/533 tests and production build PASS on `6c3fce1`.
- Pilot APK: `zbet-mobile/expo-app/scripts/build-pilot-apk.ps1` needs explicit
  `EXPO_PUBLIC_MATCH_PATH_INTELLIGENCE`, `EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE` and
  `EXPO_PUBLIC_MOBILE_INTELLIGENCE` (`off`/`synthetic`/`live`) plus
  `EXPO_PUBLIC_MOBILE_AUTH_MODE=pilot`; it reads the embedded config back and
  writes a secret-free evidence file. Run it outside `2>&1` redirection.
- Client schemas are strict (`z.strictObject`): an unknown BFF field breaks
  parsing, so a new field ships in an installed APK before the BFF emits it.
- Commit/push, BTP deploy, Cloudflare publication, SAP or Firebase changes and
  APK distribution each need their own owner approval (`AGENTS.md`).

## Açık observation / blokajlar

- `OBSERVATION_LOG.md` holds no OBSERVED or READY rows; 10 rows are DEFERRED
  behind external gates. Nothing waits on the owner.
- Not Mobile-owned but running on this pilot: TASK-0108 (prospective capture
  outage markers, BTB) has its next check on 2026-09-17.

## Exact next steps

1. Keep observing on the phone; record each new finding as a row in
   `OBSERVATION_LOG.md` without code changes.
2. Start `btb next cutover start` only when the owner says so and OBSERVED rows
   exist; follow `NEXT_CUTOVER_PROCEDURE.md`.

## Documents

`OBSERVATION_LOG.md` (open rows), `NEXT_CUTOVER_PROCEDURE.md`, `ARCHITECTURE.md`,
`contracts/mobile-api.openapi.yaml`, `zbet-cap/docs/mobile-bff-sap-mapping.md`,
`zbet-cap/docs/prospective-evidence.md`.
