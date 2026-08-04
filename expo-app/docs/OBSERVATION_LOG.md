# BTB Mobile Next — Observation Log

Durum: `ACTIVE / OBSERVATION`

Aktif APK:

```text
btb-mobile-next-arm64-cutover-20260804-v9-final.apk
SHA-256: 5527BC7477ECC0FEA157F134B85E1A06660847B45DA7803AF311D540C7229B1D
```

Bu dosya yalnız gerçek kullanımda açık kalan tespitleri tutar. Observation
sırasında kod değiştirilmez. Yeni değişiklik batch’i yalnız kullanıcı
`btb next cutover start` dediğinde başlar.

| ID | Tarih | Alan | Tespit / beklenen kanıt | Öncelik | Durum |
| --- | --- | --- | --- | --- | --- |
| NXT-OBS-001 | 2026-07-29 | Performans widget | KPI parser ve dashboard fallback düzeltildi. Android 15 emülatöründeki gerçek widget Toto kapsamını ve cihazda seçilen kalıcı `1+ / 2+ / 3+ / 4+` Super eşiğinin günlük profit/kazandı/kaybetti değerini doğru gösterdi. Final arm64 APK’nın fiziksel cihazda gerçek bildirim/uygulama dönüşü sonrasında aynı parity’yi koruduğu doğrulanmalı. | HIGH | READY |
| NXT-OBS-002 | 2026-07-29 | Notification görünümü | Android notification küçük ikonu ve varsayılan Firebase/Expo ikon metadata’sı APK’da mevcut. Gerçek FCM bildiriminin fiziksel cihazdaki küçük ikon görünümü bekleniyor. | MEDIUM | READY |
| NXT-OBS-032 | 2026-07-29 | Canlı veri tazeliği | `zbet_t_matches` / canlı ana OData entity’si gerçek kaynak güncelleme zamanı yayınlamıyor. BFF yanıt zamanı SAP veri tazeliği gibi gösterilmedi. Doğru `Son veri ... önce` ve stale uyarısı için kaynakta tutulan timestamp alanı, DDIC/CDS/service aktivasyonu ve ayrı SAP onayı gerekir. | HIGH | DEFERRED |
| NXT-OBS-033 | 2026-07-29 | Windows başlangıç dayanıklılığı | Kullanıcı-scope runtime değerlerini koruyan `ensure-mobile-bff.ps1` watchdog’u ve açık `-Apply` gerektiren Scheduled Task kayıt scripti hazırlandı. Loopback/public health doğrulaması geçti; ancak Windows başlangıç görevi henüz kaydedilmedi. Ayrı onay sonrası task kaydı ve gerçek yeniden başlatma observation’ı gerekir. | HIGH | READY |
| NXT-OBS-053 | 2026-08-01 | APK dağıtım netliği | Eski artifact’lar her cutover tesliminden önce temizleniyor. Güncel final yalnız `arm64-v8a` v9 APK’dır; Android 15 x86_64 emülatör smoke’u ayrı geçici artifact ile tamamlanıp bu artifact ve kanıt dosyaları Geri Dönüşüm Kutusu’na taşındı. Final v9’un fiziksel Android 14 telefonda kurulumu observation’da doğrulanmalı. | MEDIUM | READY |
| NXT-OBS-058 | 2026-08-01 | Lig sıralaması | Tarihsel Super snapshot’ındaki mevcut takım sıra/puan alanları kompakt iki takımlı tabloda gösterildi. Güncel Canlı Maç Detayı için güvenilir rank/standing/position ve tam puan tablosu kaynağı halen yok; Mobile veri üretmiyor ve bu bölüm gizli kalıyor. O/G/B/M/A/Y/AV/P kapsamı için takım/lig eşleşmeli kaynak CDS/service’e eklenmeli; SAP/DDIC/CDS değişikliği ayrı onay ister. | MEDIUM | DEFERRED |

`READY`: çözüm yerel batch içinde uygulanmış ve otomatik/emülatör kapılarından
geçmiştir; fiziksel cihaz observation sonucu beklenir.

`DEFERRED`: doğru çözüm mevcut yerel Mobile/BFF sözleşmesinin dışındaki onaylı
bir bağımlılığı gerektirir; sahte veriyle kapatılmaz.

Durumlar: `OBSERVED`, `READY`, `DEFERRED`, `RESOLVED`.

Çözülen maddeler:

- `docs/observation_archive/cutover_2026-07-29.md`
- `docs/observation_archive/cutover_2026-07-29-03.md`
- `docs/observation_archive/cutover_2026-07-29-04.md`
- `docs/observation_archive/cutover_2026-08-01.md`
- `docs/observation_archive/cutover_2026-08-01-02.md`
- `docs/observation_archive/cutover_2026-08-01-03.md`
- `docs/observation_archive/cutover_2026-08-01-04.md`
- `docs/observation_archive/cutover_2026-08-04.md`
