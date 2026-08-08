import assert from "node:assert/strict";
import test from "node:test";
import {
  isOAuthCallbackUrl,
  parseOAuthCallback
} from "./oauth-callback";

const redirectUri = "https://api.surklase.com/auth/callback";
const nativeReturnUri = "btbmobile://auth";

test("accepts the verified HTTPS App Link and native bridge callback", () => {
  assert.equal(
    isOAuthCallbackUrl(
      `${redirectUri}?code=code-1&state=state-1`,
      redirectUri,
      nativeReturnUri
    ),
    true
  );
  assert.equal(
    isOAuthCallbackUrl(
      `${nativeReturnUri}?code=code-2&state=state-2`,
      redirectUri,
      nativeReturnUri
    ),
    true
  );
  assert.equal(
    isOAuthCallbackUrl(
      `${nativeReturnUri}/?code=code-3&state=state-3`,
      redirectUri,
      nativeReturnUri
    ),
    true
  );
});

test("cold-start callback validates state, issuer, and PKCE verifier", () => {
  assert.deepEqual(
    parseOAuthCallback(
      `${redirectUri}?code=code-1&state=state-1234567890&` +
        "iss=https%3A%2F%2Ftenant.accounts.example.test",
      {
        state: "state-1234567890",
        codeVerifier: "v".repeat(64),
        redirectUri
      },
      nativeReturnUri,
      "https://tenant.accounts.example.test"
    ),
    {
      type: "success",
      code: "code-1",
      codeVerifier: "v".repeat(64)
    }
  );
});

test("cold-start callback rejects mismatched state, issuer, and duplicates", () => {
  const pending = {
    state: "state-1234567890",
    codeVerifier: "v".repeat(64),
    redirectUri
  };
  assert.throws(
    () =>
      parseOAuthCallback(
        `${nativeReturnUri}?code=x&state=wrong&iss=https%3A%2F%2Ftenant.accounts.example.test`,
        pending,
        nativeReturnUri,
        "https://tenant.accounts.example.test"
      ),
    /state/
  );
  assert.throws(
    () =>
      parseOAuthCallback(
        `${nativeReturnUri}?code=x&state=${pending.state}&iss=https%3A%2F%2Fevil.example`,
        pending,
        nativeReturnUri,
        "https://tenant.accounts.example.test"
      ),
    /issuer/
  );
  assert.throws(
    () =>
      parseOAuthCallback(
        `${nativeReturnUri}?code=x&code=y&state=${pending.state}&` +
          "iss=https%3A%2F%2Ftenant.accounts.example.test",
        pending,
        nativeReturnUri,
        "https://tenant.accounts.example.test"
      ),
    /parametreleri/
  );
});

test("rejects lookalike, wrong-path, credential, and malformed callbacks", () => {
  for (const candidate of [
    "https://api.surklase.com.evil.example/auth/callback?code=x",
    "https://api.surklase.com/auth/callback/extra?code=x",
    "https://evil.example/auth/callback?code=x",
    "https://user@api.surklase.com/auth/callback?code=x",
    "btbmobile://auth.evil.example?code=x",
    "not-a-url"
  ]) {
    assert.equal(
      isOAuthCallbackUrl(candidate, redirectUri, nativeReturnUri),
      false,
      candidate
    );
  }
});
