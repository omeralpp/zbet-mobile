import assert from "node:assert/strict";
import test from "node:test";
import { getTeamLogoUrl } from "./team-logo";

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
