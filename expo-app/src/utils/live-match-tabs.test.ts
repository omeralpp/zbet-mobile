import assert from "node:assert/strict";
import test from "node:test";
import { mockMatchSummaries } from "@/src/api/mock-data";
import { matchLiveTab, resolveLiveMatchTab } from "./live-match-tabs";

test("Canlı Maçlar sabit sekmeleri yıldız seçiminden etkilenmez", () => {
  const base = { ...mockMatchSummaries[0]!, rating: 1, selectedOdd: "Ms1" };
  const upcoming = { ...base, status: "NOT_STARTED" as const };
  const kickoff = new Date(
    `${upcoming.matchDate}T${upcoming.matchTime}:00+03:00`
  ).getTime();

  assert.equal(matchLiveTab(base, "LIVE", "STAR_4_PLUS"), true);
  assert.equal(
    matchLiveTab(upcoming, "FIXTURE", "STAR_4_PLUS", kickoff - 60_000),
    true
  );
  assert.equal(matchLiveTab(base, "FIXTURE", "STAR_4_PLUS"), false);
  assert.equal(matchLiveTab(base, "STAR", "STAR_4_PLUS"), false);
});

test("NXT-OBS-119: başlama saati aşılmış NOT_STARTED maç toleransı aşınca Fikstür'den düşer", () => {
  const upcoming = {
    ...mockMatchSummaries[0]!,
    status: "NOT_STARTED" as const
  };
  const kickoff = new Date(
    `${upcoming.matchDate}T${upcoming.matchTime}:00+03:00`
  ).getTime();

  // Just past kickoff: still a plausible delayed start, stays in Fikstür.
  assert.equal(
    matchLiveTab(upcoming, "FIXTURE", "STAR_4_PLUS", kickoff + 30 * 60_000),
    true
  );
  // Hours past kickoff with the provider still reporting NOT_STARTED: this is
  // the exact stale-status pattern from NXT-OBS-119, and must not linger.
  assert.equal(
    matchLiveTab(upcoming, "FIXTURE", "STAR_4_PLUS", kickoff + 3 * 60 * 60_000),
    false
  );
});

test("eski Tümü bağlantıları Fikstür'e taşınır", () => {
  assert.equal(resolveLiveMatchTab("ALL", "", false), "FIXTURE");
  assert.equal(resolveLiveMatchTab("", "ALL", false), "FIXTURE");
  assert.equal(resolveLiveMatchTab("FIXTURE", "", false), "FIXTURE");
});
