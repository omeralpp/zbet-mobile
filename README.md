# zbet-mobile

Cordova Android shell for the BTB Launchpad / Work Zone experience.

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
- Android exposes a `BTB Son Super` home-screen widget. It stores the latest received BTB notification locally and opens BTB Main, Super Log, Spor Toto, or the last notification route when tapped.
- Notification taps route inside Launchpad when possible:
  - `SUPER` / `SCLEAR` style messages open `#SuperLog-display`.
  - Other BTB messages open `#btb-manage`.

The widget can be added from the Android launcher’s widget picker after installing
the APK. The native widget receiver observes compatible FCM data messages before
the Cordova UI starts and never consumes them, so the existing system notification
and JavaScript delivery flow continue unchanged. The JavaScript callback is kept as
a second update path for queued/tapped notifications.
  - Future FCM payloads can override this with `data.route`, `data.target`, or `data.screen`.
- Bilyoner match-card links are handed to Android so the installed Bilyoner app opens separately; web loading remains the fallback.
