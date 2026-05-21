# zbet-mobile

Cordova Android shell for the BTB Launchpad / Work Zone experience.

## Purpose

- Open the BTB web experience inside an Android in-app browser shell.
- Receive Firebase Cloud Messaging notifications for the `BTB` topic.
- Keep mobile notification behavior separate from the ABAP model and CAP proxy logic.

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
