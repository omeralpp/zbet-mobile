import { runtimeConfig } from "@/src/config/runtime";
import { createHttpMobileApi } from "./http-mobile-api";
import { mockMobileApi } from "./mock-mobile-api";
import { withSyntheticIntelligence } from "./synthetic-intelligence";
import type { MobileApi } from "./mobile-api";

if (!runtimeConfig.useMocks && !runtimeConfig.mobileApiUrl) {
  throw new Error(
    "EXPO_PUBLIC_MOBILE_API_URL is required when mock mode is disabled."
  );
}

/**
 * Preview builds are mock-backed throughout, and their fixtures already key the
 * M15 states off the mock match ids so one session covers the whole matrix.
 * Only a real-API build needs the synthetic wrapper, and only when the build
 * explicitly asked for it.
 */
function resolveMobileApi(): MobileApi {
  if (runtimeConfig.useMocks) {
    return mockMobileApi;
  }
  const httpApi = createHttpMobileApi(runtimeConfig.mobileApiUrl);
  return withSyntheticIntelligence(httpApi, {
    teamForm: runtimeConfig.teamFormIntelligence === "SYNTHETIC",
    matchPath: runtimeConfig.mobileIntelligence === "SYNTHETIC",
    jinxOutlook: runtimeConfig.mobileIntelligence === "SYNTHETIC"
  });
}

export const mobileApi: MobileApi = resolveMobileApi();
