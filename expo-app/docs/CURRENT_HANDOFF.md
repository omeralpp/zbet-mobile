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
  -> X-BTB-Pilot-Key (direct open; no user login)
  -> https://api.surklase.com
  -> Cloudflare Tunnel
  -> 127.0.0.1:4004 Mobile BFF
  -> server-side SAP developer technical user
  -> sabit read-only SAP OData allowlist
```

## Repo durumu

### zbet-mobile

```text
Repo     : C:\dev\btb-cdoex\zbet-mobile
Branch   : master
Upstream : origin/master
Baseline : da8ba84 Tie mobile shell controls to mascot menu
Code     : 5609958 Add BTB Mobile Next pilot app
Current  : e12fe2e Open Mobile pilot without interactive login
```

Kök `.gitignore`, `README.md` ve yeni `expo-app/` commit edildi. Expo klasörünün
içinde ayrı Git deposu yoktur.

### zbet-cap

```text
Repo     : C:\dev\btb-cdoex\zbet-cap
Branch   : main
Upstream : origin/main
Baseline : 2a0e2ea Preserve zero-valued daily Super KPIs
Runtime  : 79a239b Add secure Mobile BFF runtime
Current  : 255a9a0 Add direct-open Mobile pilot access
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

## Erişim, Firebase ve Cloudflare

Direct-open pilot:

- uygulama IAS/BTP giriş ekranı göstermeden doğrudan açılır;
- her `/v1` isteği rotatable `X-BTB-Pilot-Key` taşır;
- BFF yalnız anahtarın SHA-256 özetini Windows User environment'ta tutar;
- eksik/yanlış anahtar `401`, doğru anahtar sabit read-only rotalarda `200`;
- SAP `developer` kullanıcı adı/parolası yalnız BFF runtime'ındadır;
- APK'da SAP parolası, Identity client secret veya Firebase service-account
  anahtarı yoktur;
- OAuth/PKCE fallback kaynakta korunur ancak direct-open pilot APK'da Identity
  endpointi ve OAuth App Link intent filter'ı paketlenmez.

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
- `/auth/callback` readiness → 200;
- geçerli callback → 302 `btbmobile://auth`;
- eksik veya beklenmeyen issuer callback → 400;
- `/v1/dashboard` anahtarsız/yanlış anahtarla → 401;
- `/v1/dashboard`, BTB, Super ve Toto doğru pilot anahtarıyla → 200;
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
  tests        37/37
  ESLint       passed
  cds build    passed
  npm audit    0 vulnerabilities
  MTA build    previous baseline passed; current mbt CLI unavailable
  diff check   passed

Mobile:
  tests        35/35
  TypeScript   passed
  ESLint       passed
  Expo Doctor  20/20
  Android JS production bundle passed
  arm64 debug native build passed
  arm64 standalone pilot-release build passed
  Android 15 x86_64 emulator build/install passed
  OAuth App Link absent from direct-open APK
  IAS endpoint absent from direct-open APK
  direct-open live dashboard and SAP data passed
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
gerçek API ve rotatable pilot erişimini taşır, IAS endpointi taşımaz ve mevcut
pilot debug sertifikasıyla imzalıdır.

```text
Boyut   : 48,460,415 bytes
SHA-256 : 8D51B2020384AA08A85CCF4D0AB0B47873DB7A08029B9A0DEE1511CF3B5E75D4
```

## Açık zorunlu kapılar

1. SAP GUI scripting kapalı olduğu için ayrı least-privilege teknik kullanıcı
   otomatik oluşturulamadı. Pilot BFF geçici olarak mevcut `developer`
   hesabını teknik kullanıcı olarak yalnız sabit read-only allowlist arkasında
   kullanır. Cordova cutover öncesi
   `ZBET_CDS_005_CDS`, `ZBET_UI_SUPER_LOG_SB` ve `ZBET_SB_TOTO_UI` ile sınırlı
   communication user zorunludur.
2. Android 15 emülatörde direct-open kurulum ve canlı dashboard/SAP verisi
   doğrulandı. Fiziksel cihaz ADB'ye bağlı olmadığı için notification, widget,
   Fiori, geri tuşu, offline ve host restart testleri final APK ile cihazda
   tamamlanmalıdır.
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

Kaynak commitleri:

```text
zbet-mobile : e12fe2e7f9959ac31434ea13612eac299e63d745
zbet-cap    : 255a9a0a50547a9ad09fb517ee3cc2c88ef44e2a
```

Dış API anahtar kapısı ve emülatör direct-open canlı veri smoke geçti. BTP
deploy ve Cordova cutover yukarıdaki güvenlik/parity kapıları nedeniyle
yapılmadı.

Bir sonraki güvenli adım: yeni APK'yı fiziksel cihazda doğrulamak, SAP'ta ayrı
communication user/role oluşturmak ve pilot anahtarını düzenli döndürmektir.
