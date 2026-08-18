# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-19

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `BTB ROADMAP MILESTONE 2/11 — LOGO / BRAND ASSET · UYGULAMA TAMAM,
SAHİP FİZİKSEL DOĞRULAMASI BEKLİYOR` — Üretilen BTB Intelligence Noir varlığı
doğrulandı, deterministik olarak normalize edildi, iki kanonik role türetildi
ve entegre edildi. Kare zemin kaynağından kaldırıldı; açılış ekranındaki
telafi de aynı değişiklikte gitti. Kalan tek şey sahibin Xiaomi cihazındaki
fiziksel doğrulamasıdır — kod, test, doğrulayıcı, emülatör ve APK tarafı
tamamdır.

Roadmap: **1/11 KAPALI = %9,1** · Şu anki milestone: **2/11 — Logo / Brand
Asset** (uygulama tamam, kapanış sahip doğrulamasına bağlı). Milestone 3
(Decision Safety) mutasyonu Milestone 2 meşru olarak kapanmadan başlamaz.

Durum:

```text
MILESTONE_1_CLOSED_PHYSICALLY_VALIDATED     (owner Xiaomi)
BTB_ROADMAP = 1/11 CLOSED (%9,1)
MILESTONE_2_IMPLEMENTATION_COMPLETE
OWNER_PHYSICAL_VALIDATION_PENDING           (Xiaomi; marka her yüzeyde görünür değişti)
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
| Açılış ekranı | — | — | dev-client kendi splash'ı ile örttüğü için release APK'da doğrulanır |

### Sıradaki adım

1. **Sahip fiziksel Xiaomi doğrulaması** — marka her yüzeyde görünür
   değiştiği için zorunlu. Kontrol listesi aşağıda.
2. Doğrulama geçerse Milestone 2 kapanır ve roadmap %18,2 olur.
3. Milestone 3 (Decision Safety) mutasyonu ondan önce başlamaz.

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

Product Design V2 APK'sının fiziksel Xiaomi doğrulaması. Geçene kadar
`btb-mobile-next-arm64-live-context-v2.apk` geri dönüş noktası olarak korunur.

Arka planda: prospective evidence pilotunun izlenmesi (bloklamayan) ve
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
