# Baskı grafiği düzeltmesi — TASK-0222

Durum: **yerel uygulama ve otomatik kontroller tamamlandı; görsel kabul/yayın
bekliyor**. Çalışan BFF ve kabul edilmiş APK/web çifti değiştirilmedi.

## Davranış

Eski grafik90s süreklilik ve270–330s baseline istiyordu; normal120s gözlemler
her defasında sıfırlanıyordu. Yeni opt-in `observed-window.v2`, mevcut kanıtları
kullanır ve gerçek240–360s ölçüm aralığını bildirir. İlk4dakikalık pencere
3gözlemle oluşur; hedef5dakikaya eşit uzaklıktaki4/6dakika seçeneklerinde6dakika
seçilir. Değerler gerçek süreye bölünmüş tahmini dakika başı hareketliliktir.

Android ve web aynı adapter, schema ve bileşenleri kullanır. Özet ve seçilen
sütun “son ölçülen aralık” der; gerçek süreyi gösterir. Eski5dakika iddiaları
özet, seçim kartı ve grafik yardımından kaldırıldı. Ekran okuyucu metni de
dakika başı birimleri söyler. İstemci v2 yanıtını doğrular ve önbellek anahtarını
sürüme göre ayırır; sessiz v1 ikamesi kabul edilmez.

## Korunan koşullar

| Koşul | Beklenen sonuç |
| --- | --- |
| Düzenli120s | İlk240s/count3, sonra gerçek360s/count4 pencereler |
|150s sınırı | Kabul;150.001s bağlantıyı keser |
| Bir120s gözlemin kaybı |240s boşluk sonrası yeni pencere gerekir |
| Kaynak/devre değişimi, sayaç veya skor düzeltmesi | Eski pencere/bağlantı kullanılmaz |
| Eksik sayaç, bozuk hash/timing, kanıtlanmamış sessizlik | Değer null; sıfır üretilmez |
| Tekrarlanan maç dakikası | Tüm receipt'ler sayılır; son geçersiz ölçüm eski sütunu diriltemez |
| Koherent gol artışı | Tek başına hareketlilik geçmişini bozmaz |
| Eski/v1 istemci veya header yok | Önceki sözleşme ve native seri korunur |

Native baskı, yıldız, model, bahis seçimi ve acquisition sıklığı değişmedi.
Eksik dakika/sütunlar üretilmedi; native baskıya gizli fallback eklenmedi.

## Doğrulama

- BFF tam suite713/713 ve yerel production CAP build geçti.
- Ortak istemci typecheck/lint,797/797 test,33/33 tooling ve brand kontrolü geçti.
- Expo Doctor20/20 geçti.
- Android preview bundle ve doğrulanmış edge web export geçti; secret scan0.
  Bunlar dirty yerel adayın doğrulama çıktılarıdır; imzalı/yayınlanmış çift değildir.
- Üretim BFF builder'ından üretilmiş, açıkça sentetik120s fixture ortak
  Android/web validator'ında6sütun üretir. Gerçek maç/ekonomik kanıt değildir.
- Kesinti, boş ve normal akış için yerel gerçek-app önizlemesi hazırdır.
  Bilgisayar kullanımı, Windows tarayıcı URL'sini güvenilir doğrulayamadığı
  için durdu; görsel smoke **gözlenmedi**, başarılı sayılmadı.

Önizleme (yalnız yerel ve sentetik):
[390px normal](http://127.0.0.1:8098/__preview?case=ready120s&width=390),
[320px normal](http://127.0.0.1:8098/__preview?case=ready120s&width=320),
[masaüstü](http://127.0.0.1:8098/__preview?case=ready120s&width=1440),
[kesinti](http://127.0.0.1:8098/__preview?case=gap&width=390),
[boş](http://127.0.0.1:8098/__preview?case=empty&width=390).

Yerel kanıtlar `expo-app/.codex-artifacts/pressure-activity-20261104/` ve
`zbet-cap/.codex-artifacts/pressure-activity-20261104/` içindedir. İlk type/lint
hataları yeni test/generator kapsamındaydı; düzeltildi ve son tam kontrol geçti.

## Yayın sırası ve kalan iş

1. Yerel görsel kontrol/kabul ve ilgili repo commit/push onayı.
2. Onaylı temiz/pushed BFF kaynağını restart; aynı kaynak kimlikleri/web root
   korunarak v1/v2 contract smoke. SAP/model/transport değişikliği yok.
3. Aynı temiz/pushed Mobile commit'inden eşleşen ARM64 APK ve web çıktısı;
   ayrı onay kapsamında build/sign/private delivery.
4. APK kurulumu ve Android smoke doğrulanınca eş web yayınlanır; web smoke ile
   batch kapanır. Önceki kabul edilmiş çift korunur.

AGENTS.md Git ve koordineli istemci yayın onaylarını ayrıca ister. Önceki
READ/MODEL teslim onayı grafik/istemci yayınını açıkça kapsamıyordu. Bu rapor
ve yerel test sonucu kendi kendine yayın izni vermez; TASK-0222 henüz DONE değil.
