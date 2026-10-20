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

No delivery blocker remains. Quality/pressure/episode/result observations go
to `BTB Logs/cutover_2026-10-20/CUTOVER_NOTES.md`; client usability findings go
to `OBSERVATION_LOG.md`. A5 learning remains analysis/manual approval only.
No profitability or calibrated-probability claim. Stars mean consistency and
evidence quality; pool percentages mean sample support. A3 remains separate.
Android widgets consume the RB1 report; desktop web uses the shared report.

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
