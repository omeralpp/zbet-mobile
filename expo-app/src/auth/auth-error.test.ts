import assert from "node:assert/strict";
import test from "node:test";
import { toFriendlyAuthError } from "./auth-error";

test("maps OAuth diagnostics to bounded Turkish messages", () => {
  assert.equal(
    toFriendlyAuthError(new Error("invalid_grant: Invalid code format")),
    "Giriş bağlantısının süresi doldu. Lütfen yeniden giriş yapın."
  );
  assert.match(
    toFriendlyAuthError({ code: "state_mismatch" }),
    /Güvenli giriş doğrulanamadı/
  );
  assert.match(
    toFriendlyAuthError(new Error("Network request failed")),
    /İnternet bağlantınızı/
  );
});

test("does not expose an unknown provider error", () => {
  assert.equal(
    toFriendlyAuthError(new Error("sensitive provider diagnostic")),
    "Güvenli giriş tamamlanamadı. Lütfen yeniden deneyin."
  );
});
