import assert from "node:assert/strict";
import test from "node:test";
import {
  deriveJinxDailyMood,
  jinxMoodSignature,
  selectJinxMoodQuip
} from "./jinx-mood";

const base = {
  ready: true,
  metricDate: "2026-08-24",
  filter: "STAR_3_PLUS" as const
};

test("derives profit, loss, even, empty and unknown without guessing", () => {
  assert.equal(
    deriveJinxDailyMood({ ...base, bucket: { won: 2, lost: 1, profit: 1.4 } }).kind,
    "POSITIVE"
  );
  assert.equal(
    deriveJinxDailyMood({ ...base, bucket: { won: 1, lost: 2, profit: -0.6 } }).kind,
    "NEGATIVE"
  );
  assert.equal(
    deriveJinxDailyMood({ ...base, bucket: { won: 1, lost: 1, profit: 0 } }).kind,
    "EVEN"
  );
  assert.equal(
    deriveJinxDailyMood({ ...base, bucket: { won: 0, lost: 0, profit: 0 } }).kind,
    "EMPTY"
  );
  assert.equal(
    deriveJinxDailyMood({ ...base, ready: false, bucket: { won: 2, lost: 0, profit: 2 } }).kind,
    "UNKNOWN"
  );
});

test("signature changes only at a visible day, filter or mood boundary", () => {
  const mood = deriveJinxDailyMood({
    ...base,
    bucket: { won: 2, lost: 1, profit: 1.4 }
  });
  assert.equal(
    jinxMoodSignature(mood),
    "2026-08-24:STAR_3_PLUS:POSITIVE"
  );
  assert.equal(
    jinxMoodSignature({ ...mood, profit: 1.8 }),
    jinxMoodSignature(mood)
  );
});

test("quip is factual, deterministic and avoids an immediate repeat", () => {
  const mood = deriveJinxDailyMood({
    ...base,
    bucket: { won: 3, lost: 1, profit: 2.3 }
  });
  const first = selectJinxMoodQuip(mood);
  const repeated = selectJinxMoodQuip(mood, first?.index ?? null);

  assert.ok(first);
  assert.match(first.body, /\+2,30|3 galibiyet|3 kazandı/);
  assert.ok(repeated);
  assert.notEqual(repeated.index, first.index);
  assert.match(first.title, /3\+ yıldız/);
});
