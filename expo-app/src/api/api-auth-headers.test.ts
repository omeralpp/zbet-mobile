import assert from "node:assert/strict";
import test from "node:test";
import { getApiAuthHeaders } from "./api-auth-headers";

test("uses the pilot key without exposing a backend credential", () => {
  assert.deepEqual(getApiAuthHeaders("pilot-access-key"), {
    "X-BTB-Pilot-Key": "pilot-access-key"
  });
});

test("keeps bearer auth only as a non-pilot fallback", () => {
  assert.deepEqual(getApiAuthHeaders("", "access-token"), {
    Authorization: "Bearer access-token"
  });
  assert.deepEqual(
    getApiAuthHeaders("pilot-access-key", "access-token"),
    {
      "X-BTB-Pilot-Key": "pilot-access-key"
    }
  );
});
