# BTB Mobile Next Architecture

## Active pilot boundary (2026-07-29)

```text
BTB Mobile Next
  -> X-BTB-Pilot-Key
  -> https://api.surklase.com
  -> private Cloudflare Tunnel
  -> 127.0.0.1:4004 Mobile BFF
  -> server-side SAP developer technical user
  -> fixed read-only SAP OData allowlist
```

The BFF validates the direct-open pilot key by SHA-256 digest, exposes only
fixed `/v1` routes, bounds upstream reads, maps SAP responses into mobile DTOs,
encrypts the local device registry, and keeps all SAP/Firebase credentials
server-side.

The pilot origin currently uses the existing SAP `developer` credential
behind the BFF allowlist because SAP GUI scripting is disabled. This is a
temporary pilot exception, not a production or Cordova-cutover approval. A
dedicated communication user restricted to the three named OData services is
still mandatory.

## Hedef akış

```text
Expo native client
  -> rotatable pilot access key
  -> Mobile BFF (/v1)
  -> server-side SAP technical user
  -> BTB V2 + Super/Toto V4 OData services
```

Mobil istemci SAP hostu, destination credential veya client secret bilmez. BFF:

- pilot anahtarının SHA-256 özetini sabit zamanlı karşılaştırır;
- SAP servislerindeki farklı V2/V4 adlarını stabil `/v1` DTO'larına dönüştürür;
- bounded pagination, timeout, hata kodu ve audit correlation uygular;
- cihaz push tokenını kullanıcı ve platformla ilişkilendirir;
- hiçbir model ağırlığı, star kararı veya Toto tahmini üretmez.

Mevcut `zbet-cap` FCM köprüsü küçük ve `auth: mocked` durumundadır. Üretim mobil
BFF sorumluluğu, güvenli kimlik doğrulama ve SAP destination erişimi netleşmeden
bu servise örtük biçimde yüklenmemelidir.

## Kaynak sınırları

| Mobil yüzey | Kaynak anlamı | Yasak karışım |
| --- | --- | --- |
| BTB canlı maç | `zbet_t_matches` güncel maç/Super durumu ve bağlı canlı veriler | Tarihsel Super satırını güncel durum gibi göstermek |
| Super geçmişi | `zbet_t_super_log` tarihsel kararlar | Super ROI/star bilgisini Toto öğrenme sinyali yapmak |
| Maç oranı | güncel `zbet_t_live_rate`; kapalı/stale market BFF'te güncelmiş gibi sunulmaz | Birden fazla seçili oranla maç satırını çoğaltmak |
| Skor dağılımı | `zbet_t_score` görünür sonuç/olasılık satırları | Görünmez veya geçersiz dağılımı karar kanıtı göstermek |
| Toto programı | `zbet_t_toto_*` program, prediction, coupon ve result yaşam döngüsü | BTB/Super kârlılığını Toto performansı saymak |

Alan dönüştürme SAP entity ve property adlarını istemciye sızdırmaz. BFF
uygulaması başlamadan önce gerçek `$metadata` ile ayrı bir mapping belgesi ve
contract testi hazırlanmalıdır.

## Güvenlik modeli

1. Aktif pilot APK doğrudan açılır; IAS/BTP kullanıcı ekranı göstermez.
2. APK rastgele pilot anahtarını `X-BTB-Pilot-Key` başlığıyla gönderir. BFF
   yalnız SHA-256 özetini tutar ve karşılaştırmayı sabit zamanlı yapar.
3. Pilot anahtarı APK'dan çıkarılabilir; bu nedenle üretim kimliği sayılmaz,
   periyodik döndürülür ve yalnız fixed read-only yüzeyi açar.
4. SAP `developer` kullanıcı adı/parolası yalnız BFF runtime environment'ındadır
   ve mobil yanıt/log/APK içine girmez.
5. BFF yalnız izinli SAP entity/alanlarını okur. İstemciden serbest OData path,
   `$filter` veya destination adı kabul etmez.
6. Loglarda pilot anahtarı, SAP credential ve ham bildirim tokenı
   yazdırılmaz.
7. OAuth/PKCE kodu fallback olarak korunur fakat direct-open pilot build'inde
   Identity endpointleri veya App Link intent filter'ları paketlenmez.

## Geçiş fazları

### Faz 0 — Native preview

Tamamlanma ölçütü: mock veriyle tüm native navigasyon, detay ekranları,
deep-link eşlemesi, schema doğrulaması, testler ve Android bundle geçer.

Android geçiş yüzeyleri:

- Uygulamaya özel Expo local module, iki `AppWidgetProvider` üzerinden Son
  Super ve Performans widget'larını yönetir.
- Headless bildirim görevi yüksek öncelikli FCM veri mesajını doğrular, widget
  snapshot'ını günceller ve ilgili Android kanalında görünür bildirimi üretir.
- Widget ve bildirim dokunuşları tek Expo Router deep-link sözleşmesine gider.
- Fiori fallback sayfaları yalnız HTTPS kaynağını uygulama içi WebView'da
  açar; desteklenmeyen harici hedefler sistem tarayıcısına devredilir.
- Tek native maskot katmanı hem React Native hem WebView üzerinde yaşar.
  Fiori sayfası aktifken sayfa geri/yenile/harici tarayıcı eylemlerini
  kaydeder; böylece ayrı bir kalıcı tarayıcı araç çubuğu gerekmez.

## Cloudflare domain üzerinden aktif pilot

```text
BTB Mobile
  -> api.surklase.com (TLS)
  -> private Cloudflare Tunnel
  -> Mobile BFF
  -> izinli SAP OData servisleri
```

Domain veya Tunnel, BFF güvenlik katmanının yerine geçmez. Mobil paket SAP
credential, Cloudflare service token veya Firebase service-account anahtarı
taşımaz. BFF pilot anahtarı özetini doğrular, sabit `/v1` DTO sözleşmesini
uygular ve yalnız allowlist SAP operasyonlarına gider.
FCM köprüsü aynı özel origin üzerinde ayrı yetkili bir servis olabilir.

BTP bağımlılığı ancak üç ayrı yüzey taşındığında tamamen biter:

1. mobil BFF/runtime,
2. FCM gönderim servisi ve secret binding,
3. Fiori/UI5 statik hosting, kimlik ve rol/shell karşılığı.

İlk iki yüzey kendi origin + Tunnel yapısına alınsa bile Work Zone/Fiori
Launchpad kullanılmaya devam ettiği sürece uygulamanın Fiori fallback'i BTP
bağımlılığı taşımaya devam eder.

### Faz 1 — Read-only BFF

Dashboard, BTB, Super ve Toto GET endpointleri gerçek SAP verisine bağlanır.
DTO contract testleri ve aynı kayıt için Fiori/native parity kontrolü gerekir.

### Faz 2 — Pilot

Preview Firebase client, gerçek cihaz development build'i, direct-open pilot
anahtarı, bildirim routing, offline/retry ve performans ölçülür. Cordova hâlâ
rollback yoludur.

### Faz 3 — Kontrollü native aksiyonlar

Yalnız iş sözleşmesi, yetki, idempotency ve audit kanıtı olan işlemler native'e
alınır. Model sonucu etkileyen her BTB/Toto aksiyonu kendi operasyonel thread
onay ve preflight sürecinde ele alınır.

### Faz 4 — Cutover

Cordova ancak pilot metrikleri, cihaz dağıtımı, bildirim parity'si, destek
runbook'u ve rollback planı doğrulandıktan sonra emekliye ayrılır.

## Kalite kapıları

- TypeScript strict typecheck.
- ESLint.
- Notification/deep-link unit testleri.
- Expo dependency/config doctor.
- Android production-style JS export.
- Development build compile ve gerçek cihaz smoke testi.
- BFF schema/authorization/timeout testleri.
- Fiori/native örnek kayıt parity testi.
- Secret taraması ve Firebase service-account anahtarı temizliği.

## Üretim öncesi blokajlar

- Direct-open pilot anahtarı uygulama paketinden çıkarılabilir; üretim öncesi
  cihaz attestation veya kullanıcı/cihaz kimliğiyle değiştirilmelidir.
- Geçici SAP `developer` hesabı yerine üç OData servisiyle sınırlı ayrı
  communication user oluşturulmalıdır.
- Store signing, fiziksel cihaz parity, destek ve rollback kapıları eksiktir.
- Mevcut `npm audit --omit=dev` bulguları Expo CLI/config zincirindeki
  transitive `uuid` advisory'sine bağlıdır. Önerilen otomatik düzeltme Expo'yu
  uyumsuz eski major sürüme düşürdüğü için uygulanmaz; Expo SDK güncellemesiyle
  izlenir ve release öncesi yeniden değerlendirilir.
