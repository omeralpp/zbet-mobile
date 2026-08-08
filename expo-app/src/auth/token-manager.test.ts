import assert from "node:assert/strict";
import test from "node:test";
import {
  createAccessTokenProvider,
  sessionFromTokenResponse
} from "./token-manager-core";
import type { SessionTokens } from "./session-store";

test("fresh access token is returned without refresh", async () => {
  let refreshCount = 0;
  const provider = createAccessTokenProvider({
    getSession: async () => ({
      accessToken: "fresh-token",
      refreshToken: "refresh-token",
      expiresAt: 2_000
    }),
    saveSession: async () => undefined,
    clearSession: async () => undefined,
    refresh: async () => {
      refreshCount += 1;
      return { accessToken: "unexpected" };
    },
    now: () => 1_000
  });

  assert.equal(await provider(), "fresh-token");
  assert.equal(refreshCount, 0);
});

test("concurrent expired-token requests share one refresh", async () => {
  let stored: SessionTokens | null = {
    accessToken: "expired-token",
    refreshToken: "refresh-token",
    expiresAt: 1_020
  };
  let refreshCount = 0;
  const provider = createAccessTokenProvider({
    getSession: async () => stored,
    saveSession: async (tokens) => {
      stored = tokens;
    },
    clearSession: async () => {
      stored = null;
    },
    refresh: async () => {
      refreshCount += 1;
      await Promise.resolve();
      return {
        accessToken: "new-token",
        refreshToken: "rotated-refresh",
        issuedAt: 1_000,
        expiresIn: 3_600
      };
    },
    now: () => 1_000
  });

  assert.deepEqual(await Promise.all([provider(), provider(), provider()]), [
    "new-token",
    "new-token",
    "new-token"
  ]);
  assert.equal(refreshCount, 1);
  assert.equal(stored?.refreshToken, "rotated-refresh");
});

test("expired sessions fail closed when refresh cannot complete", async () => {
  let cleared = false;
  const provider = createAccessTokenProvider({
    getSession: async () => ({
      accessToken: "expired-token",
      refreshToken: "refresh-token",
      expiresAt: 1
    }),
    saveSession: async () => undefined,
    clearSession: async () => {
      cleared = true;
    },
    refresh: async () => {
      throw new Error("refresh rejected");
    },
    now: () => 1_000
  });

  assert.equal(await provider(), null);
  assert.equal(cleared, true);
});

test("token response retains fallback refresh and ID tokens", () => {
  assert.deepEqual(
    sessionFromTokenResponse(
      {
        accessToken: "access-token",
        issuedAt: 100,
        expiresIn: 300
      },
      "fallback-refresh",
      "fallback-id-token"
    ),
    {
      accessToken: "access-token",
      refreshToken: "fallback-refresh",
      idToken: "fallback-id-token",
      expiresAt: 400
    }
  );
});
