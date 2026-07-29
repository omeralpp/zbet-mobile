import assert from "node:assert/strict";
import test from "node:test";
import type { ConfigContext } from "expo/config";
import resolveAppConfig from "../../app.config";

test("native splash yalnız uygulama arka planını gösterir", () => {
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
});
