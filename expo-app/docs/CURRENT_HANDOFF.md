# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-01
Çalışma alanı: `C:\dev\btb-cdoex`
Aktif task: `BTB Mobile Next - Aktif`
Mod: `OBSERVATION`
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

Bu cutover’da BFF yerel kaynakla yeniden başlatıldı; authenticated public
contract smoke geçti. Cloudflare DNS/Tunnel veya SAP konfigürasyonu
değiştirilmedi. Health endpoint’i pilot anahtarı olmadan bilinçli olarak `401`
döndürür.

## Repo checkpoint

```text
zbet-mobile  master  6f6712a  cutover uygulama checkpoint’i origin/master'a pushlandı
zbet-cap     main    142ce59  Mobile BFF checkpoint’i origin/main'e pushlandı
btb-codex   main    9648e18  temiz, origin/main ile aynı
```

`zbet-mobile` ve `zbet-cap` working tree’lerindeki önceki kullanıcı/cutover
değişiklikleri korundu ve ilgili Mobile kapsamıyla commit/push yapıldı.

## Son cutover sonucu — NXT-OBS-049–052

- Canlı ve Karar Günlüğü yıldız menüleri yalnız kapsayıcı `1+ / 2+ / 3+ / 4+`
  eşiklerini kullanıyor. Canlı ve Super tercihleri cihazda bağımsız saklanıyor.
- Canlı `1+` yalnız gerçek Super seçimi bulunan rating 1–5 maçları kapsıyor;
  rating `0`, seçimsiz ve `İzleniyor` adaylar yıldız sekmesine/sayacına girmiyor.
- Yeni `/v1/super/kpis` read-only sözleşmesi İstanbul günündeki sonuçlanmış Super
  kararlarının dört eşik bucket’ını sağlıyor. Eski Dashboard şekli korunuyor.
- Karar Günlüğü seçimi, Overview `Günlük Super` kartı ve Performans widget’ı aynı
  kalıcı Super eşiğini paylaşıyor. Seçim anında widget yenileniyor; sabit job
  payload’ı tercihi ezmiyor ve geçici ağ hatasında son doğrulanmış değer korunuyor.

Arşiv: `docs/observation_archive/cutover_2026-08-01-03.md`.

## Commit/push ve deploy kapanışı

- `zbet-cap` commit `142ce59` (`Extend Mobile BFF decision metrics`) `main`
  dalına pushlandı.
- `zbet-mobile` uygulama commit’i `6f6712a`
  (`Refine Mobile Next insights and controls`) `master` dalına pushlandı.
- Mobile runtime `api.surklase.com -> Cloudflare Tunnel -> 127.0.0.1:4004`
  olduğu için bu batch’in BFF değişiklikleri yerel servisin yeniden başlatılmasıyla
  aktif oldu; authenticated loopback/public smoke geçti.
- BTP’deki `btb-fcm-proxy-srv` notification proxy kodu bu batch’te değişmedi ve
  Mobile public hostname BTP uygulamasına yönlenmiyor. Bu nedenle gereksiz MTA
  deploy yapılmadı. CF hedefi `trial/dev`; mevcut CLI oturumu süresi dolmuş.

## Doğrulama

- Mobile: TypeScript, ESLint, 61/61 test, Expo Doctor 20/20.
- Android production JS bundle; arm64 ve x86_64 native release build geçti.
- Android 15 x86_64 emülatörde iki dört-eşik menüsü, Canlı `1+` seçili maç
  kapsamı, Overview Canlı sayacı ve Super 4+ seçiminin Overview/widget parity’si
  doğrulandı.
- BFF: 42/42 test ve production CDS build.
- Loopback/public authenticated smoke: eski Dashboard sözleşmesi değişmedi;
  `/v1/super/kpis` dört bucket ve İstanbul ölçüm gününü döndürdü.
- CAP production dependency audit: temiz.
- Mobile audit: Expo toolchain dolaylı `xcode -> uuid` zincirinde 11 moderate;
  otomatik çözüm breaking Expo geçişi istediği için uygulanmadı.
- Emülatör process logunda fatal Android/React Native hata izi yok.

## Final yerel pilot APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-20260801-v7-final.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,095,388 bytes
SHA-256 : 041E719AC16AAF9FB51F71CA74668ABBFB35466E2370B2430DF67D7373440982
Signing : Android pilot debug certificate; APK Signature Scheme v2 doğrulandı
```

## Aktif observation maddeleri

- NXT-OBS-001 — fiziksel cihaz Performans widget parity: `READY`
- NXT-OBS-002 — fiziksel cihaz gerçek FCM küçük ikon: `READY`
- NXT-OBS-032 — SAP kaynak timestamp bağımlılığı: `DEFERRED`
- NXT-OBS-033 — Windows startup görevi kayıt/restart kanıtı: `READY`

## Açık kapılar

1. Final arm64 APK fiziksel cihazda kurulup gerçek FCM sonrasında notification
   küçük ikonu ve Performans widget parity gözlenmeli.
2. Bilyoner kurulu fiziksel cihazda HTTPS app-association/deep-link gözlenmeli.
3. Windows başlangıç görevi ayrı onayla kaydedilip gerçek restart sonrası
   local/public health kanıtı alınmalı.
4. Gerçek veri tazeliği için SAP kaynak timestamp alanı ve DDIC/CDS aktivasyonu
   ayrı SAP onayı ister.
5. SAP `developer` yerine yalnız gereken OData servislerine yetkili communication
   user oluşturulmalı.
6. Store/release signing, dağıtım, rollback sahipliği ve Cordova cutover ayrıca
   planlanmalı.
7. Expo’nun dolaylı `uuid` advisory’si uyumlu non-breaking paket güncellemesi
   yayımlandığında yeniden değerlendirilmeli.

## Onay kapıları

Commit/push, BTP deploy, Cloudflare DNS/Tunnel yayını, Firebase veya SAP dış
değişikliği, Windows Scheduled Task kaydı, release signing/dağıtım ve Cordova
cutover ayrı açık onay ister. Production hiçbir pilot onayından çıkarılmaz.

Bir sonraki güvenli adım final APK’yı fiziksel cihazda observation modunda
kullanmaktır. Yeni tespitler bir sonraki `btb next cutover start` komutuna kadar
yalnız observation loguna eklenir.
