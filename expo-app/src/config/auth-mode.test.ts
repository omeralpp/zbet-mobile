import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveMobileAuthMode,
  validateNoPublicOAuthSecrets,
  validateOAuthPublicConfiguration
} from "./auth-mode";

test("non-mock builds default to OAuth and reject an embedded pilot key", () => {
  assert.equal(resolveMobileAuthMode({ useMocks: false }), "oauth");
  assert.throws(
    () =>
      resolveMobileAuthMode({
        useMocks: false,
        pilotAccessKey: "p".repeat(64)
      }),
    /forbidden/
  );
});

test("pilot direct-open requires an explicit profile and a strong key", () => {
  assert.equal(
    resolveMobileAuthMode({
      useMocks: false,
      configuredMode: "pilot",
      pilotAccessKey: "p".repeat(64)
    }),
    "pilot"
  );
  assert.throws(
    () =>
      resolveMobileAuthMode({
        useMocks: false,
        configuredMode: "pilot",
        pilotAccessKey: "short"
      }),
    /valid/
  );
});

test("web builds default to edge and refuse any pilot key or app login", () => {
  assert.equal(resolveMobileAuthMode({ useMocks: false, webBuild: true }), "edge");
  assert.equal(resolveMobileAuthMode({ useMocks: true, webBuild: true }), "preview");
  assert.throws(
    () =>
      resolveMobileAuthMode({
        useMocks: false,
        webBuild: true,
        configuredMode: "pilot",
        pilotAccessKey: "p".repeat(64)
      }),
    /forbidden in a web build/
  );
  assert.throws(
    () =>
      resolveMobileAuthMode({
        useMocks: true,
        webBuild: true,
        pilotAccessKey: "p".repeat(64)
      }),
    /forbidden in a web build/
  );
  assert.throws(
    () => resolveMobileAuthMode({ useMocks: false, webBuild: true, configuredMode: "oauth" }),
    /preview or edge/
  );
  assert.throws(
    () => resolveMobileAuthMode({ useMocks: true, webBuild: true, configuredMode: "edge" }),
    /Preview authentication/
  );
});

test("edge authentication is refused outside a web build", () => {
  assert.throws(
    () => resolveMobileAuthMode({ useMocks: false, configuredMode: "edge" }),
    /only in a web build/
  );
  assert.equal(resolveMobileAuthMode({ useMocks: true }), "preview");
});

test("OAuth public configuration contains no secret and uses HTTPS", () => {
  assert.doesNotThrow(() =>
    validateOAuthPublicConfiguration({
      clientId: "public-mobile-client",
      issuer: "https://tenant.accounts.example.test",
      authorizationEndpoint:
        "https://tenant.accounts.example.test/oauth2/authorize",
      tokenEndpoint: "https://tenant.accounts.example.test/oauth2/token",
      redirectUri: "https://api.surklase.com/auth/callback",
      scopes: "openid profile email groups offline_access"
    })
  );
  assert.throws(
    () =>
      validateOAuthPublicConfiguration({
        clientId: "public-mobile-client",
        issuer: "http://tenant.example.test",
        authorizationEndpoint: "https://tenant.example.test/authorize",
        tokenEndpoint: "https://tenant.example.test/token",
        redirectUri: "https://api.surklase.com/auth/callback",
        scopes: "openid offline_access"
      }),
    /HTTPS/
  );
  assert.throws(
    () =>
      validateOAuthPublicConfiguration({
        clientId: "public-mobile-client",
        issuer: "https://tenant.accounts.example.test",
        authorizationEndpoint:
          "https://tenant.accounts.example.test/oauth2/authorize",
        tokenEndpoint: "https://tenant.accounts.example.test/oauth2/token",
        redirectUri: "https://other.example.test/auth/callback",
        scopes: "openid offline_access"
      }),
    /Android App Link/
  );
  assert.throws(
    () =>
      validateOAuthPublicConfiguration({
        clientId: "public-mobile-client",
        issuer: "https://tenant.accounts.example.test",
        authorizationEndpoint:
          "https://tenant.accounts.example.test/oauth2/authorize",
        tokenEndpoint: "https://tenant.accounts.example.test/oauth2/token",
        redirectUri: "https://api.surklase.com/auth/callback",
        scopes: "openid profile"
      }),
    /offline_access/
  );
});

test("OAuth builds reject public secret-shaped environment values", () => {
  assert.doesNotThrow(() =>
    validateNoPublicOAuthSecrets({
      EXPO_PUBLIC_AUTH_CLIENT_ID: "public-mobile-client"
    })
  );
  assert.throws(
    () =>
      validateNoPublicOAuthSecrets({
        EXPO_PUBLIC_AUTH_CLIENT_SECRET: "must-not-be-public"
      }),
    /forbidden/
  );
});
