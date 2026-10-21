# Tema batch'i — 2026-10-21 (Claude, yalnız tema)

Kaynak tasarım: özel Design canvas (v40, 31 pano; v30 sahibin beğendiği görünüm).
Uygulama tabanı: `zbet-mobile/master` `11d4b12` (artifact kaynağı `a00b743`).
Durum: sahip onayıyla (2026-10-21) `master`'a commit/push edildi. APK
imzalama/özel teslim ve eş web yayını ayrı açık onay ister; bu batch hiçbir
release'i yetkilendirmez.

## Kapsam ve korunan anlamlar

Backend kararı, durumları, doğrulayıcılar (`rebuild-schemas.ts`,
`rebuild-current.ts`, üretilmiş şemalar, OpenAPI) ve kanıt anlamı değişmedi.
Tek güncel en iyi uygun seçim; ayrı geç fırsatlar; değişmez ilk oran/dakika/
skor/yıldız ile güncel durumun ayrılığı; birebir elenme nedenleri; açık
bekleyen/erişilemez durumlar; yıldız = tutarlılık ve kanıt kalitesi, yüzde =
havuz desteği; Jinx aynı backend kararını açıklar; ilk oranla varsayımsal 1
birim 7/30 gün sonuçları; legacy A3 ayrı. İstemci puanlaması eklenmedi.

## Değişenler (iki yüzey birlikte)

- **Tipografi:** Manrope (400/500/700/800) ve Barlow Condensed (500/700/800)
  `assets/fonts` altında, OFL lisanslarıyla. Android: expo-font XML font ailesi
  (prebuild'de `res/font`, `ReactFontManager`). Web: `fonts.web.ts` aynı aile
  adlarıyla FontFace kaydı; açılış ekranı yüzleri bekler (en çok 2,5 sn).
  Roller `typography.ts`'de; rakamlar Barlow Condensed. 11 pt altı boyutlar
  tabana çekildi; 600/900 ağırlıkları dosyası olan yüzlere eşlendi.
- **RB1 (A7) ekranları:** `RebuildEvidencePanel` (maç detayı) ve
  `RebuildReportPanel` (Super) yeniden tasarlandı: güncel seçim kartı, Jinx
  balonu, **Karar fişi** (`DecisionTicket.tsx`: karar anı üstte, sonuç koçanda,
  20 pt çentik, 7/5 bronz kesik; geniş panelde dikey dikiş), karar kanıtı
  (havuz desteği çubuğu, baskı oyları, kesinti formülü, yıldız tavanları),
  maç boyunca öneriler zaman çizelgesi, diğer adaylar ve elenme nedenleri,
  7/30 gün segmenti, beş ayrı sonuçlu sonuç çubuğu, kırılım tabloları,
  öğrenme incelemesi ilerlemesi. Biçimleme `rebuild-display.ts` (testli).
- **Özet:** marka çubuğu, tarih üst etiketi, tek yüzey gösterge şeridi
  (canlı · yıldız · BTB 7 gün varsayımsal birim), kompakt öne çıkan kartlar,
  `Son BTB önerileri` (Karar fişi satırları).
- **Canlı:** board kartı (kısa canlı kenar çubuğu, dakika hapı, 30 pt skor,
  takım satırında baskı yönü, karar paneli, baskı satırı), Canlı/Fikstür tek
  segment (NXT-OBS-123 anlamı korunarak), arama alanı.
- **Super:** `Karar günlüğü` başlığı; geniş web'de rapor solda, öneriler
  sağda; eski A3 tarihçesi ayrı satır ve dönüş çubuğu.
- **Maç detayı:** 52 pt hero skor, saha çizgileri, RB1 için yıldız +
  "Tutarlılık ve kanıt kalitesi" (legacy "BTB rating" yalnız A3'te).
- **Toto:** ayrılık alt başlığı, durum filtreleri, board program kartı.
- **Daha Fazla:** üst etiket bölüm başlıkları, bilgi bandı, Jinx hareketi segmenti.
- **Web kabuk:** kenar çubuğu daraltma oku (28 pt daire, 44 pt hedef, cihazda
  saklanan tercih; `sidebar-preference.ts`), dar çubukta ipuçları, yenile
  düğmesi başlık hizasında.
- **Ortak:** yüzeyin kısa canlı kenar çubuğu, 5'li yıldız ölçeği, armalar
  24/30/56, filtre çipleri, bölüm aksiyonları, iskelet yükleme, alt sekmede
  etkin hap, açılış ekranı orta yuvarlak/çizgi; açık temada `redSoft #FADEE3`
  (kırmızı metin 4,48 → 4,65:1).

- **Keşif ipucu:** `super-star-filter` ("Yıldıza göre süz") kaldırıldı. RB1
  Super sekmesi rapor ekranıyla açılıyor; yıldız filtresi yalnız ayrı eski A3
  görünümünde. İpucu, `feature-discovery.ts` kuralına göre ekranda olmayan bir
  kontrolü anlatıyordu.
- **Android düzeltmeleri (emulator'da görüldü):** detay ekranlarında başlık
  altındaki boş şerit kaldırıldı (swipe-back yığın sayfası yerel başlığın
  altında olduğundan üst güvenli alan bir kez uygulanır); Karar fişi kesik
  çizgisi kart dışına taşmıyor; etkin sekme hapı sekme değişince köşesini
  kaybetmiyor; baskı oyları Türkçe ondalık virgülüyle.

## Platform istisnaları

- Kenar çubuğu daraltma yalnız masaüstü web'dedir; telefon alt sekme çubuğu
  kullanır (daraltma yok).
- Marka çubuğu telefonda ve 768 px altı web'de; masaüstünde kenar çubuğu taşır.
- Android widget'ları yerel görünümlerdir; sistem yazı tipiyle kalır.

## Panodan bilinçli sapmalar (kod ve kayıtlı kararlar önceliklidir)

- Logosuz takımda BTB işareti kalır (cutover 2026-08-17-03, NXT-OBS-103);
  panodaki baş harf çemberi uygulanmadı.
- `Sonuç bekliyor` Toto tonu analitik mavi kalır (`toto-status.ts`); panodaki
  altın uygulanmadı.
- Fikstür sekmesi `Fikstür` adını korur; panodaki `Tümü` yanlış anlam taşırdı.
- Jinx konuşma balonu bilerek açık kalır (`BtbMascotOverlay`); yalnız yazı
  boyutu okunur seviyeye çıkarıldı.
- Panodaki `12 sn önce` veri tazeliği göstergesi eklenmedi: kaynakta gerçek
  güncelleme zamanı yok (NXT-OBS-032).

## Doğrulama

Typecheck, lint, 691 birim testi, 32 tooling testi, marka kontrolü ve
Expo Doctor (20/20) geçti. Edge ve mocks web export'ları scratch klasörlerine
alındı (gizli değer taraması temiz, yedi font dosyası pakette; mevcut
`dist-web` korunmuştur). Tarayıcıda telefon/masaüstü ve iki tema kontrol
edildi. Android: prebuild `res/font` XML ailelerini ve `ReactFontManager`
kaydını üretti; `C:\btb-mobile-smoke-*` kısa yolunda, tüm `EXPO_PUBLIC_*`/`BTB_*`
değişkenleri temizlenmiş mocks-only x86_64 release derlemesi emulator'da
Özet, Canlı, Super, maç detayı (RB1 kanıt ve Karar fişi), Toto, Daha Fazla ve
açık temada doğrulandı; aşama klasörü silindi. Fiziksel Xiaomi ve yayın
smoke'ları koordineli release'te.
