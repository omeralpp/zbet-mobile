# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-20
Mod: `OBSERVATION`
Delivery: `OWNER_ONLY_DEV_PILOT / PAIRED_RELEASE_COMPLETE`
Workspace: `C:/dev/btb-cdoex`; Mobile owner: `BTB Mobile Next - Aktif`.
Previous checkpoint preserved verbatim in
`handoff_archive/CURRENT_HANDOFF_before_RB1_2026-10-20.md`.

## Son checkpoint

RB1 implementation and coordinated delivery complete under 62A/63A/64A.
Installed Android and published web share source `a00b743` and both actual
owner smokes passed. New model is active in DEV; normal maintenance has begun.
M21/TASK-0167 and M20/TASK-0156 implementation/delivery are complete.
Ongoing algorithm observation is BTB cutover work, not a remaining design gate.
Claude may continue shared Android/web design from
`CLAUDE_DESIGN_HANDOFF_2026-10-20.md`.

## Final yerel pilot APK

[Private RB1 APK](https://drive.google.com/file/d/1X314Uy3RKwTcC-4FvqAYpfNkD7XasZ2S/view?usp=drivesdk)
`btb-mobile-next-arm64-rb1-a00b743.apk`, 50085332 bytes, ARM64.
SHA256 `AF300CB9D35EC2FD5792A9ED6961999784169060712F86A52C13FEA4715BD0D5`.
Owner-only Drive permissions, signature/ABI and authenticated readback verified;
owner confirmed this exact linked APK opens and BTB results load. No ADB
installation/hash measurement is claimed.
Web `https://app.surklase.com`, release `20261020T190600Z-a00b743`;
paired asset tree `9753439EDBE8BEE37930FC81A703FD59D012E7916644D75461E950E08C9A756D`.
Batch `client-a00b743ba8dab6664595a9b6ca177afb0cff2c1a-AF300CB9D35E-9753439EDBE8` is COMPLETE.
Previous accepted ee48ccd APK/web pair is retained for bounded recovery.

## Repo durumu

Artifact source `zbet-mobile/master` `a00b743ba8dab6664595a9b6ca177afb0cff2c1a`; subsequent handoff-only
commits do not change those artifacts. BFF source `5eea01c476edd5ac9ddfe197925d22bbaae879fe`;
backend DEV exact main `6b0139167f2fca098d8a5f7eeeff5ea6cbc1e9f2`.
Model `BTB_RB1_20261018`, policy `2BD9B781186351B53E1215B1CDCD245BD073C8CEEFB4C8B9468EFF3E18BE6F62`,
producer `ED89FB445977071384DFB9356FB3061C949D53FFA5ADD85D71CC23DD679A84AE`. BFF/SAP identities agree.

## Doğrulama

Client type/lint/tests/doctor, Android bundle/build/signature/ARM64, verified
edge web export and canonical paired-release completion passed. Both actual
owner smokes passed. BFF 644 tests and authenticated local/public report/list/
detail smoke passed. Fresh native read matched 45 objects / 110 components.
Final MODEL syntax and full ATC have zero findings; no Unit methods confirmed.
Reuse 61A's 124 harmless dependency methods; retain inherited findings.
Live-label repair accepts `39'`/`62′` without changing the model or client API.

## Açık observation / blokajlar

New live readiness blocker: TASK-0170 / P1, owner BTB. The 20 October
23:15–23:20 Istanbul check found an evaluation-clock ordering defect, fixture-only
quote mappings rejecting real live markets, and pressure resets from 180-second
job spacing. Arithmetic is correct, but recommendations are not ready. See
`BTB Logs/model_lab/reports/BTB_RB1_READINESS_BLOCKERS_2026-10-20.md`.
Theme work must retain backend reasons and must not manufacture stars or treat
this P1 as a visual issue. Earlier paired delivery remains a historical fact.

Quality/pressure/episode/result observations go
to `BTB Logs/cutover_2026-10-20/CUTOVER_NOTES.md`; client usability findings go
to `OBSERVATION_LOG.md`. A5 learning remains analysis/manual approval only.
No profitability or calibrated-probability claim. Stars mean consistency and
evidence quality; pool percentages mean sample support. A3 remains separate.
Android widgets consume the RB1 report; desktop web uses the shared report.

65A runtime maintenance: legacy A3 prospective writer is off
(`BTB_PROSPECTIVE_ENABLED=false` in User and launch Process); list/detail/report
smokes passed. Future restarts must not inherit stale Process=true. RB1 seals,
APK/web assets and notification settings are unchanged. Separate local-history
cleanup is BLOCKED as TASK-0169: automatic approval review rejected deletion,
zero files removed. The SAP cleanup inventory is read-only; preserve MAIN and
all RB1 tables/results. Details are in the two `BTB_LEGACY_CLEANUP_*_2026-10-20.md`
reports under `BTB Logs/model_lab/reports/`.

Owner cleanup verified afterward: collector and all 18 listed whole folders
are absent; 287 original files are absent and 144 remain (3,876,542 bytes),
keeping TASK-0169 unfinished. Earlier SAP verification found nine legacy tables
empty; checked protected counts and RB1 source hashes show no loss/drift.
Local/public API report/list/detail/evidence checks passed. See the latest
`BTB_LEGACY_CLEANUP_VERIFICATION_2026-10-20.md` report; prior checkpoint above
describes the agent's rejected deletion attempt, not the owner's later actions.

## Exact next steps

Continue Android/web design together in Claude using the handoff below. Keep
backend decisions, frozen first facts, result accounting and Jinx evidence
meaning unchanged unless the owner separately approves a model change.
Every future client release still requires a new clean pushed common commit,
paired APK/web artifacts, actual installation before web publication and both
smokes. This completed batch does not authorize another release.

## Documents

`CLAUDE_DESIGN_HANDOFF_2026-10-20.md`, `ARCHITECTURE.md`,
`NEXT_CUTOVER_PROCEDURE.md`, `COORDINATED_CLIENT_RELEASE.md`,
`contracts/mobile-api.openapi.yaml` and rebuild schemas.
Durable receipts: `btb-codex/docs/evidence/client-release-a00b743-2026-10-20.json`
and `btb-rebuild-pilot-complete-2026-10-20.json` in the workspace.
