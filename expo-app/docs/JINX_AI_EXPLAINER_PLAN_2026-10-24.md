# Aşama A — Jinx'i RB1 kanıtını açıklayan Gemini editörüne bağlama planı

Plan tarihi: 2026-10-24. Güncel koda karşı doğrulama: 2026-10-25.
Sahip: BTB Mobile Next - Aktif / btb-mobile. Görev: TASK-0189, P2, IN_PROGRESS, REVERSIBLE_CHANGE.
Durum: 2026-10-25 yerel uygulama ve doğrulama tamam; scoped Git onaylı, teslim onayları bekliyor.
Planın ilk kayıt oturumu yalnızca belge ve görev kaydı üretti.
[Uygulama ve doğrulama checkpoint'i](JINX_AI_EXPLAINER_BATCH_2026-10-25.md).

## Amaç ve kapsam

Jinx, mevcut RB1 kararını değiştirmeden, sunucunun hazırladığı Türkçe olgu
cümlelerinin kimliklerini Gemini ile seçip sıralayan bir açıklayıcı olacak.
Gemini yeni cümle, tahmin, güven puanı, yıldız, bahis önerisi veya seçim üretmeyecek.
Android uygulaması ve app.surklase.com web istemcisi aynı batch'te ilerleyecek.
BFF sözleşmesi ve Expo istemcisi Mobile Next kapsamındadır; BTB model davranışı
ve SAP yazımı bu işin kapsamı dışındadır.

Bu iş Aşama B'nin açılmasını beklemez. Aşama B:
[JINX_PROBABILITY_LAYER_PLAN_2026-10-24.md](../../../BTB%20Logs/model_lab/specs/JINX_PROBABILITY_LAYER_PLAN_2026-10-24.md).
Olasılık şeridi 29A / TASK-0153 / TASK-0150 nedeniyle kapalı kalır.

## Doğrulanan kaynak ve değişen referanslar

Satırlar aşağıdaki yerel HEAD'lere aittir; uygulama başında semboller yeniden
bulunur. Bunlar canlı SAP, çalışan BFF ortam ayarı veya yeni yayın kanıtı değildir.

| Repo | İncelenen HEAD |
| --- | --- |
| zbet-mobile | 429f89a3307196cbe5023bfbb8acadeafe4d20a8 |
| zbet-cap | 6910629e27f248a3697739ad94baebc55a211951 |

CURRENT_HANDOFF.md'nin en üstündeki güncel teslim kaydı, istemci kaynağını
3f3b5fd6af931e6f285ea82f50a55bce72e1915b olarak bildirir. İlk taslaktaki b501352
önceki teslimdir; yerel HEAD ile yayımlanmış kaynak aynı kavram değildir.

| Konu | Güncel dosya / satır ve anlamı |
| --- | --- |
| RB1 isteğinin engellenmesi | zbet-cap/srv/mobile-bff/router.js:607–662; başlık kontrolü 615, HTTP 409 ve USE_REBUILD_DECISION_EVIDENCE 616–617. Eski 598 / 590–644 referansları geçersizdir. |
| RB1 veri okuması | rebuild-provider.js:64 içindeki load özeldir; çıktı 184–187'de current, history, candidates ve jinx içerir. jinx.summary 186–187'de halen vardır. |
| Güvenli genel erişim | provider.js:1525 getRebuildMatch; rebuild-provider.js:215–218 getMatch ve stableRead. router.js:355–358 mevcut RB1 maç rotasıdır. |
| Jinx başlıkları | zbet-mobile/expo-app/src/api/http-mobile-api.ts:40 ortak decisionContextHeaders; X-BTB-Rebuild, Decision-Context v3, Selection-Display v2 ve Match-Clock v1 içerir. |
| Gerçek Jinx çağrıları | Aynı dosyada 227–230 assessment v4 + Analysis-Snapshot, 231–237 outlook v2; ikisi ortak başlıkları yayar ve RB1 409 dalına girer. |
| Quip düzeltmesi | http-mobile-api.ts:272–278 POST /v1/jinx/quip ortak RB1 başlıklarını yaymaz; router.js:784–803 ayrı rotadır. “Her Jinx çağrısı 409 alır” genellemesi doğru değildir. |
| Güncel kart | src/components/RebuildEvidencePanel.tsx:257 RebuildJinxCard; 264–268 seçilen/gösterilen kaydın metni; 279–287 Yenile yalnızca RB1 sorgusunu yeniler. |
| Kurallı metin | src/utils/rebuild-presentation.ts:6 publishedExplanation. Eski belirsiz dosya referansı yerine tam konum budur. |
| Eski assessment bağlantısı | src/screens/MatchDetailView.tsx:280 koşul, 285–302 mutation/otomatik istek, 755 JSX. Eski 758 referansı güncel değildir. |
| Varsayılan kapı | src/config/runtime.ts:37 mobileIntelligence varsayılanı OFF; MatchDetailView RB1 varken eski intelligence kartını ayrıca dışlar. Bu, çalışan ortamın bağımsız doğrulaması değildir. |
| DTO sınırı | src/api/rebuild-schemas.ts:26–43 öneri/maç sözleşmesi; jinx.source şu anda yalnızca BACKEND kabul eder. LIVE bu alana doğrudan yazılamaz. |

## A1 — RB1 açıklama sözleşmesi ve kanıt brief'i

1. Mevcut outlook rotasında RB1 açıklaması için açık sürümlü bir dal tanımla.
   v2'nin yalnızca olgu kimliği sıralama desenini kullan; eski v2/v3/v4
   payload'larını yeni RB1 anlamıyla sessizce değiştirme. İstemci/BFF şeması,
   başlıkları ve OpenAPI aynı batch'te güncellensin.
2. Başlık kaldırarak eski karar/veri yoluna dönme. RB1 dalını mevcut
   provider.getRebuildMatch erişimi ve stableRead doğrulamaları üzerinden besle.
   Özel load fonksiyonunu dışarı açarak veya ham OData okumasıyla korumaları aşma.
   Global PREPARED, kaynak kimliği, snapshot ve güncel seçim kontrolleri korunur.
3. current yalnızca güncel karar kimliğini ve özetini taşır. Baskı/havuz kanıtını
   aynı decisionId ile eşleşen history kaydından al; candidates güncel reddetme
   gerekçeleri içindir. İncelenen eski karar ile güncel aday kanıtını karıştırma.
4. Yeni RB1 brief modülü, jinx-evidence-brief.js:13 buildEvidenceBrief deseninden
   yararlansın; mevcut fonksiyonun eski matchDetail/superLogs şekli RB1 DTO'suyla
   doğrudan uyumlu kabul edilmesin. Her sabit cümle id, kaynak alanı, zaman rolü
   ve popülasyon taşısın.
5. Olgular: karar dakikası/pazarı, votesSupport/votesUsed baskı teyidi,
   poolWins/poolTotal havuz desteği, doğrulanmış directionConflict, güncel veya
   tarihsel skor koşulu ve veri eksikliği. Yalnızca aynı ekranda/kanıt açılımında
   zaten gösterilen alanları allowlist ile gönder. Ek görünmeyen veri yükleme.
6. jinx-market-state.js:51 marketState skor koşulu için yeniden kullanılabilir;
   RB1 market ve gösterilen skor için açık adaptör gerekir. Donmuş karar skoru,
   güncel skor, güncel fiyat ve eski fiyat ayrı zaman rolleriyle korunur.

## A2 — Gemini çalışma zamanı ve fallback

- jinx-outlook.js:413 createRuntimeJinxOutlookService üzerinden mevcut sağlayıcı
  çağrısını, istek aralığını, saatlik limiti, toplam zaman bütçesini, cache,
  eşzamanlı istek birleştirmesini ve skaler telemetriyi yeniden kullan.
  Yerel varsayılan model aynı dosyanın 32. satırında gemini-3.5-flash-lite;
  ortam bunu değiştirebilir. Bu plan model veya gizli ayar değiştirmez.
- jinx-evidence-brief.js:117 buildEvidencePrompt, 125 validateEvidencePlan ve
  134 renderEvidenceSections deseni korunur. Gemini yalnızca sunucunun verdiği
  enum kimliklerinden order döndürür; bütün olguları sıralayan mod ile en fazla
  iki olgu seçen kısa mod ayrı doğrulanır.
- Yeni RB1 yolunda buildAnalystPrompt ve serbest body yanıtına dönüş bulunmasın.
  Yeni olgu, tekrar, bilinmeyen kimlik ve serbest metin reddedilsin. Cümleleri,
  sınıfları ve sayıları sunucu oluşturur.
- Cache ve yanıt eşlemesi maç, decisionId, kanıt sürümü/içerik özeti ve güncelliği
  kapsasın. Eski karara/snapshot'a ait Gemini yanıtı yeni karta uygulanmasın.
- Gemini kapalı, anahtar yok, limit, timeout veya validasyon reddi durumunda
  mevcut publishedExplanation ve veri durumu korunur. Gemini başarısı veriyi
  güncel veya seçimi aktif yapmaz.
- Yeni açıklama DTO'sunda origin LIVE/DETERMINISTIC ayrı alanda gösterilsin;
  LIVE yalnızca Gemini sıralamasının kaynağıdır. Mevcut rebuild jinx.source
  BACKEND sözleşmesine eklenmesin; canlı maç veya bahis güveni anlamına gelmesin.
- Prompt, ham yanıt, SAP/Firebase/pilot bilgileri ve API anahtarı loga,
  kaynak dosyasına, teslim notuna veya istemciye girmez.

## A3 — Ortak Android/web kartı ve eski yolların kaldırılması

RebuildJinxCard mevcut donmuş karar metni, havuz desteği, gerekçeler ve güncel
oynanabilirlik ayrımını korusun. Yenile, RB1 okumasını ve o doğrulanmış kanıta
bağlı açıklamayı istesin; hata, boş veri ve yüklenmede kurallı metin kullanılabilsin.
Gemini isteğini mount/poll döngüsüne bağlayarak kontrolsüz çağrı üretme.
Android dokunma ve web klavye/fare aynı işleve ulaşsın; yüklenme/yenileme erişilebilir olsun.

Uygulama sırası: önce yeni sözleşme/kart/fallback, sonra aşağıdaki referans temizliği:

- AskJinxCard.tsx ve queries.ts:172 matchJinxOutlookQuery şu anda ekranlara bağlı
  görünmüyor; API, mock, synthetic adaptör ve test bağımlılıklarını birlikte tara.
- getJinxQuip: mobile-api.ts:92, http-mobile-api.ts:272 ve mock-mobile-api.ts:365;
  BFF router.js:784–803, server.js:9–12/47 ve jinx-quip.js çalışma zamanı bağlantılarını kaldır.
- v1 serbest metin buildAnalystPrompt (jinx-prompt.js:56; jinx-outlook.js:312)
  ve yalnızca bu yanıtı doğrulayan validateBody (313–323) yolunu kaldır.
  validateAnalystText halen jinx-outlook.js:209 factualSummary fallback'inde
  de kullanılıyor: son bağımlılık kalkmadan silme; gerekirse ortak yardımcıya taşı.
- MatchDetailView'deki koşullu JinxAssessmentCard/v4 mutation yolu gerçekten
  bağlıdır; “dosya kullanılmıyor” diye silinmez. RB1 açıklayıcıya geçişle ilgili
  API/mock/synthetic/test referanslarını birlikte kaldır veya açık uyumluluk
  sınırıyla devreden çıkar. analysis-context'in form/journey tüketicileri korunur.
- schemas.ts:866–910 eski outlook v1/v2 ve 971–1006 assessment v3/v4 ortak
  tanımları içerir. Yeni sözleşme ve kalan tüketiciler kontrol edilmeden topluca
  silinmez; rebuild-schemas.ts ve etkin form/journey şemaları korunur.
- v1/v3 istekleri yeni RB1 dalına kabul edilmez; uyumsuz sürümler açık hata alır.
  v4 JINX_LEAN_PILOT_V1 kullanıcıya sunulmaz. jinx-signal.js kaldırılır veya
  varsayılan kapalı sunucu kapısı altında kalır; ham oran “güven”, “edge” veya
  kalibre olasılık diye gösterilmez.
- use-jinx-daily-quip.ts ve jinx-week.ts yerel kurallı kalır
  (2026-10-21 sahip kararı). Gemini quip servisini kaldırmak bu yolu kaldırmaz.

## A4 — Uygulama sonrası kabul ve onay kapıları

Bu bölüm gelecekteki uygulamanın kontrol listesidir; bu belge oturumunda çalıştırılmaz.

1. BFF: zbet-cap içinde npm test ve mevcut üretim build kapısı. Mevcut
   test/mobile-bff-jinx-*.test.js ailesinde RB1 yönlendirmesi, kapalı sağlayıcı,
   timeout/limit, geçersiz kimlik, cache ayrımı, skor düzeltmesi, eski/güncel karar
   ve reconciliation senaryolarını doğrula. Eski davranış testlerini yeni
   sözleşmeye göre değiştir; koruma testlerini körlemesine silme.
2. İstemci: expo-app içinde npm run check, ilgili şema/kart testleri, Doctor,
   Android JS bundle ve node scripts/web.mjs export ile doğrulanmış web çıktısı.
   Desktop/telefon genişliğinde tarayıcı smoke; Android ve gerçek web'de sahip smoke.
3. İki yüzeyde aynı kanıt, sabit sayılar ve origin; hata anında kullanılabilir
   kurallı metin. Ham havuz payı/yıldız kazanma olasılığına dönüşmez. Model,
   yıldız, seçim, havuz, kupon ve learning davranışında değişiklik yok.
4. Fiziksel Android, TalkBack/klavye ve doğrulanmış web sonuçlarını gerçekten
   ölçülmediyse eksik olarak kaydet. Platform istisnası varsa ikamesini handoff'a yaz.
5. Commit/push, BFF DEV rollout/yeniden başlatma, native build/sign/private APK
   dağıtımı ve Cloudflare web yayını kendi açık onaylarını gerektirir.
   [COORDINATED_CLIENT_RELEASE.md](COORDINATED_CLIENT_RELEASE.md) uyarınca her
   istemci yayını aynı temiz/push edilmiş zbet-mobile commit'inden APK + web
   çifti üretir; client-release.mjs her iki hash'i doğrular. İki teslimi kapsayan
   onay, özel APK teslimi/kurulumundan sonra web yayını, iki smoke ve önceki
   kabul edilmiş çiftin korunması zorunludur. Production yetkisi yoktur.

Başlatma: sahibi bu planı BTB Mobile Next - Aktif içinde btb next cutover start
batch'ine alır. Bu dosyanın ve OPEN görevin oluşturulması kod uygulaması veya
teslim onayı değildir. Olasılık politikası açılmadan açıklayıcı çalışabilir.
