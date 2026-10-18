# UX/Jinx tasarım checkpoint'i — doğrulama ve sahip testi

Görev TASK-0162 · 2026-10-18 · Başlangıç `3d2925b` · Tüm laboratuvar verileri sentetik.

## Kanıt sınıfları

18 October pressure/wheel follow-up: [bounded source, live SAP/OData, replay and
actual browser wheel evidence](PRESSURE_AND_WHEEL.md). Follow-up shared client
quality receipt: `pressure-wheel-quality.log`. Subsequent explicit owner approval
enabled separate Mobile display acceptance and the BFF update. Local/public API
schemas now pass with valid historical/current pressure; physical/authenticated
client screen acceptance remains pending. TASK-0152's model gate is unchanged.
The follow-up registered BundleOnly gate passed, exit 0, on the latest source:
type/lint/tests/tooling/brand, Doctor, Android JS bundle and verified edge web export.

Kaynak/test/bundle ve mock tarayıcı sonuçları birbirinden ayrı kaydedilir. Telefon
genişliğinde tarayıcı, fiziksel Android değildir. Başarılı bundle, kurulu APK kabulü
değildir. Kimlik doğrulaması olmadan gerçek web görevleri geçti denmez.

| Kapı | Durum / kanıt |
|---|---|
| İki bağımsız kaynak incelemesi | TAMAM: UX_REVIEW.md ve STATISTICS_REVIEW.md; ilk raporlar birbirinden bağımsız. |
| Birleşik öncelik listesi | TAMAM: COMBINED_FINDINGS.md. |
| İki görsel aday ve alfa/boyut kontrolü | TAMAM: 6 kare, 641.512 bayt, 320×320 RGBA; ASSET_PROVENANCE.md ve asset-validation.json. |
| Olay/yaşam döngüsü ve istatistik yardımcı testleri | İlk hedefli çalıştırma: 13/13 geçti; final kalite kapısı ayrıca kaydedilir. |
| Final type/lint/unit/tooling/brand/doctor | GEÇTİ: önerilen ekran yönünün uygulanmasından sonra kayıtlı `invoke-mobile-check.ps1 -BundleOnly`, `approved-design-quality-final.log`. Önceki A entegrasyonu `implementation-quality.log`, prototip `quality-final.log`. |
| Android JS bundle + doğrulanmış edge web export | GEÇTİ: son kaynak Android production JS bundle ve edge auth/config/secret taramalı web export aynı approved-design final kapısında geçti. İmzalı APK değildir. |
| Masaüstü ve dar mock tarayıcı | GEÇTİ, sınırlı smoke: 1280×720 ve 390×844; aşağıdaki çalıştırılmış kontroller. Fiziksel cihaz ve gerçek oturum kabulü değildir. |
| Fiziksel Android / büyük yazı / TalkBack / akıcılık | BEKLİYOR: `adb devices -l` bağlı cihaz göstermedi. |
| Kimlik doğrulanmış gerçek web / gerçek veri | BEKLİYOR: mevcut Cloudflare Access oturumu yok; giriş ekranına ulaşıldı. |
| Sahibin karakter seçimi | TAMAM: A — geliştirilmiş Jinx futbol topu seçildi; ortak yerel istemciye alındı. |
| Sahibin genel ekran yönü seçimi | TAMAM: sonraki “onaylıyorum devam edelim” mesajıyla önerilen yönün yerel ortak uygulamasına devam edildi. Git/yayın onayı sayılmadı. |
| Kullanıcı görev ölçümleri | BEKLİYOR: süre/yanlış yorum/yardım sayısı henüz toplanmadı. |
| Aktif ortak istemci kaynak uygulaması | YEREL UYGULANDI: seçilen A, onaylanan palet/yazı/kart/özet/arama/ayar yönü ve doğrulanmış UX/istatistik düzeltmeleri. |
| İki istemci release'i | YAPILMADI: commit/push, native APK build/signing, dağıtım ve web yayını onayı yok. Önceki kabul edilen çift korunuyor. |

## Çalıştırılmış yerel kontroller

- Son uygulama kalite kapısı exit 0 (`approved-design-quality-final.log`): type/lint/unit/tooling/brand, doctor, Android JS
  bundle, `node scripts/web.mjs export` ile doğrulanmış edge web çıktı/sır taraması.
  İlk denemede React ref render lint kuralı hatası yakalandı; Animated.Value state
  üzerinde başlatılarak düzeltildi, hedefli lint ve tam final kapı tekrar geçti.
- 13 hedefli saf test: doğru maç/revizyon/verified olay, tekrar önleme, gecikmiş finish,
  bağlam/skor düzeltmesi, arka plan/meşgul kullanıcı, WAIT/stale, hareket politikası,
  preview-only rota ve istatistik yüzde/tarih/payda köşe durumları.
- A/B sahne seçimi ilk masaüstü denemesinde karakterleri ekran dışına taşıyordu.
  Sahne rayı yanlarına, telefon denetimleri üstlerine alındı. Son DOM ölçümü:
  masaüstünde iki aday 271–529 px; 390 px telefonda 423–627 px aralığında ve yatay
  sınırlar içinde. Telefon belgesi genişliği 390 px; sayfa taşması gözlenmedi.
- Aktif sekmede DOM `aria-selected=true` doğrulandı. Seçilebilir düğmelerde açık
  `aria-pressed` kullanılır. Bu, tam klavye/ekran okuyucu görev kabulü değildir.
- Aynı gol yeniden gönderilince sahne sıra no ve işlenen olay sayısı değişmedi
  (gözlenen örnek: sıra 7 / olay 1). Yanlış/eskimiş olaylar saf testte reddedildi.
- Açık tema + telefon akışı: Inter araması, 4+ filtresi, maça geçiş, kart olayı seçimi,
  kullanıcı isteğiyle Jinx düşünme→WAIT yorum/kanıt açıklaması; geri dönüşte `Inter`
  araması ve `4+` seçimi korunuyor.
- Super'da karar anı/henüz sonuçlanmamış güncel durum ayrı; tarihsel %0/%1/%2,5 ve
  bilinmeyen payda açıklamaları erişilebilir metinde görüldü. Toto'da ana/kapsama,
  bekleyen sonuç ve sentetik kolon/maliyet açıklamaları görüldü.
- Hareketi kapatma tercihi ayarlardan kaydedildi, sayfa yeniden yüklendiğinde
  Hareketsiz geri geldi. İncelemeye bırakılırken Canlı tercihine dönüldü.
- Prototipin 14 opak metin/zemin çifti sRGB hesabında en az 5,5068:1 sağladı;
  tüm native/gradyan/odak durumlarının WCAG sertifikası değildir.
- Güncellenen routed belgeler sonrası 86 context rotası kontrol edildi: eksik rota
  yok. Mevcut bütçe uyarıları ayrı evidence dosyasında korunur. İki repoda diff-check geçti.

Kanıt klasörü: workspace `.codex-artifacts/ux-review-2026-10-18/`; final kapı
`approved-design-quality-final.log`; önceki entegrasyon `implementation-quality.log`, prototip `quality-final.log`, ilk başarısız deneme `quality.log`, kontrast
`prototype-contrast.json`, context `context-audit.json`, varlıklar `asset-validation.json`.
Canlı yerel inceleme: `http://localhost:8081/design-lab`; güvenli mock sunucu
`node scripts/web.mjs start --mocks` ile çalışır. Önceki 8092 statik önizleme bu
checkpoint'in kaynağı değildir. Gerçek Android ve Access oturumu adımları bekler.

## Seçilen A ile gerçek ortak istemci kaynak smoke'u

Bu bölüm `/design-lab` yerine asıl `/`, `/live`, `/super`, `/toto`, `/more` ve
detay rotalarını, mevcut mock runtime ile sınar; gerçek veri/cihaz kabulü değildir.

- Koyu masaüstü 1280×720 ve açık telefon 390×844: A değerlendirme kartının ayrılmış
  alanında; Sor/Yenile, skor ve oran kontrolleri açık. Telefon belge genişliği 390 px.
- Canlı masaüstü gömülü detayda floating Jinx yok; diğer sekmeye dönünce geri gelir.
  Bulunan odak hatası düzeltildi: mounted fakat odak dışı detay rezervasyon yapmaz.
  Odak dışı kart animasyonları da durur; biriken olay sonradan kutlanmaz.
- Canlı aramada Inter → detay → geri dönüşte `Inter` korunur. İstenen Jinx yanıtı
  WAIT/Bahis önerisi yok ve demo açıklamasıyla geldi. Kanıt ve kaynak açma düğmeleri
  `aria-expanded=true` verir; sentetik kaynaklar gerçek alınan kaynak sayısına girmez.
- Canlı/Sakin/Kapalı düğmelerinin `aria-pressed` durumu ve Kapalı'nın reload sonrası
  korunması doğrulandı. Gizle karakteri kaldırır; Göster geri getirir. Hızlı menü açılır,
  expanded durumu ve dört gezinme düğmesi görünür. Canlı/görünür ve koyu tema geri kondu.
- Arama modalı textbox'a odaklanır; Shift+Tab son linke sarar, Escape arama açacına
  geri döner. Arka plan `inert` ve `aria-hidden` iken kapatınca eski durum geri gelir.
  Yardım modalında tek kapat düğmesinde Tab sarar. Bu sınırlı keyboard smoke'dur.
- Super tablosu gerçek cell/columnheader/link rolleri verir; karar linkinde Enter
  doğru tarihsel detay rotasını açar. Toto kuponu 21 veri hücresi ve maç linkleri verir;
  Toto detayda da ambient Jinx yok. Bahis/kupon işlemi yapılmadı.
- Runtime olay adaptörünün 10 saf testi: ilk yükleme, yanlış kimlik, eski/future veri,
  sentetik/çelişkili availability, skor artışı tek başına, tekrar ve ara düzeltme
  durumlarını kapsar. Canlı gol/devre, eski bağlamla veya sırf skor arttı diye üretilmez.
- Gerçek %200 browser zoom, Android büyük yazı/TalkBack, drag akıcılığı ve uzun liste
  karşılaştırması hâlâ bekler. Hiçbir UX başarı yüzdesi veya performans artışı iddia edilmez.

## Onaylanan ekran yönünün ortak uygulaması

- Palet laboratuvarla aynı saf `experience-palette.ts` kaynağından gelir. Koyu ink/sage,
  sıcak açık yüzeyler; düşük gölge ve daha sakin vurgu. Body 15/22, metadata 13/18,
  metric label 12/17. Eylem fill/foreground ile ana/ikincil/analitik metinlerin gerçek
  zemin ve iki gradient stopunda en az 4.5:1 koşulu testte geçti.
- Özet varsayılanı metriklerle başlar. Web'de özet bütün satırı kaplar, ardından
  grid görsel/DOM/klavye sırasını izler. Android'de aynı sıra tek modül sütunundadır.
  Kullanıcı tarafından saklanmış düzen sıfırlanmaz.
- Maç kartında skor kendi takım satırına bağlıdır; uzun adlar kesilmeden sarılır.
  Kayıtlı ve canlı oran aynı seçimin ayrı alanlarıdır. Sabitleme artık gezinme
  düğmesinin içinde değildir; 48dp bağımsız düğme ve pressed durumu kullanır.
  İlk klavye smoke'unda eski checkbox rolünün Space'i sayfa kaydırmaya bıraktığı
  gözlendi; button rolüyle Space sabitlemeyi değiştirdi ve ayrıca doğrulandı.
- Canlı'da `Inter` ve `Fatih` aramaları 4 kapsam / 1 sonuç, temizleme 4 sonuç verdi.
  Sıfır sonuçta kurtarma metni/Temizle kaldı. 390×844 açık görünümde uzun Fatih
  Karagümrük adı sarıldı, 12,75 seçim ve 14,50 canlı oran birlikte göründü;
  belge genişliği 390 px kaldı.
- Ayarlar görünüm/Jinx grubunu başa alır. Gizleme nötr boş durumdaki A görselini de
  kaldırır: sıfır sonuç metni kalırken görünür Jinx image sayısı ve ambient düğme
  sayısı 0 oldu. Canlı/görünür/koyu ve varsayılan viewport geri kondu.
- Toto listesi maliyeti işaretli kâr gibi `+384` göstermez; kaynaktaki sayı korunur,
  birim uydurulmaz. Detayda ana/kapsama farkı ve confidence tanım/kalibrasyonunun
  doğrulanmadığı açık. Bu düzeltme confidence tanımı veya model değişikliği değildir.
- Super liste/detayda kâr birimi/stake eksikliği görünür. Runtime modu bağlantı
  sağlığı diye sunulmaz; konfigürasyona dayalı gerçek-veri modu noktası da yeşil
  başarı yerine nötrdür. Bütün mock Screen'lerde örnek veri etiketi bulunur.
- Guide/discovery konumu render sonrası ölçülen yüksekliği kullanır. Fiziksel
  büyük yazı/rehber kabulü hâlâ yapılmadı. Native push/widget araçları mevcut cihaz
  işlevleri olarak korunur; web'deki karşılığı uygulama içi görünüm/ayar kontrolleridir.
- Son kayıtlı final kapı **exit 0**. Önceki aday kapıdan sonra kalan boş-durum Jinx
  görseli/tercih kapsamı ve mod rengi de düzeltildi; son kaynakla tam kapı tekrarlandı.
  İki bağımsız ilk rapor ve başarısız ara deneme kanıtları korunur.
- Son tarayıcı oturumunda error logu 0; viewport varsayılan 1280 px ve belge de
  1280 px. Yerel Özet ekranı incelemeye bırakıldı. Son context audit: eksik rota 0,
  flagged current-state belge 0; iki repoda diff-check temiz.

## Sahip telefon smoke'u ve düzeltme batch'i (2026-10-18)

- `1c65275` APK sahibin telefonunda kurulu; Android smoke **geçmedi** (NXT-OBS-171..179).
  Web yayımlanmadı; `524f2e7` kabul edilmiş çift olarak kalır.
- Sahip kararları: soluk palet, açıklayıcı/çekinceli metinler ve günlük Super moodunun
  kaldırılması geri alınır; Jinx pilot `JINX_LEAN_PILOT_V1` (havuz güveni + Lehte/
  Dengede/Aleyhte) verir. Yukarıdaki "kâr ROI sayılmaz" ve "confidence tanımı uydurulmaz"
  ekran notları bu kararla kaldırıldı; anlamları değişmedi, yalnız gösterilmiyor.
- Yerel kanıt: BFF 626/626 + production build; istemci typecheck/lint, 672 birim,
  32 tooling, brand; BundleOnly kapısı (Doctor, Android production JS bundle, doğrulanmış
  web export + secret scan); mock web 412x915 koyu/açık ve 1280x800'de Özet yorumu ve
  baloncuğu, Jinx kartı, Baskı grafiği, "Yeni havuz" etiketi, seçili an payları.
- Sahip onayıyla commit/push yapıldı; BFF V4 ile yeniden başlatıldı ve canlı sözleşme
  smoke'u (6 canlı seçim, istemci şemalarıyla V4 ve V3) geçti. Canlı veride güncel aralık
  baskısı çoğunlukla `OBS_ACTIVITY_UNPROVEN` olduğu için Jinx son ölçülen aralığı (≤10 dk,
  dakikasıyla) kullanır; fiyatsız sinyal "Güncel oran yok" der.
- Bekleyen: yeni koordineli APK/web, kurulum sonrası web yayını ve iki sahip smoke'u.

## Tekrarlanabilir sahip testi — bekleyen gerçek kullanım

İki kısa oturum kullan. İlkinde Android'de mevcut→A→B, web'de B→A→mevcut;
ikincide başlangıç yüzeyini ve sırayı değiştir. Eş zorlukta başka sentetik örnekler
kullan; ilk yanıttan önce açıklama yapma. Gerçek maç verisini sentetik görevle karıştırma.

| Görev | Başarı ölçütü | Android | Web |
|---|---|---|---|
| Doğru maçı ara/filtrele, detay aç ve geri dön | Aynı maç, filtre ve arama bağlamı korunur | Bekliyor | Bekliyor |
| Kayıtlı ve güncel oranı açıkla | Farklı zamanlar ve aynı seçim doğru söylenir | Bekliyor | Bekliyor |
| Gol/kart/Super olayını seç ve kapat | Seçilen geçmiş olay güncel durumla karışmaz | Bekliyor | Bekliyor |
| Jinx'e sor; WAIT ve eski yanıtı yorumla | Maç yorumu ile bahis kararı ayrılır | Bekliyor | Bekliyor |
| Günlük Super'ın dönemini ve kapsamını söyle | Tarih/filtre/kayıt birimi doğru; kâr ROI sayılmaz | Bekliyor | Bekliyor |
| Tarihsel %1 ile %2,5'i ve örneklemi karşılaştır | Geometri/etiket doğru; eksik payda fark edilir | Bekliyor | Bekliyor |
| Toto ana/kapsama/maliyet ayrımını açıkla | Kapsama kupon kazanması sayılmaz; confidence tanımı uydurulmaz | Bekliyor | Bekliyor |
| Canlı/Sakin/Kapalı, sistem hareket azaltma ve gizleme | Metin/işlev kalır; dekoratif hareket durur | Bekliyor | Bekliyor |

Her görev için koşul, yüzey, doğru/yanlış/eksik yanıt, süre, yardım sayısı, gereksiz
geri dönüş sayısı, rahatsızlık ve tercih gerekçesi kaydet. Estetik beğeni ile anlama
başarısını ayrı tut. Tek sahibin tekrarlarından nüfus başarısı, p-değeri veya genel
tercih yüzdesi çıkarma. Kritik yanlış anlamayı öğretim sonrası da koruyan aday aktif
geçiş kabulü alamaz.
