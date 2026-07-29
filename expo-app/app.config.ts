import type { ExpoConfig, ConfigContext } from "expo/config";

const previewPackage = "com.btb.mobile.next";
const googleServicesFile = process.env.BTB_GOOGLE_SERVICES_FILE;
const pilotAccessKey =
  process.env.EXPO_PUBLIC_MOBILE_PILOT_KEY?.trim() ?? "";
const usesPilotAccess = Boolean(pilotAccessKey);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "BTB Mobile Next",
  slug: "btb-mobile-next",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  scheme: "btbmobile",
  icon: "./assets/icon.png",
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
        image: "./assets/splash.png",
        imageWidth: 220,
        resizeMode: "contain"
      }
    ]
  ],
  android: {
    package: previewPackage,
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#04101E"
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
    pilotAccessKey,
    useMocks: process.env.EXPO_PUBLIC_USE_MOCKS !== "false",
    authClientId: usesPilotAccess
      ? ""
      : process.env.EXPO_PUBLIC_AUTH_CLIENT_ID ?? "",
    authAuthorizationEndpoint:
      usesPilotAccess
        ? ""
        : process.env.EXPO_PUBLIC_AUTH_AUTHORIZATION_ENDPOINT ?? "",
    authTokenEndpoint: usesPilotAccess
      ? ""
      : process.env.EXPO_PUBLIC_AUTH_TOKEN_ENDPOINT ?? "",
    authRedirectUri:
      usesPilotAccess
        ? ""
        : process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI ??
          "https://api.surklase.com/auth/callback",
    authRevocationEndpoint:
      usesPilotAccess
        ? ""
        : process.env.EXPO_PUBLIC_AUTH_REVOCATION_ENDPOINT ?? "",
    authScopes:
      usesPilotAccess
        ? ""
        : process.env.EXPO_PUBLIC_AUTH_SCOPES ??
          "openid profile email groups offline_access",
    legacyLaunchpadUrl:
      process.env.EXPO_PUBLIC_LEGACY_LAUNCHPAD_URL ??
      "https://188b143btrial.launchpad.cfapps.us10.hana.ondemand.com/site?siteId=b38042ce-b8ab-4fea-a892-abf4c58a170f"
  }
});
