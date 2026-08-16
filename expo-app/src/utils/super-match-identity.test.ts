import assert from "node:assert/strict";
import test from "node:test";
import { superMatchIdentity } from "./super-match-identity";

test("prefers explicit contract home/away teams over the joined label", () => {
  assert.deepEqual(
    superMatchIdentity({
      matchName: "Yanlış - Etiket",
      homeTeam: "Fluminense",
      awayTeam: "Palmeiras"
    }),
    { homeTeam: "Fluminense", awayTeam: "Palmeiras" }
  );
});

test("splits the joined Super label on an unambiguous separator", () => {
  assert.deepEqual(superMatchIdentity({ matchName: "Osijek - L. Zagreb" }), {
    homeTeam: "Osijek",
    awayTeam: "L. Zagreb"
  });
  assert.deepEqual(
    superMatchIdentity({ matchName: "Fluminense – Palmeiras" }),
    { homeTeam: "Fluminense", awayTeam: "Palmeiras" }
  );
  assert.deepEqual(
    superMatchIdentity({ matchName: "R. Excelsior — Lierse Kempenzonen" }),
    { homeTeam: "R. Excelsior", awayTeam: "Lierse Kempenzonen" }
  );
});

test("splits real SAP labels with one-sided separator padding", () => {
  assert.deepEqual(superMatchIdentity({ matchName: "Fluminense -Palmeiras" }), {
    homeTeam: "Fluminense",
    awayTeam: "Palmeiras"
  });
  assert.deepEqual(superMatchIdentity({ matchName: "Osijek- L. Zagreb" }), {
    homeTeam: "Osijek",
    awayTeam: "L. Zagreb"
  });
});

test("never splits a hyphen that belongs to the club name", () => {
  assert.equal(superMatchIdentity({ matchName: "Saint-Étienne" }), null);
  assert.deepEqual(
    superMatchIdentity({ matchName: "Saint-Étienne - Paris" }),
    { homeTeam: "Saint-Étienne", awayTeam: "Paris" }
  );
  assert.deepEqual(
    superMatchIdentity({ matchName: "Bayer 04 Leverkusen -1. FC Köln" }),
    { homeTeam: "Bayer 04 Leverkusen", awayTeam: "1. FC Köln" }
  );
});

test("keeps long club names intact including punctuation", () => {
  assert.deepEqual(
    superMatchIdentity({ matchName: "Çaykur Rizespor A.Ş. - Trabzonspor" }),
    { homeTeam: "Çaykur Rizespor A.Ş.", awayTeam: "Trabzonspor" }
  );
});

test("does not guess a boundary when the label is ambiguous", () => {
  assert.equal(
    superMatchIdentity({ matchName: "Saint-Étienne - Paris - Nice" }),
    null
  );
  assert.equal(superMatchIdentity({ matchName: "Osijek" }), null);
  assert.equal(superMatchIdentity({ matchName: "" }), null);
});

test("treats a hyphen without surrounding spaces as part of the club name", () => {
  assert.equal(superMatchIdentity({ matchName: "Inter Turku-2" }), null);
  assert.deepEqual(
    superMatchIdentity({ matchName: "Inter Turku-2 - Molde" }),
    { homeTeam: "Inter Turku-2", awayTeam: "Molde" }
  );
});

test("falls back to the label when only one contract team name is present", () => {
  assert.deepEqual(
    superMatchIdentity({
      matchName: "Hammarby - Lech Poznan",
      homeTeam: "Hammarby",
      awayTeam: null
    }),
    { homeTeam: "Hammarby", awayTeam: "Lech Poznan" }
  );
  assert.equal(
    superMatchIdentity({ matchName: "Hammarby", homeTeam: "Hammarby" }),
    null
  );
});
