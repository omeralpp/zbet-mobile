export type PublicOidcConfiguration = {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint: string;
  endSessionEndpoint: string;
};

export type OidcDiscoveryDocument = {
  discoveryDocument?: { issuer?: string; [key: string]: unknown };
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  revocationEndpoint?: string;
  endSessionEndpoint?: string;
  [key: string]: unknown;
};

function normalizeIssuer(value: string): string {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error("OIDC issuer geçerli bir HTTPS adresi değil.");
  }
  return url.href.replace(/\/+$/, "");
}

function validateEndpoint(value: string, name: string): string {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new Error(`${name} geçerli bir HTTPS adresi değil.`);
  }
  return url.href;
}

export async function resolveOidcDiscovery(
  configuration: PublicOidcConfiguration,
  fetchDiscovery: (
    issuer: string
  ) => Promise<OidcDiscoveryDocument>
): Promise<OidcDiscoveryDocument> {
  const expectedIssuer = normalizeIssuer(configuration.issuer);
  const hasManualEndpoints = Boolean(
    configuration.authorizationEndpoint && configuration.tokenEndpoint
  );
  const discovered = hasManualEndpoints
    ? {
        authorizationEndpoint: configuration.authorizationEndpoint,
        tokenEndpoint: configuration.tokenEndpoint
      }
    : await fetchDiscovery(expectedIssuer);
  const metadataIssuer = String(
    discovered.discoveryDocument?.issuer || expectedIssuer
  );
  if (normalizeIssuer(metadataIssuer) !== expectedIssuer) {
    throw new Error("OIDC discovery issuer beklenen sağlayıcıyla eşleşmiyor.");
  }

  return {
    ...discovered,
    authorizationEndpoint: validateEndpoint(
      String(discovered.authorizationEndpoint || ""),
      "authorization_endpoint"
    ),
    tokenEndpoint: validateEndpoint(
      String(discovered.tokenEndpoint || ""),
      "token_endpoint"
    ),
    ...(configuration.revocationEndpoint
      ? {
          revocationEndpoint: validateEndpoint(
            configuration.revocationEndpoint,
            "revocation_endpoint"
          )
        }
      : discovered.revocationEndpoint
        ? {
            revocationEndpoint: validateEndpoint(
              discovered.revocationEndpoint,
              "revocation_endpoint"
            )
          }
        : {}),
    ...(configuration.endSessionEndpoint
      ? {
          endSessionEndpoint: validateEndpoint(
            configuration.endSessionEndpoint,
            "end_session_endpoint"
          )
        }
      : discovered.endSessionEndpoint
        ? {
            endSessionEndpoint: validateEndpoint(
              discovered.endSessionEndpoint,
              "end_session_endpoint"
            )
          }
        : {})
  };
}
