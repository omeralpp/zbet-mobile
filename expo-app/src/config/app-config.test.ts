import assert from "node:assert/strict";
import test from "node:test";
import type { ConfigContext } from "expo/config";
import resolveAppConfig from "../../app.config";

function withEnvironment(
  values: Record<string, string | undefined>,
  run: () => void
): void {
  const names = [
    "BTB_WEB_BUILD",
    "EXPO_PUBLIC_USE_MOCKS",
    "EXPO_PUBLIC_MOBILE_AUTH_MODE",
    "EXPO_PUBLIC_MOBILE_PILOT_KEY",
    "EXPO_PUBLIC_MOBILE_API_URL",
    ...Object.keys(values)
  ];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) {
      delete process.env[name];
    }
    for (const [name, value] of Object.entries(values)) {
      if (value !== undefined) {
        process.env[name] = value;
      }
    }
    run();
  } finally {
    for (const name of names) {
      const value = previous[name];
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
}

test("web build serves edge auth from its own origin with no credential", () => {
  withEnvironment(
    {
      BTB_WEB_BUILD: "1",
      EXPO_PUBLIC_USE_MOCKS: "false",
      EXPO_PUBLIC_MOBILE_API_URL: "https://api.surklase.com"
    },
    () => {
      const config = resolveAppConfig({ config: {} } as ConfigContext);
      assert.equal(config.extra?.authMode, "edge");
      assert.equal(config.extra?.mobileApiUrl, "");
      assert.equal(config.extra?.pilotAccessKey, "");
      assert.equal(config.extra?.authClientId, "");
      assert.equal(config.web?.output, "single");
    }
  );
});

test("web build refuses a pilot key in its environment", () => {
  withEnvironment(
    {
      BTB_WEB_BUILD: "1",
      EXPO_PUBLIC_USE_MOCKS: "false",
      EXPO_PUBLIC_MOBILE_PILOT_KEY: "p".repeat(64)
    },
    () => {
      assert.throws(
        () => resolveAppConfig({ config: {} } as ConfigContext),
        /forbidden in a web build/
      );
    }
  );
});

test("native splash yalnız uygulama arka planını gösterir", () => {
  const environmentNames = [
    "EXPO_PUBLIC_USE_MOCKS",
    "EXPO_PUBLIC_MOBILE_AUTH_MODE",
    "EXPO_PUBLIC_MOBILE_PILOT_KEY",
    "EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL",
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
    // The Fiori/Work Zone web view was removed on 2026-10-16, so a build no
    // longer carries its launchpad URL or its SAP host allowlist.
    process.env.EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL = "https://example.invalid/site";
    process.env.EXPO_PUBLIC_SAP_WEB_ALLOWED_HOSTS = "*.hana.ondemand.com";
    const withLegacyEnvironment = resolveAppConfig({
      config: {}
    } as ConfigContext);
    for (const retired of ["legacyLaunchpadUrl", "sapWebAllowedHosts"]) {
      assert.equal(retired in (withLegacyEnvironment.extra ?? {}), false, retired);
    }
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
