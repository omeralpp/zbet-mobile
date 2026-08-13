import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSuperNotificationMinimum,
  shouldPresentSuperRating
} from "./super-notification-policy";

test("Super bildirim eşiği eksik veya bozuk değerde 1+ olur", () => {
  assert.equal(parseSuperNotificationMinimum(undefined), 1);
  assert.equal(parseSuperNotificationMinimum("0"), 1);
  assert.equal(parseSuperNotificationMinimum("6"), 1);
  assert.equal(parseSuperNotificationMinimum("3"), 3);
});

test("yalnız eşik altındaki geçerli Super rating görünümünü bastırır", () => {
  assert.equal(shouldPresentSuperRating(2, 3), false);
  assert.equal(shouldPresentSuperRating(3, 3), true);
  assert.equal(shouldPresentSuperRating(5, 3), true);
  assert.equal(shouldPresentSuperRating(undefined, 5), true);
});
