# Maçın yolu ve RB1 istatistik batch'i — 2026-10-22 (Claude)

Kaynaklar: sahibin onayladığı v45 panoları (`W-MacYolu`, `M-MacYolu`, özel Design
canvas) ve Codex'in 76A backend teslimi (`BTB Logs/model_lab/reports/CLAUDE_FINAL_BACKEND_HANDOFF_2026-10-22.md`).
Codex kullanım sınırına takıldığı için sahip işi buradan tamamlamayı istedi
("tema ile beraber bütün işlemleri tamamla"). TASK-0177 (btb-mobile) bu batch'in
işidir; NXT-OBS-183. Commit/push, APK ve web yayını her biri onay ister.

## Codex kayıtlarının kapanışı

Codex'in 76A kapsamındaki tamamlanma kayıtları yarıda kalmıştı; denetlenip
push edildi: `BTB Logs` b626236, `zbet-cap` 46c4cdc, `btb-codex` 2e5a7f4
(TASK-0175/0176 makbuzla DONE; TASK-0177 sürüyor). SAP, BFF ve model
aktivasyonu tekrarlanmadı.

## Değişenler (Android ve web birlikte)

- **Sözleşmeler:** `GET .../matches/{key}/statistics` (`btb-match-statistics.v1`) ve
  `.../pressure-history` (`btb-pressure-history.v1`) için zod şemaları
  (`rebuild-statistics-schemas.ts`), üretilmiş JSON şemaları, OpenAPI yolları,
  gerçek Bayern–Arsenal geçmişi ve bayat istatistik fikstürleri. Şemalar
  bilinmeyen sürüm veya alanda kapanır; değerler null olabilir.
- **Maçın yolu kartı:** Jinx kartının altında kendi tam genişlik kartı; `Yol`
  çipi kalktı. Skor şeridi, ev üst / deplasman alt şerit, BTB fişleri (dakika,
  yıldız, donmuş oran, sonuç rengi), `Seçili an` paneli (masaüstünde yanda,
  telefonda altta), anlar şeridi, `Nasıl okunur?`. Her işaret 44 pt hedef;
  sürükleme ve dokunma tek jest tuvalinde. Gol/kart dakikası sağlayıcı
  olayından; olay yoksa RB1 gözleminden ("ilk kez N′ kaydında görüldü").
- **Havuz çizgisi:** RB1 `poolPath` = `RB1_POOL_PATH_NOT_EXPOSED`; çizgi çizilmez,
  eski A3/journey havuzu kullanılmaz, tek bir açık not gösterilir. RB1 dışı
  (örnek) yolculukta çizgi ve devre basamağı korunur.
- **Baskı grafiği (RB1):** her doğrulanmış aralık kendi başlangıç–bitiş
  dakikasında; yalnız backend'in `connects` dediği aralıklar birleşir, boşluk
  boşluk kalır; tahmini/tarihsel etiket ve "maçın tamamı kanıtlanmadı" notu.
  Güncel aralık (statistics) ayrı kutuda: taban + sınırlı ek (74A) ve kullanılan
  isteğe bağlı ölçümler, hesaplanmadan gösterilir.
- **Canlı saha dengesi (RB1):** tamamı tek doğrulanmış gözlemden; null `—`,
  ölçülmüş sıfır `0`; ceza sahası teması, engellenen şut girişimi, kaleci
  kurtarışı (kendi kalecisi) eklendi; ölçüm zamanı ve kısmi/bayat nedeni sade
  dille. Eski sıfır varsayılan kolonlarla karıştırılmaz. Canlıda 30 sn'de bir
  yenilenir (backend 120 sn'den eski ölçümü vermez).
- **Temizlik:** eski `MatchJourneyChart`, `MatchTimelineCard`, inceleyici ve
  zaman çizgisi yardımcıları kullanılmadığı için kaldırıldı; `ComparisonRow`
  ortak bileşene taşındı (eksik değerde `—%` hatası düzeldi).

## Korunan anlamlar

Backend baskı, seçim, skor ve yıldızın sahibidir; istemci yeniden hesaplamaz.
Yıldız = tutarlılık ve kanıt kalitesi, kazanma olasılığı değil. Donmuş ilk
oran/dakika/skor/yıldız; 7/30 gün varsayımsal tek birim; eski kohort karışmaz.
Örnek veri modu RB1 olgusu üretmez (`DUMMY_NOT_PUBLISHED`).

## Panodan farklar

- Panodaki canlı örnekte çizgi vardı; RB1 havuz yolu sunulmadığı için gerçek RB1
  maçlarında not görünür (pano B durumu).
- Masaüstü `← →` ipucu yerine "Bir işarete tıkla ya da grafikte sürükleyerek
  gez"; klavye ile işaretler ve anlar şeridi düğme olarak gezilir.
- Canlı nabız animasyonu yok; son kayıt sabit canlı noktası/hap ile gösterilir.

## Platform istisnaları

Yan yana grafik + `Seçili an` yalnız geniş web'de; telefonda alt alta. Lejant
geniş web'de başlıkta, telefonda `Nasıl okunur?` içinde.

## Doğrulama

Typecheck, tüm proje lint'i, 644 birim testi (yeni: sözleşme, istatistik
görünümü, baskı modeli, Maçın yolu modeli ve kart kuralları), 32 tooling testi,
marka kontrolü, edge ve mocks web export'ları (scratch, gizli değer taraması
temiz), `git diff --check` temiz. Expo Doctor 19/20: yalnız bilinen dış
`expo-router` 57.0.29 kayması.

Geçici RB1 önizlemesiyle (commit edilmedi, kaldırıldı): web'de canlı ve biten
maç, masaüstü, gömülü Canlı bölmesi ve telefon genişliği, koyu ve açık tema;
işarete tıklama, anlar şeridi, `Super kararını aç`, gerçek Bayern–Arsenal
gözlemleriyle skor şeridi. Android: `C:tb-mobile-smoke-*` kısa yolunda, tüm
`EXPO_PUBLIC_*`/`BTB_*` değişkenleri temizlenmiş örnek veri x86_64 derlemesi
(widget sınıfları APK'da) emulator'da biten ve canlı maç kartı, Baskı grafiği ve
saha dengesi. Android'de görülüp düzeltilenler: fiş yıldızlarının satır
kırması, SVG'de `′` işaretinin kayması (dakika etiketleri yerel metne alındı),
notun çerçeveye taşması, canlı hapın dakika etiketlerini örtmesi.
NXT-OBS-184 (biten maçta `TEYİT BEKLENİYOR`) kayıt altında, değiştirilmedi.
