export function buildDeviceRegistrationPayload(
  token: string,
  platform: "android" | "ios",
  installationId?: string
): {
  token: string;
  platform: "android" | "ios";
  installationId?: string;
} {
  return {
    token,
    platform,
    ...(installationId ? { installationId } : {})
  };
}
