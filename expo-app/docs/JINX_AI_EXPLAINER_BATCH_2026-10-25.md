# TASK-0189 — Jinx RB1 açıklayıcı yerel batch

Tarih: 2026-10-25. Sahip: BTB Mobile Next - Aktif.
Durum: PAIRED_RELEASE_COMPLETE / TASK-0189 DONE / OBSERVATION.
Kapsam: [Aşama A planı](JINX_AI_EXPLAINER_PLAN_2026-10-24.md).
Başlatma: sahibin btb next cutover start ve aynı mesajdaki Android build talebi.

## Sonuç

Jinx, doğrulanmış RB1 kaydının beş sunucu cümlesini gösterir: karar, baskı
teyidi, havuz desteği, yön çelişkisi ve donmuş karar skorunun koşulu.
Gemini yalnız bu beş kimliğin eksiksiz sırasını döndürür. Serbest metin,
fazladan alan, eksik/tekrar/bilinmeyen kimlik reddedilir; kurallı cümleler kalır.
Anahtar, ham sağlayıcı gövdesi, takım adları veya görünmeyen kayıt alanları
prompt'a eklenmez. Tam kayıt anahtarı cache/istemci bağında yerel olarak tutulur.

Yeni sözleşme: jinx-rb1-explainer.v1. Mevcut GET
/v1/btb/matches/{key}/jinx-outlook, X-BTB-Rebuild=btb-rebuild.v1 ve yeni Jinx
sürümüyle çalışır; eski genel 409 engeli kaldırıldı. İsteğe bağlı
X-BTB-Jinx-Decision donmuş kaydı seçer. Ortak istemcinin Decision-Context ACK'i
korunur. Eski v1/v2/v3/v4 çağrıları açık 400 alır.

Okuma provider.getRebuildMatch / stableRead üzerinden gider; PREPARED,
kaynak/hash, snapshot ve ilk kanıt kontrolleri korunur. Açıklama history kaydına
bağlıdır. Gemini aktiflik, oynanabilirlik, yıldız, oran, sonuç veya olasılık belirlemez.

Ortak RebuildJinxCard yalnız Yenile ile açıklama ister; açılış/poll çağrı yapmaz.
Yanıt maç, karar ve donmuş kanıt anahtarı eşleşirse gösterilir. Farklı karar,
skor/kanıt veya kaynak hatasında kurallı metin kalır. Gemini sıralaması /
Kurallı açıklama etiketleri ayrıdır. Havuz payı kazanma olasılığına dönüşmez.

## Temizlenen yollar

- BFF quip rotası/servisi, serbest metin prompt/validator/kanıt toplama yolu ve
  v4 pilot signal kaldırıldı. Sağlayıcı transport'u yalnız order şeması üretir.
- AskJinxCard, JinxAssessmentCard, kullanılmayan assessment animatörü,
  eski API/query/mock/synthetic yolları ve eski Jinx şemaları kaldırıldı.
- Günlük yerel use-jinx-daily-quip / jinx-week, form, match journey ve ortak
  analysis-context korunur. Eski layout anahtarları migration için tutulur.
- assessValue / validPolicy matematiği korunur; aktif Jinx rotasına bağlı
  değildir. TASK-0190 / TASK-0153 / TASK-0150 kapalıdır.
- Eski metin üretimine özel testler kaldırıldı; kaynak bağı, yanıt reddi,
  zaman bütçesi, cache/limiter, telemetry, skor ve politika korumaları
  kalan veya yeni RB1 testleriyle doğrulandı.
- Yerel Jinx probe betikleri önceden doğrulanmış RB1 JSON dosyası ister;
  eski kaynak toplayıcıya veya metin üretimine dönmez.

## Doğrulama

| Kontrol | Sonuç |
| --- | --- |
| zbet-cap npm test | 672/672 başarılı |
| BFF cds build --production | Başarılı |
| expo-app npm run check | TypeScript/lint, 665 istemci + 32 tooling testi ve marka kontrolü başarılı |
| Expo Doctor preview | 20/20 başarılı |
| BFF → istemci sözleşme | verify-jinx-contract.ts: aynı cümleler, sıra, fallback ve kanıt bağı başarılı |
| Android JS bundle | Kayıtlı BundleOnly kapısında başarılı |
| Web export | web.mjs export üretildi; ayrı verify, edge ayarı ve 5 dosyalı secret scan başarılı |
| Android native build | Tek ABI arm64-v8a assembleDebug başarılı; APK/DEX/ABI okuması doğrulandı |
| Sentetik browser | 1280×720 ve 390×844: Yenile/Enter, sıralama ve reddedilmiş metinde fallback başarılı |
| Ambient çağrı | Kart açılışından sonra 0 Jinx isteği / 0 test provider çağrısı |
| Telefon genişliği | Yatay taşma yok; reddedilmiş metin görünmüyor |

Browser testi gerçek Gemini/SAP yerine izole yerel test provider'ı ve sentetik
veri kullandı. Aktif BFF restart'ı veya yayın değildir. Native cihaz bağlı
değildi; kurulum, fiziksel Android/TalkBack ve gerçek yetkili web kabulü yapılmadı.
Önceki yayımlanmış çiftin kabulü buraya taşınmaz.

[Masaüstü](evidence/JINX_AI_EXPLAINER_2026-10-25/desktop.jpg),
[telefon fallback](evidence/JINX_AI_EXPLAINER_2026-10-25/phone-fallback.jpg),
[doğrulama kaydı](evidence/JINX_AI_EXPLAINER_2026-10-25/validation.json).

Yerel debug APK: .codex-artifacts/btb-mobile-next-arm64-debug.apk,
94.877.318 bayt; SHA-256
3B798C9ED72F0220C0471817C3941DC9986092865DC2FDC4144EEFBBEF00A19C.
Bu debug çıktısı final imzalı pilot teslim çifti değildir ve Git'e girmez.

## DEV BFF aktivasyonu — 2026-10-25

Sahibin scoped Git onayından sonra, adı ve SHA'sı açıklanmış BFF restart
adımına verdiği Continue yanıtıyla yalnız owner-only DEV runtime ilerletildi.
Kaynak: 358801e7fb21539460ce026c5ef5f559f9c3d87c; temiz/push edilmiş ağaç,
doğrulanan standalone process ve kayıtlı BTB Mobile BFF görevi kullanıldı.
Auth, web, SAP bağlantısı, cihaz kayıt/bildirim ve live-context durumları
baseline ile aynı; prospective collection kapalı.

Yerel v1 raporu AVAILABLE (55), public v2 raporu AVAILABLE (61), dört kabul
edilmiş cohort ve önceki donmuş kayıt korunuyor; baseline 60'tı, arada yeni
normal kayıt gelmiş. Bu rakamlar başarı/ROI değerlendirmesi değildir.
Live API 105 maçla v3 ACK verdi. Gerçek Jinx yerelde 1737 ms, public'te
828 ms ile LIVE döndü; 5 olgunun metni ve karar anahtarı ortak istemci
sözleşmesiyle birebir doğrulandı. Sağlayıcı telemetrisi: 1 çağrı / 1 HTTP200,
2 LIVE yanıt / 1 cache hit. Ham model metni veya kimlik bilgisi kaydedilmedi.
Anonymous API 401 ve mevcut web Access 302; APK/web yayını yapılmadı.

Kalıcı makbuz: btb-codex/docs/evidence/TASK0189_BFF_ROLLOUT_2026-10-25.json.
Buradaki gerçek Gemini API kanıtı, üstteki sentetik browser kanıtından
ayrıdır; yeni Android/web sahibi kabulünün yerine geçmez.

## Eşleşik teslim ve kapanış — 2026-10-25

Yerel doğrulama baselines: Mobile 429f89a, BFF 6910629 ve btb-codex a116c8a.
Sahip 2026-10-25 tarihinde bu üç reponun incelenen dosyaları için commit/push
onayı verdi. Sonuç SHA'ları ve uzak dal doğrulaması btb-codex görev/run
kaydında ve docs/evidence/TASK0189_GIT_CHECKPOINT_2026-10-25.json içinde tutulur.
BTB Logs'taki Aşama B belgesi önceki plan oturumundan kalan ayrı değişikliktir;
bu batch onu ilerletmez veya commit kapsamına almaz.

Sahip final ARM64 build/imza hazırlığını, ardından özel APK teslimi ile
kurulumdan sonraki eş web yayınını ayrı adımlarda açıkça onayladı.
İki artifact temiz/push edilmiş 57e27c219530fa449dd66f769cdff613d94d7a2b
kaynağından üretildi; sonraki handoff commit'i teslim kaynağını değiştirmez.

- APK: btb-mobile-next-arm64-jinx-task0189-57e27c2.apk; 50.467.469 bayt;
  SHA-256 F0828E2B19488E6DD28C6787B135BD1FF09DB8A406F459F79D7D0A3F24D107F0.
  Pilot sertifikası, yalnız ARM64 native kitaplıklar ve gömülü pilot/LIVE
  ayarları doğrulandı. Mevcut owner-only BTB APK Drive klasörüne özel teslim
  edildi; indirilen tam dosyanın baytı ve özeti birebir eşleşti.
- Web: CED99092AA3B0E0A5CC9893CB6CBEF30040A5E23E3955B0AF8D728F4D66DE06B;
  yayın 20261025T124608Z-57e27c2. Shell/deep-link/CSP başarılı, Access'siz
  API 401 ve public web Access 302; yeni runtime yerel/public health başarılı.
  Yayın aracının denetimli tek BFF restart'ı aynı 358801e kaynağını korudu;
  auth pilot, web/SAP configured ve prospective collection disabled kaldı.
- Sahip tam APK sorusuna "Installed; app and Jinx Refresh work" dedi.
  Ardından eş web sorusuna "Web app and Jinx Refresh work" yanıtını verdi.
  Android ekranı Gemini sıralamasını; desktop ekranı kurallı açıklamayı,
  havuz desteği uyarısını ve ayrı güncel saha bağlamını gösterir.
  Bu kabul maç açma/manuel Jinx yenileme kapsamındadır; TalkBack veya geniş
  cihaz performansı kabulü çıkarılmaz.

client-release.mjs complete gerçek teslim, kurulum, yayın ve iki sahip smoke
makbuzunu aynı batch/kaynak/hash ile doğruladı: COMPLETE / releaseComplete=true.
Kalıcı kayıtlar btb-codex/docs/evidence/ altında:
client-release-57e27c2-COMPLETE-2026-10-25.json,
TASK0189_ANDROID_DELIVERY_2026-10-25.json,
TASK0189_WEB_PUBLICATION_2026-10-25.json ve TASK0189_OWNER_SMOKE_2026-10-25.json.
İki gerçek ekran görüntüsü de aynı dizinde korunur.

Final ve önceki kabul edilmiş APK/web çifti korunurken, özeti birebir
doğrulanan bu batch'e ait debug APK ile indirilen geçici APK kopyası Geri
Dönüşüm Kutusu'na taşındı. Kaynak, kalıcı makbuz ve kullanıcı dosyası silinmedi.

TASK-0189 DONE; btb next cutover start sonlandı. Observation moduna dönüldü.
Önceki kabul edilmiş 3f3b5fd Android/web çifti geri dönüş için korunur.
TASK-0190 / 0153 / 0150 olasılık şeridi owner-deferred BLOCKED kalır.
Production, SAP veya model değişikliği yapılmadı; yeni yayın yetkisi çıkarılmaz.
