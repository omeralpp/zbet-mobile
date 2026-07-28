# zbet-mobile

Cordova Android shell for the BTB Launchpad / Work Zone experience.

Yeni React Native + Expo + TypeScript geçiş uygulaması Cordova kaynaklarıyla
yan yana [expo-app](expo-app/README.md) altında geliştirilmektedir. Cutover
tamamlanana kadar bu iki uygulama ayrı package kimliğiyle birlikte korunur.
Yeni paket; FCM veri doğrulamasını, arka plan bildirim görevini, iki Android
widget'ını, native deep link yönlendirmesini ve uygulama içi Fiori WebView
yüzeyini Expo/React Native yapısında karşılar. Eski widget yerleşimleri farklı
package kimliğine otomatik taşınmadığı için `BTB Next` widget'ları yeni APK
kurulduktan sonra launcher üzerinden bir kez eklenmelidir.

## Purpose

- Open the BTB web experience inside an Android in-app browser shell.
- Receive Firebase Cloud Messaging notifications for the `BTB` topic.
- Keep mobile notification behavior separate from the ABAP model and CAP proxy logic.
- Provide a controlled offline/retry screen before the Launchpad shell opens.

## Main Files

- `config.xml`: Cordova app id, allowed navigation target, Android resource mapping, and app icons.
- `www/`: mobile shell web assets.
- `google-services.json`: local Android Firebase configuration file.
- `package.json`: Cordova platform and plugin declarations.

## Firebase Plugin Shape

Firebase support is split across:

- `cordova-plugin-firebasex-core`
- `cordova-plugin-firebasex-messaging`
- Local `cordova-plugin-btb-widget` under `plugins-src/`

Keep this split when reinstalling plugins or rebuilding platforms; the older monolithic plugin shape should not be reintroduced.

Generated Cordova folders such as `platforms/`, `plugins/`, and `node_modules/` should not be used as source-of-truth documentation.

## Runtime Behavior

- The app uses one official BTB Launchpad URL.
- Cold starts show a native BTB-branded splash before Launchpad; the local loading screen remains available for retries and notification-driven relaunches.
- Load failures retry with backoff: 2 seconds, 5 seconds, 15 seconds, then 30 seconds.
- The loading screen exposes a manual retry button for offline or repeated load failures.
- Returning from the background verifies the existing Launchpad browser and reuses it only while it is responsive. Stale, blank, or long-suspended browser windows are replaced with the last requested route after a short Android-safe close delay.
- Android exposes a `BTB Son Super` home-screen widget. It stores the latest received BTB notification locally, renders the Super rating as gold stars, and keeps BTB Main as the center action.
- Android also exposes a separate `BTB Performans` widget with two native donut KPIs. Toto prefers the latest program waiting for results and falls back to the latest resulted program; tapping its donut opens that exact program Object Page. Super shows only the current local day's won/lost split and net profit for the current `NOTIFY/SUPER` minimum rating and above; omitted zero values reset cleanly and the widget performs a lightweight 30-minute date-safety refresh.
- When a match notification contains `match_id`, `match_date`, and `match_time`, tapping the notification area opens that match’s BTB Object Page. Incomplete or older payloads fall back to the related BTB/Super route.
- Android notifications use separate high-importance channels: rating-bearing Super coupons use `btb_super_goal_v1` with the short stadium cheer, while Toto, odds, clear, daily, and other notifications use `btb_general_whistle_v1` with the referee whistle. Both channels share the monochrome status icon and colored BTB large icon.
- The floating football shortcut opens a compact BTB, Super Log, Toto, Bilyoner, and notification-settings menu. Bilyoner launches its Android package directly and falls back to the web home page when unavailable. Launchpad selections keep the current session and show a short BTB transition overlay while the requested app loads.
- The football shortcut is a code-drawn, full-circle BTB face with thin blue legs and no arms. It blinks while idle and randomly switches for 1.8 seconds between happy, bored, and angry expressions at non-repeating 5–10 second intervals; opening the menu triggers a short happy reaction. On the first load of each Cordova browser session it says `Hi!` in a short-lived speech bubble that follows the mascot’s left/right placement and does not repeat during Launchpad navigation. Tap and press-and-hold drag behavior, persisted placement, viewport clamping, and reduced-motion support remain intact. A compact `Yenile` action reloads the current Launchpad page, and notification settings remain available as the bell inside this menu, where all notification sound or either channel can be muted independently.
- The Cordova Launchpad always uses SAPUI5 cozy density for reliable touch targets. Work Zone renders in-place applications in separate frames, so the wrapper applies and observes density in both the shell and every accessible application document, reapplies `sapUiSizeCozy` after frame/page/hash/history transitions, and runs a low-frequency visible-page safety check without changing the user’s desktop Work Zone preference or custom theme.
- In the Cordova wrapper only, the complete standard Fiori Elements Share button is suppressed across accessible BTB, Super Log, and Toto application frames. Desktop Work Zone manifests remain unchanged.
- The Cordova wrapper uses the official Fiori renderer API for a mobile shell focus mode: the navy header stays hidden during route, page, and visibility transitions and is shown only while the mascot quick menu is open. Tapping the mascot or outside it closes both the quick menu and the header, so no separate top-edge reveal control competes with Work Zone content.
- Notification taps route inside Launchpad when possible:
  - `SUPER` / `SCLEAR` style messages open `#SuperLog-display`.
  - Other BTB messages open `#btb-manage`.

The widget can be added from the Android launcher’s widget picker after installing
the APK. The native widget receiver observes compatible FCM data messages before
the Cordova UI starts and never consumes them, so the existing system notification
and JavaScript delivery flow continue unchanged. The JavaScript callback is kept as
a second update path for queued/tapped notifications.
  - Future FCM payloads can override this with `data.route`, `data.target`, or `data.screen`.
- The performance widget refreshes from the KPI snapshot carried by compatible FCM messages, so it remains available without an active Launchpad session.
- Bilyoner match-card links are handed to Android so the installed Bilyoner app opens separately; web loading remains the fallback.
