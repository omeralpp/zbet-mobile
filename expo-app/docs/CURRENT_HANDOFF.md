# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-24

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — doğrulanmış dirty checkpoint. Dördüncü 2026-08-24
`mobile cutover start` batch'i kapandı. `NXT-OBS-123`, `125`, `126`, `127` ve
`128` yerel olarak uygulandı ve fiziksel Xiaomi/sahip kabulini bekleyen `READY`
durumuna alındı. Önceki `NXT-OBS-124` de `READY` kalıyor.

- Canlı yüzeyinde yalnız `Canlı` switch'i ve bağımsız yıldız filtresi var;
  Fikstür/Scout segmentleri, Scout sayfası ve dürbünler kaldırıldı. Kart pini
  maçı `Sabitlenenler` grubuna taşır; geri alınca doğal kickoff grubuna döner.
- Jinx 30 saniye etkileşimsizlikte kapalı göz ve hafif nefesle uyur. Ekranın
  ilk dokunuşu onu uyandırırken hedeflenen switch/buton/pager/scroll eylemi aynı
  anda devam eder.
- Günlük Jinx mood'u Özet'in aynı gün ve seçili yıldız KPI kovasını paylaşır:
  artı, eksi, denge, sonuç-bekleme ve veri-yok durumları ayrı; kısa skeç ve
  öz-mizah gerçek değerlerle, tekrarsız ve yeni polling olmadan çalışır.
- `baskı farkı` tüm Mobile yüzlerinde mutlak büyüklük olarak gösterilir; yön ev
  veya uçak ikonu ve açıklamada kalır. Ham veri/model hesabı değişmedi.
- Canlı maç dakikaları kartta üç piksellik minimal progress çizgisi ve sağdaki
  dakika etiketiyle gösterilir; 90+ etiketi korunur, başlamamış maçta bar yoktur.

Resmî Mobile kalite kapısı geçti: TypeScript, ESLint, tüm testler, marka ve
Expo Doctor temiz. Android 15 x86_64 mevcut debug uygulamasında Expo reload ve
gerçek API smoke; pin/unpin ve doğal sıraya dönüş, 33 saniye Jinx sleep/wake,
aynı dokunuşla Canlı switch'i, gerçek `EMPTY` mood balonu, mutlak baskı değeri
ve `76'`/`50'` progress görünümü geçti. Fatal/React hatası yok. Native bağımlılık
değişmediği için Gradle/ARM64 APK üretilmedi. BFF, SAP, Firebase, Cloudflare,
runtime ve dış sistem değişmedi. Stage/commit/push yapılmadı. Ayrıntı:
`docs/observation_archive/cutover_2026-08-24-04.md`.

Önceki 2026-08-24 ikinci batch kod değişikliği olmadan kapandı. Dondurulan
`NXT-OBS-117`, aktif M4 rating dondurması nedeniyle `DEFERRED` oldu; Mobile,
BFF, SAP, runtime ve APK değişmedi. Ayrıntı:
`docs/observation_archive/cutover_2026-08-24-02.md`.

Önceki 2026-08-24 batch'inde dondurulan Mobile-local kapsam
`NXT-OBS-108`, `120`, `121`, `122` idi; dördü de uygulandı ve fiziksel
telefon/sahip kabulini bekleyen `READY` durumuna alındı.

- `NXT-OBS-120`: Beş ana ekran native Expo Router top-tab pager'a taşındı;
  alt bar sabit ve sahneler eager. Canlı `Canlı/Fikstür/Yıldız`, Super
  `Tümü/Yıldız` yüzeyleri native yerel pager kullanıyor. Eski ortak main/local
  pan kaldırıldı; detail edge-back korundu. Reduced-motion'da swipe kapalı,
  dokunarak seçim anlık.
- `NXT-OBS-108`: Yalnız `RESULTED` + pozitif güvenilir `theoreticalPrize`
  programlarında küçük semantik-pozitif `₺` ikonu ve erişilebilirlik metni var.
- `NXT-OBS-121`: Fiori WebView üstündeki opsiyonel `BTB WEB` kapsülü tamamen
  kaldırıldı; hata yüzeyi ve güvenlik guard'ları değişmedi.
- `NXT-OBS-122`: Ayrı güncel-maç açma butonu kaldırıldı; SONUÇ bandının
  skor/durum hücresi erişilebilir Pressable olarak aynı `/match/[key]` route'una
  gider.

Doğrulama: `npm run check` temiz (typecheck + ESLint + **413/413** test +
brand); Expo Android export geçti; ARM64 debug compile geçti; Android 15
x86_64 debug compile, kurulum ve canlı API smoke geçti. Emülatör kaydında ana
swipe ara karesi iki komşu sahneyi birlikte gösterirken alt bar sabit kaldı;
`Canlı -> Fikstür -> Yıldız` ve `Super Tümü -> Yıldız` jestleri yerleşti.
Gerçek Toto verisinde Program 350/349/348 `₺` ikonları görüldü; Fiori login
yüzeyinde eski rozet yok; Super SONUÇ alanına dokunma `Maç Detayı`nı açtı.
Expo Doctor **19/20**; tek kalan uyarı önceden var olan on Expo paketindeki
patch-sürüm farklarıdır. Yeni pager bağımlılıkları Doctor tarafından kabul
edildi.

`NXT-OBS-117` M4 rating dondurması korunarak uygulanmadı; BFF/SAP/model/rating
kaynağına dokunulmadı ve ayrı karar/canlı SAP kanıtı bekliyor. `zbet-cap`, SAP,
Firebase ve Cloudflare değişmedi. Bu nedenle bu Mobile-only batch için sunucu
deploy hedefi yoktur.

Final fiziksel-telefon ARM64 pilot adayı üretildi ve doğrulandı:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-07.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1) · minSdk 24 · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 54.050.973 bytes
SHA-256 : 2F3955EF517273E39D2E247DAC87918770CF3AB8D42941C8137C5EE8C591504C
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
Source  : 428757a
Durum   : FINAL_PILOT_CANDIDATE — fiziksel Xiaomi kabulü bekliyor
```

APK içeriğinde legacy FCM server key, PEM/RSA private key, `private_key`,
`client_secret`, service-account ve `JSESSIONID` eşleşmesi yoktur. Önceki
`cutover-06` APK'sı ile bu batch'in geçici x86_64 ekran/export kanıtları Geri
Dönüşüm Kutusu'na taşındı; marka kaynakları korundu. APK henüz dağıtılmadı.
Fonksiyonel kaynak commit'i `428757a`; kapanış kanıtı takip eden dokümantasyon
commit'indedir.
Ayrıntı: `docs/observation_archive/cutover_2026-08-24.md`.

Önceki batch: 2026-08-23 ikinci `mobile cutover start`. `NXT-OBS-094` denetimde
zaten uygulanmış bulundu; eksik reduced-motion desteği `Screen.tsx`'e eklenip
otomatik doğrulandı. Yeni APK üretilmedi. Ayrıntı:
`docs/observation_archive/cutover_2026-08-23-02.md`.

Önceki batch (06): `NXT-OBS-109` ve `NXT-OBS-120` `RESOLVED`; `NXT-OBS-117`
ayrı source-of-truth/rating kararı gerektirdiği için `OBSERVED` kaldı.

`NXT-OBS-109`: Web `Match Odds > Odd` kaynağı yerel CDS/OData metadata'sında
`zbet_cds_001x`, `type='01'` olarak doğrulandı. BFF aynı kanonik marketin
yayınlanan maç önü alanını nullable `kickoffRate` ile taşır. Mobile canlı oranı
önceliklendirir; Kick-Off aşamasında canlı yoksa `Kick-off oranı`, sonraki
aşamalarda canlı kapanmışsa `Canlı kapalı · KO` etiketi gösterir. Kaynakta
olmayan `Ms1X`, `MsX2`, `Ms05u` marketlerine oran türetilmez; yüzde olan
`zbet_cds_006-kick_off` fiyat gibi kullanılmaz.

`NXT-OBS-120`: ana/yerel sekme ve detay edge-back sürüklemesi
`PanResponder`/JS thread'den Expo-uyumlu Gesture Handler + Reanimated worklet
zincirine taşındı. Resmî Mobile type/lint/test, bounded Doctor, Android
production bundle ve staged `arm64` debug compile geçti. Android 15 `x86_64`
release smoke'unda `Özet -> Canlı`, yerel `Canlı -> Fikstür`, sınırda
`-> Super`, ters yön, detay edge-back ve Kick-Off fallback görünümü geçti.
Resmî BFF test + production build kapısı da geçti.

Sahibin `APK'ya kadar devam et` onayıyla tek final ARM64 pilot artefaktı
üretildi ve doğrulandı:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-06.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1) · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 53.961.661 bytes
SHA-256 : 839A2408740CE6DC3305EEC93CA78CD8B6A8A5B3D72D5C551A080918A85C2179
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
Durum   : FINAL_PILOT_ARTIFACT — BFF public read-back geçti
```

APK içinde `gesture-handler`, `reanimated` ve `worklets` ARM64 native
kütüphaneleri mevcut; server/private-key/session kalıp taraması temiz. Eski
ARM64 baseline, debug APK ve geçici Android bundle Geri Dönüşüm Kutusu'na
taşındı; `.codex-artifacts` altında yalnız bu APK tutuluyor. Üretim imzası veya
dağıtım yapılmadı. Public BFF temiz pushed `de91b2e` kaynağından bir kez yeniden
başlatıldı; local/public health `ok`. Aynı maç için iki yüzey de 9 market
satırının 9'unda `kickoffRate` alanını ve 7 gerçek kickoff fiyatını döndürdü.

Fonksiyonel commit'ler push edildi: `zbet-cap de91b2e` ve
`zbet-mobile 6ed7b7b`. BFF önce rollout edildi; local/public read-back geçtikten
sonra final Mobile APK teslim kapısına alındı. Kullanıcıya ait önceden var olan
untracked `cutover_2026-08-21-02.md` kapsam dışı korunuyor. SAP
yazısı/aktivasyonu yoktur. ADT MCP portu sonradan açılmış olsa da bu task'ın
tool listesine `sap-adt` araçları gelmedi; canlı MCP nesne okuması iddia
edilmez. Ayrıntı:
`docs/observation_archive/cutover_2026-08-23.md`.

Önceki (05) batch: 2026-08-22 `mobile cutover start`.
Freeze edilen `NXT-OBS-117`–`120` maddesinden ikisi (`118` Mobile UI yarısı,
`119`) `RESOLVED`; ikisi (`117`, `120`) kök nedeni doğru teşhis edilmiş ama
kapsamı Mobile-local bir düzeltmeyi aşan, ayrı scoping/onay gerektiren blocker
olarak `OBSERVED` kaldı. `FIXTURE` sekmesi artık kickoff'tan 90 dakikadan
fazla geçmiş `NOT_STARTED` maçları listeden düşürüyor (erteleme/iptal
uydurmadan); skor ilerlediği halde olay akışı gerçekten boşsa `Bu maçta henüz
gol veya kırmızı kart yok.` yerine `Skor ilerledi ama olay detayı henüz
gelmedi.` gösteriliyor. `NXT-OBS-117` (current-match/SuperLog atomik olmayan
anlık görüntüsü) ve `NXT-OBS-120` (ana sekme sürüklemesi hâlâ
`react-native-gesture-handler`/`reanimated` değil, eski `PanResponder`
üzerinden — kurulum/altyapı eksik) bu batch'e alınmadı.

Mobile `npm run check`: TypeScript/ESLint/**415** unit/marka kapısı temiz
geçti. Fiziksel veya emülatör cihaz doğrulaması yapılmadı — batch yalnız
süzme mantığı ve metin/koşul değişikliği içeriyor, yeni APK üretilmedi;
`zbet-cap` bu batch'te değiştirilmedi. Sahip commit/push'u sohbette açıkça
onayladı; beş dosya tek tek adlarıyla stage edilip commit `1fc45ca` ile
`origin/master`'a push edildi (`d603e1a..1fc45ca`). Deploy, SAP/Firebase/
Cloudflare değişikliği, release imzalama, APK dağıtımı veya Cordova cutover
yapılmadı. Ayrıntı: `docs/observation_archive/cutover_2026-08-22-02.md`.

Önceki (04) batch: `NXT-OBS-111`–`116` sınıflandırıldı; altısı da yerel
kanıtları geçip sahip tarafından kabul edilerek `RESOLVED` oldu (ana sekme
tam-genişlik eş zamanlı geçiş, Super kararları zaman akışına eklendi, `Açık`
bağımsız switch, `Tümü`→`Fikstür` yalnız `NOT_STARTED`, Super geçmişi 200,
Jinx halo kaldırıldı). Mobile+BFF kapıları ve 200-satır provider fixture
sözleşmesi geçti; fiziksel Xiaomi doğrulaması yapılmadı, sahip mevcut kanıtı
kabul etti. Kapanış sonrası sahip isteğiyle final ARM64 APK
(`btb-mobile-next-arm64-cutover-04.apk`, `53.347.881` bayt) üretildi. Commit
`7585aaa` (+ BFF `0832b16`, telemetry `19aa8f8`). Ayrıntı:
`docs/observation_archive/cutover_2026-08-22.md`.

Önceki (03) batch: `NXT-OBS-105`–`110` sınıflandırıldı; `105`, `106`, `107`
ve `110` fiziksel Xiaomi kabulüyle `RESOLVED`, gerçek Toto ödeme alanı olmayan
`108` ile doğrulanmış kickoff fiyatı olmayan `109` `DEFERRED` oldu.

Önceki (02) batch: sekiz eski `OBSERVED` satır sınıflandırıldı; `095` fiziksel
canlı maç kanıtıyla çözüldü, `096` superseded oldu, `099` tarihsel çözüm olarak
korundu; upstream/owner/gerçek-olay bekleyen `073`, `074`, `086`, `089` ve
`100` `DEFERRED` oldu.

Yeni `NXT-OBS-104`, SAP bridge SICF dayanıklılığını izler. Owner'ın `detail`
düğümünü yeniden oluşturmasından hemen sonra salt-okunur 401/200 ve BFF
`availability=OK` kanıtı alındı; kapanış kontrolünde uç yeniden 404'e döndü.
SAP yazma veya aktivasyon yapılmadı. Yerel `zbet-cap` checkpoint'i ek upstream
isteği üretmeyen pasif `/health.liveContextTelemetry` görünürlüğü ekler; hedefli
testler `34/34`, resmi BFF test ve production build kalite kapısı geçti. Mobile
kaynak değişmedi, yeni APK üretilmedi. Commit/push, deploy ve SAP kalıcı çözümü
ayrı açık onay bekliyor.

BTB ROADMAP MILESTONE 2/11 — LOGO / BRAND ASSET KAPALI, FİZİKSEL OLARAK
DOĞRULANDI. Sahip Xiaomi doğrulamasını tamamladı ve yeni BTB Intelligence
Noir marka entegrasyonunu kabul etti. Üretilen varlık doğrulandı,
deterministik olarak normalize edildi, iki kanonik role türetildi ve entegre
edildi. Kare zemin kaynağından kaldırıldı; açılış ekranındaki telafi de aynı
değişiklikte gitti.

Roadmap: **2/11 KAPALI = %18,2** · Şu anki milestone: **3/11 — Decision
Safety Implementation** (`BTB - Aktif` sahipliğinde; şartnamesi
`zbet-abap/docs/DECISION_SAFETY.md`). Milestone 2 yeniden açılmaz.

Durum:

```text
MILESTONE_1_CLOSED_PHYSICALLY_VALIDATED     (owner Xiaomi)
MILESTONE_2_CLOSED                          (logo / brand asset)
PHYSICALLY_VALIDATED                        (owner Xiaomi, 2026-08-19)
ROADMAP_2_OF_11 = %18,2
MILESTONE_3_CURRENT                         (Decision Safety — zbet-abap sahipliğinde)
BRAND_ASSET_INTEGRATED                      (şeffaf 1024² master + adaptive foreground)
BRAND_VALIDATOR_GREEN                       (npm run check:brand, iki rol de PASS)
LAUNCH_COMPENSATION_REMOVED                 (borderRadius: 30 kaldırıldı)
MOBILE_GATE_GREEN                           (TypeScript + ESLint + 398/398 + check:brand)
DARK_LIGHT_EMULATOR_VALIDATED               (360dp, Android 15)
SMALL_SIZE_VALIDATED                        (132/68/40/24/18 dp — siluet 18 dp'de korunuyor)
MOBILE_NEXT_BASELINE_VERIFIED               (Live Context v2 APK, geri dönüş noktası)
LIVE_CONTEXT_V2_ACCEPTED
REAL_GOAL_PHYSICAL_PASS
RED_CARD_OWNER_ACCEPTED
PROSPECTIVE_PILOT_RUNNING                   (300 sn, zbet-cap — değiştirilmedi)
BILYONER_LIVE_CONTEXT_RUNTIME = ENABLED_VIA_SAP_BRIDGE
```

Live Context runtime hâlâ `SAP_BRIDGE` upstream'i ile açıktır. Aktif runtime
yalnız `api.surklase.com` arkasındaki yerel standalone BFF/notification
servisidir. Public Cloudflare origin yapılandırması, Firebase/SAP dış
değişikliği, APK dağıtımı ve release signing yapılmadı; her biri ayrıca açık
onay gerektirir. Legacy Cordova RETIRED.

## Milestone 2 — Logo / Brand Asset

`zbet-mobile` bu milestone'da dört commit ilerledi. `zbet-cap`, `zbet-abap` ve
`btb-codex` **hiç** değiştirilmedi; `btb-assets` yalnız okundu.

```text
f3d628d  Ertelenen Xiaomi etiketi: `güncel baskı farkı` -> `baskı farkı`
69a1417  Widget modülünün Gradle çıktısı .gitignore'a alındı
361a080  Marka varlığı sözleşmesi, üç rol, doğrulayıcı ve üretim brief'i
a8ba66b  Intelligence Noir varlığı entegre edildi, telafi kaldırıldı
```

### Gelen varlık ve yapılan tek işlem

Sahibin ürettiği aday:

```text
1536x1024 · PNG · 8-bit RGBA
tam saydam piksel  879.133 (%55,9) · dört köşe α=0
yarı saydam        %3 — tamamı kendi kenarı ve glow'u
beyaz saçak        yok (yarı saydam bandın ortalama RGB luması 55)
görünür içerik     1136x1017, tuvalin üstünden 3 px, altından 4 px uzakta
```

Yani gerçekten şeffaf, beyaz zemin kalıntısı yok ve BTB kimliği yerinde:
kalkan, saha şeması, yükselen sütunlar, düğümlü çizgi + ok, top, çift sinyal
yayı, bronz yapı. Tek uyumsuzluk **paketlemeydi**: tuval kare değildi ve
optik pay yoktu.

Bu yüzden sanat eserine dokunulmadı. `scripts/derive-brand-exports.py` yalnız
üç şey yapar — görünür içeriğe kırp, küçült, saydam kare tuvale ortala:

```text
assets/brand/btb-mark.png                1024x1024 · içerik %92 (942x843)
assets/brand/btb-adaptive-foreground.png 1024x1024 · içerik %62 (635x568)
```

Renk değiştirilmedi, yeniden çizilmedi, **büyütülmedi** (araç büyütmeyi
reddeder). İki dosya aynı çizimin iki geometrisidir.

### Kanıt

`npm run check:brand` iki rol için de PASS: kare tuval, ≥1024px, gerçek
saydamlık, köşeler α=0, role göre içerik oranı, optik merkez (0.500, 0.500) ve
yarı saydam oran (%3,0 / %1,3).

`expo prebuild` sonrası Android türevleri — kök nedenin kapandığının ölçülmüş
kanıtı:

```text
                        önce                     sonra
ic_launcher_foreground  0 saydam piksel          %79 saydam
köşe alfa               221 (opak lacivert)      0
sonuç                   #04101E arka plan hiç    arka plan görünür,
                        görünmüyor               maske markanın kenarını kırpmıyor
```

### Doğrulayıcıda düzeltilen şey

`check-brand-assets.mjs` "opak" için tam `255` istiyordu. Bu master gövdesi
boyunca bir tık altında kalıyor (ham dosyada tepe 254), bu yüzden doğrulayıcı
%45 hale bildiriyordu — varlığın gerçek yarı saydam payı %3 ve tamamı kendi
kenarında. Eşik `>= 250` oldu; kontrolün baştan beri söylemek istediği buydu.
Varlık zayıflatılmadı, ölçüt düzeltildi.

### Küçük boy doğrulaması (xxhdpi, 3x gerçek piksel)

| dp | piksel | sonuç |
| --- | --- | --- |
| 132 | 396 | tam okunur |
| 68 | 204 | tüm unsurlar okunur |
| 40 | 120 | kalkan, top, yaylar, sütunlar okunur |
| 24 | 72 | siluet ve top net; sütunlar dokuya iner |
| 18 | 54 | **siluet korunuyor** — kalkan konturu, top, çift yay, yükselen çizgi |

18 dp'de detay sadeleşiyor ama kimlik kayboluyor değil; eski markla yan yana
konduğunda yeni varlık daha okunur ve açık temada kutusu yok.
`SMALL_SIZE_ASSET_REFINEMENT_REQUIRED` **gerekmedi**.

### Emülatör görsel doğrulaması (Android 15, 1080x2400 @ 480dpi = 360dp)

| Yüzey | Koyu | Açık | Sonuç |
| --- | --- | --- | --- |
| Özet hero | ✓ | ✓ | kare **yok**; marka doğrudan kartın üstünde |
| Canlı liste arma fallback | ✓ | ✓ | dairenin içinde şeffaf marka; kare yok |
| Canlı kart alt satırı | ✓ | ✓ | `baskı farkı` tek satır, taşma yok |
| Açılış ekranı | ✓ | — | release APK'da: **kare yok, yuvarlatma yok, köşe kırpılması yok**; glow gradyana karışıyor |
| Launcher ikonu | ✓ | — | release APK kurulu; daire maskede kalkan **tam**, arkasında `#04101E` görünüyor |

### APK

```text
btb-mobile-next-arm64-brand-asset.apk           (aday, fiziksel doğrulama bekliyor)
SHA-256  522F904E9EB047E072F0C25F98210B98F343DBBD8ED2848D6214E7D50E9A721D
imza     fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c  (v2 şeması)
paket    com.btb.mobile.next · versionName 0.1.0 · native-code arm64-v8a
```

İmza parmak izi mevcut kurulumla aynı, bu yüzden APK kaldırmadan üzerine
kurulur. `btb-mobile-next-arm64-design-v2-feedback.apk` bu aday fiziksel
doğrulamayı geçene kadar geri dönüşüme alınmaz.

**Denetim.** APK içindeki launcher katmanları ölçüldü: `ic_launcher_foreground`
432x432 **%79,2 saydam**, köşe alfası **0**; 324/216/162/108 türevleri aynı.
Yani opak kare artefaktın kendisinden gitmiştir. Sır taraması temiz: legacy FCM
server key deseni, PEM private key, `private_key` / `client_secret` alanı ve
service-account işaretçisi **yok**.

Emülatör doğrulaması için ayrıca `x86_64` paketi derlendi
(SHA-256 `E4FDA8A990F01CFB9E631C29C8ED11C7EBF010AFCCF4637AAFCD94F3B9856032`) —
emülatör x86_64 olduğu için arm64 APK kurulamıyor. Cutover prosedürü adım 8
uyarınca doğrulama sonrası silindi; `.codex-artifacts` yalnız `arm64`
artefaktları tutar.

**Release runtime smoke (emülatör, x86_64 paketi).** Pilot kapısı açıldı, canlı
API'ye bağlanıldı ve gerçek canlı maç listelendi (`BREZILYA SERIE B`, 50').
Koyu ve açık temada Özet, Canlı listesi ve açılış ekranı doğrulandı.

### Kapanış

Sahip Xiaomi fiziksel doğrulamasını **2026-08-19'da tamamladı** ve marka
entegrasyonunu kabul etti. Milestone 2 `CLOSED / PHYSICALLY_VALIDATED`.
Aşağıdaki kontrol listesi tarihsel kayıt olarak korunur. APK, denetim ve
emülatör kanıtları değişmeden durur.

### Sıradaki adım

1. Milestone 3 — Decision Safety. Bu Mobile task'ının kapsamı **dışındadır**;
   `BTB - Aktif` sahipliğindedir. Şartname: `zbet-abap/docs/DECISION_SAFETY.md`.
3. Milestone 3 (Decision Safety) mutasyonu ondan önce başlamaz — ayrıca
   **girdisi de eksik**: `R1–R11` gereksinimleri ve adli sonuç bu çalışma
   alanında hiçbir dosyada yok (tarandı). Yol haritasının kanonik kaydı ve
   Milestone 3'ün salt-okunur envanteri `BTB Logs/BTB_ROADMAP.md` içindedir.
   O madde `BTB - Aktif` task'ının sahipliğindedir.

### Xiaomi fiziksel doğrulama kontrol listesi — marka varlığı

Kurulum yolu: yeni APK mevcut kurulumla aynı imza parmak izini taşır, bu yüzden
kaldırmadan üzerine kurulur.

| # | Alan | Beklenen |
| --- | --- | --- |
| 1 | Launcher ikonu | Kalkan maskenin içinde tam duruyor; kenarları kırpılmıyor, arkasında koyu lacivert zemin görünüyor |
| 2 | Launcher — yuvarlak tema | Daire maskede de kalkan kırpılmıyor |
| 3 | Açılış ekranı | Marka açılış gradyanının üstünde; **kare veya yuvarlak kare zemin yok**, köşe kırpılması yok |
| 4 | Özet hero | Marka kartın üstünde; kutu yok, hale yok |
| 5 | Canlı liste — arma yok | BTB marka dairesi içinde okunur; 24 dp'de bulanık değil |
| 6 | Açık tema | Aynı yüzeyler açık temada; koyu kutu veya gri saçak yok |
| 7 | Küçük boy okunurluğu | Liste satırlarında marka kalkan olarak tanınıyor |
| 8 | Bildirim küçük ikonu | Gerçek FCM bildiriminde vektör ikon; dolu kare **değil** |
| 9 | Canlı kart baskı etiketi | `baskı farkı` tek satır, taşma yok |
| 10 | Genel regresyon | Özet, Canlı, Super, Toto, Daha Fazla, Work Zone deep-link ve bildirim dönüşü bozulmadı |

Bulgular `docs/OBSERVATION_LOG.md` içine yazılır.

## Milestone 1 arşivi — Design V2 fiziksel geri bildirim + Bibi pass (KAPALI)

Milestone 1 kapandı ve sahibin Xiaomi cihazında fiziksel olarak doğrulandı.
Aşağısı tarihsel kayıttır: ne yapıldığını ve neden öyle yapıldığını saklar.
Çelişkili runtime kanıtı çıkmadıkça yeniden açılmaz.

### Tamamlanan

```text
6fd3346  Phase B  Super model özeti semantik düzeltmesi
d881ac2  Phase C  Gol / kırmızı kart takım atfı (HOME/AWAY)
```

Kapı (her iki phase sonrası): TypeScript temiz, ESLint temiz, **342/342** test
geçti, `git diff --check` temiz. `zbet-mobile` HEAD = `d881ac2`.

**Phase B — kanıtlanmış semantik, yeniden yorumlanmayacak.**
`superProbability`, `super_current_rate` alanından gelir ve ABAP içinde
`(rate_won_super / rate_total) * 100` olarak hesaplanır; yani temel olasılıkla
aynı türde bir büyüklüktür, ikinci bağımsız bir model çıktısı değildir. Bu yüzden
`temel → Super olasılığı` "lift" gösterimi kaldırıldı ve yerine yeni bir olasılık
**uydurulmadı**. Gerçek skor formülü ağırlıklı ve sabit terimlidir:

```text
final_score = intercept
            + edge          * w_edge
            + pressure      * w_pressure
            + state         * w_state
            + compatibility * w_compat
            + alignment     * w_align
            + redPenalty    * w_red
```

Temel olasılık bu formülde bir terim **değildir**; ağırlıklar markete göre
değişir; UI'ın hiç göstermediği bir intercept ve bir red-market penalty terimi
vardır; ayrıca skoru EV üzerinden üreten ikinci bir kod yolu mevcuttur. Bu
nedenle `MODEL GİRDİLERİ` bölümü değerlerin toplamının model skorunu vermediğini
açıkça yazar. Kurallar `src/utils/model-summary.ts` içinde **test edilen veri**
olarak durur. Bu semantik yeniden açılmaz veya yeniden yorumlanmaz.

**Phase C.** Taraf bilgisi zaten sözleşmede vardı; hiçbir şey türetilmedi.
Deplasman satırları içeri girintilenir ve rayı içeri kayar, `EV` / `DEP` çipi
tarafı kulüp adı olmayan sözcüklerle söyler, nötr ray satırın taraf kenarını
işaretler, dakika kolonu sabit kalır. Renk bilinçli olarak kullanılmadı: ev/deplasman
bu palette semantik durum değildir ve sözleşmede güvenilir takım rengi yoktur.

### Milestone 1'de tamamlanan (tamamı commit edildi: `5fa1910..d7672ea`)

Kapı, her adımdan sonra: TypeScript temiz, ESLint temiz, `git diff --check`
temiz. Test sayısı **342 → 387** (45 yeni test). `zbet-cap`, `zbet-abap`,
`btb-codex` bu thread'de de hiç değiştirilmedi.

**1. Phase D — açılır/kapanır paneller + kalıcılık. TAMAM.**

`liveDetail` (9 modül) ve `superDetail` (4 modül) modülleri panel oldu. Gerçek
kayıt `src/layout/module-registry.ts` üzerinden okundu; handoff'taki örnek
listeler kullanılmadı. `overview` kapsam dışı bırakıldı — handoff yalnız iki
analitik yüzeyi adlandırıyor.

- Yeni: `module-collapse.ts` (saf kural), `module-collapse-store.ts` (kalıcılık),
  `CollapsibleModule.tsx` (panel), `module-collapse.test.ts` (17 test).
- Kalıcılık `surface + kanonik modül id` ile anahtarlanır; görünen metin
  saklanmaz. Depo anahtarı sıralamanınkinden **ayrıdır**.
- Saklanan değer **kapalı** kümedir. Depoda olmayan modül açıktır: bu yüzden
  panelleri ilk gören kurulumda her şey **OPEN** gelir ve sonradan yayınlanan
  her modül de açık gelir. Açık kümeyi saklamak ikisini de tersine çevirirdi.
- `ORDER` ve `EXPANDED/COLLAPSED` bağımsızdır; `reconcileModuleOrder` davranışı
  değişmedi (mevcut testleri aynen geçiyor). Bağımsızlık ayrıca test edildi.
- Hero yapısal olarak korunur: her iki ekranda da hero `ReorderableModuleList`in
  **dışında** render edilir, yani kapatılması mümkün değildir.
- Başlığa dokunma yalnız gerçek bir dokunuşsa çalışır: hareket reorder slop'u
  içinde ve süre reorder hold eşiğinin altında. Yatay sekme kaydırması, dikey
  scroll ve reorder'a dönüşmüş basış paneli açmaz/kapatmaz.
- Gövde yükseklik animasyonu **yok** — modüllerde WebView, canlı timeline ve
  grafikler var. Durum değişimini chevron taşır; reduced-motion onu da sıfırlar.
- `TutorialTarget` panelin **dışında** kalır (`match-standings`), böylece modül
  kapalıyken de rehber hedefi ölçülebilir durumda durur.
- `Daha Fazla > düzeni sıfırla` artık sıralamayı **ve** kapalı panelleri geri
  alır; tek çıkış yolu olduğu için yalnız birini geri almak tuzak olurdu.
- Yan düzeltme: reorder'a dönüşüp hiç hareket etmeden bırakılan basış modülü
  havada bırakıp scroll'u kilitliyordu. Başlıklar artık dokunulabilir olduğu
  için bu nadir jest sıradanlaştı; `ReorderableModuleList` dokunuş bitişinde
  askıda kalan drag'i kapatıyor.

**2. Xiaomi canlı kart düzeni. TAMAM.**

Kart yeniden tasarlanmadı. `deriveLiveCardFooter` (saf, test edilmiş) kuralı:
karar verilmiş kart market ve baskı bloklarını **her zaman** gösterir
(`market kapalı` ve `güncel veri bekleniyor` gerçek cevaplardır); karar
verilmemiş kart yalnız gerçek değeri olan bloğu gösterir. Böylece
`Aday bekleniyor` + `oran bekleniyor` + `güncel veri bekleniyor` üçlüsü tek
dürüst ifadeye iner. Savunma: `flexWrap`, `minWidth: 0`, `flexShrink` ve seçim
metninde `numberOfLines`. `SuperLogCard` aynı desen için tarandı ve aynı savunma
eklendi. Layout-stress fixture kusuru doğrudan koda bağlar: hiçbir durum birden
fazla `bekleniyor` etiketi üretemez.

**3. Phase E — kanonik logo izi. KODDA KAPATILAMAZ.**

Kare zemin raster'ın **içine gömülü**: `assets/icon.png` 192x192 RGBA, tam
saydam piksel **0**, köşeler `(0, 8, 27, α=221)`. APK'ya giren
`ic_launcher_foreground.webp` de kenardan kenara opak; bildirilen
`#04101E` adaptive arka plan hiç görünmüyor. Container kaynaklı olmadığı için
kodda düzeltilecek bir şey yok. `ASSET_GENERATION_DEPENDENCY` kanıtlarıyla
`docs/OBSERVATION_LOG.md` (`NXT-OBS-101`) içinde kayıtlı. Placeholder,
zemini silinmiş veya rengi kaydırılmış varlık **üretilmedi**. App icon ile
uygulama içi logo aynı dosyayı paylaşıyor (ortak kaynak kanıtlandı), yani varlık
geldiğinde tek değişiklik iki yüzeyi birden düzeltir. Takım armalarına
dokunulmadı. Kodda yapılan tek şey: `AppLaunchScreen` içindeki
`borderRadius: 30`ın bir stil değil gömülü kareyi gizleyen telafi olduğu ve
gerçek varlıkla birlikte kaldırılması gerektiği işaretlendi.

**4. Phase F/G — Bibi motion + feature discovery. TAMAM.**

- Yeni: `feature-discovery.ts` (saf motor, 17 test), `DiscoveryProvider.tsx`,
  `bubble-position.ts` (+ 6 test).
- Dört ipucu, hepsi bugün var olan ve görünür affordance'ı olmayan yetenekler
  için: özet modül sıralama, detay panelleri, Super yıldız süzgeci, düzen
  sıfırlama.
- Pacing: 4 saat cooldown, günde en fazla 2, aynı ipucu asla iki kez.
  İpucu **gösterildiği anda** emekliye ayrılır.
- Tutorial ve discovery ayrı depo, ayrı hız, ayrı anahtar. `QUIET` yalnız
  discovery'i susturur; rehber çalışmaya devam eder. Kontrol:
  `Daha Fazla > Bibi ipuçları: Normal / Sessiz`.
- Rehber adımı, presence veya pace tarafından bastırılan ipucu **slot
  harcamaz**.
- Route-presence regresyonu yok: `bibi-presence.ts` hiç değiştirilmedi ve motor
  kuralı route yazımına değil `bibiPresence`e karşı doğrular. Match Detail ve
  Super Decision Detail'de ambient Bibi yok.
- Motion: ipucu geldiğinde **tek seferlik** kısa mikro animasyon, sonra
  hareketsizlik. İkinci sürekli döngü eklenmedi; `LiveDot` ürünün tek sürekli
  ambient animasyonu olarak kaldı. Reduced-motion animasyonu düşürür, ipucunu
  korur.
- Discovery tamamen yereldir; hiçbir backend bağımlılığı eklenmedi.

**5. Super gün kapsamı varsayılanı — `Bugün`. TAMAM (sahip isteği).**

Yalnız sunum/varsayılan durum değişikliği. Kapsam route parametresinde tutulur;
kalıcı bir kullanıcı tercihi **yoktur** (denetlendi), bu yüzden ezilen bir tercih
de yok. `resolveSuperDayScope` artık parametre yokken `LATEST_DAY` döndürür.
`Tüm günler` açık bir `scope=ALL` değeri taşır — eskiden parametreyi temizleyerek
ifade ediliyordu ve yeni varsayılanla bu seçim ulaşılamaz hâle gelirdi.
`Bugün`ün anlamı değişmedi: yüklenen kararlardaki **en yeni maç günü**, cihazın
takvim günü değil. Backend sorgu semantiği, Super karar mantığı ve geçmiş veri
değişmedi; süzme zaten istemci tarafındadır. Özet ekranındaki `LATEST_DAY` derin
bağlantısı aynı kapsamı açar. Kullanılmayan `getSuperDayScopeAction` kaldırıldı;
hiçbir ekran onu okumuyordu ve eski `null` sözlüğünü pinliyordu — varsayılanın
sessizce kaymasına açık bırakan tam olarak buydu. Regresyon testi varsayılanı,
etiketleri ve iki yönlü eşleşmeyi pinler.

### Milestone 1 kapanışı

Tüm maddeler commit edildi, ARM64 pilot APK derlendi ve sahibin Xiaomi
cihazında fiziksel olarak kullanıldı. Design V2 yönü ve bu pass'in maddeleri
kabul edildi. Fiziksel kullanımdan tek erteleme çıktı — `güncel baskı farkı`
etiketinin uzunluğu — ve o da Milestone 2'de kapatıldı (`f3d628d`).
Phase E kodda kapatılamaz olduğu için Milestone 2'ye devredildi.

### Korunacaklar (kanıtlanmış Design V2 davranışı)

Intelligence Noir koyu tema ve premium açık yorum; semantik palet; canlı teal
kimliği; bronz yapısal aksan; jade pozitif; crimson negatif; tipografi ölçeği ve
11pt taban; materyal/derinlik grameri ve kart kenarı okunabilirliği; dürüst
durum sözlüğü (yalnız `OFFLINE` alarm eder); temporal bütünlük (`KARAR ANI` /
`SONUÇ` mimari ayrımı); Bibi `GUIDE_ONLY` kuralları; alt gezinme; güvenli
alanlar; sekme kaydırma; modül sıralama ve kalıcılığı; logo fallback; derin
bağlantılar; bildirimler; Work Zone; Game Pulse kompakt boyutlandırma;
Live Context v2 (yalnız gol + kırmızı kart).

### Değişmeyenler

`zbet-cap`, `zbet-abap`, `btb-codex` bu milestone'da **hiç** değiştirilmedi.
Prospective collector değiştirilmedi. Tahmin/model/backend semantiği
değiştirilmedi; yalnız okundu.

### APK durumu

Yeni kanonik ARM64 pilot APK derlendi:

```text
.codex-artifacts/btb-mobile-next-arm64-design-v2-feedback.apk
SHA-256 D7B5B5364D8C9E5A9CF8AC44E76147D426D958CCBFF4021B12FADB877CFF684A
imza    fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
```

`btb-mobile-next-arm64-live-context-v2.apk` ve
`btb-mobile-next-arm64-design-v2.apk` bu APK fiziksel doğrulamayı geçene kadar
**geri dönüşüme alınmaz**. Üç APK de aynı imza parmak izini taşır, bu yüzden
yeni APK mevcut kurulumun üzerine kaldırmadan kurulur.

## Xiaomi fiziksel doğrulama kontrol listesi — Design V2 geri bildirim pass

Artefakt: `.codex-artifacts/btb-mobile-next-arm64-design-v2-feedback.apk`
SHA-256 `D7B5B5364D8C9E5A9CF8AC44E76147D426D958CCBFF4021B12FADB877CFF684A`.

**Kurulum yolu önemlidir.** Yeni APK, cihazdaki mevcut APK ile **aynı imza
parmak iziyle** imzalıdır (`fac61745...`), bu yüzden kaldırmadan üzerine kurulur.
Panellerin "mevcut kurulum yükseltmede her şeyi açık bulur" göçünü yalnız bu
yol gerçekten sınar. Önce üzerine yükselterek doğrula; istersen ardından temiz
kurulumla tekrar bak.

| # | Alan | Beklenen |
| --- | --- | --- |
| 1 | Soğuk açılış / auth | Splash → pilot oturum açılır, hata/boş ekran yok |
| 2 | Özet | Modüller görünür, sayılar dolu, sıralama korunmuş |
| 3 | Canlı liste | Maçlar listelenir, canlı nabız çalışır |
| 4 | Aday üretilmemiş kart | Alt satır tek dürüst ifade: `İzleniyor` + `Aday bekleniyor`; ikinci/üçüncü `bekleniyor` etiketi **yok** |
| 5 | Taşma / kırpılma | Hiçbir kartta yatay taşma, kesik Türkçe etiket veya kart kenarını aşan metin yok |
| 6 | Maç Detayı | Hero (kimlik, skor, `BTB SEÇİMİ`) her zaman görünür |
| 7 | Gol / kırmızı kart atfı | Ev/deplasman doğru tarafta, girinti ve `EV`/`DEP` çipi tutarlı |
| 8 | Açılır paneller | Başlığa dokunma modülü açar/kapatır, chevron döner |
| 9 | Kapanma kalıcılığı | Kapatılan modül ekrandan çıkıp dönünce ve uygulama yeniden başlayınca kapalı kalır |
| 10 | Yükseltme göçü | Yükseltme sonrası **tüm** paneller açık gelir; hiçbir modül gizli değil |
| 11 | Sıralama bağımsızlığı | Modül taşıma hâlâ çalışır; taşımak paneli açmaz/kapatmaz, kapatmak modülü taşımaz |
| 12 | Kazara açılma | Yatay sekme kaydırması ve dikey scroll sırasında panel kendiliğinden açılıp kapanmaz |
| 13 | Game Pulse | Widget yüklenir; kimlik yoksa dürüst boş durum |
| 14 | Super Detayı | Hero'da kimlik, `KARAR ANI`, seçim, sinyal ve `SONUÇ` görünür |
| 15 | Düzeltilmiş model özeti | `MODEL GİRDİLERİ` uydurma "lift" olasılığı göstermez; terimlerin toplamı skor değildir notu okunur |
| 16 | Super panelleri | Dört modül de açılır/kapanır ve kalıcıdır |
| 17 | Super varsayılan gün | Karar günlüğü ilk açılışta `Bugün`; `Tüm günler` seçilebilir ve seçim korunur |
| 18 | Bugün verisi yokken | Veri yoksa dürüst boş durum; hata gibi görünmez |
| 19 | Bibi normal mod | Bir yüzeye yerleşince en fazla bir ipucu, tek kısa animasyonla |
| 20 | Bibi cooldown | Aynı ipucu tekrar etmez; kapatınca hemen ikincisi gelmez |
| 21 | Bibi sessiz mod | `Daha Fazla > Bibi ipuçları: Sessiz` sonrası ipucu gelmez |
| 22 | Rehber hâlâ çalışır | Sessiz moddayken bile Bibi rehberi baştan başlatılabilir ve adımlar görünür |
| 23 | Analitik yüzeyler | Maç ve Super detayında ambient Bibi **yok**; yalnız rehber adımı |
| 24 | Azaltılmış hareket | Sistem "animasyonları azalt" açıkken ipucu görünür ama animasyon yok; `LiveDot` dışında sürekli döngü yok |
| 25 | Toto | Program, tahmin ve kupon ekranları bozulmadan çalışır |
| 26 | Daha Fazla | Düzeni sıfırla hem sırayı hem kapalı panelleri geri alır |
| 27 | Work Zone / deep link | Better Than Bet, BTB Toto ve Super Log doğru açılır; `Illegal new hash` yok |
| 28 | Bildirimler | Gerçek FCM bildirimi gelir ve doğru ekrana götürür |
| 29 | Koyu / açık tema | Her iki temada palet, kontrast ve panel başlıkları okunur |
| 30 | Sekme kaydırma | Sekmeler arası yatay geçiş akıcı; beyaz flaş yok |
| 31 | Scroll performansı | Uzun listelerde ve panelli detaylarda takılma yok |

Bulgular `docs/OBSERVATION_LOG.md` içine yazılır; observation sırasında kod
değiştirilmez.

## Product Design V2 — tamamlandı (2026-08-18)

Mobile SHA: `21a1f57` (`origin/master` ile aynı). Baseline: `b57625e`.

```text
ff50051  Design System v2 token temeli
8de1936  Canlı kimliği + Bibi yoğun yüzeylerden çekildi
912b093  Özet + Canlı listesi: Intelligence Noir yüzey dili
7a22fe5  Maç Detayı skor tahtası yerine BTB kararı etrafında kuruldu
2e56530  Super kararında karar anı ile sonuç ayrıldı
6ff7e2c  Üç durum yerine ürünün gerçek sekiz durumu
3880da2  Her iki tema Intelligence Noir paletine taşındı
a6bdea2  Toto ortak sisteme alındı
21a1f57  İkincil yüzeyler + canlı nabız
```

Tasarım kuralları tek kaynakta: `docs/UI_INTERACTION_STANDARD.md`.

Kalite kapısı: TypeScript, ESLint ve `321/321` test temiz; `git diff --check`
temiz. Emülatör doğrulaması koyu ve açık temada yapıldı. Fiziksel Xiaomi
doğrulaması **yapılmadı** — kontrol listesi aşağıdadır.

Owner kararları: düşen oran renk konvansiyonu bu milestone'da değiştirilmedi
(ayrı ürün kararı olarak kaydedildi); Super model etiketleri kullanıcı yüzünde
Türkçe kalır.

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

## Product Design V2 aday APK — fiziksel doğrulama bekliyor

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-design-v2.apk
Kaynak  : 21a1f57 (Product Design V2)
Package : com.btb.mobile.next
Version : 0.1.0 (1) · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız; APK içinde tek lib dizini)
Size    : 48.271.941 bayt
SHA-256 : 8EB20F8F5774FB40FCE060E76DACC848F83C1928A19C27C3716DA4D60062AEEF
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot, useMocks=false, mobileApiUrl=https://api.surklase.com,
          legacyLaunchpadUrl=https://34dfc21ftrial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f
Durum   : PENDING_PHYSICAL_VALIDATION
```

İmza sertifikası doğrulanmış baseline ile **aynıdır**; üstüne kurulum ve App Link
davranışı korunur.

İçerik taraması (1.258 giriş, açılmış ağaç taramadan sonra silindi). Tarama önce
beklenen işaretlerle doğrulandı, çünkü yalnız sıfır dönen bir tarama bozuk
taramadan ayırt edilemez:

```text
beklenen var  : api.surklase.com 1 · 34dfc21ftrial 1 · com.btb.mobile.next 17
yasak         : 188b143btrial 0 (UTF-8 ve UTF-16LE) · match-card/event 0
                BEGIN PRIVATE KEY 0 · private_key 0 · JSESSIONID 0
Hermes tuzağı : UTF-16LE tespiti kanıtlandı (Türkçe sabit UTF-16LE olarak bulundu)
```

Pilot erişim anahtarı beklendiği gibi gömülüdür (doğrulanmış baseline ile aynı
profil). Değeri hiçbir log, rapor veya commit'e yazılmadı.

Doğrulanmış baseline `btb-mobile-next-arm64-live-context-v2.apk` **silinmedi**;
Design V2 APK'sı fiziksel doğrulamayı geçene kadar geri dönüş noktasıdır.

## Xiaomi fiziksel doğrulama kontrol listesi — Product Design V2

Yeni Design V2 APK'sı için. Geçene kadar `btb-mobile-next-arm64-live-context-v2.apk`
geri dönüş noktasıdır ve silinmez.

| # | Kontrol | Beklenen |
| --- | --- | --- |
| 1 | Soğuk açılış | Beyaz parlama yok; açılış ekranından Özet'e temiz geçiş |
| 2 | Kimlik doğrulama | Pilot oturum açılır; mevcut kurulumun üstüne yükseltme oturumu bozmaz |
| 3 | Özet | Hero kompakt, metrik kartlarında iz (trace) var, canlı sayaç teal |
| 4 | Canlı | Canlı pill'leri teal ve nabız atıyor; biten maç nötr `MS` |
| 5 | Yatay sekme kaydırma | Özet ↔ Canlı ↔ Super ↔ Toto ↔ Daha Fazla; ilk/son sekmede wrap yok |
| 6 | Maç Detayı | Skor bandı + BTB SEÇİMİ bandı; sinyal ölçer; oran hareketi yönü |
| 7 | Game Pulse | Kendi yüksekliğini bildiriyor; kompakt yükseklik davranışı bozulmadı |
| 8 | Gol / kırmızı kart zaman çizelgesi | Yalnız gol ve kırmızı kart; tazelik uyarısı doğru |
| 9 | Modül sıralama | Uzun bas-sürükle çalışıyor; sıra cihazda kalıcı |
| 10 | Super listesi | Açık karar iz taşıyor, sonuçlanan kararlar geri çekiliyor |
| 11 | Super karar detayı | `KARAR ANI` ile `SONUÇ` bantları bronz dikişle ayrık |
| 12 | Toto | Program durumu doğru tonda; kapasite çubuğu analitik mavi |
| 13 | Toto detayı | Bronz `KUPON` başlığı; sonuç renkleri doğru |
| 14 | Daha Fazla | Bronz bölüm etiketleri; satır metni okunur |
| 15 | Work Zone / derin bağlantı | Çift hash regresyonu yok; Fiori açılıyor |
| 16 | Bildirimler | Kayıt ve teslim; bildirimden doğru ekrana dönüş |
| 17 | Koyu tema | Derin mürekkep zemin; kart kenarları kaybolmuyor |
| 18 | Açık tema | Sıcak zemin, serin kart; metin lacivert ve okunur |
| 19 | Bibi kuralları | Maç Detayı ve Super karar detayında ambient Bibi **yok**; rehber adımı hâlâ çalışıyor |
| 20 | Beyaz parlama | Sekme geçişlerinde ve detay dönüşlerinde yok |
| 21 | Kırpma / taşma | Uzun Türkçe kulüp adları, yüksek skor, yüksek oran, 90+ dakika |
| 22 | Güvenli alanlar | Durum çubuğu ve gezinme çubuğu çakışması yok; alt sekme erişilebilir |

Bulgular `docs/OBSERVATION_LOG.md` içine yazılır; kod değişikliği yalnız
`btb next cutover start` ile açılır.

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
  HEAD            : 702c05f  (origin ile aynı, temiz)
  state           : handler sınıfı yerelde mevcut; live SICF kapanışta yeniden
                    404, SICF nesnesi sürüm kontrollü değil

zbet-cap
  branch/upstream : main / origin/main
  HEAD            : 19aa8f8  (origin ile aynı, temiz)
                    0832b16  Raise Mobile Super history limit
                    19aa8f8  Expose passive Live Context telemetry
  state           : mevcut yerel pilot runtime clean 19aa8f8 kaynağından
                    yeniden başladı; public health/read-back geçti

zbet-mobile
  branch/upstream : master / origin/master
  functional SHA  : 7585aaa  Complete Mobile observation UX batch
  state           : functional source origin/master'da; bu kapanış belgeleri
                    de current HEAD ile push edilir. Yalnız daha önce var olan
                    untracked `cutover_2026-08-21-02.md` kapsam dışı korunur
```

Kullanıcıya ait kapsam dışı dosya korundu. `btb-codex` içindeki bağımsız dirty
dosyalara dokunulmadı. Mevcut batch'in APK, commit/push, pilot runtime ve
dokümantasyon kapanışında bekleyen işlem yoktur.

## Doğrulama

- Mobile `npm run check`: TypeScript, ESLint, 414 test, OpenAPI ve brand geçti.
- Resmi Mobile BFF kapısı: tüm testler ve production build geçti; gerçek 200
  fixture sıralama, kayıpsız map, bounded URL ve `$top=200` sözleşmesini geçti.
- Android 15 x86_64 compile/install/launch ve hedefli UI smoke geçti.
- Final ARM64 pilot release APK build, ABI, package, v2 imza, SHA-256 ve
  server/private-key/session taraması geçti.
- Clean CAP `19aa8f8` runtime restart sonrası local/public health hazır;
  `liveContextTelemetry` her iki yüzeyde mevcut ve authenticated public
  `/v1/super/logs` read-back'i tam 200 satır döndürdü.
- Fiziksel Xiaomi bu son batch için bağlı değildi; sahip Android 15 görsel ve
  teknik/public read-back kanıtını observation kapanışı için kabul etti.

## Doğrulanmış baseline APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-04.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1) · targetSdk 36 · compileSdk 36
ABI     : arm64-v8a (yalnız)
Size    : 53.347.881 bytes
SHA-256 : 5D0ECB8C19514BCCF75EF8CDC574F7F7760EA3018896A989CEE2355265B77217
Signing : v2 · fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
Config  : authMode=pilot · useMocks=false · API=https://api.surklase.com
Source  : 7585aaa + CAP public runtime 19aa8f8
Durum   : FINAL_PILOT_ARTIFACT — owner'a paylaşıldı
```

İmza sertifikası önceki baseline ile aynıdır; üstüne kurulum ve App Link
davranışı korunur. Bellek içi APK taramasında legacy FCM server key, PEM/private
key, `private_key`, `client_secret`, service-account ve `JSESSIONID` eşleşmesi
**0** bulundu; değerler hiçbir log veya belgeye yazılmadı.

Cutover prosedürü adım 8 uyarınca `.codex-artifacts` yalnız bu doğrulanmış
`arm64` APK'yı tutar. Önceki APK'lar ve geçici ekran kanıtları Geri Dönüşüm
Kutusu'na taşındı.

Kanıt: `docs/observation_archive/cutover_2026-08-22.md`.

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

- `NXT-OBS-111`–`116` tamamı `RESOLVED`; bu batch'ten açık `OBSERVED` veya
  `READY` ve kapanış işlemi kalmadı.
- Freeze edilen sekiz maddeden açık `OBSERVED` kalmadı. `NXT-OBS-073`, `074`,
  `086`, `089` ve `100` doğru sahip/kanıt gelene kadar `DEFERRED`.
- `NXT-OBS-104`: `/sap/bc/zbet/provider/detail` live SICF düğümü owner'ın yeniden
  oluşturmasından sonra kısa süre çalışıp yeniden 404'e döndü. Kalıcı çözüm,
  ayrı SAP onayıyla SICF nesnesini sürümlemek, hedefte aktive etmek ve restart/
  session sınırından sonra read-back yapmaktır.
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

Observation modunda kal. Sonraki teknik kapı, `NXT-OBS-104` için SAP SICF
kalıcılığının ayrı operasyonel onayla çözülmesidir. Final Mobile pilot APK
paylaşıldı; current batch'in commit/push/runtime kapanışı tamamlandı.
FULL_INTERNAL ve Champion/Challenger başlatılmadı.

## Exact next steps

1. Mevcut batch için APK, commit, push, runtime restart/read-back veya belge
   kapanışı beklemiyor; observation modunda yeni fiziksel bulguları kaydet.
2. Ayrı SAP yazma/aktivasyon onayı verilirse `detail` SICF nesnesini abapGit
   kapsamına al, doğru hedefte aktive et ve restart/session sınırından sonra
   tokensız 401 + tokenlı 200 + BFF OK read-back kanıtı al.
3. Doğal bir kırmızı kart geldiğinde alt tip ayrımını yalnız gözlemsel doğrula;
   bu release engeli değildir.
4. `DECISION SAFETY / EVENT-TRANSITION CONFLICT REVIEW` başka bir BTB
   thread'inde tamamlandı. Sonuçları o thread'in kanonik kayıtlarındadır ve
   buradan yeniden yorumlanmaz; aşağıdaki bölüm yalnız tarihsel kapsam kaydıdır.
5. FULL_INTERNAL ve Champion/Challenger başlatılmadı; ayrı karar gerektirir.
6. Yeni observation batch'i yalnız `btb next cutover start` ile açılır;
   commit/push ve dış deploy kapıları açık onayla işletilir.

## DECISION SAFETY / EVENT-TRANSITION CONFLICT REVIEW — başka thread'de kapandı

Bu bölüm kapsamın tarihsel kaydıdır. Sonuçlar ve kararlar o thread'in kanonik
kayıtlarında tutulur; Mobile Product Design V2 bunları değiştirmedi.

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
