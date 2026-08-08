import * as SecureStore from "expo-secure-store";

const sessionKey = "btb.mobile.oauth-session";
const pendingAuthorizationKey = "btb.mobile.pending-authorization";
const pendingAuthorizationLifetimeMs = 10 * 60 * 1000;

export type SessionEvent = "saved" | "cleared";
type SessionListener = (event: SessionEvent) => void;
const sessionListeners = new Set<SessionListener>();

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  idToken?: string;
  expiresAt?: number;
};

export type PendingAuthorization = {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  createdAt: number;
};

function emitSessionEvent(event: SessionEvent): void {
  for (const listener of sessionListeners) {
    listener(event);
  }
}

export function parsePendingAuthorization(
  value: unknown,
  now = Date.now()
): PendingAuthorization | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<PendingAuthorization>;
  if (
    typeof candidate.state !== "string" ||
    candidate.state.length < 10 ||
    candidate.state.length > 512 ||
    typeof candidate.codeVerifier !== "string" ||
    candidate.codeVerifier.length < 43 ||
    candidate.codeVerifier.length > 128 ||
    typeof candidate.redirectUri !== "string" ||
    !candidate.redirectUri ||
    typeof candidate.createdAt !== "number" ||
    !Number.isSafeInteger(candidate.createdAt) ||
    candidate.createdAt > now + 30_000 ||
    candidate.createdAt < now - pendingAuthorizationLifetimeMs ||
    /[\r\n]/.test(
      `${candidate.state}${candidate.codeVerifier}${candidate.redirectUri}`
    )
  ) {
    return null;
  }

  return candidate as PendingAuthorization;
}

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
  emitSessionEvent("saved");
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(sessionKey);
  emitSessionEvent("cleared");
}

export async function getPendingAuthorization(): Promise<PendingAuthorization | null> {
  const stored = await SecureStore.getItemAsync(pendingAuthorizationKey);
  if (!stored) {
    return null;
  }

  try {
    const pending = parsePendingAuthorization(JSON.parse(stored));
    if (pending) {
      return pending;
    }
  } catch {
    // Invalid pending requests are deleted below.
  }

  await clearPendingAuthorization();
  return null;
}

export async function savePendingAuthorization(
  pending: PendingAuthorization
): Promise<void> {
  const validated = parsePendingAuthorization(pending);
  if (!validated) {
    throw new Error("Geçersiz OAuth PKCE isteği kaydedilemez.");
  }
  await SecureStore.setItemAsync(
    pendingAuthorizationKey,
    JSON.stringify(validated),
    { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
  );
}

export async function clearPendingAuthorization(): Promise<void> {
  await SecureStore.deleteItemAsync(pendingAuthorizationKey);
}

export function subscribeToSessionEvents(listener: SessionListener): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}
