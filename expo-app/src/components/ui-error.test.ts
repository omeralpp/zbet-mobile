import assert from "node:assert/strict";
import test from "node:test";
import { classifyUiError, describeUiError } from "./ui-error";

test("unknown and unstructured failures never assert that the device is offline", () => {
  for (const error of [undefined, null, "offline", new Error("Failed to fetch"), { status: "401" }, { status: 400 }]) {
    assert.equal(classifyUiError(error), "UNKNOWN");
    assert.notEqual(describeUiError(error).kind, "OFFLINE");
  }
});
test("structured status chooses the appropriate recovery instead of blind retry", () => {
  for (const [status, category] of [[401, "SESSION"], [403, "FORBIDDEN"], [404, "NOT_FOUND"], [408, "SERVICE"], [429, "SERVICE"], [503, "SERVICE"]] as const) {
    assert.equal(classifyUiError({ status }), category);
  }
  assert.equal(describeUiError({ status: 401 }).retryable, false);
  assert.equal(describeUiError({ status: 404 }).retryable, false);
  assert.equal(describeUiError({ status: 503 }).retryable, true);
});
test("explicit network evidence is distinguished from a timeout and an expired session", () => {
  assert.equal(classifyUiError({ code: "NETWORK_ERROR" }), "NETWORK");
  assert.equal(classifyUiError({ offline: true }), "NETWORK");
  assert.equal(classifyUiError({ code: "REQUEST_TIMEOUT" }), "SERVICE");
  assert.equal(classifyUiError({ code: "EDGE_SESSION_EXPIRED", offline: true }), "SESSION");
});
test("raw service diagnostics never become the user-facing error message", () => {
  const display = describeUiError({ status: 503, message: "internal upstream URL and token=sample" });
  assert.ok(!/upstream|token|503/.test(display.message));
  assert.equal(describeUiError(undefined, "NOT_FOUND").retryable, false);
});
