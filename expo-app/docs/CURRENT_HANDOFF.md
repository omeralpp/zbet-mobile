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

Bu cutover’da BFF yerel kaynakla yeniden başlatıldı. Eski DTO’lar değiştirilmeden
yeni `/v1/btb/match-insights` list/detail yüzeyi loopback ve public origin’de
authenticated smoke testinden geçti. Cloudflare DNS/Tunnel veya SAP
konfigürasyonu değiştirilmedi.

## Repo checkpoint

```text
zbet-mobile  master  cd16f29  origin/master ile aynı; doğrulanmış cutover değişiklikleri dirty, commit/push onayı bekliyor
zbet-cap     main    142ce59  origin/main ile aynı; doğrulanmış Mobile BFF değişiklikleri dirty, commit/push onayı bekliyor
btb-codex   main    9648e18  temiz, origin/main ile aynı
```

## Son cutover sonucu — NXT-OBS-054–059

- Canlı Maçlar’daki `Seçili` sekmesi kaldırıldı. Eski deep-link parametresi
  geriye uyumlu biçimde yıldız filtresine yönleniyor.
- Toto Programı detayına yeşil `Bilyoner Spor Toto’da aç` butonu eklendi; mavi
  Fiori hedefi ayrı kaldı.
- Geçmiş sonuç eşleşmesi satırları aynı marketin gerçek
  `zbet_cds_006-live_rate` değerini yüzdelerden ayrı gösteriyor. Kapalı oran
  `kapalı`, endpoint/geçerli eşleşme yoksa `—`.
- Overview metin aksiyonları kompakt, pressed geri bildirimli ve erişilebilir
  pill butonlara dönüştürüldü.
- Takım bazlı kırmızı kart sayısı Canlı kartı ve Maç Detayı üst kartında doğru
  takımın yanında gösteriliyor; sıfır/eksik değer gizli.
- Güncel maç entity’sinde lig sırası alanı bulunmadığı read-only metadata ile
  doğrulandı. Mobile sıralama üretmedi; NXT-OBS-058 `DEFERRED`.

Arşiv: `docs/observation_archive/cutover_2026-08-01-04.md`.

## Doğrulama

- Mobile TypeScript, ESLint, 62/62 test, Expo Doctor 20/20.
- Android production JS bundle ve arm64/x86_64 release compile geçti.
- Android 15 x86_64 emülatörde Overview pill, Canlı sekme sadeleşmesi, gerçek
  oran/kapalı ayrımı ve Toto dış hedef renkleri doğrulandı; fatal log yok.
- BFF 43/43 test ve production CDS build geçti.
- Loopback/public authenticated smoke: mevcut match contract çalışıyor;
  insights list/detail aynı alanları ve bounded market oranlarını döndürüyor.
- CAP production dependency audit temiz. Mobile audit Expo toolchain dolaylı
  `xcode -> uuid` zincirinde 11 moderate; breaking force-fix uygulanmadı.
- Mobile/CAP diff secret taraması sıfır eşleşme.

## Final yerel pilot APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-20260801-v8-final.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,104,020 bytes
SHA-256 : 82465A7CDD997D6A899EF5F1CFA6B21D77E31369F8DC585F6132F643BDC1F574
Signing : v7 ile aynı Android pilot debug sertifikası; APK Signature Scheme v2 doğrulandı
```

## Aktif observation maddeleri

- NXT-OBS-001 — fiziksel cihaz Performans widget parity: `READY`
- NXT-OBS-002 — fiziksel cihaz gerçek FCM küçük ikon: `READY`
- NXT-OBS-032 — SAP kaynak timestamp bağımlılığı: `DEFERRED`
- NXT-OBS-033 — Windows startup görevi kayıt/restart kanıtı: `READY`
- NXT-OBS-053 — final arm64 v8 fiziksel kurulum kanıtı: `READY`
- NXT-OBS-058 — güncel maç lig sırası kaynağı yok: `DEFERRED`

## Açık kapılar

1. Final arm64 v8 APK fiziksel Android cihazda kurulup kırmızı kart/market oranı,
   Bilyoner Spor Toto hedefi, gerçek FCM küçük ikonu ve Performans widget parity
   gözlenmeli.
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

Bir sonraki güvenli adım final arm64 v8 APK’yı fiziksel cihazda observation
modunda kullanmaktır. Yeni tespitler bir sonraki `btb next cutover start`
komutuna kadar yalnız observation loguna eklenir.
