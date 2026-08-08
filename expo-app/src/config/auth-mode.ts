export type MobileAuthMode = "preview" | "pilot" | "oauth";

type AuthModeOptions = {
  useMocks: boolean;
  configuredMode?: string | undefined;
  pilotAccessKey?: string | undefined;
};

type OAuthPublicConfiguration = {
  clientId?: string | undefined;
  issuer?: string | undefined;
  authorizationEndpoint?: string | undefined;
  tokenEndpoint?: string | undefined;
  revocationEndpoint?: string | undefined;
  endSessionEndpoint?: string | undefined;
  redirectUri?: string | undefined;
  scopes?: string | undefined;
};

export const productionOAuthRedirectUri =
  "https://api.surklase.com/auth/callback";

const requiredOAuthScopes = ["openid", "offline_access"] as const;

function isHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.hash
    );
  } catch {
    return false;
  }
}

export function resolveMobileAuthMode({
  useMocks,
  configuredMode,
  pilotAccessKey
}: AuthModeOptions): MobileAuthMode {
  const requestedMode = String(configuredMode ?? "")
    .trim()
    .toLowerCase();
  const mode = (requestedMode || (useMocks ? "preview" : "oauth")) as
    | MobileAuthMode
    | string;
  const pilotKey = String(pilotAccessKey ?? "").trim();

  if (!new Set(["preview", "pilot", "oauth"]).has(mode)) {
    throw new Error(
      "EXPO_PUBLIC_MOBILE_AUTH_MODE must be preview, pilot, or oauth."
    );
  }
  if (useMocks !== (mode === "preview")) {
    throw new Error(
      "Preview authentication is allowed only when EXPO_PUBLIC_USE_MOCKS=true."
    );
  }
  if (mode === "pilot") {
    if (pilotKey.length < 32 || /[\r\n]/.test(pilotKey)) {
      throw new Error(
        "Pilot authentication requires a valid EXPO_PUBLIC_MOBILE_PILOT_KEY."
      );
    }
  } else if (pilotKey) {
    throw new Error(
      "Pilot access keys are forbidden outside the explicit pilot profile."
    );
  }

  return mode as MobileAuthMode;
}

export function validateOAuthPublicConfiguration({
  clientId,
  issuer,
  authorizationEndpoint,
  tokenEndpoint,
  revocationEndpoint,
  endSessionEndpoint,
  redirectUri,
  scopes
}: OAuthPublicConfiguration): void {
  if (!String(clientId ?? "").trim()) {
    throw new Error("OAuth mode requires EXPO_PUBLIC_AUTH_CLIENT_ID.");
  }

  for (const [name, value] of [
    ["EXPO_PUBLIC_AUTH_ISSUER", issuer],
    ["EXPO_PUBLIC_AUTH_REDIRECT_URI", redirectUri]
  ] as const) {
    if (!isHttpsUrl(String(value ?? "").trim())) {
      throw new Error(`${name} must be a credential-free HTTPS URL.`);
    }
  }

  const hasAuthorizationEndpoint = Boolean(String(authorizationEndpoint ?? "").trim());
  const hasTokenEndpoint = Boolean(String(tokenEndpoint ?? "").trim());
  if (hasAuthorizationEndpoint !== hasTokenEndpoint) {
    throw new Error(
      "OAuth endpoint overrides must provide both authorization and token endpoints."
    );
  }
  if (hasAuthorizationEndpoint) {
    for (const [name, value] of [
      ["EXPO_PUBLIC_AUTH_AUTHORIZATION_ENDPOINT", authorizationEndpoint],
      ["EXPO_PUBLIC_AUTH_TOKEN_ENDPOINT", tokenEndpoint]
    ] as const) {
      if (!isHttpsUrl(String(value ?? "").trim())) {
        throw new Error(`${name} must be a credential-free HTTPS URL.`);
      }
    }
  }
  for (const [name, value] of [
    ["EXPO_PUBLIC_AUTH_REVOCATION_ENDPOINT", revocationEndpoint],
    ["EXPO_PUBLIC_AUTH_END_SESSION_ENDPOINT", endSessionEndpoint]
  ] as const) {
    if (String(value ?? "").trim() && !isHttpsUrl(String(value).trim())) {
      throw new Error(`${name} must be a credential-free HTTPS URL.`);
    }
  }

  if (new URL(String(redirectUri)).href !== productionOAuthRedirectUri) {
    throw new Error(
      `EXPO_PUBLIC_AUTH_REDIRECT_URI must match the Android App Link: ${productionOAuthRedirectUri}`
    );
  }

  const configuredScopes = new Set(
    String(scopes ?? "")
      .split(/[\s,]+/)
      .filter(Boolean)
  );
  for (const scope of requiredOAuthScopes) {
    if (!configuredScopes.has(scope)) {
      throw new Error(
        `EXPO_PUBLIC_AUTH_SCOPES must include ${requiredOAuthScopes.join(" and ")}.`
      );
    }
  }
}

export function validateNoPublicOAuthSecrets(
  environment: Record<string, string | undefined>
): void {
  const forbiddenName = Object.keys(environment).find(
    (name) =>
      /^EXPO_PUBLIC_AUTH_.*(?:SECRET|PASSWORD|PRIVATE_KEY|CREDENTIAL)/i.test(
        name
      ) && Boolean(environment[name]?.trim())
  );

  if (forbiddenName) {
    throw new Error(`${forbiddenName} is forbidden in a public mobile build.`);
  }
}
