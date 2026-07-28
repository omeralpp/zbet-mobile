# BTB Mobile Next Architecture

## Active pilot boundary (2026-07-29)

```text
BTB Mobile Next
  -> SAP Identity Service (public PKCE client)
  -> https://api.surklase.com
  -> Cloudflare Tunnel
  -> 127.0.0.1:4004 Mobile BFF
  -> fixed read-only SAP OData allowlist
```

The BFF validates Identity user tokens, exposes only fixed `/v1` routes,
bounds upstream reads, maps SAP responses into mobile DTOs, encrypts the local
device registry, and keeps all SAP/Firebase credentials server-side. The
public App Link association is pinned to `com.btb.mobile.next` and the current
pilot certificate.

The pilot origin currently uses the existing SAP administrator credential
behind the BFF allowlist because SAP GUI scripting is disabled. This is a
temporary pilot exception, not a production or Cordova-cutover approval. A
dedicated communication user restricted to the three named OData services is
still mandatory.

## Hedef akış

```text
Expo native client
  -> OAuth 2.0 Authorization Code + PKCE
  -> Mobile BFF (/v1)
  -> BTP destination / SAP connectivity
  -> BTB V2 + Super/Toto V4 OData services
```

Mobil istemci SAP hostu, destination credential veya client secret bilmez. BFF:

- access tokenı ve rol kapsamını doğrular;
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

1. Uygulama public native OAuth client olarak kaydedilir.
2. Redirect URI `btbmobile://auth` olarak allowlist'e eklenir.
3. Giriş Authorization Code + PKCE ile yapılır; implicit flow ve client secret
   kullanılmaz.
4. Tokenlar `expo-secure-store` içinde saklanır ve süresi yaklaşınca refresh
   tokenla yenilenir.
5. BFF minimum `mobile.read`; cihaz kaydı için ayrı `mobile.device.write`
   kapsamını doğrular.
6. BFF yalnız izinli SAP entity/alanlarını okur. İstemciden serbest OData path,
   `$filter` veya destination adı kabul etmez.
7. Loglarda access/refresh token, SAP credential ve ham bildirim tokenı
   yazdırılmaz.

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

## Cloudflare domain üzerinden BTP bağımsızlaşma adayı

Bu hedef henüz aktif runtime sözleşmesi değildir. Önerilen sınır:

```text
BTB Mobile
  -> api.<owned-domain> (TLS, WAF, rate limit)
  -> private Cloudflare Tunnel
  -> Mobile BFF
  -> izinli SAP OData servisleri
```

Domain veya Tunnel, BFF güvenlik katmanının yerine geçmez. Mobil paket SAP
credential, Cloudflare service token veya Firebase service-account anahtarı
taşımaz. Authorization Code + PKCE korunur; BFF token scope doğrular, sabit
`/v1` DTO sözleşmesini uygular ve yalnız allowlist SAP operasyonlarına gider.
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

Preview Firebase client, gerçek cihaz development build'i, OAuth, token refresh,
bildirim routing, offline/retry ve performans ölçülür. Cordova hâlâ rollback
yoludur.

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

- Gerçek mobil BFF ve SAP DTO mapping'i henüz uygulanmadı.
- Native OAuth client, redirect URI, scope/role koleksiyonu ve BFF token
  doğrulaması henüz identity provider üzerinde kurulmadı.
- `zbet-cap` şu anda `auth: mocked` kullanıyor; bu ayarla mobil production
  trafiği kabul edemez.
- `zbet-cap/firebase-key.json` Git tarafından izleniyor. İçindeki
  service-account credential üretim pilotundan önce sağlayıcı tarafında
  rotate/revoke edilmeli, repodan çıkarılmalı ve secret binding/vault'a
  taşınmalı. Bu işlem yalnız dosyayı silmekle tamamlanmış sayılmaz.
- Yeni Android package `com.btb.mobile.next` için ayrı preview Firebase client
  gerekir. Eski Cordova `google-services.json` dosyası yeni pakete
  kopyalanmaz.
- Mevcut `npm audit --omit=dev` bulguları Expo CLI/config zincirindeki
  transitive `uuid` advisory'sine bağlıdır. Önerilen otomatik düzeltme Expo'yu
  uyumsuz eski major sürüme düşürdüğü için uygulanmaz; Expo SDK güncellemesiyle
  izlenir ve release öncesi yeniden değerlendirilir.
