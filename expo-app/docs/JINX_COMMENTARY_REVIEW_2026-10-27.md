# Jinx karar yorumu — 27 Ekim 2026

Durum: **SUPERSEDED / OWNER_REJECTED_FOR_LENGTH_AND_LOW_VALUE / NOT_RELEASED**.
Sahibin 27 Ekim geri bildirimi üzerine üç bölümlü metin üretimi geri çekildi.
Güncel aday: [tek kısa çıkarım](JINX_COMPACT_REVIEW_2026-10-27.md).
Aşağıdaki sonuçlar önceki yerel denemenin tarihsel kanıtıdır; güncel uygulama değildir.
Sahip: BTB Mobile Next; gözlem NXT-OBS-231. Workspace: C:/dev/btb-cdoex.
Başlangıç kaynakları: Mobile `99ea433`, BFF `358801e`; iki ağaç da temizdi.
Sahip, ekran görüntüsündeki yorum eksikliğini çözmek üzere uzman sorumluluğu
verdi. Bu kapsam yerel uygulama/doğrulamadır; Git ve yayın onayı değildir.

## Bulgumuz ve uygulanan karar

Yayımlanmış kartın başlangıç paragrafı istemci şablonuydu. Gemini bağlantısı
beş cümlenin yalnızca sırasını değiştirebiliyordu. Bu görev tanımı, AI'nin
bahis yorumunu reddettiğine veya teknik olarak yapamadığına kanıt değildi.
Yeni tasarımın amacı mevcut BTB seçiminin gerekçesini ve sınırını açıklamak.

`jinx-rb1-commentary.v2` üç bölüm taşır:

- **Kararın dayanağı:** karar dakikası/pazarı, baskı aralıklarının ortak veya
  farklı yönü, destekleyen/desteklemeyen referans kayıtları ve yön çelişkisi.
- **Kanıtın sınırı:** kayıtlı yıldız tavanının en kısıtlayıcı alanları,
  tahmini ölçüm ve ters oy. Yeni eşik, puan veya güven sınıfı hesaplanmaz.
- **Skor koşulu ve sonuç:** donmuş skorun pazar için matematiksel anlamı ve
  kaydın sonuç durumu. Bu bölüm Gemini'ye aynen kopyalatılır ve birebir doğrulanır.
  Daha sonra gelen kazanç, önceki seçimin doğruluğuna gerekçe yapılmaz.

Sunucu bu yorumun anlamlı bir kurallı sürümünü hazırlar. Ekran açılışı,
aynı donmuş kayıt için önbelleklenen `FACTS` okumasını kullanır; LLM çağırmaz.
**Yorumla** eylemi, bu kaydı yeniden doğrulayıp Gemini'den kaynaklara bağlı
doğal dil ister. AI yalnız dayanak/sınır anlatımını değiştirebilir; BTB
seçimini, yıldızını, skor matematiğini veya sonuç muhasebesini değiştiremez.
AI çıktısı başarısız/geçersizse aynı kayıt açıklaması görünür kalır.

Android ve web aynı kartı, API'yi, şemayı ve kaynak eşleme yardımcısını kullanır.
Masaüstünde mevcut iki sütun; telefonda aynı bölümlerin dikey düzeni korunur.
Platforma özgü bir özellik veya sessizce atlanan yüzey yoktur.

## Sözleşme, doğrulama ve sınırlar

- Mevcut `jinx-rb1-explainer.v1` rotası/yanıtı eski APK ve web için korunur.
  Yeni istemci açıkça v2 ister; DTO'lar sessizce birbirine çevrilmez.
- Her bölüm kaynak kimlikleri ve değişmeyen `sourceText` taşır. AI yorumunun
  kaynak açıklaması **Dayanakları gör** ile açılır. Olasılık/tekillik sınırı
  her zaman sunucu/istemci metni olarak korunur.
- Anahtar karar alanlarına ek olarak yıldız, tavanlar, ters oy, ölçüm aralığı
  ve tahmini ölçüm bilgisi ile sonuç/revizyonu kapsar. Geç gelen bir yanıt
  düzeltilmiş skora, başka karara, değişmiş ölçüme veya sonuca taşınamaz.
- Yapı, bölüm sırası, kaynak kimlikleri, sayısal belirteçler ve kritik
  olumsuzluklar kontrol edilir. Ek sayı/oran, yüzde, kesinlik, bahis yönlendirmesi
  veya dış bağlam bildiren sınanan ifadeler reddedilir. Skor/sonuç cümlesi sabittir.
- Bu filtreler serbest Türkçe metnin bütün anlamını kanıtlayan bir sistem
  değildir. Destek/sınır bölümlerinde kalan anlamsal hata riski vardır;
  değişmeyen kaynak metni ve inceleme olanağı bu nedenle korunur. Üç örnek,
  genel anlamsal doğruluk, sağlayıcı erişilebilirliği veya tahmin başarısı ölçümü değildir.
- İlk gerçek denemede eski 7,45 saniyelik bütçe zaman aşımına yol açtı.
  Yalnız v2 için ortak sağlayıcı bütçesi 15 saniye; istemci süre sınırı
  SAP okuması/yanıt payıyla 22 saniye oldu. v1'in bütçesi aynı kaldı.
- Takım adları, ham provider/SAP satırları, görünmeyen bağlam, gizli ayarlar,
  prompt ve ham model yanıtı loglanmaz. Sağlayıcı/model veya API anahtarı değiştirilmedi.

## Doğrulama kanıtı

| Kontrol | Sonuç |
| --- | --- |
| Ortak istemci TypeScript/lint/brand | Başarılı |
| İstemci ve tooling | 679 + 32 test başarılı |
| Expo Doctor preview | 20/20 |
| BFF suite ve production build | Kayıtlı kalite kapısı başarılı; 13 yeni yorum testi |
| BFF → Android/web sözleşme smoke | v1 uyumluluğu, v2, FACTS, fallback ve düzeltme/sonuç bağı başarılı |
| Android JS/Hermes preview export | Başarılı; 1 taranabilir dosyada secret bulgusu yok |
| `node scripts/web.mjs export --out .../web` | Canonical edge export başarılı; 4 dosyalı secret taraması temiz |
| Gerçek Gemini, sentetik veri | Son sınamada 3/3 HTTP200 ve kabul edilmiş yorum; 3.123–3.253 ms |
| Gerçek MatchDetailView, sentetik API | 1440 px masaüstü; 390 ve 320 px telefon genişliği; yatay taşma yok |
| Etkileşim/hata | Enter, kaynak aç/kapat, kısmi baskı/ters oy, tamamlanmış sonuç, geçersiz/başarısız AI, boş/hatalı kaynak başarılı |

Gerçek sağlayıcı örnekleri: bildirilen kartın veri biçimi, kısmi baskı desteği,
skor düzeltmesi. Gerçek Gemini çağrıları ile tarayıcıdaki sentetik sağlayıcı
birbirinden ayrıdır. Canlı SAP okuması, model değişikliği, DEV BFF restart'ı,
native APK build/imza/kurulum veya yayımlanmış web smoke yapılmadı.
Fiziksel Android/TalkBack kabulü sonraki eşleşik teslimde ayrıca gerekir.

Kalıcı inceleme kanıtları: [sağlayıcı](evidence/JINX_COMMENTARY_2026-10-27/provider-evaluation.json),
[tarayıcı](evidence/JINX_COMMENTARY_2026-10-27/browser-checks.json),
[doğrulama/kaynak hash makbuzu](evidence/JINX_COMMENTARY_2026-10-27/validation-receipt.json),
[masaüstü](evidence/JINX_COMMENTARY_2026-10-27/desktop.jpg),
[telefon](evidence/JINX_COMMENTARY_2026-10-27/phone-commentary.jpg).
Çalışma çıktıları: `.codex-artifacts/jinx-commentary-20261027/`.
Yerel önizleme: `http://127.0.0.1:8097/__preview` (sentetik; dış ağ proxy'si yok).
Kapsamlı olmayan profil storage raporu 214 dosya, 77 korunan ve 17 UNKNOWN
kaydı gösterdi; silme/arşiv adayı yok. Referans tarama kapsamı kısmi; bundan
genel temizlik güvenliği çıkarılmaz. Hiçbir taşıma/silme/sıkıştırma yapılmadı.
Context audit'te bütün section/table rotaları çözülüyor; mevcut büyük
handoff/observation/OpenAPI dosyalarının boyut uyarıları ayrıca korunuyor.

## Sonraki adım

Sahibin somut önizleme/yorum incelemesi, ardından ilgili iki repo için ayrı
commit/push onayı. DEV BFF aktivasyonu ve aynı temiz/push edilmiş Mobile
commit'inden APK + web build/imza/özel teslim/yayın onayları ayrıca alınır.
APK kurulumundan sonra eş web yayımlanır; iki smoke olmadan batch kapanmaz.
Mevcut kabul edilmiş `9d87b2e` ve önceki çiftler korunur. Bu çalışma olasılık
planlarını veya A5 öğrenme/promotion kapılarını yeniden açmaz.
