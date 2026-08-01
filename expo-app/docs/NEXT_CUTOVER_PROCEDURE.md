# BTB Mobile Next — Observation Cutover Procedure

## Amaç

Gerçek cihaz kullanım tespitlerini observation döneminde biriktirip yerel
değişiklikleri tek analiz, uygulama ve doğrulama paketinde tamamlamak.

Bu akış Cordova production cutover değildir. `btb next cutover start` yalnız
observation backlog’undaki yeterince açık, Mobile kapsamındaki yerel kod ve
dokümantasyon değişikliklerini başlatır.

## Observation modu

- Her kullanıcı tespiti `docs/OBSERVATION_LOG.md` içine kısa ve kanıt odaklı
  kaydedilir.
- Aynı problemin tekrarları yeni iş maddesi açmak yerine mevcut kayda eklenir.
- Observation sırasında kod, config, deploy veya dış sistem değiştirilmez.
- Güvenlik, veri kaybı veya tam kullanım engeli ayrıca bildirilir; kullanıcı
  observation kuralını açıkça kaldırmadıkça yine toplu cutover’a bırakılır.

## `btb next cutover start`

Komut geldiğinde:

1. Mobile context audit çalıştırılır; observation logu dondurulur.
2. Maddeler yinelenen, doğrulanmış hata, UX iyileştirmesi, yeni özellik,
   dış-kapsam ve kanıt-yetersiz olarak sınıflandırılır.
3. Etkilenen repo/dosya sınırı ile doğrulama planı tek bir kısa plan halinde
   paylaşılır.
4. Yeterince açık ve kapsam içindeki yerel değişiklikler ayrı mikro-onaylar
   beklenmeden tek batch içinde uygulanır.
5. Mobile ve BFF katmanlarında değişen kapsama uygun type/lint/test/doctor,
   bundle/build, contract, public smoke, cihaz ve secret/log kontrolleri
   çalıştırılır.
6. Başarılı, ertelenen ve kanıt bekleyen maddeler ayrıştırılır; aktif log
   yalnız açık maddelerle bırakılır.
7. Bütün zorunlu kalite kapıları geçtiğinde repo durumu, değişen dosyalar ve
   doğrulama sonucu özetlenir. Stage/commit/push yalnız kullanıcı bu adımı
   ayrıca açıkça onaylarsa yapılır; onay yoksa çalışma doğrulanmış dirty
   checkpoint olarak bırakılır.
8. Final telefon artifact’ının ABI, imza ve hash doğrulaması kaydedildikten sonra
   `.codex-artifacts` temizlenir. Yalnız son doğrulanmış fiziksel telefon `arm64`
   APK’sı tutulur; önceki APK sürümleri, `x86_64` emülatör paketleri ve geçici
   build/log/ekran kanıtları deploy veya kullanıcıya teslimden önce Geri Dönüşüm
   Kutusu’na taşınır. Kaynak, test, handoff ve observation arşivleri bu temizliğe
   hiçbir zaman dahil edilmez.

Belirsiz iş kararı, kapsam genişlemesi veya geri döndürmesi zor işlem varsayımla
uygulanmaz; blocker olarak raporlanır.

## Onay sınırları

Komut yalnız yerel batch edit/test ve doğrulamayı onaylar. Stage/commit/push
ayrı açık onay ister; cutover dışındaki kullanıcı değişiklikleri hiçbir zaman
varsayımla commit kapsamına alınmaz.

BTP deploy, Cloudflare DNS/Tunnel yayını, Firebase veya SAP dış değişikliği,
release imzalama/dağıtım ve Cordova cutover her seferinde ayrı açık onay ister.

## Kapanış

Tamamlanan maddeler
`docs/observation_archive/cutover_YYYY-MM-DD.md` dosyasına taşınır. Handoff,
artifact/checkpoint, repo commit/push SHA’ları ve açık kapılar güncellenir. Akış
`btb next cutover start sonlandı` ifadesiyle kapatılır ve task tekrar
observation moduna döner.
