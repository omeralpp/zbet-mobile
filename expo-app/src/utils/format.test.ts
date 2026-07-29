import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCurrentMarketRate,
  formatDecisionReason,
  formatFixtureDateTime,
  formatMatchKeyDateTime,
  formatSuperDateScope,
  matchDateFromKey
} from "./format";

test("güncel market oranını seçim oranından ayrı tutar", () => {
  assert.deepEqual(formatCurrentMarketRate(1.38, "Ms1X", "canlı oran"), {
    value: "1,38",
    label: "canlı oran"
  });
  assert.deepEqual(formatCurrentMarketRate(null, "Ms1X", "canlı oran"), {
    value: "—",
    label: "market kapalı"
  });
  assert.deepEqual(formatCurrentMarketRate(null, "", "güncel oran"), {
    value: "—",
    label: "oran bekleniyor"
  });
});

test("Super karar nedenini kullanıcı diline çevirir", () => {
  assert.equal(
    formatDecisionReason("SCORE_CHANGED / HOME"),
    "Skor değişti · Ev sahibi yönü"
  );
  assert.equal(formatDecisionReason(""), "Model değerlendirmesi");
});

test("maç tarih ve saatini İstanbul saat diliminde gösterir", () => {
  assert.equal(
    formatFixtureDateTime("2026-07-29", "21:00"),
    "29 Tem · 21:00"
  );
  assert.equal(
    formatFixtureDateTime("", ""),
    "Tarih ve saat bekleniyor"
  );
});

test("Super maç anahtarından tarih ve gerçek başlangıç saatini çıkarır", () => {
  assert.equal(
    formatMatchKeyDateTime("2026-07-29:472910:20:45:00"),
    "29 Tem · 20:45"
  );
  assert.equal(
    formatMatchKeyDateTime("2026-07-29:472910:00:00:00"),
    "29 Tem · saat bilgisi yok"
  );
  assert.equal(
    matchDateFromKey("2026-07-29:472910:20:45:00"),
    "2026-07-29"
  );
});

test("Super kayıtlarının görünür tarih kapsamını açıklar", () => {
  assert.equal(
    formatSuperDateScope([
      "2026-07-28T20:00:00+03:00",
      "2026-07-29T21:00:00+03:00"
    ]),
    "28 Tem – 29 Tem · en yeni 2 karar"
  );
  assert.equal(formatSuperDateScope([]), "");
});
