# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-13

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — 2026-08-13 Mobile cutover batch'i doğrulanıp commit/push edildi.
Mobile checkpoint `7ba736df03d373a595f8df395e76a45592b24fa5` ile `origin/master`
üzerindedir. BTP deploy, Cloudflare/Firebase/SAP dış değişikliği, APK dağıtımı,
release signing ve Cordova cutover yapılmadı; her biri ayrıca açık onay gerektirir.

Yeni task önce yalnız `C:\dev\btb-cdoex\AGENTS.md` ve bu dosyayı tamamen okur.
Observation tespitleri `docs/OBSERVATION_LOG.md` içindedir. Yeni toplu kod batch'i
yalnız `btb next cutover start` ile başlar.

## Son checkpoint

- Karar Günlüğü gün kapsamı ayrı bir uzak buton yerine aktif `Bugün / Tüm günler`
  değerini gösteren kompakt açılır menüdür; yıldız menüsüyle birlikte açık kalmaz.
- Maç ve Super detay özetleri standart bilgi gruplarına ayrıldı. Kullanıcı aşağı
  kaydırınca toolbar genel başlık yerine tek satırlık maç adını gösterir.
- Canlı detaydaki yinelenen baskı dengesi kaldırıldı. Ortak `PressureBalance`
  bileşeni yalnız tarihsel Super karar snapshot'ını Super detayında açıklar.
- `Daha Fazla` ekranında cihaz bazlı Super görünür bildirim eşiği `1+`–`5 yıldız`
  olarak saklanır. Eşik altı data-only mesaj widget'ı günceller fakat görünür yerel
  bildirimi bastırır; Toto ve genel bildirimler değişmez.
- Tema seçimi erişilebilir bir Koyu tema switch'idir. Uygulama tercihi native
  `btb-widget` resolver'ına senkronize edilir; BTB bildirim ve performans widget'ları
  aynı merkezi açık/koyu paletle birlikte yeniden çizilir.
- Mobile BFF sözleşmesi, CAP runtime, SAP/Fiori/model davranışı ve notification
  producer bu batch'te değiştirilmedi.

## Repo durumu

```text
zbet-mobile
  branch/upstream : master / origin/master
  checkpoint      : 7ba736df03d373a595f8df395e76a45592b24fa5
  state           : v16 Mobile cutover commit/push tamamlandı; yalnız bu handoff
                    yenilemesi takip eden docs commit'inde yayımlanır

zbet-cap
  branch/upstream : main / origin/main
  HEAD            : 5fbffbf335238410f8d6f0c6815d0c33f8d35a15
  state           : temiz; bu cutover'da değiştirilmedi ve deploy edilmedi
```

Kullanıcıya ait mevcut değişiklikler korunmuştur. Açık diff yalnız bu cutover'ın
Mobile UI, notification preference, Android widget tema ve belge kapsamındadır.

## Doğrulama

- `npm run check`: TypeScript, ESLint ve `95/95` test geçti.
- Expo Doctor: `19/20`; yalnız Expo SDK 57 paketlerindeki bilinen yedi yama sürümü
  farkı vardır. Bu özellik batch'ine dependency yükseltmesi karıştırılmadı.
- ARM64 ve x86_64 release build geçti; native widget Java/Kotlin kaynakları derlendi.
- Android API 35 x86_64 emülatöründe pilot giriş ve gerçek API verili Özet açıldı.
- Daha Fazla ekranında tema switch'i ve Super bildirim eşiği görsel olarak bulundu.
  Switch açık palete kontrollü reload yaptı; iki widget provider manifestte bulundu.
- Emülatör logunda native module veya FATAL crash görülmedi.
- Final ARM64 package/ABI/v2 imza/hash doğrulandı. Bağımlılık bytecode'undaki genel
  `client_secret` alan adı dışında private-key/service-account secret marker yoktur.
- Bağlı fiziksel cihaz olmadığı için gerçek launcher widget parity'si ve gerçek FCM
  eşik davranışı observation'a bırakıldı.

## Final yerel pilot APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-20260813-v16-final.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,177,769 bytes
SHA-256 : B9A612DDC0EB227780E5918E2D272572B1F798093AF5E0F2905ACCC949D94BE4
Signing : APK Signature Scheme v2; pilot debug certificate
```

Artifact klasöründe yalnız v16 final tutulur. Önceki v15 ile geçici x86_64 smoke
APK'sı doğrulama sonrasında Geri Dönüşüm Kutusu'na taşındı. APK dağıtılmadı.

## Açık observation maddeleri

- Fiziksel telefonda v16 kurulum, tema kalıcılığı, iki gerçek launcher widget'ının
  açık/koyu paleti ve data-only FCM Super eşiği parity'si.
- Dar ekran/büyük yazıda detay özet kartları ve aşağı kaydırmada sticky maç başlığı.
- `NXT-OBS-073`: `htpi/atpi` alanlarının upstream SAP/OData/BFF zincirinde eksik
  olması nedeniyle Bilyoner takım logosu resolver entegrasyonu bekliyor.
- `NXT-OBS-074`: notification producer sürekliliği için SAP çağrı/SM59 telemetry kanıtı.
- `NXT-OBS-086`: Toto idempotency düzeltmesi `BTB Toto - Aktif` sahipliğindedir.
- `NXT-OBS-089`–`NXT-OBS-094`: detay kartı parity, Toto güncellik/sonuç alanları,
  yıldız sıralaması, güncel baskı kaynağı ve ana sekme swipe talepleri bir sonraki
  Mobile cutover adayıdır; kaynak alanı isteyen parçalar kanıtlanmadan uygulanmaz.
- Expo SDK 57 yama sürümleri ayrı dependency bakım batch'i olmalıdır.

## Exact next steps

1. Observation modunda fiziksel cihaz sonuçlarını topla.
2. Kullanıcı `btb next cutover start` derse yalnız aktif ve yeterince açık observation
   maddelerini yeni yerel batch olarak dondur; veri kaynağı kanıtı isteyenleri ayır.
3. BFF değişmediği için bu checkpoint'te BTP deploy gerekmez.
4. APK dağıtımı istenirse v16 ARM64 dosyasını ayrı açık dağıtım onayıyla paylaş.

Cutover kanıtı: `docs/observation_archive/cutover_2026-08-13-01.md`.
