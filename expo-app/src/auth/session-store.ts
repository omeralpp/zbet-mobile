import * as SecureStore from "expo-secure-store";

const sessionKey = "btb.mobile.oauth-session";

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: number;
};

export async function getAccessToken(): Promise<string | null> {
  return (await getSession())?.accessToken ?? null;
}

export async function getSession(): Promise<SessionTokens | null> {
  const stored = await SecureStore.getItemAsync(sessionKey);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<SessionTokens>;
    return typeof parsed.accessToken === "string" && parsed.accessToken
      ? (parsed as SessionTokens)
      : null;
  } catch {
    await SecureStore.deleteItemAsync(sessionKey);
    return null;
  }
}

export async function saveSession(tokens: SessionTokens): Promise<void> {
  await SecureStore.setItemAsync(sessionKey, JSON.stringify(tokens), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(sessionKey);
}
