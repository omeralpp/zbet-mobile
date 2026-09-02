import assert from "node:assert/strict";
import test from "node:test";
import {
  mountsIntelligenceSurfaces,
  resolveMobileIntelligenceMode,
  resolveTeamFormMode
} from "./mobile-intelligence";

test("Team Form inherits the existing build unless separately declared", () => {
  assert.equal(resolveTeamFormMode({ inherited: "SYNTHETIC", useMocks: false }), "SYNTHETIC");
  assert.equal(resolveTeamFormMode({ inherited: "OFF", useMocks: false, configured: " " }), "OFF");
});

test("Team Form can be LIVE while the other intelligence remains synthetic or off", () => {
  for (const inherited of ["SYNTHETIC", "OFF"] as const) {
    assert.equal(resolveTeamFormMode({ inherited, useMocks: false, configured: "live" }), "LIVE");
  }
  assert.equal(resolveTeamFormMode({ inherited: "SYNTHETIC", useMocks: false, configured: "off" }), "OFF");
});

test("a mock build cannot claim live Team Form and a typo cannot silently change origin", () => {
  assert.throws(() => resolveTeamFormMode({ inherited: "SYNTHETIC", useMocks: true, configured: "live" }), /USE_MOCKS=false/);
  assert.throws(() => resolveTeamFormMode({ inherited: "SYNTHETIC", useMocks: false, configured: "liev" }), /off, synthetic, live/);
});

test("a preview build shows the surfaces from fixtures by default", () => {
  assert.equal(
    resolveMobileIntelligenceMode({ useMocks: true, configured: undefined }),
    "SYNTHETIC"
  );
});

test("a real-API build hides them unless the build asks", () => {
  // A build whose BFF does not serve these routes must not request them.
  assert.equal(
    resolveMobileIntelligenceMode({ useMocks: false, configured: undefined }),
    "OFF"
  );
});

test("each mode can be named explicitly", () => {
  const cases: [string, string][] = [
    ["off", "OFF"],
    ["false", "OFF"],
    ["synthetic", "SYNTHETIC"],
    ["live", "LIVE"],
    ["true", "LIVE"]
  ];
  for (const [configured, expected] of cases) {
    assert.equal(
      resolveMobileIntelligenceMode({ useMocks: false, configured }),
      expected
    );
  }
});

test("an explicit mode overrides the preview default", () => {
  assert.equal(
    resolveMobileIntelligenceMode({ useMocks: true, configured: "off" }),
    "OFF"
  );
});

test("casing and stray whitespace do not change the answer", () => {
  assert.equal(
    resolveMobileIntelligenceMode({ useMocks: false, configured: " Synthetic " }),
    "SYNTHETIC"
  );
});

test("an empty value is the same as saying nothing", () => {
  assert.equal(
    resolveMobileIntelligenceMode({ useMocks: false, configured: "   " }),
    "OFF"
  );
});

test("an unrecognised value stops the build rather than degrading quietly", () => {
  // A typo in a build script should fail loudly, not ship an app that silently
  // omits the feature the build was meant to carry.
  assert.throws(
    () =>
      resolveMobileIntelligenceMode({ useMocks: false, configured: "sythetic" }),
    /off, synthetic, live/
  );
});

test("only OFF withholds the surfaces", () => {
  assert.equal(mountsIntelligenceSurfaces("OFF"), false);
  assert.equal(mountsIntelligenceSurfaces("SYNTHETIC"), true);
  assert.equal(mountsIntelligenceSurfaces("LIVE"), true);
});
