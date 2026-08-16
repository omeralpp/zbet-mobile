import assert from "node:assert/strict";
import test from "node:test";
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
