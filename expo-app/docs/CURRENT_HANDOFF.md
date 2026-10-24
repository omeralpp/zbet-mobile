# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-24
Mod: `OBSERVATION / TASK-0188 PAIR COMPLETE`
Delivery: `OWNER_ONLY_DEV_PILOT / 3f53834 PAIR COMPLETE (both smokes passed 2026-10-24)`
Maintenance: TASK-0187 DONE; BFF `310a57a` is pushed and rolled out with owner approval.
Same-source 48-decision report: 723→86 reads, exact totals; 20 local checks pass.
Local/public health and v1/v2/Live API pass; owner confirmed Android and web
on 24 October ("Both Android and web work"). Global reconciliation and the
accepted client pair stay unchanged.
[Implementation/rollout](REPORT_AVAILABILITY_IMPLEMENTATION_2026-10-24.md).
TASK-0188 COMPLETE: report match breakdowns removed; rolling activity/pool/events
share one journey axis on Android/web. No pressure/model calculation changes.
Client gate/Android bundle/web export and BFF gate/build pass. Source `3f53834`,
BFF `6910629` pushed/active; signed ARM64 APK `42FD999D6479…`, paired web tree
`117DC5918A54…`, web `20261024T193040Z-3f53834`. Owner-only Drive readback and
installation verified before web publication; owner confirmed both basic smokes.
`client-release.mjs complete` passed. Broader TalkBack/performance unverified.
49-decision report: 194,855→120,731 bytes (-38%), totals equal; SAP reads unchanged.
Previous `a5dca4a` pair/BFF `310a57a` retained. No further release authorized.
[Batch](UNIFIED_MATCH_TIMELINE_BATCH_2026-10-24.md),
[delivery and receipts](UNIFIED_MATCH_TIMELINE_DELIVERY_2026-10-24.md).
Workspace: `C:/dev/btb-cdoex`; Mobile owner: `BTB Mobile Next - Aktif`.
Previous owner-approved released batch: Overview and Live share published-star
thresholds and open-market/current-price playability without a 15-second UI
cutoff. BFF display v2 supplies native market state; model admission stays
unchanged. Numeric added-time display is implemented on both clients/BFF.
Active SAP source confirms a bare-plus rejection path; the bounded runtime
status projection fix is active in DEV, with no DDIC/model-parser change.
Core Mobile gate/Doctor, 728 BFF tests/build, ABAP lint/names, Android bundle,
verified edge web export and synthetic desktop/phone browser checks pass.
SAP native syntax/readback and 21 runtime + 17 state tests pass; no new P1,
one inherited P2 warning. SAP `cd63dca`, BFF code `12c3b92`, client source
`a5dca4a936ee3b36b3738f2e8265bdec38447e21` are pushed; SAP aligned to main.
APK `26A03241F010…`, web tree `153D5C2103CC…`, published web
`20261024T123643Z-a5dca4a`. Private Drive owner-only permissions/downloaded hash,
pilot signature/ARM64 and owner installation are verified. Owner confirmed
Overview/Live on Android and refreshed web. Paired completion gate is COMPLETE;
TASK-0184 DONE. Exact feature gestures/TalkBack were not separately reaccepted.
[Delivery and full receipts](ACTIVE_MARKET_CLOCK_DELIVERY_2026-10-24.md),
[release evidence](evidence/ACTIVE_MARKET_CLOCK_RELEASE_2026-10-24.json).
Previous accepted `26f491c` pair remains retained. New live bare-plus source
observation is TASK-0185 (next read-only review 2026-10-25), not a release blocker.
Native source cadence remains with BTB's existing evidence gates; no model tuning.

24 October chart cutover delivered in the same pair: NXT-OBS-217/218 use shared
Android/web components. Goals use darker scoring-side football markers and
lines confined to their own half. Historical counts/shares remain fixed in a
labeled per-period reference; unreachable outcomes are muted, corrections
restore them, and the current match clock prevents cross-period comparisons.
NXT-OBS-216 remains unconfirmed; activity/pressure/model calculations unchanged.
Type/lint/client+tooling tests, Expo Doctor, final Android Hermes bundle and
verified edge web export pass. Synthetic browser checks pass at desktop and
390px phone widths in dark/light themes; goal/correction and period reset pass.
NXT-OBS-219 delivery is closed by the paired receipts above. The original local
validation evidence remains historical; all functional source is committed.
[Batch and checks](CHART_FEEDBACK_BATCH_2026-10-24.md),
[evidence](evidence/CHART_FEEDBACK_LOCAL_2026-10-24/validation.json),
[owner screenshots and scope](OWNER_CHART_FEEDBACK_2026-10-24.md).

Previous released batch: NXT-OBS-200..215, owner authorised 2026-10-23; see
`JURY_REFINEMENT_BATCH_2026-10-23.md`. Today, verified period-specific scores,
pressure clarity, compact statistics and shared Android/web UX refinements.
Pressure (203): owner selected five-minute rolling activity; native pressure
remains selectable. Rounded columns, balance strip, now marker and compact
native details are shared. Possession (211) was reintroduced as current context
in chart/Jinx only, with no weight in activity, selections or stars. Missing
windows remain gaps. The released pair has gold full-height goal markers; the
newer accepted chart batch above replaces them. Score updates never
imply goals.
Owner requests clarification pop-ups in Turkish.
Published-selection status now separates verified playability from native
recommendation eligibility: open/undecided is active; expired quote is pending
verification, not proof of inactivity. Owner extended star filters/counts (212)
to the same latest verified playable publication, with frozen stars. Overview
uses the complete Live snapshot cache, not its three featured rows. Native
model eligibility is unchanged; source cadence remains an open follow-up.
Clock (213): opt-in source label preserves 45+/90+/added minutes; source status
06 displays UZATMA and 07 PENALTILAR. Missing clocks never imply kick-off zero.
Numeric elapsed/model/settlement are unchanged. Source 105′/06 and real preview
confirm UZATMA; exact screenshot-era zero input was not reproduced.
Client type/lint, 694 tests + 32 tooling, BFF tests/build and Doctor 20/20 pass;
Android bundle, signed ARM64 APK and verified edge web export pass. Client source
`26f491cc53d08aa3e43f6dabe587f047b14688e6`, BFF runtime code
`35ed90c8c1b6a84a3dc0b8c049e62ae5e1075361`; pilot restart and local/public health pass.
Web `20261023T195703Z-26f491c`, source-clean paired APK SHA256 `461D8558E13C…`,
web tree `A5670B0BCCAC…`. Exact private APK delivery, downloaded hash and installation
verified. Owner confirmed Android opening/main screens and refreshed web
Canlı/Super/Toto. `client-release.mjs complete` returned COMPLETE; TASK-0180 closes.
Full receipts: [release evidence](evidence/JURY_REFINEMENT_RELEASE_2026-10-23.json).
Previous accepted b501352 and 43d2e7d pairs remain retained.
Owner accepted the 87/100 design score and requested quick fixes before release.
Updated web/Git/runtime/signing/coordinated delivery approval:
`call_5dc8a83a133c41129e06ab43ed23f18d`. No SAP write or model tuning occurred.
See `JURY_REFINEMENT_DELIVERY_2026-10-23.md`.
Quick polish (215): Toto header wraps at 320 px; root web pager avoids moving
offsets on resize (Android retains swipe); unavailable report totals are unknown
and last verified publications retain frozen facts without active eligibility.
Chart headlines name the recorded window, and duplicate decision copy is removed.
Browser resize/search and available/unavailable/recovery checks pass. Owner phone
basic smoke passed; TalkBack, system text scaling and broader native performance
remain unverified. The original 87 jury score is not silently re-scored. Reports
can return TRANSACTION_RECONCILIATION_REQUIRED; source availability is distinct
from schema acceptance. No stale data becomes active to hide this limitation.

Previous accepted release, retained for recovery: client `b501352158a5ea9b9749868ebcad8f4c9e70e44f`:
last-selection hero/Jinx/Overview/Live, frozen first facts versus fresh current
quotes, active-only counters/filters, shared v2 totals, crest reset and recovered
historical names. BFF runtime code is `99ac116be61d1265bab640d63e2a02310fe10f39`;
later BFF commits contain delivery records only. SAP/model identities unchanged.
Web: `20261023T120240Z-b501352`. APK SHA256 `C0028E150084…`; web tree
`881B19580AAD…`. Full hashes and actual owner receipts:
[release evidence](evidence/HERO_SELECTION_RELEASE_2026-10-23.json).
The APK was privately delivered, downloaded/hash-verified and installed; the
owner confirmed Android and published-web checks. `client-release.mjs complete`
returned COMPLETE. Previous accepted pair `43d2e7d` is retained; rollback keeps
its own approval gate. No open delivery action remains in this batch.
See [delivery plan](HERO_SELECTION_DELIVERY_2026-10-23.md) and
[local implementation](HERO_SELECTION_BATCH_2026-10-23.md). Checks: 670 client,
32 tooling, 706 BFF tests, Doctor 20/20, clean web export and signed ARM64 build.
Owner order remains web preview/acceptance before final APK work; final public
web follows exact APK installation, per `COORDINATED_CLIENT_RELEASE.md`.
The historical sections below describe earlier checkpoints, not current gates.
Previous checkpoint preserved verbatim in
`handoff_archive/CURRENT_HANDOFF_before_RB1_2026-10-20.md`.

## Super karar günlüğü v2 (Claude, 2026-10-22 gece) — tamamlandı

Sahip iki yüzeyi doğruladı (23:09, "web de ve android de ... doğru görünüyor"); kabul makbuzu
`.codex-artifacts/client-43d2e7d-acceptance.json`, `client-release.mjs complete` → COMPLETE
(`client-43d2e7d-completed.json`). Bu çift 6e6dcd9/71c06cb/aa517ba'nın yerini alır.

Çift `43d2e7d`: APK `8C62A260…` Drive'a özel teslim edildi, sahip kurdu ("Kurdum sorun yok");
web `20261022T195402Z-43d2e7d` yayımlandı, sunulan paket doğrulandı. BFF `12899644` (v2 üst düzey
özet) ve `d36cedc` (havuz yolu kur tipi `"1"` düzeltmesi; canlı 3/4 maçta havuz yolu geldi).
71c06cb ve aa517ba çiftleri bu çiftle geçersiz; Bournemouth–Milan havuz reddi TASK-0179'da.


71c06cb çifti kuruldu (APK) ve web yayımlandı (`20261022T190733Z-71c06cb`, sahip kurulumu
doğruladı; Android teslim makbuzu yazıldı); iki smoke açık. Super günlüğü yalnız güncel
77A kohortunu gösterdiği için bugünkü 178 kararları görünmüyordu (NXT-OBS-189). Sahip
kararı (son hali): liste tüm kohortlar + sürüm etiketi, özet de tüm kararlardan (BFF üst düzey `periods`); `Özet sürümü` seçicisi geri alındı, `aa517ba` APK'sı kurulmadan geçersiz kaldı. BFF
`/v1/btb/rebuild/v2/report` (`btb-rebuild-report.v2`, kohort başına dönem/öğrenme, kayıt başına
`cohortId`), istemci `rebuildCohortsReportQuery`, `cohortReport`/`defaultCohortId`, `Özet
sürümü` seçicisi ve karar sayfası v2. v1 yanıtı değişmedi; eski istemciler çalışır. Gerçek
SAP verisiyle (6 karar: 178×4, 10A×2) web geniş/telefon önizlemesi doğrulandı (geçici
önizleme yaması geri alındı). 653 istemci + 32 araç testi, BFF 681 test. Yayın: commit/push,
BFF yeniden başlatma (Process ortamı User'dan tazelenmeli), eş APK/web — her biri onaylı.

## Pending completion batch — 22 October evening

Owner-approved local implementation: TASK-0179 fixed-half surviving pool share
(`btb-pool-path.v1`), TASK-0171 verified terminal projection without context,
Live detail expand/restore, close-goal label grouping, state-aware Hero/Jinx,
frozen last-published recommendation and honest uncalculated candidate metrics.
Android uses its existing full-screen detail/back navigation; desktop adds the
split-pane control. Both surfaces share every data/wording change.
See `COMPLETION_BATCH_2026-10-22.md`. Owner 77A authorizes the scoped SAP,
Git/BFF and paired delivery; native validation is in progress. Client source
will be frozen for that release after its passed local checks. The 6e6dcd9 pair still awaits both
owner smokes; do not close it retrospectively. Rescue pair a00b743 is retained.

## Son checkpoint

Historical initial RB1 delivery (the pending/current pair status above takes precedence):

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

## Maçın yolu ve RB1 istatistik batch'i (Claude, 2026-10-22) — yayımlandı, smoke bekliyor

Sahip v45 Maçın yolu panolarını onayladı; Codex 76A backend teslimini bitirip
kullanım sınırına takıldı, sahip işi buradan tamamlamayı istedi. Codex'in yarım
kalan 76A kayıtları push edildi (`BTB Logs` b626236, `zbet-cap` 46c4cdc,
`btb-codex` 2e5a7f4). TASK-0177: istatistik paneli `btb-match-statistics.v1`,
Baskı grafiği `btb-pressure-history.v1` ile iki yüzeyde; Maçın yolu Jinx'in
altında ayrı kart, RB1 havuz yolu sunulmadığı için çizgi yerine tek not.
Ayrıntı `MATCH_PATH_STATISTICS_BATCH_2026-10-22.md` (NXT-OBS-183). Biten maçta
`TEYİT BEKLENİYOR` metni NXT-OBS-184 olarak kayıtlı, değiştirilmedi. Sahip onayıyla
(`Commit, push ve yeni APK+web`) `master` `6e6dcd9c7e1adafbf240b0b2d32004344517aa7b`
(TASK-0177 notu `btb-codex` 3372fd3) ve çift:
[Private APK](https://drive.google.com/file/d/1VDTeTzhIEYhHXyMUw701LlzOHvh8WvJS/view?usp=drivesdk)
`btb-mobile-next-arm64-yol-6e6dcd9.apk`, 50439837 bytes, ARM64, SHA256
`F38B946EB3A555317CFC4D45BF6B08CB11B2BE49623FCC6DAEBB80A1ECD79DBB`; imza/ABI ve
kimlikli readback doğrulandı, sahip kurdu ("Kurdum"; ADB iddiası yok). Web
`20261022T094314Z-6e6dcd9` yayımlandı (yerel probe ve Access kapısı geçti); batch
`client-6e6dcd9c7e1adafbf240b0b2d32004344517aa7b-F38B946EB3A5-D36C439C6949`
`AWAITING_BOTH_CLIENT_SMOKE`. `f6e18b3` çifti smoke olmadan bununla değiştirildi
(tamamlanmadı); kurtarma çifti `a00b743`.

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

Current published client source is `6e6dcd9c7e1adafbf240b0b2d32004344517aa7b`;
handoff-only source `ba1d5305b00cd14f15d19094246c8bf718d55ea0`.
Current BFF runtime source is `cabd48b1c44fdd8a5ea5cd537cdc64e83c05a3a4`;
178 native DEV main is `47dd13cce1174f23af59a920438c195c70c8b178`.
Status policy `RB1_RED_UNKNOWN_178_V1`, pressure `RB1_OPT_STATS_74A_V1`;
policy `64D1F7A780CE1565BD27AA158FA6BD72949F7EF3D9E266851B2E0BE42D929015`,
producer `DA03C9E7B18A61179FD5E817B35DCD1954DF2CEB332FB928EA3627FB84138DF5`.
Accepted boundary `2026-10-22T17:04:32.3153834Z`; earlier exact pairs remain
historical. Unknown red-card statistics render “—”, never measured zero.
These are the last delivered identities; the pending local candidate differs.

## Doğrulama

Historical initial RB1 pair checks; pending batch checks are in COMPLETION_BATCH_2026-10-22.md.

Client type/lint/tests/doctor, Android bundle/build/signature/ARM64, verified
edge web export and canonical paired-release completion passed. Both actual
owner smokes passed. BFF 644 tests and authenticated local/public report/list/
detail smoke passed. Fresh native read matched 45 objects / 110 components.
Final MODEL syntax and full ATC have zero findings; no Unit methods confirmed.
Reuse 61A's 124 harmless dependency methods; retain inherited findings.
Live-label repair accepts `39'`/`62′` without changing the model or client API.

## Final yerel pilot APK

Current delivered pair: 6e6dcd9, listed above; no new completion-batch APK has
been built or distributed. Both current owner smokes remain pending. The final
new APK and matching web will be rebuilt from one clean pushed commit only
after explicit delivery approval.

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

Close the `6e6dcd9` batch: the owner's Android and published-web smokes, then
the owner acceptance receipt and `client-release.mjs complete`; these close
TASK-0177 and NXT-OBS-181/182/183. `473d4f2` and `f6e18b3` were superseded
before their smokes and stay incomplete. NXT-OBS-184 needs an owner decision.
Expo Doctor's `expo-router` 57.0.29 drift is a separate decision.
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
