# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-09

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — 2026-08-09 dördüncü cutover batch’i doğrulandı, üç ilgili
repoda commit/push edildi ve onaylı notification pilot dış kapıları açıldı.

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
- Notification runtime şifreli cihaz kaydı, kalıcı ledger ve Firebase teslimiyle
  aktif pilot modundadır; local/public health iki servisi de `configured` gösterir.
- Standalone producer, mevcut key header’ına ek olarak SAP SM59 için fixed-user
  HTTPS Basic adaptörüyle hazırlandı. ABAP yerel kaynağı sabit eski BTP URL’si
  yerine destination + `/v1/notifications` + tür/idempotency sözleşmesini kullanır.
  SAP DEV kaynak aktivasyonu, SM59 HTTPS destination ve gerçek FCM teslimi geçti;
  kullanıcı son gerçek notification’ın telefonda çalıştığını doğruladı.

## SAP kanıtı

- `sap-adt` MCP ile yayınlı `ZBET_UI_SUPER_LOG_SB` / OData V4 / `0001` servis
  binding’i okundu. Kullanılabilir MCP yüzeyi ABAP/CDS kaynak okumuyordu.
- ABAP preflight geçici `codex-check/*` dalıyla SAP syntax/activation/ATC kapısından
  geçti. Ardından doğrudan read-only ADT kaynak GET’iyle canlı `ZBET_CL_MAIN`
  içinde `ZBET_NOTIFICATION_API` ve `/v1/notifications`, `ZBET_P_TOTO_AUTO`
  içinde yeni producer çağrısı doğrulandı; eski sabit notification URL’si yoktur.
- Alan kanıtı ayrıca doğrudan read-only OData metadata ile doğrulandı:
  current match entity’sinde standings yok; `zbet_cds_super_last` yalnız iki
  takımın sıra/puan snapshot’ını, Super V4 ise final skor alanlarını yayınlıyor.
- SM59 `ZBET_NOTIFICATION_API`, `api.surklase.com:443`, SSL Client Standard ve
  SAP’te saklanan Basic kullanıcıyla tanımlandı. Let’s Encrypt/ISRG CA zinciri
  PSE’ye eklendi; connection test TLS handshake sonrası HTTP `404 Not Found`
  yanıtını `119 ms` içinde aldı. Boş root path için 404 beklenen ulaşılabilirlik
  kanıtıdır. Betting model veya DDIC/CDS davranışı değiştirilmedi.

## Aktif runtime

```text
BTB Mobile Next v11 (aktif cihaz paketi henüz değiştirilmedi)
  -> https://api.surklase.com
  -> 127.0.0.1:4004 Mobile BFF: UP, PID 6900
  -> local/public health: HTTP 200
  -> local/public deviceRegistration: configured
  -> local/public notificationService: configured
  -> BTB Mobile BFF startup task: Ready, last result 0
  -> notification delivery: enabled (pilot)
```

Raw producer key yalnız Windows Credential Manager ve SAP SM59 secret alanındadır;
runtime kullanıcı ortamında yalnız SHA-256 digest bulunur. Windows başlangıç görevi
`DisableNotificationDelivery` olmadan yeniden kaydedildi. Aynı producer üzerinden
tek kontrollü DEV isteği `matched=2`, `delivered=2`, `failed=0`, `removed=0`
sonucuyla gerçek FCM teslimini kanıtladı. BTP deploy yapılmadı; public pilot route
mevcut Cloudflare origin zincirini kullanır. SM59 tamamlandıktan sonraki gerçek
notification’ın çalıştığı kullanıcı tarafından ayrıca doğrulandı; notification
teslim zincirinde açık blocker kalmadı.

## Repo checkpoint

```text
zbet-mobile  agent/platform-independence-phase1
             implementation commit 26c40f8fd1329c72db645af6c8854afced316fb6
             origin/agent/platform-independence-phase1 üzerine push edildi

zbet-cap     agent/platform-independence-phase1
             HEAD a8f9e50de948967607505ac0d4384012c93dcd2e
             origin/agent/platform-independence-phase1 üzerine push edildi; deploy yok

zbet-abap    agent/mobile-notification-producer
             HEAD 43cd4a77abf5c804dc265d53b9df221b46d5a322
             origin/agent/mobile-notification-producer üzerine push edildi

btb-codex    main 9648e1881add18791bdf4f0e833e5cda005301c2
             önceden var olan README.md ve MCP_SETUP.md kullanıcı değişiklikleri korundu
```

## Doğrulama

- Mobile typecheck, ESLint ve `91/91` test geçti.
- Expo Doctor `20/20`; Android production JS bundle ve arm64 release build geçti.
- CAP/BFF `65/65` test, aktif v24 runtime ile tekrar `65/65` ve production CDS
  build geçti.
- ABAP değişen iki kaynak lint `0`; full local check ve SAP object name check geçti.
- SAP preflight syntax/activation/ATC geçti; canlı ADT kaynak marker parity’si
  ayrıca okundu. SM59 SSL bağlantı testi `404 Not Found / 119 ms` ile geçti.
- İzole pilot/degraded smoke: health, authenticated match list ve league-context
  HTTP 200; `deviceRegistration=configured`, `notificationService=configured`.
- Aktif 4004 kontrollü restart sonrası local/public health HTTP 200; iki kayıtlı
  cihaza gerçek FCM denemesi `2/2` teslim edildi.
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

## Exact next steps (blocking değil)

1. Ayrı APK dağıtım onayıyla v12 telefona kurulur; Bibi rehberi, lig/final skor,
   oran/baskı ikonları, Fiori login, widget ve notification gözlenir.
2. Gerçek Windows reboot sonrasında başlangıç görevinin aynı configured pilot
   profilini otomatik kaldırdığı doğrulanır.
3. Mobile transitive audit bulguları Expo’nun uyumlu patch hattı çıktığında ayrı
   dependency bakım batch’inde güncellenir; zorlayıcı downgrade yapılmaz.
4. BTP deploy gerekiyorsa CAP pushed exact SHA’sı için ayrıca
   `DEPLOY-DEV a8f9e50de948967607505ac0d4384012c93dcd2e` onayı alınır;
   production hedeflenmez.

Son notification kapanışı:
`docs/observation_archive/cutover_2026-08-09-05.md`.
