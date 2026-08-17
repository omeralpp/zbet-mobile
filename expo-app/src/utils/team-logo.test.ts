import assert from "node:assert/strict";
import test from "node:test";
import {
  getTeamLogoUrl,
  hasAnyTeamLogo,
  resolveTeamLogoSize,
  teamLogoSizes,
  isProviderPlaceholderLogo
} from "./team-logo";

test("builds the exact Bilyoner CDN logo URL for a valid participant ID", () => {
  assert.equal(
    getTeamLogoUrl("954"),
    "https://content.bilyoner.com/assets/participant/954.png"
  );
  assert.equal(
    getTeamLogoUrl("100021"),
    "https://content.bilyoner.com/assets/participant/100021.png"
  );
});

test("trims incidental whitespace before building the URL", () => {
  assert.equal(
    getTeamLogoUrl(" 227 "),
    "https://content.bilyoner.com/assets/participant/227.png"
  );
});

test("returns a deterministic null fallback for null, undefined, and empty IDs", () => {
  assert.equal(getTeamLogoUrl(null), null);
  assert.equal(getTeamLogoUrl(undefined), null);
  assert.equal(getTeamLogoUrl(""), null);
  assert.equal(getTeamLogoUrl("   "), null);
});

test("rejects non-string and malformed participant ID representations", () => {
  assert.equal(getTeamLogoUrl(123 as unknown as string), null);
  assert.equal(getTeamLogoUrl("has space"), null);
  assert.equal(getTeamLogoUrl("../escape"), null);
  assert.equal(getTeamLogoUrl("a".repeat(33)), null);
});

test("never infers a URL from a team name", () => {
  assert.equal(getTeamLogoUrl("Paris Saint-Germain" as unknown as string), null);
});

test("keeps one ascending identity scale for every surface", () => {
  assert.deepEqual(teamLogoSizes, { compact: 18, standard: 24, hero: 40 });
  assert.ok(teamLogoSizes.compact < teamLogoSizes.standard);
  assert.ok(teamLogoSizes.standard < teamLogoSizes.hero);
});

test("resolves each named size and defaults to standard", () => {
  assert.equal(resolveTeamLogoSize("compact"), 18);
  assert.equal(resolveTeamLogoSize("standard"), 24);
  assert.equal(resolveTeamLogoSize("hero"), 40);
  assert.equal(resolveTeamLogoSize(undefined), 24);
});

test("detects whether any side of a match has a usable identity", () => {
  assert.equal(hasAnyTeamLogo("100021", "100022"), true);
  assert.equal(hasAnyTeamLogo(null, "100022"), true);
  assert.equal(hasAnyTeamLogo("100021", null), true);
  assert.equal(hasAnyTeamLogo(null, null), false);
  assert.equal(hasAnyTeamLogo(undefined, ""), false);
  assert.equal(hasAnyTeamLogo("has space", null), false);
});

/* ---------------------------------------------------------------- *
 * Provider placeholder detection
 *
 * Measured 2026-08-17: the crest CDN answers 200 for unknown participants with
 * a byte-identical 128x128 WEBP; real crests are PNG with height 64.
 * ---------------------------------------------------------------- */

test("the provider placeholder geometry is detected", () => {
  assert.equal(isProviderPlaceholderLogo(128, 128), true);
});

test("real crest geometries are never treated as the placeholder", () => {
  // Observed real crests: 64x64 (most) and 49x64 (narrow badge).
  assert.equal(isProviderPlaceholderLogo(64, 64), false);
  assert.equal(isProviderPlaceholderLogo(49, 64), false);
  assert.equal(isProviderPlaceholderLogo(128, 64), false);
  assert.equal(isProviderPlaceholderLogo(64, 128), false);
  assert.equal(isProviderPlaceholderLogo(256, 256), false);
});

test("absent dimensions never trigger the placeholder path", () => {
  assert.equal(isProviderPlaceholderLogo(undefined, undefined), false);
  assert.equal(isProviderPlaceholderLogo(null, null), false);
  assert.equal(isProviderPlaceholderLogo(0, 0), false);
  assert.equal(isProviderPlaceholderLogo(128, undefined), false);
});

test("a valid participant still yields a real crest URL", () => {
  // Detection must not change URL construction for real participants.
  assert.equal(
    getTeamLogoUrl("954"),
    "https://content.bilyoner.com/assets/participant/954.png"
  );
});

test("missing or invalid participant ids yield no URL, so the fallback renders", () => {
  for (const id of [null, undefined, "", "   ", "bad id", "../x", "a".repeat(40)]) {
    assert.equal(getTeamLogoUrl(id as string | null | undefined), null);
  }
});
