# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-04
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

Bu cutover’da BFF yerel kaynakla yeniden başlatıldı. Eski DTO’lar değiştirilmeden
ilk-yarı skoru ve aynı maça ait Super kararları için üç sabit read-only uç
loopback ve public origin’de authenticated smoke testinden geçti. Cloudflare
DNS/Tunnel veya SAP konfigürasyonu değiştirilmedi.

## Repo checkpoint

```text
zbet-mobile  master  a1f3736  origin/master ile aynı; doğrulanmış cutover değişiklikleri dirty, commit/push onayı bekliyor
zbet-cap     main    91d6276  origin/main ile aynı; doğrulanmış Mobile BFF değişiklikleri dirty, commit/push onayı bekliyor
btb-codex   main    9648e18  temiz, origin/main ile aynı
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
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-20260804-v9-final.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,112,268 bytes
SHA-256 : 5527BC7477ECC0FEA157F134B85E1A06660847B45DA7803AF311D540C7229B1D
Signing : v8 ile aynı Android pilot debug sertifikası; APK Signature Scheme v2 doğrulandı
```

## Aktif observation maddeleri

- NXT-OBS-001 — fiziksel cihaz Performans widget parity: `READY`
- NXT-OBS-002 — fiziksel cihaz gerçek FCM küçük ikon: `READY`
- NXT-OBS-032 — SAP kaynak timestamp bağımlılığı: `DEFERRED`
- NXT-OBS-033 — Windows startup görevi kayıt/restart kanıtı: `READY`
- NXT-OBS-053 — final arm64 v9 fiziksel kurulum kanıtı: `READY`
- NXT-OBS-058 — tarihsel sıra/puan hazır; güncel tam lig tablosu kaynağı yok: `DEFERRED`

## Açık kapılar

1. Final arm64 v9 APK fiziksel Android cihazda kurulup filtre sayaçları, ilk-yarı
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

Bir sonraki güvenli adım final arm64 v9 APK’yı fiziksel cihazda observation
modunda kullanmaktır. Yeni tespitler bir sonraki `btb next cutover start`
komutuna kadar yalnız observation loguna eklenir.
