import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveAuthEntryPresentation,
  resolveImmediateAuthStatus
} from "./entry-policy";

test("requires the branded entry screen before pilot access", () => {
  assert.equal(resolveImmediateAuthStatus("pilot"), "unauthenticated");
  assert.equal(
    resolveAuthEntryPresentation("pilot").buttonText,
    "Pilot uygulamasına gir"
  );
  assert.match(
    resolveAuthEntryPresentation("pilot").securityText,
    /kullanıcı adı veya parola istemez/
  );
});

test("keeps preview direct and OAuth dependent on its session bootstrap", () => {
  assert.equal(resolveImmediateAuthStatus("preview"), "preview");
  assert.equal(resolveImmediateAuthStatus("oauth"), null);
  assert.equal(
    resolveAuthEntryPresentation("oauth").securityTitle,
    "Kurumsal oturum"
  );
});

test("keeps implementation terminology out of pilot-facing entry copy", () => {
  for (const mode of ["pilot", "oauth"] as const) {
    const presentation = resolveAuthEntryPresentation(mode);
    const copy = Object.values(presentation).join(" ");
    assert.doesNotMatch(copy, /\b(?:BFF|OAuth|PKCE|Fiori|Livescore)\b/i);
  }
});
