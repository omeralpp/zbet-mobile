# Jinx — Mobile Mascot Asset Brief

## 2026-10-18 sahip seçimi — A geliştirilmiş Jinx

TASK-0162 laboratuvarında A geliştirilmiş futbol küresi ve B yeni saha tilkisi
karşılaştırılır. `assets/mascot/candidates/` altında aday başına açık/yarım/kapalı
üç göz karesi vardır: toplam altı 320×320 RGBA PNG, 641.512 bayt, saydam köşeler.
Sahip A'yı seçti; yerel ortak istemcide overlay, başlık ikonu ve maç kartı artık A'yı
kullanır; sakin boş durum görseli de A'dır ve gizleme tercihine uyar. B yalnız
karşılaştırma laboratuvarında kalır. Ortak `JinxAnimator`, kareleri
aynı boyut ve sahne süreleriyle, futbol/taktik aksesuarları ve kısa dönüşümlerle
oynatır. Para, taç veya rating'e göre coşku yeni adaylara eklenmez.
Kaynak atlaslar, kullanılan tam promptlar ve hazırlama doğrulaması
`ux-review-2026-10-18/ASSET_PROVENANCE.md` dosyasında belgelenmiştir.
Gerçek Android/web küçük-boy okunurluğu, TalkBack, hareket azaltma ve aktif
rehber/drag/menü davranışları fiziksel/oturumlu kabulde ayrıca doğrulanır.

Jinx, BTB Mobile Next'in kullanıcıya görünen futbol zekâ asistanıdır. Karakter
özgündür; mevcut film, oyun veya televizyon karakterinin yüzü, saçı, kıyafeti,
dövmesi, silahı ya da sembolü kopyalanmaz.

## Görsel dil

- futbol-topu biçimindeki kompakt, sürüklenebilir siluet korunur;
- derin mürekkep laciverti ana gövde, elektrik cyan/teal veri dikişleri ve
  ölçülü bronz yapısal vurgu kullanılır;
- zeki, yaramaz ve özgüvenli ifade; saldırgan olmayan asimetrik enerji;
- küçük boyda (48–72 dp) gözler, ağız ve top kimliği ilk bakışta okunur;
- gerçek alfa şeffaflığı; zemin, metin, logo, filigran ve kırpılmış glow yoktur.

## Runtime rolleri

| Dosya | Rol |
| --- | --- |
| `assets/mascot/candidates/jinx-a-open.png` | seçilen A, açık gözlü temel kare |
| `assets/mascot/candidates/jinx-a-half.png` | seçilen A, yarım blink |
| `assets/mascot/candidates/jinx-a-closed.png` | seçilen A, kapalı göz |

Seçilen kareler 320×320 RGBA'dır; köşe alfası 0'dır. Önceki 1254×1254
`assets/mascot/jinx-{open,half,closed}.png` dosyaları tarihsel referans olarak korunur.
Aynı kare boyutu, merkez, gövde, ışık ve siluet korunur; yalnız göz durumu değişir.

## Korunan davranış

Drag, hızlı menü, tutorial/discovery ve `GUIDE_ONLY` korunur. Canlı/Sakin/Kapalı
ve gizleme cihazda saklanır; sistem hareket azaltma üstün gelir. Canlı'da seyrek kısa
sahneler, Sakin'de daha küçük görev tepkileri vardır; Kapalı dekoratif hareketi durdurur.
Arka plan ve odak dışı sekme hareketi durur. Para/taç/kâr ruh hâli kaldırıldı;
gol/devre yalnız yeni, taze, eşleşen açık LIVE olay kaydıyla tetiklenir. Teknik/storage
anahtarları geriye uyumluluk için `bibi` adını koruyabilir; kullanıcıya görünen
metinler `Jinx` olur.

## Üretim yolu

Varlıklar yerleşik `imagegen` aracıyla üretildi. Ana prompt; özgün, insan
olmayan futbol-orb maskotu, Intelligence Noir malzeme ve renkleri, şeffaf zemin,
küçük-boy okunurluğu ve mevcut yapımlara ait ayırt edici öğelerin dışlanmasını
zorladı. Blink kareleri ana karenin kimlik/kompozisyonunu kilitleyen hedefli
göz düzenlemeleri olarak üretildi; opak checkerboard veren ara çıktılar projeye
alınmadı.
