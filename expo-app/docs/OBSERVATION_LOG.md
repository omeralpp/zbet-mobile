# BTB Mobile Next — Observation Log

Durum: `DESIGN V2 PHYSICAL FEEDBACK + BIBI EXPERIENCE PASS — KOD TAMAM,
COMMIT ONAYI BEKLİYOR`

Product Design V2 dokuz batch ile tamamlandı (`ff50051..21a1f57`). Değişiklikler
yalnız sunumdur; tahmin, model, Toto, Live Context sözleşmesi, BFF ve SAP
davranışı değişmedi. Fiziksel Xiaomi doğrulaması bekleniyor; kontrol listesi
`docs/CURRENT_HANDOFF.md` içindedir.

Aktif APK (fiziksel Xiaomi ile doğrulanmış baseline):

```text
btb-mobile-next-arm64-live-context-v2.apk
SHA-256: 3096C0335361F45B6B95B7AFD35AE1A1D9C91E4D6233735F998E1B2B34EB5B28
```

`LIVE_CONTEXT_V2_ACCEPTED` + `REAL_GOAL_PHYSICAL_PASS` +
`RED_CARD_OWNER_ACCEPTED` + `NO_NEW_APK_REQUIRED` +
`MOBILE_NEXT_BASELINE_VERIFIED` — 2026-08-18 release kapanışı.
Kapanış kanıtı: `docs/observation_archive/cutover_2026-08-18.md`
(UI baseline: `cutover_2026-08-17-03.md`).

Önceki baseline `btb-mobile-next-arm64-pilot.apk` ve doğrulanmamış ara artifact
`btb-mobile-next-arm64-ui-polish.apk` cutover prosedürü adım 8 uyarınca Geri
Dönüşüm Kutusu'na taşındı; `.codex-artifacts` yalnız yukarıdaki doğrulanmış
`arm64` APK'yı tutar.

`BILYONER_LIVE_CONTEXT_RUNTIME = ENABLED_VIA_SAP_BRIDGE` (2026-08-18) —
sağlayıcıya SAP'ın halihazırda çalışan HTTP istemcisi üzerinden erişilir
(`BTB_LIVE_CONTEXT_UPSTREAM=SAP_BRIDGE`). Doğrudan Node yolu kapalıdır ve
kapalı kalır; TLS parmak izi taklidi, çerez/oturum/giriş otomasyonu yapılmadı.

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
| NXT-OBS-073 | 2026-08-09 | Bilyoner takım logoları / görsel kimlik | Bilyoner maç payload’ında `htpi` ev sahibi participant ID, `atpi` deplasman participant ID, `htn` ev sahibi adı ve `atn` deplasman adı olarak gözlemlendi. Logo kalıbı `https://content.bilyoner.com/assets/participant/{participantId}.png`; örnek PSG `htpi=954` → `https://content.bilyoner.com/assets/participant/954.png`, Aston Villa `atpi=227` → `https://content.bilyoner.com/assets/participant/227.png`. İki örnek 2026-08-12’de HTTP 200 `image/png` olarak salt okunur doğrulandı. Bu, Bilyoner’in public/dokümante edilmiş resmi logo API’si değil; mevcut web uygulamasında kullanılan CDN pattern’inin gözlemlenmesine dayanır ve kullanım/lisans koşulları production öncesi ayrıca doğrulanmalıdır. URL DB’ye kaydedilmemeli; base URL mevcut `src/external/bilyoner.ts` içinde tek config/resolver noktasında tutulmalı, yeniden kullanılabilir `TeamLogo` bileşeni geçersiz/eksik ID veya `onError` durumunda broken image göstermeden deterministik kalkan/baş harf fallback’ine dönmelidir. 2026-08-12 local-evidence incelemesinde Mobile OpenAPI/Zod, BFF `$select`/mapper ve yerel ABAP snapshot’ında `htpi/atpi` ya da eşdeğer participant alanı bulunmadı; SAP ADT MCP portu kapalı olduğundan canlı SAP durumu doğrulanamadı. Cutover önce participant ID’lerin upstream Bilyoner intake → kalıcı SAP/OData alanı → BFF DTO zincirinde gerçekten taşındığını kanıtlamalıdır; takım adından tahmin, runtime scraping veya component içinde CDN hard-code yasaktır. Alanlar eski APK’ları bozmayan optional/nullable `homeParticipantId` ve `awayParticipantId` olarak Match/Super/Toto’nun gerçekten kaynak kimliği bulunan DTO’larına eklenmeli; liste/detay yüzeylerinde logo veri akışını bekletmeden lazy yüklenmeli. N+1 API isteği oluşmamalı, layout sabit kalmalı ve Android/iOS/web responsive fallback testleri geçmelidir. SAP DDIC/CDS/OData genişletmesi Mobile task sınırını aşar ve ayrı SAP yazma/aktivasyon onayı ile ilgili operasyonel task sahipliğine yönlendirilir. | HIGH | OBSERVED |
| NXT-OBS-074 | 2026-08-09 | Notification producer sürekliliği | Kullanıcı 17:35 civarında yeni notification gelmediğini bildirdi; widget son güncellemesi 15:42 idi. Salt okunur tanıda local/public BFF health HTTP 200, `deviceRegistration=configured`, `notificationService=configured`, tek listener PID 6900 ve Windows görevi `Ready / last result 0` bulundu. Şifreli registry’de 2 Android cihazı duruyor. Ledger’ın son tamamlanan teslimi 15:42:36 yerel saate karşılık geliyor ve `matched=2 / delivered=2 / failed=0`; sonrasında yeni ledger kaydı yok. Buna karşılık read-only `/v1/super/logs` yüzeyinde bu kesimden sonra 41 yeni tarihsel karar var: 32×1 yıldız, 5×2, 1×3, 2×4 ve 1×5. Yerel olarak yeniden kurulan idempotency adayları önceki 12 ledger kaydıyla eşleşirken kesim sonrası kararların hiçbiriyle eşleşmedi; dolayısıyla yeni Super olayları BFF producer endpoint’ine başarıyla ulaşmamış, sorun Firebase/cihaz tesliminden önce SAP producer çağrısı, notification kuralı veya SM59 HTTP sonucundadır. SAP hesaplama job’ları yeni Super logları ürettiği için genel maç işleme tamamen durmuş değildir. `send_notification` başarısızlıkları kalıcı telemetry’ye yazılmadığından kesin alt neden için canlı `GLOBAL/SUPER` notification kuralı, SM59 response status ve job-step çağrı sonucu read-only doğrulanmalı; kontrollü test notification’ı ayrı dış işlem onayı ister. 2026-08-12 16:35 tekrarında restart öncesinde de PID 25464 listener, local/public health HTTP 200 ve notification/device registration `configured` idi; şifreli delivery ledger son kez 04:45’te yazılmıştı. Runtime kullanıcı talebiyle temiz biçimde PID 30344’e yeniden başlatıldı; Windows görevi `Ready / last result 0`, local/public health HTTP 200 doğrulandı. Bu restart servis erişimini doğrular fakat yeni producer teslimini kanıtlamaz; tekrarlayan boşluk upstream SAP producer/SM59 telemetry ihtiyacını güçlendirir. | HIGH | OBSERVED |
| NXT-OBS-082 | 2026-08-12 | Windows başlangıç dayanıklılığı | Bilgisayar/oturum dönüşü sonrasında Android uygulaması bağlantı hatası verdi. Yerel `127.0.0.1:4004` listener kapalı ve public tunnel health `502` idi. Windows görevinin argümanı doğru biçimde `-AuthMode pilot` taşımasına rağmen önceki çalışması `0xC000013A` ile kesilmişti; kullanıcının düz `start-mobile-bff.ps1` komutu ise açık profil vermediği için tasarım gereği `BTB_MOBILE_AUTH_MODE` hatası verdi. Mevcut `BTB Mobile BFF` görevi yeniden tetiklendi; local/public health ve authenticated `/v1/dashboard` HTTP 200, görev `Ready / last result 0`, listener PID 25464 doğrulandı. Commit veya Cloudflare/BTP değişikliği yapılmadı. Bir sonraki gerçek Windows reboot/logon sonrasında otomatik ayağa kalkış tekrar gözlenmeli. | HIGH | READY |

| NXT-OBS-083 | 2026-08-12 | Karar Günlüğü gün kapsamı filtresi | Ayrı ve uzakta duran `Bugün / Tüm günler` geçişi yeterince anlaşılır değil. Tek bir kompakt açılır `Gün kapsamı` filtresi kullanılmalı: kapalı durumda takvim simgesiyle aktif seçim (`Bugün` veya `Tüm günler`) ve aşağı ok görünmeli; dokununca tetikleyicinin altında yalnız bu iki seçenek açılmalı. Seçim listeyi ve tarih/kayıt özetini birlikte güncellemeli; `Tüm günler` mevcut sınırlı geçmiş kapsamını (ör. en yeni 100 karar) tarih satırıyla açıklamaya devam etmeli. Dokunma hedefi en az 44–48 dp olmalı, menü ekran dışına taşmamalı, yıldız menüsüyle aynı anda açık kalmamalı ve dışarı dokunma/Android geri/yeniden dokunma ile kapanmalıdır. | MEDIUM | READY |

| NXT-OBS-084 | 2026-08-12 | Detay ekranı özet kartı ve bağlamsal toolbar | Super Kararı Detayı ve canlı maç gibi maç tabanlı detay ekranlarının ilk özet kartında bilgi hiyerarşisi dağınık: lig/tarih/durum, takım eşleşmesi, karar anı skoru, ilk yarı/biten skor ve seçim-oran-kâr bilgileri standart semantik gruplara ayrılmalı; karar anı ile nihai sonuç görsel olarak karıştırılmamalı, hizalar dar ekran ve büyük yazı boyutunda bozulmamalıdır. Kart görünüm alanından çıkınca üst araç çubuğu yumuşak bir geçişle genel ekran başlığından tek satırlık maç adına (`Ev sahibi – Deplasman`) dönüşmeli; böylece kullanıcı sayfanın altındayken hangi maçı incelediğini görmelidir. Geri düğmesi ve Bibi sabit kalmalı, uzun adlar ellipsis ile erişilebilir tam metin taşımalı, başlık kart yeniden görünür olduğunda eski haline dönmeli, sticky toolbar safe-area/Android geri/yatay kaydırma davranışlarını bozmamalı ve açık-koyu temada aynı hiyerarşiyi korumalıdır. | HIGH | READY |

| NXT-OBS-085 | 2026-08-12 | Baskı dengesi doğru detay bağlamı | Canlı Maç Detayı içindeki `Canlı saha dengesi` kartının altındaki ev/deplasman baskısı özet çubuğu bu ekranın güncel istatistik akışını gereksiz uzatıyor ve Super karar bağlamına daha uygun. Çubuk Canlı Maç Detayı’ndan kaldırılmalı; ham canlı metrikler (topla oynama, şut, isabetli şut, xG, korner ve kartlar) yerinde kalmalıdır. Baskı görselleştirmesi Super Kararı Detayı’nda `Karar anındaki saha` bölümüne `Karar anı baskı dengesi` adıyla taşınmalı ve yalnız tarihsel Super Log snapshot’ındaki ev/deplasman baskı değerlerinden üretilmelidir; güncel maç değeri tarihsel karara karıştırılmamalı, veri eksikse sıfır uydurmak yerine `Veri yok` gösterilmeli veya bileşen gizlenmelidir. Ev/deplasman renkleri ve takım yönleri ekran genelindeki mavi/yeşil semantiğiyle aynı kalmalı, değer ve fark erişilebilir metinle açıklanmalıdır. | MEDIUM | READY |

| NXT-OBS-086 | 2026-08-12 | Toto notification idempotency çakışması | Kullanıcı yalnız Toto bildirimlerinin ulaşmadığını, diğer türlerin çalıştığını bildirdi. Local/public BFF health ve notification/device registration `configured`; `/v1/notifications` public route erişilebilir ve kimliksiz isteği beklenen HTTP 401 ile reddediyor. Yerel ABAP kanıtında `ZBET_P_TOTO_AUTO` varsayılan `p_notify = X` ile `type='toto'` gönderiyor; ancak `ZBET_CL_MAIN->SEND_NOTIFICATION` idempotency hash’i yalnız `type + sy-datum + title + body + rating + match id/date/time` alanlarından üretiyor. Toto çağrısı match alanlarını vermediği için aynı gün aynı başlık/gövdeyle yapılan tekrarlar aynı key’e düşüyor; standalone ledger completed kaydı ikinci teslimi bilinçli olarak bastırırken endpoint HTTP 200 döndürüyor. ABAP response body’yi okumayıp tüm 2xx cevapları `ev_sent = X` saydığı için duplicate teslim kullanıcıya başarılı görünür. Düzeltme Toto producer sahipliğindedir: idempotency key’e stabil Toto olay kimliği (`gc_no`, `version_no`, işlem/run veya sonuç snapshot kimliği) eklenmeli; salt timestamp/rastgele değerle retry koruması bozulmamalı. BFF duplicate sonucunu ve ABAP producer sonucunu kalıcı, secretsiz telemetry’ye yazmalı; aynı olay retry’si tek teslim, aynı gün yeni Toto olayı yeni teslim testleri geçmelidir. SAP kaynak değişikliği/aktivasyonu `BTB Toto - Aktif` task’ında ayrı onayla yapılmalıdır. | HIGH | OBSERVED |

| NXT-OBS-087 | 2026-08-13 | Kullanıcıya özel Super notification yıldız eşiği | Backend notification tablosundaki minimum yıldız sistem geneli alt sınır olarak kalmalı (ör. `1`); kullanıcı Mobile `Daha Fazla > Bildirimler` altında ayrı bir `Super bildirim eşiği` seçebilmeli: `1+`, `2+`, `3+`, `4+`, `5 yıldız`. Bu tercih liste/Super filtrelerinden bağımsız, yerel ve kalıcı olmalı; varsayılan `1+` mevcut davranışı korumalıdır. Etkin görünür eşik fiilen `max(backend global minimum, kullanıcı tercihi)` olur; Mobile backend’in izin vermediği daha düşük yıldızı geri açamaz. Mevcut Android FCM mesajları data-only çalışıyor ve background task önce widget’ları güncelleyip sonra yerel görünür notification üretiyor. Bu nedenle Android pilot için en güvenli çözüm tüm geçerli veriyi almaya devam edip widget güncellemesini her mesajda çalıştırmak, yalnız `presentAndroidNotification` adımını AsyncStorage’daki kullanıcı eşiğine göre bastırmaktır; böylece düşük yıldız bildirimi görünmez ama performans/widget güncelliği bozulmaz. Seçim UI’si mevcut yıldız seçeneklerini yeniden kullanmalı, değer değişince sonraki mesajdan itibaren etkili olmalı; bozuk/eksik tercih fail-safe `1+` olmalı. General ve Toto bildirimleri etkilenmemeli. Testler eşik altı Super’de `widget updated + notification not presented`, eşik ve üstünde ikisinin de çalışması, tercih kalıcılığı, geçersiz rating ve cold/background task durumunu kapsamalıdır. Pilot Android’ın legacy `BTB` topic aboneliği görünür filtreyi bypass edebilecek ikinci bir üretici hattı olmadığı kanıtlanmalı veya kontrollü biçimde kaldırılmalıdır. OAuth/iOS çoklu cihaz aşamasında hesap bazlı server-side tercih ayrıca tasarlanabilir; mevcut pilotta tercih cihaz/kurulum bazlıdır. | MEDIUM | READY |
| NXT-OBS-088 | 2026-08-13 | Dark/Light switch ve Android widget tema eşleşmesi | `Daha Fazla > Uygulama görünümü` mevcut açılır/uyarı seçimi yerine erişilebilir bir `Switch` olmalı; kapalı durum `Açık`, açık durum `Koyu` temayı temsil etmeli ve görünen metin yalnız renge bağlı kalmadan aktif modu belirtmelidir. Switch en az 44–48 dp dokunma alanı, erişilebilirlik rolü/durum açıklaması ve tema değişirken tekrarlı dokunmayı önleyen kısa geçiş durumu taşımalıdır. Tema tercihi mevcut kalıcı uygulama ayarında tek kaynak olarak korunmalı; seçim değiştiğinde uygulama temasından önce native widget katmanına senkronize edilerek hem BTB bildirim widget’ı hem BTB Performans widget’ı veri kaybetmeden hemen yeniden çizilmelidir. Bilyoner/widget içerik verileri değişmemeli; yalnız arka plan, yüzey, metin, ayırıcı, pasif halka ve vurgu renkleri merkezi light/dark widget paletinden gelmelidir. Native `btb-widget` modülü tek bir `setTheme`/resolver giriş noktası ve ortak preference kullanmalı; CDN veya renk değerleri provider’lara dağınık hard-code edilmemelidir. Uygulama açılışında ve widget yeniden oluşturulduğunda kayıtlı tercih tekrar senkronize edilmeli; eksik/geçersiz değer mevcut koyu tema davranışına güvenli biçimde dönmelidir. İki widget provider’ı aynı preference değişikliğinde `updateAllWidgets` ile güncellenmeli. Testler switch kalıcılığı, uygulama yeniden yüklenmesi öncesi native senkronizasyon, iki modda iki widget’ın okunabilirliği/kontrastı, mevcut widget verisinin korunması, bozuk tercih fallback’i ve fiziksel Android launcher smoke kontrolünü kapsamalıdır. | MEDIUM | READY |

| NXT-OBS-089 | 2026-08-13 | Maç ve Super detay özet kartı görsel parity | Fiziksel ekran karşılaştırmasında iki detay kartının temel dili uyumlu olsa da alt metrik yerleşimi farklı yoğunlukta kalıyor. Super kartındaki karar/biten skor ayrımı tarihsel bağlam için korunmalı; ancak seçim, seçim oranı ve kâr aynı yatay metrik ritmine alınarak soldaki yığılma ve gereksiz kart yüksekliği azaltılmalı. Canlı kartta seçim solda, seçim oranı ile güncel oran sağda dikey yığılıyor; bu bölüm `Seçim / Seçim oranı / Güncel oran` şeklinde dengeli üç kolon olmalı. İki kart lig-tarih-durum üst satırı, takım/maç adı alanı, ayırıcı, label/value baseline, iç padding ve minimum yükseklik için ortak hero token/bileşen düzenini paylaşmalı; buna karşılık `karar anı ↔ biten skor` ile `canlı skor` semantiği tek tipe zorlanmamalıdır. Uzun takım ve lig adları, büyük yazı, dar ekran, açık/koyu tema ve gelecekte participant ID geldiğinde eklenecek kulüp logoları layout sıçraması oluşturmadan desteklenmelidir. | MEDIUM | OBSERVED |

| NXT-OBS-090 | 2026-08-13 | Toto program güncelliği ve ikramiye görünümü | Toto Programı detayında güvenilir `updatedAt` alanı Mobile DTO ve BFF mapper'da mevcut; ekran program başlığı veya Sonuçlar kartı yakınında yerel tarih-saatle `Son güncelleme: 13 Ağu 2026 · 10:02` biçiminde göstermeli ve bu değeri cihazın sorgu zamanı gibi sunmamalıdır. Mevcut Mobile/BFF Toto sözleşmesinde ikramiye alanı bulunmuyor. Sonuç kaynağında doğrulanmış ikramiye mevcutsa sözleşmeye nullable tutar ve para birimi (ör. `prizeAmount`, `prizeCurrency`) eklenmeli; yalnız sonuçlanmış programda ve pozitif/geçerli tutarda Sonuçlar kartında `İkramiye` olarak para formatıyla gösterilmelidir. Eksik değer `0` gibi yorumlanmamalı, tahmin/main hit/kapsam sayısından tutar türetilmemeli ve alan yoksa bölüm tamamen gizlenmelidir. Kaynak SAP/Toto alanı, OData adı ve para birimi cutover öncesi ilgili `BTB Toto - Aktif` sahipliğinde doğrulanmalı; Mobile tarafı yalnız sabit read-only DTO'yu göstermelidir. | MEDIUM | READY |

| NXT-OBS-091 | 2026-08-13 | Karar Günlüğü yıldız sıralaması | Karar Günlüğü, mevcut durum/gün/yıldız filtrelerinden bağımsız olarak yıldız derecesine göre artan ve azalan sıralanabilmeli. Üst satıra yeni bir chip ekleyerek dar ekranı sıkıştırmak yerine mevcut yıldız açılır menüsü iki açık bölüme ayrılmalı: `Yıldız filtresi` ve `Sıralama`. Sıralama seçenekleri `Varsayılan` (ek yıldız sıralaması uygulamadan ekranın bugün kullandığı mevcut/en yeni karar sırasına kesin dönüş), `Yıldız: yüksekten düşüğe` ve `Yıldız: düşükten yükseğe` olmalı; yalnız aktif yıldız sıralamasında trigger üzerinde küçük fakat renge bağlı olmayan yukarı/aşağı ok görünmelidir. Kullanıcı sıralamayı temizlediğinde veya `Varsayılan`ı seçtiğinde liste hemen mevcut doğal sırasına dönmelidir. Yıldız sıralaması yalnız mevcut gün kapsamı, durum tabı ve yıldız filtresinden kalan sonuçlara uygulanmalı; eşit yıldızlı kararlarda kararlı ikincil sıra en yeni karar önce olmalıdır. Seçim listeyi yeniden fetch etmeden yerel olarak sıralamalı, scroll konumunu kontrollü biçimde başa almalı, yıldız ve gün menüleri aynı anda açık kalmamalı, 44–48 dp hedef/Android geri/dışarı dokunma/büyük yazı ve dar ekran davranışları korunmalıdır. | MEDIUM | READY |

| NXT-OBS-092 | 2026-08-13 | Canlı güncel baskı farkı ve detay dengesi | Canlı Maçlar kartındaki baskı farkı tarihsel Super karar değerinden değil en son güncel maç snapshot'ından gelmeli ve açıkça `güncel baskı farkı` olarak etiketlenmelidir. Mevcut Mobile DTO `pressureDiff` / `totalPressure` alanlarını BFF'de `last_pressure_diff` / `last_total_pressure` üzerinden mapliyor; fiziksel cihaz gözleminde gösterilen değerin güncel olmadığı görüldüğü için cutover'da `Mobile liste/detay -> BFF mapper -> OData entity/property -> SAP current match source` zinciri doğrulanmadan yalnız etiket değiştirilmemelidir. Canlı maç detayında ortak `PressureBalance` düzeni yeniden kullanılmalı, başlığı `Güncel baskı dengesi` olmalı ve yalnız current-match `totalPressure` / `pressureDiff` snapshot'ından beslenmelidir. Super detayındaki `Karar anı baskı dengesi` tarihsel Super Log snapshot'ı olarak aynen kalmalıdır. Güncel veri eksik veya stale ise sıfır uydurulmamalı; `Veri bekleniyor` ya da stale açıklaması gösterilmelidir. Liste ve detay aynı değer, yuvarlama, yön ve zaman damgası semantiğini kullanmalı; pull-to-refresh/query refresh sonrası birlikte güncellenmelidir. | HIGH | READY |

| NXT-OBS-093 | 2026-08-13 | Toto tamamlanan maçlarda biten skor | Toto Programı detayındaki Tahminler listesinde sonuçlanan her maç için yalnız `Sonuç 1/X/2` değil biten skor da gösterilmelidir. Mevcut Mobile Toto fixture/prediction sözleşmesi yalnız nullable `actualResult` taşıyor; ev/deplasman biten skor alanı bulunmuyor. Cutover'da ilgili `BTB Toto - Aktif` veri sahipliğinde gerçek sonuç kaynağı doğrulanarak Mobile BFF DTO'suna birbirine bağlı nullable `homeScore` / `awayScore` alanları eklenmeli ve yalnız iki değer de mevcut, geçerli ve maç sonuçlanmışsa kartın sağ sonuç alanında kompakt `Skor 2-1` biçiminde gösterilmelidir. `actualResult` ana tahmin/kuponda/kapsam dışı sınıflandırmasının ayrı kaynak değeri olarak korunmalı; skor üzerinden sessizce yeniden hesaplanmamalıdır. Skor eksikse sahte `0-0` üretilmemeli ve mevcut `Sonuç 1/X/2` görünümü korunmalıdır. Dar ekran, büyük yazı ve uzun takım adlarında skor ile sonuç etiketi çakışmamalı; BFF şema/mapper/testleri ile Mobile şema/render testleri birlikte doğrulanmalıdır. | MEDIUM | READY |

| NXT-OBS-094 | 2026-08-13 | Ana menüler arasında yatay kaydırma | Alt navigasyondaki ana ekranlar `Özet -> Canlı -> Super -> Toto -> Daha Fazla` sırasıyla yatay parmak hareketiyle de değiştirilebilmelidir: sola kaydırma bir sonraki, sağa kaydırma bir önceki ana sekmeye götürmelidir. Davranış yalnız `(tabs)` ana ekranlarında etkin olmalı; detay ekranlarındaki sol-kenardan geri jesti aynen korunmalı ve iki jest aynı ekranda yarışmamalıdır. Yatay yön baskın değilse veya kullanıcı dikey liste kaydırıyorsa gesture yakalanmamalı; filtre menüsü, buton, link ve yatay etkileşimli alanlarda yanlış sekme değişimi önlenmelidir. Geçiş mevcut Expo Router tab durumunu, filtreleri ve mümkünse liste scroll konumunu korumalı; ilk/son sekmede wrap yapmamalı, kontrollü direnç gösterip yerinde kalmalıdır. Mesafe ile hız eşiği fiziksel cihazda tek elle kullanım için doğrulanmalı; kısa/yanlış hareket geri yaylanmalıdır. Alt menü aktif durumu hareket tamamlanınca yeni ekranla aynı anda değişmeli, açık/koyu tema ve reduced-motion erişilebilirlik ayarı korunmalı, ekran okuyucuda mevcut alt sekme navigasyonu birincil ve eksiksiz kalmalıdır. Android dikey scroll, pull-to-refresh, Bibi sürükleme/rehber, klavye ve sistem geri davranışları için regresyon testi yapılmalıdır. | MEDIUM | READY |

| NXT-OBS-075 | 2026-08-11 | Bibi rehberi ayarları | Daha Fazla ekranında yalnız `Bibi rehberini baştan başlat` eylemi bırakıldı; yinelenen durum satırı kaldırıldı. Android açık tema smoke’unda tek eylem düzeni doğrulandı. | LOW | READY |

| NXT-OBS-076 | 2026-08-11 | Genel UI düzeni ve insan-etkileşim standardı | Ortak `Screen`, filtre, bölüm başlığı ve metrik kartları 44–48 dp dokunma hedefi, 720 dp içerik sınırı, güvenli alan, tutarlı spacing/tipografi ve dar ekranda wrap kurallarıyla düzenlendi. Super ve Maç detay metrikleri okunabilir iki kolon ritmine taşındı; standart `docs/UI_INTERACTION_STANDARD.md` altında yazılı kabul kapısı oldu. Android açık tema emülatöründe giriş, Özet ve Maç Detayı görsel/dokunmatik smoke geçti. | HIGH | READY |

| NXT-OBS-100 | 2026-08-18 | Doğal kırmızı kart gözlemi (release engeli değil) | Gerçek bir kırmızı kart doğal olarak oluştuğunda `Olaylar` modülünde şunlar gözlemsel olarak doğrulanır: satırın kırmızı kart olarak görünmesi, `DIRECT_RED` / `SECOND_YELLOW_RED` ayrımının erişilebilirlik etiketinde okunması, skorun kırmızı kart satırında gösterilmemesi, sarı kartın hâlâ görünmemesi ve `diagnostics` sayaçlarının beklendiği gibi olması. Sağlayıcı sözlüğünde `RED_CARD` / `SECOND_YELLOW_CARD` / `YELLOW_RED_CARD` ve dismissal-without-subtype değerleri gerçek veriyle henüz görülmedi. Sorun çıkarsa yeni defect açılır; kırmızı kart uydurulmaz. | LOW | OBSERVED |
| NXT-OBS-101 | 2026-08-18 | Kanonik BTB marka varlığı (Phase E) | `assets/icon.png` kare koyu zemini raster'ın **içine gömülü** taşıyor: 192x192 RGBA, tam saydam piksel sayısı **0**, alfa aralığı 221..255, dört köşe de `(0, 8, 27, α=221)`. Zemin container kaynaklı değildir, bu yüzden kodda düzeltilemez. `ASSET_GENERATION_DEPENDENCY` kaydedildi; ayrıntı ve kanıt aşağıdaki bölümdedir. Placeholder, zemini silinmiş ya da rengi kaydırılmış varlık üretilmedi. | HIGH | BLOCKED_ON_ASSET |

| NXT-OBS-099 | 2026-08-18 | Live Context gerçek olay yolu — SAP köprüsü (SAP onayı bekliyor) | `READY_FOR_SAP_ACTIVATION_APPROVAL`. 2026-08-18 ölçümü, erişim teşhisini **güçlendirdi**: `curl` artık yalnız hedef uçta değil, SAP'ın üretimde başarıyla kullandığı uçlarda da (`gamelist/all/v1`, `livestatistics`, `standing`) 400 users-api login kapısı alıyor; buna karşılık SAP güncel maç gününü (50 fikstür) Bilyoner'den yüklemiş durumda. `curl` düz `curl/` user-agent gönderirken reddedildiği için fark **header kaynaklı olamaz**; ayrım istemci istek profilindedir. Önceki oturumdaki "curl çalışıyor, Node çalışmıyor" çerçevesi zamanlama tesadüfüydü — kalıcı olgu: **SAP çalışıyor, bu makinedeki doğrudan istemciler kapıda**. Çözüm: çalışan SAP HTTP istemcisini ödünç almak (TLS parmak izi taklidi **değil**). Yerel olarak hazır: `zbet-abap` salt-okunur köprü sınıfı (kalıcılık yok, DDIC yok, dondurulmuş URL şablonu, TVARVC anahtarı + token, boyut sınırı) ve `zbet-cap` SAP_BRIDGE upstream'i + 19 test. SAP nesnesi **oluşturulmadı/aktive edilmedi**; aktivasyon ayrı açık onay gerektirir. | HIGH | OBSERVED |

| NXT-OBS-098 | 2026-08-17 | Gerçek gol/kırmızı kart verisiyle doğrulama | **KAPANDI (2026-08-18 release).** `REAL_GOAL_VALIDATION = PHYSICAL_PASS` — gerçek GOAL olayları fiziksel Xiaomi doğrulamasında görüldü; sunucu tarafında da uçtan uca kanıtlandı (canlı route HTTP 200, `btb.live-context.v2`, 3 gerçek gol, dizilişler yok, 4 sarı + 12 değişiklik + 2 bölüm işaretçisi `excludedByScope` ile dışlandı). `REAL_RED_CARD_VALIDATION = OWNER_ACCEPTED_PENDING_NATURAL_OBSERVATION` — kırmızı kart uygulaması doğrulanmış sözleşme, normalizer semantiği ve otomatik testler temelinde sahip tarafından kabul edildi. **Gerçek bir kırmızı kartın fiziksel olarak gözlendiği iddia edilmiyor**; bugüne dek hiçbir gerçek sağlayıcı yanıtında kırmızı kart görülmedi. Doğal bir kırmızı kart yalnız gözlemsel doğrulamadır ve release engeli değildir — bkz. `NXT-OBS-100`. | MEDIUM | CLOSED |

| NXT-OBS-097 | 2026-08-17 | Live Context ürün kapsamı daraltıldı (sahip kararı) | Yayınlanan sözleşme `btb.live-context.v2` ile **yalnız gol ve kırmızı kart** taşır. Sıradan sarı kart, oyuncu değişikliği, bölüm işaretçisi ve muhtelif anlatım kapsam dışıdır; `İlk 11 ve dizilişler` modülü bileşen/ekran/sözleşme/varsayılan düzen dahil tamamen kaldırıldı (mevcut kurulumlar için ek göç gerekmez — düzen uzlaştırma kanonik olmayan id'yi ilk okumada düşürür). Kırmızıda `DIRECT_RED`/`SECOND_YELLOW_RED` ayrımı korunur ve erişilebilirlik etiketinde okunur. Kendi kalesine gol yalnız sağlayıcı açıkça belirtirse korunur. Kart yalnız ihraç olumlu kanıtlanırsa yayımlanır; tanınmayan genel kart değeri `UNCLASSIFIED_CARD` olarak dışlanır ve ham değeri `diagnostics.unclassifiedCardValues` içinde saklanır (yanlış-pozitif kırmızı üretilmez). Kapsam dışı sınıflar `diagnostics.excludedByScope` ile sayılır; `unknownFeedTypes` yalnız anlaşılmayan feed tipleri içindir. `eventSummary` yalnız yayımlanan timeline'dan türetilir, **betimleyicidir ve model girdisi değildir**; üretim Super skorlaması ve gol/kırmızı kart mantığı değiştirilmedi. Emülatörde dört durum da doğrulandı (dolu, boş, bayat, kullanılamıyor). | HIGH | RESOLVED |

| NXT-OBS-096 | 2026-08-17 | Bilyoner Live Context erişim sınıflandırması | `REQUEST_PROFILE_DIFFERENCE` — **`GLOBAL_PROVIDER_GATE` değildir**. Sahip düzeltmesi doğrulandı: BTB aynı sağlayıcı host'unu başka canlı veri için başarıyla kullanıyor. Kanıt zinciri, aynı makineden, aynı uca, aynı event üzerinde: (1) SAP testten ~1 dk önce sağlayıcıyı başarıyla çağırmış — dört canlı maçta `ZBET_BILYONER_LIVE_CALC` baskısı, `press_snap_at` yaşı 0,9-1,0 dk; (2) BFF egress (Node) → HTTP 400 login kapısı; (3) **aynı makineden `curl` → HTTP 200** (detay ucu 1262 bayt); (4) `node:https` → yine 400. SAP `127.0.0.1:50000`, yani aynı host. curl ve Node ikisi de HTTP/1.1 konuşuyor. Dolayısıyla neden egress/IP değil, uca özgü değil, header değil, HTTP sürümü değil → fark **TLS istemci parmak izi** düzeyindedir. Bu, önceki oturumda kayda geçmemiş "kaynak-IP throttle" hipotezini geçersiz kılar (o tespit yalnız Node ile ölçülmüştü; curl baştan sona çalışıyordu). Karar sahibe aittir: meşru erişim (ör. sağlayıcıyla anlaşma/dokümante API) çözülmeden `BTB_LIVE_CONTEXT_ENABLED` açılmaz. Çerez kopyalama, oturum tekrarı, giriş otomasyonu ve parmak izi taklidi kapsam dışıdır ve yapılmadı. | HIGH | OBSERVED |

| NXT-OBS-095 | 2026-08-17 | Canlı maç fiziksel doğrulaması | `PENDING_LIVE_MATCH_VALIDATION` — **bloklamayan**. 2026-08-17 fiziksel Xiaomi turunda uygun canlı maç bulunmadığı için gerçek CANLI durum kontrolü yapılamadı; diğer bütün fiziksel kapılar PASS ve Mobile Next baseline bu madde olmadan kapatıldı. Takip yalnız şunları kapsar: canlı maç normal açılıyor; canlı skor/dakika yenilemesi sağlıklı kalıyor; Game Pulse doğru davranıyor; Maç Detayı canlı durumda kararlı kalıyor; prospective collector canlı snapshot'ı yakalıyor; SAP/BFF gecikmesi sağlıklı kalıyor. Sağlayıcı runtime devre dışı olduğundan gerçek Timeline/Kart/Gol verisi bu maddenin kapsamında **değildir**; kontrol yalnız mevcut canlı davranışı ve dürüst kullanılamıyor durumunu doğrular. Yeni APK veya kod değişikliği gerekmez. | MEDIUM | OBSERVED |

| NXT-OBS-077 | 2026-08-11 | Bibi hedef vurgusu ve kapsamlı rehber | Rehber v2 Özet, Canlı, Super, Toto, Daha Fazla, Maç Detayı ve Super Detayı üzerindeki önemli kart/filtre/özet/sıralama alanlarını hedef kimliğiyle bağlar. Balon ölçülen hedefin üstüne veya altına yerleşir; adımlar kısa ve bağlamsaldır, ilerleme sürümlü saklanır ve tek yeniden başlat eylemi korunur. Android emülatöründe Özet üzerindeki üç ardışık hedef doğrulandı. | MEDIUM | READY |

| NXT-OBS-078 | 2026-08-11 | Detay ekranı edge-swipe navigasyonu | Maç, Super ve Toto detaylarında yalnız sol 32 dp kenardan başlayan yatay hareket etkinleştirildi; 76 dp/hız eşiği sonrası mevcut navigation stack ile geri döner, dikey kaydırmayı ve ana sekmeleri etkilemez. Android emülatöründe Maç Detayı → Özet kenar sürükleme dönüşü görsel olarak doğrulandı. | MEDIUM | READY |

| NXT-OBS-079 | 2026-08-11 | Opsiyonel açık tema | Koyu varsayılan korunarak aynı semantik token setinden tam açık palet üretildi. `Daha Fazla > Uygulama görünümü` seçimi güvenli depoda kalıcıdır ve kontrollü uygulama yenilemesiyle bütün ekranlara uygulanır. Android koyu/açık bundle ve açık tema release emülatör smoke’u geçti. | LOW | READY |

| NXT-OBS-080 | 2026-08-11 | Bibi hedef vurgusu regresyonu | Sabit koordinat ve tahminî dikdörtgenler kaldırıldı. `TutorialTarget` gerçek React Native bileşenini `measureInWindow` ile ölçer, yalnız aktif nesnenin sınırına 2 dp BTB yeşili çizer ve adım/ekran/kapanış değişiminde çerçeveyi temizler. Özet hero, Günlük Super ve ilk maç hedeflerinde ardışık emülatör ekran kanıtı alındı; eski büyük çerçeve özel durumu düzeltilip tekrar doğrulandı. Fiziksel telefon parity’si observation’da beklenir. | HIGH | READY |

| NXT-OBS-081 | 2026-08-11 | Açık tema kapsam netliği | Açık tema yalnız arka plan değil; yüzey, metin, sınır, durum, grafik, Bibi, sistem durum çubuğu, giriş/splash ve navigation renklerini ortak semantik paletten üretir. Giriş, Özet, Maç Detayı, rehber balonu ve hedef çerçeveleri açık tema release APK üzerinde görsel doğrulandı; seçim koyu varsayımı bozmadan kalıcıdır. | MEDIUM | READY |

## 2026-08-18 Design V2 geri bildirim pass disposition

Fiziksel Xiaomi kullanımından çıkan dört maddelik sıra kapatıldı. Kod çalışma
ağacındadır ve **commit edilmemiştir**; commit/push ayrı açık onay gerektirir.
Kapı her adımda temiz: TypeScript, ESLint, `git diff --check` ve **387/387**
test (öncesi 342).

- **Phase D — paneller + kalıcılık.** `liveDetail` ve `superDetail` modülleri
  açılır/kapanır panel oldu. Kalıcılık `surface + kanonik modül id` ile ayrı bir
  depo anahtarında; saklanan değer kapalı kümedir, bu yüzden mevcut kurulum
  yükseltmede her şeyi açık bulur ve sonradan yayınlanan modül gizlenemez.
  Sıralama tercihi ve panel tercihi bağımsızdır. Hero yapısal olarak kapatılamaz.
- **Xiaomi canlı kart.** Alt metrik satırı yeniden tasarlanmadı; karar
  verilmemiş kartta yalnız gerçek değeri olan blok gösteriliyor, böylece üç ayrı
  `bekleniyor` etiketi tek dürüst ifadeye indi. Taşmaya karşı `flexWrap` /
  `minWidth: 0` / `flexShrink` savunması eklendi, `SuperLogCard` da tarandı.
- **Phase E.** Kodda kapatılamaz; `NXT-OBS-101` ve aşağıdaki
  `ASSET_GENERATION_DEPENDENCY` bölümüne bakınız.
- **Phase F/G.** Bibi tek seferlik mikro animasyon + uzun cooldown'lı yerel
  feature-discovery motoru. `LiveDot` ürünün tek sürekli ambient animasyonu
  olarak kaldı. `bibi-presence.ts` değiştirilmedi; Match Detail ve Super
  Decision Detail'de ambient Bibi yok. `Daha Fazla > Bibi ipuçları` ile
  `Normal` / `Sessiz`; `Sessiz` rehberi kapatmaz.

- **Super gün kapsamı varsayılanı (sahip isteği).** Karar günlüğü ilk açılışta
  `Bugün` kapsamında başlar. Kapsam route parametresindedir; kalıcı kullanıcı
  tercihi yoktur, bu yüzden ezilen bir tercih de yok. `Tüm günler` artık açık
  `scope=ALL` taşır, aksi hâlde seçilemez olurdu. `Bugün` yine en yeni maç günü
  demektir; backend, karar mantığı ve geçmiş veri değişmedi.

Fiziksel doğrulama bu maddelerin hiçbiri için **yapılmadı** — yeni ARM64 pilot
APK gerekiyor ve o da commit onayından sonra gelir.

## 2026-08-17 cutover disposition

- `NXT-OBS-090`, `091`, `092`, `093`, `094`: `mobile cutover start` bu maddeleri
  yeniden inceledi; kaynak kodda 2026-08-16 UX/etkileşim batch'inde zaten
  uygulandığı dosya/satır kanıtıyla doğrulandı (yeni kod değişikliği
  gerekmedi). Durumları `OBSERVED` -> `READY`; fiziksel cihazda madde bazlı
  ayrı doğrulama hâlâ bekleniyor (bugünkü fiziksel Xiaomi turu genel
  navigasyon/bildirim sağlığını ve Work Zone deep-link düzeltmesini
  doğruladı, bu beş maddeyi tek tek hedeflemedi).
- `NXT-OBS-073`, `074`, `086`: kapsam dışı bağımlılıklar nedeniyle
  değişmeden `OBSERVED` kaldı.
- `NXT-OBS-089`: kozmetik önceliklendirme nedeniyle değişmeden `OBSERVED`
  kaldı.
- Bu cutover ayrıca 2026-08-16 Work Zone migration'ının yol açtığı bir
  deep-link çift-hash regresyonunu buldu ve düzeltti (backlog'da önceden
  izlenen bir madde değildi). Ayrıntı, kod kanıtı ve fiziksel Xiaomi
  doğrulaması: `docs/observation_archive/cutover_2026-08-17.md`.

## 2026-08-13 cutover (02) disposition

- `NXT-OBS-089`, `091` ve `094`: yerel Mobile çözümü ve Android emülatör smoke'u
  tamamlandı; fiziksel ARM64 observation için `READY`.
- `NXT-OBS-090` ve `093`: Mobile + bounded BFF sözleşmesi/testi `READY`; public BFF
  yeni alanları ayrı BTP DEV deploy onayı verilene kadar yayınlamaz.
- `NXT-OBS-092`: tarihsel `last_pressure_*` değerinin güncelmiş gibi gösterilmesi
  kapatıldı ve güvenli null fallback `READY`; gerçek current-match pressure kaynağı
  SAP/OData alanı bulunmadığı için veri zenginleştirmesi `DEFERRED`.
- `NXT-OBS-073`, `074` ve `086`: ilgili upstream/operasyonel task blokajları nedeniyle
  açık kaldı; bu cutover sahte veri veya task sınırı aşan değişiklik yapmadı.

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
- `docs/observation_archive/cutover_2026-08-11-02.md`
- `docs/observation_archive/cutover_2026-08-13-01.md`
- `docs/observation_archive/cutover_2026-08-17.md`

## ASSET_GENERATION_DEPENDENCY — kanonik BTB marka varlığı (2026-08-18)

Phase E izi tamamlandı. Bu bir kod kusuru değildir ve kodda kapatılamaz.

**Kanonik varlık.** Tek BTB marka raster'ı `assets/icon.png` (192x192 RGBA).
Üç yerde kullanılır:

```text
app.config.ts:57   icon
app.config.ts:86   android.adaptiveIcon.foregroundImage
AppLaunchScreen.tsx:145  uygulama içi açılış logosu
```

Uygulama ikonu ile uygulama içi logo **aynı kaynağı** paylaşır. Handoff'un
"ortak kaynak kanıtlanmadıkça app icon değiştirilmez" koşulu bu yüzden
karşılanmıştır: aynı dosya değişince her iki yüzey birden değişir.

**Kare zemin nereden geliyor.** Raster'ın içinden. Ölçüm:

```text
assets/icon.png            192x192 RGBA · tam saydam piksel 0 · alfa 221..255
                           köşeler (0, 8, 27, α=221) — koyu lacivert, saydam değil
ic_launcher_foreground.webp 432x432 · tam saydam piksel 0 · köşeler (0, 8, 27, 221)
ic_launcher.webp            192x192 · tam saydam piksel 0
ic_launcher_round.webp      192x192 · tam saydam piksel 7951
```

Üçüncü satır belirleyici: APK'ya giren adaptive-icon **foreground** katmanı
kenardan kenara opak bir karedir. `mipmap-anydpi-v26/ic_launcher.xml` bir
`<background android:drawable="@color/iconBackground"/>` (`#04101E`) bildirir,
ama opak foreground onu tamamen örttüğü için bu arka plan hiç görünmez. Dördüncü
satır aynı sonucu tersten doğrular: yuvarlak varyantta saydam piksel vardır,
çünkü üretici aynı opak kareyi daire ile **kırpmıştır**. Launcher maskesi de bu
yüzden zemini değil, markanın kendi kenarlarını kırpar.

**Kodda ne yapıldı.** `AppLaunchScreen` logosundaki `borderRadius: 30` bir stil
tercihi değil, gömülü kareyi açılış gradyanı üzerinde gizleyen bir telafidir.
Kaldırılmadı — kaldırmak bugün görünür bir regresyon olurdu — ama gerçek varlık
geldiğinde aynı değişiklikte kaldırılması gerektiği kod içinde işaretlendi;
aksi hâlde artık maskelenmesi gerekmeyen bir çizimin köşelerini kırpar.

**Bağımlılık.** Gereken şey, şeffaf zeminli, gerçek anlamda yeniden tasarlanmış
BTB Intelligence Noir / Arcane-esinli özgün marka varlığıdır. Bu ortamda görsel
üretme/düzenleme yeteneği yoktur ve şunlar bilinçli olarak **yapılmamıştır**:
placeholder üretmek, mevcut logonun zeminini silmek, renklerini kaydırmak veya
mekanik olarak yeniden renklendirmek. Bunların hepsi handoff'ta açıkça
yasaklanmıştır ve hiçbiri marka sorununu çözmez.

Varlık geldiğinde beklenen biçim: adaptive-icon foreground kuralına uygun,
tam saydam zeminli, içeriği iç güvenli bölgede duran kare tuval. Takım
armalarına dokunulmadı.

**Yan bulgu — `assets/notification-icon.png` ölü kopya.** Dosya
`assets/icon.png` ile **bayt bayt aynıdır** (`sha256` eşleşiyor) ve hiçbir yerden
referans verilmemektedir: `app.config.ts` içindeki `expo-notifications`
eklentisi yalnız `color` ve `sounds` alır, `icon` almaz; kaynakta ve Android
kaynaklarında da geçmez. Android bildirim küçük ikonu alfa maskesi olarak
çizildiği için, tamamen opak bir raster küçük ikon yerine dolu bir kare verir.
Bu doğrudan `NXT-OBS-002` ile ilgilidir. Dosya **silinmedi** — varlık kararı
sahibindir; yalnız kaydedildi.
