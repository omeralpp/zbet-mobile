import assert from "node:assert/strict";
import test from "node:test";
import { parseThemeMode } from "./theme-preference";

test("keeps dark as the safe default and accepts the explicit light preference", () => {
  assert.equal(parseThemeMode(null), "dark");
  assert.equal(parseThemeMode("dark"), "dark");
  assert.equal(parseThemeMode("unknown"), "dark");
  assert.equal(parseThemeMode("light"), "light");
});
