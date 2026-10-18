# Android/web UX ve Jinx — birleşik çalışma kaydı

Tarih: 2026-10-18 · Görev: TASK-0162 · Sahip: BTB Mobile Next.

Başlangıç kaynak: `zbet-mobile 3d2925b5d65598cd75bc44e4e686db7b2a5df0e1`.
Kabul edilmiş son Android/web çifti: `524f2e7`; bu çalışmanın yayın veya cihaz kabulü değildir.

## Yöntem ve kanıt sınırı

UX ve istatistiksel iletişim ajanları ilk raporlarını birbirlerinin raporunu okumadan
kaydetti: [UX_REVIEW.md](UX_REVIEW.md), [STATISTICS_REVIEW.md](STATISTICS_REVIEW.md).
Birleştirme bundan sonra yapıldı. Kaynak olguları, kullanıcı yorum hipotezleri ve
estetik tercihler ayrı tutulur. Canlı model değerlendirmesi veya insan uzman kabulü
iddiası yoktur. Kaynak incelemesinde doğrulanmış P1 bulunmadı.

`adb devices -l` bağlı cihaz göstermedi. Gerçek web mevcut Cloudflare Access giriş
ekranına ulaştı; açık doğrulanmış oturum yok. Fiziksel Android, TalkBack, gerçek
web oturumu, kullanıcı görev süreleri ve akıcılık kabulü bekliyor. Yerel mock tarayıcı
kontrolleri bunların yerine geçmez. Erişim politikası veya runtime değiştirilmedi.

## Tek öncelik listesi

K: kaynakla doğrulanan davranış; H: kullanıcı/cihaz testi bekleyen hipotez; T: tasarım
tercihi. P2 anlamlı sunum/erişim sorunu veya risk adayıdır; H kendi başına arıza kanıtı değildir.
Her satır Android ve web için ortak kabul ister; platform farkı açıkça belirtilir.

| Kimlik / öncelik | Kanıt | Birleşik bulgu ve kesin sonraki iş | Bu checkpoint |
|---|---|---|---|
| F01 / P2 K+H | STAT-01 | %3/%4 minimum doluluk küçük/sıfır değerleri büyütüyor. Çubuklar gerçek oranı izlemeli; etiket veya ayrı nokta görünürlüğü sağlamalı. | Ortak aktif grafiklerde minimumlar kaldırıldı; sıfır/eksik/küçük değer testleri geçti. Gerçek kullanım kabulü bekler. |
| F02 / P2 K+H | STAT-02/03/04 | Tarih, birim, payda/kohort ve legacy gösterge anlamı eksik/kısa. Mevcut metadatayı görünür kullan; eksik veriyi üretme. | Günlük Super tarih/filtre/sonuçlanan kayıt kapsamı görünür; örneklem/dönem/birim eksikliği yerinde belirtilir. Kaynak metadatası hâlâ bağımlılık. |
| F03 / P2 K+H | STAT-06 | Toto “Güven %” hedefi/kalibrasyonu DTO'dan doğrulanamıyor. Anlamı Toto sahibinden doğrula; değeri veya eşikleri değiştirme. | Ortak gerçek detay ekranı tanım/kalibrasyonun ve olasılık yorumunun doğrulanmadığını belirtir; değer/etiket/eşik değişmez. Kaynak tanımı açık bağımlılık. |
| F04 / P2 K | UX-01 | İki opak metin/zemin çifti normal metin 4.5:1 hedefinin altında. Ayrı eylem renk çifti ve küçük metin kontrastı doğrulanmalı. | Ortak actionFill/onAction ve açık tema textSubtle düzeltildi; opak çift testleri geçti. Tüm gradyan/cihaz kabulü değildir. |
| F05 / P2 K | UX-02/03 | Yardımcı KPI hatası tüm özeti kaldırabiliyor; ErrorState her hatayı OFFLINE sayıyor. Veri bölgelerini ayır; gerçek hata kategorisine uygun kurtarma göster. | Dashboard ve KPI ayrı; hata kategorisi yapılandırılmış status/code üzerinden belirlenir. Bilinmeyen hata offline veya ham mesaj sayılmaz. |
| F06 / P2 K+H | UX-04/05/06 | Görsel başlık, modal odak ve web tablo/bağlantı semantiği ortaklaştırılmalı. Klavye/TalkBack görevleriyle doğrula. | Ortak başlıklar, gerçek web hücre/link rolleri ve modal odak izolasyonu uygulandı. Mock web klavye smoke geçti; TalkBack bekler. |
| F07 / P2 K+H | UX-07/08 | Bazı hareketler tercihi kullanmıyor; büyük yazı/zoom kırpılması sınanmalı. Hareketi kapatabil ve içeriği yeniden akıt. | Jinx kalıcı Canlı/Sakin/Kapalı/gizleme ve sistem tercihi; Journey modal/Super scroll hareket azaltma uygulandı. Büyük yazı/gerçek zoom bekler. |
| F08 / P2 H | UX-09 | Büyük lig grubunda map edilen kartlar gerçek veri hacminde kaydırma riski taşıyor. Hacimli liste ve yenilemede ölç. | Performans kusuru veya iyileşme iddiası yok; cihaz ölçümü bekliyor. |
| F09 / P2 K+H | STAT-05/09/10 | Havuz uyumu, canlı mod ve kaynak sayısı olasılık/sağlık/güven değildir. Kritik sınırı ilgili sayının yanında göster. | Aktif grafiğe olasılık değildir açıklaması; Jinx gerçek kaynak sayısı ve sentetik veriyi ayırır. Runtime modundan bağlantı sağlığı çıkaran metin kaldırıldı; mock detaylar örnek diye etiketlenir. Model/verdict değişmedi. |
| F10 / P2 H + P3 T | UX-10, STAT-07 | Jinx bağlamı rota kadar gömülü detaydan da etkilenir. Sonuç mizahı yeni bahis avantajı gibi anlaşılmamalı. | Sahip A'yı seçti; ortak runtime'a alındı. Ayrılmış kart, odaklı gömülü detay koruması, nötr WAIT ve taze açık olay adaptörü var. Para/kâr ruh hâli kaldırıldı. |
| F11 / P3 K+H | UX-11, STAT-08 | Arama kapsamı ve sonuç sayısı açıklanmalı; filtre/geri dönüş bağlamı korunmalı. | Palet arama kapsamı açık; Canlı kapsam/sonuç sayısı ve Temizle düğmesi var. Sabitleme ayrı 48dp düğme; Space çalışır. Arama/geri dönüş smoke geçti; sahip ölçümü bekler. |

## İşletilebilir prototip checkpoint'i

`/design-lab` yalnız `useMocks=true` ve `authMode=preview` birleşiminde erişilebilir.
Pilot/edge/OAuth istemcisinde rota ve Daha Fazla bağlantısı kapalıdır. Mevcut
global Jinx laboratuvarda render edilmez. Sahip A seçimi sonrasında ortak istemci
Jinx'i ve doğrulanmış evrensel düzeltmeler uygulandı. Önizlemenin tüm verileri sentetiktir; yeni bir API
çağrısı, ekonomik politika veya analitik hesap içermez.

- Deneyim: Özet/Canlı/Maç/Super/Toto/Ayarlar ortak React Native ekranları.
- Jinx sahneleri: aynı durum ve zamanlamayla A futbol topu/B saha tilkisi; selam,
  dokunma, sürükleme, düşünme, nötr yanıt, gol/devre, bekleme ve rehber.
- Canlı/Sakin/Kapalı tercihi yalnız laboratuvara ait anahtarda tutulur. Sistem
  hareket azaltma tercihi üstün gelir. Ses eklenmez.
- Olay tekrarı, yanlış maç/revizyon, skor düzeltmesi, arka plan ve kullanıcı
  etkileşimi için saf durum yöneticisi; kesilen olay sonradan tekrar oynatılmaz.
- İki konsept için görseller aynı boyuta hazırlanır; atlaslar çalışma alanında,
  optimize edilmiş kareler projede saklanır. Ayrıntı: [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md).

## Sonraki adım ve sahiplik

Sahip A geliştirilmiş Jinx'i seçti ve önerilen ekran yönüyle devamı onayladı.
Ortak istemcide palet/yazı/kartlar, özet hiyerarşisi, web grid okuma sırası,
arama ve ayarlar uygulandı. F01–F11 ilgili
kanıtlarla kapatılır, mevcut kaydedilmiş tercihler korunur. Bu seçim, commit/push,
native build/signing, dağıtım veya web yayını onayı değildir.

BTB bağımlılıkları: tarihsel pay/payda/dönem/kohort, kâr/stake birimi ve legacy
göstergelerin tanımı. Toto bağımlılıkları: confidence hedefi/kalibrasyonu ve maliyet
birimi. TASK-0156'nın rolling 7/30 gün ve runtime akışı bu çalışmada türetilmez.
Veri/kanıt beklemeleri kanonik görev yazıcısıyla tarihli gate olarak tutulur.

Kullanıcı kabulü için bağımsız raporlardaki sekiz görev ve n=1 çapraz karşılaştırma
protokolü kullanılır. Anlama/doğru görev tamamlaması estetik beğeniden ayrı kaydedilir;
tek sahibin tekrarları bağımsız kullanıcı örneklemi olarak raporlanmaz.
