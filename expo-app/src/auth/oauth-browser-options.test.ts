import assert from "node:assert/strict";
import test from "node:test";
import { getOAuthBrowserOptions } from "./oauth-browser-options";

test("bypasses the Android proxy activity used by the auth polyfill", () => {
  assert.deepEqual(getOAuthBrowserOptions("android"), {
    useProxyActivity: false
  });
});

test("keeps native auth-session defaults on other platforms", () => {
  assert.deepEqual(getOAuthBrowserOptions("ios"), {});
  assert.deepEqual(getOAuthBrowserOptions("web"), {});
});
