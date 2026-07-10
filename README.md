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

Keep this split when reinstalling plugins or rebuilding platforms; the older monolithic plugin shape should not be reintroduced.

Generated Cordova folders such as `platforms/`, `plugins/`, and `node_modules/` should not be used as source-of-truth documentation.

## Runtime Behavior

- The app uses one official BTB Launchpad URL.
- Load failures retry with backoff: 2 seconds, 5 seconds, 15 seconds, then 30 seconds.
- The loading screen exposes a manual retry button for offline or repeated load failures.
- Notification taps route inside Launchpad when possible:
  - `SUPER` / `SCLEAR` style messages open `#SuperLog-display`.
  - Other BTB messages open `#btb-manage`.
  - Future FCM payloads can override this with `data.route`, `data.target`, or `data.screen`.
