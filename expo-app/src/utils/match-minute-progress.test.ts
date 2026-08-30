import assert from "node:assert/strict";
import test from "node:test";
import { deriveMatchMinuteProgress } from "./match-minute-progress";

test("canlı maç dakikasını 90 dakikalık progress oranına dönüştürür", () => {
  assert.deepEqual(deriveMatchMinuteProgress("LIVE", 63), {
    label: "63'",
    minute: 63,
    ratio: 0.7,
    visible: true
  });
});

test("uzatma dakikasını gösterir ama progress barı taşırmaz", () => {
  assert.deepEqual(deriveMatchMinuteProgress("LIVE", 94), {
    label: "94'",
    minute: 94,
    ratio: 1,
    visible: true
  });
});

test("devre ve maç sonu için anlamlı tamamlama etiketleri üretir", () => {
  assert.equal(deriveMatchMinuteProgress("HALF_TIME", 0).label, "45' · DEVRE");
  assert.equal(deriveMatchMinuteProgress("FINISHED", 0).label, "90' · MS");
});

test("başlamamış maçta yanıltıcı progress göstermez", () => {
  assert.equal(deriveMatchMinuteProgress("NOT_STARTED", 0).visible, false);
});

test("TASK-0029: oynanmayan maçta dakika sayacı göstermez", () => {
  // SAP may still carry an elapsed value on a match abandoned mid-play. Showing
  // it would render a running clock for a game nobody is playing.
  assert.equal(deriveMatchMinuteProgress("NOT_PLAYED", 63).visible, false);
  assert.equal(deriveMatchMinuteProgress("NOT_PLAYED", 63).label, "");
});
