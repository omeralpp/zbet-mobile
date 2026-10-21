# Bire bir batch — 2026-10-21 (Claude, sahip kararlarıyla)

Sahip `473d4f2` APK'sını kurdu ve tasarımda gösterilen v40 panolarına göre eksikler
bildirdi: "eski A3 için olan kısmı kaldır, bana gösterdiğin tasarımı bire bir uygula".
Eksikler soru olarak soruldu; bu batch sahibin cevaplarını iki yüzeyde birlikte
uygular (NXT-OBS-182). Yerel değişikliktir; commit/push, APK ve web yayını her biri
ayrı onay ister.

## Sahip kararları (2026-10-21)

1. **Tüm A3 izleri kalkar:** Super'deki "Eski A3 tarihçesi" ve ekranı, A3 karar
   sayfası (eski bildirim bağlantısı panodaki "Ekran bulunamadı" durumunu açar),
   Jinx'in A3 `GÜNLÜK SUPER` balonu ve `Günlük yorum`'un A3 içeriği.
2. **Super ekranları pano düzeninde, RB1 karşılıklarıyla:** `Bugün` yerine
   7/30 gün (RB1 raporu yalnız bu dönemleri verir); model skoru, temel olasılık ve
   edge yerine RB1 kanıtı; `Karar anındaki lig` yok; sonuç `birim · varsayımsal`.
3. **Jinx günlük kartı:** RB1 son 7 gün, nötr dil (ruh hâli, taç, cüzdan yok).
4. **RB1 maç detayı:** Maçın yolu (`ÖRNEK VERİ` etiketiyle), Baskı grafiği ve
   Karar özeti (RB1 fişi ve kanıtı) geri gelir.
5. **Bilinçli sapmalar panoya döner:** logosuz takımda baş harf rozeti (NXT-OBS-103
   yerine), Canlı'nın ikinci sekmesi `Tümü` (NXT-OBS-123 yerine), koyu Jinx balonu,
   Toto `Sonuç bekliyor` altın.
6. `473d4f2` web'i şimdi yayımlanır (yapıldı: `20261021T135353Z-473d4f2`).

## Değişenler (Android ve web birlikte)

- **Super · Karar günlüğü:** `Tümü / ★ eşiği / Bekliyor` çipleri, `7 gün ▾` dönem
  menüsü, özet kartı (yıldız kapsamında raporun kendi yıldız satırları tam
  toplanır), panodaki karar kartı (baş harfler, kanıt satırı, seçim oranı, kesik
  çizgi, birim). Telefon `Tümü` ile yıldız sayfası arasında yerel kaydırmayı korur;
  masaüstü sıralanabilir tablo ve dört kutu. Rapor ayrıntısı (ROI, isabet, risk,
  kırılımlar) katlanır panelde.
- **Super kararı (RB1):** Karar anı / Güncel durum fişi; `KARAR` (tutarlılık,
  havuz desteği, baskı teyidi), `SAHA` (oy aralıkları, ham ev/deplasman değerleri),
  `BAĞLAM` (havuz desteği, yıldız tavanları), `MAÇ` (maç boyunca öneriler); web'de
  2×2 ızgara. A3 anahtarı panodaki "Ekran bulunamadı" durumuna düşer.
- **Maç detayı:** kompakt başlık ve yenile, `67′ · 2. YARI`, isim altında sıra ve
  baskı işareti, kanıt kalitesi çubuğu, `BTB SEÇİMİ · dakika`, panodaki Jinx kartı
  (durum, Jinx metni, havuz desteği yüzdesi, çipler, `Kanıtı gör` = diğer adaylar ve
  elenme nedenleri), `Maçın kanıtları` çipleri (bölüme kaydırır, kapalıysa açar),
  kare katlama düğmeleri, Bilyoner dış bağlantısı. Maçın yolu olay şeridinde RB1
  önerileri yıldız olarak; A3 Super log işaretleri kalktı.
- **Kartlar ve Canlı:** baskı işareti ve kırmızı kart skorun yanında, baş harf
  rozeti, `BTB SEÇİMİ`, fazla satırlar kalktı, başlık altı çizgi yok, `Liste sonu`
  işareti, web'de tek satır araç çubuğu ve yoğun liste satırları.
- **Özet:** RB1 Jinx kartı, her zaman görünen `Son Super hareketleri` (satır Super
  kararı açar), sürükle-sırala kartı (telefon), web'de dört ayrı kutu ve yatay maç
  kartları; sağ sütunda kararlar ve Spor Toto alt alta.
- **Gezinme:** Canlı sekmesinde canlı maç sayısı rozeti (telefon sekme çubuğu, Jinx
  menüsü, web kenar çubuğu); panonun ikonları (ızgara, canlı hedef, bilet).
- **Jinx:** koyu balon (tema yüzey belirteçleri), `BTB · 7 GÜN` balonu kapatma
  işaretli, menüde geçerli sayfa, canlı rozet ve altın `Günlük yorum`.
- **Toto ve Daha Fazla:** kartta ₺ işareti kalktı, `Sonuç bekliyor` altın; `Jinx
  hareketi` satırında avatar, `Jinx'i gizle` anahtar.
- **Android widget'ları:** v40 belirteçleri (iki tema), `BTB` birincil düğme önde,
  okunur boyutlar; Performans widget'ında halkalar yerine büyük rakam ve ince çubuk,
  Türkçe ondalık virgül, sağ sütun `BTB · 7 GÜN`.
- **Web:** logosuz takımın sağlayıcı yer tutucusu web'de de yakalanır (görsel boyutu
  tarayıcıdan ölçülür), böylece baş harf rozeti görünür.

## Korunan anlamlar

Tek güncel en iyi seçim; maç boyunca ayrı fırsatlar; donmuş ilk oran, dakika, skor
ve yıldız; birebir backend kanıtı ve elenme nedenleri; açık bekleme/kullanılamaz
durumları; yıldız = tutarlılık ve kanıt kalitesi, yüzde = havuz desteği; Jinx aynı
backend kararını açıklar; 7/30 gün varsayımsal tek birim; eski kohort karışmaz;
istemci puanlamaz. Rebuild şemaları, `rebuild-current.ts`, sözleşmeler ve OpenAPI
değişmedi.

## Panodan kalan farklar (veri veya anlam gereği)

- `Bugün` kapsamı yok: RB1 raporu yalnız 7/30 gün yayımlar.
- Model skoru, temel olasılık, edge ve karar anındaki lig yok: RB1'de karşılığı yok;
  olasılık iddiası yapılmaz.
- `kâr` yerine `birim`: sonuç varsayımsal tek birimdir.
- Saha bölümünde `%62` gibi pay yüzdesi yerine ham ev/deplasman değerleri: yüzde
  RB1 ekranlarında havuz desteği anlamına ayrılmıştır.
- `12 sn önce` göstergesi yok: kaynakta gerçek güncelleme zamanı yok (NXT-OBS-032).
- Performans widget'ında kâr eğrisi yerine kazandı/kaybetti çubuğu: zaman serisi
  verisi yok.
- Özet Jinx kartı Jinx menüsü yerine Karar günlüğünü açar.

## Platform istisnaları

Sekme çubuğu yalnız telefonda; masaüstünde kenar çubuğu ve kabuktaki `Yenile`
(detay başlığındaki yenile simgesi masaüstünde gizlenir). Sürükle-sırala kartı
yalnız telefonda; masaüstü modül araç çubuğunu kullanır. Widget yalnız Android.

## Doğrulama

Typecheck, tüm proje lint'i, 658 birim testi, 32 tooling testi ve marka kontrolü
geçti; edge ve mocks web export'ları scratch'te temiz (gizli değer taraması,
yayınlanmış `dist-web` korunur); `git diff --check` temiz. Expo Doctor 19/20: tek
bulgu dış sürüm kayması (`expo-router` SDK beklentisi `~57.0.29`, kilitli
`57.0.28`); bu batch bağımlılık dosyalarına dokunmaz, yükseltme ayrı karardır.

Geçici RB1 örnek verisiyle (commit edilmedi, sonra kaldırıldı) web'de telefon ve
masaüstü genişliği, koyu ve açık tema: Özet, Canlı, maç detayı (çip kaydırma
dahil), Super günlüğü, Super kararı, Daha Fazla. Android: `C:\btb-mobile-smoke-*`
kısa yolunda, tüm `EXPO_PUBLIC_*`/`BTB_*` değişkenleri temizlenmiş, örnek veriyle
x86_64 release derlemesi emulator'da Özet (koyu Jinx balonu, Jinx kartı, baş harf
rozetleri, canlı rozet), Canlı, maç detayı (Jinx kartı, `Karar` çipiyle yerel
kaydırma), Super günlüğü (`Tümü`→yıldız sayfası yerel kaydırma, yıldız kapsamı
özeti), Super kararı, Toto (altın `Sonuç bekliyor`), Daha Fazla ve açık temada
doğrulandı. Widget modülü derlendi (sınıflar APK'da); Performans widget'ı ana
ekranda örnek veriyle v40 düzeninde göründü (büyük rakam, ince çubuk, Türkçe ondalık
virgül). İlk aşama kopyası `android` adlı tüm klasörleri dışladığı için widget'sız
derlenmişti; kopya kökü tam yol dışlayacak şekilde düzeltildi ve yeniden derlendi.
Fiziksel Xiaomi ve yayımlanmış web smoke'ları koordineli release'te.
