import assert from "node:assert/strict";
import test from "node:test";
import type { ConfigContext } from "expo/config";
import resolveAppConfig from "../../app.config";

test("native splash yalnız uygulama arka planını gösterir", () => {
  const environmentNames = [
    "EXPO_PUBLIC_USE_MOCKS",
    "EXPO_PUBLIC_MOBILE_AUTH_MODE",
    "EXPO_PUBLIC_MOBILE_PILOT_KEY",
    "EXPO_PUBLIC_SAP_WEB_ALLOWED_HOSTS"
  ] as const;
  const previous = Object.fromEntries(
    environmentNames.map((name) => [name, process.env[name]])
  );

  try {
    for (const name of environmentNames) {
      delete process.env[name];
    }
    const config = resolveAppConfig({
      config: {}
    } as ConfigContext);
    const splashPlugin = config.plugins?.find(
      (plugin) =>
        Array.isArray(plugin) && plugin[0] === "expo-splash-screen"
    );

    assert.deepEqual(splashPlugin, [
      "expo-splash-screen",
      {
        backgroundColor: "#04101E",
        android: {
          drawable: {
            icon: "./assets/splash-transparent.xml"
          }
        }
      }
    ]);
    assert.equal(
      config.extra?.sapWebAllowedHosts,
      "*.hana.ondemand.com,*.accounts.ondemand.com,*.trial-accounts.ondemand.com"
    );
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
});
