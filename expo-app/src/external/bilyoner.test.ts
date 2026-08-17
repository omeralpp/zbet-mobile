import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildBilyonerMatchUrl,
  buildBilyonerTotoUrl,
  buildGamePulseUrl,
  gamePulseOrigin,
  isAllowedGamePulseUrl,
  normalizeBetRadarId
} from "./bilyoner";

test("Bilyoner maç kartı için güvenilir event URL'si üretir", () => {
  assert.equal(
    buildBilyonerMatchUrl(472910),
    "https://www.bilyoner.com/mac-karti/futbol/472910/oranlar"
  );
  assert.throws(() => buildBilyonerMatchUrl(0), /etkinlik kimliği/);
});

test("Bilyoner Spor Toto için sabit güvenilir HTTPS hedefi kullanır", () => {
  assert.equal(buildBilyonerTotoUrl(), "https://www.bilyoner.com/spor-toto");
});

test("geçerli BetRadar kimliği tam olarak beklenen Game Pulse URL'sini üretir", () => {
  assert.equal(
    buildGamePulseUrl("66886932"),
    "https://content.bilyoner.com/statics/canli-anlatim-v2/" +
      "?channel=webView&renderType=gamePulse&betRadarId=66886932"
  );
  assert.equal(buildGamePulseUrl(66886932), buildGamePulseUrl("66886932"));
  assert.equal(buildGamePulseUrl(" 66886932 "), buildGamePulseUrl("66886932"));
});

test("eksik veya geçersiz BetRadar kimliğinde URL üretmez", () => {
  for (const value of [
    null,
    undefined,
    "",
    "   ",
    "0",
    "-5",
    "12.5",
    "abc",
    "6688 6932",
    0,
    -1,
    1.5,
    Number.NaN,
    {},
    []
  ]) {
    assert.equal(buildGamePulseUrl(value), null, JSON.stringify(value) ?? "undefined");
    assert.equal(normalizeBetRadarId(value), null);
  }
});

test("kimlik üzerinden host, path veya parametre enjeksiyonu mümkün değil", () => {
  for (const value of [
    "1&betRadarId=999",
    "1#x",
    "1/../../evil",
    "../evil",
    "1?x=y",
    "https://evil.example/x",
    "javascript:alert(1)",
    "66886932 OR 1=1"
  ]) {
    assert.equal(buildGamePulseUrl(value), null, value);
  }
});

test("Game Pulse yalnız güvenilir Bilyoner origin'ini kabul eder", () => {
  assert.equal(isAllowedGamePulseUrl(buildGamePulseUrl("66886932") ?? ""), true);
  assert.equal(isAllowedGamePulseUrl(`${gamePulseOrigin}/statics/x`), true);
  assert.equal(isAllowedGamePulseUrl("about:blank"), true);

  for (const candidate of [
    "http://content.bilyoner.com/statics/canli-anlatim-v2/",
    "https://www.bilyoner.com/statics/canli-anlatim-v2/",
    "https://content.bilyoner.com.evil.example/x",
    "https://evil.example/content.bilyoner.com",
    "https://user:pass@content.bilyoner.com/x",
    "javascript:alert(1)",
    "intent://x",
    "not a url",
    ""
  ]) {
    assert.equal(isAllowedGamePulseUrl(candidate), false, candidate);
  }
});

/* ------------------------------------------------------------------ *
 * Live context boundary
 *
 * Mobile consumes live context only through the BFF. The provider adapter
 * terminates provider JSON server-side, so no provider host, path or field name
 * may appear anywhere in the app's live-context path.
 * ------------------------------------------------------------------ */

test("live context source files contain no provider host or endpoint", () => {
  const files = [
    "src/components/live-context-view.ts",
    "src/components/MatchTimelineCard.tsx",
    "src/components/LineupsCard.tsx",
    "src/components/LiveContextNotice.tsx"
  ];

  for (const file of files) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    for (const forbidden of [
      "bilyoner",
      "match-card",
      "api/mobile",
      "feedType",
      "eventStatusId",
      "currentPeriodId",
      "scorerName",
      "betradarId",
      "fetch("
    ]) {
      assert.equal(
        source.toLowerCase().includes(forbidden.toLowerCase()),
        false,
        `${file} must not reference ${forbidden}`
      );
    }
  }
});

test("only the BFF live-context route is used by the API client", () => {
  const client = readFileSync(
    join(process.cwd(), "src/api/http-mobile-api.ts"),
    "utf8"
  );

  assert.ok(client.includes("/live-context"));
  assert.equal(
    client.toLowerCase().includes("bilyoner"),
    false,
    "the API client must never name a provider"
  );
});
