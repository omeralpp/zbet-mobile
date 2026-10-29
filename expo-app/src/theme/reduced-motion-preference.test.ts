import assert from "node:assert/strict";
import test from "node:test";
import { observeReducedMotionPreference, pendingReducedMotionPreference, type ReducedMotionPreference } from "./reduced-motion-preference";

function deferredRead() {
  let resolve!: (enabled: boolean) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<boolean>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test("preference stays conservatively static until the initial answer is known", async () => {
  const read = deferredRead();
  const received: ReducedMotionPreference[] = [];
  const stop = observeReducedMotionPreference({ read: () => read.promise, subscribe: () => ({ remove() {} }) }, value => received.push(value));
  assert.deepEqual(pendingReducedMotionPreference, { ready: false, reduceMotion: true });
  assert.deepEqual(received, []);
  read.resolve(false);
  await flush();
  assert.deepEqual(received, [{ ready: true, reduceMotion: false }]);
  stop();
});

test("a changed system setting wins over an older pending initial read", async () => {
  const read = deferredRead();
  const received: ReducedMotionPreference[] = [];
  let change!: (enabled: boolean) => void;
  const stop = observeReducedMotionPreference({ read: () => read.promise, subscribe: listener => { change = listener; return { remove() {} }; } }, value => received.push(value));
  change(true);
  read.resolve(false);
  await flush();
  assert.deepEqual(received, [{ ready: true, reduceMotion: true }]);
  change(false);
  assert.deepEqual(received.at(-1), { ready: true, reduceMotion: false });
  stop();
});

test("a read failure remains static without overriding a newer successful event", async () => {
  const read = deferredRead();
  const received: ReducedMotionPreference[] = [];
  const stop = observeReducedMotionPreference({ read: () => read.promise, subscribe: () => ({ remove() {} }) }, value => received.push(value));
  read.reject(new Error("device preference unavailable"));
  await flush();
  assert.deepEqual(received, [{ ready: true, reduceMotion: true }]);
  stop();

  const late = deferredRead();
  let change!: (enabled: boolean) => void;
  const second: ReducedMotionPreference[] = [];
  const stopSecond = observeReducedMotionPreference({ read: () => late.promise, subscribe: listener => { change = listener; return { remove() {} }; } }, value => second.push(value));
  change(false);
  late.reject(new Error("old initial read failed"));
  await flush();
  assert.deepEqual(second, [{ ready: true, reduceMotion: false }]);
  stopSecond();
});

test("unsupported reads or listeners fail safely to static branding", async () => {
  const received: ReducedMotionPreference[] = [];
  const stop = observeReducedMotionPreference({ read: () => { throw new Error("unsupported"); }, subscribe: () => ({ remove() {} }) }, value => received.push(value));
  assert.deepEqual(received, [{ ready: true, reduceMotion: true }]);
  stop();
  const listenerFailure: ReducedMotionPreference[] = [];
  const stopSecond = observeReducedMotionPreference({ read: async () => false, subscribe: () => { throw new Error("unsupported listener"); } }, value => listenerFailure.push(value));
  await flush();
  assert.deepEqual(listenerFailure, [{ ready: true, reduceMotion: true }]);
  stopSecond();
});

test("cleanup removes the listener and ignores late answers and events", async () => {
  const read = deferredRead();
  const received: ReducedMotionPreference[] = [];
  let change!: (enabled: boolean) => void;
  let removed = 0;
  const stop = observeReducedMotionPreference({ read: () => read.promise, subscribe: listener => { change = listener; return { remove() { removed++; } }; } }, value => received.push(value));
  stop();
  stop();
  change(false);
  read.resolve(false);
  await flush();
  assert.deepEqual(received, []);
  assert.equal(removed, 1);
});
