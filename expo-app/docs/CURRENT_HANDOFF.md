# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-21
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

## Tema batch'i (Claude, 2026-10-21) — push edildi, release bekliyor

Design canvas v40 teması `11d4b12` üzerine yalnız tema olarak, iki yüzeyde
birlikte uygulandı ve sahip onayıyla `master`'a commit/push edildi:
`32a85a8d0ad4297fe650dc75d5b8527a8cb09dcd`. APK ve web henüz bu commit'ten
üretilmedi; kurulu Android ve yayındaki web `a00b743` çiftinde kalır. Gömülü
Manrope/Barlow Condensed (OFL, `assets/fonts`), RB1 karar ve kanıt ile sonuç
ekranları ve Karar fişi, board
düzeninde Özet/Canlı/Super/Toto/Daha Fazla, web kenar çubuğu daraltma oku.
Backend kararı, durumlar, doğrulayıcılar, sözleşmeler ve kanıt anlamı
değişmedi. Typecheck, lint, 691 test, tooling 32, marka, doctor 20/20, edge ve
mocks web export (scratch; yayınlanmış `dist-web` korunur) ve tarayıcıda iki
tema/iki genişlik geçti. İzole, gizli değersiz mocks x86_64 APK emulator
smoke'u (yerel yazı tipleri, RB1 ekranları, Karar fişi, iki tema) geçti; bu
derleme emülatördeki önceki test kurulumunun yerine kuruldu (uygulama verisi
korundu, sahip telefonu etkilenmedi). Ayrıntı, platform istisnaları ve panodan
bilinçli sapmalar: `THEME_BATCH_2026-10-21.md`. Yeni bulgular NXT-OBS-180/181.

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
commits do not change those artifacts. BFF source `c6b4b0dab6bc4c5be5aa83158ccdc7217eed88cf`;
backend DEV exact main `0f24c9debb5c5f3d09e933813147fead7dcdeb57`.
Model `BTB_RB1_20261018`, policy `2BD9B781186351B53E1215B1CDCD245BD073C8CEEFB4C8B9468EFF3E18BE6F62`,
producer `18714D2689D36E8E0A8AB3AD62437CC46C51741D9832FDD540C018B04B81B150`. BFF/SAP identities agree; explicit ED89 predecessor history is retained.

## Doğrulama

Client type/lint/tests/doctor, Android bundle/build/signature/ARM64, verified
edge web export and canonical paired-release completion passed. Both actual
owner smokes passed. BFF 644 tests and authenticated local/public report/list/
detail smoke passed. Fresh native read matched 45 objects / 110 components.
Final MODEL syntax and full ATC have zero findings; no Unit methods confirmed.
Reuse 61A's 124 harmless dependency methods; retain inherited findings.
Live-label repair accepts `39'`/`62′` without changing the model or client API.

## Açık observation / blokajlar

TASK-0170 repaired/deployed under 66A/67A: 265 harmless SAP tests, clean syntax,
zero unaccepted new P1 and 26 explicitly accepted source-bound CADENCE findings.
The sampler's actual minute-based executions and 47-object/114-component source
readback passed. BFF 646 tests and local/public list/detail/report smoke passed.
Receipt: `BTB Logs/model_lab/reports/BTB_RB1_REPAIR_COMPLETE_2026-10-21.md`.
Actual live pressure/star admission is still UNOBSERVED (TASK-0168). Nine old
stored LIVE fixtures are PLAYED at the provider; terminal-state refresh is
TASK-0171, BTB-owned. Claude changes theme only; preserve unavailable states and
do not manufacture stars or hide this separate data issue. APK/web are unchanged.

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

Coordinated APK/web release of the pushed 2026-10-21 theme batch: signing and
private APK delivery and the matching web publication each need their own
explicit approval; physical Xiaomi and published-web smokes close NXT-OBS-181.
Keep backend decisions, frozen first facts, result accounting and Jinx evidence
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
