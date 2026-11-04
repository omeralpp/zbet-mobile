# Baskı grafiği düzeltmesi — TASK-0222

Durum: **teslim edildi; Android ve web sahibi tarafından kabul edildi;
TASK-0222 DONE**. Aynı temiz/pushed `e549cb0478403bb8a36146224f3973343a536e37`
kaynağından APK/web çifti canonical `COMPLETE` kontrolünü geçti.

## Teslim ve kabul

- BFF `178ca6df248c93a64da6b25a9bd2d0d54a1d38cf` DEV ortamında çalışıyor.
  Gerçek retained maç3264677 için v1 sıfır, v2 ise23 geçerli sütun üretti;
  74 gözlem ve8 native baskı aralığı aynı kaldı. Gerçek v2 yanıtı ortak
  istemci schema'sından da offline geçti. Bu ekonomik/model başarısı değildir.
- İmzalı ARM64 APK: `btb-mobile-next-arm64-pressure-e549cb0.apk`,
  50,584,645 bytes; SHA-256
  `FDBF298101CFF746B294721C45948E4D8750F4D01A2D39C0534A012A0D26367C`.
- Eş web tree: `D76F5484F65C314D00014701AF94A3B37CF16423779672A6D30A514F0F726907`;
  yayın `20261104T091348Z-e549cb0`, [owner-only web](https://app.surklase.com).
  56 beklenen asset ve receipt dahil57 dosya doğrulandı; uyuşmazlık0.
  Shell/deep-link/API-refusal ve Access koruması kontrolleri geçti.
- Sahip APK'yı kurdu: “Bu APK’yı kurdum; uygulama ve grafik sorunsuz”.
  Yayımlanan web'i de kontrol etti: “Web’de de uygulama ve grafik sorunsuz”.
  Bunlar owner smoke beyanlarıdır; cihazda hash ölçümü veya kapsamlı
  erişilebilirlik/performans testi sayılmaz.
- Rclone yerel remote ayarı eksik olduğundan upload öncesi durdu. Onaylı
  connected Drive ile mevcut özel BTB APK klasörüne teslim edildi; remote
  byte/hash ve owner-only izin doğrulandı. Yeni paylaşım/auth ayarı yapılmadı.
- İki kabul ve canonical COMPLETE sonrasında önceki E3 yerel APK'sı
  29 Ekim retention kuralıyla kaldırıldı. Kaynak, hash/config/kabul kayıtları,
  cloud dosyaları ve eski web sürümleri korunuyor.

Kalıcı kanıtlar: `btb-codex/docs/evidence/pressure-activity-v2-` önekli
`APPROVAL`, `PREPARED`, `DRIVE`, `ANDROID-INSTALLED`, `PUBLICATION`,
`OWNER-ACCEPTANCE`, `COMPLETE`, `LOCAL-APK-RETENTION` ve güncel `STATUS`
makbuzları (`2026-11-04.json`). Hazırlık/yayın anı kayıtları değiştirilmedi;
ayrı COMPLETE kaydı nihai kabulü gösterir. Sonraki devir-belgesi commit'i
yayımlanmış e549 uygulama kaynağını değiştiren bir release değildir.

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
  Hazırlık kontrollerine ek olarak temiz/pushed kaynaktan final imzalı APK,
  web export, remote byte readback ve canonical eşleşme doğrulandı.
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

## Uygulanan yayın sırası ve kapanış

1. Sahip yerel önizlemeyi kabul etti; ilgili Git, DEV BFF ve eş APK/web yayın
   kapsamlarını açıkça onayladı. Önceki SAP teslim onayından izin türetilmedi.
2. Onaylı temiz/pushed BFF restart ve v1/v2 contract smoke geçti.
3. Aynı temiz/pushed Mobile commit'inden final ARM64 APK ve web oluşturuldu;
   imza/ABI/hash kontrolleri sonrası özel teslim ve exact APK kurulumu doğrulandı.
4. Android smoke sonrasında eş web yayımlandı; sunulan byte kontrolü ve
   sahibin web smoke'u sonrası canonical COMPLETE ile batch kapandı.

Bu teknik düzeltme için açık yayın adımı kalmadı. Normal cutover veya sahibin
somut tekrarlama bildirimi asıl görevi yeniden açabilir; yeni günlük/haftalık
imza bekleme görevi oluşturulmaz. Gerçek120s cadence, kayıp capture,
phase/source/reset, gerçek süre etiketleri ve v1/v2 sınırları regression
kontrollerindedir. SAP/model/transport ve BTB öğrenme/terfi kapıları değişmedi.
