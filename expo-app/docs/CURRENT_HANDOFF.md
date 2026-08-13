# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-13

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — 2026-08-13 ikinci Mobile cutover batch'i yerel olarak
uygulandı ve doğrulandı. Commit/push, BTP deploy, Cloudflare/Firebase/SAP dış
değişikliği, APK dağıtımı, release signing ve Cordova cutover yapılmadı; her biri
ayrıca açık onay gerektirir.

Yeni task önce yalnız `C:\dev\btb-cdoex\AGENTS.md` ve bu dosyayı tamamen okur.
Observation tespitleri `docs/OBSERVATION_LOG.md` içindedir. Yeni toplu kod batch'i
yalnız `btb next cutover start` ile başlar.

## Son checkpoint

- Maç ve Super detay hero kartlarındaki alt metrikler ortak üç kolon ritmine
  alındı: canlıda seçim / seçim oranı / güncel oran; Super'de seçim / seçim oranı / kâr.
- Karar Günlüğü yıldız menüsü artık `Varsayılan`, yıldız yüksekten düşüğe ve
  düşükten yükseğe sıralamayı da içerir. Varsayılan provider sırasını aynen korur.
  Android'de menü gerçek modal katmandadır; alttaki kartlar dokunmayı çalmaz.
- Ana `(tabs)` ekranları `Özet -> Canlı -> Super -> Toto -> Daha Fazla` sırasında
  yatay kaydırmayla değişir; detay ekranları ve ilk/son sekme wrap davranışı dışarıdadır.
- Toto detayında güvenilir kaynak `updatedAt` değeri yerel tarih/saatle gösterilir.
  Sonuçlanan fikstürlerde SAP `home_score` / `away_score` alanlarından biten skor;
  payout hazır ve pozitifse SAP `theo_prize` alanından `Teorik ikramiye` gösterilir.
- BFF Toto read-only seçimi/mapper'ı `payout_ready`, `payout_desc`, `theo_prize`,
  `home_score` ve `away_score` alanlarını nullable DTO olarak taşır. Eski public BFF
  bu alanları henüz yayınlamadığı için Mobile şeması staged deploy sırasında geriye
  uyumlu null fallback kullanır.
- `last_pressure_diff` / `last_total_pressure` alanlarının güncel maç değil son
  tarihsel Super karar değerleri olduğu yerel CDS kanıtıyla doğrulandı. BFF bunları
  artık güncel baskı gibi yayınlamaz; Mobile liste ve detay `Güncel veri bekleniyor`
  gösterir. Gerçek current-match alanı gelmeden sahte değer üretilmez.

## Repo durumu

```text
zbet-mobile
  branch/upstream : master / origin/master
  HEAD            : 3ae7166296f1a778fe9a6bb4e73697d5d802201d
  state           : bu cutover'ın Mobile kaynak, test, OpenAPI ve belge diff'i açık

zbet-cap
  branch/upstream : main / origin/main
  HEAD            : 5fbffbf335238410f8d6f0c6815d0c33f8d35a15
  state           : bu cutover'ın bounded Mobile BFF select/mapper/test diff'i açık;
                    deploy edilmedi
```

Kullanıcıya ait mevcut değişiklikler korunmuştur. Açık diff yalnız bu cutover'ın
Mobile Next ve Mobile BFF kapsamındadır.

## Doğrulama

- Mobile `npm run check`: TypeScript, ESLint ve `96/96` test geçti.
- BFF `npm test`: `65/65` test geçti.
- Kompakt Mobile BFF kalite kapısı geçti.
- Expo Doctor `19/20`: yalnız bilinen yedi Expo SDK 57 patch farkı açık; bu özellik
  batch'ine dependency yükseltmesi karıştırılmadı.
- Public `https://api.surklase.com` read-only dashboard/matches/Toto smoke ve yeni
  Mobile Zod şemasıyla geriye uyumluluk parse kontrolü geçti.
- Android API 35 x86_64 emülatöründe açık tema, canlı API, ana sekme swipe,
  Karar Günlüğü modal yıldız/sıralama menüsü ve seçim hit-test'i smoke edildi.
- SAP MCP readiness çalıştırıldı; görünür araç listesinde repository/source-read
  aracı olmadığı için SAP kaynak iddiaları live MCP kanıtı değil yerel ABAP/CDS
  snapshot kanıtıdır.

## Final yerel pilot APK

Final ARM64 artifact build ve imza/hash doğrulaması bu handoff'un aşağıdaki alanında
cutover kapanışında kaydedilir:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-20260813-v20-final.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,186,309 bytes
SHA-256 : FA4B569D91B0E3CE1C41F43C377A6976C82ED5F217EBED6BA6D71CF99F440793
Signing : APK Signature Scheme v2; pilot debug certificate
```

## Bilyoner takım logo eşlemesi

- `htpi` = home participant id; `atpi` = away participant id.
- Logo kalıbı:
  `https://content.bilyoner.com/assets/participant/{participantId}.png`
- PSG `htpi=954`:
  `https://content.bilyoner.com/assets/participant/954.png`
- Aston Villa `atpi=227`:
  `https://content.bilyoner.com/assets/participant/227.png`
- Bu, Bilyoner'in public/dokümante edilmiş resmi logo API'si değildir; web
  uygulamasında kullanılan CDN pattern'inin gözlemlenmesiyle tespit edilmiştir.
  Bu nedenle tek merkezi resolver/config ve broken-image göstermeyen fallback
  zorunludur; URL component'lere veya DB'ye dağınık yazılmaz.
- Yerel Mobile OpenAPI/Zod, BFF `$select`/mapper ve ABAP snapshot'ında `htpi/atpi`
  bulunmadı. Doğru alan zinciri upstream SAP/DDIC/OData'da ayrı yazma/aktivasyon
  onayıyla sağlanmadan takım adından tahmin veya runtime scraping yapılmaz.

## Açık observation / blokajlar

- `NXT-OBS-073`: participant ID zinciri eksik; kulüp logoları doğru veri gelene kadar
  deferred.
- `NXT-OBS-074`: notification producer sürekliliği için SAP çağrı/SM59 telemetry kanıtı.
- `NXT-OBS-086`: Toto idempotency düzeltmesi `BTB Toto - Aktif` sahipliğindedir.
- `NXT-OBS-092`: Mobile/BFF tarihsel baskıyı artık güncel diye göstermez; gerçek
  current-match pressure alanı SAP/OData'da yayınlanana kadar veri bekleme fallback'i
  kullanılır.
- Toto skor/teorik ikramiye görünümü için bu `zbet-cap` diff'inin ayrı açık onayla
  BTP DEV deploy edilmesi ve gerçek response ile doğrulanması gerekir.
- Fiziksel ARM64 telefonda v20 kurulum ve ana sekme swipe/filtre/Toto sonuç görünümü
  observation'da izlenecek.

## Exact next steps

1. Observation modunda fiziksel cihaz sonuçlarını topla.
2. Commit/push istenirse iki repoyu ayrı ve ilgili diff'lerle doğrulayıp kullanıcı
   onayına göre commit/push et.
3. BFF skor/ikramiye alanları için ayrıca exact-SHA BTP DEV deploy onayı al; SAP/Fiori
   model davranışını değiştirme.
4. Participant ID ve current pressure kaynak sözleşmelerini ilgili operasyonel task'a
   handoff et; Mobile'da tahmini veri üretme.

Cutover kanıtı: `docs/observation_archive/cutover_2026-08-13-02.md`.
