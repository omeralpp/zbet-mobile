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

## `observation moduna kadar devam et`

Sahip doğrulanmış bir batch için bu ifadeyi açıkça kullandığında amaç yalnız
yerel kodu bırakmak değil, aynı dondurulmuş kapsamın hâlâ uygulanabilir bütün
kapanış adımlarını tamamlayıp yeniden observation moduna dönmektir:

- tek final fiziksel-telefon ARM64 pilot APK'sını üret, doğrula ve paylaş;
- yalnız bounded batch dosyalarını stage/commit/push et;
- BFF değiştiyse mevcut onaylı yerel pilot runtime'ı temiz pushed SHA'dan bir
  kez yeniden başlat ve bounded public read-back yap;
- archive/handoff/SHA/artefakt kanıtlarını güncelle ve bu son belge değişikliğini
  de commit/push et.

Bu ifade frozen batch dışındaki SAP/Firebase yazısını, Cloudflare DNS/Tunnel
yapılandırma değişikliğini, production signing/dağıtımı, BTP Work Zone deploy'u
veya Cordova cutover'ı kapsamaz. Bir adapter ayrıca exact-SHA `DEPLOY-DEV`
tokenı istiyorsa o daha sıkı kapı korunur; akış o kapı tamamlanmadan observation
kapanışı ilan etmez.

## Kapanış

### APK delivery preference (owner instruction, 2026-10-10)

After each owner-authorized pilot APK build, upload the final verified phone APK
to the owner's connected Google Drive and return its download link in the chat.
This instruction is standing approval for that private pilot upload; do not ask
again for the same delivery step. It does not approve a new build, production
distribution, public sharing, other recipients or changes to existing access.

Use the owner's designated APK folder; when no folder is designated, create a
private `BTB Mobile Next APK` folder in the connected owner's Drive. Preserve
existing files. Before upload, verify the final artifact's signature, ABI,
size and SHA-256 against its build receipt. After upload, read back the Drive
file metadata and size, verify the uploaded bytes against SHA-256 when the
tools allow, and record the observed file ID, URL, source commit and hash in
the delivery checkpoint. Do not claim delivery until readback succeeds.
Keep APK bytes and credentials out of Git; share only the private owner link.

If the connection or upload capability is unavailable, retain the verified
local APK, report the specific delivery limitation and preserve a dated review
gate through the canonical task writer. A plugin installation alone does not
prove that this session can upload a file.

Tamamlanan maddeler
`docs/observation_archive/cutover_YYYY-MM-DD.md` dosyasına taşınır. Handoff,
artifact/checkpoint, repo commit/push SHA’ları ve açık kapılar güncellenir. Akış
`btb next cutover start sonlandı` ifadesiyle kapatılır ve task tekrar
observation moduna döner.
