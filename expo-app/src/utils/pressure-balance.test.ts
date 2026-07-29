import assert from "node:assert/strict";
import test from "node:test";
import { derivePressureBalance } from "./pressure-balance";

test("baskı farkını sıfır merkezli gösterge oranına dönüştürür", () => {
  const home = derivePressureBalance(68.2, 16.4);
  assert.equal(home.direction, "HOME");
  assert.equal(home.hasData, true);
  assert.ok(Math.abs(home.magnitudeRatio - 16.4 / 68.2) < 0.0001);

  const away = derivePressureBalance(51.7, -8.1);
  assert.equal(away.direction, "AWAY");
  assert.ok(Math.abs(away.magnitudeRatio - 8.1 / 51.7) < 0.0001);
});

test("sıfır baskıyı veri bekleyen nötr görünümde tutar", () => {
  assert.deepEqual(derivePressureBalance(0, 0), {
    direction: "BALANCED",
    magnitudeRatio: 0,
    hasData: false
  });
});

test("tutarsız toplamda farkı güvenli biçimde yüzde yüzle sınırlar", () => {
  assert.deepEqual(derivePressureBalance(2, -8), {
    direction: "AWAY",
    magnitudeRatio: 1,
    hasData: true
  });
});
