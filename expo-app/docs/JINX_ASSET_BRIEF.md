# Jinx — Mobile Mascot Asset Brief

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
| `assets/mascot/jinx-open.png` | açık gözlü temel kare |
| `assets/mascot/jinx-half.png` | yarım blink |
| `assets/mascot/jinx-closed.png` | kapalı göz |

Üç dosya 1254×1254 RGBA PNG'dir ve dört köşede alfa en çok `1` taşır (görsel
olarak tam saydam). Aynı kare
boyutu, merkez, gövde, ışık ve siluet korunur; yalnız göz durumu değişir.

## Korunan davranış

Drag, hızlı menü, tutorial/discovery, `GUIDE_ONLY`, sessiz mod, reduced-motion
ve uzun aralıklı tek mikro animasyon sözleşmesi değişmez. Teknik/storage
anahtarları geriye uyumluluk için `bibi` adını koruyabilir; kullanıcıya görünen
metinler `Jinx` olur.

## Üretim yolu

Varlıklar yerleşik `imagegen` aracıyla üretildi. Ana prompt; özgün, insan
olmayan futbol-orb maskotu, Intelligence Noir malzeme ve renkleri, şeffaf zemin,
küçük-boy okunurluğu ve mevcut yapımlara ait ayırt edici öğelerin dışlanmasını
zorladı. Blink kareleri ana karenin kimlik/kompozisyonunu kilitleyen hedefli
göz düzenlemeleri olarak üretildi; opak checkerboard veren ara çıktılar projeye
alınmadı.
