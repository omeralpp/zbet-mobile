import assert from "node:assert/strict";
import test from "node:test";
import { formatCurrentMarketRate } from "./format";
import {
  deriveLiveCardFooter,
  deriveLiveRateTrend,
  maxLiveCardValueCaption,
  pressureFooterCaption
} from "./live-card-indicators";
import { derivePressureBalance } from "./pressure-balance";

test("compares current live odd with the selection-time odd", () => {
  assert.equal(deriveLiveRateTrend(1.42, 1.58), "UP");
  assert.equal(deriveLiveRateTrend(1.42, 1.31), "DOWN");
  assert.equal(deriveLiveRateTrend(1.42, 1.421), "STABLE");
});

test("does not imply a direction for closed or missing markets", () => {
  assert.equal(deriveLiveRateTrend(null, 1.58), "UNAVAILABLE");
  assert.equal(deriveLiveRateTrend(1.42, null), "UNAVAILABLE");
  assert.equal(deriveLiveRateTrend(1, 1.58), "UNAVAILABLE");
});

test("a decided card still reports an empty market and empty pressure", () => {
  // "market kapalı" and "güncel veri bekleniyor" describe the state of a
  // decision the user is holding, so neither is dropped.
  assert.deepEqual(deriveLiveCardFooter("ÜST 2.5", null, false), {
    showsRate: true,
    showsPressure: true
  });
  assert.deepEqual(deriveLiveCardFooter("ÜST 2.5", 2.1, true), {
    showsRate: true,
    showsPressure: true
  });
});

test("an undecided card says it is waiting once, not three times", () => {
  assert.deepEqual(deriveLiveCardFooter("", null, false), {
    showsRate: false,
    showsPressure: false
  });
});

test("an undecided card keeps every metric that is real", () => {
  assert.deepEqual(deriveLiveCardFooter("", null, true), {
    showsRate: false,
    showsPressure: true
  });
  assert.deepEqual(deriveLiveCardFooter("", 2.1, false), {
    showsRate: true,
    showsPressure: false
  });
  assert.deepEqual(deriveLiveCardFooter("", 2.1, true), {
    showsRate: true,
    showsPressure: true
  });
});

/**
 * The live card footer as the Xiaomi row actually receives it.
 *
 * The physical defect was not one bad value: it was four long Turkish labels
 * competing for a single 360dp row, and the crowding peaked exactly where the
 * card had least to say. These are the states that produce the longest labels
 * and the most blocks, including the null, closed-market and high-magnitude
 * cases that make each block widest.
 */
const layoutStress = [
  {
    name: "izleniyor, hiçbir kanıt yok",
    selectedOdd: "",
    currentRate: null,
    totalPressure: null,
    pressureDiff: null,
    blocks: 1
  },
  {
    name: "izleniyor, yalnız baskı var",
    selectedOdd: "",
    currentRate: null,
    totalPressure: 42.5,
    pressureDiff: -8.25,
    blocks: 2
  },
  {
    name: "seçim var, market kapalı, baskı yok",
    selectedOdd: "KARŞILIKLI GOL VAR",
    currentRate: null,
    totalPressure: null,
    pressureDiff: null,
    blocks: 3
  },
  {
    name: "seçim var, yüksek oran ve yüksek baskı",
    selectedOdd: "ÜST 3.5",
    currentRate: 12.5,
    totalPressure: 180.75,
    pressureDiff: 123.4,
    blocks: 3
  },
  {
    name: "seçim var, baskı tam dengede",
    selectedOdd: "1",
    currentRate: 1.05,
    totalPressure: 60,
    pressureDiff: 0,
    blocks: 3
  }
] as const;

function footerLabels(state: (typeof layoutStress)[number]): string[] {
  const pressure = derivePressureBalance(
    state.totalPressure,
    state.pressureDiff
  );
  const footer = deriveLiveCardFooter(
    state.selectedOdd,
    state.currentRate,
    pressure.hasData
  );
  const labels = [state.selectedOdd || "Aday bekleniyor"];
  if (footer.showsRate) {
    labels.push(
      formatCurrentMarketRate(
        state.currentRate,
        state.selectedOdd,
        "canlı oran"
      ).label
    );
  }
  if (footer.showsPressure) {
    labels.push(pressureFooterCaption(pressure.hasData));
  }
  return labels;
}

test("no live card state stacks more than one waiting label", () => {
  // The defect itself: `Aday bekleniyor` + `oran bekleniyor` + `güncel veri
  // bekleniyor` on one row, three ways of reporting the same nothing.
  for (const state of layoutStress) {
    const waiting = footerLabels(state).filter((label) =>
      label.includes("bekleniyor")
    );
    assert.ok(
      waiting.length <= 1,
      `${state.name}: ${waiting.length} waiting labels — ${waiting.join(" + ")}`
    );
  }
});

test("every live card state renders the block count it has evidence for", () => {
  for (const state of layoutStress) {
    assert.equal(
      footerLabels(state).length,
      state.blocks,
      `${state.name}: beklenen ${state.blocks} blok`
    );
  }
});

test("a caption that sits beside a number stays inside the proven row width", () => {
  // The physical Xiaomi defect. `güncel baskı farkı` was eighteen characters
  // next to a signed pressure figure; `market kapalı` at thirteen is the widest
  // caption the same row was observed to carry. Captions that report a missing
  // value are exempt and wrap instead — they cannot be shortened without
  // changing what they claim.
  for (const state of layoutStress) {
    // The selection string is not a caption: it is user-facing market copy of
    // unbounded length and the card already holds it to a single line.
    const captions = footerLabels(state).slice(1);
    for (const caption of captions) {
      if (caption.includes("bekleniyor")) {
        continue;
      }
      assert.ok(
        caption.length <= maxLiveCardValueCaption,
        `${state.name}: "${caption}" ${caption.length} karakter`
      );
    }
  }
});

test("the pressure caption spends characters on tense only when it has none", () => {
  // `CURRENT_MATCH` gating is what makes the figure current, so the caption
  // does not repeat it. The waiting caption keeps `güncel` because there the
  // word carries the whole distinction between no reading now and no pressure
  // at all.
  assert.equal(pressureFooterCaption(true), "baskı farkı");
  assert.ok(!pressureFooterCaption(true).includes("güncel"));
  assert.ok(pressureFooterCaption(false).includes("güncel"));
});
