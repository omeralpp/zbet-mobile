# Jinx — kararın ardından ne değişti?

Durum: LOCAL_VALIDATED / GIT_APPROVED / NOT_RELEASED. NXT-OBS-231.

Sahip 2026-10-28'de yalnız zbet-mobile kapsamındaki commit/push işlemini açıkça
onayladı. Onay APK/web yayını veya BFF aktivasyonu içermez.

Sahibin isteği, kısa ama katkısı sınırlı 6/10 adayı 8 ve üzerine çıkarmak.
Yeni aday için öznel ürün değerlendirmesi 8/10: bu puan kullanıcı araştırması,
tahmin başarısı veya ölçülmüş bahis performansı değildir.

- Öncelik, ilk karardan sonra değişen kanıtta: baskı desteği, modelin son teyidi,
  kapanan/sonuçlanan pazar, skorun kritik koşulu ve daha yeni karar.
- Baskı azalması tek başına teyit kaybı sayılmaz. Örneğin 2/2→2/3 desteğinde
  yerel sonuç hâlâ kabul ediyorsa bunu açıkça söyler; artan baskı da reddedilmiş
  pazarı uygun bir seçim gibi göstermez.
- Örnek: “Baskı desteği azalmış; oran açık olsa da son hesap bu pazarı teyit
  etmiyor.” Küçük karşılaştırma satırı: 2/2→0/2. Sayılar ayrıca metinde tekrarlanmaz.
- Skor yorumu gol/eşitlik koşulunu açıklar. Maç sonunda sonuç kaydı bekleniyorsa
  kazandı denmez; skorla kanonik sonuç uyuşmuyorsa kontrol istenir. Skor geri
  değişimi ayrı belirtilir. Native sonuç, yıldız, model ve öğrenme değiştirilmez.
- Daha yeni yayımlanmış karara doğrudan geçilir; varlığı aktif seçim sayılmaz.
  İki cümle/210 karakter sınırı test edilir. Dayanaklar isteğe bağlı açılır.

Güncel kıyaslama aynı maça ait doğrulanmış currentMatchRecord ve kaynak
durumu gerektirir. RB1 okuması en fazla 30, saha okuması 120 saniye yaşında;
iki kaynak edinimi en fazla 30 saniye ayrı olabilir. Edinim zamanı sağlayıcının
ölçüm zamanı değildir. Baskı değişimi için karar sonrasına ait gerçek aralık
bitişleri gerekir; hesaplanmamış sıfırlar değişim sayılmaz. Eksik/eski/yabancı
kaynak güncel kanıt yerine geçmez; donmuş karar ve gerekçesi korunur.

Mevcut RB1 ve saha DTO'ları kullanılır; yeni endpoint veya Jinx LLM çağrısı yok.
BFF/API denemesi geri çekilmiş, BFF ağacı HEAD ile aynı kalmıştır. Android ve
web aynı ortak bileşeni kullanır; iki yüzey bu yerel partide birlikte doğrulandı.

Doğrulama: type/lint/brand, 700 istemci +32 araç testi başarılı. Bunlar 18 pazarın
0–5 skorlarında 648 koşulunu mevcut BFF semantiğiyle karşılaştırır. Android
JS/Hermes export (1 taranan dosya) ve canonical edge web export (4 dosya) secret
scan temiz. Değişmeyen bağımlılıklar için önceki Doctor20/20 sonucu kullanıldı.
Sentetik gerçek MatchDetailView; 320/390/1440 px, klavye, dokuz bağlam,
dayanak açılımı ve yeni karara geçiş/yenileme doğrulandı. Jinx LLM istek sayısı 0.

[Telefon](evidence/JINX_CONTEXT_2026-10-27/phone-pressure.jpg),
[maç sonu](evidence/JINX_CONTEXT_2026-10-27/phone-result.jpg),
[masaüstü](evidence/JINX_CONTEXT_2026-10-27/desktop-pressure.jpg),
[tarayıcı](evidence/JINX_CONTEXT_2026-10-27/browser-checks.json),
[doğrulama kaydı](evidence/JINX_CONTEXT_2026-10-27/validation-receipt.json),
[ağ](evidence/JINX_CONTEXT_2026-10-27/network-check.json).
Yerel sentetik önizleme: http://127.0.0.1:8099/__preview.

Bu kontroller canlı SAP veya fiziksel Android/TalkBack kanıtı değildir.
BFF aktivasyonu, APK build/sign/dağıtım ve web yayını yapılmadı; bu adımların
açık onayları hâlâ gereklidir. Kabul edilmiş 9d87b2e APK/web çifti korunur.
Önceki [kısa aday](JINX_COMPACT_REVIEW_2026-10-27.md) ve
[uzun deneme](JINX_COMMENTARY_REVIEW_2026-10-27.md) kanıtları saklanır.
