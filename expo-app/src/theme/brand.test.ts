import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import type { ConfigContext } from "expo/config";
import resolveAppConfig from "../../app.config";
import {
  btbAdaptiveIconBackground,
  btbAdaptiveIconForegroundPath,
  btbBrandMarkPath,
  btbNotificationIconResource
} from "./brand";

const environmentNames = [
  "EXPO_PUBLIC_USE_MOCKS",
  "EXPO_PUBLIC_MOBILE_AUTH_MODE",
  "EXPO_PUBLIC_MOBILE_PILOT_KEY",
  "EXPO_PUBLIC_SAP_WEB_ALLOWED_HOSTS"
] as const;

function withCleanEnvironment<T>(read: () => T): T {
  const previous = Object.fromEntries(
    environmentNames.map((name) => [name, process.env[name]])
  );
  try {
    for (const name of environmentNames) {
      delete process.env[name];
    }
    return read();
  } finally {
    for (const name of environmentNames) {
      const value = previous[name];
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
}

const config = withCleanEnvironment(() =>
  resolveAppConfig({ config: {} } as ConfigContext)
);

const projectPath = (configPath: string) =>
  new URL(`../../${configPath.replace("./", "")}`, import.meta.url);

test("the app icon and the launcher foreground come from the brand contract", () => {
  // The point of the contract is that the day these two stop being the same
  // file, no screen and no build script has to be found and edited.
  assert.equal(config.icon, btbBrandMarkPath);
  assert.equal(
    config.android?.adaptiveIcon?.foregroundImage,
    btbAdaptiveIconForegroundPath
  );
  assert.equal(
    config.android?.adaptiveIcon?.backgroundColor,
    btbAdaptiveIconBackground
  );
});

test("every brand path the config declares is a file that exists", () => {
  for (const declared of [btbBrandMarkPath, btbAdaptiveIconForegroundPath]) {
    assert.ok(
      existsSync(projectPath(declared)),
      `${declared} yok — marka sözleşmesi var olmayan bir dosyayı bildiriyor`
    );
  }
});

test("the notification small icon stays a vector the system can mask", () => {
  // Android draws this one as an alpha mask and throws the colour away, so an
  // opaque raster arrives as a filled square. The vector is the answer, and it
  // has to stay registered for both the Firebase and the Expo metadata key.
  const manifest = readFileSync(
    new URL(
      "../../modules/btb-widget/android/src/main/AndroidManifest.xml",
      import.meta.url
    ),
    "utf8"
  );
  for (const key of [
    "com.google.firebase.messaging.default_notification_icon",
    "expo.modules.notifications.default_notification_icon"
  ]) {
    assert.ok(manifest.includes(key), `${key} bildirilmiyor`);
  }
  assert.ok(manifest.includes(btbNotificationIconResource));

  // The plugin used to be the other place a raster could claim this role.
  const notifications = config.plugins?.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === "expo-notifications"
  );
  assert.ok(Array.isArray(notifications));
  assert.ok(
    !Object.hasOwn(notifications[1] as object, "icon"),
    "expo-notifications bir raster ikon bildiriyor"
  );
});

test("no second copy of the mark is shipped beside the canonical one", () => {
  // `assets/notification-icon.png` was a byte-identical copy of the mark that
  // nothing referenced, and it read as though it were the notification icon.
  assert.ok(!existsSync(projectPath("./assets/notification-icon.png")));
  assert.ok(!existsSync(projectPath("./assets/icon.png")));
});
