# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-07-29
Çalışma alanı: `C:\dev\btb-cdoex`
Aktif task: `BTB Mobile Next - Aktif`
Optimizer profili: `btb-mobile`

## Başlangıç ve sınır

Yeni veya devam eden Mobile Next task’ı önce yalnızca:

1. `C:\dev\btb-cdoex\AGENTS.md`
2. bu dosya

dosyalarını tamamen okur. Sonra yalnız aktif alt görev için gereken README,
architecture, OpenAPI, SAP mapping, Firebase, Android veya cutover belgesine
geçer. Eski task geçmişi fork edilmez; `node_modules`, Cordova `platforms`,
Expo native staging klasörleri ve arşivler geniş taranmaz. Kullanıcı
değişiklikleri stash/revert edilmez.

Bu task Expo/Android istemcisini, Mobile BFF’i, Firebase/device delivery’yi,
Cloudflare origin rotasını, APK yaşam döngüsünü ve kontrollü Cordova geçişini
takip eder. BTB/Toto model ağırlığı, star, tahmin, kupon, sonuç veya öğrenme
kararı üretmez.

## Aktif pilot akışı

```text
BTB Mobile Next
  -> X-BTB-Pilot-Key (direct open; user login yok)
  -> https://api.surklase.com
  -> Cloudflare Tunnel
  -> 127.0.0.1:4004 Mobile BFF
  -> server-side SAP developer technical user
  -> fixed read-only SAP OData allowlist
```

Pilot anahtarı APK’dan çıkarılabilir; üretim kimliği değildir. BFF yalnız
SHA-256 özetini tutar. SAP/Firebase credential, signing material ve secret
değerleri kaynakta, logda, handoff’ta veya APK notunda tutulmaz.

## Repo checkpoint

### zbet-mobile

```text
Path     : C:\dev\btb-cdoex\zbet-mobile
Branch   : master
Upstream : origin/master
HEAD     : 6147a46 Record direct-open Mobile pilot handoff
```

### zbet-cap

```text
Path     : C:\dev\btb-cdoex\zbet-cap
Branch   : main
Upstream : origin/main
HEAD     : 255a9a0 Add direct-open Mobile pilot access
```

### btb-codex ownership boundary

Mobile kalite kapısıyla ilgili kullanıcı değişiklikleri `README.md`,
`ROADMAP.md`, `TOOLS.md`, `config/mobile-quality.config.json` ve
`scripts/invoke-mobile-check.ps1` dosyalarında korunur. Mobile task profili ve
optimizer değişiklikleri bunlardan ayrı incelenir; kullanıcı onayı olmadan
birlikte stage/commit edilmez.

## Doğrulanmış checkpoint

- Uygulama IAS/BTP giriş ekranı göstermeden canlı dashboard’a açıldı.
- Fixed Mobile BFF rotalarında eksik/yanlış pilot key `401`, doğru key `200`.
- Canlı dashboard, maç, Super ve Toto SAP DTO smoke testleri geçti.
- `zbet-cap`: 37/37 test, ESLint ve production CDS build geçti.
- Mobile: 35/35 test, TypeScript, ESLint ve Expo Doctor 20/20 geçti.
- Android 15 emülatörde direct-open kurulum ve canlı SAP verisi doğrulandı.
- Direct-open APK’da OAuth App Link ve IAS endpointi bulunmuyor.

Pilot APK:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-pilot.apk
Package : com.btb.mobile.next
Size    : 48,460,415 bytes
SHA-256 : 8D51B2020384AA08A85CCF4D0AB0B47873DB7A08029B9A0DEE1511CF3B5E75D4
Signing : pilot debug certificate
```

Cloudflare:

```text
Tunnel : surklase-local-wordpress
ID     : f129a5fe-96d9-47a2-948d-38fa3acbd2b1
Route  : api.surklase.com -> http://localhost:4004
```

## Açık kapılar

1. Geçici SAP `developer` hesabı yerine yalnız gerekli üç OData servisine
   yetkili ayrı communication user gerekir.
2. Fiziksel cihazda notification, widget, Fiori, deep link, back, offline ve
   host-restart parity testleri tamamlanmalıdır.
3. Store/release signing anahtarı, yedek ve kurtarma sahipliği belirlenmelidir.
4. Cordova kaldırılmadan önce destek ve rollback runbook’u ile cihaz kanıtı
   gerekir.
5. Mevcut ABAP FCM çağrısı authentication header göndermediği için caller-auth
   geçişi tamamlanmadan IAS korumalı CAP/BTP deploy yapılmamalıdır.

Bu kapılar kapanmadan Cordova cutover yapılmaz ve mevcut Cordova kaynakları
silinmez.

## Onay kapıları

Commit/push, BTP deploy, Cloudflare DNS/Tunnel yayını, Firebase veya SAP dış
değişikliği, release imzalama/dağıtım ve Cordova cutover ayrı açık onay ister.
Pilot veya salt-okunur inceleme onayı bunların hiçbirini otomatik kapsamaz.

## Gerektiğinde okunacak dosyalar

- Uygulama ve build: `zbet-mobile/expo-app/README.md`
- Mimari, güvenlik ve fazlar:
  `zbet-mobile/expo-app/docs/ARCHITECTURE.md`
- API sözleşmesi:
  `zbet-mobile/expo-app/contracts/mobile-api.openapi.yaml`
- BFF/SAP eşlemesi:
  `zbet-cap/docs/mobile-bff-sap-mapping.md`
- Ortak Mobile kalite kapısı: `btb-codex/README.md`

Bir sonraki güvenli ürün adımı fiziksel cihaz parity testidir. Geniş auth,
native redesign, multi-repo release veya Cordova cutover öncesinde bu handoff
yenilenir ve context yeniden denetlenir.
