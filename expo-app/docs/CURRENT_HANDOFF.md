# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-29
Mod: `PAIRED_RELEASE_COMPLETE / ACCEPTED_PAIR_E4DEF59 / PREVIOUS_PAIR_RETAINED`

## Current accepted pair — principal UX e4def59 (NXT-OBS-233)

The six principal UX changes (shared live counts, contained star/sort menus,
accessible visible keyboard search, cached Toto recovery, Android reorder
buttons, 48 dp widget actions) shipped as one coordinated pair. Clean pushed
Mobile source `e4def5973dd4169a19556663d415b466ee46f309`; BFF server code is
unchanged from `6a49ee7405e1ff38885bec8fe05f23fd7db897dd` (zbet-cap publisher
scripts changed only). Signed ARM64 APK
`056719567518E91D72FB926FAA1DBC60A442353B1EAB3397813B6C049ADFD80E`,
50,517,605 bytes, privately delivered with full authenticated readback; owner
accepted Android “Kurulum tamam sorun yok”. Matching web tree
`70E2199BDF8E62E31E67182E0F15870AD96AF1770CAF624FB738F439D0E532AD` published as
`20261029T071159Z-e4def59`.

The first publication reported success while the BFF kept serving 260bd57: the
TCP table reports the listener with an invalid state, so the publisher saw no
BFF and skipped the stop. The publisher now reads identity without the state
field, proves the replacement and checks every served byte; its `-Recover`
mode replaced the BFF at 09:14Z without a new release folder. 57/57 served
requests match, independent readback 56/56; shell/deep-link/CSP/API401/Access302
pass. Owner accepted the published web “sorun yok web de  calisiyor”. Canonical
`client-release.mjs complete` passed; TASK-0201 is DONE. Receipts:
`btb-codex/docs/evidence/principal-ux-release-e4def59-{COMPLETE,OWNER-ACCEPTANCE,RUNTIME-RECOVERY}-2026-10-29.json`.
Actual owner basic smokes, not device-side hashes; native TalkBack/gestures/widget
resizing remain unobserved and compact widgets may need resize/re-add. Previous
accepted 260bd57 pair retained. `client-release.mjs complete` now refuses a
publication receipt without matching served-byte proof (TASK-0202, DONE).
[Implementation, evidence and artifact hashes](PRINCIPAL_UX_IMPLEMENTATION_2026-10-28.md);
the [8.2/10 baseline review](PRINCIPAL_UX_REVIEW_2026-10-28.md) remains historical.

## Previous accepted pair — Jinx and daily report 260bd57 (NXT-OBS-231/232)

Owner replaced the wide report with Today/Yesterday. Android/web default to
Today; Jinx, Overview and widget share the bounded daily request. BFF filters
SAP publication timestamps before proof reads, retaining selected-fixture
predecessor/result chains and snapshot guards. Daily learning is null; full
learning remains separate. No SAP source/model/data deletion or WSL change.
701 client/679 BFF tests, type/lint, CAP build, both exports, native widget
compile and synthetic desktop/390/320 px/Enter/empty recovery pass. Actual
public daily API measured 767 ms, then 895 ms after web publication; local
source parts fell 23,067→2,388. Warm bounded measurements, not permanent
capacity proof. [Review/evidence](DAILY_REPORT_REVIEW_2026-10-28.md).

Scoped Git and coordinated pilot delivery approved on 28 October. Clean pushed
Mobile source `260bd57661ae35bd159e5793003fc42abcbf536a`; BFF functional source
`6a49ee7405e1ff38885bec8fe05f23fd7db897dd` activated in DEV. Signed ARM64 APK
`44C764D4A20CF4B829D2FC81EF85A3748EF1311B2599E656CD40C4A15B1EB8BA`,
50,509,773 bytes, privately delivered with full authenticated hash readback.
Matching web tree
`1B6C41930DEF38943A3DE6B3E9D63E440303F323A0795BC262C023E213A81E20`
published as `20261028T100508Z-260bd57` after exact APK installation. All 56
served assets match; shell/deep-link/CSP/API401/Access302 checks pass. Owner
accepted Android “Çalışıyor sorun yok”, then published web “web de çalışıyor”.
These are actual owner basic smokes, not device-side hashes or exhaustive
TalkBack testing. Canonical `client-release.mjs complete` passed; TASK-0200 is
DONE. Receipt: `btb-codex/docs/evidence/daily-report-release-260bd57-COMPLETE-2026-10-28.json`;
installation/publication/acceptance receipts share that prefix. Previous
accepted 9d87b2e pair and superseded ed3dbf8 candidate artifacts are retained.
No recurring wait remains; reopen only on concrete recurrence. Documentation
closeout commits do not change the released source or require another release.

## Delivered contextual Jinx — NXT-OBS-231

Owner requested improvements beyond the compact candidate's subjective 6/10.
Shared Android/web Jinx now compares the frozen decision with verified current
DTOs: pressure changes versus native confirmation, market closure, critical
score conditions and canonical final results. A newer published decision can
be opened directly. Default text stays within two sentences; one comparison
row and optional provenance replace duplicated metrics. Stale, foreign or
unverified current sources fall back without inventing a current assessment.
No model, star, outcome or API contract changes; BFF is clean. Refresh uses
existing RB1/context queries; synthetic browser records zero Jinx LLM calls.
Type/lint/brand, 700 client +32 tooling tests, Android JS/Hermes preview bundle
and verified edge web export pass. Unchanged Doctor20/20 reused. Synthetic
320/390/1440 px, keyboard, nine context cases and new-decision navigation pass.
Heuristic assessment 6→8/10 is not a user study or prediction-performance claim.
Contextual Jinx shipped with the owner-accepted 260bd57 daily-report pair
above. Android installation/basic smoke and published-web basic smoke are
accepted; exhaustive TalkBack testing remains unobserved. Heuristic 8/10 does
not imply prediction performance. All release receipts are retained.
[Current design and evidence](JINX_CONTEXT_REVIEW_2026-10-27.md).

## Previous accepted pair — match evidence UX 9d87b2e (NXT-OBS-230)

Owner directly authorized UX assessment and local improvements to all five
Maçın Kanıtları subsections on Android and web. Shared components, truthful
loading/error/empty states, readable markets/units/sample counts, comparison
bars and the desktop evidence layout are updated. Browser testing also found
and repaired keyboard disclosure activation; pointer drag/hold guards remain.
Local validation passed: type/lint/brand, 677 client +32 tooling tests, Android
preview bundle/secret scan and canonical verified edge web export. Synthetic
actual-screen checks cover 320/390/1440 px, six data states, Enter/Space,
expansion, null vs zero and unchanged historical shares. Final visual polish
keeps unreachable labels on one line. Heuristic score 5.8→8.3/10; no user-study
claim is made. [Review and previews](MATCH_EVIDENCE_UX_REVIEW_2026-10-27.md).
Owner accepted the web/UX preview and explicitly selected **Commit, push, and
release both Android and web** on 27 October. Approval covers scoped Git and
the coordinated pilot APK build/signing/private delivery plus companion web
publication after exact APK installation. Both artifacts were built from clean
pushed source `9d87b2ea4a86ec3bdcf454237d1751c9174a58cd`.

Signed ARM64 APK `FBBED21D5CB2CC4CCAEA3CDE6C4EB17CE25FB392467618235B57C5B958F499F2`,
50,495,625 bytes, passed signature/ABI and owner-only private Drive authenticated
full-byte hash readback. Owner confirmed exact installation/basic Android smoke:
“kurulum tamamdır sorunsuz görünüyor”. This is owner evidence, not device-side
hash measurement or exhaustive device testing. Final native build passed.

Matching web tree `D9CF6D6B12628E70081FC322E748DAFE35F305AC8B2F9AD9ADE1B646E5252E04`
was published after installation as `20261027T112835Z-9d87b2e`. All 56 served
assets match the frozen build receipt. Shell/deep-link/CSP, API401 and public
Access302 pass. Canonical publisher restarted the unchanged BFF; no Access
policy, BFF source, SAP or model change. Owner confirmed “Web checked and working”.
`client-release.mjs complete` passed with both actual owner smokes and matching
source/hashes; TASK-0197 is DONE with no known remaining defect. Receipt:
`btb-codex/docs/evidence/match-evidence-release-9d87b2e-COMPLETE-2026-10-27.json`.
Related delivery/publication/smoke receipts share the same prefix. Previous
67b72ac pair is retained. Later documentation commits do not change released
source. No recurring wait remains; reopen the original task on concrete recurrence.

## Previous accepted pair — 67b72ac (retained)

Super/Toto lists and details (NXT-OBS-226..229) shipped from clean pushed source
`67b72ac9b5dd8d55db097be85f773a35429405c1`. Owner accepted preview and approved
scoped Git/push, pilot APK signing/private delivery and companion web publication.
Shared sorting, scoped summaries, recovery, compact history, result filters,
coupon legend, readable mobile picks and unplayed-match display repair are delivered.

Signed ARM64 APK `9A250D4B51578FB4DEC29D686A27DDC34090D0985BA792D7B377C629DF87CB20`,
50,487,329 bytes, passed signature/ABI and private Drive authenticated hash readback.
Owner confirmed installation/basic Android smoke: “Kurulum tamamlandı sorun yok”.
This is owner evidence, not adb/hash-on-device or exhaustive accessibility testing.

Matching web tree `5BFE99C72B1B11CC9A5737200E80EC6117BAEF1D01B1F0F9F99AB36F8019166E`
was published after installation as `20261026T163408Z-67b72ac`. Served-entry hash,
shell/deep-link/CSP, API401, Access302 and local/public BFF health pass. Registered
publisher restarted the unchanged BFF; User prospective setting stays false.
Owner also confirmed published-web smoke: “Web works correctly”. The exact pair
passed `client-release.mjs complete`; TASK-0193 is DONE with no known remaining
defect. Completion: `client-release-67b72ac-COMPLETE-2026-10-26.json`. No recurring
wait remains; reopen the original task on a concrete recurrence.
Later documentation commits do not change the released source. Evidence:
`btb-codex/docs/evidence/client-release-67b72ac-*2026-10-26.json` and
`SUPER_TOTO_RELEASE_67b72ac_2026-10-26.md`. [Lists](SUPER_TOTO_UX_REVIEW_2026-10-26.md),
[details](SUPER_TOTO_DETAIL_UX_REVIEW_2026-10-26.md). Type/lint, 672+32 tests,
both exports and synthetic browser checks pass; unchanged Doctor20/20 reused.

## Previous accepted pair — 3279a25 (retained)

Combined client UX source `3279a25db729c9e6f7234f6a08998bad5a162d77` is clean,
pushed and delivered: direct pilot entry (NXT-OBS-223), Summary (224), Live and
focused web resize repair (225 / TASK-0180). The owner approved preview, scoped
Git/push, APK signing/private delivery and both publications.

Signed ARM64 APK `E7CF451CE293B06FED5249A2602F9A5670B01C883438184DD145F9C32C6D54AC`,
50,476,069 bytes, passed pilot certificate/ABI, private Drive owner-only metadata
and authenticated download/hash readback. Owner confirmed exact installation
and Android basic smoke on 26 October: “APK sorunsuz devam et”. This is owner
evidence; no adb/hash-on-device or broad accessibility claim.

Matching paired web tree `AA91DA90DFE6C02E9C3BA6C3788FD2D0DE50B5DC6CE9851D3BFC57CD9C79E2C1`
was published as `20261026T091317Z-3279a25` after installation. Shell/deep-link/CSP,
unauthorized API401, Access302, local/public BFF health and served-entry hash
pass. Publisher restarted the unchanged BFF to switch web roots. User prospective
collection setting remains false; no model/SAP/credential or Access-policy change.

Owner confirmed published-web smoke on 26 October: “Web kontrolu sorunsuz commit
ve push ile işlemi tamamla”. Both owner smokes are accepted and the exact pair
passed `client-release.mjs complete`; TASK-0180 is DONE with no known remaining
defect. Completion receipt: `client-release-3279a25-COMPLETE-2026-10-26.json`.
Later handoff-only commits do not alter released source. No recurring wait is
retained; reopen the original task on concrete recurrence.
Receipts: `btb-codex/docs/evidence/client-release-3279a25-*2026-10-26.json`.
[Combined release report](COMBINED_CLIENT_UX_RELEASE_2026-10-26.md).
Core validation: type/lint, 669+32 tests, both exports, final ARM64 build and
synthetic browser state/resize checks pass; unchanged Doctor20/20 reused.

Prior accepted pair retained for recovery: source `57e27c2`, APK `F0828E2B1948…`,
paired web tree `CED99092AA3B…`, release `20261025T124608Z-57e27c2`.

## Previous accepted pair — TASK-0189 (historical)

TASK-0189 Jinx RB1 explainer is locally implemented on shared Android/web source:
Gemini orders five server-written facts only; legacy prose/quip/pilot-signal
paths are retired. BFF 672 tests/build; Mobile check (665+32 tests), Doctor,
Android bundle, verified web export and ARM64 debug compile pass.
Synthetic desktop/phone-width ordering, keyboard refresh and fallback pass.
Owner approved scoped Git, then continued the named DEV BFF restart step.
BFF 358801e7fb21539460ce026c5ef5f559f9c3d87c is active from the registered
launcher with unchanged runtime configuration; prospective collection stays off.
Local/public health, v1/v2 reports and Live API pass. Real Gemini HTTP200 plus
one public cache hit return LIVE; the shared contract proves exact server
sentences and frozen-record binding. Anonymous API401 and web Access302 pass.
Released client source is clean/pushed 57e27c219530fa449dd66f769cdff613d94d7a2b
(functional implementation 80c4833). Signed ARM64 APK F0828E2B1948…,
50,467,469 bytes, passed pilot-certificate/ABI and owner-only Drive readback
checks. Owner explicitly confirmed installation and working app/Jinx Refresh.
Matching web tree CED99092AA3B… was published as 20261025T124608Z-57e27c2
after installation, under the separate coordinated delivery approval.
Shell/deep-link/CSP/API401, Access302 and local/public BFF health pass;
prospective collection remains disabled. Owner confirmed refreshed desktop
web and Jinx Refresh. Native Gemini-ordering and desktop rule-based screenshots
are retained; broader TalkBack/performance is not newly accepted.
client-release.mjs complete passed with both actual owner smokes and exact
source/hashes. TASK-0189 is DONE; the cutover returns to observation.
Later handoff-only commits do not change the released artifact source.
Latest receipts and task/run closure live in btb-codex/docs/evidence/
client-release-57e27c2-COMPLETE-2026-10-25.json and TASK0189_OWNER_SMOKE_2026-10-25.json.
[Scope, evidence and remaining gates](JINX_AI_EXPLAINER_BATCH_2026-10-25.md).

Previously accepted pair retained for recovery: client
3f3b5fd6af931e6f285ea82f50a55bce72e1915b, APK 4C452CEDF278…,
web tree 73932E418099…, release 20261025T073559Z-3f3b5fd.
Both prior owner smokes and all closed milestones remain historical.
[Prior paired delivery](MATCH_JOURNEY_UX_DELIVERY_2026-10-25.md).
Owner closeout 2026-10-25: TASK-0185's delivered display fix is CLOSED with the
unobserved native bare-plus case explicitly accepted; no recurring checks.
Reopen on an owner report or concrete recurrence. TASK-0190/0153/0150 probability
requests are retired without implementation/success credit; plans remain.
No source/model/SAP change or new publication is authorized by this closure.
Workspace: C:/dev/btb-cdoex; owner: BTB Mobile Next - Aktif.

The complete prior handoff, including accepted 3f53834/a5dca4a/26f491c/b501352
pairs, older checks and open limitations, is preserved verbatim in
[the pre-release checkpoint](handoff_archive/CURRENT_HANDOFF_before_TASK0189_release_2026-10-25.md).
The historical sections below and their evidence remain unchanged.
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
