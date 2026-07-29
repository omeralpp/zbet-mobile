function normalizeCallbackBase(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password) {
      return null;
    }

    const pathname = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.protocol.toLowerCase()}//${parsed.host.toLowerCase()}${pathname}`;
  } catch {
    return null;
  }
}

export function isOAuthCallbackUrl(
  candidateUrl: string,
  redirectUri: string,
  nativeReturnUri: string
): boolean {
  const candidate = normalizeCallbackBase(candidateUrl);
  if (!candidate) {
    return false;
  }

  return (
    candidate === normalizeCallbackBase(redirectUri) ||
    candidate === normalizeCallbackBase(nativeReturnUri)
  );
}
