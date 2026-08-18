# BTB Marka Varlığı — Üretim Brief'i

Durum: `ASSET_GENERATION_DEPENDENCY` · Milestone 2/11 — Logo / Brand Asset
Tarih: 2026-08-18 · Kanıt: `docs/OBSERVATION_LOG.md` (`NXT-OBS-101`)

Bu dosya, dış görsel üretim adımının tek girdisidir. Kod tarafı hazırdır: varlık
geldiğinde değişen tek şey dosyaların baytlarıdır, çağrı yerleri değil.

## 1. Neden yeni bir varlık gerekiyor

Mevcut marka raster'ı kendi koyu zeminini **içinde taşıyor**. Ölçüm, bu
depodaki dosyalar üzerinde `npm run check:brand` ile tekrar üretilebilir:

```text
assets/brand/btb-mark.png   192x192 RGBA
  tam saydam piksel : 0
  alfa aralığı      : 221..255
  dört köşe         : (0, 8, 27, α=221)   koyu lacivert, saydam değil
```

Sonuçları:

- Açılış ekranında marka, açılış gradyanının üzerine koyu bir kare olarak
  düşüyor. Kodda `borderRadius: 30` ile yuvarlatılıyor — bu bir stil değil,
  gömülü kareyi gizleyen bir telafi.
- Launcher'da adaptive icon **foreground** katmanı kenardan kenara opak olduğu
  için bildirilen `#04101E` arka plan hiç görünmüyor; cihaz maskesi zemini
  değil markanın kendi kenarlarını kırpıyor. `ic_launcher_round.webp` bunu
  tersten doğruluyor: yuvarlak varyantta saydam piksel var, çünkü üretici aynı
  opak kareyi daireyle kırpmış.
- Özet hero'da ve takım arması olmayan satırlarda aynı kare tekrar ediyor.

Bu **kodda düzeltilebilir bir şey değildir**. Zemin silme, renk kaydırma veya
mekanik yeniden renklendirme de çözüm değildir ve bilinçli olarak yapılmamıştır.

## 2. Kaynak dosyalar

Sahibin görsel üretim aracına verebilmesi için commit edilmeyen bir klasöre
kopyalandılar (`.codex-artifacts/` git tarafından yok sayılır). Kaynaklar
**değiştirilmedi**:

```text
.codex-artifacts/brand-source/btb-lockup-master-1254.png   1254x1254 RGB   tam kilit (amblem + BTB + BETTER THAN BET)
.codex-artifacts/brand-source/btb-emblem-master-1024.png   1024x1024 RGBA  yalnız amblem, en yüksek çözünürlük
.codex-artifacts/brand-source/btb-mark-current-192.png      192x192  RGBA  uygulamanın bugün kullandığı raster
```

Depodaki karşılıkları: `btb-assets/btb-logo.png`,
`btb-assets/btb-logo-shell.png`, `zbet-mobile/expo-app/assets/brand/btb-mark.png`.
`btb-assets` deposu hiçbir uygulama tarafından referans **edilmiyor**; yalnız
yayınlanmak üzere hazırlanmış bir varlık deposudur ve bu milestone'da
değiştirilmedi.

Mobil uygulamanın kullandığı 192px raster, `btb-emblem-master-1024.png`
dosyasının küçültülmüş hâlidir (192px'e indirgenmiş iki görüntü arasındaki
ortalama luma farkı 0.74/255). Yani üretim, 192px'lik dosyadan değil
**1024px'lik amblemden** çalışmalıdır.

## 3. Korunacak BTB kimliği

Yeni varlık BTB olarak tanınabilir kalmalıdır. Mevcut amblemin taşıdığı ve
**korunması gereken** unsurlar:

- **kalkan** ana form olarak;
- kalkanın içinde **futbol sahası** şeması (ceza sahası, orta yuvarlak, orta
  çizgi) — futbol kimliği zaten burada, uydurulmasına gerek yok;
- **yükselen sütun grafiği** ve üzerinden geçen **yükselen çizgi + ok**, düğüm
  noktalarıyla — tahmin/analitik kimliği;
- alt merkezde **futbol topu**, kendi halkası içinde;
- solda ve sağda **sinyal yayı** çiftleri — canlı veri/izleme kimliği;
- iki tarafın farklı renk taşıması (bugün sol mavi, sağ yeşil) — bu ikili yapı
  korunabilir, ama Intelligence Noir paletine taşınmalıdır.

Tam kilitteki **BTB** kelime markası ve **BETTER THAN BET** alt satırı bu
milestone'un kapsamı dışındadır: uygulamanın hiçbir yüzeyi onları raster olarak
kullanmıyor (açılış ekranı `BTB MOBILE` / `BETTER THAN BET` metnini kendi
tipografisiyle çiziyor). Yalnızca **amblem** üretilecektir.

## 4. Kaldırılacak eski özellikler

- gömülü koyu kare/yuvarlak-kare zemin — **tamamen** kaldırılacak;
- App Store dönemi mavi→yeşil gradyan hissi; palet aşağıdaki tokenlara taşınacak;
- düz vektör görünümü — malzeme ve derinlik kazanacak;
- kalkanın kenardan kenara tuvali doldurması (launcher rolü için).

## 5. Palet — Product Design V2 tokenları

Uydurma renk yok; bunlar `src/theme/theme.ts` içindeki gerçek değerlerdir.

```text
zemin (koyu tema)     #030B16   deep ink — varlığın ÜZERİNE çizileceği yüzey, varlığın PARÇASI değil
yükseltilmiş yüzey    #06101D
canlı teal (imza)     #3FE0D2   zekâ/canlı enerji — ana aksan
mavi (teknolojik)     #2E86F0   ikincil analitik aksan
jade (pozitif)        #4ADE80   yalnız kimliği güçlendirdiği yerde
bronz (yapısal metal) #B08046   yapı/çerçeve; sinyal değil, malzeme
metin                 #F2F7FC
```

Açık temada varlık şu zeminlerin üzerine düşer: `#F0EBE4` (arka plan) ve
`#FFFFFF` (yüzey). Açık temanın kendi bronzu `#8A5F2B`, teal'i `#04707F`.
**Tek varlık her iki temada da çalışmak zorundadır** — tema başına ayrı dosya
yoktur. Pratik sonuç: markanın kendi konturu/gövdesi ne saf beyaza ne saf koyuya
yaslanmalı; teal ve bronz her iki zeminde de ayırt edilebilir kalmalıdır.

Kaçınılacaklar: koyu üzerinde çamurlaşan teal; açık zeminde solan bronz; genel
kumarhane/cyberpunk görüntüsü; aşırı glow; neon çerçeve.

## 6. Görsel dil

BTB Intelligence Noir: derin mürekkep temeli, aqua/teal zekâ enerjisi, ölçülü
bronz yapı, lüks ve ışıklı derinlik, öngörü/istihbarat karakteri. Atmosfer,
malzeme zenginliği ve sinematik olgunluk düzeyinde ilham alınabilir; tipografi,
sembol, karakter, motif veya logo kurgusu **kopyalanamaz**. Sonuç
tartışmasız BTB olmalıdır.

## 7. İstenen dosyalar

İki export gerekiyor ve ikisi de gerçekten gereklidir: aynı dosya iki rolü
birden taşıyamaz. Ürün markayı kendi seçtiği boyutta çizer ve tuvali doldurmasını
ister; Android launcher varlığı maskeler ve yalnız tuvalin iç %66'sını güvenli
sayar. Bugün ikisi aynı dosyayı paylaştığı için maske markanın kendi kenarlarını
kırpıyor.

### 7.1 Marka işareti (ürün içi)

```text
hedef yol   : zbet-mobile/expo-app/assets/brand/btb-mark.png
boyut       : 1024x1024
biçim       : PNG, 8-bit RGBA, interlace YOK
zemin       : tam saydam (α=0), dört köşe dahil
içerik      : tuvalin %80-%100'ünü kaplar, optik olarak ortalanmış (±%2)
```

Çizildiği yerler ve gerçek boyutlar:

```text
açılış ekranı          132 dp
Özet hero               68 dp
takım arması yerine     40 dp (hero) · 24 dp (standart) · 18 dp (kompakt)
```

**En küçük boy belirleyicidir.** 18 dp'de siluet hâlâ kalkan olarak okunmalı;
sütun grafiği, ok ve sinyal yayları o boyda lapaya dönüşmemeli. Bu boyda varlık
daire bir çerçeve içinde `resizeMode="contain"` ile çizilir, yani kare tuvalin
köşeleri zaten görünmez — siluet dairenin içinde durmalıdır. Gerekirse küçük boy
için detay sadeleştirilebilir, ama ayrı bir dosya istenmiyor.

### 7.2 Adaptive launcher foreground

```text
hedef yol   : zbet-mobile/expo-app/assets/brand/btb-adaptive-foreground.png
boyut       : 1024x1024
biçim       : PNG, 8-bit RGBA, interlace YOK
zemin       : tam saydam (α=0), dört köşe dahil
içerik      : merkezde, tuvalin %50-%66'sı içinde kalır (Android güvenli bölge)
```

Arka planı Android çizer: `#04101E` düz renk olarak zaten bildirilmiştir, bu
yüzden foreground'un kendi zemini **olmamalıdır**. Aynı sanat eseri, güvenli
bölgeye ölçeklenmiş hâli yeterlidir; yeniden tasarım gerekmez.

### 7.3 Bildirim ikonu — üretilmeyecek

Android bildirim küçük ikonunu alfa maskesi olarak çizer, rengi atar. Bu rol
zaten tek renkli bir vektörle çözülmüştür
(`modules/btb-widget/android/src/main/res/drawable/btb_notification_icon.xml`,
24dp, beyaz kontur, saydam dolgu) ve hem Firebase hem Expo metadata anahtarına
kayıtlıdır. **Bu rol için raster istenmiyor.** Yeni amblemin siluetı değişirse
vektör ayrıca elden geçirilir; bu, görsel üretim adımının çıktısı değildir.

### 7.4 Android yoğunluk türevleri — üretilmeyecek

`mipmap-*/ic_launcher*.webp` dosyalarının tamamı `expo prebuild` tarafından
yukarıdaki iki dosyadan üretilir ve `android/` dizini git tarafından yok
sayılır. Elle üretilmemelidir.

## 8. Teslim sonrası doğrulama

Varlık geldiğinde entegrasyondan **önce** çalıştırılır:

```bash
npm run check:brand
```

Denetlenenler: PNG biçimi ve 8-bit RGBA, kare tuval, en az 1024px, gerçek saydam
piksel varlığı, dört köşenin α=0 olması, içerik/tuval oranının rolüne uyması,
optik merkez, ve eski zeminden kalan yarı saydam hale oranı. Bugün bu komut
bilinçli olarak **FAIL** verir; mevcut varlığın gerçek durumu budur.

Ardından yapılacak kod değişiklikleri (hepsi tek commit'te):

1. `btbAdaptiveIconForegroundPath` artık `btb-mark.png`'yi değil kendi dosyasını
   gösterir (`src/theme/brand.ts`, tek satır);
2. `AppLaunchScreen` içindeki `borderRadius: 30` telafisi kaldırılır;
3. `npm run check:brand` `npm run check` kapısına eklenir;
4. `expo prebuild` ile Android türevleri yeniden üretilir;
5. koyu/açık tema görsel doğrulaması, sonra ARM64 pilot APK.
