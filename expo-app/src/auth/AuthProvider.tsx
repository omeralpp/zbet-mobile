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
import { isOAuthCallbackUrl } from "./oauth-callback";
import {
  clearSession,
  getSession,
  saveSession,
  type SessionTokens
} from "./session-store";

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
const callbackGraceMs = 1000;

function sessionFromTokenResponse(
  token: AuthSession.TokenResponse,
  fallbackRefreshToken?: string
): SessionTokens {
  const issuedAt = token.issuedAt ?? AuthSession.getCurrentTimeInSeconds();
  const expiresAt = token.expiresIn ? issuedAt + token.expiresIn : undefined;
  const refreshToken = token.refreshToken ?? fallbackRefreshToken;

  return {
    accessToken: token.accessToken,
    ...(refreshToken ? { refreshToken } : {}),
    ...(token.tokenType ? { tokenType: token.tokenType } : {}),
    ...(expiresAt ? { expiresAt } : {})
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const authConfig = runtimeConfig.auth;
  const configured = Boolean(
    authConfig.clientId &&
      authConfig.authorizationEndpoint &&
      authConfig.tokenEndpoint
  );
  const discovery = useMemo<AuthSession.DiscoveryDocument | null>(
    () =>
      configured
        ? {
            authorizationEndpoint: authConfig.authorizationEndpoint,
            tokenEndpoint: authConfig.tokenEndpoint,
            ...(authConfig.revocationEndpoint
              ? { revocationEndpoint: authConfig.revocationEndpoint }
              : {})
          }
        : null,
    [
      authConfig.authorizationEndpoint,
      authConfig.revocationEndpoint,
      authConfig.tokenEndpoint,
      configured
    ]
  );
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

    async function bootstrap() {
      if (runtimeConfig.useMocks) {
        setStatus("preview");
        return;
      }
      if (!configured || !discovery) {
        setStatus("configuration-error");
        setError("Mobil OAuth endpointleri henüz yapılandırılmadı.");
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
          sessionFromTokenResponse(refreshed, stored.refreshToken)
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
    configured,
    discovery
  ]);

  const signIn = useCallback(async () => {
    if (runtimeConfig.useMocks) {
      setStatus("preview");
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
        usePKCE: true
      });
      const authorizationUrl = await request.makeAuthUrlAsync(discovery);
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
        setError("Giriş tamamlanmadı. Lütfen yeniden deneyin.");
        setStatus("unauthenticated");
        return;
      }

      const response = request.parseReturnUrl(callbackUrl);
      if (response.type !== "success") {
        setError(
          response.type === "error"
            ? toFriendlyAuthError(response.error)
            : "Kimlik sağlayıcısı oturumu tamamlamadı."
        );
        setStatus("unauthenticated");
        return;
      }
      if (!response.params.code || !request.codeVerifier) {
        setError("Kimlik sağlayıcısı geçerli bir yetkilendirme kodu döndürmedi.");
        setStatus("unauthenticated");
        return;
      }

      const token = await AuthSession.exchangeCodeAsync(
        {
          clientId: authConfig.clientId,
          code: response.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier
          }
        },
        discovery
      );
      await saveSession(sessionFromTokenResponse(token));
      setError(null);
      setStatus("authenticated");
    } catch (signInError: unknown) {
      setError(toFriendlyAuthError(signInError));
      setStatus("unauthenticated");
    }
  }, [
    authConfig.clientId,
    authConfig.scopes,
    configured,
    discovery,
    redirectUri
  ]);

  const signOut = useCallback(async () => {
    await clearSession();
    setError(null);
    setStatus(runtimeConfig.useMocks ? "preview" : "unauthenticated");
  }, []);

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
