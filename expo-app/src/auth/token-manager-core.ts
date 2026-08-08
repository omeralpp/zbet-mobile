import type { SessionTokens } from "./session-store";

const refreshMarginSeconds = 60;

export type TokenResponseShape = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  idToken?: string;
  issuedAt?: number;
  expiresIn?: number;
};

export type AccessTokenProviderDependencies = {
  getSession(): Promise<SessionTokens | null>;
  saveSession(tokens: SessionTokens): Promise<void>;
  clearSession(): Promise<void>;
  refresh(refreshToken: string): Promise<TokenResponseShape>;
  now(): number;
};

export function sessionFromTokenResponse(
  token: TokenResponseShape,
  fallbackRefreshToken?: string,
  fallbackIdToken?: string
): SessionTokens {
  const issuedAt = token.issuedAt ?? Math.floor(Date.now() / 1000);
  const expiresAt = token.expiresIn ? issuedAt + token.expiresIn : undefined;
  const refreshToken = token.refreshToken ?? fallbackRefreshToken;
  const idToken = token.idToken ?? fallbackIdToken;

  return {
    accessToken: token.accessToken,
    ...(refreshToken ? { refreshToken } : {}),
    ...(token.tokenType ? { tokenType: token.tokenType } : {}),
    ...(idToken ? { idToken } : {}),
    ...(expiresAt ? { expiresAt } : {})
  };
}

export function createAccessTokenProvider(
  dependencies: AccessTokenProviderDependencies
): () => Promise<string | null> {
  let refreshInFlight: Promise<string | null> | null = null;

  return async function provideAccessToken(): Promise<string | null> {
    const session = await dependencies.getSession();
    if (!session) {
      return null;
    }

    const tokenIsFresh =
      !session.expiresAt ||
      session.expiresAt > dependencies.now() + refreshMarginSeconds;
    if (tokenIsFresh) {
      return session.accessToken;
    }

    if (!session.refreshToken) {
      await dependencies.clearSession();
      return null;
    }

    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        try {
          const refreshed = await dependencies.refresh(session.refreshToken!);
          const nextSession = sessionFromTokenResponse(
            refreshed,
            session.refreshToken,
            session.idToken
          );
          await dependencies.saveSession(nextSession);
          return nextSession.accessToken;
        } catch {
          await dependencies.clearSession();
          return null;
        } finally {
          refreshInFlight = null;
        }
      })();
    }

    return refreshInFlight;
  };
}
