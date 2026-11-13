import assert from "node:assert/strict";
import test from "node:test";
import { orderRatioRows, type RatioShareField } from "./ratio-results-order";

const rows = [
  { sort: 1, betType: "Ms2", kickOff: 8.71, halfTime: 75, live: 0 },
  { sort: 2, betType: "H2", kickOff: 1.89, halfTime: 0, live: null },
  { sort: 20, betType: "Ms45a", kickOff: 89.77, halfTime: 42.86, live: null },
  { sort: 22, betType: "Ev05u", kickOff: 82.95, halfTime: 65, live: null },
  { sort: 30, betType: "Dp15a", kickOff: 89.77, halfTime: 42.86, live: null },
  { sort: 32, betType: "Dp25a", kickOff: 98.11, halfTime: null, live: null },
  { sort: 33, betType: "Dp25u", kickOff: null, halfTime: null, live: null }
];

const keys = (fields: RatioShareField[], pinnedMarket?: string) =>
  orderRatioRows(rows, fields, pinnedMarket).orderedRows.map(row => row.betType);

test("all kickoff shares rank together with stable source order for ties", () => {
  assert.deepEqual(keys(["kickOff"]), ["Dp25a", "Ms45a", "Dp15a", "Ev05u", "Ms2", "H2", "Dp25u"]);
  assert.equal(rows[0]?.betType, "Ms2");
});

test("current phase leads, measured zero ranks above older and missing shares, and BTB selection stays pinned", () => {
  assert.deepEqual(keys(["kickOff", "halfTime"], " ms45A "), ["Ms45a", "Ms2", "Ev05u", "Dp15a", "H2", "Dp25a", "Dp25u"]);
  assert.deepEqual(keys(["kickOff", "halfTime", "live"], "H2"), ["H2", "Ms2", "Ev05u", "Ms45a", "Dp15a", "Dp25a", "Dp25u"]);
  assert.deepEqual(keys([]), rows.map(row => row.betType));
});
