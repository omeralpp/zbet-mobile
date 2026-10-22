# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-22
Mod: `OBSERVATION`
Delivery: `OWNER_ONLY_DEV_PILOT / f6e18b3 PAIR AWAITING_BOTH_CLIENT_SMOKE`
Workspace: `C:/dev/btb-cdoex`; Mobile owner: `BTB Mobile Next - Aktif`.
Previous checkpoint preserved verbatim in
`handoff_archive/CURRENT_HANDOFF_before_RB1_2026-10-20.md`.

## Son checkpoint

RB1 implementation and coordinated delivery complete under 62A/63A/64A; the
`a00b743` pair passed both owner smokes. On 2026-10-21 the theme pair `473d4f2`
replaced it on both surfaces (installed APK, published web) and awaits the
owner's web smoke and the completion receipt (see below). New model is active
in DEV; normal maintenance has begun.
M21/TASK-0167 and M20/TASK-0156 implementation/delivery are complete.
Ongoing algorithm observation is BTB cutover work, not a remaining design gate.
Claude may continue shared Android/web design from
`CLAUDE_DESIGN_HANDOFF_2026-10-20.md`.

## Tema batch'i (Claude, 2026-10-21) — yayımlandı, smoke bekliyor

Design canvas v40 teması `11d4b12` üzerine yalnız tema olarak, iki yüzeyde
birlikte uygulandı ve sahip onayıyla `master`'a commit/push edildi:
`32a85a8d0ad4297fe650dc75d5b8527a8cb09dcd`; handoff `473d4f2`. Sahip onayıyla
(`release'i başlat, APK ve web yayınını onaylıyorum`) çift `473d4f2`'den üretildi:
[Private APK](https://drive.google.com/file/d/1y0dL75LLmzu8CJ1I2N0wMRTe2cgTP5_2/view?usp=drivesdk)
`btb-mobile-next-arm64-theme-473d4f2.apk`, 50441405 bytes, ARM64, SHA256
`3DC55EF0DCE9DFDE1847E2E079B6DC64A1BDC476C40ECFE51ABE275467D981DE`; owner-only
Drive, imza/ABI ve kimlikli readback doğrulandı. Sahip kurdu ("açılıyor, veriler
yükleniyor"; ADB ölçümü iddia edilmez); kurulum makbuzu `ANDROID_INSTALLED_WEB_PENDING`.
Web `20261021T135353Z-473d4f2` yayımlandı (yerel probe ve Access kapısı geçti),
batch `client-473d4f232e5203fa72bdb69af8dd9deab0cb42eb-3DC55EF0DCE9-7DE6B564811D`
durumu `AWAITING_BOTH_CLIENT_SMOKE`: sahibin web smoke'u ve iki smoke'un kabul
makbuzu `client-release.mjs complete`'i bekler. Önceki `a00b743` çifti kurtarma
için korunur. Gömülü
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

## Bire bir batch (Claude, 2026-10-21) — yayımlandı, smoke bekliyor

Sahip kurulumdan sonra panoya göre eksikler bildirdi ve eski A3 bölümünün
kaldırılmasını istedi (NXT-OBS-182). Eksikler soru olarak soruldu; cevaplar ve
uygulama `ONE_TO_ONE_BATCH_2026-10-21.md`: tüm A3 izleri kalkar, Super günlüğü ve
Super kararı pano düzeninde RB1 verisiyle, Jinx günlük kartı RB1 7 gün nötr
(NXT-OBS-180 çözüldü), RB1 maç detayında Maçın yolu/Baskı/Karar özeti geri,
bilinçli sapmalar panoya döner (baş harf, `Tümü`, koyu balon, altın `Sonuç
bekliyor`), Android widget'ları v40. Typecheck, lint, 658 test, tooling, marka, web
export'ları, web iki tema/iki genişlik ve örnek veriyle Android emulator smoke'u
(widget dahil) geçti; Expo Doctor 19/20 (dış `expo-router` 57.0.29 kayması, ayrı
karar). Sahip onayıyla (`Commit, push ve yeni APK+web`) `master`'a
`f6e18b374594bef5e58e04dd9f833960c914b691` olarak push edildi ve çift üretildi:
[Private APK](https://drive.google.com/file/d/1Tj_9f6CYZdJMjUi8NEY1nmufiWU70KTT/view?usp=drivesdk)
`btb-mobile-next-arm64-o2o-f6e18b3.apk`, 50443125 bytes, ARM64, SHA256
`620359DEAB623663F55308AA02AA58913F0465F61D24314430051A8EEABEBD6A`; imza/ABI ve
kimlikli readback doğrulandı, sahip kurdu ("kurdum"; ADB iddiası yok). Web
`20261021T184108Z-f6e18b3` yayımlandı (yerel probe ve Access kapısı geçti), batch
`client-f6e18b374594bef5e58e04dd9f833960c914b691-620359DEAB62-1FF96E17746C`
`AWAITING_BOTH_CLIENT_SMOKE`: iki sahip smoke'u, kabul makbuzu ve
`client-release.mjs complete` bekler. `473d4f2` çifti web smoke'u olmadan bu çiftle
değiştirildi (tamamlanmadı); kurtarma çifti `a00b743`.

## Maçın yolu ve RB1 istatistik batch'i (Claude, 2026-10-22) — yerel

Sahip v45 Maçın yolu panolarını onayladı; Codex 76A backend teslimini bitirip
kullanım sınırına takıldı, sahip işi buradan tamamlamayı istedi. Codex'in yarım
kalan 76A kayıtları push edildi (`BTB Logs` b626236, `zbet-cap` 46c4cdc,
`btb-codex` 2e5a7f4). TASK-0177: istatistik paneli `btb-match-statistics.v1`,
Baskı grafiği `btb-pressure-history.v1` ile iki yüzeyde; Maçın yolu Jinx'in
altında ayrı kart, RB1 havuz yolu sunulmadığı için çizgi yerine tek not.
Ayrıntı `MATCH_PATH_STATISTICS_BATCH_2026-10-22.md` (NXT-OBS-183). Biten maçta
`TEYİT BEKLENİYOR` metni NXT-OBS-184 olarak kayıtlı, değiştirilmedi. Commit/push
ve yeni APK+web çifti ayrı onay ister; `f6e18b3` çifti hâlâ smoke bekliyor.

## Önceki kabul edilmiş çift (a00b743, kurtarma için)

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
commits do not change those artifacts. BFF runtime source `e851fd3fcec5c5bdd57d5dedd8405af99ead2234`
(76A, 2026-10-22); backend DEV exact main `8a389b28e3db3b848f96da8f7221abe4a95e3820`.
Model `BTB_RB1_20261018`, pressure `RB1_OPT_STATS_74A_V1`, policy `873AF557AB4BC72ECDC81829922583F86E9F84C0F0E7697A6C89F4FF549D9597`,
producer `90132B9184DB7D4CB3128705264793446BF3B993D3389678CFA80AB7CE14E433`; earlier base-10A
identity pairs stay historical (accepted boundary 2026-10-22T08:15:36.8796732Z).

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

Close the `f6e18b3` batch: the owner's Android and published-web smokes, then
the owner acceptance receipt and `client-release.mjs complete`; these close
NXT-OBS-181/182. `473d4f2` was superseded before its web smoke and stays
incomplete. Expo Doctor's `expo-router` 57.0.29 drift is a separate decision.
Then the local Maçın yolu / RB1 statistics batch (TASK-0177): checks, commit/push
and a new paired APK+web release under their approvals; both smokes close
TASK-0177 and NXT-OBS-183.
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
