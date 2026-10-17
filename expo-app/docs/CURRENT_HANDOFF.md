# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-17

Mod: `OBSERVATION`

Çalışma alanı: `C:\dev\btb-cdoex` · Aktif task: `BTB Mobile Next - Aktif`

This file carries current state only. Every dated entry through 2026-09-16 19:58
is kept verbatim in
[handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md](handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md);
open it only for a specific past checkpoint. New checkpoints replace the
sections below instead of stacking above them; the section headings are selected
by `btb-codex/config/thread-context.config.json`, so keep them.

## Son checkpoint

17 October: core UX/Jinx V3 source batch is locally validated; the owner approved
scoped commit/push on 17 October. Exact Git heads and remote verification are recorded
in workspace `.codex-artifacts/ux-jinx-2026-10-17/verification.json`. Installed clients
and the pilot runtime remain the accepted 16 October batch below.
Compact Overview/live cards, readable selections/search, pinned short Jinx and shared
nine-source analysis snapshots cover Android/web together. V3 waits until an approved
BTB value policy/evidence exists; V1/V2 stay compatible. Scope, adapter prerequisites,
checks and remaining release gates: `UX_JINX_V3_LOCAL_2026_10_17.md`. The Git approval
grants no runtime, signing, distribution or publication approval.

16 Ekim ilk koordineli Android+web batch'i **COMPLETE** (TASK-0144/0135/0143
DONE): batch `client-3e9ffe9…-8757EFEA9837-06AF4EA3CA00`, kaynak zbet-mobile
`3e9ffe9241bac12262f559f2267496f50db94da3`. Maçın Nabzı ve tüm Fiori girişleri iki
yüzeyden kalktı; "Skor ve yıldız akışı" Maçın Yolu'nda (grafikte altın Super
yıldızları + altta liste). `react-native-webview` çıktı; Expo 57.0.30/router 57.0.28.
APK (aşağıda) rclone `drive.file` ile özel "BTB APK" klasörüne yüklendi; yalnız-sahip
izni ve geri indirme SHA-256 birebir; sahip kurdu. Web release
`20261016T195008Z-3e9ffe9`: yerel probe ok, girişsiz 302 Access (korumalı), BFF
`BTB Mobile BFF` görevi altında. Sahip smoke'u gerçek veriyle iki yüzeyde geçti
(telefon: Wacker Innsbruck–Austria Salzburg; web: Verona–Catanzaro). Kalıcı makbuz
`btb-codex/docs/evidence/client-release-3e9ffe9-2026-10-16.json`. Yeni ortak araç
`scripts/deliver-apk-drive.ps1` (Codex ile aynı teslim). Bölüm A (A4) BTB - Aktif'te.

16 Ekim sahip kuralı: Android ve web her release'te aynı temiz/pushed commit'ten
tek batch olarak teslim edilir; platforma özel değişiklikte de diğer yüzey atlanmaz.
`scripts/client-release.mjs` kaynak/iki artifact hash'i/özellik kiplerini kontrol
eder; web yayını exact APK teslim/kurulum makbuzu ister. İki istemci smoke'u
geçmeden COMPLETE denmez, önceki APK/web çifti geri dönüş için tutulur. Ayrıntı:
`COORDINATED_CLIENT_RELEASE.md`. Bu yerel kural/tooling değişikliği yayın değildir.
Önceki W6 web 6911f84 ile 14 Ekim A3 APK çiftinin ortak makbuzu yoktu (UNVERIFIED,
tarihsel kabul korunur); 16 Ekim batch'i ikisini aynı kaynağa getirdi. Önceki
çift geri dönüş için tutulur, ancak web geri dönüşü eşleşik APK teslim makbuzu ister.

16 Ekim M16 W6 TASK-0142 DONE: sahip `PUBLISH-WEB` onayıyla web istemcisi
`https://app.surklase.com` adresinde yayında. Cloudflare Access `BTB Web`
(`Owner only`, One-time PIN, 24 saat, team `black-cake-3e41`) tünel rotasından
önce kuruldu; rota `app.surklase.com -> http://127.0.0.1:4004`, diğer üç rota aynı.
Release `20261015T210155Z-6911f84` (zbet-mobile `6911f84`), ağaç SHA-256
`16F5DB4EBCBD2CBA557C461214F33C8A1F120A9F1B50D7B33F8691CEEF1EF594`; makbuz
release klasöründe. Girişsiz `/` ve `/v1` Access'e 302; `api.surklase.com` 200;
BFF pilot auth, web configured, `BTB Mobile BFF` görevi altında. Sahibin tarayıcı
girişi ve gerçek veri kontrolü ilk W7 gözlemidir. Yayın betiği hataları TASK-0143.

15 Ekim M16 Desktop Web Client W1-W4 yerelde tamamlandı ve sahip onayıyla
commit/push edildi (TASK-0138..0141 DONE). Yeni genel kural **Client Parity** (AGENTS.md):
Mobile/web aynı Expo kodu, her değişiklik iki yüzeye birlikte. Web derlemesi
`edge` modunda, pilot anahtarı/sırları reddeder, gömülü ayarı ve sır taramasını
doğrular. Masaüstü: kenar çubuğu, Ctrl+K, `g` kısayolları, çok sütunlu modüller,
Canlı liste-detay, Super tablosu, Toto kupon ızgarası, grafik fare inceleme;
768 px altı telefon düzeni aynı. Web istisnaları `ARCHITECTURE.md` "Desktop web
boundary". BFF: Access JWT doğrulaması, salt-okunur web kimliği, aynı origin
statik barındırma; `api.surklase.com` pilot yolu değişmedi, BFF runtime yeniden
başlatılmadı. Kontroller: 637+18 test, tsc/eslint/brand, Android bundle, temiz
edge web export; BFF601/build; 4105 provası validate/probe geçti. Doctor 19/20
yalnız upstream expo 57.0.30/expo-router 57.0.28 (TASK-0135). Fiori girişleri
16 Ekim sahip kararıyla iki yüzeyden de kaldırıldı (TASK-0144). Karar kaydı
`btb-codex/ROADMAP_AMENDMENT_2026-10-15.md`.

15 Ekim tutarlılık yayını tamamlandı: UI5/Fiori istemcileri obsolete; Mobile/BFF
ve dört SAP servis kökü aktif. BFF `e26113e16f21cb02348e9bda6c1d78d942ff1b51` mevcut pilotta, backend
main `a7571e4ecd16392431568f8b5f3c7e19d68e2c2f` exact-SHA DEV'de doğrulandı.45 native Unit/0 yeni P1/tek onaylı eski W;
591 BFF testi/build ve 13 dış BTB/Toto Mobile şema okuması geçti.
Yeni kaynak `2DC743F70C9FC15495F30C06A44DFAA550DE327B084D1ABD13298B4807AEAD5A`, UTC sınır `2026-10-15T13:07:05.407422Z`. Model/karar/capture yolları aynı;
iki eski A3 kohortu mühürleriyle ayrı okunur. Yeni karar/kazanan iddiası yok.
TASK-0132/0133/0134 DONE. TASK-0135 Expo patch kaynakları yayımlandı;612+13 kontrol
ve Doctor20/20 geçti, yeni APK dağıtılmadı. Aşağıdaki kabul edilmiş APK korunur.
Güncel makbuz: `BTB Logs/project_consistency_audit/2026-10-15-01/implementation/RELEASE_REPORT.md`.
M10 performans ve diğer kanıt kapıları açık kalır.

15 Ekim TASK-0124 DONE: sahibi, exact A3 APK `1168EA805A…F828117` için fiziksel
kurulum, sürekli parmakla gezinme/bırakma, tekil olay seçimi ve TalkBack
kontrollerinin dördünü de geçtiğini doğrudan bildirdi. Gate kanonik yazıcıyla
kaldırıldı; yeni kod, runtime, APK veya deploy yok. Kabul makbuzu:
`btb-codex/docs/evidence/task0124-owner-acceptance-2026-10-15.json`.
M10 performans kapıları ayrı kalır.

14 Ekim TASK-0009:4,5 Alt/Üst doğrudan mevcut A3 DEV seçimine alındı; ek FT45
gölge aşaması yok. Model/kol/ağırlık/eşik aynı;19 piyasalı kaynak
`42D739234585064BC727211709535A12997FED1A289238776DDB103D45B7C699`, gerçek
sınır `2026-10-14T20:37:35.072560Z`.57 harmless native Unit/sıfır syntax/yeni P1;
20 kaynak/53 native dosya iki okumada aynı.8 gözlem/4 karar/296 birebir dal,
iki yeni piyasa SCORED ve2 temiz çevrim; bu kontrolde yeni pozitif A3 interval/
kazanan iddiası yok.584 BFF/build ve9 gerçek dış API Mobile şema okuması geçti.
Önceki A3 geçmiş baskısı ayrı mühürle korunur. Mobil kaynak/APK değişmedi.
FT45 gelecek performansı TASK-0127/M10; önceki17 piyasa ayrı kaynak kohortudur.

Önceki17 piyasalı A3 kabul checkpoint'i:
14 Ekim: sahibi tarafından onaylanan A3 seçim/baskı DEV pilotu tamamlandı.
Model `BTB_PPV1_20261014`, kol3; Alt/KG Yok son baskı ağırlığı +0,85; diğer
ağırlıklar ve 34/23/17/10 eşikleri aynı. SAP A4H_001/ZP1067/A4HK900110 üzerinde
DDIC önce, bağımlılar sonra etkinleştirildi. Yeni kayıtlar model kimliğiyle eski
boş etiketli geçmişten ayrılır. Gerçek toplama sınırı
`2026-10-14T14:43:17.997132Z`; öncesi mühendislik kontrolüdür.

Native/full-capture observed DEV kabulü kaydedildi. 77 değişen model testi,
on şema nesnesinin tam doğrulaması/sıfır yeni P1, 58 gözlem/12 baskı,10 karar/
680 tam eşleşen dal, üç pozitif A3 kazanan ve14 temiz çevrim. Ayrı native reader
12 Unit/108 araç kontrolü geçti; TASK-0126 DONE. Doğrudan ADT/OData kaynak
okumaları MCP değildir. Eski strict/observed manifestler tarihsel olarak korunur.

V3 mobil/BFF tüketicileri aynı mühürlü üreticiyi kullanır. Kayıtlı/güncel seçim
ayrımı, yeni cutover etiketi ve lider skor baskı yönleri aktiftir. Dashboard eski
toplam baskıyı kullanmaz.612 Mobile+13 araç/type/lint/brand;581 BFF/build geçti.
Dokuz gerçek dış API şema okuması yeni/legacy Super ve mevcut baskıyı doğrular.
Android API35 önizlemesinde gerçek seçim/etiket ve sekiz baskı işareti görüldü.
Değişmeyen jestlerin önceki sekiz native kontrolü ve Doctor20/20 kullanıldı.
Fiziksel sürekli sürükleme/bırakma, olay seçimi ve TalkBack 15 Ekim sahibin
doğrudan exact-APK bildirimiyle kabul edildi; yeni otomatik fiziksel test yok.

**Rota:** telefon → `https://api.surklase.com` → mevcut pilot BFF
`zbet-cap/standalone-server.js`,127.0.0.1:4004,pilot auth. Son doğrulanan restart
PID28784 (gerektiğinde listener'dan yeniden oku). Windows görevi ve
ensure/start launcher korunur. Manifest `PRESSURE_PATH_MAINTENANCE_20261015.json`,
ham SHA-256 `5A8F31DBA93EAB1E7DC9D7E93ABA614DB66AA439237F8BC57140AF002556587A`. İki önceki A3 manifesti aynen korunur;
yalnız güncel manifestin düz listesi geçmiş okumaları yetkilendirir.
`maintenance-runtime-activation.json` kaynak/ayar makbuzudur. Yerel/dış sağlık
geçti; diğer ayarlar aynı. Cloudflare/Firebase veya yeni APK yayını yok.

Jinx'in mevcut sağlayıcısı ve açıklama davranışı korunur. İstatistik kapsamı
bilinmeyen xG sıfır gösterilmez; kaynak zamanı ve oran-skor ilişkisi ispatlı
sayılmaz. Yeni baskı tahmindir; oran/gol ihtimali veya kârlılık değildir.

## Final yerel pilot APK

[16 Ekim koordineli batch özel Drive APK](https://drive.google.com/file/d/1aCOoE5ty3jZqR4Cp-gOxMtd9T6yKCG8v/view?usp=drivesdk)

`btb-mobile-next-arm64-3e9ffe9.apk`, 54.175.948 bayt; SHA-256
`8757EFEA983796F26E5371577E6D8956BC3E85106869FCCDCED9177B7544D38A`. Kaynak
`3e9ffe9`, yalnız ARM64, pilot sertifikası (`FAC61745…033B9C`, A3 APK ile aynı),
pilot/LIVE ayarları; Drive klasörü "BTB APK" (rclone `drive.file`), yalnız-sahip
izni ve kimlik doğrulamalı geri indirme birebir. Sahip 16 Ekim'de kurdu ve smoke geçti.

Önceki kabul edilmiş APK (geri dönüş çifti):
[A3 özel Drive APK](https://drive.google.com/file/d/1Y_zmtI3AyXHhHc7s4vI8o6uJrvt7pn8S/view?usp=drivesdk)
`btb-mobile-next-arm64-pressure-path-a3.apk`,54.424.765 bayt; SHA-256
`1168EA805A14870AC707204A63F4F1B38316D0CFE038C879D739266E9F828117`.
Yalnız ARM64, mevcut pilot sertifikası/APK V2 imzası, paket/config/LIVE ayarları
ve sunucu sırrı taraması doğrulandı. Özel klasör/sadece sahibi erişimi ve kimlik
doğrulamalı indirme SHA/boyut birebir aynı. [Ayrıntılı teslimat](PRESSURE_PATH_A3_DELIVERY_2026_10_14.md).

Önceki TASK-0124 closeout SHA `7D209632…3605B6` ve sahibi tarafından kabul edilen
TASK-0121 SHA `2CF051…55F4B2` tutulur. Önceki teslimat kanıtları
`TASK_0124_PLAN_CLOSEOUT_2026_10_14.md`/`TASK_0121_JINX_READING_2026-10-11.md`.
Bu exact APK için fiziksel kabul 15 Ekim sahibin doğrudan bildirimiyle tamamlandı.

## Repo durumu

16 Ekim koordineli batch: zbet-mobile `3e9ffe9` (istemci kaynağı), btb-codex
`39eed43` (kalite kapısı izolasyonu, TASK-0144 kaydı), zbet-cap `0e37c3e` (TASK-0143
yayın betiği). Kapanış commit'leri teslim aracını, makbuzu ve kayıtları taşır.
Aşağıdaki SHA'lar kabul edilmiş A3/FT45 yayınının tarihsel durumudur.

Önceki A3 primary yayını tamamlandı; makbuz
`.codex-artifacts/pressure-selection-2026-10-14/publication.json`.
TASK-0009 backend main `e6cd1cfd8bb022a80ab19df71589c2fb503d25b0`, BFF main
`70cb5c4a740676549b108b9cde479e3dc2201837` push edildi. SAP exact-main DEV
import/aktivasyon,57 native Unit/zero syntax/yeni P1 ve bağımsız branch/kaynak
geri okuması geçti. Preflight snapshot `e00253a6a603dd59b16e4647b7a67ebe76902550`
aynı kaynağı taşır. Deploy sonrası9 dış API şema okuması ve yerel/dış sağlık temiz.
Runtime/yayın/deploy makbuzları `.codex-artifacts/task0009-live-readiness-2026-10-14/`
altında; kalıcı özet `btb-codex/docs/evidence/task0009-main-deployment-2026-10-14.json`.

## Doğrulama

15 Ekim bakımında Mobile612+13/type/lint/brand, Doctor20/20 ve BFF590/CAP build
geçti. Native APK/cihaz kabulü bu patch güncellemesine aktarılmaz.
14 Ekim kaynak/native kabul receipt'leri backend `score-pressure-v2/`
altında. Yerel ayrıntılar `.codex-artifacts/pressure-selection-2026-10-14/`:
`sealed-public-smoke.json`,`apk-verification.json`,`apk-signature.txt`,
`drive-delivery.json`,`frozen-mobile-inputs.json`,`sealed-runtime-activation.json`.
355 frozen APK girdisi derleme sonunda aynı; sonradan yalnız güncel devir/plan
dokümanları değişmişti. 15 Ekim dependency bakımı sonraki APK için ayrı TASK-0135'tir.

V1/V2 korunur; V3 ACK/şema eşleşmesi zorunlu. V2 geri dönüş yalnız belirli
sürüm-hatasında yapılır. Yeni opaque Super anahtarı model bileşeni içerir;
legacy blank tag yeni modele yükseltilmez. Tarihsel karar kendi capture'ını okur.

## Açık observation / blokajlar

- TASK-0123/M10 iki tam hafta/200 uygun sonuç/30 aile ve ekonomik kalite kapıları
  bekliyor; ilk mümkün tam-hafta incelemesi2 Kasım. M3 teknik kabulü tamam;
  milestone CLOSED, sahibin açık kapanış kararı kaydedildi.
- TASK-0101 kırmızı kart ölçümü için koşullandırılmış veri/tasarım gerekli.
  Giugliano önceki çerçeve gözlemi aynı-an kanıt olmadan açıklanamaz.
- OBSERVATION_LOG'daki ayrı ertelenmiş işler bu A3 teslimatıyla onaylanmaz.
  TASK-0102/TASK-0121 kapalı kabul edilmiş teslimat/rollback kalır.

## Exact next steps

UX/Jinx batch: scoped commit/push is owner-approved; verify the Git receipt, then
obtain the separate build/sign, BFF runtime and coordinated release approvals.
Scope and completed checks: `UX_JINX_V3_LOCAL_2026_10_17.md`.
TASK-0156: the canonical weekly scorecard exists; rolling 7/30-day data and a runtime
feed remain missing, while approved probability/value evidence is a separate Phase
2/3 dependency. Its OPEN task has a dated evidence review for 19 October; local UI
preparation can proceed. See the local UX note for exact boundaries and screenshots.

Mevcut BFF pilotta çalışır; aşağıdaki gözlem adımları performans kapılarını korur.

0. Gözlem (M16 W7 dahil): yeni APK ve `app.surklase.com` gerçek kullanımda;
   bulgular `OBSERVATION_LOG.md`'ye. Sonraki istemci değişikliği yine tek
   koordineli batch: `deliver-apk-drive.ps1` ile APK teslimi, ardından
   `publish-web-client.ps1 -ApkPath -AndroidDeliveryReceipt`. Web'i acilen
   kapatmak için Cloudflare'de `app.surklase.com` rotası kaldırılır; beş
   `BTB_WEB_*` değişkeni yalnız birlikte silinir.
1. TASK-0124 fiziksel kabulü tamamlandı; yeni cihaz bulgularını gözlem kaydına ekle.
2.16 Ekim TASK-0123 salt-okunur kanıt incelemesi; etiket/kimlik ve gerçek sınırla
   ayır. Kontrolleri geçmiş sonuç olarak geri doldurma; ekonomik örneklem bekle.
3. TASK-0009 yayını ve exact-main DEV hizalaması tamamlandı; aynı kaynak için
   tekrar deploy gerekmez. M3 CLOSED; M10/FT45 veri kapıları açık kalır;
   TASK-0124 fiziksel kabulü DONE. Yeni/önceki A3 verisini exact SHA ve gerçek sınırla ayır.

## Documents

`PRESSURE_PATH_A3_DELIVERY_2026_10_14.md`,`SCORE_PRESSURE_V2_LOCAL.md`,
`OBSERVATION_LOG.md`,`NEXT_CUTOVER_PROCEDURE.md`,`ARCHITECTURE.md`,
`contracts/mobile-api.openapi.yaml`,`zbet-cap/docs/decision-context-v3.md`;
backend `score-pressure-v2/PRESSURE_PATH_DEV_PLAN_2026_10_14.md` ve
`PLAN_CLOSEOUT_2026_10_14.md`.
