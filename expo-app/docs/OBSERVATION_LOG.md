# BTB Mobile Next — Observation Log

Durum: `ACTIVE / OBSERVATION`

Aktif APK:

```text
btb-mobile-next-arm64-cutover-20260801-v8-final.apk
SHA-256: 82465A7CDD997D6A899EF5F1CFA6B21D77E31369F8DC585F6132F643BDC1F574
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
| NXT-OBS-053 | 2026-08-01 | APK dağıtım netliği | Fiziksel Android 14 telefonda yanlışlıkla emülatör için üretilen `x86_64` v7 APK seçildi ve Android beklenen biçimde “uyumlu değil” hatası verdi. Doğru `arm64-v8a` v7 artifact mevcut ve hash’i doğrulandı. Artifact klasöründeki 70 eski APK/geçici kanıt Geri Dönüşüm Kutusu’na taşındı; yalnız final arm64 v7 tutuldu. Cutover prosedürü bundan sonra deploy/teslim öncesi aynı temizliği zorunlu kılıyor. Doğru arm64 v7’nin fiziksel telefona kurulumu observation’da doğrulanmalı. | MEDIUM | READY |
| NXT-OBS-058 | 2026-08-01 | Lig sıralaması | Read-only canlı V2 metadata doğrulamasında güncel maç entity’sinde lig sırası/rank/position alanı bulunmadı. Mobile sıralama hesaplamıyor ve alanı gizli tutuyor. Güvenilir takım/lig eşleşmeli kaynak alanı CDS/service’e eklendiğinde BFF’nin hazır nullable insight alanları doldurulabilir; SAP/DDIC/CDS değişikliği ayrı onay ister. | MEDIUM | DEFERRED |

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
