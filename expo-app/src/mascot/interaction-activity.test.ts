import assert from "node:assert/strict";
import test from "node:test";
import {
  notifyMascotInteraction,
  subscribeMascotInteraction
} from "./interaction-activity";

test("screen activity wakes subscribers without retaining removed listeners", () => {
  let calls = 0;
  const unsubscribe = subscribeMascotInteraction(() => {
    calls += 1;
  });

  notifyMascotInteraction();
  unsubscribe();
  notifyMascotInteraction();

  assert.equal(calls, 1);
});
