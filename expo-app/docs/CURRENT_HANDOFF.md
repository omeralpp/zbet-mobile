# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-10-14

Mod: `OBSERVATION`

Çalışma alanı: `C:\dev\btb-cdoex` · Aktif task: `BTB Mobile Next - Aktif`

This file carries current state only. Every dated entry through 2026-09-16 19:58
is kept verbatim in
[handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md](handoff_archive/CURRENT_HANDOFF_through_2026-09-16.md);
open it only for a specific past checkpoint. New checkpoints replace the
sections below instead of stacking above them; the section headings are selected
by `btb-codex/config/thread-context.config.json`, so keep them.

## Son checkpoint

14 Ekim TASK-0009:4,5 Alt/Üst doğrudan mevcut A3 DEV seçimine alındı; ek FT45
gölge aşaması yok. Model/kol/ağırlık/eşik aynı;19 piyasalı kaynak
`42D739234585064BC727211709535A12997FED1A289238776DDB103D45B7C699`, gerçek
sınır `2026-10-14T20:37:35.072560Z`.57 harmless native Unit/sıfır syntax/yeni P1;
20 kaynak/53 native dosya iki okumada aynı.8 gözlem/4 karar/296 birebir dal,
iki yeni piyasa SCORED ve2 temiz çevrim; bu kontrolde yeni pozitif A3 interval/
kazanan iddiası yok.584 BFF/build ve9 gerçek dış API Mobile şema okuması geçti.
Önceki A3 geçmiş baskısı ayrı mühürle korunur. Mobil kaynak/APK değişmedi.
FT45 gelecek performansı TASK-0127/M10; önceki17 piyasa ayrı kaynak kohortudur.

Önceki17 piyasalı A3 kabul checkpoint'i:
14 Ekim: sahibi tarafından onaylanan A3 seçim/baskı DEV pilotu tamamlandı.
Model `BTB_PPV1_20261014`, kol3; Alt/KG Yok son baskı ağırlığı +0,85; diğer
ağırlıklar ve 34/23/17/10 eşikleri aynı. SAP A4H_001/ZP1067/A4HK900110 üzerinde
DDIC önce, bağımlılar sonra etkinleştirildi. Yeni kayıtlar model kimliğiyle eski
boş etiketli geçmişten ayrılır. Gerçek toplama sınırı
`2026-10-14T14:43:17.997132Z`; öncesi mühendislik kontrolüdür.

Native/full-capture observed DEV kabulü kaydedildi. 77 değişen model testi,
on şema nesnesinin tam doğrulaması/sıfır yeni P1, 58 gözlem/12 baskı,10 karar/
680 tam eşleşen dal, üç pozitif A3 kazanan ve14 temiz çevrim. Ayrı native reader
12 Unit/108 araç kontrolü geçti; TASK-0126 DONE. Doğrudan ADT/OData kaynak
okumaları MCP değildir. Eski strict/observed manifestler tarihsel olarak korunur.

V3 mobil/BFF tüketicileri aynı mühürlü üreticiyi kullanır. Kayıtlı/güncel seçim
ayrımı, yeni cutover etiketi ve lider skor baskı yönleri aktiftir. Dashboard eski
toplam baskıyı kullanmaz.612 Mobile+13 araç/type/lint/brand;581 BFF/build geçti.
Dokuz gerçek dış API şema okuması yeni/legacy Super ve mevcut baskıyı doğrular.
Android API35 önizlemesinde gerçek seçim/etiket ve sekiz baskı işareti görüldü.
Değişmeyen jestlerin önceki sekiz native kontrolü ve Doctor20/20 kullanıldı.
Fiziksel telefon sürekli sürükleme/TalkBack kabulü hâlâ ayrı ve ölçülmedi.

**Rota:** telefon → `https://api.surklase.com` → mevcut pilot BFF
`zbet-cap/standalone-server.js`,127.0.0.1:4004,pilot auth. Son onaylı restart
PID10040 (canlı PID'yi gerektiğinde listener'dan yeniden oku). Windows görevi
`BTB Mobile BFF`,ensure/start launcher korunur. Manifest
`zbet-abap/score-pressure-v2/PRESSURE_PATH_FT45_REGIME.json`, ham SHA-256
`E768BEF23AA9552E90AEF4004DA82D4981131DD8A9EBF1DD69BB47AABEA2BCFB`.
Sealed-runtime-activation.json kaynak/ayar kanıtıdır; dosya değişirse eski mühür
sessizce kullanılamaz. Yerel/dış sağlık geçti. Cloudflare/Firebase yayını yok.

Jinx'in mevcut sağlayıcısı ve açıklama davranışı korunur. İstatistik kapsamı
bilinmeyen xG sıfır gösterilmez; kaynak zamanı ve oran-skor ilişkisi ispatlı
sayılmaz. Yeni baskı tahmindir; oran/gol ihtimali veya kârlılık değildir.

## Final yerel pilot APK

[Yeni A3 özel Drive APK](https://drive.google.com/file/d/1Y_zmtI3AyXHhHc7s4vI8o6uJrvt7pn8S/view?usp=drivesdk)

`btb-mobile-next-arm64-pressure-path-a3.apk`,54.424.765 bayt; SHA-256
`1168EA805A14870AC707204A63F4F1B38316D0CFE038C879D739266E9F828117`.
Yalnız ARM64, mevcut pilot sertifikası/APK V2 imzası, paket/config/LIVE ayarları
ve sunucu sırrı taraması doğrulandı. Özel klasör/sadece sahibi erişimi ve kimlik
doğrulamalı indirme SHA/boyut birebir aynı. [Ayrıntılı teslimat](PRESSURE_PATH_A3_DELIVERY_2026_10_14.md).

Önceki TASK-0124 closeout SHA `7D209632…3605B6` ve sahibi tarafından kabul edilen
TASK-0121 SHA `2CF051…55F4B2` tutulur. Önceki teslimat kanıtları
`TASK_0124_PLAN_CLOSEOUT_2026_10_14.md`/`TASK_0121_JINX_READING_2026-10-11.md`.
Yeni exact APK fiziksel telefon kabulü verilmiş sayılmaz.

## Repo durumu

Önceki A3 primary yayını tamamlandı; makbuz
`.codex-artifacts/pressure-selection-2026-10-14/publication.json`.
TASK-0009 backend main `e6cd1cfd8bb022a80ab19df71589c2fb503d25b0`, BFF main
`70cb5c4a740676549b108b9cde479e3dc2201837` push edildi. SAP exact-main DEV
import/aktivasyon,57 native Unit/zero syntax/yeni P1 ve bağımsız branch/kaynak
geri okuması geçti. Preflight snapshot `e00253a6a603dd59b16e4647b7a67ebe76902550`
aynı kaynağı taşır. Deploy sonrası9 dış API şema okuması ve yerel/dış sağlık temiz.
Runtime/yayın/deploy makbuzları `.codex-artifacts/task0009-live-readiness-2026-10-14/`
altında; kalıcı özet `btb-codex/docs/evidence/task0009-main-deployment-2026-10-14.json`.

## Doğrulama

Son kaynak değişikliği sonrası Mobile612+13/type/lint/brand ve BFF581/CAP build
tam geçti. Yeni kaynak/native kabul receipt'leri backend `score-pressure-v2/`
altında. Yerel ayrıntılar `.codex-artifacts/pressure-selection-2026-10-14/`:
`sealed-public-smoke.json`,`apk-verification.json`,`apk-signature.txt`,
`drive-delivery.json`,`frozen-mobile-inputs.json`,`sealed-runtime-activation.json`.
355 frozen APK girdisi derleme sonunda aynı; sonradan yalnız güncel devir/plan
dokümanları değişti. Yeni paket kodunu değiştiren bir düzenleme yapılmadı.

V1/V2 korunur; V3 ACK/şema eşleşmesi zorunlu. V2 geri dönüş yalnız belirli
sürüm-hatasında yapılır. Yeni opaque Super anahtarı model bileşeni içerir;
legacy blank tag yeni modele yükseltilmez. Tarihsel karar kendi capture'ını okur.

## Açık observation / blokajlar

- TASK-0124 fiziksel kurulum/sürekli sürükleme/olay/TalkBack kabulü bekliyor;
  sonraki veri incelemesi15 Ekim. APK geliştirme/özel teslimat tamamlandı.
- TASK-0123/M10 iki tam hafta/200 uygun sonuç/30 aile ve ekonomik kalite kapıları
  bekliyor; ilk mümkün tam-hafta incelemesi2 Kasım. M3 teknik kabulü tamam;
  milestone CLOSED, sahibin açık kapanış kararı kaydedildi.
- TASK-0101 kırmızı kart ölçümü için koşullandırılmış veri/tasarım gerekli.
  Giugliano önceki çerçeve gözlemi aynı-an kanıt olmadan açıklanamaz.
- OBSERVATION_LOG'daki ayrı ertelenmiş işler bu A3 teslimatıyla onaylanmaz.
  TASK-0102/TASK-0121 kapalı kabul edilmiş teslimat/rollback kalır.

## Exact next steps

1. Sahibin yeni APK için fiziksel kurulum/sürekli sürükleme/olay/TalkBack kanıtı.
2.15 Ekim salt-okunur yeni cutover incelemesi; etiket/kimlik ve gerçek sınırla
   ayır. Kontrolleri geçmiş sonuç olarak geri doldurma; ekonomik örneklem bekle.
3. TASK-0009 yayını ve exact-main DEV hizalaması tamamlandı; aynı kaynak için
   tekrar deploy gerekmez. M3 CLOSED; M10/FT45 ve fiziksel telefon veri kapıları
   açık kalır. Yeni/önceki A3 verisini exact SHA ve gerçek sınırla ayır.

## Documents

`PRESSURE_PATH_A3_DELIVERY_2026_10_14.md`,`SCORE_PRESSURE_V2_LOCAL.md`,
`OBSERVATION_LOG.md`,`NEXT_CUTOVER_PROCEDURE.md`,`ARCHITECTURE.md`,
`contracts/mobile-api.openapi.yaml`,`zbet-cap/docs/decision-context-v3.md`;
backend `score-pressure-v2/PRESSURE_PATH_DEV_PLAN_2026_10_14.md` ve
`PLAN_CLOSEOUT_2026_10_14.md`.
