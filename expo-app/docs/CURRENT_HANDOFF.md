# BTB Mobile Next — Güncel Devir

Son güncelleme: 2026-08-13

Çalışma alanı: `C:\dev\btb-cdoex`

Aktif task: `BTB Mobile Next - Aktif`

Mod: `OBSERVATION` — 2026-08-11 ikinci Mobile cutover batch'i tamamlandı ve
`c6c75f1` ile `origin/master` üzerine gönderildi. BTP deploy,
Cloudflare/Firebase/SAP dış değişikliği, APK dağıtımı, release signing ve Cordova
cutover yapılmadı; her biri ayrıca açık onay gerektirir.

Yeni task önce yalnız `C:\dev\btb-cdoex\AGENTS.md` ve bu dosyayı tamamen okur.
Observation tespitleri `docs/OBSERVATION_LOG.md` içindedir. Yeni toplu kod batch'i
yalnız `btb next cutover start` ile başlar.

## Son checkpoint

- Koyu tema varsayılan kalır. `Daha Fazla > Uygulama görünümü` kalıcı açık/koyu
  seçim sunar; semantik palet giriş, splash, ana/detay ekranları, grafikler,
  durumlar, navigation ve Bibi katmanına uygulanır.
- Bibi rehberi v2 sabit koordinat kullanmaz. `TutorialTarget` gerçek bileşenin
  ölçülen sınırını hedef kimliğiyle izler, yalnız o nesnenin kenarını BTB yeşiliyle
  vurgular ve adım/ekran/kapanış değişiminde özgün görünümü geri getirir.
- Daha Fazla ekranında tek Bibi ayarı `Bibi rehberini baştan başlat` eylemidir.
- Ortak UI standardı `docs/UI_INTERACTION_STANDARD.md` içindedir: 44–48 dp
  dokunma hedefi, 720 dp içerik sınırı, safe-area, spacing/tipografi, dar ekran
  wrap, durum ve aksiyon hiyerarşisi.
- Maç, Super ve Toto detaylarında sol 32 dp kenardan başlayan swipe mevcut
  navigation stack ile geri döner; Android geri davranışı değişmedi.
- Mobile BFF sözleşmesi, CAP kodu, SAP/Fiori/model davranışı ve notification
  producer bu batch'te değiştirilmedi.

## Repo durumu

```text
zbet-mobile
  branch/upstream : master / origin/master
  implementation  : c6c75f1fae101d29982774340a93189a120b9522
  handoff closure : origin/master bu güncel devir belgesini içerir
  state           : temiz; upstream ile aynı

zbet-cap
  branch          : main
  HEAD            : 5fbffbf335238410f8d6f0c6815d0c33f8d35a15
  state           : temiz; bu cutover'da değiştirilmedi ve deploy edilmedi
```

Mobile değişiklikleri tema, tutorial target/provider/overlay, ortak UI
bileşenleri, ana sekmeler, Maç/Super detayları ve güncel dokümantasyonla
sınırlıdır. Kullanıcıya ait mevcut değişiklikler korunmuştur.

## Runtime ve doğrulama

```text
Mobile API : https://api.surklase.com
Health     : HTTP 200
Dashboard  : authenticated pilot smoke HTTP 200, application/json
```

- `npm run check`: TypeScript, ESLint ve `92/92` test geçti.
- Expo Doctor: `19/20`; yalnız Expo SDK 57 paketlerinde bilinen yedi yama sürümü
  farkı vardır. Bu görsel cutover'a bağımlılık yükseltmesi karıştırılmadı.
- Koyu ve açık Android production JS bundle'ları geçti.
- Android 15 x86_64 release emülatöründe açık tema giriş/Özet/Maç Detayı,
  Özet'teki üç ardışık Bibi hedefi, hedef temizliği ve Maç Detayı → Özet
  edge-swipe doğrulandı.
- ARM64 release build geçti; package/ABI/v2 imza ve secret marker taraması geçti.
- Fiziksel telefon install/tema kalıcılığı/tüm rehber hedefleri henüz gözlenmedi.

## Final yerel pilot APK

```text
Path    : C:\dev\btb-cdoex\zbet-mobile\expo-app\.codex-artifacts\btb-mobile-next-arm64-cutover-20260811-v15-final.apk
Package : com.btb.mobile.next
Version : 0.1.0 (1)
ABI     : arm64-v8a
Size    : 48,165,788 bytes
SHA-256 : 2053B7D14A9A22DAA3587C4057ED0F0A2D1661ECCB10BB1AE40B1939A0D7A662
Signing : APK Signature Scheme v2; pilot debug certificate
```

Artifact klasöründe yalnız v15 final tutulur. Önceki APK'lar ve geçici emülatör
paketleri çalışma dışındaki kurtarılabilir geçici klasöre taşınmıştır. APK henüz
dağıtılmadı.

## Açık observation maddeleri

- Fiziksel telefonda v15 kurulum, açık/koyu tercih kalıcılığı, farklı ekran
  yoğunluklarında bütün Bibi hedefleri, edge-swipe ve notification/widget parity.
- `NXT-OBS-073`: lisanslı/stabil takım logosu kataloğu tasarımı.
- `NXT-OBS-074`: notification producer sürekliliğinin SAP çağrı/telemetry kanıtı.
- Expo SDK 57 yama sürümleri ayrı dependency bakım batch'i olarak ele alınmalı.

## Exact next steps

1. Observation modunda fiziksel cihaz sonuçlarını topla.
2. BFF değişmediği için bu checkpoint'te BTP deploy gerekmez.
3. APK dağıtımı istenirse v15 ARM64 dosyasını ayrıca açık dağıtım onayıyla paylaş.

Cutover kanıtı: `docs/observation_archive/cutover_2026-08-11-02.md`.
