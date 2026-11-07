import assert from "node:assert/strict";
import test from "node:test";
import { jinxGreeting } from "./jinx-greeting";

test("Jinx greets with what is on, never with results or money", () => {
  assert.equal(jinxGreeting(4), "4 maç canlı, takipteyim!");
  assert.equal(jinxGreeting(1), "1 maç canlı, takipteyim!");
  assert.equal(jinxGreeting(0), "Şu an sakin, maçları bekliyorum.");
  assert.equal(jinxGreeting(null), "Buradayım!");
  for (const count of [null, 0, 1, 12]) {
    const line = jinxGreeting(count);
    assert.doesNotMatch(line, /kazan|kaybet|birim|kâr|zarar|₺/i);
    assert.ok(line.length <= 40, "fits the small bubble beside Jinx");
  }
});
