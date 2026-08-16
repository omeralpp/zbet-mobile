# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-16

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — 2026-08-13 ikinci Mobile cutover batch'i uygulandı,
doğrulandı, iki repoda commit/push edildi ve Mobile BFF'nin korunan CAP yüzeyi
exact-SHA ile BTP DEV'e deploy edildi. Owner talimatıyla `btb-fcm-proxy-srv`
sonradan durduruldu ve yeniden açıkça devreye alınması istenene kadar
kullanılmayacak. Aktif runtime yalnız `api.surklase.com` arkasındaki yerel
standalone BFF/notification servisidir. Public Cloudflare origin yapılandırması,
Firebase/SAP dış değişikliği, APK dağıtımı ve release signing yapılmadı; her
biri ayrıca açık onay gerektirir. Legacy Cordova artık RETIRED — bkz. aşağıdaki
"Legacy Cordova Emekliye Ayrıldı" bölümü; bir daha cutover/migration konusu
değildir.

Yeni task önce yalnız `C:\dev\btb-cdoex\AGENTS.md` ve bu dosyayı tamamen okur.
Observation tespitleri `docs/OBSERVATION_LOG.md` içindedir. Yeni toplu kod batch'i
yalnız `btb next cutover start` ile başlar.

## UX / Etkileşim Milestone — tamamlandı (2026-08-16)

Konsolide Mobile UX batch'i: Super kimlik düzeni, ana navigasyon jesti, Bibi
idle davranışı, Bilyoner Game Pulse ve üç yüzeyde paylaşılan yeniden
sıralanabilir modül mimarisi.

**Super crest/takım eşleşmesi.** Karar kartlarında iki arma birlikte, birleşik
etiketin önünde duruyordu. Artık her arma kendi takımının yanında. Çözümleyici
önce sözleşmedeki `homeTeam`/`awayTeam` alanlarını kullanır; yalnız sınır
belirsiz değilse birleşik etiketi böler. SAP ayırıcıyı tutarlı doldurmuyor
(`Fluminense -Palmeiras`, `Osijek- L. Zagreb` gerçek örnekler), bu yüzden tire
ancak en az bir tarafında boşluk varsa sınır sayılır — `Saint-Étienne` ve
`Inter Turku-2` bölünmez.

**BetRadar zinciri (SAP yazımı gerekmedi).** `zbet_cl_main` canlı beslemeden
`BRDID` değerini `zbet_t_matches-stats_id` alanına yazıyor ve `zbet_cds_005`
bunu zaten projekte ediyor. BFF `$select`'ine `stats_id` eklendi ve yalnız maç
detayında `betRadarId` olarak yayınlanıyor. Public API doğrulandı:
`betRadarId=72440606` (First Vienna - Liefering) gibi gerçek değerler geliyor.

**Game Pulse.** `https://content.bilyoner.com/statics/canli-anlatim-v2/` URL'si
doğrulanmış kimlikten merkezî olarak kurulur; kimlik yoksa modül dürüst boş
durum gösterir ve ekranın kalanı çalışır. WebView tek origin'e sabitlenmiş,
dışarı gezinme reddediliyor, cookie paylaşımı kapalı, hiçbir BTB/pilot/SAP
değeri frame'e verilmiyor. Kaynak kimliği yalnız event id'ye bağlı olduğundan
canlı polling WebView'i yeniden yüklemiyor.

**Paylaşılan modül düzeni.** `src/layout/` altında tek mimari: uzun basış
modülü kaldırır, native-driver transform ile parmağı izler, komşular yer açar;
kenar auto-scroll yalnız parmak kenar bölgesindeyken tikler. Her yüzeyin kendi
kalıcı anahtarı var (`overview` / `liveDetail` / `superDetail`). Uzlaştırma
bilinmeyen id'leri atar, tekrarları onarır, bozuk depoyu varsayılana düşürür ve
yeni yayınlanan modülleri ekler — eski tercih yeni modülü asla gizleyemez.
Ekranlar yalnız verisi olan modülleri render eder; iki görünür modül arasındaki
sürükleme saklı sıraya eşlenir, gizli modüller yerinde kalır.

**Super Detay.** Yalnız sunum: model kanıtı, saha baskısı, havuz/lig bağlamı ve
puan durumu artık dört eşdeğer modül. Puan Durumu, benzerlik kartının içine
gömülü olmaktan çıkıp bağımsız iki-takım karşılaştırma modülü oldu; eksik sıra
gerçek olmayan bir sıralama ima etmemek için nötr tire gösterir.

**Bibi.** Sürekli float döngüsü kaldırıldı. Uzun sessiz aralıktan sonra tek
kısa davranış oynar (blink / çift blink / etrafa bakış / hafif zıplama / göz
kırpma), önceki davranışı asla tekrarlamaz; menü, rehber, sürükleme ve
reduce-motion durumlarında tamamen susar.

**Navigasyon.** Ana sekme jesti navigator sarmalayıcısından `Screen` içine
taşındı; içerik parmağı anında izler, sınırlı bir peek'e yumuşar, komşusu
olmayan sekme direnir. Bırakışta sekme hemen değişir ve giden içerik navigator
animasyonunun altında yerine oturur. Sekme çubuğu sabit kalır ve listelerin
üstünde artık capture responder yok.

Doğrulama: Mobile typecheck + lint temiz, `173/173` test; BFF `78/78` test.
Android API 35 x86_64 emülatöründe pilot modda canlı API ile tam UX review
yapıldı; gerçek `betRadarId` ile Game Pulse yüklendi.

## Notification Registration Hotfix — tamamlandı (2026-08-16)

`more.tsx`'teki "Cihaz kaydediliyor…" sonsuz askı hatası çözüldü. Kök neden:
`registerPushDevice()` içinde `getDevicePushTokenAsync()` dışındaki dört native
çağrı (ilk ve koşulsuz çalışan `ensureNotificationChannels()`,
`getPermissionsAsync()`, `requestPermissionsAsync()`,
`subscribeToTopicAsync()`) sınırsızdı; ayrıca `AppProviders.tsx` açılışta
manuel kayıttan bağımsız `restorePushRegistration()` çalıştırıyor ve
`addPushTokenListener` üçüncü, bağımsız bir `syncPushToken()` tetikleyicisiydi
— üç yol birbiriyle yarışabiliyordu.

Çözüm: `src/notifications/registration-machine.ts` — tek sahipli, saf/DI'lı bir
state machine (`idle/channels/permission_check/permission_request/push_token/
device_registration/complete/failed`; transaction-token ile tek-uçuş guard ve
eski sonucun yeni state'i ezmesini engelleyen koruma; izin isteği zaman
aşımından sonra recheck kurtarma; outer watchdog=30s; dinleyici hatası
transaction'ı asla bloklamaz). `register.ts` tek bir controller singleton'ına
sahip; `registerPushDevice()` manuel çağrıyı her zaman önceliklendirir,
`restorePushRegistration()` controller aktifken erken çıkar ve kendi
`getPermissionsAsync()`/token çağrıları da sınırlıdır. `more.tsx`
`useRegistrationState()` ile reaktif stage/hata koduna dayalı Türkçe alt metin
gösterir; artık hiçbir yol UI'ı süresiz "Cihaz kaydediliyor…" durumunda
bırakamaz. Merkezi zaman aşımı sabitleri `src/notifications/async-timeout.ts`
içinde (eski `push-token-timeout.ts` silindi) —
channels/permissionCheck/legacyTopic=8s, permissionRequest=20s,
deviceRegistration=25s, watchdog=30s, pushToken=15s (değişmedi).

Doğrulama: `registration-machine.test.ts` (~22 deterministic senaryo:
her stage için timeout/failure kodu, izin-recheck kurtarma, outer watchdog,
dinleyici hatası izolasyonu, stale-transaction koruması, single-flight)
+ `async-timeout.test.ts`; Mobile `npm run check` (typecheck + lint +
133/133 test) yeşil. Android API 35 x86_64 emülatöründe pilot modda smoke
edildi: manuel kayıt anında tamamlanıyor ("Bildirimler hazır" alert'i),
alt metin varsayılana dönüyor, hızlı çift dokunuşta ikinci alert
istiflenmiyor, logcat'te ilgili crash/fatal yok. Fiziksel cihaz bu task
kapsamında test edilmedi (yalnız emülatör onayı istendi).

Sabit sınırlar korundu: ARM64 build yapılmadı, thread-optimizer'a
dönülmedi, SAP/participant-ID/TeamLogo/Super-Toto/credentials/Firebase'e
dokunulmadı.

## Legacy Cordova Emekliye Ayrıldı — tamamlandı (2026-08-16)

Owner kararı: **legacy Cordova mobil uygulaması artık aktif bir runtime hedefi
değil — RETIRED / NO LONGER SUPPORTED.** Tek desteklenen mobil runtime
`zbet-mobile/expo-app` (Mobile Next / Expo).

Bağlam: BTP Work Zone yeni trial'a taşınırken (`BTB Logs/btp_workzone_migration/
MIGRATION_NOTES.md`) legacy Cordova kaynağında (`zbet-mobile/www/js/index.js`
`launchpadBaseUrl`, `zbet-mobile/www/index.html` CSP, `zbet-mobile/config.xml`
`allow-navigation`) eski (artık geçersiz) trial Work Zone host'u hardcoded
bulundu, override mekanizması yok. Owner kararı bu değerleri yeni tenant'a
taşımamak — Cordova'yı emekliye ayırmak.

Doğrulanan kanıt:
- Hiçbir CI/workflow, `btb-codex` tool'u (`btb-codex/tools/catalog.json`) veya
  build script'i Cordova build/publish etmiyor; tek build/deploy hedefi
  `zbet-mobile/expo-app/scripts/build-pilot-apk.ps1`.
- `zbet-mobile/www/`, `config.xml`, `platforms/`, `plugins/` kaynak olarak
  saklanıyor (silinmedi) — bu task kapsamında silme/arşivleme yapılmadı, henüz
  onaylı bir arşivleme prosedürü yok.

Eski trial referansları (`188b143btrial...`) bu üç Cordova dosyasında
**kasıtlı olarak PATCH EDİLMEDİ** ve READ-ONLY reclassify edildi:
`RETIRED_CODE / HISTORICAL_RUNTIME_REFERENCE` — artık build/ship edilmedikleri
için aktif runtime riski taşımıyorlar.

Mobile Next / Expo tarafında ayrı, onaylı bir düzeltme yapıldı:
`app.config.ts`'teki `legacyLaunchpadUrl` fallback'i eski tenant URL'sini
içeriyordu, artık `""` — yeni Work Zone sitesi yayınlandığında
`EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL` ile ayarlanacak. `tsc` temiz, lint temiz,
180/180 test yeşil.

Sabit sınırlar: Cordova kaynağı silinmedi, yeniden build/publish edilmedi,
migration başlatılmadı.

## Son checkpoint

- Maç ve Super detay hero kartlarındaki alt metrikler ortak üç kolon ritmine
  alındı: canlıda seçim / seçim oranı / güncel oran; Super'de seçim / seçim oranı / kâr.
- Karar Günlüğü yıldız menüsü artık `Varsayılan`, yıldız yüksekten düşüğe ve
  düşükten yükseğe sıralamayı da içerir. Varsayılan provider sırasını aynen korur.
  Android'de menü gerçek modal katmandadır; alttaki kartlar dokunmayı çalmaz.
- Ana `(tabs)` ekranları `Özet -> Canlı -> Super -> Toto -> Daha Fazla` sırasında
  yatay kaydırmayla değişir; detay ekranları ve ilk/son sekme wrap davranışı dışarıdadır.
- Toto detayında güvenilir kaynak `updatedAt` değeri yerel tarih/saatle gösterilir.
  Sonuçlanan fikstürlerde SAP `home_score` / `away_score` alanlarından biten skor;
  payout hazır ve pozitifse SAP `theo_prize` alanından `Teorik ikramiye` gösterilir.
- BFF Toto read-only seçimi/mapper'ı `payout_ready`, `payout_desc`, `theo_prize`,
  `home_score` ve `away_score` alanlarını nullable DTO olarak taşır. Eski public BFF
  bu alanları henüz yayınlamadığı için Mobile şeması staged deploy sırasında geriye
  uyumlu null fallback kullanır.
- `last_pressure_diff` / `last_total_pressure` alanlarının güncel maç değil son
  tarihsel Super karar değerleri olduğu yerel CDS kanıtıyla doğrulandı. BFF bunları
  artık güncel baskı gibi yayınlamaz; Mobile liste ve detay `Güncel veri bekleniyor`
  gösterir. Gerçek current-match alanı gelmeden sahte değer üretilmez.

## Repo durumu

```text
zbet-mobile
  branch/upstream : master / origin/master
  source commit   : 04a5635 (Complete Mobile Next observation cutover)
  state           : kaynak ve deploy kanıtı push edildi; repository clean

zbet-cap
  branch/upstream : main / origin/main
  HEAD            : ead7a99584c60c846b1e0f88e77543158b262cbe
  state           : clean, origin/main ile aynı; exact-SHA BTP DEV deploy edildi
```

Kullanıcıya ait mevcut değişiklikler korunmuştur. Commitler yalnız bu cutover'ın
Mobile Next, Mobile BFF ve kapanış kanıtı kapsamındadır.

## Doğrulama

- Mobile `npm run check`: TypeScript, ESLint ve `96/96` test geçti.
- BFF `npm test`: `65/65` test geçti.
- Kompakt Mobile BFF kalite kapısı geçti.
- Expo Doctor `19/20`: yalnız bilinen yedi Expo SDK 57 patch farkı açık; bu özellik
  batch'ine dependency yükseltmesi karıştırılmadı.
- Public `https://api.surklase.com` read-only dashboard/matches/Toto smoke ve yeni
  Mobile Zod şemasıyla geriye uyumluluk parse kontrolü geçti.
- CAP exact-SHA MTA geçici Node 24 build ortamında üretildi; archive SHA-256
  `EE6C1471A51DBB735DDFA74A8D56C6CD5975630E9A61BFBCC02878209055DA0C`.
- BTP DEV MTA operation `4067016a-9756-11f1-91c3-eeee0a9f1a4c` tamamlandı;
  deploy kanıtı alındı. Owner'ın sonraki talimatıyla `btb-fcm-proxy-srv`
  `requested state: stopped`, `0/1` durumuna getirildi.
- Public Mobile BFF origin yeni source ile yeniden başlatıldı. Gerçek Toto detail
  response `theoreticalPrize`, `payoutDescription`, `updatedAt`, `homeScore` ve
  `awayScore` alanlarını taşıdı; public `/health` pilot auth, SAP backend, device
  registry ve notification bileşenlerinin hazır olduğunu doğruladı.
- Android API 35 x86_64 emülatöründe açık tema, canlı API, ana sekme swipe,
  Karar Günlüğü modal yıldız/sıralama menüsü ve seçim hit-test'i smoke edildi.
- SAP MCP readiness çalıştırıldı; görünür araç listesinde repository/source-read
  aracı olmadığı için SAP kaynak iddiaları live MCP kanıtı değil yerel ABAP/CDS
  snapshot kanıtıdır.

## Final yerel pilot APK

Final ARM64 artifact build ve imza/hash doğrulaması bu handoff'un aşağıdaki alanında
cutover kapanışında kaydedilir:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-device-registration-fix.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,232,269 bytes
SHA-256 : a4d41ed1a7035062315636e7e014431c54678efb8b9ef1812c36aec5580c1f44
Config  : authMode=pilot, mobileApiUrl=https://api.surklase.com
Build   : 2026-08-16 — legacy FCM topic no longer blocks device registration
          (26bfa0b). Fiziksel telefonda manuel kayıt retry'ı bu artifact ile
          yapılır.
```

Bir önceki artifact `btb-mobile-next-arm64-ux-milestone.apk` (2026-08-16 11:03)
aşağıdaki regresyonu taşır ve fiziksel telefonda `DEVICE_REGISTER_TIMEOUT`
verir; kullanılmaz. 2026-08-15 tarihli
`btb-mobile-next-arm64-pilot-stabilization.apk`
(SHA-256 `3baf3df08e4c7a1c15228965d1d41477d6e976cd4860a9c5df68e8899477f4a7`)
`62904a0` öncesidir, yani bu regresyondan etkilenmez.

### Fiziksel telefon cihaz kaydı regresyonu (2026-08-16)

- Belirti: izin verildikten sonra akış `Cihaz sunucuya kaydediliyor...` aşamasında
  kalıyor ve `Cihaz kaydı zaman aşımına uğradı.` ile bitiyordu.
- Kanıt: 11:12 denemesi için şifreli cihaz kayıt defterinde hiçbir yazma yok;
  son yazma 10:51:44'teki emülatör kaydıydı. POST `/v1/devices` hiç gönderilmedi.
- Kök neden: `62904a0` eski yayın topic aboneliğini 8 sn ile sınırladı. Bu adım
  `registerDevice`'tan önce çalışıyordu; `FirebaseMessaging.subscribeToTopic`
  görevi FCM arka ucuyla eşitlenene kadar beklemede kalır ve bu telefonda sınırı
  aşıyor. Oluşan `TimeoutError`, aşama zaman aşımından ayırt edilemediği için
  hiç gönderilmemiş bir istek sunucu zaman aşımı gibi raporlandı.
- Düzeltme: `26bfa0b` — cihaz kaydı önce çalışır ve sonucu o belirler; eski topic
  aboneliği arkasında sınırlı best-effort adıma indirildi.
- Sunucu tarafı sağlam: public `POST /v1/devices` kayıt yazmasını 27 ms'de
  tamamlıyor; `zbet-cap` `23926f8` ile aşama izleme (`DEVICE_*`) eklendi.
- Doğrulama: aynı düzeltmenin x86_64 build'i (`btb-mobile-next-x86-64-device-registration-fix.apk`)
  API 35 emülatörüne kurulup manuel kayıt çalıştırıldı; `Bildirimler hazır`
  döndü, kayıt yazması 11 ms sürdü ve ikinci cihaz kaydı korundu.

### Bildirim incidenti — KAPALI (2026-08-16)

- Bildirim kaydı: **KAPALI**. Fiziksel Xiaomi cihaz kaydı: **DOĞRULANDI**.
  Fiziksel Xiaomi gerçek bildirim teslimi: **DOĞRULANDI** (manuel tetikli
  gerçek BTB bildirimi telefonda görüntülendi).
- Kök neden: cihazın önceki FCM kayıt tokenı Firebase tarafında
  `UNREGISTERED` durumuna düşmüştü. Her gönderimde telefon hedefleniyor,
  FCM 404 `UNREGISTERED` dönüyor ve cihaz kayıt defterinden düşürülüyordu.
  Uygulama verisi temizlenince yeni FCM instance/token alındı ve teslim
  normale döndü.
- Hedefleme mekanizması doğrulandı: aktif yol yalnız cihaz kayıt
  defterindeki **doğrudan FCM tokenları** ile gönderir
  (`buildFcmMessage` token varsa `message.token` kullanır). Eski `BTB`
  topic'i aktif teslim yolunda kullanılmaz; yalnız pilot Android'de
  sınırlı best-effort geriye dönük uyumluluk adımıdır. Topic adı/durumu
  bu incidente katkı vermedi, topic rename yapılmadı.
- Telemetri: `zbet-cap` `7e3e823` ile gönderim başına cihaz bazlı teslim
  kaydı eklendi (registry id öneki, platform, HTTP status, FCM error code,
  düşürülme bayrağı). Token/kimlik bilgisi loglanmaz. Aynı commit
  `INVALID_ARGUMENT` hatasında yalnız FCM token alanını işaret ettiğinde
  cihaz düşürür; hatalı payload artık tüm kayıt defterini silemez.
- İlgili commit'ler: Mobile `26bfa0b` (+ handoff `ddbcc36`),
  BFF `23926f8` (device stage izleme) ve `7e3e823` (cihaz bazlı teslim
  telemetrisi).
- Aktif bildirim blokajı yok. Kurulu ARM64 artifact değişmedi; yeni APK
  gerekmedi.
- Not: `08211fa9` önekli eski kayıt defteri kaydı bilinçli olarak
  silinmedi; ayrıca talep edilirse kaldırılır.

Önceki final artifact (2026-08-13, `btb-mobile-next-arm64-cutover-20260813-v20-final.apk`)
`docs/observation_archive/cutover_2026-08-13-02.md` içinde kayıtlıdır.

## Bilyoner takım logo eşlemesi

- `htpi` = home participant id; `atpi` = away participant id.
- Logo kalıbı:
  `https://content.bilyoner.com/assets/participant/{participantId}.png`
- PSG `htpi=954`:
  `https://content.bilyoner.com/assets/participant/954.png`
- Aston Villa `atpi=227`:
  `https://content.bilyoner.com/assets/participant/227.png`
- Bu, Bilyoner'in public/dokümante edilmiş resmi logo API'si değildir; web
  uygulamasında kullanılan CDN pattern'inin gözlemlenmesiyle tespit edilmiştir.
  Bu nedenle tek merkezi resolver/config ve broken-image göstermeyen fallback
  zorunludur; URL component'lere veya DB'ye dağınık yazılmaz.
- Yerel Mobile OpenAPI/Zod, BFF `$select`/mapper ve ABAP snapshot'ında `htpi/atpi`
  bulunmadı. Doğru alan zinciri upstream SAP/DDIC/OData'da ayrı yazma/aktivasyon
  onayıyla sağlanmadan takım adından tahmin veya runtime scraping yapılmaz.

## Açık observation / blokajlar

- `NXT-OBS-073`: participant ID zinciri eksik; kulüp logoları doğru veri gelene kadar
  deferred.
- `NXT-OBS-074`: notification producer sürekliliği için SAP çağrı/SM59 telemetry kanıtı.
- `NXT-OBS-086`: Toto idempotency düzeltmesi `BTB Toto - Aktif` sahipliğindedir.
- `NXT-OBS-092`: Mobile/BFF tarihsel baskıyı artık güncel diye göstermez; gerçek
  current-match pressure alanı SAP/OData'da yayınlanana kadar veri bekleme fallback'i
  kullanılır.
- Toto skor/teorik ikramiye alanları CAP DEV deploy ve public response ile
  doğrulandı; fiziksel cihazdaki görünüm observation sırasında izlenecek.
- Fiziksel ARM64 telefonda v20 kurulum ve ana sekme swipe/filtre/Toto sonuç görünümü
  observation'da izlenecek.
- ~~Fiziksel Xiaomi bildirim kaydı ve teslimi~~ — KAPALI, bkz. yukarıdaki
  "Bildirim incidenti — KAPALI (2026-08-16)".

## Sıradaki milestone

Claude ↔ Codex Thread Optimizer parity.

## Exact next steps

1. Observation modunda fiziksel cihaz sonuçlarını topla.
2. `btb-fcm-proxy-srv` uygulamasını başlatma, deploy etme veya notification yolu
   olarak kullanma; yalnız owner açıkça yeniden devreye alınmasını isterse değerlendir.
3. Participant ID ve current pressure kaynak sözleşmelerini ilgili operasyonel task'a
   handoff et; Mobile'da tahmini veri üretme.
4. Yeni observation batch'i yalnız `btb next cutover start` ile aç; commit/push ve
   dış deploy kapılarını yeniden açık onayla işlet.

Cutover kanıtı: `docs/observation_archive/cutover_2026-08-13-02.md`.
2026-08-15 stabilizasyon kanıtı: `docs/observation_archive/cutover_2026-08-15.md`.
