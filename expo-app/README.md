# BTB Mobile Next

## Pilot runtime status (2026-07-29)

- Public API: `https://api.surklase.com`
- OAuth: SAP Identity Service public client, Authorization Code + PKCE
- Redirect/App Link: `https://api.surklase.com/auth/callback`
- Native return: issuer-validated callback bridge to `btbmobile://auth`
- Android package: `com.btb.mobile.next`
- Firebase Android client: provisioned; `google-services.json` stays outside Git
- Live data: fixed, read-only Mobile BFF routes over Cloudflare Tunnel
- Pilot APK: produced by `scripts/build-pilot-apk.ps1` with
  `EXPO_PUBLIC_USE_MOCKS=false` and an embedded release JS bundle

The pilot APK is intentionally signed with the current Android debug
certificate. It is installable and standalone, but it is not the final store
release. Cordova remains the rollback path until the physical-device,
least-privilege SAP account, release-signing, support, and rollback gates pass.

Android-first React Native + Expo + TypeScript istemcisi. Mevcut Cordova
uygulaması geçiş tamamlanana kadar aynı repoda korunur; bu klasör yeni native
deneyimin bağımsız kaynak kodudur.

## İlk sürümün sınırı

- Dashboard, canlı maç, maç detayı, Super geçmişi ve Toto programları native.
- Veri varsayılan olarak deterministik mock kaynaktan gelir.
- Gerçek veri yalnızca OAuth 2.0 Authorization Code + PKCE korumalı mobil BFF
  üzerinden okunur; mobil uygulama SAP OData servislerine doğrudan bağlanmaz.
- Livescore, yeni fixture ve Toto `RefreshProgram` gibi veri değiştiren işlemler
  ilk sürümde uygulama içindeki HTTPS-kısıtlı Fiori ekranına aktarılır. Bu yüzey
  native başlık, yüklenme ilerlemesi, geri/ileri ve yenileme kontrolleri sunar.
- BTB/Super ile Toto aynı uygulama kabuğunu kullanır ama kaynak, performans ve
  öğrenme metrikleri birbirine karıştırılmaz.
- Android ana ekranında `BTB Next – Son Super` ve `BTB Next – Performans`
  widget'ları bulunur. Widget'lar FCM veri mesajlarından uygulama açılmadan da
  güncellenir ve dokunulan maç/programı native deep link ile açar.
- Kodla çizilen BTB maskotu native ve Fiori yüzeylerinde aynı konumu korur;
  sürüklenebilir hızlı menü native sekmeleri, Fiori geri/yenile ve harici
  tarayıcı kontrollerini tek noktada sunar.
- Fiori WebView native başlık/alt araç çubuğu olmadan sistem güvenli alanı
  içinde tam ekran çalışır ve Work Zone renderer API'siyle Launchpad başlığını
  gizli tutar.

Mimari kararlar [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), BFF sözleşmesi
[contracts/mobile-api.openapi.yaml](contracts/mobile-api.openapi.yaml)
dosyasındadır.

## Çalıştırma

Gereksinimler: Node.js 22+, npm ve Android development build için Android SDK.

```powershell
cd C:\dev\btb-cdoex\zbet-mobile\expo-app
npm install
Copy-Item .env.example .env.local
npm run start:go
```

Temel mock ekranlar Expo Go ile incelenebilir. Uygulama içi Fiori WebView,
Android widget'ları, arka plan bildirim görevi, gerçek OAuth ve Firebase
doğrulaması için development build gerekir:

```powershell
npm run android
```

## Runtime ayarları

Yalnızca public değerler `EXPO_PUBLIC_*` değişkenlerine yazılır:

- `EXPO_PUBLIC_USE_MOCKS=true`: yerel preview.
- `EXPO_PUBLIC_MOBILE_API_URL`: mobil BFF kök URL'si.
- `EXPO_PUBLIC_AUTH_CLIENT_ID`: public/native OAuth client kimliği.
- `EXPO_PUBLIC_AUTH_AUTHORIZATION_ENDPOINT`: authorize endpoint.
- `EXPO_PUBLIC_AUTH_TOKEN_ENDPOINT`: token endpoint.
- `EXPO_PUBLIC_AUTH_REVOCATION_ENDPOINT`: isteğe bağlı revoke endpoint.
- `EXPO_PUBLIC_AUTH_SCOPES`: varsayılan `openid profile email`.
- `EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL`: doğrulanmış Fiori fallback URL'si.
- `BTB_GOOGLE_SERVICES_FILE`: build makinesindeki preview Android Firebase
  client dosyasının yolu. Service-account anahtarı değildir ve repoya eklenmez.

`EXPO_PUBLIC_*` değerleri uygulama paketinden okunabilir. Client secret, SAP
parolası, Firebase service-account anahtarı veya başka bir secret burada
tutulmaz.

## Kontroller

```powershell
npm run check
npm run doctor
```

BTB Codex ortak kalite kapısı:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File C:\dev\btb-cdoex\btb-codex\scripts\invoke-mobile-check.ps1
```

Android JS bundle doğrulaması için `-BundleOnly`, bağımlılıkları temiz kurmak
için `-Install` kullanılabilir. `-NativeBuild`, Windows yol sınırını aşmak için
kısa ömürlü bir build staging klasörü kullanarak arm64 debug APK smoke build'i
üretir ve sonucu `.codex-artifacts` altına kopyalar. Bu kontroller commit, push
veya deploy yapmaz.

Standalone pilot APK betiği varsayılan olarak ARM64 üretir. Android Studio
emülatör doğrulaması için aynı kaynak ve public runtime ayarlarıyla ayrı bir
x86_64 çıktı alınabilir:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\scripts\build-pilot-apk.ps1 `
  -Architecture x86_64 `
  -ArtifactName btb-mobile-next-x86_64-emulator.apk
```

## Cordova'dan kontrollü geçiş

Cordova ve yeni Expo paketi pilot boyunca yan yana kalır. Android, farklı
package kimliğindeki eski widget yerleşimlerini yeni uygulamaya otomatik
taşıyamaz; güncel APK kurulduktan sonra iki `BTB Next` widget'ı launcher
seçicisinden bir kez eklenir. Bildirim, widget yönlendirmesi ve Fiori oturum
paritesi gerçek cihazda doğrulandıktan sonra eski uygulama kaldırılır.
