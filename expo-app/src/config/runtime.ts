import Constants from "expo-constants";

type RuntimeExtra = {
  mobileApiUrl?: string;
  authMode?: "preview" | "pilot" | "oauth";
  pilotAccessKey?: string;
  useMocks?: boolean;
  authClientId?: string;
  authIssuer?: string;
  authAuthorizationEndpoint?: string;
  authTokenEndpoint?: string;
  authRedirectUri?: string;
  authRevocationEndpoint?: string;
  authEndSessionEndpoint?: string;
  authScopes?: string;
  legacyLaunchpadUrl?: string;
  sapWebAllowedHosts?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as RuntimeExtra;

export const runtimeConfig = {
  mobileApiUrl: String(extra.mobileApiUrl ?? "").replace(/\/+$/, ""),
  authMode: extra.authMode ?? (extra.useMocks === false ? "oauth" : "preview"),
  pilotAccessKey: String(extra.pilotAccessKey ?? ""),
  useMocks: extra.useMocks !== false,
  auth: {
    clientId: String(extra.authClientId ?? ""),
    issuer: String(extra.authIssuer ?? ""),
    authorizationEndpoint: String(extra.authAuthorizationEndpoint ?? ""),
    tokenEndpoint: String(extra.authTokenEndpoint ?? ""),
    redirectUri: String(extra.authRedirectUri ?? ""),
    revocationEndpoint: String(extra.authRevocationEndpoint ?? ""),
    endSessionEndpoint: String(extra.authEndSessionEndpoint ?? ""),
    scopes: String(
      extra.authScopes ?? "openid offline_access mobile.read mobile.device.write"
    )
      .split(/[\s,]+/)
      .filter(Boolean)
  },
  legacyLaunchpadUrl: String(extra.legacyLaunchpadUrl ?? ""),
  sapWebAllowedHosts: String(extra.sapWebAllowedHosts ?? "")
} as const;
