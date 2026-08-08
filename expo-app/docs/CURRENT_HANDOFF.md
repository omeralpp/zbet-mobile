# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-09

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — 2026-08-09 dördüncü cutover batch’i yerel, doğrulanmış ve
commit edilmemiş checkpoint’te kapandı.

Yeni task önce yalnız `C:\dev\btb-cdoex\AGENTS.md` ve bu dosyayı tamamen okur.
Observation tespitleri `docs/OBSERVATION_LOG.md` içindedir. Yeni kod batch’i
yalnız `btb next cutover start` ile başlar. Commit/push, aktif runtime restart,
deploy, dış sistem ayarı, APK dağıtımı, release signing ve Cordova cutover ayrı
açık onay ister.

## Bu checkpoint’in sonucu

- Bibi ilk kurulumda sürüm kontrollü ekran rehberini açar; hedeflere safe-area
  içinde hareket eder, ilerlemeyi cihazda saklar ve `Daha fazla` ekranından
  açılıp kapatılabilir veya baştan başlatılabilir.
- Canlı maç kartında oran trendi current/seçim oranını karşılaştırır. Baskı tarafı
  ev/uçak/nötr ikonuyla ayrı gösterilir; eksik/kapalı orana yön verilmez.
- Super detayında karar anı skoru ile yalnız sonuçlanmış kaydın `Biten skor` alanı
  ayrıdır.
- Super ve maç detayında ortak kompakt `Puan Durumu` vardır. Tam lig kolonları SAP
  servisinde bulunmadığı için uydurulmadı. Maç ekranı yalnız son Super kararının
  sıra/puan snapshot’ını açık kaynak etiketiyle gösterir.
- Notification degraded mode artık dış FCM teslimini kapatırken şifreli cihaz
  kaydını açık bırakır; aktif local/public runtime’da cihaz deposu configured’dır.
- Standalone producer, mevcut key header’ına ek olarak SAP SM59 için fixed-user
  HTTPS Basic adaptörüyle hazırlandı. ABAP yerel kaynağı sabit eski BTP URL’si
  yerine destination + `/v1/notifications` + tür/idempotency sözleşmesini kullanır.
  Aktif teslim ve canlı SAP aktivasyonu hâlâ bilinçli kapalıdır.

## SAP kanıt sınırı

- `sap-adt` MCP ile yayınlı `ZBET_UI_SUPER_LOG_SB` / OData V4 / `0001` servis
  binding’i okundu. Kullanılabilir MCP yüzeyi ABAP/CDS kaynak okumuyordu.
- Canlı `ZBET_CL_MAIN` nesnesi SAP ADT ATC yüzeyinde görüldü; MCP kaynak-read
  sağlamadığı için notification endpoint satırında canlı/local parity iddia
  edilmedi. Yeni ABAP yalnız yerel kaynakta hazırlandı.
- Alan kanıtı ayrıca doğrudan read-only OData metadata ile doğrulandı:
  current match entity’sinde standings yok; `zbet_cds_super_last` yalnız iki
  takımın sıra/puan snapshot’ını, Super V4 ise final skor alanlarını yayınlıyor.
- SAP yazma, aktivasyon, transport veya model değişikliği yapılmadı.

## Aktif runtime

```text
BTB Mobile Next v11 (aktif cihaz paketi henüz değiştirilmedi)
  -> https://api.surklase.com
  -> 127.0.0.1:4004 Mobile BFF: UP, PID 21460
  -> local/public health: HTTP 200
  -> local/public deviceRegistration: configured
  -> local/public notificationService: unconfigured
  -> BTB Mobile BFF startup task: Ready, last result 0
  -> notification delivery: explicitly disabled
```

Yeni BFF device-registration davranışı, kullanıcının eski süreçte gördüğü
`DEVICE_STORE_NOT_CONFIGURED` hatasından sonra doğrulanmış Windows göreviyle
02:35’te aktif 4004 sürecine alındı. BTP deploy yapılmadı; direct FCM teslimi
bilinçli kapalı kaldı. Windows task disk üzerindeki commit edilmemiş scripti
çağırır; sonraki logon/reboot aynı degraded-mode davranışını kullanır.

## Repo checkpoint

```text
zbet-mobile  agent/platform-independence-phase1
             HEAD fd2cede8706e7bf8ea02117666ba5957e30de054
             auth/Fiori/topic + tutorial/league/final-score/live-card/docs değişiklikleri
             commit/push yok

zbet-cap     agent/platform-independence-phase1
             HEAD f32d95806180053da9b814a0b32007d019c2e18d
             startup/degraded + league-context + producer Basic adapter/docs/tests
             commit/push/deploy yok

zbet-abap    main
             HEAD 9fc534cc3e3dd00dc532d00ce1d0c43b7f5f3067
             notification destination/contract + Toto result + README değişiklikleri
             commit/push/SAP aktivasyonu yok

btb-codex    main 9648e1881add18791bdf4f0e833e5cda005301c2
             önceden var olan README.md ve MCP_SETUP.md kullanıcı değişiklikleri korundu
```

## Doğrulama

- Mobile typecheck, ESLint ve `91/91` test geçti.
- Expo Doctor `20/20`; Android production JS bundle ve arm64 release build geçti.
- CAP/BFF `65/65` test, aktif v24 runtime ile tekrar `65/65` ve production CDS
  build geçti.
- ABAP değişen iki kaynak lint `0`; full local check ve SAP object name check geçti.
- SAP preflight geçici commit/push yaptığı için ayrı git onayı olmadan çalıştırılmadı;
  canlı SAP syntax/ATC/aktivasyon kapısı açıktır.
- İzole pilot/degraded smoke: health, authenticated match list ve league-context
  HTTP 200; `deviceRegistration=configured`, `notificationService=unconfigured`.
- Aktif 4004 kontrollü restart sonrası local/public health HTTP 200 ve
  `deviceRegistration=configured`; fiziksel cihazın yeniden kayıt kanıtı bekleniyor.
- Secret/private-key marker taraması `0`; APK’da ham Firebase/server secret yok.
- Bağlı Android cihaz yoktu; fiziksel install/launch testi yapılmadı.
- Dependency audit: CAP `0`; Mobile `0 critical`, `15 high`, `8 moderate`.
  Bulgular Expo/Metro build-time parser zincirindedir; npm’in mevcut önerisi Expo
  57/RN 0.86 profilini uyumsuz downgrade eder. Otomatik fix uygulanmadı.

## Final yerel pilot APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-20260809-v12-final.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,155,884 bytes
SHA-256 : 0CAA20A8F0289E478DCDCCADCC6E3C637CAC1B4053814041A9D6D98EAEA46F93
Signing : v2; pilot debug certificate SHA-256 fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c
```

Artifact klasöründe yalnız v12 final vardır. v11 Geri Dönüşüm Kutusu’na taşındı
ve kurtarılabilir. v12 dağıtılmadı.

## Exact next steps

1. Telefonda uygulama tamamen kapatılıp açılır; bildirim izni/kayıt yeniden
   denenir ve `DEVICE_STORE_NOT_CONFIGURED` hatasının dönmediği doğrulanır.
2. Ayrı APK dağıtım onayıyla v12 telefona kurulur; Bibi rehberi, lig/final skor,
   oran/baskı ikonları, Fiori login, widget ve notification gözlenir.
3. Ayrı runtime onayıyla güçlü producer key oluşturulur; yalnız SHA-256 digest
   kullanıcı runtime’ına konur, Firebase/ledger ayarları doğrulanır ve startup
   task `DisableNotificationDelivery` olmadan kontrollü yenilenir.
4. Ayrı SAP onayıyla SM59 `ZBET_NOTIFICATION_API` HTTPS destination’ı fixed user
   `btb-notifier` ve güvenli parolayla tanımlanır; `ZBET_CL_MAIN`, ardından
   `ZBET_P_TOTO_AUTO` syntax/ATC/aktivasyon/transport kapısından geçirilir.
5. Kayıtlı fiziksel cihazda tek kontrollü DEV notification, widget ve deep-link
   kanıtı alınır.
6. Mobile transitive audit bulguları Expo’nun uyumlu patch hattı çıktığında ayrı
   dependency bakım batch’inde güncellenir; zorlayıcı downgrade yapılmaz.
7. Üç repo için stage/commit/push yalnız ayrı açık onayla yapılır. Deploy gerekiyorsa
   pushed exact SHA ile ayrıca `DEPLOY-DEV <sha>` onayı alınır; production hedeflenmez.

Arşiv: `docs/observation_archive/cutover_2026-08-09-04.md`.
