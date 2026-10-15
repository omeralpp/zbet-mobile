import assert from "node:assert/strict";
import test from "node:test";
import { isEdgeSessionLost, recoverEdgeSession, type EdgeReloadHost } from "./edge-session";

function fakeHost(start: number) {
  const store = new Map<string, string>();
  let clock = start;
  let reloads = 0;
  const host: EdgeReloadHost = {
    now: () => clock,
    read: (key) => store.get(key) ?? null,
    write: (key, value) => {
      store.set(key, value);
    },
    reload: () => {
      reloads += 1;
    }
  };
  return {
    host,
    advance: (ms: number) => {
      clock += ms;
    },
    reloads: () => reloads
  };
}

test("an Access redirect or a 401 means the edge session is gone", () => {
  assert.equal(isEdgeSessionLost({ status: 0, type: "opaqueredirect" }), true);
  assert.equal(isEdgeSessionLost({ status: 401, type: "basic" }), true);
  assert.equal(isEdgeSessionLost({ status: 200, type: "basic" }), false);
  assert.equal(isEdgeSessionLost({ status: 503, type: "basic" }), false);
});

test("recovery reloads once per minute and never loops", () => {
  const fake = fakeHost(1_000_000);
  assert.equal(recoverEdgeSession(fake.host), true);
  assert.equal(recoverEdgeSession(fake.host), false);
  fake.advance(59_999);
  assert.equal(recoverEdgeSession(fake.host), false);
  fake.advance(1);
  assert.equal(recoverEdgeSession(fake.host), true);
  assert.equal(fake.reloads(), 2);
});
