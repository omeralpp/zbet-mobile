# Jinx adayları — görsel üretim ve hazırlama kaydı

2026-10-18 · Dahili `image_gen` aracı / `imagegen` becerisi kullanıldı; CLI/API
fallback kullanılmadı. Her aday için ayrı, gerçek alfa saydamlığı istenen üretim yapıldı.
Sahip A geliştirilmiş Jinx futbol topunu seçti. A yerel ortak istemciye alındı;
B karşılaştırma laboratuvarında kalır. Bu kayıt yayın veya fiziksel cihaz kabulü değildir.

## Dosyalar ve doğrulama

- A: `assets/mascot/candidates/jinx-a-open.png`, `jinx-a-half.png`, `jinx-a-closed.png`.
- B: `assets/mascot/candidates/jinx-b-open.png`, `jinx-b-half.png`, `jinx-b-closed.png`.
- Altı kare: 320×320 RGBA PNG, toplam **641.512 bayt**; dört köşe alfası her karede 0.
- Üretilen özgün atlaslar workspace kökündeki `.codex-artifacts/ux-review-2026-10-18/generated/`
  altında `jinx-a-atlas.png` ve `jinx-b-atlas.png` olarak korundu.
- Aynı karakterin kareleri ortak sınırla çıkarıldı, kenar boşluğu korunarak premultiplied-alpha
  bilinear örnekleme ile küçültüldü. Yüz/renk/ifade çizimi sonradan değiştirilmedi.
  Hazırlama betiği ve dosya SHA-256/boyut kaydı aynı evidence klasöründe
  `prepare-assets.cjs` ve `asset-validation.json` içindedir.

## Kullanılan son prompt A

```text
Use case: identity-preserve. Asset type: production mascot expression atlas for the BTB Android and web app, comparison candidate A. Edit target: the supplied existing Jinx football-orb mascot. Preserve its recognisable football face, navy/cream football panels, teal eyes and modest bronze seams, friendly mischievous character. Refine the small-size readability: simplify tiny shiny details, remove the long trailing energy plume and tiny pitch drawing on the forehead, give the expression more charm, soft clean 3D toy finish. Composition: ONE transparent horizontal expression atlas, exactly three equal square cells left to right: eyes open and smiling; eyes half shut mid-blink with same smile; eyes completely closed blink with same smile. Same character, exact same pose, body size, center, camera, lighting and silhouette in every cell; only eyelids change. Each body fills ~78 percent of its cell with generous transparent margins; no overlap between cells and no cropping. Background: true alpha transparency across canvas. No text, no letters, no logo, no labels, no sheet grid, no floor shadow, no props, no gold crown, no money, no original fictional franchise references. Intended sheet aspect ratio 3:1. Deliver one finished atlas.
```

Referans: mevcut `assets/mascot/jinx-open.png`; üretimden önce görsel olarak incelendi.

## Kullanılan son prompt B

```text
Use case: stylized-concept. Asset type: production mascot expression atlas for BTB Android and web app, comparison candidate B, a new original Jinx direction. Subject: an original lively little touchline fox football companion, compact oversized head with two distinctive short triangular ears, cream muzzle and navy-blue soft fur, warm amber cheek/inner-ear accents, large expressive teal eyes, small teal football jersey and tiny navy football boots, short curled fluffy tail. Clever mischievous smile, kind and sporty, confident without arrogance, family-friendly premium collectible 3D toy render. Different silhouette from a football orb; immediately readable at 68dp. Three-quarter-front view looking at user, arms relaxed at sides, compact body and feet entirely visible, no football held because a separate ball will be animated in runtime. ONE transparent horizontal expression atlas with exactly three equal square cells from left to right: eyes open; eyes half shut mid-blink; eyes completely closed blink. SAME exact pose, scale, center, silhouette, smile, lighting, camera, ears, jersey and tail in all three cells; only eyelids change. Each character fills ~76 percent of its cell, generous alpha margins, all edges within its own cell. True transparent alpha background. No text, branding, numbers, logo, watermark, grid, floor shadow, crown, money, trophy, franchise or existing character references. Atlas aspect ratio 3:1. Deliver one finished atlas.
```

B üretiminde görsel referans kullanılmadı. İki aday aynı render alanı ve hareket
zamanlamasıyla gösterilir; büyük/süslü olanın daha doğru değerlendirme verdiği ima edilmez.
