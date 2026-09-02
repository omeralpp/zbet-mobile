import type { ExpoConfig, ConfigContext } from "expo/config";
import {
  btbAdaptiveIconBackground,
  btbAdaptiveIconForegroundPath,
  btbBrandMarkPath
} from "./src/theme/brand.ts";
import {
  productionOAuthRedirectUri,
  resolveMobileAuthMode,
  validateNoPublicOAuthSecrets,
  validateOAuthPublicConfiguration
} from "./src/config/auth-mode.ts";
import { resolveMobileIntelligenceMode, resolveTeamFormMode } from "./src/config/mobile-intelligence.ts";

const previewPackage = "com.btb.mobile.next";

export default function resolveAppConfig({
  config
}: ConfigContext): ExpoConfig {
  const googleServicesFile = process.env.BTB_GOOGLE_SERVICES_FILE;
  const pilotAccessKey =
    process.env.EXPO_PUBLIC_MOBILE_PILOT_KEY?.trim() ?? "";
  const useMocks = process.env.EXPO_PUBLIC_USE_MOCKS !== "false";
  // M15 Mobile Intelligence Foundation surfaces.
  //
  // Off, fixture-backed, or BFF-backed. Declared here rather than inferred at
  // runtime so a build always states where these numbers came from.
  const mobileIntelligence = resolveMobileIntelligenceMode({
    useMocks,
    configured: process.env.EXPO_PUBLIC_MOBILE_INTELLIGENCE
  });
  const teamFormIntelligence = resolveTeamFormMode({
    useMocks,
    inherited: mobileIntelligence,
    configured: process.env.EXPO_PUBLIC_TEAM_FORM_INTELLIGENCE
  });
  const mobileAuthMode = resolveMobileAuthMode({
    useMocks,
    configuredMode: process.env.EXPO_PUBLIC_MOBILE_AUTH_MODE,
    pilotAccessKey
  });
  const usesPilotAccess = mobileAuthMode === "pilot";
  const usesOAuth = mobileAuthMode === "oauth";
  const oauthScopes =
    process.env.EXPO_PUBLIC_AUTH_SCOPES ??
    "openid offline_access mobile.read mobile.device.write";
  const oauthPublicConfiguration = {
    clientId: process.env.EXPO_PUBLIC_AUTH_CLIENT_ID ?? "",
    issuer: process.env.EXPO_PUBLIC_AUTH_ISSUER ?? "",
    authorizationEndpoint:
      process.env.EXPO_PUBLIC_AUTH_AUTHORIZATION_ENDPOINT ?? "",
    tokenEndpoint: process.env.EXPO_PUBLIC_AUTH_TOKEN_ENDPOINT ?? "",
    revocationEndpoint:
      process.env.EXPO_PUBLIC_AUTH_REVOCATION_ENDPOINT ?? "",
    endSessionEndpoint:
      process.env.EXPO_PUBLIC_AUTH_END_SESSION_ENDPOINT ?? "",
    redirectUri:
      process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI ??
      productionOAuthRedirectUri,
    scopes: oauthScopes
  };

  if (usesOAuth) {
    validateNoPublicOAuthSecrets(process.env);
    validateOAuthPublicConfiguration(oauthPublicConfiguration);
  }

  return {
  ...config,
  name: "BTB Mobile Next",
  slug: "btb-mobile-next",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  scheme: "btbmobile",
  icon: btbBrandMarkPath,
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-notifications",
      {
        color: "#1597E5",
        sounds: [
          "./assets/sounds/btb_super_goal.wav",
          "./assets/sounds/btb_referee_whistle.wav"
        ]
      }
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#04101E",
        android: {
          drawable: {
            icon: "./assets/splash-transparent.xml"
          }
        }
      }
    ]
  ],
  android: {
    package: previewPackage,
    adaptiveIcon: {
      foregroundImage: btbAdaptiveIconForegroundPath,
      backgroundColor: btbAdaptiveIconBackground
    },
    ...(googleServicesFile ? { googleServicesFile } : {}),
    predictiveBackGestureEnabled: false,
    permissions: ["android.permission.POST_NOTIFICATIONS"],
    intentFilters: usesPilotAccess
      ? []
      : [
          {
            action: "VIEW",
            autoVerify: true,
            data: [
              {
                scheme: "https",
                host: "api.surklase.com",
                pathPrefix: "/auth/callback"
              }
            ],
            category: ["BROWSABLE", "DEFAULT"]
          },
          {
            action: "VIEW",
            autoVerify: false,
            data: [
              {
                scheme: "btbmobile"
              }
            ],
            category: ["BROWSABLE", "DEFAULT"]
          }
        ]
  },
  ios: {
    bundleIdentifier: previewPackage,
    supportsTablet: true
  },
  experiments: {
    typedRoutes: true
  },
  extra: {
    mobileApiUrl: process.env.EXPO_PUBLIC_MOBILE_API_URL ?? "",
    authMode: mobileAuthMode,
    pilotAccessKey: usesPilotAccess ? pilotAccessKey : "",
    useMocks,
    mobileIntelligence,
    teamFormIntelligence,
    authClientId: usesOAuth ? oauthPublicConfiguration.clientId : "",
    authIssuer: usesOAuth ? oauthPublicConfiguration.issuer : "",
    authAuthorizationEndpoint:
      usesOAuth ? oauthPublicConfiguration.authorizationEndpoint : "",
    authTokenEndpoint: usesOAuth ? oauthPublicConfiguration.tokenEndpoint : "",
    authRedirectUri:
      usesOAuth ? oauthPublicConfiguration.redirectUri : "",
    authRevocationEndpoint:
      !usesOAuth
        ? ""
        : process.env.EXPO_PUBLIC_AUTH_REVOCATION_ENDPOINT ?? "",
    authEndSessionEndpoint:
      !usesOAuth
        ? ""
        : process.env.EXPO_PUBLIC_AUTH_END_SESSION_ENDPOINT ?? "",
    authScopes:
      !usesOAuth
        ? ""
        : oauthScopes,
    legacyLaunchpadUrl:
      process.env.EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL ?? "",
    sapWebAllowedHosts:
      process.env.EXPO_PUBLIC_SAP_WEB_ALLOWED_HOSTS ??
      "*.hana.ondemand.com,*.accounts.ondemand.com,*.trial-accounts.ondemand.com"
  }
  };
}
