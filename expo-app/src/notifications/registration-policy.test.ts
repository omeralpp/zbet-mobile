import assert from "node:assert/strict";
import test from "node:test";
import {
  legacyNotificationTopic,
  resolveLegacyNotificationTopic
} from "./registration-policy";

test("keeps the Android pilot subscribed to the legacy notification topic", () => {
  assert.equal(
    resolveLegacyNotificationTopic("pilot", "android"),
    legacyNotificationTopic
  );
});

test("keeps OAuth, preview, and iOS off the legacy topic", () => {
  assert.equal(resolveLegacyNotificationTopic("oauth", "android"), "");
  assert.equal(resolveLegacyNotificationTopic("preview", "android"), "");
  assert.equal(resolveLegacyNotificationTopic("pilot", "ios"), "");
});
