# BTB Mobile Next — Observation Log

Durum: `ACTIVE / OBSERVATION`

Aktif APK:

```text
btb-mobile-next-arm64-cutover-20260809-v12-final.apk
SHA-256: 0CAA20A8F0289E478DCDCCADCC6E3C637CAC1B4053814041A9D6D98EAEA46F93
```

Bu dosya yalnız gerçek kullanımda açık kalan tespitleri tutar. Observation
sırasında kod değiştirilmez. Yeni değişiklik batch’i yalnız kullanıcı
`btb next cutover start` dediğinde başlar.

| ID | Tarih | Alan | Tespit / beklenen kanıt | Öncelik | Durum |
| --- | --- | --- | --- | --- | --- |
| NXT-OBS-001 | 2026-07-29 | Performans widget | KPI parser ve dashboard fallback düzeltildi. Android 15 emülatöründeki gerçek widget Toto kapsamını ve cihazda seçilen kalıcı `1+ / 2+ / 3+ / 4+` Super eşiğinin günlük profit/kazandı/kaybetti değerini doğru gösterdi. Final arm64 APK’nın fiziksel cihazda gerçek bildirim/uygulama dönüşü sonrasında aynı parity’yi koruduğu doğrulanmalı. | HIGH | READY |
| NXT-OBS-002 | 2026-07-29 | Notification görünümü | Android notification küçük ikonu ve varsayılan Firebase/Expo ikon metadata’sı APK’da mevcut. Gerçek FCM bildiriminin fiziksel cihazdaki küçük ikon görünümü bekleniyor. | MEDIUM | READY |
| NXT-OBS-032 | 2026-07-29 | Canlı veri tazeliği | `zbet_t_matches` / canlı ana OData entity’si gerçek kaynak güncelleme zamanı yayınlamıyor. BFF yanıt zamanı SAP veri tazeliği gibi gösterilmedi. Doğru `Son veri ... önce` ve stale uyarısı için kaynakta tutulan timestamp alanı, DDIC/CDS/service aktivasyonu ve ayrı SAP onayı gerekir. | HIGH | DEFERRED |
| NXT-OBS-033 | 2026-07-29 | Windows başlangıç dayanıklılığı | Kullanıcı onayıyla `BTB Mobile BFF` logon task’ı `pilot` profili ve aktif notification teslimiyle yeniden kaydedildi. Task `Ready`, son sonuç `0`; tek 4004 listener ile local/public health iki servis için `configured` ve gerçek FCM teslimi `2/2` geçti. Task argümanında secret yoktur. Gerçek Windows reboot sonrasında otomatik kalkış observation’ı gerekir. | HIGH | READY |
| NXT-OBS-053 | 2026-08-01 | APK dağıtım netliği | Güncel final yalnız `arm64-v8a` v12 APK’dır; v11 doğrulama sonrasında Geri Dönüşüm Kutusu’na taşındı. v12 package/ABI/v2 imza/bundle ve ham Firebase server-secret yokluğu doğrulandı. Fiziksel Android telefonda kurulum, Bibi rehberi, lig/final skor/oran-baskı görünümü, Fiori SAP ID login ve gerçek notification teslimi observation’da doğrulanmalı. | MEDIUM | READY |
| NXT-OBS-058 | 2026-08-09 | Lig sıralaması | Ortak kompakt `Puan Durumu` bileşeni sıra rozetine göre sıralanan `Sıra / Takım / P` görünümüyle Super ve Canlı Maç detayına eklendi. Super ekranı karar anı kaydını, maç ekranı yalnız son Super kararının lig snapshot’ını açık etiketle gösterir. Canlı SAP metadata’sında tam lig `O / G / B / M / A / Y / AV` alanları yayınlanmadığı için veri uydurulmadı; yalnız doğrulanan iki takım sıra/puanı kullanıldı. Mobile 91/91, BFF 63/63 ve izole canlı SAP route smoke geçti. Yeni BFF kaynağı kontrollü restart ile aktif 4004 sürecine yüklendi; fiziksel APK üzerindeki authenticated görünüm observation’ı beklenir. | HIGH | READY |
| NXT-OBS-067 | 2026-08-09 | Yeniden başlatma dayanıklılığı | Reboot sonrası 502 kök nedenleri için startup zinciri açık auth/pilot profilini taşır. Aktif BFF notification teslimi açık biçimde kaldırıldı ve aynı komut Windows logon task’ına kaydedildi. Task son sonucu `0`; local/public health iki servisi de `configured` gösteriyor ve gerçek FCM `2/2` geçti. Gerçek reboot otomatik başlangıç kanıtı beklenir. | HIGH | READY |
| NXT-OBS-068 | 2026-08-09 | Uygulama kullanıcı girişi | v12 pilot cold-start’ında özel BTB giriş sayfası gösterilir; metin kullanıcı adı/parola istemediğini ve gerçek kullanıcı kimliği doğrulamadığını açıklar, buton salt okunur pilot erişimine geçirir. Mobile 91/91 test ve release build geçti; fiziksel kurulum kanıtı beklenir. Gerçek kurumsal kullanıcı login’i hâlâ canlı HTTPS OIDC provider/public client, BFF `oauth` runtime ve Android App Link dış cutover’ını gerektirir. | HIGH | DEFERRED |
| NXT-OBS-070 | 2026-08-09 | Bibi tutorial modu | Sürüm kontrollü Bibi rehberi ilk kurulumda açık gelir; ekran bazlı hedeflere safe-area içinde hareket eder, aynı sayfadaki adımları `Sonraki` ile ilerletir ve kısa konuşma balonu gösterir. İlerleme AsyncStorage’da tutulur; `Rehberi kapat`, `Daha fazla` ekranından aç/kapat ve baştan başlat seçenekleri eklendi. Küçük ekran balon sınırı, overlay dokunma alanı, erişilebilirlik duyurusu ve reduced-motion fallback’i uygulandı. Pure state testleri ve Android release bundle geçti; fiziksel cihaz hareket/dokunma observation’ı beklenir. | MEDIUM | READY |
| NXT-OBS-071 | 2026-08-09 | Super karar sonucu | Super Kararı Detayı karar anı skorunu ayrı etiketler; yalnız `WON/LOST` ve güvenilir `finalScore` doluyken sonuç rengiyle `Biten skor` gösterir. `OPEN/VOID` veya eksik final skorda alan gizlidir. Canlı Super V4 metadata’sında `final_home_s/final_away_s`, mapper’da tarihsel `finalScore` zinciri doğrulandı; current match satırına bağlı değildir. Mobile 91/91 ve BFF 63/63 geçti; fiziksel görünüm observation’ı beklenir. | HIGH | READY |
| NXT-OBS-072 | 2026-08-09 | Canlı kart ikon semantiği | Trend ikonu canlı oran bölümüne taşındı: current seçim oranından yüksekse yukarı, düşükse aşağı, eşitse nötr; oran eksik/kapalıysa yön ikonu hiç gösterilmez. Baskı tarafı ev sahibinde ev, deplasmanda uçak, veri yok/dengede nötr teraziyle gösterilir. Oran ve baskı semantiği ayrı erişilebilirlik metinleri ve pure policy testleriyle doğrulandı; fiziksel küçük ekran observation’ı beklenir. | MEDIUM | READY |
| NXT-OBS-073 | 2026-08-09 | Takım logoları / görsel kimlik | Canlı maç listesi, Maç Detayı ve uygun Toto/Super yüzeylerinde takım logoları gösterilmesi istendi. Mevcut strict Mobile DTO’ları yalnız takım adını taşıyor; güvenilir takım ID’si veya logo URL’si yok. Doğru çözüm runtime isim araması/scraping değil, lisanslı upstream kaynaktan stabil `providerTeamId` alıp sürümlü bir takım görsel kataloğuna eşlemek; dosyaları izinli CDN/object storage üzerinde WebP/PNG olarak sunmak ve eski APK’ları bozmayan bounded toplu companion BFF endpoint’i kullanmaktır. Mobile görünür satırları lazy-load/disk-cache etmeli, eksik logoda deterministik baş harf/kalkan fallback’i göstermeli ve veri listesini görsel bekletmemelidir. Cutover kabulü: isim varyantları yanlış logo üretmez, eksik logo ana akışı bozmaz, liste başına N+1 istek oluşmaz, eski APK contract’ı korunur ve logo kullanım lisansı doğrulanır. Cloudflare storage/DNS veya SAP alan genişletmesi gerekirse ayrı dış sistem/SAP onayı alınır. | MEDIUM | OBSERVED |
| NXT-OBS-074 | 2026-08-09 | Notification producer sürekliliği | Kullanıcı 17:35 civarında yeni notification gelmediğini bildirdi; widget son güncellemesi 15:42 idi. Salt okunur tanıda local/public BFF health HTTP 200, `deviceRegistration=configured`, `notificationService=configured`, tek listener PID 6900 ve Windows görevi `Ready / last result 0` bulundu. Şifreli registry’de 2 Android cihazı duruyor. Ledger’ın son tamamlanan teslimi 15:42:36 yerel saate karşılık geliyor ve `matched=2 / delivered=2 / failed=0`; sonrasında yeni ledger kaydı yok. Buna karşılık read-only `/v1/super/logs` yüzeyinde bu kesimden sonra 41 yeni tarihsel karar var: 32×1 yıldız, 5×2, 1×3, 2×4 ve 1×5. Yerel olarak yeniden kurulan idempotency adayları önceki 12 ledger kaydıyla eşleşirken kesim sonrası kararların hiçbiriyle eşleşmedi; dolayısıyla yeni Super olayları BFF producer endpoint’ine başarıyla ulaşmamış, sorun Firebase/cihaz tesliminden önce SAP producer çağrısı, notification kuralı veya SM59 HTTP sonucundadır. SAP hesaplama job’ları yeni Super logları ürettiği için genel maç işleme tamamen durmuş değildir. `send_notification` başarısızlıkları kalıcı telemetry’ye yazılmadığından kesin alt neden için canlı `GLOBAL/SUPER` notification kuralı, SM59 response status ve job-step çağrı sonucu read-only doğrulanmalı; kontrollü test notification’ı ayrı dış işlem onayı ister. | HIGH | OBSERVED |

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
- `docs/observation_archive/cutover_2026-08-09.md`
- `docs/observation_archive/cutover_2026-08-09-02.md`
- `docs/observation_archive/cutover_2026-08-09-03.md`
- `docs/observation_archive/cutover_2026-08-09-04.md`
- `docs/observation_archive/cutover_2026-08-09-05.md`
