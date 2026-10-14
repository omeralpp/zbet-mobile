# A3 baskı modeli — DEV pilot APK teslimatı

Yeni baskı modeli `BTB_PPV1_20261014` SAP DEV'de aktiftir. Seçim A3 sonucunu
kullanır: Alt/KG Yok son baskı ağırlığı +0,85; yıldız eşikleri 34/23/17/10.
Diğer ağırlıklar korunmuştur. Yeni model kimliği eski kayıtların boş model
etiketlerinden ayrılır; tarihsel kayıtlar yeniden etiketlenmedi.

Gerçek kabul ve ileriye dönük toplama başlangıcı **14 Ekim 2026 17:43:17.997132
Türkiye saati** (`2026-10-14T14:43:17.997132Z`). Önceki kontroller yeni sonuç
örneklemine alınmaz.

## İndirilecek APK

[Özel Google Drive APK bağlantısı](https://drive.google.com/file/d/1Y_zmtI3AyXHhHc7s4vI8o6uJrvt7pn8S/view?usp=drivesdk)

- Dosya `btb-mobile-next-arm64-pressure-path-a3.apk`: 54.424.765 bayt.
- SHA-256 `1168EA805A14870AC707204A63F4F1B38316D0CFE038C879D739266E9F828117`.
- Paket `com.btb.mobile.next`; yalnız ARM64; mevcut pilot sertifikası ve APK V2
  imzası doğrulandı. Sertifika SHA-256
  `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
- Mevcut özel klasör, yalnız dosya sahibi erişimi (`shared=false`). Kimlik
  doğrulamalı indirmede boyut ve SHA-256 birebir eşleşti.
- API `https://api.surklase.com`, pilot erişim, mocks kapalı; Maçın Yolu,
  Takım Formu ve Jinx LIVE ayarları paket içinden okundu.

## Mobildeki davranış

Yakın aralık baskısı dakikaya bölünür; en sık görülen ulaşılabilir skorların
tamamına göre yönü gösterilir. Lider skor gerçekleşmişse ek hücum baskısı bu
skoru korumaya karşıdır. Çelişen yönler veya doğrulanmamış devre referansı kesin
yön üretmez. Baskı eksikse eski toplam baskıya dönülmez. Ana ekran sıralaması
da V3 aralığını kullanır; eski toplam baskının ana ekrana sızması düzeltildi.

Takım baskısı, aynı devre/skor/kart durumunda en fazla 240 saniye arayla alınan
iki kaydın farkından hesaplanır: `(3,1 × isabetli şut artışı + 0,45 × toplam
şut artışı + 0,30 × korner artışı + varsa 7,2 × xG artışı) / geçen dakika`.
xG ancak iki kayıtta da kapsamı doğrulanmışsa eklenir. İlerlemeyen veya güvenilir
eşleşmeyen sayaçlar ölçülmüş sıfır kabul edilmez.

Yeni cutover etiketi, kayıtlı/güncel seçim ayrımı ve olay ikonları görünür.
Tarihsel Super kendi kararına bağlanır; sonraki hesaplama kimliğiyle karışmaz.
Parmakla grafik gezinme, grupları ayrı seçme, dakika/kaynak ayrımı ve 48dp
hedefler önceki doğrulanmış UX iyileştirmeleriyle birlikte pakettedir.

## Doğrulama ve sınırlar

612 Mobile +13 araç testi, type/lint/brand; 581 BFF testi ve CAP derlemesi geçti.
Değişmeyen bağımlılık/native girdiler için Doctor 20/20 ve önceki sekiz Android
jest kontrolü kullanıldı. Yeni Android API35 önizlemesinde gerçek Latina kaydı,
cutover etiketi, kayıtlı seçim ve sekiz baskı işareti görüldü; dikey sayfa
kaydırması çalıştı. Bu, fiziksel telefon/TalkBack kabulü değildir.

Dokuz gerçek dış API okuması Mobile şemalarından geçti: V1/V2/V3, yeni/legacy
Super, yeni Super'ın mevcut baskısı ve 41 yol kaydındaki sekiz baskı aralığı.
355 dondurulmuş APK girdisi derleme sonunda aynıydı. Paket içi V3/model
işaretleri, ABI, ayarlar ve kaynak/log/APK sunucu sırrı taraması geçti.

SAP'te 77 değişen model testi, on şema nesnesinin tam kaynak/alan doğrulaması,
sıfır yeni P1; 58 gözlem/12 geçerli baskı, 10 karar/680 eşleşen dal ve 14 temiz
çevrimle DEV kabulü kaydedildi. Backend `score-pressure-v2/` altındaki DEV planı
ve iki kabul makbuzu kaynak kanıtıdır. Doğrudan ADT/OData okumaları MCP değildir.

Mevcut pilot BFF aynı rota/erişim ayarlarıyla PID 20712'de başlatıldı. Manifest
ham SHA-256 `52208004EBECCCF285F7479B42045A9C9F70A44CA4D55B44956445663817C758`.
Yerel kanıtlar `.codex-artifacts/pressure-selection-2026-10-14/` altında.
Önceki SHA `7D209632…3605B6` APK ve TASK-0121 kabul edilmiş sürümü korunur.

Sağlayıcı zamanı/oran-skor ilişkisi hâlâ bilinmiyor; baskı gözlenen sayaçlardan
bir tahmindir. Ekonomik başarı/production kabulü çıkarılmadı. Fiziksel kurulum,
sürekli sürükleme/TalkBack ve ileri tarihli sonuç örneklemi kalan kapılardır.
Sahip ana dal stage/commit/push işlemini ve M3 resmî kapanışını açıkça onayladı.
