import * as AuthSession from "expo-auth-session";
import { runtimeConfig } from "@/src/config/runtime";
import { getOidcDiscovery } from "./oidc-discovery-runtime";
import {
  clearSession,
  getSession,
  saveSession
} from "./session-store";
import { createAccessTokenProvider } from "./token-manager-core";

export const getValidAccessToken = createAccessTokenProvider({
  getSession,
  saveSession,
  clearSession,
  now: AuthSession.getCurrentTimeInSeconds,
  refresh: async (refreshToken) =>
    AuthSession.refreshAsync(
      {
        clientId: runtimeConfig.auth.clientId,
        refreshToken,
        scopes: [...runtimeConfig.auth.scopes]
      },
      await getOidcDiscovery()
    )
});

export async function revokeCurrentSession(): Promise<
  AuthSession.DiscoveryDocument | null
> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  const discovery = await getOidcDiscovery();
  const token = session.refreshToken || session.accessToken;
  if (token && discovery.revocationEndpoint) {
    await AuthSession.revokeAsync(
      {
        clientId: runtimeConfig.auth.clientId,
        token,
        tokenTypeHint: session.refreshToken
          ? AuthSession.TokenTypeHint.RefreshToken
          : AuthSession.TokenTypeHint.AccessToken
      },
      discovery
    );
  }
  return discovery;
}
