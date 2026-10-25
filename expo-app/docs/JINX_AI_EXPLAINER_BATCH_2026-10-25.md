# TASK-0189 — Jinx RB1 açıklayıcı yerel batch

Tarih: 2026-10-25. Sahip: BTB Mobile Next - Aktif.
Durum: LOCAL_VALIDATED / GIT_APPROVED_DELIVERY_PENDING.
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

## Bekleyen kapılar

Yerel doğrulama baselines: Mobile 429f89a, BFF 6910629 ve btb-codex a116c8a.
Sahip 2026-10-25 tarihinde bu üç reponun incelenen dosyaları için commit/push
onayı verdi. Sonuç SHA'ları ve uzak dal doğrulaması btb-codex görev/run
kaydında ve docs/evidence/TASK0189_GIT_CHECKPOINT_2026-10-25.json içinde tutulur.
BTB Logs'taki Aşama B belgesi önceki plan oturumundan kalan ayrı değişikliktir;
bu batch onu ilerletmez veya commit kapsamına almaz.

1. İncelenen Mobile/BFF/görev-run/handoff dosyaları için scoped Git onayı alındı;
   kapanışta temiz çalışma ağaçları ve uzak commit eşitliği doğrulanır.
2. Temiz, push edilmiş BFF SHA'sıyla ayrı owner-only DEV restart onayı ve
   gerçek API smoke. Çalışan pilot BFF değiştirilmedi.
3. Temiz, push edilmiş ortak Mobile commit'inden final APK ve eş web için
   gerekli ayrı build/sign/iki yüzeyi kapsayan teslim-yayın onayı.
   client-release.mjs hash doğrulaması, özel APK teslimi/kurulumu, sonra web
   yayını ve iki gerçek smoke zorunludur.

TASK-0189 IN_PROGRESS; cutover run yerel doğrulama checkpoint'inde açıktır.
Kabul edilmiş 3f3b5fd Android/web çifti korunur. Production, SAP veya model
değişikliği onayı yoktur.
