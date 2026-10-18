import assert from "node:assert/strict";
import test from "node:test";
import { parseJinxPreferences } from "./jinx-preferences";

test("Jinx defaults lively and visible, and damaged preferences cannot hide it", () => {
  for (const value of [null, "", "{broken", "null", "[]", "true"]) assert.deepEqual(parseJinxPreferences(value), { mode: "LIVE", hidden: false });
});

test("only explicit modes and a real boolean hidden preference are restored", () => {
  assert.deepEqual(parseJinxPreferences('{"mode":"CALM","hidden":true}'), { mode: "CALM", hidden: true });
  assert.deepEqual(parseJinxPreferences('{"mode":"OFF","hidden":false}'), { mode: "OFF", hidden: false });
  assert.deepEqual(parseJinxPreferences('{"mode":"bad","hidden":"true"}'), { mode: "LIVE", hidden: false });
});
