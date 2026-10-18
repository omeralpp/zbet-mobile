# Bağımsız UX ve erişilebilirlik incelemesi — 2026-10-18

## Kapsam ve yöntem

İncelenen başlangıç: `zbet-mobile` HEAD `3d2925b`. İlk durum kontrolünde çalışma ağacı temizdi. Özet, Canlı, maç detayı, Maçın Yolu/olay denetleyicisi, Super listesi/detayı, Toto listesi/programı, Daha Fazla; ortak ekran, web kabuğu, durum bileşenleri, tipografi, tema, hareket ve mevcut Jinx kaynakları hedefli okunmuştur. Başka bağımsız inceleme raporu okunmamıştır.

Görsel kanıt: çalışma alanındaki `.codex-artifacts/ux-jinx-2026-10-17/` altında `desktop-preview.jpg`, `phone-preview.jpg`, `correction-inspector-desktop.jpg`, `correction-inspector-phone.jpg`. Bunlar sentetik verili önceki yerel adayların görselleridir; güncel yayın veya gerçek Android davranışının kanıtı değildir. Mevcut kaynak ile görsel arasında fark olduğunda kaynak olgusu ayrı belirtilmiştir.

Bu çalışma kaynak incelemesi ve iki opak renk çiftinin matematiksel kontrast hesabıdır. Kimlik doğrulanmış web, fiziksel Android, TalkBack, klavye etkileşimleri, gerçek ağ kesintisi, hareket akıcılığı ve görev süreleri bu incelemeci tarafından çalıştırılmamıştır. Bu alanlarda **GEÇTİ** sonucu yoktur. Build, SAP/iş modeli değişikliği, dış servis işlemi, commit veya dağıtım yapılmamıştır.

Koordinatörün 2026-10-18 erişilebilirlik kontrolü: `adb devices -l` bağlı cihaz göstermedi; gerçek web adresine erişim mevcut Cloudflare Access giriş ekranına ulaştı ve açık doğrulanmış oturum bulunmadı. Bu sonuçlar fiziksel Android ve kimlik doğrulanmış web denetimini **BEKLİYOR** bırakır. Bu rapor için oturum açılmadı, Access politikası değiştirilmedi. Bu ortam bulguları koordinatörden alınmıştır; incelemeci kendi çalıştırdığı kontrol gibi sunmamaktadır.

Kanıt sınıfları:

- **K — Kaynakla doğrulandı:** Yazılı davranış veya eksik açık sözleşme kaynakta görüldü. Çalışan uygulamada aynı etkinin oluştuğu ayrıca doğrulanabilir.
- **H — Test edilecek hipotez:** Kaynak/görsel bir risk gösteriyor; kullanılabilirlik veya cihaz arızası kanıtlanmadı.
- **T — Tasarım tercihi:** Görsel yön/karakter seçimi; hata ya da erişilebilirlik zorunluluğu olarak sunulmaz.

Öncelik: **P1**, temel görevi engelleyen veya yanlış maç/karar bağlamına götüren doğrulanmış sorun; **P2**, anlamlı okunabilirlik, erişilebilirlik veya dayanıklılık sorunu/risk adayı; **P3**, verimlilik ve görsel tercih. **Bu incelemede doğrulanmış P1 yoktur.** P2 hipotezleri, gözlenen arıza gibi raporlanmamalıdır.

## Korunması gereken mevcut güçlü davranışlar

- Web'de kalıcı gezinme ve komut paleti; telefonda beş sekmeli gezinme mevcut: `src/web/AppShell.web.tsx:43`, `src/navigation/BottomTabBar.tsx:27`. Canlı ekran geniş web'de liste–detay, telefonda ayrı detay sunar: `app/(tabs)/live.tsx:126`, `:375`.
- Maç verileri aynı analiz bağlamından okunur; Jinx kullanıcı isteğiyle çağrılır: `src/screens/MatchDetailView.tsx:239`, `:256`. Güncel olmayan değerlendirme gizlenir ve yeniden sorma istenir: `src/components/JinxAssessmentCard.tsx:17`, `:36`. Yeni görsel yön bu sözleşmeyi zayıflatmamalıdır.
- Super detayında karar anı ile güncel/kesinleşen sonuç ayrı bantlardadır: `app/super/[key].tsx:493`, `:516`. Bu ayrım dekoratif tek bir kahraman kartında birleştirilmemelidir.
- Yolculukta ekran okuyucu artır/azalt eylemleri, olay düğmeleri, açık “Seçili anı incele” eylemi ve web'de odak/konum geri dönüşü için kod vardır: `src/components/MatchJourneyChart.tsx:44`, `:208`, `:260`, `:274`. “Grafik yalnız dokunarak kullanılabiliyor” iddiası kaynakla desteklenmez; gerçek erişim yine test bekler.
- Geçmiş kayıt ile güncel baskı açıkça etiketlenir: `src/components/MatchJourneyChart.tsx:218`, `:314`. Toto masaüstü kuponu ile telefon kartları aynı veriyi farklı düzenlerde gösterir: `app/toto/[gcNo]/[version].tsx:307`.

## Bulgular ve kesin çözüm önerileri

### UX-01 — P2 / K: İki metin kontrastı hedefin altında

**Kanıt:** Koyu temada `StateView` tekrar dene metni beyaz, düğme zemini `semantic.intelligence` → `#2E86F0`: `src/components/StateView.tsx:199`, `:202`; `src/theme/theme.ts:54`, `:80`. Metin `typeScale.label` ile 11 birimdir (`src/theme/typography.ts:143`). sRGB bağıl parlaklık hesabı **3.630415:1** verir. Açık temada `Screen` üst etiketi `textSubtle #5C7186`, ekran zemini `#F0EBE4`: `src/components/Screen.tsx:214`, `:305`; `src/theme/theme.ts:91`, `:98`. Oran **4.255502:1** olur. İki çift de normal metin için 4.5:1 hedefinin altındadır. Açık tema tekrar dene düğmesi aynı hesapta 5.734164:1 verir; sorun tüm temalara genellenmez. [W3C kontrast açıklaması](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

**Etki:** Ortak bileşenler nedeniyle Android ve web; hata kurtarma eylemi ve küçük üst etiketler.

**Çözüm:** Dolgu düğmesine ayrı `actionBackground/onAction` token çifti tanımla; koyu temada beyaz metinle en az 4.5:1 sağlayan dolgu kullan. Açık temanın küçük `textSubtle` tonunu gerçek kullanım zeminlerinde en az 4.5:1 verecek biçimde koyulaştır. Renk anlamlarını topluca değiştirme. İki temada gerçek DOM/native renkleri ve diğer gradyanlı yüzeyleri ayrıca doğrula; bu hesap tam tema sertifikası değildir.

### UX-02 — P2 / K: Özetin yardımcı veri hatası tüm içeriği kaldırabiliyor

**Kanıt:** Yükleniyor/hata koşulu hem `dashboardQuery` hem `superKpisQuery` sonucunu tek kapıda birleştirir: `app/(tabs)/index.tsx:62`, `:70`. Yalnız KPI isteği hata verdiğinde eldeki maç/Toto/diğer özet içeriği yerine tüm ekran hata görünümü döner. Gerçek endpoint arızası gözlenmemiştir.

**Etki:** Android ve web; kısmi servis sorununda işe yarayan içeriğe erişim azalır.

**Çözüm:** Ekran gövdesini bağımsız veri bölgelerine ayır. Var olan geçerli veriyi koru; yalnız sorunlu KPI kartında kısa açıklama ve yerel yeniden dene göster. Eski veri varsa zamanını belirt. Başarısız KPI'yi sıfır kâr/sonuç olarak doldurma. Testte yalnız KPI isteğini başarısız yapıp kalan içeriğin korunmasını doğrula.

### UX-03 — P2 / K: Ortak hata başlığı her nedeni bağlantı hatası sayıyor

**Kanıt:** `ErrorState` gelen hatanın türünden bağımsız `OFFLINE` ve “Bağlantı kurulamadı” kullanır: `src/components/StateView.tsx:143`. Ekranlar doğrudan `Error.message` aktarır; örnek `app/(tabs)/index.tsx:75`, `app/(tabs)/toto.tsx:33`.

**Etki:** İki yüzeyde de oturum, yetki, bulunamayan kayıt veya veri biçimi hatası ağ sorunu sanılabilir. Bu hata türlerinin canlıda gerçekleştiği iddia edilmemektedir.

**Çözüm:** Durum bileşenine tipli kullanıcı hata kategorisi ekle: bağlantı, oturum, yetki, bulunamadı, geçici servis ve bilinmeyen. Her biri doğru kurtarma eylemini seçsin; bilinmeyen durum “Veri alınamadı” olsun. Teknik mesajı varsayılan kullanıcı metni yapma; hassas olmayan teşhis kodunu isteğe bağlı ayrıntıya taşı. Sunucu kuralları veya kimlik doğrulama politikası değişmemeli.

### UX-04 — P2 / K: Görsel başlıkların ortak erişilebilir başlık sözleşmesi eksik

**Kanıt:** `Screen` sayfa başlığı ve `ModuleHeading` bölüm başlığı düz `Text` olarak oluşturulur: `src/components/Screen.tsx:215`, `src/components/ModuleHeading.tsx:35`. Bu bileşenlerde açık başlık rolü/seviyesi yoktur. Başka bir üst kapsayıcının sağladığı roller tüm çalışma zamanı için incelenmemiştir.

**Etki:** Web ekran okuyucu başlık listesi ve Android TalkBack başlıklarla gezinme; özellikle uzun analitik sayfalar.

**Çözüm:** Ortak başlık API'sine semantik seviye ekle; sayfa başlığı birincil, modül başlıkları alt seviye olsun. Native'de başlık işaretini, web'de uygun heading seviyesini üret. Tüm kapsayıcıyı tek erişilebilir öğe yaparak alt eylemleri yutma. Erişilebilir ağaçta sıralamayı ve tekrarsız başlıkları incele.

### UX-05 — P2 / K+H: Web arama ve kısayol katmanlarının modal odak sözleşmesi açık değil

**Kanıt:** Katmanlar body portalında düz `div` ile açılır (`src/web/AppShell.web.tsx:64`). Palet paneli `search`, kısayol paneli `summary` rolündedir (`src/web/CommandPalette.tsx:60`, `src/web/ShortcutHelp.tsx:10`). Palet girişine `autoFocus` ve girişte Escape/ok işleme vardır (`CommandPalette.tsx:65`, `:70`); bu dosyalarda açık dialog adı, modal işareti, Tab odağını içeride tutma, arka planı etkisizleştirme ve tetikleyiciye geri dönüş yoktur. Odak kaçışı bu incelemede çalıştırılmadı.

**Etki:** Web klavye ve ekran okuyucu; Android'e aynı DOM çözümü uygulanmaz. Yolculuk RN Modal'ı ayrı bileşendir ve mevcut geri dönüş kodu korunmalıdır.

**Çözüm:** İki web katmanı için ortak erişilebilir dialog kabuğu kullan. Açılışta uygun odağı seç, Tab/Shift+Tab dolaşımını içeride tut, Escape'i panel genelinde işle, arka planı etkileşime kapat, kapanışta tetikleyiciye odak dönsün. Arama, dialog içinde ayrı bir landmark olabilir. Palet seçim semantiği ve görünür odak da doğrulansın. [W3C modal dialog örüntüsü](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

### UX-06 — P2 / K+H: Web tablo ve Toto bağlantı semantiği tamamlanmalı

**Kanıt:** Super tablosunda tablo/satır/sütun başlığı rolleri var; veri hücreleri düz `View`, tıklanabilir satırın rolü yalnız `row`: `src/web/SuperLogTable.tsx:57`, `:97`, `:105`. Toto ızgarası da satır ve düz hücreler kullanır: `src/web/TotoCouponGrid.tsx:25`, `:48`, `:65`. Android Toto tahmin/fikstür kartları dış bağlantı açar fakat açık rol/ipucu yoktur (`app/toto/[gcNo]/[version].tsx:316`, `:361`); aynı sayfanın alt bağlantısında rol vardır (`:398`). Yardımcı teknolojide fiili okunma/aktivasyon henüz test edilmedi.

**Etki:** Web'de sütun–değer ilişkisi ve klavyeyle detay açma; Android'de Toto kartının bağlantı olduğunun keşfi.

**Çözüm:** Web'de doğru tablo başlık/hücre ilişkisini kur; satır içinde adı açık ayrı bir detay/bağlantı eylemi sun. Sıralama eylemi erişilebilir düğme, `aria-sort` sütun başlığında kalsın. Toto kartına bağlantı rolü, hedef ipucu ve eksik `eventId` için erişilebilir devre dışı durumu ekle. Ana tahmin/kapsama/gerçek sonuç metinleri korunmalı; kupon ya da model davranışı değişmemeli.

### UX-07 — P2 / K: Azaltılmış hareket ortak politikası iki noktada uygulanmıyor

**Kanıt:** `JourneyInspector` Modal geçişi koşulsuz `fade` (`src/components/JourneyInspector.tsx:18`); azaltılmış hareket yalnız panel geri yerleşim yayını etkiler (`:64`). Super filtre/sıra değişimi `scrollToOffset({ animated: true })` çağırır (`app/(tabs)/super.tsx:130`). Ortak tercih okuyucusu vardır (`src/theme/use-reduced-motion.ts:17`). Belirli cihazın fade'i bastırıp bastırmadığı doğrulanmadı.

**Etki:** Android ve dar web Super listesi; iki yüzeyde olay denetleyicisi. Fade'in her kullanıcı için arıza olduğu söylenmemektedir; ürünün “azaltılmış harekette dekoratif geçiş yok” kabul hedefiyle kaynak uyumsuzdur.

**Çözüm:** Modal açılma/kapanma animasyonunu ve programatik kaydırmayı ortak tercihe bağla; tercih açıkken geçişsiz sonuç kullan. Kullanıcının doğrudan sürüklediği nesne yine parmağı takip edebilir; bırakma sonrası dekoratif yay/döngü çalışmamalı. Tercih uygulama açıkken değiştirildiğinde de kontrol et.

### UX-08 — P2 / H: Büyük yazı ve yakınlaştırmada kırpılma riski

**Kanıt:** Alt çubuk yüksekliği `58 + bottomPadding` ile sabit (`src/navigation/BottomTabBar.tsx:42`). Maç seçimleri iki satırla, Toto takım adı bir satırla sınırlandırılmıştır (`src/screens/MatchDetailView.tsx:695`, `app/toto/[gcNo]/[version].tsx:329`). Ekran görüntülerinde küçük destek metni ve yoğun üst kartlar görülür; bunlar tek başına erişilebilirlik başarısızlığı kanıtı değildir.

**Etki:** Android büyük yazı/ekran boyutu, web %200 yakınlaştırma ve dar pencereler.

**Çözüm:** Önce aşağıdaki matrisle ölç. Taşma varsa alt çubuğu büyüyebilir yap, kritik seçim/takım/olay metninin tam halini erişilebilir ve keşfedilebilir sun, kart ölçülerini içerikle büyüt. Büyük yazıda düzeni tek sütuna geçir. Yalnız estetik yoğunluğu azaltmak için tüm tipografiyi topluca değiştirme. [W3C metin büyütme açıklaması](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)

### UX-09 — P2 / H: Liste sanallaştırması gerçek veri hacmiyle sınanmalı

**Kanıt:** Canlı `FlatList` birimi lig/grup; aynı grubun maçları `.map` ile birlikte üretilir (`app/(tabs)/live.tsx:285`, `:327`). Web Super tablosu tüm satırları `ScrollView` içinde `.map` eder (`src/web/SuperLogTable.tsx:88`). Gerçek uzun liste ölçümü yoktur; yavaşlık doğrulanmamıştır.

**Etki:** Android'de büyük tek lig grubu; web'de uzun Super geçmişi, animasyon açıkken kaydırma/yenileme.

**Çözüm:** Gerçek pilot hacmini ve sentetik stres hacmini aynı cihazda ölç. Sorun gözlenirse Canlı için maç bazlı `SectionList`/düz sanal satırlar, web Super için erişilebilir sanallaştırma veya açık sayfalama seç. Sıralama, filtre, seçili kayıt ve geri dönüş konumu korunmalı. Yalnız kaynak deseni nedeniyle yeniden yazım zorunlu sayılmamalı.

### UX-10 — P2 / H ve P3 / T: Jinx'in yerleşimi ekran bağlamını da tanımalı

**Kanıt:** Mevcut Jinx 68 birim, üç raster ifade ve dönüşüm animasyonları kullanır (`src/mascot/BtbMascotOverlay.tsx:68`, `:72`, `:1227`). Yoğunluk politikası yalnız `/match/` ve `/super/` rota öneklerini tanır (`src/mascot/bibi-presence.ts:47`). Geniş web'de maç detayı `/live` içinde gömülüdür (`app/(tabs)/live.tsx:378`); bu rota `FULL` kalır. Gerçek bilgi örtüşmesi veya dikkat kaybı bu incelemede ölçülmedi.

**Etki:** Özellikle masaüstü Canlı liste–detay görünümü. Karakterin sanat yönü ve “ne kadar hareketli” olduğu sahibin tercihi; seçili oranı/eylemi örtmemesi görev gereğidir.

**Çözüm:** Jinx yoğunluk/yerleşim kararını yalnız URL'den değil etkin ekran düzeninden de alabilsin. Gömülü analitik panel açıkken ayrılmış yardımcı alan veya kısa olay tepkisi kullan; içerik üstünde sürüklenebilir zorunlu nesne yaratma. Mevcut Jinx geliştirmesi ve yeni futbol karakterini aynı görevlerde eşit prototip olarak karşılaştır. Seçim yapılmadan uygulama genelinde sanat yönü değişikliği uygulama.

### UX-11 — P3 / K+H: Global aramanın kapsamı sonuç yokken öğreniliyor

**Kanıt:** Komut paleti yalnız mevcut sorgu önbelleğini okur (`src/web/CommandPalette.tsx:40`); bu sınır boş sonuç mesajında açıklanır (`:94`). İlk oturumda yüklenmemiş Toto/Super kayıtları aramada görünmeyebilir. Kullanıcının bunu tüm kayıtlar arasında arama sandığı test edilmedi.

**Etki:** Web; Android'in Canlı takım/lig aramasıyla aynı kapsam beklenmemeli.

**Çözüm:** Palet başlığında veya yardımcı metninde baştan “Yüklenen verilerde ara” kapsamı göster. İçeriği yüklemek için sayfa bağlantıları sun. Salt görsel iyileştirme için sınırsız yeni ağ isteği veya yeni BFF arama sözleşmesi ekleme. Sahip testi bu sınırı anlaşılır buluyorsa mevcut davranış korunabilir.

## Kullanıcı hipotezi ile zevk tercihini ayırma

Önceki sahip bulgusu, uzun maç yolculuğu ve Jinx yorumunun yararsız bulunmasıdır; `docs/UX_JINX_V3_LOCAL_2026_10_17.md` bunu ve sonraki yerel düzeltmeyi kaydeder. Sonraki kaynakta kompakt başlık, olay denetleyicisi, kısa yorum ve ikincil kaynak açıklaması vardır. Önceki şikâyet güncel sürümün hâlâ başarısız olduğunun kanıtı değildir. Güncel görev ölçümü gerekir.

“Tüm tasarımın değişmesi daha iyi olur”, “daha canlı karakter daha keyifli olur”, “yeni karakter mevcut Jinx'ten daha iyi olur” tasarım hipotezleridir. Koyu/açık tema, kart estetiği, renk sıcaklığı ve karakter türü tek başına P1/P2 değildir. Kararı görev başarısı, okunabilirlik ve sahip tercihi birlikte vermeli.

## Tekrarlanabilir sekiz başlangıç senaryosu

Her çalıştırmada istemci SHA'sı, BFF sürümü, gerçek/sentetik veri modu, cihaz/tarayıcı, pencere ölçüsü, tema, yazı/zoom, ağ durumu ve veri zamanı kaydedilsin. Başlangıç süreleri **henüz ölçülmedi**. Gerçek veri değişkenliği için ekran/video kaydıyla birlikte hassas olmayan fixture kimliği tutulmalı; gerçek maç sonucu veya model davranışı test için değiştirilmemeli.

| Kimlik | Önkoşul ve adımlar | Doğru bitiş / kaydedilecek ölçüm | Android + web durumu |
|---|---|---|---|
| S1 Özet ve kısmi hata | Temiz oturum; Özet'i aç; canlı maç sayısından Canlı'ya git; geri dön. Ayrı sentetik koşuda yalnız Super KPI isteğini başarısız yap. | Doğru listeye erişim; geçerli maç/Toto içeriği hata yüzünden kaybolmuyor; hata yalnız ilgili bölgede. Süre, yardım, yanlış ekran sayısı. | BEKLİYOR |
| S2 Bul–sabitle–geri dön | En az iki lig ve uzun isimli maç içeren sabit veri. “Inter” ile ara; bir maçı sabitle; yıldız kapsamını değiştir; ayrıntıyı aç/kapat; aramayı temizle. | İstenen maç ve filtre doğru; pin tek kez değişir; pin dokunuşu ayrıntıyı yanlışlıkla açmaz; liste/filtre geri dönüşü korunur. Web'de liste–detay seçimi, Android'de sayfa geri dönüşü ayrı kaydedilir. | BEKLİYOR |
| S3 Skor/seçim/oran okuma | Seçim oranı 1.42, güncel oran 1.38 olan etiketli sentetik maç; ardından seçim olmayan ve piyasa verisi olmayan fixture. | Sahip gösterilen seçimi, kayıtlı/güncel oranı ve veri yokluğunu doğru ifade eder. Eksik veri sıfır/başarılı seçim gibi okunmaz. Doğru yanıtlar ve kaydırma sayısı. | BEKLİYOR |
| S4 Yolculuk ve aynı dakika olayları | Gol, kırmızı kart, Super ve aynı dakikada en az iki olay içeren fixture. Grafikte kaydır, olayı aç, önceki/sonraki, son kayıt ve kapat eylemlerini kullan. | Her olay ayrı erişilir; dikey hareket sayfayı kaydırır; kapatınca konum/odak korunur; tarihsel an ile güncel baskı doğru ayırt edilir. Android geri tuşu, web Escape/oklar ayrıca denenir. | BEKLİYOR |
| S5 Jinx güncelliği ve kesinti | Canlı seçimi olan fixture. Açılışta isteği izle; açıkça sor; yanıtı al. Sonra aynı fixture revizyonunu/skorunu değiştir veya `expiresAt` sonrasına geç; hata/çevrimdışı koşusunu tekrarla. | Açılış/polling değerlendirme üretmez; bir soruya tek bekleme; önceki yorum güncel sayılmaz; `WAIT` başarı/onay animasyonu almaz; yeniden sor/yenile anlaşılır. Süre ve yanlış anlamlandırma. | BEKLİYOR |
| S6 Super geçmişi | En az iki gün, açık/kazanmış/kaybetmiş/void kayıtlar. Gün kapsamını, yıldız filtresini ve açık karar anahtarını birlikte kullan; sırala; bir kararı aç; güncel maça geç. | Sayı/kapsam etiketleri tutarlı; seçimin kaydı, karar anı ve sonuç ayrı anlaşılır; web tablo ve Android kart aynı kayda ulaşır; geri dönüş korunur. | BEKLİYOR |
| S7 Toto anlam ve hedef | Tek/çift/üçlü kapsama, ana isabet, yalnız kuponda sonuç, kapsam dışı ve bekleyen sonuç içeren program. Maliyet/kolonları oku; belirli karşılaşmayı dış bağlantıda açmayı dene. | Ana tahmin, kapsama ve gerçek sonuç karıştırılmaz; maliyetin birimi anlaşılır; eksik `eventId` sahte etkileşim sunmaz. Web ızgarası ve Android kartların görev eşdeğerliği kaydedilir. | BEKLİYOR |
| S8 Tercihler ve erişilebilir kurtarma | Daha Fazla'da tema değiştir; bir modülün sırasını değiştir ve sıfırla; Jinx ipuçlarını sessize al. Aynı temel akışı TalkBack / web yalnız klavye ile tekrarla; son isteği çevrimdışıyken yenile, sonra bağlantıyı geri getir. | Tercihler beklenen kapsamda saklanır; “sessiz ipucu” animasyon kapatma sanılmaz; görünür odak ve doğru duyurular var; hata sonrası çıkış/yeniden deneme mümkün; bilgi kaybı yok. | BEKLİYOR |

## Kabul matrisi

“Bekliyor” satırları kaynak okumasıyla kapatılamaz. Android için cihaz modeli/OS/yazı ölçeği; web için tarayıcı sürümü/viewport/zoom; her ikisinde SHA ve kanıt yolu gereklidir. Ekran görüntüsü etkileşimli görevin, sentetik tarayıcı da fiziksel Android'in yerine geçmez.

| Koşul | Android kabulü | Web kabulü | Şimdiki kanıt |
|---|---|---|---|
| Koyu + açık tema | S1–S8 kritik metinler okunur; durumlar yalnız renkle anlatılmaz; normal metin en az 4.5:1 | Aynı; odak/sıralama/aktif satır iki temada seçilir | UX-01 için kaynak hesabı var; tam görsel/cihaz kontrolü BEKLİYOR |
| %200 zoom / büyük yazı | Varsayılan ve mevcut en büyük sistem yazı/ekran ayarı kaydedilir; kritik seçim, gezinme ve kapat eylemi kesilmez | %200 tarayıcı zoom; 1280/1440 başlangıç penceresi ve kompakt 390 CSS px görünüm; kritik görevlerde bilgi/işlev kaybı yok | BEKLİYOR |
| TalkBack / web ekran okuyucu | Sekme, başlık, grafik ayarlama, olay, Jinx, Toto hedefi anlamlı sırayla okunur; tüm görevler jestin görsel keşfine bağlı kalmadan yapılır | Başlıklar, dialog adı, tablo hücre–başlık ilişkisi ve güncelleme duyuruları denetlenir | Yalnız mevcut kaynak korumaları ve boşluklar belirlendi; BEKLİYOR |
| Klavye / geri davranışı | Sistem geri tuşu önce denetleyiciyi kapatır; yanlışlıkla uygulamadan çıkmaz. Donanım klavyesi varsa ayrıca kayıt | Tab/Shift+Tab, Enter/Space, Escape, oklar; görünür odak; modal dışına kaçış yok; kapanışta odak geri gelir | BEKLİYOR |
| Azaltılmış hareket | Tercih açılışta ve açık oturumda değiştirildiğinde dekoratif Jinx döngüleri, modal fade ve otomatik kaydırma kapanır; sonuç bilgisi kalır | Sistem/tarayıcı tercihiyle aynı; arka sekmede döngü/olay kuyruğu birikmez | Kaynakta UX-07 boşlukları; fiili kontrol BEKLİYOR |
| Çevrimdışı / yavaş / kısmi servis | Önbellek varsa zamanı açık; yoksa doğru hata/kurtarma; yardımcı kaynak hatası temel maçı kapatmaz; dönüşte yanlış Jinx güncelliği oluşmaz | Aynı; global yenileme filtreyi ve manuel Jinx sözleşmesini korur | BEKLİYOR |
| Uzun listeler / uzun metin | Gerçek üst hacim + sentetik 500 maç/1000 Super kayıt; arama, pin, kaydırma, geri dönüş; kilitlenme/boş kritik satır yok | Aynı veriyle tablo/kompakt düzen; klavye odağı kaybolmaz; son satıra erişilir | Hacimler pilot stres senaryosudur, gerçek yük iddiası değildir; BEKLİYOR |
| Kimlik doğrulanmış ve gerçek veri | Gerçek APK kurulumu, veri/rota ve sahip smoke kaydı | Gerçek oturum, `app.surklase.com` rota/veri ve sahip smoke kaydı | Koordinatör: bağlı ADB cihazı yok; web Access girişinde, açık oturum yok. BEKLİYOR |

## Jinx adaylarının UX kabulü

İki aday aynı boyutta, aynı içerik ve aynı olay senaryolarıyla gösterilmeli: **A**, mevcut Jinx'i sadeleştiren futbol küresi; **B**, turkuaz formalı kompakt saha kenarı tilkisi. Koordinatörün oluşturduğu bu adayların üç karelik göz kırpma atlasları başlangıç görselidir; bu incelemede sanat dosyaları ayrıca değerlendirilmedi. Sadece güzel duran tek kare, animasyon veya kullanılabilirlik kanıtı değildir. Bekleme, düşünme, rehber, tarafsız maç olayı, hata/çevrimdışı ve dinlenme durumları için gerçek prototip gerekir.

Ölçülebilir hedefler:

1. Maç/skor/seçim, geri/kapat/yenile ve gezinme hedeflerini hiçbir poz/balon örtmez; karakter kapalıyken de S1–S8 tamamlanır.
2. Aynı olay kimliği bir oturumda tekrar oynatılmaz; yenileme veya ekran dönüşü sahte gol/sevinç üretmez. Yanlış maç ya da güncel olmayan değerlendirmeye tepki sıfırdır.
3. Rehber ve kullanıcının açık etkileşimi dinlenme hareketini keser; bekleme/hata/değerlendirme durumları birbirine karışmaz. `WAIT`, bilinmeyen veya kaynak sorunu olumlu bahis onayı gibi gösterilmez.
4. Azaltılmış harekette statik ifade ve metin aynı anlamı taşır; arka planda animasyon durur. “İpuçları sessiz”, “karakter hareketi” ve “ses” ayrı tercihler olarak anlaşılmalıdır; mevcut uygulamada ses varmış gibi varsayım yapılmaz.
5. Futbol şakası/poz bağlama dayanır; geçmiş Super sonucu mizahı yeni seçimin değer kanıtı gibi okunmaz. Kayıp sonrası kullanıcıyı suçlama ya da yeni işlem yapmaya yönelten davranış eklenmez.
6. Sahip her adayda okunabilirlik, keyif, dikkat dağıtma ve karakter beğenisini ayrı 1–5 puanlar; önceki/güncel sürüm görev süresi ve hata sayısı yanında tutulur. Tercih sırası bir tur A→B, diğer tur B→A ile dengelenir. Tek sahipli pilotun sonucu genel kullanıcı kitlesi için istatistiksel üstünlük iddiası değildir.

## Sonraki somut karar

Önce S1–S8 başlangıç ölçümleri ve iki eşit Jinx/tasarım prototipi sunulsun; sahip somut adayı seçsin. Kaynakla doğrulanmış küçük erişilebilirlik/dayanıklılık düzeltmeleri ayrı kapsamlandırılabilir; bu rapor uygulama genelinde tasarım dönüşümü veya yayın onayı değildir. Android ve web aynı istemci sözleşmesiyle birlikte ilerlemeli; platforma özel düzenlerde görev eşdeğerliği kaydedilmeli. Build, commit/push, imzalama/özel APK teslimi ve eşleşen web yayını mevcut ayrı onay ve koordineli sürüm kapılarında kalır.

Kısa sonuç: İyileştirme fırsatı var; iki hesaplanmış kontrast açığı ve belirli ortak bileşen boşlukları somut. Tam cihaz ve gerçek veri denetimi tamamlanmadan tüm uygulama için başarılı/başarısız hükmü verilemez.

## Uygulama eki — doğrulanmış ortak düzeltmeler

2026-10-18: Sahip geliştirilmiş A/Jinx futbol küresini seçti; genel ekran yönü seçimi beklerken görsel dönüşümden bağımsız ortak düzeltmeler uygulandı. Aşağıdakiler kaynak uygulama durumudur; yayın veya fiziksel cihaz kabulü değildir.

| Bulgu | Uygulanan yerel değişiklik | Kontrol / kalan kanıt |
|---|---|---|
| UX-01 | Ayrı `semantic.actionFill/onAction` çifti; koyu tekrar dene kontrastı 5.085897:1, açıkta 5.734164:1. Açık küçük `textSubtle` `#53687C`; sıcak zeminde 4.866393:1. Analitik/olumlu/olumsuz renk anlamları korunur. | Gerçek token çiftlerine karşı 4.5:1 testleri geçti. Tüm gradyanlar ve cihaz ekranı için genel geçer kontrast iddiası yok. |
| UX-02 | Özet ve günlük KPI ayrı yüklenir/hata verir. Birinde geçerli veri diğer kaynak hatasında korunur; yenileme hatasında eski veri açıkça işaretlenir. KPI'da mevcut `metricDate`, rating ve sonuçlanan karar satırı sayısı görünür; birim/ROI üretilmez. | Kaynak ve TypeScript kontrolü geçti. Yalnız bir sorguyu başarısız yapan gerçek/sentetik çalışma zamanı senaryosu ve ekran okuyucu kontrolü bekler. |
| UX-03 | Yapılandırılmış oturum/yetki/kayıt/servis/ağ nedenleri için güvenli metin ve yararlı tekrar seçimi. Bilinmeyen hata varsayılan olarak çevrimdışı sayılmaz. Serbest servis mesajı kullanıcı metni yapılmaz. | Yanlış ağ çıkarımı, durum kodları, timeout/oturum ayrımı ve tanısal metni gizleme testleri geçti. Mevcut kimlik doğrulama/kurtarma politikası değiştirilmedi. |
| UX-04 | `Screen` birinci, `ModuleHeading` ikinci seviye başlık; native başlık rolü ve web heading/level açık. Durum başlığı da ikinci seviyede. | TypeScript geçti; gerçek erişilebilir ağaç/TalkBack kontrolü bekler. |
| UX-05, UX-11 | Web arama/kısayol için ortak modal: ad/modal semantiği, ilk odak, Tab/Shift+Tab sınırları, Escape, arka plan inert ve önceki değerlerinin tam geri yüklenmesi, tetikleyiciye odak dönüşü. Arama kapsamı baştan açıklanır; görünür 48 birim kapat eylemi vardır. | Odak politikası ve önceki inert/aria-hidden değerlerini koruma testleri geçti. Gerçek tarayıcıda Tab çevrimi, Escape ve odak dönüşü ayrıca doğrulanmalı. |
| UX-06 | Super/Toto tablolarında sütun başlığı ve veri hücresi rolleri; satır içindeki açık maç bağlantısı. Super sıralama düğmeleri başlığın içindedir. Android Toto kartında dış bağlantı rolü/ipucu/devre dışı durumu eklendi. | TypeScript geçti. Web tablo erişilebilir ağacı ve fiziksel Android aktivasyonu bekler. Veri/sıra/tahmin/kapsama hesapları değişmedi. |
| UX-07 | Olay denetleyicisinin Modal fade'i ve Super programatik kaydırması azaltılmış hareket tercihine bağlandı. | TypeScript geçti; işletim sistemi tercihi açıkken gerçek davranış ayrıca doğrulanmalı. |

İncelemecinin bu ek öncesi çalıştırdığı kontroller: `tsc --noEmit`, değişen kaynaklara hedefli ESLint ve kontrast/hata/odak politikası ile mevcut durum/kısayol testlerinin toplam **27/27** geçmesi. Tam Mobile kalite kapısı koordinatöre bırakıldı. Derleme, SAP/BFF değişikliği, imzalama, Git işlemi veya dağıtım yapılmadı.

**Açık kalanlar:** UX-08 büyük yazı/%200 zoom taşma düzeltmeleri ancak gözlemle; UX-09 gerçek hacim/uzun liste profili; UX-10 Jinx yerleşim ve karakter davranışı koordinatörün kapsamındadır. Bu incelemeci genel gezinme veya ekran tasarımını yeniden yazmadı. Fiziksel Android, TalkBack ve doğrulanmış web oturumu hâlâ kanıt bekler; başlangıç raporundaki tarihli kaynak bulguları bu ekle tarihçesi korunarak güncellenir.
