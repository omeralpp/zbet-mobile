# Closed observation rows — client simplification (TASK-0144), 2026-10-16

Moved verbatim from `OBSERVATION_LOG.md` when the rows closed. Closure: the first
coordinated Android+web batch `client-3e9ffe9241bac12262f559f2267496f50db94da3-8757EFEA9837-06AF4EA3CA00`
was delivered (private Drive APK `8757EFEA…544D38A`, installed by the owner) and
published (web release `20261016T195008Z-3e9ffe9`), and the owner's real-data
smoke passed on both surfaces on 2026-10-16. Receipts:
`btb-codex/docs/evidence/client-release-3e9ffe9-2026-10-16.json`.

| ID | Tarih | Alan | Tespit / beklenen kanıt | Öncelik | Durum |
| --- | --- | --- | --- | --- | --- |
| NXT-OBS-160 | 2026-10-16 | Maçın Nabzı (Bilyoner Game Pulse) | Sahip isteği: Maçın Nabzı modülü Android ve web'den kaldırılsın. Yerelde uygulandı: `gamePulse` modülü, `GamePulseCard` (native/web), boyutlama ve Game Pulse URL yardımcıları silindi; kayıtlı düzenlerden uzlaştırmayla düşer. `react-native-webview` artık kullanılmıyor ve paket kaldırıldı. Koordineli Android+web yayını bekliyor. | MEDIUM | CLOSED 2026-10-16 |
| NXT-OBS-161 | 2026-10-16 | Fiori butonları | Sahip isteği: Fiori'ye giden tüm butonlar mobilden kalksın (Android dahil). Yerelde uygulandı: `/fiori` ekranı, `src/legacy`, maç/Super/Toto detayı, Daha Fazla ve maskot menüsündeki girişler, Android geri tuşu devri ve `legacyLaunchpadUrl`/`sapWebAllowedHosts` ayarları kaldırıldı. Koordineli Android+web yayını bekliyor. | MEDIUM | CLOSED 2026-10-16 |
| NXT-OBS-162 | 2026-10-16 | Skor ve yıldız akışı → Maçın Yolu | Sahip isteği: ayrı "Skor ve yıldız akışı" modülü kalksın, Maçın Yolu'na taşınsın. Yerelde uygulandı: kaydedilen Super kararları grafikteki olay şeridinde altın yıldızla işaretlenir ve seçilince karar açılabilir; dokunulabilir kronolojik liste grafiğin altında "SKOR VE YILDIZ AKIŞI" olarak durur; grafik bayrağı kapalıyken de liste görünür. `timeline` modülü kayıtlı düzenlerden düşer. Koordineli Android+web yayını ve cihaz smoke'u bekliyor. | MEDIUM | CLOSED 2026-10-16 |
