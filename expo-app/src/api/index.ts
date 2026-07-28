import { runtimeConfig } from "@/src/config/runtime";
import { createHttpMobileApi } from "./http-mobile-api";
import { mockMobileApi } from "./mock-mobile-api";
import type { MobileApi } from "./mobile-api";

if (!runtimeConfig.useMocks && !runtimeConfig.mobileApiUrl) {
  throw new Error(
    "EXPO_PUBLIC_MOBILE_API_URL is required when mock mode is disabled."
  );
}

export const mobileApi: MobileApi = runtimeConfig.useMocks
  ? mockMobileApi
  : createHttpMobileApi(runtimeConfig.mobileApiUrl);
