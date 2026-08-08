import assert from "node:assert/strict";
import test from "node:test";
import { buildDeviceRegistrationPayload } from "./device-registration";

test("keeps the legacy pilot device-registration payload compatible", () => {
  assert.deepEqual(
    buildDeviceRegistrationPayload("fcm-token", "android"),
    { token: "fcm-token", platform: "android" }
  );
});

test("adds installation identity for authenticated OIDC registration", () => {
  assert.deepEqual(
    buildDeviceRegistrationPayload(
      "fcm-token",
      "android",
      "installation-id-0001"
    ),
    {
      token: "fcm-token",
      platform: "android",
      installationId: "installation-id-0001"
    }
  );
});
