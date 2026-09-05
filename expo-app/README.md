# BTB Mobile Next

## Pilot runtime status (2026-07-29)

- Public API: `https://api.surklase.com`
- Active authentication: branded pilot entry gate backed by the rotatable
  read-only pilot key; it asks for no username or password and is not user identity
- SAP access: server-side `developer` technical user behind fixed read-only
  BFF routes
- Pilot protection: APK sends a rotatable random key; BFF stores only its
  SHA-256 digest
- Android package: `com.btb.mobile.next`
- Firebase Android client: provisioned; `google-services.json` stays outside Git
- Live data: fixed, read-only Mobile BFF routes over Cloudflare Tunnel
- Pilot APK: produced by `scripts/build-pilot-apk.ps1` with
  `EXPO_PUBLIC_USE_MOCKS=false` and an embedded release JS bundle
- Pilot Android notification compatibility: subscribes to the legacy `BTB`
  topic until the direct user/installation delivery producer is cut over;
  OAuth, preview and iOS profiles do not use this fallback
- Pilot degraded BFF mode keeps encrypted device registration available while
  outbound direct FCM delivery remains explicitly disabled.

The pilot APK is intentionally signed with the current Android debug
certificate. It is installable and standalone, but it is not the final store
release. Cordova remains the rollback path until the physical-device,
least-privilege SAP account, release-signing, support, and rollback gates pass.

On cold start the pilot build displays the same BTB-branded entry surface used
by OAuth builds, but labels the action as pilot access and explicitly states
that no user identity is verified. A real user session still requires the
separate production OIDC provider, BFF OAuth runtime, Android App Link, and
physical-device authentication cutover.

## Production authentication boundary (local, not deployed)

Production builds use an explicit provider-neutral `oauth` profile. The app
opens the configured OIDC provider in the system browser, completes
Authorization Code + PKCE S256, stores the short-lived session in
Android-backed SecureStore, and sends only the user Bearer token to the Mobile
BFF. The BFF validates discovery/JWKS, exact issuer and audience, expiry,
subject and route scopes; it rejects client-credentials tokens. Keycloak is the
first verified provider. IAS is no longer a required production IdP.

The PKCE state and verifier are kept in SecureStore for at most ten minutes so
an Android cold-start callback can finish safely. Each API request checks the
token lifetime, shares one refresh operation across concurrent requests, and
returns to sign-in if refresh or BFF validation fails. Sign-out attempts
refresh-token revocation before clearing the local session. No OIDC client
secret is present in the app, repository, or APK.

This code path is not a production deployment approval. A production HTTPS
OIDC issuer and public client, exact redirect/logout URIs, Android App Link
certificate, and physical-device login/refresh/cold-start/logout tests remain
external gates.

Android-first React Native + Expo + TypeScript istemcisi. Mevcut Cordova
uygulaması geçiş tamamlanana kadar aynı repoda korunur; bu klasör yeni native
deneyimin bağımsız kaynak kodudur.

## İlk sürümün sınırı

- Dashboard, canlı maç, maç detayı, Super geçmişi ve Toto programları native.
- Veri varsayılan olarak deterministik mock kaynaktan gelir.
- Gerçek veri yalnızca pilot anahtarıyla korunan mobil BFF üzerinden okunur;
  mobil uygulama SAP OData servislerine doğrudan bağlanmaz.
- Livescore, yeni fixture ve Toto `RefreshProgram` gibi veri değiştiren işlemler
  ilk sürümde uygulama içindeki HTTPS-kısıtlı Fiori ekranına aktarılır. Bu yüzey
  yalnız yapılandırılmış SAP hostlarında açılır; BTP/Work Zone erişilemezse
  Dashboard, BTB, Super, Toto, bildirim ve widget akışları çalışmaya devam eder.
- BTB/Super ile Toto aynı uygulama kabuğunu kullanır ama kaynak, performans ve
  öğrenme metrikleri birbirine karıştırılmaz.
- Android ana ekranında `BTB Next – Son Super` ve `BTB Next – Performans`
  widget'ları bulunur. Widget'lar FCM veri mesajlarından uygulama açılmadan da
  güncellenir ve dokunulan maç/programı native deep link ile açar.
- Kodla çizilen BTB maskotu native ve Fiori yüzeylerinde aynı konumu korur;
  sürüklenebilir hızlı menü native sekmeleri, Fiori geri/yenile ve harici
  tarayıcı kontrollerini tek noktada sunar.
- Bibi ilk kurulumda ekran bazlı kısa rehberi açar; bir ekrandaki önemli
  noktalara hareket eder, ilerlemeyi cihazda saklar ve `Daha fazla` ekranından
  kapatılabilir, kaldığı yerden açılabilir veya baştan başlatılabilir.
- Canlı oran oku güncel oranı seçim oranıyla karşılaştırır; ev/uçak baskı
  simgeleri yalnızca baskı tarafını anlatır. Lig tablosu SAP’ın yayınladığı
  iki takımın sıra/puanıyla sınırlıdır; tam lig verisi uydurulmaz.
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
Android widget'ları, arka plan bildirim görevi, doğrudan pilot erişimi ve Firebase
doğrulaması için development build gerekir:

```powershell
npm run android
```

## Runtime ayarları

Yalnızca public değerler `EXPO_PUBLIC_*` değişkenlerine yazılır:

- `EXPO_PUBLIC_USE_MOCKS=true`: yerel preview.
- `EXPO_PUBLIC_MOBILE_API_URL`: mobil BFF kök URL'si.
- `EXPO_PUBLIC_MOBILE_AUTH_MODE`: `preview`, `pilot` veya `oauth`. Non-mock
  build varsayılan olarak `oauth` seçer; pilot yalnız açık `pilot` profilidir.
- `EXPO_PUBLIC_MOBILE_PILOT_KEY`: doğrudan-açılış pilot anahtarı. SAP parolası
  değildir; yalnız `pilot` profilinde kabul edilir ve her pilot APK döngüsünde
  değiştirilebilir.
- `EXPO_PUBLIC_AUTH_CLIENT_ID`, `EXPO_PUBLIC_AUTH_ISSUER`, redirect URI ve
  scope listesi: yalnız public OIDC metadata. Authorization/token endpointleri
  varsayılan olarak discovery belgesinden alınır; revocation/end-session dahil
  açık endpoint override'ları opsiyoneldir. Redirect URI tam olarak
  `https://api.surklase.com/auth/callback` olmalı; scope listesi `openid`,
  `offline_access`, `mobile.read` ve `mobile.device.write` içermeli. Public
  secret biçimli bir environment değeri build'i durdurur.
- `EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL`: doğrulanmış Fiori fallback URL'si.
- `EXPO_PUBLIC_SAP_WEB_ALLOWED_HOSTS`: Fiori/Work Zone WebView için virgülle
  ayrılmış kesin veya `*.` wildcard SAP HTTPS host allowlist'i. Varsayılan
  Launchpad, SAP Accounts ve trial IAS yönlendirmelerini kapsar:
  `*.hana.ondemand.com,*.accounts.ondemand.com,*.trial-accounts.ondemand.com`.
- `BTB_GOOGLE_SERVICES_FILE`: build makinesindeki preview Android Firebase
  client dosyasının yolu. Service-account anahtarı değildir ve repoya eklenmez.

`EXPO_PUBLIC_*` değerleri uygulama paketinden okunabilir. Pilot anahtarı bu
nedenle üretim kimliği değildir; yalnız fixed read-only BFF yüzeyi için
dağıtım kapısıdır. SAP parolası, OIDC client secret ve Firebase
service-account anahtarı APK'da tutulmaz.

OAuth profilinde pilot anahtarı bulunursa app config build'i durdurur. Pilot APK
betiği de `EXPO_PUBLIC_MOBILE_AUTH_MODE=pilot` olmadan çalışmaz; böylece pilot
erişimi production profiline sessizce taşınamaz.

## Kontroller

```powershell
npm run check
npm run doctor
```

`npm run doctor` checks an explicit preview profile in a child process; it
does not inherit the owner pilot key or reload local dotenv files. The command
first validates Expo config without printing it, then requires a complete
Doctor success summary as well as exit code zero. A config error cannot be
counted as a pass.

For an actual pilot/OAuth profile, set the intended process environment and run
`npm run doctor:configured`. It preserves that profile and fails if auth mode is
implicit or configuration is invalid. A preview check is not release acceptance.
`npm run check` also runs the Doctor-wrapper regression tests (`test:tooling`).

M11 now targets [personal Mobile use](docs/M11_PERSONAL_USE_PLAN.md), by owner
decision on 2026-09-06. The optional retention rehearsal was removed from the
candidate under that decision. It was never committed, was never in the accepted
owner-phone APK, and is not needed for M11. Its
[historical report](docs/M11_RETENTION_REHEARSAL.md) is kept as evidence of the
prior experiment, not as a current user-growth workstream.

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

For emulator verification, the same gate accepts `-NativeBuild -Architecture
x86_64` and writes `btb-mobile-next-x86_64-debug.apk`; the default remains
ARM64. Bundle/native checks use the caller's build environment, so select an
explicit preview, pilot or OAuth environment before invoking those options.

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
