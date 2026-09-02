import Constants from "expo-constants";
import type { MobileIntelligenceMode } from "./mobile-intelligence";

type RuntimeExtra = {
  mobileApiUrl?: string;
  authMode?: "preview" | "pilot" | "oauth";
  pilotAccessKey?: string;
  useMocks?: boolean;
  mobileIntelligence?: MobileIntelligenceMode;
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
  /**
   * Where the M15 Mobile Intelligence surfaces get their data.
   *
   * Off unless the build says otherwise, so a build whose BFF does not serve
   * these routes keeps exactly the behaviour it has today.  serves
   * them from fixtures under a visible sample-data badge;  requests them
   * from the BFF.
   */
  mobileIntelligence: extra.mobileIntelligence ?? "OFF",
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
