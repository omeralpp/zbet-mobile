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

type PendingOAuthCallback = {
  state: string;
  codeVerifier: string;
  redirectUri: string;
};

export type ParsedOAuthCallback =
  | {
      type: "success";
      code: string;
      codeVerifier: string;
    }
  | {
      type: "error";
      error: string;
      description?: string;
    };

const allowedParameters = new Set([
  "code",
  "state",
  "error",
  "error_description",
  "iss"
]);

function normalizedIssuer(value: string): string | null {
  try {
    const issuer = new URL(value);
    if (
      issuer.protocol !== "https:" ||
      issuer.username ||
      issuer.password ||
      issuer.search ||
      issuer.hash
    ) {
      return null;
    }
    return issuer.href.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function parseOAuthCallback(
  candidateUrl: string,
  pending: PendingOAuthCallback,
  nativeReturnUri: string,
  expectedIssuer: string
): ParsedOAuthCallback {
  if (
    !isOAuthCallbackUrl(candidateUrl, pending.redirectUri, nativeReturnUri)
  ) {
    throw new Error("OAuth callback adresi doğrulanamadı.");
  }

  const parsed = new URL(candidateUrl);
  const names = [...parsed.searchParams.keys()];
  if (
    names.some(
      (name) =>
        !allowedParameters.has(name) ||
        parsed.searchParams.getAll(name).length !== 1
    )
  ) {
    throw new Error("OAuth callback parametreleri geçerli değil.");
  }

  const values = [...parsed.searchParams.values()];
  if (values.some((value) => value.length > 2048 || /[\r\n]/.test(value))) {
    throw new Error("OAuth callback parametreleri geçerli değil.");
  }

  const state = parsed.searchParams.get("state");
  if (!state || state !== pending.state) {
    throw new Error("OAuth state doğrulaması başarısız.");
  }

  const issuer = parsed.searchParams.get("iss");
  const normalizedExpectedIssuer = normalizedIssuer(expectedIssuer);
  if (
    !issuer ||
    !normalizedExpectedIssuer ||
    normalizedIssuer(issuer) !== normalizedExpectedIssuer
  ) {
    throw new Error("OAuth issuer doğrulaması başarısız.");
  }

  const code = parsed.searchParams.get("code");
  const error = parsed.searchParams.get("error");
  if (error && !code) {
    return {
      type: "error",
      error,
      ...(parsed.searchParams.get("error_description")
        ? { description: parsed.searchParams.get("error_description")! }
        : {})
    };
  }
  if (!code || error) {
    throw new Error("OAuth callback yanıtı tamamlanmamış.");
  }

  return {
    type: "success",
    code,
    codeVerifier: pending.codeVerifier
  };
}
