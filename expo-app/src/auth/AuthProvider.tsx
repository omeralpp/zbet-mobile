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
import * as WebBrowser from "expo-web-browser";
import { runtimeConfig } from "@/src/config/runtime";
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
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: authConfig.clientId || "preview-not-configured",
      scopes: [...authConfig.scopes],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true
    },
    discovery
  );

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

  useEffect(() => {
    let cancelled = false;

    async function handleAuthorizationResponse() {
      // Defer response handling out of the effect setup phase.
      await Promise.resolve();
      if (cancelled || !response) {
        return;
      }

      if (response?.type === "error") {
        setError(response.error?.message ?? "Oturum açılamadı.");
        setStatus("unauthenticated");
        return;
      }

      if (
        response.type !== "success" ||
        !response.params.code ||
        !request?.codeVerifier ||
        !discovery
      ) {
        return;
      }

      setStatus("loading");
      try {
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
        if (cancelled) {
          return;
        }
        setError(null);
        setStatus("authenticated");
      } catch (exchangeError: unknown) {
        if (cancelled) {
          return;
        }
        setError(
          exchangeError instanceof Error
            ? exchangeError.message
            : "Token değişimi tamamlanamadı."
        );
        setStatus("unauthenticated");
      }
    }

    handleAuthorizationResponse().catch((authorizationError: unknown) => {
      if (!cancelled) {
        setError(
          authorizationError instanceof Error
            ? authorizationError.message
            : "Oturum yanıtı işlenemedi."
        );
        setStatus("unauthenticated");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    authConfig.clientId,
    discovery,
    redirectUri,
    request?.codeVerifier,
    response
  ]);

  const signIn = useCallback(async () => {
    if (runtimeConfig.useMocks) {
      setStatus("preview");
      return;
    }
    if (!configured || !request) {
      setError("Mobil OAuth yapılandırması hazır değil.");
      setStatus(configured ? "unauthenticated" : "configuration-error");
      return;
    }
    setError(null);
    try {
      await promptAsync();
    } catch (promptError: unknown) {
      setError(
        promptError instanceof Error
          ? promptError.message
          : "Güvenli giriş ekranı açılamadı."
      );
      setStatus("unauthenticated");
    }
  }, [configured, promptAsync, request]);

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
