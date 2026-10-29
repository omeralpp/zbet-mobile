import assert from "node:assert/strict";
import test from "node:test";
import { createReorderSettlement } from "./module-reorder-motion";

test("a reduced-motion drop snaps and commits once without starting an animation", () => {
  const events: string[] = [];
  const drop = createReorderSettlement({
    startAnimated: () => { events.push("animate"); return () => events.push("stop"); },
    snapToEnd: () => events.push("snap"),
    onSettled: () => events.push("commit")
  });
  drop.start(true);
  drop.start(true);
  drop.finish();
  drop.cancel();
  assert.deepEqual(events, ["snap", "commit"]);
});

test("switching to reduced motion during a drop clears offsets and completes once", () => {
  const offsets = { dragged: 32, first: -100, second: -70 };
  let completeAnimation: () => void = () => assert.fail("animation did not start");
  let commits = 0, releases = 0, stops = 0;
  const drop = createReorderSettlement({
    startAnimated: (complete) => {
      completeAnimation = complete;
      return () => { stops += 1; complete(); };
    },
    snapToEnd: () => { offsets.dragged = 200; },
    onSettled: () => {
      Object.assign(offsets, { dragged: 0, first: 0, second: 0 });
      commits += 1;
      releases += 1;
    }
  });
  drop.start(false);
  assert.equal(commits, 0);
  drop.finish();
  completeAnimation();
  drop.finish();
  assert.equal(stops, 1);
  assert.equal(commits, 1);
  assert.equal(releases, 1);
  assert.deepEqual(offsets, { dragged: 0, first: 0, second: 0 });
});

test("normal animated settlement still commits once and ignores a late repeat", () => {
  let completeAnimation: () => void = () => assert.fail("animation did not start");
  let commits = 0, snaps = 0;
  const drop = createReorderSettlement({
    startAnimated: (complete) => { completeAnimation = complete; return () => undefined; },
    snapToEnd: () => { snaps += 1; },
    onSettled: () => { commits += 1; }
  });
  drop.start(false);
  completeAnimation();
  completeAnimation();
  drop.finish();
  assert.equal(commits, 1);
  assert.equal(snaps, 0);
});

test("unmount cancellation suppresses synchronous and late animation completion", () => {
  let completeAnimation: () => void = () => assert.fail("animation did not start");
  let commits = 0, snaps = 0, stops = 0;
  const drop = createReorderSettlement({
    startAnimated: (complete) => {
      completeAnimation = complete;
      return () => { stops += 1; complete(); };
    },
    snapToEnd: () => { snaps += 1; },
    onSettled: () => { commits += 1; }
  });
  drop.start(false);
  drop.cancel();
  completeAnimation();
  drop.finish();
  assert.deepEqual({ commits, snaps, stops }, { commits: 0, snaps: 0, stops: 1 });
});
