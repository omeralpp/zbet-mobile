type OAuthBrowserOptions = {
  useProxyActivity?: boolean;
};

export function getOAuthBrowserOptions(
  platform: string
): OAuthBrowserOptions {
  if (platform === "android") {
    return {
      useProxyActivity: false
    };
  }

  return {};
}
