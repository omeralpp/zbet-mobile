# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-07-29
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
`docs/NEXT_CUTOVER_PROCEDURE.md` uyarınca toplu yapılır.

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

Bu cutover’da yalnız yerel public origin süreci güncel BFF kaynağıyla
`scripts/start-mobile-bff.ps1` üzerinden yeniden başlatıldı. Cloudflare
DNS/Tunnel tanımı değiştirilmedi. Anahtarsız `401`, yerel ve public doğru
anahtarlı dashboard `200` smoke testi geçti.

## Repo checkpoint

```text
zbet-mobile  master  ca9ac31  origin/master'a push edildi (Mobile cutover Batch 4 implementation)
zbet-cap     main    165809c  origin/main'de değişmeden kaldı (Mobile BFF)
```

Mevcut kullanıcı değişiklikleri korundu. Cutover kapsamı dışındaki dosyalar
commitlere alınmadı. Stash/revert yapılmadı.

## Son cutover sonucu

- Android native splash’taki ikinci BTB logosu kaldırıldı; yalnız nötr koyu
  arka plan üzerinden modern uygulama loading ekranına geçiliyor.
- Karar Günlüğü `Bugün` / `Tüm günler` arasında çift yönlü geçiş yapıyor.
- Canlı kartlar gerçek güncel `currentRate` değerini gösteriyor; kapalı markette
  seçim oranına fallback yapılmıyor. Super kartı `liveRate` değerini açıkça
  `seçim oranı` olarak etiketliyor.
- Maç detayına sıfır merkezli, ev/deplasman yönlü baskı farkı göstergesi
  eklendi.
- Expo SDK 57 bağımlılıkları resmi uyumlu patch seviyelerine yükseltildi.
- Canlı SAP entity’sinde gerçek kaynak update timestamp’i bulunmadığından
  NXT-OBS-032 `DEFERRED` kaldı.

Çözülen batch arşivi:
`docs/observation_archive/cutover_2026-07-29-04.md`.

Aktif observation maddeleri:

- NXT-OBS-001 — fiziksel cihaz Performans widget parity: `READY`
- NXT-OBS-002 — fiziksel cihaz gerçek FCM küçük ikon: `READY`
- NXT-OBS-032 — SAP kaynak timestamp bağımlılığı: `DEFERRED`

## Doğrulama

- `zbet-cap`: 39/39 test ve production CDS build geçti.
- Mobile: 51/51 test, TypeScript, ESLint ve Expo Doctor 20/20 geçti.
- Ortak `invoke-mobile-check.ps1 -BundleOnly` ve Android production bundle
  geçti.
- SAP `$metadata`: provider tarafından seçilen 119/119 benzersiz alan mevcut.
- Public BFF anahtarsız `401`, doğru pilot anahtarıyla maç listesi `200`
  döndürdü; seçim oranı, güncel oran ve pressure alanları doğrulandı.
- Native x86_64 emülatör ve arm64 final release build geçti.
- Android 15 emülatörde logosuz native splash, `Bugün` / `Tüm günler`, gerçek
  canlı oran, Super `seçim oranı` etiketi ve baskı farkı göstergesi görsel
  testleri geçti.
- Gerçek widget `%80 (12/15)` Toto ve aynı gün `3+` Super için
  `0,00 / 0 kazandı · 0 kaybetti` gösterdi.
- Logcat’te fatal Android veya React Native hatası görülmedi.
- `npm audit --omit=dev`: `0 high`, `0 critical`, `11 moderate`. Önerilen
  otomatik düzeltmeler uyumsuz Expo downgrade’leri olduğu için uygulanmadı.

## Final pilot APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-20260729-v4-final.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 47,192,748 bytes
SHA-256 : 7714F363A7DA66430064465146B055A2CB1E6EAA3C5FFBF53F046D4A151B1306
Signing : Android pilot debug certificate; APK Signature Scheme v2 doğrulandı
```

## Açık kapılar

1. Final APK fiziksel cihazda kurulmalı; gerçek FCM sonrasında notification
   küçük ikonu ve Performans widget parity sonucu bildirilmelidir.
2. Bilyoner kurulu fiziksel cihazda HTTPS app-association/deep-link sonucu
   gözlenmelidir; web fallback emülatör ve unit testte hazırdır.
3. Gerçek veri tazeliği için `zbet_t_matches` kaynak timestamp alanı ve bağımlı
   DDIC/CDS/service aktivasyon planı gerekir; bu ayrı SAP onayı ister.
4. SAP `developer` yerine yalnız gerekli OData servislerine yetkili ayrı
   communication user oluşturulmalıdır.
5. Store/release signing, yedek ve kurtarma sahipliği belirlenmelidir.
6. Cordova kaldırılmadan önce cihaz kanıtı, destek ve rollback runbook’u gerekir.
7. ABAP FCM caller-auth geçişi tamamlanmadan IAS korumalı CAP/BTP deploy
   yapılmamalıdır.

## Onay kapıları

`btb next cutover start`, zorunlu kalite kapıları geçtikten sonra yalnız cutover
kapsamındaki dosyaların ilgili repolarda commit edilip upstream branch’e push
edilmesini de kapsar. Cutover dışındaki commit/push işlemleri ayrıca açık onay
ister.

BTP deploy, Cloudflare DNS/Tunnel yayını, Firebase veya SAP dış değişikliği,
release imzalama/dağıtım ve Cordova cutover her seferinde ayrı açık onay ister.

Bir sonraki güvenli adım final APK’yı fiziksel cihazda observation modunda
kullanmaktır. Yeni tespitler bir sonraki `btb next cutover start` komutuna kadar
yalnız observation loguna eklenir.
