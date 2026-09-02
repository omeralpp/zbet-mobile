/**
 * How the M15 Mobile Intelligence surfaces get their data.
 *
 * Three states rather than a boolean, because "show them" and "where do the
 * numbers come from" are separate questions and collapsing them is how a build
 * ends up quietly serving invented data as though it were measured.
 *
 *   OFF        The surfaces are not mounted at all. A build whose BFF does not
 *              serve these routes shows no slot for them, rather than three
 *              cards that can only ever report being unavailable.
 *   SYNTHETIC  The surfaces are mounted and the three M15 routes are served
 *              from the built-in fixtures. Every other screen still uses the
 *              real API. The payloads declare `origin: SYNTHETIC` and each card
 *              carries a visible sample-data badge, so this can be reviewed on
 *              a real device without anything passing as evidence.
 *   LIVE       The surfaces are mounted and the routes are requested from the
 *              BFF. Correct only once the BFF actually publishes them.
 *
 * The mode is declared at build time and never inferred at runtime. In
 * particular there is no "fall back to fixtures when the route 404s": a
 * fallback like that would make the data source depend on a network result, so
 * a temporary outage could silently swap measured data for invented data.
 */

export type MobileIntelligenceMode = "OFF" | "SYNTHETIC" | "LIVE";

/**
 * Resolves the mode from the build environment.
 *
 * An unrecognised value throws rather than degrading to OFF. A typo in a build
 * script should stop the build, not produce an app that silently omits the
 * feature the build was meant to ship.
 */
export function resolveMobileIntelligenceMode({
  useMocks,
  configured
}: {
  useMocks: boolean;
  configured?: string | undefined;
}): MobileIntelligenceMode {
  const value = configured?.trim().toLowerCase();

  if (!value) {
    // Preview builds are entirely mock-backed already, so the surfaces are on
    // by default there and off anywhere the owner has not asked for them.
    return useMocks ? "SYNTHETIC" : "OFF";
  }

  if (value === "off" || value === "false") {
    return "OFF";
  }
  if (value === "synthetic") {
    return "SYNTHETIC";
  }
  if (value === "live" || value === "true") {
    return "LIVE";
  }

  throw new Error(
    "EXPO_PUBLIC_MOBILE_INTELLIGENCE must be one of: off, synthetic, live."
  );
}

/** Whether the surfaces are rendered at all. */
export function mountsIntelligenceSurfaces(
  mode: MobileIntelligenceMode
): boolean {
  return mode !== "OFF";
}
