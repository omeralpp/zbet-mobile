import assert from "node:assert/strict";
import test from "node:test";
import { resolveOidcDiscovery } from "./oidc-discovery";

const base = {
  issuer: "https://auth.example.test/realms/btb",
  authorizationEndpoint: "",
  tokenEndpoint: "",
  revocationEndpoint: "",
  endSessionEndpoint: ""
};

test("resolves provider-neutral OIDC endpoints from discovery", async () => {
  const result = await resolveOidcDiscovery(base, async () => ({
    discoveryDocument: {
      issuer: base.issuer,
      authorization_endpoint: `${base.issuer}/protocol/openid-connect/auth`,
      token_endpoint: `${base.issuer}/protocol/openid-connect/token`
    },
    authorizationEndpoint: `${base.issuer}/protocol/openid-connect/auth`,
    tokenEndpoint: `${base.issuer}/protocol/openid-connect/token`,
    revocationEndpoint: `${base.issuer}/protocol/openid-connect/revoke`,
    endSessionEndpoint: `${base.issuer}/protocol/openid-connect/logout`
  }));

  assert.match(result.authorizationEndpoint!, /open-id-connect|openid-connect/);
  assert.match(result.tokenEndpoint!, /token$/);
  assert.match(result.revocationEndpoint!, /revoke$/);
  assert.match(result.endSessionEndpoint!, /logout$/);
});

test("rejects discovery issuer mismatch and insecure endpoints", async () => {
  await assert.rejects(
    resolveOidcDiscovery(base, async () => ({
      discoveryDocument: {
        issuer: "https://attacker.example.test",
        authorization_endpoint: `${base.issuer}/auth`,
        token_endpoint: `${base.issuer}/token`
      },
      authorizationEndpoint: `${base.issuer}/auth`,
      tokenEndpoint: `${base.issuer}/token`
    })),
    /issuer/
  );
  await assert.rejects(
    resolveOidcDiscovery(base, async () => ({
      discoveryDocument: {
        issuer: base.issuer,
        authorization_endpoint: "http://auth.example.test/auth",
        token_endpoint: `${base.issuer}/token`
      },
      authorizationEndpoint: "http://auth.example.test/auth",
      tokenEndpoint: `${base.issuer}/token`
    })),
    /authorization_endpoint/
  );
});

test("keeps explicit endpoint overrides for providers without discovery", async () => {
  let fetched = false;
  const result = await resolveOidcDiscovery(
    {
      ...base,
      authorizationEndpoint: `${base.issuer}/authorize`,
      tokenEndpoint: `${base.issuer}/token`
    },
    async () => {
      fetched = true;
      throw new Error("must not fetch");
    }
  );
  assert.equal(fetched, false);
  assert.equal(result.tokenEndpoint, `${base.issuer}/token`);
});
