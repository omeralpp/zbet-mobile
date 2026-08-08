# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-08
Çalışma alanı: `C:\dev\btb-cdoex`
Aktif task: `BTB Mobile Next - Aktif`
Mod: `PLATFORM INDEPENDENCE PHASE 1 (LOCAL, UNCOMMITTED)`
Optimizer profili: `btb-mobile`

## Başlangıç

Yeni veya devam eden Mobile Next task’ı önce yalnız:

1. `C:\dev\btb-cdoex\AGENTS.md`
2. bu dosya

dosyalarını tamamen okur. Sonra yalnız aktif iş için gereken Mobile belge ve
kaynaklarına geçer. Eski task geçmişi fork edilmez; generated/native staging,
`node_modules`, Cordova `platforms` ve eski arşivler geniş taranmaz. Kullanıcı
değişiklikleri stash/revert edilmez.

Observation tespitleri `docs/OBSERVATION_LOG.md` içinde tutulur. Kod değişikliği
yalnız `btb next cutover start` komutuyla
`docs/NEXT_CUTOVER_PROCEDURE.md` uyarınca toplu yapılır. Commit/push, deploy,
dış sistem değişikliği ve release dağıtımı ayrıca açık onay ister.

## Production auth remediation checkpoint — 2026-08-08

Statik pilot anahtarının production kimliği olması yerel kod seviyesinde
engellendi. Phase 1 değişiklikleri aşağıdaki feature branch'lere commit/push
edildi; deploy yapılmadı ve aktif pilot runtime yeniden başlatılmadı.

- Non-mock mobil build fail-closed biçimde `oauth` seçer. `pilot` yalnız açık
  build profilidir; OAuth profilinde pilot anahtarı varsa Expo config durur.
- BFF `BTB_MOBILE_AUTH_MODE=pilot|oauth` değerini zorunlu tutar. OAuth modu
  pilot digestini reddeder ve yalnız doğrulanmış kullanıcı tokenını kabul eder;
  client-credentials/technical token reddedilir.
- Authorization Code + PKCE S256 state/verifier SecureStore'da en fazla on
  dakika tutulur; doğrulanmış issuer/state ile Android cold-start callback
  tamamlanabilir.
- Her BFF isteği öncesi access-token süresi kontrol edilir. Bitime 60 saniye
  kala eşzamanlı istekler tek refresh paylaşır; refresh veya BFF `401`
  başarısızlığında oturum temizlenir.
- Mobil `typecheck + lint + 81/81 test`, BFF `61/61 test` geçti. Phase 1 final
  build/doctor kapıları bu devir güncellemesi sırasında yeniden çalıştırılıyor.
- OAuth production config Android JS export ve arm64 debug smoke build geçti:
  `.codex-artifacts/btb-mobile-next-arm64-oauth-debug.apk`, SHA-256
  `EF0A590AF6DF240DBB240EBB27B4EBADD67DE4DFF5D683D29D55E33FF7993457`.
- Generic OIDC discovery, Keycloak public client/PKCE S256, `btb-api`
  audience/scope/subject, standalone BFF JWT validation, refresh ve revoke
  gerçek yerel Keycloak 26.7.0 üzerinde geçti. Production HTTPS IdP, App Link
  release sertifikası ve gerçek cihaz login-refresh-cold-start-logout kanıtı
  dış sistem kapısı olarak açık kaldı.

## Platform Independence Phase 1 checkpoint — 2026-08-08

- IAS artık production IdP kararı değildir; mobil discovery tabanlı generic
  OIDC kullanır, ilk doğrulanan sağlayıcı Keycloak'tur.
- `zbet-cap/standalone-server.js` CAP/IAS/BTP binding olmadan generic OIDC,
  fixed `/v1` Mobile BFF ve opsiyonel standalone notification API açar.
- Bildirim teslimi şifreli kullanıcı+installation registry ve idempotency
  ledger üzerinden doğrudan FCM HTTP v1'e gider. Token rotation, logout
  unregister, stale ve permanently-invalid token cleanup eklendi.
- CAP CDS action, `mta.yaml`, SAP adapter/mapping ve Fiori/Work Zone yüzeyleri
  silinmedi; `OPTIONAL SAP INTEGRATION` olarak korundu.
- Fiori WebView yalnız yapılandırılmış SAP HTTPS hostlarında gezinir. Bu yüzeyin
  erişilememesi native Dashboard/BTB/Super/Toto, auth, bildirim ve widget
  akışlarını durdurmaz.
- ABAP/CDS, aktif pilot, Cloudflare, Firebase ve BTP dış durumu değiştirilmedi.
  Yalnız Phase 1 kaynak branch'leri commit/push edildi; deploy yapılmadı.
- Final yerel kapılar: Mobile `typecheck + ESLint + 81/81 test`, Expo Doctor
  `20/20`, generic-OIDC Android production JS export ve arm64 debug native
  compile; CAP `61/61 test`,
  production CDS build, Keycloak Compose/metadata ve gerçek
  PKCE/BFF/refresh/revoke/logout smoke geçti. Değişen dosyalarda beklenmeyen
  secret literal bulunmadı.
- Phase 1 pilot release artifact:
  `.codex-artifacts/btb-mobile-next-arm64-phase1-pilot-20260808.apk`, SHA-256
  `1E775E33A72D44C660E0DCE06A1C8FAF32EE8923EAC732EDF4BA0536182235B1`.
  APK arm64-v8a, Firebase client içeren, embedded production JS bundle'lı ve
  önceki v9 ile aynı debug sertifikasıyla APK Signature Scheme v2 imzalıdır.
  Artifact dağıtılmadı; kısa yol native staging temizlendi.
- CAP production audit temiz. Mobile audit, Metro/Expo build zincirinde
  `15 high + 8 moderate` transitive bulgu raporluyor; önerilen tam düzeltmeler
  React Native/Expo için breaking major downgrade gerektirdiğinden `--force`
  uygulanmadı. Bu bulgular release güvenlik kapısında ayrıca ele alınmalı.

## Aktif pilot akışı

```text
BTB Mobile Next
  -> X-BTB-Pilot-Key (kullanıcı girişi yok)
  -> https://api.surklase.com
  -> Cloudflare Tunnel
  -> 127.0.0.1:4004 Mobile BFF
  -> server-side SAP developer technical user
  -> fixed read-only SAP OData allowlist
```

Tunnel: `surklase-local-wordpress`
Tunnel ID: `f129a5fe-96d9-47a2-948d-38fa3acbd2b1`
Route: `api.surklase.com -> http://localhost:4004`

Bu cutover’da BFF yerel kaynakla yeniden başlatıldı. Eski DTO’lar değiştirilmeden
ilk-yarı skoru ve aynı maça ait Super kararları için üç sabit read-only uç
loopback ve public origin’de authenticated smoke testinden geçti. Cloudflare
DNS/Tunnel veya SAP konfigürasyonu değiştirilmedi.

## Repo checkpoint

```text
zbet-mobile  agent/platform-independence-phase1  d61c47f  functional Phase 1 commit; handoff follow-up follows
zbet-cap     agent/platform-independence-phase1  8e5f8cc  origin branch'e push edildi
btb-codex   main    bu taskta değiştirilmedi; önceden var olan kullanıcı değişiklikleri korundu
```

## Son cutover sonucu — NXT-OBS-060–064

- Canlı Maç Detayı aynı maçın tekilleştirilmiş Super kararlarını yıldız, dakika
  ve bahis türüyle gösteriyor; satırlar ilgili Super Kararı Detayı’na gidiyor.
- Overview Spor Toto kartı sonuç süreci bitmemiş en yeni programı aktif programın
  önünde gösteriyor.
- Super Kararı Detayı’nda tekrarlı olasılık kaldırıldı; nullable `Lig PPG farkı`
  eklendi ve tarihsel sıra/puan bağlamı kompakt tabloya dönüştürüldü.
- Canlı detay güncel kaynaktan, Super detay tarihsel snapshot’tan doğrulanmış
  ilk-yarı skorunu gösteriyor; eksik veya devre öncesi veri gizleniyor.
- Canlı ve Super filtre chip’leri yalnız yüklenmiş kapsam için anlık kayıt
  sayılarını gösteriyor; yıldız filtresi sabit sekmelerin anlamını değiştirmiyor.
- Güncel tam lig tablosu için güvenilir kaynak halen yok; NXT-OBS-058’in canlı
  tarafı `DEFERRED`.

Arşiv: `docs/observation_archive/cutover_2026-08-04.md`.

## Doğrulama

- Mobile TypeScript, ESLint, 64/64 test, Expo Doctor 20/20.
- Android production JS bundle ve arm64/x86_64 release compile geçti.
- Android 15 x86_64 emülatörde filtre sayaçları, ilk-yarı skorları, aynı maçın
  Super kararları, Lig PPG farkı ve tarihsel sıra/puan tablosu doğrulandı;
  fatal log yok.
- BFF 48/48 test ve production CDS build geçti.
- Loopback/public authenticated smoke aynı tarihsel maç için 3 karar ve görünür
  ilk-yarı skoru döndürdü.
- Mobile Expo paketleri uyumlu patch sürümlerine yükseltildi. CAP production
  audit temiz; Mobile audit yalnız Expo build-time `xcode -> uuid` zincirinde
  11 moderate bulgu taşıyor. Breaking force-fix uygulanmadı.
- Mobile/CAP diff secret taraması sıfır beklenmeyen eşleşme.

## Final yerel pilot APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-phase1-pilot-20260808.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,136,712 bytes
SHA-256 : 1E775E33A72D44C660E0DCE06A1C8FAF32EE8923EAC732EDF4BA0536182235B1
Signing : v9 ile aynı Android pilot debug sertifikası (`fac61745...3b9c`); APK Signature Scheme v2 doğrulandı
```

## Aktif observation maddeleri

- NXT-OBS-001 — fiziksel cihaz Performans widget parity: `READY`
- NXT-OBS-002 — fiziksel cihaz gerçek FCM küçük ikon: `READY`
- NXT-OBS-032 — SAP kaynak timestamp bağımlılığı: `DEFERRED`
- NXT-OBS-033 — Windows startup görevi kayıt/restart kanıtı: `READY`
- NXT-OBS-053 — final arm64 v9 fiziksel kurulum kanıtı: `READY`
- NXT-OBS-058 — tarihsel sıra/puan hazır; güncel tam lig tablosu kaynağı yok: `DEFERRED`

## Açık kapılar

1. Phase 1 arm64 pilot APK fiziksel Android cihazda v9 üzerine kurulup filtre sayaçları, ilk-yarı
   skorları, diğer Super kararlarına geçiş, gerçek FCM küçük ikonu ve Performans
   widget parity gözlenmeli.
2. Windows başlangıç görevi ayrı onayla kaydedilip gerçek restart sonrası
   local/public health kanıtı alınmalı.
3. Lig sırası ve gerçek veri tazeliği için kaynak DDIC/CDS/service alanları ve
   SAP aktivasyonu ayrı SAP onayı ister.
4. SAP `developer` yerine yalnız gerekli OData servislerine yetkili communication
   user oluşturulmalı.
5. Store/release signing, dağıtım, rollback sahipliği ve Cordova cutover ayrıca
   planlanmalı.
6. Expo’nun dolaylı `uuid` advisory’si uyumlu non-breaking paket güncellemesi
   yayımlandığında yeniden değerlendirilmeli.

## Onay kapıları

Commit/push, BTP deploy, Cloudflare DNS/Tunnel yayını, Firebase veya SAP dış
değişikliği, Windows Scheduled Task kaydı, release signing/dağıtım ve Cordova
cutover ayrı açık onay ister. Production hiçbir pilot onayından çıkarılmaz.

Phase 1 için bir sonraki güvenli adım; ayrı onayla production HTTPS Keycloak
veya eşdeğer OIDC sağlayıcıyı, exact redirect/logout ve release App Link
ayarlarını hazırlamak; server secret/persistence/monitoring politikasını
seçmek; ardından gerçek cihazda login, refresh, cold-start, sign-out, FCM,
widget ve optional Fiori failure smoke kanıtı almaktır. Bu onay gelene kadar
aktif pilot runtime değişmeden kalır; v9 kurulu rollback APK'sı, Phase 1 APK ise
fiziksel kurulum bekleyen yeni adaydır.
