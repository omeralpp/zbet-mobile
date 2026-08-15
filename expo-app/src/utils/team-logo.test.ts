import assert from "node:assert/strict";
import test from "node:test";
import {
  getTeamLogoUrl,
  hasAnyTeamLogo,
  resolveTeamLogoSize,
  teamLogoSizes
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
