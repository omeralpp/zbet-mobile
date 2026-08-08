import * as AuthSession from "expo-auth-session";
import { runtimeConfig } from "@/src/config/runtime";
import { resolveOidcDiscovery } from "./oidc-discovery";

let discoveryPromise: Promise<AuthSession.DiscoveryDocument> | null = null;

export function getOidcDiscovery(): Promise<AuthSession.DiscoveryDocument> {
  if (!discoveryPromise) {
    discoveryPromise = resolveOidcDiscovery(
      runtimeConfig.auth,
      AuthSession.fetchDiscoveryAsync
    )
      .then((document) => document as AuthSession.DiscoveryDocument)
      .catch((error) => {
        discoveryPromise = null;
        throw error;
      });
  }
  return discoveryPromise;
}
