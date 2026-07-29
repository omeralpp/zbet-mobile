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
import { toFriendlyAuthError } from "./auth-error";
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
      const browserResult = await WebBrowser.openAuthSessionAsync(
        authorizationUrl,
        nativeReturnUri
      );

      if (browserResult.type !== "success") {
        setStatus("unauthenticated");
        return;
      }

      const response = request.parseReturnUrl(browserResult.url);
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
