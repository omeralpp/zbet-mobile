# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-18

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — 2026-08-18 Live Context v2 gerçek olay yolu kapatıldı. SAP
köprüsü aktive edildi, uçtan uca doğrulandı ve runtime `SAP_BRIDGE` upstream'i
ile açıldı. Mobile kaynak değişikliği olmadı; doğrulanmış APK baseline'ı aynı
kaldı. Aktif runtime yalnız `api.surklase.com` arkasındaki yerel standalone
BFF/notification servisidir. Owner talimatıyla `btb-fcm-proxy-srv` durdurulmuş
durumdadır. Public Cloudflare origin yapılandırması, Firebase/SAP dış
değişikliği, APK dağıtımı ve release signing yapılmadı; her biri ayrıca açık
onay gerektirir. Legacy Cordova RETIRED.

Durum:

```text
LIVE_CONTEXT_V2_ACCEPTED
REAL_GOAL_PHYSICAL_PASS
RED_CARD_OWNER_ACCEPTED
NO_NEW_APK_REQUIRED
MOBILE_NEXT_BASELINE_VERIFIED
PROSPECTIVE_PILOT_RUNNING                  (300 sn, zbet-cap)
BILYONER_LIVE_CONTEXT_RUNTIME = ENABLED_VIA_SAP_BRIDGE
```

Yeni task önce yalnız `C:\dev\btb-cdoex\AGENTS.md` ve bu dosyayı tamamen okur.
Observation tespitleri `docs/OBSERVATION_LOG.md` içindedir. Yeni toplu kod
batch'i yalnız `btb next cutover start` ile başlar.

## Live Context v2 gerçek olay yolu — kapatıldı (2026-08-18)

Sağlayıcıya **SAP'ın halihazırda çalışan HTTP istemcisi** üzerinden erişilir.
Bilyoner genel olarak erişilemez değildir; ayrım istemci istek profilindedir:

```text
SAP gömülü HTTP istemcisi  -> çalışıyor
curl, aynı makine          -> 400 users-api login kapısı
Node fetch / node:https    -> 400 users-api login kapısı
```

`curl` düz `curl/` user-agent gönderirken de reddedildiği için fark header
kaynaklı olamaz. Çözüm çalışan istemciyi ödünç almaktır; TLS parmak izi taklidi,
çerez/oturum/giriş otomasyonu yapılmadı ve kapsam dışıdır.

**SAP köprüsü** (`ZBET_CL_PROVIDER_BRIDGE` + `/sap/bc/zbet/provider/detail` +
TVARVC): salt okunur, kalıcılık yok, DDIC yok. Çağıran URL seçemez — yalnız
sayısal event id derleme zamanı sabitine yerleştirilir. Taşıma
`zbet_cl_main=>get_instance( )->get_rss( )`, değiştirilmeden kullanıldı. Köprü
alan katmanı değildir; sağlayıcının baytlarını olduğu gibi iletir, normalizasyon
BFF'te kalır.

Uçtan uca doğrulandı: canlı route `HTTP 200`, `btb.live-context.v2`, 3 gerçek
gol, `lineups` yok; aynı payload'daki 4 sarı + 12 değişiklik + 2 bölüm
işaretçisi `diagnostics.excludedByScope` ile dışlandı. Cache `MISS -> HIT`, TTL
penceresi başına tek upstream isteği.

```text
BTB_LIVE_CONTEXT_ENABLED       true
BTB_LIVE_CONTEXT_UPSTREAM      SAP_BRIDGE   (DIRECT açılmadı, açılmayacak)
BTB_LIVE_CONTEXT_BRIDGE_TOKEN  ayarlı (yazdırılmaz)
cache TTL                      LIVE 30s · HALF_TIME 60s · FINISHED 5dk
akış                           Mobile -> BFF -> cache/single-flight -> SAP_BRIDGE
                               -> zbet_cl_main->get_rss -> Bilyoner
```

Kabul:

```text
REAL_GOAL_VALIDATION     = PHYSICAL_PASS
REAL_RED_CARD_VALIDATION = OWNER_ACCEPTED_PENDING_NATURAL_OBSERVATION
```

Gerçek GOAL olayları fiziksel Xiaomi doğrulamasında görüldü. Kırmızı kart
uygulaması doğrulanmış sözleşme, normalizer semantiği ve otomatik testler
temelinde sahip tarafından kabul edildi; **gerçek bir kırmızı kartın fiziksel
olarak gözlendiği iddia edilmemektedir.** Bugüne dek hiçbir gerçek sağlayıcı
yanıtında kırmızı kart görülmedi (tek gerçek payload: 4 sarı, 0 kırmızı), bu
yüzden `DIRECT_RED`/`SECOND_YELLOW_RED` ve dismissal-without-subtype sözlüğü
gerçek veriyle hâlâ doğrulanmadı. Doğal bir kırmızı kart yalnız gözlemsel
doğrulamadır, release engeli değildir; sorun çıkarsa yeni defect açılır.

Yeni besleme **üretim model girdisi değildir**: Super/Toto skorlaması, eşikler ve
gol/kırmızı kart mantığı değiştirilmedi; `eventSummary` betimleyicidir.

Kanıt: `docs/observation_archive/cutover_2026-08-18.md`.

## Live Context ürün kapsamı daraltıldı — v2 (2026-08-17, sahip kararı)

Yayınlanan sözleşme artık **yalnız gol ve kırmızı kart** taşır. BTB sağlayıcının
maç anlatımını çoğaltmaz; bunlar BTB karar mantığına doğrudan etki eden ve
kullanıcı için en yüksek değerli iki olay sınıfıdır.

Maç Detayı'ndaki tek Live Context modülü `Goller ve kırmızı kartlar`. Satır
düzeni BTB'ye özgüdür ve sağlayıcı timeline'ını taklit etmez: dakika, işaret,
üstte takım, altında oyuncu, gollerde sağda güncel skor.

Kapsam dışı bırakılanlar: sıradan sarı kartlar, oyuncu değişiklikleri, bölüm
işaretçileri ve muhtelif anlatım. `İlk 11 ve dizilişler` modülü **tamamen
kaldırıldı** — bileşen, ekran bağlantısı, sözleşme alanları ve varsayılan
düzen kaydı dahil. Mevcut kurulumlarda ayrı bir göç gerekmez: düzen uzlaştırma
kanonik olmayan id'yi ilk okumada düşürür, kullanıcının sıraladığı diğer
modüller yerinde kalır.

Kart yalnız sağlayıcı ihraç olduğunu **olumlu biçimde kanıtlarsa** yayımlanır:

```text
bilinen düz kırmızı            -> RED_CARD / DIRECT_RED
bilinen ikinci sarıdan kırmızı -> RED_CARD / SECOND_YELLOW_RED
ihraç kanıtlı, alt tip yok     -> RED_CARD / UNKNOWN
sıradan sarı                   -> yayımlanmaz (YELLOW_CARD)
diğer her kart değeri          -> yayımlanmaz (UNCLASSIFIED_CARD)
```

Tanınmayan genel bir kart değeri ihraç kanıtı **değildir** ve kırmızı kart
olarak yayımlanmaz; BTB kırmızı kartı yüksek değerli bağlam saydığı için
yanlış-pozitif kırmızı bu modülün yapabileceği en kötü hatadır. İhraç; oyuncu
metninden, renkten, eksik alt tipten veya olayın yalnızca kart olmasından
**çıkarılmaz**. `UNCLASSIFIED_CARD` bilinçli olarak `YELLOW_CARD`'dan ayrı
tutulur: biri BTB'nin burada önemsiz olduğunu bildiği için, diğeri BTB'nin ne
olduğunu bilmediği için dışlanır. Sınıflandırılamayan kartın ham sağlayıcı
değeri `diagnostics.unclassifiedCardValues` içinde saklanır.

Kırmızıda ayrım korunur ve erişilebilirlik etiketinde okunur (renge bağımlı
değildir). Kendi kalesine gol yalnız sağlayıcı açıkça belirtirse korunur;
addan veya metinden **çıkarım yapılmaz**.

Kapsam dışı sınıflar sessizce atılmaz: `diagnostics.excludedByScope` sınıf
bazında sayar, `diagnostics.unknownFeedTypes` yalnız BTB'nin anlamadığı feed
tipleri için ayrılmıştır. İkisini birleştirmek, sağlayıcı tarafındaki bir
değişikliği BTB ürün kararından ayırt edilemez hâle getirirdi.

`timeline === null` (alınamadı) ile `timeline === []` (alındı, maçta gol/kırmızı
yok) asla aynı duruma çözülmez. `stale` ve `refreshFailed` ayrı kullanıcı
sinyalleridir. Hiçbir kullanıcı metni sağlayıcı adı, durum kodu veya uygulama
terimi içermez. Oyuncu adları yalnız görüntü verisidir; `comparisonForm` render
çıktısına ulaşmaz ve kimlik olarak kullanılmaz.

`eventSummary` (goalCount, redCardCount, latestGoalMinute, latestRedCardMinute,
scoreProgression[], redCards[]) yalnız yayımlanan timeline'dan türetilir ve
ileride prospective kanıtın karar bağlamını yeniden türetmeden saklayabilmesi
içindir. **Betimleyicidir**: üretim Super skorlaması onu okumaz ve bu besleme
bir model girdisi değildir. Model girdisi olup olmayacağı, mevcut üretim olay
sinyalleriyle karşılaştırıldıktan sonra verilecek ayrı bir karardır.

Mobile yalnız `GET /v1/btb/matches/:key/live-context` ucunu tüketir ve hiçbir
zaman doğrudan sağlayıcı çağırmaz; sağlayıcı JSON'u sunucu tarafındaki adaptörde
biter. Sağlayıcı runtime devre dışı olduğu için modül dürüst
"Gol ve kırmızı kart bilgisi şu anda kullanılamıyor." durumunu gösterir; meşru
erişim açıldığında yalnız `BTB_LIVE_CONTEXT_ENABLED=true` yeterlidir.

Şema `btb.live-context.v2`. Sözleşme: `zbet-cap/docs/mobile-live-context.md`.

Önceki v1 batch'inin kanıtı: `docs/observation_archive/cutover_2026-08-17-02.md`
(ana sekme kaydırma düzeltmesi ve mevcut kurulum modül göçü orada kayıtlıdır ve
yürürlüktedir).

## Work Zone deep-link double-hash regresyonu — kapandı (2026-08-17)

2026-08-16 Work Zone migration'ı `EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL` değerini
sonunda `#Shell-home` ile ayarladı; `src/legacy/routes.ts` bu değeri ham
temel URL kabul edip kendi `#btb-manage` / `#SporToto-manage` /
`#SuperLog-display` fragment'ını üzerine ekliyordu. Fiziksel Xiaomi
kullanımı Better Than Bet / BTB Toto / Super Log açılışlarında `Illegal new
hash - cannot be parsed: 'Shell-home#btb-manage?...'` hatasını gösterdi;
Work Zone sitesinin kendisi doğru açılıyordu.

Düzeltme: `routes.ts` içinde merkezi `normalizeWorkZoneBaseUrl()` /
`buildWorkZoneHomeUrl()`; dört URL üreticisi de (Home + 3 intent) kullanmadan
önce temel URL'yi normalize eder. `fiori-target.ts` hedefsiz geri dönüşü
artık `buildWorkZoneHomeUrl()` kullanır. `build-pilot-apk.ps1` yapılandırılan
tabanda `#` varsa build-time'da artık hata verir. Yerel `.env` fragment'sız
temel URL'ye güncellendi. 14 yeni regression testi (180 → 194).

Mobile `npm run check`: TypeScript/ESLint/test hepsi temiz. Yeni ARM64 pilot
APK derlendi, unzip edilip `assets/app.config` içindeki `legacyLaunchpadUrl`
fragment'sız olduğu ve hiçbir dosyada eski tenant referansı olmadığı
doğrulandı. **Fiziksel Xiaomi doğrulaması PASSED**: Work Zone ana sayfa,
üç Fiori uygulamasının deep link'i, eski tenant yönlendirmesi yok, normal
navigasyon ve bildirim akışı sağlıklı. Ayrıntı:
`docs/observation_archive/cutover_2026-08-17.md`.

`zbet-mobile` commit `7484502` (+ bu handoff güncellemesi). Sabit sınırlar
korundu: BTP deploy, Work Zone içeriği, NPL, Cloud Connector, SAP, Fiori
uygulamaları, retired Cordova ve Super/Toto iş mantığına dokunulmadı.

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
zbet-abap
  branch/upstream : main / origin/main
  HEAD            : 89ad8d9  (origin ile aynı, temiz)
                    89ad8d9  Add a read-only provider transport bridge
  state           : köprü SAP'ta aktif; DDIC/tablo/kalıcılık yok

zbet-cap
  branch/upstream : main / origin/main
  HEAD            : 2a8c0ca  (origin ile aynı, temiz)
                    11b961d  Narrow Live Context to goals and red cards
                    2ab2ef6  Route Live Context through the SAP bridge upstream
                    2a8c0ca  Pass the bridge upstream settings through to the BFF
  state           : Live Context runtime açık (SAP_BRIDGE); pilot 300 sn

zbet-mobile
  branch/upstream : master / origin/master
  HEAD            : 545c7d5  (origin ile aynı; kapanış commitleri bunun üstünde)
                    ecf0138  Show only goals and red cards on Match Detail
                    a0b3533  Close the Live Context v2 cutover on the verified baseline
                    545c7d5  Record Live Context running on the SAP bridge
  state           : Mobile kaynak değişikliği yok; APK baseline değişmedi
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

## Doğrulanmış baseline APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-live-context-v2.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1) · targetSdk 36
ABI     : arm64-v8a
Size    : 48.248.813 bytes
SHA-256 : 3096C0335361F45B6B95B7AFD35AE1A1D9C91E4D6233735F998E1B2B34EB5B28
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot, useMocks=false, mobileApiUrl=https://api.surklase.com,
          legacyLaunchpadUrl=https://34dfc21ftrial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f
Build   : 2026-08-17 — Live Context v2 (yalnız gol + kırmızı kart), dizilişler
          kaldırıldı, Game Pulse kendi yüksekliğini bildiriyor, sağlayıcı
          placeholder arma yerine BTB markası.
Durum   : MOBILE_NEXT_BASELINE_VERIFIED — fiziksel Xiaomi doğrulaması PASS
```

İmza sertifikası önceki baseline ile aynıdır; üstüne kurulum ve App Link
davranışı korunur. Tam akış taraması (1.322 girdi, tamamı bellekte): eski tenant
`188b143btrial` **0**, sağlayıcı detay ucu `match-card/event` **0**, SAP parolası
**0**, Firebase private key **0**, sağlayıcı oturum/çerez materyali **0**.

Denetim tuzağı: Hermes ASCII dışı sabitleri **UTF-16LE** saklar; yalnız UTF-8
arayan tarama Türkçe metinlerde yanlış sonuç verir. `Canlı saha dengesi`
içindeki `Sarı kart` satırı SAP kaynaklı istatistiktir, Live Context kapsamı
dışıdır.

Cutover prosedürü adım 8 uyarınca `.codex-artifacts` yalnız bu doğrulanmış
`arm64` APK'yı tutar. Önceki baseline `btb-mobile-next-arm64-pilot.apk` ve
doğrulanmamış ara artifact `btb-mobile-next-arm64-ui-polish.apk` bu başarılı
değiştirme kaydedildikten sonra Geri Dönüşüm Kutusu'na taşındı.

Kanıt: `docs/observation_archive/cutover_2026-08-17-03.md`.

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
- **CDN, bilinmeyen participant id için 404 değil HTTP 200 döner** ve tek bir
  sağlayıcı markalı placeholder görseli sunar. İstek başarılı olduğu için
  `onError` hiçbir zaman tetiklenmez; yalnız hata yoluna dayanan bir fallback
  bu placeholder'ı takım armasıymış gibi kullanıcıya geçirir.
- Placeholder yalnız intrinsic boyutundan ayırt edilir (React Native `onLoad`
  ile bildirir): ölçüm 2026-08-17, sekiz participant id üzerinde — gerçek
  armalar PNG ve yükseklik 64 (64 ve 49 genişlik görüldü), placeholder ise tam
  `128x128` WEBP, 1304 bayt ve her seferinde bayt-aynı. Kural bilinçli olarak
  dardır: başka her geometri gerçek arma sayılır. Sağlayıcı ileride gerçek
  armaları 128x128 yayınlarsa bu kural yeniden gözden geçirilmelidir.
- Eksik, geçersiz, hatalı ve placeholder armaların tamamı BTB markasına düşer
  (paket içi `assets/icon.png`), böylece fallback ağ isteği yapmaz ve döngüye
  giremez. Sağlayıcının kendi placeholder'ı BTB fallback'i olarak gösterilmez.
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
- Fiziksel ARM64 telefonda filtre/Toto sonuç görünümünün madde bazlı doğrulaması
  observation'da izlenecek (2026-08-17 fiziksel turu genel navigasyonu sağlıklı
  buldu ama bu maddeleri tek tek hedeflemedi).
- ~~Fiziksel Xiaomi bildirim kaydı ve teslimi~~ — KAPALI, bkz. yukarıdaki
  "Bildirim incidenti — KAPALI (2026-08-16)".
- ~~Work Zone deep-link double-hash regresyonu~~ — KAPALI, bkz. yukarıdaki
  "Work Zone deep-link double-hash regresyonu — kapandı (2026-08-17)".

## Sıradaki milestone

Prospective evidence pilotunun izlenmesi (bloklamayan) ve
`PENDING_LIVE_MATCH_VALIDATION` takibi. FULL_INTERNAL ve Champion/Challenger
henüz başlatılmadı.

## Exact next steps

1. Observation modunda kal. Live Context runtime `SAP_BRIDGE` ile açıktır;
   `DIRECT` upstream açılmaz.
2. `zbet-cap` prospective pilotunu 300 sn'de çalışır bırak; `/health`
   `prospectiveTelemetry` ile denetle.
3. Doğal bir kırmızı kart geldiğinde `Olaylar` modülünde alt tip ayrımını
   gözlemsel olarak doğrula. **Release engeli değildir**; sorun çıkarsa yeni
   defect aç.
4. Sıradaki milestone: `DECISION SAFETY / EVENT-TRANSITION CONFLICT REVIEW`
   (aşağıdaki adli vakalarla). Bu thread'de başlatılmadı.
5. FULL_INTERNAL ve Champion/Challenger başlatılmadı; ayrı karar gerektirir.
6. Yeni observation batch'i yalnız `btb next cutover start` ile açılır;
   commit/push ve dış deploy kapıları açık onayla işletilir.

## Sıradaki milestone — DECISION SAFETY / EVENT-TRANSITION CONFLICT REVIEW

Amaç: `MODEL_WRONG` ile `INCOHERENT_SNAPSHOT / EVENT_TRANSITION_UNSAFE` ayrımını
yapmak ve geçiş anında bozulmuş gözlemlerin ileride ROI/kalibrasyon/
Champion-Challenger veri setlerini kirletmesini önlemek. Kapsam: VAR geçişleri,
penaltılar, ani oran sıçramaları, skor/oran çelişkisi, market askı/yeniden
açılışı, gol çevresinde bayat skor, kırmızı kart sonrası yeniden fiyatlama.

Adli vakalar:

```text
1) Jong Utrecht - Vitesse   52'  BTB snapshot 1-1, Live Context golü -> 1-2
                                 Ms1X @ 3.36, ODDS_CHANGED
                                 final 1-3, karar LOST
2) Pachuca - Puebla         90'  şüpheli Ms1X @ 9.53
                                 Live Context 90+ golü -> 2-3
```

Bu milestone Super/Toto model mantığını değiştirme yetkisi taşımaz; önce teşhis.


Cutover kanıtı: `docs/observation_archive/cutover_2026-08-17-02.md`.
2026-08-15 stabilizasyon kanıtı: `docs/observation_archive/cutover_2026-08-15.md`.
2026-08-17 Work Zone deep-link kapanış kanıtı: `docs/observation_archive/cutover_2026-08-17.md`.
