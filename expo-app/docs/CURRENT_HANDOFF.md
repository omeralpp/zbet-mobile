# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-13

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — 2026-08-13 ikinci Mobile cutover batch'i uygulandı,
doğrulandı, iki repoda commit/push edildi ve Mobile BFF'nin korunan CAP yüzeyi
exact-SHA ile BTP DEV'e deploy edildi. Owner talimatıyla `btb-fcm-proxy-srv`
sonradan durduruldu ve yeniden açıkça devreye alınması istenene kadar
kullanılmayacak. Aktif runtime yalnız `api.surklase.com` arkasındaki yerel
standalone BFF/notification servisidir. Public Cloudflare origin yapılandırması,
Firebase/SAP dış değişikliği, APK dağıtımı, release signing ve Cordova cutover
yapılmadı; her biri ayrıca açık onay gerektirir.

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
  source commit   : 04a5635 (Complete Mobile Next observation cutover)
  state           : kaynak ve deploy kanıtı push edildi; repository clean

zbet-cap
  branch/upstream : main / origin/main
  HEAD            : ead7a99584c60c846b1e0f88e77543158b262cbe
  state           : clean, origin/main ile aynı; exact-SHA BTP DEV deploy edildi
```

Kullanıcıya ait mevcut değişiklikler korunmuştur. Commitler yalnız bu cutover'ın
Mobile Next, Mobile BFF ve kapanış kanıtı kapsamındadır.

## Doğrulama

- Mobile `npm run check`: TypeScript, ESLint ve `96/96` test geçti.
- BFF `npm test`: `65/65` test geçti.
- Kompakt Mobile BFF kalite kapısı geçti.
- Expo Doctor `19/20`: yalnız bilinen yedi Expo SDK 57 patch farkı açık; bu özellik
  batch'ine dependency yükseltmesi karıştırılmadı.
- Public `https://api.surklase.com` read-only dashboard/matches/Toto smoke ve yeni
  Mobile Zod şemasıyla geriye uyumluluk parse kontrolü geçti.
- CAP exact-SHA MTA geçici Node 24 build ortamında üretildi; archive SHA-256
  `EE6C1471A51DBB735DDFA74A8D56C6CD5975630E9A61BFBCC02878209055DA0C`.
- BTP DEV MTA operation `4067016a-9756-11f1-91c3-eeee0a9f1a4c` tamamlandı;
  deploy kanıtı alındı. Owner'ın sonraki talimatıyla `btb-fcm-proxy-srv`
  `requested state: stopped`, `0/1` durumuna getirildi.
- Public Mobile BFF origin yeni source ile yeniden başlatıldı. Gerçek Toto detail
  response `theoreticalPrize`, `payoutDescription`, `updatedAt`, `homeScore` ve
  `awayScore` alanlarını taşıdı; public `/health` pilot auth, SAP backend, device
  registry ve notification bileşenlerinin hazır olduğunu doğruladı.
- Android API 35 x86_64 emülatöründe açık tema, canlı API, ana sekme swipe,
  Karar Günlüğü modal yıldız/sıralama menüsü ve seçim hit-test'i smoke edildi.
- SAP MCP readiness çalıştırıldı; görünür araç listesinde repository/source-read
  aracı olmadığı için SAP kaynak iddiaları live MCP kanıtı değil yerel ABAP/CDS
  snapshot kanıtıdır.

## Final yerel pilot APK

Final ARM64 artifact build ve imza/hash doğrulaması bu handoff'un aşağıdaki alanında
cutover kapanışında kaydedilir:

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-pilot-stabilization.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,188,549 bytes
SHA-256 : 3baf3df08e4c7a1c15228965d1d41477d6e976cd4860a9c5df68e8899477f4a7
Config  : authMode=pilot, mobileApiUrl=https://api.surklase.com
Build   : 2026-08-15 — current-pressure schema fix (b9445dd) + push-token
          registration timeout (1dd0afe); emulator-validated, physical
          phone verification pending.
```

Önceki final artifact (2026-08-13, `btb-mobile-next-arm64-cutover-20260813-v20-final.apk`)
`docs/observation_archive/cutover_2026-08-13-02.md` içinde kayıtlıdır.

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
- Toto skor/teorik ikramiye alanları CAP DEV deploy ve public response ile
  doğrulandı; fiziksel cihazdaki görünüm observation sırasında izlenecek.
- Fiziksel ARM64 telefonda v20 kurulum ve ana sekme swipe/filtre/Toto sonuç görünümü
  observation'da izlenecek.

## Exact next steps

1. Observation modunda fiziksel cihaz sonuçlarını topla.
2. `btb-fcm-proxy-srv` uygulamasını başlatma, deploy etme veya notification yolu
   olarak kullanma; yalnız owner açıkça yeniden devreye alınmasını isterse değerlendir.
3. Participant ID ve current pressure kaynak sözleşmelerini ilgili operasyonel task'a
   handoff et; Mobile'da tahmini veri üretme.
4. Yeni observation batch'i yalnız `btb next cutover start` ile aç; commit/push ve
   dış deploy kapılarını yeniden açık onayla işlet.

Cutover kanıtı: `docs/observation_archive/cutover_2026-08-13-02.md`.
2026-08-15 stabilizasyon kanıtı: `docs/observation_archive/cutover_2026-08-15.md`.
