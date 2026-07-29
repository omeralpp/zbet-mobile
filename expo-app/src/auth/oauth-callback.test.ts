import assert from "node:assert/strict";
import test from "node:test";
import { isOAuthCallbackUrl } from "./oauth-callback";

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
