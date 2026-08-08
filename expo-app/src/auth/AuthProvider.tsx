import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { runtimeConfig } from "@/src/config/runtime";
import { toFriendlyAuthError } from "./auth-error";
import { getOAuthBrowserOptions } from "./oauth-browser-options";
import { isOAuthCallbackUrl, parseOAuthCallback } from "./oauth-callback";
import { getOidcDiscovery } from "./oidc-discovery-runtime";
import {
  clearPendingAuthorization,
  clearSession,
  getPendingAuthorization,
  getSession,
  savePendingAuthorization,
  saveSession,
  subscribeToSessionEvents
} from "./session-store";
import { sessionFromTokenResponse } from "./token-manager-core";
import { revokeCurrentSession } from "./token-manager";

WebBrowser.maybeCompleteAuthSession();

type AuthStatus =
  | "loading"
  | "preview"
  | "authenticated"
  | "unauthenticated"
  | "configuration-error";

type AuthContextValue = {
  status: AuthStatus;
  error: string | null;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const nativeReturnUri = "btbmobile://auth";
const nativeLogoutUri = "btbmobile://logged-out";
const callbackGraceMs = 1000;

export function AuthProvider({ children }: PropsWithChildren) {
  const authConfig = runtimeConfig.auth;
  const configured = Boolean(
    authConfig.clientId &&
      authConfig.issuer &&
      authConfig.redirectUri
  );
  const [discovery, setDiscovery] =
    useState<AuthSession.DiscoveryDocument | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const redirectUri =
    authConfig.redirectUri ||
    AuthSession.makeRedirectUri({
      scheme: "btbmobile",
      path: "auth"
    });
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (runtimeConfig.authMode !== "oauth" || !configured) {
      return;
    }
    getOidcDiscovery().then(
      (document) => {
        if (mounted) {
          setDiscovery(document);
          setDiscoveryError(null);
        }
      },
      (discoveryFailure: unknown) => {
        if (mounted) {
          setDiscoveryError(toFriendlyAuthError(discoveryFailure));
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, [configured]);

  const completeAuthorizationCallback = useCallback(
    async (callbackUrl: string) => {
      if (!configured || !discovery) {
        throw new Error("Mobil OAuth yapılandırması hazır değil.");
      }

      const activeDiscovery = discovery;
      const pending = await getPendingAuthorization();
      if (!pending) {
        throw new Error(
          "Giriş isteğinin süresi doldu. Lütfen giriş işlemini yeniden başlatın."
        );
      }

      try {
        const response = parseOAuthCallback(
          callbackUrl,
          pending,
          nativeReturnUri,
          authConfig.issuer
        );
        if (response.type === "error") {
          throw new Error(response.description || response.error);
        }

        const token = await AuthSession.exchangeCodeAsync(
          {
            clientId: authConfig.clientId,
            code: response.code,
            redirectUri: pending.redirectUri,
            extraParams: {
              code_verifier: response.codeVerifier
            }
          },
          activeDiscovery
        );
        await saveSession(sessionFromTokenResponse(token));
      } finally {
        await clearPendingAuthorization();
      }
    },
    [authConfig.clientId, authConfig.issuer, configured, discovery]
  );

  useEffect(
    () =>
      subscribeToSessionEvents((event) => {
        if (runtimeConfig.authMode !== "oauth") {
          return;
        }
        if (event === "cleared") {
          setStatus("unauthenticated");
        } else {
          setError(null);
          setStatus("authenticated");
        }
      }),
    []
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      if (runtimeConfig.authMode === "preview") {
        setStatus("preview");
        return;
      }
      if (runtimeConfig.authMode === "pilot") {
        setStatus("authenticated");
        return;
      }
      if (!configured) {
        setStatus("configuration-error");
        setError("Mobil OAuth endpointleri henüz yapılandırılmadı.");
        return;
      }
      if (discoveryError) {
        setStatus("configuration-error");
        setError(discoveryError);
        return;
      }
      if (!discovery) {
        setStatus("loading");
        return;
      }

      const initialUrl = await Linking.getInitialURL();
      if (
        initialUrl &&
        isOAuthCallbackUrl(initialUrl, redirectUri, nativeReturnUri)
      ) {
        try {
          await completeAuthorizationCallback(initialUrl);
          if (mounted) {
            setError(null);
            setStatus("authenticated");
          }
        } catch (callbackError: unknown) {
          await clearSession();
          if (mounted) {
            setError(toFriendlyAuthError(callbackError));
            setStatus("unauthenticated");
          }
        }
        return;
      }

      const stored = await getSession();
      if (!mounted) {
        return;
      }
      if (!stored) {
        setStatus("unauthenticated");
        return;
      }

      const now = AuthSession.getCurrentTimeInSeconds();
      const needsRefresh =
        Boolean(stored.refreshToken) &&
        Boolean(stored.expiresAt) &&
        Number(stored.expiresAt) <= now + 60;

      if (!needsRefresh) {
        setStatus("authenticated");
        return;
      }

      try {
        const refreshed = await AuthSession.refreshAsync(
          {
            clientId: authConfig.clientId,
            refreshToken: stored.refreshToken!,
            scopes: [...authConfig.scopes]
          },
          discovery
        );
        await saveSession(
          sessionFromTokenResponse(
            refreshed,
            stored.refreshToken,
            stored.idToken
          )
        );
        if (mounted) {
          setStatus("authenticated");
        }
      } catch {
        await clearSession();
        if (mounted) {
          setStatus("unauthenticated");
        }
      }
    }

    bootstrap().catch((bootstrapError: unknown) => {
      if (mounted) {
        setStatus("unauthenticated");
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "Oturum okunamadı."
        );
      }
    });

    return () => {
      mounted = false;
    };
  }, [
    authConfig.clientId,
    authConfig.scopes,
    completeAuthorizationCallback,
    configured,
    discovery,
    discoveryError,
    redirectUri
  ]);

  const signIn = useCallback(async () => {
    if (runtimeConfig.authMode === "preview") {
      setStatus("preview");
      return;
    }
    if (runtimeConfig.authMode === "pilot") {
      setError(null);
      setStatus("authenticated");
      return;
    }
    if (!configured || !discovery) {
      setError("Mobil OAuth yapılandırması hazır değil.");
      setStatus(configured ? "unauthenticated" : "configuration-error");
      return;
    }

    setError(null);
    setStatus("loading");
    try {
      const request = new AuthSession.AuthRequest({
        clientId: authConfig.clientId,
        scopes: [...authConfig.scopes],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        usePKCE: true
      });
      const authorizationUrl = await request.makeAuthUrlAsync(discovery);
      if (!request.codeVerifier) {
        throw new Error("OAuth PKCE doğrulayıcısı üretilemedi.");
      }
      await savePendingAuthorization({
        state: request.state,
        codeVerifier: request.codeVerifier,
        redirectUri,
        createdAt: Date.now()
      });
      let resolveCallback: (url: string) => void = () => undefined;
      const callbackPromise = new Promise<string>((resolve) => {
        resolveCallback = resolve;
      });
      const callbackSubscription = Linking.addEventListener("url", (event) => {
        if (isOAuthCallbackUrl(event.url, redirectUri, nativeReturnUri)) {
          resolveCallback(event.url);
        }
      });

      let callbackUrl: string | null = null;
      try {
        const browserOutcome = WebBrowser.openAuthSessionAsync(
          authorizationUrl,
          redirectUri,
          getOAuthBrowserOptions(Platform.OS)
        ).then(
          (result) => ({ type: "browser" as const, result }),
          (browserError: unknown) => ({
            type: "browser-error" as const,
            error: browserError
          })
        );
        const firstOutcome = await Promise.race([
          browserOutcome,
          callbackPromise.then((url) => ({
            type: "callback" as const,
            url
          }))
        ]);

        if (firstOutcome.type === "callback") {
          callbackUrl = firstOutcome.url;
        } else if (firstOutcome.type === "browser-error") {
          throw firstOutcome.error;
        } else if (firstOutcome.result.type === "success") {
          callbackUrl = firstOutcome.result.url;
        } else {
          let timeout: ReturnType<typeof setTimeout> | undefined;
          try {
            callbackUrl = await Promise.race([
              callbackPromise,
              new Promise<null>((resolve) => {
                timeout = setTimeout(() => resolve(null), callbackGraceMs);
              })
            ]);
          } finally {
            if (timeout) {
              clearTimeout(timeout);
            }
          }
        }
      } finally {
        callbackSubscription.remove();
      }

      if (!callbackUrl) {
        await clearPendingAuthorization();
        setError("Giriş tamamlanmadı. Lütfen yeniden deneyin.");
        setStatus("unauthenticated");
        return;
      }

      await completeAuthorizationCallback(callbackUrl);
      setError(null);
      setStatus("authenticated");
    } catch (signInError: unknown) {
      await clearPendingAuthorization().catch(() => undefined);
      setError(toFriendlyAuthError(signInError));
      setStatus("unauthenticated");
    }
  }, [
    authConfig.clientId,
    authConfig.scopes,
    completeAuthorizationCallback,
    configured,
    discovery,
    redirectUri
  ]);

  const signOut = useCallback(async () => {
    if (runtimeConfig.authMode === "pilot") {
      setError(null);
      setStatus("authenticated");
      return;
    }
    const session = await getSession();
    let remoteDiscovery: AuthSession.DiscoveryDocument | null = null;
    if (runtimeConfig.authMode === "oauth") {
      remoteDiscovery = await revokeCurrentSession().catch(() => null);
    }
    await Promise.all([clearSession(), clearPendingAuthorization()]);
    setError(null);
    setStatus(
      runtimeConfig.authMode === "preview" ? "preview" : "unauthenticated"
    );
    if (
      runtimeConfig.authMode === "oauth" &&
      remoteDiscovery?.endSessionEndpoint
    ) {
      const logout = new URL(remoteDiscovery.endSessionEndpoint);
      logout.searchParams.set("client_id", authConfig.clientId);
      if (session?.idToken) {
        logout.searchParams.set("id_token_hint", session.idToken);
      }
      logout.searchParams.set("post_logout_redirect_uri", nativeLogoutUri);
      await WebBrowser.openAuthSessionAsync(
        logout.href,
        nativeLogoutUri,
        getOAuthBrowserOptions(Platform.OS)
      ).catch(() => undefined);
    }
  }, [authConfig.clientId]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, error, signIn, signOut }),
    [error, signIn, signOut, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return value;
}
