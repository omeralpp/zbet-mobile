# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-07-29
Çalışma alanı: `C:\dev\btb-cdoex`
Aktif yapı: `BTB Codex Tool - Aktif`

## Başlangıç kuralı

Eski arızalı task'ı fork etme veya geçmişini yükleme. Yeni task önce yalnız:

1. `C:\dev\btb-cdoex\AGENTS.md`
2. bu dosya

okunduktan sonra hedef dosyalara geçmelidir. `node_modules`, Cordova
`platforms`, Expo native staging klasörleri ve eski arşivler geniş taranmaz.
Kullanıcıya ait değişiklikler stash/revert edilmez.

## Mevcut hedef ve sınır

Mobile Next, Cordova'nın yanında `com.btb.mobile.next` paketiyle pilot
çalışmaktadır. BTB/Toto model ağırlıkları, star kararları ve öğrenme davranışı
bu task'ın kapsamı değildir.

Aktif akış:

```text
Expo Mobile Next
  -> SAP Identity Service public client / Authorization Code + PKCE
  -> https://api.surklase.com
  -> Cloudflare Tunnel
  -> 127.0.0.1:4004 Mobile BFF
  -> sabit read-only SAP OData allowlist
```

## Repo durumu

### zbet-mobile

```text
Repo     : C:\dev\btb-cdoex\zbet-mobile
Branch   : master
Upstream : origin/master
Baseline : da8ba84 Tie mobile shell controls to mascot menu
```

Beklenen kapsam: kök `.gitignore`, `README.md` ve yeni `expo-app/`. Expo
klasörünün içinde ayrı Git deposu yoktur. Commit/push bilgisi bu task
tamamlanırken aşağıdaki sonuç bölümüne yazılmalıdır.

### zbet-cap

```text
Repo     : C:\dev\btb-cdoex\zbet-cap
Branch   : main
Upstream : origin/main
Baseline : 2a0e2ea Preserve zero-valued daily Super KPIs
```

Beklenen kapsam:

- güvenli Mobile BFF ve testleri;
- Identity Service/MTA yapılandırması;
- Firebase provisioning/rotation betikleri;
- loopback runtime başlangıç betiği;
- FCM log redaction;
- eski izlenen `firebase-key.json` dosyasının silinmesi ve ignore edilmesi.

## Tamamlanan uygulama ve BFF

Native yüzeyler:

- dashboard, canlı maçlar, maç detayı, Super geçmişi;
- Toto program listesi ve detayı;
- HTTPS-kısıtlı tam ekran Fiori fallback;
- Android back/deep-link davranışı;
- headless FCM veri mesajı ve görünür bildirim;
- Son Super ve Performans widget'ları;
- ortak sürüklenebilir maskot menüsü.

Sabit BFF sözleşmesi:

```text
GET  /v1/dashboard
GET  /v1/btb/matches
GET  /v1/btb/matches/{key}
GET  /v1/super/logs
GET  /v1/toto/programs
GET  /v1/toto/programs/{gcNo}/{version}
POST /v1/devices
```

BFF serbest OData path/query/destination kabul etmez. SAP response'larını
bounded DTO'lara dönüştürür, timeout/correlation uygular, hassas hata ve
credential loglamaz. Cihaz kayıtları repo dışında AES-256-GCM ile şifrelenir.

Canlı SAP `$metadata` kontrolünde provider'ın kullandığı 83 alanın tamamı
bulundu. Main, Super, Toto, dashboard ve iki maç detayı varyantı Mobile Zod
contract'larından geçti.

## Kimlik, Firebase ve Cloudflare

Identity:

- servis: `btb-mobile-identity`;
- public native client, PKCE S256 ve refresh token;
- redirect: `https://api.surklase.com/auth/callback`;
- user token kabul edilir, client-credentials token reddedilir;
- APK'da client secret yoktur.

Firebase:

- `com.btb.mobile.next` Android client oluşturuldu;
- client config repo dışında
  `%LOCALAPPDATA%\BTB Mobile Next\google-services.json`;
- eski izlenen service-account anahtarı provider tarafında revoke edildi;
- yeni anahtar FCM `validate_only` ile doğrulandı;
- Windows User ve Cloud Foundry secret değerleri aynı yeni anahtara bağlandı;
- yeni/özel anahtarlar repo ve loglara yazılmadı.

Cloudflare:

```text
Tunnel : surklase-local-wordpress
ID     : f129a5fe-96d9-47a2-948d-38fa3acbd2b1
Config : version 3
Route  : api.surklase.com -> http://localhost:4004
DNS    : proxied CNAME -> <tunnel-id>.cfargotunnel.com
```

Mevcut `surklase.com` ve `www.surklase.com -> localhost:8080` rotaları
korundu. Dış doğrulama:

- `/.well-known/assetlinks.json` → 200;
- `/auth/callback` → 200;
- `/v1/dashboard` tokensız → 401;
- response server → Cloudflare.

## Yerel runtime

- BFF yalnız `127.0.0.1:4004` dinler.
- Desteklenen taşınabilir Node.js 24.18.0 LTS kullanılır.
- Başlangıç betiği:
  `C:\dev\btb-cdoex\zbet-cap\scripts\start-mobile-bff.ps1`
- Yönetici gerektiren Scheduled Task reddedildiği için kullanıcı kapsamındaki
  `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\BTBMobileBFF` kaydı
  kullanılır.
- Runtime secret'ları Windows User environment'tan okunur; komut satırına veya
  Git'e yazılmaz.

## Doğrulamalar

```text
zbet-cap:
  tests        33/33
  ESLint       passed
  cds build    passed
  diff check   passed

Mobile:
  tests        27/27
  TypeScript   passed
  ESLint       passed
  Expo Doctor  20/20
  Android JS production bundle passed
  arm64 debug native build passed
  arm64 standalone pilot-release build passed
```

`npm audit --omit=dev` sonucu `0 high`, `0 critical`, `11 moderate` oldu. Kalan
bulgular Expo CLI/config/prebuild zincirindeki transitif `uuid` advisory'sine
bağlıdır; uyumsuz major downgrade öneren otomatik `audit fix --force`
uygulanmadı.

Pilot APK:

```text
C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\
  btb-mobile-next-arm64-pilot.apk
```

APK `com.btb.mobile.next` paketidir, release JS bundle'ı içerir, mock kapalıdır,
gerçek API/IAS endpointlerini taşır ve mevcut pilot debug sertifikasıyla
imzalıdır.

```text
Boyut   : 48,456,695 bytes
SHA-256 : F136284E7453C46741B5AEECCD5F586CB5910C504A1F478A62A11AF2C7882470
```

## Açık zorunlu kapılar

1. SAP GUI scripting kapalı olduğu için ayrı least-privilege teknik kullanıcı
   otomatik oluşturulamadı. Pilot BFF geçici olarak mevcut SAP yönetici hesabını
   yalnız sabit read-only allowlist arkasında kullanır. Cordova cutover öncesi
   `ZBET_CDS_005_CDS`, `ZBET_UI_SUPER_LOG_SB` ve `ZBET_SB_TOTO_UI` ile sınırlı
   communication user zorunludur.
2. Fiziksel Android cihaz bağlı değildi. OAuth giriş/refresh, canlı veri,
   notification, widget, App Link, deep-link, Fiori, geri tuşu, offline ve host
   restart testleri cihazda yapılmalıdır.
3. Pilot APK debug sertifikalıdır. Store/production release signing anahtarı
   seçilmeli, yedeklenmeli ve kurtarma sahipliği belirlenmelidir.
4. Cordova'nın kaldırılması/devre dışı bırakılması için destek ve rollback
   runbook'u ile gerçek cihaz parity kanıtı eksiktir.
5. Cloud Foundry'deki mevcut ABAP FCM çağrısı authentication header göndermiyor.
   Yeni CAP paketini IAS ile BTP'ye deploy etmek bildirimleri keser; caller auth
   geçişi tasarlanmadan bu deploy yapılmamalıdır. Mevcut uygulama dönen Firebase
   anahtarıyla çalışmaya devam eder.

Bu kapılar nedeniyle Cordova cutover yapılmaz ve mevcut Cordova kaynakları
silinmez.

## Sonuç ve sonraki adım

Task kapanırken şu alanları güncelle:

- zbet-mobile commit/push SHA;
- zbet-cap commit/push SHA;
- dış API son smoke sonucu;
- bağlı cihaz varsa gerçek cihaz sonuçları;
- yapılmayan BTP deploy/cutover gerekçesi.

Bir sonraki güvenli adım: SAP'ta ayrı communication user/role oluşturmak,
runtime secret'ını değiştirmek ve fiziksel cihaz pilotunu yürütmektir.
