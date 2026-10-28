# Jinx — tek kısa çıkarım

Durum: SUPERSEDED / LOCAL_ONLY / NOT_RELEASED. NXT-OBS-231.

Bu 6/10 adayın yerine sahibin ≥8 isteğiyle güncel değişimi yorumlayan sürüm
hazırlandı: [güncel inceleme](JINX_CONTEXT_REVIEW_2026-10-27.md).
Aşağıdaki kapsam ve kanıtlar önceki yerel adayı belgeler; teslim/kabul değildir.

Sahip, önceki üç bölümlü yanıtı uzun ve katkısız buldu. Bu aday onun yerini
alır; [önceki deneme ve sağlayıcı kanıtı](JINX_COMMENTARY_REVIEW_2026-10-27.md)
kabul edilmiş bir teslim değildir.

- Kart, donmuş kararın baskı desteğini kaliteyi sınırlayan kayıtlı alanla
  ilişkilendiren bir veya iki cümle gösterir; en fazla 210 karakter sınanır.
- Örnek: “Baskı aralıkları seçimi aynı yönde desteklemiş. xG kapsamı, kalite
  tavanını 2 yıldızla sınırlamış.” xG ifadesi yalnız ilgili kayıt tavanından gelir;
  sahibin fotoğrafındaki görünmeyen tavanın gerçekten xG olduğu iddia edilmez.
- Yön çelişkisi, ters oy ve eksik baskı desteği olumlu teyit diye sunulmaz.
  Sonuç kazanmış/kaybetmiş olsa da karar anının yorumu değişmez.
- Yinelenen havuz yüzdesi/oran kutuları ve uzun açıklama varsayılan karttan
  kaldırıldı. Sayılar, yıldız tavanları ve diğer adaylar Dayanakları gör altında.
- Yenile yalnız mevcut RB1 kaydını yeniler. İstemci Jinx için LLM çağırmaz;
  v2 BFF/metin üretimi denemesi geri çekildi. BFF ağacı HEAD ile aynıdır;
  yayımlanmış istemcilerin v1 servisi ve çalışma ortamı değiştirilmedi.

Type/lint/brand, 682 istemci +32 tooling testi; Android JS/Hermes preview
export/secret scan ve canonical edge web export/secret scan başarılı.
Değişmeyen bağımlılıklar için önceki Doctor20/20 sonucu kullanıldı.
Sentetik gerçek MatchDetailView: 320/390/1440 px, klavye yenileme/aç-kapat,
kısmi destek, tamamlanmış maç ve boş/hatalı kaynak doğrulandı; taşma yok.
Önizleme istek sayacı açılış/yenileme/kanıt açma sonrasında 0 Jinx LLM isteği
gösterdi. Fiziksel Android/TalkBack kabulü ve yeni APK/web yayını yapılmadı.

[Telefon](evidence/JINX_COMPACT_2026-10-27/phone-compact.jpg),
[masaüstü](evidence/JINX_COMPACT_2026-10-27/desktop-compact.jpg),
[tarayıcı](evidence/JINX_COMPACT_2026-10-27/browser-checks.json),
[ağ](evidence/JINX_COMPACT_2026-10-27/network-check.json).
Yerel önizleme: http://127.0.0.1:8098/__preview (yalnız sentetik veri).

Çalışma yalnız Mobile istemcisinde yereldir. Git işlemi, BFF aktivasyonu veya
yayın yapılmadı. Mevcut kabul edilmiş 9d87b2e çifti ve geri dönüş çiftleri korunur.
İnceleme kabulünden sonra scoped commit/push ve eşleşik APK/web teslimi kendi
açık onaylarını gerektirir. Scope: RebuildJinxCard, jinx-insight.ts ve testleri.
