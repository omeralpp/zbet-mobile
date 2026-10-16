import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as bilyoner from "./bilyoner";

const { buildBilyonerMatchUrl, buildBilyonerTotoUrl } = bilyoner;

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

test("Maçın Nabzı kaldırıldı: Bilyoner içeriği uygulama içinde açılmaz", () => {
  // Owner decision 2026-10-16. The only Bilyoner targets left are the two
  // external pages the user opens deliberately.
  assert.deepEqual(Object.keys(bilyoner).sort(), [
    "buildBilyonerMatchUrl",
    "buildBilyonerTotoUrl"
  ]);
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
