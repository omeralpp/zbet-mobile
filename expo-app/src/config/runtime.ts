import Constants from "expo-constants";

type RuntimeExtra = {
  mobileApiUrl?: string;
  useMocks?: boolean;
  authClientId?: string;
  authAuthorizationEndpoint?: string;
  authTokenEndpoint?: string;
  authRedirectUri?: string;
  authRevocationEndpoint?: string;
  authScopes?: string;
  legacyLaunchpadUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as RuntimeExtra;

export const runtimeConfig = {
  mobileApiUrl: String(extra.mobileApiUrl ?? "").replace(/\/+$/, ""),
  useMocks: extra.useMocks !== false,
  auth: {
    clientId: String(extra.authClientId ?? ""),
    authorizationEndpoint: String(extra.authAuthorizationEndpoint ?? ""),
    tokenEndpoint: String(extra.authTokenEndpoint ?? ""),
    redirectUri: String(extra.authRedirectUri ?? ""),
    revocationEndpoint: String(extra.authRevocationEndpoint ?? ""),
    scopes: String(
      extra.authScopes ?? "openid profile email groups offline_access"
    )
      .split(/[\s,]+/)
      .filter(Boolean)
  },
  legacyLaunchpadUrl: String(extra.legacyLaunchpadUrl ?? "")
} as const;
